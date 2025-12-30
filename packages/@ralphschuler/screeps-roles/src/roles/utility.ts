/**
 * Utility Roles
 *
 * Utility and support roles:
 * - ScoutAnt (exploration)
 * - ClaimAnt (claiming/reserving)
 * - Engineer (repairs, ramparts)
 * - RemoteWorker (remote mining)
 * - LinkManager
 * - TerminalManager
 */

import { createContext, evaluateUtilityBehavior, executeAction } from "../behaviors";
import { evaluateWithStateMachine } from "../behaviors/stateMachine";

/**
 * Run utility role behavior with state machine.
 * Creeps commit to actions until completion, preventing sudden direction changes.
 */
export function runUtilityRole(creep: Creep): void {
  const ctx = createContext(creep);
  const action = evaluateWithStateMachine(ctx, evaluateUtilityBehavior);
  executeAction(creep, action, ctx);
}
