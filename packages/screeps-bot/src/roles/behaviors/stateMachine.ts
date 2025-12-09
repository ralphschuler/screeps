/**
 * Creep State Machine
 *
 * Provides persistent state management for creeps to prevent sudden direction changes.
 * Creeps commit to an action and continue it until completion or failure.
 *
 * Architecture:
 * 1. Check if current state is valid and incomplete
 * 2. If valid, continue executing current state action
 * 3. If invalid/complete/expired, evaluate new action and commit to it
 * 4. Store state in creep memory for next tick
 *
 * State Completion Detection:
 * States are considered complete based on creep inventory state:
 * - Transfer/Build/Repair/Upgrade: complete when creep is empty
 * - Withdraw/Pickup/Harvest: complete when creep is full
 * - Target destroyed: always triggers completion
 *
 * Invalid Target Handling:
 * The executor (executeAction) detects when actions fail due to invalid targets
 * and immediately clears the state, allowing the creep to find a new target:
 * - ERR_FULL: Target is full (e.g., spawn filled by another creep)
 * - ERR_NOT_ENOUGH_RESOURCES: Source is empty (e.g., container depleted)
 * - ERR_INVALID_TARGET: Target doesn't exist or wrong type
 *
 * This two-layer approach prevents:
 * 1. Creeps getting stuck trying invalid actions (executor catches errors)
 * 2. Premature state transitions after partial transfers (state machine only checks inventory)
 * 
 * Example: Creep with 200 energy transferring to extensions with 50 capacity each:
 * - Tick 1: Transfer 50 to extension A (fills it), creep has 150 left, state continues
 * - Tick 2: Try transfer to extension A → ERR_FULL → executor clears state
 * - Tick 2: Behavior evaluates, finds extension B, transfers 50, state continues
 * - This allows smooth multi-target operations without appearing "idle"
 */

import type { CreepAction, CreepContext } from "./types";
import type { CreepState } from "../../memory/schemas";

/**
 * Default timeout for states (in ticks)
 * After this many ticks, state is considered expired and will be re-evaluated
 */
const DEFAULT_STATE_TIMEOUT = 50;

/**
 * Check if a state is still valid (target exists, not expired, etc.)
 */
function isStateValid(state: CreepState | undefined, _ctx: CreepContext): boolean {
  if (!state) return false;

  // Check timeout
  const age = Game.time - state.startTick;
  if (age > state.timeout) {
    return false;
  }

  // Validate target if present
  if (state.targetId) {
    const target = Game.getObjectById(state.targetId);
    if (!target) {
      return false;
    }
  }

  return true;
}

/**
 * Check if the current state represents a completed action.
 * 
 * OPTIMIZATION: Fast-path checks to avoid expensive Game.getObjectById calls.
 * We check capacity/position conditions first before validating targets.
 */
function isStateComplete(state: CreepState | undefined, ctx: CreepContext): boolean {
  if (!state) return true;

  switch (state.action) {
    case "harvest":
      // Harvest complete when full (executor handles depleted sources via ERR_NOT_ENOUGH_RESOURCES)
      if (ctx.isFull) return true;
      
      // Only check if target was destroyed
      if (state.targetId) {
        const target = Game.getObjectById(state.targetId);
        if (!target) return true; // Source destroyed
      }
      return false;

    case "harvestMineral":
      // Mineral harvest complete when full (executor handles depleted minerals)
      if (ctx.isFull) return true;
      
      // Only check if target was destroyed
      if (state.targetId) {
        const target = Game.getObjectById(state.targetId);
        if (!target) return true; // Mineral destroyed
      }
      return false;

    case "harvestDeposit":
      // Deposit harvest complete when full or deposit invalid
      if (ctx.isFull) return true;
      
      // Check if deposit still valid
      if (state.targetId) {
        const target = Game.getObjectById(state.targetId);
        if (!target) return true; // Deposit gone
        
        // Type guard for Deposit - check cooldown
        if (typeof target === "object" && "cooldown" in target && "lastCooldown" in target) {
          // If deposit has high cooldown, consider it complete
          if ((target as Deposit).cooldown > 100) return true;
        }
      }
      return false;

    case "pickup":
      // Pickup complete when full OR resource no longer exists
      if (ctx.isFull) return true;
      
      // Check if dropped resource still exists
      if (state.targetId) {
        const target = Game.getObjectById(state.targetId);
        if (!target) return true; // Resource picked up or decayed
      }
      return false;

    case "withdraw":
      // Withdraw complete when full (executor handles empty sources via ERR_NOT_ENOUGH_RESOURCES)
      if (ctx.isFull) return true;
      
      // Only check if target was destroyed
      if (state.targetId) {
        const target = Game.getObjectById(state.targetId);
        if (!target) return true; // Target destroyed
      }
      return false;

    case "transfer":
      // Transfer complete when empty (executor handles invalid targets via ERR_FULL)
      // Don't check if target is full here - that causes state to clear after each
      // partial transfer, making creeps appear to "idle" between targets
      if (ctx.isEmpty) return true;
      
      // Only check if target was destroyed
      if (state.targetId) {
        const target = Game.getObjectById(state.targetId);
        if (!target) return true; // Target destroyed
      }
      return false;

    case "build":
      // Build complete when empty OR construction site finished/destroyed
      if (ctx.isEmpty) return true;
      
      // Check if construction site still exists
      if (state.targetId) {
        const target = Game.getObjectById(state.targetId);
        if (!target) return true; // Site completed or destroyed
      }
      return false;

    case "repair":
      // Repair complete when empty OR structure fully repaired/destroyed
      if (ctx.isEmpty) return true;
      
      // Check if structure still needs repair
      if (state.targetId) {
        const target = Game.getObjectById(state.targetId);
        if (!target) return true; // Structure destroyed
        
        // Type guard for structures with hits
        if (typeof target === "object" && "hits" in target && "hitsMax" in target) {
          const structure = target as Structure;
          // Consider repair complete if structure is at full health or very close
          if (structure.hits >= structure.hitsMax) return true;
        }
      }
      return false;

    case "upgrade":
      // Upgrade complete when empty (controller can always be upgraded)
      return ctx.isEmpty;

    case "moveToRoom":
      // Movement complete when in target room
      // Uses state.targetRoom which is the temporary movement destination.
      // For remote creeps, memory.targetRoom is the permanent assignment (e.g., remote room)
      // while state.targetRoom might be different (e.g., home room when delivering resources).
      return state.targetRoom !== undefined && ctx.room.name === state.targetRoom;

    case "moveTo":
      // Movement complete when adjacent to or at target
      // OPTIMIZATION: Only validate target if we have a targetId
      // This avoids unnecessary Game.getObjectById calls
      if (state.targetId) {
        const target = Game.getObjectById(state.targetId);
        if (target && typeof target === "object" && "pos" in target) {
          const targetWithPos = target as { pos: RoomPosition };
          return ctx.creep.pos.inRangeTo(targetWithPos.pos, 1);
        }
      }
      return false;

    case "idle":
      // Idle is always complete (single tick action)
      return true;

    default:
      // Unknown action types are considered incomplete
      return false;
  }
}

