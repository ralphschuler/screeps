# Framework Architecture

This document describes the **architectural design** of the Screeps Framework, including the swarm architecture, package organization, data flow, and integration patterns.

---

## Table of Contents

- [Overview](#overview)
- [Five-Layer Swarm Architecture](#five-layer-swarm-architecture)
- [Package Organization](#package-organization)
- [Data Flow & Communication](#data-flow--communication)
- [Memory Architecture](#memory-architecture)
- [Process Scheduling](#process-scheduling)
- [Integration Patterns](#integration-patterns)

---

## Overview

The Screeps Framework is built on a **five-layer swarm architecture** that enables:
- **Scalability** to 100+ rooms across multiple shards
- **Emergent behavior** through local rules and pheromone coordination
- **CPU efficiency** with strict budgets and caching
- **Resilience** through decentralized decision-making

### Design Philosophy

From [ROADMAP.md](../../ROADMAP.md), the framework follows these principles:

1. **Decentralization** - Each room has local control logic; global layers provide only high-level goals
2. **Stigmergic Communication** - Simple numerical pheromones instead of complex object graphs
3. **Event-Driven** - Critical events update immediately; routines run periodically
4. **Aggressive Caching** - Paths, scans, analyses cached with TTL
5. **Strict CPU Budgets** - Target: ≤0.1 CPU per economic room, ≤0.25 per combat room
6. **Bucket-Aware** - Expensive operations only when CPU bucket is healthy

---

## Five-Layer Swarm Architecture

The framework implements a **hierarchical swarm architecture** with five distinct layers, each responsible for different scales of coordination.

See [ADR-0004: Five-Layer Swarm Architecture](../adr/0004-five-layer-swarm-architecture.md) for detailed rationale.

```
┌─────────────────────────────────────────────────────────────┐
│                    Layer 1: Empire                          │
│                 (Multi-Shard Coordination)                  │
│  • Shard roles (Core, Expansion, Resource, Backup)         │
│  • Cross-shard resource flow                                │
│  • Global expansion strategy                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                Layer 2: Shard Strategic                      │
│                  (Per-Shard Planning)                        │
│  • Cluster prioritization                                   │
│  • CPU allocation per shard                                 │
│  • Shard-level threats                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               Layer 3: Cluster/Colony                        │
│              (Multi-Room Coordination)                       │
│  • Adjacent owned rooms + remotes                           │
│  • Inter-room logistics (terminals)                         │
│  • Coordinated military actions                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Layer 4: Room                             │
│               (Local Economy & Defense)                      │
│  • Local economy (harvest, build, upgrade)                  │
│  • Defense coordination                                     │
│  • Spawn management                                         │
│  • Pheromone emission                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                Layer 5: Creep/Squad                         │
│                 (Agent Behavior)                            │
│  • Role-based behavior trees                                │
│  • Pheromone reading & response                             │
│  • Local decision making                                    │
└─────────────────────────────────────────────────────────────┘
```

### Layer 1: Empire (Multi-Shard)

**Package**: `@ralphschuler/screeps-empire`

**Responsibilities**:
- Coordinate across multiple shards using `InterShardMemory`
- Assign shard roles: Core, Expansion, Resource, Backup
- Manage cross-shard resource transfers
- Track global expansion goals

**Data Storage**: `InterShardMemory` (100 KB per shard)

**CPU Budget**: ~1 CPU every 50-100 ticks

**Example**:
```typescript
// Shard roles
{
  "shard0": "core",      // Main production shard
  "shard1": "expansion", // Active expansion
  "shard2": "resource",  // Remote mining focus
  "shard3": "backup"     // Reserve capacity
}
```

### Layer 2: Shard Strategic

**Package**: `@ralphschuler/screeps-intershard`

**Responsibilities**:
- Prioritize clusters (which expands, which fights)
- Allocate CPU per shard via `Game.cpu.setShardLimits()`
- Track shard-level threats and opportunities
- Coordinate shard-wide missions (colonization, defense)

**Data Storage**: `Memory.shard` (per shard)

**CPU Budget**: ~0.5-1 CPU every 20-50 ticks

### Layer 3: Cluster/Colony

**Package**: `@ralphschuler/screeps-clusters`

**Responsibilities**:
- Group adjacent owned rooms + their remotes
- Inter-room terminal logistics
- Coordinated military operations (rally points, squads)
- Cluster-level posture (eco, war, recovery)

**Data Storage**: `Memory.colonies[colonyId]`

**CPU Budget**: ~0.2-0.5 CPU per cluster per tick

**Example Cluster**:
```typescript
{
  id: "W10N10",
  rooms: ["W10N10", "W11N10"], // Owned rooms
  remotes: ["W12N10", "W9N10"], // Remote mining
  posture: "eco", // or "war", "recovery"
  energyIncome: 15000,
  threatLevel: 0
}
```

### Layer 4: Room

**Packages**: `screeps-spawn`, `screeps-economy`, `screeps-defense`, `screeps-chemistry`

**Responsibilities**:
- Local economy (harvesting, building, upgrading)
- Defense coordination (towers, ramparts)
- Spawn queue management
- Construction planning
- Pheromone emission and updates

**Data Storage**: `Room.memory.swarm` (structured schema)

**CPU Budget**: ≤0.1 CPU per economic room, ≤0.25 per combat room

**Room Memory Schema**:
```typescript
Room.memory.swarm = {
  colonyLevel: 1-8,    // RCL equivalent
  intent: "eco",       // eco, expand, defense, war, siege, evacuate
  danger: 0,           // 0-3 threat level
  
  pheromones: {
    expand: 0.5,
    harvest: 0.8,
    build: 0.3,
    upgrade: 0.6,
    defense: 0.0,
    war: 0.0,
    siege: 0.0,
    logistics: 0.4
  },
  
  sourceMeta: {
    [sourceId]: { slots: 2, distance: 12, containerId, linkId }
  },
  
  eventLog: [
    ["hostile_detected", 12345678],
    ["structure_destroyed", 12345700]
  ]
}
```

### Layer 5: Creep/Squad

**Package**: `@ralphschuler/screeps-roles`

**Responsibilities**:
- Execute role-based behavior (harvester, hauler, upgrader, etc.)
- Read local pheromones and room posture
- Make local decisions (which source to harvest, where to move)
- Report observations back to room (hostile spotted, structure destroyed)

**Data Storage**: `Creep.memory` (minimal)

**CPU Budget**: ~0.01-0.05 CPU per creep per tick

**Example Creep Behavior**:
```typescript
// Harvester reads room pheromones
const room = creep.room;
const pheromones = room.memory.swarm?.pheromones;

if (pheromones.defense > 0.5) {
  // High defense pheromone - prioritize energy for towers
  transferEnergyToTowers(creep);
} else if (pheromones.upgrade > pheromones.build) {
  // Upgrade pheromone higher - focus on controller
  upgradeController(creep);
} else {
  // Default behavior
  harvestAndStore(creep);
}
```

---

## Package Organization

### Package Dependency Graph

```
                    ┌──────────────┐
                    │ screeps-bot  │ (your bot)
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
  ┌──────────┐      ┌──────────┐      ┌──────────┐
  │  kernel  │      │  empire  │      │  roles   │
  └────┬─────┘      └────┬─────┘      └────┬─────┘
       │                 │                  │
       │     ┌───────────┼────────┐         │
       │     │           │        │         │
       ▼     ▼           ▼        ▼         ▼
  ┌──────────┐    ┌──────────┐ ┌──────────┐
  │pheromones│    │ clusters │ │intershard│
  └────┬─────┘    └────┬─────┘ └────┬─────┘
       │               │            │
       │     ┌─────────┼────────────┼──────────┐
       │     │         │            │          │
       ▼     ▼         ▼            ▼          ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐ ┌──────────┐
  │  cache   │  │  stats   │  │  memory  │ │   core   │
  └──────────┘  └──────────┘  └──────────┘ └──────────┘
       │
       ▼
  ┌──────────────────────────────────────┐
  │        Leaf Packages                 │
  │  spawn, economy, defense,            │
  │  pathfinding, layouts, visuals, etc. │
  └──────────────────────────────────────┘
```

### Package Categories

#### 1. Core Infrastructure (Tier 1)
Foundation packages with no framework dependencies:
- `@ralphschuler/screeps-core` - Types, utilities, logging
- `@ralphschuler/screeps-cache` - Caching system
- `@ralphschuler/screeps-memory` - Memory schemas

#### 2. Coordination Systems (Tier 2)
Build on core packages:
- `@ralphschuler/screeps-kernel` - Process scheduler
- `@ralphschuler/screeps-pheromones` - Stigmergic coordination
- `@ralphschuler/screeps-stats` - Statistics collection

#### 3. Architectural Layers (Tier 3)
Implement swarm layers:
- `@ralphschuler/screeps-empire` - Layer 1 (multi-shard)
- `@ralphschuler/screeps-intershard` - Layer 2 (shard strategic)
- `@ralphschuler/screeps-clusters` - Layer 3 (colonies)

#### 4. Functional Packages (Tier 4)
Implement specific bot functions:
- `screeps-spawn` - Spawning
- `screeps-economy` - Economy, links, terminals
- `screeps-defense` - Defense systems
- `screeps-chemistry` - Labs and reactions
- `@ralphschuler/screeps-remote-mining` - Remote mining
- `@ralphschuler/screeps-pathfinding` - Pathfinding
- `@ralphschuler/screeps-layouts` - Room layouts

#### 5. Behavior & Agents (Tier 5)
Creep-level implementations:
- `@ralphschuler/screeps-roles` - Creep roles
- `screeps-tasks` - Task system

#### 6. Utilities & Visualization (Supporting)
Cross-cutting concerns:
- `@ralphschuler/screeps-console` - Console commands
- `@ralphschuler/screeps-visuals` - Visualization
- `@ralphschuler/screeps-standards` - Communication protocols

---

## Data Flow & Communication

### Upward Flow (Aggregation)

Information flows **upward** from creeps to empire:

```
Creep Observations → Room Memory → Cluster Stats → Shard Strategic → Empire
     (events)        (pheromones)    (aggregates)     (priorities)    (goals)
```

**Example**: Hostile detected
1. Creep spots hostile → logs to `Room.memory.swarm.eventLog`
2. Room updates `danger` level and `defense` pheromone
3. Cluster aggregates threat across rooms
4. Shard strategic allocates more CPU to threatened cluster
5. Empire notes shard under attack in `InterShardMemory`

### Downward Flow (Goals)

Goals flow **downward** from empire to creeps:

```
Empire Goals → Shard Priorities → Cluster Posture → Room Intent → Creep Behavior
  (expand)       (which cluster)     (eco/war)       (pheromones)   (role logic)
```

**Example**: Expansion mission
1. Empire decides: "Expand on shard1"
2. Shard strategic picks cluster for expansion
3. Cluster sets posture to "expand"
4. Room increases `expand` pheromone
5. Spawns prioritize scout and claimer roles
6. Creeps execute expansion behavior

### Horizontal Flow (Peer Communication)

Rooms in a cluster communicate via:
- **Terminal transfers** (resources)
- **Shared cluster memory** (coordination)
- **Pheromone diffusion** (neighbor rooms)

---

## Memory Architecture

### Memory Size Budget

Total Memory limit: **~2 MB**

Allocation by layer:
- **Empire**: ~10 KB (`InterShardMemory`)
- **Shard Strategic**: ~50 KB per shard
- **Clusters**: ~20 KB per cluster (10-20 clusters)
- **Rooms**: ~5-10 KB per room (100+ rooms = 500 KB - 1 MB)
- **Creeps**: ~200 bytes per creep (1000 creeps = 200 KB)
- **Other**: ~200-500 KB (cache metadata, stats, etc.)

### Optimization Strategies

1. **Structured Schemas** - Fixed structure, not dynamic objects
2. **No Game Object Serialization** - Never store `Game.getObjectById()` results
3. **TTL Cleanup** - Old data expires and is removed
4. **Compact Encoding** - Use numbers instead of strings where possible
5. **Event Logs** - FIFO queue with max 20 entries

### Memory vs. Global Heap

**Memory** (persists across ticks):
- Room configurations
- Pheromone values
- Event logs
- Construction plans
- Empire/cluster state

**Global Heap** (recomputed each tick):
- Cached paths
- Cached room scans
- Expensive calculations
- Temporary working data

---

## Process Scheduling

The **Kernel** package manages CPU-budgeted process execution.

### Process Types

```typescript
interface Process {
  id: string;           // Unique identifier
  name: string;         // Human-readable name
  priority: number;     // Execution priority (0-100)
  cpuBudget: number;    // Max CPU per tick
  frequency: 'high' | 'medium' | 'low'; // How often to run
  interval?: number;    // Ticks between executions
  minBucket?: number;   // Minimum bucket level required
  execute: () => void;  // Process logic
}
```

### Execution Model

**Wrap-Around Queue**:
1. Processes sorted by priority
2. Execute until CPU budget exhausted
3. Resume from last position next tick
4. Ensures all processes get CPU time eventually

**Adaptive Budgets**:
- **High bucket** (&gt;5000): Increase budgets, run expensive processes
- **Low bucket** (&lt;2000): Decrease budgets, skip non-critical processes
- **Critical bucket** (&lt;500): Only essential logic

### Example Process Registration

```typescript
import { kernel, ProcessPriority } from '@ralphschuler/screeps-kernel';

kernel.registerProcess({
  id: 'economy:harvest',
  name: 'Harvesting',
  priority: ProcessPriority.HIGH,
  frequency: 'high',
  interval: 1,
  minBucket: 500,
  cpuBudget: 0.1,
  execute: () => {
    // Harvesting logic
  }
});

kernel.registerProcess({
  id: 'strategy:market',
  name: 'Market Analysis',
  priority: ProcessPriority.LOW,
  frequency: 'low',
  interval: 50,
  minBucket: 5000,
  cpuBudget: 2.0,
  execute: () => {
    // Expensive market analysis
  }
});
```

---

## Integration Patterns

### Pattern 1: Direct Integration

**When to use**: Small bots, simple logic, full control

```typescript
import { SpawnManager } from '@ralphschuler/screeps-spawn';
import { linkManager } from 'screeps-economy';

const spawnManager = new SpawnManager();

export function loop() {
  for (const room of Object.values(Game.rooms)) {
    if (!room.controller?.my) continue;
    
    // Direct calls
    const spawns = room.find(FIND_MY_SPAWNS);
    const requests = buildSpawnRequests(room);
    spawnManager.processSpawnQueue(spawns, requests);
    
    if (room.controller.level >= 5) {
      linkManager.run(room);
    }
  }
}
```

### Pattern 2: Process-Based (Recommended)

**When to use**: Large bots, CPU management, multiple systems

```typescript
import { kernel } from '@ralphschuler/screeps-kernel';
import { SpawnManager } from '@ralphschuler/screeps-spawn';
import { linkManager } from 'screeps-economy';

const spawnManager = new SpawnManager();

// Register processes
kernel.registerProcess({
  id: 'spawning',
  priority: 90,
  cpuBudget: 0.5,
  execute: () => {
    for (const room of Object.values(Game.rooms)) {
      if (!room.controller?.my) continue;
      const spawns = room.find(FIND_MY_SPAWNS);
      const requests = buildSpawnRequests(room);
      spawnManager.processSpawnQueue(spawns, requests);
    }
  }
});

kernel.registerProcess({
  id: 'links',
  priority: 80,
  cpuBudget: 0.2,
  execute: () => {
    for (const room of Object.values(Game.rooms)) {
      if (room.controller?.my && room.controller.level >= 5) {
        linkManager.run(room);
      }
    }
  }
});

export function loop() {
  kernel.run(); // Executes all processes with budget management
}
```

### Pattern 3: Event-Driven

**When to use**: Complex workflows, task dependencies, async operations

```typescript
import { TaskQueue } from 'screeps-tasks';
import { EventBus } from '@ralphschuler/screeps-kernel';

const eventBus = new EventBus();
const taskQueue = new TaskQueue();

// Subscribe to events
eventBus.on('hostile_detected', (data) => {
  console.log(`Hostile in ${data.roomName}!`);
  // Add defense tasks
  taskQueue.add(new DefendRoomTask(data.roomName));
});

// Emit events
export function loop() {
  // Process tasks
  taskQueue.processTasks();
  
  // Check for hostiles
  for (const room of Object.values(Game.rooms)) {
    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
      eventBus.emit('hostile_detected', { roomName: room.name });
    }
  }
}
```

---

## Best Practices

### 1. Use the Right Layer
- **Room-level decisions** (what to build) → Room layer
- **Inter-room logistics** (terminal transfers) → Cluster layer
- **Shard-wide strategy** (where to expand) → Shard layer
- **Cross-shard coordination** (resource sharing) → Empire layer

### 2. Keep Memory Lean
- Use structured schemas
- Avoid storing Game objects
- Clean up old data
- Use global heap for temporary data

### 3. Respect CPU Budgets
- Profile your code
- Use kernel for budget enforcement
- Optimize hot paths
- Cache expensive calculations

### 4. Embrace Emergent Behavior
- Let creeps make local decisions
- Use pheromones for coordination
- Avoid centralized control
- Trust the swarm

---

## Related Documentation

- **[Core Concepts](core-concepts.md)** - Pheromones, Kernel, Memory
- **[Performance Guide](performance.md)** - CPU optimization
- **[ROADMAP.md](../../ROADMAP.md)** - Original swarm architecture
- **[ADR-0004](../adr/0004-five-layer-swarm-architecture.md)** - Architecture rationale

---

**Last Updated**: 2026-01-27  
**Framework Version**: 0.1.0
