# Cache Consolidation Migration

## Overview

This document summarizes the consolidation of duplicate caching implementations across the codebase into the unified cache system located in `src/cache/`.

## Background

Prior to this migration, the codebase had multiple independent cache implementations using raw `Map<>` objects. This led to:
- Inconsistent cache behavior and TTL management
- Higher CPU usage from redundant cache implementations
- Increased maintenance burden (cache logic in multiple places)
- Lack of unified observability and metrics

## Migrated Caches

### 1. Collection Point Cache
**Location**: `src/utils/common/collectionPoint.ts`

**Before**:
```typescript
const collectionPointCache: Map<string, CollectionPointCache> = new Map();
```

**After**:
```typescript
// Uses globalCache with namespace "collectionPoint"
const cached = globalCache.get<{ x: number; y: number }>(room.name, {
  namespace: CACHE_NAMESPACE,
  ttl: RECALCULATION_INTERVAL
});
```

**Benefits**:
- Automatic TTL-based expiration (500 ticks)
- Unified stats tracking
- Consistent with other caches

### 2. Military Patrol Waypoint Cache
**Location**: `src/roles/behaviors/military.ts`

**Before**:
```typescript
const patrolWaypointCache: Map<string, PatrolWaypointCache> = new Map();
```

**After**:
```typescript
// Uses globalCache with namespace "patrol"
// Includes spawn count metadata for intelligent invalidation
const cached = globalCache.get<{ waypoints: Position[]; metadata: { spawnCount: number } }>(
  cacheKey, 
  { namespace: PATROL_CACHE_NAMESPACE }
);
```

**Benefits**:
- Metadata-based invalidation (only recalculates when spawn count changes)
- TTL of 1000 ticks
- Tracked in unified cache stats

### 3. Target Distribution Cache
**Location**: `src/utils/common/targetDistribution.ts`

**Before**:
```typescript
const roomAssignments = new Map<string, TargetAssignment>();

export function clearTargetAssignments(): void {
  roomAssignments.clear();
}
```

**After**:
```typescript
// Uses globalCache with namespace "targetAssignment"
// TTL=1 for automatic per-tick cleanup
const data = globalCache.get<TargetAssignmentData>(roomName, {
  namespace: ASSIGNMENT_CACHE_NAMESPACE,
  ttl: ASSIGNMENT_TTL  // 1 tick
});
```

**Benefits**:
- Automatic per-tick cleanup (no manual clearing needed)
- Removed `clearTargetAssignments()` export and call from main loop
- Consistent with cache coherence protocol

### 4. Evolution Structure Count Cache
**Location**: `src/logic/evolution.ts`

**Before**:
```typescript
private readonly structureCountsCache: Map<string, { counts: ...; tick: number }> = new Map();
```

**After**:
```typescript
// Uses globalCache with namespace "evolution:structures"
const cached = globalCache.get<Partial<Record<BuildableStructureConstant, number>>>(
  room.name,
  {
    namespace: this.STRUCTURE_CACHE_NAMESPACE,
    ttl: this.structureCacheTtl  // 20 ticks
  }
);
```

**Benefits**:
- Automatic TTL management (20 ticks)
- No manual tick tracking needed
- Integrated with cache stats

## Cache Registration

All migrated caches are now registered with the cache coherence manager in `src/cache/cacheRegistration.ts`:

```typescript
// Collection Point
cacheCoherence.registerCache("collectionPoint", globalCache, CacheLayer.L2, {
  priority: 50,
  maxMemory: 1 * 1024 * 1024 // 1MB
});

// Patrol Waypoints
cacheCoherence.registerCache("patrol", globalCache, CacheLayer.L2, {
  priority: 50,
  maxMemory: 2 * 1024 * 1024 // 2MB
});

// Target Assignments
cacheCoherence.registerCache("targetAssignment", globalCache, CacheLayer.L1, {
  priority: 90,
  maxMemory: 1 * 1024 * 1024 // 1MB
});

// Evolution Structure Counts
cacheCoherence.registerCache("evolution:structures", globalCache, CacheLayer.L2, {
  priority: 50,
  maxMemory: 1 * 1024 * 1024 // 1MB
});
```

## Performance Impact

### CPU Savings
- **Estimated**: 2-5% reduction in overall CPU usage
- **Sources**:
  - Better cache hit rates from unified LRU eviction
  - Reduced memory parsing overhead
  - Eliminated duplicate cache management code

