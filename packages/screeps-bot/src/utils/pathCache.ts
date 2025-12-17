/**
 * Path Cache - Performance Optimization for Pathfinding
 *
 * Provides centralized path caching for frequently used routes to reduce CPU cost
 * of repeated PathFinder.search calls. Complements screeps-cartographer's path
 * storage by adding semantic route caching across creeps.
 *
 * Design Principles (from ROADMAP.md Section 20):
 * - Aggressive Caching + TTL
 * - Cache stored in global object, not Memory (no serialization cost)
 * - Automatic invalidation on structure changes
 *
 * Cartographer Integration:
 * - Cartographer provides moveTo() with reusePath and moveByPath() for individual creeps
 * - This cache provides cross-creep semantic route storage for static paths
 * - Use this for known routes (Storage↔Source) to avoid redundant PathFinder calls
 *
 * Use Cases:
 * - Storage ↔ Sources (permanent until structures change)
 * - Storage ↔ Controller (permanent until structures change)
 * - Storage ↔ Remote entrances (500 tick TTL)
 * - Spawn ↔ Extensions (permanent until structures change)
 *
 * Usage Example:
 * ```typescript
 * import { getCachedPath, cachePath } from "./utils/pathCache";
 * 
 * // In your movement logic:
 * function moveCreepToTarget(creep: Creep, target: RoomPosition) {
 *   // Check cache first
 *   const cachedPath = getCachedPath(creep.pos, target);
 *   if (cachedPath) {
 *     // Use cartographer's moveByPath with cached path
 *     creep.moveByPath(cachedPath);
 *     return;
 *   }
 *   
 *   // Cache miss - calculate new path
 *   const path = creep.room.findPath(creep.pos, target, {
 *     ignoreCreeps: true,
 *     serialize: false
 *   });
 *   
 *   if (path.length > 0) {
 *     // Cache the path for future use (permanent for static routes)
 *     cachePath(creep.pos, target, path);
 *     creep.moveByPath(path);
 *   }
 * }
 * ```
 *
 * CPU Savings:
 * - PathFinder.search costs 0.5-2 CPU per call
 * - With 5-10 creeps per room: 2.5-20 CPU waste without caching
 * - With caching: <0.5 CPU for path lookup
 * - Expected: 80-90% reduction in pathfinding CPU
 */

import { createLogger } from "../core/logger";

const logger = createLogger("PathCache");

// =============================================================================
// Types
// =============================================================================

/**
 * Cached path entry with metadata
 */
interface CachedPath {
  /** Serialized path string from Room.serializePath */
  serializedPath: string;
  /** Game tick when this path was cached */
  cachedAt: number;
  /** TTL in ticks (undefined = permanent until invalidated) */
  ttl?: number;
  /** Number of times this path has been used */
  hits: number;
}

/**
 * Path cache storage structure
 */
interface PathCacheStore {
  /** Cached paths by route key */
  paths: Map<string, CachedPath>;
  /** Statistics for monitoring */
  stats: {
    hits: number;
    misses: number;
    evictions: number;
  };
}

/**
 * Options for caching a path
 */
export interface CachePathOptions {
  /** TTL in ticks (undefined = permanent until invalidated) */
  ttl?: number;
}

// =============================================================================
// Constants
// =============================================================================

/** Maximum cache size to prevent memory bloat */
const MAX_CACHE_SIZE = 1000;

// =============================================================================
// Cache Storage
// =============================================================================

/**
 * Get or initialize the path cache store.
 * Cache persists across ticks but is cleared on global reset.
 */
function getCacheStore(): PathCacheStore {
  const g = global as any;
  if (!g._pathCache) {
    g._pathCache = {
      paths: new Map<string, CachedPath>(),
      stats: {
        hits: 0,
        misses: 0,
        evictions: 0
      }
    };
  }
  return g._pathCache as PathCacheStore;
}

// =============================================================================
// Cache Key Generation
// =============================================================================

/**
 * Generate a cache key for a route.
 * Format: "roomA:x,y:roomB:x,y"
 *
 * @param from - Start position
 * @param to - End position
 * @returns Cache key string
 */
