/**
 * Unified Cache System
 *
 * Consolidated caching infrastructure that replaces 7 overlapping cache systems
 * with a single, well-designed cache manager and domain-specific wrappers.
 *
 * Design Principles (from ROADMAP.md Section 2):
 * - Aggressive Caching + TTL
 * - Cache stored in global object (heap) or Memory (persistent)
 * - Event-driven invalidation
 * - Unified statistics and monitoring
 *
 * Architecture:
 * - CacheManager: Core orchestration with pluggable strategies
 * - CacheStore: Storage abstraction (HeapStore, MemoryStore)
 * - Domain Wrappers: Convenient APIs for specific use cases
 *
 * Usage:
 * ```typescript
 * import { globalCache } from './cache';
 *
 * // Direct cache access
 * const value = globalCache.get('my-key', {
 *   namespace: 'myApp',
 *   ttl: 100,
 *   compute: () => expensiveComputation()
 * });
 *
 * // Or use domain-specific wrappers
 * import { getCachedDamagePotential } from './cache';
 * const damage = getCachedDamagePotential(creep);
 * ```
 */

// Core cache system
export { CacheManager, globalCache } from "./CacheManager";
export { CacheStore } from "./CacheStore";
export { CacheEntry, CacheOptions, CacheStats } from "./CacheEntry";

// Storage backends
export { HeapStore } from "./stores/HeapStore";
export { MemoryStore } from "./stores/MemoryStore";

// Domain-specific wrappers - Body Part Cache
export {
  getCachedBodyPartCount,
  hasCachedBodyPart,
  getCachedDamagePotential,
  getCachedHealPotential,
  getCachedCarryCapacity,
  getCachedMoveRatio,
  getBodyPartCacheStats,
  clearBodyPartCache
} from "./domains/BodyPartCache";

// Domain-specific wrappers - Object Cache
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
} from "./domains/ObjectCache";

// Domain-specific wrappers - Path Cache
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
} from "./domains/PathCache";

// Domain-specific wrappers - Room Find Cache
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
} from "./domains/RoomFindCache";

// Domain-specific wrappers - Role Cache
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
} from "./domains/RoleCache";

// Domain-specific wrappers - Closest Cache
export {
  findCachedClosest,
  clearCache as clearClosestCache,
  clearCacheOnStateChange
} from "./domains/ClosestCache";
