/**
 * Target Assignment Manager - Stub for roles package
 * 
 * This is a simplified stub that provides the interface needed by behaviors.
 * The full implementation should come from @ralphschuler/screeps-economy package.
 *
 * For now, provides simple fallback implementations.
 */

import type { BaseCreepMemory } from "../framework/types";
import { getConstructionPriority } from "./constructionPriority";

type MutableCreepMemory<T extends BaseCreepMemory> = CreepMemory &
  BaseCreepMemory &
  { room?: string } &
  Partial<T>;

interface BuildSiteCache {
  tick: number;
  sites: ConstructionSite[];
  highestPriority: number;
}

const buildSiteCacheByRoom = new Map<string, BuildSiteCache>();

function getBuildSiteCache(room: Room): BuildSiteCache {
  const existing = buildSiteCacheByRoom.get(room.name);
  if (existing && existing.tick === Game.time) return existing;

  const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
  const highestPriority = sites.reduce(
    (highest, site) => Math.max(highest, getConstructionPriority(site)),
    Number.NEGATIVE_INFINITY
  );
  const cache = { tick: Game.time, sites, highestPriority };
  buildSiteCacheByRoom.set(room.name, cache);
  return cache;
}

function isLocalBuildSite(site: ConstructionSite, room: Room): boolean {
  return site.pos.roomName === room.name;
}

function selectClosestHighestPrioritySite(creep: Creep, cache: BuildSiteCache): ConstructionSite | null {
  const candidates = cache.sites.filter((site) => getConstructionPriority(site) === cache.highestPriority);
  return creep.pos.findClosestByRange(candidates) ?? candidates[0] ?? null;
}

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
 * Get assigned build target for a builder.
 *
 * Existing lower-priority assignments are replaced when recovery-critical
 * construction sites appear, so builders do not spend throughput on extension,
 * wall, or road backlogs while tower/storage/spawn sites remain unbuilt.
 */
export function getAssignedBuildTarget(creep: Creep): ConstructionSite | null {
  if (!creep.room) return null;
  
  const memory = getMutableCreepMemory<BaseCreepMemory & { targetId?: Id<ConstructionSite> }>(creep);
  const siteCache = getBuildSiteCache(creep.room);
  if (siteCache.sites.length === 0) {
    delete memory.targetId;
    return null;
  }

  if (memory.targetId) {
    const site = Game.getObjectById(memory.targetId);
    if (site && isLocalBuildSite(site, creep.room) && getConstructionPriority(site) >= siteCache.highestPriority) {
      return site;
    }
    delete memory.targetId;
  }
  
  const assignedSite = selectClosestHighestPrioritySite(creep, siteCache);
  if (assignedSite) {
    memory.targetId = assignedSite.id;
  }
  return assignedSite;
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
