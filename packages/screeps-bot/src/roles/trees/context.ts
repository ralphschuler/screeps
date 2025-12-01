/**
 * Extended Context for Swarm Bot Creep Behavior
 *
 * Provides context for creep decision making without external dependencies.
 */

import type { SquadMemory, SwarmCreepMemory, SwarmState } from "../../memory/schemas";
import { fleeFrom, moveCreep, moveToRoom } from "../../utils/movement";

/**
 * Extended creep context with swarm-specific information
 */
export interface SwarmCreepContext {
  /** The creep making the decision */
  creep: Creep;

  /** The room the creep is in */
  room: Room;

  /** Creep's swarm memory */
  memory: SwarmCreepMemory;

  /** Room's swarm state (if available) */
  swarmState: SwarmState | undefined;

  /** Squad memory if creep is in a squad */
  squadMemory: SquadMemory | undefined;

  /** Whether energy sources are available */
  energyAvailable: boolean;

  /** Whether hostile creeps are nearby */
  nearbyEnemies: boolean;

  /** Number of construction sites in the room */
  constructionSites: number;

  /** Number of damaged structures in the room */
  damagedStructures: number;

  /** Whether creep's store is full */
  isFull: boolean;

  /** Whether creep's store is empty */
  isEmpty: boolean;

  /** Whether creep has a working state set */
  isWorking: boolean;

  /** Assigned source (for harvesters) */
  assignedSource: Source | null | undefined;

  /** Assigned mineral (for mineral harvesters) */
  assignedMineral: Mineral | null | undefined;

  /** Target room (for remote/military operations) */
  targetRoom: string | undefined;

  /** Home room name */
  homeRoom: string;

  /** Whether creep is in home room */
  isInHomeRoom: boolean;

  /** Whether creep is in target room */
  isInTargetRoom: boolean;

  /** Dropped resources nearby */
  droppedResources: Resource[];

  /** Containers with energy */
  containers: StructureContainer[];

  /** Spawns and extensions needing energy */
  spawnStructures: (StructureSpawn | StructureExtension)[];

  /** Towers needing energy */
  towers: StructureTower[];

  /** Storage structure */
  storage: StructureStorage | undefined;

  /** Terminal structure */
  terminal: StructureTerminal | undefined;

  /** Hostile creeps in room */
  hostiles: Creep[];

  /** Damaged friendly creeps */
  damagedAllies: Creep[];

  /** Construction sites sorted by priority */
  prioritizedSites: ConstructionSite[];

  /** Structures needing repair */
  repairTargets: Structure[];

  /** Labs in room */
  labs: StructureLab[];

  /** Factory in room */
  factory: StructureFactory | undefined;
}

/**
 * Action types that can be returned by decision logic
 */
export type SwarmAction =
  | { type: "harvest"; target: Source }
  | { type: "harvestMineral"; target: Mineral }
  | { type: "harvestDeposit"; target: Deposit }
  | { type: "pickup"; target: Resource }
  | { type: "withdraw"; target: AnyStoreStructure | Tombstone | Ruin; resourceType: ResourceConstant }
  | { type: "transfer"; target: AnyStoreStructure; resourceType: ResourceConstant }
  | { type: "build"; target: ConstructionSite }
  | { type: "repair"; target: Structure }
  | { type: "upgrade"; target: StructureController }
  | { type: "attack"; target: Creep | Structure }
  | { type: "rangedAttack"; target: Creep | Structure }
  | { type: "heal"; target: Creep }
  | { type: "rangedHeal"; target: Creep }
  | { type: "dismantle"; target: Structure }
  | { type: "claim"; target: StructureController }
  | { type: "reserve"; target: StructureController }
  | { type: "attackController"; target: StructureController }
  | { type: "moveTo"; target: RoomPosition | RoomObject }
  | { type: "moveToRoom"; roomName: string }
  | { type: "flee"; from: RoomPosition[] }
  | { type: "drop"; resourceType: ResourceConstant }
  | { type: "idle" }
  | { type: "wait"; position: RoomPosition };

/**
 * Create an extended swarm creep context
 */
