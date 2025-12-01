/**
 * Economy Role Behaviors
 *
 * Behavior functions for all economy-focused creep roles.
 * Each function evaluates the creep's context and returns an action to execute.
 */

import type { SwarmAction, SwarmCreepContext } from "./context";
import type { SwarmCreepMemory } from "../../memory/schemas";

// =============================================================================
// LarvaWorker - Unified starter role
// Priority: harvest → deliver → build → upgrade
// =============================================================================

export function evaluateLarvaWorker(ctx: SwarmCreepContext): SwarmAction {
  // Update working state
  if (ctx.isEmpty) {
    ctx.memory.working = false;
  }
  if (ctx.isFull) {
    ctx.memory.working = true;
  }

  if (ctx.memory.working) {
    // Try to deliver first
    if (ctx.spawnStructures.length > 0) {
      const closest = ctx.creep.pos.findClosestByRange(ctx.spawnStructures);
      if (closest) {
        return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
      }
    }

    if (ctx.towers.length > 0) {
      const closest = ctx.creep.pos.findClosestByRange(ctx.towers);
      if (closest) {
        return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
      }
    }

    // Then build
    if (ctx.prioritizedSites.length > 0) {
      return { type: "build", target: ctx.prioritizedSites[0]! };
    }

    // Fallback to upgrade
    if (ctx.room.controller) {
      return { type: "upgrade", target: ctx.room.controller };
    }

    return { type: "idle" };
  } else {
    // Collect energy
    if (ctx.droppedResources.length > 0) {
      const closest = ctx.creep.pos.findClosestByRange(ctx.droppedResources);
      if (closest) {
        return { type: "pickup", target: closest };
      }
    }

    if (ctx.containers.length > 0) {
      const closest = ctx.creep.pos.findClosestByRange(ctx.containers);
      if (closest) {
        return { type: "withdraw", target: closest, resourceType: RESOURCE_ENERGY };
      }
    }

    if (ctx.storage && ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      return { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY };
    }

    const source = ctx.creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
    if (source) {
      return { type: "harvest", target: source };
    }

    return { type: "idle" };
  }
}

// =============================================================================
// Harvester - Stationary miner
// =============================================================================

export function evaluateHarvester(ctx: SwarmCreepContext): SwarmAction {
  // Find assigned source or closest source
  let source: Source | null = ctx.assignedSource ?? null;

  if (!source) {
    // Find and assign a source
    const sources = ctx.room.find(FIND_SOURCES);
    const sourceCounts = new Map<string, number>();
    for (const s of sources) {
      sourceCounts.set(s.id, 0);
    }

    for (const c of Object.values(Game.creeps)) {
      const m = c.memory as unknown as SwarmCreepMemory;
      if (m.role === "harvester" && m.sourceId) {
        sourceCounts.set(m.sourceId, (sourceCounts.get(m.sourceId) ?? 0) + 1);
      }
    }

    let minCount = Infinity;
    for (const s of sources) {
      const count = sourceCounts.get(s.id) ?? 0;
      if (count < minCount) {
        minCount = count;
        source = s;
      }
    }

    if (source) {
      ctx.memory.sourceId = source.id;
    }
  }

  if (!source) return { type: "idle" };

  // Check if near source
  if (ctx.creep.pos.isNearTo(source)) {
    // Harvest
    if (ctx.creep.store.getFreeCapacity() > 0) {
      return { type: "harvest", target: source };
    }

    // Full - try to transfer to nearby container or link
    const container = ctx.creep.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: s =>
        s.structureType === STRUCTURE_CONTAINER &&
        (s as StructureContainer).store.getFreeCapacity(RESOURCE_ENERGY) > 0
    })[0] as StructureContainer | undefined;

    if (container) {
      return { type: "transfer", target: container, resourceType: RESOURCE_ENERGY };
    }

    const link = ctx.creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
      filter: s =>
        s.structureType === STRUCTURE_LINK && (s as StructureLink).store.getFreeCapacity(RESOURCE_ENERGY) > 0
    })[0] as StructureLink | undefined;

    if (link) {
      return { type: "transfer", target: link, resourceType: RESOURCE_ENERGY };
    }

    // Drop on ground for haulers
    return { type: "drop", resourceType: RESOURCE_ENERGY };
  } else {
    return { type: "moveTo", target: source };
  }
}

