/**
 * Object Cache - Domain wrapper for unified cache
 *
 * Caches frequently accessed game objects to avoid repeated lookups.
 */

import { globalCache } from "../CacheManager";

const NAMESPACE = "object";

// TTL constants
const STRUCTURE_TTL = 10;
const RESOURCE_TTL = 5;
const CREEP_TTL = 1;
const DEFAULT_TTL = 1;

/**
 * Determine TTL for an object based on its type
 */
function getTTL(obj: any): number {
  if (!obj) return DEFAULT_TTL;
  
  if ('structureType' in obj) {
    return STRUCTURE_TTL;
  }
  
  if (obj instanceof Source || obj instanceof Mineral) {
    return RESOURCE_TTL;
  }
  
  if (obj instanceof Creep) {
    return CREEP_TTL;
  }
  
  return DEFAULT_TTL;
}

/**
 * Get an object by ID with caching
 */
export function getCachedObjectById<T extends _HasId>(
  id: Id<T> | null | undefined,
  ttl?: number
): T | null {
  if (!id) return null;

  return globalCache.get<T | null>(id, {
    namespace: NAMESPACE,
    ttl: ttl ?? DEFAULT_TTL, // Will use automatic TTL if not provided via compute callback
    compute: () => {
      const obj = Game.getObjectById(id);
      // Use automatic TTL determination if ttl was not explicitly provided
      if (ttl === undefined && obj) {
        const autoTTL = getTTL(obj);
        // Store with automatic TTL by updating the cache entry
        globalCache.set(id, obj, {
          namespace: NAMESPACE,
          ttl: autoTTL
        });
      }
      return obj;
    }
  }) ?? null;
}

/**
 * Get room storage with caching
 */
export function getCachedStorage(room: Room): StructureStorage | undefined {
  if (!room.storage) return undefined;
  return getCachedObjectById(room.storage.id) ?? undefined;
}

/**
 * Get room terminal with caching
 */
export function getCachedTerminal(room: Room): StructureTerminal | undefined {
  if (!room.terminal) return undefined;
  return getCachedObjectById(room.terminal.id) ?? undefined;
}

/**
 * Get room controller with caching
 */
export function getCachedController(room: Room): StructureController | undefined {
  if (!room.controller) return undefined;
  return getCachedObjectById(room.controller.id) ?? undefined;
}

/**
 * Typed accessor for cached structures
 */
export function getCachedStructure<T extends Structure>(id: Id<T> | null | undefined): T | null {
  return getCachedObjectById(id, STRUCTURE_TTL);
}

/**
 * Typed accessor for cached creeps
 */
export function getCachedCreep(id: Id<Creep> | null | undefined): Creep | null {
  return getCachedObjectById(id, CREEP_TTL);
}

/**
 * Typed accessor for cached sources
 */
export function getCachedSource(id: Id<Source> | null | undefined): Source | null {
  return getCachedObjectById(id, RESOURCE_TTL);
}

/**
 * Prefetch commonly accessed objects for a room
 */
export function prefetchRoomObjects(room: Room): void {
  if (!room.controller?.my) return;

  // Prefetch storage
  if (room.storage) {
    globalCache.set(room.storage.id, room.storage, {
      namespace: NAMESPACE,
      ttl: STRUCTURE_TTL
    });
  }

  // Prefetch terminal
  if (room.terminal) {
    globalCache.set(room.terminal.id, room.terminal, {
      namespace: NAMESPACE,
      ttl: STRUCTURE_TTL
    });
  }

  // Prefetch controller
  if (room.controller) {
    globalCache.set(room.controller.id, room.controller, {
      namespace: NAMESPACE,
      ttl: STRUCTURE_TTL
    });
  }

  // Prefetch sources
  const sources = room.find(FIND_SOURCES);
  for (const source of sources) {
    globalCache.set(source.id, source, {
      namespace: NAMESPACE,
      ttl: RESOURCE_TTL
    });
  }
}

/**
 * Cache warming for critical objects
 */
export function warmCache(): void {
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (room.controller?.my) {
      prefetchRoomObjects(room);

      // Also warm spawns and towers
      const spawns = room.find(FIND_MY_SPAWNS);
      const towers = room.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_TOWER
      }) as StructureTower[];

      for (const spawn of spawns) {
        globalCache.set(spawn.id, spawn, {
          namespace: NAMESPACE,
          ttl: STRUCTURE_TTL
        });
      }

      for (const tower of towers) {
        globalCache.set(tower.id, tower, {
          namespace: NAMESPACE,
          ttl: STRUCTURE_TTL
        });
      }
    }
  }
}

/**
 * Get cache statistics
 */
export function getObjectCacheStats(): {
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
 * Get detailed cache statistics
 */
export function getCacheStatistics() {
  return globalCache.getCacheStats(NAMESPACE);
}

/**
 * Clear the cache
 */
export function clearObjectCache(): void {
  globalCache.clear(NAMESPACE);
}

/**
 * Reset cache statistics
 */
export function resetCacheStats(): void {
  // Stats are automatically reset when cache is cleared
  globalCache.clear(NAMESPACE);
}
