/**
 * Economy Behaviors
 *
 * Composable behavior functions for economy roles.
 * These are placeholder implementations that delegate to the full bot logic.
 * 
 * Future implementations will extract and simplify these behaviors to be
 * truly reusable and framework-independent.
 */

import type { CreepContext, BehaviorResult } from "../../framework/types";
import type { CreepAction } from "../types";
import type { CreepContext as BehaviorCreepContext } from "../types";

/**
 * Harvest behavior - Mining resources from sources.
 * 
 * A harvester sits at a source and harvests energy, transferring to nearby
 * containers or links when full.
 * 
 * @param ctx - The creep context
 * @returns Behavior result with action to execute
 */
export function harvestBehavior(ctx: CreepContext): BehaviorResult {
  // TODO: Implement standalone harvest behavior
  // Issue URL: https://github.com/ralphschuler/screeps/issues/971
  // For now, this is a placeholder that returns idle
  // Full implementation requires extracting logic from screeps-bot
  return {
    action: { type: "idle" },
    success: false,
    error: "harvestBehavior not yet implemented",
    context: "harvest"
  };
}

/**
 * Haul behavior - Transporting resources between locations.
 * 
 * A hauler picks up energy from containers/storage and delivers it to
 * spawns, extensions, towers, or other structures.
 * 
 * @param ctx - The creep context
 * @returns Behavior result with action to execute
 */
export function haulBehavior(ctx: CreepContext): BehaviorResult {
  // TODO: Implement standalone haul behavior
  // Issue URL: https://github.com/ralphschuler/screeps/issues/970
  // For now, this is a placeholder that returns idle
  // Full implementation requires extracting logic from screeps-bot
  return {
    action: { type: "idle" },
    success: false,
    error: "haulBehavior not yet implemented",
    context: "haul"
  };
}

/**
 * Build behavior - Constructing structures.
 * 
 * A builder finds construction sites and builds them, prioritizing
 * critical structures like spawns and extensions.
 * 
 * @param ctx - The creep context
 * @returns Behavior result with action to execute
 */
export function buildBehavior(ctx: CreepContext): BehaviorResult {
  // TODO: Implement standalone build behavior
  // Issue URL: https://github.com/ralphschuler/screeps/issues/969
  // For now, this is a placeholder that returns idle
  // Full implementation requires extracting logic from screeps-bot
  return {
    action: { type: "idle" },
    success: false,
    error: "buildBehavior not yet implemented",
    context: "build"
  };
}

/**
 * Upgrade behavior - Upgrading the room controller.
 * 
 * An upgrader transfers energy to the room controller to increase
 * the controller level and unlock new features.
 * 
 * Priority: deliver energy to spawns/extensions/towers first, then upgrade controller
 * 
 * @param ctx - The creep context
 * @returns Behavior result with action to execute
 */