/**
 * Convert an action to a state
 */
function actionToState(action: CreepAction, _ctx: CreepContext): CreepState {
  const state: CreepState = {
    action: action.type,
    startTick: Game.time,
    timeout: DEFAULT_STATE_TIMEOUT
  };

  // Extract target ID if present
  if ("target" in action && action.target && "id" in action.target) {
    state.targetId = action.target.id;
  }

  // Extract room name for room movement
  if (action.type === "moveToRoom") {
    state.targetRoom = action.roomName;
  }

  // Store additional data based on action type
  if (action.type === "withdraw" || action.type === "transfer") {
    state.data = { resourceType: action.resourceType };
  }

  return state;
}

/**
 * Reconstruct an action from a stored state
 */
function stateToAction(state: CreepState): CreepAction | null {
  // Get target if present
  let target: RoomObject | null = null;
  if (state.targetId) {
    const obj = Game.getObjectById(state.targetId);
    if (!obj) {
      // Target no longer exists
      return null;
    }
    // Ensure the object is a RoomObject (has pos and room properties)
    if (typeof obj === "object" && "pos" in obj && "room" in obj) {
      target = obj as unknown as RoomObject;
    } else {
      return null;
    }
  }

  // Reconstruct action based on type
  switch (state.action) {
    case "harvest":
      return target ? { type: "harvest", target: target as Source } : null;

    case "harvestMineral":
      return target ? { type: "harvestMineral", target: target as Mineral } : null;

    case "harvestDeposit":
      return target ? { type: "harvestDeposit", target: target as Deposit } : null;

    case "pickup":
      return target ? { type: "pickup", target: target as Resource } : null;

    case "withdraw":
      if (target && state.data?.resourceType) {
        return {
          type: "withdraw",
          target: target as AnyStoreStructure,
          resourceType: state.data.resourceType as ResourceConstant
        };
      }
      return null;

    case "transfer":
      if (target && state.data?.resourceType) {
        return {
          type: "transfer",
          target: target as AnyStoreStructure,
          resourceType: state.data.resourceType as ResourceConstant
        };
      }
      return null;

    case "build":
      return target ? { type: "build", target: target as ConstructionSite } : null;

    case "repair":
      return target ? { type: "repair", target: target as Structure } : null;

    case "upgrade":
      return target ? { type: "upgrade", target: target as StructureController } : null;

    case "moveTo":
      return target ? { type: "moveTo", target } : null;

    case "moveToRoom":
      return state.targetRoom ? { type: "moveToRoom", roomName: state.targetRoom } : null;

    case "idle":
      return { type: "idle" };

    default:
      // Unknown action type
      return null;
  }
}

/**
 * Evaluate behavior with state machine logic.
 * 
 * If creep has a valid ongoing state, continue that action.
 * Otherwise, evaluate new behavior and commit to it.
 * 
 * @param ctx Creep context
 * @param behaviorFn Behavior function to call when evaluating new action
 * @returns Action to execute
 */
export function evaluateWithStateMachine(
  ctx: CreepContext,
  behaviorFn: (ctx: CreepContext) => CreepAction
): CreepAction {
  const currentState = ctx.memory.state;

  // Check if we have a valid ongoing state
  if (currentState && isStateValid(currentState, ctx)) {
    // Check if state is complete
    if (isStateComplete(currentState, ctx)) {
      // State complete - clear it and evaluate new action
      delete ctx.memory.state;
    } else {
      // State still ongoing - try to reconstruct and continue action
      const action = stateToAction(currentState);
      if (action) {
        return action;
      }
      // Failed to reconstruct - clear state and evaluate new
      delete ctx.memory.state;
    }
  } else {
    // State invalid or expired - clear it
    delete ctx.memory.state;
  }

  // No valid state - evaluate new action
  const newAction = behaviorFn(ctx);

  // Don't store state for idle actions (they complete immediately)
  if (newAction.type !== "idle") {
    // Commit to this new action
    ctx.memory.state = actionToState(newAction, ctx);
  }

  return newAction;
}
