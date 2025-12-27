# Unified Cache System

## Overview

The unified cache system consolidates 7 previously separate caching implementations into a single, well-designed architecture with domain-specific wrappers.

## Architecture

### Core Components

#### CacheManager
Central orchestration class that coordinates all caching operations.

```typescript
import { globalCache } from './cache';

// Get with automatic computation on miss
const value = globalCache.get('my-key', {
  namespace: 'myApp',
  ttl: 100,
  compute: () => expensiveCalculation()
});

// Set with options
globalCache.set('my-key', value, {
  namespace: 'myApp',
  ttl: 100,
  maxSize: 1000
});

// Pattern-based invalidation
globalCache.invalidatePattern(/^W1N1:/, 'path');

// Get statistics
const stats = globalCache.getCacheStats('myApp');
```

#### Storage Backends

**HeapStore** - Fast in-memory storage (non-persistent)
- Stored in global object
- Lost on global reset
- Best for per-tick or short-lived data

**MemoryStore** - Persistent storage across global resets
- Stored in Memory with heap write-ahead cache
- Survives global resets
- Best for data that should persist

### Domain Wrappers

Each domain wrapper provides a convenient API for specific use cases while using the unified cache internally.

#### BodyPartCache
```typescript
import { getCachedDamagePotential, getCachedBodyPartCount } from './cache';

const damage = getCachedDamagePotential(creep);
const workParts = getCachedBodyPartCount(creep, WORK, true);
```

#### ObjectCache
```typescript
import { getCachedObjectById, getCachedStorage } from './cache';

const structure = getCachedObjectById(structureId);
const storage = getCachedStorage(room);
```

#### PathCache
```typescript
import { getCachedPath, cachePath, invalidateRoom } from './cache';

const path = getCachedPath(from, to);
if (!path) {
  const newPath = room.findPath(from, to);
  cachePath(from, to, newPath, { ttl: 1000 });
}

// Invalidate all paths in room
invalidateRoom('W1N1');
```

#### RoomFindCache
```typescript
import { cachedRoomFind, cachedFindSources } from './cache';

const sources = cachedFindSources(room);
const towers = cachedRoomFind<StructureTower>(room, FIND_MY_STRUCTURES, {
  filter: s => s.structureType === STRUCTURE_TOWER,
  filterKey: 'towers'
});
```

#### RoleCache
```typescript
import { getRoleCache, setRoleCache } from './cache';

const targetId = getRoleCache<Id<Structure>>(creep, 'builder', 'repairTarget');
if (!targetId) {
  const target = findRepairTarget();
  if (target) {
    setRoleCache(creep, 'builder', 'repairTarget', target.id, 50);
  }
}
```

#### ClosestCache
```typescript
import { findCachedClosest } from './cache';

const closest = findCachedClosest(creep, targets, 'energy', 10);
```

## Features

### TTL-Based Expiration
```typescript
globalCache.set('key', value, {
  ttl: 100 // Expires after 100 ticks
});
```

### LRU Eviction
```typescript
globalCache.set('key', value, {
  maxSize: 1000 // Evict oldest when size exceeds 1000
});
```

### Compute-on-Miss
```typescript
const value = globalCache.get('key', {
  compute: () => {
    // Only called on cache miss
    return expensiveCalculation();
  }
});
```

### Pattern-Based Invalidation
```typescript
// Invalidate all paths in room W1N1
globalCache.invalidatePattern(/^W1N1:/, 'path');

// Invalidate all entries for a specific creep
globalCache.invalidatePattern(/^Creep1:/, 'role');
```

### Unified Statistics
```typescript
const stats = globalCache.getCacheStats('path');
console.log(stats.hitRate); // Hit rate as decimal
console.log(stats.size);    // Current cache size
console.log(stats.hits);    // Total hits
console.log(stats.misses);  // Total misses
```

## Migration Guide

### For Existing Code

No changes required! All old cache files re-export from the unified system:

```typescript
// This still works exactly as before
import { getCachedDamagePotential } from './utils/bodyPartCache';
const damage = getCachedDamagePotential(creep);
```

### For New Code

Use the unified cache directly for maximum flexibility:

```typescript
import { globalCache } from './cache';

const value = globalCache.get('my-key', {
  namespace: 'myFeature',
  ttl: 100,
  compute: () => calculateValue()
});
```

Or use domain wrappers for convenience:

```typescript
import { cachedRoomFind } from './cache';

const sources = cachedRoomFind(room, FIND_SOURCES);
```

## Performance

### Optimizations
- **No metadata updates on hits**: Removed expensive store.set() calls
- **Batch LRU eviction**: Evicts 10% at a time instead of single entries
- **Memory cleanup**: Removes expired entries during rehydration
- **Efficient key extraction**: Optimized pattern matching

