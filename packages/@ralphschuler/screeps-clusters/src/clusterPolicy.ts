import type { ClusterMemory } from "./types";

export type ClusterRole = ClusterMemory["role"];

export interface RoomRclSnapshot {
  roomName: string;
  rcl: number;
}

export interface FocusRoomDecision {
  focusRoom: string | undefined;
  reason: "unchanged" | "cleared-complete" | "cleared-missing" | "selected" | "none-eligible";
}

/**
 * Cluster role policy based on aggregate metrics.
 */
export function decideClusterRole(metrics: Pick<ClusterMemory["metrics"], "warIndex" | "economyIndex">): ClusterRole {
  const { warIndex, economyIndex } = metrics;

  if (warIndex > 50) {
    return "war";
  }
  if (economyIndex > 70 && warIndex < 20) {
    return "economic";
  }
  if (economyIndex < 40) {
    return "frontier";
  }
  return "mixed";
}

/**
 * Military readiness as a percentage of expected RCL-scaled room capacity.
 */
export function calculateMilitaryReadinessRatio(militaryCreeps: number, totalRoomCapacity: number): number {
  if (totalRoomCapacity === 0) return 0;
  return Math.min(100, Math.round((militaryCreeps / totalRoomCapacity) * 100));
}

/**
 * Expected military slots for a room at a given RCL.
 */
export function expectedMilitaryCapacityForRcl(rcl: number): number {
  return Math.max(2, Math.floor(rcl / 2));
}

/**
 * Select or retain the focus room for sequential upgrading.
 */
export function decideFocusRoom(
  currentFocusRoom: string | undefined,
  currentFocusRcl: number | undefined,
  roomsWithRcl: RoomRclSnapshot[]
): FocusRoomDecision {
  if (roomsWithRcl.length === 0) {
    return { focusRoom: currentFocusRoom, reason: "unchanged" };
  }

  if (currentFocusRoom !== undefined) {
    if (currentFocusRcl === 8) {
      currentFocusRoom = undefined;
    } else if (currentFocusRcl === undefined) {
      currentFocusRoom = undefined;
    } else {
      return { focusRoom: currentFocusRoom, reason: "unchanged" };
    }
  }

  const eligibleRooms = roomsWithRcl.filter(room => room.rcl < 8);
  if (eligibleRooms.length === 0) {
    return { focusRoom: undefined, reason: "none-eligible" };
  }

  eligibleRooms.sort((a, b) => {
    if (a.rcl !== b.rcl) return a.rcl - b.rcl;
    return a.roomName.localeCompare(b.roomName);
  });

  return { focusRoom: eligibleRooms[0].roomName, reason: "selected" };
}
