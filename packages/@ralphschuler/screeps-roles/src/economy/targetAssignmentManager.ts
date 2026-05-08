/**
 * Target Assignment Manager - Stub for roles package
 * 
 * This is a simplified stub that provides the interface needed by behaviors.
 * The full implementation should come from @ralphschuler/screeps-economy package.
 * 
 * For now, provides simple fallback implementations.
 */

/**
 * Get assigned source for a harvester.
 */
function getMutableCreepMemory<T extends Record<string, unknown>>(creep: Creep): T {
  const creepWithMemory = creep as Creep & { memory?: T };
  if (!creepWithMemory.memory) {
    creepWithMemory.memory = {} as T;
  }
  return creepWithMemory.memory;
}

export function getAssignedSource(creep: Creep): Source | null {
  const memory = getMutableCreepMemory<{ sourceId?: Id<Source> }>(creep);
  if (!memory.sourceId) return null;
  return Game.getObjectById(memory.sourceId);
}

/**
 * Get assigned build target for a builder
 * Falls back to finding closest construction site
 */
export function getAssignedBuildTarget(creep: Creep): ConstructionSite | null {
  if (!creep.room) return null;
  
  const memory = getMutableCreepMemory<{ targetId?: Id<ConstructionSite> }>(creep);
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
  
  const memory = getMutableCreepMemory<{ targetId?: Id<Structure> }>(creep);
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
