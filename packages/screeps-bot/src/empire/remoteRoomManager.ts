/**
 * Remote Room Manager
 *
 * Manages remote room operations:
 * - Detects remote room loss (hostile takeover, reservation loss)
 * - Tracks reservation status and timing
 * - Coordinates remote room defense
 * - Manages remote room assignments
 *
 * Addresses remote mining gaps from Issue: Remote Mining
 */

import { logger } from "../core/logger";
import { memoryManager } from "../memory/manager";
import type { RoomIntel, SwarmState } from "../memory/schemas";

/**
 * Constants for remote room management
 */
const RESERVATION_THRESHOLD_TICKS = 3000; // Trigger reservation renewal below this threshold

/**
 * Remote room status
 */
export interface RemoteRoomStatus {
  /** Room name */
  roomName: string;
  /** Whether room is accessible */
  accessible: boolean;
  /** Whether room needs reservation */
  needsReservation: boolean;
  /** Remaining reservation ticks */
  reservationTicks: number;
  /** Whether room has hostile threats */
  hasThreats: boolean;
  /** Threat level (0-3) */
  threatLevel: number;
  /** Whether room is owned by enemy */
  enemyOwned: boolean;
  /** Whether room is reserved by enemy */
  enemyReserved: boolean;
  /** Last checked tick */
  lastChecked: number;
}

/**
 * Remote room loss reason
 */
export type RemoteRoomLossReason = "enemyOwned" | "enemyReserved" | "hostile" | "inaccessible";

/**
 * Check if a remote room has been lost
 */
export function isRemoteRoomLost(room: Room, homeRoomName: string): { lost: boolean; reason?: RemoteRoomLossReason } {
  // Check if room is owned by someone else
  if (room.controller?.owner && !room.controller.my) {
    return { lost: true, reason: "enemyOwned" };
  }

  // Check if room is reserved by someone else
  const myUsername = getMyUsername();
  if (room.controller?.reservation && room.controller.reservation.username !== myUsername) {
    return { lost: true, reason: "enemyReserved" };
  }

  // Check for hostile threats (aggressive hostiles with ATTACK or RANGED_ATTACK)
  const hostiles = room.find(FIND_HOSTILE_CREEPS);
  const dangerousHostiles = hostiles.filter(h =>
    h.body.some(p => p.type === ATTACK || p.type === RANGED_ATTACK || p.type === WORK)
  );

  if (dangerousHostiles.length >= 2) {
    // Multiple dangerous hostiles = too dangerous for remote mining
    return { lost: true, reason: "hostile" };
  }

  return { lost: false };
}

/**
 * Get remote room status
 */
export function getRemoteRoomStatus(roomName: string, homeRoomName: string): RemoteRoomStatus | null {
  const room = Game.rooms[roomName];
  if (!room) {
    // Can't see the room
    return {
      roomName,
      accessible: false,
      needsReservation: false,
      reservationTicks: 0,
      hasThreats: false,
      threatLevel: 0,
      enemyOwned: false,
      enemyReserved: false,
      lastChecked: Game.time
    };
  }

  const myUsername = getMyUsername();
  const controller = room.controller;

  // Check if room is owned or reserved by enemy
  const enemyOwned = Boolean(controller?.owner && controller.owner.username !== myUsername);
  const enemyReserved = Boolean(
    controller?.reservation && controller.reservation.username !== myUsername
  );

  // Get reservation status
  const reservationTicks = controller?.reservation?.ticksToEnd ?? 0;
  const needsReservation = controller && !enemyOwned && reservationTicks < RESERVATION_THRESHOLD_TICKS;

  // Check for threats
  const hostiles = room.find(FIND_HOSTILE_CREEPS);
  const dangerousHostiles = hostiles.filter(h =>
    h.body.some(p => p.type === ATTACK || p.type === RANGED_ATTACK || p.type === WORK)
  );

  const hasThreats = dangerousHostiles.length > 0;
  const threatLevel = Math.min(3, Math.ceil(dangerousHostiles.length / 2));

  return {
    roomName,
    accessible: true,
    needsReservation: Boolean(needsReservation),
    reservationTicks,
    hasThreats,
    threatLevel,
    enemyOwned,
    enemyReserved,
    lastChecked: Game.time
  };
}