### Best Practices
1. Use appropriate TTL values for your data
2. Set maxSize to prevent unbounded growth
3. Use compute-on-miss to simplify code
4. Use pattern invalidation for bulk operations
5. Choose the right storage backend (heap vs memory)

## Debugging

### Understanding Cache Systems

This repository has two cache systems serving different purposes:

**1. Unified Cache System (`src/cache/`)** - For game API results
- Caches expensive game API calls (room.find(), Game.getObjectById(), pathfinding)
- Reduces CPU by avoiding repeated API calls
- TTL-based expiration and LRU eviction
- Monitored via unified stats system

**2. Heap Cache (`src/memory/heapCache.ts`)** - For Memory persistence
- Write-ahead cache for Memory access (empire, clusters, swarms)
- Reduces Memory serialization overhead
- Persists data across global resets
- Complementary to unified cache, not redundant

Both systems are necessary and serve distinct roles in the bot architecture.

### View Cache Statistics
```typescript
const stats = globalCache.getCacheStats('namespace');
console.log(JSON.stringify(stats, null, 2));
```

### Unified Stats Integration

All cache systems are automatically monitored via the unified stats system. Cache metrics are collected every tick and exported to Grafana:

- `stats.cache.roomFind.*` - Room.find() cache statistics (full metrics: hits, misses, hitRate, size)
- `stats.cache.bodyPart.*` - Body part cache statistics (size only)
- `stats.cache.object.*` - Object cache (Game.getObjectById) statistics (size only)
- `stats.cache.path.*` - Path cache statistics (full metrics: hits, misses, hitRate, size, evictions)
- `stats.cache.role.*` - Role-specific cache statistics (totalEntries only)
- `stats.cache.global.*` - Aggregate statistics across all cache namespaces (full metrics)

**Note:** Not all cache domains track the same metrics. The `object` and `bodyPart` 
caches focus on size tracking for memory management, while `path` and `roomFind` 
caches track detailed hit/miss statistics for performance analysis.

The stats include:
- `hits` - Number of cache hits
- `misses` - Number of cache misses
- `hitRate` - Hit rate as percentage (0-1)
- `size` - Current number of entries
- `evictions` - Number of evictions performed

Example Grafana query:
```promql
# Cache hit rate over time (global aggregate)
stats_cache_global_hitRate

# Cache sizes by namespace
stats_cache_object_size          # Object cache size
stats_cache_path_size            # Path cache size  
stats_cache_roomFind_totalEntries # Room find cache entries
stats_cache_bodyPart_size        # Body part cache size

# Note: Different domains may use 'size' or 'totalEntries' depending on 
# their specific stat structure. Check the domain's getCacheStats() 
# implementation for exact metric names.
```

### Clear Cache for Testing
```typescript
globalCache.clear('namespace'); // Clear specific namespace
globalCache.clear();            // Clear all namespaces
```

### Monitor Cache Size
```typescript
const stats = globalCache.getCacheStats();
if (stats.size > 5000) {
  console.log('Warning: Large cache size');
}
```

## Centralized Optimization Layer

### Overview

The `RoomFindOptimizer` and `ObjectIdOptimizer` provide a centralized optimization layer that wraps the unified cache system with intelligent features:

- **Bucket-aware TTL tuning** - Automatically adjusts cache TTL based on CPU bucket level
- **Event-based invalidation** - Smart cache invalidation triggered by room events
- **Performance metrics** - Integrated with unified stats system
- **Zero-cost abstraction** - Delegates to existing cache system with minimal overhead

### RoomFindOptimizer

Optimizes `room.find()` operations with bucket-aware caching:

```typescript
import { roomFindOptimizer } from './core/roomFindOptimizer';

// Automatically uses optimal TTL based on bucket level
const structures = roomFindOptimizer.find(room, FIND_MY_STRUCTURES);

// With filter
const towers = roomFindOptimizer.find<StructureTower>(room, FIND_MY_STRUCTURES, {
  filter: s => s.structureType === STRUCTURE_TOWER,
  filterKey: 'towers'
});

// Event-based invalidation
roomFindOptimizer.invalidate('W1N1', 'structure_built');
```

**Bucket-aware TTL:**
- **Low bucket** (< 2000): Aggressive caching with long TTL (50-10000 ticks)
- **Normal bucket** (2000-8000): Balanced caching (5-5000 ticks)
- **High bucket** (> 8000): Fresh data with short TTL (1-1000 ticks)

