/**
 * Base Blueprints - Phase 5
 *
 * Pre-computed coordinate arrays for base layouts at different RCL stages.
 */

import type { EvolutionStage } from "../memory/schemas";
import { addExtensionsToBlueprint } from "./extensionGenerator";

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
 */
export function findMisplacedStructures(room: Room, anchor: RoomPosition, blueprint: Blueprint): MisplacedStructure[] {
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
  
  // Add road positions
  const roadPositions = new Set<string>();
  for (const r of blueprint.roads) {
    const x = anchor.x + r.x;
    const y = anchor.y + r.y;
    if (x >= 1 && x <= 48 && y >= 1 && y <= 48 && terrain.get(x, y) !== TERRAIN_MASK_WALL) {
      roadPositions.add(`${x},${y}`);
    }
  }
  validPositions.set(STRUCTURE_ROAD, roadPositions);
  
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
 * @param room The room to check
 * @param anchor The anchor position (usually the spawn)
 * @param blueprint The blueprint to validate against
 * @param maxDestroy Maximum number of structures to destroy per tick (default: 1)
 */
export function destroyMisplacedStructures(
  room: Room,
  anchor: RoomPosition,
  blueprint: Blueprint,
  maxDestroy = 1
): number {
  const misplaced = findMisplacedStructures(room, anchor, blueprint);
  let destroyed = 0;
  
  for (const { structure, reason } of misplaced) {
    if (destroyed >= maxDestroy) break;
    
    // Attempt to destroy the structure
    const result = structure.destroy();
    if (result === OK) {
      destroyed++;
      // Log the destruction for debugging
      console.log(`[Blueprint] Destroyed misplaced ${reason}`);
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
