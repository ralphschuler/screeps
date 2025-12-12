/**
 * Base Blueprints - Phase 5
 *
 * Pre-computed coordinate arrays for base layouts at different RCL stages.
 * 
 * TODO: Implement automatic blueprint selection based on terrain
 * Analyze room terrain to choose best layout (bunker vs spread)
 * TODO: Add dynamic blueprint generation for irregular terrain
 * Generate custom layouts when pre-made blueprints don't fit
 * TODO: Implement blueprint validation before construction
 * Check for obstacles, sources, controller positions
 * TODO: Add blueprint versioning for gradual base evolution
 * Support incremental upgrades without full reconstruction
 * TODO: Consider adding specialized blueprints (eco, war, hybrid)
 * Different layouts optimized for different room postures
 * TODO: Implement blueprint sharing/import from successful designs
 * Allow importing proven layouts from other bots or players
 * TODO: Add blueprint efficiency scoring
 * Evaluate layouts based on path lengths, defense coverage, etc.
 */

import type { EvolutionStage } from "../memory/schemas";
import { addExtensionsToBlueprint } from "./extensionGenerator";
import { getValidRoadPositions } from "./roadNetworkPlanner";
import { logger } from "../core/logger";

/**
 * Structure placement entry
 */
export interface StructurePlacement {
  x: number;
  y: number;
  structureType: BuildableStructureConstant;
}

/**
 * Blueprint for a room layout
 */
