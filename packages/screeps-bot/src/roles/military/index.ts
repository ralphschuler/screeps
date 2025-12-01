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

import { createSwarmContext, executeAction } from "../trees/context";
import { evaluateMilitaryRole } from "../trees/militaryBehaviors";

/**
 * Run military role
 */
export function runMilitaryRole(creep: Creep): void {
  // Create context with all room state
  const ctx = createSwarmContext(creep);

  // Evaluate behavior to get action
  const action = evaluateMilitaryRole(ctx);

  // Execute the action
  executeAction(creep, action, ctx);
}
