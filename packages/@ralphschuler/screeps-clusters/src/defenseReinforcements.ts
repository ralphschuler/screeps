import { logger } from "@ralphschuler/screeps-core";
import {
  buildDefenseAssistBody as buildSharedDefenseAssistBody,
  calculateAggregateDefenseResponsePlan,
  calculateCombatPower,
  createDefenseAssistSquadId,
  DEFENSE_ASSIST_TASK,
  getActualHostileCreeps,
  getVisibleDefenseAssistThreatProfile,
  type BodyTemplate,
  type CombatPower,
  type DefenseAssistThreatProfile,
  type ExistingDefensePower
} from "@ralphschuler/screeps-defense";
import type { CreepRole, SwarmCreepMemory } from "@ralphschuler/screeps-memory";
import type { SpawnRequest } from "@ralphschuler/screeps-spawn";
import type { ClusterMemory, DefenseAssistanceRequest } from "./types";

export type DefenseReinforcementRole = "guard" | "ranger" | "healer";

export const DefenseReinforcementPriority = {
  HIGH: 500,
  EMERGENCY: 1000
} as const;

export interface PendingDefenseAssistSpawn {
  role: DefenseReinforcementRole;
  targetRoom: string;
  power?: CombatPower;
}

export interface DefenseReinforcementRoomState {
  roomName: string;
  owned: boolean;
  safe: boolean;
  availableSpawns: number;
  energyCapacityAvailable: number;
  distances: Record<string, number>;
  pendingAssist?: PendingDefenseAssistSpawn[];
}

export interface DefenseReinforcementIntent {
  id: string;
  roomName: string;
  role: DefenseReinforcementRole;
  family: "military";
  priority: number;
  targetRoom: string;
  additionalMemory: Pick<SwarmCreepMemory, "assistTarget" | "task" | "targetRoom" | "defenseSquadId" | "defenseSquadSize" | "defenseSquadCreatedAt">;
  threatProfile?: DefenseAssistThreatProfile | null;
}

export interface AssignedDefenseAssistPower {
  counts: Record<DefenseReinforcementRole, number>;
  power: ExistingDefensePower;
}

export interface DefenseReinforcementPlanInput {
  cluster: ClusterMemory;
  rooms: Record<string, DefenseReinforcementRoomState | undefined>;
  now: number;
  maxNewSpawnsPerHelperRoom?: number;
  targetThreats?: Record<string, DefenseAssistThreatProfile | null | undefined>;
  targetAssigned?: Record<string, AssignedDefenseAssistPower | undefined>;
}

export interface SpawnQueueForReinforcements {
  getPendingRequests(roomName: string): SpawnRequest[];
  addRequest(request: SpawnRequest): void;
}

const DEFAULT_MAX_NEW_SPAWNS_PER_HELPER_ROOM = 2;
const DISTANT_ROOM_PENALTY = 50;
function createEmptyAssignedDefenseAssistPower(): AssignedDefenseAssistPower {
  return {
    counts: { guard: 0, ranger: 0, healer: 0 },
    power: {}
  };
}

function hasActiveAssignedRolePart(role: DefenseReinforcementRole, parts: Array<BodyPartConstant | BodyPartDefinition>): boolean {
  const types = parts.map(part => (typeof part === "string" ? part : part.type));
  if (role === "guard") return types.includes(ATTACK) || types.includes(RANGED_ATTACK);
  if (role === "ranger") return types.includes(RANGED_ATTACK);
  return types.includes(HEAL);
}

function addAssignedDefenseAssistPower(
  assigned: AssignedDefenseAssistPower,
  role: DefenseReinforcementRole,
  parts: Array<BodyPartConstant | BodyPartDefinition>
): void {
  if (!hasActiveAssignedRolePart(role, parts)) return;

  const power = calculateCombatPower(parts);
  const existing = assigned.power[role];
  assigned.counts[role]++;
  assigned.power[role] = existing
    ? {
        partCount: existing.partCount + power.partCount,
        attack: existing.attack + power.attack,
        ranged: existing.ranged + power.ranged,
        heal: existing.heal + power.heal,
        dismantle: existing.dismantle + power.dismantle,
        score: existing.score + power.score
      }
    : power;
}