/**
 * Remove lost remote room from assignments
 */
export function removeRemoteRoom(homeRoomName: string, remoteRoomName: string, reason: RemoteRoomLossReason): void {
  const swarm = memoryManager.getSwarmState(homeRoomName);
  if (!swarm) return;

  const remotes = swarm.remoteAssignments ?? [];
  const index = remotes.indexOf(remoteRoomName);

  if (index !== -1) {
    remotes.splice(index, 1);
    swarm.remoteAssignments = remotes;

    // Update intel to mark as lost
    const overmind = memoryManager.getOvermind();
    const intel = overmind.roomIntel[remoteRoomName];
    if (intel) {
      intel.threatLevel = 3;
      intel.lastSeen = Game.time;
    }

    logger.warn(
      `Removed remote room ${remoteRoomName} from ${homeRoomName} due to: ${reason}`,
      { subsystem: "RemoteRoomManager" }
    );
  }
}

/**
 * Check all remote rooms for a home room and remove lost ones
 */
export function checkRemoteRoomStatus(homeRoomName: string): void {
  const swarm = memoryManager.getSwarmState(homeRoomName);
  if (!swarm) return;

  const remotes = swarm.remoteAssignments ?? [];
  if (remotes.length === 0) return;

  for (const remoteName of remotes) {
    const room = Game.rooms[remoteName];
    if (!room) continue; // Can't check rooms without vision

    const lossCheck = isRemoteRoomLost(room, homeRoomName);
    if (lossCheck.lost && lossCheck.reason) {
      removeRemoteRoom(homeRoomName, remoteName, lossCheck.reason);
    }
  }
}

/**
 * Get list of remote rooms that need reservers
 */
export function getRemotesNeedingReservation(homeRoomName: string): string[] {
  const swarm = memoryManager.getSwarmState(homeRoomName);
  if (!swarm) return [];

  const remotes = swarm.remoteAssignments ?? [];
  const needingReservation: string[] = [];

  for (const remoteName of remotes) {
    const status = getRemoteRoomStatus(remoteName, homeRoomName);
    if (status && status.accessible && status.needsReservation && !status.enemyOwned && !status.enemyReserved) {
      needingReservation.push(remoteName);
    }
  }

  return needingReservation;
}

/**
 * Get list of remote rooms that need guards
 */
export function getRemotesNeedingGuards(homeRoomName: string): { roomName: string; threatLevel: number }[] {
  const swarm = memoryManager.getSwarmState(homeRoomName);
  if (!swarm) return [];

  const remotes = swarm.remoteAssignments ?? [];
  const needingGuards: { roomName: string; threatLevel: number }[] = [];

  for (const remoteName of remotes) {
    const status = getRemoteRoomStatus(remoteName, homeRoomName);
    if (status && status.accessible && status.hasThreats && !status.enemyOwned) {
      needingGuards.push({
        roomName: remoteName,
        threatLevel: status.threatLevel
      });
    }
  }

  return needingGuards;
}

/**
 * Get my username (cached)
 */
function getMyUsername(): string {
  const spawns = Object.values(Game.spawns);
  if (spawns.length > 0) {
    return spawns[0].owner.username;
  }
  return "";
}

/**
 * Check if a remote room has an active reserver
 */
export function hasActiveReserver(remoteName: string): boolean {
  for (const creep of Object.values(Game.creeps)) {
    const memory = creep.memory as { role?: string; targetRoom?: string };
    if (memory.role === "claimer" && memory.targetRoom === remoteName) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a remote room has active guards
 */
export function hasActiveGuards(remoteName: string): boolean {
  for (const creep of Object.values(Game.creeps)) {
    const memory = creep.memory as { role?: string; targetRoom?: string };
    if (memory.role === "remoteGuard" && memory.targetRoom === remoteName) {
      return true;
    }
  }
  return false;
}
