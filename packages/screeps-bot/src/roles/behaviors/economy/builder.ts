/**
 * Builder Behavior
 * 
 * Construct and repair structures.
 * Priority: deliver energy to spawns/extensions/towers first, then build
 * 
 * OPTIMIZATION: Uses centralized target assignment for construction sites
 * to reduce per-creep search complexity from O(n) to O(1).
 */

import type { CreepAction, CreepContext } from "../types";
import { findCachedClosest } from "../../../cache";
import { updateWorkingState } from "./common/stateManagement";
import { findEnergy } from "./common/energyManagement";
import { getAssignedBuildTarget } from "../../../economy/targetAssignmentManager";

/**
 * Builder - Construct and repair structures.
 * Priority: deliver energy to spawns/extensions/towers first, then build
 * This ensures the room economy stays healthy while building
 */
export function builder(ctx: CreepContext): CreepAction {
  const isWorking = updateWorkingState(ctx);

  if (isWorking) {
    // Before building, check if critical structures need energy
    // Priority: Spawns → Extensions → Towers → Build → Upgrade
    // This ensures the room economy stays healthy while building
    
    // 1. Check spawns first (highest priority)
    const spawns = ctx.spawnStructures.filter(
      (s): s is StructureSpawn => 
        s.structureType === STRUCTURE_SPAWN &&
        s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    );
    if (spawns.length > 0) {
      const closest = findCachedClosest(ctx.creep, spawns, "builder_spawn", 5);
      if (closest) return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
    }

    // 2. Check extensions second
    const extensions = ctx.spawnStructures.filter(
      (s): s is StructureExtension => 
        s.structureType === STRUCTURE_EXTENSION &&
        s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    );
    if (extensions.length > 0) {
      const closest = findCachedClosest(ctx.creep, extensions, "builder_ext", 5);
      if (closest) return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
    }

    // 3. Check towers third
    const towersWithCapacity = ctx.towers.filter(
      t => t.store.getFreeCapacity(RESOURCE_ENERGY) >= 100
    );
    if (towersWithCapacity.length > 0) {
      const closest = findCachedClosest(ctx.creep, towersWithCapacity, "builder_tower", 10);
      if (closest) return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
    }

    // 4. All critical structures filled - now build construction sites
    // OPTIMIZATION: Use centralized assignment manager (O(1) lookup)
    // instead of per-creep construction site search
    let assignedSite = getAssignedBuildTarget(ctx.creep);
    
    // Use assigned site if available, otherwise fall back to prioritized sites
    if (assignedSite) {
      return { type: "build", target: assignedSite };
    }
    
    if (ctx.prioritizedSites.length > 0) {
      return { type: "build", target: ctx.prioritizedSites[0]! };
    }

    // No sites - help upgrade
    if (ctx.room.controller) {
      return { type: "upgrade", target: ctx.room.controller };
    }

    return { type: "idle" };
  }

  return findEnergy(ctx);
}
