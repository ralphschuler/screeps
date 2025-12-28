# Cache Coherence Protocol

## Overview

The Cache Coherence Protocol is a system for coordinating multiple cache layers in the Screeps bot to ensure consistency, optimize memory usage, and improve cache hit rates through event-based invalidation.

## Architecture

### Cache Hierarchy

The system implements a three-tier cache hierarchy:

- **L1 Cache** (heap-based, priority 100): Fastest access, short-lived data
  - Object references (5MB budget)
  - Body part analysis (2MB budget)
  - Highest eviction priority - kept longest

- **L2 Cache** (heap-based, priority 50-70): Medium-lived data
  - Paths (10MB budget)
  - Room find results (8MB budget)
  - Roles (3MB budget)
  - Closest object searches (5MB budget)
  - Medium eviction priority

- **L3 Cache** (memory-based, priority 25): Persistent cross-tick data
  - Future enhancement for persistent caching
  - Lowest eviction priority - evicted first

### Components

#### CacheCoherenceManager

The central coordinator that manages all cache layers:

```typescript
import { cacheCoherence, CacheLayer } from "./cache";

// Register a cache
cacheCoherence.registerCache(
  "myCache",     // namespace
  cacheManager,  // CacheManager instance
  CacheLayer.L2, // cache layer
  {
    priority: 60,           // eviction priority
    maxMemory: 5 * 1024 * 1024  // 5MB budget
  }
);

// Invalidate caches
cacheCoherence.invalidate({
  type: "room",
  roomName: "W1N1",
  namespaces: ["path", "roomFind"]
});

// Get statistics
const stats = cacheCoherence.getCacheStats();
console.log(`Overall hit rate: ${stats.hitRate}`);
```

#### Event-Based Invalidation

Automatic cache invalidation based on game events:

```typescript
import { initializeCacheEvents } from "./cache";

// Call once during bot initialization
initializeCacheEvents();

// Events automatically trigger invalidation (8 handlers):
// - creep.died → object/role caches
// - structure.destroyed → object/path caches
// - construction.complete → path/roomFind caches
// - hostile.detected → closest/roomFind caches
// - hostile.cleared → closest/roomFind caches
// - spawn.completed → role caches
// - rcl.upgrade → roomFind/path caches
// - remote.lost → all caches for that room
```

#### Cache Registration

Helper to register all domain caches:

```typescript
import { registerAllCaches } from "./cache";

// Call once during bot initialization
registerAllCaches();

// Registers all built-in caches:
// - object (L1)
// - bodypart (L1)
// - path (L2)
// - roomFind (L2)
// - role (L2)
// - closest (L2)
```

## Invalidation Scopes

### Room-Scoped Invalidation

Invalidates all cache entries related to a room:

```typescript
cacheCoherence.invalidate({
  type: "room",
  roomName: "W1N1",
  namespaces: ["path", "roomFind"]
});
```

### Creep-Scoped Invalidation

Invalidates cache entries containing a creep name or ID:

```typescript
cacheCoherence.invalidate({
  type: "creep",
  creepName: "Harvester1",
  namespaces: ["object", "role"]
});
```

### Object-Scoped Invalidation

Invalidates a specific object by ID:

```typescript
cacheCoherence.invalidate({
  type: "object",
  objectId: "5d8a5c8e1234567890abcdef",
  namespaces: ["object"]
});
```

### Structure-Scoped Invalidation

Invalidates structures of a specific type in a room:

```typescript
cacheCoherence.invalidate({
  type: "structure",
  roomName: "W1N1",
  structureType: STRUCTURE_TOWER,
  namespaces: ["roomFind"]
});
```

### Pattern-Based Invalidation

Invalidates entries matching a regular expression:

```typescript
cacheCoherence.invalidate({
  type: "pattern",
  pattern: /Worker\d+/,
  namespaces: ["object"]
});
```

### Global Invalidation

Clears all caches in specified namespaces:

```typescript
cacheCoherence.invalidate({
  type: "global",
  namespaces: ["path"] // or omit for all namespaces
});
```

## Memory Budget Management

### Setting the Budget

```typescript
import { setTotalCacheBudget } from "./cache";

// Set total memory budget to 100MB
setTotalCacheBudget(100 * 1024 * 1024);
```

### Automatic Eviction

When the total cache memory exceeds the budget:

1. Caches are sorted by priority (lowest first)
2. 10% of the lowest priority cache is evicted
3. Process repeats until under budget
4. LRU (Least Recently Used) entries are evicted first

### Manual Cleanup

```typescript
import { triggerCacheCleanup } from "./cache";

// Manually trigger cleanup
const removed = triggerCacheCleanup();
console.log(`Removed ${removed} expired entries`);
```

## Statistics & Monitoring

### Grafana Metrics

Export cache statistics to Grafana:

```typescript
import { collectCacheStats } from "./cache";

// Collect stats for Grafana export
const metrics = collectCacheStats();
// Returns:
// - cache.total.hits
// - cache.total.misses
// - cache.total.hitRate
// - cache.total.memory
// - cache.total.evictions
// - cache.total.invalidations
// - cache.l1.* (L1 layer metrics)
// - cache.l2.* (L2 layer metrics)
// - cache.l3.* (L3 layer metrics)
// - cache.<namespace>.* (per-namespace metrics)
```

### Performance Summary

```typescript
import { getCachePerformanceSummary, logCacheStats } from "./cache";

// Get summary
const summary = getCachePerformanceSummary();
console.log(`Hit rate: ${(summary.overallHitRate * 100).toFixed(1)}%`);
console.log(`Efficiency: ${summary.cacheEfficiency}`); // excellent/good/fair/poor

// Log to console
logCacheStats();
```

### Cache Statistics

