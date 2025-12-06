/**
 * Action Executor
 *
 * Executes creep actions returned by behavior functions.
 * Handles all action types and movement when targets are out of range.
 */

import type { CreepAction, CreepContext } from "./types";
import { fleeFrom, moveAwayFromSpawn, moveCreep, moveOffRoomExit, moveToRoom } from "../../utils/movement";

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
  switch (action.type) {
    // Resource gathering
    case "harvest":
      executeWithRange(creep, () => creep.harvest(action.target), action.target, PATH_COLORS.harvest);
      break;

    case "harvestMineral":
      executeWithRange(creep, () => creep.harvest(action.target), action.target, PATH_COLORS.mineral);
      break;

    case "harvestDeposit":
      executeWithRange(creep, () => creep.harvest(action.target), action.target, PATH_COLORS.deposit);
      break;

    case "pickup":
      executeWithRange(creep, () => creep.pickup(action.target), action.target, PATH_COLORS.harvest);
      break;

    case "withdraw":
      executeWithRange(
        creep,
        () => creep.withdraw(action.target, action.resourceType),
        action.target,
        PATH_COLORS.harvest
      );
      break;

    // Resource delivery
    case "transfer":
      executeWithRange(
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
      executeWithRange(creep, () => creep.build(action.target), action.target, PATH_COLORS.build);
      break;

    case "repair":
      executeWithRange(creep, () => creep.repair(action.target), action.target, PATH_COLORS.repair);
      break;

    case "upgrade":
      executeWithRange(creep, () => creep.upgradeController(action.target), action.target, PATH_COLORS.transfer);
      break;

    case "dismantle":
      executeWithRange(creep, () => creep.dismantle(action.target), action.target, PATH_COLORS.attack);
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

    case "idle":
      // When idle, first move off room exit tiles to prevent endless cycling between rooms
      if (moveOffRoomExit(creep)) {
        break;
      }
      // Then move away from spawns to prevent blocking new creeps
      moveAwayFromSpawn(creep);
      break;
  }

  // Update working state based on carry capacity
  updateWorkingState(ctx);
}

/**
 * Execute an action that requires being in range.
 * Automatically moves toward target if out of range.
 */
function executeWithRange(
  creep: Creep,
  action: () => ScreepsReturnCode,
  target: RoomObject,
  pathColor: string
): void {
  const result = action();
  if (result === ERR_NOT_IN_RANGE) {
    moveCreep(creep, target, { visualizePathStyle: { stroke: pathColor } });
  }
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
