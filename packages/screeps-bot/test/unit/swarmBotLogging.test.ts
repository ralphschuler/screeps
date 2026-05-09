import { assert } from "chai";
import { Game as MockGame, Memory as MockMemory } from "./mock";
import * as loggerModule from "../../src/core/logger";
import { Kernel } from "../../src/core/kernel";

// Use global sinon from test setup (setup-mocha.js)
declare const sinon: typeof import("sinon");

async function reloadSwarmBot() {
  const cacheKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return import(`../../src/SwarmBot.ts?swarmBotLogging=${cacheKey}`) as Promise<typeof import("../../src/SwarmBot")>;
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

  it("logs critical bucket mode through the logger while core processing continues", async () => {
    // Critical bucket should still run the core kernel path while optional work is deferred.

    const warnSpy = sandbox.spy(loggerModule.logger, "warn");

    const bot = await reloadSwarmBot();

    sandbox.stub(Kernel.prototype, "initialize");
    sandbox.stub(Kernel.prototype, "getBucketMode").returns("critical");
    sandbox.stub(Kernel.prototype, "hasCpuBudget").returns(true);
    const kernelRunStub = sandbox.stub(Kernel.prototype, "run");
    sandbox.stub(bot.roomManager, "run");
    sandbox.stub(bot.unifiedStats, "measureSubsystem").callsFake((_, fn: () => void) => fn());

    // @ts-ignore: test setup for Game globals
    global.Game.creeps = {};
    // @ts-ignore: test setup for Game globals
    global.Game.time = 12300;
    // @ts-ignore: test setup for Game globals
    global.Game.rooms = {
      W1N1: {
        name: "W1N1",
        controller: { my: true } as any,
        find: () => []
      } as any
    };

    bot.loop();

    // Verify critical bucket warning is logged
    sinon.assert.called(warnSpy);
    const warnCall = warnSpy
      .getCalls()
      .find(
        (call: any) =>
          call.args[0] &&
          call.args[0].includes("CRITICAL") &&
          call.args[0].includes("CPU bucket") &&
          call.args[0].includes("deferring optional work")
      );
    assert.isDefined(warnCall, "Should log critical bucket warning with 'deferring optional work' message");

    // Verify kernel.run() was called (normal processing continues despite critical bucket)
    sinon.assert.called(kernelRunStub);
  });

  it("logs visualization errors through the logger", async () => {
    // Set up spies/stubs before reloading modules to ensure they're properly intercepted
    const errorSpy = sandbox.spy(loggerModule.logger, "error");

    const bot = await reloadSwarmBot();

    sandbox.stub(Kernel.prototype, "initialize");
    sandbox.stub(Kernel.prototype, "getBucketMode").returns("normal");
    sandbox.stub(Kernel.prototype, "hasCpuBudget").returns(true);
    sandbox.stub(bot.roomManager, "run");
    sandbox.stub(bot.unifiedStats, "measureSubsystem").callsFake((_, fn: () => void) => fn());

    sandbox.stub(bot.roomVisualizer, "draw").throws(new Error("boom"));

    // @ts-ignore: test setup for Game globals
    global.Game.creeps = {}; // No creeps for this test
    // Avoid same-tick owned-room cache entries left by earlier suites.
    // @ts-ignore: test setup for Game globals
    global.Game.time = 12346;

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
    const errorCall = errorSpy
      .getCalls()
      .find((call: any) => call.args[0] && call.args[0].includes("Visualization error in W1N1"));
    assert.isDefined(errorCall);
  });
});
