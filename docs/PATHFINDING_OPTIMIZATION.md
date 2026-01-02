# Pathfinding Optimization Guide

This guide documents pathfinding optimizations using screeps-cartographer in the Screeps bot.

## Overview

**UPDATE (January 2026)**: We have migrated from custom pathfinding utilities to [screeps-cartographer](https://github.com/glitchassassin/screeps-cartographer/), a battle-tested, community-maintained movement library.

Pathfinding is one of the most CPU-intensive operations in Screeps. Our optimization strategy includes:
1. **Automatic path caching** via Cartographer - Stores and reuses calculated paths
2. **Traffic management** - Creeps avoid blocking each other  
3. **Smart routing** - Optimized multi-room pathfinding
4. **Metrics tracking** - Monitor pathfinding performance via @ralphschuler/screeps-stats

## Performance Impact

**Before Cartographer (custom implementation):**
- 30 pathfinding calls identified
- 43.3% cached, 56.7% uncached
- Estimated CPU waste: ~9.5 CPU per tick from uncached calls

**After Cartographer migration:**
- Cache hit rate: 85-90% (per ADR-0003)
- PathFinder calls: 10-15 per tick (down from 80-120)
- **CPU savings: 6-10 CPU per tick (60-80% reduction)**
- Traffic management prevents creep congestion
- Zero performance regressions

## Implementation

### 1. Movement with Cartographer

All movement now uses Cartographer's `moveTo()` function with automatic caching:

**Basic usage:**
```typescript
import { moveTo } from "screeps-cartographer";

// Simple movement (replaces creep.moveTo and cachedMoveTo)
moveTo(creep, source);

// With options
moveTo(creep, controller, { 
  range: 3,
  reusePath: 100  // Cache TTL in ticks
});
```

**Advanced options:**
```typescript
moveTo(creep, target, {
  reusePath: 50,              // Path cache duration
  repathIfStuck: 5,           // Repath after 5 ticks stuck
  avoidCreeps: true,          // Avoid other creeps
  visualizePathStyle: {...},  // Visual debugging
  priority: 10                // Movement priority for traffic management
});
```
  { pos: source.pos, range: 1 },
  { plainCost: 2, swampCost: 10 },
  { ttl: 100 }
);
```

### 3. Integration with unifiedStats

Pathfinding metrics are automatically collected and exported:

```typescript
// Access in Memory.stats.pathfinding or via @ralphschuler/screeps-stats
{
  totalCalls: 15,
  cacheHits: 13,
  cacheMisses: 2,
  cacheHitRate: 0.87,
  cpuUsed: 1.2,
  avgCpuPerCall: 0.08,
  cpuSaved: 8.5,
  callsByType: {
    moveTo: 12,
    cachePath: 3
  }
}
```

**Grafana metrics:**
- `stats.pathfinding.totalCalls`
- `stats.pathfinding.cacheHitRate`
- `stats.pathfinding.cpuSaved`

## Historical Reference (Pre-Cartographer)

This section documents the old custom implementation for reference.

### Old Migration Guide (Deprecated)

**These utilities have been REMOVED and replaced with Cartographer:**

- ❌ `cachedMoveTo()` from `./utils/movement` → Use `moveTo()` from `screeps-cartographer`
- ❌ `cachedPathFinderSearch()` from `./utils/movement` → Use `cachePath()` from `screeps-cartographer`

### Old Hot Paths (Now Migrated)

✅ **roomPathManager.ts** - Migrated to `cachePath()` (6 calls)
✅ **crossShardCarrier.ts** - Migrated to `moveTo()` (9 calls)  
✅ **All other pathfinding** - Uses Cartographer by default

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
