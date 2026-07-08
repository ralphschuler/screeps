/**
 * Defense-assist demand selection.
 *
 * Helper rooms answer active cluster defense requests without changing local
 * tower/targeting policy. The rules here account for existing creep and queued
 * combat power before emitting one spawn assignment for the requested role.
 */
import {
  addCombatPower,
  buildDefenseAssistBody,
  calculateAggregateDefenseResponsePlan,
  calculateCombatPower,
  calculateDefenseAssistSquadSize,
  createDefenseAssistSquadId,
  DEFENSE_ASSIST_TASK,
  getActualHostileCreeps,
  getVisibleDefenseAssistThreatProfile,
  isDefenseAssistMilitaryRole,
  type DefenseAggregateResponsePlan,
  type DefenseAssistRole,
  type DefenseAssistThreatProfile,
  type ExistingDefensePower
} from "@ralphschuler/screeps-defense";
import type { SwarmCreepMemory } from "@ralphschuler/screeps-memory";
import { getAffordableEmergencyDefenseAssistBody } from "../emergencyDefenseBody";
import { getEffectiveRoomEnergyAvailable } from "../roomEnergy";
import { spawnQueue, SpawnPriority, type SpawnRequest } from "../spawnQueue";
import {
  hasCurrentDefenseThreat,
  readDefenseAssistRequests,
  type DefenseAssistRequestMemory
} from "./defenseAssistRequests";

const DEFENSE_ASSIST_WAVE_TTL = 1200;
const DEFENSE_ASSIST_ROLES = ["guard", "ranger", "healer"] as const;

export interface DefenseAssistSpawnAssignment {
  targetRoom: string;
  task: "defenseAssist";
  priority: SpawnPriority;
  defenseSquadId: string;
  defenseSquadSize: number;
  defenseSquadCreatedAt: number;
}

interface DefenseAssistWaveState {
  /** Stable wave start tick shared across refreshing requests for this home+target pair */
  createdAt: number;
  /** Last tick the wave was referenced while building spawn demand */
  seenAt: number;
}

interface DefenseAssistSpawnMemory {
  defenseAssistWaves?: Record<string, DefenseAssistWaveState>;
}

function getDefenseAssistWaveState(): Record<string, DefenseAssistWaveState> {
  const memory = Memory as unknown as DefenseAssistSpawnMemory;
  return memory.defenseAssistWaves ??= {};
}

function getDefenseAssistWaveKey(homeRoom: string, targetRoom: string): string {
  return `${homeRoom}:${targetRoom}`;
}

function pruneExpiredDefenseAssistWaves(now: number): void {
  const memory = Memory as unknown as DefenseAssistSpawnMemory;
  const states = memory.defenseAssistWaves;
  if (!states) return;

  for (const [key, state] of Object.entries(states)) {
    if (now - state.seenAt > DEFENSE_ASSIST_WAVE_TTL) {
      delete states[key];
    }
  }

  if (Object.keys(states).length === 0) delete memory.defenseAssistWaves;
}

function getDefenseAssistWave(homeRoom: string, request: DefenseAssistRequestMemory): DefenseAssistWaveState {
  const states = getDefenseAssistWaveState();
  const key = getDefenseAssistWaveKey(homeRoom, request.roomName);
  const now = Game.time;
  const requestedAt =
    typeof request.createdAt === "number" && Number.isFinite(request.createdAt)
      ? request.createdAt
      : now;
  const existing = states[key];
  if (existing && now - existing.seenAt <= DEFENSE_ASSIST_WAVE_TTL) {
    existing.seenAt = now;
    return existing;
  }

  const wave = { createdAt: requestedAt, seenAt: now };
  states[key] = wave;
  return wave;
}

function getDefenseRoleNeed(request: DefenseAssistRequestMemory, role: string): number {
  if (role === "guard") return Math.max(0, request.guardsNeeded ?? 0);
  if (role === "ranger") return Math.max(0, request.rangersNeeded ?? 0);
  if (role === "healer") return Math.max(0, request.healersNeeded ?? 0);
  return 0;
}

type DefenseAssistRoleCounts = Record<DefenseAssistRole, number>;

