import { logger } from "@ralphschuler/screeps-core";
import {
  createDefaultInterShardMemory,
  deserializeInterShardMemory,
  getActiveInterShardCreepHandoffNames,
  loadLocalInterShardMemory as loadFrameworkLocalInterShardMemory,
  publishInterShardCreepPresence,
  restoreInterShardCreepMemory,
  stageInterShardCreepMemory,
  writeLocalInterShardMemory,
  type InterShardFootprintTarget,
  type InterShardMemoryWriteSection
} from "@ralphschuler/screeps-intershard";
import { runEconomyRole, runUtilityRole } from "@ralphschuler/screeps-roles";
import { spawnQueue, SpawnPriority } from "@ralphschuler/screeps-spawn";
import type { BodyTemplate } from "@ralphschuler/screeps-spawn";
import { recoverStrandedInterShardCreepMemory } from "./creepMemoryRecovery";

const TARGET_SHARDS = ["shard0", "shard1", "shard2", "shard3", "shardX"];
const CORE_SHARD = "shard1";
const OPERATION_ID = "auto-footprint-v1";
const CLAIM_BODY: BodyTemplate = { parts: [CLAIM, MOVE], cost: 650, minCapacity: 650 };
const PIONEER_BODY: BodyTemplate = { parts: [WORK, CARRY, MOVE, MOVE], cost: 250, minCapacity: 250 };
const SCOUT_BODY: BodyTemplate = { parts: [MOVE], cost: 50, minCapacity: 50 };
const MAX_SCOUTS_PER_TARGET = 1;
const MAX_CLAIMERS_PER_TARGET = 1;
const MAX_PIONEERS_PER_TARGET = 3;
const PORTAL_STALE_AFTER = 500;

interface InterShardPortalTarget {
  room: string;
  pos: { x: number; y: number };
  targetRoom: string;
}

interface OperationMemory {
  enabled?: boolean;
  targetShards?: string[];
  launchedAt?: number;
  lastRun?: number;
  cpuFloors?: Record<string, number>;
}

declare global {
  interface Memory {
    interShardOperation?: OperationMemory;
  }
}

function getCurrentShard(): string {
  return Game.shard?.name ?? "shard0";
}

function ensureMemory(): OperationMemory {
  if (!Memory.interShardOperation) {
    Memory.interShardOperation = {
      enabled: true,
      targetShards: TARGET_SHARDS,
      launchedAt: Game.time,
      cpuFloors: {
        shard0: 5,
        shard1: 20,
        shard2: 5,
        shard3: 10,
        shardX: 5
      }
    };
  }

  if (Memory.interShardOperation.enabled === undefined) Memory.interShardOperation.enabled = true;
  if (!Memory.interShardOperation.targetShards?.length) Memory.interShardOperation.targetShards = TARGET_SHARDS;
  return Memory.interShardOperation;
}

function loadLocalInterShardMemory() {
  return loadFrameworkLocalInterShardMemory(createDefaultInterShardMemory());
}

function saveLocalInterShardMemory(
  memory: ReturnType<typeof createDefaultInterShardMemory>,
  updatedSections: readonly InterShardMemoryWriteSection[] = ["footprintOperation"]
): void {
  writeLocalInterShardMemory(memory, { updatedSections });
}

