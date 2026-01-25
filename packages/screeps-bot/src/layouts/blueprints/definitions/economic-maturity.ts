/**
 * RCL 5-6: Economic Maturity Layout
 * 
 * Expanded layout with storage, terminal, and labs.
 * All extension positions satisfy |x|+|y| % 2 == 0 (even sum)
 * to ensure no two extensions are directly adjacent.
 * 
 * Key features:
 * - Second spawn at distance 4 (with its own road ring)
 * - Storage and terminal placed with road access
 * - Labs clustered but with road access
 * - Extensions in strict checkerboard pattern
 */

import { createSpawnRoadRing, createRadialRoads, createStructureProtection } from "../builders";
import type { Blueprint } from "../types";

const anchor = { x: 25, y: 25 };
const primarySpawn = { x: 0, y: 0 };
// Secondary spawn position (for documentation purposes)
const _secondarySpawn = { x: 4, y: 0 };

export const ECONOMIC_MATURITY_BLUEPRINT: Blueprint = {
  name: "matureColony",
  rcl: 5,
  type: "spread",
  minSpaceRadius: 6,
  anchor,
  structures: [
    // Primary spawn at center
    { x: 0, y: 0, structureType: STRUCTURE_SPAWN },
    // Second spawn at distance 4 with space around it
    { x: 4, y: 0, structureType: STRUCTURE_SPAWN },
    // Storage and terminal in accessible location
    { x: 0, y: 4, structureType: STRUCTURE_STORAGE },
    { x: 2, y: 4, structureType: STRUCTURE_TERMINAL },
    // Towers for defense
    { x: 0, y: -4, structureType: STRUCTURE_TOWER },
    { x: -4, y: 0, structureType: STRUCTURE_TOWER },
    { x: 4, y: -4, structureType: STRUCTURE_TOWER },
    // Extensions in checkerboard pattern - all positions have |x|+|y| % 2 == 0
    { x: -2, y: 0, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: 0, structureType: STRUCTURE_EXTENSION },
    { x: 0, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: 0, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: -1, y: -3, structureType: STRUCTURE_EXTENSION },
    { x: 1, y: -3, structureType: STRUCTURE_EXTENSION },
    { x: -3, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: 3, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: -3, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: 3, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: -1, y: 3, structureType: STRUCTURE_EXTENSION },
    { x: 1, y: 3, structureType: STRUCTURE_EXTENSION },
    { x: -4, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: -4, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: -4, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: -4, structureType: STRUCTURE_EXTENSION },
    { x: -3, y: -3, structureType: STRUCTURE_EXTENSION },
    { x: 3, y: -3, structureType: STRUCTURE_EXTENSION },
    { x: -3, y: 3, structureType: STRUCTURE_EXTENSION },
    // Use positions that don't conflict with other blueprint spawns
    { x: -6, y: 0, structureType: STRUCTURE_EXTENSION },
    { x: -6, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: 6, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: 6, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: -4, y: -4, structureType: STRUCTURE_EXTENSION },
    { x: 4, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: 6, y: 0, structureType: STRUCTURE_EXTENSION },
    // Labs clustered for reactions
    { x: -3, y: 5, structureType: STRUCTURE_LAB },
    { x: -4, y: 4, structureType: STRUCTURE_LAB },
    { x: -5, y: 5, structureType: STRUCTURE_LAB },
    // Link near storage
    { x: -2, y: 4, structureType: STRUCTURE_LINK }
  ],
  roads: [
    // Core roads around primary spawn (all 8 adjacent tiles)
    ...createSpawnRoadRing(primarySpawn),
    // Roads around secondary spawn
    { x: 3, y: -1 },
    { x: 3, y: 0 },
    { x: 3, y: 1 },
    { x: 4, y: -1 },
    { x: 4, y: 1 },
    { x: 5, y: -1 },
    { x: 5, y: 0 },
    { x: 5, y: 1 },
    // Connecting roads between extensions
    { x: -2, y: -1 },
    { x: 2, y: -1 },
    { x: -2, y: 1 },
    { x: 2, y: 1 },
    { x: -1, y: -2 },
    { x: 1, y: -2 },
    { x: -1, y: 2 },
    { x: 1, y: 2 },
    ...createRadialRoads(primarySpawn, 3, ['north', 'south', 'east', 'west'])
  ],
  ramparts: (() => {
    const allStructures = [
      { x: 0, y: 0, structureType: STRUCTURE_SPAWN },
      { x: 4, y: 0, structureType: STRUCTURE_SPAWN },
      { x: 0, y: 4, structureType: STRUCTURE_STORAGE },
      { x: 2, y: 4, structureType: STRUCTURE_TERMINAL }
    ];
    return createStructureProtection(
      allStructures,
      [STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_TERMINAL]
    );
  })()
};
