/**
 * @ralphschuler/screeps-pathfinding
 * 
 * Advanced pathfinding utilities for Screeps:
 * - Portal discovery and inter-shard routing
 * - Event-driven path cache invalidation
 * - Multi-room path planning
 * 
 * This package provides reusable pathfinding infrastructure that can be used
 * across different Screeps bot implementations.
 */

// Portal management
export { PortalManager } from "./portal/portalManager";
export type { PortalDestination, PortalInfo, PortalRoute } from "./portal/portalManager";

// Path cache events
export { PathCacheEventManager } from "./cache/pathCacheEvents";
export type { ConstructionCompleteEvent, StructureDestroyedEvent } from "./cache/pathCacheEvents";

// Dependency interfaces - consumers must provide implementations
export type { ICache, ILogger, IEventBus, IPathCache, IRemoteMining } from "./types";
