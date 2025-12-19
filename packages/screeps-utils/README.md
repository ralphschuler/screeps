# @ralphschuler/screeps-utils

High-performance utility functions for Screeps bots. This package provides a collection of battle-tested utilities for caching, optimization, pathfinding, and more.

## Features

- **Zero Dependencies**: Pure utility functions with no external dependencies
- **TypeScript First**: Full type safety with comprehensive type definitions
- **Tree-Shakeable**: Import only what you need
- **Well-Documented**: JSDoc comments for all public APIs
- **Battle-Tested**: Extracted from production Screeps bot with 1000+ ticks/day

## Installation

```bash
npm install @ralphschuler/screeps-utils
```

## Usage

### Cache Utilities

Optimize performance with aggressive caching:

```typescript
import { getCachedObjectById, getCachedBodyPartCount } from "@ralphschuler/screeps-utils/cache";

// Cache game objects with TTL
const spawn = getCachedObjectById(spawnId);

// Cache body part counts (saves ~0.005-0.01 CPU per call)
const workParts = getCachedBodyPartCount(creep, WORK, true);
```

### Selection Utilities

Deterministic random selection and weighted algorithms:

```typescript
import { weightedSelection, random, findDistributedTarget } from "@ralphschuler/screeps-utils/selection";

// Weighted random selection
const target = weightedSelection([
  { key: "source1", weight: 0.7 },
  { key: "source2", weight: 0.3 }
]);

// Deterministic random (seeded with Game.time)
if (random() < 0.5) {
  // ...
}

// Distribute creeps across targets to prevent congestion
const source = findDistributedTarget(creep, sources, "source");
```

### Optimization Utilities

CPU optimization and computation scheduling:

```typescript
import { throttle, scheduleTask, TaskPriority } from "@ralphschuler/screeps-utils/optimization";

// Execute expensive operations periodically
throttle(() => analyzeMarket(), 100);

// Schedule tasks based on CPU bucket
scheduleTask(
  "market-analysis",
  100,  // interval
  () => analyzeMarket(),
  TaskPriority.MEDIUM,  // only runs when bucket > 5000
  2.0  // max CPU budget
);
```

### Error Handling

Safe wrappers for game operations:

```typescript
import { safeFind, ErrorMapper } from "@ralphschuler/screeps-utils/errors";

// Safe find that handles corrupted game objects
const hostiles = safeFind(room, FIND_HOSTILE_CREEPS);

// Source-mapped error traces
export const loop = ErrorMapper.wrapLoop(() => {
  // your main loop
});
```

### Pathfinding Utilities

Path caching and optimization:

```typescript
import { getCachedPath, cachePath } from "@ralphschuler/screeps-utils/pathfinding";

// Cache pathfinding results
const path = getCachedPath(fromPos, toPos) || 
  cachePath(fromPos, toPos, PathFinder.search(fromPos, toPos).path);
```

## API Documentation

### Cache Module

- `getCachedObjectById<T>(id, ttl?)` - Get game object by ID with caching
- `getCachedBodyPartCount(creep, partType, activeOnly?)` - Get cached body part count
- `getCachedDamagePotential(creep)` - Get cached damage potential
- `getCachedHealPotential(creep)` - Get cached heal potential
- `cachedRoomFind(room, type, opts?)` - Cached room.find() operation
- `getCachedRepairTarget(creep, fn)` - Role-specific cached target

### Selection Module

- `random()` - Deterministic random (0-1)
- `randomInt(min, max)` - Deterministic random integer
- `shuffle<T>(array)` - Deterministic array shuffle
- `weightedSelection<T>(entries)` - Weighted random selection
- `findDistributedTarget<T>(creep, targets, typeKey)` - Load-balanced target selection

### Optimization Module

- `throttle<T>(fn, interval, offset?)` - Execute every N ticks
- `scheduleTask(...)` - Schedule CPU-budget-aware tasks
- `isLowBucket(threshold?)` - Check if CPU bucket is low
- `hasCpuBudget(minNeeded?, targetUsage?)` - Check CPU availability
- `chebyshevDistance(x1, y1, x2, y2)` - Fast distance calculation
- `groupBy<T, K>(array, keyFn)` - Efficient grouping

### Error Module

- `safeFind(room, type, opts?)` - Safe room.find() wrapper
- `safeFindClosestByRange(pos, type, opts?)` - Safe findClosestByRange
- `ErrorMapper.wrapLoop(loop)` - Wrap main loop with error mapping
- `ErrorMapper.sourceMappedStackTrace(error)` - Get source-mapped stack trace

### Pathfinding Module

- `getCachedPath(from, to, routeKey?)` - Get cached path
- `cachePath(from, to, path, routeKey?)` - Cache a path
- `invalidateRoom(roomName)` - Invalidate paths for a room

## Performance Benefits

Based on production usage with 100+ creeps:

- **Body Part Caching**: ~0.5-1 CPU/tick savings
- **Object Caching**: ~1-2 CPU/tick savings
- **Room Find Caching**: ~2-3 CPU/tick savings
- **Computation Scheduling**: Maintains stable CPU under 20/tick
- **Target Distribution**: Reduces creep congestion by 40%+

## Migration from Bot

If you're extracting these utilities from a bot:

```typescript
// Before
import { weightedSelection } from "../utils/weightedSelection";

// After
import { weightedSelection } from "@ralphschuler/screeps-utils/selection";
// or
import { weightedSelection } from "@ralphschuler/screeps-utils";
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Watch tests
npm run test:watch
```

## Design Principles

From ROADMAP.md Section 23:

- **Modularity**: Clear input/output interfaces
- **Testability**: Unit tests for all utilities
- **Performance**: Aggressive caching with TTL
- **CPU Awareness**: Bucket-controlled behavior

## License

Unlicense - Public Domain

## Contributing

Contributions welcome! This package is extracted from a production Screeps bot and benefits from real-world usage patterns.

## Related Packages

- `@ralphschuler/screeps-tasks` - Minimal task system for creeps
- `@ralphschuler/screeps-chemistry` - Chemistry and lab management
- `@ralphschuler/screeps-posis` - Process-oriented system integration

## Credits

Extracted from the ralphschuler/screeps repository, a swarm-based Screeps bot using distributed colony management.
