import {
  addCombatPower,
  buildDefenseAssistBody,
  calculateCombatPower,
  DEFENSE_ASSIST_TASK,
  emptyCombatPower,
  getVisibleDefenseAssistThreatProfile,
  isDefenseAssistMilitaryRole,
  type CombatPower,
  type DefenseAssistRole
} from "@ralphschuler/screeps-defense";
import type { SwarmCreepMemory } from "@ralphschuler/screeps-memory";
import { getEffectiveRoomEnergyAvailable } from "./roomEnergy";
import { getActiveDefenseAssistRequests, type DefenseAssistRequestMemory } from "./spawn-demand/defenseAssistRequests";
import { spawnQueue, type SpawnRequest } from "./spawnQueue";

const DEFENSE_ASSIST_ROLES = ["guard", "ranger", "healer"] as const satisfies readonly DefenseAssistRole[];

export interface DefenseAssistTelemetryRoleCounts {
  guard: number;
  ranger: number;
  healer: number;
  total: number;
}

export interface DefenseAssistReleaseTelemetry {
  total: number;
  byReason: Record<string, number>;
  lastReason?: string;
  lastReleasedAt?: number;
}

export type DefenseAssistBlockReason =
  | "none"
  | "unaffordable"
  | "waiting-for-parity"
  | "waiting-for-quorum"
  | "no-local-assist";

export interface DefenseAssistTelemetryEntry {
  helperRoom: string;
  targetRoom: string;
  urgency: number;
  requested: DefenseAssistTelemetryRoleCounts;
  queued: DefenseAssistTelemetryRoleCounts;
  spawning: DefenseAssistTelemetryRoleCounts;
  staged: DefenseAssistTelemetryRoleCounts;
  moving: DefenseAssistTelemetryRoleCounts;
  arrived: DefenseAssistTelemetryRoleCounts;
  released: DefenseAssistReleaseTelemetry;
  bodyCost: Partial<Record<DefenseAssistRole, number>>;
  affordable: Partial<Record<DefenseAssistRole, boolean>>;
  assignedPower: CombatPower;
  targetScore: number;
  parityPercent: number;
  blockReason: DefenseAssistBlockReason;
}

interface MemoryWithDefenseRequests {
  defenseRequests?: DefenseAssistRequestMemory[] | Record<string, DefenseAssistRequestMemory>;
}

function emptyRoleCounts(): DefenseAssistTelemetryRoleCounts {
  return { guard: 0, ranger: 0, healer: 0, total: 0 };
}

function addRoleCount(counts: DefenseAssistTelemetryRoleCounts, role: DefenseAssistRole, amount = 1): void {
  counts[role] += amount;
  counts.total += amount;
}

function getDefenseAssistTarget(memory: Partial<SwarmCreepMemory>, targetRoom?: string): string | undefined {
  return memory.assistTarget ?? (memory.task === DEFENSE_ASSIST_TASK ? memory.targetRoom ?? targetRoom : undefined);
}

function isDefenseAssistSpawnRequest(request: SpawnRequest): request is SpawnRequest & { role: DefenseAssistRole } {
  return isDefenseAssistMilitaryRole(request.role) && getDefenseAssistTarget(request.additionalMemory ?? {}, request.targetRoom) !== undefined;
}

function getRequestedRoleCount(request: DefenseAssistRequestMemory, role: DefenseAssistRole): number {
  if (role === "guard") return Math.max(0, request.guardsNeeded ?? 0);
  if (role === "ranger") return Math.max(0, request.rangersNeeded ?? 0);
  return Math.max(0, request.healersNeeded ?? 0);
}

function createTelemetryEntry(homeRoom: string, targetRoom: string, urgency = 0): DefenseAssistTelemetryEntry {
  return {
    helperRoom: homeRoom,
    targetRoom,
    urgency,
    requested: emptyRoleCounts(),
    queued: emptyRoleCounts(),
    spawning: emptyRoleCounts(),
    staged: emptyRoleCounts(),
    moving: emptyRoleCounts(),
    arrived: emptyRoleCounts(),
    released: { total: 0, byReason: {} },
    bodyCost: {},
    affordable: {},
    assignedPower: emptyCombatPower(),
    targetScore: 0,
    parityPercent: 0,
    blockReason: "none"
  };
}

function addCombatParts(power: CombatPower, parts: Array<BodyPartConstant | BodyPartDefinition>): CombatPower {
  if (parts.length === 0) return power;
  return addCombatPower(power, calculateCombatPower(parts));
}

function addAssignedPower(entry: DefenseAssistTelemetryEntry, parts: Array<BodyPartConstant | BodyPartDefinition>): void {
  entry.assignedPower = addCombatParts(entry.assignedPower, parts);
}

function recordRelease(entry: DefenseAssistTelemetryEntry, memory: Partial<SwarmCreepMemory>): void {
  if (memory.defenseAssistReleasedAt === undefined) return;

  const reason = memory.defenseAssistReleaseReason ?? "unknown";
  entry.released.total++;
  entry.released.byReason[reason] = (entry.released.byReason[reason] ?? 0) + 1;
  if (entry.released.lastReleasedAt === undefined || memory.defenseAssistReleasedAt > entry.released.lastReleasedAt) {
    entry.released.lastReleasedAt = memory.defenseAssistReleasedAt;
    entry.released.lastReason = reason;
  }
}

