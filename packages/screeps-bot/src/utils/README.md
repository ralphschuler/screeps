# Utils Directory Organization

This directory contains utility functions and classes organized by functionality for improved discoverability and maintainability.

## Directory Structure

### Movement & Pathfinding

**Movement utilities have been migrated to [screeps-cartographer](https://github.com/glitchassassin/screeps-cartographer/)** - an advanced, battle-tested movement library. All movement and pathfinding should now use Cartographer's API.

**Usage:**
```typescript
import { moveTo, cachePath } from "screeps-cartographer";

// Replace old cachedMoveTo with Cartographer's moveTo
moveTo(creep, target, { reusePath: 50 });

// Pre-cache paths for economy routes
cachePath(key, origin, target, { reusePath: 500 });
```

See [ADR-0003](../../docs/adr/0003-cartographer-traffic-management.md) for rationale and performance benefits.

### Caching

The caching functionality has been migrated to the unified cache system in `src/cache/`. Import cache utilities directly from the cache package:

**Usage:**
```typescript
import { cachedFindSources, getCachedBodyPartCount } from "./cache";
```

See `src/cache/README.md` for comprehensive documentation on the unified cache system.

### `/remote-mining`
Remote mining specific utilities for optimized remote harvesting operations.

**Files:**
- `remoteMiningMovement.ts` - Optimized movement for remote miners
- `remotePathCache.ts` - Specialized path caching for remote routes
- `remotePathScheduler.ts` - Scheduled precaching of remote routes
- `remoteRoomUtils.ts` - Shared utilities for remote operations

**Usage:**
```typescript
import { moveToWithRemoteCache, getRemoteMiningPath } from "./utils/remote-mining";
```

### `/optimization`
Performance optimization utilities for CPU efficiency and find operations.

**Files:**
- `cpuEfficiency.ts` - Throttling and body part calculations
- `findOptimizations.ts` - Optimized room.find() variants
- `idleDetection.ts` - Skip unnecessary behavior evaluations
- `safeFind.ts` - Null-safe wrappers for room.find() operations

**Usage:**
```typescript
import { throttle, safeFind, cachedFindInRange } from "./utils/optimization";
```

### `/scheduling`
Computation scheduling and task management.

**Files:**
- `computationScheduler.ts` - Spread expensive operations across ticks

**Usage:**
```typescript
import { scheduleTask, TaskPriority } from "./utils/scheduling";
```

### `/common`
Generic utilities used across the codebase.

**Files:**
- `collectionPoint.ts` - Rally point calculation for military units
- `random.ts` - Seeded and unseeded random number generation
- `targetDistribution.ts` - Distributed target assignment
- `weightedSelection.ts` - Probabilistic selection from weighted entries

**Usage:**
```typescript
import { random, weightedSelection, getCollectionPoint } from "./utils/common";
```

### `/pathfinding`
Adapter utilities for the @ralphschuler/screeps-pathfinding package.

**Files:**
- `pathfindingAdapter.ts` - Bridge to screeps-pathfinding package

**Usage:**
```typescript
import { pathfindingAdapter } from "./utils/pathfinding";
```

**Note:** For general movement and path caching, use [screeps-cartographer](https://github.com/glitchassassin/screeps-cartographer/) directly. This adapter is only for specific advanced pathfinding needs.

### `/metrics`
Performance measurement and tracking utilities.

**Files:**
- `creepMetrics.ts` - Creep efficiency metrics tracking

**Usage:**
```typescript
import { initializeMetrics, recordHarvest } from "./utils/metrics";
```

### `/legacy`
Deprecated utilities kept for backward compatibility.

**Files:**
- `ErrorMapper.ts` - Source map error tracing (has known issues)
- `cacheIntegration.ts` - Documentation-only migration guide

**Usage:**
```typescript
import { ErrorMapper } from "./utils/legacy";
```

## Migration Notes

All utilities have been reorganized but maintain backward compatibility through barrel exports (`index.ts` in each subdirectory). Import paths have been updated throughout the codebase.

### Movement Migration

**As of January 2026**, all custom movement utilities (`utils/movement/`) have been removed in favor of [screeps-cartographer](https://github.com/glitchassassin/screeps-cartographer/). 

**Migration Guide:**
```typescript
// OLD (removed)
import { cachedMoveTo } from "./utils/movement";
cachedMoveTo(creep, target, { cacheTtl: 50 });

// NEW
import { moveTo } from "screeps-cartographer";
moveTo(creep, target, { reusePath: 50 });

// OLD (removed)
import { cachedPathFinderSearch } from "./utils/movement";
const result = cachedPathFinderSearch(from, goal, options, { ttl: 100 });

// NEW
import { cachePath } from "screeps-cartographer";
const path = cachePath(key, from, goal, { reusePath: 100 });
```

Benefits of Cartographer:
- Automatic path caching and reuse
- Traffic management (creeps avoid blocking each other)
- Better multi-room pathfinding
- Active community maintenance
- CPU savings: 6-10 CPU/tick (60-80% reduction)

### Unified Cache System

All caching utilities are now in the unified cache system located in `src/cache/`. The old `utils/caching/` directory has been removed, and all imports should use `src/cache/` directly.

For new cache-related features, add them directly to `src/cache/domains/`.

## Related Issues

- Issue #715: Cache consolidation (future work)
- Issue #705: Extract to @screeps/utils package (future work)
- Issue #713: Extract utility functions (future work)
