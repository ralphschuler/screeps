/**
 * Remote Mining Path Cache
 *
 * Specialized path caching for remote mining operations to reduce CPU waste
 * from repeated pathfinding for the same routes. Builds on the general pathCache
 * utility to provide semantic route caching specifically for remote operations.
 *
 * Design (ROADMAP Section 20 - Pathfinding Optimization):
 * - Centralized cache for common remote routes
 * - Routes cached once and shared across all remote miners/haulers
 * - Automatic invalidation on room changes
 * - TTL-based expiration for remote routes (500 ticks)
 *
 * Performance Impact (from issue analysis):
 * - Current: 5-10 remote miners × 0.5 CPU = 2.5-5 CPU per room
 * - With cache: One-time calculation × 0.05 CPU reuse = ~0.25 CPU per room
 * - Expected savings: 80-90% reduction in pathfinding CPU
 *
 * Route Types:
 * 1. Home Spawn → Remote Source (for remote harvesters traveling to work)
 * 2. Remote Source → Home Storage (for remote haulers returning with energy)
 * 3. Remote Container → Home Storage (for container-based remote mining)
 *
 * Usage:
 * ```typescript
 * import { getRemoteMiningPath } from "./utils/remotePathCache";
 * 
 * // In remote harvester behavior:
 * const path = getRemoteMiningPath(spawn.pos, remoteSource.pos, "harvester");
 * if (path) {
 *   creep.moveByPath(path);
 * } else {
 *   // Fallback to normal moveTo
 *   moveTo(creep, remoteSource);
 * }
 * ```
 */

import { cachePath, getCachedPath } from "./pathCache";
import { createLogger } from "../core/logger";
import { getRemoteMiningRoomCallback } from "./remoteRoomUtils";

const logger = createLogger("RemotePathCache");

// =============================================================================
// Constants
// =============================================================================

/**
 * TTL for remote mining paths in ticks.
 * Remote routes can change due to hostile activity or room changes,
 * so we use a moderate TTL rather than permanent caching.
 */
const REMOTE_PATH_TTL = 500; // ~500 ticks = reasonable refresh cycle

// =============================================================================
// Types
// =============================================================================

/**
 * Remote route type for semantic identification
 */
export type RemoteRouteType = "harvester" | "hauler";

/**
 * Remote route identifier
 */
