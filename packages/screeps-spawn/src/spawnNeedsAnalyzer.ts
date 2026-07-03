/**
 * Spawn Needs Analyzer Module
 *
 * Determines whether a room needs to spawn a specific role based on:
 * - Current creep counts
 * - Room conditions and available structures
 * - Remote room assignments and needs
 * - Special role requirements
 */

import { getActualHostileCreeps } from "@ralphschuler/screeps-defense";
import { type CrossShardTransferRequest, resourceTransferCoordinator } from "./botIntegration";
import { countCreepsByRole, countCreepsOfRole, countRemoteCreepsByTargetRoom } from "./creepCounts";
import { memoryManager } from "@ralphschuler/screeps-memory";
import type { SwarmCreepMemory, SwarmState } from "@ralphschuler/screeps-memory";
import {
  canSpawnIdleLocalMilitary,
  IDLE_MILITARY_RESERVE,
  shouldLimitIdleLocalMilitary
} from "./militarySpawnPolicy";
import { ROLE_DEFINITIONS } from "./roleDefinitions";
import {
  getRemoteRoleMaxPerRemote,
  isRemoteEconomyRole
} from "./remoteRoleDemand";
import { getClaimerSpawnAssignment } from "./spawn-demand/claimerDemand";
import { getPioneerSpawnAssignment } from "./spawn-demand/pioneerDemand";
import {
  getSafeRoomLinearDistance,
  hasDangerousHostile,
  hasUnsafeRemoteIntel,
  isControlledByOtherPlayer
} from "./spawn-demand/shared";

export { getClaimerSpawnAssignment } from "./spawn-demand/claimerDemand";
export type { ClaimerSpawnAssignment, ClaimerTask } from "./spawn-demand/claimerDemand";
export { getDefenseAssistSpawnAssignment } from "./spawn-demand/defenseAssistDemand";
export type { DefenseAssistSpawnAssignment } from "./spawn-demand/defenseAssistDemand";
export { getPioneerSpawnAssignment } from "./spawn-demand/pioneerDemand";
export type { PioneerSpawnAssignment } from "./spawn-demand/pioneerDemand";

/** Number of dangerous hostiles per remote guard needed */
const THREATS_PER_GUARD = 2;

/** Maximum number of carriers that can be assigned to a single cross-shard transfer request */
export const MAX_CARRIERS_PER_CROSS_SHARD_REQUEST = 3;

/** Focus room upgrader limits by RCL */
const AGGRESSIVE_UPGRADER_LIMITS = {
  EARLY: 4,
  MID: 7,
  LATE: 12
} as const;

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

export { countCreepsByRole, countCreepsOfRole, countRemoteCreepsByTargetRoom } from "./creepCounts";

/** Peaceful early rooms should spend spawn time on economy before idle deterrence. */
function getPeacefulIdleLocalMilitaryReserve(room: Room | undefined, swarm: SwarmState, isBootstrapMode: boolean): number {
  const isCalmEconomy = swarm.danger === 0 && swarm.posture !== "war" && swarm.posture !== "siege";
  const rcl = room?.controller?.level ?? 0;
  if (isCalmEconomy && (isBootstrapMode || (rcl > 0 && rcl <= 2))) {
    return 0;
  }
  return IDLE_MILITARY_RESERVE;
}

/** Return the target creep count for one home-room role under the current swarm state. */
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

/**
 * Get the remote room that needs workers of a given role.
 */
export function getRemoteRoomNeedingWorkers(homeRoom: string, role: string, swarm: SwarmState): string | null {
  const remoteAssignments = swarm.remoteAssignments ?? [];
  if (remoteAssignments.length === 0) return null;

  for (const remoteRoom of remoteAssignments) {
    if (!isRemoteEligibleForEconomy(remoteRoom)) continue;

    const currentCount = countRemoteCreepsByTargetRoom(homeRoom, role, remoteRoom);
    const maxPerRemote = getRemoteRoleMaxPerRemote(homeRoom, remoteRoom, role, Game.rooms[remoteRoom]);

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
 * Finds a remote room that currently needs more workers of that role.
 * Remote workers require visible construction or repair work before assignment.
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
  if (isRemoteEconomyRole(role)) {
    const targetRoom = getRemoteRoomNeedingWorkers(homeRoom, role, swarm);
    if (targetRoom) {
      memory.targetRoom = targetRoom;
      return true;
    }
    return false;
  }

  // Not a remote role - no assignment needed, return true to allow spawning
  return true;
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
  if (shouldLimitIdleLocalMilitary(def, visibleHostiles)) {
    const reserveLimit = getPeacefulIdleLocalMilitaryReserve(room, swarm, isBootstrapMode);
    if (!canSpawnIdleLocalMilitary(role, countCreepsByRole(roomName), reserveLimit)) {
      return false;
    }
  }

  // SPECIAL: larvaWorker should ONLY be spawned during bootstrap/emergency
  // Once the economy is stable, use specialized roles instead
  // HOWEVER: Allow it in bootstrap mode (when isBootstrapMode = true)
  if (role === "larvaWorker" && !isBootstrapMode) {
    // larvaWorker is handled exclusively by bootstrap mode
    // Return false here to prevent spawning in normal mode
    return false;
  }

  // Remote economy roles must have a concrete assigned target. Remote workers
  // are additionally demand-gated by visible construction/repair work and capped
  // by their home-room role target because they are supplemental builders.
  if (isRemoteEconomyRole(role)) {
    if (role === "remoteWorker" && countCreepsOfRole(roomName, role) >= getRoleTargetCount(roomName, role, swarm)) {
      return false;
    }
    return getRemoteRoomNeedingWorkers(roomName, role, swarm) !== null;
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

  // Pioneer waves are capped per target spawnless room in pioneerDemand.ts.
  // Do not let the home-room role cap for one recovery target block another
  // spawnless owned room that still needs bootstrap workers.
  if (role === "pioneer") {
    return getPioneerSpawnAssignment(roomName, swarm) !== null;
  }

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
