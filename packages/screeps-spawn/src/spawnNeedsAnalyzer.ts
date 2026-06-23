/**
 * Spawn Needs Analyzer Module
 *
 * Determines whether a room needs to spawn a specific role based on:
 * - Current creep counts
 * - Room conditions and available structures
 * - Remote room assignments and needs
 * - Special role requirements
 */

import { cachedFindSources } from "@ralphschuler/screeps-cache";
import { getActualHostileCreeps } from "@ralphschuler/screeps-defense";
import { type CrossShardTransferRequest, resourceTransferCoordinator } from "./botIntegration";
import { memoryManager } from "@ralphschuler/screeps-memory";
import type { SwarmCreepMemory, SwarmState } from "@ralphschuler/screeps-memory";
import { calculateRemoteHaulerRequirement } from "./botIntegration";
import {
  buildDefenseAssistBody,
  calculateAggregateDefenseResponsePlan,
  calculateCombatPower,
  calculateDefenseAssistSquadSize,
  getVisibleDefenseAssistThreatProfile,
  isDefenseAssistMilitaryRole,
  type DefenseAssistRole,
  type ExistingDefensePower
} from "./defenseAssistBody";
import { canSpawnIdleLocalMilitary, shouldLimitIdleLocalMilitary } from "./militarySpawnPolicy";
import { ROLE_DEFINITIONS } from "./roleDefinitions";
import { spawnQueue, SpawnPriority } from "./spawnQueue";

/** Number of dangerous hostiles per remote guard needed */
const THREATS_PER_GUARD = 2;
const DEFENSE_ASSIST_REQUEST_TTL = 500;
const DEFENSE_ASSIST_TASK = "defenseAssist";
const DEFENSE_ASSIST_ROLES = ["guard", "ranger", "healer"] as const;
const MAX_PIONEERS_PER_SPAWN_SITE = 3;

/** Reservation threshold in ticks - trigger renewal below this */
const RESERVATION_THRESHOLD_TICKS = 3000;

/** Maximum number of carriers that can be assigned to a single cross-shard transfer request */
export const MAX_CARRIERS_PER_CROSS_SHARD_REQUEST = 3;

/** Focus room upgrader limits by RCL */
const AGGRESSIVE_UPGRADER_LIMITS = {
  EARLY: 4,
  MID: 7,
  LATE: 12
} as const;

type ClaimerTask = "claim" | "reserve";

export interface ClaimerSpawnAssignment {
  targetRoom: string;
  task: ClaimerTask;
}

export interface PioneerSpawnAssignment {
  targetRoom: string;
  task: "bootstrapSpawn";
}

interface SpawnSettingsMemory {
  spawnSettings?: {
    /** Set false to roll back lost-room recovery claiming. */
    roomRecoveryReclaim?: boolean;
  };
}

function isRoomRecoveryReclaimEnabled(): boolean {
  const mem = Memory as unknown as SpawnSettingsMemory;
  return mem.spawnSettings?.roomRecoveryReclaim !== false;
}

interface DefenseAssistSpawnAssignment {
  targetRoom: string;
  task: "defenseAssist";
  priority: SpawnPriority;
  defenseSquadId: string;
  defenseSquadSize: number;
  defenseSquadCreatedAt: number;
}

interface DefenseAssistRequestMemory {
  roomName: string;
  guardsNeeded?: number;
  rangersNeeded?: number;
  healersNeeded?: number;
  urgency?: number;
  createdAt?: number;
}

/**
 * Best-effort room distance lookup.
 *
 * Screeps private-server map grid data can be temporarily unavailable during CI
 * bootstrap. If Game.map throws there, scouting should degrade gracefully instead
 * of crashing the spawn pipeline.
 */
function getSafeRoomLinearDistance(fromRoom: string, toRoom: string): number | null {
  try {
    const distance = Game.map?.getRoomLinearDistance?.(fromRoom, toRoom);
    return Number.isFinite(distance) ? distance : null;
  } catch {
    return null;
  }
}

/** Scout nearby stub intel so remotes do not stall forever without vision. */
function hasUnscoutedNearbyRoom(homeRoom: string, maxDistance = 2): boolean {
  const empire = memoryManager.getEmpire();
  for (const roomName in empire.knownRooms) {
    const intel = empire.knownRooms[roomName];
    if (!intel || intel.scouted) continue;
    const distance = getSafeRoomLinearDistance(homeRoom, roomName);
    if (distance === null) continue;
    if (
      distance >= 1 &&
      distance <= maxDistance &&
      !intel.owner &&
      !intel.reserver &&
      !intel.isHighway &&
      !intel.isSK
    ) {
      return true;
    }
  }
  return false;
}

function hasHealthyRemoteReservation(room: Room): boolean {
  const reservationTicks = room.controller?.reservation?.ticksToEnd ?? 0;
  return reservationTicks >= RESERVATION_THRESHOLD_TICKS;
}

