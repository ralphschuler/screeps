/**
 * RCL 3-4: Core Colony Layout
 * 
 * Expanded checkerboard pattern with tower for defense.
 * All extension positions satisfy |x|+|y| % 2 == 0 (even sum)
 * to ensure no two extensions are directly adjacent.
 * 
 * Key features:
 * - All spawn-adjacent tiles are roads for creep exit
 * - Extensions are spaced with roads for movement
 * - Tower placed at safe distance from spawn
 */

import type { Blueprint } from "../types";

export const CORE_COLONY_BLUEPRINT: Blueprint = {
  name: "foragingExpansion",
  rcl: 3,
  type: "spread",
  minSpaceRadius: 4,
  anchor: { x: 25, y: 25 },
  structures: [
    { x: 0, y: 0, structureType: STRUCTURE_SPAWN },
    // Tower at safe distance
    { x: 0, y: -4, structureType: STRUCTURE_TOWER },
    // Extensions in checkerboard pattern - all positions have |x|+|y| % 2 == 0
    // Ring 1: distance 2 from spawn
    { x: -2, y: 0, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: 0, structureType: STRUCTURE_EXTENSION },
    { x: 0, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: 0, y: 2, structureType: STRUCTURE_EXTENSION },
    // Ring 2: distance 4 (diagonals)
    { x: -2, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: 2, structureType: STRUCTURE_EXTENSION },
    // Ring 3: distance 4 from spawn
    { x: -4, y: 0, structureType: STRUCTURE_EXTENSION },
    { x: 4, y: 0, structureType: STRUCTURE_EXTENSION },
    { x: 0, y: 4, structureType: STRUCTURE_EXTENSION },
    // Ring 4: diagonal positions
    { x: -1, y: -3, structureType: STRUCTURE_EXTENSION },
    { x: 1, y: -3, structureType: STRUCTURE_EXTENSION },
    { x: -3, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: 3, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: -3, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: 3, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: -1, y: 3, structureType: STRUCTURE_EXTENSION },
    { x: 1, y: 3, structureType: STRUCTURE_EXTENSION },
    { x: -3, y: -3, structureType: STRUCTURE_EXTENSION }
  ],
  roads: [
    // Core roads around spawn (all 8 adjacent tiles)
    { x: -1, y: -1 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    // Radial roads for movement to extensions
    { x: -2, y: -1 },
    { x: 2, y: -1 },
    { x: -2, y: 1 },
    { x: 2, y: 1 },
    { x: -1, y: -2 },
    { x: 1, y: -2 },
    { x: -1, y: 2 },
    { x: 1, y: 2 },
    { x: 0, y: -3 },
    { x: 0, y: 3 },
    { x: -3, y: 0 },
    { x: 3, y: 0 }
  ],
  ramparts: []
};
