/**
 * Blueprint selection logic - chooses the best blueprint for a room based on RCL and terrain
 */

import type { Blueprint, EvolutionStage, StructurePlacement } from "./types";
import { EARLY_COLONY_BLUEPRINT } from "./definitions/early-colony";
import { CORE_COLONY_BLUEPRINT } from "./definitions/core-colony";
import { ECONOMIC_MATURITY_BLUEPRINT } from "./definitions/economic-maturity";
import { WAR_READY_BLUEPRINT } from "./definitions/war-ready";
import { COMPACT_BUNKER_BLUEPRINT } from "./definitions/compact-bunker";
import { findBestBlueprintAnchor, findBestSpawnPosition } from "./validator";

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
 * Get blueprint for specific RCL
 */
export function getBlueprintForRCL(rcl: number): Blueprint {
  if (rcl >= 8) return COMPACT_BUNKER_BLUEPRINT;
  if (rcl >= 7) return WAR_READY_BLUEPRINT;
  if (rcl >= 5) return ECONOMIC_MATURITY_BLUEPRINT;
  if (rcl >= 3) return CORE_COLONY_BLUEPRINT;
  return EARLY_COLONY_BLUEPRINT;
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
 * Get structures for a specific RCL from a blueprint
 * Filters structures based on RCL limits
 */
export function getStructuresForRCL(blueprint: Blueprint, rcl: number): StructurePlacement[] {
  const limits = getStructureLimits(rcl);
  const counts: Record<string, number> = {};

  const structures = blueprint.structures.filter(s => {
    const type = s.structureType;
    const limit = limits[type] ?? 0;
    const current = counts[type] ?? 0;

    if (current >= limit) return false;

    counts[type] = current + 1;
    return true;
  });

  return structures;
}

/**
 * Get blueprint for a specific RCL (alias for getBlueprintForRCL)
 */
export function getBlueprint(rcl: number): Blueprint {
  return getBlueprintForRCL(rcl);
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
