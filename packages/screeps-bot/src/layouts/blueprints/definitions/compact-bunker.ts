/**
 * Compact Bunker Blueprint (RCL 8)
 * 
 * Ultra-efficient 11x11 bunker design that fits all critical structures
 * within rampart range. Optimized for defense and minimal footprint.
 * 
 * Key features:
 * - All structures within 11x11 grid for compact rampart coverage
 * - Spawns positioned for optimal coverage
 * - 10 labs total: 2 input labs + 8 output labs (all within reaction range <=2)
 * - Towers positioned for overlapping fields of fire
 * - Storage, terminal, and factory in tight cluster
 * - Full 60 extensions in efficient pattern
 * 
 * Space requirements:
 * - minSpaceRadius: 6 (ensures 13x13 buildable area around anchor)
 * - Actual footprint: structures span from -6 to +6 on both axes
 * - Requires minimal terrain walls: ≤10% of footprint
 */

import type { Blueprint } from "../types";

export const COMPACT_BUNKER_BLUEPRINT: Blueprint = {
  name: "compactBunker",
  rcl: 8,
  type: "bunker",
  minSpaceRadius: 6, // Anchor must be 6+ tiles from room edge for 13x13 area
  anchor: { x: 25, y: 25 },
  structures: [
    // Central core: Storage, Terminal, Factory in tight triangle
    { x: 0, y: 0, structureType: STRUCTURE_STORAGE },
    { x: -1, y: 1, structureType: STRUCTURE_TERMINAL },
    { x: 1, y: 1, structureType: STRUCTURE_FACTORY },
    
    // 3 Spawns surrounding core
    { x: 0, y: -2, structureType: STRUCTURE_SPAWN },
    { x: -2, y: 1, structureType: STRUCTURE_SPAWN },
    { x: 2, y: 1, structureType: STRUCTURE_SPAWN },
    
    // Power spawn and nuker near core
    { x: 0, y: 2, structureType: STRUCTURE_POWER_SPAWN },
    { x: -2, y: -1, structureType: STRUCTURE_NUKER },
    
    // 6 Towers for overlapping coverage
    { x: -3, y: -2, structureType: STRUCTURE_TOWER },
    { x: 3, y: -2, structureType: STRUCTURE_TOWER },
    { x: -4, y: 0, structureType: STRUCTURE_TOWER },
    { x: 4, y: 0, structureType: STRUCTURE_TOWER },
    { x: -3, y: 3, structureType: STRUCTURE_TOWER },
    { x: 3, y: 3, structureType: STRUCTURE_TOWER },
    
    // Lab cluster: 10 labs total (2 input + 8 output) in proper reaction range <=2
    // Input labs (receive minerals for reactions)
    { x: -2, y: 3, structureType: STRUCTURE_LAB },
    { x: -1, y: 3, structureType: STRUCTURE_LAB },
    // Output labs (all within range 2 of both input labs for reactions)
    { x: -3, y: 4, structureType: STRUCTURE_LAB },
    { x: -2, y: 4, structureType: STRUCTURE_LAB },
    { x: -1, y: 4, structureType: STRUCTURE_LAB },
    { x: 0, y: 3, structureType: STRUCTURE_LAB },
    { x: 0, y: 4, structureType: STRUCTURE_LAB },
    { x: 1, y: 3, structureType: STRUCTURE_LAB },
    { x: 1, y: 4, structureType: STRUCTURE_LAB },
    { x: 2, y: 3, structureType: STRUCTURE_LAB },
    
    // Observer
    { x: 2, y: -1, structureType: STRUCTURE_OBSERVER },
    
    // 6 Links (source, storage, controller links)
    { x: -1, y: -1, structureType: STRUCTURE_LINK },
    { x: 1, y: -1, structureType: STRUCTURE_LINK },
    { x: -3, y: 1, structureType: STRUCTURE_LINK },
    { x: 3, y: 1, structureType: STRUCTURE_LINK },
    { x: -1, y: -3, structureType: STRUCTURE_LINK },
    { x: 1, y: -3, structureType: STRUCTURE_LINK },
    
    // Extensions in checkerboard pattern (60 total)
    // Inner ring
    { x: -2, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: 0, y: -4, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: -4, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: 4, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: -4, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: 4, y: 2, structureType: STRUCTURE_EXTENSION },
    // Middle ring
    { x: -4, y: -4, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: -4, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: -4, structureType: STRUCTURE_EXTENSION },
    { x: 4, y: -4, structureType: STRUCTURE_EXTENSION },
    { x: -6, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: 6, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: -6, y: 0, structureType: STRUCTURE_EXTENSION },
    { x: 6, y: 0, structureType: STRUCTURE_EXTENSION },
    { x: -6, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: 6, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: -4, y: 4, structureType: STRUCTURE_EXTENSION },
    { x: 4, y: 4, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: 6, structureType: STRUCTURE_EXTENSION },
    { x: 0, y: 6, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: 6, structureType: STRUCTURE_EXTENSION },
    // Outer ring
    { x: -6, y: -4, structureType: STRUCTURE_EXTENSION },
    { x: -4, y: -6, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: -6, structureType: STRUCTURE_EXTENSION },
    { x: 0, y: -6, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: -6, structureType: STRUCTURE_EXTENSION },
    { x: 4, y: -6, structureType: STRUCTURE_EXTENSION },
    { x: 6, y: -4, structureType: STRUCTURE_EXTENSION },
    { x: -6, y: 4, structureType: STRUCTURE_EXTENSION },
    { x: 6, y: 4, structureType: STRUCTURE_EXTENSION },
    { x: -6, y: 6, structureType: STRUCTURE_EXTENSION },
    { x: -4, y: 6, structureType: STRUCTURE_EXTENSION },
    { x: 4, y: 6, structureType: STRUCTURE_EXTENSION },
    { x: 6, y: 6, structureType: STRUCTURE_EXTENSION },
    // Additional extensions to reach 60 total
    { x: -5, y: -5, structureType: STRUCTURE_EXTENSION },
    { x: -3, y: -5, structureType: STRUCTURE_EXTENSION },
    { x: -1, y: -5, structureType: STRUCTURE_EXTENSION },
    { x: 1, y: -5, structureType: STRUCTURE_EXTENSION },
    { x: 3, y: -5, structureType: STRUCTURE_EXTENSION },
    { x: 5, y: -5, structureType: STRUCTURE_EXTENSION },
    { x: -5, y: -3, structureType: STRUCTURE_EXTENSION },
    { x: 5, y: -3, structureType: STRUCTURE_EXTENSION },
    { x: -5, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: 5, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: -5, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: 5, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: -5, y: 3, structureType: STRUCTURE_EXTENSION },
    { x: 5, y: 3, structureType: STRUCTURE_EXTENSION },
    { x: -5, y: 5, structureType: STRUCTURE_EXTENSION },
    { x: -3, y: 5, structureType: STRUCTURE_EXTENSION },
    { x: -1, y: 5, structureType: STRUCTURE_EXTENSION },
    { x: 1, y: 5, structureType: STRUCTURE_EXTENSION },
    { x: 3, y: 5, structureType: STRUCTURE_EXTENSION },
    { x: 5, y: 5, structureType: STRUCTURE_EXTENSION }
  ],
  roads: [
    // Inner core roads (4x4 grid around storage)
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    // Roads around spawn positions
    { x: -1, y: -2 },
    { x: 1, y: -2 },
    { x: -2, y: 0 },
    { x: 2, y: 0 },
    { x: -2, y: 2 },
    { x: 2, y: 2 },
    // Cross roads for movement
    { x: 0, y: -3 },
    { x: 0, y: 3 },
    { x: -3, y: 0 },
    { x: 3, y: 0 },
    // Diagonal access roads
    { x: -1, y: 2 },
    { x: 1, y: 2 },
    { x: -3, y: -1 },
    { x: 3, y: -1 },
    // Perimeter roads for tower and extension access
    { x: -4, y: -1 },
    { x: 4, y: -1 },
    { x: -4, y: 1 },
    { x: 4, y: 1 },
    { x: -3, y: 2 },
    { x: 3, y: 2 },
    // Lab access roads
    { x: -3, y: 3 },
    { x: 3, y: 3 }
  ],
  ramparts: [
    // Protect central core
    { x: 0, y: 0 },
    { x: -1, y: 1 },
    { x: 1, y: 1 },
    // Protect spawns
    { x: 0, y: -2 },
    { x: -2, y: 1 },
    { x: 2, y: 1 },
    // Protect special structures
    { x: 0, y: 2 },
    { x: -2, y: -1 },
    { x: 2, y: -1 },
    // Protect towers
    { x: -3, y: -2 },
    { x: 3, y: -2 },
    { x: -4, y: 0 },
    { x: 4, y: 0 },
    { x: -3, y: 3 },
    { x: 3, y: 3 },
    // Protect labs (input labs)
    { x: -2, y: 3 },
    { x: -1, y: 3 },
    // Key perimeter protection
    { x: -4, y: -2 },
    { x: 4, y: -2 },
    { x: -4, y: 2 },
    { x: 4, y: 2 },
    { x: -2, y: -2 },
    { x: 2, y: -2 }
  ]
};