```typescript
import { getCacheCoherenceStats } from "./cache";

const stats = getCacheCoherenceStats();
console.log(`Total hits: ${stats.totalHits}`);
console.log(`Total misses: ${stats.totalMisses}`);
console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
console.log(`L1 hit rate: ${(stats.layers.L1.hitRate * 100).toFixed(1)}%`);
console.log(`L2 hit rate: ${(stats.layers.L2.hitRate * 100).toFixed(1)}%`);
console.log(`Memory usage: ${(stats.totalMemory / 1024).toFixed(0)}KB`);
console.log(`Evictions: ${stats.totalEvictions}`);
console.log(`Invalidations: ${stats.totalInvalidations}`);
```

## Integration with Bot

### Initialization

Add to your bot's initialization:

```typescript
import { 
  registerAllCaches, 
  initializeCacheEvents 
} from "./cache";

export function loop() {
  // First tick initialization
  if (Game.time === 1 || !global._initialized) {
    // Register all caches with coherence manager
    registerAllCaches();
    
    // Setup event-based invalidation
    initializeCacheEvents();
    
    global._initialized = true;
  }
  
  // Your bot logic here...
}
```

### Periodic Cleanup

Add periodic cleanup to your main loop:

```typescript
import { cacheCoherence } from "./cache";

export function loop() {
  // ... your bot logic ...
  
  // Periodic cleanup (runs every 10 ticks by default)
  cacheCoherence.cleanup();
  
  // Periodic persistence for L3 caches (future)
  cacheCoherence.persist();
}
```

### Statistics Export

Integrate with your stats system:

```typescript
import { collectCacheStats } from "./cache";

function exportStats() {
  const stats = {
    // ... your other stats ...
    ...collectCacheStats()
  };
  
  // Send to Grafana or store in Memory.stats
  Memory.stats = stats;
}
```

## Best Practices

### When to Invalidate

1. **Room Changes**: Always invalidate paths when room layout changes
2. **Object Destruction**: Invalidate object caches immediately
3. **State Changes**: Invalidate derived caches (roles, assignments) when dependencies change
4. **Visibility Changes**: Invalidate all room caches when room becomes visible/invisible

### Cache Key Design

Use hierarchical keys with room names for efficient invalidation:

```typescript
// Good - easy to invalidate by room
const key = `${roomName}:${creepName}:target`;

// Less ideal - harder to invalidate by room
const key = `${creepName}_target`;
```

### Priority Assignment

- **L1 (100)**: Frequently accessed, cheap to compute (object references)
- **L2 (50-70)**: Moderately accessed, expensive to compute (pathfinding)
- **L3 (25)**: Infrequently accessed, persistence needed

### Memory Budgets

Allocate budgets based on cache importance and size:

- Critical caches (object, bodypart): Smaller budgets, higher priority
- Expensive caches (paths): Larger budgets, medium priority
- Optional caches (closest searches): Variable budget based on CPU savings

## Performance Considerations

### Expected Improvements

- **Cache Hit Rate**: 20%+ improvement through coordinated invalidation
- **Memory Usage**: 20-30% reduction from proper eviction
- **CPU Savings**: 5-10% from better cache utilization
- **Correctness**: Elimination of stale cache bugs

### Monitoring

Track these metrics in Grafana:

1. **Hit Rates**: Should be >75% for L1, >60% for L2
2. **Evictions**: High eviction rate indicates budget too small
3. **Invalidations**: Track event-triggered invalidations
4. **Memory Usage**: Should stay under budget

### Tuning

Adjust based on observed metrics:

1. **Low hit rates**: Increase TTL or cache budget
2. **High evictions**: Increase cache budget or reduce cache size
3. **High invalidations**: Review event handlers, may be too aggressive
4. **Memory pressure**: Reduce budgets or increase total budget

## Troubleshooting

### Stale Cache Data

If you observe stale data:

1. Check event handlers are initialized: `initializeCacheEvents()`
2. Verify cache is registered: `cacheCoherence.isRegistered("namespace")`
3. Add manual invalidation in critical paths
4. Reduce TTL for affected caches

### High Memory Usage

If cache memory exceeds budget:

1. Check total budget: `cacheCoherence.getMemoryBudget()`
2. Review per-cache budgets in registration
3. Increase cleanup frequency
4. Reduce cache sizes or TTLs

### Low Hit Rates

If hit rates are below expectations:

1. Review invalidation patterns (may be too aggressive)
2. Increase cache TTLs
3. Increase cache budgets to prevent eviction
4. Check for cache key consistency issues

## Future Enhancements

### Planned Features

1. **L3 Memory-Backed Caching**: Persistent caching across ticks
2. **Cache Warming**: Proactive caching of common queries
3. **Advanced Eviction Strategies**: Clock, FIFO, LFU algorithms
4. **Cache Preloading**: Load common routes and objects at tick start
5. **Multi-Shard Coordination**: Cache coherence across shards
6. **Compression**: Compress large cache entries to save memory

### Extension Points

Custom cache invalidation:

```typescript
// Register custom event handler
eventBus.on("custom.event", (event) => {
  cacheCoherence.invalidate({
    type: "pattern",
    pattern: /customPattern/,
    namespaces: ["myCache"]
  });
});
```

Custom cache registration:

```typescript
// Register your own cache
const myCache = new CacheManager('heap');
cacheCoherence.registerCache(
  "myCustomCache",
  myCache,
  CacheLayer.L2,
  { priority: 55, maxMemory: 4 * 1024 * 1024 }
);
```

## References

- [ROADMAP.md](../ROADMAP.md) - Caching design principles
- [CacheManager.ts](./CacheManager.ts) - Core cache implementation
- [events.ts](../core/events.ts) - Event system documentation
