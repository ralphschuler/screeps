/**
 * Adapter for @ralphschuler/screeps-pathfinding
 *
 * Provides implementations of the pathfinding package's dependency interfaces
 * using the bot's existing systems.
 */

import { cacheCommonRoutes, invalidateRoom as invalidatePathCacheRoom } from "@ralphschuler/screeps-cache";
import { createLogger } from "@ralphschuler/screeps-core";
import { memoryManager } from "@ralphschuler/screeps-memory";
import type {
  ICache,
  IEventBus,
  ILogger,
  IPathCache,
  IRemoteMining,
  PathCacheEventHandler,
  PathCacheEventName
} from "@ralphschuler/screeps-pathfinding";
import { eventBus as botEventBus } from "../../core/events";
import type { EventHandler } from "../../core/events";
import { getRemoteRoomsForRoom as getRemoteRooms, precacheRemoteRoutes as precacheRemotes } from "../remote-mining";

/**
 * Cache adapter using the bot's heap cache
 */
export class BotCacheAdapter implements ICache {
  get<T>(key: string): T | undefined {
    return memoryManager.getHeapCache().get<T>(key);
  }

  set<T>(key: string, value: T, ttl: number): void {
    memoryManager.getHeapCache().set(key, value, ttl);
  }
}

/**
 * Logger adapter using the bot's logger system
 */
export class BotLoggerAdapter implements ILogger {
  private logger = createLogger("Pathfinding");

  debug(message: string, context?: { subsystem?: string; room?: string; meta?: Record<string, unknown> }): void {
    this.logger.debug(message, context);
  }

  info(message: string, context?: { subsystem?: string; room?: string; meta?: Record<string, unknown> }): void {
    this.logger.info(message, context);
  }

  warn(message: string, context?: { subsystem?: string; meta?: Record<string, unknown> }): void {
    this.logger.warn(message, context);
  }

  error(message: string, context?: { subsystem?: string; meta?: Record<string, unknown> }): void {
    this.logger.error(message, context);
  }
}

/**
 * Event bus adapter using the bot's event system
 */
export class BotEventBusAdapter implements IEventBus {
  on<T extends PathCacheEventName>(eventName: T, handler: PathCacheEventHandler<T>): void {
    botEventBus.on(eventName, handler as EventHandler<T>);
  }
}

/**
 * Path cache adapter using the bot's path cache
 */
export class BotPathCacheAdapter implements IPathCache {
  invalidateRoom(roomName: string): void {
    invalidatePathCacheRoom(roomName);
  }

  cacheCommonRoutes(room: Room): void {
    cacheCommonRoutes(room);
  }
}

/**
 * Remote mining adapter using the bot's remote mining utilities
 */
export class BotRemoteMiningAdapter implements IRemoteMining {
  getRemoteRoomsForRoom(room: Room): string[] {
    return getRemoteRooms(room);
  }

  precacheRemoteRoutes(homeRoom: Room, remoteRooms: string[]): void {
    precacheRemotes(homeRoom, remoteRooms);
  }
}
