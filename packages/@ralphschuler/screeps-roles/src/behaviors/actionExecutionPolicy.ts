export interface ActionExecutionDecision {
  clearState: boolean;
}

/**
 * Result policy for primary Screeps actions.
 */
export function shouldClearStateForActionResult(result: ScreepsReturnCode): boolean {
  return result === ERR_FULL || result === ERR_NOT_ENOUGH_RESOURCES || result === ERR_INVALID_TARGET;
}

/**
 * Result policy for movement and pathing attempts.
 */
export function shouldClearStateForMoveResult(result: ScreepsReturnCode): boolean {
  return result === ERR_NO_PATH;
}

export function decideActionExecution(result: ScreepsReturnCode): ActionExecutionDecision {
  return { clearState: shouldClearStateForActionResult(result) };
}

export function decideMoveExecution(result: ScreepsReturnCode): ActionExecutionDecision {
  return { clearState: shouldClearStateForMoveResult(result) };
}