### Memory Consistency
- All caches now use unified TTL management
- Consistent eviction policies across all caches
- Total cache budget: 38MB (up from 33MB, well within 50MB limit)

### Observability
All migrated caches are now tracked in unified cache stats:
- Hit rates per namespace
- Memory usage per namespace
- Eviction counts
- Cache coherence metrics

These metrics are exported to Grafana via `collectCacheStats()`.

## Migration Patterns

### Pattern 1: Simple TTL-Based Cache
```typescript
// Before
const cache: Map<string, { value: T; tick: number }> = new Map();

// After
import { globalCache } from "../../cache";

const CACHE_NAMESPACE = "myFeature";
const TTL = 100; // ticks

const value = globalCache.get<T>(key, {
  namespace: CACHE_NAMESPACE,
  ttl: TTL
});

globalCache.set(key, value, {
  namespace: CACHE_NAMESPACE,
  ttl: TTL
});
```

### Pattern 2: Cache with Metadata Validation
```typescript
// Before
const cache: Map<string, { data: T; metadata: M }> = new Map();

// After
const cached = globalCache.get<{ data: T; metadata: M }>(key, {
  namespace: CACHE_NAMESPACE,
  ttl: TTL
});

if (cached && isMetadataValid(cached.metadata)) {
  return cached.data;
}

// Store with metadata
globalCache.set(key, { data, metadata }, {
  namespace: CACHE_NAMESPACE,
  ttl: TTL
});
```

### Pattern 3: Per-Tick Auto-Clearing Cache
```typescript
// Before
const cache: Map<string, T> = new Map();
// Manual clearing in main loop
export function clearCache() { cache.clear(); }

// After
// Use TTL=1 for automatic per-tick cleanup
const value = globalCache.get<T>(key, {
  namespace: CACHE_NAMESPACE,
  ttl: 1  // Auto-clears next tick
});
```

## Remaining Caches

### Not Migrated (Data Structures, Not Caches)
These use `Map<>` for data structures, not caching:
- `logic/pheromone.ts`: Metrics trackers
- `utils/scheduling/computationScheduler.ts`: Task queue
- `labs/labConfig.ts`: Configuration storage
- `core/kernel.ts`: Process registry
- `core/events.ts`: Event handlers

### Already Using Correct Cache
These already use proper cache abstractions:
- `utils/pathfinding/portalManager.ts`: Uses `memoryManager.getHeapCache()`
- `utils/remote-mining/remotePathCache.ts`: Re-exports unified PathCache
- All `src/cache/domains/*`: Domain-specific unified cache wrappers

### Complex Structured Caches (Future Migration Candidates)
These hold complex structured data and may benefit from migration:
- `economy/roomPathManager.ts`: Pre-calculated path maps
- `economy/targetAssignmentManager.ts`: Creep-target assignments
- `roles/behaviors/context.ts`: Per-tick room data cache

## Best Practices

### When to Use Unified Cache
✅ **Use unified cache when**:
- Data needs TTL-based expiration
- Data should be tracked in observability metrics
- Cache needs coordinated invalidation
- Cache is performance-critical

❌ **Don't use unified cache when**:
- Using Map as a data structure (not cache)
- Need very specific eviction logic
- Data structure requires Map-specific methods

### Cache Namespace Naming
- Use descriptive, unique namespace names
- Format: `"feature"` or `"feature:subtype"`
- Examples: `"patrol"`, `"evolution:structures"`

### TTL Guidelines
- **1 tick**: Per-tick ephemeral data (e.g., target assignments)
- **20-50 ticks**: Frequently changing data (e.g., structure counts)
- **100-500 ticks**: Stable data (e.g., paths, waypoints)
- **-1**: Permanent (use sparingly)

## Testing

Cache migrations maintain the same external API, so existing tests should pass without modification. Focus testing on:
- Cache hit/miss behavior
- TTL expiration
- Invalidation correctness
- Memory usage

## Metrics

Monitor these Grafana metrics post-migration:
- `cache.collectionPoint.hitRate`
- `cache.patrol.hitRate`
- `cache.targetAssignment.hitRate`
- `cache.evolution:structures.hitRate`
- `cache.total.hitRate` (should improve 2-5%)

## References

- Unified Cache Documentation: `src/cache/README.md`
- Cache Coherence Protocol: `src/cache/CACHE_COHERENCE.md`
- ROADMAP Section 2: "Aggressives Caching + TTL"
