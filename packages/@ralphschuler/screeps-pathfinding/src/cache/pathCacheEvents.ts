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

import type { ILogger, IEventBus, IPathCache, IRemoteMining } from "../types";

/**
 * Event data for construction complete
 */
export interface ConstructionCompleteEvent {
  roomName: string;
  structureType: StructureConstant;
}

/**
 * Event data for structure destroyed
 */
export interface StructureDestroyedEvent {
  roomName: string;
  structureType: StructureConstant;
}

/**
 * Path cache event manager handles automatic path invalidation on room changes
 */
export class PathCacheEventManager {
  private logger: ILogger;
  private eventBus: IEventBus;
  private pathCache: IPathCache;
  private remoteMining: IRemoteMining;
  private initialized = false;

  constructor(
    logger: ILogger,
    eventBus: IEventBus,
    pathCache: IPathCache,
    remoteMining: IRemoteMining
  ) {
    this.logger = logger;
    this.eventBus = eventBus;
    this.pathCache = pathCache;
    this.remoteMining = remoteMining;
  }

  /**
   * Initialize event handlers for path cache invalidation.
   * Call this once during bot initialization.
   */
  initializePathCacheEvents(): void {
    if (this.initialized) {
      this.logger.warn("Path cache event handlers already initialized", {
        subsystem: "PathCacheEvents"
      });
      return;
    }

    // Invalidate and recache when construction completes
    this.eventBus.on("construction.complete", (event: ConstructionCompleteEvent) => {
      const { roomName, structureType } = event;
      
      this.logger.debug(`Construction completed in ${roomName}: ${structureType}`, {
        room: roomName,
        meta: { structureType }
      });
      
      // Invalidate all cached paths in this room
      this.pathCache.invalidateRoom(roomName);
      
      // If storage was just built, cache common routes (including remote routes)
      if (structureType === STRUCTURE_STORAGE) {
        const room = Game.rooms[roomName];
        if (room) {
          this.pathCache.cacheCommonRoutes(room);
          
          // Also precache remote mining routes
          const remoteRooms = this.remoteMining.getRemoteRoomsForRoom(room);
          if (remoteRooms.length > 0) {
            this.remoteMining.precacheRemoteRoutes(room, remoteRooms);
            this.logger.info(`Cached remote routes after storage construction in ${roomName}`, {
              room: roomName,
              meta: { remoteRooms: remoteRooms.length }
            });
          }
          
          this.logger.info(`Cached common routes after storage construction in ${roomName}`, {
            room: roomName
          });
        }
      }
    });

    // Invalidate when structures are destroyed
    this.eventBus.on("structure.destroyed", (event: StructureDestroyedEvent) => {
      const { roomName, structureType } = event;
      
      this.logger.debug(`Structure destroyed in ${roomName}: ${structureType}`, {
        room: roomName,
        meta: { structureType }
      });
      
      // Invalidate all cached paths in this room
      this.pathCache.invalidateRoom(roomName);
    });

    this.initialized = true;
    this.logger.info("Path cache event handlers initialized", {
      subsystem: "PathCacheEvents"
    });
  }
}
