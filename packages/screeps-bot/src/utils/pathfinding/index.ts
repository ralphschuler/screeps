/**
 * Pathfinding Utilities
 *
 * Path-related utilities including portal management and path cache events.
 */

// Path Cache Events - event-driven path cache invalidation
export { initializePathCacheEvents } from "./pathCacheEvents";

// Portal Manager - inter-shard portal discovery and routing
export type {
  PortalDestination,
  PortalInfo,
  PortalRoute
} from "./portalManager";

export {
  discoverPortalsInRoom,
  getPortalsToShard,
  findClosestPortalToShard,
  publishPortalsToInterShardMemory,
  getPortalDataFromInterShardMemory,
  findRouteToPortal,
  findInterShardRoute,
  maintainPortalCache
} from "./portalManager";