type DefenseAssistBody = ReturnType<typeof buildDefenseAssistBody>;

interface DefenseAssistRequestMemoryOwner {
  defenseRequests?: DefenseAssistRequestMemory[] | Record<string, DefenseAssistRequestMemory>;
}

interface DefenseAssistThreatCacheEntry {
  room: Room | undefined;
  threatProfile: DefenseAssistThreatProfile | null;
}

interface DefenseAssistAssignmentAccounting {
  counts: DefenseAssistRoleCounts;
  power: ExistingDefensePower;
}

interface DefenseAssistHelperTargetPlan {
  helperEnergyCapacity: number;
  threatProfile: DefenseAssistThreatProfile | null;
  assignedCounts: DefenseAssistRoleCounts;
  assignedPower: ExistingDefensePower;
  aggregatePlan: DefenseAggregateResponsePlan;
  capableHelpers: DefenseAssistRoleCounts;
  helperBodies: Partial<Record<DefenseAssistRole, DefenseAssistBody>>;
}

interface ActiveDefenseAssistRequestsCacheEntry {
  signature: string;
  requests: DefenseAssistRequestMemory[];
}

interface DefenseAssistPlanningCache {
  game: typeof Game;
  creeps: typeof Game.creeps;
  tick: number;
  queueRevision: number;
  threats: Map<string, DefenseAssistThreatCacheEntry>;
  assigned: Map<string, DefenseAssistAssignmentAccounting>;
  helperPlans: Map<string, DefenseAssistHelperTargetPlan>;
  capableHelpers: Map<string, DefenseAssistRoleCounts>;
  canSpawn: Map<string, { room: Room | undefined; value: boolean }>;
  activeRequests?: ActiveDefenseAssistRequestsCacheEntry;
}

let defenseAssistPlanningCache: DefenseAssistPlanningCache | null = null;

function createRoleCounts(): DefenseAssistRoleCounts {
  return { guard: 0, ranger: 0, healer: 0 };
}

function getDefenseAssistPlanningCache(): DefenseAssistPlanningCache {
  const queueRevision = spawnQueue.getRevision();
  if (
    defenseAssistPlanningCache &&
    defenseAssistPlanningCache.game === Game &&
    defenseAssistPlanningCache.creeps === Game.creeps &&
    defenseAssistPlanningCache.tick === Game.time &&
    defenseAssistPlanningCache.queueRevision === queueRevision
  ) {
    return defenseAssistPlanningCache;
  }

  defenseAssistPlanningCache = {
    game: Game,
    creeps: Game.creeps,
    tick: Game.time,
    queueRevision,
    threats: new Map(),
    assigned: new Map(),
    helperPlans: new Map(),
    capableHelpers: new Map(),
    canSpawn: new Map()
  };
  return defenseAssistPlanningCache;
}

function getCachedDefenseAssistThreatProfile(targetRoom: string): DefenseAssistThreatProfile | null {
  const cache = getDefenseAssistPlanningCache();
  const room = Game.rooms[targetRoom];
  const cached = cache.threats.get(targetRoom);
  if (cached && cached.room === room) return cached.threatProfile;

  const threatProfile = getVisibleDefenseAssistThreatProfile(targetRoom);
  cache.threats.set(targetRoom, { room, threatProfile });
  return threatProfile;
}

function hasCachedCurrentDefenseThreat(request: DefenseAssistRequestMemory): boolean {
  if (Game.rooms[request.roomName]) return getCachedDefenseAssistThreatProfile(request.roomName) !== null;
  return hasCurrentDefenseThreat(request);
}

function getDefenseAssistRequestSignature(requests: DefenseAssistRequestMemory[]): string {
  return requests
    .map(request => [
      request.roomName,
      Math.max(0, request.guardsNeeded ?? 0),
      Math.max(0, request.rangersNeeded ?? 0),
      Math.max(0, request.healersNeeded ?? 0),
      request.urgency ?? "",
      request.createdAt ?? ""
    ].join(":"))
    .join("|");
}

