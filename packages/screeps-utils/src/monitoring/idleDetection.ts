/**
 * Generic Idle Detection Utility
 * 
 * Provides generic creep idle detection to skip expensive behavior re-evaluation.
 * This is a simplified, type-agnostic version suitable for any Screeps bot.
 * 
 * CPU Savings: ~0.1-0.2 CPU per skipped creep
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Generic creep state interface.
 * Bots should implement this interface in their creep memory.
 */
export interface CreepState {
  /** Current action being performed */
  action: string;
  /** Target ID for the action */
  targetId?: Id<_HasId>;
  /** Tick when this state started */
  startTick?: number;
}

/**
 * Idle detection configuration
 */
export interface IdleDetectionConfig {
  /**
   * Minimum ticks a creep must have a valid state before it is considered
   * stable enough to skip behavior re-evaluation.
   */
  minStateAge?: number;
  /** Roles that are eligible for idle detection */
  idleEligibleRoles?: Set<string>;
}

// =============================================================================
// Constants
// =============================================================================

/** Default minimum state age for idle detection */
const DEFAULT_MIN_STATE_AGE = 3;

/** Default idle-eligible roles (stationary workers) */
const DEFAULT_IDLE_ELIGIBLE_ROLES = new Set([
  "harvester",
  "upgrader", 
  "mineralHarvester",
  "builder"
]);

// =============================================================================
// Public API
// =============================================================================

/**
 * Check if a creep can skip behavior evaluation this tick.
 * 
 * A creep can skip if it has a valid ongoing state that's been active
 * for at least the minimum state age.
 * 
 * @param creep - The creep to check
 * @param state - The creep's current state
 * @param role - The creep's role
 * @param config - Optional configuration
 * @returns true if creep can skip behavior evaluation
 */
export function canSkipBehaviorEvaluation(
  creep: Creep,
  state: CreepState | null | undefined,
  role: string,
  config?: IdleDetectionConfig
): boolean {
  const minStateAge = config?.minStateAge ?? DEFAULT_MIN_STATE_AGE;
  const idleEligibleRoles = config?.idleEligibleRoles ?? DEFAULT_IDLE_ELIGIBLE_ROLES;
  
  // Only certain roles are eligible
  if (!idleEligibleRoles.has(role)) {
    return false;
  }
  
  // Must have a valid state with start tick
  if (!state || !state.startTick) {
    return false;
  }
  
  // State must be old enough
  const stateAge = Game.time - state.startTick;
  if (stateAge < minStateAge) {
    return false;
  }
  
  // Must have a valid target
  if (!state.targetId) {
    return false;
  }
  
  // Verify target still exists and is accessible
  return isTargetStillValid(creep, state.targetId);
}

/**
 * Validate that a creep's target is still valid and accessible.
 * 
 * @param creep - The creep
 * @param targetId - The target ID to validate
 * @param maxRange - Maximum acceptable range to target (optional)
 * @returns true if target is valid and in range
 */
export function isTargetStillValid(
  creep: Creep,
  targetId: Id<_HasId>,
  maxRange?: number
): boolean {
  const target = Game.getObjectById(targetId);
  if (!target) {
    return false;
  }
  
  // Type guard for RoomObject
  if (!("pos" in target) || !(target.pos instanceof RoomPosition)) {
    return false;
  }
  
  // Check range if specified
  if (maxRange !== undefined) {
    const range = creep.pos.getRangeTo(target.pos);
    if (range > maxRange) {
      return false;
    }
  }
  
  return true;
}

/**
 * Check if a creep is actively working (not just standing around).
 * 
 * This checks if the creep is currently performing an action based on
 * common Screeps action return codes.
 * 
 * **Note**: This is a heuristic check and may produce false positives.
 * For example, a creep with partial carry capacity might have stopped
 * mid-task, be stuck, waiting, or have failed to complete a task. Partial
 * cargo does not guarantee the creep is actively working - it might just
 * mean the creep stopped mid-task. For accurate idle detection, use
 * `canSkipBehaviorEvaluation()` with proper state tracking.
 * 
 * @param creep - The creep to check
 * @returns true if creep is likely actively working
 */
export function isCreepActivelyWorking(creep: Creep): boolean {
  // Check if creep is fatigued (was recently moving)
  if (creep.fatigue > 0) {
    return true;
  }
  
  // Check if creep performed any action last tick by examining action log
  // Note: This is a heuristic - exact detection requires tracking return codes
  
  // If creep has carry capacity, check if it's doing work
  const carryCapacity = creep.store.getCapacity();
  if (carryCapacity > 0) {
    const used = creep.store.getUsedCapacity();
    // If creep is not empty and not full, it's likely working
    // WARNING: This can be a false positive if the creep is stuck or stopped mid-task
    if (used > 0 && used < carryCapacity) {
      return true;
    }
  }
  
  return false;
}