export interface Blueprint {
  /** Name of the blueprint */
  name: string;
  /** Required RCL */
  rcl: number;
  /** Anchor position (spawn location) */
  anchor: { x: number; y: number };
  /** Structure placements relative to anchor */
  structures: StructurePlacement[];
  /** Road placements relative to anchor */
  roads: { x: number; y: number }[];
  /** Rampart positions relative to anchor */
  ramparts: { x: number; y: number }[];
  /** Blueprint type for terrain validation */
  type?: "bunker" | "spread" | "dynamic";
  /** Minimum required space radius (for terrain validation) */
  minSpaceRadius?: number;
}

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
export const ECONOMIC_MATURITY_BLUEPRINT: Blueprint = {
  name: "matureColony",
  rcl: 5,
  type: "spread",
  minSpaceRadius: 6,
  anchor: { x: 25, y: 25 },
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
    { x: -1, y: -1 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
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
    { x: 0, y: -3 },
    { x: 0, y: 3 },
    { x: -3, y: 0 },
    { x: 3, y: 0 }
  ],
  ramparts: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 0, y: 4 },
    { x: 1, y: 4 }
  ]
};

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
export const WAR_READY_BLUEPRINT: Blueprint = {
  name: "fortifiedHive",
  rcl: 7,
  type: "spread",
  minSpaceRadius: 7,
  anchor: { x: 25, y: 25 },
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
    { x: -1, y: -1 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    // Roads around west spawn (-5, -1)
    { x: -6, y: -2 },
    { x: -5, y: -2 },
    { x: -4, y: -2 },
    { x: -6, y: -1 },
    { x: -4, y: -1 },
    { x: -6, y: 0 },
    { x: -5, y: 0 },
    { x: -4, y: 0 },
    // Roads around east spawn (5, -1)
    { x: 4, y: -2 },
    { x: 5, y: -2 },
    { x: 6, y: -2 },
    { x: 4, y: -1 },
    { x: 6, y: -1 },
    { x: 4, y: 0 },
    { x: 5, y: 0 },
    { x: 6, y: 0 },
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
  ramparts: [
    // Protect all spawns
    { x: 0, y: 0 },
    { x: -5, y: -1 },
    { x: 5, y: -1 },
    // Protect storage and terminal
    { x: 0, y: 4 },
    { x: 2, y: 4 },
    // Protect towers
    { x: 0, y: -4 },
    { x: -4, y: -2 },
    { x: 4, y: -2 },
    { x: -4, y: 2 },
    { x: 4, y: 2 },
    { x: 0, y: 6 },
    // Protect special structures
    { x: 4, y: 4 },
    { x: -1, y: 5 }
  ]
};

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
    { x: -5, y: -3, structureType: STRUCTURE_EXTENSION },
    { x: -3, y: -3, structureType: STRUCTURE_EXTENSION },
    { x: -1, y: -5, structureType: STRUCTURE_EXTENSION },
    { x: 1, y: -5, structureType: STRUCTURE_EXTENSION },
    { x: 3, y: -3, structureType: STRUCTURE_EXTENSION },
    { x: 5, y: -3, structureType: STRUCTURE_EXTENSION },
    { x: -5, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: 5, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: -5, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: 5, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: -5, y: 3, structureType: STRUCTURE_EXTENSION },
    { x: 5, y: 3, structureType: STRUCTURE_EXTENSION },
    // Outer ring
    { x: -6, y: -4, structureType: STRUCTURE_EXTENSION },
    { x: -4, y: -4, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: -4, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: -4, structureType: STRUCTURE_EXTENSION },
    { x: 4, y: -4, structureType: STRUCTURE_EXTENSION },
    { x: 6, y: -4, structureType: STRUCTURE_EXTENSION },
    { x: -6, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: 6, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: -6, y: 0, structureType: STRUCTURE_EXTENSION },
    { x: 6, y: 0, structureType: STRUCTURE_EXTENSION },
    { x: -6, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: 6, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: -6, y: 4, structureType: STRUCTURE_EXTENSION },
    { x: -4, y: 4, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: 4, structureType: STRUCTURE_EXTENSION },
    { x: 4, y: 4, structureType: STRUCTURE_EXTENSION },
    { x: 6, y: 4, structureType: STRUCTURE_EXTENSION },
    // Additional extensions to reach 60
    { x: -5, y: -5, structureType: STRUCTURE_EXTENSION },
    { x: -3, y: -5, structureType: STRUCTURE_EXTENSION },
    { x: 3, y: -5, structureType: STRUCTURE_EXTENSION },
    { x: 5, y: -5, structureType: STRUCTURE_EXTENSION },
    { x: -5, y: 5, structureType: STRUCTURE_EXTENSION },
    { x: -3, y: 5, structureType: STRUCTURE_EXTENSION },
    { x: 3, y: 5, structureType: STRUCTURE_EXTENSION },
    { x: 5, y: 5, structureType: STRUCTURE_EXTENSION }
  ],
  roads: [
    // Core roads connecting storage/terminal/factory
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    // Roads around spawns
    { x: -1, y: -2 },
    { x: 1, y: -2 },
    { x: -2, y: 0 },
    { x: 2, y: 0 },
    { x: -2, y: 2 },
    { x: 2, y: 2 },
    // Connector roads to towers
    { x: -3, y: -1 },
    { x: 3, y: -1 },
    { x: -3, y: 2 },
    { x: 3, y: 2 },
    // Roads to lab cluster
    { x: 0, y: 2 },
    { x: -1, y: 2 },
    { x: 1, y: 2 }
  ],
  ramparts: [
    // Protect all critical structures
    { x: 0, y: 0 },  // Storage
    { x: -1, y: 1 }, // Terminal
    { x: 1, y: 1 },  // Factory
    { x: 0, y: -2 }, // Spawn 1
    { x: -2, y: 1 }, // Spawn 2
    { x: 2, y: 1 },  // Spawn 3
    { x: 0, y: 2 },  // Power Spawn
    { x: -2, y: -1 }, // Nuker
    // Towers
    { x: -3, y: -2 },
    { x: 3, y: -2 },
    { x: -4, y: 0 },
    { x: 4, y: 0 },
    { x: -3, y: 3 },
    { x: 3, y: 3 },
    // Lab cluster protection
    { x: -2, y: 3 },
    { x: -1, y: 3 },
    { x: 0, y: 3 },
    { x: 1, y: 3 },
    { x: 2, y: 3 },
    { x: -3, y: 4 },
    { x: -2, y: 4 },
    { x: -1, y: 4 },
    { x: 0, y: 4 },
    { x: 1, y: 4 }
  ]
};

