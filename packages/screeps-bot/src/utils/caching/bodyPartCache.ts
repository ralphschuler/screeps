/**
 * Body Part Cache - MIGRATED TO UNIFIED CACHE SYSTEM
 *
 * This file now re-exports from the unified cache system.
 * See: src/cache/domains/BodyPartCache.ts
 */

export {
  getCachedBodyPartCount,
  hasCachedBodyPart,
  getCachedDamagePotential,
  getCachedHealPotential,
  getCachedCarryCapacity,
  getCachedMoveRatio,
  getBodyPartCacheStats,
  clearBodyPartCache
} from "../../cache/domains/BodyPartCache";
