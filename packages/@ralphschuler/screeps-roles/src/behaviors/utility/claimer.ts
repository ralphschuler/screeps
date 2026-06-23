import { findCachedClosest } from "../../cache";
import { isExit } from "screeps-cartographer";
import type { CreepAction, CreepContext } from "../types";
import { moveToRoomCenter } from "./navigation";

/**
 * Claimer - claim, reserve, or attack room controllers.
 *
 * Spawn logic chooses the target and task. This behavior only handles safe
 * travel/off-exit movement and the final controller action.
 */
export function claimer(ctx: CreepContext): CreepAction {
  const targetRoom = ctx.memory.targetRoom;

  if (!targetRoom) {
    const spawns = ctx.spawnStructures.filter(s => s.structureType === STRUCTURE_SPAWN);
    if (spawns.length > 0) {
      const spawn = findCachedClosest(ctx.creep, spawns, "claimer_spawn", 20);
      if (spawn) return { type: "moveTo", target: spawn };
    }
    return { type: "idle" };
  }

  // PRIORITY: Always move off exits immediately to prevent cycling between rooms
  const onExit = isExit(ctx.creep.pos);
  if (onExit) {
    return moveToRoomCenter(ctx.room.name);
  }

  // Move to target room
  if (ctx.room.name !== targetRoom) {
    return { type: "remoteMoveToRoom", roomName: targetRoom, routeType: "reserver" };
  }

  // Act on controller
  const controller = ctx.room.controller;
  if (!controller) return { type: "idle" };

  const task = ctx.memory.task;
  if (task === "claim") return { type: "claim", target: controller };
  if (task === "attack") return { type: "attackController", target: controller };
  return { type: "reserve", target: controller }; // default
}