// =============================================================================
// Hauler - Transport energy/resources
// =============================================================================

export function evaluateHauler(ctx: SwarmCreepContext): SwarmAction {
  // Update working state
  if (ctx.isEmpty) {
    ctx.memory.working = false;
  }
  if (ctx.isFull) {
    ctx.memory.working = true;
  }

  if (ctx.memory.working) {
    // Deliver energy
    if (ctx.spawnStructures.length > 0) {
      const closest = ctx.creep.pos.findClosestByRange(ctx.spawnStructures);
      if (closest) {
        return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
      }
    }

    if (ctx.towers.length > 0) {
      const closest = ctx.creep.pos.findClosestByRange(ctx.towers);
      if (closest) {
        return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
      }
    }

    if (ctx.storage) {
      return { type: "transfer", target: ctx.storage, resourceType: RESOURCE_ENERGY };
    }

    return { type: "idle" };
  } else {
    // Collect energy - priority order
    // 1. Dropped resources
    if (ctx.droppedResources.length > 0) {
      const closest = ctx.creep.pos.findClosestByRange(ctx.droppedResources);
      if (closest) {
        return { type: "pickup", target: closest };
      }
    }

    // 2. Tombstones
    const tombstone = ctx.creep.pos.findClosestByRange(FIND_TOMBSTONES, {
      filter: t => t.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    });
    if (tombstone) {
      return { type: "withdraw", target: tombstone, resourceType: RESOURCE_ENERGY };
    }

    // 3. Containers
    if (ctx.containers.length > 0) {
      const closest = ctx.creep.pos.findClosestByRange(ctx.containers);
      if (closest) {
        return { type: "withdraw", target: closest, resourceType: RESOURCE_ENERGY };
      }
    }

    return { type: "idle" };
  }
}

// =============================================================================
// Builder
// =============================================================================

export function evaluateBuilder(ctx: SwarmCreepContext): SwarmAction {
  // Update working state
  if (ctx.isEmpty) {
    ctx.memory.working = false;
  }
  if (ctx.isFull) {
    ctx.memory.working = true;
  }

  if (ctx.memory.working) {
    // Build construction sites
    if (ctx.prioritizedSites.length > 0) {
      return { type: "build", target: ctx.prioritizedSites[0]! };
    }

    // No sites - help upgrade
    if (ctx.room.controller) {
      return { type: "upgrade", target: ctx.room.controller };
    }

    return { type: "idle" };
  } else {
    // Collect energy
    if (ctx.droppedResources.length > 0) {
      const closest = ctx.creep.pos.findClosestByRange(ctx.droppedResources);
      if (closest) {
        return { type: "pickup", target: closest };
      }
    }

    if (ctx.containers.length > 0) {
      const closest = ctx.creep.pos.findClosestByRange(ctx.containers);
      if (closest) {
        return { type: "withdraw", target: closest, resourceType: RESOURCE_ENERGY };
      }
    }

    if (ctx.storage && ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      return { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY };
    }

    const source = ctx.creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
    if (source) {
      return { type: "harvest", target: source };
    }

    return { type: "idle" };
  }
}

// =============================================================================
// Upgrader
// =============================================================================

export function evaluateUpgrader(ctx: SwarmCreepContext): SwarmAction {
  // Update working state
  if (ctx.isEmpty) {
    ctx.memory.working = false;
  }
  if (ctx.isFull) {
    ctx.memory.working = true;
  }

  if (ctx.memory.working) {
    if (ctx.room.controller) {
      return { type: "upgrade", target: ctx.room.controller };
    }
    return { type: "idle" };
  } else {
    // Prefer storage/container over harvesting
    if (ctx.storage && ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 1000) {
      return { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY };
    }

    if (ctx.containers.length > 0) {
      const closest = ctx.creep.pos.findClosestByRange(ctx.containers);
      if (closest) {
        return { type: "withdraw", target: closest, resourceType: RESOURCE_ENERGY };
      }
    }

    const source = ctx.creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
    if (source) {
      return { type: "harvest", target: source };
    }

    return { type: "idle" };
  }
}

// =============================================================================
// QueenCarrier - Energy distributor
// =============================================================================

