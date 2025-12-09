# Base Layouts and Blueprints System

This directory contains the comprehensive base layout and blueprint system for automated base construction.

## Architecture

The system follows the ROADMAP Section 9 (Base-Blueprints) requirements and implements:

1. **Pre-defined Blueprints** - Optimized layouts for different RCL stages
2. **Dynamic Terrain Adaptation** - Automatic fallback when terrain doesn't support compact layouts
3. **Road-Aware Defense** - Perimeter walls that don't block critical roads
4. **Intelligent Placement** - Validates terrain and selects best anchor positions

## Key Files

### blueprints.ts
Main blueprint definitions and placement logic.

**Blueprints Available:**
- `EARLY_COLONY_BLUEPRINT` (RCL 1-2): Seed Nest with basic extensions
- `CORE_COLONY_BLUEPRINT` (RCL 3-4): Core Nest with tower and storage
- `ECONOMIC_MATURITY_BLUEPRINT` (RCL 5-6): Mature Colony with labs and terminal
- `WAR_READY_BLUEPRINT` (RCL 7-8): Fortified Hive with full defenses
- `COMPACT_BUNKER_BLUEPRINT` (RCL 8): Ultra-efficient 11x11 bunker design

**Key Functions:**
- `selectBestBlueprint(room, rcl)` - Automatically selects best blueprint for terrain
- `validateBlueprintFit(room, anchor, blueprint)` - Checks if blueprint fits terrain
- `findBestBlueprintAnchor(room, blueprint)` - Finds optimal placement position
- `placeConstructionSites(room, anchor, blueprint)` - Places structures from blueprint
- `destroyMisplacedStructures(room, anchor, blueprint)` - Removes structures that don't match

### extensionGenerator.ts
Generates extension positions in checkerboard pattern to ensure no two extensions are adjacent.

**Key Features:**
- Ensures creeps can always move between extensions
- Generates up to 80+ positions (provides flexibility when some positions blocked by terrain)
- Validates positions using `isCheckerboardPosition(x, y)`

### layoutPlanner.ts
Analyzes room terrain and finds optimal anchor positions for base layouts.

**Key Functions:**
- `findOptimalAnchor(room)` - Scores potential anchor positions
- `hasEnoughSpace(pos, radius)` - Validates buildable space
- `getCachedTerrain(roomName)` - Performance-optimized terrain caching

**Scoring Criteria:**
- Distance to controller (prefer 3-6 range)
- Distance to sources (prefer 4-8 average range)
- Distance to mineral (prefer 5-10 range)
- Open terrain percentage
- Distance from room exits (prefer 10+ tiles)

### roadNetworkPlanner.ts
Calculates optimal road positions for base infrastructure and remote mining.

**Key Features:**
- Roads to all sources from storage/spawn
- Roads to controller from storage/spawn
- Roads to mineral (RCL 6+)
- Multi-room roads for remote mining
- Cached road networks (recalculated every 1000 ticks)

**Key Functions:**
- `calculateRoadNetwork(room, anchor)` - Computes all infrastructure roads
- `calculateRemoteRoads(homeRoom, remoteRooms)` - Computes remote mining roads
- `getValidRoadPositions(room, anchor, blueprintRoads, remoteRooms)` - All valid road positions
- `placeRoadConstructionSites(room, anchor, maxSites)` - Places road construction sites

## Dynamic Blueprint Selection

The system implements intelligent blueprint selection with automatic fallback:

```typescript
// Try compact bunker first (most efficient)
const selection = selectBestBlueprint(room, rcl);
// Returns: { blueprint, anchor }

// Fallback chain:
// RCL 8: Compact Bunker → War Ready → Economic Maturity → Core Colony → Early Colony
// RCL 7: War Ready → Economic Maturity → Core Colony → Early Colony
// RCL 5-6: Economic Maturity → Core Colony → Early Colony
// RCL 3-4: Core Colony → Early Colony
// RCL 1-2: Early Colony → findBestSpawnPosition()
```

### Blueprint Types

**Bunker Blueprints** (type: "bunker")
- Ultra-compact 11x11 grid design
- All critical structures within rampart range
- Requires minimal terrain (≤10% walls)
- Optimal for most rooms

**Spread Blueprints** (type: "spread")
- More flexible layout
- Structures spread over larger area
- Tolerates more terrain obstacles (≤25% walls)
- Fallback for difficult terrain

