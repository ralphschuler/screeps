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
import { getStructureLimits } from "./constants";
import { addExtensionsToBlueprint } from "../extensionGenerator";

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

const MAX_DYNAMIC_RELOCATE_RADIUS = 6;

/**
 * Prioritize placement order so critical structures are guaranteed first.
 */
function getStructurePriority(structureType: BuildableStructureConstant): number {
  switch (structureType) {
    case STRUCTURE_SPAWN:
      return 100;
    case STRUCTURE_STORAGE:
      return 95;
    case STRUCTURE_TERMINAL:
      return 90;
    case STRUCTURE_TOWER:
      return 85;
    case STRUCTURE_LINK:
      return 80;
    case STRUCTURE_LAB:
      return 75;
    case STRUCTURE_EXTENSION:
      return 50;
    default:
      return 20;
  }
}

/**
 * Check whether a room coordinate is in buildable range and terrain.
 */
function isBuildableTile(room: Room, x: number, y: number): boolean {
  if (x < 1 || x > 48 || y < 1 || y > 48) {
    return false;
  }

  return room.getTerrain().get(x, y) !== TERRAIN_MASK_WALL;
}

/**
 * Find a buildable replacement tile close to a preferred tile.
 *
 * This allows fixed blueprints to remain mostly intact while skipping
 * impossible tiles due to irregular terrain.
 */
function findReplacementTile(
  room: Room,
  preferredX: number,
  preferredY: number,
  occupied: Set<string>,
  maxRadius = MAX_DYNAMIC_RELOCATE_RADIUS
): { x: number; y: number } | null {
  if (isBuildableTile(room, preferredX, preferredY) && !occupied.has(`${preferredX},${preferredY}`)) {
    return { x: preferredX, y: preferredY };
  }

  for (let radius = 1; radius <= maxRadius; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) {
          continue;
        }

        const x = preferredX + dx;
        const y = preferredY + dy;
        if (!isBuildableTile(room, x, y)) continue;
        if (occupied.has(`${x},${y}`)) continue;

        return { x, y };
      }
    }
  }

  return null;
}

/**
 * Build a terrain-adaptive fallback blueprint when pre-computed blueprints
 * cannot be placed directly.
 */
function buildTerrainAdaptiveBlueprint(room: Room, rcl: number, anchor: RoomPosition): Blueprint {
  const blueprint = getBlueprintForRCL(rcl);
  const baseStructures = getStructuresForRCL(blueprint, rcl);

  const orderedStructures = [...baseStructures].sort((a, b) => {
    const priorityDelta = getStructurePriority(b.structureType) - getStructurePriority(a.structureType);
    if (priorityDelta !== 0) return priorityDelta;

    return b.structureType.localeCompare(a.structureType);
  });

  const occupied = new Set<string>();
  const structures: StructurePlacement[] = [];

  for (const structure of orderedStructures) {
    const preferredX = anchor.x + structure.x;
    const preferredY = anchor.y + structure.y;

    const placed = findReplacementTile(room, preferredX, preferredY, occupied);
    if (!placed) {
      continue;
    }

    const relativeX = placed.x - anchor.x;
    const relativeY = placed.y - anchor.y;

    structures.push({
      structureType: structure.structureType,
      x: relativeX,
      y: relativeY
    });

    occupied.add(`${placed.x},${placed.y}`);
  }

  const roads = blueprint.roads
    .map(road => ({ x: road.x, y: road.y }))
    .filter(pos => {
      const x = anchor.x + pos.x;
      const y = anchor.y + pos.y;
      return isBuildableTile(room, x, y) && !occupied.has(`${x},${y}`);
    });

  return {
    name: `adaptive-${blueprint.name}-rcl-${Math.max(1, Math.min(8, Math.floor(rcl)))}`,
    rcl: Math.max(1, Math.min(8, Math.floor(rcl))),
    anchor: {
      x: anchor.x,
      y: anchor.y
    },
    structures,
    roads,
    ramparts: [],
    type: "dynamic",
    minSpaceRadius: 3
  };
}

/**
 * Select the best blueprint for a room based on terrain and RCL
 *
 * Tries bunker layout first (most efficient), falls back to spread layout if terrain doesn't allow.
 * Falls back to terrain-adaptive generation when rigid blueprints cannot be placed.
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

  // Last resort: any suitable spawn position + terrain-adaptive layout.
  const fallbackAnchor = findBestSpawnPosition(room);
  if (fallbackAnchor) {
    const adaptiveBlueprint = buildTerrainAdaptiveBlueprint(room, rcl, fallbackAnchor);

    // Ensure we at least place a spawn (bootstrap safety)
    const hasSpawn = adaptiveBlueprint.structures.some(struct => struct.structureType === STRUCTURE_SPAWN);
    if (hasSpawn) {
      return { blueprint: adaptiveBlueprint, anchor: fallbackAnchor };
    }

    return {
      blueprint: EARLY_COLONY_BLUEPRINT,
      anchor: fallbackAnchor
    };
  }

  return null;
}
