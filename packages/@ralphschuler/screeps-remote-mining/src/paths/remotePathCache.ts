/**
 * Remote Mining Path Cache
 *
 * Specialized path caching for remote mining operations to reduce CPU waste
 * from repeated pathfinding for the same routes. Uses dependency injection
 * to integrate with any path caching system.
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
 * import { RemotePathCache } from '@ralphschuler/screeps-remote-mining';
 * 
 * const pathCache = new RemotePathCache(cache, logger);
 * 
 * // In remote harvester behavior:
 * const path = pathCache.getRemoteMiningPath(spawn.pos, remoteSource.pos, "harvester");
 * if (path) {
 *   creep.moveByPath(path);
 * } else {
 *   // Fallback to normal moveTo
 *   moveTo(creep, remoteSource);
 * }
 * ```
 */

import type { IPathCache, ILogger, RemoteRouteType } from "../types";
import { getRemoteMiningRoomCallback } from "../analysis/remoteRoomUtils";

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
// Remote Path Cache Class
// =============================================================================

export class RemotePathCache {
  constructor(
    private readonly pathCache: IPathCache,
    private readonly logger: ILogger
  ) {}

  /**
   * Get a cached path for remote mining operations.
   * Returns cached path if available, otherwise returns null.
   *
   * @param from - Start position (e.g., spawn or storage)
   * @param to - End position (e.g., remote source or container)
   * @param routeType - Type of route (harvester or hauler)
   * @returns Cached path or null if not cached
   */
  getRemoteMiningPath(
    from: RoomPosition,
    to: RoomPosition,
    routeType: RemoteRouteType
  ): PathStep[] | null {
    // Use the general path cache with our metadata
    const path = this.pathCache.getCachedPath(from, to);
    
    if (path) {
      this.logger.debug(`Remote path cache hit: ${from.roomName} → ${to.roomName} (${routeType})`, {
        meta: { pathLength: path.length }
      });
    } else {
      this.logger.debug(`Remote path cache miss: ${from.roomName} → ${to.roomName} (${routeType})`);
    }
    
    return path;
  }

  /**
   * Cache a path for remote mining operations.
   * Stores path with appropriate TTL for remote routes.
   *
   * @param from - Start position
   * @param to - End position
   * @param path - Path to cache (must be PathStep[] format)
   * @param routeType - Type of route (harvester or hauler)
   */
  cacheRemoteMiningPath(
    from: RoomPosition,
    to: RoomPosition,
    path: PathStep[],
    routeType: RemoteRouteType
  ): void {
    // Cache with remote-specific TTL
    this.pathCache.cachePath(from, to, path, { ttl: REMOTE_PATH_TTL });
    
    this.logger.info(`Cached remote path: ${from.roomName} → ${to.roomName} (${routeType})`, {
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
  precacheRemoteRoutes(homeRoom: Room, remoteRooms: string[]): void {
    const storage = homeRoom.storage;
    const spawns = homeRoom.find(FIND_MY_SPAWNS);
    
    if (!storage && spawns.length === 0) {
      this.logger.warn(`Cannot precache remote routes for ${homeRoom.name}: no storage or spawns`);
      return;
    }
    
    let cachedCount = 0;
    
    for (const remoteName of remoteRooms) {
      const remoteRoom = Game.rooms[remoteName];
      if (!remoteRoom) {
        this.logger.debug(`Cannot precache routes to ${remoteName}: room not visible`);
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
            roomCallback: (roomName) => getRemoteMiningRoomCallback(roomName, this.logger)
          });
          
          if (!pathToSource.incomplete && pathToSource.path.length > 0) {
            // Convert RoomPosition[] to PathStep[] before caching
            const pathSteps = this.pathCache.convertRoomPositionsToPathSteps(pathToSource.path);
            this.cacheRemoteMiningPath(
              mainSpawn.pos,
              source.pos,
              pathSteps,
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
            roomCallback: (roomName) => getRemoteMiningRoomCallback(roomName, this.logger)
          });
          
          if (!pathToHome.incomplete && pathToHome.path.length > 0) {
            // Convert RoomPosition[] to PathStep[] before caching
            const pathSteps = this.pathCache.convertRoomPositionsToPathSteps(pathToHome.path);
            this.cacheRemoteMiningPath(
              sourcePos,
              storage.pos,
              pathSteps,
              "hauler"
            );
            cachedCount++;
          }
        }
      }
    }
    
    if (cachedCount > 0) {
      this.logger.info(`Precached ${cachedCount} remote mining routes for ${homeRoom.name}`, {
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
   * @returns Path steps in PathStep[] format
   */
  getOrCalculateRemotePath(
    from: RoomPosition,
    to: RoomPosition,
    routeType: RemoteRouteType
  ): PathStep[] | null {
    // Try cache first
    const path = this.getRemoteMiningPath(from, to, routeType);
    if (path) {
      return path;
    }
    
    // Cache miss - calculate new path
    const result = PathFinder.search(from, { pos: to, range: 1 }, {
      plainCost: 2,
      swampCost: 10,
      maxRooms: 16,
      roomCallback: (roomName) => getRemoteMiningRoomCallback(roomName, this.logger)
    });
    
    if (!result.incomplete && result.path.length > 0) {
      // Convert RoomPosition[] to PathStep[] before caching
      const pathSteps = this.pathCache.convertRoomPositionsToPathSteps(result.path);
      this.cacheRemoteMiningPath(from, to, pathSteps, routeType);
      return pathSteps;
    }
    
    this.logger.warn(`Failed to calculate remote path: ${from.roomName} → ${to.roomName}`, {
      meta: { incomplete: result.incomplete }
    });
    
    return null;
  }
}
