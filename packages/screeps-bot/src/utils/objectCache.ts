/**
 * Object Cache - Performance Optimization
 *
 * Caches frequently accessed game objects to avoid repeated lookups.
 * Game.getObjectById() is relatively expensive (~0.01-0.02 CPU per call).
 * For objects accessed multiple times per tick, caching provides significant savings.
 *
 * Design Principles (from ROADMAP.md Section 2):
 * - Aggressive Caching + TTL
 * - Cache stored in global object, not Memory (no serialization cost)
 * - Per-tick validity (cleared automatically each tick)
 *
 * Use Cases:
 * - Room storage (accessed by many creeps)
 * - Room controller (accessed by upgraders, builders)
 * - Sources (accessed by harvesters, carriers)
 * - Frequently accessed structures
 *
 * CPU Savings:
 * - With 100+ creeps accessing storage: ~1-2 CPU per tick
 * - With multiple creeps per source: ~0.5-1 CPU per tick
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Global cache stored in global object (not Memory)
 */
interface ObjectCacheStore {
  /** Current game tick */
  tick: number;
  /** Cached objects by ID */
  objects: Map<Id<any>, any>;
}

// =============================================================================
// Cache Storage
// =============================================================================

/**
 * Get or initialize the cache store.
 * Cache is cleared automatically at the start of each tick.
 */
function getCacheStore(): ObjectCacheStore {
  const g = global as any;
  if (!g._objectCache || g._objectCache.tick !== Game.time) {
    g._objectCache = {
      tick: Game.time,
      objects: new Map()
    };
  }
  return g._objectCache as ObjectCacheStore;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Get an object by ID with caching.
 * First access fetches from game, subsequent accesses use cache.
 *
 * @param id - Object ID
 * @returns The object, or null if not found
 */
export function getCachedObjectById<T extends _HasId>(id: Id<T> | null | undefined): T | null {
  if (!id) return null;

  const cache = getCacheStore();
  
  // Check cache first
  if (cache.objects.has(id)) {
    return cache.objects.get(id) as T | null;
  }

  // Fetch from game
  const obj = Game.getObjectById(id) ;
  
  // Store in cache (including null results to avoid repeated failed lookups)
  cache.objects.set(id, obj);
  
  return obj;
}

/**
 * Get room storage with caching.
 * Storage is accessed by many creeps, so caching provides significant savings.
 *
 * @param room - Room to get storage for
 * @returns Storage structure or undefined
 */
export function getCachedStorage(room: Room): StructureStorage | undefined {
  if (!room.storage) return undefined;
  return getCachedObjectById(room.storage.id) ?? undefined;
}

/**
 * Get room terminal with caching.
 *
 * @param room - Room to get terminal for
 * @returns Terminal structure or undefined
 */
export function getCachedTerminal(room: Room): StructureTerminal | undefined {
  if (!room.terminal) return undefined;
  return getCachedObjectById(room.terminal.id) ?? undefined;
}

/**
 * Get room controller with caching.
 *
 * @param room - Room to get controller for
 * @returns Controller or undefined
 */
export function getCachedController(room: Room): StructureController | undefined {
  if (!room.controller) return undefined;
  return getCachedObjectById(room.controller.id) ?? undefined;
}

/**
 * Prefetch commonly accessed objects for a room.
 * Call this once per room per tick to warm the cache.
 *
 * @param room - Room to prefetch objects for
 */
export function prefetchRoomObjects(room: Room): void {
  if (!room.controller?.my) return;

  const cache = getCacheStore();
  
  // Prefetch storage
  if (room.storage && !cache.objects.has(room.storage.id)) {
    cache.objects.set(room.storage.id, room.storage);
  }
  
  // Prefetch terminal
  if (room.terminal && !cache.objects.has(room.terminal.id)) {
    cache.objects.set(room.terminal.id, room.terminal);
  }
  
  // Prefetch controller
  if (room.controller && !cache.objects.has(room.controller.id)) {
    cache.objects.set(room.controller.id, room.controller);
  }
  
  // Prefetch sources
  const sources = room.find(FIND_SOURCES);
  for (const source of sources) {
    if (!cache.objects.has(source.id)) {
      cache.objects.set(source.id, source);
    }
  }
}

/**
 * Get cache statistics for monitoring.
 *
 * @returns Cache stats
 */
export function getObjectCacheStats(): {
  size: number;
  tick: number;
} {
  const cache = getCacheStore();
  return {
    size: cache.objects.size,
    tick: cache.tick
  };
}

/**
 * Manually clear the cache (normally happens automatically each tick).
 * Only needed for testing.
 */
export function clearObjectCache(): void {
  const g = global as any;
  if (g._objectCache) {
    g._objectCache.objects.clear();
  }
}
