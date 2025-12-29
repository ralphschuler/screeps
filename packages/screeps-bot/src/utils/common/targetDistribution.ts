/**
 * Target Distribution System
 *
 * Prevents multiple creeps from selecting the same target simultaneously,
 * reducing congestion and deadlock scenarios.
 *
 * This system tracks which creeps are currently assigned to which targets
 * and distributes new assignments to balance the load.
 *
 * Key features:
 * - Per-tick target assignment tracking using unified cache
 * - Automatic load balancing based on creep count per target
 * - Fallback to closest target when all targets are equally loaded
 * - Memory-efficient: stored in heap cache with single-tick TTL
 */

import { createLogger } from "../../core/logger";
import { globalCache } from "../../cache";

const logger = createLogger("TargetDistribution");

/** Cache namespace for target assignments */
const ASSIGNMENT_CACHE_NAMESPACE = "targetAssignment";

/** TTL for assignment cache (1 tick - assignments only valid for current tick) */
const ASSIGNMENT_TTL = 1;

// =============================================================================
// Types
// =============================================================================

/**
 * Tracks creep assignments to targets for the current tick
 * 
 * Assignment keys follow the format: `${typeKey}:${targetId}`
 * Example: "source:5bbcabb39099fc012e6397c5" or "container:5bbcacc99099fc012e6397da"
 */
interface TargetAssignmentData {
  /** Map of assignment key to array of creep names */
  assignments: Record<string, string[]>;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Get or create assignment data for a room.
 * Uses unified cache with single-tick TTL for automatic cleanup.
 */
function getAssignmentData(roomName: string): TargetAssignmentData {
  const cached = globalCache.get<TargetAssignmentData>(roomName, {
    namespace: ASSIGNMENT_CACHE_NAMESPACE,
    ttl: ASSIGNMENT_TTL
  });
  
  if (cached) {
    return cached;
  }
  
  // Create new assignment data
  const data: TargetAssignmentData = {
    assignments: {}
  };
  
  globalCache.set(roomName, data, {
    namespace: ASSIGNMENT_CACHE_NAMESPACE,
    ttl: ASSIGNMENT_TTL
  });
  
  return data;
}

/**
 * Find the best target from an array, considering current assignments.
 * Balances creeps across targets to prevent congestion.
 *
 * Strategy:
 * 1. Count how many creeps are already assigned to each target
 * 2. Select target with fewest assignments
 * 3. Tie-break by distance (closest wins)
 * 4. Register assignment for this creep
 *
 * @param creep - The creep looking for a target
 * @param targets - Array of potential targets
 * @param typeKey - Unique key identifying the type of target (e.g., "container", "source")
 * @returns The best distributed target, or null if none found
 */
export function findDistributedTarget<T extends RoomObject & _HasId>(
  creep: Creep,
  targets: T[],
  typeKey: string
): T | null {
  // Fast path: no targets
  if (targets.length === 0) {
    return null;
  }

  // Fast path: only one target
  if (targets.length === 1) {
    registerAssignment(creep, targets[0], typeKey);
    return targets[0];
  }

  const data = getAssignmentData(creep.room.name);
  
  // Count assignments per target and track closest target with minimum assignments
  let bestTarget: T | null = null;
  let minAssignments = Infinity;
  let minDistance = Infinity;
  
  for (const target of targets) {
    const assignmentKey = `${typeKey}:${target.id}`;
    const assignedCreeps = data.assignments[assignmentKey] || [];
    const assignmentCount = assignedCreeps.length;
    const distance = creep.pos.getRangeTo(target.pos);
    
    // Select target with fewer assignments, or closest if tied
    if (assignmentCount < minAssignments || 
        (assignmentCount === minAssignments && distance < minDistance)) {
      bestTarget = target;
      minAssignments = assignmentCount;
      minDistance = distance;
    }
  }
  
  if (bestTarget) {
    registerAssignment(creep, bestTarget, typeKey);
    logger.debug(
      `${creep.name} assigned to ${typeKey} ${bestTarget.id} at ${bestTarget.pos} ` +
      `(${minAssignments} other creeps assigned, distance: ${minDistance})`
    );
  }
  
  return bestTarget;
}

/**
 * Register that a creep is using a specific target.
 * Called internally by findDistributedTarget, but can also be called manually
 * if target selection happens outside this module.
 */
export function registerAssignment<T extends _HasId>(
  creep: Creep,
  target: T,
  typeKey: string
): void {
  const data = getAssignmentData(creep.room.name);
  const assignmentKey = `${typeKey}:${target.id}`;
  
  const assigned = data.assignments[assignmentKey] || [];
  // Only add if not already assigned (prevent duplicates)
  if (!assigned.includes(creep.name)) {
    assigned.push(creep.name);
    data.assignments[assignmentKey] = assigned;
    
    // Update cache with modified data
    globalCache.set(creep.room.name, data, {
      namespace: ASSIGNMENT_CACHE_NAMESPACE,
      ttl: ASSIGNMENT_TTL
    });
  }
}

/**
 * Get the number of creeps currently assigned to a target.
 * Useful for debugging or custom target selection logic.
 */
export function getAssignmentCount(
  roomName: string,
  targetId: Id<_HasId>,
  typeKey: string
): number {
  const data = getAssignmentData(roomName);
  const assignmentKey = `${typeKey}:${targetId}`;
  const assigned = data.assignments[assignmentKey] || [];
  return assigned.length;
}

/**
 * Get all creeps assigned to a target.
 * Useful for debugging or coordination logic.
 */
export function getAssignedCreeps(
  roomName: string,
  targetId: Id<_HasId>,
  typeKey: string
): string[] {
  const data = getAssignmentData(roomName);
  const assignmentKey = `${typeKey}:${targetId}`;
  return data.assignments[assignmentKey] || [];
}
