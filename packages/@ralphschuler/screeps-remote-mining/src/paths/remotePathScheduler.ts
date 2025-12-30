/**
 * Remote Path Cache Scheduler
 *
 * Registers scheduled tasks to periodically precache remote mining routes.
 * This ensures paths are calculated once and shared across all remote miners/haulers.
 *
 * Performance Impact:
 * - PathFinder.search: 0.5-2.0 CPU per call
 * - With precaching: Paths calculated once every 500 ticks
 * - Shared across 5-10 remote miners per room
 * - Expected savings: 80-90% reduction in pathfinding CPU
 */

import type { ILogger, IScheduler, TaskPriority } from "../types";
import type { RemotePathCache } from "./remotePathCache";
import { getRemoteRoomsForRoom } from "../analysis/remoteRoomUtils";

/**
 * Remote Path Scheduler
 * 
 * Manages periodic precaching of remote mining routes across all owned rooms.
 */
export class RemotePathScheduler {
  constructor(
    private readonly logger: ILogger,
    private readonly scheduler: IScheduler,
    private readonly pathCache: RemotePathCache
  ) {}

  /**
   * Precache remote mining routes for all owned rooms with remote operations.
   * This function is called periodically by the scheduler.
   */
  private precacheAllRemoteRoutes(): void {
    let totalRoutesCached = 0;
    
    for (const room of Object.values(Game.rooms)) {
      if (!room.controller?.my) {
        continue;
      }
      
      // Only precache if room has storage or spawns
      if (!room.storage && room.find(FIND_MY_SPAWNS).length === 0) {
        continue;
      }
      
      const remoteRooms = getRemoteRoomsForRoom(room);
      if (remoteRooms.length === 0) {
        continue;
      }
      
      // Precache routes for this room
      this.pathCache.precacheRemoteRoutes(room, remoteRooms);
      totalRoutesCached += remoteRooms.length;
    }
    
    if (totalRoutesCached > 0) {
      this.logger.info(`Precached remote routes for ${totalRoutesCached} remote rooms`, {
        meta: { routesCached: totalRoutesCached }
      });
    }
  }

  /**
   * Initialize remote path cache scheduler.
   * Call this once during bot initialization.
   * 
   * Registers a scheduled task that runs every 500 ticks to precache
   * remote mining routes across all owned rooms.
   * 
   * @param priority - Task priority (defaults to MEDIUM)
   */
  initialize(priority: TaskPriority = 2 /* MEDIUM */): void {
    // Schedule remote path precaching
    // - Every 500 ticks (matches REMOTE_PATH_TTL)
    // - Medium priority (runs when bucket > 5000)
    // - Max 5 CPU budget (can handle multiple rooms)
    this.scheduler.scheduleTask(
      "precache-remote-paths",
      500,
      () => this.precacheAllRemoteRoutes(),
      priority,
      5.0
    );
    
    this.logger.info("Remote path cache scheduler initialized");
  }
}
