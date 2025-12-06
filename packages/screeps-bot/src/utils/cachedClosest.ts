/**
 * Cached Closest Target Utility
 *
 * Provides CPU-efficient target finding by caching the closest target
 * for a creep and reusing it for multiple ticks.
 *
 * This dramatically reduces CPU usage from repeated findClosestByRange calls
 * which can consume 0.1-0.5 CPU per call depending on the number of targets.
 *
 * Design:
 * - Cache stored in creep memory with compact key names
 * - Target validated each tick (exists and still in range)
 * - Automatic cache invalidation when target becomes invalid
 * - TTL (time-to-live) to periodically refresh targets
 * - Uses direct findClosestByRange (not safeFindClosestByRange) since we're 
 *   passing filtered arrays, not FIND_* constants that could have engine issues
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Cached target data stored in creep memory
 */
interface CachedTarget {
  /** Target ID */
  i: Id<_HasId>;
  /** Cache tick */
  t: number;
  /** Target type key for validation */
  k: string;
}

// =============================================================================
// Memory Keys (compact for minimal footprint)
// =============================================================================

const CACHE_KEY = "_ct";

// =============================================================================
// Constants
// =============================================================================

/** Default TTL for cached targets (in ticks) */
const DEFAULT_TTL = 10;

/** Maximum range to validate cached target is still reasonable */
const MAX_VALID_RANGE = 20;

// =============================================================================
// Public API
// =============================================================================

/**
 * Find the closest object from an array, using cache when possible.
 * Falls back to findClosestByRange when cache is invalid or expired.
 *
 * @param creep - The creep looking for a target
 * @param targets - Array of potential targets
 * @param typeKey - Unique key identifying the type of target (e.g., "energy", "spawn", "site")
 * @param ttl - How many ticks to cache the target (default: 10)
 * @returns The closest target, or null if none found
 */
export function findCachedClosest<T extends RoomObject & _HasId>(
  creep: Creep,
  targets: T[],
  typeKey: string,
  ttl: number = DEFAULT_TTL
): T | null {
  // Fast path: no targets
  if (targets.length === 0) {
    clearCache(creep, typeKey);
    return null;
  }

  // Fast path: only one target
  if (targets.length === 1) {
    return targets[0];
  }

  const memory = creep.memory as unknown as { [key: string]: unknown };
  const cacheData = memory[CACHE_KEY] as Record<string, CachedTarget> | undefined;
  const cached = cacheData?.[typeKey];

  // Check if we have a valid cache
  if (cached && Game.time - cached.t < ttl && cached.k === typeKey) {
    // Validate cached target still exists and is in the targets array
    const cachedTarget = Game.getObjectById(cached.i) as T | null;
    if (cachedTarget) {
      // Check if cached target is in the targets array
      const stillValid = targets.some(t => t.id === cachedTarget.id);
      if (stillValid) {
        // Extra validation: target shouldn't be too far (prevents stale cache)
        const range = creep.pos.getRangeTo(cachedTarget.pos);
        if (range <= MAX_VALID_RANGE) {
          return cachedTarget;
        }
      }
    }
  }

  // Cache miss or invalid - find new closest target
  // Note: Using direct findClosestByRange here is safe because we're passing
  // a pre-filtered array of targets, not a FIND_* constant. Engine errors only
  // occur with FIND_* constants when there's corrupted owner data.
  const closest = creep.pos.findClosestByRange(targets);
  if (closest) {
    // Update cache
    if (!memory[CACHE_KEY]) {
      memory[CACHE_KEY] = {};
    }
    (memory[CACHE_KEY] as Record<string, CachedTarget>)[typeKey] = {
      i: closest.id,
      t: Game.time,
      k: typeKey
    };
  } else {
    // No target found, clear cache for this type
    clearCache(creep, typeKey);
  }

  return closest;
}

/**
 * Clear cached target for a specific type.
 *
 * @param creep - The creep to clear cache for
 * @param typeKey - The type key to clear (or undefined to clear all)
 */
export function clearCache(creep: Creep, typeKey?: string): void {
  const memory = creep.memory as unknown as { [key: string]: unknown };
  const cacheData = memory[CACHE_KEY] as Record<string, CachedTarget> | undefined;

  if (!cacheData) return;

  if (typeKey) {
    delete cacheData[typeKey];
  } else {
    delete memory[CACHE_KEY];
  }
}

/**
 * Clear all cached targets when creep's working state changes.
 * This ensures creeps get fresh targets when switching between gathering and delivering.
 *
 * @param creep - The creep to clear cache for
 */
export function clearCacheOnStateChange(creep: Creep): void {
  clearCache(creep);
}
