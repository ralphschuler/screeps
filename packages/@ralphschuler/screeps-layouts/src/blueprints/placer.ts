/**
 * Blueprint placement logic - handles construction site placement and misplaced structure detection
 */

import type { Blueprint, MisplacedStructure, StructurePlacement } from "./types";
import { getStructuresForRCL } from "./selector";
import { getValidRoadPositions } from "../roadNetworkPlanner";
import { logger } from "@ralphschuler/screeps-kernel";
import { getStructureLimits } from "./constants";

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
