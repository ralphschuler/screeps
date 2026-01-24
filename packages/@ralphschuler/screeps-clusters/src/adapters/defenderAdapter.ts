/**
 * Defender Adapter
 * 
 * Stub implementations for defender manager functions.
 * These are simplified versions that allow the cluster code to compile.
 * Full implementation should be provided by the consuming bot code.
 */

import type { SwarmState } from "../types";

/**
 * Defense request structure
 */
export interface DefenseRequest {
  /** Room requesting assistance */
  roomName: string;
  /** Number of guards needed */
  guardsNeeded: number;
  /** Number of rangers needed */
  rangersNeeded: number;
  /** Number of healers needed */
  healersNeeded: number;
  /** Urgency level (1-3) */
  urgency: number;
  /** Game tick when request was created */
  createdAt: number;
  /** Brief description of the threat */
  threat: string;
}

/**
 * Check if a room needs defense assistance
 * Stub implementation - always returns false
 */
export function needsDefenseAssistance(room: Room, swarm?: SwarmState): boolean {
  // Stub implementation
  // Real implementation should analyze defenders and threats
  if (!swarm || swarm.danger < 1) {
    return false;
  }
  
  // Simple check: if danger level is high and no towers
  const towers = room.find(FIND_MY_STRUCTURES, {
    filter: (s) => s.structureType === STRUCTURE_TOWER
  });
  
  return swarm.danger >= 2 && towers.length === 0;
}

/**
 * Create a defense request for a room
 * Stub implementation - returns null
 */
export function createDefenseRequest(room: Room, swarm?: SwarmState): DefenseRequest | null {
  if (!needsDefenseAssistance(room, swarm)) {
    return null;
  }
  
  // Stub implementation
  const danger = swarm?.danger || 0;
  
  return {
    roomName: room.name,
    guardsNeeded: danger >= 2 ? 2 : 1,
    rangersNeeded: danger >= 3 ? 2 : 1,
    healersNeeded: danger >= 3 ? 1 : 0,
    urgency: danger,
    createdAt: Game.time,
    threat: `Danger level ${danger}`
  };
}