export function evaluateQueenCarrier(ctx: SwarmCreepContext): SwarmAction {
  // Update working state
  if (ctx.isEmpty) {
    ctx.memory.working = false;
  }
  if (ctx.isFull) {
    ctx.memory.working = true;
  }

  if (ctx.memory.working) {
    // Fill spawns and extensions first
    if (ctx.spawnStructures.length > 0) {
      const closest = ctx.creep.pos.findClosestByRange(ctx.spawnStructures);
      if (closest) {
        return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
      }
    }

    // Then towers
    if (ctx.towers.length > 0) {
      const closest = ctx.creep.pos.findClosestByRange(ctx.towers);
      if (closest) {
        return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
      }
    }

    // Wait near storage
    if (ctx.storage) {
      return { type: "moveTo", target: ctx.storage };
    }

    return { type: "idle" };
  } else {
    // Get energy from storage or terminal
    if (ctx.storage && ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      return { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY };
    }

    if (ctx.terminal && ctx.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      return { type: "withdraw", target: ctx.terminal, resourceType: RESOURCE_ENERGY };
    }

    return { type: "idle" };
  }
}

// =============================================================================
// MineralHarvester
// =============================================================================

export function evaluateMineralHarvester(ctx: SwarmCreepContext): SwarmAction {
  const mineral = ctx.room.find(FIND_MINERALS)[0];
  if (!mineral) return { type: "idle" };

  const extractor = mineral.pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType === STRUCTURE_EXTRACTOR);
  if (!extractor) return { type: "idle" };

  if (mineral.mineralAmount === 0) {
    // Wait near storage
    if (ctx.storage) {
      return { type: "moveTo", target: ctx.storage };
    }
    return { type: "idle" };
  }

  if (ctx.isFull) {
    // Deliver to storage or terminal
    const target = ctx.terminal ?? ctx.storage;
    if (target) {
      const mineralType = Object.keys(ctx.creep.store)[0] as ResourceConstant;
      return { type: "transfer", target, resourceType: mineralType };
    }
  } else {
    return { type: "harvestMineral", target: mineral };
  }

  return { type: "idle" };
}

// =============================================================================
// DepositHarvester
// =============================================================================

export function evaluateDepositHarvester(ctx: SwarmCreepContext): SwarmAction {
  // Check for target deposit
  if (!ctx.memory.targetId) {
    const deposits = ctx.room.find(FIND_DEPOSITS);
    if (deposits.length > 0) {
      const best = deposits.reduce((a, b) => (a.cooldown < b.cooldown ? a : b));
      ctx.memory.targetId = best.id as unknown as Id<_HasId>;
    }
  }

  if (ctx.memory.targetId) {
    const deposit = Game.getObjectById(ctx.memory.targetId as unknown as Id<Deposit>);
    if (!deposit || deposit.cooldown > 100) {
      delete ctx.memory.targetId;
      return { type: "idle" };
    }

    if (ctx.isFull) {
      // Return home
      const homeRoom = Game.rooms[ctx.homeRoom];
      if (homeRoom) {
        const target = homeRoom.terminal ?? homeRoom.storage;
        if (target) {
          const resourceType = Object.keys(ctx.creep.store)[0] as ResourceConstant;
          return { type: "transfer", target, resourceType };
        }
      }
      return { type: "moveToRoom", roomName: ctx.homeRoom };
    } else {
      return { type: "harvestDeposit", target: deposit };
    }
  }

  return { type: "idle" };
}

// =============================================================================
// LabTech
// =============================================================================

