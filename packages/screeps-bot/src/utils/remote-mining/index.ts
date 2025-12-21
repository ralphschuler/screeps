/**
 * Remote Mining Utilities
 *
 * Optimized utilities for remote mining operations including
 * movement, path caching, and route scheduling.
 */

// Remote Mining Movement - optimized movement for remote miners
export {
  moveToWithRemoteCache,
  moveRemoteHarvesterToSource,
  moveRemoteHaulerToStorage,
  moveRemoteHaulerToRemote
} from "./remoteMiningMovement";

// Remote Path Cache - specialized path caching for remote routes
export type { RemoteRouteType, RemoteRoute } from "./remotePathCache";
export {
  getRemoteMiningPath,
  cacheRemoteMiningPath,
  precacheRemoteRoutes
} from "./remotePathCache";

// Remote Path Scheduler - scheduled precaching of remote routes
export { initializeRemotePathScheduler } from "./remotePathScheduler";

// Remote Room Utils - shared utilities for remote operations
export {
  getRemoteRoomsForRoom,
  getRemoteMiningRoomCallback
} from "./remoteRoomUtils";