**Event-based invalidation:**
```typescript
// Invalidate on structure changes
roomFindOptimizer.invalidate(roomName, 'structure_built');
roomFindOptimizer.invalidate(roomName, 'structure_destroyed');

// Invalidate on construction site changes
roomFindOptimizer.invalidate(roomName, 'construction_site_created');
roomFindOptimizer.invalidate(roomName, 'construction_site_removed');

// Invalidate on creep changes
roomFindOptimizer.invalidate(roomName, 'creep_spawned');
roomFindOptimizer.invalidate(roomName, 'creep_died');

// Invalidate on hostile activity
roomFindOptimizer.invalidate(roomName, 'hostile_entered');
roomFindOptimizer.invalidate(roomName, 'hostile_left');
```

### ObjectIdOptimizer

Optimizes `Game.getObjectById()` operations:

```typescript
import { objectIdOptimizer } from './core/roomFindOptimizer';

// Single object with automatic caching
const structure = objectIdOptimizer.getById(structureId);

// Batch retrieval with caching
const ids = [id1, id2, id3];
const objects = objectIdOptimizer.getBatch(ids); // Filters out nulls
```

### Convenience Functions

```typescript
import { optimizedFind, optimizedGetById } from './core/roomFindOptimizer';

// Quick access without importing optimizer instances
const sources = optimizedFind(room, FIND_SOURCES);
const object = optimizedGetById(objectId);
```

### Customization

```typescript
import { roomFindOptimizer } from './core/roomFindOptimizer';

// Adjust bucket thresholds
roomFindOptimizer.setBucketThresholds({
  low: 3000,   // Consider bucket "low" below 3000
  high: 7000   // Consider bucket "high" above 7000
});

// Customize TTL for specific find type
roomFindOptimizer.setTTLConfig(FIND_MY_STRUCTURES, {
  lowBucket: 200,  // Cache for 200 ticks when bucket is low
  normal: 100,     // Cache for 100 ticks normally
  highBucket: 50   // Cache for 50 ticks when bucket is high
});
```

### Performance Impact

**Expected CPU savings:**
- Structure finds: 40% of total savings
- Creep finds: 30% of total savings
- Hostile finds: 20% of total savings
- Other finds: 10% of total savings

**Estimated total savings:** 3-7% CPU reduction empire-wide

## ROADMAP Alignment

Per ROADMAP.md Section 2 (Design-Prinzipien):
> "Aggressives Caching + TTL - Pfade, Scans, Analyseergebnisse werden mit TTL gecacht (im globalen Objekt, nicht in Memory)"

✅ Single unified cache system
✅ Aggressive caching with TTL support
✅ Global object storage (HeapStore)
✅ Memory persistence option (MemoryStore)
✅ Event-driven invalidation
✅ Bucket-aware optimization layer
✅ Centralized API for all expensive operations


## Cache Coherence Protocol

The cache system now includes a **cache coherence protocol** for multi-cache coordination:

### Quick Start with Coherence

```typescript
import { registerAllCaches, initializeCacheEvents } from "./cache";

export function loop() {
  // Initialize on first tick
  if (!global._cacheInitialized) {
    registerAllCaches();       // Register all cache layers (L1/L2/L3)
    initializeCacheEvents();   // Enable event-based invalidation
    global._cacheInitialized = true;
  }
  
  // Your bot logic...
}
```

### Event-Based Invalidation

Automatic cache invalidation based on game events:

| Event | Invalidated Caches |
|-------|-------------------|
| `creep.died` | `object`, `role` for that creep |
| `structure.destroyed` | `object`, `path` in that room |
| `construction.complete` | `path`, `roomFind` in that room |
| `hostile.detected` | `closest`, `roomFind` in that room |
| `rcl.upgrade` | `roomFind`, `path` in that room |
| `remote.lost` | All caches for that room |

### Cache Hierarchy

- **L1 Cache** (fastest): Object references, body parts - 7MB budget
- **L2 Cache** (medium): Paths, find results, roles - 26MB budget  
- **L3 Cache** (persistent): Future memory-backed caching

### Statistics & Monitoring

```typescript
import { collectCacheStats, getCachePerformanceSummary } from "./cache";

// For Grafana export
const metrics = collectCacheStats();

// Performance summary
const summary = getCachePerformanceSummary();
console.log(`Hit rate: ${(summary.overallHitRate * 100).toFixed(1)}%`);
```

### Expected Performance Impact

- **Cache Hit Rate**: +20% improvement through coordinated invalidation
- **Memory Usage**: -20-30% reduction from proper eviction
- **CPU Savings**: 5-10% from better cache utilization
- **Correctness**: Elimination of stale cache bugs

See [CACHE_COHERENCE.md](./CACHE_COHERENCE.md) for detailed documentation.

