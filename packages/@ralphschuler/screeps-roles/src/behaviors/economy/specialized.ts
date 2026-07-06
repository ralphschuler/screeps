/**
 * Specialized Economy Behaviors
 * 
 * Queen carrier, lab tech, and factory worker roles.
 */

import type { CreepAction, CreepContext } from "../types";
import { labSupply } from "../labSupply";
import { updateWorkingState } from "./common/stateManagement";
import { deliverEnergy, reserveCriticalEnergyDeliveryBeforeCollection } from "./common/energyManagement";

/**
 * QueenCarrier - Energy distributor for spawn structures.
 */
export function queenCarrier(ctx: CreepContext): CreepAction {
  const isWorking = updateWorkingState(ctx);

  if (isWorking) {
    const storageLink = findStorageLinkForSpawnHandoff(ctx.room, ctx.storage);
    if (storageLink) {
      return { type: "transfer", target: storageLink, resourceType: RESOURCE_ENERGY };
    }

    // Fill spawns and extensions
    const deliverAction = deliverEnergy(ctx);
    if (deliverAction) return deliverAction;

    // Wait near storage
    if (ctx.storage) return { type: "moveTo", target: ctx.storage };

    return { type: "idle" };
  }

  // Get energy from the spawn link first while the spawn/extension network needs refill.
  // LinkManager pushes storage-link energy here; queenCarrier turns it into local spawn delivery.
  const spawnLink = findSpawnLinkWithEnergy(ctx.room);
  if (spawnLink) {
    return reserveCriticalEnergyDeliveryBeforeCollection(ctx, { type: "withdraw", target: spawnLink, resourceType: RESOURCE_ENERGY });
  }

  // Get energy from storage or terminal
  if (ctx.storage && ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    return reserveCriticalEnergyDeliveryBeforeCollection(ctx, { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY });
  }

  if (ctx.terminal && ctx.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    return reserveCriticalEnergyDeliveryBeforeCollection(ctx, { type: "withdraw", target: ctx.terminal, resourceType: RESOURCE_ENERGY });
  }

  return { type: "idle" };
}

function findSpawnLinkWithEnergy(room: Room): StructureLink | undefined {
  if (room.energyAvailable >= room.energyCapacityAvailable) return undefined;

  const spawns = room.find(FIND_MY_SPAWNS);
  if (spawns.length === 0) return undefined;

  return (room.find(FIND_MY_STRUCTURES, {
    filter: structure =>
      structure.structureType === STRUCTURE_LINK &&
      (structure as StructureLink).store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
      spawns.some(spawn => structure.pos.getRangeTo(spawn) <= 2)
  }) as StructureLink[])[0];
}

function findStorageLinkForSpawnHandoff(room: Room, storage: StructureStorage | undefined): StructureLink | undefined {
  if (!storage || room.energyAvailable >= room.energyCapacityAvailable) return undefined;

  const spawns = room.find(FIND_MY_SPAWNS);
  if (spawns.length === 0) return undefined;

  const links = room.find(FIND_MY_STRUCTURES, {
    filter: structure => structure.structureType === STRUCTURE_LINK
  }) as StructureLink[];

  const hasSpawnReceiver = links.some(link =>
    link.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
    spawns.some(spawn => link.pos.getRangeTo(spawn) <= 2)
  );
  if (!hasSpawnReceiver) return undefined;

  return links.find(link =>
    link.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
    link.pos.getRangeTo(storage) <= 2
  );
}

/**
 * LabTech - Manage lab reactions and compounds through configured lab needs.
 */
export function labTech(ctx: CreepContext): CreepAction {
  if (ctx.labs.length === 0) return { type: "idle" };
  return labSupply(ctx);
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