function getCachedActiveDefenseAssistRequests(
  memory: DefenseAssistRequestMemoryOwner,
  options: { prune?: boolean } = {}
): DefenseAssistRequestMemory[] {
  const requests = readDefenseAssistRequests(memory);
  const signature = getDefenseAssistRequestSignature(requests);
  const cache = getDefenseAssistPlanningCache();
  if (cache.activeRequests?.signature === signature) {
    if (options.prune && Array.isArray(memory.defenseRequests) && cache.activeRequests.requests.length !== requests.length) {
      memory.defenseRequests = cache.activeRequests.requests;
    }
    return cache.activeRequests.requests;
  }

  const activeRequests = requests.filter(hasCachedCurrentDefenseThreat);
  cache.activeRequests = { signature, requests: activeRequests };
  if (options.prune && Array.isArray(memory.defenseRequests) && activeRequests.length !== requests.length) {
    memory.defenseRequests = activeRequests;
  }
  return activeRequests;
}

function isDefenseAssistRole(role: string): boolean {
  return isDefenseAssistMilitaryRole(role);
}

function getAssistTarget(memory: Partial<SwarmCreepMemory>): string | undefined {
  return memory.assistTarget ?? (memory.task === DEFENSE_ASSIST_TASK ? memory.targetRoom : undefined);
}

function spawnRequestTargetsDefenseAssistRoom(request: SpawnRequest, targetRoom: string): boolean {
  return request.additionalMemory?.assistTarget === targetRoom ||
    (request.additionalMemory?.task === DEFENSE_ASSIST_TASK && request.targetRoom === targetRoom);
}

function addAssignedPower(power: ExistingDefensePower, role: DefenseAssistRole, parts: Array<BodyPartConstant | BodyPartDefinition>): void {
  const bodyPower = calculateCombatPower(parts);
  const existing = power[role];
  power[role] = existing ? addCombatPower(existing, bodyPower) : bodyPower;
}

function buildAssignedDefenseAssistAccounting(targetRoom: string): DefenseAssistAssignmentAccounting {
  const counts = createRoleCounts();
  const power: ExistingDefensePower = {};

  for (const creep of Object.values(Game.creeps)) {
    const memory = creep.memory as unknown as Partial<SwarmCreepMemory>;
    const role = memory.role ?? "";
    if (!isDefenseAssistMilitaryRole(role) || getAssistTarget(memory) !== targetRoom) continue;

    counts[role]++;
    const activeBody = (creep.body ?? []).filter(part => part.hits > 0);
    if (activeBody.length > 0) addAssignedPower(power, role, activeBody);
  }

  for (const roomName in Game.rooms) {
    for (const request of spawnQueue.getPendingRequests(roomName)) {
      if (!isDefenseAssistMilitaryRole(request.role) || !spawnRequestTargetsDefenseAssistRoom(request, targetRoom)) continue;
      counts[request.role]++;
      addAssignedPower(power, request.role, request.body.parts);
    }
  }

  return { counts, power };
}

function getAssignedDefenseAssistAccounting(targetRoom: string): DefenseAssistAssignmentAccounting {
  const cache = getDefenseAssistPlanningCache();
  const cached = cache.assigned.get(targetRoom);
  if (cached) return cached;

  const accounting = buildAssignedDefenseAssistAccounting(targetRoom);
  cache.assigned.set(targetRoom, accounting);
  return accounting;
}

function countAssignedDefenseAssist(targetRoom: string, role: string): number {
  if (!isDefenseAssistMilitaryRole(role)) return 0;
  return getAssignedDefenseAssistAccounting(targetRoom).counts[role];
}

function canSpawnDefenseAssistFromCached(room: Room): boolean {
  const cache = getDefenseAssistPlanningCache();
  const cached = cache.canSpawn.get(room.name);
  if (cached && cached.room === room) return cached.value;

  const value = canSpawnDefenseAssistFrom(room);
  cache.canSpawn.set(room.name, { room, value });
  return value;
}

