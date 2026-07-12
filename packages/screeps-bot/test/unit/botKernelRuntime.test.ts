import { expect } from "chai";
import { BotKernelRuntime } from "../../src/core/botKernelRuntime";
import { EventBus } from "../../src/core/events";
import type { CPUConfig } from "../../src/config";
import { Game } from "./mock";

describe("BotKernelRuntime", () => {
  const cpuConfig = {
    bucketThresholds: { lowMode: 2000, highMode: 8000 },
    budgets: { rooms: 0.1, creeps: 0.1, strategic: 0.1, market: 0.1, visualization: 0.1 },
    taskFrequencies: {
      pheromoneUpdate: 5,
      clusterLogic: 10,
      strategicDecisions: 20,
      marketScan: 100,
      nukeEvaluation: 100,
      memoryCleanup: 100
    }
  } as CPUConfig;

  it("updates CPU config and returns the current bucket mode through one runtime call", () => {
    const calls: string[] = [];
    const runtime = new BotKernelRuntime({
      kernel: {
        updateFromCpuConfig: config => {
          calls.push(`update:${config.bucketThresholds.lowMode}`);
        },
        getBucketMode: () => {
          calls.push("mode");
          return "low";
        },
        initialize: () => calls.push("initialize"),
        run: () => calls.push("run")
      },
      eventBus: {
        startTick: () => calls.push("startTick"),
        processQueue: () => calls.push("processQueue")
      },
      getCpuConfig: () => cpuConfig,
      registerProcesses: () => calls.push("register")
    });

    expect(runtime.configureForCurrentTick()).to.equal("low");
    expect(calls).to.deep.equal(["update:2000", "mode"]);
  });

  it("registers and initializes processes only once", () => {
    const calls: string[] = [];
    const runtime = new BotKernelRuntime({
      kernel: {
        updateFromCpuConfig: () => calls.push("update"),
        getBucketMode: () => "normal",
        initialize: () => calls.push("initialize"),
        run: () => calls.push("run")
      },
      eventBus: {
        startTick: () => calls.push("startTick"),
        processQueue: () => calls.push("processQueue")
      },
      getCpuConfig: () => cpuConfig,
      registerProcesses: () => calls.push("register")
    });

    runtime.ensureProcessesRegistered();
    runtime.ensureProcessesRegistered();

    expect(calls).to.deep.equal(["register", "initialize"]);
  });

  it("keeps one event-queue handoff after kernel execution", () => {
    const calls: string[] = [];
    const runtime = new BotKernelRuntime({
      kernel: {
        updateFromCpuConfig: () => calls.push("update"),
        getBucketMode: () => "normal",
        initialize: () => calls.push("initialize"),
        run: () => calls.push("run")
      },
      eventBus: {
        startTick: () => calls.push("startTick"),
        processQueue: () => calls.push("processQueue")
      },
      getCpuConfig: () => cpuConfig,
      registerProcesses: () => calls.push("register")
    });

    runtime.startEventTick();
    runtime.runProcessesAndEvents();

    // The kernel and bot runtime share the EventBus allowance; the runtime
    // performs its single lifecycle handoff after scheduled work.
    expect(calls).to.deep.equal(["startTick", "run", "processQueue"]);
  });

  it("does not double the allowance across kernel and runtime queue handoffs", () => {
    const sharedEventBus = new EventBus({
      enableLogging: false,
      maxEventsPerTick: 2,
      maxQueueSize: 20,
      lowBucketThreshold: 2000,
      criticalBucketThreshold: 1000,
      maxEventAge: 100
    });
    const processed: string[] = [];
    const previousGame = (globalThis as { Game?: typeof Game }).Game;
    const testGame = { ...Game, cpu: { ...Game.cpu } };
    (globalThis as { Game?: typeof Game }).Game = testGame;

    try {
      sharedEventBus.on("cpu.spike", event => processed.push(event.subsystem));
      testGame.time = 2000;
      testGame.cpu.bucket = 1500;
      for (const subsystem of ["first", "second", "third"]) {
        sharedEventBus.emit("cpu.spike", {
          cpuUsed: 100,
          cpuLimit: 50,
          subsystem
        });
      }

      testGame.cpu.bucket = 5000;
      const runtime = new BotKernelRuntime({
        kernel: {
          updateFromCpuConfig: () => {},
          getBucketMode: () => "normal",
          initialize: () => {},
          run: () => sharedEventBus.processQueue()
        },
        eventBus: {
          startTick: () => sharedEventBus.startTick(),
          processQueue: () => sharedEventBus.processQueue()
        },
        getCpuConfig: () => cpuConfig,
        registerProcesses: () => {}
      });

      runtime.runProcessesAndEvents();

      expect(processed).to.deep.equal(["first", "second"]);
      expect(sharedEventBus.getStats().queueSize).to.equal(1);
    } finally {
      sharedEventBus.clear();
      (globalThis as { Game?: typeof Game }).Game = previousGame;
    }
  });
});
