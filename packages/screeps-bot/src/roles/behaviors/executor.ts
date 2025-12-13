/**
 * Action Executor
 *
 * Executes creep actions returned by behavior functions.
 * Handles all action types and movement when targets are out of range.
 * 
 * Invalid Target Detection:
 * When an action fails due to an invalid target (ERR_FULL, ERR_NOT_ENOUGH_RESOURCES,
 * ERR_INVALID_TARGET), the executor immediately clears the creep's state. This allows
 * the behavior function to re-evaluate and find a new valid target on the same tick,
 * preventing creeps from appearing "idle" between actions.
 * 
 * Example: Hauler with 200 energy transferring to extensions (50 capacity each):
 * - Transfer 50 to extension A → OK, state persists
 * - Try transfer to extension A again → ERR_FULL, state cleared
 * - Behavior re-evaluates → finds extension B
 * - Transfer 50 to extension B → OK
 * This happens seamlessly without the creep appearing idle.
 */

import type { CreepAction, CreepContext } from "./types";
import { fleeFrom, moveAwayFromSpawn, moveCreep, moveOffRoomExit, moveToRoom, clearMovementCache } from "../../utils/movement";
import { requestMoveToPosition } from "../../utils/trafficManager";
import { getCollectionPoint } from "../../utils/collectionPoint";
import { memoryManager } from "../../memory/manager";
import { clearCache as clearAllCachedTargets } from "../../utils/cachedClosest";
import { createLogger } from "../../core/logger";

const logger = createLogger("ActionExecutor");

/**
 * Path visualization colors for different action types.
 */
const PATH_COLORS = {
  harvest: "#ffaa00",
  mineral: "#00ff00",
  deposit: "#00ffff",
  transfer: "#ffffff",
  build: "#ffffff",
  repair: "#ffff00",
  attack: "#ff0000",
  heal: "#00ff00",
  move: "#0000ff"
};

/**
 * Execute a creep action.
 * Handles all action types including automatic movement when out of range.
 * REFACTORED: Added defensive checks for invalid actions
 */
