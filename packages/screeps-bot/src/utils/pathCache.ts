/**
 * Path Cache - MIGRATED TO UNIFIED CACHE SYSTEM
 *
 * This file now re-exports from the unified cache system.
 * See: src/cache/domains/PathCache.ts
 */

export {
  getCachedPath,
  convertRoomPositionsToPathSteps,
  cachePath,
  invalidatePath,
  invalidateRoom,
  clearPathCache,
  getPathCacheStats,
  cleanupExpiredPaths,
  cacheCommonRoutes,
  CachePathOptions
} from "../cache/domains/PathCache";
