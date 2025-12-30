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
 * Priority for delivery: Spawns → Extensions → Towers → Storage → Containers
 * Priority for collection: Dropped Resources → Tombstones → Containers → Storage
 * 
 * @param ctx - The creep context
 * @returns Behavior result with action to execute
 */
export function haulBehavior(ctx: CreepContext): BehaviorResult {
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
    // Check what resource we're carrying
    const carriedResources = Object.keys(creep.store) as ResourceConstant[];
    const resourceType = carriedResources[0];
    const energyCarried = creep.store.getUsedCapacity(RESOURCE_ENERGY);
    
    // If carrying minerals (not energy), deliver to terminal or storage
    if (energyCarried === 0 && resourceType && resourceType !== RESOURCE_ENERGY) {
      const target = ctx.terminal ?? ctx.storage;
      if (target) {
        return {
          action: { type: "transfer", target, resourceType },
          success: true,
          context: "haul"
        };
      }
    }
    
    // Deliver energy with priority: spawn > extensions > towers > storage > containers
    
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
          context: "haul"
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
          context: "haul"
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
          context: "haul"
        };
      }
    }

    // 4. Storage fourth
    if (ctx.storage && ctx.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      return {
        action: { type: "transfer", target: ctx.storage, resourceType: RESOURCE_ENERGY },
        success: true,
        context: "haul"
      };
    }

    // 5. Containers last
    const depositContainersWithCapacity = ctx.depositContainers.filter(
      c => c.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    );
    if (depositContainersWithCapacity.length > 0) {
      const closest = creep.pos.findClosestByPath(depositContainersWithCapacity);
      if (closest) {
        return {
          action: { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY },
          success: true,
          context: "haul"
        };
      }
    }

    // No valid delivery targets found, but creep still has energy
    // Switch to collection mode to top off capacity instead of idling
    if (!isEmpty) {
      ctx.memory.working = false;
      // Fall through to collection logic below
    } else {
      return {
        action: { type: "idle" },
        success: false,
        error: "No delivery targets available",
        context: "haul"
      };
    }
  }

  // Not working - need to collect resources
  // Priority: dropped resources > tombstones > containers > storage
  
  // 1. Check for dropped resources first
  if (ctx.droppedResources.length > 0) {
    const closest = creep.pos.findClosestByPath(ctx.droppedResources);
    if (closest) {
      return {
        action: { type: "pickup", target: closest },
        success: true,
        context: "haul"
      };
    }
  }
  
  // 2. Check tombstones - collect all resources, not just energy
  const tombstonesWithResources = ctx.tombstones.filter(
    t => t.store.getUsedCapacity() > 0
  );
  if (tombstonesWithResources.length > 0) {
    const tombstone = creep.pos.findClosestByPath(tombstonesWithResources);
    if (tombstone) {
      // Prioritize energy first, then other resources
      if (tombstone.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        return {
          action: { type: "withdraw", target: tombstone, resourceType: RESOURCE_ENERGY },
          success: true,
          context: "haul"
        };
      }
      // If no energy, pick up any other resource type
      const resourceTypes = Object.keys(tombstone.store) as ResourceConstant[];
      const otherResource = resourceTypes.find(r => r !== RESOURCE_ENERGY && tombstone.store.getUsedCapacity(r) > 0);
      if (otherResource) {
        return {
          action: { type: "withdraw", target: tombstone, resourceType: otherResource },
          success: true,
          context: "haul"
        };
      }
    }
  }
  
  // 3. Check for containers with energy
  const containersWithEnergy = ctx.containers.filter(
    c => c.store.getUsedCapacity(RESOURCE_ENERGY) > 100
  );
  if (containersWithEnergy.length > 0) {
    const closest = creep.pos.findClosestByPath(containersWithEnergy);
    if (closest) {
      return {
        action: { type: "withdraw", target: closest, resourceType: RESOURCE_ENERGY },
        success: true,
        context: "haul"
      };
    }
  }

  // 4. Check for containers with minerals
  if (ctx.mineralContainers.length > 0) {
    const closest = creep.pos.findClosestByPath(ctx.mineralContainers);
    if (closest) {
      // Find first mineral type in container
      const mineralType = Object.keys(closest.store).find(
        r => r !== RESOURCE_ENERGY && closest.store.getUsedCapacity(r as ResourceConstant) > 0
      ) as ResourceConstant | undefined;
      
      if (mineralType) {
        return {
          action: { type: "withdraw", target: closest, resourceType: mineralType },
          success: true,
          context: "haul"
        };
      }
    }
  }

  // 5. Check storage last
  if (ctx.storage && ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    return {
      action: { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY },
      success: true,
      context: "haul"
    };
  }

  return {
    action: { type: "idle" },
    success: false,
    error: "No energy sources available",
    context: "haul"
  };
}

/**
 * Build behavior - Constructing structures.
 * 
 * A builder finds construction sites and builds them, prioritizing
 * critical structures like spawns and extensions.
 * 
 * Priority: deliver energy to spawns/extensions/towers first, then build
 * This ensures the room economy stays healthy while building
 * 
 * @param ctx - The creep context
 * @returns Behavior result with action to execute
 */
export function buildBehavior(ctx: CreepContext): BehaviorResult {
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
    // Before building, check if critical structures need energy
    // Priority: Spawns → Extensions → Towers → Build → Upgrade
    
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
          context: "build"
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
          context: "build"
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
          context: "build"
        };
      }
    }

    // 4. All critical structures filled - now build construction sites
    if (ctx.prioritizedSites.length > 0) {
      const site = ctx.prioritizedSites[0];
      if (site) {
        return {
          action: { type: "build", target: site },
          success: true,
          context: "build"
        };
      }
    }

    // 5. No construction sites - help upgrade controller
    if (room.controller && room.controller.my) {
      return {
        action: { type: "upgrade", target: room.controller },
        success: true,
        context: "build"
      };
    }
    
    return {
      action: { type: "idle" },
      success: false,
      error: "No construction sites or controller available",
      context: "build"
    };
  }

  // Not working - need to collect energy
  // Priority: dropped resources > containers > storage > harvest from source
  
  // 1. Check for dropped resources first
  if (ctx.droppedResources.length > 0) {
    const closest = creep.pos.findClosestByPath(ctx.droppedResources);
    if (closest) {
      return {
        action: { type: "pickup", target: closest },
        success: true,
        context: "build"
      };
    }
  }
  
  // 2. Check for containers with energy
  const containersWithEnergy = ctx.containers.filter(
    c => c.store.getUsedCapacity(RESOURCE_ENERGY) > 100
  );
  if (containersWithEnergy.length > 0) {
    const closest = creep.pos.findClosestByPath(containersWithEnergy);
    if (closest) {
      return {
        action: { type: "withdraw", target: closest, resourceType: RESOURCE_ENERGY },
        success: true,
        context: "build"
      };
    }
  }

  // 3. Check storage
  if (ctx.storage && ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    return {
      action: { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY },
      success: true,
      context: "build"
    };
  }

  // 4. Last resort: harvest from source
  const sources = room.find(FIND_SOURCES, {
    filter: source => source.energy > 0
  });
  if (sources.length > 0) {
    const closest = creep.pos.findClosestByPath(sources);
    if (closest) {
      return {
        action: { type: "harvest", target: closest },
        success: true,
        context: "build"
      };
    }
  }

  return {
    action: { type: "idle" },
    success: false,
    error: "No energy sources available",
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
