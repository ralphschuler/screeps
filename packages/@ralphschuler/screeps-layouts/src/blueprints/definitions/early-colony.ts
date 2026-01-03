/**
 * RCL 1-2: Early Colony Layout
 * 
 * Uses a checkerboard pattern to ensure creeps can:
 * - Spawn and move away in any direction
 * - Access all extensions without blocking each other
 * 
 * All extension positions satisfy |x|+|y| % 2 == 0 (even sum)
 * to ensure no two extensions are directly adjacent.
 * 
 * Layout (E=Extension, S=Spawn, r=Road):
 *       . E .
 *     E r r r E
 *     r r S r r
 *     E r r r E
 *       . E .
 */

import type { Blueprint } from "../types";

export const EARLY_COLONY_BLUEPRINT: Blueprint = {
  name: "seedNest",
  rcl: 1,
  type: "spread",
  minSpaceRadius: 3,
  anchor: { x: 25, y: 25 },
  structures: [
    { x: 0, y: 0, structureType: STRUCTURE_SPAWN },
    // Extensions at even-sum positions |x|+|y| % 2 == 0
    { x: -2, y: 0, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: 0, structureType: STRUCTURE_EXTENSION },
    { x: 0, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: 0, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: -2, structureType: STRUCTURE_EXTENSION }
  ],
  roads: [
    // Core roads around spawn (all 8 adjacent tiles for creep exit)
    { x: -1, y: -1 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 },
    { x: 1, y: 1 }
  ],
  ramparts: []
};
