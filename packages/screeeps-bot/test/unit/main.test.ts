import {assert} from "chai";
import {loop} from "../../src/main";
import {Game, Memory} from "./mock"
import {memoryManager} from "../../src/SwarmBot";

describe("main", () => {
  before(() => {
    // runs before all test in this block
  });

  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
    // Reset the memory manager's initialized state
    // @ts-ignore: Accessing private property for testing
    memoryManager["initialized"] = false;
  });

  it("should export a loop function", () => {
    assert.isTrue(typeof loop === "function");
  });

  it("should return void when called with no context", () => {
    assert.isUndefined(loop());
  });

  it("Automatically delete memory of missing creeps", () => {
    // @ts-ignore: Allow setting test values
    global.Memory.creeps.persistValue = "any value";
    // @ts-ignore: Allow setting test values
    global.Memory.creeps.notPersistValue = "any value";

    // @ts-ignore: Allow setting test values
    global.Game.creeps.persistValue = "any value";

    loop();

    // @ts-ignore: Allow checking test values
    assert.isDefined(global.Memory.creeps.persistValue);
    // @ts-ignore: Allow checking test values
    assert.isUndefined(global.Memory.creeps.notPersistValue);
  });
});
