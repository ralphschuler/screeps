/**
 * @ralphschuler/screeps-roles
 * 
 * Reusable role behaviors and framework for Screeps bots.
 * 
 * This package provides:
 * - Behavior framework (context, types, execution)
 * - Composable behaviors for common tasks
 * - Complete role implementations
 * 
 * @packageDocumentation
 */

// =============================================================================
// Behavior Framework (from behaviors directory - the canonical implementation)
// =============================================================================

// Context management
export { 
  createContext, 
  clearRoomCaches,
  registerMilitaryCacheClear 
} from "./behaviors/context";

// Types
export type { 
  CreepContext,
  CreepAction,
  BehaviorFunction
} from "./behaviors/types";

// Executor
export { executeAction } from "./behaviors/executor";

// State machine
export { evaluateWithStateMachine } from "./behaviors/stateMachine";

// =============================================================================
// Economy Behaviors
// =============================================================================

export {
  harvestBehavior,
  haulBehavior,
  buildBehavior,
  upgradeBehavior,
  evaluateEconomyBehavior
} from "./behaviors/economy";

// =============================================================================
// Military Behaviors
// =============================================================================

export {
  guard,
  remoteGuard,
  healer,
  soldier,
  siege,
  harasser,
  ranger,
  evaluateMilitaryBehavior
} from "./behaviors/military";

// =============================================================================
// Utility Behaviors
// =============================================================================

export {
  scout,
  claimer,
  engineer,
  remoteWorker,
  linkManager,
  terminalManager,
  evaluateUtilityBehavior
} from "./behaviors/utility";

// =============================================================================
// Role Implementations
// =============================================================================

export { runEconomyRole } from "./roles/economy";
export { runMilitaryRole } from "./roles/military";
export { runUtilityRole } from "./roles/utility";
export { runPowerRole } from "./roles/power";
