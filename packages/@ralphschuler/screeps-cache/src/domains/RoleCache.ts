/**
 * Role Cache - Domain wrapper for unified cache
 *
 * Provides caching for role-specific data.
 */

import { globalCache } from "../CacheManager";
import { cachedRoomFind } from "./RoomFindCache";

const NAMESPACE = "role";

const DEFAULT_TTL: Record<string, number> = {
  assignedSource: 100,
  assignedController: 100,
  assignedMineral: 100,
  assignedRoom: 50,
  sourceContainer: 50,
  controllerContainer: 50,
  controllerLink: 50,
  repairTarget: 10,
  buildTarget: 10,
  pickupTarget: 5,
  deliveryTarget: 5,
  combatTarget: 3,
  harvestPath: 50,
  deliveryRoute: 20,
  default: 10
};

function getCacheKey(creepName: string, roleType: string, dataKey: string): string {
  return `${roleType}:${creepName}:${dataKey}`;
}

export function getRoleCache<T = any>(
  creep: Creep,
  roleType: string,
  dataKey: string
): T | undefined {
  const key = getCacheKey(creep.name, roleType, dataKey);
  return globalCache.get<T>(key, { namespace: NAMESPACE });
}

export function setRoleCache<T = any>(
  creep: Creep,
  roleType: string,
  dataKey: string,
  value: T,
  ttl?: number
): void {
  const key = getCacheKey(creep.name, roleType, dataKey);
  const finalTtl = ttl ?? DEFAULT_TTL[dataKey] ?? DEFAULT_TTL.default;
  
  globalCache.set(key, value, {
    namespace: NAMESPACE,
    ttl: finalTtl
  });
}

export function deleteRoleCache(
  creep: Creep,
  roleType: string,
  dataKey?: string
): void {
  if (dataKey) {
    const key = getCacheKey(creep.name, roleType, dataKey);
    globalCache.invalidate(key, NAMESPACE);
  } else {
    const pattern = new RegExp(`^${roleType}:${creep.name}:`);
    globalCache.invalidatePattern(pattern, NAMESPACE);
  }
}

export function hasRoleCache(
  creep: Creep,
  roleType: string,
  dataKey: string
): boolean {
  return getRoleCache(creep, roleType, dataKey) !== undefined;
}

export function clearRoleTypeCache(roleType: string): void {
  const pattern = new RegExp(`^${roleType}:`);
  globalCache.invalidatePattern(pattern, NAMESPACE);
}

export function clearAllRoleCache(): void {
  globalCache.clear(NAMESPACE);
}

export function getRoleCacheStats() {
  const stats = globalCache.getCacheStats(NAMESPACE);
  return {
    roles: 0, // Not tracked separately
    creeps: 0, // Not tracked separately
    totalEntries: stats.size,
    entriesByRole: {} as Record<string, number>
  };
}

// Helper functions
export function getCachedRepairTarget(
  creep: Creep,
  computeFn: () => Structure | null
): Structure | null {
  const cachedId = getRoleCache<Id<Structure>>(creep, "builder", "repairTarget");
  
  if (cachedId) {
    const structure = Game.getObjectById(cachedId);
    if (structure && structure.hits < structure.hitsMax) {
      return structure;
    }
  }
  
  const target = computeFn();
  if (target) {
    setRoleCache(creep, "builder", "repairTarget", target.id);
  }
  
  return target;
}

export function getCachedBuildTarget(
  creep: Creep,
  computeFn: () => ConstructionSite | null
): ConstructionSite | null {
  const cachedId = getRoleCache<Id<ConstructionSite>>(creep, "builder", "buildTarget");
  
  if (cachedId) {
    const site = Game.getObjectById(cachedId);
    if (site) {
      return site;
    }
  }
  
  const target = computeFn();
  if (target) {
    setRoleCache(creep, "builder", "buildTarget", target.id);
  }
  
  return target;
}

export function getAssignedSource(
  creep: Creep,
  sourceId?: Id<Source>
): Source | null {
  let cachedId = getRoleCache<Id<Source>>(creep, "miner", "assignedSource");
  
  if (!cachedId && sourceId) {
    setRoleCache(creep, "miner", "assignedSource", sourceId, 200);
    cachedId = sourceId;
  }
  
  if (cachedId) {
    return Game.getObjectById(cachedId);
  }
  
  return null;
}

export function getSourceContainer(
  creep: Creep,
  source: Source
): StructureContainer | null {
  const cacheKey = `sourceContainer:${source.id}`;
  const cachedId = getRoleCache<Id<StructureContainer>>(creep, "miner", cacheKey);
  
  if (cachedId) {
    const container = Game.getObjectById(cachedId);
    if (container) {
      return container;
    }
  }
  
  const room = source.room;
  if (!room) return null;
  
  const allContainers = cachedRoomFind<StructureContainer>(room, FIND_STRUCTURES, {
    filter: (s: Structure): s is StructureContainer => s.structureType === STRUCTURE_CONTAINER,
    filterKey: STRUCTURE_CONTAINER
  });
  
  const nearbyContainers = allContainers.filter(c => source.pos.getRangeTo(c) <= 1);
  
  if (nearbyContainers.length > 0) {
    const container = nearbyContainers[0];
    setRoleCache(creep, "miner", cacheKey, container.id, 100);
    return container;
  }
  
  return null;
}

export function getControllerEnergySource(
  creep: Creep,
  controller: StructureController
): StructureContainer | StructureLink | null {
  const cacheKey = `controllerSource:${controller.id}`;
  const cachedId = getRoleCache<Id<StructureContainer | StructureLink>>(
    creep,
    "upgrader",
    cacheKey
  );
  
  if (cachedId) {
    const structure = Game.getObjectById(cachedId);
    if (structure) {
      return structure;
    }
  }
  
  const room = controller.room;
  if (!room) return null;
  
  const allLinks = cachedRoomFind<StructureLink>(room, FIND_STRUCTURES, {
    filter: (s: Structure): s is StructureLink => s.structureType === STRUCTURE_LINK,
    filterKey: STRUCTURE_LINK
  });
  
  const nearbyLinks = allLinks.filter(
    link => controller.pos.getRangeTo(link) <= 3 && 
            link.store.getUsedCapacity(RESOURCE_ENERGY) > 0
  );
  
  if (nearbyLinks.length > 0) {
    const link = nearbyLinks[0];
    setRoleCache(creep, "upgrader", cacheKey, link.id, 100);
    return link;
  }
  
  const allContainers = cachedRoomFind<StructureContainer>(room, FIND_STRUCTURES, {
    filter: (s: Structure): s is StructureContainer => s.structureType === STRUCTURE_CONTAINER,
    filterKey: STRUCTURE_CONTAINER
  });
  
  const nearbyContainers = allContainers.filter(
    container => controller.pos.getRangeTo(container) <= 3 &&
                 container.store.getUsedCapacity(RESOURCE_ENERGY) > 0
  );
  
  if (nearbyContainers.length > 0) {
    const container = nearbyContainers[0];
    setRoleCache(creep, "upgrader", cacheKey, container.id, 100);
    return container;
  }
  
  return null;
}

export function clearTargetCaches(
  creep: Creep,
  roleType: string,
  targetTypes: string[]
): void {
  for (const targetType of targetTypes) {
    deleteRoleCache(creep, roleType, targetType);
  }
}
