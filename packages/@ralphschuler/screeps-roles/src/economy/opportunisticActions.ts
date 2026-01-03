/**
 * Opportunistic actions stub for roles package
 */

import type { CreepAction, CreepContext } from "../behaviors/types";

export function applyOpportunisticActions(
  creep: Creep,
  action: CreepAction,
  ctx?: CreepContext
): CreepAction {
  // No-op stub - opportunistic actions are optional optimizations
  // Just return the original action unchanged
  return action;
}
