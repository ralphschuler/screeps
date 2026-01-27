# Blueprint Development Guide

Learn how to create **custom room layouts and blueprints** for your Screeps bot.

---

## Table of Contents

- [Overview](#overview)
- [Blueprint Basics](#blueprint-basics)
- [Creating a Simple Blueprint](#creating-a-simple-blueprint)
- [Advanced Blueprint Features](#advanced-blueprint-features)
- [Blueprint Validation](#blueprint-validation)
- [Best Practices](#best-practices)
- [Examples](#examples)

---

## Overview

The **Layouts** package (`@ralphschuler/screeps-layouts`) provides a blueprint system for creating optimized room layouts.

### What is a Blueprint?

A **blueprint** is a pre-designed room layout that defines where to place structures (spawns, towers, extensions, etc.) for optimal efficiency, defense, or other goals.

### Why Use Blueprints?

**Benefits**:
- **Consistency** - Same layout across all rooms
- **Optimization** - Pre-calculated optimal positions
- **CPU Efficiency** - Don't recalculate layouts every game
- **Defense** - Planned rampart and wall positions
- **Flexibility** - Multiple blueprint types for different strategies

---

## Blueprint Basics

### Blueprint Structure

```typescript
interface Blueprint {
  id: string;              // Unique blueprint identifier
  name: string;            // Human-readable name
  type: BlueprintType;     // 'bunker', 'stamp', 'custom'
  centerPos: RoomPosition; // Blueprint center position
  structures: Structure Blueprint[];
  roads: RoadBlueprint[];
  ramparts?: RampartBlueprint[];
  version: string;         // Blueprint version
}

interface StructureBlueprint {
  type: StructureConstant;
  pos: { x: number; y: number };  // Relative to center
  rcl: number;             // Required RCL
}
```

### Blueprint Types

1. **Bunker** - Compact, highly defensible
2. **Stamp-Based** - Modular, expandable
3. **Custom** - Your own design

---

## Creating a Simple Blueprint

### Step 1: Define Structure Positions

```typescript
import { Blueprint, StructureBlueprint } from '@ralphschuler/screeps-layouts';

const myBlueprint: StructureBlueprint[] = [
  // Spawn (center)
  { type: STRUCTURE_SPAWN, pos: { x: 0, y: 0 }, rcl: 1 },
  
  // Extensions around spawn (RCL 2)
  { type: STRUCTURE_EXTENSION, pos: { x: -1, y: 0 }, rcl: 2 },
  { type: STRUCTURE_EXTENSION, pos: { x: 1, y: 0 }, rcl: 2 },
  { type: STRUCTURE_EXTENSION, pos: { x: 0, y: -1 }, rcl: 2 },
  { type: STRUCTURE_EXTENSION, pos: { x: 0, y: 1 }, rcl: 2 },
  { type: STRUCTURE_EXTENSION, pos: { x: -1, y: -1 }, rcl: 2 },
  
  // Towers (RCL 3+)
  { type: STRUCTURE_TOWER, pos: { x: 2, y: 0 }, rcl: 3 },
  { type: STRUCTURE_TOWER, pos: { x: -2, y: 0 }, rcl: 5 },
  
  // Storage (RCL 4)
  { type: STRUCTURE_STORAGE, pos: { x: 0, y: 2 }, rcl: 4 },
  
  // Add more structures...
];
```

### Step 2: Create Blueprint Class

```typescript
import { Blueprint, BlueprintType } from '@ralphschuler/screeps-layouts';

class SimpleBlueprint implements Blueprint {
  id = 'simple-v1';
  name = 'Simple Layout';
  type: BlueprintType = 'custom';
  centerPos: RoomPosition;
  structures: StructureBlueprint[];
  roads: RoadBlueprint[] = [];
  version = '1.0.0';
  
  constructor(centerPos: RoomPosition) {
    this.centerPos = centerPos;
    this.structures = myBlueprint;
  }
  
  // Convert relative positions to absolute
  getAbsolutePos(relative: { x: number; y: number }): RoomPosition {
    return new RoomPosition(
      this.centerPos.x + relative.x,
      this.centerPos.y + relative.y,
      this.centerPos.roomName
    );
  }
  
  // Get structures for specific RCL
  getStructuresForRCL(rcl: number): StructureBlueprint[] {
    return this.structures.filter(s => s.rcl <= rcl);
  }
}
```

### Step 3: Place Blueprint in Room

```typescript
import { SimpleBlueprint } from './blueprints/simple';

function placeBlueprint(room: Room) {
  // Find optimal center (e.g., center of room)
  const center = new RoomPosition(25, 25, room.name);
  
  // Create blueprint
  const blueprint = new SimpleBlueprint(center);
  
  // Get current RCL structures
  const rcl = room.controller?.level || 1;
  const structures = blueprint.getStructuresForRCL(rcl);
  
  // Place construction sites
  for (const structure of structures) {
    const pos = blueprint.getAbsolutePos(structure.pos);
    const result = room.createConstructionSite(pos.x, pos.y, structure.type);
    
    if (result === OK) {
      console.log(`Placed ${structure.type} at ${pos}`);
    }
  }
}
```

---

## Advanced Blueprint Features

### Road Networks

Add road connections between key structures:

```typescript
interface RoadBlueprint {
  from: { x: number; y: number };
  to: { x: number; y: number };
  rcl: number;
}

const roads: RoadBlueprint[] = [
  // Road from spawn to controller
  { from: { x: 0, y: 0 }, to: { x: 10, y: 10 }, rcl: 1 },
  
  // Road network around extensions
  { from: { x: -2, y: 0 }, to: { x: 2, y: 0 }, rcl: 2 },
];

// Place roads using pathfinding
function placeRoads(room: Room, blueprint: Blueprint) {
  for (const road of blueprint.roads) {
    const fromPos = blueprint.getAbsolutePos(road.from);
    const toPos = blueprint.getAbsolutePos(road.to);
    
    const path = fromPos.findPathTo(toPos, { ignoreCreeps: true });
    
    for (const step of path) {
      room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
    }
  }
}
```

### Rampart Planning

Intelligently place ramparts:

```typescript
function generateRampartPositions(blueprint: Blueprint): RoomPosition[] {
  const ramparts: RoomPosition[] = [];
  
  // Rampart all critical structures
  const criticalTypes = [
    STRUCTURE_SPAWN,
    STRUCTURE_TOWER,
    STRUCTURE_STORAGE,
    STRUCTURE_TERMINAL,
    STRUCTURE_NUKER
  ];
  
  for (const structure of blueprint.structures) {
    if (criticalTypes.includes(structure.type)) {
      ramparts.push(blueprint.getAbsolutePos(structure.pos));
    }
  }
  
  return ramparts;
}
```

### Dynamic Blueprint Adjustment

Adjust blueprint based on terrain:

```typescript
class TerrainAdaptiveBlueprint extends Blueprint {
  constructor(room: Room) {
    const center = this.findOptimalCenter(room);
    super(center);
    this.adaptToTerrain(room);
  }
  
  private findOptimalCenter(room: Room): RoomPosition {
    const terrain = room.getTerrain();
    
    // Find largest open area
    let bestPos = new RoomPosition(25, 25, room.name);
    let bestScore = 0;
    
    for (let x = 10; x < 40; x++) {
      for (let y = 10; y < 40; y++) {
        const score = this.scorePosition(x, y, terrain);
        if (score > bestScore) {
          bestScore = score;
          bestPos = new RoomPosition(x, y, room.name);
        }
      }
    }
    
    return bestPos;
  }
  
  private scorePosition(x: number, y: number, terrain: RoomTerrain): number {
    let score = 0;
    
    // Check 5x5 area around position
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        if (terrain.get(x + dx, y + dy) === 0) {  // Plain
          score += 1;
        }
      }
    }
    
    return score;
  }
  
  private adaptToTerrain(room: Room): void {
    const terrain = room.getTerrain();
    
    // Remove structures that would be on walls
    this.structures = this.structures.filter(s => {
      const pos = this.getAbsolutePos(s.pos);
      return terrain.get(pos.x, pos.y) !== TERRAIN_MASK_WALL;
    });
  }
}
```

### Multi-RCL Planning

Plan structure placement across all RCLs:

```typescript
const extensionPlan: StructureBlueprint[] = [
  // RCL 2: 5 extensions
  ...generateExtensionRing(0, 1, 2),  // 5 extensions
  
  // RCL 3: +5 extensions (total 10)
  ...generateExtensionRing(1, 2, 3),  // 5 more
  
  // RCL 4: +10 extensions (total 20)
  ...generateExtensionRing(2, 2, 4),  // 10 more
  
  // RCL 5: +10 extensions (total 30)
  ...generateExtensionRing(3, 2, 5),  // 10 more
  
  // Continue for RCL 6, 7, 8...
];

function generateExtensionRing(
  ring: number, 
  count: number, 
  rcl: number
): StructureBlueprint[] {
  const structures: StructureBlueprint[] = [];
  const radius = ring + 2;
  const angleStep = (Math.PI * 2) / count;
  
  for (let i = 0; i < count; i++) {
    const angle = i * angleStep;
    const x = Math.round(Math.cos(angle) * radius);
    const y = Math.round(Math.sin(angle) * radius);
    
    structures.push({
      type: STRUCTURE_EXTENSION,
      pos: { x, y },
      rcl
    });
  }
  
  return structures;
}
```

---

## Blueprint Validation

### Validate Structure Limits

```typescript
function validateBlueprint(blueprint: Blueprint, rcl: number): string[] {
  const errors: string[] = [];
  
  // Count structures by type
  const counts = new Map<StructureConstant, number>();
  
  for (const structure of blueprint.getStructuresForRCL(rcl)) {
    const count = counts.get(structure.type) || 0;
    counts.set(structure.type, count + 1);
  }
  
  // Check against limits
  const limits = CONTROLLER_STRUCTURES[rcl];
  
  for (const [type, count] of counts) {
    const limit = limits[type] || 0;
    if (count > limit) {
      errors.push(`Too many ${type}: ${count} > ${limit}`);
    }
  }
  
  return errors;
}
```

### Validate Terrain Compatibility

```typescript
function validateTerrain(blueprint: Blueprint, room: Room): string[] {
  const errors: string[] = [];
  const terrain = room.getTerrain();
  
  for (const structure of blueprint.structures) {
    const pos = blueprint.getAbsolutePos(structure.pos);
    
    // Check if position is on wall
    if (terrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL) {
      errors.push(`${structure.type} at ${pos} is on wall terrain`);
    }
    
    // Check bounds
    if (pos.x < 1 || pos.x > 48 || pos.y < 1 || pos.y > 48) {
      errors.push(`${structure.type} at ${pos} is out of bounds`);
    }
  }
  
  return errors;
}
```

---

## Best Practices

### 1. Plan for All RCLs

Design blueprints that scale from RCL 1 to RCL 8:

```typescript
// Bad: Only RCL 8 design
const blueprint = createRCL8Blueprint();

// Good: Incremental design
const blueprint = createScalableBlueprint();
```

### 2. Leave Space for Roads

Ensure structures aren't so dense that roads can't connect them:

```typescript
// Minimum 1-tile gap between structure groups
const spacing = 2;  // 1 for structure, 1 for road
```

### 3. Optimize for Defense

Place towers and ramparts strategically:

```typescript
// Towers should cover:
// - Spawn (most important)
// - Storage and terminal
// - Controller (if possible)
// - Room center

function placeTowers(blueprint: Blueprint): void {
  const towerPositions = [
    { x: 3, y: 0 },   // Cover spawn and storage
    { x: -3, y: 0 },  // Cover terminal and extensions
    { x: 0, y: 3 },   // Cover controller path
  ];
  
  // Add to blueprint...
}
```

### 4. Consider Link Networks

Plan link positions for efficient energy transfer:

```typescript
// Link network:
// 1. Source links (near each source)
// 2. Storage link (near storage)
// 3. Controller link (near controller)
// 4. Optional: Fast filler link

const linkPlan = [
  { type: 'source', pos: nearSource1, rcl: 5 },
  { type: 'source', pos: nearSource2, rcl: 6 },
  { type: 'storage', pos: nearStorage, rcl: 5 },
  { type: 'controller', pos: nearController, rcl: 7 },
];
```

### 5. Test in Simulation

Test blueprints in simulation before deploying:

```typescript
// Use screeps-server or private server
function testBlueprint(blueprint: Blueprint) {
  const room = Game.rooms['sim'];
  placeBlueprint(room);
  
  // Verify:
  // - All structures can be placed
  // - Roads connect properly
  // - Defense coverage is good
  // - Energy flow works
}
```

---

## Examples

### Example 1: Bunker Blueprint

```typescript
import { Blueprint } from '@ralphschuler/screeps-layouts';

class BunkerBlueprint implements Blueprint {
  // Compact 11x11 bunker layout
  structures: StructureBlueprint[] = [
    // Core (center)
    { type: STRUCTURE_SPAWN, pos: { x: 0, y: 0 }, rcl: 1 },
    { type: STRUCTURE_STORAGE, pos: { x: 1, y: 0 }, rcl: 4 },
    { type: STRUCTURE_TERMINAL, pos: { x: -1, y: 0 }, rcl: 6 },
    { type: STRUCTURE_POWER_SPAWN, pos: { x: 0, y: 1 }, rcl: 8 },
    
    // Towers (inner ring)
    { type: STRUCTURE_TOWER, pos: { x: 2, y: 0 }, rcl: 3 },
    { type: STRUCTURE_TOWER, pos: { x: -2, y: 0 }, rcl: 5 },
    { type: STRUCTURE_TOWER, pos: { x: 0, y: 2 }, rcl: 7 },
    { type: STRUCTURE_TOWER, pos: { x: 0, y: -2 }, rcl: 7 },
    
    // Extensions (outer rings)
    ...generateExtensionGrid(),
    
    // Labs (cluster)
    ...generateLabCluster(),
  ];
  
  // All ramparts
  ramparts = this.structures
    .filter(s => s.type !== STRUCTURE_ROAD)
    .map(s => ({ pos: s.pos, rcl: s.rcl }));
}
```

---

## Related Documentation

- **[Layouts Package](../../../packages/@ralphschuler/screeps-layouts/README.md)** - Full layouts documentation
- **[Core Concepts](../core-concepts.md#blueprint-system)** - Blueprint system overview

---

**Last Updated**: 2026-01-27  
**Framework Version**: 0.1.0