export interface RemoteRoute {
  /** Home room name */
  homeRoom: string;
  /** Remote room name */
  remoteRoom: string;
  /** Source ID in remote room (optional - may use room entrance instead) */
  sourceId?: Id<Source>;
  /** Route type */
  type: RemoteRouteType;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Get a cached path for remote mining operations.
 * Returns cached path if available, otherwise returns null.
 *
 * @param from - Start position (e.g., spawn or storage)
 * @param to - End position (e.g., remote source or container)
 * @param routeType - Type of route (harvester or hauler)
 * @returns Cached path or null if not cached
 */
export function getRemoteMiningPath(
  from: RoomPosition,
  to: RoomPosition,
  routeType: RemoteRouteType
): PathStep[] | null {
  // Use the general path cache with our metadata
  const path = getCachedPath(from, to);
  
  if (path) {
    logger.debug(`Remote path cache hit: ${from.roomName} → ${to.roomName} (${routeType})`, {
      meta: { pathLength: path.length }
    });
  } else {
    logger.debug(`Remote path cache miss: ${from.roomName} → ${to.roomName} (${routeType})`);
  }
  
  return path;
}

/**
 * Cache a path for remote mining operations.
 * Stores path with appropriate TTL for remote routes.
 *
 * @param from - Start position
 * @param to - End position
 * @param path - Path to cache
 * @param routeType - Type of route (harvester or hauler)
 */
export function cacheRemoteMiningPath(
  from: RoomPosition,
  to: RoomPosition,
  path: PathStep[],
  routeType: RemoteRouteType
): void {
  // Cache with remote-specific TTL
  cachePath(from, to, path, { ttl: REMOTE_PATH_TTL });
  
  logger.info(`Cached remote path: ${from.roomName} → ${to.roomName} (${routeType})`, {
    meta: {
      pathLength: path.length,
      ttl: REMOTE_PATH_TTL
    }
  });
}

/**
 * Calculate and cache common remote mining routes for a home room.
 * Call this periodically or when remote mining assignments change.
 *
 * @param homeRoom - Home room with storage/spawn
 * @param remoteRooms - Array of remote room names being mined
 */
export function precacheRemoteRoutes(homeRoom: Room, remoteRooms: string[]): void {
  const storage = homeRoom.storage;
  const spawns = homeRoom.find(FIND_MY_SPAWNS);
  
  if (!storage && spawns.length === 0) {
    logger.warn(`Cannot precache remote routes for ${homeRoom.name}: no storage or spawns`);
    return;
  }
  
  let cachedCount = 0;
  
  for (const remoteName of remoteRooms) {
    const remoteRoom = Game.rooms[remoteName];
    if (!remoteRoom) {
      logger.debug(`Cannot precache routes to ${remoteName}: room not visible`);
      continue;
    }
    
    const sources = remoteRoom.find(FIND_SOURCES);
    const containers = remoteRoom.find(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_CONTAINER
    });
    
    // Cache routes from spawn to each remote source (for harvesters)
    if (spawns.length > 0) {
      const mainSpawn = spawns[0];
      for (const source of sources) {
        const pathToSource = PathFinder.search(mainSpawn.pos, { pos: source.pos, range: 1 }, {
          plainCost: 2,
          swampCost: 10,
          maxRooms: 16,
          roomCallback: getRemoteMiningRoomCallback
        });
        
        if (!pathToSource.incomplete && pathToSource.path.length > 0) {
          cacheRemoteMiningPath(
            mainSpawn.pos,
            source.pos,
            pathToSource.path as unknown as PathStep[],
            "harvester"
          );
          cachedCount++;
        }
      }
    }
    
    // Cache routes from remote containers/sources to home storage (for haulers)
    if (storage) {
      // Prefer containers if they exist
      const containerStructures = containers.filter(
        (s): s is StructureContainer => s.structureType === STRUCTURE_CONTAINER
      );
      const haulerSources = containerStructures.length > 0 
        ? containerStructures.map(c => c.pos)
        : sources.map(s => s.pos);
      
      for (const sourcePos of haulerSources) {
        const pathToHome = PathFinder.search(sourcePos, { pos: storage.pos, range: 1 }, {
          plainCost: 2,
          swampCost: 10,
          maxRooms: 16,
          roomCallback: getRemoteMiningRoomCallback
        });
        
        if (!pathToHome.incomplete && pathToHome.path.length > 0) {
          cacheRemoteMiningPath(
            sourcePos,
            storage.pos,
            pathToHome.path as unknown as PathStep[],
            "hauler"
          );
          cachedCount++;
        }
      }
    }
  }
  
  if (cachedCount > 0) {
    logger.info(`Precached ${cachedCount} remote mining routes for ${homeRoom.name}`, {
      room: homeRoom.name,
      meta: { remoteRooms: remoteRooms.length, routesCached: cachedCount }
    });
  }
}

/**
 * Get or calculate a path for remote mining, with automatic caching.
 * This is a convenience function that combines cache lookup and path calculation.
 *
 * @param from - Start position
 * @param to - End position
 * @param routeType - Type of route
 * @returns Path steps
 */
export function getOrCalculateRemotePath(
  from: RoomPosition,
  to: RoomPosition,
  routeType: RemoteRouteType
): PathStep[] | null {
  // Try cache first
  const path = getRemoteMiningPath(from, to, routeType);
  if (path) {
    return path;
  }
  
  // Cache miss - calculate new path
  const result = PathFinder.search(from, { pos: to, range: 1 }, {
    plainCost: 2,
    swampCost: 10,
    maxRooms: 16,
    roomCallback: getRemoteMiningRoomCallback
  });
  
  if (!result.incomplete && result.path.length > 0) {
    // Cache the calculated path
    cacheRemoteMiningPath(from, to, result.path as unknown as PathStep[], routeType);
    return result.path as unknown as PathStep[];
  }
  
  logger.warn(`Failed to calculate remote path: ${from.roomName} → ${to.roomName}`, {
    meta: { incomplete: result.incomplete }
  });
  
  return null;
}