function getCapableDefenseAssistHelpers(
  targetRoom: string,
  threatProfile: DefenseAssistThreatProfile | null
): DefenseAssistRoleCounts {
  const cache = getDefenseAssistPlanningCache();
  const cached = cache.capableHelpers.get(targetRoom);
  if (cached) return cached;

  const counts = createRoleCounts();
  for (const room of Object.values(Game.rooms)) {
    if (room.name === targetRoom) continue;
    if (!canSpawnDefenseAssistFromCached(room)) continue;
    for (const role of DEFENSE_ASSIST_ROLES) {
      if (buildDefenseAssistBody(role, room.energyCapacityAvailable, threatProfile)) counts[role]++;
    }
  }

  cache.capableHelpers.set(targetRoom, counts);
  return counts;
}

function getBaseNeedsAfterAssignments(
  request: DefenseAssistRequestMemory,
  assignedCounts: DefenseAssistRoleCounts
): Partial<Record<DefenseAssistRole, number>> {
  return {
    guard: Math.max(0, getDefenseRoleNeed(request, "guard") - assignedCounts.guard),
    ranger: Math.max(0, getDefenseRoleNeed(request, "ranger") - assignedCounts.ranger),
    healer: Math.max(0, getDefenseRoleNeed(request, "healer") - assignedCounts.healer)
  };
}

function getDefenseAssistHelperPlanKey(request: DefenseAssistRequestMemory, helperRoom: Room): string {
  return [
    helperRoom.name,
    request.roomName,
    helperRoom.energyCapacityAvailable,
    Math.max(0, request.guardsNeeded ?? 0),
    Math.max(0, request.rangersNeeded ?? 0),
    Math.max(0, request.healersNeeded ?? 0),
    request.urgency ?? "",
    request.createdAt ?? ""
  ].join(":");
}

function getDefenseAssistHelperTargetPlan(
  request: DefenseAssistRequestMemory,
  helperRoom: Room
): DefenseAssistHelperTargetPlan {
  const cache = getDefenseAssistPlanningCache();
  const key = getDefenseAssistHelperPlanKey(request, helperRoom);
  const cached = cache.helperPlans.get(key);
  if (cached) return cached;

  const threatProfile = getCachedDefenseAssistThreatProfile(request.roomName);
  const { counts: assignedCounts, power: assignedPower } = getAssignedDefenseAssistAccounting(request.roomName);
  const helperEnergyCapacity = helperRoom.energyCapacityAvailable;
  const aggregatePlan = calculateAggregateDefenseResponsePlan(
    helperEnergyCapacity,
    threatProfile,
    getBaseNeedsAfterAssignments(request, assignedCounts),
    assignedPower
  );
  const capableHelpers = getCapableDefenseAssistHelpers(request.roomName, threatProfile);
  const helperBodies: Partial<Record<DefenseAssistRole, DefenseAssistBody>> = {};
  for (const role of DEFENSE_ASSIST_ROLES) {
    helperBodies[role] = buildDefenseAssistBody(role, helperEnergyCapacity, threatProfile);
  }

  const plan = {
    helperEnergyCapacity,
    threatProfile,
    assignedCounts,
    assignedPower,
    aggregatePlan,
    capableHelpers,
    helperBodies
  };
  cache.helperPlans.set(key, plan);
  return plan;
}

function getDefenseRoleNeedForHelper(
  request: DefenseAssistRequestMemory,
  role: string,
  plan: DefenseAssistHelperTargetPlan
): number {
  const requestedNeed = getDefenseRoleNeed(request, role);
  if (!isDefenseAssistMilitaryRole(role)) return requestedNeed;
  if (!plan.threatProfile) return requestedNeed;

  const assigned = plan.assignedCounts[role];
  const aggregateNeed = assigned + plan.aggregatePlan.counts[role];
  const squadNeed = requestedNeed > 0 ? calculateDefenseAssistSquadSize(role, plan.helperEnergyCapacity, plan.threatProfile) : 0;
  const helperWaveNeed = requestedNeed > 0 ? plan.capableHelpers[role] : 0;
  return Math.max(requestedNeed, aggregateNeed, squadNeed, helperWaveNeed);
}

