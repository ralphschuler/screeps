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

/**
 * Simplified implementation of findCachedClosest for extracted roles package.
 * 
 * NOTE: This is a STUB implementation. The full implementation with proper caching
 * exists in the main screeps-bot package (src/cache/domains/ClosestCache.ts).
 * 
 * TODO: Either copy the full caching implementation or make this package depend
 Issue URL: https://github.com/ralphschuler/screeps/issues/2679
 * on a shared caching utility package.
 * 
 * Current behavior: Simple closest-by-range without caching or TTL.
 * Parameters typeKey and ttl are accepted for API compatibility but not used.
 */
export function findCachedClosest<T extends RoomObject & _HasId>(
  creep: Creep,
  targets: T[],
  typeKey: string,
  ttl: number = 10
): T | null {
  if (targets.length === 0) {
    return null;
  }
  if (targets.length === 1) {
    return targets[0];
  }
  // Simple implementation: just find closest without complex caching
  return creep.pos.findClosestByRange(targets);
}

export function clearClosestCache(creepName: string): void {
  // No-op for now
}

export function clearCacheOnStateChange(creep: Creep): void {
  // No-op for now
}

export const globalCache = {
  get: (key: string) => cache.get(key)?.data,
  set: (key: string, value: any) => cache.set(key, { data: value, tick: Game.time })
};
