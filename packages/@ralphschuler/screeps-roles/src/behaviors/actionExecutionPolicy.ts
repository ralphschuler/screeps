export type ActionResultCode = ScreepsReturnCode | ERR_ACCESS_DENIED;

export interface ActionExecutionDecision {
  clearState: boolean;
}

export interface RangeActionExecutionInput {
  actionResult: ActionResultCode;
  moveResult?: ScreepsReturnCode;
}

export interface RangeActionExecutionDecision extends ActionExecutionDecision {
  moved: boolean;
  trackMetrics: boolean;
}

export const SCOUT_IDLE_COLLECTION_MOVE_INTERVAL = 25;

export interface IdleCollectionMoveInput {
  role: string;
  currentTick: number;
  lastIdleCollectionMoveTick?: number;
  throttleInterval?: number;
}

/**
 * Idle scouts can dominate CPU when the executor repeatedly paths them back to
 * owned-room collection points. Non-scout idle movement remains unchanged;
 * scouts get a small per-creep cooldown while still allowing corrupt/future
 * timestamps to self-heal on the next idle tick.
 */
export function shouldAttemptIdleCollectionMove({
  role,
  currentTick,
  lastIdleCollectionMoveTick,
  throttleInterval = SCOUT_IDLE_COLLECTION_MOVE_INTERVAL,
}: IdleCollectionMoveInput): boolean {
  if (role !== "scout") return true;
  if (lastIdleCollectionMoveTick === undefined) return true;
  if (lastIdleCollectionMoveTick > currentTick) return true;
  return currentTick - lastIdleCollectionMoveTick >= throttleInterval;
}

/**
 * Result policy for primary Screeps actions.
 */
export function shouldClearStateForActionResult(
  result: ActionResultCode,
): boolean {
  return (
    result === ERR_FULL ||
    result === ERR_NOT_ENOUGH_RESOURCES ||
    result === ERR_INVALID_TARGET ||
    result === ERR_NO_BODYPART ||
    result === ERR_ACCESS_DENIED
  );
}

/**
 * Result policy for movement and pathing attempts.
 */
export function shouldClearStateForMoveResult(
  result: ScreepsReturnCode,
): boolean {
  return result === ERR_NO_PATH;
}

export function decideActionExecution(
  result: ActionResultCode,
): ActionExecutionDecision {
  return { clearState: shouldClearStateForActionResult(result) };
}

export function decideMoveExecution(
  result: ScreepsReturnCode,
): ActionExecutionDecision {
  return { clearState: shouldClearStateForMoveResult(result) };
}

export function decideRangeActionExecution(
  input: RangeActionExecutionInput,
): RangeActionExecutionDecision {
  if (input.actionResult === ERR_NOT_IN_RANGE) {
    return {
      clearState:
        input.moveResult !== undefined &&
        shouldClearStateForMoveResult(input.moveResult),
      moved: true,
      trackMetrics: false,
    };
  }

  return {
    clearState: shouldClearStateForActionResult(input.actionResult),
    moved: false,
    trackMetrics: input.actionResult === OK,
  };
}
