/**
 * Claimer demand selection.
 *
 * Keeps claim/reserve target priority in one place so `spawnNeedsAnalyzer.ts`
 * can remain a facade: lost-room recovery first, scored expansion claims second,
 * then remote reservation refreshes. The module also de-duplicates active and
 * queued claimers to avoid multiple rooms racing for the same controller.
 */
import { getActualHostileCreeps } from "@ralphschuler/screeps-defense";
import { memoryManager } from "@ralphschuler/screeps-memory";
import type { SwarmCreepMemory, SwarmState } from "@ralphschuler/screeps-memory";
import { REMOTE_RESERVATION_REFRESH_TICKS } from "../remoteRoleDemand";
import { spawnQueue } from "../spawnQueue";
import {
  getMyUsername,
  getSafeRoomLinearDistance,
  getSpawnQueueRoomNames,
  hasDangerousHostile,
  hasUnsafeRemoteIntel,
  isControlledByOtherPlayer
} from "./shared";

export type ClaimerTask = "claim" | "reserve";

export interface ClaimerSpawnAssignment {
  targetRoom: string;
  task: ClaimerTask;
}

const OWNED_SPAWN_CONSTRUCTION_CLAIM_MAX_DISTANCE = 10;
const UNSAFE_CONSTRUCTION_TARGET_THREAT_LEVEL = 2;
const DANGEROUS_CONSTRUCTION_CLAIM_HOSTILE_PARTS = new Set<BodyPartConstant>([
  ATTACK,
  RANGED_ATTACK,
  HEAL,
  WORK,
  CLAIM
]);

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

function hasActiveClaimPart(creep: Creep): boolean {
  if (typeof creep.getActiveBodyparts === "function") {
    return creep.getActiveBodyparts(CLAIM) > 0;
  }

  return creep.body?.some(part => part.type === CLAIM && part.hits > 0) ?? false;
}

function hasAssignedClaimer(targetRoom: string, task: ClaimerTask): boolean {
  const activeClaimer = Object.values(Game.creeps).some(creep => {
    const memory = creep.memory as unknown as SwarmCreepMemory;
    return memory.role === "claimer" && memory.targetRoom === targetRoom && memory.task === task && hasActiveClaimPart(creep);
  });
  if (activeClaimer) return true;

  for (const roomName of getSpawnQueueRoomNames()) {
    const queuedClaimer = spawnQueue.getPendingRequests(roomName).some(request =>
      request.role === "claimer" &&
      request.targetRoom === targetRoom &&
      request.additionalMemory?.task === task &&
      request.body.parts.includes(CLAIM)
    );
    if (queuedClaimer) return true;
  }

  return false;
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
      const reservationNeedsRefresh = !reservedByUs || reservationTicks < REMOTE_RESERVATION_REFRESH_TICKS;
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

function getOwnedSpawnConstructionSiteRoomNames(): string[] {
  const roomNames = new Set<string>();
  for (const site of Object.values(Game.constructionSites ?? {})) {
    if (site.structureType === STRUCTURE_SPAWN && site.my !== false) {
      roomNames.add(site.pos.roomName);
    }
  }
  return [...roomNames].sort();
}

function hasDangerousConstructionClaimHostile(room: Room): boolean {
  return getActualHostileCreeps(room).some(hostile =>
    hostile.body.some(part => part.hits > 0 && DANGEROUS_CONSTRUCTION_CLAIM_HOSTILE_PARTS.has(part.type))
  );
}

function isOwnedSpawnConstructionClaimTarget(
  roomName: string,
  empire: ReturnType<typeof memoryManager.getEmpire>
): boolean {
  const room = Game.rooms[roomName];
  const myUsername = getMyUsername();
  if (room) {
    const controller = room.controller;
    if (!controller) return false;
    const owner = controller.owner?.username;
    if (controller.my || owner === myUsername) return false;
    if (owner) return false;

    const reserver = controller.reservation?.username;
    if (reserver && reserver !== myUsername) return false;
    if (hasDangerousConstructionClaimHostile(room)) return false;
    return true;
  }

  const intel = empire.knownRooms[roomName];
  if (!intel) return true;
  if (intel.owner && intel.owner !== myUsername) return false;
  if (intel.reserver && intel.reserver !== myUsername) return false;
  if (intel.threatLevel >= UNSAFE_CONSTRUCTION_TARGET_THREAT_LEVEL) return false;
  if (intel.isHighway || intel.isSK) return false;
  return true;
}

function getOwnedSpawnConstructionClaimTarget(
  homeRoom: string,
  empire: ReturnType<typeof memoryManager.getEmpire>
): string | null {
  const candidates = getOwnedSpawnConstructionSiteRoomNames()
    .filter(roomName => !hasAssignedClaimer(roomName, "claim"))
    .filter(roomName => isOwnedSpawnConstructionClaimTarget(roomName, empire))
    .map(roomName => ({
      roomName,
      distance: getSafeRoomLinearDistance(homeRoom, roomName) ?? 999
    }))
    .filter(candidate => candidate.distance <= OWNED_SPAWN_CONSTRUCTION_CLAIM_MAX_DISTANCE)
    .sort((a, b) => a.distance - b.distance || a.roomName.localeCompare(b.roomName));

  return candidates[0]?.roomName ?? null;
}

/**
 * Choose the next claim/reserve target for a claimer born in a home room.
 *
 * Priority is intentionally unchanged from the facade:
 * recovery reclaim (if GCL allows) -> owned spawn-site claim repair -> expansion queue -> remote reservation.
 */
export function getClaimerSpawnAssignment(homeRoom: string, swarm: SwarmState): ClaimerSpawnAssignment | null {
  const empire = memoryManager.getEmpire();
  const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);

  const canClaimRoom = ownedRooms.length < (Game.gcl?.level ?? 1);
  const expansionClaimsAllowed = canClaimRoom && empire.objectives?.expansionPaused !== true;
  const recoveryTarget = canClaimRoom && isRoomRecoveryReclaimEnabled() ? getRecoveryClaimTarget(empire) : null;
  if (recoveryTarget) {
    return { targetRoom: recoveryTarget, task: "claim" };
  }

  const ownedConstructionTarget = expansionClaimsAllowed ? getOwnedSpawnConstructionClaimTarget(homeRoom, empire) : null;
  if (ownedConstructionTarget) {
    return { targetRoom: ownedConstructionTarget, task: "claim" };
  }

  // Expansion claims use the scored empire queue after live owned spawn-site repairs.
  const claimTargetRooms = expansionClaimsAllowed
    ? new Set([
        ...Object.values(empire.recoveryRooms ?? {}).map(entry => entry.roomName),
        ...getOwnedSpawnConstructionSiteRoomNames(),
        ...empire.claimQueue.filter(candidate => !candidate.claimed).map(candidate => candidate.roomName)
      ])
    : new Set<string>();
  if (expansionClaimsAllowed) {
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
