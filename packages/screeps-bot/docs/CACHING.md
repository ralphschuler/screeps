# Caching Systems Documentation

This document describes the comprehensive caching systems implemented to improve bot performance.

## Overview

The bot now includes three main caching systems:

1. **Room Find Cache** (`src/utils/roomFindCache.ts`) - Caches `room.find()` results
2. **Role-Specific Cache** (`src/utils/roleCache.ts`) - Caches role-specific data for creeps
3. **Computation Scheduler** (`src/utils/computationScheduler.ts`) - Spreads expensive operations across ticks

## 1. Room Find Cache

### Purpose
Caches the results of `room.find()` operations which are expensive (0.1-0.5 CPU per call). With many creeps querying the same room data, caching provides massive savings.

### CPU Savings
- **Before**: 50 creeps × 0.1 CPU = 5 CPU per tick
- **After**: 1 find + 50 cache lookups = 0.2 CPU per tick
- **Net savings**: ~4.8 CPU per tick per room

### Usage

#### Basic Usage
```typescript
import { cachedFindSources, cachedFindHostileCreeps } from "./utils/roomFindCache";

// Instead of: const sources = room.find(FIND_SOURCES);
const sources = cachedFindSources(room);

// Instead of: const hostiles = room.find(FIND_HOSTILE_CREEPS);
const hostiles = cachedFindHostileCreeps(room);
```

#### Custom Filters
```typescript
import { cachedRoomFind } from "./utils/roomFindCache";

const spawns = cachedRoomFind(room, FIND_MY_STRUCTURES, {
  filter: (s: Structure) => s.structureType === STRUCTURE_SPAWN,
  filterKey: 'spawn'  // Important: unique key for this filter
});
```

#### Cache Invalidation
```typescript
import { invalidateStructureCache } from "./utils/roomFindCache";

// When structures are built or destroyed
if (constructionSite.progress === constructionSite.progressTotal) {
  invalidateStructureCache(room.name);
}
```

### TTL Configuration
Different find types have different TTLs based on how often they change:

- **Static** (5000 ticks): `FIND_SOURCES`, `FIND_MINERALS`
- **Structures** (50 ticks): `FIND_STRUCTURES`, `FIND_MY_STRUCTURES`
- **Dynamic** (3-5 ticks): `FIND_HOSTILE_CREEPS`, `FIND_DROPPED_RESOURCES`

## 2. Role-Specific Cache

### Purpose
Caches expensive role-specific computations that are accessed repeatedly by creeps of the same role.

### CPU Savings
- **Builder finding repair target**: 0.1-0.2 CPU per builder
- **Miner finding container**: 0.05-0.1 CPU per miner
- **With 50+ creeps**: 2-5 CPU saved per tick

### Usage

#### Builders - Repair Targets
```typescript
import { getCachedRepairTarget } from "./utils/roleCache";

const target = getCachedRepairTarget(creep, () => {
  // Expensive computation only runs on cache miss
  const structures = room.find(FIND_STRUCTURES, {
    filter: s => s.hits < s.hitsMax
  });
  return creep.pos.findClosestByRange(structures);
});
```

#### Miners - Source Containers
```typescript
import { getSourceContainer } from "./utils/roleCache";

const container = getSourceContainer(creep, source);
if (container) {
  creep.withdraw(container, RESOURCE_ENERGY);
}
```

#### Upgraders - Controller Energy Source
```typescript
import { getControllerEnergySource } from "./utils/roleCache";

const energySource = getControllerEnergySource(creep, controller);
if (energySource) {
  creep.withdraw(energySource, RESOURCE_ENERGY);
}
```

#### Custom Caching
```typescript
import { getRoleCache, setRoleCache } from "./utils/roleCache";

// Get cached value
const targetId = getRoleCache<Id<Structure>>(creep, "builder", "repairTarget");

// Set cached value with custom TTL
setRoleCache(creep, "builder", "repairTarget", structure.id, 10);
```

#### Cache Clearing
```typescript
import { clearTargetCaches } from "./utils/roleCache";

// Clear specific caches when state changes
if (creep.memory.working !== wasWorking) {
  clearTargetCaches(creep, "builder", ["buildTarget", "repairTarget"]);
}
```

## 3. Computation Scheduler

### Purpose
Spreads expensive operations across multiple ticks based on CPU bucket level and priority.

