/**
 * State Management Utilities
 * 
 * Common state management functions for economy behaviors.
 */

import type { CreepContext } from "../../types";
import { clearCacheOnStateChange } from "../../../../utils/caching";

/**
 * Update working state based on energy levels.
 * Returns true if creep should be working (has energy to spend).
 * 
 * BUGFIX: Initialize working state based on current energy when undefined.
 * This prevents deadlock where creeps with partial energy have working=false,
 * causing them to try collecting more energy but being unable to due to
 * lack of free capacity.
 * 
 * State transitions:
 * - Empty → working=false (collect energy)
 * - Full → working=true (deliver/work)
 * - Undefined → initialize based on current energy (has energy → true, empty → false)
 *
 * BUGFIX: Use live store values each tick instead of ctx.isEmpty/ctx.isFull.
 * Those helpers are captured when context is created before actions execute,
 * which caused creeps that filled up during execution to keep working=false.
 * 
 * OPTIMIZATION: Only clear cached targets on state change, not the state machine state.
 * The state machine's own completion detection handles invalid states efficiently.
 * Clearing state machine state here causes unnecessary re-evaluation and "dead ticks"
 * where creeps appear idle while establishing new states, leading to perceived
 * "idle time" and wasted CPU on frequent behavior re-evaluation during transitions.
 */
export function updateWorkingState(ctx: CreepContext): boolean {
  // Use fresh store values instead of ctx.isEmpty/isFull (which are captured pre-action)
  const isEmpty = ctx.creep.store.getUsedCapacity() === 0;
  const isFull = ctx.creep.store.getFreeCapacity() === 0;

  // Initialize working state if undefined - creeps with energy should be working
  if (ctx.memory.working === undefined) {
    ctx.memory.working = !isEmpty;
  }

  const wasWorking = ctx.memory.working;

  // Update state based on energy levels
  // NOTE: Only set working=true when creep is full to stay consistent with executor logic.
  // Partial energy alone does not force a transition; existing state is preserved until
  // the creep is either empty (working=false) or full (working=true).
  if (isEmpty) {
    ctx.memory.working = false;
  } else if (isFull) {
    ctx.memory.working = true;
  }

  const isWorking = ctx.memory.working;

  // Clear cached targets when working state changes to ensure fresh target selection
  // State machine will naturally detect completion and re-evaluate on next tick
  if (wasWorking !== isWorking) {
    clearCacheOnStateChange(ctx.creep);
  }

  return isWorking;
}

/**
 * Switch creep from working mode to collection mode.
 * Used when creep has partial energy but no valid delivery targets.
 * Prevents deadlock where creeps get stuck idle with energy.
 */
export function switchToCollectionMode(ctx: CreepContext): void {
  ctx.memory.working = false;
  clearCacheOnStateChange(ctx.creep);
}
