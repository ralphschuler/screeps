/**
 * Remote Mining Movement Utilities
 *
 * Optimized movement functions for remote mining operations that use
 * centralized path caching to reduce CPU waste from repeated pathfinding.
 *
 * Performance Optimization (ROADMAP Section 20):
 * - Uses centralized path cache to share paths across multiple creeps
 * - Falls back to screeps-cartographer's moveTo for cache misses
 * - Automatically caches new paths for future use
 *
 * CPU Impact:
 * - PathFinder.search: 0.5-2.0 CPU per call
 * - Cache lookup: ~0.05 CPU
 * - Expected savings: 80-90% reduction for remote mining pathfinding
 */

import { createLogger } from "../core/logger";
import { type RemoteRouteType, cacheRemoteMiningPath, getRemoteMiningPath } from "./remotePathCache";
import { moveTo } from "screeps-cartographer";

const logger = createLogger("RemoteMiningMovement");

/**
 * Move a creep to a target using cached remote mining paths when available.
 * 
 * This function provides optimized movement for remote mining operations by:
 * 1. Checking the centralized path cache first
 * 2. Using moveByPath if a cached path exists (very cheap)
 * 3. Falling back to cartographer's moveTo for cache misses
 * 4. Automatically caching successful paths for future use
 *
 * @param creep - The creep to move
 * @param target - Target position or object
 * @param routeType - Type of remote route (harvester or hauler)
 * @param options - Optional movement options
 * @returns Movement result code
 */
export function moveToWithRemoteCache(
  creep: Creep,
  target: RoomPosition | { pos: RoomPosition },
  routeType: RemoteRouteType,
  options: MoveToOpts = {}
): ScreepsReturnCode {
  const targetPos = target instanceof RoomPosition ? target : target.pos;
  
  // Check centralized cache first
  const cachedPath = getRemoteMiningPath(creep.pos, targetPos, routeType);
  
  if (cachedPath && cachedPath.length > 0) {
    // Cache hit - use moveByPath (very cheap, no pathfinding)
    logger.debug(`Using cached path for ${creep.name} (${routeType})`, {
      meta: { pathLength: cachedPath.length }
    });
    
    // moveByPath expects the path to start from current position or adjacent
    // If creep is on the path or near it, use moveByPath
    const firstStep = cachedPath[0];
    const onPath = creep.pos.x === firstStep.x && 
                   creep.pos.y === firstStep.y && 
                   creep.pos.roomName === creep.room.name;
    const nearPath = creep.pos.getRangeTo(new RoomPosition(firstStep.x, firstStep.y, creep.room.name)) <= 1;
    
    if (onPath || nearPath) {
      const moveByPathResult = creep.moveByPath(cachedPath);
      
      // If moveByPath succeeded, we're done
      if (moveByPathResult === OK || moveByPathResult === ERR_TIRED) {
        return moveByPathResult;
      }
      
      // If moveByPath failed, log and fall through to moveTo
      logger.debug(`moveByPath failed for ${creep.name}, falling back to moveTo`, {
        meta: { result: moveByPathResult, onPath, nearPath }
      });
    }
  }
  
  // Cache miss or moveByPath failed - use cartographer's moveTo
  // Cartographer will handle pathfinding and its own caching
  const moveToResult = moveTo(creep, target, {
    ...options,
    maxRooms: 16, // Allow multi-room pathfinding for remote mining
  });
  
  // If movement was successful and we have a valid path, cache it for future use
  // Note: We only cache on successful pathfinding (OK or ERR_TIRED means path was found)
  if ((moveToResult === OK || moveToResult === ERR_TIRED) && !cachedPath) {
    // Try to extract the path from cartographer's internal cache to store in our centralized cache
    // This is opportunistic - if we can't get the path, we'll cache it next time
    tryCachePath(creep, targetPos, routeType);
  }
  
  return moveToResult;
}

/**
 * Attempt to cache a path after successful pathfinding.
 * This is called after cartographer's moveTo succeeds to populate our centralized cache.
 * 
 * Note: This function uses PathFinder to recalculate the path for caching.
 * While this adds some CPU cost on cache misses, it's a one-time cost that saves
 * significant CPU on future ticks when multiple creeps use the cached path.
 *
 * @param creep - The creep that just moved
 * @param target - The target position
 * @param routeType - Type of route
 */
function tryCachePath(
  creep: Creep,
  target: RoomPosition,
  routeType: RemoteRouteType
): void {
  // Only cache paths for multi-room routes (remote mining)
  if (creep.pos.roomName === target.roomName) {
    return;
  }
  
  // Calculate the path using PathFinder
  // We use the same parameters as cartographer would use
  const pathResult = PathFinder.search(creep.pos, { pos: target, range: 1 }, {
    plainCost: 2,
    swampCost: 10,
    maxRooms: 16,
    roomCallback: getRemoteRoomCallback
  });
  
  if (!pathResult.incomplete && pathResult.path.length > 0) {
    // Cache the path for future use
    cacheRemoteMiningPath(creep.pos, target, pathResult.path, routeType);
    
    logger.debug(`Cached new remote path for ${creep.name} (${routeType})`, {
      meta: { pathLength: pathResult.path.length }
    });
  }
}

/**
 * Room callback for remote mining pathfinding.
 * Avoids hostile rooms and prefers roads.
 *
 * @param roomName - Room being evaluated
 * @returns Cost matrix or false to avoid
 */
function getRemoteRoomCallback(roomName: string): CostMatrix | boolean {
  const room = Game.rooms[roomName];
  if (!room) {
    // Room not visible - allow pathfinding through it
    return true;
  }
  
  // Avoid rooms with hostile structures
  const hostileStructures = room.find(FIND_HOSTILE_STRUCTURES, {
    filter: s => s.structureType !== STRUCTURE_CONTROLLER &&
                 s.structureType !== STRUCTURE_KEEPER_LAIR
  });
  
  if (hostileStructures.length > 0) {
    return false;
  }
  
  // Create cost matrix preferring roads
  const costs = new PathFinder.CostMatrix();
  
  const roads = room.find(FIND_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_ROAD
  });
  
  for (const road of roads) {
    costs.set(road.pos.x, road.pos.y, 1);
  }
  
  return costs;
}

/**
 * Move a remote harvester to their assigned source using cached paths.
 * 
 * @param creep - The remote harvester creep
 * @param source - The target source
 * @returns Movement result code
 */
export function moveRemoteHarvesterToSource(
  creep: Creep,
  source: Source
): ScreepsReturnCode {
  return moveToWithRemoteCache(creep, source, "harvester", {
    visualizePathStyle: { stroke: "#ffaa00" }
  });
}

/**
 * Move a remote hauler to the home storage using cached paths.
 * 
 * @param creep - The remote hauler creep
 * @param storage - The target storage
 * @returns Movement result code
 */
export function moveRemoteHaulerToStorage(
  creep: Creep,
  storage: StructureStorage
): ScreepsReturnCode {
  return moveToWithRemoteCache(creep, storage, "hauler", {
    visualizePathStyle: { stroke: "#ffffff" }
  });
}

/**
 * Move a remote hauler to the remote room using cached paths.
 * 
 * @param creep - The remote hauler creep
 * @param roomName - Target room name
 * @returns Movement result code
 */
export function moveRemoteHaulerToRemote(
  creep: Creep,
  roomName: string
): ScreepsReturnCode {
  // Move to room center with range 20
  const targetPos = new RoomPosition(25, 25, roomName);
  return moveToWithRemoteCache(creep, targetPos, "hauler", {
    visualizePathStyle: { stroke: "#ffffff" }
  });
}