function getControllerOwnerName(controller: StructureController): string | undefined {
  return controller.owner?.username;
}

function getControllerReserverName(controller: StructureController): string | undefined {
  return controller.reservation?.username;
}

function isControlledByOtherPlayer(controller: StructureController): boolean {
  const myUsername = getMyUsername();
  const owner = getControllerOwnerName(controller);
  if (owner && owner !== myUsername) return true;

  const reserver = getControllerReserverName(controller);
  return Boolean(reserver && reserver !== myUsername);
}

function hasUnsafeRemoteIntel(roomName: string): boolean {
  const intel = memoryManager.getEmpire().knownRooms[roomName];
  if (!intel) return false;

  const myUsername = getMyUsername();
  if (intel.owner && intel.owner !== myUsername) return true;
  if (intel.reserver && intel.reserver !== myUsername) return true;
  if (intel.threatLevel > 0) return true;
  if (intel.isSK) return true;

  return false;
}

function isRemoteEligibleForEconomy(roomName: string): boolean {
  const room = Game.rooms[roomName];
  if (!room) return !hasUnsafeRemoteIntel(roomName);
  if (!room.controller) return false;
  if (isControlledByOtherPlayer(room.controller)) return false;
  if (hasDangerousHostile(room)) return false;
  return true;
}

function isRemoteEligibleForDefense(roomName: string): boolean {
  const room = Game.rooms[roomName];
  if (room?.controller) return !isControlledByOtherPlayer(room.controller);
  return !hasUnsafeRemoteIntel(roomName);
}

/**
 * Creep count cache (cleared each tick) to avoid repeated iteration.
 * OPTIMIZATION: With multiple spawns per room, this prevents redundant creep iteration.
 *
 * Cache structure:
 * - Key format for normal count: `roomName` or `roomName_active`
 * - Key format for role count: `roomName:role` (counts specific role from a home room)
 */
const creepCountCache = new Map<string, Map<string, number> | number>();
let creepCountCacheTick = -1;
let creepCountCacheRef: Record<string, Creep> | null = null;

/**
 * Count creeps by role in a room with per-tick caching.
 * @param roomName - Name of the room to count creeps for
 * @param activeOnly - If true, only count non-spawning creeps
 */
export function countCreepsByRole(roomName: string, activeOnly = false): Map<string, number> {
  // Clear cache if new tick or Game.creeps reference changed
  if (creepCountCacheTick !== Game.time || creepCountCacheRef !== Game.creeps) {
    creepCountCache.clear();
    creepCountCacheTick = Game.time;
    creepCountCacheRef = Game.creeps;
  }

  const cacheKey = activeOnly ? `${roomName}_active` : roomName;

  const cached = creepCountCache.get(cacheKey);
  if (cached && cached instanceof Map) {
    return cached;
  }

  const counts = new Map<string, number>();

  // OPTIMIZATION: Use for-in loop to avoid creating temporary array
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    const memory = creep.memory as unknown as SwarmCreepMemory;
    if (memory.homeRoom === roomName) {
      if (activeOnly && creep.spawning) {
        continue;
      }

      const role = memory.role ?? "unknown";
      counts.set(role, (counts.get(role) ?? 0) + 1);
    }
  }

  creepCountCache.set(cacheKey, counts);
  return counts;
}

/**
 * Count creeps of a specific role from a home room (cached).
 * More efficient than countCreepsByRole().get(role) when you only need one role.
 * @param roomName - Home room name
 * @param role - Role to count
 */
export function countCreepsOfRole(roomName: string, role: string): number {
  // Clear cache if new tick
  if (creepCountCacheTick !== Game.time || creepCountCacheRef !== Game.creeps) {
    creepCountCache.clear();
    creepCountCacheTick = Game.time;
    creepCountCacheRef = Game.creeps;
  }

  const cacheKey = `${roomName}:${role}`;
  const cached = creepCountCache.get(cacheKey);
  if (typeof cached === "number") {
    return cached;
  }

  // Count creeps with this role from this home room
  let count = 0;
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    const memory = creep.memory as unknown as SwarmCreepMemory;
    if (memory.homeRoom === roomName && memory.role === role) {
      count++;
    }
  }

  creepCountCache.set(cacheKey, count);
  return count;
}

/**
 * Count remote creeps assigned to a specific target room
 */