function attachRoleBodyTelemetry(entry: DefenseAssistTelemetryEntry, home: Room, availableEnergy: number): void {
  const threatProfile = getVisibleDefenseAssistThreatProfile(entry.targetRoom);
  entry.targetScore = threatProfile?.total.score ?? 0;

  for (const role of DEFENSE_ASSIST_ROLES) {
    const body = buildDefenseAssistBody(role, home.energyCapacityAvailable, threatProfile);
    if (!body) {
      entry.affordable[role] = false;
      continue;
    }

    entry.bodyCost[role] = body.cost;
    entry.affordable[role] = body.cost <= availableEnergy;
  }
}

function deriveBlockReason(entry: DefenseAssistTelemetryEntry): DefenseAssistBlockReason {
  const queuedRoles = DEFENSE_ASSIST_ROLES.filter(role => entry.queued[role] > 0);
  if (queuedRoles.length > 0 && queuedRoles.every(role => entry.affordable[role] === false)) {
    return "unaffordable";
  }

  if (entry.staged.total > 0 && entry.released.total === 0) {
    return entry.targetScore > 0 && entry.parityPercent < 100 ? "waiting-for-parity" : "waiting-for-quorum";
  }

  const activeTotal = entry.queued.total + entry.spawning.total + entry.staged.total + entry.moving.total + entry.arrived.total;
  if (entry.requested.total > 0 && activeTotal === 0) return "no-local-assist";

  return "none";
}

function finalizeEntry(entry: DefenseAssistTelemetryEntry, readyPower: CombatPower): void {
  entry.parityPercent = entry.targetScore > 0
    ? Math.min(100, (readyPower.score / entry.targetScore) * 100)
    : 0;
  entry.blockReason = deriveBlockReason(entry);
}

/**
 * Collect compact defense-assist telemetry for one helper room.
 *
 * The spawn package owns queue/body-affordability details, so it produces this
 * framework-level telemetry for the stats package to publish without duplicating
 * spawn planning logic in the bot runtime layer.
 */
export function collectDefenseAssistTelemetry(homeRoom: string): DefenseAssistTelemetryEntry[] {
  const home = Game.rooms[homeRoom];
  if (!home) return [];

  const availableEnergy = getEffectiveRoomEnergyAvailable(home);
  const entries = new Map<string, DefenseAssistTelemetryEntry>();
  const readyPowerByTarget = new Map<string, CombatPower>();
  const addReadyPower = (targetRoom: string, parts: Array<BodyPartConstant | BodyPartDefinition>) => {
    readyPowerByTarget.set(targetRoom, addCombatParts(readyPowerByTarget.get(targetRoom) ?? emptyCombatPower(), parts));
  };
  const getEntry = (targetRoom: string, urgency = 0) => {
    const existing = entries.get(targetRoom);
    if (existing) {
      existing.urgency = Math.max(existing.urgency, urgency);
      return existing;
    }

    const entry = createTelemetryEntry(homeRoom, targetRoom, urgency);
    attachRoleBodyTelemetry(entry, home, availableEnergy);
    entries.set(targetRoom, entry);
    return entry;
  };

  for (const request of getActiveDefenseAssistRequests(Memory as unknown as MemoryWithDefenseRequests)) {
    if (request.roomName === homeRoom) continue;
    const entry = getEntry(request.roomName, request.urgency ?? 0);
    for (const role of DEFENSE_ASSIST_ROLES) {
      addRoleCount(entry.requested, role, getRequestedRoleCount(request, role));
    }
  }

  for (const request of spawnQueue.getPendingRequests(homeRoom)) {
    if (!isDefenseAssistSpawnRequest(request)) continue;
    const targetRoom = getDefenseAssistTarget(request.additionalMemory ?? {}, request.targetRoom);
    if (!targetRoom) continue;

    const entry = getEntry(targetRoom);
    addRoleCount(entry.queued, request.role);
    entry.bodyCost[request.role] = Math.max(entry.bodyCost[request.role] ?? 0, request.body.cost);
    entry.affordable[request.role] = request.body.cost <= availableEnergy;
    addAssignedPower(entry, request.body.parts);
  }

  for (const creep of Object.values(Game.creeps)) {
    const memory = (creep.memory ?? {}) as Partial<SwarmCreepMemory>;
    if (memory.homeRoom !== homeRoom) continue;
    const role = memory.role ?? "";
    if (!isDefenseAssistMilitaryRole(role)) continue;

    const targetRoom = getDefenseAssistTarget(memory);
    if (!targetRoom) continue;

    const entry = getEntry(targetRoom);
    const activeBody = (creep.body ?? []).filter(part => part.hits > 0);
    if (creep.spawning) {
      addRoleCount(entry.spawning, role);
    } else if (memory.defenseAssistReleasedAt === undefined && creep.room.name === homeRoom) {
      addRoleCount(entry.staged, role);
      addReadyPower(targetRoom, activeBody);
    } else if (creep.room.name === targetRoom) {
      addRoleCount(entry.arrived, role);
    } else {
      addRoleCount(entry.moving, role);
    }

    recordRelease(entry, memory);
    addAssignedPower(entry, activeBody);
  }

  const result = [...entries.values()];
  for (const entry of result) finalizeEntry(entry, readyPowerByTarget.get(entry.targetRoom) ?? emptyCombatPower());
  return result.sort((a, b) => b.urgency - a.urgency || a.targetRoom.localeCompare(b.targetRoom));
}