export function evaluateLabTech(ctx: SwarmCreepContext): SwarmAction {
  if (ctx.labs.length === 0) return { type: "idle" };

  const inputLabs = ctx.labs.slice(0, 2);
  const outputLabs = ctx.labs.slice(2);

  // If carrying resources, deliver them
  if (ctx.creep.store.getUsedCapacity() > 0) {
    const resourceType = Object.keys(ctx.creep.store)[0] as ResourceConstant;

    // If carrying a product (not base mineral), put in terminal/storage
    const baseMineral: ResourceConstant[] = [
      RESOURCE_HYDROGEN,
      RESOURCE_OXYGEN,
      RESOURCE_UTRIUM,
      RESOURCE_LEMERGIUM,
      RESOURCE_KEANIUM,
      RESOURCE_ZYNTHIUM,
      RESOURCE_CATALYST
    ];

    if (resourceType !== RESOURCE_ENERGY && !baseMineral.includes(resourceType as MineralConstant)) {
      const target = ctx.terminal ?? ctx.storage;
      if (target) {
        return { type: "transfer", target, resourceType };
      }
    }

    // Put base minerals in input labs
    for (const lab of inputLabs) {
      const capacity = lab.store.getFreeCapacity(resourceType);
      if (capacity !== null && capacity > 0) {
        return { type: "transfer", target: lab, resourceType };
      }
    }
  }

  // Collect products from output labs
  for (const lab of outputLabs) {
    const mineralType = lab.mineralType;
    if (mineralType && lab.store.getUsedCapacity(mineralType) > 100) {
      return { type: "withdraw", target: lab, resourceType: mineralType };
    }
  }

  // Fill input labs from terminal/storage
  const source = ctx.terminal ?? ctx.storage;
  if (source) {
    const minerals: MineralConstant[] = [
      RESOURCE_HYDROGEN,
      RESOURCE_OXYGEN,
      RESOURCE_UTRIUM,
      RESOURCE_LEMERGIUM,
      RESOURCE_KEANIUM,
      RESOURCE_ZYNTHIUM,
      RESOURCE_CATALYST
    ];

    for (const lab of inputLabs) {
      for (const mineral of minerals) {
        if (source.store.getUsedCapacity(mineral) > 0 && lab.store.getFreeCapacity(mineral) > 0) {
          return { type: "withdraw", target: source, resourceType: mineral };
        }
      }
    }
  }

  return { type: "idle" };
}

// =============================================================================
// FactoryWorker
// =============================================================================

export function evaluateFactoryWorker(ctx: SwarmCreepContext): SwarmAction {
  if (!ctx.factory) return { type: "idle" };

  // Update working state
  if (ctx.isEmpty) {
    ctx.memory.working = false;
  }
  if (ctx.isFull) {
    ctx.memory.working = true;
  }

  if (ctx.memory.working) {
    // Deliver to factory
    const resourceType = Object.keys(ctx.creep.store)[0] as ResourceConstant;
    return { type: "transfer", target: ctx.factory, resourceType };
  } else {
    const source = ctx.terminal ?? ctx.storage;
    if (!source) return { type: "idle" };

    // Priority: energy, then bars
    if (
      ctx.factory.store.getUsedCapacity(RESOURCE_ENERGY) < 5000 &&
      source.store.getUsedCapacity(RESOURCE_ENERGY) > 10000
    ) {
      return { type: "withdraw", target: source, resourceType: RESOURCE_ENERGY };
    }

    const bars: ResourceConstant[] = [
      RESOURCE_UTRIUM_BAR,
      RESOURCE_LEMERGIUM_BAR,
      RESOURCE_KEANIUM_BAR,
      RESOURCE_ZYNTHIUM_BAR,
      RESOURCE_OXIDANT,
      RESOURCE_REDUCTANT
    ];

    for (const bar of bars) {
      if (ctx.factory.store.getUsedCapacity(bar) < 500 && source.store.getUsedCapacity(bar) > 0) {
        return { type: "withdraw", target: source, resourceType: bar };
      }
    }
  }

  return { type: "idle" };
}

// =============================================================================
// Dispatcher
// =============================================================================

const economyEvaluators: Record<string, (ctx: SwarmCreepContext) => SwarmAction> = {
  larvaWorker: evaluateLarvaWorker,
  harvester: evaluateHarvester,
  hauler: evaluateHauler,
  builder: evaluateBuilder,
  upgrader: evaluateUpgrader,
  queenCarrier: evaluateQueenCarrier,
  mineralHarvester: evaluateMineralHarvester,
  depositHarvester: evaluateDepositHarvester,
  labTech: evaluateLabTech,
  factoryWorker: evaluateFactoryWorker
};

export function evaluateEconomyRole(ctx: SwarmCreepContext): SwarmAction {
  const evaluator = economyEvaluators[ctx.memory.role] ?? evaluateLarvaWorker;
  return evaluator(ctx);
}
