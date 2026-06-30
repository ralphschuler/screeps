import type { CreepAction, CreepContext } from "../types";
import type { CreepState } from "../../memory/schemas";

/**
 * Remote infrastructure workers should only ignore civilians/scouts.
 * Active WORK is included because dismantlers can destroy containers/roads and
 * trapped workers in neutral rooms.
 */
export function isDangerousRemoteHostile(creep: Creep): boolean {
  return (
    creep.getActiveBodyparts(ATTACK) > 0 ||
    creep.getActiveBodyparts(RANGED_ATTACK) > 0 ||
    creep.getActiveBodyparts(WORK) > 0
  );
}

export function hasDangerousRemoteHostiles(ctx: CreepContext): boolean {
  return ctx.hostiles.some(isDangerousRemoteHostile);
}

/**
 * Interrupt long-lived remoteWorker states when a dangerous hostile appears.
 *
 * The state machine normally keeps build/repair/harvest states until complete;
 * this safety hook lets remote workers abandon that state immediately and leave
 * the remote room. It intentionally applies only away from home so local defense
 * policy remains owned by the room's normal defense logic.
 */
export function getRemoteWorkerSafetyInterrupt(
  ctx: CreepContext,
  currentState: CreepState
): CreepAction | null {
  if (ctx.memory.role !== "remoteWorker") return null;
  if (ctx.room.name === ctx.homeRoom) return null;
  if (!hasDangerousRemoteHostiles(ctx)) return null;

  if (currentState.action === "remoteMoveToRoom" && currentState.targetRoom === ctx.homeRoom) {
    return null;
  }

  return { type: "remoteMoveToRoom", roomName: ctx.homeRoom, routeType: "hauler" };
}
