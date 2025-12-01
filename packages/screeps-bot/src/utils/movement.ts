/**
 * Movement Utilities
 *
 * Wraps emyrk-screeps-cartographer to provide movement functions.
 * This centralizes all creep movement to use the cartographer library
 * for better pathfinding, caching, and traffic management.
 */

import {
  moveTo as cartographerMoveTo,
  preTick as cartographerPreTick,
  reconcileTraffic as cartographerReconcileTraffic,
  type MoveOpts
} from "emyrk-screeps-cartographer";

/**
 * Initialize movement system at the start of each tick.
 * Must be called at the beginning of the main loop.
 */
export function initMovement(): void {
  cartographerPreTick();
}

/**
 * Reconcile traffic at the end of each tick.
 * Must be called at the end of the main loop after all creep movement.
 */
export function finalizeMovement(): void {
  cartographerReconcileTraffic();
}

/**
 * Move a creep or power creep to a target position or object.
 *
 * @param creep - The creep or power creep to move
 * @param target - Target position or object with pos property
 * @param opts - Optional movement options including visualizePathStyle
 * @returns The result of the movement action
 */
export function moveCreep(
  creep: Creep | PowerCreep,
  target: RoomPosition | RoomObject,
  opts?: MoveOpts
): CreepMoveReturnCode | -2 | -5 | -10 {
  const targetPos = "pos" in target && !(target instanceof RoomPosition) ? target.pos : target;
  return cartographerMoveTo(creep, targetPos, opts);
}

/**
 * Move a creep to a specific room by finding and moving to an exit.
 * Uses the room center (25, 25) with a range of 20 to navigate to any accessible
 * position within the target room - this is the standard approach for cross-room navigation.
 *
 * @param creep - The creep or power creep to move
 * @param roomName - The name of the destination room
 * @param opts - Optional movement options
 * @returns The result of the movement action or undefined if no path
 */
export function moveToRoom(
  creep: Creep | PowerCreep,
  roomName: string,
  opts?: MoveOpts
): CreepMoveReturnCode | -2 | -5 | -10 | undefined {
  // Use cartographer's built-in cross-room pathing capability
  // Target room center (25,25) with range 20 means "anywhere in the target room"
  const targetPos = new RoomPosition(25, 25, roomName);
  return cartographerMoveTo(creep, { pos: targetPos, range: 20 }, opts);
}

/**
 * Move a creep away from a set of positions (flee behavior).
 * This function always enables flee mode in the movement options.
 *
 * @param creep - The creep to move
 * @param threats - Array of positions to flee from
 * @param range - How far to stay away from threats (default 10)
 * @param opts - Optional movement options (flee is always set to true)
 * @returns The result of the movement action
 */
export function fleeFrom(
  creep: Creep | PowerCreep,
  threats: RoomPosition[],
  range: number = 10,
  opts?: Omit<MoveOpts, "flee">
): CreepMoveReturnCode | -2 | -5 | -10 {
  const fleeTargets = threats.map(pos => ({ pos, range }));
  return cartographerMoveTo(creep, fleeTargets, { ...opts, flee: true });
}

// Re-export MoveOpts type for consumers
export type { MoveOpts };