function ensureOperationState() {
  const local = loadLocalInterShardMemory();
  const currentShard = getCurrentShard();
  if (!local.footprintOperation) {
    local.footprintOperation = {
      id: OPERATION_ID,
      enabled: true,
      targetShards: TARGET_SHARDS,
      targets: {},
      startedAt: Game.time,
      updatedAt: Game.time
    };
  }

  const op = local.footprintOperation;
  op.enabled = Memory.interShardOperation?.enabled !== false;
  op.targetShards = Memory.interShardOperation?.targetShards ?? TARGET_SHARDS;
  op.updatedAt = Game.time;

  for (const shard of op.targetShards) {
    if (!op.targets[shard]) {
      op.targets[shard] = {
        shard,
        status: shard === currentShard && hasOwnedRoom() ? "established" : "unreached",
        attempts: 0,
        lastUpdate: Game.time
      };
    }
  }

  if (!local.shards[currentShard]) {
    local.shards[currentShard] = {
      name: currentShard,
      role: currentShard === CORE_SHARD ? "core" : "frontier",
      health: {
        cpuCategory: "low",
        cpuUsage: 0,
        bucketLevel: Game.cpu.bucket,
        economyIndex: 0,
        warIndex: 0,
        commodityIndex: 0,
        roomCount: 0,
        avgRCL: 0,
        creepCount: Object.keys(Game.creeps).length,
        lastUpdate: Game.time
      },
      activeTasks: [],
      portals: [],
      cpuHistory: [],
      cpuLimit: Game.cpu.shardLimits?.[currentShard] ?? 0
    };
  }

  saveLocalInterShardMemory(local, ["footprintOperation", "shards"]);
  return local.footprintOperation;
}

function hasOwnedRoom(): boolean {
  return Object.values(Game.rooms).some(room => room.controller?.my);
}

function getOwnedSpawnRooms(): Room[] {
  return Object.values(Game.rooms).filter(room => room.controller?.my && room.find(FIND_MY_SPAWNS).length > 0);
}

function countCreepsFor(role: string, targetShard: string): number {
  const activeNames = new Set(getActiveInterShardCreepHandoffNames({ role, targetShard }));
  for (const creep of Object.values(Game.creeps)) {
    const memory = creep.memory as CreepMemory & { targetShard?: string };
    if (memory.role === role && memory.targetShard === targetShard) activeNames.add(creep.name);
  }
  let count = activeNames.size;
  for (const room of getOwnedSpawnRooms()) {
    count += spawnQueue.getPendingRequests(room.name).filter(req => req.role === role && req.additionalMemory?.targetShard === targetShard).length;
  }
  return count;
}

function getPortalForTarget(targetShard: string): InterShardPortalTarget | null {
  for (const room of Object.values(Game.rooms)) {
    const portals = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_PORTAL }) as StructurePortal[];
    for (const portal of portals) {
      const destination = portal.destination;
      if (
        "shard" in destination &&
        destination.shard === targetShard &&
        (portal.ticksToDecay === undefined || portal.ticksToDecay > 25)
      ) {
        return { room: room.name, pos: { x: portal.pos.x, y: portal.pos.y }, targetRoom: destination.room };
      }
    }
  }

  const local = loadLocalInterShardMemory();
  const shard = local.shards[getCurrentShard()];
  const known = shard?.portals.find(
    portal =>
      portal.targetShard === targetShard &&
      portal.threatRating <= 1 &&
      (portal.decayTick === undefined || portal.decayTick > Game.time + 25) &&
      Game.time - portal.lastScouted <= PORTAL_STALE_AFTER
  );
  if (!known) return null;
  return { room: known.sourceRoom, pos: known.sourcePos, targetRoom: known.targetRoom };
}

function sectorCentersNear(roomName: string): string[] {
  const match = roomName.match(/^([WE])(\d+)([NS])(\d+)$/);
  if (!match) return [];
  const ew = match[1]!;
  const ns = match[3]!;
  const x = Number(match[2]);
  const y = Number(match[4]);
  const centers = new Set<string>();
  for (const dx of [-10, 0, 10]) {
    for (const dy of [-10, 0, 10]) {
      const cx = Math.max(5, Math.floor((x + dx) / 10) * 10 + 5);
      const cy = Math.max(5, Math.floor((y + dy) / 10) * 10 + 5);
      centers.add(`${ew}${cx}${ns}${cy}`);
    }
  }
  return [...centers];
}