### Features
- **Priority-based**: Critical tasks always run, others depend on bucket
- **Bucket-aware**: Only runs low-priority tasks when CPU bucket is high
- **CPU budgets**: Enforces max CPU per task
- **Automatic spreading**: Tasks run at configurable intervals

### Priority Levels
- **CRITICAL** (0): Always runs (bucket > 0)
- **HIGH** (1): Runs when bucket > 2000
- **MEDIUM** (2): Runs when bucket > 5000
- **LOW** (3): Runs when bucket > 8000

### Usage

#### Registering Tasks
```typescript
import { scheduleTask, TaskPriority } from "./utils/computationScheduler";

// Register once during initialization
scheduleTask(
  "market-analysis",    // Unique task ID
  100,                  // Run every 100 ticks
  () => analyzeMarket(), // Function to execute
  TaskPriority.MEDIUM,  // Only runs when bucket > 5000
  2.0                   // Max 2 CPU budget
);
```

#### Manual Execution
```typescript
import { globalScheduler } from "./utils/computationScheduler";

// Force run a specific task
globalScheduler.forceRun("market-analysis");

// Reset task timer for immediate execution
globalScheduler.resetTask("market-analysis");
```

#### Statistics
```typescript
import { getSchedulerStats } from "./utils/computationScheduler";

const stats = getSchedulerStats();
console.log(`Executed: ${stats.executedThisTick}`);
console.log(`Skipped: ${stats.skippedThisTick}`);
console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
```

## Integration

### Main Loop Integration

The caching systems are integrated into the main bot loop (`SwarmBot.ts`):

1. **Heap Cache** - Initialized on first tick
2. **Computation Scheduler** - Runs after all core logic with available CPU budget
3. **Cache Cleanup** - Per-tick caches are cleared at start of each tick

### Example Integration Points

See `src/utils/cacheIntegration.ts` for detailed migration examples showing how to:
- Replace `room.find()` calls with cached versions
- Add role-specific caching to existing behaviors
- Schedule expensive periodic tasks
- Handle cache invalidation events

## Performance Guidelines

### When to Use Room Find Cache
- ✅ Multiple creeps query the same room data
- ✅ Data is relatively stable (structures, sources)
- ❌ Unique queries with complex custom filters
- ❌ Data changes every tick

### When to Use Role Cache
- ✅ Same computation repeated across multiple creeps
- ✅ Target selection for multiple creeps of same role
- ❌ One-time computations
- ❌ Highly dynamic data

### When to Use Scheduler
- ✅ Non-critical periodic operations
- ✅ Expensive computations (>0.5 CPU)
- ✅ Operations that can be deferred
- ❌ Critical time-sensitive operations
- ❌ Operations needed every tick

## Testing

All caching systems have comprehensive test suites:

- `test/unit/roomFindCache.test.ts` - 36 tests
- `test/unit/roleCache.test.ts` - 24 tests  
- `test/unit/computationScheduler.test.ts` - 13 tests

Run tests with:
```bash
npm test
```

## Monitoring

### Cache Statistics

```typescript
import { getRoomFindCacheStats } from "./utils/roomFindCache";
import { getRoleCacheStats } from "./utils/roleCache";
import { getSchedulerStats } from "./utils/computationScheduler";

// Room find cache stats
const roomStats = getRoomFindCacheStats();
console.log(`Room cache hit rate: ${(roomStats.hitRate * 100).toFixed(1)}%`);

// Role cache stats
const roleStats = getRoleCacheStats();
console.log(`Role cache entries: ${roleStats.totalEntries}`);

// Scheduler stats
const schedStats = getSchedulerStats();
console.log(`Tasks executed: ${schedStats.executedThisTick}`);
```

## Troubleshooting

### Cache Not Updating
- Check TTL values are appropriate for your use case
- Ensure cache invalidation is called when data changes
- Verify cache keys are unique for filtered queries

### High CPU Usage
- Check scheduler task budgets are set correctly
- Ensure tasks aren't running more frequently than needed
- Verify expensive operations are actually being cached

### Stale Data
- Reduce TTL values if data changes more frequently
- Add event-driven invalidation for structure changes
- Clear role caches when creep state changes

## Future Enhancements

Potential improvements for the caching systems:

1. **Automatic TTL adjustment** based on actual data change frequency
2. **Cross-room cache sharing** for common data
3. **Cache warming** during low CPU periods
4. **Predictive caching** based on creep movement patterns
5. **Cache compression** for memory-constrained environments
