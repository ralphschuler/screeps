/**
 * Collection Point Manager
 *
 * Manages collection points for idle creeps to prevent spawn blockades.
 * A collection point is a designated position away from spawns where idle creeps
 * wait instead of blocking spawn areas.
 *
 * Design Principles (from ROADMAP.md):
 * - Prevent spawn blockades by moving idle creeps to designated collection points
 * - Use stigmergic communication (room memory) for decentralized coordination
 * - CPU-efficient: calculate once per room, reuse until invalidated
 */

import type { SwarmState } from "../../memory/schemas";
import { createLogger } from "@ralphschuler/screeps-core";
import { globalCache } from "@ralphschuler/screeps-cache";

const logger = createLogger("CollectionPoint");

// =============================================================================
// Constants
// =============================================================================

/** Minimum distance from spawn for collection point */
const MIN_DISTANCE_FROM_SPAWN = 5;

/** Preferred distance from spawn for collection point */
const PREFERRED_DISTANCE_FROM_SPAWN = 8;

/** Maximum distance from spawn (to keep creeps reasonably close) */
const MAX_DISTANCE_FROM_SPAWN = 15;

/** How often to recalculate collection point (in ticks) */
const RECALCULATION_INTERVAL = 500;

/** Weight for storage distance in scoring (lower = prefer closer to storage) */
const STORAGE_DISTANCE_WEIGHT = 0.5;

/** Weight for controller distance in scoring (lower = prefer closer to controller) */
const CONTROLLER_DISTANCE_WEIGHT = 0.3;

/** Penalty for collection point being on a road */
const ROAD_PENALTY = 5;

/** Number of candidates to collect before early exit optimization kicks in */
const EARLY_EXIT_CANDIDATE_COUNT = 50;

/** Cache namespace for collection points */
const CACHE_NAMESPACE = "collectionPoint";

// =============================================================================
// Public API
// =============================================================================

/**
 * Get the collection point for a room.
 * Returns cached position if available and recent, otherwise calculates a new one.
 *
 * @param room - The room to get collection point for
 * @param swarmState - The room's swarm state (for memory persistence)
 * @returns The collection point position, or null if none can be determined
 */
export function getCollectionPoint(room: Room, swarmState: SwarmState): RoomPosition | null {
  // Check unified cache first
  const cached = globalCache.get<{ x: number; y: number }>(room.name, {
    namespace: CACHE_NAMESPACE,
    ttl: RECALCULATION_INTERVAL
  });
  
  if (cached) {
    return new RoomPosition(cached.x, cached.y, room.name);
  }

  // Check memory for stored collection point
  if (swarmState.collectionPoint) {
    // Validate coordinates are valid numbers before constructing RoomPosition
    const x = swarmState.collectionPoint.x;
    const y = swarmState.collectionPoint.y;
    
    if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y) && 
        x >= 0 && x < 50 && y >= 0 && y < 50) {
      const pos = new RoomPosition(x, y, room.name);
      // Validate the stored position is still valid
      if (isValidCollectionPoint(room, pos)) {
        // Cache it in unified cache for quick access
        globalCache.set(room.name, { x, y }, {
          namespace: CACHE_NAMESPACE,
          ttl: RECALCULATION_INTERVAL
        });
        return pos;
      }
    }
    // Position is invalid or no longer valid, will recalculate below
  }

  // Calculate a new collection point
  const newPos = calculateCollectionPoint(room);
  if (newPos) {
    // Store in memory for persistence across ticks
    swarmState.collectionPoint = { x: newPos.x, y: newPos.y };
    // Cache in unified cache for fast access
    globalCache.set(room.name, { x: newPos.x, y: newPos.y }, {
      namespace: CACHE_NAMESPACE,
      ttl: RECALCULATION_INTERVAL
    });
    logger.info(`Calculated new collection point at ${newPos.x},${newPos.y}`, room.name);
  } else {
    // Clear invalid collection point from memory
    swarmState.collectionPoint = undefined;
    // Also clear from unified cache
    globalCache.invalidate(room.name, CACHE_NAMESPACE);
    logger.warn(`Failed to calculate collection point for room`, room.name);
  }

  return newPos;
}

