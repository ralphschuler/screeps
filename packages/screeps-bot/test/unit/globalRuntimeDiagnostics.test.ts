import { assert } from "chai";
import {
  resetGlobalRuntimeDiagnosticsForTests,
  runGlobalRuntimeDiagnostics
} from "../../src/core/globalRuntimeDiagnostics";

function setTick(tick: number): void {
  (global as any).Game.time = tick;
}

function createLoggerSpy() {
  const infoMessages: unknown[] = [];
  const warnMessages: unknown[] = [];
  return {
    infoMessages,
    warnMessages,
    logger: {
      info: (message: string, context?: unknown) => infoMessages.push({ message, context }),
      warn: (message: string, context?: unknown) => warnMessages.push({ message, context })
    }
  };
}

describe("global runtime diagnostics", () => {
  beforeEach(() => {
    resetGlobalRuntimeDiagnosticsForTests();
    (global as any).Game = {
      time: 100,
      shard: { name: "shard0" }
    };
    (global as any).Memory = {};
  });

  afterEach(() => {
    resetGlobalRuntimeDiagnosticsForTests();
  });

  it("records a compact Memory counter on global reset", () => {
    const { logger, infoMessages } = createLoggerSpy();

    const event = runGlobalRuntimeDiagnostics({ logger, createHeapId: () => "heap-a" });

    assert.deepInclude(event, {
      type: "reset",
      heapId: "heap-a",
      currentTick: 100,
      resetCount: 1,
      switchCount: 0
    });
    assert.equal((global as any).Memory.__globalResetCount, 1);
    assert.deepInclude((global as any).Memory.runtimeDiagnostics.global, {
      heapId: "heap-a",
      resetCount: 1,
      switchCount: 0,
      lastTick: 100,
      lastResetTick: 100
    });
    assert.lengthOf(infoMessages, 1);
  });

  it("does not increment counters during consecutive ticks on the same heap", () => {
    runGlobalRuntimeDiagnostics({ createHeapId: () => "heap-a" });
    setTick(101);

    const event = runGlobalRuntimeDiagnostics({ createHeapId: () => "heap-a" });

    assert.deepInclude(event, {
      type: "steady",
      heapId: "heap-a",
      currentTick: 101,
      previousTick: 100,
      resetCount: 1,
      switchCount: 0
    });
    assert.equal((global as any).Memory.__globalResetCount, 1);
    assert.equal((global as any).Memory.runtimeDiagnostics.global.switchCount, 0);
  });

  it("detects stale heap switches when Game.time jumps ahead", () => {
    const { logger, warnMessages } = createLoggerSpy();
    runGlobalRuntimeDiagnostics({ logger, createHeapId: () => "heap-a" });
    setTick(110);

    const event = runGlobalRuntimeDiagnostics({ logger, createHeapId: () => "heap-a" });

    assert.deepInclude(event, {
      type: "switch",
      heapId: "heap-a",
      currentTick: 110,
      previousTick: 100,
      resetCount: 1,
      switchCount: 1
    });
    assert.deepInclude((global as any).Memory.runtimeDiagnostics.global, {
      switchCount: 1,
      lastSwitchTick: 110,
      lastSwitchPreviousTick: 100,
      lastTick: 110
    });
    assert.lengthOf(warnMessages, 1);
  });

  it("throttles repeated switch warnings but keeps counting switches", () => {
    const { logger, warnMessages } = createLoggerSpy();
    runGlobalRuntimeDiagnostics({ logger, createHeapId: () => "heap-a", switchLogThrottleTicks: 50 });

    setTick(110);
    runGlobalRuntimeDiagnostics({ logger, switchLogThrottleTicks: 50 });
    setTick(120);
    runGlobalRuntimeDiagnostics({ logger, switchLogThrottleTicks: 50 });

    assert.equal((global as any).Memory.runtimeDiagnostics.global.switchCount, 2);
    assert.lengthOf(warnMessages, 1);
  });

  it("counts a new global reset when heap state is absent again", () => {
    runGlobalRuntimeDiagnostics({ createHeapId: () => "heap-a" });
    resetGlobalRuntimeDiagnosticsForTests();
    setTick(101);

    const event = runGlobalRuntimeDiagnostics({ createHeapId: () => "heap-b" });

    assert.deepInclude(event, {
      type: "reset",
      heapId: "heap-b",
      currentTick: 101,
      resetCount: 2,
      switchCount: 0
    });
    assert.equal((global as any).Memory.__globalResetCount, 2);
    assert.equal((global as any).Memory.runtimeDiagnostics.global.heapId, "heap-b");
  });
});
