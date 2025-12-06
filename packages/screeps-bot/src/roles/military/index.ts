/**
 * Military Roles
 *
 * Defense and offensive roles:
 * - GuardAnt (melee/ranged defenders)
 * - HealerAnt
 * - SoldierAnt (melee/range offense)
 * - SiegeUnit (dismantler/tough)
 * - Harasser (early aggression)
 * - Ranger (ranged combat)
 */

import { createContext, evaluateMilitaryBehavior, executeAction } from "../behaviors";
import { evaluateWithStateMachine } from "../behaviors/stateMachine";

/**
 * Run military role behavior with state machine.
 * Creeps commit to actions until completion, preventing sudden direction changes.
 */
export function runMilitaryRole(creep: Creep): void {
  const ctx = createContext(creep);
  const action = evaluateWithStateMachine(ctx, evaluateMilitaryBehavior);
  executeAction(creep, action, ctx);
}