/**
 * Invalidate the collection point cache for a room.
 * Call this when room layout changes (new structures built/destroyed).
 *
 * @param roomName - The room name to invalidate
 */
export function invalidateCollectionPoint(roomName: string): void {
  globalCache.invalidate(roomName, CACHE_NAMESPACE);
  logger.debug(`Invalidated collection point cache for ${roomName}`, roomName);
}

// =============================================================================
// Internal Functions
// =============================================================================

/**
 * Check if we should exit early from the search based on candidate count and distance.
 * Early exit when we have enough good candidates at or beyond preferred distance.
 *
 * @param candidateCount - Number of candidates found so far
 * @param distance - Current search distance from spawn
 * @returns true if we should exit early
 */
function shouldEarlyExit(candidateCount: number, distance: number): boolean {
  return candidateCount >= EARLY_EXIT_CANDIDATE_COUNT && distance >= PREFERRED_DISTANCE_FROM_SPAWN;
}

/**
 * Calculate an optimal collection point for a room.
 * Finds a position that is:
 * - Away from spawns (MIN_DISTANCE_FROM_SPAWN or more)
 * - Walkable and not blocked by structures
 * - Preferably near storage or controller (common gathering points)
 * - Not on room exits
 *
 * OPTIMIZATION: Uses a ring search pattern instead of full room scan to reduce CPU cost.
 * Ring search starts at PREFERRED_DISTANCE_FROM_SPAWN and expands outward.
 *
 * @param room - The room to calculate collection point for
 * @returns The optimal position, or null if none found
 */
function calculateCollectionPoint(room: Room): RoomPosition | null {
  const spawns = room.find(FIND_MY_SPAWNS);
  if (spawns.length === 0) {
    return null;
  }

  // Get the primary spawn (first one)
  const primarySpawn = spawns[0];

  // Find the storage or controller as a secondary anchor point
  const storage = room.storage;
  const controller = room.controller;

  // Pre-build structure lookup maps for performance (single lookFor call)
  const roadMap = new Map<string, boolean>(); // key: "x,y", value: true if has road
  const blockingMap = new Map<string, boolean>(); // key: "x,y", value: true if blocked
  const structures = room.find(FIND_STRUCTURES);
  for (const struct of structures) {
    const key = `${struct.pos.x},${struct.pos.y}`;
    
    // Track roads separately for scoring
    if (struct.structureType === STRUCTURE_ROAD) {
      roadMap.set(key, true);
    }
    
    // Track blocking structures
    const isBlocking = 
      struct.structureType !== STRUCTURE_ROAD &&
      struct.structureType !== STRUCTURE_CONTAINER &&
      !(struct.structureType === STRUCTURE_RAMPART && (struct ).my);
    
    if (isBlocking) {
      blockingMap.set(key, true);
    }
  }

  // Generate candidate positions using ring search (more efficient than full grid)
  const candidates: { pos: RoomPosition; score: number }[] = [];
  const terrain = room.getTerrain();

  // Ring search: check positions at distances from MIN to MAX from spawn
  for (let distance = MIN_DISTANCE_FROM_SPAWN; distance <= MAX_DISTANCE_FROM_SPAWN; distance++) {
    // Search in a ring at this distance
    const x0 = primarySpawn.pos.x;
    const y0 = primarySpawn.pos.y;

    // Check positions in a square ring around spawn at this distance
    for (let dx = -distance; dx <= distance; dx++) {
      for (let dy = -distance; dy <= distance; dy++) {
        // Only check positions approximately at this distance (ring, not filled square)
        const actualDist = Math.max(Math.abs(dx), Math.abs(dy));
        if (actualDist !== distance) continue;

        const x = x0 + dx;
        const y = y0 + dy;

        // Skip positions outside valid room bounds (avoid exits)
        if (x < 3 || x > 46 || y < 3 || y > 46) continue;

        const pos = new RoomPosition(x, y, room.name);

        // Skip if not walkable
        if (!isWalkableWithMap(pos, terrain, blockingMap)) {
          continue;
        }

        // Score the position
        let score = 0;

        // Prefer positions at PREFERRED_DISTANCE_FROM_SPAWN
        const distanceDiff = Math.abs(distance - PREFERRED_DISTANCE_FROM_SPAWN);
        score -= distanceDiff; // Lower difference = higher score

        // Prefer positions closer to storage (if it exists)
        if (storage) {
          const storageDistance = pos.getRangeTo(storage.pos);
          score -= storageDistance * STORAGE_DISTANCE_WEIGHT;
        }

        // Prefer positions closer to controller (if it exists)
        if (controller) {
          const controllerDistance = pos.getRangeTo(controller.pos);
          score -= controllerDistance * CONTROLLER_DISTANCE_WEIGHT;
        }

        // Avoid positions on roads (use pre-built map)
        const hasRoad = roadMap.get(`${x},${y}`) ?? false;
        if (hasRoad) {
          score -= ROAD_PENALTY;
        }

        candidates.push({ pos, score });

        // Check for early exit
        if (shouldEarlyExit(candidates.length, distance)) {
          break;
        }
      }
      if (shouldEarlyExit(candidates.length, distance)) {
        break;
      }
    }

    // Check for early exit at ring level
    if (shouldEarlyExit(candidates.length, distance)) {
      break;
    }
  }

  // Sort by score (highest first)
  candidates.sort((a, b) => b.score - a.score);

  // Return the best candidate
  return candidates.length > 0 ? candidates[0].pos : null;
}