function mergeAssignedDefenseAssistPower(
  target: AssignedDefenseAssistPower,
  source: AssignedDefenseAssistPower | undefined
): void {
  if (!source) return;
  for (const role of ["guard", "ranger", "healer"] as const) {
    target.counts[role] += source.counts[role] ?? 0;
    const power = source.power[role];
    if (!power) continue;
    const existing = target.power[role];
    target.power[role] = existing
      ? {
          partCount: existing.partCount + power.partCount,
          attack: existing.attack + power.attack,
          ranged: existing.ranged + power.ranged,
          heal: existing.heal + power.heal,
          dismantle: existing.dismantle + power.dismantle,
          score: existing.score + power.score
        }
      : power;
  }
}

function buildDefenseAssistBody(
  role: DefenseReinforcementRole,
  energyCapacity: number,
  threatProfile?: DefenseAssistThreatProfile | null
): BodyTemplate | null {
  return buildSharedDefenseAssistBody(role, energyCapacity, threatProfile);
}

function getRequestNeed(request: DefenseAssistanceRequest, role: DefenseReinforcementRole): number {
  switch (role) {
    case "guard":
      return Math.max(0, request.guardsNeeded);
    case "ranger":
      return Math.max(0, request.rangersNeeded);
    case "healer":
      return Math.max(0, request.healersNeeded);
  }
}

function getPriority(urgency: number): number {
  return urgency >= 2 ? DefenseReinforcementPriority.EMERGENCY : DefenseReinforcementPriority.HIGH;
}

function getHelperCandidates(
  cluster: ClusterMemory,
  rooms: Record<string, DefenseReinforcementRoomState | undefined>,
  targetRoom: string
): DefenseReinforcementRoomState[] {
  return cluster.memberRooms
    .filter(roomName => roomName !== targetRoom)
    .map(roomName => rooms[roomName])
    .filter((room): room is DefenseReinforcementRoomState => Boolean(room?.owned && room.safe && room.availableSpawns > 0))
    .sort((a, b) => {
      const distanceA = a.distances[targetRoom] ?? DISTANT_ROOM_PENALTY;
      const distanceB = b.distances[targetRoom] ?? DISTANT_ROOM_PENALTY;
      if (distanceA !== distanceB) return distanceA - distanceB;
      if (a.energyCapacityAvailable !== b.energyCapacityAvailable) {
        return b.energyCapacityAvailable - a.energyCapacityAvailable;
      }
      return a.roomName.localeCompare(b.roomName);
    });
}

function canHelperOutmatchThreat(
  helper: DefenseReinforcementRoomState,
  role: DefenseReinforcementRole,
  threatProfile: DefenseAssistThreatProfile | null | undefined
): boolean {
  const body = buildDefenseAssistBody(role, helper.energyCapacityAvailable, threatProfile);
  if (!body) return false;
  const threat = threatProfile?.strongest;
  if (!threat || threat.score <= 0) return true;
  const power = calculateCombatPower(body.parts);
  return power.partCount >= threat.partCount && power.score >= threat.score;
}

function rankHelpersForRole(
  helpers: DefenseReinforcementRoomState[],
  role: DefenseReinforcementRole,
  targetRoom: string,
  threatProfile: DefenseAssistThreatProfile | null | undefined
): DefenseReinforcementRoomState[] {
  return [...helpers].sort((a, b) => {
    const outmatchA = canHelperOutmatchThreat(a, role, threatProfile);
    const outmatchB = canHelperOutmatchThreat(b, role, threatProfile);
    if (outmatchA !== outmatchB) return outmatchA ? -1 : 1;

    const distanceA = a.distances[targetRoom] ?? DISTANT_ROOM_PENALTY;
    const distanceB = b.distances[targetRoom] ?? DISTANT_ROOM_PENALTY;
    if (distanceA !== distanceB) return distanceA - distanceB;
    if (a.energyCapacityAvailable !== b.energyCapacityAvailable) return b.energyCapacityAvailable - a.energyCapacityAvailable;
    return a.roomName.localeCompare(b.roomName);
  });
}

function getAssignedDefenseAssistForTarget(
  input: DefenseReinforcementPlanInput,
  targetRoom: string
): AssignedDefenseAssistPower {
  const assigned = createEmptyAssignedDefenseAssistPower();
  mergeAssignedDefenseAssistPower(assigned, input.targetAssigned?.[targetRoom]);
  for (const room of Object.values(input.rooms)) {
    for (const pending of room?.pendingAssist ?? []) {
      if (pending.targetRoom !== targetRoom) continue;
      assigned.counts[pending.role]++;
      if (pending.power) {
        const existing = assigned.power[pending.role];
        assigned.power[pending.role] = existing
          ? {
              partCount: existing.partCount + pending.power.partCount,
              attack: existing.attack + pending.power.attack,
              ranged: existing.ranged + pending.power.ranged,
              heal: existing.heal + pending.power.heal,
              dismantle: existing.dismantle + pending.power.dismantle,
              score: existing.score + pending.power.score
            }
          : pending.power;
      }
    }
  }
  return assigned;
}

