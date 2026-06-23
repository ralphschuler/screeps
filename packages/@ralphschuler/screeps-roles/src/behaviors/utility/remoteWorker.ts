import { findCachedClosest } from "../../cache";
import type { CreepAction, CreepContext } from "../types";
import { hasDangerousRemoteHostiles } from "./safety";

const REMOTE_REPAIR_TARGET_RATIO = 0.75;

/**
 * Remote construction is intentionally narrow: build mining containers first,
 * roads second, then any remaining owned remote site. Normal builders remain
 * local-only; remoteWorker owns remote mining infrastructure upkeep.
 */
function remoteConstructionPriority(site: ConstructionSite): number {
  if (site.structureType === STRUCTURE_CONTAINER) return 100;
  if (site.structureType === STRUCTURE_ROAD) return 80;
  return 50;
}

function findRemoteBuildTarget(room: Room): ConstructionSite | null {
  const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
  return sites.sort((a, b) => remoteConstructionPriority(b) - remoteConstructionPriority(a))[0] ?? null;
}

function findRemoteRepairTarget(room: Room): Structure | null {
  const targets = room.find(FIND_STRUCTURES, {
    filter: s =>
      (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_ROAD) &&
      s.hits < s.hitsMax * REMOTE_REPAIR_TARGET_RATIO
  });
  return targets.sort((a, b) => a.hits - b.hits)[0] ?? null;
}

function findRemoteWorkerEnergy(ctx: CreepContext): CreepAction | null {
  const dropped = ctx.droppedResources.filter(r => r.resourceType === RESOURCE_ENERGY && r.amount > 0);
  const droppedEnergy = findCachedClosest(ctx.creep, dropped, "remoteWorker_dropped", 5);
  if (droppedEnergy) return { type: "pickup", target: droppedEnergy };

  const containers = ctx.containers.filter(c => c.store.getUsedCapacity(RESOURCE_ENERGY) > 0);
  const container = findCachedClosest(ctx.creep, containers, "remoteWorker_container", 10);
  if (container) return { type: "withdraw", target: container, resourceType: RESOURCE_ENERGY };

  const source = ctx.creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
  if (source) return { type: "harvest", target: source };

  return null;
}

function retreatHome(ctx: CreepContext): CreepAction {
  if (ctx.room.name !== ctx.homeRoom) {
    return { type: "remoteMoveToRoom", roomName: ctx.homeRoom, routeType: "hauler" };
  }
  return { type: "idle" };
}

function deliverExcessEnergyHome(ctx: CreepContext): CreepAction {
  if (!ctx.isEmpty && ctx.room.name !== ctx.homeRoom) {
    return { type: "remoteMoveToRoom", roomName: ctx.homeRoom, routeType: "hauler" };
  }

  if (ctx.storage) return { type: "transfer", target: ctx.storage, resourceType: RESOURCE_ENERGY };

  const spawn = findCachedClosest(
    ctx.creep,
    ctx.spawnStructures.filter(s => s.structureType === STRUCTURE_SPAWN),
    "remoteWorker_spawn",
    5
  );
  if (spawn) return { type: "transfer", target: spawn, resourceType: RESOURCE_ENERGY };

  return { type: "idle" };
}

/**
 * RemoteWorker - maintains remote mining infrastructure using remote energy.
 *
 * Lifecycle:
 * 1. Require a concrete targetRoom assigned by the spawn compiler.
 * 2. Retreat home while dangerous visible hostiles are present.
 * 3. Travel to targetRoom.
 * 4. Fill from dropped energy, containers, or active sources.
 * 5. Build remote containers/roads, then repair damaged containers/roads.
 * 6. Return excess energy home when the remote has no work left.
 */
export function remoteWorker(ctx: CreepContext): CreepAction {
  const targetRoom = ctx.memory.targetRoom;
  if (!targetRoom || targetRoom === ctx.homeRoom) return { type: "idle" };

  if (ctx.room.name === ctx.homeRoom && !ctx.isEmpty) {
    return deliverExcessEnergyHome(ctx);
  }

  if (hasDangerousRemoteHostiles(ctx)) return retreatHome(ctx);

  if (ctx.room.name !== targetRoom) {
    return { type: "remoteMoveToRoom", roomName: targetRoom, routeType: "hauler" };
  }

  if (ctx.isEmpty) ctx.memory.working = false;
  if (ctx.isFull) ctx.memory.working = true;

  if (!ctx.memory.working) {
    return findRemoteWorkerEnergy(ctx) ?? { type: "idle" };
  }

  const buildTarget = findRemoteBuildTarget(ctx.room);
  if (buildTarget) return { type: "build", target: buildTarget };

  const repairTarget = findRemoteRepairTarget(ctx.room);
  if (repairTarget) return { type: "repair", target: repairTarget };

  return deliverExcessEnergyHome(ctx);
}
