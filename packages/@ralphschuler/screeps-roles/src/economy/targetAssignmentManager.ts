/**
 * Target Assignment Manager - Stub for roles package
 * 
 * This is a simplified stub that provides the interface needed by behaviors.
 * The full implementation should come from @ralphschuler/screeps-economy package.
 *
 * For now, provides simple fallback implementations.
 */

import type { BaseCreepMemory } from "../framework/types";

type MutableCreepMemory<T extends BaseCreepMemory> = CreepMemory &
  BaseCreepMemory &
  { room?: string } &
  Partial<T>;

/**
 * Get assigned source for a harvester.
 */
function getMutableCreepMemory<T extends BaseCreepMemory>(
  creep: Creep
): MutableCreepMemory<T> {
  const roomName = creep.room?.name ?? "";
  const creepWithMemory = creep as Creep & { memory?: MutableCreepMemory<T> };

  const memory: MutableCreepMemory<T> = creepWithMemory.memory ?? ({} as MutableCreepMemory<T>);

  if (!creepWithMemory.memory) {
    creepWithMemory.memory = memory;
  }

  if (memory.role == null) memory.role = "unknown";
  if (memory.homeRoom == null) memory.homeRoom = roomName;
  if (memory.working == null) memory.working = false;
  if (memory.room == null) {
    memory.room = roomName;
  }

  return memory;
}

export function getAssignedSource(creep: Creep): Source | null {
  const memory = getMutableCreepMemory<BaseCreepMemory & { sourceId?: Id<Source> }>(creep);
  if (!memory.sourceId) return null;
  return Game.getObjectById(memory.sourceId);
}

/**
 * Get assigned build target for a builder
 * Falls back to finding closest construction site
 */
export function getAssignedBuildTarget(creep: Creep): ConstructionSite | null {
  if (!creep.room) return null;
  
  const memory = getMutableCreepMemory<BaseCreepMemory & { targetId?: Id<ConstructionSite> }>(creep);
  if (memory.targetId) {
    const site = Game.getObjectById(memory.targetId);
    if (site) return site;
  }
  
  const sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
  if (sites.length === 0) return null;
  
  const closest = creep.pos.findClosestByRange(sites);
  if (closest) {
    memory.targetId = closest.id;
  }
  return closest;
}

/**
 * Get assigned repair target for a repairer
 * Falls back to finding closest damaged structure
 */
export function getAssignedRepairTarget(creep: Creep): Structure | null {
  if (!creep.room) return null;
  
  const memory = getMutableCreepMemory<BaseCreepMemory & { targetId?: Id<Structure> }>(creep);
  if (memory.targetId) {
    const structure = Game.getObjectById(memory.targetId);
    if (structure && structure.hits < structure.hitsMax) {
      return structure;
    }
  }
  
  const structures = creep.room.find(FIND_STRUCTURES, {
    filter: s => s.hits < s.hitsMax
  });
  if (structures.length === 0) return null;
  
  const closest = creep.pos.findClosestByRange(structures);
  if (closest) {
    memory.targetId = closest.id;
  }
  return closest;
}
