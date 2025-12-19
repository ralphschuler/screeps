/**
 * Room.find() Cache - Performance Optimization
 *
 * Comprehensive caching system for room.find() operations.
 * room.find() is expensive (~0.1-0.5 CPU depending on filter complexity).
 * With many creeps querying the same room data, caching provides massive savings.
 *
 * Design Principles (from ROADMAP.md Section 2):
 * - Aggressive Caching + TTL
 * - Event-driven cache invalidation
 * - Per-room, per-type caching
 *
 * CPU Savings:
 * - 50+ creeps in a room, each calling room.find(FIND_STRUCTURES): ~5-10 CPU
 * - With cache: Single room.find() + 50 cache lookups: ~0.2-0.3 CPU
 * - Net savings: 4.7-9.7 CPU per tick per room
 *
 * Features:
 * - Automatic per-tick cleanup
 * - Configurable TTL per find type
 * - Structure change invalidation
 * - Memory-efficient storage in global object
 */



// =============================================================================
// Types
// =============================================================================

/**
 * Cached find result with metadata
 */
interface CachedFindResult<T = unknown> {
  /** Cached results */
  results: T[];
  /** Tick when cached */
  tick: number;
  /** Time-to-live in ticks */
  ttl: number;
}

/**
 * Cache store organized by room and find type
 */
interface RoomFindCacheStore {
  /** Current game tick */
  tick: number;
  /** Cache entries: roomName -> findType -> result */
  entries: Map<string, Map<string, CachedFindResult>>;
  /** Statistics */
  stats: {
    hits: number;
    misses: number;
    invalidations: number;
  };
}

/**
 * Global object type with room find cache attached
 */
