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

/**
 * Run military role behavior.
 */
export function runMilitaryRole(creep: Creep): void {
  const ctx = createContext(creep);
  const action = evaluateMilitaryBehavior(ctx);
  executeAction(creep, action, ctx);
}
