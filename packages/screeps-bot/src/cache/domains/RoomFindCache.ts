/**
 * Room Find Cache - Domain wrapper for unified cache
 *
 * Caches room.find() results with automatic TTL.
 */

import { globalCache } from "../CacheManager";

const NAMESPACE = "roomFind";

const DEFAULT_TTL: Record<string, number> = {
  [FIND_SOURCES]: 5000,
  [FIND_MINERALS]: 5000,
  [FIND_DEPOSITS]: 100,
  [FIND_STRUCTURES]: 50,
  [FIND_MY_STRUCTURES]: 50,
  [FIND_HOSTILE_STRUCTURES]: 20,
  [FIND_MY_SPAWNS]: 100,
  [FIND_MY_CONSTRUCTION_SITES]: 20,
  [FIND_CONSTRUCTION_SITES]: 20,
  [FIND_CREEPS]: 5,
  [FIND_MY_CREEPS]: 5,
  [FIND_HOSTILE_CREEPS]: 3,
  [FIND_DROPPED_RESOURCES]: 5,
  [FIND_TOMBSTONES]: 10,
  [FIND_RUINS]: 10,
  [FIND_FLAGS]: 50,
  [FIND_NUKES]: 20,
  [FIND_POWER_CREEPS]: 10,
  [FIND_MY_POWER_CREEPS]: 10
};

function getCacheKey(roomName: string, findType: FindConstant, filterKey?: string): string {
  return filterKey ? `${roomName}:${findType}:${filterKey}` : `${roomName}:${findType}`;
}

export function cachedRoomFind<T>(
  room: Room,
  findType: FindConstant,
  opts?: {
    filter?: any | ((obj: T) => boolean);
    filterKey?: string;
    ttl?: number;
  }
): T[] {
  const key = getCacheKey(room.name, findType, opts?.filterKey);
  
  return globalCache.get<T[]>(key, {
    namespace: NAMESPACE,
    ttl: opts?.ttl ?? DEFAULT_TTL[findType] ?? 20,
    compute: () => {
      if (opts?.filter) {
        return room.find(findType as any, { filter: opts.filter }) as T[];
      } else {
        return room.find(findType as any) as T[];
      }
    }
  })!;
}

export function invalidateRoomCache(roomName: string): void {
  const pattern = new RegExp(`^${roomName}:`);
  globalCache.invalidatePattern(pattern, NAMESPACE);
}

export function invalidateFindType(
  roomName: string,
  findType: FindConstant,
  filterKey?: string
): void {
  const key = getCacheKey(roomName, findType, filterKey);
  globalCache.invalidate(key, NAMESPACE);
}

export function invalidateStructureCache(roomName: string): void {
  const structureTypes = [
    FIND_STRUCTURES,
    FIND_MY_STRUCTURES,
    FIND_HOSTILE_STRUCTURES,
    FIND_MY_SPAWNS,
    FIND_MY_CONSTRUCTION_SITES,
    FIND_CONSTRUCTION_SITES
  ];
  
  for (const findType of structureTypes) {
    const pattern = new RegExp(`^${roomName}:${findType}`);
    globalCache.invalidatePattern(pattern, NAMESPACE);
  }
}

export function getRoomFindCacheStats() {
  const stats = globalCache.getCacheStats(NAMESPACE);
  return {
    rooms: 0, // Not tracked separately anymore
    totalEntries: stats.size,
    hits: stats.hits,
    misses: stats.misses,
    invalidations: stats.evictions,
    hitRate: stats.hitRate
  };
}

export function clearRoomFindCache(): void {
  globalCache.clear(NAMESPACE);
}

// Convenience functions
export function cachedFindSources(room: Room): Source[] {
  return cachedRoomFind(room, FIND_SOURCES);
}

export function cachedFindHostileCreeps(room: Room): Creep[] {
  return cachedRoomFind(room, FIND_HOSTILE_CREEPS);
}

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

export function cachedFindMyStructures<T extends Structure>(
  room: Room,
  structureType?: StructureConstant
): T[] {
  if (structureType) {
    return cachedRoomFind(room, FIND_MY_STRUCTURES, {
      filter: (s: Structure) => s.structureType === structureType,
      filterKey: structureType
    });
  }
  return cachedRoomFind(room, FIND_MY_STRUCTURES);
}

export function cachedFindConstructionSites(
  room: Room,
  my = true
): ConstructionSite[] {
  return cachedRoomFind(room, my ? FIND_MY_CONSTRUCTION_SITES : FIND_CONSTRUCTION_SITES);
}

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