function getRemainingRequestNeeds(
  request: DefenseAssistanceRequest,
  assigned: AssignedDefenseAssistPower
): Partial<Record<DefenseReinforcementRole, number>> {
  return {
    guard: Math.max(0, getRequestNeed(request, "guard") - assigned.counts.guard),
    ranger: Math.max(0, getRequestNeed(request, "ranger") - assigned.counts.ranger),
    healer: Math.max(0, getRequestNeed(request, "healer") - assigned.counts.healer)
  };
}

/**
 * Build spawn intents for helper-room reinforcements without mutating Game or Memory.
 */
export function planDefenseReinforcementSpawns(input: DefenseReinforcementPlanInput): DefenseReinforcementIntent[] {
  const maxNewSpawnsPerHelperRoom = input.maxNewSpawnsPerHelperRoom ?? DEFAULT_MAX_NEW_SPAWNS_PER_HELPER_ROOM;
  const intents: DefenseReinforcementIntent[] = [];
  const plannedByHelper = new Map<string, number>();
  const requests = [...input.cluster.defenseRequests].sort((a, b) => {
    if (a.urgency !== b.urgency) return b.urgency - a.urgency;
    return a.createdAt - b.createdAt;
  });

  for (const request of requests) {
    const helpers = getHelperCandidates(input.cluster, input.rooms, request.roomName);
    if (helpers.length === 0) continue;

    const threatProfile = input.targetThreats?.[request.roomName];
    const assigned = getAssignedDefenseAssistForTarget(input, request.roomName);
    const bestHelperEnergy = Math.max(...helpers.map(helper => helper.energyCapacityAvailable));
    const aggregatePlan = calculateAggregateDefenseResponsePlan(
      bestHelperEnergy,
      threatProfile,
      getRemainingRequestNeeds(request, assigned),
      assigned.power
    );
    const plannedSquadSize = Math.max(1, aggregatePlan.counts.guard + aggregatePlan.counts.ranger + aggregatePlan.counts.healer);

    for (const role of ["guard", "ranger", "healer"] as const) {
      const needed = aggregatePlan.counts[role];
      const rankedHelpers = rankHelpersForRole(helpers, role, request.roomName, threatProfile);

      for (let i = 0; i < needed; i++) {
        const helper = rankedHelpers.find(candidate => {
          const planned = plannedByHelper.get(candidate.roomName) ?? 0;
          return planned < maxNewSpawnsPerHelperRoom;
        });

        if (!helper) break;

        plannedByHelper.set(helper.roomName, (plannedByHelper.get(helper.roomName) ?? 0) + 1);
        intents.push({
          id: `assist_${role}_${request.roomName}_${helper.roomName}_${input.now}_${i}`,
          roomName: helper.roomName,
          role,
          family: "military",
          priority: getPriority(request.urgency),
          targetRoom: request.roomName,
          additionalMemory: {
            assistTarget: request.roomName,
            targetRoom: request.roomName,
            task: DEFENSE_ASSIST_TASK,
            defenseSquadId: createDefenseAssistSquadId(helper.roomName, request.roomName, input.now),
            defenseSquadSize: plannedSquadSize,
            defenseSquadCreatedAt: input.now
          },
          threatProfile
        });
      }
    }
  }

  return intents;
}

function isDefenseReinforcementRole(role: CreepRole | string): role is DefenseReinforcementRole {
  return role === "guard" || role === "ranger" || role === "healer";
}

function getPendingAssistSpawns(roomName: string, queue: SpawnQueueForReinforcements): PendingDefenseAssistSpawn[] {
  return queue
    .getPendingRequests(roomName)
    .filter((request: SpawnRequest) => isDefenseReinforcementRole(request.role))
    .map((request: SpawnRequest) => ({
      role: request.role as DefenseReinforcementRole,
      targetRoom: request.additionalMemory?.assistTarget ?? request.targetRoom ?? "",
      power: calculateCombatPower(request.body.parts)
    }))
    .filter((pending: PendingDefenseAssistSpawn) => pending.targetRoom.length > 0);
}

