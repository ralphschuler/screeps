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

/**
 * Run utility role behavior.
 */
export function runUtilityRole(creep: Creep): void {
  const ctx = createContext(creep);
  const action = evaluateUtilityBehavior(ctx);
  executeAction(creep, action, ctx);
}