function requestScout(home: Room, targetShard: string): void {
  if (countCreepsFor("scout", targetShard) >= MAX_SCOUTS_PER_TARGET) return;
  const targetRoom = sectorCentersNear(home.name)[0];
  if (!targetRoom) return;
  spawnQueue.addRequest({
    id: `interShardScout_${targetShard}_${Game.time}`,
    roomName: home.name,
    role: "scout",
    family: "utility",
    body: SCOUT_BODY,
    priority: SpawnPriority.LOW + 5,
    targetRoom,
    createdAt: Game.time,
    additionalMemory: { targetShard, task: "interShardPortalScout" }
  });
}

function requestClaimer(home: Room, targetShard: string, portal: NonNullable<ReturnType<typeof getPortalForTarget>>): void {
  if (countCreepsFor("interShardClaimer", targetShard) >= MAX_CLAIMERS_PER_TARGET) return;
  spawnQueue.addRequest({
    id: `interShardClaimer_${targetShard}_${Game.time}`,
    roomName: home.name,
    role: "interShardClaimer",
    family: "utility",
    body: CLAIM_BODY,
    priority: SpawnPriority.NORMAL + 50,
    targetRoom: portal.targetRoom,
    createdAt: Game.time,
    additionalMemory: {
      targetShard,
      portalRoom: portal.room,
      portalPos: portal.pos,
      portalTargetRoom: portal.targetRoom,
      targetRoom: portal.targetRoom,
      task: "interShardClaim",
      workflowState: "movingToPortal"
    }
  });
}

function requestFootprintScout(home: Room, targetShard: string, portal: NonNullable<ReturnType<typeof getPortalForTarget>>): void {
  if (countCreepsFor("interShardScout", targetShard) >= 1) return;
  spawnQueue.addRequest({
    id: `interShardScout_${targetShard}_${Game.time}`,
    roomName: home.name,
    role: "interShardScout",
    family: "utility",
    body: SCOUT_BODY,
    priority: SpawnPriority.NORMAL,
    targetRoom: portal.targetRoom,
    createdAt: Game.time,
    additionalMemory: {
      targetShard,
      portalRoom: portal.room,
      portalPos: portal.pos,
      portalTargetRoom: portal.targetRoom,
      targetRoom: portal.targetRoom,
      task: "interShardFootprint",
      workflowState: "movingToPortal"
    }
  });
}

function requestPioneer(home: Room, target: InterShardFootprintTarget, portal: NonNullable<ReturnType<typeof getPortalForTarget>>): void {
  if (!target.claimTargetRoom && target.status !== "claimed" && target.status !== "bootstrapping") return;
  if (countCreepsFor("interShardPioneer", target.shard) >= MAX_PIONEERS_PER_TARGET) return;
  spawnQueue.addRequest({
    id: `interShardPioneer_${target.shard}_${Game.time}`,
    roomName: home.name,
    role: "interShardPioneer",
    family: "economy",
    body: PIONEER_BODY,
    priority: SpawnPriority.NORMAL + 25,
    targetRoom: target.claimTargetRoom ?? portal.targetRoom,
    createdAt: Game.time,
    additionalMemory: {
      targetShard: target.shard,
      portalRoom: portal.room,
      portalPos: portal.pos,
      portalTargetRoom: portal.targetRoom,
      targetRoom: target.claimTargetRoom ?? portal.targetRoom,
      task: "interShardBootstrap",
      workflowState: "movingToPortal"
    }
  });
}

function estimateOwnedRoomsAcrossShards(): number {
  const currentShard = getCurrentShard();
  const seen = new Set<string>();
  let total = Object.values(Game.rooms).filter(room => room.controller?.my).length;
  seen.add(currentShard);

  for (const shard of Memory.interShardOperation?.targetShards ?? TARGET_SHARDS) {
    if (seen.has(shard)) continue;
    try {
      const raw = InterShardMemory.getRemote(shard);
      const remote = raw ? deserializeInterShardMemory(raw) : null;
      const roomCount = remote?.shards?.[shard]?.health?.roomCount;
      if (typeof roomCount === "number" && roomCount > 0) total += roomCount;
      seen.add(shard);
    } catch {
      // Unknown remote state counts as zero, but in-flight claims below still gate duplicate launches.
    }
  }

  return total;
}

