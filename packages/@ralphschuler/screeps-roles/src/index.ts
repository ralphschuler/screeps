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

// Behavior exports
export { harvestBehavior, haulBehavior, buildBehavior, upgradeBehavior } from "./behaviors/economy";
export { attackBehavior, defendBehavior, healBehavior } from "./behaviors/military";

// Role exports (Phase 9)
// Note: These are minimal implementations that will be expanded as behaviors are extracted
// See docs/IMPLEMENTATION_STATUS.md for the full phased approach
export { runEconomyRole } from "./roles/economy";
export { runMilitaryRole } from "./roles/military";
export { runUtilityRole } from "./roles/utility";
