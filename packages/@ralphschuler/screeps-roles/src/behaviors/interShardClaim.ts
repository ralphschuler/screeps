import {
  createDefaultInterShardMemory,
  loadLocalInterShardMemory,
  stageInterShardCreepMemory,
  writeLocalInterShardMemory
} from "@ralphschuler/screeps-intershard";
import { getActualHostileCreeps } from "@ralphschuler/screeps-defense";
import type { CreepAction, CreepContext } from "./types";

interface InterShardClaimMemory {
  targetShard?: string;
  portalRoom?: string;
  targetRoom?: string;
  workflowState?: string;
}

function updateFootprint(status: "reached" | "claimTargetSelected" | "claimed" | "blocked", roomName?: string, blockedReason?: string): void {
  try {
    const shard = Game.shard?.name ?? "shard0";
    const memory = loadLocalInterShardMemory(createDefaultInterShardMemory());
    const op = memory.footprintOperation;
    if (!op?.targets[shard]) return;
    const target = op.targets[shard];
    target.status = status;
    target.arrivedAt ??= Game.time;
    target.claimTargetRoom = roomName ?? target.claimTargetRoom;
    target.blockedReason = blockedReason;
    target.lastUpdate = Game.time;
    if (status === "claimed") target.claimedAt = Game.time;
    op.updatedAt = Game.time;
    writeLocalInterShardMemory(memory, { updatedSections: ["footprintOperation"] });
  } catch {
    // InterShardMemory can be unavailable in tests/private servers.
  }
}

function findPortal(room: Room, targetShard: string): StructurePortal | undefined {
  const portals = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_PORTAL }) as StructurePortal[];
  return portals.find(portal => {
    const destination = portal.destination;
    return "shard" in destination && destination.shard === targetShard;
  });
}

function moveToPortal(ctx: CreepContext, memory: InterShardClaimMemory): CreepAction {
  if (!memory.targetShard || !memory.portalRoom) return { type: "idle" };
  if (ctx.room.name !== memory.portalRoom) return { type: "moveToRoom", roomName: memory.portalRoom };
  const portal = findPortal(ctx.room, memory.targetShard);
  if (!portal) return { type: "idle" };
  if (!stageInterShardCreepMemory([ctx.creep]).written) return { type: "idle" };
  // A portal only transfers a creep standing on its tile. Cartographer's
  // default target range is 1, which leaves inter-shard creeps adjacent forever.
  return { type: "moveTo", target: { pos: portal.pos, range: 0 } };
}

function isSafeNeutralClaimRoom(room: Room): boolean {
  const controller = room.controller;
  if (!controller) return false;
  if (controller.my) return true;
  if (controller.owner || controller.reservation) return false;
  if (getActualHostileCreeps(room).length > 0) return false;
  return true;
}

function adjacentRooms(roomName: string): string[] {
  const exits = Game.map.describeExits(roomName);
  if (exits) return Object.values(exits);
  const match = roomName.match(/^([WE])(\d+)([NS])(\d+)$/);
  if (!match) return [];
  const ew = match[1]!;
  const ns = match[3]!;
  const x = Number(match[2]);
  const y = Number(match[4]);
  return [`${ew}${x}${ns}${y + 1}`, `${ew}${x + 1}${ns}${y}`, `${ew}${Math.max(0, x - 1)}${ns}${y}`, `${ew}${x}${ns}${Math.max(0, y - 1)}`];
}

export function interShardClaimer(ctx: CreepContext): CreepAction {
  const memory = ctx.memory as typeof ctx.memory & InterShardClaimMemory;
  if (!memory.targetShard) {
    ctx.creep.suicide();
    return { type: "idle" };
  }

  if (Game.shard?.name !== memory.targetShard) {
    return moveToPortal(ctx, memory);
  }

  updateFootprint("reached");

  if (memory.targetRoom && ctx.room.name !== memory.targetRoom) {
    return { type: "moveToRoom", roomName: memory.targetRoom };
  }

  if (isSafeNeutralClaimRoom(ctx.room)) {
    memory.targetRoom = ctx.room.name;
    if (ctx.memory.role === "interShardScout") {
      updateFootprint("reached", ctx.room.name, "Safe neutral claim target found; waiting for free GCL slot");
      return { type: "idle" };
    }
    updateFootprint(ctx.room.controller?.my ? "claimed" : "claimTargetSelected", ctx.room.name);
    if (ctx.room.controller?.my) return { type: "idle" };
    return { type: "claim", target: ctx.room.controller! };
  }

  const nextRoom = adjacentRooms(ctx.room.name).find(roomName => roomName !== memory.homeRoom);
  if (nextRoom) {
    memory.targetRoom = nextRoom;
    updateFootprint("reached", undefined, "Searching adjacent rooms for safe neutral controller");
    return { type: "moveToRoom", roomName: nextRoom };
  }

  updateFootprint("blocked", undefined, "No safe neutral claim target visible near arrival room");
  return { type: "idle" };
}
