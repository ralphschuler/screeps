/**
 * Builder Behavior
 * 
 * Construct and repair structures.
 * Priority: deliver energy to spawns/extensions/towers first, then build
 * 
 * OPTIMIZATION: Uses centralized target assignment for construction sites
 * to reduce per-creep search complexity from O(n) to O(1).
 */

import type { CreepAction, CreepContext } from "../types";
import { updateWorkingState } from "./common/stateManagement";
import { findCriticalEnergyDelivery, findEnergy } from "./common/energyManagement";
import { getAssignedBuildTarget } from "../../economy/targetAssignmentManager";

/**
 * Builder - Construct and repair structures.
 * Priority: deliver energy to spawns/extensions/towers first, then build
 * This ensures the room economy stays healthy while building
 */
export function builder(ctx: CreepContext): CreepAction {
  const isWorking = updateWorkingState(ctx);

  if (isWorking) {
    // Before building, check if critical structures need energy
    // Priority: Spawns → Extensions → Towers → Build → Upgrade
    // This ensures the room economy stays healthy while building
    
    const criticalDelivery = findCriticalEnergyDelivery(ctx, "builder");
    if (criticalDelivery) return criticalDelivery;

    // All critical structures filled - now build construction sites
    // OPTIMIZATION: Use centralized assignment manager (O(1) lookup)
    // instead of per-creep construction site search
    const assignedSite = getAssignedBuildTarget(ctx.creep);
    
    // Use assigned site if available, otherwise fall back to prioritized sites
    if (assignedSite) {
      return { type: "build", target: assignedSite };
    }
    
    if (ctx.prioritizedSites.length > 0) {
      return { type: "build", target: ctx.prioritizedSites[0]! };
    }

    // No sites - help upgrade
    if (ctx.room.controller) {
      return { type: "upgrade", target: ctx.room.controller };
    }

    return { type: "idle" };
  }

  return findEnergy(ctx);
}
