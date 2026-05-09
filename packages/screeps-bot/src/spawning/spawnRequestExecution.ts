import type { CreepRole, SwarmCreepMemory } from "@ralphschuler/screeps-memory";
import type { SpawnRequest } from "./spawnQueue";

export function buildSpawnMemory(request: SpawnRequest): SwarmCreepMemory {
  const memory: SwarmCreepMemory = {
    role: request.role,
    family: request.family,
    homeRoom: request.roomName,
    version: 1,
    ...request.additionalMemory
  };

  if (request.targetRoom) {
    memory.targetRoom = request.targetRoom;
  }
  if (request.sourceId) {
    memory.sourceId = request.sourceId;
  }
  if (request.boostRequirements) {
    memory.boostRequirements = request.boostRequirements;
  }

  return memory;
}

export function generateSpawnCreepName(role: CreepRole | string): string {
  return `${role}_${Game.time}_${Math.random().toString(36).substring(2, 11)}`;
}

export function executeSpawnRequest(spawn: StructureSpawn, request: SpawnRequest): ScreepsReturnCode {
  return spawn.spawnCreep(request.body.parts, generateSpawnCreepName(request.role), {
    memory: buildSpawnMemory(request) as unknown as CreepMemory
  });
}
