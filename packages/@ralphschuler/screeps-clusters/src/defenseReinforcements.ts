import { logger } from "@ralphschuler/screeps-core";
import { getActualHostileCreeps } from "@ralphschuler/screeps-defense";
import type { CreepRole, SwarmCreepMemory } from "@ralphschuler/screeps-memory";
import type { BodyTemplate, DefenseAssistThreatProfile, SpawnRequest } from "@ralphschuler/screeps-spawn";
import type { ClusterMemory, DefenseAssistanceRequest } from "./types";

export type DefenseReinforcementRole = "guard" | "ranger" | "healer";

export const DefenseReinforcementPriority = {
  HIGH: 500,
  EMERGENCY: 1000
} as const;

export interface PendingDefenseAssistSpawn {
  role: DefenseReinforcementRole;
  targetRoom: string;
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

export interface DefenseReinforcementPlanInput {
  cluster: ClusterMemory;
  rooms: Record<string, DefenseReinforcementRoomState | undefined>;
  now: number;
  maxNewSpawnsPerHelperRoom?: number;
  targetThreats?: Record<string, DefenseAssistThreatProfile | null | undefined>;
}

export interface SpawnQueueForReinforcements {
  getPendingRequests(roomName: string): SpawnRequest[];
  addRequest(request: SpawnRequest): void;
}

const DEFENSE_ASSIST_TASK = "defenseAssist";
const DEFAULT_MAX_NEW_SPAWNS_PER_HELPER_ROOM = 2;
const DISTANT_ROOM_PENALTY = 50;
const MAX_BODY_PARTS = 50;
const MAX_DEFENSE_ASSIST_SQUAD_SIZE = 8;
const PART_SIZE_SCORE = 2;

function calculateBodyCost(parts: BodyPartConstant[]): number {
  const costs: Record<BodyPartConstant, number> = {
    [MOVE]: 50,
    [WORK]: 100,
    [CARRY]: 50,
    [ATTACK]: 80,
    [RANGED_ATTACK]: 150,
    [HEAL]: 250,
    [CLAIM]: 600,
    [TOUGH]: 10
  };
  return parts.reduce((sum, part) => sum + costs[part], 0);
}

function makeBody(parts: BodyPartConstant[]): BodyTemplate | null {
  if (parts.length === 0 || parts.length > MAX_BODY_PARTS || !parts.includes(MOVE)) return null;
  const cost = calculateBodyCost(parts);
  return { parts, cost, minCapacity: cost };
}

function orderedBody(counts: Partial<Record<BodyPartConstant, number>>): BodyPartConstant[] {
  const parts: BodyPartConstant[] = [];
  for (const part of [TOUGH, WORK, ATTACK, RANGED_ATTACK, HEAL, MOVE] as const) {
    for (let i = 0; i < (counts[part] ?? 0); i++) parts.push(part);
  }
  return parts;
}

function addBodyCandidate(candidates: BodyTemplate[], parts: BodyPartConstant[], energyCapacity: number): void {
  const body = makeBody(parts);
  if (!body || body.cost > energyCapacity) return;
  const key = body.parts.join(",");
  if (!candidates.some(candidate => candidate.parts.join(",") === key)) candidates.push(body);
}

function calculateCombatScore(parts: Array<BodyPartConstant | BodyPartDefinition>): {
  partCount: number;
  attack: number;
  ranged: number;
  heal: number;
  dismantle: number;
  score: number;
} {
  let attack = 0;
  let ranged = 0;
  let heal = 0;
  let dismantle = 0;
  for (const part of parts) {
    const type = typeof part === "string" ? part : part.type;
    if (type === ATTACK) attack += 30;
    if (type === RANGED_ATTACK) ranged += 10;
    if (type === HEAL) heal += 12;
    if (type === WORK) dismantle += 50;
  }
  return { partCount: parts.length, attack, ranged, heal, dismantle, score: attack + ranged + heal + dismantle + parts.length * PART_SIZE_SCORE };
}

function getVisibleDefenseAssistThreatProfile(targetRoom: string): DefenseAssistThreatProfile | null {
  const room = Game.rooms[targetRoom];
  if (!room) return null;
  const hostiles = getActualHostileCreeps(room);
  if (hostiles.length === 0) return null;

  let strongest: DefenseAssistThreatProfile["strongest"] = null;
  const total = { partCount: 0, attack: 0, ranged: 0, heal: 0, dismantle: 0, score: 0 };
  for (const hostile of hostiles) {
    const power = calculateCombatScore(hostile.body);
    total.partCount += power.partCount;
    total.attack += power.attack;
    total.ranged += power.ranged;
    total.heal += power.heal;
    total.dismantle += power.dismantle;
    total.score += power.score;
    if (!strongest || power.score > strongest.score) strongest = power;
  }

  return { hostileCount: hostiles.length, strongest, total };
}

function isDefenseAssistBodyStrongerThanThreat(
  parts: BodyPartConstant[],
  threat: DefenseAssistThreatProfile["strongest"] | undefined
): boolean {
  if (!threat || threat.score <= 0) return true;
  const power = calculateCombatScore(parts);
  return power.partCount > threat.partCount && power.score > threat.score;
}

function generateDefenseAssistBodies(role: DefenseReinforcementRole, energyCapacity: number): BodyTemplate[] {
  const candidates: BodyTemplate[] = [];
  for (let parts = 1; parts <= 25; parts++) {
    if (role === "guard") {
      addBodyCandidate(candidates, orderedBody({ [ATTACK]: parts, [MOVE]: parts }), energyCapacity);
      addBodyCandidate(candidates, orderedBody({ [TOUGH]: parts, [ATTACK]: parts, [MOVE]: parts }), energyCapacity);
    } else if (role === "ranger") {
      addBodyCandidate(candidates, orderedBody({ [RANGED_ATTACK]: parts, [MOVE]: parts }), energyCapacity);
      addBodyCandidate(candidates, orderedBody({ [TOUGH]: Math.ceil(parts / 2), [RANGED_ATTACK]: parts, [MOVE]: parts }), energyCapacity);
    } else {
      addBodyCandidate(candidates, orderedBody({ [HEAL]: parts, [MOVE]: parts }), energyCapacity);
      addBodyCandidate(candidates, orderedBody({ [TOUGH]: Math.ceil(parts / 2), [HEAL]: parts, [MOVE]: parts }), energyCapacity);
    }
  }
  return candidates;
}

function compareByPowerThenCost(a: BodyTemplate, b: BodyTemplate): number {
  const powerDelta = calculateCombatScore(b.parts).score - calculateCombatScore(a.parts).score;
  if (powerDelta !== 0) return powerDelta;
  return b.cost - a.cost;
}

function buildDefenseAssistBody(
  role: DefenseReinforcementRole,
  energyCapacity: number,
  threatProfile?: DefenseAssistThreatProfile | null
): BodyTemplate | null {
  const candidates = generateDefenseAssistBodies(role, energyCapacity);
  if (candidates.length === 0) return null;

  const threat = threatProfile?.strongest;
  if (threat?.score) {
    const outmatching = candidates
      .filter(candidate => isDefenseAssistBodyStrongerThanThreat(candidate.parts, threat))
      .sort((a, b) => a.cost - b.cost || compareByPowerThenCost(a, b));
    if (outmatching.length > 0) return outmatching[0]!;
  }

  return [...candidates].sort(compareByPowerThenCost)[0] ?? null;
}

function calculateDefenseAssistSquadSize(
  role: DefenseReinforcementRole,
  energyCapacity: number,
  threatProfile?: DefenseAssistThreatProfile | null
): number {
  const body = buildDefenseAssistBody(role, energyCapacity, null);
  const threat = threatProfile?.strongest;
  if (!body) return 0;
  if (!threat || isDefenseAssistBodyStrongerThanThreat(body.parts, threat)) return 1;

  const bodyPower = calculateCombatScore(body.parts);
  const powerSquadSize = Math.ceil((threat.score + 1) / Math.max(1, bodyPower.score));
  const sizeSquadSize = Math.ceil((threat.partCount + 1) / Math.max(1, bodyPower.partCount));
  return Math.min(MAX_DEFENSE_ASSIST_SQUAD_SIZE, Math.max(2, powerSquadSize, sizeSquadSize));
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

function getPendingCount(
  rooms: Record<string, DefenseReinforcementRoomState | undefined>,
  targetRoom: string,
  role: DefenseReinforcementRole
): number {
  let count = 0;
  for (const room of Object.values(rooms)) {
    if (!room?.pendingAssist) continue;
    count += room.pendingAssist.filter(pending => pending.role === role && pending.targetRoom === targetRoom).length;
  }
  return count;
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
  return Boolean(body && isDefenseAssistBodyStrongerThanThreat(body.parts, threatProfile?.strongest));
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

function getRequestedSquadSize(
  request: DefenseAssistanceRequest,
  role: DefenseReinforcementRole,
  helpers: DefenseReinforcementRoomState[],
  threatProfile: DefenseAssistThreatProfile | null | undefined
): number {
  const requestedNeed = getRequestNeed(request, role);
  if (requestedNeed <= 0) return 0;
  const bestHelperEnergy = Math.max(...helpers.map(helper => helper.energyCapacityAvailable));
  return Math.max(requestedNeed, calculateDefenseAssistSquadSize(role, bestHelperEnergy, threatProfile));
}

function createDefenseSquadId(helperRoom: string, targetRoom: string, now: number): string {
  return `defenseAssist:${helperRoom}:${targetRoom}:${now}`;
}

function getLocalWaveSize(
  request: DefenseAssistanceRequest,
  helper: DefenseReinforcementRoomState,
  threatProfile: DefenseAssistThreatProfile | null | undefined
): number {
  const roles = (["guard", "ranger", "healer"] as const).filter(role => {
    if (getRequestNeed(request, role) <= 0) return false;
    return Boolean(buildDefenseAssistBody(role, helper.energyCapacityAvailable, threatProfile));
  });
  return Math.max(1, Math.min(DEFAULT_MAX_NEW_SPAWNS_PER_HELPER_ROOM, roles.length));
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

    for (const role of ["guard", "ranger", "healer"] as const) {
      const pendingCount = getPendingCount(input.rooms, request.roomName, role);
      const needed = Math.max(0, getRequestedSquadSize(request, role, helpers, threatProfile) - pendingCount);
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
            defenseSquadId: createDefenseSquadId(helper.roomName, request.roomName, input.now),
            defenseSquadSize: getLocalWaveSize(request, helper, threatProfile),
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
      targetRoom: request.additionalMemory?.assistTarget ?? request.targetRoom ?? ""
    }))
    .filter((pending: PendingDefenseAssistSpawn) => pending.targetRoom.length > 0);
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
  for (const targetRoom of targetRooms) {
    targetThreats[targetRoom] = getVisibleDefenseAssistThreatProfile(targetRoom);
  }
  for (const roomName of cluster.memberRooms) {
    rooms[roomName] = buildRoomState(roomName, targetRooms, queue);
  }

  const intents = planDefenseReinforcementSpawns({ cluster, rooms, now: Game.time, targetThreats });
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
