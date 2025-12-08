/**
 * Move Intent Cache - Performance Optimization
 *
 * Prevents duplicate move() calls on the same creep in a single tick.
 * Multiple move() calls override each other, wasting CPU.
 *
 * Design Principles (from ROADMAP.md Section 2):
 * - Avoid wasting CPU on redundant operations
 * - Track move intents per tick
 *
 * Problem:
 * - When multiple systems try to move the same creep, only the last move() counts
 * - Each move() call costs ~0.002-0.003 CPU
 * - With complex behavior trees, a creep might have 3-5 move attempts
 * - 100 creeps × 3 redundant moves = 0.6-0.9 CPU wasted per tick
 *
 * Solution:
 * - Track which creeps have already moved this tick
 * - Prevent duplicate move() calls
 * - Log warnings when duplicates are detected for debugging
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Move intent tracking store
 */
interface MoveIntentStore {
  tick: number;
  movedCreeps: Set<string>;
  duplicateAttempts: number;
}

// =============================================================================
// Cache Storage
// =============================================================================

/**
 * Get or initialize the move intent store
 */
function getMoveIntentStore(): MoveIntentStore {
  const g = global as any;
  if (!g._moveIntentCache || g._moveIntentCache.tick !== Game.time) {
    g._moveIntentCache = {
      tick: Game.time,
      movedCreeps: new Set(),
      duplicateAttempts: 0
    };
  }
  return g._moveIntentCache as MoveIntentStore;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Execute a move action only if the creep hasn't moved this tick.
 * Prevents duplicate move() calls that waste CPU.
 *
 * @param creep - Creep to move
 * @param moveAction - Function that performs the move (returns OK, ERR_*, etc)
 * @param debugLabel - Optional label for debugging duplicate attempts
 * @returns Move result code, or ERR_BUSY if creep already moved
 */
export function executeMoveOnce(
  creep: Creep,
  moveAction: () => ScreepsReturnCode,
  debugLabel?: string
): ScreepsReturnCode {
  const store = getMoveIntentStore();
  
  // Check if creep has already moved this tick
  if (store.movedCreeps.has(creep.name)) {
    store.duplicateAttempts++;
    
    // Log warning occasionally to help identify duplicate move sources
    if (Game.time % 100 === 0 && store.duplicateAttempts > 10) {
      console.log(
        `[MoveIntentCache] Tick ${Game.time}: Prevented ${store.duplicateAttempts} duplicate moves` +
        (debugLabel ? ` (last: ${debugLabel} for ${creep.name})` : '')
      );
    }
    
    return ERR_BUSY; // Return error code indicating creep already has a move intent
  }
  
  // Execute the move action
  const result = moveAction();
  
  // Mark creep as moved (regardless of success) to prevent further attempts
  // This is intentional - even failed moves should prevent duplicates
  if (result !== ERR_TIRED && result !== ERR_BUSY) {
    store.movedCreeps.add(creep.name);
  }
  
  return result;
}

/**
 * Check if a creep has already moved this tick.
 *
 * @param creep - Creep to check
 * @returns true if creep has already moved
 */
export function hasMovedThisTick(creep: Creep): boolean {
  const store = getMoveIntentStore();
  return store.movedCreeps.has(creep.name);
}

/**
 * Mark a creep as having moved this tick.
 * Use this when move() is called directly without executeMoveOnce().
 *
 * @param creep - Creep that moved
 */
export function markAsMoved(creep: Creep): void {
  const store = getMoveIntentStore();
  store.movedCreeps.add(creep.name);
}

/**
 * Get statistics about move intents this tick.
 *
 * @returns Stats object
 */
export function getMoveIntentStats(): {
  tick: number;
  movedCreeps: number;
  duplicateAttempts: number;
} {
  const store = getMoveIntentStore();
  return {
    tick: store.tick,
    movedCreeps: store.movedCreeps.size,
    duplicateAttempts: store.duplicateAttempts
  };
}

/**
 * Manually clear the cache (normally happens automatically each tick).
 * Only needed for testing.
 */
export function clearMoveIntentCache(): void {
  const g = global as any;
  if (g._moveIntentCache) {
    g._moveIntentCache.movedCreeps.clear();
    g._moveIntentCache.duplicateAttempts = 0;
  }
}
