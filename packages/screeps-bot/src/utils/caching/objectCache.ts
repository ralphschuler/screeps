/**
 * Object Cache - MIGRATED TO UNIFIED CACHE SYSTEM
 *
 * This file now re-exports from the unified cache system.
 * See: src/cache/domains/ObjectCache.ts
 */

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
} from "../../cache/domains/ObjectCache";
