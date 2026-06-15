/**
 * Blueprint placement logic - handles construction site placement and misplaced structure detection
 */

import type { Blueprint, MisplacedStructure, StructurePlacement } from "./types";
import { getStructuresForRCL } from "./selector";
import { getProtectedLinkPositionKeys } from "../linkNetworkPlanner";
import { getValidRoadPositions } from "../roadNetworkPlanner";
import { logger } from "@ralphschuler/screeps-core";
import { getStructureLimits } from "./constants";

/**
 * Structure types that can be destroyed for blueprint rearrangement.
 * Keep this intentionally narrow: automatic cleanup must not remove expensive
 * or strategically important structures just because a layout anchor moved.
 */
const DESTROYABLE_STRUCTURE_TYPES: BuildableStructureConstant[] = [
  STRUCTURE_EXTENSION,
  STRUCTURE_ROAD
];

/** Set for O(1) lookup of destroyable structure types */
const DESTROYABLE_STRUCTURE_SET = new Set<BuildableStructureConstant>(DESTROYABLE_STRUCTURE_TYPES);
const MAX_ALTERNATE_PLACEMENT_RADIUS = 6;

function positionKey(x: number, y: number): string {
  return `${x},${y}`;
}

function isInBuildableRoomBounds(x: number, y: number): boolean {
  return x >= 1 && x <= 48 && y >= 1 && y <= 48;
}

function isRampartOrRoad(structureType: StructureConstant): boolean {
  return structureType === STRUCTURE_RAMPART || structureType === STRUCTURE_ROAD;
}

function blocksConstructionPlacement(
  existingStructureType: StructureConstant,
  plannedStructureType: BuildableStructureConstant
): boolean {
  if (plannedStructureType === STRUCTURE_RAMPART) {
    return existingStructureType === STRUCTURE_RAMPART || existingStructureType === STRUCTURE_WALL;
  }

  if (plannedStructureType === STRUCTURE_ROAD) {
    return existingStructureType === STRUCTURE_ROAD || !isRampartOrRoad(existingStructureType);
  }

  return !isRampartOrRoad(existingStructureType);
}

function isPositionUsableForConstruction(
  x: number,
  y: number,
  structureType: BuildableStructureConstant,
  terrain: RoomTerrain,
  existingStructures: Structure[],
  existingSites: ConstructionSite[],
  reservedPositions: Set<string>
): boolean {
  if (!isInBuildableRoomBounds(x, y)) return false;
  if (terrain.get(x, y) === TERRAIN_MASK_WALL) return false;

  const posKey = positionKey(x, y);
  if (reservedPositions.has(posKey)) return false;

  const blockingStructure = existingStructures.some(
    structure =>
      structure.pos.x === x &&
      structure.pos.y === y &&
      blocksConstructionPlacement(structure.structureType, structureType)
  );
  if (blockingStructure) return false;

  // Construction sites do not stack reliably; keep alternates clear.
  return !existingSites.some(site => site.pos.x === x && site.pos.y === y);
}

function getAlternatePlacementCandidates(
  preferredX: number,
  preferredY: number,
  allowAlternate: boolean
): Array<{ x: number; y: number }> {
  const candidates: Array<{ x: number; y: number }> = [{ x: preferredX, y: preferredY }];
  if (!allowAlternate) return candidates;

  for (let radius = 1; radius <= MAX_ALTERNATE_PLACEMENT_RADIUS; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
        candidates.push({ x: preferredX + dx, y: preferredY + dy });
      }
    }
  }

  return candidates;
}

function tryCreateConstructionSiteNear(
  room: Room,
  preferredX: number,
  preferredY: number,
  structureType: BuildableStructureConstant,
  terrain: RoomTerrain,
  existingStructures: Structure[],
  existingSites: ConstructionSite[],
  reservedPositions: Set<string>,
  allowAlternate = true
): boolean {
  for (const candidate of getAlternatePlacementCandidates(preferredX, preferredY, allowAlternate)) {
    if (
      !isPositionUsableForConstruction(
        candidate.x,
        candidate.y,
        structureType,
        terrain,
        existingStructures,
        existingSites,
        reservedPositions
      )
    ) {
      continue;
    }

    const result = room.createConstructionSite(candidate.x, candidate.y, structureType);
    if (result === OK) {
      reservedPositions.add(positionKey(candidate.x, candidate.y));
      return true;
    }

    if (result === ERR_RCL_NOT_ENOUGH || result === ERR_INVALID_ARGS) {
      return false;
    }
  }

  return false;
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
  const reservedPositions = new Set<string>();

  for (const s of allStructures) {
    const currentCount = structureCounts[s.structureType] ?? 0;
    const limit = limits[s.structureType] ?? 0;
    if (currentCount >= limit) continue;

    const x = anchor.x + s.x;
    const y = anchor.y + s.y;
    const allowAlternate = s.structureType !== STRUCTURE_EXTRACTOR;

    const created = tryCreateConstructionSiteNear(
      room,
      x,
      y,
      s.structureType,
      terrain,
      existingStructures,
      existingSites,
      reservedPositions,
      allowAlternate
    );

    if (created) {
      placed++;
      structureCounts[s.structureType] = currentCount + 1;

      if (placed >= 3 || existingSites.length + placed >= 10) break;
    }
  }

  if (placed < 3 && existingSites.length + placed < 10) {
    for (const r of blueprint.roads) {
      const x = anchor.x + r.x;
      const y = anchor.y + r.y;

      const created = tryCreateConstructionSiteNear(
        room,
        x,
        y,
        STRUCTURE_ROAD,
        terrain,
        existingStructures,
        existingSites,
        reservedPositions
      );

      if (created) {
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

  // Dynamic link networks are room-specific and intentionally planned outside
  // static blueprints. Preserve planned/functional storage, controller, spawn,
  // and source links so cleanup does not destroy productive infrastructure.
  const protectedLinkPositions = getProtectedLinkPositionKeys(room);
  if (protectedLinkPositions.size > 0) {
    const linkPositions = validPositions.get(STRUCTURE_LINK) ?? new Set<string>();
    for (const posKey of protectedLinkPositions) {
      linkPositions.add(posKey);
    }
    validPositions.set(STRUCTURE_LINK, linkPositions);
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
