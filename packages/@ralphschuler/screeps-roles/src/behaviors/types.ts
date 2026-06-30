/**
 * Creep Behavior Types
 *
 * Bot-specific behavior context types layered on the generic behavior
 * framework. Action unions stay canonical in ../framework/types so executor,
 * task-board, and framework imports cannot drift apart.
 */

import type { SquadMemory, SwarmCreepMemory, SwarmState } from "../memory/schemas";
import type { CreepAction, CreepContext as FrameworkCreepContext } from "../framework/types";

export type { CreepAction, RemoteMoveRouteType } from "../framework/types";

/**
 * Context containing all information a creep needs to make decisions.
 * Pre-computed values avoid redundant room.find() calls.
 */
export interface CreepContext extends FrameworkCreepContext<SwarmCreepMemory> {
  // Room state
  swarmState: SwarmState | undefined;
  squadMemory: SquadMemory | undefined;
}

/**
 * A behavior function takes a context and returns an action.
 * This is the core abstraction for all creep decision making.
 */
export type BehaviorFunction = (ctx: CreepContext) => CreepAction;