export function executeAction(creep: Creep, action: CreepAction, ctx: CreepContext): void {
  // REFACTORED: Safety check - if action is invalid, clear state and return
  if (!action || !action.type) {
    logger.warn(`${creep.name} received invalid action, clearing state`);
    delete ctx.memory.state;
    return;
  }

  // Log the action being executed for debugging
  if (action.type === "idle") {
    logger.warn(`${creep.name} (${ctx.memory.role}) executing IDLE action`);
  } else {
    logger.debug(`${creep.name} (${ctx.memory.role}) executing ${action.type}`);
  }

  let shouldClearState = false;
  
  switch (action.type) {
    // Resource gathering
    case "harvest":
      shouldClearState = executeWithRange(
        creep,
        () => creep.harvest(action.target),
        action.target,
        PATH_COLORS.harvest,
        action.type
      );
      break;

    case "harvestMineral":
      shouldClearState = executeWithRange(
        creep,
        () => creep.harvest(action.target),
        action.target,
        PATH_COLORS.mineral,
        action.type
      );
      break;

    case "harvestDeposit":
      shouldClearState = executeWithRange(
        creep,
        () => creep.harvest(action.target),
        action.target,
        PATH_COLORS.deposit,
        action.type
      );
      break;

    case "pickup":
      shouldClearState = executeWithRange(
        creep,
        () => creep.pickup(action.target),
        action.target,
        PATH_COLORS.harvest,
        action.type
      );
      break;

    case "withdraw":
      shouldClearState = executeWithRange(
        creep,
        () => creep.withdraw(action.target, action.resourceType),
        action.target,
        PATH_COLORS.harvest,
        action.type
      );
      break;

    // Resource delivery
    case "transfer":
      shouldClearState = executeWithRange(
        creep,
        () => creep.transfer(action.target, action.resourceType),
        action.target,
        PATH_COLORS.transfer,
        action.type
      );
      break;

    case "drop":
      creep.drop(action.resourceType);
      break;

    // Construction and maintenance
    case "build":
      shouldClearState = executeWithRange(
        creep,
        () => creep.build(action.target),
        action.target,
        PATH_COLORS.build,
        action.type
      );
      break;

    case "repair":
      shouldClearState = executeWithRange(
        creep,
        () => creep.repair(action.target),
        action.target,
        PATH_COLORS.repair,
        action.type
      );
      break;

    case "upgrade":
      shouldClearState = executeWithRange(
        creep,
        () => creep.upgradeController(action.target),
        action.target,
        PATH_COLORS.transfer,
        action.type
      );
      break;

    case "dismantle":
      shouldClearState = executeWithRange(
        creep,
        () => creep.dismantle(action.target),
        action.target,
        PATH_COLORS.attack,
        action.type
      );
      break;

    // Combat
    case "attack":
      executeWithRange(creep, () => creep.attack(action.target), action.target, PATH_COLORS.attack, action.type);
      break;

    case "rangedAttack":
      executeWithRange(
        creep,
        () => creep.rangedAttack(action.target),
        action.target,
        PATH_COLORS.attack,
        action.type
      );
      break;

    case "heal":
      executeWithRange(creep, () => creep.heal(action.target), action.target, PATH_COLORS.heal, action.type);
      break;

    case "rangedHeal": {
      // Ranged heal always involves movement toward the target
      creep.rangedHeal(action.target);
      const healMoveResult = moveCreep(creep, action.target, { visualizePathStyle: { stroke: PATH_COLORS.heal } });
      // Clear state if pathfinding fails
      if (healMoveResult === ERR_NO_PATH) {
        shouldClearState = true;
      }
      break;
    }

    // Controller actions
    case "claim":
      executeWithRange(
        creep,
        () => creep.claimController(action.target),
        action.target,
        PATH_COLORS.heal,
        action.type
      );
      break;

    case "reserve":
      executeWithRange(
        creep,
        () => creep.reserveController(action.target),
        action.target,
        PATH_COLORS.heal,
        action.type
      );
      break;

    case "attackController":
      executeWithRange(
        creep,
        () => creep.attackController(action.target),
        action.target,
        PATH_COLORS.attack,
        action.type
      );
      break;

    // Movement
    case "moveTo": {
      const moveResult = moveCreep(creep, action.target, { visualizePathStyle: { stroke: PATH_COLORS.move } });
      // Clear state if pathfinding fails so the behavior can re-evaluate
      if (moveResult === ERR_NO_PATH) {
        shouldClearState = true;
      }
      break;
    }

    case "moveToRoom": {
      const moveResult = moveToRoom(creep, action.roomName, { visualizePathStyle: { stroke: PATH_COLORS.move } });
      // Clear state if pathfinding fails so the behavior can re-evaluate
      if (moveResult === ERR_NO_PATH) {
        shouldClearState = true;
      }
      break;
    }

    case "flee": {
      const fleeResult = fleeFrom(creep, action.from, 10);
      // Clear state if pathfinding fails so the behavior can re-evaluate
      if (fleeResult === ERR_NO_PATH) {
        shouldClearState = true;
      }
      break;
    }

    case "wait":
      // If on a room exit, move off first before waiting
      if (moveOffRoomExit(creep)) {
        break;
      }
      if (!creep.pos.isEqualTo(action.position)) {
        const waitMoveResult = moveCreep(creep, action.position);
        // Clear state if pathfinding fails
        if (waitMoveResult === ERR_NO_PATH) {
          shouldClearState = true;
        }
      }
      break;

    case "requestMove": {
      // Register a move request for the target position
      // This tells blocking creeps that this creep wants to move there
      requestMoveToPosition(creep, action.target);
      // Also move toward the target position
      const requestMoveResult = moveCreep(creep, action.target, { visualizePathStyle: { stroke: PATH_COLORS.move } });
      // Clear state if pathfinding fails
      if (requestMoveResult === ERR_NO_PATH) {
        shouldClearState = true;
      }
      break;
    }

    case "idle": {
      // When idle, first move off room exit tiles to prevent endless cycling between rooms
      if (moveOffRoomExit(creep)) {
        break;
      }
      // Try to move to collection point if available
      const room = Game.rooms[creep.pos.roomName];
      if (room && room.controller?.my) {
        const swarmState = memoryManager.getOrInitSwarmState(room.name);
        const collectionPoint = getCollectionPoint(room, swarmState);
        if (collectionPoint) {
          // Move to collection point if not already there
          if (!creep.pos.isEqualTo(collectionPoint)) {
            // Use priority 2 to match moveAwayFromSpawn - clearing blockades is important
            const idleMoveResult = moveCreep(creep, collectionPoint, { 
              visualizePathStyle: { stroke: "#888888" },
              priority: 2
            });
            // Clear state if pathfinding fails
            if (idleMoveResult === ERR_NO_PATH) {
              shouldClearState = true;
            }
            break;
          }
        }
      }
      // Fallback: move away from spawns to prevent blocking new creeps
      moveAwayFromSpawn(creep);
      break;
    }
  }

  // Clear state if action failed due to invalid target
  // This allows the creep to immediately re-evaluate and find a new target
  if (shouldClearState) {
    delete ctx.memory.state;
    // BUGFIX: Also clear movement cache to prevent wandering from stale paths
    // When state is invalidated, the cached path to the old target is no longer valid
    // This prevents creeps from making partial movements on stale paths before re-pathing
    clearMovementCache(creep);
    // BUGFIX: Clear all cached closest targets to prevent re-selecting the same invalid target
    // When multiple creeps target the same structure, one may fill it and clear state.
    // Without clearing the cache, the other creep will immediately re-select the same
    // now-full target, creating an infinite loop where both creeps get stuck.
    clearAllCachedTargets(creep);
  }

  // Update working state based on carry capacity
  updateWorkingState(ctx);
}

