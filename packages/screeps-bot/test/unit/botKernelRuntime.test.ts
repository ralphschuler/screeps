import { expect } from "chai";
import { BotKernelRuntime } from "../../src/core/botKernelRuntime";
import type { CPUConfig } from "../../src/config";

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

  it("keeps event tick lifecycle and kernel execution in order", () => {
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

    expect(calls).to.deep.equal(["startTick", "run", "processQueue"]);
  });
});
