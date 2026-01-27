# Performance Guide

This document explains how to **optimize CPU usage** and achieve the framework's performance targets in your Screeps bot.

---

## Table of Contents

- [Performance Targets](#performance-targets)
- [CPU Budget System](#cpu-budget-system)
- [Profiling & Measurement](#profiling--measurement)
- [Caching Strategies](#caching-strategies)
- [Optimization Techniques](#optimization-techniques)
- [Common Performance Pitfalls](#common-performance-pitfalls)
- [Bucket Management](#bucket-management)

---

## Performance Targets

The framework aims for these **CPU budgets per tick**:

### Room-Level Targets

| Room Type | CPU Budget | Notes |
|-----------|------------|-------|
| Economic room (RCL 1-4) | ≤ 0.08 CPU | Basic harvesting, building, upgrading |
| Economic room (RCL 5-8) | ≤ 0.10 CPU | + Links, labs, terminals |
| Combat room | ≤ 0.25 CPU | + Tower automation, defense coordination |
| Remote mining room | ≤ 0.15 CPU | + Remote harvesting, hauling |

### Global Targets

| System | CPU Budget | Frequency |
|--------|------------|-----------|
| Empire coordination | ≤ 1.0 CPU | Every 50-100 ticks |
| Shard strategic | ≤ 0.5 CPU | Every 20-50 ticks |
| Market analysis | ≤ 2.0 CPU | Every 50 ticks (high bucket only) |
| Path planning | ≤ 0.5 CPU | Per room, cached 5+ ticks |

### Scalability Target

**100 rooms total**:
- 100 rooms × 0.10 CPU = **10 CPU**
- Global systems = **3 CPU**
- Creep behavior = **5 CPU**
- Overhead/peaks = **2 CPU**
- **Total: ~20 CPU/tick** (well under 30 CPU limit for GCL 15+)

---

## CPU Budget System

The **Kernel** enforces CPU budgets using a process-based architecture.

### How It Works

1. **Register processes** with CPU budgets
2. **Kernel executes** processes in priority order
3. **Budget enforcement** stops execution when limit reached
4. **Wrap-around queue** ensures fair execution across ticks

### Example Process Registration

```typescript
import { kernel, ProcessPriority } from '@ralphschuler/screeps-kernel';

kernel.registerProcess({
  id: 'economy:harvest',
  name: 'Harvesting',
  priority: ProcessPriority.HIGH,
  cpuBudget: 0.2,  // Max 0.2 CPU per tick
  execute: () => {
    // Harvesting logic
  }
});

kernel.registerProcess({
  id: 'strategy:market',
  name: 'Market Analysis',
  priority: ProcessPriority.LOW,
  cpuBudget: 2.0,  // Max 2.0 CPU per execution
  interval: 50,     // Only every 50 ticks
  minBucket: 5000,  // Only when bucket is healthy
  execute: () => {
    // Expensive market analysis
  }
});
```

### Budget Allocation Strategy

**Critical (Always Run)**:
- Spawning: 0.5 CPU
- Defense: 0.3 CPU
- Harvesting: 0.2 CPU

**High Priority (Frequent)**:
- Link management: 0.2 CPU
- Tower automation: 0.2 CPU
- Construction: 0.1 CPU

**Medium Priority (Periodic)**:
- Terminal routing: 0.5 CPU (every 5 ticks)
- Lab management: 0.3 CPU (every 10 ticks)
- Remote mining: 0.3 CPU

**Low Priority (Infrequent)**:
- Market analysis: 2.0 CPU (every 50 ticks)
- Layout planning: 1.5 CPU (every 100 ticks)
- Statistics aggregation: 1.0 CPU (every 20 ticks)

---

## Profiling & Measurement

### Manual Profiling

```typescript
// Profile a function
function profiledFunction() {
  const start = Game.cpu.getUsed();
  
  // Your code here
  doExpensiveOperation();
  
  const end = Game.cpu.getUsed();
  console.log(`CPU used: ${(end - start).toFixed(3)}`);
}
```

### Process-Level Profiling

The kernel automatically tracks CPU usage per process:

```typescript
import { kernel } from '@ralphschuler/screeps-kernel';

// Get statistics
const stats = kernel.getStatistics();
console.log(JSON.stringify(stats, null, 2));

// Output:
// {
//   "economy:harvest": { cpu: 0.15, executions: 1000 },
//   "strategy:market": { cpu: 1.8, executions: 20 }
// }
```

### Profiling Decorators

```typescript
import { profile } from '@ralphschuler/screeps-core';

class MyManager {
  @profile('MyManager.expensiveMethod')
  expensiveMethod() {
    // Automatically profiled
  }
}
```

### Global CPU Tracking

```typescript
export function loop() {
  const startCPU = Game.cpu.getUsed();
  
  // Main loop
  kernel.run();
  
  const endCPU = Game.cpu.getUsed();
  const totalCPU = endCPU - startCPU;
  
  // Log every 100 ticks
  if (Game.time % 100 === 0) {
    console.log(`Average CPU: ${totalCPU.toFixed(2)}, Bucket: ${Game.cpu.bucket}`);
  }
}
```

---

## Caching Strategies

**Caching** is the most important optimization technique in the framework.

Package: `@ralphschuler/screeps-cache`

### 1. Room Find Caching

**Problem**: `room.find()` is expensive (0.01-0.05 CPU)  
**Solution**: Cache results with appropriate TTL

```typescript
import { getCachedRoomObjects } from '@ralphschuler/screeps-cache';

// Bad: Uncached (runs every tick)
const sources = room.find(FIND_SOURCES); // 0.02 CPU

// Good: Cached for 100 ticks (sources never change)
const sources = getCachedRoomObjects(room, FIND_SOURCES, 100); // 0.001 CPU (cached hit)
```

**Recommended TTLs**:
- Static objects (sources, minerals, controller): **100+ ticks**
- Structures (spawns, towers): **10-20 ticks**
- Creeps: **1-5 ticks**
- Hostiles: **1 tick** (changes rapidly)
- Construction sites: **5-10 ticks**

### 2. Object Caching

**Problem**: `Game.getObjectById()` is moderately expensive  
**Solution**: Cache object lookups

```typescript
import { getCachedObject } from '@ralphschuler/screeps-cache';

// Bad: Uncached lookup
const source = Game.getObjectById(sourceId);

// Good: Cached lookup
const source = getCachedObject<Source>(sourceId);
```

### 3. Path Caching

**Problem**: Pathfinding is **very expensive** (0.1-2.0 CPU per path)  
**Solution**: Cache paths and reuse

```typescript
import { getCachedPath } from '@ralphschuler/screeps-pathfinding';

// Bad: Calculate path every tick
const path = creep.pos.findPathTo(target); // 0.5 CPU

// Good: Cache path for 5 ticks
const path = getCachedPath(creep.pos, target, {
  ttl: 5,
  ignoreCreeps: true
}); // 0.01 CPU (cached hit)
```

**Path Caching Best Practices**:
- **Static paths** (source → storage): Cache 20+ ticks
- **Dynamic paths** (creep → target): Cache 3-5 ticks
- **Combat paths**: Cache 1 tick or don't cache
- **Use `ignoreCreeps: true`** when appropriate for better cache hits

### 4. Calculation Caching

Cache expensive calculations:

```typescript
import { CacheManager } from '@ralphschuler/screeps-cache';

const cache = new CacheManager({ namespace: 'calculations' });

function expensiveCalculation(room: Room) {
  const cacheKey = `calc_${room.name}`;
  
  // Check cache
  let result = cache.get(cacheKey);
  if (result !== undefined) {
    return result;
  }
  
  // Expensive calculation (0.5 CPU)
  result = doComplexAnalysis(room);
  
  // Cache for 20 ticks
  cache.set(cacheKey, result, { ttl: 20 });
  
  return result;
}
```

### Cache Hit Rates

Monitor cache effectiveness:

```typescript
import { CacheManager } from '@ralphschuler/screeps-cache';

const cache = new CacheManager({ namespace: 'myCache' });

// Get statistics
const stats = cache.getStats();
console.log(`Hit rate: ${((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1)}%`);

// Target: > 80% hit rate for effective caching
```

---

## Optimization Techniques

### 1. Lazy Evaluation

**Don't compute what you don't need**:

```typescript
// Bad: Always computes, even if not needed
function processRoom(room: Room) {
  const hostiles = room.find(FIND_HOSTILE_CREEPS);
  const sources = room.find(FIND_SOURCES);
  const sites = room.find(FIND_CONSTRUCTION_SITES);
  
  if (hostiles.length > 0) {
    defendRoom(room);
  }
}

// Good: Lazy evaluation
function processRoom(room: Room) {
  // Only find hostiles if we might need them
  const hostiles = getCachedRoomObjects(room, FIND_HOSTILE_CREEPS, 1);
  
  if (hostiles.length > 0) {
    defendRoom(room);
    return; // Early exit
  }
  
  // Only find these if no hostiles
  const sources = getCachedRoomObjects(room, FIND_SOURCES, 100);
  const sites = getCachedRoomObjects(room, FIND_CONSTRUCTION_SITES, 10);
}
```

### 2. Early Returns

**Exit functions as soon as possible**:

```typescript
// Bad: Checks everything
function shouldSpawn(room: Room): boolean {
  const creeps = room.find(FIND_MY_CREEPS);
  const spawns = room.find(FIND_MY_SPAWNS);
  const energy = room.energyAvailable;
  
  if (spawns.length === 0) return false;
  if (spawns[0].spawning) return false;
  if (energy < 200) return false;
  if (creeps.length >= 10) return false;
  
  return true;
}

// Good: Early returns
function shouldSpawn(room: Room): boolean {
  // Cheapest checks first
  if (room.energyAvailable < 200) return false;
  
  const spawns = getCachedRoomObjects(room, FIND_MY_SPAWNS, 10);
  if (spawns.length === 0) return false;
  if (spawns[0].spawning) return false;
  
  // Most expensive check last
  const creeps = getCachedRoomObjects(room, FIND_MY_CREEPS, 5);
  if (creeps.length >= 10) return false;
  
  return true;
}
```

### 3. Batch Operations

**Process multiple items together**:

```typescript
// Bad: Process one creep at a time
for (const creep of creeps) {
  const targets = creep.room.find(FIND_STRUCTURES);
  // Process creep
}

// Good: Find targets once for all creeps
const targetsByRoom = new Map<string, Structure[]>();

for (const creep of creeps) {
  const roomName = creep.room.name;
  
  if (!targetsByRoom.has(roomName)) {
    const targets = getCachedRoomObjects(creep.room, FIND_STRUCTURES, 10);
    targetsByRoom.set(roomName, targets);
  }
  
  const targets = targetsByRoom.get(roomName)!;
  // Process creep with targets
}
```

### 4. Periodic Updates

**Don't update every tick**:

```typescript
// Bad: Updates every tick
export function loop() {
  updateMarketPrices(); // 1.5 CPU
  updateRemoteMining(); // 0.8 CPU
  updateDefensePlan();  // 0.5 CPU
}

// Good: Update periodically
export function loop() {
  if (Game.time % 50 === 0) {
    updateMarketPrices(); // Every 50 ticks
  }
  
  if (Game.time % 20 === 0) {
    updateRemoteMining(); // Every 20 ticks
  }
  
  if (Game.time % 10 === 0) {
    updateDefensePlan();  // Every 10 ticks
  }
}
```

### 5. Object Pooling

**Reuse objects instead of creating new ones**:

```typescript
// Bad: Creates new array every tick
function getHarvesters(room: Room): Creep[] {
  return room.find(FIND_MY_CREEPS).filter(c => c.memory.role === 'harvester');
}

// Good: Reuse filter results
const creepsByRole = new Map<string, Creep[]>();

function getHarvesters(room: Room): Creep[] {
  const key = `${room.name}_harvester`;
  
  if (!creepsByRole.has(key)) {
    const result = getCachedRoomObjects(room, FIND_MY_CREEPS, 5)
      .filter(c => c.memory.role === 'harvester');
    creepsByRole.set(key, result);
  }
  
  return creepsByRole.get(key)!;
}

// Clear pool periodically
if (Game.time % 10 === 0) {
  creepsByRole.clear();
}
```

---

## Common Performance Pitfalls

### Pitfall 1: Uncached Room.find()

❌ **Bad**:
```typescript
const sources = room.find(FIND_SOURCES); // Every tick = expensive
```

✅ **Good**:
```typescript
const sources = getCachedRoomObjects(room, FIND_SOURCES, 100);
```

### Pitfall 2: Repeated Pathfinding

❌ **Bad**:
```typescript
// Every tick, recalculate path
const path = creep.pos.findPathTo(target);
creep.moveByPath(path);
```

✅ **Good**:
```typescript
// Cache path in creep memory or global cache
if (!creep.memory.path || creep.memory.pathTick + 5 < Game.time) {
  creep.memory.path = getCachedPath(creep.pos, target, { ttl: 5 });
  creep.memory.pathTick = Game.time;
}
creep.moveByPath(creep.memory.path);
```

### Pitfall 3: Deep Object Traversal

❌ **Bad**:
```typescript
// Traverses entire Memory tree
for (const roomName in Memory.rooms) {
  for (const creepName in Memory.rooms[roomName].creeps) {
    // Process creep memory
  }
}
```

✅ **Good**:
```typescript
// Direct access
for (const creep of Object.values(Game.creeps)) {
  // Use creep.memory directly
}
```

### Pitfall 4: String Concatenation in Loops

❌ **Bad**:
```typescript
let result = '';
for (const creep of creeps) {
  result += creep.name + ','; // Creates new string each iteration
}
```

✅ **Good**:
```typescript
const names = creeps.map(c => c.name);
const result = names.join(','); // Single concatenation
```

### Pitfall 5: Excessive Logging

❌ **Bad**:
```typescript
console.log(`Processing creep ${creep.name} in room ${room.name}`); // Every creep, every tick
```

✅ **Good**:
```typescript
if (Game.time % 100 === 0) {
  console.log(`Processed ${count} creeps this interval`);
}
```

---

## Bucket Management

The **CPU bucket** is your reserve capacity. Manage it carefully.

### Bucket-Aware Behavior

```typescript
const bucketLevel = Game.cpu.bucket;

if (bucketLevel > 8000) {
  // High bucket - enable expensive operations
  runMarketAnalysis();
  planNewLayouts();
  optimizeRemotePaths();
  
} else if (bucketLevel < 2000) {
  // Low bucket - minimal operations only
  // Skip non-critical processes
  kernel.setMinBucketLevel(2000); // Skip low-priority processes
  
} else if (bucketLevel < 500) {
  // Critical - emergency mode
  // Only spawning, defense, harvesting
  emergencyMode = true;
}
```

### Bucket Recovery Strategies

**When bucket is low** (&lt; 2000):
1. **Skip low-priority processes** (market, analytics)
2. **Reduce logging** (only errors)
3. **Increase cache TTLs** (recompute less frequently)
4. **Disable visuals** (if using `RoomVisual`)
5. **Throttle non-essential rooms** (focus on critical rooms)

**Bucket drain triggers**:
- New code deployment (global reset)
- Hostile attack (defense CPU spikes)
- Expansion (new room setup)
- Market volatility (increased trading)

---

## Performance Checklist

### Before Deploying

- [ ] Profile all major systems
- [ ] Cache expensive operations (room.find, pathfinding)
- [ ] Set appropriate TTLs for caches
- [ ] Use kernel for CPU budget management
- [ ] Test with 10+ rooms to verify scalability
- [ ] Monitor bucket level for 1000+ ticks
- [ ] Review cache hit rates (&gt; 80%)
- [ ] Optimize hot paths (functions called every tick)

### During Operation

- [ ] Monitor CPU usage per process
- [ ] Track bucket trends
- [ ] Adjust budgets as needed
- [ ] Profile new features before deploying
- [ ] Watch for CPU spikes during attacks
- [ ] Tune cache TTLs based on hit rates

### Red Flags

- 🚨 Bucket consistently &lt; 2000
- 🚨 Single process &gt; 5 CPU
- 🚨 Cache hit rate &lt; 60%
- 🚨 Pathfinding every tick for same creep
- 🚨 Room.find() without caching
- 🚨 Global reset causes bucket drain &gt; 1000

---

## Related Documentation

- **[Core Concepts](core-concepts.md#caching-strategy)** - Caching system overview
- **[Kernel Documentation](../../packages/@ralphschuler/screeps-kernel/README.md)** - Process management
- **[Cache Package](../../packages/@ralphschuler/screeps-cache/README.md)** - Caching details
- **[ROADMAP.md](../../ROADMAP.md)** - CPU budget targets

---

**Last Updated**: 2026-01-27  
**Framework Version**: 0.1.0
