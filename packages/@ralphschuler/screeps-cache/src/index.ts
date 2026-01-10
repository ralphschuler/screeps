/**
 * Unified Cache System with Cache Coherence Protocol
 *
 * Consolidated caching infrastructure that replaces 7 overlapping cache systems
 * with a single, well-designed cache manager and domain-specific wrappers.
 *
 * Design Principles (from ROADMAP.md Section 2):
 * - Aggressive Caching + TTL
 * - Cache stored in global object (heap) or Memory (persistent)
 * - Event-driven invalidation via Cache Coherence Protocol
 * - Unified statistics and monitoring
 * - Hierarchical cache layers (L1/L2/L3) for optimal performance
 *
 * Architecture:
 * - CacheManager: Core orchestration with pluggable strategies
 * - CacheCoherence: Multi-cache coordination and invalidation
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
export type { CacheStore } from "./CacheStore";
export type { CacheEntry, CacheOptions, CacheStats } from "./CacheEntry";

// Cache Coherence Protocol
export {
  CacheCoherenceManager,
  cacheCoherence,
  CacheLayer
} from "./CacheCoherence";
export type {
  InvalidationScope,
  RegisteredCache,
  CacheCoherenceStats
} from "./CacheCoherence";

// Cache Event Integration
export {
  initializeCacheEvents,
  invalidateRoomVisibility,
  triggerCacheCleanup,
  getCacheCoherenceStats
} from "./cacheEvents";

// Cache Registration
export {
  registerAllCaches,
  getTotalCacheBudget,
  setTotalCacheBudget
} from "./cacheRegistration";

// Cache Statistics for Grafana
export {
  collectCacheStats,
  getCachePerformanceSummary,
  logCacheStats
} from "./cacheStats";

// Storage backends
export { HeapStore } from "./stores/HeapStore";
export { MemoryStore } from "./stores/MemoryStore";
export { HybridStore } from "./stores/HybridStore";
export type { HybridStoreConfig } from "./stores/HybridStore";

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
  cacheCommonRoutes
} from "./domains/PathCache";
export type { CachePathOptions } from "./domains/PathCache";

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

// Domain-specific wrappers - Game Object Cache
export {
  getOwnedRooms,
  getCreepsByRole,
  getCreepsByRoom,
  getMyCreeps,
  getCreepCountByRole,
  getCreepCountByRoom,
  getVisibleRooms,
  getGameObjectCacheStats,
  clearGameObjectCache,
  invalidateRoomCreepCache,
  invalidateRoleCreepCache
} from "./domains/GameObjectCache";

// Domain-specific wrappers - Structure Cache
export {
  getRoomTowers,
  getRoomSpawns,
  getRoomLinks,
  getRoomLabs,
  getRoomStorage,
  getRoomTerminal,
  getRoomController,
  getRoomExtensions,
  getRoomContainers,
  getRoomFactory,
  getRoomPowerSpawn,
  getRoomNuker,
  getRoomObserver,
  getRoomSources,
  getRoomMineral,
  invalidateRoomStructureCache,
  invalidateStructureTypeCache,
  getStructureCacheStats,
  clearStructureCache
} from "./domains/StructureCache";