function countInFlightClaims(): number {
  const activeNames = new Set<string>();
  const targetShards = new Set([...TARGET_SHARDS, ...(Memory.interShardOperation?.targetShards ?? [])]);
  for (const targetShard of targetShards) {
    if (targetShard === getCurrentShard()) continue;
    for (const name of getActiveInterShardCreepHandoffNames({ role: "interShardClaimer", targetShard })) {
      activeNames.add(name);
    }
  }
  for (const creep of Object.values(Game.creeps)) {
    if ((creep.memory as CreepMemory).role === "interShardClaimer") activeNames.add(creep.name);
  }

  let pending = 0;
  for (const room of getOwnedSpawnRooms()) {
    pending += spawnQueue.getPendingRequests(room.name).filter(request => request.role === "interShardClaimer").length;
  }
  return activeNames.size + pending;
}

function hasFreeClaimSlot(_op: ReturnType<typeof ensureOperationState>): boolean {
  const gclLevel = Game.gcl?.level ?? 1;
  return estimateOwnedRoomsAcrossShards() + countInFlightClaims() < gclLevel;
}

function mergeRemoteOperationTargets(op: ReturnType<typeof ensureOperationState>): void {
  for (const shard of Memory.interShardOperation?.targetShards ?? TARGET_SHARDS) {
    if (shard === getCurrentShard()) continue;
    try {
      const raw = InterShardMemory.getRemote(shard);
      if (!raw) continue;
      const remote = deserializeInterShardMemory(raw);
      const remoteTarget = remote?.footprintOperation?.targets?.[shard];
      if (!remoteTarget) continue;
      const localTarget = op.targets[shard];
      if (!localTarget || (remoteTarget.lastUpdate ?? 0) > (localTarget.lastUpdate ?? 0)) {
        op.targets[shard] = remoteTarget;
      }
    } catch {
      // Invalid/unavailable remote shard is non-fatal.
    }
  }
}

function updateLocalTargetStatus(): void {
  const local = loadLocalInterShardMemory();
  const op = local.footprintOperation;
  const currentShard = getCurrentShard();
  const target = op?.targets[currentShard];
  if (!op || !target) return;

  const ownedRooms = Object.values(Game.rooms).filter(room => room.controller?.my);
  const operationCreepPresent = Object.values(Game.creeps).some(creep => {
    const memory = creep.memory as CreepMemory & { targetShard?: string };
    return memory.role?.startsWith?.("interShard") && memory.targetShard === currentShard;
  });
  if (ownedRooms.length > 0) {
    target.status = ownedRooms.some(room => room.find(FIND_MY_SPAWNS).length > 0) ? "established" : "claimed";
    target.claimTargetRoom = ownedRooms[0]?.name ?? target.claimTargetRoom;
    target.arrivedAt ??= Game.time;
    target.lastUpdate = Game.time;
  } else if (operationCreepPresent) {
    if (target.status === "unreached") target.status = "reached";
    target.arrivedAt ??= Game.time;
    target.lastUpdate = Game.time;
  } else if (target.status === "reached") {
    target.status = "unreached";
    target.blockedReason = "No live intershard operation creep remains on target shard";
    target.lastUpdate = Game.time;
  }

  op.updatedAt = Game.time;
  saveLocalInterShardMemory(local);
}

function applyCpuFloors(): void {
  const mem = ensureMemory();
  if (mem.enabled === false || !Game.cpu.setShardLimits || !Game.cpu.shardLimits || Game.time % 100 !== 0) return;
  const floors = mem.cpuFloors ?? {};
  const current = Game.cpu.shardLimits;
  const next = { ...current };
  let changed = false;
  for (const shard of mem.targetShards ?? TARGET_SHARDS) {
    const floor = floors[shard] ?? (shard === CORE_SHARD ? 20 : 5);
    if ((next[shard] ?? 0) < floor) {
      next[shard] = floor;
      changed = true;
    }
  }
  if (!changed) return;
  const result = Game.cpu.setShardLimits(next);
  if (result === OK) logger.info(`Applied intershard CPU floors: ${JSON.stringify(next)}`, { subsystem: "InterShardFootprint" });
}