/**
 * Get blueprint for evolution stage
 */
export function getBlueprintForStage(stage: EvolutionStage): Blueprint {
  switch (stage) {
    case "seedNest":
      return EARLY_COLONY_BLUEPRINT;
    case "foragingExpansion":
      return CORE_COLONY_BLUEPRINT;
    case "matureColony":
      return ECONOMIC_MATURITY_BLUEPRINT;
    case "fortifiedHive":
    case "empireDominance":
      return WAR_READY_BLUEPRINT;
    default:
      return EARLY_COLONY_BLUEPRINT;
  }
}

/**
 * Get blueprint for RCL
 */
export function getBlueprintForRCL(rcl: number): Blueprint {
  if (rcl >= 7) return WAR_READY_BLUEPRINT;
  if (rcl >= 5) return ECONOMIC_MATURITY_BLUEPRINT;
  if (rcl >= 3) return CORE_COLONY_BLUEPRINT;
  return EARLY_COLONY_BLUEPRINT;
}

/**
 * Filter structures for a specific RCL
 */
export function getStructuresForRCL(blueprint: Blueprint, rcl: number): StructurePlacement[] {
  const limits = getStructureLimits(rcl);
  const counts: Record<string, number> = {};

  let structures = blueprint.structures.filter(s => {
    const type = s.structureType;
    const limit = limits[type] ?? 0;
    const current = counts[type] ?? 0;

    if (current >= limit) return false;

    counts[type] = current + 1;
    return true;
  });

  // Add extensions to reach RCL limit
  const extensionLimit = limits[STRUCTURE_EXTENSION] ?? 0;
  if (extensionLimit > 0) {
    structures = addExtensionsToBlueprint(structures, extensionLimit);
  }

  return structures;
}

/**
 * Get structure limits per RCL
 */
function getStructureLimits(rcl: number): Record<BuildableStructureConstant, number> {
  const limits: Record<number, Partial<Record<BuildableStructureConstant, number>>> = {
    1: { spawn: 1, extension: 0, road: 2500, constructedWall: 0 },
    2: { spawn: 1, extension: 5, road: 2500, constructedWall: 2500, rampart: 2500, container: 5 },
    3: { spawn: 1, extension: 10, road: 2500, constructedWall: 2500, rampart: 2500, container: 5, tower: 1 },
    4: {
      spawn: 1,
      extension: 20,
      road: 2500,
      constructedWall: 2500,
      rampart: 2500,
      container: 5,
      tower: 1,
      storage: 1
    },
    5: {
      spawn: 1,
      extension: 30,
      road: 2500,
      constructedWall: 2500,
      rampart: 2500,
      container: 5,
      tower: 2,
      storage: 1,
      link: 2
    },
    6: {
      spawn: 1,
      extension: 40,
      road: 2500,
      constructedWall: 2500,
      rampart: 2500,
      container: 5,
      tower: 2,
      storage: 1,
      link: 3,
      terminal: 1,
      extractor: 1,
      lab: 3
    },
    7: {
      spawn: 2,
      extension: 50,
      road: 2500,
      constructedWall: 2500,
      rampart: 2500,
      container: 5,
      tower: 3,
      storage: 1,
      link: 4,
      terminal: 1,
      extractor: 1,
      lab: 6,
      factory: 1
    },
    8: {
      spawn: 3,
      extension: 60,
      road: 2500,
      constructedWall: 2500,
      rampart: 2500,
      container: 5,
      tower: 6,
      storage: 1,
      link: 6,
      terminal: 1,
      extractor: 1,
      lab: 10,
      factory: 1,
      nuker: 1,
      observer: 1,
      powerSpawn: 1
    }
  };

  return (limits[rcl] ?? limits[1]) as Record<BuildableStructureConstant, number>;
}

/**
 * Get blueprint for a specific RCL (alias for getBlueprintForRCL)
 */
export function getBlueprint(rcl: number): Blueprint {
  return getBlueprintForRCL(rcl);
}

