# Core Concepts

This document explains the **fundamental concepts** of the Screeps Framework that enable its swarm architecture and CPU-efficient operation.

---

## Table of Contents

- [Pheromone System](#pheromone-system)
- [Kernel & Process Management](#kernel--process-management)
- [Five-Layer Architecture](#five-layer-architecture)
- [Memory Management](#memory-management)
- [Blueprint System](#blueprint-system)
- [Caching Strategy](#caching-strategy)

---

## Pheromone System

The **pheromone system** is the framework's primary coordination mechanism, inspired by how real-world ants communicate through chemical signals.

See [ADR-0002: Pheromone Coordination System](../adr/0002-pheromone-coordination-system.md) for detailed rationale.

### What Are Pheromones?

**Pheromones** are simple numerical values (0.0 to 1.0) stored in `Room.memory` that represent the "intensity" of different activities or needs in a room:

```typescript
Room.memory.swarm.pheromones = {
  expand: 0.5,    // Expansion pressure
  harvest: 0.8,   // Harvesting activity
  build: 0.3,     // Construction priority
  upgrade: 0.6,   // Controller upgrade focus
  defense: 0.0,   // Defense urgency
  war: 0.0,       // Offensive operations
  siege: 0.0,     // Under siege/nuke threat
  logistics: 0.4  // Resource transport needs
}
```

### Why Pheromones?

**Benefits**:
1. **Simplicity** - Just numbers, not complex objects
2. **Low Memory** - ~8 numbers = ~64 bytes per room
3. **Low CPU** - Cheap to read/write
4. **Emergent Behavior** - Local rules create global patterns
5. **Scalability** - Works for 1 room or 100 rooms

**Alternative Rejected**: Complex coordination objects with schedules, targets, assignments → expensive memory, parsing, and CPU.

### Pheromone Update Sources

Pheromones are updated from **two sources**:

#### 1. Periodic Updates (Every 5-10 Ticks)

Rolling averages based on activity:

```typescript
// Update harvest pheromone based on energy collected
const energyHarvested = room.memory.stats.energyHarvested || 0;
const sources = room.find(FIND_SOURCES);
const maxEnergy = sources.length * SOURCE_ENERGY_CAPACITY;
pheromones.harvest = energyHarvested / maxEnergy;

// Update build pheromone based on construction sites
const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
pheromones.build = Math.min(sites.length / 10, 1.0);

// Update upgrade pheromone based on controller progress
const controller = room.controller;
if (controller && controller.my) {
  const progress = controller.progress / controller.progressTotal;
  pheromones.upgrade = progress;
}
```

#### 2. Event Updates (Immediate)

Critical events trigger instant updates:

```typescript
// Hostile detected
if (hostiles.length > 0) {
  pheromones.defense = Math.min(hostiles.length / 5, 1.0);
  room.memory.swarm.danger = Math.min(room.memory.swarm.danger + 1, 3);
}

// Structure destroyed
if (structureDestroyed) {
  pheromones.defense += 0.2;
  pheromones.war += 0.1;
}

// Nuke detected
if (nukeDetected) {
  pheromones.siege = 1.0;
  room.memory.swarm.danger = 3;
  room.memory.swarm.intent = 'evacuate';
}
```

### Pheromone Decay & Diffusion

**Decay** (evaporation):
Pheromones decay over time to prevent stale signals:

```typescript
// Every tick, multiply by decay factor
for (const key in pheromones) {
  pheromones[key] *= 0.95; // 5% decay per tick
}
```

**Diffusion** (spreading):
Some pheromones spread to neighbor rooms:

```typescript
// Danger diffuses to adjacent rooms
for (const exit of Object.values(room.memory.exits)) {
  const neighbor = Game.rooms[exit.roomName];
  if (neighbor?.controller?.my) {
    neighbor.memory.swarm.pheromones.defense += 
      pheromones.defense * 0.3; // 30% strength
  }
}
```

### Using Pheromones in Behavior

Creeps and systems read pheromones to make decisions:

```typescript
// Spawning priorities based on pheromones
function getSpawnPriority(role: string, pheromones: Pheromones): number {
  if (role === 'defender') {
    return pheromones.defense * 100; // 0-100 based on defense pheromone
  }
  if (role === 'builder') {
    return pheromones.build * 80;
  }
  if (role === 'upgrader') {
    return pheromones.upgrade * 70;
  }
  return 50; // Default
}

// Creep behavior based on pheromones
function upgraderBehavior(creep: Creep) {
  const pheromones = creep.room.memory.swarm.pheromones;
  
  if (pheromones.defense > 0.5) {
    // High defense need - deposit energy for towers
    depositToTowers(creep);
  } else if (pheromones.build > pheromones.upgrade) {
    // Build pheromone higher - help construction
    buildConstructionSites(creep);
  } else {
    // Normal behavior - upgrade controller
    upgradeController(creep);
  }
}
```

### Pheromone Patterns

Common patterns:

**High harvest, high upgrade, low defense** = Peaceful growth
```typescript
{ harvest: 0.8, upgrade: 0.7, defense: 0.0, build: 0.3 }
```

**Low harvest, high defense, high war** = Under attack
```typescript
{ harvest: 0.2, upgrade: 0.1, defense: 0.9, war: 0.6 }
```

**High build, medium harvest** = New room
```typescript
{ build: 0.8, harvest: 0.5, upgrade: 0.3, defense: 0.0 }
```

**High siege, very high defense** = Nuke incoming
```typescript
{ siege: 1.0, defense: 1.0, war: 0.5, upgrade: 0.0 }
```

---

## Kernel & Process Management

The **Kernel** is the framework's CPU budget manager and process scheduler.

Package: `@ralphschuler/screeps-kernel`

### What Is the Kernel?

The Kernel manages **multiple processes** with:
- **Priority-based scheduling** - High-priority processes run first
- **CPU budget enforcement** - Each process has a max CPU allocation
- **Wrap-around queue** - Ensures fair execution across ticks
- **Bucket awareness** - Adjusts behavior based on CPU bucket level

### Process Structure

```typescript
interface Process {
  id: string;           // Unique identifier
  name: string;         // Human-readable name
  priority: number;     // 0-100 (higher = more important)
  frequency: 'high' | 'medium' | 'low';
  interval?: number;    // Ticks between executions
  minBucket?: number;   // Minimum CPU bucket required
  cpuBudget: number;    // Max CPU per tick (or per execution)
  execute: () => void;  // Process logic
}
```

### Registering Processes

```typescript
import { kernel, ProcessPriority } from '@ralphschuler/screeps-kernel';

// High-priority, runs every tick
kernel.registerProcess({
  id: 'economy:harvest',
  name: 'Harvesting',
  priority: ProcessPriority.HIGH, // 90
  frequency: 'high',
  interval: 1,
  cpuBudget: 0.2,
  minBucket: 500,
  execute: () => {
    // Harvesting logic for all rooms
  }
});

// Medium-priority, runs every 10 ticks
kernel.registerProcess({
  id: 'strategy:expansion',
  name: 'Expansion Planning',
  priority: ProcessPriority.MEDIUM, // 50
  frequency: 'medium',
  interval: 10,
  cpuBudget: 1.0,
  minBucket: 2000,
  execute: () => {
    // Scan for expansion opportunities
  }
});

// Low-priority, runs every 50 ticks, only when bucket is high
kernel.registerProcess({
  id: 'analytics:market',
  name: 'Market Analysis',
  priority: ProcessPriority.LOW, // 20
  frequency: 'low',
  interval: 50,
  cpuBudget: 3.0,
  minBucket: 5000,
  execute: () => {
    // Expensive market analysis
  }
});
```

### Execution Model

**Wrap-Around Queue**:
1. Sort processes by priority
2. Execute until total CPU budget exhausted
3. Remember last executed process
4. Next tick, resume from where we left off
5. Ensures all processes eventually run, even low-priority ones

**Example Execution**:
```
Tick 1: Run processes A, B, C (budget exhausted)
Tick 2: Run processes D, E, A (resume from D)
Tick 3: Run processes B, C, D (resume from B)
```

### Adaptive CPU Budgets

The kernel adjusts budgets based on CPU bucket level:

```typescript
const bucketLevel = Game.cpu.bucket;

if (bucketLevel > 8000) {
  // High bucket - increase budgets by 50%
  effectiveBudget = process.cpuBudget * 1.5;
} else if (bucketLevel < 2000) {
  // Low bucket - decrease budgets by 50%
  effectiveBudget = process.cpuBudget * 0.5;
} else {
  // Normal
  effectiveBudget = process.cpuBudget;
}
```

### Process Decorators (Advanced)

Use TypeScript decorators for declarative process registration:

```typescript
import { Process, ProcessPriority } from '@ralphschuler/screeps-kernel';

@Process({
  id: 'tower:defense',
  priority: ProcessPriority.CRITICAL,
  cpuBudget: 0.3
})
class TowerDefenseProcess {
  run() {
    // Tower logic
  }
}
```

---

## Five-Layer Architecture

The framework implements a **five-layer hierarchy** for coordination at different scales.

See [Architecture](architecture.md#five-layer-swarm-architecture) for detailed explanation.

### Layer Summary

| Layer | Scale | Package | CPU Budget | Update Frequency |
|-------|-------|---------|------------|------------------|
| 1. Empire | Multi-shard | `@ralphschuler/screeps-empire` | ~1 CPU / 100 ticks | Every 50-100 ticks |
| 2. Shard Strategic | Per shard | `@ralphschuler/screeps-intershard` | ~0.5 CPU / 50 ticks | Every 20-50 ticks |
| 3. Cluster | Multi-room | `@ralphschuler/screeps-clusters` | ~0.2 CPU / tick | Every tick or periodic |
| 4. Room | Single room | Multiple packages | ≤0.1-0.25 CPU / tick | Every tick |
| 5. Creep | Individual | `@ralphschuler/screeps-roles` | ~0.01-0.05 CPU / tick | Every tick |

### Information Flow

**Upward** (aggregation): Creeps → Rooms → Clusters → Shard → Empire  
**Downward** (goals): Empire → Shard → Clusters → Rooms → Creeps

**Key Principle**: Each layer only knows about adjacent layers. Creeps don't know about Empire, Empire doesn't micromanage creeps.

---

## Memory Management

The framework uses a **structured memory system** to minimize size and parsing costs.

Package: `@ralphschuler/screeps-memory`

### Memory Budget

**Total limit**: ~2 MB

**Allocation**:
- Empire: ~10 KB
- Shard Strategic: ~50 KB per shard
- Clusters: ~20 KB per cluster
- Rooms: ~5-10 KB per room
- Creeps: ~200 bytes per creep
- Stats/Other: ~200-500 KB

### Room Memory Schema

**Fixed structure** (not dynamic):

```typescript
interface RoomMemorySwarm {
  colonyLevel: number;    // 1-8 (RCL equivalent)
  intent: RoomIntent;     // eco, expand, defense, war, siege, evacuate
  danger: number;         // 0-3 (threat level)
  
  pheromones: {
    expand: number;
    harvest: number;
    build: number;
    upgrade: number;
    defense: number;
    war: number;
    siege: number;
    logistics: number;
  };
  
  sourceMeta: {
    [sourceId: string]: {
      slots: number;
      distance: number;
      containerId?: string;
      linkId?: string;
    }
  };
  
  labConfig?: {
    // Lab assignments
  };
  
  defenseConfig?: {
    // Tower coordination
  };
  
  eventLog: Array<[string, number]>; // FIFO, max 20
}
```

### Memory vs. Global Heap

**Store in Memory** (persists):
- Room configurations
- Pheromone values
- Construction plans
- Empire/cluster state
- Event logs

**Store in Global Heap** (temporary):
- Cached paths (with TTL)
- Room scan results
- Expensive calculations
- Working data structures

### Memory Optimization

1. **Structured schemas** - Fixed fields, predictable size
2. **No Game objects** - Never store `Game.getObjectById()` results
3. **Compact encoding** - Numbers over strings
4. **TTL cleanup** - Old data expires
5. **Event logs as arrays** - `[[type, time], ...]` not objects

---

## Blueprint System

The **blueprint system** provides pre-designed room layouts optimized for different strategies.

Package: `@ralphschuler/screeps-layouts`

### What Are Blueprints?

**Blueprints** are:
- Pre-calculated room layouts
- Optimized for CPU, defense, or balance
- Compatible with different terrain
- Include roads, ramparts, walls, towers, labs, etc.

### Blueprint Types

**Bunker** - Compact, highly defensible:
```typescript
import { BunkerBlueprint } from '@ralphschuler/screeps-layouts';

const blueprint = new BunkerBlueprint({
  center: new RoomPosition(25, 25, 'W1N1'),
  includeRamparts: true,
  includeRoads: true
});
```

**Stamp-Based** - Modular, expandable:
```typescript
import { StampBasedBlueprint } from '@ralphschuler/screeps-layouts';

const blueprint = new StampBasedBlueprint({
  stamps: ['core', 'labs', 'economy'],
  center: new RoomPosition(25, 25, 'W1N1')
});
```

### Using Blueprints

```typescript
import { getBlueprint } from '@ralphschuler/screeps-layouts';

// Get blueprint for room
const blueprint = getBlueprint(room.name, {
  type: 'bunker',
  center: findOptimalCenter(room)
});

// Place construction sites from blueprint
for (const structure of blueprint.structures) {
  room.createConstructionSite(
    structure.pos.x,
    structure.pos.y,
    structure.type
  );
}
```

### Blueprint Features

- **Road-aware defense** - Ramparts placed intelligently around roads
- **Lab clusters** - Optimal positioning for reactions
- **Link networks** - Source → storage → controller
- **Tower coverage** - Maximized room coverage
- **Extension grouping** - Compact spawning areas

---

## Caching Strategy

The framework uses **aggressive caching** to minimize CPU usage.

Package: `@ralphschuler/screeps-cache`

### Cache Types

**1. Room Find Cache**:
```typescript
import { getCachedRoomObjects } from '@ralphschuler/screeps-cache';

// Cached for 10 ticks
const sources = getCachedRoomObjects(room, FIND_SOURCES, 10);
const hostiles = getCachedRoomObjects(room, FIND_HOSTILE_CREEPS, 1);
```

**2. Object Cache**:
```typescript
import { getCachedObject } from '@ralphschuler/screeps-cache';

// Cached object lookup
const source = getCachedObject<Source>(sourceId);
```

**3. Path Cache**:
```typescript
import { getCachedPath } from '@ralphschuler/screeps-pathfinding';

// Cached pathfinding
const path = getCachedPath(creep.pos, target, {
  ttl: 5, // Cache for 5 ticks
  ignoreCreeps: true
});
```

**4. Role Cache**:
```typescript
import { getCachedCreepsByRole } from '@ralphschuler/screeps-cache';

// Cached role lookup
const harvesters = getCachedCreepsByRole(room, 'harvester');
```

### Cache Backends

**Heap Storage** (default):
- Stored in global object
- Fast access (no serialization)
- Cleared on global reset
- For temporary data

**Memory Storage** (optional):
- Stored in Memory
- Survives global reset
- Slower (serialization cost)
- For important data

### Cache Configuration

```typescript
import { CacheManager } from '@ralphschuler/screeps-cache';

const cache = new CacheManager({
  defaultTTL: 10,
  maxSize: 1000,
  evictionPolicy: 'LRU', // Least Recently Used
  namespace: 'myBot'
});

// Store in cache
cache.set('key', value, { ttl: 20 });

// Get from cache
const value = cache.get('key');
```

### Cache Statistics

The cache system tracks:
- Hit rate
- Miss rate
- Eviction count
- Memory usage

Integrated with `@ralphschuler/screeps-stats` for monitoring.

---

## Best Practices

### Pheromones
- Update periodically (every 5-10 ticks) for non-critical signals
- Update immediately for critical events (hostiles, attacks)
- Let pheromones decay naturally
- Use diffusion for neighbor coordination

### Kernel
- Register processes at initialization
- Set realistic CPU budgets
- Use priorities wisely (not everything is HIGH)
- Require high bucket for expensive operations

### Memory
- Use structured schemas
- Avoid storing Game objects
- Clean up old data
- Prefer global heap for temporary data

### Caching
- Cache expensive operations (pathfinding, room scans)
- Use appropriate TTL (short for changing data, long for static)
- Monitor cache hit rates
- Evict stale data

---

## Related Documentation

- **[Architecture](architecture.md)** - Full architectural overview
- **[Performance](performance.md)** - CPU optimization guide
- **[ROADMAP.md](../../ROADMAP.md)** - Original swarm design
- **[Pheromones Guide](../PHEROMONES_GUIDE.md)** - Detailed pheromone documentation

---

**Last Updated**: 2026-01-27  
**Framework Version**: 0.1.0
