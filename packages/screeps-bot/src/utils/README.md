# Utils Directory Organization

This directory contains bot-specific utility functions. Most utilities have been extracted to framework packages for reusability across projects.

## Current Structure

### `/metrics` - Bot-Specific Creep Metrics
Performance measurement and tracking for individual creeps.

**Files:**
- `creepMetrics.ts` - Creep efficiency metrics tracking (bot-specific memory integration)

**Usage:**
```typescript
import { initializeMetrics, recordHarvest } from "./utils/metrics";
```

**Note:** This is bot-specific because it integrates with creep memory. The CreepMetrics type is defined in `@ralphschuler/screeps-stats`.

### `/legacy` - Deprecated Utilities
Utilities kept for backward compatibility with known issues.

**Files:**
- `ErrorMapper.ts` - Source map error tracing (has source-map Promise issues, see #2688)
- `cacheIntegration.ts` - Legacy cache integration helpers

**Usage:**
```typescript
import { ErrorMapper } from "./utils/legacy";
```

**Migration Path:** Once #2688 and #2689 are resolved, ErrorMapper can be migrated to `@ralphschuler/screeps-utils`.

## Migrated Utilities

The following utilities have been extracted to framework packages:

### → `@ralphschuler/screeps-utils`

**Optimization Utilities:**
- `safeFind`, `safeFindClosestByRange` - Null-safe room.find() wrappers
- `throttle`, `throttleWithDefault` - CPU throttling
- `findOptimizations` - Optimized room.find() variants
- `idleDetection` - Skip unnecessary behavior evaluations
- `computationScheduler` - Spread expensive operations across ticks

**Common Utilities:**
- `random`, `randomInt`, `shuffle`, `pick` - Random number generation
- `weightedSelection` - Probabilistic selection
- `findDistributedTarget` - Distributed target assignment
- `getCollectionPoint` - Rally point calculation

**Usage:**
```typescript
import { 
  safeFind, 
  throttle, 
  weightedSelection, 
  findDistributedTarget,
  getCollectionPoint,
  runScheduledTasks
} from "@ralphschuler/screeps-utils";
```

### → `@ralphschuler/screeps-pathfinding`

Advanced pathfinding utilities including room callbacks and cost matrices.

**Usage:**
```typescript
import { pathfindingAdapter } from "@ralphschuler/screeps-pathfinding";
```

### → `@ralphschuler/screeps-remote-mining`

Remote mining specific utilities for optimized remote harvesting operations.

**Usage:**
```typescript
import { remoteMiningAdapter } from "@ralphschuler/screeps-remote-mining";
```

### → `screeps-cartographer`

**Movement utilities** (third-party, recommended):
All custom movement utilities have been migrated to use [screeps-cartographer](https://github.com/glitchassassin/screeps-cartographer/).

**Usage:**
```typescript
import { moveTo, cachePath } from "screeps-cartographer";
moveTo(creep, target, { reusePath: 50 });
```

### → Unified Cache System (`src/cache/`)

All caching utilities are in the unified cache system at `src/cache/`.

**Usage:**
```typescript
import { cachedFindSources, getCachedBodyPartCount } from "./cache";
```

## Design Philosophy

The utils directory now follows the **"Required Code Only"** principle:
- Keep only bot-specific utilities that integrate with bot memory or state
- Extract reusable utilities to framework packages
- Remove code when it's no longer actively used

## Related Issues

- Issue #2742: Utils extraction (completed)
- Issue #2688: ErrorMapper source-map issues (blocking legacy migration)
- Issue #2689: Fix source-map Promise issues (in progress)