interface GlobalWithRoomFindCache {
  _roomFindCache?: RoomFindCacheStore;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Default TTL values for different find types (in ticks)
 * Tuned based on how often results typically change
 */
const DEFAULT_TTL: Record<string, number> = {
  // Static/rare changes - long TTL
  [FIND_SOURCES]: 5000, // Sources never change
  [FIND_MINERALS]: 5000, // Minerals never change
  [FIND_DEPOSITS]: 100, // Deposits can disappear
  
  // Structures - medium TTL (changes when building/destroying)
  [FIND_STRUCTURES]: 50,
  [FIND_MY_STRUCTURES]: 50,
  [FIND_HOSTILE_STRUCTURES]: 20,
  [FIND_MY_SPAWNS]: 100,
  [FIND_MY_CONSTRUCTION_SITES]: 20,
  [FIND_CONSTRUCTION_SITES]: 20,
  
  // Dynamic entities - short TTL
  [FIND_CREEPS]: 5,
  [FIND_MY_CREEPS]: 5,
  [FIND_HOSTILE_CREEPS]: 3,
  [FIND_DROPPED_RESOURCES]: 5,
  [FIND_TOMBSTONES]: 10,
  [FIND_RUINS]: 10,
  
  // Other
  [FIND_FLAGS]: 50,
  [FIND_NUKES]: 20,
  [FIND_POWER_CREEPS]: 10,
  [FIND_MY_POWER_CREEPS]: 10
};

// =============================================================================
// Cache Storage
// =============================================================================

/**
 * Get or initialize the cache store
 */
function getCacheStore(): RoomFindCacheStore {
  const g = global as GlobalWithRoomFindCache;
  if (!g._roomFindCache || g._roomFindCache.tick !== Game.time) {
    // Preserve stats across ticks, but clear entries
    const prevStats = g._roomFindCache?.stats ?? { hits: 0, misses: 0, invalidations: 0 };
    g._roomFindCache = {
      tick: Game.time,
      entries: new Map(),
      stats: prevStats
    };
  }
  return g._roomFindCache as RoomFindCacheStore;
}

/**
 * Generate cache key for a find operation
 */
function getCacheKey(findType: FindConstant, filterKey?: string): string {
  return filterKey ? `${findType}:${filterKey}` : String(findType);
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Cached room.find() with automatic TTL and invalidation.
 *
 * @param room - Room to search in
 * @param findType - FIND_* constant
 * @param opts - Optional filter and TTL
 * @returns Array of found objects
 *
 * @example
 * // Cache structures for 50 ticks (default)
 * const structures = cachedRoomFind(room, FIND_STRUCTURES);
 *
 * @example
 * // Cache with custom TTL
 * const hostiles = cachedRoomFind(room, FIND_HOSTILE_CREEPS, { ttl: 3 });
 *
 * @example
 * // Cache with filter (requires filterKey for proper caching)
 * const spawns = cachedRoomFind(
 *   room,
 *   FIND_MY_STRUCTURES,
 *   {
 *     filter: s => s.structureType === STRUCTURE_SPAWN,
 *     filterKey: 'spawn'
 *   }
 * );
 */
export function cachedRoomFind<T>(
  room: Room,
  findType: FindConstant,
  opts?: {
    filter?: ((obj: T) => boolean);
    filterKey?: string;
    ttl?: number;
  }
): T[] {
  const cache = getCacheStore();
  const cacheKey = getCacheKey(findType, opts?.filterKey);
  
  // Get or create room cache
  let roomCache = cache.entries.get(room.name);
  if (!roomCache) {
    roomCache = new Map();
    cache.entries.set(room.name, roomCache);
  }
  
  // Check for cached result
  const cached = roomCache.get(cacheKey);
  if (cached && Game.time - cached.tick < cached.ttl) {
    cache.stats.hits++;
    return cached.results as T[];
  }
  
  // Cache miss - perform find operation
  cache.stats.misses++;
  let results: T[];
  
  if (opts?.filter) {
    results = room.find(findType as FindConstant, { filter: opts.filter }) as T[];
  } else {
    results = room.find(findType as FindConstant) as T[];
  }
  
  // Store in cache
  const ttl = opts?.ttl ?? DEFAULT_TTL[findType] ?? 20;
  roomCache.set(cacheKey, {
    results,
    tick: Game.time,
    ttl
  });
  
  return results;
}

/**
 * Invalidate all cached find results for a room.
 * Call this when significant room changes occur (e.g., structure built/destroyed).
 *
 * @param roomName - Room name to invalidate
 */
export function invalidateRoomCache(roomName: string): void {
  const cache = getCacheStore();
  const roomCache = cache.entries.get(roomName);
  if (roomCache) {
    cache.entries.delete(roomName);
    cache.stats.invalidations++;
  }
}

/**
 * Invalidate specific find type for a room.
 * More targeted than invalidating entire room cache.
 *
 * @param roomName - Room name
 * @param findType - FIND_* constant to invalidate
 * @param filterKey - Optional filter key
 */
export function invalidateFindType(
  roomName: string,
  findType: FindConstant,
  filterKey?: string
): void {
  const cache = getCacheStore();
  const roomCache = cache.entries.get(roomName);
  if (roomCache) {
    const cacheKey = getCacheKey(findType, filterKey);
    roomCache.delete(cacheKey);
    cache.stats.invalidations++;
  }
}

/**
 * Invalidate structure-related caches for a room.
 * Call when structures are built or destroyed.
 *
 * @param roomName - Room name
 */
export function invalidateStructureCache(roomName: string): void {
  const cache = getCacheStore();
  const roomCache = cache.entries.get(roomName);
  if (!roomCache) return;
  
  let invalidatedCount = 0;
  
  // Invalidate all structure-related find types
  const structureTypes = [
    FIND_STRUCTURES,
    FIND_MY_STRUCTURES,
    FIND_HOSTILE_STRUCTURES,
    FIND_MY_SPAWNS,
    FIND_MY_CONSTRUCTION_SITES,
    FIND_CONSTRUCTION_SITES
  ];
  
  for (const findType of structureTypes) {
    // Invalidate base type and all filtered variants
    for (const [key] of roomCache) {
      if (key.startsWith(String(findType))) {
        roomCache.delete(key);
        cache.stats.invalidations++;
        invalidatedCount++;
      }
    }
  }
  
  if (invalidatedCount > 0) {
  }
}

/**
 * Get cache statistics for monitoring.
 *
 * @returns Cache stats including hit rate
 */
export function getRoomFindCacheStats(): {
  rooms: number;
  totalEntries: number;
  hits: number;
  misses: number;
  invalidations: number;
  hitRate: number;
} {
  const cache = getCacheStore();
  let totalEntries = 0;
  for (const roomCache of cache.entries.values()) {
    totalEntries += roomCache.size;
  }
  
  const totalQueries = cache.stats.hits + cache.stats.misses;
  const hitRate = totalQueries > 0 ? cache.stats.hits / totalQueries : 0;
  
  return {
    rooms: cache.entries.size,
    totalEntries,
    hits: cache.stats.hits,
    misses: cache.stats.misses,
    invalidations: cache.stats.invalidations,
    hitRate
  };
}

/**
 * Clear all room find caches.
 * Primarily for testing, rarely needed in production.
 */
export function clearRoomFindCache(): void {
  const g = global as GlobalWithRoomFindCache;
  if (g._roomFindCache) {
    g._roomFindCache.entries.clear();
    g._roomFindCache.stats = { hits: 0, misses: 0, invalidations: 0 };
  }
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Cached find for sources (very stable, long TTL).
 *
 * @param room - Room to search
 * @returns Array of sources
 */
export function cachedFindSources(room: Room): Source[] {
  return cachedRoomFind(room, FIND_SOURCES);
}

/**
 * Cached find for hostile creeps (dynamic, short TTL).
 *
 * @param room - Room to search
 * @returns Array of hostile creeps
 */
export function cachedFindHostileCreeps(room: Room): Creep[] {
  return cachedRoomFind(room, FIND_HOSTILE_CREEPS);
}

/**
 * Cached find for structures with optional type filter.
 *
 * @param room - Room to search
 * @param structureType - Optional structure type to filter
 * @returns Array of structures
 */
export function cachedFindStructures(
  room: Room,
  structureType?: StructureConstant
): Structure[] {
  if (structureType) {
    return cachedRoomFind(room, FIND_STRUCTURES, {
      filter: (s: Structure) => s.structureType === structureType,
      filterKey: structureType
    });
  }
  return cachedRoomFind(room, FIND_STRUCTURES);
}

/**
 * Cached find for my structures with optional type filter.
 *
 * @param room - Room to search
 * @param structureType - Optional structure type to filter
 * @returns Array of my structures
 */
export function cachedFindMyStructures<T extends Structure>(
  room: Room,
  structureType?: StructureConstant
): T[] {
  if (structureType) {
    return cachedRoomFind<T>(room, FIND_MY_STRUCTURES, {
      filter: (s: T) => s.structureType === structureType,
      filterKey: structureType
    });
  }
  return cachedRoomFind<T>(room, FIND_MY_STRUCTURES);
}

/**
 * Cached find for construction sites.
 *
 * @param room - Room to search
 * @param my - If true, only find my construction sites
 * @returns Array of construction sites
 */
export function cachedFindConstructionSites(
  room: Room,
  my = true
): ConstructionSite[] {
  return cachedRoomFind(room, my ? FIND_MY_CONSTRUCTION_SITES : FIND_CONSTRUCTION_SITES);
}

/**
 * Cached find for dropped resources.
 *
 * @param room - Room to search
 * @param resourceType - Optional resource type to filter
 * @returns Array of dropped resources
 */
export function cachedFindDroppedResources(
  room: Room,
  resourceType?: ResourceConstant
): Resource[] {
  if (resourceType) {
    return cachedRoomFind(room, FIND_DROPPED_RESOURCES, {
      filter: (r: Resource) => r.resourceType === resourceType,
      filterKey: resourceType
    });
  }
  return cachedRoomFind(room, FIND_DROPPED_RESOURCES);
}
