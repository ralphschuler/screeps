/**
 * Structure Cache - Centralized structure access with optimized caching
 *
 * Provides type-safe accessors for frequently accessed structures with
 * intelligent TTL values based on structure change frequency.
 * 
 * Design Principles (from ROADMAP.md Section 2):
 * - Aggressive Caching + TTL
 * - Cache stored in global object (heap)
 * - TTL = 10 ticks for structures (change infrequently)
 */

import { globalCache } from "../CacheManager";

const NAMESPACE = "structures";
const DEFAULT_STRUCTURE_TTL = 10; // Structures don't change often
const CONTROLLER_TTL = 100; // Controllers never move

/**
 * Get all towers in a room
 */
export function getRoomTowers(room: Room): StructureTower[] {
  return globalCache.get<StructureTower[]>(`towers_${room.name}`, {
    namespace: NAMESPACE,
    ttl: DEFAULT_STRUCTURE_TTL,
    compute: () => room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_TOWER }
    }) as StructureTower[]
  }) ?? [];
}

/**
 * Get all spawns in a room
 */
export function getRoomSpawns(room: Room): StructureSpawn[] {
  return globalCache.get<StructureSpawn[]>(`spawns_${room.name}`, {
    namespace: NAMESPACE,
    ttl: DEFAULT_STRUCTURE_TTL,
    compute: () => room.find(FIND_MY_SPAWNS)
  }) ?? [];
}

/**
 * Get all links in a room
 */
export function getRoomLinks(room: Room): StructureLink[] {
  return globalCache.get<StructureLink[]>(`links_${room.name}`, {
    namespace: NAMESPACE,
    ttl: DEFAULT_STRUCTURE_TTL,
    compute: () => room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_LINK }
    }) as StructureLink[]
  }) ?? [];
}

/**
 * Get all labs in a room
 */
export function getRoomLabs(room: Room): StructureLab[] {
  return globalCache.get<StructureLab[]>(`labs_${room.name}`, {
    namespace: NAMESPACE,
    ttl: DEFAULT_STRUCTURE_TTL,
    compute: () => room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_LAB }
    }) as StructureLab[]
  }) ?? [];
}

/**
 * Get storage in a room (single structure)
 */
export function getRoomStorage(room: Room): StructureStorage | undefined {
  return globalCache.get<StructureStorage | undefined>(`storage_${room.name}`, {
    namespace: NAMESPACE,
    ttl: DEFAULT_STRUCTURE_TTL,
    compute: () => room.storage
  });
}

/**
 * Get terminal in a room (single structure)
 */
export function getRoomTerminal(room: Room): StructureTerminal | undefined {
  return globalCache.get<StructureTerminal | undefined>(`terminal_${room.name}`, {
    namespace: NAMESPACE,
    ttl: DEFAULT_STRUCTURE_TTL,
    compute: () => room.terminal
  });
}

/**
 * Get controller in a room (single structure)
 */
export function getRoomController(room: Room): StructureController | undefined {
  return globalCache.get<StructureController | undefined>(`controller_${room.name}`, {
    namespace: NAMESPACE,
    ttl: CONTROLLER_TTL, // Controllers never move, cache longer
    compute: () => room.controller
  });
}

/**
 * Get all extensions in a room
 */
export function getRoomExtensions(room: Room): StructureExtension[] {
  return globalCache.get<StructureExtension[]>(`extensions_${room.name}`, {
    namespace: NAMESPACE,
    ttl: DEFAULT_STRUCTURE_TTL,
    compute: () => room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_EXTENSION }
    }) as StructureExtension[]
  }) ?? [];
}

/**
 * Get all containers in a room
 */
export function getRoomContainers(room: Room): StructureContainer[] {
  return globalCache.get<StructureContainer[]>(`containers_${room.name}`, {
    namespace: NAMESPACE,
    ttl: DEFAULT_STRUCTURE_TTL,
    compute: () => room.find(FIND_STRUCTURES, {
      filter: { structureType: STRUCTURE_CONTAINER }
    }) as StructureContainer[]
  }) ?? [];
}

/**
 * Get factory in a room (single structure)
 */
export function getRoomFactory(room: Room): StructureFactory | undefined {
  return globalCache.get<StructureFactory | undefined>(`factory_${room.name}`, {
    namespace: NAMESPACE,
    ttl: DEFAULT_STRUCTURE_TTL,
    compute: () => room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_FACTORY }
    })[0] as StructureFactory | undefined
  });
}

/**
 * Get power spawn in a room (single structure)
 */
export function getRoomPowerSpawn(room: Room): StructurePowerSpawn | undefined {
  return globalCache.get<StructurePowerSpawn | undefined>(`powerSpawn_${room.name}`, {
    namespace: NAMESPACE,
    ttl: DEFAULT_STRUCTURE_TTL,
    compute: () => room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_POWER_SPAWN }
    })[0] as StructurePowerSpawn | undefined
  });
}

/**
 * Get nuker in a room (single structure)
 */
export function getRoomNuker(room: Room): StructureNuker | undefined {
  return globalCache.get<StructureNuker | undefined>(`nuker_${room.name}`, {
    namespace: NAMESPACE,
    ttl: DEFAULT_STRUCTURE_TTL,
    compute: () => room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_NUKER }
    })[0] as StructureNuker | undefined
  });
}

/**
 * Get observer in a room (single structure)
 */
export function getRoomObserver(room: Room): StructureObserver | undefined {
  return globalCache.get<StructureObserver | undefined>(`observer_${room.name}`, {
    namespace: NAMESPACE,
    ttl: DEFAULT_STRUCTURE_TTL,
    compute: () => room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_OBSERVER }
    })[0] as StructureObserver | undefined
  });
}

/**
 * Get all sources in a room (never change after discovery)
 */
export function getRoomSources(room: Room): Source[] {
  return globalCache.get<Source[]>(`sources_${room.name}`, {
    namespace: NAMESPACE,
    ttl: -1, // Sources never change, cache indefinitely
    compute: () => room.find(FIND_SOURCES)
  }) ?? [];
}

/**
 * Get mineral in a room (never changes)
 */
export function getRoomMineral(room: Room): Mineral | undefined {
  return globalCache.get<Mineral | undefined>(`mineral_${room.name}`, {
    namespace: NAMESPACE,
    ttl: -1, // Minerals never change, cache indefinitely
    compute: () => room.find(FIND_MINERALS)[0]
  });
}

/**
 * Invalidate all structure caches for a room
 * Called when structures are built or destroyed
 */
export function invalidateRoomStructureCache(roomName: string): void {
  const pattern = new RegExp(`^\\w+_${roomName}$`);
  globalCache.invalidatePattern(pattern, NAMESPACE);
}

/**
 * Invalidate specific structure type cache for a room
 */
export function invalidateStructureTypeCache(roomName: string, type: string): void {
  globalCache.invalidate(`${type}_${roomName}`, NAMESPACE);
}

/**
 * Get cache statistics for structure cache
 */
export function getStructureCacheStats() {
  return globalCache.getCacheStats(NAMESPACE);
}

/**
 * Clear all structure caches
 */
export function clearStructureCache(): void {
  globalCache.clear(NAMESPACE);
}