export function runInterShardFootprintEarly(): void {
  const mem = ensureMemory();
  const currentShard = getCurrentShard();
  const creeps = Object.values(Game.creeps);
  restoreInterShardCreepMemory(creeps, [...new Set([...TARGET_SHARDS, ...(mem.targetShards ?? [])])]);
  if (Game.time % 10 === 0) stageInterShardCreepMemory([]);

  if (mem.enabled === false) return;
  mem.lastRun = Game.time;
  const ownedRoomPresent = hasOwnedRoom();
  for (const creep of creeps) recoverStrandedInterShardCreepMemory(creep, currentShard);
  publishInterShardCreepPresence(creeps);

  ensureOperationState();
  updateLocalTargetStatus();
  applyCpuFloors();

  // Only manually run operation creeps before the no-owned-room guard. Owned shards
  // let the normal kernel creep process run them exactly once.
  if (ownedRoomPresent) return;
  for (const creep of creeps) {
    const role = (creep.memory as CreepMemory).role;
    if (role === "interShardClaimer" || role === "interShardScout") runUtilityRole(creep);
    if (role === "interShardPioneer") runEconomyRole(creep);
  }
}

export function runInterShardFootprintSpawner(): void {
  const mem = ensureMemory();
  if (mem.enabled === false || Game.time % 10 !== 0) return;
  const op = ensureOperationState();
  mergeRemoteOperationTargets(op);

  const homes = getOwnedSpawnRooms().sort((a, b) => b.energyCapacityAvailable - a.energyCapacityAvailable || a.name.localeCompare(b.name));
  const home = homes[0];
  if (!home) return;

  for (const targetShard of mem.targetShards ?? TARGET_SHARDS) {
    if (targetShard === getCurrentShard()) continue;
    const target = op.targets[targetShard];
    if (!target || target.status === "established") continue;

    const portal = getPortalForTarget(targetShard);
    if (!portal) {
      if (target.status !== "reached") {
        requestScout(home, targetShard);
        target.blockedReason = "No known safe intershard portal yet; scouting sector centers";
        target.lastUpdate = Game.time;
      }
      continue;
    }

    target.portalRoom = portal.room;
    target.portalPos = portal.pos;
    target.destinationRoom = portal.targetRoom;
    if (target.status !== "reached") target.lastUpdate = Game.time;

    if (target.status === "claimed" || target.status === "bootstrapping") {
      requestPioneer(home, target, portal);
    } else if (hasFreeClaimSlot(op)) {
      requestClaimer(home, targetShard, portal);
    } else {
      if (target.status !== "reached") requestFootprintScout(home, targetShard, portal);
      target.status = target.status === "unreached" ? "unreached" : target.status;
      target.blockedReason = "GCL claim slots are full; sending footprint scout only until a claim slot opens";
    }
  }

  const local = loadLocalInterShardMemory();
  local.footprintOperation = op;
  saveLocalInterShardMemory(local);
}

export function getInterShardFootprintStatus(): string {
  const op = loadLocalInterShardMemory().footprintOperation;
  if (!op) return "Intershard footprint operation has not initialized.";
  const lines = [`=== Intershard Footprint Operation ${op.id} ===`, `Enabled: ${String(op.enabled)}`, `Started: ${op.startedAt}`, `Updated: ${op.updatedAt}`];
  for (const shard of op.targetShards) {
    const target = op.targets[shard];
    lines.push(`${shard}: ${target?.status ?? "unknown"}${target?.claimTargetRoom ? ` target=${target.claimTargetRoom}` : ""}${target?.portalRoom ? ` portal=${target.portalRoom}` : ""}${target?.blockedReason ? ` blocked=${target.blockedReason}` : ""}`);
  }
  return lines.join("\n");
}
