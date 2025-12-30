/**
 * @ralphschuler/screeps-remote-mining
 * 
 * Remote mining system for Screeps - room analysis, path management, 
 * and optimized movement for remote mining operations.
 * 
 * This package provides:
 * - Remote room analysis and utility functions
 * - Specialized path caching for remote routes
 * - Scheduled path precaching
 * - Optimized movement for remote harvesters and haulers
 * 
 * All components use dependency injection for maximum reusability
 * and integration with any bot architecture.
 */

// =============================================================================
// Types and Interfaces
// =============================================================================

export type { RemoteRouteType, RemoteRoute, ILogger, IPathCache, IScheduler } from "./types";
export { TaskPriority } from "./types";

// =============================================================================
// Analysis Module
// =============================================================================

export { 
  getRemoteRoomsForRoom,
  getRemoteMiningRoomCallback 
} from "./analysis/remoteRoomUtils";

// =============================================================================
// Paths Module
// =============================================================================

export { RemotePathCache } from "./paths/remotePathCache";
export { RemotePathScheduler } from "./paths/remotePathScheduler";

// =============================================================================
// Movement Module
// =============================================================================

export { RemoteMiningMovement } from "./movement/remoteMiningMovement";