/**
 * Check if a position is walkable using a pre-built blocking map.
 * More efficient than isWalkable when checking many positions.
 *
 * @param pos - The position to check
 * @param terrain - The room terrain (for performance)
 * @param blockingMap - Pre-built map of blocking structures
 * @returns true if the position is walkable
 */
function isWalkableWithMap(
  pos: RoomPosition, 
  terrain: RoomTerrain, 
  blockingMap: Map<string, boolean>
): boolean {
  // Check terrain
  if (terrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL) {
    return false;
  }

  // Check for blocking structures using pre-built map
  const key = `${pos.x},${pos.y}`;
  const isBlocked = blockingMap.get(key) ?? false;
  
  return !isBlocked;
}

/**
 * Check if a position is walkable (not a wall and no blocking structures).
 * Used for validation outside of the optimization path.
 *
 * @param room - The room containing the position
 * @param pos - The position to check
 * @param terrain - The room terrain (for performance)
 * @returns true if the position is walkable
 */
function isWalkable(room: Room, pos: RoomPosition, terrain: RoomTerrain): boolean {
  // Check terrain
  if (terrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL) {
    return false;
  }

  // Check for blocking structures
  const structures = room.lookForAt(LOOK_STRUCTURES, pos.x, pos.y);
  const blocked = structures.some(s => {
    // Roads, containers, and friendly ramparts don't block
    if (s.structureType === STRUCTURE_ROAD) return false;
    if (s.structureType === STRUCTURE_CONTAINER) return false;
    if (s.structureType === STRUCTURE_RAMPART && (s as StructureRampart).my) return false;
    // Everything else blocks
    return true;
  });

  return !blocked;
}

/**
 * Check if a stored collection point is still valid.
 * Valid if it's walkable and meets distance requirements from spawn.
 *
 * @param room - The room containing the position
 * @param pos - The position to validate
 * @returns true if the position is still valid
 */
function isValidCollectionPoint(room: Room, pos: RoomPosition): boolean {
  const terrain = room.getTerrain();

  // Must be walkable
  if (!isWalkable(room, pos, terrain)) {
    return false;
  }

  // Check distance from spawn
  const spawns = room.find(FIND_MY_SPAWNS);
  if (spawns.length === 0) {
    return false;
  }

  const spawnDistance = pos.getRangeTo(spawns[0].pos);
  if (spawnDistance < MIN_DISTANCE_FROM_SPAWN || spawnDistance > MAX_DISTANCE_FROM_SPAWN) {
    return false;
  }

  return true;
}