export function upgradeBehavior(ctx: CreepContext): BehaviorResult {
  const creep = ctx.creep;
  const room = ctx.room;
  
  // Determine working state based on energy levels
  const isEmpty = creep.store.getUsedCapacity() === 0;
  const isFull = creep.store.getFreeCapacity() === 0;
  
  // Initialize working state if undefined
  if (ctx.memory.working === undefined) {
    ctx.memory.working = !isEmpty;
  }
  
  // Update working state based on energy levels
  if (isEmpty) {
    ctx.memory.working = false;
  } else if (isFull) {
    ctx.memory.working = true;
  }
  
  const isWorking = ctx.memory.working;
  
  if (isWorking) {
    // Before upgrading, check if critical structures need energy
    // Priority: Spawns → Extensions → Towers → Upgrade
    
    // 1. Check spawns first (highest priority)
    const spawns = ctx.spawnStructures.filter(
      (s): s is StructureSpawn => 
        s.structureType === STRUCTURE_SPAWN &&
        s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    );
    if (spawns.length > 0) {
      const closest = creep.pos.findClosestByPath(spawns);
      if (closest) {
        return {
          action: { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY },
          success: true,
          context: "upgrade"
        };
      }
    }

    // 2. Check extensions second
    const extensions = ctx.spawnStructures.filter(
      (s): s is StructureExtension => 
        s.structureType === STRUCTURE_EXTENSION &&
        s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    );
    if (extensions.length > 0) {
      const closest = creep.pos.findClosestByPath(extensions);
      if (closest) {
        return {
          action: { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY },
          success: true,
          context: "upgrade"
        };
      }
    }

    // 3. Check towers third
    const towersWithCapacity = ctx.towers.filter(
      t => t.store.getFreeCapacity(RESOURCE_ENERGY) >= 100
    );
    if (towersWithCapacity.length > 0) {
      const closest = creep.pos.findClosestByPath(towersWithCapacity);
      if (closest) {
        return {
          action: { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY },
          success: true,
          context: "upgrade"
        };
      }
    }

    // 4. All critical structures filled - now upgrade controller
    if (room.controller && room.controller.my) {
      return {
        action: { type: "upgrade", target: room.controller },
        success: true,
        context: "upgrade"
      };
    }
    
    return {
      action: { type: "idle" },
      success: false,
      error: "No controller available to upgrade",
      context: "upgrade"
    };
  }

  // Not working - need to collect energy
  // Priority: links near controller > containers near controller > storage > any container > harvest from source
  
  // Check for links near controller first
  const controller = room.controller;
  if (controller) {
    const nearbyLinks = controller.pos.findInRange(FIND_MY_STRUCTURES, 2, {
      filter: s => 
        s.structureType === STRUCTURE_LINK &&
        (s as StructureLink).store.getUsedCapacity(RESOURCE_ENERGY) > 50
    }) as StructureLink[];
    
    if (nearbyLinks.length > 0) {
      // Prefer link with most energy
      const bestLink = nearbyLinks.reduce((a, b) => 
        a.store.getUsedCapacity(RESOURCE_ENERGY) > b.store.getUsedCapacity(RESOURCE_ENERGY) ? a : b
      );
      return {
        action: { type: "withdraw", target: bestLink, resourceType: RESOURCE_ENERGY },
        success: true,
        context: "upgrade"
      };
    }
  }
  
  // Check for nearby containers
  const nearbyContainers = creep.pos.findInRange(FIND_STRUCTURES, 3, {
    filter: s => s.structureType === STRUCTURE_CONTAINER &&
                 (s as StructureContainer).store.getUsedCapacity(RESOURCE_ENERGY) > 50
  }) as StructureContainer[];
  
  if (nearbyContainers.length > 0) {
    const closest = creep.pos.findClosestByPath(nearbyContainers);
    if (closest) {
      return {
        action: { type: "withdraw", target: closest, resourceType: RESOURCE_ENERGY },
        success: true,
        context: "upgrade"
      };
    }
  }

  // Check storage
  if (ctx.storage && ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 1000) {
    return {
      action: { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY },
      success: true,
      context: "upgrade"
    };
  }

  // Check any container with energy
  const containersWithEnergy = ctx.containers.filter(
    c => c.store.getUsedCapacity(RESOURCE_ENERGY) > 100
  );
  if (containersWithEnergy.length > 0) {
    const closest = creep.pos.findClosestByPath(containersWithEnergy);
    if (closest) {
      return {
        action: { type: "withdraw", target: closest, resourceType: RESOURCE_ENERGY },
        success: true,
        context: "upgrade"
      };
    }
  }

  // Last resort: harvest from source
  const sources = room.find(FIND_SOURCES, {
    filter: source => source.energy > 0
  });
  if (sources.length > 0) {
    const closest = creep.pos.findClosestByPath(sources);
    if (closest) {
      return {
        action: { type: "harvest", target: closest },
        success: true,
        context: "upgrade"
      };
    }
  }

  return {
    action: { type: "idle" },
    success: false,
    error: "No energy sources available",
    context: "upgrade"
  };
}

/**
 * Evaluate and return an action for an economy role creep.
 * Routes to the appropriate behavior based on the creep's role.
 * 
 * NOTE: This is a placeholder implementation. Full implementations of
 * harvester, hauler, and builder behaviors are pending.
 * 
 * @param ctx - The creep context (must be BehaviorCreepContext with swarm-specific fields)
 * @returns The action for the creep to execute
 */
export function evaluateEconomyBehavior(ctx: BehaviorCreepContext): CreepAction {
  // For now, all economy roles return idle
  // Full implementations will be added in future updates
  return { type: "idle" };
}
