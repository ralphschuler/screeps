/**
 * Specialized Economy Behaviors
 * 
 * Queen carrier, lab tech, and factory worker roles.
 */

import type { CreepAction, CreepContext } from "../../types";
import { updateWorkingState } from "./common/stateManagement";
import { deliverEnergy } from "./common/energyManagement";

/**
 * QueenCarrier - Energy distributor for spawn structures.
 */
export function queenCarrier(ctx: CreepContext): CreepAction {
  const isWorking = updateWorkingState(ctx);

  if (isWorking) {
    // Fill spawns and extensions
    const deliverAction = deliverEnergy(ctx);
    if (deliverAction) return deliverAction;

    // Wait near storage
    if (ctx.storage) return { type: "moveTo", target: ctx.storage };

    return { type: "idle" };
  }

  // Get energy from storage or terminal
  if (ctx.storage && ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    return { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY };
  }

  if (ctx.terminal && ctx.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    return { type: "withdraw", target: ctx.terminal, resourceType: RESOURCE_ENERGY };
  }

  return { type: "idle" };
}

/**
 * LabTech - Manage lab reactions and compounds.
 */
export function labTech(ctx: CreepContext): CreepAction {
  if (ctx.labs.length === 0) return { type: "idle" };

  const inputLabs = ctx.labs.slice(0, 2);
  const outputLabs = ctx.labs.slice(2);

  // If carrying resources, deliver them
  if (ctx.creep.store.getUsedCapacity() > 0) {
    const resourceType = Object.keys(ctx.creep.store)[0] as ResourceConstant;

    // Base minerals go to input labs, compounds go to storage/terminal
    const baseMinerals: ResourceConstant[] = [
      RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM,
      RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST
    ];

    if (resourceType !== RESOURCE_ENERGY && !baseMinerals.includes(resourceType)) {
      const target = ctx.terminal ?? ctx.storage;
      if (target) return { type: "transfer", target, resourceType };
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
      RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM,
      RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST
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

/**
 * FactoryWorker - Supply factory with materials and remove outputs.
 * Enhanced to coordinate with factory manager for optimal production.
 */
export function factoryWorker(ctx: CreepContext): CreepAction {
  if (!ctx.factory) return { type: "idle" };

  const isWorking = updateWorkingState(ctx);

  if (isWorking) {
    const resourceType = Object.keys(ctx.creep.store)[0] as ResourceConstant;
    return { type: "transfer", target: ctx.factory, resourceType };
  }

  const source = ctx.terminal ?? ctx.storage;
  if (!source) return { type: "idle" };

  // Priority 1: Remove factory outputs to make space
  // Check for produced commodities that need removal
  const commodityTypes: ResourceConstant[] = [
    RESOURCE_UTRIUM_BAR, RESOURCE_LEMERGIUM_BAR, RESOURCE_KEANIUM_BAR,
    RESOURCE_ZYNTHIUM_BAR, RESOURCE_GHODIUM_MELT, RESOURCE_OXIDANT, 
    RESOURCE_REDUCTANT, RESOURCE_PURIFIER, RESOURCE_BATTERY
  ];
  
  for (const commodity of commodityTypes) {
    if (ctx.factory.store.getUsedCapacity(commodity) > 100) {
      return { type: "withdraw", target: ctx.factory, resourceType: commodity };
    }
  }

  // Priority 2: Supply energy
  if (
    ctx.factory.store.getUsedCapacity(RESOURCE_ENERGY) < 5000 &&
    source.store.getUsedCapacity(RESOURCE_ENERGY) > 10000
  ) {
    return { type: "withdraw", target: source, resourceType: RESOURCE_ENERGY };
  }

  // Priority 3: Supply base minerals for production
  const baseMinerals: ResourceConstant[] = [
    RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM,
    RESOURCE_ZYNTHIUM, RESOURCE_OXYGEN, RESOURCE_HYDROGEN, RESOURCE_CATALYST, RESOURCE_GHODIUM
  ];

  for (const mineral of baseMinerals) {
    if (
      ctx.factory.store.getUsedCapacity(mineral) < 1000 && 
      source.store.getUsedCapacity(mineral) > 500
    ) {
      return { type: "withdraw", target: source, resourceType: mineral };
    }
  }

  return { type: "idle" };
}