function getDefenseAssistTarget(memory: Partial<SwarmCreepMemory>): string | undefined {
  return memory.assistTarget ?? (memory.task === DEFENSE_ASSIST_TASK ? memory.targetRoom : undefined);
}

function getActiveAssignedDefenseAssist(targetRoom: string): AssignedDefenseAssistPower {
  const assigned = createEmptyAssignedDefenseAssistPower();
  for (const creep of Object.values(Game.creeps ?? {})) {
    const memory = creep.memory as unknown as Partial<SwarmCreepMemory>;
    const role = memory.role ?? "";
    if (!isDefenseReinforcementRole(role) || getDefenseAssistTarget(memory) !== targetRoom || creep.spawning) continue;
    addAssignedDefenseAssistPower(assigned, role, creep.body.filter(part => part.hits > 0));
  }
  return assigned;
}

function buildRoomState(
  roomName: string,
  targetRooms: string[],
  queue: SpawnQueueForReinforcements
): DefenseReinforcementRoomState | undefined {
  const room = Game.rooms[roomName];
  if (!room) return undefined;

  const distances: Record<string, number> = {};
  for (const targetRoom of targetRooms) {
    distances[targetRoom] = Game.map.getRoomLinearDistance(roomName, targetRoom);
  }

  const spawns = room.find(FIND_MY_SPAWNS);
  return {
    roomName,
    owned: Boolean(room.controller?.my),
    safe: getActualHostileCreeps(room).length === 0,
    availableSpawns: spawns.filter(spawn => !spawn.spawning).length,
    energyCapacityAvailable: room.energyCapacityAvailable,
    distances,
    pendingAssist: getPendingAssistSpawns(roomName, queue)
  };
}

/**
 * Build an affordable reinforcement body. If a target-room threat is visible,
 * choose a body that is both larger and stronger than the strongest attacker
 * when the helper room's energy capacity can afford it.
 */
export function buildDefenseReinforcementBody(
  role: DefenseReinforcementRole,
  energyCapacity: number,
  threatProfile?: DefenseAssistThreatProfile | null
): BodyTemplate | null {
  return buildDefenseAssistBody(role, energyCapacity, threatProfile);
}

function addReinforcementRequest(intent: DefenseReinforcementIntent, queue: SpawnQueueForReinforcements): boolean {
  const room = Game.rooms[intent.roomName];
  if (!room) return false;

  try {
    const body = buildDefenseReinforcementBody(intent.role, room.energyCapacityAvailable, intent.threatProfile);
    if (!body) return false;

    const request: SpawnRequest = {
      id: intent.id,
      roomName: intent.roomName,
      role: intent.role,
      family: intent.family,
      body,
      priority: intent.priority,
      targetRoom: intent.targetRoom,
      createdAt: Game.time,
      additionalMemory: intent.additionalMemory
    };

    queue.addRequest(request);
    return true;
  } catch (error) {
    logger.error(`Failed to queue ${intent.role} reinforcement from ${intent.roomName} to ${intent.targetRoom}: ${error}`, {
      subsystem: "Cluster"
    });
    return false;
  }
}

/**
 * Queue helper-room defensive reinforcements for unresolved cluster defense requests.
 */
export function queueDefenseReinforcementSpawns(cluster: ClusterMemory, queue: SpawnQueueForReinforcements): number {
  if (cluster.defenseRequests.length === 0) return 0;

  const targetRooms = Array.from(new Set(cluster.defenseRequests.map(request => request.roomName)));
  const rooms: Record<string, DefenseReinforcementRoomState | undefined> = {};
  const targetThreats: Record<string, DefenseAssistThreatProfile | null> = {};
  const targetAssigned: Record<string, AssignedDefenseAssistPower> = {};
  for (const targetRoom of targetRooms) {
    targetThreats[targetRoom] = getVisibleDefenseAssistThreatProfile(targetRoom);
    targetAssigned[targetRoom] = getActiveAssignedDefenseAssist(targetRoom);
  }
  for (const roomName of cluster.memberRooms) {
    rooms[roomName] = buildRoomState(roomName, targetRooms, queue);
  }

  const intents = planDefenseReinforcementSpawns({ cluster, rooms, now: Game.time, targetThreats, targetAssigned });
  let queued = 0;

  for (const intent of intents) {
    if (addReinforcementRequest(intent, queue)) {
      queued++;
    }
  }

  if (queued > 0) {
    logger.warn(`Queued ${queued} defense reinforcement spawn(s) for cluster ${cluster.id}`, { subsystem: "Cluster" });
  }

  return queued;
}
