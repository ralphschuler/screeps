/**
 * Caching Utilities
 *
 * Re-exports from the unified cache system for backward compatibility.
 * These utilities wrap the cache domains in src/cache/domains/.
 */

// Body Part Cache - creep body part analysis
export {
  getCachedBodyPartCount,
  hasCachedBodyPart,
  getCachedDamagePotential,
  getCachedHealPotential,
  getCachedCarryCapacity,
  getCachedMoveRatio,
  getBodyPartCacheStats,
  clearBodyPartCache
} from "./bodyPartCache";

// Cached Closest - optimized closest object finding
export {
  findCachedClosest,
  clearCacheOnStateChange,
  clearCache
} from "./cachedClosest";

// Object Cache - game object caching by ID
export {
  getCachedObjectById,
  getCachedStorage,
  getCachedTerminal,
  getCachedController,
  getCachedStructure,
  getCachedCreep,
  getCachedSource,
  prefetchRoomObjects,
  warmCache,
  getObjectCacheStats,
  getCacheStatistics,
  clearObjectCache,
  resetCacheStats
} from "./objectCache";

// Path Cache - pathfinding results caching
export {
  convertRoomPositionsToPathSteps,
  getCachedPath,
  cachePath,
  invalidatePath,
  invalidateRoom,
  clearPathCache,
  getPathCacheStats,
  cleanupExpiredPaths,
  cacheCommonRoutes
} from "./pathCache";

export type { CachePathOptions } from "./pathCache";

// Role Cache - role-specific data caching
export {
  getRoleCache,
  setRoleCache,
  deleteRoleCache,
  hasRoleCache,
  clearRoleTypeCache,
  clearAllRoleCache,
  getRoleCacheStats,
  getCachedRepairTarget,
  getCachedBuildTarget,
  getAssignedSource,
  getSourceContainer,
  getControllerEnergySource,
  clearTargetCaches
} from "./roleCache";

// Room Find Cache - room.find() results caching
export {
  cachedRoomFind,
  cachedFindSources,
  cachedFindMyStructures,
  cachedFindHostileCreeps,
  cachedFindDroppedResources,
  cachedFindConstructionSites,
  cachedFindStructures,
  getRoomFindCacheStats,
  invalidateStructureCache,
  invalidateRoomCache,
  invalidateFindType,
  clearRoomFindCache
} from "./roomFindCache";
