/**
 * Body Part Cache - Performance Optimization
 *
 * Caches body part counts and capabilities for creeps.
 * Iterating over creep.body repeatedly is expensive when done for many creeps.
 *
 * Design Principles (from ROADMAP.md Section 2):
 * - Aggressives Caching + TTL
 * - Cache stored in global object (not Memory)
 * - Per-tick validity
 *
 * CPU Savings:
 * - Counting body parts: ~0.005-0.01 CPU per call
 * - With 100+ creeps checking body parts multiple times: ~0.5-1 CPU per tick
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Cached body part data for a creep
 */
interface BodyPartData {
  /** Total body parts by type */
  counts: Map<BodyPartConstant, number>;
  /** Active (hits > 0) body parts by type */
  activeCounts: Map<BodyPartConstant, number>;
  /** Total damage potential */
  damagePotential: number;
  /** Total heal potential */
  healPotential: number;
  /** Move parts count (for speed calculation) */
  moveParts: number;
  /** Non-move parts count (for speed calculation) */
  nonMoveParts: number;
  /** Carry capacity */
  carryCapacity: number;
}

/**
 * Cache store
 */
interface BodyPartCacheStore {
  tick: number;
  data: Map<string, BodyPartData>;
}

// =============================================================================
// Cache Storage
// =============================================================================

/**
 * Get or initialize the cache store
 */
function getCacheStore(): BodyPartCacheStore {
  const g = global as any;
  if (!g._bodyPartCache || g._bodyPartCache.tick !== Game.time) {
    g._bodyPartCache = {
      tick: Game.time,
      data: new Map()
    };
  }
  return g._bodyPartCache as BodyPartCacheStore;
}

/**
 * Get or compute body part data for a creep
 */
function getBodyPartData(creep: Creep): BodyPartData {
  const cache = getCacheStore();
  
  // Check cache
  const cached = cache.data.get(creep.name);
  if (cached) return cached;
  
  // Compute body part data
  const counts = new Map<BodyPartConstant, number>();
  const activeCounts = new Map<BodyPartConstant, number>();
  let damagePotential = 0;
  let healPotential = 0;
  let moveParts = 0;
  let nonMoveParts = 0;
  let carryCapacity = 0;
  
  for (const part of creep.body) {
    // Count all parts
    counts.set(part.type, (counts.get(part.type) ?? 0) + 1);
    
    // Count active parts and calculate potentials
    if (part.hits > 0) {
      activeCounts.set(part.type, (activeCounts.get(part.type) ?? 0) + 1);
      
      // Calculate damage potential
      if (part.type === ATTACK) {
        damagePotential += 30; // ATTACK_POWER
      } else if (part.type === RANGED_ATTACK) {
        damagePotential += 10; // RANGED_ATTACK_POWER
      } else if (part.type === HEAL) {
        healPotential += 12; // HEAL_POWER
      } else if (part.type === CARRY) {
        carryCapacity += 50; // CARRY_CAPACITY
      }
      
      // Count move vs non-move for speed calculation
      if (part.type === MOVE) {
        moveParts++;
      } else {
        nonMoveParts++;
      }
    }
  }
  
  const data: BodyPartData = {
    counts,
    activeCounts,
    damagePotential,
    healPotential,
    moveParts,
    nonMoveParts,
    carryCapacity
  };
  
  cache.data.set(creep.name, data);
  return data;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Get the count of body parts of a specific type.
 * Cached for performance.
 *
 * @param creep - Creep to check
 * @param partType - Type of body part
 * @param activeOnly - If true, only count parts with hits > 0
 * @returns Number of body parts
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
 * Check if a creep has any body parts of a specific type.
 * More efficient than counting when you only need presence.
 *
 * @param creep - Creep to check
 * @param partType - Type of body part
 * @param activeOnly - If true, only check parts with hits > 0
 * @returns true if creep has at least one part of this type
 */
export function hasCachedBodyPart(
  creep: Creep,
  partType: BodyPartConstant,
  activeOnly = false
): boolean {
  return getCachedBodyPartCount(creep, partType, activeOnly) > 0;
}

/**
 * Get damage potential (ATTACK + RANGED_ATTACK).
 * Cached for performance.
 *
 * @param creep - Creep to check
 * @returns Total damage potential per tick
 */
export function getCachedDamagePotential(creep: Creep): number {
  return getBodyPartData(creep).damagePotential;
}

/**
 * Get heal potential (HEAL).
 * Cached for performance.
 *
 * @param creep - Creep to check
 * @returns Total heal potential per tick
 */
export function getCachedHealPotential(creep: Creep): number {
  return getBodyPartData(creep).healPotential;
}

/**
 * Get carry capacity (CARRY parts * 50).
 * Cached for performance.
 *
 * @param creep - Creep to check
 * @returns Total carry capacity
 */
export function getCachedCarryCapacity(creep: Creep): number {
  return getBodyPartData(creep).carryCapacity;
}

/**
 * Get move speed ratio (moveParts / totalParts).
 * Used for calculating creep speed.
 * Cached for performance.
 *
 * @param creep - Creep to check
 * @returns Object with move parts and non-move parts counts
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
 * Get cache statistics for monitoring.
 *
 * @returns Cache stats
 */
export function getBodyPartCacheStats(): {
  size: number;
  tick: number;
} {
  const cache = getCacheStore();
  return {
    size: cache.data.size,
    tick: cache.tick
  };
}

/**
 * Manually clear the cache (normally happens automatically each tick).
 * Only needed for testing.
 */
export function clearBodyPartCache(): void {
  const g = global as any;
  if (g._bodyPartCache) {
    g._bodyPartCache.data.clear();
  }
}
