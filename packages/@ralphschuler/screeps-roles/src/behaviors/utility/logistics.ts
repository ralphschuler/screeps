import type { CreepAction, CreepContext } from "../types";

const TARGET_TERMINAL_ENERGY = 50000;
const TERMINAL_ENERGY_BUFFER = 10000;
const STORAGE_ENERGY_RESERVE = 20000;
const STORAGE_MINERAL_TRANSFER_THRESHOLD = 5000;

/**
 * LinkManager - shuttle overflow from the storage-adjacent link into storage.
 *
 * Link routing itself is structure logic; this creep only keeps the receiver
 * link clear so source/controller links can keep sending energy.
 */
export function linkManager(ctx: CreepContext): CreepAction {
  const links = ctx.room.find(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_LINK
  }) as StructureLink[];

  if (links.length < 2 || !ctx.storage) return { type: "idle" };

  const storageLink = links.find(link => link.pos.getRangeTo(ctx.storage!) <= 2);
  if (!storageLink) return { type: "idle" };

  if (storageLink.store.getUsedCapacity(RESOURCE_ENERGY) > 400) {
    if (ctx.creep.store.getFreeCapacity() > 0) {
      return { type: "withdraw", target: storageLink, resourceType: RESOURCE_ENERGY };
    }
    return { type: "transfer", target: ctx.storage, resourceType: RESOURCE_ENERGY };
  }

  if (ctx.creep.pos.getRangeTo(ctx.storage) > 2) {
    return { type: "moveTo", target: ctx.storage };
  }

  return { type: "idle" };
}

/**
 * TerminalManager - maintain an energy buffer and stage excess minerals for trade.
 */
export function terminalManager(ctx: CreepContext): CreepAction {
  if (!ctx.terminal || !ctx.storage) return { type: "idle" };

  const terminalEnergy = ctx.terminal.store.getUsedCapacity(RESOURCE_ENERGY);
  const storageEnergy = ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY);

  if (ctx.creep.store.getUsedCapacity() > 0) {
    const resourceType = Object.keys(ctx.creep.store)[0] as ResourceConstant;

    if (resourceType === RESOURCE_ENERGY) {
      if (terminalEnergy < TARGET_TERMINAL_ENERGY) {
        return { type: "transfer", target: ctx.terminal, resourceType: RESOURCE_ENERGY };
      }
      return { type: "transfer", target: ctx.storage, resourceType: RESOURCE_ENERGY };
    }

    return { type: "transfer", target: ctx.terminal, resourceType };
  }

  if (terminalEnergy < TARGET_TERMINAL_ENERGY - TERMINAL_ENERGY_BUFFER && storageEnergy > STORAGE_ENERGY_RESERVE) {
    return { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY };
  }
  if (terminalEnergy > TARGET_TERMINAL_ENERGY + TERMINAL_ENERGY_BUFFER) {
    return { type: "withdraw", target: ctx.terminal, resourceType: RESOURCE_ENERGY };
  }

  for (const resourceType of Object.keys(ctx.storage.store) as ResourceConstant[]) {
    if (
      resourceType !== RESOURCE_ENERGY &&
      ctx.storage.store.getUsedCapacity(resourceType) > STORAGE_MINERAL_TRANSFER_THRESHOLD
    ) {
      return { type: "withdraw", target: ctx.storage, resourceType };
    }
  }

  if (ctx.creep.pos.getRangeTo(ctx.storage) > 2) {
    return { type: "moveTo", target: ctx.storage };
  }

  return { type: "idle" };
}
