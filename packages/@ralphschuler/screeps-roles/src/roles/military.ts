/**
 * Military Role
 *
 * Handles defense and offensive roles:
 * - GuardAnt (melee/ranged defenders)
 * - HealerAnt
 * - SoldierAnt (melee/range offense)
 * - SiegeUnit (dismantler/tough)
 * - Harasser (early aggression)
 * - Ranger (ranged combat)
 *
 * This is a minimal implementation that will be expanded as behaviors
 * are extracted in future phases (see docs/IMPLEMENTATION_STATUS.md).
 */

import { createContext } from "../framework/BehaviorContext";

/**
 * Run military role behavior.
 *
 * TODO: Integrate with behavior evaluators when Phase 5 (Military Behaviors) is complete
 Issue URL: https://github.com/ralphschuler/screeps/issues/963
 * Currently this is a placeholder that creates context but doesn't execute behaviors.
 * Full implementation requires:
 * - BehaviorExecutor (Phase 2)
 * - StateMachine (Phase 3)
 * - Military Behaviors (Phase 5)
 *
 * @param creep - The creep to run military behavior for
 */
export function runMilitaryRole(creep: Creep): void {
  // Create context for the creep
  const ctx = createContext(creep);
  
  // TODO: Phase 5 - Add behavior evaluation
  // Issue URL: https://github.com/ralphschuler/screeps/issues/962
  // const action = evaluateMilitaryBehavior(ctx);
  
  // TODO: Phase 3 - Add state machine integration
  // Issue URL: https://github.com/ralphschuler/screeps/issues/961
  // const action = evaluateWithStateMachine(ctx, evaluateMilitaryBehavior);
  
  // TODO: Phase 2 - Add action execution
  // Issue URL: https://github.com/ralphschuler/screeps/issues/960
  // executeAction(creep, action, ctx);
  
  // Placeholder: Log that context was created (will be replaced)
  if (Game.time % 100 === 0) {
    console.log(`[Military] ${creep.name} context ready (behaviors not yet implemented)`);
  }
}
