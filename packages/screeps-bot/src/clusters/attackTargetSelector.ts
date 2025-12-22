/**
 * Attack Target Selector
 *
 * Strategic target selection for offensive operations.
 * Evaluates potential targets based on:
 * - Room value (RCL, resources, strategic position)
 * - Defenses (towers, walls, military presence)
 * - Distance from owned rooms
 * - Current war status
 * - Nuke coordination opportunities
 *
 * Addresses ROADMAP Section 12: Attack target selection
 */

import type { ClusterMemory, RoomIntel } from "../memory/schemas";
import { logger } from "../core/logger";
import { memoryManager } from "../memory/manager";
import type { OffensiveDoctrine } from "./offensiveDoctrine";
import { selectDoctrine } from "./offensiveDoctrine";

/**
 * Attack cooldown period in ticks (5000 ticks ≈ 4 hours at 20 ticks/sec)
 * Prevents spamming attacks on the same room
 */
const ATTACK_COOLDOWN_TICKS = 5000;

/**
 * Attack target with scoring
 */
export interface AttackTarget {
  /** Target room name */
  roomName: string;
  /** Target score (higher = better target) */
  score: number;
  /** Distance from nearest cluster room */
  distance: number;
  /** Recommended doctrine */
  doctrine: OffensiveDoctrine;
  /** Target type */
  type: "enemy" | "neutral" | "hostile";
  /** Intel used for scoring */
  intel: RoomIntel;
}

/**
 * Target scoring weights
 */
interface ScoringWeights {
  /** Weight for RCL value */
  rclWeight: number;
  /** Weight for resource value */
  resourceWeight: number;
  /** Weight for strategic position */
  strategicWeight: number;
  /** Penalty for distance */
  distancePenalty: number;
  /** Bonus for weakly defended */
  weakDefenseBonus: number;
  /** Penalty for heavily defended */
  strongDefensePenalty: number;
  /** Bonus for existing war target */
  warTargetBonus: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  rclWeight: 10,
  resourceWeight: 5,
  strategicWeight: 3,
  distancePenalty: 2,
  weakDefenseBonus: 20,
  strongDefensePenalty: 15,
  warTargetBonus: 50
};

/**
 * Find potential attack targets for a cluster
 */
export function findAttackTargets(
  cluster: ClusterMemory,
  maxDistance = 10,
  maxTargets = 5,
  weights: Partial<ScoringWeights> = {}
): AttackTarget[] {
  const finalWeights = { ...DEFAULT_WEIGHTS, ...weights };
  const targets: AttackTarget[] = [];
  
  const empire = memoryManager.getEmpire();
  const roomIntel = empire.knownRooms;
  const warTargets = new Set(empire.warTargets);

  // Get all known rooms
  for (const roomName in roomIntel) {
    const intel = roomIntel[roomName];
    
    // Skip if not scouted
    if (!intel.scouted) continue;
    
    // Skip our own rooms
    if (intel.owner === "self") continue;
    
    // Skip highway and SK rooms
    if (intel.isHighway || intel.isSK) continue;
    
    // Calculate distance from cluster
    const distance = getMinDistanceFromCluster(cluster, roomName);
    if (distance > maxDistance) continue;
    
    // Skip if too recent (avoid spam attacks)
    const lastAttacked = (Memory as any).lastAttacked?.[roomName] ?? 0;
    if (Game.time - lastAttacked < ATTACK_COOLDOWN_TICKS) continue;
    
    // Calculate score
    const score = scoreTarget(intel, distance, warTargets.has(roomName), finalWeights);
    
    // Determine target type
    let type: AttackTarget["type"] = "neutral";
    if (intel.owner) {
      type = warTargets.has(intel.owner) || warTargets.has(roomName) ? "enemy" : "hostile";
    }
    
    // Select doctrine
    const doctrine = selectDoctrine(roomName, {
      towerCount: intel.towerCount,
      spawnCount: intel.spawnCount,
      rcl: intel.controllerLevel,
      owner: intel.owner
    });
    
    targets.push({
      roomName,
      score,
      distance,
      doctrine,
      type,
      intel
    });
  }
  
  // Sort by score (descending) and return top N
  targets.sort((a, b) => b.score - a.score);
  
  const selectedTargets = targets.slice(0, maxTargets);
  
  if (selectedTargets.length > 0) {
    logger.info(
      `Found ${selectedTargets.length} attack targets for cluster ${cluster.id}: ` +
      selectedTargets.map(t => `${t.roomName}(${t.score.toFixed(0)})`).join(", "),
      { subsystem: "AttackTarget" }
    );
  }
  
  return selectedTargets;
}

