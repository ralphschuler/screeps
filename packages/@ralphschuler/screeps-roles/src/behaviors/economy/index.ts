/**
 * Economy Behaviors
 *
 * Simple, human-readable behavior functions for economy roles.
 * Each function evaluates the situation and returns an action.
 * 
 * TODO(P3): FEATURE - Add behavior efficiency tracking per role
 * Measure resource throughput and optimize behaviors
 * TODO(P3): PERF - Consider implementing opportunistic multi-tasking
 * Creeps could do secondary tasks while moving (e.g., pick up energy)
 * TODO(P2): ARCH - Add adaptive behavior based on room state
 * Behavior priority should adjust based on room needs
 * TODO(P2): PERF - Implement path reuse between similar behaviors
 * Harvesters and haulers use similar paths, could share
 * TODO(P3): ARCH - Add behavior composability for complex roles
 * Combine simple behaviors into more sophisticated strategies
 * 
 * Test Status: 19/25 tests passing (76%) for economy behaviors
 * Tests exist for:
 * - harvester.test.ts - Harvester behavior decision logic
 * - hauler.test.ts - Hauler behavior and energy management  
 * - larvaWorker.test.ts - Bootstrap worker behavior
 * - upgrader.test.ts - Controller upgrade logic
 * - builder.test.ts - Builder priority delivery and construction (8/9 passing)
 * - mining.test.ts - Mineral and deposit harvesting behaviors (11/16 passing)
 */

import type { CreepAction, CreepContext } from "../types";
import type { CreepState } from "../../memory/schemas";
import { findAssignedCriticalEnergyDelivery } from "./common/energyManagement";
import { larvaWorker } from "./larvaWorker";
import { pioneer } from "./pioneer";
import { interShardPioneer } from "./interShardPioneer";
import { harvester } from "./harvester";
import { hauler } from "./hauler";
import { shouldUpgraderRefillCriticalStructures, upgrader } from "./upgrader";
import { builder } from "./builder";
import { mineralHarvester, depositHarvester } from "./mining";
import { remoteHarvester, remoteHauler } from "./remote";
import { queenCarrier, labTech, factoryWorker } from "./specialized";
import { interRoomCarrier } from "./interRoom";
import { labSupply } from "../labSupply";

const economyBehaviors: Record<string, (ctx: CreepContext) => CreepAction> = {
  larvaWorker,
  pioneer,
  interShardPioneer,
  harvester,
  hauler,
  builder,
  upgrader,
  queenCarrier,
  mineralHarvester,
  depositHarvester,
  labTech,
  labSupply,
  factoryWorker,
  remoteHarvester,
  remoteHauler,
  interRoomCarrier
};

/**
 * Evaluate and return an action for an economy role creep.
 */
export function evaluateEconomyBehavior(ctx: CreepContext): CreepAction {
  const behavior = economyBehaviors[ctx.memory.role] ?? larvaWorker;
  return behavior(ctx);
}

const INTERRUPTIBLE_ECONOMY_DELIVERY_STATES = new Set(["build", "repair", "upgrade"]);

/**
 * Preempt long-running economy work when carried energy can immediately satisfy
 * task-board critical room refill demand. This keeps refill reservations visible
 * instead of letting builders/upgraders stay committed until empty.
 */
export function getEconomyStateInterrupt(ctx: CreepContext, currentState: CreepState): CreepAction | null {
  if (!INTERRUPTIBLE_ECONOMY_DELIVERY_STATES.has(currentState.action)) return null;
  if (ctx.creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) return null;
  if (ctx.memory.role === "upgrader" && !shouldUpgraderRefillCriticalStructures(ctx)) return null;
  return findAssignedCriticalEnergyDelivery(ctx);
}

// Export individual behaviors with backward-compatible names
export { harvester as harvestBehavior };
export { hauler as haulBehavior };
export { builder as buildBehavior };
export { upgrader as upgradeBehavior };
