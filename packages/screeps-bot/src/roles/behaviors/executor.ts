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
import { fleeFrom, moveAwayFromSpawn, moveCreep, moveOffRoomExit, moveToRoom } from "../../utils/movement";
import { requestMoveToPosition } from "../../utils/trafficManager";

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
 */
export function executeAction(creep: Creep, action: CreepAction, ctx: CreepContext): void {
  let shouldClearState = false;
  
  switch (action.type) {
    // Resource gathering
    case "harvest":
      shouldClearState = executeWithRange(creep, () => creep.harvest(action.target), action.target, PATH_COLORS.harvest);
      break;

    case "harvestMineral":
      shouldClearState = executeWithRange(creep, () => creep.harvest(action.target), action.target, PATH_COLORS.mineral);
      break;

    case "harvestDeposit":
      shouldClearState = executeWithRange(creep, () => creep.harvest(action.target), action.target, PATH_COLORS.deposit);
      break;

    case "pickup":
      shouldClearState = executeWithRange(creep, () => creep.pickup(action.target), action.target, PATH_COLORS.harvest);
      break;

    case "withdraw":
      shouldClearState = executeWithRange(
        creep,
        () => creep.withdraw(action.target, action.resourceType),
        action.target,
        PATH_COLORS.harvest
      );
      break;

    // Resource delivery
    case "transfer":
      shouldClearState = executeWithRange(
        creep,
        () => creep.transfer(action.target, action.resourceType),
        action.target,
        PATH_COLORS.transfer
      );
      break;

    case "drop":
      creep.drop(action.resourceType);
      break;

    // Construction and maintenance
    case "build":
      shouldClearState = executeWithRange(creep, () => creep.build(action.target), action.target, PATH_COLORS.build);
      break;

    case "repair":
      shouldClearState = executeWithRange(creep, () => creep.repair(action.target), action.target, PATH_COLORS.repair);
      break;

    case "upgrade":
      shouldClearState = executeWithRange(creep, () => creep.upgradeController(action.target), action.target, PATH_COLORS.transfer);
      break;

    case "dismantle":
      shouldClearState = executeWithRange(creep, () => creep.dismantle(action.target), action.target, PATH_COLORS.attack);
      break;

    // Combat
    case "attack":
      executeWithRange(creep, () => creep.attack(action.target), action.target, PATH_COLORS.attack);
      break;

    case "rangedAttack":
      executeWithRange(creep, () => creep.rangedAttack(action.target), action.target, PATH_COLORS.attack);
      break;

    case "heal":
      executeWithRange(creep, () => creep.heal(action.target), action.target, PATH_COLORS.heal);
      break;

    case "rangedHeal":
      // Ranged heal always involves movement toward the target
      creep.rangedHeal(action.target);
      moveCreep(creep, action.target, { visualizePathStyle: { stroke: PATH_COLORS.heal } });
      break;

    // Controller actions
    case "claim":
      executeWithRange(creep, () => creep.claimController(action.target), action.target, PATH_COLORS.heal);
      break;

    case "reserve":
      executeWithRange(creep, () => creep.reserveController(action.target), action.target, PATH_COLORS.heal);
      break;

    case "attackController":
      executeWithRange(creep, () => creep.attackController(action.target), action.target, PATH_COLORS.attack);
      break;

    // Movement
    case "moveTo":
      moveCreep(creep, action.target, { visualizePathStyle: { stroke: PATH_COLORS.move } });
      break;

    case "moveToRoom":
      moveToRoom(creep, action.roomName);
      break;

    case "flee":
      fleeFrom(creep, action.from, 10);
      break;

    case "wait":
      // If on a room exit, move off first before waiting
      if (moveOffRoomExit(creep)) {
        break;
      }
      if (!creep.pos.isEqualTo(action.position)) {
        moveCreep(creep, action.position);
      }
      break;

    case "requestMove":
      // Register a move request for the target position
      // This tells blocking creeps that this creep wants to move there
      requestMoveToPosition(creep, action.target);
      // Also move toward the target position
      moveCreep(creep, action.target, { visualizePathStyle: { stroke: PATH_COLORS.move } });
      break;

    case "idle":
      // When idle, first move off room exit tiles to prevent endless cycling between rooms
      if (moveOffRoomExit(creep)) {
        break;
      }
      // Then move away from spawns to prevent blocking new creeps
      moveAwayFromSpawn(creep);
      break;
  }

  // Clear state if action failed due to invalid target
  // This allows the creep to immediately re-evaluate and find a new target
  if (shouldClearState) {
    delete ctx.memory.state;
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
  pathColor: string
): boolean {
  const result = action();
  
  if (result === ERR_NOT_IN_RANGE) {
    moveCreep(creep, target, { visualizePathStyle: { stroke: pathColor } });
    return false;
  }
  
  // Check for errors that indicate the target is invalid and state should be cleared
  // This allows the creep to immediately find a new target instead of being stuck
  if (result === ERR_FULL) return true;              // Target is full (e.g., spawn/extension filled)
  if (result === ERR_NOT_ENOUGH_RESOURCES) return true; // Source is empty (e.g., container depleted)
  if (result === ERR_INVALID_TARGET) return true;    // Target doesn't exist or wrong type
  
  return false;
}

/**
 * Update the working state based on creep's store capacity.
 * Working = true when full (should deliver), false when empty (should collect).
 */
function updateWorkingState(ctx: CreepContext): void {
  if (ctx.isEmpty) {
    ctx.memory.working = false;
  }
  if (ctx.isFull) {
    ctx.memory.working = true;
  }
}
