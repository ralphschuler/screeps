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

import { createSwarmContext, executeAction } from "../trees/context";
import { evaluateUtilityRole } from "../trees/utilityBehaviors";

/**
 * Run utility role
 */
export function runUtilityRole(creep: Creep): void {
  // Create context with all room state
  const ctx = createSwarmContext(creep);

  // Evaluate behavior to get action
  const action = evaluateUtilityRole(ctx);

  // Execute the action
  executeAction(creep, action, ctx);
}
