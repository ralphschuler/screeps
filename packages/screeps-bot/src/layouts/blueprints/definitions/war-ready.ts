/**
 * RCL 7-8: War Ready / End Game Layout
 * 
 * Full end-game layout with 3 spawns, 6 towers, full labs, and all special structures.
 * All extension positions satisfy |x|+|y| % 2 == 0 (even sum)
 * to ensure no two extensions are directly adjacent.
 * 
 * Key features:
 * - 3 spawns spaced apart, each with full road ring
 * - Towers positioned for optimal coverage
 * - Labs clustered for efficient reactions with road access
 * - Extensions in strict checkerboard pattern
 */

import type { Blueprint } from "../types";
import { createSpawnRoadRing, createStructureProtection } from "../builders";

const anchor = { x: 25, y: 25 };
const primarySpawn = { x: 0, y: 0 };
const westSpawn = { x: -5, y: -1 };
const eastSpawn = { x: 5, y: -1 };

export const WAR_READY_BLUEPRINT: Blueprint = {
  name: "fortifiedHive",
  rcl: 7,
  type: "spread",
  minSpaceRadius: 7,
  anchor,
  structures: [
    // 3 spawns spaced apart
    { x: 0, y: 0, structureType: STRUCTURE_SPAWN },
    { x: -5, y: -1, structureType: STRUCTURE_SPAWN },
    { x: 5, y: -1, structureType: STRUCTURE_SPAWN },
    // Storage and terminal in center south
    { x: 0, y: 4, structureType: STRUCTURE_STORAGE },
    { x: 2, y: 4, structureType: STRUCTURE_TERMINAL },
    // 6 towers for full coverage
    { x: 0, y: -4, structureType: STRUCTURE_TOWER },
    { x: -4, y: -2, structureType: STRUCTURE_TOWER },
    { x: 4, y: -2, structureType: STRUCTURE_TOWER },
    { x: -4, y: 2, structureType: STRUCTURE_TOWER },
    { x: 4, y: 2, structureType: STRUCTURE_TOWER },
    { x: 0, y: 6, structureType: STRUCTURE_TOWER },
    // Factory near storage
    { x: -2, y: 4, structureType: STRUCTURE_FACTORY },
    // Labs clustered in southwest with road access
    { x: -4, y: 4, structureType: STRUCTURE_LAB },
    { x: -3, y: 5, structureType: STRUCTURE_LAB },
    { x: -4, y: 6, structureType: STRUCTURE_LAB },
    { x: -5, y: 5, structureType: STRUCTURE_LAB },
    { x: -6, y: 4, structureType: STRUCTURE_LAB },
    { x: -6, y: 6, structureType: STRUCTURE_LAB },
    { x: -2, y: 6, structureType: STRUCTURE_LAB },
    { x: -5, y: 3, structureType: STRUCTURE_LAB },
    { x: -7, y: 5, structureType: STRUCTURE_LAB },
    { x: -3, y: 7, structureType: STRUCTURE_LAB },
    // Special structures
    { x: 4, y: 4, structureType: STRUCTURE_NUKER },
    { x: 6, y: 0, structureType: STRUCTURE_OBSERVER },
    { x: -1, y: 5, structureType: STRUCTURE_POWER_SPAWN },
    // Links for logistics
    { x: 1, y: 5, structureType: STRUCTURE_LINK },
    { x: 5, y: -3, structureType: STRUCTURE_LINK },
    { x: -5, y: -3, structureType: STRUCTURE_LINK },
    // Extensions in checkerboard pattern - all positions have |x|+|y| % 2 == 0
    { x: -2, y: 0, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: 0, structureType: STRUCTURE_EXTENSION },
    { x: 0, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: 0, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: -3, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: 3, y: -1, structureType: STRUCTURE_EXTENSION }
  ],
  roads: [
    // Core roads around primary spawn (all 8 adjacent tiles)
    ...createSpawnRoadRing(primarySpawn),
    // Roads around west spawn (-5, -1)
    ...createSpawnRoadRing(westSpawn),
    // Roads around east spawn (5, -1)
    ...createSpawnRoadRing(eastSpawn),
    // Horizontal connector roads
    { x: -3, y: 0 },
    { x: 3, y: 0 },
    // Vertical connector roads
    { x: 0, y: -3 },
    { x: 0, y: 3 },
    // Additional movement roads between extensions
    { x: -2, y: -1 },
    { x: 2, y: -1 },
    { x: -2, y: 1 },
    { x: 2, y: 1 },
    { x: -1, y: -2 },
    { x: 1, y: -2 },
    { x: -1, y: 2 },
    { x: 1, y: 2 }
  ],
  ramparts: (() => {
    const criticalStructures = [
      // Spawns
      { x: 0, y: 0, structureType: STRUCTURE_SPAWN },
      { x: -5, y: -1, structureType: STRUCTURE_SPAWN },
      { x: 5, y: -1, structureType: STRUCTURE_SPAWN },
      // Storage and terminal
      { x: 0, y: 4, structureType: STRUCTURE_STORAGE },
      { x: 2, y: 4, structureType: STRUCTURE_TERMINAL },
      // Towers
      { x: 0, y: -4, structureType: STRUCTURE_TOWER },
      { x: -4, y: -2, structureType: STRUCTURE_TOWER },
      { x: 4, y: -2, structureType: STRUCTURE_TOWER },
      { x: -4, y: 2, structureType: STRUCTURE_TOWER },
      { x: 4, y: 2, structureType: STRUCTURE_TOWER },
      { x: 0, y: 6, structureType: STRUCTURE_TOWER },
      // Special structures
      { x: 4, y: 4, structureType: STRUCTURE_NUKER },
      { x: -1, y: 5, structureType: STRUCTURE_POWER_SPAWN }
    ];
    return createStructureProtection(
      criticalStructures,
      [STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_TERMINAL, 
       STRUCTURE_TOWER, STRUCTURE_NUKER, STRUCTURE_POWER_SPAWN]
    );
  })()
};
