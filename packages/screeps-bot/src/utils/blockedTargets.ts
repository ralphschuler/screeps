/**
 * Blocked Target Tracking
 *
 * Prevents creeps from repeatedly selecting targets that cause them to get stuck.
 * When a creep is detected as stuck, the current target is blocked for a cooldown period.
 * This forces the creep to try alternative targets instead of cycling endlessly.
 *
 * Design:
 * - Blocked targets stored in creep memory with expiration time
 * - Automatic cleanup of expired blocks
 * - Configurable block duration
 * - Integration with stuck detection in state machine
 */

import type { StuckTrackingMemory } from "../roles/behaviors/types";

/**
 * How long to block a target after it causes a stuck state (in ticks)
 * 50 ticks = ~2.5 minutes, giving time for the situation to change
 * (other creeps may clear the path, resource may decay, etc.)
 */
const BLOCKED_TARGET_DURATION = 50;

/**
 * Block a target to prevent the creep from selecting it again.
 * Called when stuck detection triggers with a specific target.
 *
 * @param creep - The creep that is stuck
 * @param targetId - ID of the target that caused the stuck state
 */
export function blockTarget(creep: Creep, targetId: Id<_HasId>): void {
  const memory = creep.memory as unknown as StuckTrackingMemory;
  
  if (!memory.blockedTargets) {
    memory.blockedTargets = {};
  }
  
  // Block until current time + duration
  const expirationTick = Game.time + BLOCKED_TARGET_DURATION;
  memory.blockedTargets[targetId] = expirationTick;
}

/**
 * Check if a target is currently blocked for this creep.
 * Also cleans up expired blocks automatically.
 *
 * @param creep - The creep to check
 * @param targetId - ID of the target to check
 * @returns true if target is blocked, false otherwise
 */
export function isTargetBlocked(creep: Creep, targetId: Id<_HasId>): boolean {
  const memory = creep.memory as unknown as StuckTrackingMemory;
  
  if (!memory.blockedTargets) {
    return false;
  }
  
  const expirationTick = memory.blockedTargets[targetId];
  
  // No block exists
  if (expirationTick === undefined) {
    return false;
  }
  
  // Block has expired - clean it up
  if (Game.time >= expirationTick) {
    delete memory.blockedTargets[targetId];
    return false;
  }
  
  // Block is active
  return true;
}

/**
 * Clear all blocked targets for a creep.
 * Useful when resetting creep state or when creep reaches a new room.
 *
 * @param creep - The creep to clear blocks for
 */
export function clearBlockedTargets(creep: Creep): void {
  const memory = creep.memory as unknown as StuckTrackingMemory;
  delete memory.blockedTargets;
}

/**
 * Clean up expired blocked targets to keep memory clean.
 * Can be called periodically (e.g., every 10 ticks) to prevent memory bloat.
 *
 * @param creep - The creep to clean up
 */
export function cleanupExpiredBlocks(creep: Creep): void {
  const memory = creep.memory as unknown as StuckTrackingMemory;
  
  if (!memory.blockedTargets) {
    return;
  }
  
  // Filter out expired blocks
  const currentBlocks = memory.blockedTargets;
  const activeBlocks: Record<string, number> = {};
  
  for (const [targetId, expirationTick] of Object.entries(currentBlocks)) {
    if (Game.time < expirationTick) {
      activeBlocks[targetId] = expirationTick;
    }
  }
  
  // Update memory with only active blocks
  if (Object.keys(activeBlocks).length === 0) {
    delete memory.blockedTargets;
  } else {
    memory.blockedTargets = activeBlocks;
  }
}
