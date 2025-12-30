/**
 * Types for external dependencies
 * 
 * These interfaces define the contracts for dependencies that must be provided
 * by the consuming application. This allows the package to remain decoupled
 * from specific implementations.
 */

/**
 * Cache interface for storing portal data with TTL
 */
export interface ICache {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttl: number): void;
}

/**
 * Logger interface for diagnostic output
 */
export interface ILogger {
  debug(message: string, context?: { subsystem?: string; room?: string; meta?: Record<string, unknown> }): void;
  info(message: string, context?: { subsystem?: string; room?: string; meta?: Record<string, unknown> }): void;
  warn(message: string, context?: { subsystem?: string; meta?: Record<string, unknown> }): void;
  error(message: string, context?: { subsystem?: string; meta?: Record<string, unknown> }): void;
}

/**
 * Event bus interface for event-driven cache invalidation
 */
export interface IEventBus {
  on(eventName: string, handler: (event: any) => void): void;
}

/**
 * PathCache interface for cache invalidation and route caching
 */
export interface IPathCache {
  invalidateRoom(roomName: string): void;
  cacheCommonRoutes(room: Room): void;
}

/**
 * Remote mining utilities interface
 */
export interface IRemoteMining {
  getRemoteRoomsForRoom(room: Room): string[];
  precacheRemoteRoutes(homeRoom: Room, remoteRooms: string[]): void;
}
