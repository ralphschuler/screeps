/**
 * Room Find Cache - MIGRATED TO UNIFIED CACHE SYSTEM
 *
 * This file now re-exports from the unified cache system.
 * See: src/cache/domains/RoomFindCache.ts
 */

export {
  cachedRoomFind,
  invalidateRoomCache,
  invalidateFindType,
  invalidateStructureCache,
  getRoomFindCacheStats,
  clearRoomFindCache,
  cachedFindSources,
  cachedFindHostileCreeps,
  cachedFindStructures,
  cachedFindMyStructures,
  cachedFindConstructionSites,
  cachedFindDroppedResources
} from "../cache/domains/RoomFindCache";
