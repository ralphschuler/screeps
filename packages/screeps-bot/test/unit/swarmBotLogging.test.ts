import { expect, assert } from "chai";
import { Game as MockGame, Memory as MockMemory } from "./mock";

// Use global sinon from test setup (setup-mocha.js)
declare const sinon: typeof import("sinon");

function reloadSwarmBot() {
  delete require.cache[require.resolve("../../src/core/kernel")];
  // Note: We intentionally don't delete logger cache here so spies can work correctly
  delete require.cache[require.resolve("../../src/core/processRegistry")];
  delete require.cache[require.resolve("../../src/SwarmBot")];

  return require("../../src/SwarmBot") as typeof import("../../src/SwarmBot");
}

describe("SwarmBot logging", () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Reset globals to a clean baseline
    // @ts-ignore: globals provided by test setup
    global.Game = _.clone(MockGame);
    // @ts-ignore: globals provided by test setup
    global.Memory = _.clone(MockMemory);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("logs critical bucket mode through the logger", () => {
    // With kernel-based process management, creeps are now managed as processes
    // and skipping is handled by the kernel. Instead, test that critical bucket
    // mode is properly logged when it occurs.
    
    const loggerModule = require("../../src/core/logger");
    const warnSpy = sandbox.spy(loggerModule.logger, "warn");

    const processRegistry = require("../../src/core/processRegistry");
    sandbox.stub(processRegistry, "registerAllProcesses");

    const bot = reloadSwarmBot();

    sandbox.stub(bot.kernel, "initialize");
    sandbox.stub(bot.kernel, "getBucketMode").returns("critical");
    sandbox.stub(bot.kernel, "hasCpuBudget").returns(false);
    sandbox.stub(bot.roomManager, "run");
    sandbox.stub(bot.profiler, "measureSubsystem").callsFake((_, fn: () => void) => fn());

    // @ts-ignore: test setup for Game globals
    global.Game.creeps = {};
    // @ts-ignore: test setup for Game globals
    global.Game.time = 12300;

    bot.loop();

    // Verify critical bucket warning is logged
    sinon.assert.called(warnSpy);
    const warnCall = warnSpy.getCalls().find((call: any) => 
      call.args[0] && call.args[0].includes("CRITICAL") && call.args[0].includes("CPU bucket")
    );
    assert.isDefined(warnCall);
  });

  it("logs visualization errors through the logger", () => {
    // Set up spies/stubs before reloading modules to ensure they're properly intercepted
    const loggerModule = require("../../src/core/logger");
    const errorSpy = sandbox.spy(loggerModule.logger, "error");

    const processRegistry = require("../../src/core/processRegistry");
    sandbox.stub(processRegistry, "registerAllProcesses");

    const bot = reloadSwarmBot();

    sandbox.stub(bot.kernel, "initialize");
    sandbox.stub(bot.kernel, "getBucketMode").returns("normal");
    sandbox.stub(bot.kernel, "hasCpuBudget").returns(true);
    sandbox.stub(bot.roomManager, "run");
    sandbox.stub(bot.profiler, "measureSubsystem").callsFake((_, fn: () => void) => fn());

    sandbox.stub(bot.roomVisualizer, "draw").throws(new Error("boom"));

    // @ts-ignore: test setup for Game globals
    global.Game.creeps = {}; // No creeps for this test
    
    // @ts-ignore: test setup for Game globals
    global.Game.rooms = {
      W1N1: { 
        name: "W1N1", 
        controller: { my: true } as any,
        find: () => [] // Mock find method to return empty array
      } as any
    };

    bot.loop();

    sinon.assert.called(errorSpy);
    const errorCall = errorSpy.getCalls().find((call: any) =>
      call.args[0] && call.args[0].includes("Visualization error in W1N1")
    );
    assert.isDefined(errorCall);
  });
});