/**
 * Place construction sites from a blueprint
 */
export function placeConstructionSites(room: Room, anchor: RoomPosition, blueprint: Blueprint): number {
  const rcl = room.controller?.level ?? 1;
  const structures = getStructuresForRCL(blueprint, rcl);
  const terrain = room.getTerrain();

  // Add extractor at mineral position if RCL 6+
  const mineralStructures: StructurePlacement[] = [];
  if (rcl >= 6) {
    const minerals = room.find(FIND_MINERALS);
    if (minerals.length > 0) {
      const mineral = minerals[0];
      mineralStructures.push({
        x: mineral.pos.x - anchor.x,
        y: mineral.pos.y - anchor.y,
        structureType: STRUCTURE_EXTRACTOR
      });
    }
  }

  // Combine blueprint structures with mineral structures
  const allStructures = [...structures, ...mineralStructures];

  let placed = 0;
  const existingSites = room.find(FIND_MY_CONSTRUCTION_SITES);
  const existingStructures = room.find(FIND_STRUCTURES);

  if (existingSites.length >= 10) return 0;

  const structureCounts: Record<string, number> = {};
  for (const structure of existingStructures) {
    const type = structure.structureType;
    structureCounts[type] = (structureCounts[type] ?? 0) + 1;
  }

  for (const site of existingSites) {
    const type = site.structureType;
    structureCounts[type] = (structureCounts[type] ?? 0) + 1;
  }

  const limits = getStructureLimits(rcl);

  for (const s of allStructures) {
    const currentCount = structureCounts[s.structureType] ?? 0;
    const limit = limits[s.structureType] ?? 0;
    if (currentCount >= limit) continue;

    const x = anchor.x + s.x;
    const y = anchor.y + s.y;

    if (x < 1 || x > 48 || y < 1 || y > 48) continue;
    if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;

    const existingAtPos = existingStructures.some(
      str => str.pos.x === x && str.pos.y === y && str.structureType === s.structureType
    );
    if (existingAtPos) continue;

    const existingSiteAtPos = existingSites.some(
      site => site.pos.x === x && site.pos.y === y && site.structureType === s.structureType
    );
    if (existingSiteAtPos) continue;

    const result = room.createConstructionSite(x, y, s.structureType);
    if (result === OK) {
      placed++;
      structureCounts[s.structureType] = currentCount + 1;

      if (placed >= 3 || existingSites.length + placed >= 10) break;
    }
  }

  if (placed < 3 && existingSites.length + placed < 10) {
    for (const r of blueprint.roads) {
      const x = anchor.x + r.x;
      const y = anchor.y + r.y;

      if (x < 1 || x > 48 || y < 1 || y > 48) continue;
      if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;

      const existingRoad = existingStructures.some(
        str => str.pos.x === x && str.pos.y === y && str.structureType === STRUCTURE_ROAD
      );
      if (existingRoad) continue;

      const existingRoadSite = existingSites.some(
        site => site.pos.x === x && site.pos.y === y && site.structureType === STRUCTURE_ROAD
      );
      if (existingRoadSite) continue;

      const result = room.createConstructionSite(x, y, STRUCTURE_ROAD);
      if (result === OK) {
        placed++;
        if (placed >= 3 || existingSites.length + placed >= 10) break;
      }
    }
  }

  return placed;
}

/**
 * Structure types that can be destroyed for blueprint rearrangement.
 * Excludes critical structures that should never be automatically destroyed:
 * - Spawns: Critical for creep production
 * - Storage/Terminal: May contain valuable resources
 * - Containers: Player-placed for flexible logistics (not in blueprints)
 * - Walls/Ramparts: Defensive structures controlled by player
 */
const DESTROYABLE_STRUCTURE_TYPES: BuildableStructureConstant[] = [
  STRUCTURE_EXTENSION,
  STRUCTURE_ROAD,
  STRUCTURE_TOWER,
  STRUCTURE_LAB,
  STRUCTURE_LINK,
  STRUCTURE_FACTORY,
  STRUCTURE_OBSERVER,
  STRUCTURE_NUKER,
  STRUCTURE_POWER_SPAWN,
  STRUCTURE_EXTRACTOR
];

