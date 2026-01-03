/**
 * Cache stub for roles package
 * Provides minimal caching functionality using global cache
 */

// Simple global cache
const cache = new Map<string, { data: any; tick: number }>();

export function cachedFindSources(room: Room): Source[] {
  const key = `sources_${room.name}`;
  const cached = cache.get(key);
  if (cached && cached.tick === Game.time) {
    return cached.data;
  }
  const sources = room.find(FIND_SOURCES);
  cache.set(key, { data: sources, tick: Game.time });
  return sources;
}

export function cachedRoomFind<T extends FindConstant>(
  room: Room,
  type: T,
  filter?: FilterOptions<T>
): FindTypes[T][] {
  const filterKey = filter ? JSON.stringify(filter) : "no-filter";
  const key = `roomFind_${room.name}_${type}_${filterKey}`;
  const cached = cache.get(key);
  if (cached && cached.tick === Game.time) {
    return cached.data;
  }
  const result = room.find(type, filter);
  cache.set(key, { data: result, tick: Game.time });
  return result;
}

export function cachedFindMyStructures(room: Room): OwnedStructure[] {
  const key = `myStructures_${room.name}`;
  const cached = cache.get(key);
  if (cached && cached.tick === Game.time) {
    return cached.data;
  }
  const structures = room.find(FIND_MY_STRUCTURES);
  cache.set(key, { data: structures, tick: Game.time });
  return structures;
}

export function cachedFindDroppedResources(room: Room): Resource[] {
  const key = `droppedResources_${room.name}`;
  const cached = cache.get(key);
  if (cached && cached.tick === Game.time) {
    return cached.data;
  }
  const resources = room.find(FIND_DROPPED_RESOURCES);
  cache.set(key, { data: resources, tick: Game.time });
  return resources;
}

// Re-export cached closest utilities - provide simple fallback implementations
export function findCachedClosest<T extends _HasRoomPosition>(
  origin: RoomObject | RoomPosition,
  targets: T[],
  cacheKey?: string,
  cacheDuration?: number
): T | null {
  if (targets.length === 0) return null;
  const pos = 'pos' in origin ? origin.pos : origin;
  return pos.findClosestByRange(targets);
}

export function clearCache(creepName?: string): void {
  // Simple no-op for stub
}

export function clearCacheOnStateChange(creep: Creep): void {
  // Simple no-op for stub
}

// Re-export for compatibility
export { clearCache as clearClosestCache };

export const globalCache = {
  get: (key: string) => cache.get(key)?.data,
  set: (key: string, value: any) => cache.set(key, { data: value, tick: Game.time })
};
