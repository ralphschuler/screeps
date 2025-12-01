/**
 * Creep Context Factory
 *
 * Creates the context object that behaviors use for decision making.
 * All room queries are cached here to avoid redundant lookups.
 *
 * PERFORMANCE OPTIMIZATION: Room data is cached per-tick so that multiple
 * creeps in the same room share the same cached find() results.
 */

import type { SquadMemory, SwarmCreepMemory, SwarmState } from "../../memory/schemas";
import type { CreepContext } from "./types";

/**
 * Priority order for construction sites.
 * Higher values = higher priority.
 */
const CONSTRUCTION_PRIORITY: Record<string, number> = {
  [STRUCTURE_SPAWN]: 100,
  [STRUCTURE_EXTENSION]: 90,
  [STRUCTURE_TOWER]: 80,
  [STRUCTURE_STORAGE]: 70,
  [STRUCTURE_CONTAINER]: 60,
  [STRUCTURE_ROAD]: 30
};

// =============================================================================
// Per-Tick Room Cache
// =============================================================================

/**
 * Cached room data that is shared across all creeps in the same room per tick.
 * This dramatically reduces CPU by avoiding repeated room.find() calls.
 */
interface RoomCache {
  tick: number;
  hostiles: Creep[];
  droppedResources: Resource[];
  containers: StructureContainer[];
  spawnStructures: (StructureSpawn | StructureExtension)[];
  towers: StructureTower[];
  prioritizedSites: ConstructionSite[];
  repairTargets: Structure[];
  damagedAllies: Creep[];
  labs: StructureLab[];
  factory: StructureFactory | undefined;
  minerals: Mineral[];
  activeSources: Source[];
}

/** Per-room cache storage */
const roomCacheMap = new Map<string, RoomCache>();

/**
 * Get or create cached room data.
 * Only runs find() calls once per room per tick.
 */
function getRoomCache(room: Room): RoomCache {
  const existing = roomCacheMap.get(room.name);
  if (existing && existing.tick === Game.time) {
    return existing;
  }

  // Build new cache - this is the expensive part, but only happens once per room per tick
  const myStructures = room.find(FIND_MY_STRUCTURES);
  const allStructures = room.find(FIND_STRUCTURES);

  const cache: RoomCache = {
    tick: Game.time,
    hostiles: room.find(FIND_HOSTILE_CREEPS),
    droppedResources: room.find(FIND_DROPPED_RESOURCES, {
      filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > 50
    }),
    containers: allStructures.filter(
      (s): s is StructureContainer => s.structureType === STRUCTURE_CONTAINER && s.store.getUsedCapacity(RESOURCE_ENERGY) > 100
    ),
    spawnStructures: myStructures.filter(
      (s): s is StructureSpawn | StructureExtension =>
        (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) &&
        s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    ),
    towers: myStructures.filter(
      (s): s is StructureTower => s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 200
    ),
    prioritizedSites: room.find(FIND_MY_CONSTRUCTION_SITES).sort((a, b) => {
      const priorityA = CONSTRUCTION_PRIORITY[a.structureType] ?? 50;
      const priorityB = CONSTRUCTION_PRIORITY[b.structureType] ?? 50;
      return priorityB - priorityA;
    }),
    repairTargets: allStructures.filter(s => s.hits < s.hitsMax * 0.75 && s.structureType !== STRUCTURE_WALL),
    damagedAllies: room.find(FIND_MY_CREEPS, { filter: c => c.hits < c.hitsMax }),
    labs: myStructures.filter((s): s is StructureLab => s.structureType === STRUCTURE_LAB),
    factory: myStructures.find((s): s is StructureFactory => s.structureType === STRUCTURE_FACTORY),
    minerals: room.find(FIND_MINERALS),
    activeSources: room.find(FIND_SOURCES_ACTIVE)
  };

  roomCacheMap.set(room.name, cache);
  return cache;
}

/**
 * Clear all room caches. Call at the start of each tick if needed.
 * Note: Caches auto-invalidate based on tick number, so this is optional.
 */
export function clearRoomCaches(): void {
  roomCacheMap.clear();
}

// =============================================================================
// Memory Helpers
// =============================================================================

/**
 * Get swarm state from room memory.
 */
function getSwarmState(roomName: string): SwarmState | undefined {
  const roomMem = (Memory as unknown as Record<string, Record<string, { swarm?: SwarmState }>>).rooms?.[roomName];
  return roomMem?.swarm;
}

/**
 * Get squad memory if creep is in a squad.
 */
function getSquadMemory(squadId: string | undefined): SquadMemory | undefined {
  if (!squadId) return undefined;
  const squads = (Memory as unknown as Record<string, Record<string, SquadMemory>>).squads;
  return squads?.[squadId];
}

/**
 * Get the assigned source for a harvester.
 */
function getAssignedSource(memory: SwarmCreepMemory): Source | null {
  if (!memory.sourceId) return null;
  return Game.getObjectById(memory.sourceId);
}

// =============================================================================
// Context Factory
// =============================================================================

/**
 * Create a context object for a creep.
 * Uses per-tick room caching to minimize CPU usage.
 */
export function createContext(creep: Creep): CreepContext {
  const room = creep.room;
  const memory = creep.memory as unknown as SwarmCreepMemory;

  // Get cached room data - only runs find() once per room per tick
  const roomCache = getRoomCache(room);

  const targetRoom = memory.targetRoom ?? memory.homeRoom;
  const homeRoom = memory.homeRoom ?? room.name;

  return {
    // Core references
    creep,
    room,
    memory,

    // Room state
    swarmState: getSwarmState(room.name),
    squadMemory: getSquadMemory(memory.squadId),

    // Location info
    homeRoom,
    targetRoom,
    isInHomeRoom: room.name === homeRoom,
    isInTargetRoom: room.name === targetRoom,

    // Creep state
    isFull: creep.store.getFreeCapacity() === 0,
    isEmpty: creep.store.getUsedCapacity() === 0,
    isWorking: memory.working ?? false,

    // Assigned targets
    assignedSource: getAssignedSource(memory),
    assignedMineral: roomCache.minerals[0] ?? null,

    // Room analysis (using cached data)
    energyAvailable: roomCache.activeSources.length > 0,
    nearbyEnemies: roomCache.hostiles.some(h => creep.pos.inRangeTo(h, 10)),
    constructionSiteCount: roomCache.prioritizedSites.length,
    damagedStructureCount: roomCache.repairTargets.length,

    // Cached room objects (all from cache)
    droppedResources: roomCache.droppedResources,
    containers: roomCache.containers,
    spawnStructures: roomCache.spawnStructures,
    towers: roomCache.towers,
    storage: room.storage,
    terminal: room.terminal,
    hostiles: roomCache.hostiles,
    damagedAllies: roomCache.damagedAllies,
    prioritizedSites: roomCache.prioritizedSites,
    repairTargets: roomCache.repairTargets,
    labs: roomCache.labs,
    factory: roomCache.factory
  };
}
