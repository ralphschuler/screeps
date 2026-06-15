import type { CreepAction, CreepContext } from "../types";
import { findEnergy } from "./common/energyManagement";
import { updateWorkingState } from "./common/stateManagement";

function isDangerousHostile(hostile: Creep): boolean {
  return hostile.body.some(
    part =>
      part.hits > 0 &&
      (part.type === ATTACK || part.type === RANGED_ATTACK || part.type === WORK || part.type === HEAL)
  );
}

function getSpawnConstructionSite(ctx: CreepContext): ConstructionSite | undefined {
  return ctx.prioritizedSites.find(site => site.structureType === STRUCTURE_SPAWN);
}

/**
 * Pioneer - parent-spawned bootstrap worker for newly claimed spawnless rooms.
 *
 * Flow:
 * - travel to targetRoom
 * - harvest/withdraw energy locally in the target room
 * - build the first spawn site first
 * - upgrade controller when no spawn site is available to keep ownership alive
 */
export function pioneer(ctx: CreepContext): CreepAction {
  const targetRoom = ctx.memory.targetRoom;
  if (!targetRoom) return { type: "idle" };

  if (ctx.room.name !== targetRoom) {
    return { type: "remoteMoveToRoom", roomName: targetRoom, routeType: "hauler" };
  }

  const dangerousHostiles = ctx.hostiles.filter(isDangerousHostile);
  if (dangerousHostiles.length > 0) {
    return { type: "remoteMoveToRoom", roomName: ctx.homeRoom, routeType: "hauler" };
  }

  const isWorking = updateWorkingState(ctx);

  if (isWorking) {
    const spawnSite = getSpawnConstructionSite(ctx);
    if (spawnSite) {
      return { type: "build", target: spawnSite };
    }

    if (ctx.prioritizedSites.length > 0) {
      return { type: "build", target: ctx.prioritizedSites[0]! };
    }

    if (ctx.room.controller?.my) {
      return { type: "upgrade", target: ctx.room.controller };
    }

    return { type: "idle" };
  }

  return findEnergy(ctx);
}
