export type { TowerAction, TowerActionPolicyInput, TowerTargetOptions } from "./tower/policyTypes";
export { getHostilePriority, selectTowerTarget } from "./tower/targetSelection";
export { getTowerRepairReserveEnergy } from "./tower/maintenanceSelection";

import type { TowerAction, TowerActionPolicyInput } from "./tower/policyTypes";
import { selectTowerMaintenanceAction } from "./tower/maintenanceSelection";
import { selectTowerTarget } from "./tower/targetSelection";

/**
 * Select one tower action for the current tick.
 *
 * Decision order is intentionally easy to audit for defense safety:
 * 1. attack the highest-priority hostile;
 * 2. defer maintenance under low CPU bucket;
 * 3. heal damaged friendly creeps;
 * 4. repair ordinary structures above reserve energy;
 * 5. repair walls/ramparts below the configured target;
 * 6. idle.
 */
export function selectTowerAction(input: TowerActionPolicyInput): TowerAction {
  const primaryTarget =
    input.hostiles.length > 0 ? selectTowerTarget(input.hostiles, { preferWoundedTargets: input.preferWoundedTargets }) : null;
  if (primaryTarget) {
    return { type: "attack", target: primaryTarget };
  }

  return selectTowerMaintenanceAction(input) ?? { type: "idle" };
}
