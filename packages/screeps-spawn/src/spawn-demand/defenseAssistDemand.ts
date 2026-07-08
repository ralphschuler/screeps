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
  type DefenseAssistRole,
  type ExistingDefensePower
} from "@ralphschuler/screeps-defense";
import type { SwarmCreepMemory } from "@ralphschuler/screeps-memory";
import { getAffordableEmergencyDefenseAssistBody } from "../emergencyDefenseBody";
import { getEffectiveRoomEnergyAvailable } from "../roomEnergy";
import { spawnQueue, SpawnPriority } from "../spawnQueue";
import {
  getActiveDefenseAssistRequests,
  hasCurrentDefenseThreat,
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

function getDefenseRoleNeedForHelper(
  request: DefenseAssistRequestMemory,
  role: string,
  helperEnergyCapacity: number,
  threatProfile = getVisibleDefenseAssistThreatProfile(request.roomName)
): number {
  const requestedNeed = getDefenseRoleNeed(request, role);
  if (!isDefenseAssistMilitaryRole(role)) return requestedNeed;
  if (!threatProfile) return requestedNeed;

  const assignedCounts = countAssignedDefenseAssistByRole(request.roomName);
  const assigned = assignedCounts[role];
  const aggregatePlan = calculateAggregateDefenseResponsePlan(
    helperEnergyCapacity,
    threatProfile,
    {
      guard: Math.max(0, getDefenseRoleNeed(request, "guard") - assignedCounts.guard),
      ranger: Math.max(0, getDefenseRoleNeed(request, "ranger") - assignedCounts.ranger),
      healer: Math.max(0, getDefenseRoleNeed(request, "healer") - assignedCounts.healer)
    },
    countAssignedDefenseAssistPower(request.roomName)
  );
  const aggregateNeed = assigned + aggregatePlan.counts[role];
  const squadNeed = requestedNeed > 0 ? calculateDefenseAssistSquadSize(role, helperEnergyCapacity, threatProfile) : 0;
  const helperWaveNeed = requestedNeed > 0 ? countCapableDefenseAssistHelpers(request, role, threatProfile) : 0;
  return Math.max(requestedNeed, aggregateNeed, squadNeed, helperWaveNeed);
}

function isDefenseAssistRole(role: string): boolean {
  return isDefenseAssistMilitaryRole(role);
}

function getAssistTarget(memory: Partial<SwarmCreepMemory>): string | undefined {
  return memory.assistTarget ?? (memory.task === DEFENSE_ASSIST_TASK ? memory.targetRoom : undefined);
}

function getDefenseAssistSquadSizeForHelper(request: DefenseAssistRequestMemory, helperRoom: Room): number {
  const threatProfile = getVisibleDefenseAssistThreatProfile(request.roomName);
  const assignedCounts = countAssignedDefenseAssistByRole(request.roomName);
  const aggregatePlan = calculateAggregateDefenseResponsePlan(
    helperRoom.energyCapacityAvailable,
    threatProfile,
    {
      guard: Math.max(0, getDefenseRoleNeed(request, "guard") - assignedCounts.guard),
      ranger: Math.max(0, getDefenseRoleNeed(request, "ranger") - assignedCounts.ranger),
      healer: Math.max(0, getDefenseRoleNeed(request, "healer") - assignedCounts.healer)
    },
    countAssignedDefenseAssistPower(request.roomName)
  );
  const aggregateSize = aggregatePlan.counts.guard + aggregatePlan.counts.ranger + aggregatePlan.counts.healer;
  if (aggregateSize > 0) return aggregateSize;

  const localWaveRoles = DEFENSE_ASSIST_ROLES.filter(role => {
    if (getDefenseRoleNeedForHelper(request, role, helperRoom.energyCapacityAvailable, threatProfile) <= 0) return false;
    return Boolean(buildDefenseAssistBody(role, helperRoom.energyCapacityAvailable, threatProfile));
  });
  return Math.max(1, localWaveRoles.length);
}

function countCapableDefenseAssistHelpers(
  request: DefenseAssistRequestMemory,
  role: string,
  threatProfile = getVisibleDefenseAssistThreatProfile(request.roomName)
): number {
  if (!isDefenseAssistMilitaryRole(role)) return 0;
  let count = 0;
  for (const room of Object.values(Game.rooms)) {
    if (room.name === request.roomName) continue;
    if (!canSpawnDefenseAssistFrom(room)) continue;
    if (!buildDefenseAssistBody(role, room.energyCapacityAvailable, threatProfile)) continue;
    count++;
  }
  return count;
}

function countAssignedDefenseAssistByRole(targetRoom: string): Record<DefenseAssistRole, number> {
  const counts: Record<DefenseAssistRole, number> = { guard: 0, ranger: 0, healer: 0 };
  for (const creep of Object.values(Game.creeps)) {
    const memory = creep.memory as unknown as Partial<SwarmCreepMemory>;
    const role = memory.role ?? "";
    if (isDefenseAssistMilitaryRole(role) && getAssistTarget(memory) === targetRoom) counts[role]++;
  }

  for (const roomName in Game.rooms) {
    for (const request of spawnQueue.getPendingRequests(roomName)) {
      if (!isDefenseAssistMilitaryRole(request.role)) continue;
      if (
        request.additionalMemory?.assistTarget !== targetRoom &&
        !(request.additionalMemory?.task === DEFENSE_ASSIST_TASK && request.targetRoom === targetRoom)
      ) continue;
      counts[request.role]++;
    }
  }

  return counts;
}

function countAssignedDefenseAssist(targetRoom: string, role: string): number {
  if (!isDefenseAssistMilitaryRole(role)) return 0;
  return countAssignedDefenseAssistByRole(targetRoom)[role];
}

function addAssignedPower(power: ExistingDefensePower, role: DefenseAssistRole, parts: Array<BodyPartConstant | BodyPartDefinition>): void {
  const bodyPower = calculateCombatPower(parts);
  const existing = power[role];
  power[role] = existing ? addCombatPower(existing, bodyPower) : bodyPower;
}

function countAssignedDefenseAssistPower(targetRoom: string): ExistingDefensePower {
  const power: ExistingDefensePower = {};
  for (const creep of Object.values(Game.creeps)) {
    const memory = creep.memory as unknown as Partial<SwarmCreepMemory>;
    const role = memory.role ?? "";
    if (!isDefenseAssistMilitaryRole(role) || getAssistTarget(memory) !== targetRoom) continue;
    const activeBody = (creep.body ?? []).filter(part => part.hits > 0);
    if (activeBody.length > 0) addAssignedPower(power, role, activeBody);
  }

  for (const roomName in Game.rooms) {
    for (const request of spawnQueue.getPendingRequests(roomName)) {
      if (!isDefenseAssistMilitaryRole(request.role)) continue;
      if (
        request.additionalMemory?.assistTarget !== targetRoom &&
        !(request.additionalMemory?.task === DEFENSE_ASSIST_TASK && request.targetRoom === targetRoom)
      ) continue;
      addAssignedPower(power, request.role, request.body.parts);
    }
  }
  return power;
}

function canSpawnDefenseAssistFrom(room: Room): boolean {
  if (!room.controller?.my) return false;
  if (room.find(FIND_MY_SPAWNS).length === 0) return false;
  return getActualHostileCreeps(room).length === 0;
}

function createDefenseAssistSpawnAssignment(
  homeRoom: string,
  home: Room,
  request: DefenseAssistRequestMemory
): DefenseAssistSpawnAssignment {
  const wave = getDefenseAssistWave(homeRoom, request);
  return {
    targetRoom: request.roomName,
    task: DEFENSE_ASSIST_TASK,
    priority: (request.urgency ?? 1) >= 2 ? SpawnPriority.EMERGENCY : SpawnPriority.HIGH,
    defenseSquadId: createDefenseAssistSquadId(homeRoom, request.roomName, wave.createdAt),
    defenseSquadSize: getDefenseAssistSquadSizeForHelper(request, home),
    defenseSquadCreatedAt: wave.createdAt
  };
}

function getAffordableEmergencyAssistFallbackNeed(
  request: DefenseAssistRequestMemory,
  role: string,
  helperRoom: Room,
  threatProfile: ReturnType<typeof getVisibleDefenseAssistThreatProfile>
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
  if (!home || !canSpawnDefenseAssistFrom(home)) return null;

  const helperEnergyCapacity = home.energyCapacityAvailable;
  const memory = Memory as unknown as { defenseRequests?: DefenseAssistRequestMemory[] };
  pruneExpiredDefenseAssistWaves(Game.time);
  const candidates = getActiveDefenseAssistRequests(memory, { prune: true })
    .filter(request => request.roomName !== homeRoom)
    .map(request => {
      const threatProfile = getVisibleDefenseAssistThreatProfile(request.roomName);
      return {
        request,
        helperNeed: Math.max(
          getDefenseRoleNeedForHelper(request, role, helperEnergyCapacity, threatProfile),
          getAffordableEmergencyAssistFallbackNeed(request, role, home, threatProfile)
        )
      };
    })
    .filter(candidate => candidate.helperNeed > 0)
    .filter(candidate => hasCurrentDefenseThreat(candidate.request))
    .filter(candidate => countAssignedDefenseAssist(candidate.request.roomName, role) < candidate.helperNeed)
    .sort((a, b) => {
      const urgencyDelta = (b.request.urgency ?? 1) - (a.request.urgency ?? 1);
      if (urgencyDelta !== 0) return urgencyDelta;
      const distanceA = Game.map?.getRoomLinearDistance?.(homeRoom, a.request.roomName) ?? 999;
      const distanceB = Game.map?.getRoomLinearDistance?.(homeRoom, b.request.roomName) ?? 999;
      if (distanceA !== distanceB) return distanceA - distanceB;
      return (a.request.createdAt ?? 0) - (b.request.createdAt ?? 0);
    });

  const request = candidates[0]?.request;
  if (!request) return null;

  return createDefenseAssistSpawnAssignment(homeRoom, home, request);
}
