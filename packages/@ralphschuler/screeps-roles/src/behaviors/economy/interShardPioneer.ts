import { stageInterShardCreepMemory } from "@ralphschuler/screeps-intershard";
import type { CreepAction, CreepContext } from "../types";
import { findEnergy } from "./common/energyManagement";
import { updateWorkingState } from "./common/stateManagement";

interface InterShardMemoryFields {
  targetShard?: string;
  portalRoom?: string;
  portalPos?: { x: number; y: number };
  portalTargetRoom?: string;
  targetRoom?: string;
  workflowState?: string;
}

function isDangerousHostile(hostile: Creep): boolean {
  return hostile.body.some(part => part.hits > 0 && (part.type === ATTACK || part.type === RANGED_ATTACK || part.type === WORK || part.type === HEAL));
}

function findPortal(room: Room, memory: InterShardMemoryFields): StructurePortal | undefined {
  if (!memory.targetShard) return undefined;
  const portals = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_PORTAL }) as StructurePortal[];
  const matching = portals.filter(portal => {
    const destination = portal.destination;
    return (
      "shard" in destination &&
      destination.shard === memory.targetShard &&
      (!memory.portalTargetRoom || destination.room === memory.portalTargetRoom)
    );
  });
  if (!memory.portalPos) return matching.length === 1 ? matching[0] : undefined;
  return matching.find(
    portal => portal.pos.x === memory.portalPos?.x && portal.pos.y === memory.portalPos?.y
  );
}

function moveToPortal(ctx: CreepContext, memory: InterShardMemoryFields): CreepAction {
  if (!memory.targetShard || !memory.portalRoom) return { type: "idle" };
  if (ctx.room.name !== memory.portalRoom) return { type: "moveToRoom", roomName: memory.portalRoom };
  const portal = findPortal(ctx.room, memory);
  if (!portal || (portal.ticksToDecay !== undefined && portal.ticksToDecay <= 25)) return { type: "idle" };
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

  if (!memory.targetRoom) return { type: "idle" };
  if (ctx.room.name !== memory.targetRoom) return { type: "moveToRoom", roomName: memory.targetRoom };
  if (!ctx.room.controller?.my) return { type: "idle" };

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
