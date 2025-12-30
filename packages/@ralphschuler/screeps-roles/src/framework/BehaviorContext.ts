/**
 * Behavior Context Factory
 *
 * Creates the context object that behaviors use for decision making.
 * All room queries are cached here to avoid redundant lookups.
 *
 * PERFORMANCE OPTIMIZATION:
 * - Room data is cached per-tick so that multiple creeps in the same room
 *   share the same cached find() results.
 * - Lazy evaluation: expensive fields are only computed when first accessed.
 * - Efficient hostile threat checks use direct distance calculation.
 */

import type { BaseCreepMemory, CreepContext } from "./types";

/**
 * Priority order for construction sites.
 * Higher values = higher priority.
 */
const CONSTRUCTION_PRIORITY: Record<string, number> = {
  [STRUCTURE_SPAWN]: 100,
  [STRUCTURE_EXTENSION]: 90,
  [STRUCTURE_TOWER]: 80,
  [STRUCTURE_RAMPART]: 75,
  [STRUCTURE_WALL]: 70,
  [STRUCTURE_STORAGE]: 70,
  [STRUCTURE_CONTAINER]: 60,
  [STRUCTURE_ROAD]: 30
};

/** Threat detection range for hostiles */
const HOSTILE_THREAT_RANGE = 10;

// =============================================================================
// Per-Tick Room Cache with Lazy Evaluation
// =============================================================================

/**
 * Cached room data that is shared across all creeps in the same room per tick.
 */
interface RoomCache {
  tick: number;
  room: Room;

  // Core cached data
  hostiles: Creep[];
  myStructures: OwnedStructure[];
  allStructures: Structure[];
  _allStructuresLoaded?: boolean;

  // Lazy-evaluated fields
  _droppedResources?: Resource[];
  _containers?: StructureContainer[];
  _depositContainers?: StructureContainer[];
  _spawnStructures?: (StructureSpawn | StructureExtension)[];
  _towers?: StructureTower[];
  _prioritizedSites?: ConstructionSite[];
  _repairTargets?: Structure[];
  _damagedAllies?: Creep[];
  _labs?: StructureLab[];
  _factory?: StructureFactory | undefined;
  _factoryChecked?: boolean;
  _minerals?: Mineral[];
  _activeSources?: Source[];
  _tombstones?: Tombstone[];
  _mineralContainers?: StructureContainer[];
}

/** Per-room cache storage - cleared at the start of each tick via clearRoomCaches() */
const roomCacheMap = new Map<string, RoomCache>();

/**
 * Check if a position is within hostile threat range.
 */
function isInHostileThreatRange(pos: RoomPosition, hostiles: Creep[]): boolean {
  for (const hostile of hostiles) {
    const dx = Math.abs(pos.x - hostile.pos.x);
    const dy = Math.abs(pos.y - hostile.pos.y);
    if (Math.max(dx, dy) <= HOSTILE_THREAT_RANGE) {
      return true;
    }
  }
  return false;
}

/**
 * Get or create cached room data.
 * Only runs find() calls once per room per tick.
 */
function getRoomCache(room: Room): RoomCache {
  const existing = roomCacheMap.get(room.name);
  if (existing && existing.tick === Game.time) {
    return existing;
  }

  const cache: RoomCache = {
    tick: Game.time,
    room,
    hostiles: room.find(FIND_HOSTILE_CREEPS),
    myStructures: room.find(FIND_MY_STRUCTURES),
    allStructures: []
  };

  roomCacheMap.set(room.name, cache);
  return cache;
}

/**
 * Ensure allStructures is loaded in cache (lazy load optimization).
 */
function ensureAllStructuresLoaded(cache: RoomCache): void {
  if (!cache._allStructuresLoaded) {
    cache.allStructures = cache.room.find(FIND_STRUCTURES);
    cache._allStructuresLoaded = true;
  }
}

/**
 * Get dropped resources from cache (lazy evaluation)
 */
function getDroppedResources(cache: RoomCache): Resource[] {
  if (cache._droppedResources === undefined) {
    cache._droppedResources = cache.room.find(FIND_DROPPED_RESOURCES, {
      filter: r => (r.resourceType === RESOURCE_ENERGY && r.amount > 50) || 
                   (r.resourceType !== RESOURCE_ENERGY && r.amount > 0)
    });
  }
  return cache._droppedResources;
}

