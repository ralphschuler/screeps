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
 * - Per-tick target assignment tracking
 * - Automatic load balancing based on creep count per target
 * - Fallback to closest target when all targets are equally loaded
 * - Memory-efficient: stored in global cache, not Memory
 */

import { createLogger } from "../core/logger";

const logger = createLogger("TargetDistribution");

// =============================================================================
// Types
// =============================================================================

/**
 * Tracks creep assignments to targets for the current tick
 */
interface TargetAssignment {
  /** Map of target ID to array of creep names assigned to it */
  assignments: Map<string, string[]>;
  /** Tick when this assignment map was created */
  tick: number;
}

// =============================================================================
// Global Cache
// =============================================================================

/**
 * Per-room target assignment cache
 * Key: room name
 * Value: target assignment data
 */
const roomAssignments = new Map<string, TargetAssignment>();

/**
 * Clear stale assignment data at the start of each tick
 * Called from main loop
 */
export function clearTargetAssignments(): void {
  roomAssignments.clear();
}

/**
 * Get or create target assignment tracker for a room
 */
function getAssignmentTracker(roomName: string): TargetAssignment {
  let tracker = roomAssignments.get(roomName);
  
  if (!tracker || tracker.tick !== Game.time) {
    tracker = {
      assignments: new Map<string, string[]>(),
      tick: Game.time
    };
    roomAssignments.set(roomName, tracker);
  }
  
  return tracker;
}

// =============================================================================
// Public API
// =============================================================================

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

  const tracker = getAssignmentTracker(creep.room.name);
  
  // Count assignments per target and track closest target with minimum assignments
  let bestTarget: T | null = null;
  let minAssignments = Infinity;
  let minDistance = Infinity;
  
  for (const target of targets) {
    const assignmentKey = `${typeKey}:${target.id}`;
    const assignedCreeps = tracker.assignments.get(assignmentKey) || [];
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
  const tracker = getAssignmentTracker(creep.room.name);
  const assignmentKey = `${typeKey}:${target.id}`;
  
  const assigned = tracker.assignments.get(assignmentKey) || [];
  // Only add if not already assigned (prevent duplicates)
  if (!assigned.includes(creep.name)) {
    assigned.push(creep.name);
    tracker.assignments.set(assignmentKey, assigned);
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
  const tracker = getAssignmentTracker(roomName);
  const assignmentKey = `${typeKey}:${targetId}`;
  const assigned = tracker.assignments.get(assignmentKey) || [];
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
  const tracker = getAssignmentTracker(roomName);
  const assignmentKey = `${typeKey}:${targetId}`;
  return tracker.assignments.get(assignmentKey) || [];
}