export function createSwarmContext(creep: Creep): SwarmCreepContext {
  const room = creep.room;
  const memory = creep.memory as unknown as SwarmCreepMemory;
  const roomMem = (Memory as unknown as Record<string, Record<string, { swarm?: SwarmState }>>).rooms?.[room.name];

  // Get squad memory if in a squad
  let squadMemory: SquadMemory | undefined;
  if (memory.squadId) {
    const squads = (Memory as unknown as Record<string, Record<string, SquadMemory>>).squads;
    squadMemory = squads?.[memory.squadId];
  }

  // Pre-calculate common queries for efficiency
  const hostiles = room.find(FIND_HOSTILE_CREEPS);
  const droppedResources = room.find(FIND_DROPPED_RESOURCES, {
    filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > 50
  });

  const containers = room.find(FIND_STRUCTURES, {
    filter: s =>
      s.structureType === STRUCTURE_CONTAINER && (s as StructureContainer).store.getUsedCapacity(RESOURCE_ENERGY) > 100
  }) as StructureContainer[];

  const spawnStructures = room.find(FIND_MY_STRUCTURES, {
    filter: s =>
      (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) &&
      "store" in s &&
      s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  }) as (StructureSpawn | StructureExtension)[];

  const towers = room.find(FIND_MY_STRUCTURES, {
    filter: s =>
      s.structureType === STRUCTURE_TOWER && (s as StructureTower).store.getFreeCapacity(RESOURCE_ENERGY) > 200
  }) as StructureTower[];

  const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
  const prioritized = sites.sort((a, b) => {
    const priority: Record<string, number> = {
      [STRUCTURE_SPAWN]: 100,
      [STRUCTURE_EXTENSION]: 90,
      [STRUCTURE_TOWER]: 80,
      [STRUCTURE_STORAGE]: 70,
      [STRUCTURE_CONTAINER]: 60,
      [STRUCTURE_ROAD]: 30
    };
    return (priority[b.structureType] ?? 50) - (priority[a.structureType] ?? 50);
  });

  const repairTargets = room.find(FIND_STRUCTURES, {
    filter: s => s.hits < s.hitsMax * 0.75 && s.structureType !== STRUCTURE_WALL
  });

  const damagedAllies = room.find(FIND_MY_CREEPS, {
    filter: c => c.hits < c.hitsMax
  });

  const labs = room.find(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_LAB
  }) as StructureLab[];

  const factory = room.find(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_FACTORY
  })[0] as StructureFactory | undefined;

  const targetRoom = memory.targetRoom ?? memory.homeRoom;
  const homeRoom = memory.homeRoom ?? room.name;

  // Get assigned source
  let assignedSource: Source | null = null;
  if (memory.sourceId) {
    assignedSource = Game.getObjectById(memory.sourceId);
  }

  return {
    creep,
    room,
    memory,
    swarmState: roomMem?.swarm,
    squadMemory,
    energyAvailable: room.find(FIND_SOURCES_ACTIVE).length > 0,
    nearbyEnemies: creep.pos.findInRange(FIND_HOSTILE_CREEPS, 10).length > 0,
    constructionSites: sites.length,
    damagedStructures: repairTargets.length,
    isFull: creep.store.getFreeCapacity() === 0,
    isEmpty: creep.store.getUsedCapacity() === 0,
    isWorking: memory.working ?? false,
    assignedSource,
    assignedMineral: room.find(FIND_MINERALS)[0] ?? null,
    targetRoom,
    homeRoom,
    isInHomeRoom: room.name === homeRoom,
    isInTargetRoom: room.name === targetRoom,
    droppedResources,
    containers,
    spawnStructures,
    towers,
    storage: room.storage,
    terminal: room.terminal,
    hostiles,
    damagedAllies,
    prioritizedSites: prioritized,
    repairTargets,
    labs,
    factory
  };
}

/**
 * Execute a swarm action on a creep
 */