/**
 * Get containers from cache (lazy evaluation)
 */
function getContainers(cache: RoomCache): StructureContainer[] {
  if (cache._containers === undefined) {
    ensureAllStructuresLoaded(cache);
    cache._containers = cache.allStructures.filter(
      (s): s is StructureContainer => s.structureType === STRUCTURE_CONTAINER
    );
  }
  return cache._containers;
}

/**
 * Get containers with free capacity from cache (lazy evaluation)
 * Note: Returns all containers. Capacity should be checked by behavior functions
 * for fresh state, as container capacity changes during the tick.
 */
function getDepositContainers(cache: RoomCache): StructureContainer[] {
  if (cache._depositContainers === undefined) {
    ensureAllStructuresLoaded(cache);
    // Return all containers - behaviors will check for free capacity as needed
    // This prevents stale capacity data from cache
    cache._depositContainers = cache.allStructures.filter(
      (s): s is StructureContainer => s.structureType === STRUCTURE_CONTAINER
    );
  }
  return cache._depositContainers;
}

/**
 * Get spawn structures from cache (lazy evaluation)
 */
function getSpawnStructures(cache: RoomCache): (StructureSpawn | StructureExtension)[] {
  if (cache._spawnStructures === undefined) {
    cache._spawnStructures = cache.myStructures.filter(
      (s): s is StructureSpawn | StructureExtension =>
        s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION
    );
  }
  return cache._spawnStructures;
}

/**
 * Get towers from cache (lazy evaluation)
 */
function getTowers(cache: RoomCache): StructureTower[] {
  if (cache._towers === undefined) {
    cache._towers = cache.myStructures.filter(
      (s): s is StructureTower => s.structureType === STRUCTURE_TOWER
    );
  }
  return cache._towers;
}

/**
 * Get prioritized construction sites from cache (lazy evaluation)
 */
function getPrioritizedSites(cache: RoomCache): ConstructionSite[] {
  if (cache._prioritizedSites === undefined) {
    cache._prioritizedSites = cache.room.find(FIND_MY_CONSTRUCTION_SITES).sort((a, b) => {
      const priorityA = CONSTRUCTION_PRIORITY[a.structureType] ?? 50;
      const priorityB = CONSTRUCTION_PRIORITY[b.structureType] ?? 50;
      return priorityB - priorityA;
    });
  }
  return cache._prioritizedSites;
}

/**
 * Get repair targets from cache (lazy evaluation)
 */
function getRepairTargets(cache: RoomCache): Structure[] {
  if (cache._repairTargets === undefined) {
    ensureAllStructuresLoaded(cache);
    cache._repairTargets = cache.allStructures.filter(
      s => s.hits < s.hitsMax * 0.75 && s.structureType !== STRUCTURE_WALL
    );
  }
  return cache._repairTargets;
}

/**
 * Get damaged allies from cache (lazy evaluation)
 */
function getDamagedAllies(cache: RoomCache): Creep[] {
  if (cache._damagedAllies === undefined) {
    cache._damagedAllies = cache.room.find(FIND_MY_CREEPS, { filter: c => c.hits < c.hitsMax });
  }
  return cache._damagedAllies;
}

/**
 * Get labs from cache (lazy evaluation)
 */
function getLabs(cache: RoomCache): StructureLab[] {
  if (cache._labs === undefined) {
    cache._labs = cache.myStructures.filter((s): s is StructureLab => s.structureType === STRUCTURE_LAB);
  }
  return cache._labs;
}

/**
 * Get factory from cache (lazy evaluation)
 */
function getFactory(cache: RoomCache): StructureFactory | undefined {
  if (!cache._factoryChecked) {
    cache._factory = cache.myStructures.find((s): s is StructureFactory => s.structureType === STRUCTURE_FACTORY);
    cache._factoryChecked = true;
  }
  return cache._factory;
}

/**
 * Get minerals from cache (lazy evaluation)
 */
function getMinerals(cache: RoomCache): Mineral[] {
  if (cache._minerals === undefined) {
    cache._minerals = cache.room.find(FIND_MINERALS);
  }
  return cache._minerals;
}

/**
 * Get active sources from cache (lazy evaluation)
 */
