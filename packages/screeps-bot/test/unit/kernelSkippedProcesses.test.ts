import { expect } from "chai";
import { getConfig, resetConfig } from "../../src/config";
import { Kernel, buildKernelConfigFromCpu, ProcessPriority } from "../../src/core/kernel";

describe("Kernel Skipped Processes Tracking", () => {
  let kernel: Kernel;

  beforeEach(() => {
    resetConfig();
    // Set up global Game mock
    (global as any).Game = {
      time: 0,
      cpu: {
        bucket: 10000,
        limit: 50,
        getUsed: () => 0
      },
      rooms: {},
      creeps: {}
    };

    kernel = new Kernel(buildKernelConfigFromCpu(getConfig().cpu));
    kernel.initialize();
  });

  it("should initialize skipped processes count to 0", () => {
    expect(kernel.getSkippedProcessesThisTick()).to.equal(0);
  });

  it("should track skipped processes due to interval", () => {
    // Register a process with interval of 10
    kernel.registerProcess({
      id: "test-process",
      name: "Test Process",
      priority: ProcessPriority.MEDIUM,
      frequency: "medium",
      interval: 10,
      execute: () => {}
    });

    // Run once - process should execute
    kernel.run();
    expect(kernel.getSkippedProcessesThisTick()).to.equal(0);

    // Run again immediately - process should be skipped due to interval
    Game.time += 1;
    kernel.run();
    expect(kernel.getSkippedProcessesThisTick()).to.equal(1);
  });

  it("should track skipped processes due to bucket mode", () => {
    // Register processes with different priorities
    kernel.registerProcess({
      id: "low-priority",
      name: "Low Priority",
      priority: ProcessPriority.LOW,
      frequency: "medium",
      interval: 1,
      execute: () => {}
    });

    kernel.registerProcess({
      id: "high-priority",
      name: "High Priority",
      priority: ProcessPriority.HIGH,
      frequency: "high",
      interval: 1,
      execute: () => {}
    });

    // Set bucket to critical mode
    Game.cpu.bucket = 500;
    kernel.run();

    // In critical mode, low priority processes should be skipped
    // High priority process should also be skipped (only CRITICAL runs in critical mode)
    expect(kernel.getSkippedProcessesThisTick()).to.equal(2);
  });

  it("should reset skipped processes count each tick", () => {
    // Register a process that will be skipped
    kernel.registerProcess({
      id: "test-process",
      name: "Test Process",
      priority: ProcessPriority.MEDIUM,
      frequency: "medium",
      interval: 10,
      execute: () => {}
    });

    // First tick - execute the process
    kernel.run();
    expect(kernel.getSkippedProcessesThisTick()).to.equal(0);

    // Second tick - skip due to interval
    Game.time += 1;
    kernel.run();
    expect(kernel.getSkippedProcessesThisTick()).to.equal(1);

    // Third tick - still skip, but count should be reset and then incremented
    Game.time += 1;
    kernel.run();
    expect(kernel.getSkippedProcessesThisTick()).to.equal(1);
  });

  it("should track multiple skipped processes", () => {
    // Register multiple processes with same interval
    for (let i = 0; i < 5; i++) {
      kernel.registerProcess({
        id: `test-process-${i}`,
        name: `Test Process ${i}`,
        priority: ProcessPriority.MEDIUM,
        frequency: "medium",
        interval: 10,
        execute: () => {}
      });
    }

    // First tick - all processes execute
    kernel.run();
    expect(kernel.getSkippedProcessesThisTick()).to.equal(0);

    // Second tick - all processes skipped due to interval
    Game.time += 1;
    kernel.run();
    expect(kernel.getSkippedProcessesThisTick()).to.equal(5);
  });
});
