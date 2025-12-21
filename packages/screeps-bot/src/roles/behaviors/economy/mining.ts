/**
 * Mining Behaviors
 * 
 * Mineral harvesting and deposit harvesting behaviors.
 */

import type { CreepAction, CreepContext } from "../types";
import { cachedRoomFind } from "../../../utils/caching";

/**
 * Type guard to check if an object is a Deposit.
 * Deposits have depositType and cooldown properties, but no structureType.
 */
function isDeposit(obj: unknown): obj is Deposit {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "depositType" in obj &&
    "cooldown" in obj &&
    !("structureType" in obj)
  );
}

/**
 * MineralHarvester - Harvest minerals from extractors.
 * Enhanced to use containers like energy harvesters for better coordination.
 */
export function mineralHarvester(ctx: CreepContext): CreepAction {
  const minerals = cachedRoomFind(ctx.room, FIND_MINERALS) as Mineral[];
  const mineral = minerals[0];
  if (!mineral) return { type: "idle" };

  const structures = mineral.pos.lookFor(LOOK_STRUCTURES);
  const extractor = structures.find(s => s.structureType === STRUCTURE_EXTRACTOR);
  if (!extractor) return { type: "idle" };

  if (mineral.mineralAmount === 0) {
    // Mineral depleted - wait near storage
    if (ctx.storage) return { type: "moveTo", target: ctx.storage };
    return { type: "idle" };
  }

  // Full - find nearby container or terminal/storage
  if (ctx.isFull) {
    const mineralType = Object.keys(ctx.creep.store)[0] as ResourceConstant;
    
    // Check for nearby container first (like energy harvesters)
    const container = ctx.creep.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: s =>
        s.structureType === STRUCTURE_CONTAINER &&
        s.store.getFreeCapacity(mineralType) > 0
    })[0] as StructureContainer | undefined;
    
    if (container) return { type: "transfer", target: container, resourceType: mineralType };
    
    // Fall back to terminal/storage
    const target = ctx.terminal ?? ctx.storage;
    if (target) {
      return { type: "transfer", target, resourceType: mineralType };
    }
  }

  return { type: "harvestMineral", target: mineral };
}

/**
 * DepositHarvester - Harvest from highway deposits.
 */
export function depositHarvester(ctx: CreepContext): CreepAction {
  // Find or assign target deposit
  if (!ctx.memory.targetId) {
    const deposits = cachedRoomFind(ctx.room, FIND_DEPOSITS) as Deposit[];
    if (deposits.length > 0) {
      const best = deposits.reduce((a, b) => (a.cooldown < b.cooldown ? a : b));
      // Store the deposit ID. This is safe because Screeps object IDs are always strings,
      // and Deposit IDs are compatible with Id<_HasId>. We only use targetId for deposits in this role.
      ctx.memory.targetId = best.id ;
    }
  }

  if (!ctx.memory.targetId) return { type: "idle" };

  // Attempt to get the deposit - may return null if ID is invalid or object no longer exists
  // We use a type guard to verify this is actually a Deposit
  const depositObj = Game.getObjectById(ctx.memory.targetId);
  if (!depositObj || !isDeposit(depositObj)) {
    // Invalid or missing deposit - clear target and idle
    delete ctx.memory.targetId;
    return { type: "idle" };
  }
  const deposit = depositObj;

  // Check if deposit is on cooldown
  if (deposit.cooldown > 100) {
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
  }

  return { type: "harvestDeposit", target: deposit };
}
