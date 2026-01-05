# @ralphschuler/screeps-layouts

> Automated room layout planning and blueprint system for optimal base construction

**Part of the [Screeps Framework](../../FRAMEWORK.md)** - Build powerful Screeps bots using modular, tested packages.

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
- **Battle-Tested**: Proven layouts from production bot with 50+ rooms

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
    placeConstructionSites(room, anchor, blueprint, 5); // Place up to 5 sites
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
  const sitesPlaced = placeConstructionSites(room, anchor, blueprint, 5);
  
  // 3. Calculate and place road network
  const roadNetwork = calculateRoadNetwork(room, anchor);
  const roadsPlaced = placeRoadConstructionSites(room, anchor, roadNetwork, 3);
  
  console.log(`${room.name}: Placed ${sitesPlaced} structures, ${roadsPlaced} roads`);
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
console.log(COMPACT_BUNKER_BLUEPRINT.structures.spawn.length); // 3 spawns
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

### Feature 3: Road-Aware Defense System

Walls and ramparts that don't block your infrastructure:

**Benefits:**
- Creeps can always reach sources and controller
- Ramparts at road crossings allow friendly passage
- Automatic wall removal if blocking roads

**Example:**
```typescript
import { placeRoadAwarePerimeterDefense } from '@ralphschuler/screeps-layouts';

const result = placeRoadAwarePerimeterDefense(
  room,
  anchor,
  blueprint.roads,
  rcl,
  5, // max sites
  ['W1N2'] // remote rooms
);
console.log(`Placed ${result.sitesPlaced} defenses, removed ${result.wallsRemoved} blocking walls`);
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

#### `placeConstructionSites(room: Room, anchor: RoomPosition, blueprint: Blueprint, maxSites: number): number`

Places construction sites from a blueprint.

**Parameters:**
- `room`: Room to build in
- `anchor`: Anchor position for blueprint
- `blueprint`: Blueprint to build
- `maxSites`: Maximum construction sites to place

**Returns:** Number of sites placed

**Example:**
```typescript
const count = placeConstructionSites(room, anchor, blueprint, 5);
console.log(`Placed ${count} construction sites`);
```

### Road Networks

#### `calculateRoadNetwork(room: Room, anchor: RoomPosition): RoomPosition[]`

Calculates optimal road positions connecting infrastructure.

**Parameters:**
- `room`: Room to calculate for
- `anchor`: Base anchor position

**Returns:** Array of road positions

**Example:**
```typescript
const roads = calculateRoadNetwork(room, anchor);
console.log(`Road network: ${roads.length} tiles`);
```

#### `calculateRemoteRoads(homeRoom: Room, remoteRooms: string[]): RoomPosition[]`

Calculates roads to remote mining rooms.

**Parameters:**
- `homeRoom`: Your main room
- `remoteRooms`: Names of remote rooms

**Returns:** Array of road positions spanning multiple rooms

**Example:**
```typescript
const remoteRoads = calculateRemoteRoads(room, ['W1N2', 'W2N1']);
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
    placeConstructionSites(room, selection.anchor, selection.blueprint, 5 - sites.length);
  }
}
```

**Explanation:**
1. Check if we own the room and have construction capacity
2. Select best blueprint for current RCL
3. Place up to 5 total construction sites
4. System handles terrain validation, fallbacks, and prioritization automatically

### Example 2: Remote Mining Road Network

**Scenario:** Calculate roads to remote mining rooms

**Code:**
```typescript
import { calculateRemoteRoads, placeRoadConstructionSites } from '@ralphschuler/screeps-layouts';

export function buildRemoteRoads(homeRoom: Room) {
  // Get remote mining rooms from memory
  const remoteRooms = Memory.rooms[homeRoom.name]?.remotes || [];
  
  if (remoteRooms.length === 0) return;
  
  // Calculate optimal road network
  const roads = calculateRemoteRoads(homeRoom, remoteRooms);
  
  // Place road sites (limit to 3 per tick to manage construction)
  const anchor = Memory.rooms[homeRoom.name]?.anchor;
  if (anchor) {
    const count = placeRoadConstructionSites(
      homeRoom,
      new RoomPosition(anchor.x, anchor.y, homeRoom.name),
      roads,
      3
    );
    console.log(`${homeRoom.name}: Placed ${count} remote road sites`);
  }
}
```

**Explanation:**
1. Retrieve remote mining room list from memory
2. Calculate complete road network across multiple rooms
3. Place construction sites incrementally (3 per tick)
4. System handles pathfinding and multi-room coordination

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
     placeConstructionSites(room, anchor, blueprint, 5 - sites.length);
   }
   ```

3. **Throttle Road Placement**
   ```typescript
   // Place roads every 10 ticks instead of every tick
   if (Game.time % 10 === 0) {
     placeRoadConstructionSites(room, anchor, roads, 3);
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

## Road-Aware Defense

### How It Works

The defense system ensures walls don't block infrastructure:

1. **Calculate Roads First**: Complete road network (sources, controller, mineral, remotes)
2. **Identify Crossings**: Find where roads intersect the perimeter
3. **Use Ramparts**: Place ramparts (not walls) at road crossings
4. **Remove Blockers**: Destroy existing walls blocking roads

### Benefits

- Friendly creeps always have clear paths
- Remote miners can reach exits
- Ramparts block enemies but allow friendly passage
- Automatic adaptation as roads expand

### Integration Example

```typescript
import { placeRoadAwarePerimeterDefense } from '@ralphschuler/screeps-layouts';

const result = placeRoadAwarePerimeterDefense(
  room,
  anchor,
  blueprint.roads,
  room.controller.level,
  5,  // max construction sites
  Memory.rooms[room.name].remotes || []
);

console.log(`Defense: ${result.sitesPlaced} sites, ${result.wallsRemoved} walls removed`);
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
