# Pathfinding Optimization Guide

This guide documents pathfinding optimizations implemented to reduce CPU usage in the Screeps bot.

## Overview

Pathfinding is one of the most CPU-intensive operations in Screeps. This optimization focuses on:
1. **Path caching** - Store and reuse calculated paths
2. **Metrics tracking** - Monitor pathfinding performance
3. **Smart wrappers** - Automated caching for common patterns

## Performance Impact

**Before optimization:**
- 30 pathfinding calls identified
- 43.3% cached, 56.7% uncached
- Estimated CPU waste: ~9.5 CPU per tick from uncached calls

**Target after optimization:**
- Cache hit rate: ≥80%
- CPU reduction: ≥10% in pathfinding subsystem
- Zero performance regressions

## Implementation

### 1. Pathfinding Metrics (`pathfindingMetrics.ts`)

Tracks pathfinding performance in real-time:
- Total calls per tick
- Cache hits vs misses
- CPU usage per call
- Estimated CPU savings

**Usage:**
```typescript
import { trackPathfindingCall } from "./core/pathfindingMetrics";

// Wrap pathfinding calls
const result = trackPathfindingCall('moveTo', wasCached, () => {
  return creep.moveTo(target);
});

// Get metrics
const metrics = pathfindingMetrics.getMetrics();
console.log(`Cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`);
```

### 2. Cached Movement Utilities (`utils/movement/cachedMovement.ts`)

High-level wrappers that automatically cache paths:

#### `cachedMoveTo()`
Drop-in replacement for `creep.moveTo()` with automatic caching:

```typescript
import { cachedMoveTo } from "./utils/movement";

// Simple usage
cachedMoveTo(creep, source);

// With options
cachedMoveTo(creep, controller, { 
  range: 3,
  cacheTtl: 100 
});
```

**Benefits:**
- Automatic path caching and reuse
- CPU tracking built-in
- Compatible with existing code

#### `cachedPathFinderSearch()`
Cached version of `PathFinder.search()`:

```typescript
import { cachedPathFinderSearch } from "./utils/movement";

const result = cachedPathFinderSearch(
  spawn.pos,
  { pos: source.pos, range: 1 },
  { plainCost: 2, swampCost: 10 },
  { ttl: 100 }
);
```

### 3. Integration with unifiedStats

Pathfinding metrics are automatically collected and exported:

```typescript
// Access in Memory.stats.pathfinding
{
  totalCalls: 45,
  cacheHits: 38,
  cacheMisses: 7,
  cacheHitRate: 0.844,
  cpuUsed: 2.15,
  avgCpuPerCall: 0.048,
  cpuSaved: 4.32,
  callsByType: {
    moveTo: 30,
    pathFinderSearch: 10,
    findPath: 3,
    moveByPath: 2
  }
}
```

**Grafana metrics:**
- `stats.pathfinding.totalCalls`
- `stats.pathfinding.cacheHitRate`
- `stats.pathfinding.cpuSaved`

## Migration Guide

### Replacing `creep.moveTo()`

**Before:**
```typescript
creep.moveTo(target, { reusePath: 10 });
```

**After:**
```typescript
import { cachedMoveTo } from "./utils/movement";
cachedMoveTo(creep, target, { cacheTtl: 50 });
```

### Replacing `PathFinder.search()`

**Before:**
```typescript
const result = PathFinder.search(
  spawn.pos,
  { pos: source.pos, range: 1 },
  { plainCost: 2, swampCost: 10 }
);
```

**After:**
```typescript
import { cachedPathFinderSearch } from "./utils/movement";
const result = cachedPathFinderSearch(
  spawn.pos,
  { pos: source.pos, range: 1 },
  { plainCost: 2, swampCost: 10 },
  { ttl: 100 }
);
```

## Hot Paths to Optimize

Based on audit findings, these are high-priority migration targets:

### 1. roomPathManager.ts (6 calls)
**Location:** `economy/roomPathManager.ts`
- Lines 119, 150, 162, etc.
- **Impact:** Room setup paths calculated frequently
- **Recommendation:** Use `cachedPathFinderSearch()` wrapper

