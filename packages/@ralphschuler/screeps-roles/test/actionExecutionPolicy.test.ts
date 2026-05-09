import { expect } from "chai";
import "./setup.ts";
import {
  decideRangeActionExecution,
  shouldClearStateForActionResult,
  shouldClearStateForMoveResult,
} from "../src/behaviors/actionExecutionPolicy.ts";

describe("Action Execution Policy", () => {
  it("should clear state for invalid action targets", () => {
    expect(shouldClearStateForActionResult(ERR_FULL)).to.equal(true);
    expect(shouldClearStateForActionResult(ERR_NOT_ENOUGH_RESOURCES)).to.equal(
      true,
    );
    expect(shouldClearStateForActionResult(ERR_INVALID_TARGET)).to.equal(true);
  });

  it("should retain state for successful and retryable action results", () => {
    expect(shouldClearStateForActionResult(OK)).to.equal(false);
    expect(shouldClearStateForActionResult(ERR_NOT_IN_RANGE)).to.equal(false);
    expect(shouldClearStateForActionResult(ERR_BUSY)).to.equal(false);
  });

  it("should clear state only for no-path movement", () => {
    expect(shouldClearStateForMoveResult(ERR_NO_PATH)).to.equal(true);
    expect(shouldClearStateForMoveResult(OK)).to.equal(false);
    expect(shouldClearStateForMoveResult(ERR_TIRED)).to.equal(false);
  });

  it("describes range action lifecycle decisions from action and move results", () => {
    expect(decideRangeActionExecution({ actionResult: OK })).to.deep.equal({
      clearState: false,
      moved: false,
      trackMetrics: true,
    });
    expect(
      decideRangeActionExecution({ actionResult: ERR_FULL }),
    ).to.deep.equal({
      clearState: true,
      moved: false,
      trackMetrics: false,
    });
    expect(
      decideRangeActionExecution({
        actionResult: ERR_NOT_IN_RANGE,
        moveResult: OK,
      }),
    ).to.deep.equal({
      clearState: false,
      moved: true,
      trackMetrics: false,
    });
    expect(
      decideRangeActionExecution({
        actionResult: ERR_NOT_IN_RANGE,
        moveResult: ERR_NO_PATH,
      }),
    ).to.deep.equal({
      clearState: true,
      moved: true,
      trackMetrics: false,
    });
  });
});
