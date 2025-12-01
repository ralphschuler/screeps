/**
 * Creep Behaviors
 *
 * A simple, human-readable approach to creep decision making.
 *
 * Architecture:
 * 1. Context - Gather all information needed for decisions
 * 2. Behavior - Evaluate the situation and return an action
 * 3. Executor - Execute the action on the creep
 *
 * Usage:
 *   const ctx = createContext(creep);
 *   const action = evaluateBehavior(ctx);
 *   executeAction(creep, action, ctx);
 */

// Types
export type { CreepAction, CreepContext, BehaviorFunction } from "./types";

// Context factory
export { createContext } from "./context";

// Action executor
export { executeAction } from "./executor";

// Behavior evaluators by role family
export { evaluateEconomyBehavior } from "./economy";
export { evaluateMilitaryBehavior } from "./military";
export { evaluateUtilityBehavior } from "./utility";
export {
  evaluatePowerBehavior,
  evaluatePowerCreepBehavior,
  createPowerCreepContext,
  executePowerCreepAction,
  type PowerCreepContext,
  type PowerCreepAction
} from "./power";
