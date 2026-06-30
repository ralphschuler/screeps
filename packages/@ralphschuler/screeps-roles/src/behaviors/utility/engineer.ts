import { findCachedClosest } from "../../cache";
import type { CreepAction, CreepContext } from "../types";

/**
 * Engineer - repairs and fortification specialist.
 *
 * Priority while working:
 * 1. Critical low-HP spawns, towers, and storage.
 * 2. Roads and containers that keep the room economy moving.
 * 3. Ramparts and walls, scaled by room danger.
 * 4. Construction sites once repair pressure is handled.
 */
export function engineer(ctx: CreepContext): CreepAction {
  // Update working state
  if (ctx.isEmpty) ctx.memory.working = false;
  if (ctx.isFull) ctx.memory.working = true;

  if (ctx.memory.working) {
    // Critical structures (low HP spawns, towers, storage)
    // OPTIMIZATION: Use cached repair targets from context if available, otherwise filter from allStructures
    // Note: repairTargets in context are already filtered, but we need specific types here
    const criticalStructures = ctx.repairTargets.filter(
      s =>
        (s.structureType === STRUCTURE_SPAWN ||
          s.structureType === STRUCTURE_TOWER ||
          s.structureType === STRUCTURE_STORAGE) &&
        s.hits < s.hitsMax * 0.5
    );
    if (criticalStructures.length > 0) {
      const critical = findCachedClosest(ctx.creep, criticalStructures, "engineer_critical", 5);
      if (critical) return { type: "repair", target: critical };
    }

    // Roads and containers
    const infrastructure = ctx.repairTargets.filter(
      s =>
        (s.structureType === STRUCTURE_ROAD || s.structureType === STRUCTURE_CONTAINER) &&
        s.hits < s.hitsMax * 0.75
    );
    if (infrastructure.length > 0) {
      const infra = findCachedClosest(ctx.creep, infrastructure, "engineer_infra", 5);
      if (infra) return { type: "repair", target: infra };
    }

    // Ramparts and walls - target based on danger level
    // danger 0: 100k, danger 1: 300k, danger 2: 5M, danger 3: 50M
    const danger = ctx.swarmState?.danger ?? 0;
    const repairTarget = danger === 0 ? 100000 : danger === 1 ? 300000 : danger === 2 ? 5000000 : 50000000;

    const ramparts = ctx.repairTargets.filter(
      s => s.structureType === STRUCTURE_RAMPART && s.hits < repairTarget
    );
    if (ramparts.length > 0) {
      const rampart = findCachedClosest(ctx.creep, ramparts, "engineer_rampart", 5);
      if (rampart) return { type: "repair", target: rampart };
    }

    // Walls
    const walls = ctx.repairTargets.filter(
      s => s.structureType === STRUCTURE_WALL && s.hits < repairTarget
    );
    if (walls.length > 0) {
      const wall = findCachedClosest(ctx.creep, walls, "engineer_wall", 5);
      if (wall) return { type: "repair", target: wall };
    }

    // Construction sites
    if (ctx.prioritizedSites.length > 0) {
      return { type: "build", target: ctx.prioritizedSites[0]! };
    }

    return { type: "idle" };
  }

  // Get energy
  if (ctx.storage && ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    return { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY };
  }

  // Use cached closest for stable container targets, but filter capacity from
  // live store state each tick so stale room cache entries do not pick empty containers.
  const containersWithEnergy = ctx.containers.filter(
    c => c.store.getUsedCapacity(RESOURCE_ENERGY) > 100
  );
  if (containersWithEnergy.length > 0) {
    const closest = findCachedClosest(ctx.creep, containersWithEnergy, "engineer_cont", 15);
    if (closest) return { type: "withdraw", target: closest, resourceType: RESOURCE_ENERGY };
  }

  return { type: "idle" };
}