export function getRoleTargetCount(roomName: string, role: string, swarm: SwarmState): number {
  const def = ROLE_DEFINITIONS[role];
  if (!def) return 0;

  let maxForRoom = def.maxPerRoom;
  const room = Game.rooms[roomName];

  if (role === "upgrader" && room?.controller && swarm.danger === 0 && swarm.posture !== "war" && swarm.posture !== "siege") {
    if (room.controller.level <= 3) {
      maxForRoom = AGGRESSIVE_UPGRADER_LIMITS.EARLY;
    } else if (room.controller.level <= 6) {
      maxForRoom = AGGRESSIVE_UPGRADER_LIMITS.MID;
    } else {
      maxForRoom = AGGRESSIVE_UPGRADER_LIMITS.LATE;
    }

    if (swarm.clusterId) {
      const cluster = memoryManager.getCluster(swarm.clusterId);
      if (cluster?.focusRoom === roomName) {
        maxForRoom += 2;
      }
    }
  }

  if (role === "queenCarrier") {
    maxForRoom = room?.storage && room.controller && room.controller.level >= 5 ? def.maxPerRoom : 1;
  }

  return maxForRoom;
}

export function countRemoteCreepsByTargetRoom(homeRoom: string, role: string, targetRoom: string): number {
  let count = 0;
  for (const creep of Object.values(Game.creeps)) {
    const memory = creep.memory as unknown as SwarmCreepMemory;
    if (memory.homeRoom === homeRoom && memory.role === role && memory.targetRoom === targetRoom) {
      count++;
    }
  }
  return count;
}

/**
 * Get the remote room that needs workers of a given role.
 */
export function getRemoteRoomNeedingWorkers(homeRoom: string, role: string, swarm: SwarmState): string | null {
  const remoteAssignments = swarm.remoteAssignments ?? [];
  if (remoteAssignments.length === 0) return null;

  for (const remoteRoom of remoteAssignments) {
    if (!isRemoteEligibleForEconomy(remoteRoom)) continue;

    const currentCount = countRemoteCreepsByTargetRoom(homeRoom, role, remoteRoom);
    const room = Game.rooms[remoteRoom];

    let maxPerRemote: number;

    if (role === "remoteHarvester") {
      if (room) {
        const sources = cachedFindSources(room);
        maxPerRemote = sources.length;
      } else {
        maxPerRemote = 2;
      }
    } else if (role === "remoteHauler") {
      const energyCapacity = Game.rooms[homeRoom]?.energyCapacityAvailable ?? 800;

      if (room) {
        const sources = cachedFindSources(room);
        const sourceCount = sources.length;
        const requirement = calculateRemoteHaulerRequirement(homeRoom, remoteRoom, sourceCount, energyCapacity, {
          reserved: hasHealthyRemoteReservation(room)
        });
        maxPerRemote = requirement.recommendedHaulers;
      } else {
        const requirement = calculateRemoteHaulerRequirement(homeRoom, remoteRoom, 2, energyCapacity, {
          reserved: false
        });
        maxPerRemote = Math.min(2, requirement.recommendedHaulers);
      }
    } else {
      maxPerRemote = 2;
    }

    if (currentCount < maxPerRemote) {
      return remoteRoom;
    }
  }

  return null;
}

/**
 * Assign target room to remote role creep memory.
 *
 * Handles target room assignment for remote roles (remoteHarvester, remoteHauler, remoteWorker).
 * For remoteHarvester and remoteHauler, finds a remote room that needs more workers of that role.
 * For remoteWorker, uses load balancing to assign to the remote room with fewest workers.
 *
 * @param role - The role to assign a target room for
 * @param memory - The creep memory to update with targetRoom
 * @param swarm - The swarm state containing remote assignments
 * @param homeRoom - The home room name for the creep
 * @returns true if assignment successful or not needed, false if no target available
 */
export function assignRemoteTargetRoom(
  role: string,
  memory: SwarmCreepMemory,
  swarm: SwarmState,
  homeRoom: string
): boolean {
  if (role === "remoteHarvester" || role === "remoteHauler") {
    const targetRoom = getRemoteRoomNeedingWorkers(homeRoom, role, swarm);
    if (targetRoom) {
      memory.targetRoom = targetRoom;
      return true;
    }
    return false;
  }

  if (role === "remoteWorker") {
    const remoteAssignments = swarm.remoteAssignments ?? [];
    if (remoteAssignments.length > 0) {
      // Load balancing: assign to remote room with fewest remoteWorkers
      // Count by assignment (targetRoom), not by physical location
      let minCount = Infinity;
      let candidatesWithMinCount: string[] = [];

      for (const remoteName of remoteAssignments) {
        if (!isRemoteEligibleForEconomy(remoteName)) continue;

        // Count workers assigned to this remote (from this home)
        const count = countRemoteCreepsByTargetRoom(homeRoom, role, remoteName);
        if (count < minCount) {
          minCount = count;
          candidatesWithMinCount = [remoteName];
        } else if (count === minCount) {
          candidatesWithMinCount.push(remoteName);
        }
      }

      // Select from candidates: use round-robin if multiple, otherwise take the only one
      if (candidatesWithMinCount.length === 0) return false;

      const bestRemote =
        candidatesWithMinCount.length > 1
          ? candidatesWithMinCount[Game.time % candidatesWithMinCount.length]
          : candidatesWithMinCount[0];

      memory.targetRoom = bestRemote;
      return true;
    }
    return false;
  }

  // Not a remote role - no assignment needed, return true to allow spawning
  return true;
}