/** Set for O(1) lookup of destroyable structure types */
const DESTROYABLE_STRUCTURE_SET = new Set<BuildableStructureConstant>(DESTROYABLE_STRUCTURE_TYPES);

/**
 * Result of misplaced structure check
 */
export interface MisplacedStructure {
  structure: Structure;
  reason: string;
}

/**
 * Find structures that are at invalid positions according to the blueprint.
 * This allows the system to destroy structures when blueprints are updated.
 * 
 * Only considers structures that are safe to destroy - excludes spawns, storage,
 * terminal, containers, walls, and ramparts as these are critical or player-controlled.
 * 
 * Roads are special: they are only considered misplaced if they are not part of:
 * - The blueprint's static road positions
 * - Calculated roads to sources, controller, and mineral
 * - Routes to remote mining rooms
 * 
 * @param room The room to check
 * @param anchor The blueprint anchor position (usually spawn)
 * @param blueprint The blueprint to validate against
 * @param remoteRooms Optional array of remote room names managed by this room
 */
export function findMisplacedStructures(
  room: Room,
  anchor: RoomPosition,
  blueprint: Blueprint,
  remoteRooms: string[] = []
): MisplacedStructure[] {
  const rcl = room.controller?.level ?? 1;
  const structures = getStructuresForRCL(blueprint, rcl);
  const terrain = room.getTerrain();
  const misplaced: MisplacedStructure[] = [];
  
  // Build a set of valid blueprint positions for each structure type
  const validPositions = new Map<BuildableStructureConstant, Set<string>>();
  
  for (const s of structures) {
    const x = anchor.x + s.x;
    const y = anchor.y + s.y;
    
    // Skip positions on room border (1-48 valid range) or on walls
    if (x < 1 || x > 48 || y < 1 || y > 48) continue;
    if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;
    
    const posKey = `${x},${y}`;
    if (!validPositions.has(s.structureType)) {
      validPositions.set(s.structureType, new Set());
    }
    validPositions.get(s.structureType)?.add(posKey);
  }
  
  // Add road positions using the road network planner
  // This includes:
  // - Blueprint roads (static positions around spawn)
  // - Roads to sources, controller, and mineral
  // - Roads to remote mining rooms
  const validRoadPositions = getValidRoadPositions(room, anchor, blueprint.roads, remoteRooms);
  validPositions.set(STRUCTURE_ROAD, validRoadPositions);
  
  // Add extractor position at mineral if RCL 6+
  if (rcl >= 6) {
    const minerals = room.find(FIND_MINERALS);
    if (minerals.length > 0) {
      const mineral = minerals[0];
      const extractorPositions = new Set<string>();
      extractorPositions.add(`${mineral.pos.x},${mineral.pos.y}`);
      validPositions.set(STRUCTURE_EXTRACTOR, extractorPositions);
    }
  }
  
  // Find existing structures of destroyable types using Set for O(1) lookup
  // Use FIND_STRUCTURES to include roads (which are unowned) and filter to our structures
  const existingStructures = room.find(FIND_STRUCTURES, {
    filter: s =>
      DESTROYABLE_STRUCTURE_SET.has(s.structureType as BuildableStructureConstant) &&
      (
        // Owned by us
        (s as OwnedStructure).my === true ||
        // Roads have no owner, so include them if they exist
        s.structureType === STRUCTURE_ROAD
      )
  });
  
  // Check each existing structure against blueprint positions
  for (const structure of existingStructures) {
    const posKey = `${structure.pos.x},${structure.pos.y}`;
    const structType = structure.structureType as BuildableStructureConstant;
    const validPosForType = validPositions.get(structType);
    
    // If this structure type is not in the blueprint, or this position is not valid
    if (!validPosForType || !validPosForType.has(posKey)) {
      misplaced.push({
        structure,
        reason: `${structure.structureType} at ${posKey} is not in blueprint`
      });
    }
  }
  
  return misplaced;
}