## Road-Aware Defense System

Located in `../defense/roadAwareDefense.ts`, this system ensures perimeter defenses don't block roads.

### How It Works

1. **Calculate Roads First**: Computes complete road network (sources, controller, mineral, remotes)
2. **Identify Crossings**: Finds where roads intersect perimeter defense line
3. **Use Ramparts at Crossings**: Places ramparts (not walls) where roads cross perimeter
4. **Remove Blocking Walls**: Destroys existing walls that block roads

### Benefits

- Friendly creeps can always reach sources and controller
- Remote miners have clear paths to exits
- Defenses remain strong (ramparts block enemies but allow friendly passage)
- Automatic adaptation as road network expands

### Integration

```typescript
// In roomNode.ts construction loop:
const result = placeRoadAwarePerimeterDefense(
  room,
  anchor,
  blueprint.roads,
  rcl,
  maxSites,
  remoteRooms
);
// Returns: { sitesPlaced, wallsRemoved }
```

## Blueprint Validation

Each blueprint can be validated against room terrain:

```typescript
const validation = validateBlueprintFit(room, anchor, blueprint);
// Returns: { 
//   fits: boolean, 
//   reason?: string,
//   wallCount?: number,
//   totalTiles?: number
// }
```

**Validation Rules:**
- Anchor must be within room bounds (considering minSpaceRadius)
- All structures must be within room bounds
- Bunker blueprints: ≤10% walls in blueprint area
- Spread blueprints: ≤25% walls in blueprint area

## Lab Cluster Design

The COMPACT_BUNKER_BLUEPRINT includes an optimized lab cluster:

**Layout:**
- 2 input labs at the top (receive minerals)
- 8 output labs in formation (all within range 2 of inputs)
- Tight clustering for maximum reaction efficiency
- Protected by ramparts

**Reaction Range:**
Labs must be within range 2 of each other to run reactions:
```
  I1 I2           <- Input labs
 O1 O2 O3 O4     <- Output labs (row 1)
O5 O6 O7 O8     <- Output labs (row 2)
```

All output labs are within range 2 of both input labs, allowing any reaction.

## Construction Priority

The construction system (in `roomNode.ts`) follows this priority:

1. **Remove Blocking Walls** - Walls that block roads (RCL 3+)
2. **Place Walls** - Perimeter walls at non-road positions (RCL 2+)
3. **Place Ramparts** - At gaps and road crossings (RCL 3+)
4. **Place Blueprint Structures** - Spawns, extensions, towers, etc.
5. **Place Roads** - Infrastructure roads (sources, controller, mineral)

## Performance Considerations

- **Terrain Caching**: Terrain data is cached per room (2,500 lookups saved per check)
- **Road Network Caching**: Road networks recalculated every 1,000 ticks only
- **Structure Caching**: Per-tick structure cache avoids repeated `room.find()` calls
- **Lazy Blueprint Selection**: Blueprint only re-evaluated when RCL changes

## ROADMAP Compliance

This system implements ROADMAP Section 9 requirements:

✅ **Early Nest (RCL 1-2)**: EARLY_COLONY_BLUEPRINT with container mining setup
✅ **Core Nest (RCL 3-4)**: CORE_COLONY_BLUEPRINT with tower and storage
✅ **Fortified Nest (RCL 5-8)**: ECONOMIC_MATURITY_BLUEPRINT, WAR_READY_BLUEPRINT, and COMPACT_BUNKER_BLUEPRINT
✅ **Comprehensive Blueprints**: All RCL stages covered with detailed layouts
✅ **Rampart/Wall Automation**: Road-aware defense system with automatic placement
✅ **Lab Clusters**: Optimized 10-lab cluster in COMPACT_BUNKER_BLUEPRINT
✅ **Construction Integration**: Fully integrated with roomNode construction system

## Future Enhancements

Potential improvements (not currently required):

- **Multi-Bunker Layouts**: Support for multiple separate bunkers in large rooms
- **Specialized Blueprints**: Military bunker, economy bunker, hybrid layouts
- **Visual Planner**: In-game RoomVisual display of planned vs. built structures
- **Blueprint Scoring**: Score different layouts and pick best for specific strategies
- **Auto-Rampart Patterns**: Automatic rampart patterns around structures based on danger level
