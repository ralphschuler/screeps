import { expect } from "chai";
import { Kernel, ProcessPriority, buildKernelConfigFromCpu } from "../../src/core/kernel";
import { getConfig, resetConfig } from "../../src/config";

describe("Kernel wrap-around process queue", () => {
  let kernel: Kernel;
  let executionLog: string[];

  // Test constants
  const CPU_EXHAUSTED = 100; // Simulate CPU exhaustion
  const MAX_PROCESSES_PER_TICK = 2; // For partial execution tests

  beforeEach(() => {
    resetConfig();
    executionLog = [];
    
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Allow setting test values
    global.Game = {
      ...global.Game,
      time: 0,
      cpu: {
        ...global.Game.cpu,
        bucket: 10000,
        limit: 50,
        getUsed: () => 0
      }
    };

    kernel = new Kernel(buildKernelConfigFromCpu(getConfig().cpu));
  });

  afterEach(() => {
    executionLog = [];
  });

  it("should execute all processes when CPU budget is sufficient", () => {
    // Register 3 processes with different priorities
    kernel.registerProcess({
      id: "high",
      name: "High Priority",
      priority: ProcessPriority.HIGH,
      frequency: "high",
      execute: () => executionLog.push("high")
    });

    kernel.registerProcess({
      id: "medium",
      name: "Medium Priority",
      priority: ProcessPriority.MEDIUM,
      frequency: "high",
      execute: () => executionLog.push("medium")
    });

    kernel.registerProcess({
      id: "low",
      name: "Low Priority",
      priority: ProcessPriority.LOW,
      frequency: "high",
      execute: () => executionLog.push("low")
    });

    // Run with sufficient CPU
    let cpuUsage = 0;
    Game.cpu.getUsed = () => cpuUsage;
    cpuUsage = 1; // Simulate minimal CPU usage

    kernel.run();

    // All processes should run in priority order
    expect(executionLog).to.deep.equal(["high", "medium", "low"]);
  });

  it("should wrap around when processes are skipped due to CPU budget", () => {
    // Register 3 processes
    let p1Executed = false;
    kernel.registerProcess({
      id: "p1",
      name: "Process 1",
      priority: ProcessPriority.HIGH,
      frequency: "high",
      execute: () => {
        executionLog.push("p1");
        p1Executed = true;
      }
    });

    kernel.registerProcess({
      id: "p2",
      name: "Process 2",
      priority: ProcessPriority.MEDIUM,
      frequency: "high",
      execute: () => executionLog.push("p2")
    });

    kernel.registerProcess({
      id: "p3",
      name: "Process 3",
      priority: ProcessPriority.LOW,
      frequency: "high",
      execute: () => executionLog.push("p3")
    });

    // Tick 1: Only allow first process to run (simulate CPU exhaustion after p1)
    let cpuUsage = 0;
    Game.cpu.getUsed = () => {
      // Return high CPU usage after p1 has executed to block p2 and p3
      return p1Executed ? 100 : cpuUsage;
    };
    
    kernel.run();

    expect(executionLog).to.deep.equal(["p1"]);
    executionLog = [];
    p1Executed = false;

    // Tick 2: Should start from p2 (wrap-around)
    Game.time += 1;
    cpuUsage = 1;
    kernel.run();

    // Should start from p2 and wrap to p1
    expect(executionLog).to.deep.equal(["p2", "p3", "p1"]);
  });

  it("should handle multiple ticks with partial execution", () => {
    // Register 5 processes
    const executionCounts = new Map<string, number>();
    let currentExecutions = 0;
    
    for (let i = 1; i <= 5; i++) {
      const id = `p${i}`;
      executionCounts.set(id, 0);
      kernel.registerProcess({
        id,
        name: `Process ${i}`,
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => {
          executionLog.push(id);
          currentExecutions++;
        }
      });
    }

    // Simulate CPU exhaustion after MAX_PROCESSES_PER_TICK processes per tick
    Game.cpu.getUsed = () => {
      return currentExecutions >= MAX_PROCESSES_PER_TICK ? CPU_EXHAUSTED : 1;
    };

    // Tick 1: Run first 2 processes
    currentExecutions = 0;
    kernel.run();
    const tick1 = [...executionLog];
    executionLog = [];

    // Tick 2: Should continue from where we left off
    Game.time += 1;
    currentExecutions = 0;
    kernel.run();
    const tick2 = [...executionLog];
    executionLog = [];

    // Tick 3: Should wrap around
    Game.time += 1;
    currentExecutions = 0;
    kernel.run();
    const tick3 = [...executionLog];

    // Verify that over 3 ticks, all processes ran at least once
    const allExecutions = [...tick1, ...tick2, ...tick3];
    expect(allExecutions).to.include("p1");
    expect(allExecutions).to.include("p2");
    expect(allExecutions).to.include("p3");
    expect(allExecutions).to.include("p4");
    expect(allExecutions).to.include("p5");
  });

  it("should respect process intervals in wrap-around", () => {
    // Register processes with different intervals
    kernel.registerProcess({
      id: "frequent",
      name: "Frequent",
      priority: ProcessPriority.HIGH,
      frequency: "high",
      interval: 1,
      execute: () => executionLog.push("frequent")
    });

    kernel.registerProcess({
      id: "rare",
      name: "Rare",
      priority: ProcessPriority.MEDIUM,
      frequency: "medium",
      interval: 10,
      execute: () => executionLog.push("rare")
    });

    let cpuUsage = 0;
    Game.cpu.getUsed = () => cpuUsage;

    // Tick 1: Both should run
    cpuUsage = 1;
    kernel.run();
    expect(executionLog).to.include("frequent");
    expect(executionLog).to.include("rare");
    executionLog = [];

    // Tick 2: Only frequent should run (rare has interval 10)
    Game.time += 1;
    cpuUsage = 1;
    kernel.run();
    expect(executionLog).to.deep.equal(["frequent"]);
    executionLog = [];

    // Tick 11: Both should run again
    Game.time = 11;
    cpuUsage = 1;
    kernel.run();
    expect(executionLog).to.include("frequent");
    expect(executionLog).to.include("rare");
  });

  it("should maintain priority order within wrap-around", () => {
    // Register processes with different priorities
    kernel.registerProcess({
      id: "critical",
      name: "Critical",
      priority: ProcessPriority.CRITICAL,
      frequency: "high",
      execute: () => executionLog.push("critical")
    });

    kernel.registerProcess({
      id: "high",
      name: "High",
      priority: ProcessPriority.HIGH,
      frequency: "high",
      execute: () => executionLog.push("high")
    });

    kernel.registerProcess({
      id: "medium",
      name: "Medium",
      priority: ProcessPriority.MEDIUM,
      frequency: "high",
      execute: () => executionLog.push("medium")
    });

    let cpuUsage = 0;
    Game.cpu.getUsed = () => cpuUsage;

    // Tick 1: Run all in priority order
    cpuUsage = 1;
    kernel.run();
    expect(executionLog).to.deep.equal(["critical", "high", "medium"]);
    executionLog = [];

    // Tick 2: Wrap around, but still maintain priority order
    Game.time += 1;
    cpuUsage = 1;
    kernel.run();
    // Starting from after "medium" (last executed), we wrap to "critical"
    // Since queue is sorted by priority, we still go: critical -> high -> medium
    expect(executionLog).to.deep.equal(["critical", "high", "medium"]);
  });

  it("should handle suspended processes in wrap-around", () => {
    kernel.registerProcess({
      id: "active",
      name: "Active",
      priority: ProcessPriority.HIGH,
      frequency: "high",
      execute: () => executionLog.push("active")
    });

    kernel.registerProcess({
      id: "suspended",
      name: "Suspended",
      priority: ProcessPriority.MEDIUM,
      frequency: "high",
      execute: () => executionLog.push("suspended")
    });

    kernel.registerProcess({
      id: "active2",
      name: "Active 2",
      priority: ProcessPriority.LOW,
      frequency: "high",
      execute: () => executionLog.push("active2")
    });

    // Suspend middle process
    kernel.suspendProcess("suspended");

    let cpuUsage = 0;
    Game.cpu.getUsed = () => cpuUsage;
    cpuUsage = 1;

    kernel.run();

    // Suspended process should be skipped
    expect(executionLog).to.deep.equal(["active", "active2"]);
  });

  it("should handle queue rebuild when processes are added", () => {
    kernel.registerProcess({
      id: "p1",
      name: "Process 1",
      priority: ProcessPriority.HIGH,
      frequency: "high",
      execute: () => executionLog.push("p1")
    });

    let cpuUsage = 0;
    Game.cpu.getUsed = () => cpuUsage;
    cpuUsage = 1;

    // Run first tick
    kernel.run();
    expect(executionLog).to.deep.equal(["p1"]);
    executionLog = [];

    // Add a new process
    kernel.registerProcess({
      id: "p2",
      name: "Process 2",
      priority: ProcessPriority.CRITICAL, // Higher priority
      frequency: "high",
      execute: () => executionLog.push("p2")
    });

    // Run second tick - queue should be rebuilt
    Game.time += 1;
    cpuUsage = 1;
    kernel.run();

    // New process with higher priority should run first
    expect(executionLog).to.deep.equal(["p2", "p1"]);
  });

  it("should handle queue rebuild when processes are removed", () => {
    kernel.registerProcess({
      id: "p1",
      name: "Process 1",
      priority: ProcessPriority.HIGH,
      frequency: "high",
      execute: () => executionLog.push("p1")
    });

    kernel.registerProcess({
      id: "p2",
      name: "Process 2",
      priority: ProcessPriority.MEDIUM,
      frequency: "high",
      execute: () => executionLog.push("p2")
    });

    let cpuUsage = 0;
    Game.cpu.getUsed = () => cpuUsage;
    cpuUsage = 1;

    // Run first tick
    kernel.run();
    expect(executionLog).to.deep.equal(["p1", "p2"]);
    executionLog = [];

    // Remove a process
    kernel.unregisterProcess("p1");

    // Run second tick - queue should be rebuilt
    Game.time += 1;
    cpuUsage = 1;
    kernel.run();

    // Only remaining process should run
    expect(executionLog).to.deep.equal(["p2"]);
  });

  it("should handle empty process queue gracefully", () => {
    let cpuUsage = 0;
    Game.cpu.getUsed = () => cpuUsage;
    cpuUsage = 1;

    // Run with no processes registered
    expect(() => kernel.run()).to.not.throw();
  });

  it("should track skipped count correctly with wrap-around", () => {
    let p1Executed = false;
    kernel.registerProcess({
      id: "p1",
      name: "Process 1",
      priority: ProcessPriority.HIGH,
      frequency: "high",
      execute: () => {
        executionLog.push("p1");
        p1Executed = true;
      }
    });

    kernel.registerProcess({
      id: "p2",
      name: "Process 2",
      priority: ProcessPriority.MEDIUM,
      frequency: "high",
      execute: () => executionLog.push("p2")
    });

    // Allow p1 but block p2 due to CPU
    Game.cpu.getUsed = () => {
      return p1Executed ? CPU_EXHAUSTED : 1;
    };

    kernel.run();

    const p1Stats = kernel.getProcess("p1")?.stats;
    const p2Stats = kernel.getProcess("p2")?.stats;

    expect(p1Stats?.runCount).to.equal(1);
    expect(p1Stats?.skippedCount).to.equal(0);
    expect(p2Stats?.runCount).to.equal(0);
    // p2 is not marked as skipped because we break immediately when CPU exhausted
    // It will be the first process checked in the next tick
    expect(p2Stats?.skippedCount).to.equal(0);
  });
});