/**
 * Destroy structures at invalid positions according to the blueprint.
 * Returns the number of structures destroyed.
 * 
 * This is used when blueprints are updated and structures need to be rearranged
 * to meet the new requirements.
 * 
 * Roads are preserved if they are part of the road network (routes to sources,
 * controller, mineral, or remote rooms).
 * 
 * @param room The room to check
 * @param anchor The anchor position (usually the spawn)
 * @param blueprint The blueprint to validate against
 * @param maxDestroy Maximum number of structures to destroy per tick (default: 1)
 * @param remoteRooms Optional array of remote room names managed by this room
 */
export function destroyMisplacedStructures(
  room: Room,
  anchor: RoomPosition,
  blueprint: Blueprint,
  maxDestroy = 1,
  remoteRooms: string[] = []
): number {
  const misplaced = findMisplacedStructures(room, anchor, blueprint, remoteRooms);
  let destroyed = 0;
  
  for (const { structure, reason } of misplaced) {
    if (destroyed >= maxDestroy) break;
    
    // Attempt to destroy the structure
    const result = structure.destroy();
    if (result === OK) {
      destroyed++;
      logger.info(`Destroyed misplaced structure: ${reason}`, {
        subsystem: "Blueprint",
        room: structure.room.name,
        meta: { 
          structureType: structure.structureType, 
          pos: structure.pos.toString(),
          reason 
        }
      });
    }
  }
  
  return destroyed;
}

/**
 * Check if a position is suitable for a spawn
 */
export function isValidSpawnPosition(room: Room, x: number, y: number): boolean {
  const terrain = room.getTerrain();

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const px = x + dx;
      const py = y + dy;

      if (px < 1 || px > 48 || py < 1 || py > 48) return false;
      if (terrain.get(px, py) === TERRAIN_MASK_WALL) return false;
    }
  }

  return true;
}

/**
 * Find best spawn position for a new colony
 */
export function findBestSpawnPosition(room: Room): RoomPosition | null {
  const controller = room.controller;
  if (!controller) return null;

  const sources = room.find(FIND_SOURCES);
  const terrain = room.getTerrain();

  let sumX = controller.pos.x;
  let sumY = controller.pos.y;
  for (const source of sources) {
    sumX += source.pos.x;
    sumY += source.pos.y;
  }

  const centerX = Math.round(sumX / (sources.length + 1));
  const centerY = Math.round(sumY / (sources.length + 1));

  for (let radius = 0; radius < 15; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;

        const x = centerX + dx;
        const y = centerY + dy;

        if (x < 3 || x > 46 || y < 3 || y > 46) continue;

        if (isValidSpawnPosition(room, x, y)) {
          const distToController = Math.max(Math.abs(x - controller.pos.x), Math.abs(y - controller.pos.y));
          if (distToController > 20) continue;

          if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;

          return new RoomPosition(x, y, room.name);
        }
      }
    }
  }

  return null;
}

/**
 * Blueprint space and validation constants
 */
const DEFAULT_MIN_SPACE_RADIUS = 7;
const MAX_BUNKER_WALL_PERCENTAGE = 10; // Bunkers require mostly open terrain
const MAX_SPREAD_WALL_PERCENTAGE = 25; // Spread layouts are more flexible
const MAX_ANCHOR_SEARCH_RADIUS = 15; // Maximum distance from ideal center to search

/**
 * Validate if a blueprint can fit in the room at the given anchor position
 * 
 * @param room The room to check
 * @param anchor The anchor position for the blueprint
 * @param blueprint The blueprint to validate
 * @returns Object with validation result and details
 */
