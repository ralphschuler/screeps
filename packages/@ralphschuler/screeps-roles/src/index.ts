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

// Framework exports
export { createContext, clearRoomCaches } from "./framework/BehaviorContext";
export type { 
  BaseCreepMemory,
  CreepState,
  CreepAction,
  CreepContext,
  BehaviorFunction,
  BehaviorResult
} from "./framework/types";

// TODO: Extract and export behaviors
// Issue URL: https://github.com/ralphschuler/screeps/issues/935
// export { harvestBehavior, haulBehavior, buildBehavior, upgradeBehavior } from "./behaviors/economy";
// export { attackBehavior, defendBehavior, healBehavior } from "./behaviors/military";

// TODO: Extract and export complete roles
// Issue URL: https://github.com/ralphschuler/screeps/issues/934
// export { runEconomyRole } from "./roles/economy";
// export { runMilitaryRole } from "./roles/military";
// export { runUtilityRole } from "./roles/utility";
