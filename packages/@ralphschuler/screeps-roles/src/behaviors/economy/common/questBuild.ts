import type { CreepState } from "../../../memory/schemas";
import type { CreepAction, CreepContext } from "../../types";

const ROOM_NAME_PATTERN = /^[WE]\d+[NS]\d+$/;

function clearQuestBuildMemory(ctx: CreepContext): void {
  delete ctx.memory.questId;
  delete ctx.memory.questTarget;
  delete ctx.memory.questAction;
}

function clearQuestBuildAndRecover(ctx: CreepContext): CreepAction | null {
  clearQuestBuildMemory(ctx);
  if (ctx.room.name !== ctx.homeRoom) {
    return { type: "remoteMoveToRoom", roomName: ctx.homeRoom, routeType: "hauler" };
  }
  return null;
}

function isValidRoomName(roomName: string): boolean {
  return ROOM_NAME_PATTERN.test(roomName);
}

function isConstructionSite(target: unknown): target is ConstructionSite {
  return (
    typeof target === "object" &&
    target !== null &&
    "progress" in target &&
    "progressTotal" in target &&
    "pos" in target
  );
}

function isAlreadyExecutingQuestBuild(ctx: CreepContext, currentState: CreepState): boolean {
  const questTarget = ctx.memory.questTarget;
  if (!questTarget) return false;

  if (
    (currentState.action === "moveToRoom" || currentState.action === "remoteMoveToRoom") &&
    currentState.targetRoom === questTarget &&
    ctx.room.name !== questTarget
  ) {
    return true;
  }

  if (currentState.action !== "build" || ctx.room.name !== questTarget || !currentState.targetId) {
    return false;
  }

  const target = Game.getObjectById(currentState.targetId);
  return isConstructionSite(target) && target.pos.roomName === questTarget;
}

/**
 * Execute TooAngel buildcs assignments written by the bot's quest executor.
 *
 * The quest coordinator owns quest lifecycle and assignment; economy roles only
 * consume the stable creep-memory intent so builders/larvaWorkers actually
 * travel to the target room and build visible target-room construction sites.
 */
export function findQuestBuildRecoveryAction(ctx: CreepContext): CreepAction | null {
  const { questAction, questTarget } = ctx.memory;
  if (questAction !== "build") return null;

  if (!questTarget || !isValidRoomName(questTarget)) {
    return clearQuestBuildAndRecover(ctx);
  }

  const targetRoom = Game.rooms[questTarget] ?? (ctx.room.name === questTarget ? ctx.room : undefined);
  if (!targetRoom) return null;

  const sites = targetRoom.find(FIND_CONSTRUCTION_SITES);
  if (sites.length > 0) {
    if (ctx.room.name === questTarget && ctx.room.name !== ctx.homeRoom && ctx.creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
      return { type: "remoteMoveToRoom", roomName: ctx.homeRoom, routeType: "hauler" };
    }
    return null;
  }

  return clearQuestBuildAndRecover(ctx);
}

export function findQuestBuildAction(ctx: CreepContext): CreepAction | null {
  const { questAction, questTarget } = ctx.memory;
  if (questAction !== "build") return null;

  const recoveryAction = findQuestBuildRecoveryAction(ctx);
  if (recoveryAction || ctx.memory.questAction !== "build") return recoveryAction;

  if (!questTarget || !isValidRoomName(questTarget)) return null;

  if (ctx.room.name !== questTarget) {
    return { type: "remoteMoveToRoom", roomName: questTarget, routeType: "hauler" };
  }

  const targetRoom = Game.rooms[questTarget] ?? ctx.room;
  const sites = targetRoom.find(FIND_CONSTRUCTION_SITES);
  const closest = ctx.creep.pos.findClosestByRange(sites);
  return { type: "build", target: closest ?? sites[0]! };
}

export function getQuestBuildStateInterrupt(ctx: CreepContext, currentState: CreepState): CreepAction | null {
  if (ctx.memory.questAction !== "build") return null;
  if (!ctx.memory.questTarget || !isValidRoomName(ctx.memory.questTarget)) return findQuestBuildAction(ctx);
  if (isAlreadyExecutingQuestBuild(ctx, currentState)) return null;
  if (ctx.creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) return null;
  return findQuestBuildAction(ctx);
}
