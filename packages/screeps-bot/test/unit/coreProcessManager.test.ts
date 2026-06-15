import { assert } from "chai";
import { Game as MockGame, Memory as MockMemory } from "./mock";
import { coreProcessManager } from "../../src/core/coreProcessManager";
import { logger } from "../../src/core/logger";

// Use global sinon from test setup (setup-mocha.mjs)
declare const sinon: typeof import("sinon");

describe("CoreProcessManager", () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Reset game/memory globals for deterministic tests
    // @ts-ignore: globals provided by test setup
    global.Game = _.clone(MockGame);
    // @ts-ignore: globals provided by test setup
    global.Memory = _.clone(MockMemory);

    // Ensure a clean Memory object for fallback size calculations
    global.Memory.rooms = {};

    // RawMemory is intentionally absent in this baseline
    delete (global as any).RawMemory;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("does not throw when RawMemory.get is unavailable", () => {
    assert.doesNotThrow(() => coreProcessManager.checkMemorySize());
  });

  it("falls back to JSON length when RawMemory is unavailable", () => {
    const warnSpy = sandbox.spy(logger, "warn");
    const errorSpy = sandbox.spy(logger, "error");

    // Inflate mock memory to force warning threshold behavior
    global.Memory.rooms = {
      W1N1: {
        // Large payload to exceed 75% of the 2MB Memory limit when serialized
        data: "x".repeat(1_700_000)
      }
    } as any;

    coreProcessManager.checkMemorySize();

    assert.isTrue(warnSpy.called, "should log a warning when memory usage is elevated");
    assert.isFalse(errorSpy.called);
  });

  it("uses RawMemory.get when available", () => {
    const warnSpy = sandbox.spy(logger, "warn");
    const errorSpy = sandbox.spy(logger, "error");

    (global as any).RawMemory = {
      get: () => "x".repeat(2_200_000),
      set: () => undefined,
      segments: {},
      setActiveSegments: () => undefined
    } as any;

    coreProcessManager.checkMemorySize();

    assert.isFalse(warnSpy.called);
    assert.isTrue(errorSpy.called, "should log critical usage when RawMemory usage is above 90%");
  });
});
