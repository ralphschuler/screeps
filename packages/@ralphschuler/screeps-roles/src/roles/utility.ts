/**
 * Utility Role
 *
 * Handles utility and support roles:
 * - ScoutAnt (exploration)
 * - ClaimAnt (claiming/reserving)
 * - Engineer (repairs, ramparts)
 * - RemoteWorker (remote mining)
 * - LinkManager
 * - TerminalManager
 *
 * This is a minimal implementation that will be expanded as behaviors
 * are extracted in future phases (see docs/IMPLEMENTATION_STATUS.md).
 */

import { createContext } from "../framework/BehaviorContext";

/**
 * Run utility role behavior.
 *
 * TODO: Integrate with behavior evaluators when Phase 6 (Utility Behaviors) is complete
 Issue URL: https://github.com/ralphschuler/screeps/issues/967
 * Currently this is a placeholder that creates context but doesn't execute behaviors.
 * Full implementation requires:
 * - BehaviorExecutor (Phase 2)
 * - StateMachine (Phase 3)
 * - Utility Behaviors (Phase 6)
 *
 * @param creep - The creep to run utility behavior for
 */
export function runUtilityRole(creep: Creep): void {
  // Create context for the creep
  const ctx = createContext(creep);
  
  // TODO: Phase 6 - Add behavior evaluation
  // Issue URL: https://github.com/ralphschuler/screeps/issues/966
  // const action = evaluateUtilityBehavior(ctx);
  
  // TODO: Phase 3 - Add state machine integration
  // Issue URL: https://github.com/ralphschuler/screeps/issues/965
  // const action = evaluateWithStateMachine(ctx, evaluateUtilityBehavior);
  
  // TODO: Phase 2 - Add action execution
  // Issue URL: https://github.com/ralphschuler/screeps/issues/964
  // executeAction(creep, action, ctx);
  
  // Placeholder: Log that context was created (will be replaced)
  if (Game.time % 100 === 0) {
    console.log(`[Utility] ${creep.name} context ready (behaviors not yet implemented)`);
  }
}