function getDefenseAssistSquadSizeForHelper(
  request: DefenseAssistRequestMemory,
  helperRoom: Room,
  plan = getDefenseAssistHelperTargetPlan(request, helperRoom)
): number {
  const aggregateSize = plan.aggregatePlan.counts.guard + plan.aggregatePlan.counts.ranger + plan.aggregatePlan.counts.healer;
  if (aggregateSize > 0) return aggregateSize;

  const localWaveRoles = DEFENSE_ASSIST_ROLES.filter(role => {
    if (getDefenseRoleNeedForHelper(request, role, plan) <= 0) return false;
    return Boolean(plan.helperBodies[role]);
  });
  return Math.max(1, localWaveRoles.length);
}

function canSpawnDefenseAssistFrom(room: Room): boolean {
  if (!room.controller?.my) return false;
  if (room.find(FIND_MY_SPAWNS).length === 0) return false;
  return getActualHostileCreeps(room).length === 0;
}

function createDefenseAssistSpawnAssignment(
  homeRoom: string,
  home: Room,
  request: DefenseAssistRequestMemory,
  plan = getDefenseAssistHelperTargetPlan(request, home)
): DefenseAssistSpawnAssignment {
  const wave = getDefenseAssistWave(homeRoom, request);
  return {
    targetRoom: request.roomName,
    task: DEFENSE_ASSIST_TASK,
    priority: (request.urgency ?? 1) >= 2 ? SpawnPriority.EMERGENCY : SpawnPriority.HIGH,
    defenseSquadId: createDefenseAssistSquadId(homeRoom, request.roomName, wave.createdAt),
    defenseSquadSize: getDefenseAssistSquadSizeForHelper(request, home, plan),
    defenseSquadCreatedAt: wave.createdAt
  };
}

function getAffordableEmergencyAssistFallbackNeed(
  request: DefenseAssistRequestMemory,
  role: string,
  helperRoom: Room,
  threatProfile: DefenseAssistThreatProfile | null
): number {
  if (role !== "guard") return 0;
  if ((request.urgency ?? 1) < 2) return 0;
  if (!threatProfile) return 0;

  const availableEnergy = getEffectiveRoomEnergyAvailable(helperRoom);
  return getAffordableEmergencyDefenseAssistBody("guard", availableEnergy, threatProfile) ? 1 : 0;
}

/**
 * Select the next helper-room military spawn for an active global defense request.
 *
 * This module hides quorum sizing, assigned-power accounting, stale request
 * pruning, and helper eligibility behind one pure demand function so the spawn
 * analyzer can stay focused on role demand orchestration.
 */
export function getDefenseAssistSpawnAssignment(homeRoom: string, role: string): DefenseAssistSpawnAssignment | null {
  if (!isDefenseAssistRole(role)) return null;

  const home = Game.rooms[homeRoom];
  if (!home || !canSpawnDefenseAssistFromCached(home)) return null;

  const memory = Memory as unknown as DefenseAssistRequestMemoryOwner;
  pruneExpiredDefenseAssistWaves(Game.time);
  const candidates = getCachedActiveDefenseAssistRequests(memory, { prune: true })
    .filter(request => request.roomName !== homeRoom)
    .map(request => {
      const plan = getDefenseAssistHelperTargetPlan(request, home);
      return {
        request,
        plan,
        helperNeed: Math.max(
          getDefenseRoleNeedForHelper(request, role, plan),
          getAffordableEmergencyAssistFallbackNeed(request, role, home, plan.threatProfile)
        )
      };
    })
    .filter(candidate => candidate.helperNeed > 0)
    .filter(candidate => countAssignedDefenseAssist(candidate.request.roomName, role) < candidate.helperNeed)
    .sort((a, b) => {
      const urgencyDelta = (b.request.urgency ?? 1) - (a.request.urgency ?? 1);
      if (urgencyDelta !== 0) return urgencyDelta;
      const distanceA = Game.map?.getRoomLinearDistance?.(homeRoom, a.request.roomName) ?? 999;
      const distanceB = Game.map?.getRoomLinearDistance?.(homeRoom, b.request.roomName) ?? 999;
      if (distanceA !== distanceB) return distanceA - distanceB;
      return (a.request.createdAt ?? 0) - (b.request.createdAt ?? 0);
    });

  const candidate = candidates[0];
  if (!candidate) return null;

  return createDefenseAssistSpawnAssignment(homeRoom, home, candidate.request, candidate.plan);
}