/**
 * Score a potential target room
 */
function scoreTarget(
  intel: RoomIntel,
  distance: number,
  isWarTarget: boolean,
  weights: ScoringWeights
): number {
  let score = 0;
  
  // Base value from RCL
  score += intel.controllerLevel * weights.rclWeight;
  
  // Resource value (presence of storage/terminal indicators)
  if (intel.controllerLevel >= 6) {
    score += weights.resourceWeight * 5;
  } else if (intel.controllerLevel >= 4) {
    score += weights.resourceWeight * 2;
  }
  
  // Strategic position (rooms with many sources are valuable)
  score += intel.sources * weights.strategicWeight;
  
  // Distance penalty
  score -= distance * weights.distancePenalty;
  
  // Defense scoring
  const towers = intel.towerCount ?? 0;
  const spawns = intel.spawnCount ?? 0;
  
  if (towers === 0 && spawns <= 1) {
    // Weak defense bonus
    score += weights.weakDefenseBonus;
  } else if (towers >= 4 || (towers >= 2 && spawns >= 2)) {
    // Strong defense penalty
    score -= weights.strongDefensePenalty;
  }
  
  // War target bonus
  if (isWarTarget) {
    score += weights.warTargetBonus;
  }
  
  // Threat level penalty (dangerous rooms are less attractive unless war target)
  if (intel.threatLevel >= 2 && !isWarTarget) {
    score -= intel.threatLevel * 10;
  }
  
  return Math.max(0, score);
}

/**
 * Get minimum distance from any room in the cluster
 */
function getMinDistanceFromCluster(cluster: ClusterMemory, targetRoom: string): number {
  let minDistance = Infinity;
  
  for (const roomName of cluster.memberRooms) {
    const distance = Game.map.getRoomLinearDistance(roomName, targetRoom);
    if (distance < minDistance) {
      minDistance = distance;
    }
  }
  
  return minDistance;
}

/**
 * Select best target for a specific doctrine
 */
export function selectTargetForDoctrine(
  cluster: ClusterMemory,
  doctrine: OffensiveDoctrine,
  maxDistance = 10
): AttackTarget | null {
  const targets = findAttackTargets(cluster, maxDistance, 10);
  
  // Filter targets that match the doctrine
  const matchingTargets = targets.filter(t => t.doctrine === doctrine);
  
  if (matchingTargets.length === 0) {
    logger.debug(`No targets found for doctrine ${doctrine}`, {
      subsystem: "AttackTarget"
    });
    return null;
  }
  
  // Return highest scoring target
  return matchingTargets[0]!;
}

/**
 * Validate that a target is still valid
 */
export function validateTarget(targetRoom: string): boolean {
  const empire = memoryManager.getEmpire();
  const intel = empire.knownRooms[targetRoom];
  
  if (!intel) {
    logger.warn(`No intel for target ${targetRoom}`, { subsystem: "AttackTarget" });
    return false;
  }
  
  // Check if target was recently seen (use same cooldown constant for consistency)
  if (Game.time - intel.lastSeen > ATTACK_COOLDOWN_TICKS) {
    logger.warn(`Intel for ${targetRoom} is stale (${Game.time - intel.lastSeen} ticks old)`, {
      subsystem: "AttackTarget"
    });
    return false;
  }
  
  return true;
}

/**
 * Mark a room as attacked (to prevent spam)
 */
export function markRoomAttacked(roomName: string): void {
  if (!(Memory as any).lastAttacked) {
    (Memory as any).lastAttacked = {};
  }
  (Memory as any).lastAttacked[roomName] = Game.time;
  
  logger.info(`Marked ${roomName} as attacked at tick ${Game.time}`, {
    subsystem: "AttackTarget"
  });
}

/**
 * Check if a room can be attacked (not recently attacked)
 */
export function canAttackRoom(roomName: string, cooldown: number = ATTACK_COOLDOWN_TICKS): boolean {
  const lastAttacked = (Memory as any).lastAttacked?.[roomName] ?? 0;
  return Game.time - lastAttacked >= cooldown;
}
