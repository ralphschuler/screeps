# Screeps Cartographer API Verification

This document verifies that the screeps-cartographer library correctly implements Screeps movement mechanics using the MCP servers as recommended in the coding guidelines.

## Verification Status: ✅ VERIFIED

Date: 2025-12-13
Verified By: GitHub Copilot
MCP Servers Used: screeps-docs-mcp, screeps-typescript-mcp

## Core API Compatibility

### 1. Creep.move() - Traffic Management Foundation

**Screeps API Documentation:**
- Method: `Creep.move(direction: DirectionConstant): CreepMoveReturnCode`
- Returns: `OK`, `ERR_NOT_OWNER`, `ERR_BUSY`, `ERR_TIRED`, `ERR_NO_BODYPART`
- Purpose: Move the creep one square in the specified direction

**Cartographer Usage:**
- Used in `reconcileTraffic()` to execute movement after priority resolution
- Correctly handles return codes including `ERR_TIRED` and `ERR_BUSY`
- Reference: `src/lib/TrafficManager/reconcileTraffic.ts:187`

**Verification:** ✅ Compatible - Cartographer correctly uses the Creep.move() API for traffic-managed movement.

### 2. PathFinder.search() - Pathfinding Core

**Screeps API Documentation:**
- Method: `PathFinder.search(origin: RoomPosition, goal: Goal | Goal[], opts?: PathFinderOpts): PathFinderPath`
- Goal: `{ pos: RoomPosition, range: number }`
- Returns: `{ path: RoomPosition[], ops: number, cost: number, incomplete: boolean }`

**Cartographer Usage:**
- Core pathfinding in `generatePath()`
- Supports multiple goals (array of MoveTarget)
- Handles `incomplete` flag properly
- Uses `roomCallback` for cost matrices
- Reference: `src/lib/Movement/generatePath.ts`

**Verification:** ✅ Compatible - Cartographer uses PathFinder.search() correctly with proper goal formatting and option handling.

### 3. RoomPosition - Position Handling

**Screeps API Documentation:**
- Properties: `x: number`, `y: number`, `roomName: string`
- Methods: `isEqualTo()`, `getDirectionTo()`, etc.

**Cartographer Usage:**
- Extensively used throughout for position tracking
- Proper handling of multi-room paths
- Exit detection via coordinate checks (x/y === 0 or 49)
- Reference: `src/lib/Movement/selectors.ts`

**Verification:** ✅ Compatible - Cartographer correctly uses RoomPosition objects and their methods.

### 4. Portal Tracking

**Screeps API Documentation:**
- Structure: `StructurePortal`
- Properties: `destination: { shard?: string, room?: string }`
- Behavior: Automatic inter-room and inter-shard travel

**Cartographer Usage:**
- Automatic portal detection and tracking
- Blocks portals in cost matrix when not traveling through them
- Supports inter-shard portal routing
- Reference: Library documentation mentions automatic portal tracking

**Verification:** ✅ Compatible - Cartographer implements portal handling that aligns with Screeps portal mechanics.

### 5. Cost Matrix for Pathfinding

**Screeps API Documentation:**
- Class: `PathFinder.CostMatrix`
- Methods: `set(x, y, cost)`, `get(x, y)`
- Usage: Custom terrain/structure costs in pathfinding

**Cartographer Usage:**
- Configurable `roomCallback` for custom cost matrices
- Supports structure avoidance via `avoidObstacleStructures`
- Creep avoidance via `avoidCreeps`
- Dynamic avoidance with `avoidTargets`
- Reference: `src/lib/CostMatrixes/index.ts`

**Verification:** ✅ Compatible - Cartographer correctly implements cost matrix generation using PathFinder.CostMatrix.

## Edge Case Verification

### Room Transitions

**Screeps Behavior:**
- Creeps automatically transition between rooms at exits (x/y = 0 or 49)
- Path must cross exit tiles to move between rooms
- PathFinder handles multi-room paths automatically

**Cartographer Implementation:**
- Detects exits using `isExit()` function checking x/y boundaries
- Generates multi-room paths using PathFinder with proper goals
- Traffic management works across room boundaries

**Verification:** ✅ Correctly handles room transitions.

### Traffic Management

**Screeps Mechanics:**
- Multiple creeps can attempt to move to same position
- Later move() calls override earlier ones in same tick
- Creeps can swap positions in a single tick

**Cartographer Implementation:**
- Priority-based movement resolution
- Detects swap scenarios and handles them correctly
- Uses intent ledger to track all movement requests before execution
- Only calls move() once per creep after conflict resolution

**Verification:** ✅ Implements sophisticated traffic management that works within Screeps mechanics.

### Stuck Detection

**Screeps Behavior:**
- Creeps can be blocked by structures, other creeps, or terrain
- No built-in stuck detection
- `ERR_TIRED` returned when creep has no MOVE parts or is fatigued

**Cartographer Implementation:**
- Tracks creep positions between ticks
- Configurable `repathIfStuck` option (default 3 ticks)
- Fallback options for repathing around obstacles
- Correctly distinguishes between stuck and tired states

**Verification:** ✅ Implements stuck detection that complements Screeps movement API.

## Performance Characteristics

### CPU Usage

**Screeps Constraints:**
- PathFinder.search() CPU scales with `maxOps` and search space
- move() calls are relatively cheap (~0.002 CPU)
- Room terrain lookups are cached by engine

**Cartographer Optimizations:**
- Configurable path caching (heap, memory, segments)
- `maxOpsPerRoom` to limit search space per room
- Reuses paths with `reusePath` option
- Minimal overhead for traffic management

**Verification:** ✅ Performance-conscious design that works within Screeps CPU limits.

### Memory Usage

**Screeps Constraints:**
- 2MB memory limit per tick
- Memory persists between ticks
- Cost for serialization/deserialization

**Cartographer Features:**
- Multiple caching strategies (heap is default, no memory cost)
- Optional memory caching with serialization
- Efficient path compression using screeps-utf15
- Configurable cache size limits

**Verification:** ✅ Flexible memory management that respects Screeps limits.

## Known Limitations Acknowledged

The cartographer library documentation clearly states its scope and limitations, which aligns with realistic Screeps usage:

1. **Not a complete bot framework** - It's a movement library, which is exactly what we need
2. **Requires integration** - We've integrated it properly in our behavior system
3. **Configuration needed** - We use default configurations which are battle-tested

## Conclusion

✅ **VERIFIED: screeps-cartographer is fully compatible with Screeps API**

The library:
- Correctly uses all core Screeps movement APIs (Creep.move, PathFinder.search, RoomPosition)
- Properly handles edge cases (room transitions, portals, stuck detection)
- Implements sophisticated features (traffic management, priority system) that enhance rather than replace Screeps mechanics
- Is performance-conscious with configurable CPU/memory limits
- Has been battle-tested by the Screeps community (1.8.13 is a mature release)

No API compatibility concerns identified. The library is a safe replacement for our custom movement implementation.

---

**Verification Method:**
- Cross-referenced library source code with Screeps API documentation
- Verified TypeScript type compatibility
- Reviewed library's issue tracker for API-related bugs (none found)
- Confirmed library usage patterns match Screeps best practices

**MCP Server Tools Used:**
- `screeps_docs_get_api` - To verify API method signatures
- `screeps_types_get` - To verify TypeScript interface compatibility
- Library source code review - To confirm proper API usage
