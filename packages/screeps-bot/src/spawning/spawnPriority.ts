/**
 * Spawn Priority Module
 * 
 * Calculates dynamic spawn priorities based on:
 * - Room posture (eco, expand, defensive, war, siege, evacuate, nukePrep)
 * - Pheromone levels (harvest, logistics, build, defense, etc.)
 * - Dynamic conditions (threats, focus rooms)
 * 
 * TODO: Investigate military overallocation in defensive posture
 * Analysis date: 2025-12-28
 * Observed pattern: Rooms in defensive posture spawn excessive military creeps (60%+ of total)
 * Investigation needed:
 * 1. Check if room posture is stuck on "defensive"/"war" instead of "eco"
 * 2. Verify danger level and threat assessment in roomNode.ts
 * 3. Review pheromone.defense values - may be stuck high
 * 4. Consider adding auto-recovery: defensive→eco when no hostiles for N ticks
 * 5. Review getDefenderPriorityBoost() for excessive military spawn triggers
 * Related: See SHARD3_INVESTIGATION.md for detailed analysis
 */

import type { SwarmState } from "../memory/schemas";
import { memoryManager } from "../memory/manager";
import { getDefenderPriorityBoost } from "./defenderManager";

/** Priority boost for upgraders in focus rooms */
const FOCUS_ROOM_UPGRADER_PRIORITY_BOOST = 40;

/**
 * Get spawn weight multipliers based on room posture.
 * These weights adjust role priorities based on the room's current strategic stance.
 * 
 * @param posture - Current room posture (eco, expand, defensive, war, siege, evacuate, nukePrep)
 * @returns Record mapping role names to weight multipliers
 */
export function getPostureSpawnWeights(posture: string): Record<string, number> {
  switch (posture) {
    case "eco":
      return {
        harvester: 1.5,
        hauler: 1.2,
        upgrader: 1.3,
        builder: 1.0,
        queenCarrier: 1.0,
        guard: 0.3,
        remoteGuard: 0.8,
        healer: 0.1,
        scout: 1.0,
        claimer: 0.8,
        engineer: 0.8,
        remoteHarvester: 1.2,
        remoteHauler: 1.2,
        interRoomCarrier: 1.0
      };
    case "expand":
      return {
        harvester: 1.2,
        hauler: 1.0,
        upgrader: 0.8,
        builder: 1.0,
        queenCarrier: 0.8,
        guard: 0.3,
        remoteGuard: 1.0,
        scout: 1.5,
        claimer: 1.5,
        remoteWorker: 1.5,
        engineer: 0.5,
        remoteHarvester: 1.5,
        remoteHauler: 1.5,
        interRoomCarrier: 1.2
      };
    case "defensive":
      return {
        harvester: 1.0,
        hauler: 1.0,
        upgrader: 0.5,
        builder: 0.5,
        queenCarrier: 1.0,
        guard: 2.0,
        remoteGuard: 1.8,
        healer: 1.5,
        ranger: 1.0,
        scout: 0.0, // No scouts during defensive operations
        engineer: 1.2,
        remoteHarvester: 0.5,
        remoteHauler: 0.5,
        interRoomCarrier: 1.5
      };
    case "war":
      return {
        harvester: 0.8,
        hauler: 0.8,
        upgrader: 0.3,
        builder: 0.3,
        queenCarrier: 1.0,
        guard: 2.5,
        healer: 2.0,
        soldier: 2.0,
        ranger: 1.5,
        scout: 0.0, // No scouts during war operations
        engineer: 0.5,
        remoteHarvester: 0.3,
        remoteHauler: 0.3,
        interRoomCarrier: 0.5
      };
    case "siege":
      return {
        harvester: 0.5,
        hauler: 0.5,
        upgrader: 0.1,
        builder: 0.1,
        queenCarrier: 1.0,
        guard: 3.0,
        healer: 2.5,
        soldier: 2.5,
        siegeUnit: 2.0,
        ranger: 1.0,
        scout: 0.0, // No scouts during siege operations
        engineer: 0.2,
        remoteHarvester: 0.1,
        remoteHauler: 0.1
      };
    case "evacuate":
      return {
        hauler: 2.0,
        queenCarrier: 1.5
      };
    case "nukePrep":
      return {
        harvester: 1.0,
        hauler: 1.0,
        upgrader: 0.5,
        builder: 0.5,
        queenCarrier: 1.0,
        guard: 1.5,
        scout: 0.5,
        engineer: 2.0,
        remoteHarvester: 0.5,
        remoteHauler: 0.5
      };
    default:
      return {
        harvester: 1.0,
        hauler: 1.0,
        upgrader: 1.0,
        builder: 1.0,
        queenCarrier: 1.0,
        scout: 1.0,
        remoteHarvester: 1.0,
        remoteHauler: 1.0
      };
  }
}

/**
 * Get dynamic priority boost for specific roles based on current conditions.
 * 
 * @param room - The room to check
 * @param swarm - Swarm state with threat and cluster info
 * @param role - Role name to calculate boost for
 * @returns Priority boost value (added to base priority)
 */
export function getDynamicPriorityBoost(room: Room, swarm: SwarmState, role: string): number {
  let boost = 0;

  // Defender priority boost based on threats
  if (role === "guard" || role === "ranger" || role === "healer") {
    boost += getDefenderPriorityBoost(room, swarm, role);
  }

  // Upgrader priority boost for focus room
  if (role === "upgrader" && swarm.clusterId) {
    const cluster = memoryManager.getCluster(swarm.clusterId);
    if (cluster?.focusRoom === room.name) {
      boost += FOCUS_ROOM_UPGRADER_PRIORITY_BOOST;
    }
  }

  return boost;
}

/**
 * Get pheromone-based multiplier for a role.
 * Pheromones represent the swarm's emergent focus areas and adjust spawn priorities accordingly.
 * 
 * @param role - Role name to get multiplier for
 * @param pheromones - Current pheromone levels
 * @returns Multiplier value (0.5 to 2.0 range)
 */
export function getPheromoneMult(role: string, pheromones: Record<string, number>): number {
  const map: Record<string, string> = {
    harvester: "harvest",
    hauler: "logistics",
    upgrader: "upgrade",
    builder: "build",
    guard: "defense",
    remoteGuard: "defense",
    healer: "defense",
    soldier: "war",
    siegeUnit: "siege",
    ranger: "war",
    scout: "expand",
    claimer: "expand",
    remoteWorker: "expand",
    engineer: "build",
    remoteHarvester: "harvest",
    remoteHauler: "logistics",
    interRoomCarrier: "logistics"
  };

  const pheromoneKey = map[role];
  if (!pheromoneKey) return 1.0;

  const value = pheromones[pheromoneKey] ?? 0;
  return 0.5 + (value / 100) * 1.5;
}
