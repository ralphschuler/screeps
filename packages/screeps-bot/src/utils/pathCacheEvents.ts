/**
 * Path Cache Event Integration
 *
 * Integrates the PathCache with the event system to automatically invalidate
 * cached paths when structures are built or destroyed.
 *
 * This ensures that paths are recalculated when the room layout changes,
 * preventing creeps from using outdated paths that may be blocked or suboptimal.
 *
 * Events handled:
 * - construction.complete: Invalidates paths in the room where construction completed
 * - structure.destroyed: Invalidates paths in the room where structure was destroyed
 */

import { createLogger } from "../core/logger";
import { eventBus } from "../core/events";
import { cacheCommonRoutes, invalidateRoom } from "./pathCache";
import { precacheRemoteRoutes } from "./remotePathCache";
import { getRemoteRoomsForRoom } from "./remoteRoomUtils";

const logger = createLogger("PathCacheEvents");

/**
 * Initialize event handlers for path cache invalidation.
 * Call this once during bot initialization.
 */
export function initializePathCacheEvents(): void {
  // Invalidate and recache when construction completes
  eventBus.on("construction.complete", (event) => {
    const { roomName, structureType } = event;
    
    logger.debug(`Construction completed in ${roomName}: ${structureType}`, {
      room: roomName,
      meta: { structureType }
    });
    
    // Invalidate all cached paths in this room
    invalidateRoom(roomName);
    
    // If storage was just built, cache common routes (including remote routes)
    if (structureType === STRUCTURE_STORAGE) {
      const room = Game.rooms[roomName];
      if (room) {
        cacheCommonRoutes(room);
        
        // Also precache remote mining routes
        const remoteRooms = getRemoteRoomsForRoom(room);
        if (remoteRooms.length > 0) {
          precacheRemoteRoutes(room, remoteRooms);
          logger.info(`Cached remote routes after storage construction in ${roomName}`, {
            room: roomName,
            meta: { remoteRooms: remoteRooms.length }
          });
        }
        
        logger.info(`Cached common routes after storage construction in ${roomName}`, {
          room: roomName
        });
      }
    }
  });

  // Invalidate when structures are destroyed
  eventBus.on("structure.destroyed", (event) => {
    const { roomName, structureType } = event;
    
    logger.debug(`Structure destroyed in ${roomName}: ${structureType}`, {
      room: roomName,
      meta: { structureType }
    });
    
    // Invalidate all cached paths in this room
    invalidateRoom(roomName);
  });

  logger.info("Path cache event handlers initialized");
}
