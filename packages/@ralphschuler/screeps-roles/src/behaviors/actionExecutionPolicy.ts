export interface ActionExecutionDecision {
  clearState: boolean;
}

export interface RangeActionExecutionInput {
  actionResult: ScreepsReturnCode;
  moveResult?: ScreepsReturnCode;
}

export interface RangeActionExecutionDecision extends ActionExecutionDecision {
  moved: boolean;
  trackMetrics: boolean;
}

/**
 * Result policy for primary Screeps actions.
 */
export function shouldClearStateForActionResult(
  result: ScreepsReturnCode,
): boolean {
  return (
    result === ERR_FULL ||
    result === ERR_NOT_ENOUGH_RESOURCES ||
    result === ERR_INVALID_TARGET ||
    result === ERR_NO_BODYPART
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
  result: ScreepsReturnCode,
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