function getActiveSources(cache: RoomCache): Source[] {
  if (cache._activeSources === undefined) {
    cache._activeSources = cache.room.find(FIND_SOURCES_ACTIVE);
  }
  return cache._activeSources;
}

/**
 * Get tombstones from cache (lazy evaluation)
 */
function getTombstones(cache: RoomCache): Tombstone[] {
  if (cache._tombstones === undefined) {
    cache._tombstones = cache.room.find(FIND_TOMBSTONES);
  }
  return cache._tombstones;
}

/**
 * Get containers with minerals from cache (lazy evaluation)
 */
function getMineralContainers(cache: RoomCache): StructureContainer[] {
  if (cache._mineralContainers === undefined) {
    cache._mineralContainers = cache.room.find(FIND_STRUCTURES, {
      filter: s => {
        if (s.structureType !== STRUCTURE_CONTAINER) return false;
        const container = s as StructureContainer;
        const resources = Object.keys(container.store) as ResourceConstant[];
        return resources.some(r => r !== RESOURCE_ENERGY && container.store.getUsedCapacity(r) > 0);
      }
    }) as StructureContainer[];
  }
  return cache._mineralContainers;
}

/**
 * Clear all room caches. Must be called at the start of each tick.
 */
export function clearRoomCaches(): void {
  roomCacheMap.clear();
}

// =============================================================================
// Context Factory
// =============================================================================

/**
 * Create a context object for a creep.
 * Uses per-tick room caching with lazy evaluation to minimize CPU usage.
 * 
 * **Side Effect**: This function initializes `memory.working` if it's undefined,
 * setting it based on the creep's current store state. This ensures creeps have
 * a valid working state for behavior evaluation. This is a one-time initialization
 * that only occurs when the field is truly undefined.
 */
export function createContext<TMemory extends BaseCreepMemory = BaseCreepMemory>(
  creep: Creep
): CreepContext<TMemory> {
  const room = creep.room;
  const memory = creep.memory as TMemory;

  // Get cached room data
  const roomCache = getRoomCache(room);

  // Initialize working state if undefined (one-time initialization)
  if (memory.working === undefined) {
    memory.working = creep.store.getUsedCapacity() > 0;
  }

  const homeRoom = memory.homeRoom ?? room.name;

  // Get assigned source
  const assignedSource = memory.sourceId ? Game.getObjectById(memory.sourceId) : null;

  return {
    // Core references
    creep,
    room,
    memory,

    // Location info
    homeRoom,
    isInHomeRoom: room.name === homeRoom,

    // Creep state
    isFull: creep.store.getFreeCapacity() === 0,
    isEmpty: creep.store.getUsedCapacity() === 0,
    isWorking: memory.working ?? false,

    // Assigned targets
    assignedSource,
    get assignedMineral() {
      const minerals = getMinerals(roomCache);
      return minerals[0] ?? null;
    },

    // Room analysis
    get energyAvailable() {
      return getActiveSources(roomCache).length > 0;
    },
    get nearbyEnemies() {
      return roomCache.hostiles.length > 0 && isInHostileThreatRange(creep.pos, roomCache.hostiles);
    },
    get constructionSiteCount() {
      return getPrioritizedSites(roomCache).length;
    },
    get damagedStructureCount() {
      return getRepairTargets(roomCache).length;
    },

    // Cached room objects
    get droppedResources() {
      return getDroppedResources(roomCache);
    },
    get containers() {
      return getContainers(roomCache);
    },
    get depositContainers() {
      return getDepositContainers(roomCache);
    },
    get spawnStructures() {
      return getSpawnStructures(roomCache);
    },
    get towers() {
      return getTowers(roomCache);
    },
    storage: room.storage,
    terminal: room.terminal,
    hostiles: roomCache.hostiles,
    get damagedAllies() {
      return getDamagedAllies(roomCache);
    },
    get prioritizedSites() {
      return getPrioritizedSites(roomCache);
    },
    get repairTargets() {
      return getRepairTargets(roomCache);
    },
    get labs() {
      return getLabs(roomCache);
    },
    get factory() {
      return getFactory(roomCache);
    },
    get tombstones() {
      return getTombstones(roomCache);
    },
    get mineralContainers() {
      return getMineralContainers(roomCache);
    }
  };
}