export function validateBlueprintFit(
  room: Room,
  anchor: RoomPosition,
  blueprint: Blueprint
): { fits: boolean; reason?: string; wallCount?: number; totalTiles?: number } {
  const terrain = room.getTerrain();
  const minRadius = blueprint.minSpaceRadius ?? DEFAULT_MIN_SPACE_RADIUS;
  
  let wallCount = 0;
  let totalTiles = 0;
  
  // Check if anchor is in valid range
  if (anchor.x < minRadius || anchor.x > 49 - minRadius ||
      anchor.y < minRadius || anchor.y > 49 - minRadius) {
    return { 
      fits: false, 
      reason: `Anchor too close to room edge (needs ${minRadius} tile margin)` 
    };
  }
  
  // Check all structure positions
  for (const structure of blueprint.structures) {
    const x = anchor.x + structure.x;
    const y = anchor.y + structure.y;
    
    if (x < 1 || x > 48 || y < 1 || y > 48) {
      return { 
        fits: false, 
        reason: `Structure ${structure.structureType} at (${structure.x},${structure.y}) would be outside room bounds` 
      };
    }
    
    totalTiles++;
    if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
      wallCount++;
    }
  }
  
  // Check road positions
  for (const road of blueprint.roads) {
    const x = anchor.x + road.x;
    const y = anchor.y + road.y;
    
    if (x < 1 || x > 48 || y < 1 || y > 48) {
      continue; // Roads outside bounds are okay, just skip them
    }
    
    totalTiles++;
    if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
      wallCount++;
    }
  }
  
  // Calculate wall percentage
  const wallPercentage = totalTiles > 0 ? (wallCount / totalTiles) * 100 : 0;
  
  // Bunker blueprints are strict - require mostly open terrain
  if (blueprint.type === "bunker" && wallPercentage > MAX_BUNKER_WALL_PERCENTAGE) {
    return {
      fits: false,
      reason: `Too many walls in blueprint area (${wallPercentage.toFixed(1)}% walls, max ${MAX_BUNKER_WALL_PERCENTAGE}% for bunker)`,
      wallCount,
      totalTiles
    };
  }
  
  // Spread blueprints are more flexible with terrain obstacles
  if (blueprint.type === "spread" && wallPercentage > MAX_SPREAD_WALL_PERCENTAGE) {
    return {
      fits: false,
      reason: `Too many walls in blueprint area (${wallPercentage.toFixed(1)}% walls, max ${MAX_SPREAD_WALL_PERCENTAGE}% for spread layout)`,
      wallCount,
      totalTiles
    };
  }
  
  return { fits: true, wallCount, totalTiles };
}

/**
 * Find the best anchor position for a blueprint in a room
 * 
 * @param room The room to search
 * @param blueprint The blueprint to place
 * @returns Best anchor position or null if blueprint doesn't fit anywhere
 */
export function findBestBlueprintAnchor(
  room: Room,
  blueprint: Blueprint
): RoomPosition | null {
  const controller = room.controller;
  if (!controller) return null;
  
  const sources = room.find(FIND_SOURCES);
  const mineral = room.find(FIND_MINERALS)[0];
  
  // Calculate ideal center point (between controller and sources)
  let sumX = controller.pos.x;
  let sumY = controller.pos.y;
  for (const source of sources) {
    sumX += source.pos.x;
    sumY += source.pos.y;
  }
  const idealX = Math.round(sumX / (sources.length + 1));
  const idealY = Math.round(sumY / (sources.length + 1));
  
  const minRadius = blueprint.minSpaceRadius ?? DEFAULT_MIN_SPACE_RADIUS;
  const candidates: { pos: RoomPosition; score: number }[] = [];
  
  // Search in expanding rings from ideal center
  for (let radius = 0; radius <= MAX_ANCHOR_SEARCH_RADIUS; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        // Only check positions on the current ring
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius && radius > 0) continue;
        
        const x = idealX + dx;
        const y = idealY + dy;
        
        // Skip if too close to edge
        if (x < minRadius || x > 49 - minRadius || y < minRadius || y > 49 - minRadius) {
          continue;
        }
        
        const pos = new RoomPosition(x, y, room.name);
        const validation = validateBlueprintFit(room, pos, blueprint);
        
        if (validation.fits) {
          // Score based on distance to key positions
          let score = 1000;
          
          // Prefer positions closer to controller (but not too close)
          const controllerDist = pos.getRangeTo(controller);
          if (controllerDist >= 4 && controllerDist <= 8) {
            score += 100;
          } else if (controllerDist < 4) {
            score -= 50;
          } else if (controllerDist > 12) {
            score -= 30;
          }
          
          // Prefer positions with good source access
          let totalSourceDist = 0;
          for (const source of sources) {
            totalSourceDist += pos.getRangeTo(source);
          }
          const avgSourceDist = totalSourceDist / sources.length;
          if (avgSourceDist >= 5 && avgSourceDist <= 10) {
            score += 80;
          } else if (avgSourceDist < 5) {
            score -= 20;
          }
          
          // Prefer positions closer to room center
          const centerDist = Math.abs(x - 25) + Math.abs(y - 25);
          if (centerDist < 10) {
            score += 50;
          } else if (centerDist > 20) {
            score -= 30;
          }
          
          // Bonus for fewer walls in blueprint area
          if (validation.wallCount !== undefined && validation.totalTiles !== undefined) {
            const wallPercentage = (validation.wallCount / validation.totalTiles) * 100;
            score += Math.max(0, 50 - wallPercentage * 2);
          }
          
          candidates.push({ pos, score });
        }
      }
    }
    
    // If we found candidates, return the best one
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      return candidates[0].pos;
    }
  }
  
  return null;
}

