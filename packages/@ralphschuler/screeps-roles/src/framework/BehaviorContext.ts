/**
 * Behavior context compatibility shim.
 *
 * The canonical implementation lives in ../behaviors/context. Keep this module so
 * older deep imports from src/framework/BehaviorContext continue to compile while
 * avoiding a second stale room-cache implementation.
 */

import {
  clearRoomCaches as clearCanonicalRoomCaches,
  createContext as createCanonicalContext
} from "../behaviors/context";
import type { CreepContext as CanonicalCreepContext } from "../behaviors/types";
import type { BaseCreepMemory, CreepContext } from "./types";

const assertCanonicalContextCompatibility: CanonicalCreepContext extends CreepContext ? true : never = true;
void assertCanonicalContextCompatibility;

/**
 * Create a creep behavior context using the canonical behavior framework.
 */
export function createContext<TMemory extends BaseCreepMemory = BaseCreepMemory>(
  creep: Creep
): CreepContext<TMemory> {
  const context: CreepContext = createCanonicalContext(creep);
  return context as CreepContext<TMemory>;
}

/** Clear per-tick room caches used by behavior context creation. */
export function clearRoomCaches(): void {
  clearCanonicalRoomCaches();
}
