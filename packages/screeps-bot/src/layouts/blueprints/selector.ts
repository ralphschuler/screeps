/**
 * Blueprint selection logic - chooses the best blueprint for a room based on RCL and terrain
 */

import { addExtensionsToBlueprint } from "../extensionGenerator";
import { getStructureLimits } from "./constants";
import { COMPACT_BUNKER_BLUEPRINT } from "./definitions/compact-bunker";
import { CORE_COLONY_BLUEPRINT } from "./definitions/core-colony";
import { EARLY_COLONY_BLUEPRINT } from "./definitions/early-colony";
import { ECONOMIC_MATURITY_BLUEPRINT } from "./definitions/economic-maturity";
import { WAR_READY_BLUEPRINT } from "./definitions/war-ready";
import type { Blueprint, EvolutionStage, StructurePlacement } from "./types";
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
  if (rcl >= 7) return WAR_READY_BLUEPRINT;
  if (rcl >= 5) return ECONOMIC_MATURITY_BLUEPRINT;
  if (rcl >= 3) return CORE_COLONY_BLUEPRINT;
  return EARLY_COLONY_BLUEPRINT;
}

/**
 * Get structures for a specific RCL from a blueprint
 * Filters structures based on RCL limits and adds extensions to reach the limit
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
