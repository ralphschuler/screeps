/**
 * Body Part Cache - Domain wrapper for unified cache
 *
 * Provides the same API as the original bodyPartCache but uses the unified cache system.
 */

import { globalCache } from "../CacheManager";

const NAMESPACE = "bodyPart";

/**
 * Cached body part data for a creep
 */
interface BodyPartData {
  counts: Map<BodyPartConstant, number>;
  activeCounts: Map<BodyPartConstant, number>;
  damagePotential: number;
  healPotential: number;
  moveParts: number;
  nonMoveParts: number;
  carryCapacity: number;
}

/**
 * Compute body part data for a creep
 */
function computeBodyPartData(creep: Creep): BodyPartData {
  const counts = new Map<BodyPartConstant, number>();
  const activeCounts = new Map<BodyPartConstant, number>();
  let damagePotential = 0;
  let healPotential = 0;
  let moveParts = 0;
  let nonMoveParts = 0;
  let carryCapacity = 0;
  
  for (const part of creep.body) {
    counts.set(part.type, (counts.get(part.type) ?? 0) + 1);
    
    if (part.hits > 0) {
      activeCounts.set(part.type, (activeCounts.get(part.type) ?? 0) + 1);
      
      if (part.type === ATTACK) {
        damagePotential += 30;
      } else if (part.type === RANGED_ATTACK) {
        damagePotential += 10;
      } else if (part.type === HEAL) {
        healPotential += 12;
      } else if (part.type === CARRY) {
        carryCapacity += 50;
      }
      
      if (part.type === MOVE) {
        moveParts++;
      } else {
        nonMoveParts++;
      }
    }
  }
  
  return {
    counts,
    activeCounts,
    damagePotential,
    healPotential,
    moveParts,
    nonMoveParts,
    carryCapacity
  };
}

/**
 * Get body part data from cache or compute
 */
function getBodyPartData(creep: Creep): BodyPartData {
  const result = globalCache.get<BodyPartData>(creep.name, {
    namespace: NAMESPACE,
    ttl: 1, // Per-tick cache
    compute: () => computeBodyPartData(creep)
  });
  
  // Should always return a value due to compute function
  return result ?? computeBodyPartData(creep);
}

/**
 * Get the count of body parts of a specific type
 */
export function getCachedBodyPartCount(
  creep: Creep,
  partType: BodyPartConstant,
  activeOnly = false
): number {
  const data = getBodyPartData(creep);
  const map = activeOnly ? data.activeCounts : data.counts;
  return map.get(partType) ?? 0;
}

/**
 * Check if a creep has any body parts of a specific type
 */
export function hasCachedBodyPart(
  creep: Creep,
  partType: BodyPartConstant,
  activeOnly = false
): boolean {
  return getCachedBodyPartCount(creep, partType, activeOnly) > 0;
}

/**
 * Get damage potential (ATTACK + RANGED_ATTACK)
 */
export function getCachedDamagePotential(creep: Creep): number {
  return getBodyPartData(creep).damagePotential;
}

/**
 * Get heal potential (HEAL)
 */
export function getCachedHealPotential(creep: Creep): number {
  return getBodyPartData(creep).healPotential;
}

/**
 * Get carry capacity (CARRY parts * 50)
 */
export function getCachedCarryCapacity(creep: Creep): number {
  return getBodyPartData(creep).carryCapacity;
}

/**
 * Get move speed ratio (moveParts / totalParts)
 */
export function getCachedMoveRatio(creep: Creep): {
  moveParts: number;
  nonMoveParts: number;
  ratio: number;
} {
  const data = getBodyPartData(creep);
  const totalParts = data.moveParts + data.nonMoveParts;
  return {
    moveParts: data.moveParts,
    nonMoveParts: data.nonMoveParts,
    ratio: totalParts > 0 ? data.moveParts / totalParts : 0
  };
}

/**
 * Get cache statistics
 */
export function getBodyPartCacheStats(): {
  size: number;
  tick: number;
} {
  const stats = globalCache.getCacheStats(NAMESPACE);
  return {
    size: stats.size,
    tick: Game.time
  };
}

/**
 * Clear the cache
 */
export function clearBodyPartCache(): void {
  globalCache.clear(NAMESPACE);
}
