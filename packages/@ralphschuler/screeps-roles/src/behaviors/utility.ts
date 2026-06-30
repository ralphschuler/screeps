/**
 * Utility behavior facade and dispatcher.
 *
 * The concrete utility roles live under `behaviors/utility/` so each module owns
 * one decision policy. This file preserves the public import path and keeps the
 * role-to-behavior dispatch table in one place.
 */

import type { CreepState } from "../memory/schemas";
import type { CreepAction, CreepContext } from "./types";

export { interShardClaimer } from "./interShardClaim";
export { scout } from "./utility/scout";
export { claimer } from "./utility/claimer";
export { engineer } from "./utility/engineer";
export { remoteWorker } from "./utility/remoteWorker";
export { linkManager, terminalManager } from "./utility/logistics";
export { getRemoteWorkerSafetyInterrupt, hasDangerousRemoteHostiles, isDangerousRemoteHostile } from "./utility/safety";

import { interShardClaimer } from "./interShardClaim";
import { scout } from "./utility/scout";
import { claimer } from "./utility/claimer";
import { engineer } from "./utility/engineer";
import { linkManager, terminalManager } from "./utility/logistics";
import { remoteWorker } from "./utility/remoteWorker";
import { getRemoteWorkerSafetyInterrupt } from "./utility/safety";

// =============================================================================
// Role Dispatcher
// =============================================================================

const utilityBehaviors: Record<string, (ctx: CreepContext) => CreepAction> = {
  scout,
  claimer,
  interShardClaimer,
  interShardScout: interShardClaimer,
  engineer,
  remoteWorker,
  linkManager,
  terminalManager
};

/**
 * Return an urgent action that should preempt an existing utility state.
 */
export function getUtilityStateInterrupt(ctx: CreepContext, currentState: CreepState): CreepAction | null {
  if (ctx.memory.role === "remoteWorker") {
    return getRemoteWorkerSafetyInterrupt(ctx, currentState);
  }
  return null;
}

/**
 * Evaluate and return an action for a utility role creep.
 */
export function evaluateUtilityBehavior(ctx: CreepContext): CreepAction {
  const behavior = utilityBehaviors[ctx.memory.role] ?? scout;
  return behavior(ctx);
}
