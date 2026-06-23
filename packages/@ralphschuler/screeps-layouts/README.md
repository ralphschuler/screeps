# @ralphschuler/screeps-layouts

> Automated room layout planning and blueprint system for optimal base construction

**Part of the [Screeps Framework](../../../FRAMEWORK.md)** - Build powerful Screeps bots using modular, tested packages.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
- [Available Blueprints](#available-blueprints)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Configuration](#configuration)
- [Performance](#performance)
- [Blueprint System](#blueprint-system)
- [Road-Aware Defense](#road-aware-defense)
- [Development](#development)
- [License](#license)

## Overview

### What It Does

The layouts package provides a comprehensive system for automated base construction in Screeps. It handles:
- **Blueprint Selection**: Automatically chooses the best base layout for your room's terrain and RCL
- **Intelligent Placement**: Finds optimal anchor positions considering controller, sources, and terrain
- **Road Networks**: Calculates efficient road systems connecting all infrastructure
- **Defense Integration**: Places walls and ramparts without blocking roads
- **Dynamic Adaptation**: Falls back to alternative layouts when terrain is unsuitable

### When to Use This Package

- **Automated Base Building**: Let the bot handle all construction planning
- **Multi-Room Expansion**: Consistent, optimized layouts across all colonies
- **Terrain Adaptation**: Automatic fallback for difficult terrain
- **Remote Mining**: Calculate road networks to remote rooms

### Key Benefits

- **Zero Manual Planning**: Fully automated from RCL 1 to RCL 8
- **Terrain-Aware**: Validates blueprints against terrain and auto-selects best fit
- **Performance Optimized**: Cached calculations, minimal CPU overhead (~0.1 CPU/room/tick)
- **Tested**: Package-level unit tests cover blueprint selection, stamp fallback, roads, labs, and links

## Installation

```bash
npm install @ralphschuler/screeps-layouts
```

## Quick Start

### Basic Usage (< 5 minutes)

```typescript
import { selectBestBlueprint, placeConstructionSites } from '@ralphschuler/screeps-layouts';

// In your room management code
export function manageConstruction(room: Room) {
  const rcl = room.controller?.level || 1;
  
  // Automatically select and place the best blueprint
  const selection = selectBestBlueprint(room, rcl);
  if (selection) {
    const { blueprint, anchor } = selection;
    placeConstructionSites(room, anchor, blueprint); // Places a small prioritized batch
  }
}
```

**Expected Result**: The system will select the most efficient blueprint that fits your room's terrain and place construction sites automatically.

### Complete Integration

```typescript
import {
  selectBestBlueprint,
  placeConstructionSites,
  calculateRoadNetwork,
  placeRoadConstructionSites
} from '@ralphschuler/screeps-layouts';

export function automatedBaseConstruction(room: Room) {
  if (!room.controller?.my) return;
  
  const rcl = room.controller.level;
  
  // 1. Select optimal blueprint
  const selection = selectBestBlueprint(room, rcl);
  if (!selection) {
    console.log(`No suitable blueprint for ${room.name}`);
    return;
  }
  
  const { blueprint, anchor } = selection;
  
  // 2. Place blueprint structures
  const sitesPlaced = placeConstructionSites(room, anchor, blueprint);
  
  // 3. Calculate and place road network
  const roadNetwork = calculateRoadNetwork(room, anchor);
  const roadsPlaced = placeRoadConstructionSites(room, anchor, 3);
  
  console.log(`${room.name}: Planned ${roadNetwork.positions.size} road tiles, placed ${sitesPlaced} structures, ${roadsPlaced} roads`);
}
```

## Features

### Feature 1: Pre-Defined Optimized Blueprints

Five battle-tested blueprints covering all RCL stages:

**Benefits:**
- No manual layout planning required
- Proven efficient designs from production use
- Comprehensive RCL 1-8 coverage

**Example:**
```typescript
import { COMPACT_BUNKER_BLUEPRINT, WAR_READY_BLUEPRINT } from '@ralphschuler/screeps-layouts';

// Access blueprint details
console.log(COMPACT_BUNKER_BLUEPRINT.name); // "Compact Bunker"
console.log(COMPACT_BUNKER_BLUEPRINT.rcl);  // 8
console.log(COMPACT_BUNKER_BLUEPRINT.structures.filter(s => s.structureType === STRUCTURE_SPAWN).length); // 3 spawns
```

### Feature 2: Dynamic Terrain Adaptation

Automatically validates blueprints and falls back to alternatives:

**Benefits:**
- Works on any terrain (even difficult rooms)
- Automatic fallback chain
- No manual intervention needed

**Example:**
```typescript
import { selectBestBlueprint } from '@ralphschuler/screeps-layouts';

// Tries compact bunker first, falls back if terrain unsuitable
const selection = selectBestBlueprint(room, 8);
// Fallback chain: Compact Bunker → War Ready → Economic Maturity → Core Colony
```

### Feature 3: Stamp fallback and road-aware cleanup

Preferred stamps are not all-or-nothing. Failed members become explicit unplaced demand, then the fallback resolver places missing structures on valid terrain and adds road/rampart support when needed.

**Benefits:**
- RCL structure targets are not silently underbuilt when terrain blocks a stamp
- Existing structures and construction sites count toward demand
- Critical fallback structures receive rampart overlays and road access

**Example:**
```typescript
import { createBlueprintFactsFromRoom, planRoomBlueprint } from '@ralphschuler/screeps-layouts';

const facts = createBlueprintFactsFromRoom(room);
const plan = planRoomBlueprint(facts, room.controller?.level ?? 1);
console.log(plan.errors, plan.unplaced);
```

### Feature 4: Intelligent Placement Algorithm

Finds optimal anchor positions considering multiple factors:

**Benefits:**
- Balanced distances to controller, sources, mineral
- Avoids room edges (prevents border issues)
- Maximizes buildable terrain

**Example:**
```typescript
import { findBestBlueprintAnchor } from '@ralphschuler/screeps-layouts';

const anchor = findBestBlueprintAnchor(room, COMPACT_BUNKER_BLUEPRINT);
if (anchor) {
  console.log(`Best anchor: ${anchor.x},${anchor.y}`);
}
```

### Feature 5: Blueprint Efficiency Metrics

Evaluate and compare blueprint performance:

**Benefits:**
- Quantify layout quality
- A/B test different configurations
- Data-driven blueprint selection

**Example:**
```typescript
import { calculateBlueprintEfficiency } from '@ralphschuler/screeps-layouts';

const metrics = calculateBlueprintEfficiency(room, anchor, blueprint);
console.log(`Overall efficiency: ${metrics.overallScore}/100`);
console.log(`Tower coverage: ${metrics.towerCoverage}%`);
console.log(`Defense score: ${metrics.defenseScore}/100`);
```

## Available Blueprints

### EARLY_COLONY_BLUEPRINT (RCL 1-2)
**"Seed Nest"** - Minimal infrastructure for bootstrap phase

- 1 spawn, basic extensions
- Container-based mining
- Compact design (minimal roads needed)
- Works on any terrain

### CORE_COLONY_BLUEPRINT (RCL 3-4)
**"Core Nest"** - Transition to storage economy

- 1 spawn, tower, storage
- Extended extension cluster
- Basic defense perimeter
- Moderate terrain tolerance (≤25% walls)

### ECONOMIC_MATURITY_BLUEPRINT (RCL 5-6)
**"Mature Colony"** - Full infrastructure with labs

- 2 spawns, 3 towers, links
- Terminal and labs
- Comprehensive road network
- Moderate terrain tolerance (≤25% walls)

### WAR_READY_BLUEPRINT (RCL 7-8)
**"Fortified Hive"** - Heavy defenses and nuker

- 3 spawns, 6 towers
- Full rampart coverage
- Nuker and observer
- Moderate terrain tolerance (≤25% walls)

### COMPACT_BUNKER_BLUEPRINT (RCL 8)
**"Ultra-Efficient Bunker"** - 11x11 compact design

- All structures in 11x11 grid
- Optimized lab cluster (2 input, 8 output)
- Maximum rampart protection
- Requires good terrain (≤10% walls)
- **Most efficient** but terrain-demanding

## API Reference

### Blueprint Selection

#### `selectBestBlueprint(room: Room, rcl: number): { blueprint: Blueprint, anchor: RoomPosition } | null`

Automatically selects the best blueprint for the room's terrain and RCL.

**Parameters:**
- `room`: The room to plan for
- `rcl`: Target RCL level (1-8)

**Returns:** Blueprint and anchor position, or `null` if no suitable blueprint

**Example:**
```typescript
const selection = selectBestBlueprint(room, 8);
if (selection) {
  console.log(`Using ${selection.blueprint.name} at ${selection.anchor}`);
}
```

#### `validateBlueprintFit(room: Room, anchor: RoomPosition, blueprint: Blueprint): ValidationResult`

Checks if a blueprint can fit at the given position.

**Parameters:**
- `room`: Room to validate in
- `anchor`: Proposed anchor position
- `blueprint`: Blueprint to validate

**Returns:** `{ fits: boolean, reason?: string, wallCount?: number, totalTiles?: number }`

**Example:**
```typescript
const validation = validateBlueprintFit(room, new RoomPosition(25, 25, room.name), COMPACT_BUNKER_BLUEPRINT);
if (!validation.fits) {
  console.log(`Blueprint won't fit: ${validation.reason}`);
}
```

### Construction

#### `placeConstructionSites(room: Room, anchor: RoomPosition, blueprint: Blueprint): number`

Places construction sites from a blueprint.

**Parameters:**
- `room`: Room to build in
- `anchor`: Anchor position for blueprint
- `blueprint`: Blueprint to build

**Returns:** Number of sites placed

**Example:**
```typescript
const count = placeConstructionSites(room, anchor, blueprint);
console.log(`Placed ${count} construction sites`);
```

### Road Networks

Road planning is split into small internal modules:
- `infrastructure`: hub-to-source/controller/mineral roads
- `exitRoads`: permanent hub-to-exit roads and live near-exit fallback protection
- `remoteRoads`: remote-mining path protection grouped by room
- `validRoads`: blueprint cleanup allow-list assembly
- `construction`: rate-limited local road construction-site placement

#### `calculateRoadNetwork(room: Room, anchor: RoomPosition): RoomRoadNetwork`

Calculates local infrastructure road positions for sources, controller, and RCL6+ mineral.

**Parameters:**
- `room`: Room to calculate for
- `anchor`: Base anchor position used before storage exists

**Returns:** `RoomRoadNetwork` with compact `"x,y"` position keys.

**Example:**
```typescript
const network = calculateRoadNetwork(room, anchor);
console.log(`Road network: ${network.positions.size} tiles`);
```

#### `placeRoadConstructionSites(room: Room, anchor: RoomPosition, maxSites?: number): number`

Places a limited batch of local infrastructure road construction sites. Remote-road maps are not passed here; they are used for road protection/validation.

**Example:**
```typescript
const placed = placeRoadConstructionSites(room, anchor, 3);
```

#### `calculateRemoteRoads(homeRoom: Room, remoteRooms: string[]): Map<string, Set<string>>`

Calculates protected road positions to remote-mining rooms and groups them by room name. Directly adjacent remotes get an extra explicit exit-approach path; distance-2+ remotes still get full PathFinder route protection.

**Parameters:**
- `homeRoom`: Your main room
- `remoteRooms`: Names of assigned remote rooms

**Returns:** `Map<roomName, Set<"x,y">>` for cleanup protection or caller-specific construction logic.

**Example:**
```typescript
const remoteRoads = calculateRemoteRoads(room, ['W1N2', 'W2N1']);
const homeRoomRemoteRoads = remoteRoads.get(room.name) ?? new Set<string>();
```

### Anchor Finding

#### `findBestBlueprintAnchor(room: Room, blueprint: Blueprint): RoomPosition | null`

Finds the optimal position to place a blueprint.

**Parameters:**
- `room`: Room to search
- `blueprint`: Blueprint to place

**Returns:** Best anchor position or `null`

**Scoring Criteria:**
- Distance to controller (prefer 3-6 range)
- Distance to sources (prefer 4-8 average)
- Distance to mineral (prefer 5-10 range)
- Buildable terrain percentage
- Distance from room exits (prefer 10+ tiles)

**Example:**
```typescript
const anchor = findBestBlueprintAnchor(room, COMPACT_BUNKER_BLUEPRINT);
```

### Metrics

#### `calculateBlueprintEfficiency(room: Room, anchor: RoomPosition, blueprint: Blueprint): EfficiencyMetrics`

Evaluates blueprint performance with quantitative metrics.

**Returns:**
```typescript
{
  avgPathLength: number,      // 0-100 (lower is better)
  towerCoverage: number,       // 0-100 (higher is better)
  defenseScore: number,        // 0-100 (higher is better)
  energyEfficiency: number,    // 0-100 (higher is better)
  overallScore: number,        // 0-100 weighted average
  details: {
    pathLengthToController: number,
    pathLengthToSources: number[],
    towerCount: number,
    rampartCount: number,
    linkCount: number
  }
}
```

### Import/Export

#### `exportBlueprint(blueprint: Blueprint): string`

Exports blueprint to JSON for sharing.

**Example:**
```typescript
const json = exportBlueprint(COMPACT_BUNKER_BLUEPRINT);
console.log(json); // Pretty-printed JSON
```

#### `importBlueprint(json: string): Blueprint | null`

Imports and validates a blueprint from JSON.

**Example:**
```typescript
const imported = importBlueprint(jsonString);
if (imported) {
  console.log(`Imported: ${imported.name}`);
}
```

## Usage Examples

### Example 1: Fully Automated Construction

**Scenario:** Let the bot handle all construction planning automatically

**Code:**
```typescript
import { selectBestBlueprint, placeConstructionSites } from '@ralphschuler/screeps-layouts';

export function autoConstruct(room: Room) {
  if (!room.controller?.my) return;
  
  // Don't build if already at construction limit
  const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
  if (sites.length >= 5) return;
  
  const rcl = room.controller.level;
  const selection = selectBestBlueprint(room, rcl);
  
  if (selection) {
    placeConstructionSites(room, selection.anchor, selection.blueprint);
  }
}
```

**Explanation:**
1. Check if we own the room and have construction capacity
2. Select best blueprint for current RCL
3. Place up to 5 total construction sites
4. System handles terrain validation, fallbacks, and prioritization automatically

### Example 2: Remote Mining Road Network

**Scenario:** Protect roads that connect a room to assigned remotes.

**Code:**
```typescript
import { calculateRemoteRoads, getValidRoadPositions, placeRoadConstructionSites } from '@ralphschuler/screeps-layouts';

export function protectRemoteRoads(homeRoom: Room) {
  const remoteRooms = Memory.rooms[homeRoom.name]?.remotes || [];
  const anchor = Memory.rooms[homeRoom.name]?.anchor;
  if (!anchor) return;

  const anchorPos = new RoomPosition(anchor.x, anchor.y, homeRoom.name);

  // Calculate remote-road protection grouped by room for visuals or custom build logic.
  const roadsByRoom = calculateRemoteRoads(homeRoom, remoteRooms);
  const homeRoomRemoteRoads = roadsByRoom.get(homeRoom.name) ?? new Set<string>();

  // Use the public validator to include blueprint roads, local infrastructure roads,
  // permanent exit roads, remote roads, and live near-exit fallback protection.
  const protectedRoads = getValidRoadPositions(homeRoom, anchorPos, [], remoteRooms);

  // Local infrastructure roads can still be placed incrementally.
  const placed = placeRoadConstructionSites(homeRoom, anchorPos, 3);
  console.log(
    `${homeRoom.name}: ${homeRoomRemoteRoads.size} home-room remote road tiles, ${protectedRoads.size} protected road tiles, ${placed} local road sites placed`
  );
}
```

**Explanation:**
1. Retrieve remote mining room list from memory
2. Calculate remote road positions grouped by room
3. Build a cleanup-safe road allow-list with `getValidRoadPositions`
4. Place local road construction sites incrementally

### Example 3: Blueprint Comparison

**Scenario:** Compare two blueprints and choose the better one

**Code:**
```typescript
import {
  COMPACT_BUNKER_BLUEPRINT,
  WAR_READY_BLUEPRINT,
  compareBlueprintEfficiency,
  findBestBlueprintAnchor
} from '@ralphschuler/screeps-layouts';

export function chooseBestLayout(room: Room) {
  // Find best anchors for each blueprint
  const bunkerAnchor = findBestBlueprintAnchor(room, COMPACT_BUNKER_BLUEPRINT);
  const warAnchor = findBestBlueprintAnchor(room, WAR_READY_BLUEPRINT);
  
  if (!bunkerAnchor || !warAnchor) {
    console.log('Could not find suitable anchors');
    return null;
  }
  
  // Compare efficiency
  const result = compareBlueprintEfficiency(
    room,
    { blueprint: COMPACT_BUNKER_BLUEPRINT, anchor: bunkerAnchor },
    { blueprint: WAR_READY_BLUEPRINT, anchor: warAnchor }
  );
  
  console.log(`Winner: ${result.blueprint.name}`);
  console.log(`Score: ${result.metrics.overallScore}/100`);
  console.log(`Path efficiency: ${result.metrics.avgPathLength}`);
  console.log(`Tower coverage: ${result.metrics.towerCoverage}%`);
  
  return result;
}
```

**Explanation:**
1. Find optimal anchor for each blueprint candidate
2. Use comparison function to A/B test layouts
3. Returns the blueprint with highest efficiency score
4. Detailed metrics help understand trade-offs

## Configuration

### Blueprint Types

Blueprints have two types that determine terrain tolerance:

```typescript
interface Blueprint {
  name: string;
  rcl: number;
  type: 'bunker' | 'spread';  // Bunker = compact, Spread = flexible
  // ... structures, roads, ramparts
}
```

- **Bunker blueprints**: Require ≤10% walls in blueprint area
- **Spread blueprints**: Tolerate ≤25% walls in blueprint area

### Terrain Validation Thresholds

Default thresholds can be customized:

```typescript
// In blueprints/validator.ts
const BUNKER_MAX_WALL_PERCENT = 0.10;  // 10%
const SPREAD_MAX_WALL_PERCENT = 0.25;  // 25%
```

### Road Network Caching

Roads are cached to reduce CPU:

```typescript
// Recalculate road network every 1000 ticks
const ROAD_CACHE_TTL = 1000;
```

## Performance

### CPU Usage

**Typical CPU Cost:**
- Blueprint selection: ~0.05 CPU (cached after first run)
- Construction site placement: ~0.03 CPU per structure
- Road network calculation: ~0.10 CPU (cached for 1000 ticks)
- Total (average): ~0.1 CPU per room per tick

### Memory Usage

**Memory Footprint:**
- Per-room blueprint cache: ~2 KB
- Road network cache: ~5 KB
- Total (per room): ~7 KB

### Optimization Tips

1. **Cache Anchor Positions**
   ```typescript
   // Store anchor in room memory
   if (!Memory.rooms[room.name].anchor) {
     const selection = selectBestBlueprint(room, rcl);
     Memory.rooms[room.name].anchor = { x: selection.anchor.x, y: selection.anchor.y };
   }
   ```

2. **Limit Construction Sites**
   ```typescript
   // Only place sites when below limit
   const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
   if (sites.length < 5) {
     placeConstructionSites(room, anchor, blueprint);
   }
   ```

3. **Throttle Road Placement**
   ```typescript
   // Place roads every 10 ticks instead of every tick
   if (Game.time % 10 === 0) {
     placeRoadConstructionSites(room, anchor, 3);
   }
   ```

## Blueprint System

### Selection Algorithm

The system uses an intelligent fallback chain:

```
RCL 8: Compact Bunker → War Ready → Economic Maturity → Core Colony → Early Colony
RCL 7: War Ready → Economic Maturity → Core Colony → Early Colony
RCL 5-6: Economic Maturity → Core Colony → Early Colony
RCL 3-4: Core Colony → Early Colony
RCL 1-2: Early Colony
```

Each blueprint is validated against terrain before selection. If validation fails, the next blueprint in the chain is tried.

### Lab Cluster Design

The Compact Bunker includes an optimized 10-lab cluster:

```
  I1  I2       <- Input labs (receive minerals)
O1 O2 O3 O4   <- Output labs row 1
O5 O6 O7 O8   <- Output labs row 2
```

All output labs are within range 2 of both input labs, allowing any reaction.

### Construction Priority

Structures are placed in this order:
1. Critical structures (spawn, storage, terminal)
2. Towers (for defense)
3. Extensions (for economy)
4. Labs (for chemistry)
5. Roads (for efficiency)
6. Ramparts and walls (for defense)

## Road-aware fallback and ramparts

The planner keeps ramparts as an overlay instead of a primary structure layer. Critical structures from hub, lab, defense, and fallback placement receive rampart overlays while roads remain separate.

Construction cleanup uses valid road-position helpers to avoid classifying source/controller/mineral/remote roads as misplaced structures:

```typescript
import { findMisplacedStructures, getValidRoadPositions } from '@ralphschuler/screeps-layouts';

const remotes = Memory.rooms[room.name]?.remotes ?? [];
const validRoads = getValidRoadPositions(room, anchor, blueprint.roads, remotes);
const misplaced = findMisplacedStructures(room, anchor, blueprint, remotes);
console.log(`${validRoads.size} protected roads, ${misplaced.length} misplaced structures`);
```

## Development

### Building from Source

```bash
# Clone repository
git clone https://github.com/ralphschuler/screeps.git
cd screeps

# Install dependencies
npm install

# Build this package
npm run build:layouts

# Build all packages
npm run build:all
```

### Project Structure

```
packages/@ralphschuler/screeps-layouts/
├── src/
│   ├── index.ts                     # Main exports
│   ├── types.ts                     # TypeScript types
│   ├── layoutPlanner.ts             # Anchor position finding
│   ├── roadNetworkPlanner.ts        # Road calculation
│   ├── extensionGenerator.ts        # Extension patterns
│   ├── blueprints/
│   │   ├── index.ts                # Blueprint exports
│   │   ├── selector.ts             # Selection algorithm
│   │   ├── validator.ts            # Terrain validation
│   │   ├── placer.ts               # Construction placement
│   │   ├── metrics.ts              # Efficiency calculation
│   │   ├── serializer.ts           # Import/export
│   │   ├── definitions/
│   │   │   ├── early-colony.ts    # RCL 1-2 blueprint
│   │   │   ├── core-colony.ts     # RCL 3-4 blueprint
│   │   │   ├── economic-maturity.ts # RCL 5-6 blueprint
│   │   │   ├── war-ready.ts       # RCL 7-8 blueprint
│   │   │   └── compact-bunker.ts  # RCL 8 optimal blueprint
│   │   ├── types.ts                # Blueprint types
│   │   └── constants.ts            # Blueprint constants
│   └── README.md                    # Internal documentation
├── test/                            # Tests
├── package.json
├── tsconfig.json
└── README.md                        # This file
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## License

[Unlicense](../../LICENSE) - This is free and unencumbered software released into the public domain.

## Related Packages

### Framework Core
- [@ralphschuler/screeps-kernel](../screeps-kernel) - Process scheduler with CPU management

### Economy & Resources
- [@ralphschuler/screeps-economy](../../screeps-economy) - Resource management and trading
- [@ralphschuler/screeps-spawn](../../screeps-spawn) - Spawning and body optimization

### Combat & Defense
- [@ralphschuler/screeps-defense](../../screeps-defense) - Tower automation and threat assessment

### Remote Operations
- [@ralphschuler/screeps-remote-mining](../screeps-remote-mining) - Remote harvesting coordination

### See Also
- [Framework Documentation](../../FRAMEWORK.md)
- [All Framework Packages](../../FRAMEWORK.md#core-packages)
- [ROADMAP Section 9: Base-Blueprints](../../ROADMAP.md)

---

**Questions?** Check the [Framework Documentation](../../FRAMEWORK.md) or open an [issue](https://github.com/ralphschuler/screeps/issues).
