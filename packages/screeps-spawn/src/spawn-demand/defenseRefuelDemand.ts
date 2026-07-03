import { getActualHostileCreeps } from "@ralphschuler/screeps-defense";
import type { SwarmCreepMemory } from "@ralphschuler/screeps-memory";
import type { BodyTemplate } from "../roleDefinitions";
import { getEffectiveRoomEnergyAvailable } from "../roomEnergy";
import { SpawnPriority, spawnQueue } from "../spawnQueue";

const DEFENSE_REFUEL_TASK = "defenseRefuel";
const DEFENSE_REFUEL_REQUEST_TTL = 500;
const DEFENSE_REFUEL_ENERGY_THRESHOLD = 200;
const DEFENSE_REFUEL_SOURCE_CONTAINER_MIN = 100;
const DEFENSE_REFUEL_MAX_LOCAL_HAULERS = 2;

const MIN_DEFENSE_REFUEL_BODY: BodyTemplate = {
  parts: [CARRY, MOVE],
  cost: 100,
  minCapacity: 100
};

interface DefenseAssistRequestMemory {
  roomName: string;
  urgency?: number;
  createdAt?: number;
}

interface DefenseRefuelMemory {
  defenseRequests?: DefenseAssistRequestMemory[] | Record<string, DefenseAssistRequestMemory>;
}

export interface DefenseRefuelSpawnAssignment {
  task: typeof DEFENSE_REFUEL_TASK;
  priority: SpawnPriority;
  body: BodyTemplate;
}

function getDefenseRequests(): DefenseAssistRequestMemory[] {
  const requests = (Memory as unknown as DefenseRefuelMemory).defenseRequests;
  return Array.isArray(requests) ? requests : Object.values(requests ?? {});
}

function hasVisibleEmergencyDefenseRequest(homeRoom: string): boolean {
  return getDefenseRequests().some(request => {
    if (!request || request.roomName === homeRoom) return false;
    if ((request.urgency ?? 1) < 2) return false;
    if (Game.time - (request.createdAt ?? Game.time) > DEFENSE_REFUEL_REQUEST_TTL) return false;

    const targetRoom = Game.rooms[request.roomName];
    return Boolean(targetRoom && getActualHostileCreeps(targetRoom).length > 0);
  });
}

function findSourceContainerEnergy(room: Room): number {
  const sources = room.find(FIND_SOURCES);
  if (sources.length === 0) return 0;

  return room.find(FIND_STRUCTURES, {
    filter: (structure): structure is StructureContainer =>
      structure.structureType === STRUCTURE_CONTAINER &&
      sources.some(source => source.pos.getRangeTo(structure.pos) <= 2)
  }).reduce((total, container) => total + container.store.getUsedCapacity(RESOURCE_ENERGY), 0);
}

function countLocalHaulersAndQueuedRefuelers(homeRoom: string): number {
  let count = 0;

  for (const creep of Object.values(Game.creeps)) {
    const memory = creep.memory as unknown as Partial<SwarmCreepMemory>;
    if (memory.role === "hauler" && memory.homeRoom === homeRoom) count++;
  }

  for (const request of spawnQueue.getPendingRequests(homeRoom)) {
    const task = (request.additionalMemory as { task?: string } | undefined)?.task;
    if (request.role === "hauler" && task === DEFENSE_REFUEL_TASK) count++;
  }

  return count;
}

function canRefuelFromLocalSourceContainers(room: Room): boolean {
  return findSourceContainerEnergy(room) >= DEFENSE_REFUEL_SOURCE_CONTAINER_MIN;
}

function canSpawnLocalRefueler(room: Room): boolean {
  if (!room.controller?.my) return false;
  if (room.find(FIND_MY_SPAWNS).length === 0) return false;
  if (getActualHostileCreeps(room).length > 0) return false;
  if (room.energyCapacityAvailable < MIN_DEFENSE_REFUEL_BODY.cost) return false;
  return true;
}

/**
 * Queue a tiny local hauler before combat assists when an emergency helper room
 * has refillable source-container energy but not enough spawn/extension energy
 * to birth normal defenders. Container energy is not treated as spawnable; the
 * request only makes the refuel path visible and affordable as soon as 100
 * spawn energy accumulates.
 */
export function getDefenseRefuelSpawnAssignment(homeRoom: string, role: string): DefenseRefuelSpawnAssignment | null {
  if (role !== "hauler") return null;

  const home = Game.rooms[homeRoom];
  if (!home || !canSpawnLocalRefueler(home)) return null;
  if (getEffectiveRoomEnergyAvailable(home) >= DEFENSE_REFUEL_ENERGY_THRESHOLD) return null;
  if (!hasVisibleEmergencyDefenseRequest(homeRoom)) return null;
  if (!canRefuelFromLocalSourceContainers(home)) return null;
  if (countLocalHaulersAndQueuedRefuelers(homeRoom) >= DEFENSE_REFUEL_MAX_LOCAL_HAULERS) return null;

  return {
    task: DEFENSE_REFUEL_TASK,
    priority: SpawnPriority.EMERGENCY,
    body: MIN_DEFENSE_REFUEL_BODY
  };
}