/**
 * Execute an action that requires being in range.
 * Automatically moves toward target if out of range.
 * Clears creep state if action fails due to invalid target (full, empty, etc.).
 * 
 * @returns true if action should clear state (due to failure)
 */
function executeWithRange(
  creep: Creep,
  action: () => ScreepsReturnCode,
  target: RoomObject,
  pathColor: string,
  actionLabel?: string
): boolean {
  const result = action();

  if (result === ERR_NOT_IN_RANGE) {
    const moveResult = moveCreep(creep, target, { visualizePathStyle: { stroke: pathColor } });
    if (moveResult !== OK) {
      logger.info("Movement attempt returned non-OK result", {
        room: creep.pos.roomName,
        creep: creep.name,
        meta: {
          action: actionLabel ?? "rangeAction",
          moveResult,
          target: target.pos.toString()
        }
      });
    }
    // If movement fails with ERR_NO_PATH, indicate state should be cleared
    if (moveResult === ERR_NO_PATH) {
      return true;
    }
    return false;
  }

  // Check for errors that indicate the target is invalid and state should be cleared
  // This allows the creep to immediately find a new target instead of being stuck
  if (result === ERR_FULL || result === ERR_NOT_ENOUGH_RESOURCES || result === ERR_INVALID_TARGET) {
    logger.info("Clearing state after action error", {
      room: creep.pos.roomName,
      creep: creep.name,
      meta: {
        action: actionLabel ?? "rangeAction",
        result,
        target: target.pos.toString()
      }
    });
    return true;
  }

  return false;
}

/**
 * Update the working state based on creep's store capacity.
 * Working = true when full (should deliver), false when empty (should collect).
 * 
 * TODO: BUGFIX - Stale capacity values in context
 * Problem: ctx.isFull and ctx.isEmpty are calculated ONCE when context is created
 * at the start of the tick, BEFORE actions execute. After a transfer/withdraw action,
 * the creep's capacity changes but ctx.isFull/isEmpty remain stale.
 * 
 * Fix: Check creep.store directly instead of using ctx.isFull/isEmpty
 */
function updateWorkingState(ctx: CreepContext): void {
  // BUGFIX: Use creep.store directly for fresh capacity state
  const isEmpty = ctx.creep.store.getUsedCapacity() === 0;
  const isFull = ctx.creep.store.getFreeCapacity() === 0;

  // BUGFIX: Re-initialize undefined working state based on actual energy
  // Global resets or memory wipes can clear creep memory while they still
  // have energy. If working remains undefined, downstream behaviors assume
  // the creep is in collection mode and never deliver, leading to the
  // reported "working: false" deadlock even though the kernel executes
  // their processes. Initialize to true when carrying energy so they resume
  // their work cycle immediately.
  if (ctx.memory.working === undefined) {
    ctx.memory.working = !isEmpty;
  }

  if (isEmpty) {
    ctx.memory.working = false;
  }
  if (isFull) {
    ctx.memory.working = true;
  }
}