export function executeAction(creep: Creep, action: SwarmAction, ctx: SwarmCreepContext): void {
  switch (action.type) {
    case "harvest": {
      const result = creep.harvest(action.target);
      if (result === ERR_NOT_IN_RANGE) {
        moveCreep(creep, action.target, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      break;
    }

    case "harvestMineral": {
      const result = creep.harvest(action.target);
      if (result === ERR_NOT_IN_RANGE) {
        moveCreep(creep, action.target, { visualizePathStyle: { stroke: "#00ff00" } });
      }
      break;
    }

    case "harvestDeposit": {
      const result = creep.harvest(action.target);
      if (result === ERR_NOT_IN_RANGE) {
        moveCreep(creep, action.target, { visualizePathStyle: { stroke: "#00ffff" } });
      }
      break;
    }

    case "pickup": {
      const result = creep.pickup(action.target);
      if (result === ERR_NOT_IN_RANGE) {
        moveCreep(creep, action.target, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      break;
    }

    case "withdraw": {
      const result = creep.withdraw(action.target, action.resourceType);
      if (result === ERR_NOT_IN_RANGE) {
        moveCreep(creep, action.target, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      break;
    }

    case "transfer": {
      const result = creep.transfer(action.target, action.resourceType);
      if (result === ERR_NOT_IN_RANGE) {
        moveCreep(creep, action.target, { visualizePathStyle: { stroke: "#ffffff" } });
      }
      break;
    }

    case "build": {
      const result = creep.build(action.target);
      if (result === ERR_NOT_IN_RANGE) {
        moveCreep(creep, action.target, { visualizePathStyle: { stroke: "#ffffff" } });
      }
      break;
    }

    case "repair": {
      const result = creep.repair(action.target);
      if (result === ERR_NOT_IN_RANGE) {
        moveCreep(creep, action.target, { visualizePathStyle: { stroke: "#ffff00" } });
      }
      break;
    }

    case "upgrade": {
      const result = creep.upgradeController(action.target);
      if (result === ERR_NOT_IN_RANGE) {
        moveCreep(creep, action.target, { visualizePathStyle: { stroke: "#ffffff" } });
      }
      break;
    }

    case "attack": {
      const result = creep.attack(action.target);
      if (result === ERR_NOT_IN_RANGE) {
        moveCreep(creep, action.target, { visualizePathStyle: { stroke: "#ff0000" } });
      }
      break;
    }

    case "rangedAttack": {
      const result = creep.rangedAttack(action.target);
      if (result === ERR_NOT_IN_RANGE) {
        moveCreep(creep, action.target, { visualizePathStyle: { stroke: "#ff0000" } });
      }
      break;
    }

    case "heal": {
      const result = creep.heal(action.target);
      if (result === ERR_NOT_IN_RANGE) {
        moveCreep(creep, action.target, { visualizePathStyle: { stroke: "#00ff00" } });
      }
      break;
    }

    case "rangedHeal": {
      creep.rangedHeal(action.target);
      moveCreep(creep, action.target, { visualizePathStyle: { stroke: "#00ff00" } });
      break;
    }

    case "dismantle": {
      const result = creep.dismantle(action.target);
      if (result === ERR_NOT_IN_RANGE) {
        moveCreep(creep, action.target, { visualizePathStyle: { stroke: "#ff0000" } });
      }
      break;
    }

    case "claim": {
      const result = creep.claimController(action.target);
      if (result === ERR_NOT_IN_RANGE) {
        moveCreep(creep, action.target, { visualizePathStyle: { stroke: "#00ff00" } });
      }
      break;
    }

    case "reserve": {
      const result = creep.reserveController(action.target);
      if (result === ERR_NOT_IN_RANGE) {
        moveCreep(creep, action.target, { visualizePathStyle: { stroke: "#00ff00" } });
      }
      break;
    }

    case "attackController": {
      const result = creep.attackController(action.target);
      if (result === ERR_NOT_IN_RANGE) {
        moveCreep(creep, action.target, { visualizePathStyle: { stroke: "#ff0000" } });
      }
      break;
    }

    case "moveTo": {
      moveCreep(creep, action.target, { visualizePathStyle: { stroke: "#0000ff" } });
      break;
    }

    case "moveToRoom": {
      moveToRoom(creep, action.roomName);
      break;
    }

    case "flee": {
      fleeFrom(creep, action.from, 10);
      break;
    }

    case "drop": {
      creep.drop(action.resourceType);
      break;
    }

    case "idle":
      // Do nothing
      break;

    case "wait": {
      if (!creep.pos.isEqualTo(action.position)) {
        moveCreep(creep, action.position);
      }
      break;
    }
  }

  // Update working state based on carry capacity
  if (ctx.isEmpty) {
    ctx.memory.working = false;
  }
  if (ctx.isFull) {
    ctx.memory.working = true;
  }
}
