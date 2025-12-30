# Pathfinding Audit Report

Generated: 2025-12-30T01:32:35.952Z

## Summary Statistics

- **Total pathfinding calls**: 30
- **Cached calls**: 13 (43.3%)
- **Uncached calls**: 17 (56.7%)
- **Cartographer calls**: 0

## Calls by Type

| Type | Count | Percentage |
|------|-------|------------|
| findPath | 2 | 6.7% |
| PathFinder.search | 16 | 53.3% |
| moveTo | 11 | 36.7% |
| moveByPath | 1 | 3.3% |

## Optimization Recommendations

- **HIGH PRIORITY**: 17 pathfinding calls found without caching. Add path caching to reduce CPU usage by ~90% per call.

- **MEDIUM PRIORITY**: Only 0% of moveTo calls use screeps-cartographer. Consider migrating direct moveTo calls to use cartographer for traffic management.

- **MEDIUM PRIORITY**: 16 direct PathFinder.search calls found. Consider wrapping these with path caching for repetitive paths.

- **OPTIMIZATION**: Current cache usage is 43%. Target is ≥80% for optimal CPU savings. Focus on repetitive movement patterns.

## High-Impact Optimization Targets

### Uncached Pathfinding Calls

These calls could benefit most from path caching:

**economy/roomPathManager.ts**:
- Line 119: `const result = PathFinder.search(spawn.pos, { pos: source.pos, range: 1 }, {`
- Line 150: `const result = PathFinder.search(spawn.pos, { pos: room.controller.pos, range: 3`
- Line 162: `const result = PathFinder.search(source.pos, { pos: room.controller.pos, range: `
- ... and 3 more

**labs/boostManager.ts**:
- Line 123: `creep.moveTo(lab, { visualizePathStyle: { stroke: "#ffaa00" } });`

**labs/labManager.ts**:
- Line 362: `creep.moveTo(lab);`

**layouts/blueprints/metrics.ts**:
- Line 52: `const path = PathFinder.search(storagePos, { pos: controller.pos, range: 3 });`
- Line 59: `const path = PathFinder.search(storagePos, { pos: source.pos, range: 1 });`

**layouts/roadNetworkPlanner.ts**:
- Line 344: `const pathResult = PathFinder.search(`
- Line 374: `const fullPathResult = PathFinder.search(`
- Line 419: `const pathResult = PathFinder.search(`
- ... and 1 more

**roles/crossShardCarrier.ts**:
- Line 112: `creep.moveTo(new RoomPosition(25, 25, sourceRoom), {`
- Line 172: `creep.moveTo(new RoomPosition(25, 25, portalRoom), {`
- Line 239: `creep.moveTo(new RoomPosition(25, 25, targetRoom), {`

## Estimated CPU Savings

**Assumptions**:
- Uncached PathFinder.search: ~0.5-1.0 CPU per call
- Cached path reuse: ~0.05 CPU per call
- Cache hit rate target: 80%

**Potential savings**: ~9.5 CPU per tick

This assumes all uncached calls are converted to cached patterns with 80% hit rate.

## Next Steps

1. Implement path caching wrappers for high-frequency uncached calls
2. Add role-based path reuse for repetitive movement (harvesters, haulers, upgraders)
3. Monitor pathfinding metrics in unifiedStats
4. Validate CPU savings with before/after measurements
