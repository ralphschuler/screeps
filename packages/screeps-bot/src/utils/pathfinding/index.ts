/**
 * Pathfinding Utilities
 *
 * Path-related utilities including portal management and path cache events.
 * 
 * This module now uses @ralphschuler/screeps-pathfinding package with adapters
 * to integrate with the bot's existing systems.
 */

import { PortalManager, PathCacheEventManager } from "@ralphschuler/screeps-pathfinding";
import {
  BotCacheAdapter,
  BotLoggerAdapter,
  BotEventBusAdapter,
  BotPathCacheAdapter,
  BotRemoteMiningAdapter
} from "./pathfindingAdapter";

// Re-export types from the package
export type {
  PortalDestination,
  PortalInfo,
  PortalRoute
} from "@ralphschuler/screeps-pathfinding";

// Create singleton instances with adapters
const portalManager = new PortalManager(
  new BotCacheAdapter(),
  new BotLoggerAdapter()
);

const pathCacheEventManager = new PathCacheEventManager(
  new BotLoggerAdapter(),
  new BotEventBusAdapter(),
  new BotPathCacheAdapter(),
  new BotRemoteMiningAdapter()
);

// Export singleton instance methods for backward compatibility
export function discoverPortalsInRoom(roomName: string) {
  return portalManager.discoverPortalsInRoom(roomName);
}

export function getPortalsToShard(targetShard: string) {
  return portalManager.getPortalsToShard(targetShard);
}

export function findClosestPortalToShard(fromPos: RoomPosition, targetShard: string) {
  return portalManager.findClosestPortalToShard(fromPos, targetShard);
}

export function publishPortalsToInterShardMemory() {
  return portalManager.publishPortalsToInterShardMemory();
}

export function getPortalDataFromInterShardMemory(shardName: string) {
  return portalManager.getPortalDataFromInterShardMemory(shardName);
}

export function findRouteToPortal(fromRoom: string, targetShard: string) {
  return portalManager.findRouteToPortal(fromRoom, targetShard);
}

export function findInterShardRoute(
  fromRoom: string,
  fromShard: string,
  toRoom: string,
  toShard: string
) {
  return portalManager.findInterShardRoute(fromRoom, fromShard, toRoom, toShard);
}

export function maintainPortalCache() {
  return portalManager.maintainPortalCache();
}

export function initializePathCacheEvents() {
  return pathCacheEventManager.initializePathCacheEvents();
}

