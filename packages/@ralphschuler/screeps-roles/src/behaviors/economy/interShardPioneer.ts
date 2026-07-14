import { stageInterShardCreepMemory } from "@ralphschuler/screeps-intershard";
import type { CreepAction, CreepContext } from "../types";
import { findEnergy } from "./common/energyManagement";
import { updateWorkingState } from "./common/stateManagement";

interface InterShardMemoryFields {
  targetShard?: string;
  portalRoom?: string;
  targetRoom?: string;
  workflowState?: string;
}

function isDangerousHostile(hostile: Creep): boolean {
  return hostile.body.some(part => part.hits > 0 && (part.type === ATTACK || part.type === RANGED_ATTACK || part.type === WORK || part.type === HEAL));
}

function findPortal(room: Room, targetShard: string): StructurePortal | undefined {
  const portals = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_PORTAL }) as StructurePortal[];
  return portals.find(portal => {
    const destination = portal.destination;
    return "shard" in destination && destination.shard === targetShard;
  });
}

function moveToPortal(ctx: CreepContext, memory: InterShardMemoryFields): CreepAction {
  if (!memory.targetShard || !memory.portalRoom) return { type: "idle" };
  if (ctx.room.name !== memory.portalRoom) return { type: "moveToRoom", roomName: memory.portalRoom };
  const portal = findPortal(ctx.room, memory.targetShard);
  if (!portal) return { type: "idle" };
  if (!stageInterShardCreepMemory([ctx.creep]).written) return { type: "idle" };
  // A portal only transfers a creep standing on its tile. Cartographer's
  // default target range is 1, which leaves inter-shard pioneers adjacent forever.
  return { type: "moveTo", target: { pos: portal.pos, range: 0 } };
}

function getSpawnConstructionSite(ctx: CreepContext): ConstructionSite | undefined {
  return ctx.prioritizedSites.find(site => site.structureType === STRUCTURE_SPAWN);
}

export function interShardPioneer(ctx: CreepContext): CreepAction {
  const memory = ctx.memory as typeof ctx.memory & InterShardMemoryFields;
  if (!memory.targetShard) {
    ctx.creep.suicide();
    return { type: "idle" };
  }
  if (Game.shard?.name !== memory.targetShard) return moveToPortal(ctx, memory);

  if (!memory.targetRoom) memory.targetRoom = ctx.room.name;
  if (ctx.room.name !== memory.targetRoom) return { type: "moveToRoom", roomName: memory.targetRoom };

  if (ctx.hostiles.some(isDangerousHostile)) return { type: "idle" };

  const isWorking = updateWorkingState(ctx);
  if (isWorking) {
    const spawnSite = getSpawnConstructionSite(ctx);
    if (spawnSite) return { type: "build", target: spawnSite };
    if (ctx.prioritizedSites.length > 0) return { type: "build", target: ctx.prioritizedSites[0]! };
    if (ctx.room.controller?.my) return { type: "upgrade", target: ctx.room.controller };
    return { type: "idle" };
  }

  return findEnergy(ctx);
}