### 2. crossShardCarrier.ts (6 calls)
**Location:** `roles/crossShardCarrier.ts`
- Lines 112, 134, 139, 172, 207, 239, etc.
- **Impact:** Cross-shard movement is expensive
- **Recommendation:** Migrate to `cachedMoveTo()`

### 3. roadNetworkPlanner.ts (3+ calls)
**Location:** `layouts/roadNetworkPlanner.ts`
- Lines 344, 374, 419, etc.
- **Impact:** Road planning paths reused across ticks
- **Recommendation:** Use `cachedPathFinderSearch()` with long TTL

### 4. labManager.ts (2 calls)
**Location:** `labs/labManager.ts`, `labs/boostManager.ts`
- Lab-related movement
- **Recommendation:** Migrate to `cachedMoveTo()`

## Monitoring

### Real-time Monitoring
```typescript
// In console
Memory.stats.pathfinding
```

### Grafana Dashboard
Create panels for:
- Cache hit rate over time (target: ≥80%)
- CPU saved per tick
- Calls by type (stacked area chart)
- Average CPU per call

### Performance Validation
```typescript
// Check if optimizations are working
const stats = Memory.stats.pathfinding;
if (stats.cacheHitRate < 0.8) {
  console.log('⚠️ Cache hit rate below target!');
}
if (stats.avgCpuPerCall > 0.1) {
  console.log('⚠️ Average CPU per call too high!');
}
```

## Best Practices

### 1. Cache TTL Guidelines
- **Static paths** (spawn → source): TTL = 500 ticks
- **Dynamic paths** (creep → creep): TTL = 10-20 ticks
- **Room paths**: TTL = 100 ticks
- **Remote mining**: TTL = 500 ticks

### 2. When to Use Caching
✅ **Good candidates:**
- Repetitive movement (harvesters, upgraders)
- Static targets (sources, controllers)
- Multi-creep routes (haulers to same storage)

❌ **Poor candidates:**
- Combat movement (highly dynamic)
- Fleeing behavior
- One-time exploratory movement

### 3. Cache Invalidation
Paths are automatically invalidated when:
- TTL expires
- Room structures change
- Hostiles detected

Manual invalidation:
```typescript
import { invalidatePath, invalidateRoom } from "./cache";

// Invalidate specific path
invalidatePath(from, to);

// Invalidate all paths in room
invalidateRoom("W1N1");
```

## Troubleshooting

### Low Cache Hit Rate
**Symptoms:** Cache hit rate < 60%
**Causes:**
- TTL too short
- Paths not being cached properly
- High variance in start/end positions

**Solutions:**
- Increase cache TTL
- Use role-based shared paths
- Check metrics to identify uncached calls

### High CPU Per Call
**Symptoms:** avgCpuPerCall > 0.15
**Causes:**
- Complex pathfinding (long distances, obstacles)
- Cache misses triggering expensive calculations

**Solutions:**
- Pre-cache common routes
- Simplify pathfinding options
- Increase cache hit rate

### Memory Leaks
**Symptoms:** Growing cache size, memory issues
**Causes:**
- Cache not being cleaned up
- Too many unique paths cached

**Solutions:**
- Reduce MAX_CACHE_SIZE in PathCache.ts
- Check cache stats: `getPathCacheStats()`
- Manually clear old entries: `cleanupExpiredPaths()`

## Future Enhancements

### Planned Improvements
1. **Traffic-aware caching** - Integrate with screeps-cartographer
2. **Path sharing** - Multiple creeps share same cached path
3. **Predictive pre-caching** - Cache paths before needed
4. **Multi-room optimization** - Better inter-room pathfinding

### Experimental Features
1. **AI-powered path selection** - Use historical data to predict best paths
2. **Dynamic TTL adjustment** - Adjust based on room activity
3. **Path compression** - Reduce memory footprint of cached paths

## References

- [PATHFINDING_AUDIT.md](../PATHFINDING_AUDIT.md) - Audit results
- [PathCache.ts](../packages/screeps-bot/src/cache/domains/PathCache.ts) - Core caching system
- [pathfindingMetrics.ts](../packages/screeps-bot/src/core/pathfindingMetrics.ts) - Metrics tracker
- [cachedMovement.ts](../packages/screeps-bot/src/utils/movement/cachedMovement.ts) - Movement wrappers
