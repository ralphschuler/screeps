/**
 * Blueprint serialization - import/export functionality
 */

import { logger } from "@ralphschuler/screeps-core";
import type { Blueprint } from "./types";

/**
 * Export blueprint to JSON format for sharing
 * 
 * @param blueprint The blueprint to export
 * @returns JSON string representation
 */
export function exportBlueprint(blueprint: Blueprint): string {
  return JSON.stringify(blueprint, null, 2);
}

/**
 * Import blueprint from JSON format
 * 
 * @param json JSON string representation of a blueprint
 * @returns Parsed blueprint or null if invalid
 */
export function importBlueprint(json: string): Blueprint | null {
  try {
    const blueprint = JSON.parse(json) as Blueprint;
    
    // Validate required fields
    if (!blueprint.name || typeof blueprint.name !== 'string') return null;
    if (!blueprint.rcl || typeof blueprint.rcl !== 'number') return null;
    if (!blueprint.anchor || typeof blueprint.anchor.x !== 'number' || typeof blueprint.anchor.y !== 'number') return null;
    if (!Array.isArray(blueprint.structures)) return null;
    if (!Array.isArray(blueprint.roads)) return null;
    if (!Array.isArray(blueprint.ramparts)) return null;
    
    // Validate structure placements
    for (const struct of blueprint.structures) {
      if (typeof struct.x !== 'number' || typeof struct.y !== 'number') return null;
      if (typeof struct.structureType !== 'string') return null;
    }
    
    // Validate road and rampart positions
    for (const road of blueprint.roads) {
      if (typeof road.x !== 'number' || typeof road.y !== 'number') return null;
    }
    
    for (const rampart of blueprint.ramparts) {
      if (typeof rampart.x !== 'number' || typeof rampart.y !== 'number') return null;
    }
    
    return blueprint;
  } catch (error) {
    logger.error(`Failed to import blueprint: ${error}`, { subsystem: "Blueprint" });
    return null;
  }
}
