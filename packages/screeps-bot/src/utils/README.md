# Utils Directory Organization

This directory contains utility functions and classes organized by functionality for improved discoverability and maintainability.

## Directory Structure

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
Path-related utilities beyond basic caching.

**Files:**
- `pathCacheEvents.ts` - Event-driven path cache invalidation
- `portalManager.ts` - Inter-shard portal discovery and routing

**Usage:**
```typescript
import { initializePathCacheEvents, discoverPortalsInRoom } from "./utils/pathfinding";
```

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

### Unified Cache System

All caching utilities are now in the unified cache system located in `src/cache/`. The old `utils/caching/` directory has been removed, and all imports should use `src/cache/` directly.

For new cache-related features, add them directly to `src/cache/domains/`.

## Related Issues

- Issue #715: Cache consolidation (future work)
- Issue #705: Extract to @screeps/utils package (future work)
- Issue #713: Extract utility functions (future work)
