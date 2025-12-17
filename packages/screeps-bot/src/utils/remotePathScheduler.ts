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

import { createLogger } from "../core/logger";
import { type TaskPriority, scheduleTask } from "./computationScheduler";
import { precacheRemoteRoutes } from "./remotePathCache";

const logger = createLogger("RemotePathScheduler");

/**
 * Get list of remote rooms being mined by a home room.
 * Scans for creeps with remoteHarvester or remoteHauler roles assigned to this home room.
 * 
 * @param room - Home room
 * @returns Array of remote room names
 */
function getRemoteRoomsForRoom(room: Room): string[] {
  const remoteRooms = new Set<string>();
  
  // Look for remote creeps assigned to this room
  for (const creep of Object.values(Game.creeps)) {
    // Type guard to safely access memory properties
    const memory = creep.memory as {
      role?: string;
      homeRoom?: string;
      targetRoom?: string;
    };
    
    // Check if this is a remote creep assigned to our room
    if ((memory.role === "remoteHarvester" || memory.role === "remoteHauler") &&
        memory.homeRoom === room.name &&
        memory.targetRoom &&
        memory.targetRoom !== room.name) {
      remoteRooms.add(memory.targetRoom);
    }
  }
  
  return Array.from(remoteRooms);
}

/**
 * Precache remote mining routes for all owned rooms with remote operations.
 * This function is called periodically by the scheduler.
 */
function precacheAllRemoteRoutes(): void {
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
    precacheRemoteRoutes(room, remoteRooms);
    totalRoutesCached += remoteRooms.length;
  }
  
  if (totalRoutesCached > 0) {
    logger.info(`Precached remote routes for ${totalRoutesCached} remote rooms`, {
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
 */
export function initializeRemotePathScheduler(): void {
  // Schedule remote path precaching
  // - Every 500 ticks (matches REMOTE_PATH_TTL)
  // - Medium priority (runs when bucket > 5000)
  // - Max 5 CPU budget (can handle multiple rooms)
  scheduleTask(
    "precache-remote-paths",
    500,
    precacheAllRemoteRoutes,
    TaskPriority.MEDIUM,
    5.0
  );
  
  logger.info("Remote path cache scheduler initialized");
}