/**
 * Select the best blueprint for a room based on terrain and RCL
 * 
 * Tries bunker layout first (most efficient), falls back to spread layout if terrain doesn't allow.
 * This implements the dynamic blueprint selection system.
 * 
 * @param room The room to select a blueprint for
 * @param rcl The room control level
 * @returns Selected blueprint and anchor position, or null if no valid layout found
 */
export function selectBestBlueprint(
  room: Room,
  rcl: number
): { blueprint: Blueprint; anchor: RoomPosition } | null {
  // For RCL 8, try compact bunker first
  if (rcl >= 8) {
    const bunkerAnchor = findBestBlueprintAnchor(room, COMPACT_BUNKER_BLUEPRINT);
    if (bunkerAnchor) {
      return { blueprint: COMPACT_BUNKER_BLUEPRINT, anchor: bunkerAnchor };
    }
    // Fall back to war-ready spread layout if bunker doesn't fit
    const warAnchor = findBestBlueprintAnchor(room, WAR_READY_BLUEPRINT);
    if (warAnchor) {
      return { blueprint: WAR_READY_BLUEPRINT, anchor: warAnchor };
    }
  }
  
  // For RCL 7, try war-ready layout
  if (rcl >= 7) {
    const warAnchor = findBestBlueprintAnchor(room, WAR_READY_BLUEPRINT);
    if (warAnchor) {
      return { blueprint: WAR_READY_BLUEPRINT, anchor: warAnchor };
    }
  }
  
  // For RCL 5-6, try economic maturity
  if (rcl >= 5) {
    const economicAnchor = findBestBlueprintAnchor(room, ECONOMIC_MATURITY_BLUEPRINT);
    if (economicAnchor) {
      return { blueprint: ECONOMIC_MATURITY_BLUEPRINT, anchor: economicAnchor };
    }
  }
  
  // For RCL 3-4, try core colony
  if (rcl >= 3) {
    const coreAnchor = findBestBlueprintAnchor(room, CORE_COLONY_BLUEPRINT);
    if (coreAnchor) {
      return { blueprint: CORE_COLONY_BLUEPRINT, anchor: coreAnchor };
    }
  }
  
  // For RCL 1-2, use early colony (should almost always fit)
  const earlyAnchor = findBestBlueprintAnchor(room, EARLY_COLONY_BLUEPRINT);
  if (earlyAnchor) {
    return { blueprint: EARLY_COLONY_BLUEPRINT, anchor: earlyAnchor };
  }
  
  // Last resort: find ANY suitable spawn position
  const fallbackAnchor = findBestSpawnPosition(room);
  if (fallbackAnchor) {
    return { blueprint: EARLY_COLONY_BLUEPRINT, anchor: fallbackAnchor };
  }
  
  return null;
}
