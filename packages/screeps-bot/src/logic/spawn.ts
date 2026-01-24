/**
 * Spawn Manager - Backward Compatibility Layer
 * 
 * This file re-exports all spawn system functions from the modular spawn system.
 * It maintains backward compatibility with existing code while delegating to the new modules.
 * 
 * New structure:
 * - spawning/roleDefinitions.ts - Role body templates and configurations
 * - spawning/spawnPriority.ts - Priority calculation system
 * - spawning/spawnNeedsAnalyzer.ts - Role needs determination
 * - spawning/bootstrapManager.ts - Bootstrap and emergency logic
 * - spawning/spawnQueueManager.ts - Main spawn coordination
 */

import {
  cachedFindConstructionSites,
  cachedFindSources,
  cachedRoomFind
} from "@ralphschuler/screeps-cache";
import type { SwarmCreepMemory } from "../memory/schemas";

// ============================================================================
// Re-exports from modular spawn system
// ============================================================================

// From roleDefinitions.ts
export { ROLE_DEFINITIONS, type BodyTemplate, type RoleSpawnDef } from "../spawning/roleDefinitions";

// From spawnPriority.ts
export { getPostureSpawnWeights, getDynamicPriorityBoost, getPheromoneMult } from "../spawning/spawnPriority";

// From spawnNeedsAnalyzer.ts
export {
  countCreepsByRole,
  countCreepsOfRole,
  needsRole,
  countRemoteCreepsByTargetRoom,
  getRemoteRoomNeedingWorkers,
  assignRemoteTargetRoom,
  MAX_CARRIERS_PER_CROSS_SHARD_REQUEST
} from "../spawning/spawnNeedsAnalyzer";

// From bootstrapManager.ts
export {
  isBootstrapMode,
  getBootstrapRole,
  isEmergencySpawnState,
  getEnergyProducerCount,
  getTransportCount
} from "../spawning/bootstrapManager";

// From spawnQueueManager.ts
export {
  getBestBody,
  determineNextRole,
  generateCreepName,
  getAllSpawnableRoles,
  runSpawnManager
} from "../spawning/spawnQueueManager";

// ============================================================================
// Task Assignment Functions (remain in this file for now)
// ============================================================================

/**
 * Task assignment - assign source to harvester
 */
export function assignHarvesterSource(creep: Creep): Id<Source> | null {
  const room = creep.room;
  const sources = cachedFindSources(room);

  // Count harvesters per source
  const sourceCounts = new Map<string, number>();
  for (const source of sources) {
    sourceCounts.set(source.id, 0);
  }

  for (const c of Object.values(Game.creeps)) {
    const m = c.memory as unknown as SwarmCreepMemory;
    if (m.role === "harvester" && m.sourceId) {
      sourceCounts.set(m.sourceId, (sourceCounts.get(m.sourceId) ?? 0) + 1);
    }
  }

  // Find source with fewest harvesters
  let minCount = Infinity;
  let bestSource: Source | null = null;

  for (const source of sources) {
    const count = sourceCounts.get(source.id) ?? 0;
    if (count < minCount) {
      minCount = count;
      bestSource = source;
    }
  }

  return bestSource?.id ?? null;
}

/**
 * Task assignment - find best construction site
 */
export function findBestConstructionSite(room: Room): ConstructionSite | null {
  const sites = cachedFindConstructionSites(room);
  if (sites.length === 0) return null;

  // Priority: spawn > extension > tower > storage > other
  const priorities: Record<string, number> = {
    [STRUCTURE_SPAWN]: 100,
    [STRUCTURE_EXTENSION]: 90,
    [STRUCTURE_TOWER]: 80,
    [STRUCTURE_STORAGE]: 70,
    [STRUCTURE_TERMINAL]: 65,
    [STRUCTURE_CONTAINER]: 60,
    [STRUCTURE_ROAD]: 30
  };

  return (
    sites.sort((a, b) => {
      const pa = priorities[a.structureType] ?? 50;
      const pb = priorities[b.structureType] ?? 50;
      return pb - pa;
    })[0] ?? null
  );
}

/**
 * Task assignment - find best repair target
 */
export function findBestRepairTarget(room: Room): Structure | null {
  const structures = cachedRoomFind(room, FIND_STRUCTURES, {
    filter: (s: Structure) => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART,
    filterKey: 'damagedStructures'
  }) as Structure[];

  if (structures.length === 0) return null;

  // Sort by damage percentage (guard against zero hitsMax, though it should never happen)
  const sorted = structures.sort((a, b) => {
    const ratioA = a.hitsMax > 0 ? a.hits / a.hitsMax : 0;
    const ratioB = b.hitsMax > 0 ? b.hits / b.hitsMax : 0;
    return ratioA - ratioB;
  });
  
  return sorted[0] ?? null;
}
