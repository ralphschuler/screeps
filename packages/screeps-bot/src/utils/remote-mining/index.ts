/**
 * Remote Mining Integration
 * 
 * This file integrates @ralphschuler/screeps-remote-mining package with
 * the bot's internal systems (logger, cache, scheduler).
 */

import { createLogger } from "../../core/logger";
import { scheduleTask, TaskPriority } from "@ralphschuler/screeps-utils";
import { cachePath, getCachedPath, convertRoomPositionsToPathSteps } from "../../cache";
import { moveTo } from "screeps-cartographer";
import {
  RemotePathCache,
  RemotePathScheduler,
  RemoteMiningMovement,
  getRemoteRoomsForRoom as getRemoteRooms,
  getRemoteMiningRoomCallback,
  type ILogger,
  type IPathCache,
  type IScheduler,
  type RemoteRouteType
} from "@ralphschuler/screeps-remote-mining";

// =============================================================================
// Adapters for dependency injection
// =============================================================================

const loggerAdapter: ILogger = {
  debug: (message, context) => createLogger("RemoteMining").debug(message, context),
  info: (message, context) => createLogger("RemoteMining").info(message, context),
  warn: (message, context) => createLogger("RemoteMining").warn(message, context),
  error: (message, context) => createLogger("RemoteMining").error(message, context)
};

const pathCacheAdapter: IPathCache = {
  getCachedPath,
  cachePath,
  convertRoomPositionsToPathSteps
};

const schedulerAdapter: IScheduler = {
  scheduleTask: (name, interval, handler, priority, cpuBudget) => {
    scheduleTask(name, interval, handler, priority as TaskPriority, cpuBudget);
  }
};

// =============================================================================
// Create singleton instances
// =============================================================================

const remotePathCache = new RemotePathCache(pathCacheAdapter, loggerAdapter);
const remotePathScheduler = new RemotePathScheduler(loggerAdapter, schedulerAdapter, remotePathCache);
const remoteMiningMovement = new RemoteMiningMovement(loggerAdapter, pathCacheAdapter, remotePathCache, moveTo);

// =============================================================================
// Initialize scheduler
// =============================================================================

export function initializeRemotePathScheduler(): void {
  remotePathScheduler.initialize(TaskPriority.MEDIUM);
}

// =============================================================================
// Export convenience functions that match old API
// =============================================================================

export function getRemoteRoomsForRoom(room: Room): string[] {
  return getRemoteRooms(room);
}

export function getRemoteMiningPath(
  from: RoomPosition,
  to: RoomPosition,
  routeType: RemoteRouteType
): PathStep[] | null {
  return remotePathCache.getRemoteMiningPath(from, to, routeType);
}

export function cacheRemoteMiningPath(
  from: RoomPosition,
  to: RoomPosition,
  path: PathStep[],
  routeType: RemoteRouteType
): void {
  remotePathCache.cacheRemoteMiningPath(from, to, path, routeType);
}

export function precacheRemoteRoutes(homeRoom: Room, remoteRooms: string[]): void {
  remotePathCache.precacheRemoteRoutes(homeRoom, remoteRooms);
}

export function moveToWithRemoteCache(
  creep: Creep,
  target: RoomPosition | { pos: RoomPosition },
  routeType: RemoteRouteType,
  options?: MoveToOpts
): ScreepsReturnCode {
  return remoteMiningMovement.moveToWithRemoteCache(creep, target, routeType, options);
}

export function moveRemoteHarvesterToSource(
  creep: Creep,
  source: Source
): ScreepsReturnCode {
  return remoteMiningMovement.moveRemoteHarvesterToSource(creep, source);
}

export function moveRemoteHaulerToStorage(
  creep: Creep,
  storage: StructureStorage
): ScreepsReturnCode {
  return remoteMiningMovement.moveRemoteHaulerToStorage(creep, storage);
}

export function moveRemoteHaulerToRemote(
  creep: Creep,
  roomName: string
): ScreepsReturnCode {
  return remoteMiningMovement.moveRemoteHaulerToRemote(creep, roomName);
}

// Re-export types and room callback
export type { RemoteRouteType, RemoteRoute } from "@ralphschuler/screeps-remote-mining";
export { getRemoteMiningRoomCallback };