function hasAssignedClaimer(targetRoom: string, task: ClaimerTask): boolean {
  const activeClaimer = Object.values(Game.creeps).some(creep => {
    const memory = creep.memory as unknown as SwarmCreepMemory;
    return memory.role === "claimer" && memory.targetRoom === targetRoom && memory.task === task;
  });
  if (activeClaimer) return true;

  const queueRoomNames = new Set<string>();
  for (const roomName in Game.rooms) {
    if (Game.rooms[roomName]?.controller?.my) {
      queueRoomNames.add(roomName);
    }
  }
  for (const spawnName in Game.spawns ?? {}) {
    const spawnRoom = Game.spawns[spawnName]?.room?.name;
    if (spawnRoom) queueRoomNames.add(spawnRoom);
  }

  for (const roomName of queueRoomNames) {
    const queuedClaimer = spawnQueue.getPendingRequests(roomName).some(request =>
      request.role === "claimer" &&
      request.targetRoom === targetRoom &&
      request.additionalMemory?.task === task
    );
    if (queuedClaimer) return true;
  }

  return false;
}

function roomHasOwnedSpawn(room: Room): boolean {
  return room.find(FIND_MY_SPAWNS).length > 0;
}

function hasDangerousHostile(room: Room): boolean {
  return getActualHostileCreeps(room).some(hostile =>
    hostile.body.some(part =>
      part.hits > 0 &&
      (part.type === ATTACK || part.type === RANGED_ATTACK || part.type === WORK || part.type === HEAL)
    )
  );
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

  const assigned = countAssignedDefenseAssist(request.roomName, role);
  const aggregatePlan = calculateAggregateDefenseResponsePlan(
    helperEnergyCapacity,
    threatProfile,
    {
      guard: getDefenseRoleNeed(request, "guard"),
      ranger: getDefenseRoleNeed(request, "ranger"),
      healer: getDefenseRoleNeed(request, "healer")
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

function hasCurrentDefenseThreat(request: DefenseAssistRequestMemory): boolean {
  const targetRoom = Game.rooms[request.roomName];
  if (targetRoom) return getActualHostileCreeps(targetRoom).length > 0;
  return Game.time - (request.createdAt ?? 0) <= DEFENSE_ASSIST_REQUEST_TTL;
}

function getAssistTarget(memory: Partial<SwarmCreepMemory>): string | undefined {
  return memory.assistTarget ?? (memory.task === DEFENSE_ASSIST_TASK ? memory.targetRoom : undefined);
}

function getDefenseAssistSquadSizeForHelper(request: DefenseAssistRequestMemory, helperRoom: Room): number {
  const threatProfile = getVisibleDefenseAssistThreatProfile(request.roomName);
  if (threatProfile) {
    const plan = calculateAggregateDefenseResponsePlan(
      helperRoom.energyCapacityAvailable,
      threatProfile,
      {
        guard: getDefenseRoleNeed(request, "guard"),
        ranger: getDefenseRoleNeed(request, "ranger"),
        healer: getDefenseRoleNeed(request, "healer")
      },
      countAssignedDefenseAssistPower(request.roomName)
    );
    const plannedSize = plan.counts.guard + plan.counts.ranger + plan.counts.healer;
    if (plannedSize > 0) return plannedSize;
  }

  let squadSize = 0;
  for (const role of DEFENSE_ASSIST_ROLES) {
    if (getDefenseRoleNeedForHelper(request, role, helperRoom.energyCapacityAvailable, threatProfile) <= 0) continue;
    if (!buildDefenseAssistBody(role, helperRoom.energyCapacityAvailable, threatProfile)) continue;
    squadSize++;
  }
  return Math.max(1, squadSize);
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

function countAssignedDefenseAssist(targetRoom: string, role: string): number {
  let count = 0;
  for (const creep of Object.values(Game.creeps)) {
    const memory = creep.memory as unknown as Partial<SwarmCreepMemory>;
    if (memory.role === role && getAssistTarget(memory) === targetRoom) count++;
  }

  for (const roomName in Game.rooms) {
    count += spawnQueue.getPendingRequests(roomName).filter(request =>
      request.role === role &&
      (request.additionalMemory?.assistTarget === targetRoom ||
        (request.additionalMemory?.task === DEFENSE_ASSIST_TASK && request.targetRoom === targetRoom))
    ).length;
  }

  return count;
}

function addAssignedPower(power: ExistingDefensePower, role: DefenseAssistRole, parts: Array<BodyPartConstant | BodyPartDefinition>): void {
  const bodyPower = calculateCombatPower(parts);
  const existing = power[role];
  power[role] = existing
    ? {
        partCount: existing.partCount + bodyPower.partCount,
        attack: existing.attack + bodyPower.attack,
        ranged: existing.ranged + bodyPower.ranged,
        heal: existing.heal + bodyPower.heal,
        dismantle: existing.dismantle + bodyPower.dismantle,
        score: existing.score + bodyPower.score
      }
    : bodyPower;
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

function getDefenseAssistCreatedAt(request: DefenseAssistRequestMemory): number {
  return request.createdAt ?? Game.time;
}

function createDefenseAssistSquadId(homeRoom: string, request: DefenseAssistRequestMemory): string {
  return `defenseAssist:${homeRoom}:${request.roomName}:${getDefenseAssistCreatedAt(request)}`;
}

function createDefenseAssistSpawnAssignment(
  homeRoom: string,
  home: Room,
  request: DefenseAssistRequestMemory
): DefenseAssistSpawnAssignment {
  return {
    targetRoom: request.roomName,
    task: DEFENSE_ASSIST_TASK,
    priority: (request.urgency ?? 1) >= 2 ? SpawnPriority.EMERGENCY : SpawnPriority.HIGH,
    defenseSquadId: createDefenseAssistSquadId(homeRoom, request),
    defenseSquadSize: getDefenseAssistSquadSizeForHelper(request, home),
    defenseSquadCreatedAt: getDefenseAssistCreatedAt(request)
  };
}

function getActiveDefenseAssistRequests(memory: { defenseRequests?: DefenseAssistRequestMemory[] }): DefenseAssistRequestMemory[] {
  const requests = memory.defenseRequests ?? [];
  const activeRequests = requests.filter(hasCurrentDefenseThreat);
  if (activeRequests.length !== requests.length) {
    memory.defenseRequests = activeRequests;
  }
  return activeRequests;
}

export function getDefenseAssistSpawnAssignment(homeRoom: string, role: string): DefenseAssistSpawnAssignment | null {
  if (!isDefenseAssistRole(role)) return null;

  const home = Game.rooms[homeRoom];
  if (!home || !canSpawnDefenseAssistFrom(home)) return null;

  const helperEnergyCapacity = home.energyCapacityAvailable;
  const memory = Memory as unknown as { defenseRequests?: DefenseAssistRequestMemory[] };
  const candidates = getActiveDefenseAssistRequests(memory)
    .filter(request => request.roomName !== homeRoom)
    .map(request => ({ request, helperNeed: getDefenseRoleNeedForHelper(request, role, helperEnergyCapacity) }))
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

function countAssignedPioneers(targetRoom: string): number {
  let count = 0;
  for (const creep of Object.values(Game.creeps)) {
    const memory = creep.memory as unknown as SwarmCreepMemory;
    if (memory.role === "pioneer" && memory.targetRoom === targetRoom && memory.task === "bootstrapSpawn") {
      count++;
    }
  }

  const queueRoomNames = new Set<string>();
  for (const roomName in Game.rooms) {
    if (Game.rooms[roomName]?.controller?.my) {
      queueRoomNames.add(roomName);
    }
  }
  for (const spawnName in Game.spawns ?? {}) {
    const spawnRoom = Game.spawns[spawnName]?.room?.name;
    if (spawnRoom) queueRoomNames.add(spawnRoom);
  }

  for (const roomName of queueRoomNames) {
    count += spawnQueue.getPendingRequests(roomName).filter(request =>
      request.role === "pioneer" &&
      request.targetRoom === targetRoom &&
      request.additionalMemory?.task === "bootstrapSpawn"
    ).length;
  }

  return count;
}

function getPioneerTargetCount(targetRoom: Room): number {
  const hasSpawnSite = targetRoom
    .find(FIND_MY_CONSTRUCTION_SITES)
    .some(site => site.structureType === STRUCTURE_SPAWN);

  return hasSpawnSite ? MAX_PIONEERS_PER_SPAWN_SITE : 1;
}

function isEligiblePioneerParent(room: Room, activeHomeRoom: string, activeSwarm: SwarmState): boolean {
  if (!room.controller?.my) return false;
  if (!roomHasOwnedSpawn(room)) return false;

  const swarm = room.name === activeHomeRoom ? activeSwarm : memoryManager.getSwarmState(room.name);
  if ((swarm?.danger ?? 0) >= 2) return false;
  if (swarm?.posture === "war" || swarm?.posture === "siege" || swarm?.posture === "evacuate") return false;

  return true;
}

function getPioneerParentForTarget(targetRoom: Room, activeHomeRoom: string, activeSwarm: SwarmState): string | null {
  const candidates = Object.values(Game.rooms)
    .filter(room => room.name !== targetRoom.name)
    .filter(room => isEligiblePioneerParent(room, activeHomeRoom, activeSwarm))
    .map(room => ({
      room,
      distance: getSafeRoomLinearDistance(room.name, targetRoom.name) ?? 999
    }))
    .sort((a, b) => a.distance - b.distance || a.room.name.localeCompare(b.room.name));

  return candidates[0]?.room.name ?? null;
}

export function getPioneerSpawnAssignment(homeRoom: string, swarm: SwarmState): PioneerSpawnAssignment | null {
  const home = Game.rooms[homeRoom];
  if (!home || !isEligiblePioneerParent(home, homeRoom, swarm)) return null;

  const spawnlessTargets = Object.values(Game.rooms)
    .filter(room => room.name !== homeRoom)
    .filter(room => room.controller?.my)
    .filter(room => !roomHasOwnedSpawn(room))
    .filter(room => !hasDangerousHostile(room))
    .filter(room => countAssignedPioneers(room.name) < getPioneerTargetCount(room))
    .map(room => ({
      room,
      distance: getSafeRoomLinearDistance(homeRoom, room.name) ?? 999
    }))
    .sort((a, b) => a.distance - b.distance || a.room.name.localeCompare(b.room.name));

  for (const target of spawnlessTargets) {
    if (getPioneerParentForTarget(target.room, homeRoom, swarm) === homeRoom) {
      return { targetRoom: target.room.name, task: "bootstrapSpawn" };
    }
  }

  return null;
}

/**
 * Get the remote room that needs a reserver.
 */
function getRemoteRoomNeedingReserver(swarm: SwarmState, reservedForClaim = new Set<string>()): string | null {
  const remotes = swarm.remoteAssignments ?? [];
  if (remotes.length === 0) return null;

  const myUsername = getMyUsername();

  // Check each remote room
  for (const remoteName of remotes) {
    if (reservedForClaim.has(remoteName) || hasAssignedClaimer(remoteName, "claim")) continue;

    const remoteRoom = Game.rooms[remoteName];

    // If we have vision, check reservation status.
    if (remoteRoom) {
      const controller = remoteRoom.controller;
      if (!controller) continue;

      // Skip owned rooms and rooms reserved by another player.
      if (controller.owner || isControlledByOtherPlayer(controller)) continue;
      if (hasDangerousHostile(remoteRoom)) continue;

      // Check if reserved by us
      const reservedByUs = controller.reservation?.username === myUsername;
      const reservationTicks = controller.reservation?.ticksToEnd ?? 0;

      // Need reserver if not reserved or reservation is running low
      const reservationNeedsRefresh = !reservedByUs || reservationTicks < RESERVATION_THRESHOLD_TICKS;
      if (reservationNeedsRefresh && !hasAssignedClaimer(remoteName, "reserve")) {
        return remoteName;
      }
    } else if (!hasUnsafeRemoteIntel(remoteName) && !hasAssignedClaimer(remoteName, "reserve")) {
      // No vision - send a reserver only if stored intel does not mark the room unsafe.
      return remoteName;
    }
  }

  return null;
}

function isRecoverableClaimTarget(roomName: string): boolean {
  const room = Game.rooms[roomName];
  if (room) {
    const controller = room.controller;
    if (!controller) return false;
    if (controller.my) return false;
    if (controller.owner || controller.reservation) return false;
    if (hasDangerousHostile(room)) return false;
    return true;
  }

  return !hasUnsafeRemoteIntel(roomName);
}

function getRecoveryClaimTarget(empire: ReturnType<typeof memoryManager.getEmpire>): string | null {
  const recoveryRooms = empire.recoveryRooms ?? {};
  const candidates = Object.values(recoveryRooms)
    .filter(entry => !hasAssignedClaimer(entry.roomName, "claim"))
    .filter(entry => isRecoverableClaimTarget(entry.roomName))
    .sort((a, b) => a.lostAt - b.lostAt || a.roomName.localeCompare(b.roomName));

  return candidates[0]?.roomName ?? null;
}

export function getClaimerSpawnAssignment(_homeRoom: string, swarm: SwarmState): ClaimerSpawnAssignment | null {
  const empire = memoryManager.getEmpire();
  const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);

  const canClaimRoom = ownedRooms.length < (Game.gcl?.level ?? 1);
  const recoveryTarget = canClaimRoom && isRoomRecoveryReclaimEnabled() ? getRecoveryClaimTarget(empire) : null;
  if (recoveryTarget) {
    return { targetRoom: recoveryTarget, task: "claim" };
  }

  // Expansion claims use the scored empire queue first.
  const claimTargetRooms = canClaimRoom
    ? new Set([
        ...Object.values(empire.recoveryRooms ?? {}).map(entry => entry.roomName),
        ...empire.claimQueue.filter(candidate => !candidate.claimed).map(candidate => candidate.roomName)
      ])
    : new Set<string>();
  if (canClaimRoom) {
    const expansionTarget = empire.claimQueue.find(
      candidate => !candidate.claimed && !hasAssignedClaimer(candidate.roomName, "claim")
    );
    if (expansionTarget) {
      return { targetRoom: expansionTarget.roomName, task: "claim" };
    }
  }

  // Remote reservations are local to the home room's remote assignment list.
  // Do not reserve rooms that are already being claimed.
  const remoteTarget = getRemoteRoomNeedingReserver(swarm, claimTargetRooms);
  if (remoteTarget) {
    return { targetRoom: remoteTarget, task: "reserve" };
  }

  return null;
}

/**
 * Get my username (cached)
 */
function getMyUsername(): string {
  const spawns = Object.values(Game.spawns ?? {});
  if (spawns.length > 0) {
    return spawns[0].owner.username;
  }
  return "";
}

/**
 * Check if room needs to spawn a specific role.
 * Evaluates current creep counts, room conditions, and special requirements.
 *
 * @param roomName - Name of the room
 * @param role - Role to check
 * @param swarm - Swarm state with posture, danger level, and assignments
 * @param isBootstrapMode - Whether room is in bootstrap/emergency mode
 * @returns true if the role should be spawned
 */
export function needsRole(roomName: string, role: string, swarm: SwarmState, isBootstrapMode = false): boolean {
  const def = ROLE_DEFINITIONS[role];
  if (!def) return false;

  // MILITARY SPAWN RESTRICTION: When no hostile creeps are visible, only keep
  // a single local guard as an idle reserve. This prevents stale danger/posture
  // pheromones from spending most room energy on idle soldiers. Remote guards
  // are exempt because they are gated by visible remote-room threats below.
  const room = Game.rooms[roomName];
  const visibleHostiles = room ? getActualHostileCreeps(room).length : 0;
  if (shouldLimitIdleLocalMilitary(def, visibleHostiles) && !canSpawnIdleLocalMilitary(role, countCreepsByRole(roomName))) {
    return false;
  }

  // SPECIAL: larvaWorker should ONLY be spawned during bootstrap/emergency
  // Once the economy is stable, use specialized roles instead
  // HOWEVER: Allow it in bootstrap mode (when isBootstrapMode = true)
  if (role === "larvaWorker" && !isBootstrapMode) {
    // larvaWorker is handled exclusively by bootstrap mode
    // Return false here to prevent spawning in normal mode
    return false;
  }

  // Special handling for remote roles
  if (role === "remoteHarvester" || role === "remoteHauler") {
    // Check if there's a remote room that needs workers
    return getRemoteRoomNeedingWorkers(roomName, role, swarm) !== null;
  }

  // Remote worker: only spawn if we have remote rooms assigned
  // CRITICAL FIX: Must count workers by homeRoom ASSIGNMENT, not by physical location
  // because remote workers travel away from home and would be undercounted
  if (role === "remoteWorker") {
    const remoteAssignments = swarm.remoteAssignments ?? [];
    if (remoteAssignments.length === 0) return false;

    // Use cached count of workers assigned from this home room (by memory.homeRoom)
    // This counts workers regardless of their current physical location
    const workersFromThisHome = countCreepsOfRole(roomName, "remoteWorker");

    // Check against maxPerRoom from role definition (already retrieved above)
    return workersFromThisHome < def.maxPerRoom;
  }

  // Remote guard: spawn if remote rooms have threats
  if (role === "remoteGuard") {
    const remoteAssignments = swarm.remoteAssignments ?? [];
    if (remoteAssignments.length === 0) return false;

    // Check if any remote room has threats and needs guards
    for (const remoteName of remoteAssignments) {
      if (!isRemoteEligibleForDefense(remoteName)) continue;

      const remoteRoom = Game.rooms[remoteName];
      if (!remoteRoom) continue; // Can't check rooms without vision

      // Check for hostile creeps with combat parts
      const hostiles = getActualHostileCreeps(remoteRoom);
      const dangerousHostiles = hostiles.filter(h =>
        h.body.some(p => p.type === ATTACK || p.type === RANGED_ATTACK || p.type === WORK)
      );

      if (dangerousHostiles.length > 0) {
        // Check how many guards are already assigned to this remote
        const currentGuards = countRemoteCreepsByTargetRoom(roomName, role, remoteName);
        // Need guards scaled to threat level, up to max per room
        const neededGuards = Math.min(def.maxPerRoom, Math.ceil(dangerousHostiles.length / THREATS_PER_GUARD));
        if (currentGuards < neededGuards) {
          return true;
        }
      }
    }

    return false;
  }

  const counts = countCreepsByRole(roomName);
  const current = counts.get(role) ?? 0;

  if (current >= getRoleTargetCount(roomName, role, swarm)) return false;

  // Special conditions
  if (!room) return false;

  // Scout: Spawn if we have remote rooms without full intel
  // or if we're in expand posture and need more room data
  // CRITICAL: Do NOT spawn scouts during active defense - military units have priority
  if (role === "scout") {
    // Never spawn scouts during defensive operations (danger >= 1)
    // Military units must take absolute priority during invasions
    if (swarm.danger >= 1) return false;

    // Never spawn scouts in war/siege/defensive postures
    if (swarm.posture === "defensive" || swarm.posture === "war" || swarm.posture === "siege") return false;

    const hasRemoteAssignments = (swarm.remoteAssignments ?? []).length > 0;

    // In expand posture, allow scouts to discover and score candidate rooms.
    if (swarm.posture === "expand" && current < def.maxPerRoom) return true;

    // Keep one scout when we have assigned remotes or adjacent stub intel.
    // This feeds remote validation, reservation, and expansion scoring.
    if (current === 0 && (hasRemoteAssignments || hasUnscoutedNearbyRoom(roomName))) return true;

    return false;
  }

  // Claimer: Only spawn if the creep can be born with a concrete claim/reserve target.
  if (role === "claimer") {
    return getClaimerSpawnAssignment(roomName, swarm) !== null;
  }

  // Pioneer: parent-spawned bootstrap worker for newly claimed spawnless rooms.
  if (role === "pioneer") {
    return getPioneerSpawnAssignment(roomName, swarm) !== null;
  }

  // Intershard footprint roles are requested explicitly by the bot footprint manager.
  // Generic per-room demand must not spawn them without targetShard/portal memory.
  if (role === "interShardScout" || role === "interShardClaimer" || role === "interShardPioneer") {
    return false;
  }

  // Mineral harvester needs extractor
  if (role === "mineralHarvester") {
    const mineral = room.find(FIND_MINERALS)[0];
    if (!mineral) return false;
    const extractor = mineral.pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType === STRUCTURE_EXTRACTOR);
    if (!extractor) return false;
    if (mineral.mineralAmount === 0) return false;
  }

  // Lab tech needs labs
  if (role === "labTech") {
    const labs = room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_LAB });
    if (labs.length < 3) return false;
  }

  // Factory worker needs factory
  if (role === "factoryWorker") {
    const factory = room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_FACTORY });
    if (factory.length === 0) return false;
  }

  // Queen carrier needs storage
  if (role === "queenCarrier") {
    if (!room.storage) return false;
  }

  // Builder needs construction sites
  if (role === "builder") {
    const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
    if (sites.length === 0 && current > 0) return false;
  }

  // Inter-room carrier needs active resource requests
  if (role === "interRoomCarrier") {
    // Check if room's cluster has any active resource transfer requests
    if (!swarm.clusterId) return false;

    const cluster = memoryManager.getCluster(swarm.clusterId);
    if (!cluster || !cluster.resourceRequests || cluster.resourceRequests.length === 0) {
      return false;
    }

    // Check if there are requests that need more carriers
    const needsCarriers = cluster.resourceRequests.some(req => {
      // Only spawn for requests from this room
      if (req.fromRoom !== room.name) return false;

      // Check if request needs more carriers
      const assignedCount = req.assignedCreeps.filter(name => Game.creeps[name]).length;
      const remaining = req.amount - req.delivered;

      // Need carriers if we have significant remaining amount and not enough assigned
      return remaining > 500 && assignedCount < 2;
    });

    if (!needsCarriers) return false;
  }

  // Cross-shard carrier needs active cross-shard transfer requests
  if (role === "crossShardCarrier") {
    // Check if there are any active cross-shard transfer requests
    const activeRequests = resourceTransferCoordinator.getActiveRequests?.() ?? [];
    if (activeRequests.length === 0) {
      return false;
    }

    // Check if any request originates from this room and needs carriers
    const needsCarriers = activeRequests.some((req: CrossShardTransferRequest) => {
      // Only spawn for requests from this room
      if (req.sourceRoom !== room.name) return false;

      const assignedCreeps = req.assignedCreeps || [];
      const neededCarryCapacity = req.amount - (req.transferred ?? 0);

      // Get alive creeps and calculate their capacity
      let currentCapacity = 0;
      let aliveCreepCount = 0;
      for (const creepName of assignedCreeps) {
        const creep = Game.creeps[creepName];
        if (creep) {
          currentCapacity += creep.carryCapacity;
          aliveCreepCount++;
        }
      }

      // Need carriers if we need more capacity and haven't hit the max carriers per request
      return currentCapacity < neededCarryCapacity && aliveCreepCount < MAX_CARRIERS_PER_CROSS_SHARD_REQUEST;
    });

    if (!needsCarriers) return false;
  }

  return true;
}
