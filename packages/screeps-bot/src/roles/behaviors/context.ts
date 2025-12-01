/**
 * Creep Context Factory
 *
 * Creates the context object that behaviors use for decision making.
 * All room queries are cached here to avoid redundant lookups.
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
 * Find dropped resources worth picking up.
 */
function findDroppedResources(room: Room): Resource[] {
  return room.find(FIND_DROPPED_RESOURCES, {
    filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > 50
  });
}

/**
 * Find containers with energy.
 */
function findEnergyContainers(room: Room): StructureContainer[] {
  return room.find(FIND_STRUCTURES, {
    filter: s =>
      s.structureType === STRUCTURE_CONTAINER && s.store.getUsedCapacity(RESOURCE_ENERGY) > 100
  }) as StructureContainer[];
}

/**
 * Find spawn structures that need energy.
 */
function findSpawnStructures(room: Room): (StructureSpawn | StructureExtension)[] {
  return room.find(FIND_MY_STRUCTURES, {
    filter: s =>
      (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) &&
      "store" in s &&
      s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  }) as (StructureSpawn | StructureExtension)[];
}

/**
 * Find towers that need energy.
 */
function findTowersNeedingEnergy(room: Room): StructureTower[] {
  return room.find(FIND_MY_STRUCTURES, {
    filter: s =>
      s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 200
  }) as StructureTower[];
}

/**
 * Find construction sites sorted by priority.
 */
function findPrioritizedSites(room: Room): ConstructionSite[] {
  const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
  return sites.sort((a, b) => {
    const priorityA = CONSTRUCTION_PRIORITY[a.structureType] ?? 50;
    const priorityB = CONSTRUCTION_PRIORITY[b.structureType] ?? 50;
    return priorityB - priorityA;
  });
}

/**
 * Find structures that need repair.
 */
function findRepairTargets(room: Room): Structure[] {
  return room.find(FIND_STRUCTURES, {
    filter: s => s.hits < s.hitsMax * 0.75 && s.structureType !== STRUCTURE_WALL
  });
}

/**
 * Find damaged friendly creeps.
 */
function findDamagedAllies(room: Room): Creep[] {
  return room.find(FIND_MY_CREEPS, {
    filter: c => c.hits < c.hitsMax
  });
}

/**
 * Find labs in the room.
 */
function findLabs(room: Room): StructureLab[] {
  return room.find(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_LAB
  }) as StructureLab[];
}

/**
 * Find factory in the room.
 */
function findFactory(room: Room): StructureFactory | undefined {
  return room.find(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_FACTORY
  })[0] as StructureFactory | undefined;
}

/**
 * Get the assigned source for a harvester.
 */
function getAssignedSource(memory: SwarmCreepMemory): Source | null {
  if (!memory.sourceId) return null;
  return Game.getObjectById(memory.sourceId);
}

/**
 * Create a context object for a creep.
 * This centralizes all room queries for efficiency.
 */
export function createContext(creep: Creep): CreepContext {
  const room = creep.room;
  const memory = creep.memory as unknown as SwarmCreepMemory;

  const hostiles = room.find(FIND_HOSTILE_CREEPS);
  const repairTargets = findRepairTargets(room);
  const prioritizedSites = findPrioritizedSites(room);

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
    assignedMineral: room.find(FIND_MINERALS)[0] ?? null,

    // Room analysis
    energyAvailable: room.find(FIND_SOURCES_ACTIVE).length > 0,
    nearbyEnemies: creep.pos.findInRange(FIND_HOSTILE_CREEPS, 10).length > 0,
    constructionSiteCount: prioritizedSites.length,
    damagedStructureCount: repairTargets.length,

    // Cached room objects
    droppedResources: findDroppedResources(room),
    containers: findEnergyContainers(room),
    spawnStructures: findSpawnStructures(room),
    towers: findTowersNeedingEnergy(room),
    storage: room.storage,
    terminal: room.terminal,
    hostiles,
    damagedAllies: findDamagedAllies(room),
    prioritizedSites,
    repairTargets,
    labs: findLabs(room),
    factory: findFactory(room)
  };
}