function getCacheKey(from: RoomPosition, to: RoomPosition): string {
  return `${from.roomName}:${from.x},${from.y}:${to.roomName}:${to.x},${to.y}`;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Get a cached path if it exists and is still valid.
 *
 * @param from - Start position
 * @param to - End position
 * @returns Deserialized path array, or null if not cached or expired
 */
export function getCachedPath(from: RoomPosition, to: RoomPosition): PathStep[] | null {
  const cache = getCacheStore();
  const key = getCacheKey(from, to);

  const entry = cache.paths.get(key);
  if (!entry) {
    cache.stats.misses++;
    return null;
  }

  // Check TTL expiration
  if (entry.ttl !== undefined) {
    const age = Game.time - entry.cachedAt;
    if (age > entry.ttl) {
      // Expired - remove from cache
      cache.paths.delete(key);
      cache.stats.evictions++;
      cache.stats.misses++;
      logger.debug(`Path expired: ${key}`, {
        meta: { age, ttl: entry.ttl }
      });
      return null;
    }
  }

  // Cache hit
  cache.stats.hits++;
  entry.hits++;

  // Deserialize path
  try {
    const path = Room.deserializePath(entry.serializedPath);
    logger.debug(`Path cache hit: ${key}`, {
      meta: { pathLength: path.length, hits: entry.hits }
    });
    return path;
  } catch (error) {
    // Deserialization failed - remove invalid entry
    logger.warn(`Path deserialization failed: ${key}`, {
      meta: { error: String(error) }
    });
    cache.paths.delete(key);
    cache.stats.misses++;
    return null;
  }
}

/**
 * Cache a path for future use.
 *
 * @param from - Start position
 * @param to - End position
 * @param path - Path array to cache (from Room.findPath or PathFinder.search)
 * @param options - Caching options (TTL, etc.)
 */
export function cachePath(
  from: RoomPosition,
  to: RoomPosition,
  path: PathStep[] | RoomPosition[],
  options: CachePathOptions = {}
): void {
  const cache = getCacheStore();
  const key = getCacheKey(from, to);

  // Check cache size limit
  if (cache.paths.size >= MAX_CACHE_SIZE && !cache.paths.has(key)) {
    // Cache is full - evict oldest entry (simple FIFO)
    const firstKey = cache.paths.keys().next().value;
    if (firstKey) {
      cache.paths.delete(firstKey);
      cache.stats.evictions++;
      logger.debug(`Evicted path from cache: ${firstKey}`);
    }
  }

  // Serialize path
  // Note: Room.serializePath() accepts both PathStep[] and RoomPosition[] at runtime,
  // but TypeScript types only define PathStep[]. This is a known limitation of the type definitions.
  const serializedPath = Room.serializePath(path as PathStep[]);

  // Store in cache
  cache.paths.set(key, {
    serializedPath,
    cachedAt: Game.time,
    ttl: options.ttl,
    hits: 0
  });

  logger.debug(`Cached path: ${key}`, {
    meta: {
      pathLength: path.length,
      ttl: options.ttl ?? "permanent"
    }
  });
}

/**
 * Invalidate a specific cached path.
 *
 * @param from - Start position
 * @param to - End position
 */
export function invalidatePath(from: RoomPosition, to: RoomPosition): void {
  const cache = getCacheStore();
  const key = getCacheKey(from, to);

  if (cache.paths.delete(key)) {
    logger.debug(`Invalidated path: ${key}`);
  }
}

/**
 * Invalidate all cached paths in a room.
 * Use this when structures are built/destroyed.
 *
 * @param roomName - Room name to invalidate
 */
export function invalidateRoom(roomName: string): void {
  const cache = getCacheStore();
  let count = 0;

  // Convert iterator to array to avoid downlevelIteration requirement
  const keys = Array.from(cache.paths.keys());
  for (const key of keys) {
    // Parse key format: "roomA:x,y:roomB:x,y"
    // Check if either the start or end room matches
    const parts = key.split(":");
    if (parts.length >= 4) {
      const startRoom = parts[0];
      const endRoom = parts[2];
      if (startRoom === roomName || endRoom === roomName) {
        cache.paths.delete(key);
        count++;
      }
    }
  }

  if (count > 0) {
    logger.info(`Invalidated ${count} paths in room ${roomName}`, {
      room: roomName
    });
  }
}

/**
 * Clear all cached paths.
 * Useful for testing or manual cache reset.
 */
export function clearPathCache(): void {
  const cache = getCacheStore();
  const size = cache.paths.size;
  cache.paths.clear();
  cache.stats.hits = 0;
  cache.stats.misses = 0;
  cache.stats.evictions = 0;

  logger.info(`Cleared path cache (${size} entries)`);
}

/**
 * Get cache statistics for monitoring.
 *
 * @returns Cache statistics
 */
export function getPathCacheStats(): {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
} {
  const cache = getCacheStore();
  const total = cache.stats.hits + cache.stats.misses;
  const hitRate = total > 0 ? cache.stats.hits / total : 0;

  return {
    size: cache.paths.size,
    maxSize: MAX_CACHE_SIZE,
    hits: cache.stats.hits,
    misses: cache.stats.misses,
    evictions: cache.stats.evictions,
    hitRate
  };
}

/**
 * Cleanup expired paths periodically.
 * 
 * Note: This function is optional - the cache implements lazy cleanup where
 * expired paths are automatically removed when accessed via getCachedPath.
 * Call this function from the main loop only if you want proactive cleanup
 * to prevent memory accumulation from unaccessed expired paths.
 */
export function cleanupExpiredPaths(): void {
  const cache = getCacheStore();
  const keysToDelete: string[] = [];

  for (const [key, entry] of cache.paths) {
    if (entry.ttl !== undefined) {
      const age = Game.time - entry.cachedAt;
      if (age > entry.ttl) {
        keysToDelete.push(key);
      }
    }
  }

  for (const key of keysToDelete) {
    cache.paths.delete(key);
    cache.stats.evictions++;
  }

  if (keysToDelete.length > 0) {
    logger.debug(`Cleaned up ${keysToDelete.length} expired paths`);
  }
}

// =============================================================================
// Helper Functions for Common Routes
// =============================================================================

/**
 * Cache common static routes for a room.
 * Call this when room structures are built or changed.
 *
 * @param room - Room to cache routes for
 */
export function cacheCommonRoutes(room: Room): void {
  if (!room.controller?.my) return;

  const storage = room.storage;
  if (!storage) return;

  // Cache Storage ↔ Sources (permanent)
  const sources = room.find(FIND_SOURCES);
  for (const source of sources) {
    const pathToSource = room.findPath(storage.pos, source.pos, {
      ignoreCreeps: true,
      serialize: false
    });
    if (pathToSource.length > 0) {
      // Cache both directions - paths work bidirectionally
      cachePath(storage.pos, source.pos, pathToSource);
      cachePath(source.pos, storage.pos, pathToSource);
    }
  }

  // Cache Storage ↔ Controller (permanent)
  if (room.controller) {
    const pathToController = room.findPath(storage.pos, room.controller.pos, {
      ignoreCreeps: true,
      range: 3,
      serialize: false
    });
    if (pathToController.length > 0) {
      cachePath(storage.pos, room.controller.pos, pathToController);
    }
  }

  logger.info(`Cached common routes for room ${room.name}`, {
    room: room.name,
    meta: { sources: sources.length }
  });
}
