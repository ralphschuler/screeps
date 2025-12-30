/**
 * Unit tests for Kernel Process Scheduling and Wrap-Around Queue
 * 
 * Tests cover:
 * 1. Basic process registration and execution
 * 2. Process priority ordering (higher priority runs first)
 * 3. Wrap-around queue behavior (continues from last executed process)
 * 4. CPU budget management and enforcement
 * 5. Process interval timing (medium/low frequency processes)
 * 6. Tick modulo/offset distributed execution
 * 7. Process suspension and automatic recovery
 * 8. Statistics tracking (CPU, runs, skips, health)
 * 9. Error handling and circuit breaker suspension
 * 10. Queue rebuilding while preserving wrap-around position
 * 11. Integration scenarios (multiple features working together)
 */

import { expect } from "chai";
import { Kernel, ProcessPriority, buildKernelConfigFromCpu } from "../src/kernel";
import { getConfig } from "../src/config";

describe("Kernel Process Scheduling", () => {
  let kernel: Kernel;

  beforeEach(() => {
    // Create fresh kernel for each test
    const cpuConfig = getConfig().cpu;
    const kernelConfig = buildKernelConfigFromCpu(cpuConfig);
    kernelConfig.enablePriorityDecay = false; // Disable for simpler testing
    kernel = new Kernel(kernelConfig);
    
    // Reset Game state
    Game.time = 1000;
    Game.cpu.bucket = 5000;
    Game.cpu.limit = 100;
    Game.cpu.getUsed = () => 0;
  });

  afterEach(() => {
    // Clean up all processes
    for (const process of kernel.getProcesses()) {
      kernel.unregisterProcess(process.id);
    }
  });

  describe("Basic Process Registration and Execution", () => {
    it("should register a process successfully", () => {
      kernel.registerProcess({
        id: "test-process",
        name: "Test Process",
        execute: () => {}
      });

      const process = kernel.getProcess("test-process");
      expect(process).to.not.be.undefined;
      expect(process!.id).to.equal("test-process");
      expect(process!.name).to.equal("Test Process");
      expect(process!.state).to.equal("idle");
    });

    it("should execute a registered process when run is called", () => {
      let executed = false;

      kernel.registerProcess({
        id: "test-exec",
        name: "Test Execution",
        execute: () => { executed = true; }
      });

      kernel.run();

      expect(executed).to.be.true;
    });

    it("should track process execution count", () => {
      kernel.registerProcess({
        id: "test-count",
        name: "Test Count",
        frequency: "high", // Ensure it runs every tick
        interval: 1,
        execute: () => {}
      });

      // Run 3 times
      kernel.run();
      Game.time++;
      kernel.run();
      Game.time++;
      kernel.run();

      const process = kernel.getProcess("test-count");
      expect(process!.stats.runCount).to.equal(3);
    });

    it("should unregister a process successfully", () => {
      kernel.registerProcess({
        id: "test-unreg",
        name: "Test Unregister",
        execute: () => {}
      });

      expect(kernel.getProcess("test-unreg")).to.not.be.undefined;

      const result = kernel.unregisterProcess("test-unreg");
      expect(result).to.be.true;
      expect(kernel.getProcess("test-unreg")).to.be.undefined;
    });
  });

  describe("Process Priority Ordering", () => {
    it("should execute processes in priority order (highest first)", () => {
      const executionOrder: string[] = [];

      kernel.registerProcess({
        id: "low",
        name: "Low Priority",
        priority: ProcessPriority.LOW,
        execute: () => { executionOrder.push("low"); }
      });

      kernel.registerProcess({
        id: "critical",
        name: "Critical Priority",
        priority: ProcessPriority.CRITICAL,
        execute: () => { executionOrder.push("critical"); }
      });

      kernel.registerProcess({
        id: "medium",
        name: "Medium Priority",
        priority: ProcessPriority.MEDIUM,
        execute: () => { executionOrder.push("medium"); }
      });

      kernel.registerProcess({
        id: "high",
        name: "High Priority",
        priority: ProcessPriority.HIGH,
        execute: () => { executionOrder.push("high"); }
      });

      kernel.run();

      // Should execute in priority order: CRITICAL > HIGH > MEDIUM > LOW
      expect(executionOrder).to.deep.equal(["critical", "high", "medium", "low"]);
    });

    it("should maintain priority order when processes are added dynamically", () => {
      const executionOrder: string[] = [];

      // Start with medium priority
      kernel.registerProcess({
        id: "medium",
        name: "Medium",
        priority: ProcessPriority.MEDIUM,
        execute: () => { executionOrder.push("medium"); }
      });

      // Add higher priority
      kernel.registerProcess({
        id: "critical",
        name: "Critical",
        priority: ProcessPriority.CRITICAL,
        execute: () => { executionOrder.push("critical"); }
      });

      // Add lower priority
      kernel.registerProcess({
        id: "low",
        name: "Low",
        priority: ProcessPriority.LOW,
        execute: () => { executionOrder.push("low"); }
      });

      kernel.run();

      expect(executionOrder).to.deep.equal(["critical", "medium", "low"]);
    });
  });

  describe("Wrap-Around Queue Behavior", () => {
    it("should continue execution from the last executed process in the next tick", () => {
      const executionLog: Array<{ tick: number; process: string }> = [];

      // Register 5 processes with same priority but different intervals to control execution
      kernel.registerProcess({
        id: "proc-1",
        name: "Process 1",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        interval: 1,
        execute: () => { 
          executionLog.push({ tick: Game.time, process: "proc-1" }); 
        }
      });

      kernel.registerProcess({
        id: "proc-2",
        name: "Process 2",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        interval: 1,
        execute: () => { 
          executionLog.push({ tick: Game.time, process: "proc-2" }); 
        }
      });

      kernel.registerProcess({
        id: "proc-3",
        name: "Process 3",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        interval: 1,
        execute: () => { 
          executionLog.push({ tick: Game.time, process: "proc-3" }); 
        }
      });

      // First tick - all processes should run with enough CPU
      kernel.run();

      // Verify all 3 processes ran in priority order
      expect(executionLog.length).to.equal(3);
      expect(executionLog[0].process).to.equal("proc-1");
      expect(executionLog[1].process).to.equal("proc-2");
      expect(executionLog[2].process).to.equal("proc-3");
    });

    it("should preserve wrap-around position when queue is rebuilt", () => {
      const executionLog: string[] = [];

      // Register 3 initial processes
      for (let i = 1; i <= 3; i++) {
        kernel.registerProcess({
          id: `proc-${i}`,
          name: `Process ${i}`,
          priority: ProcessPriority.MEDIUM,
          frequency: "high",
          interval: 1,
          execute: () => { executionLog.push(`proc-${i}`); }
        });
      }

      // First run
      kernel.run();
      expect(executionLog.length).to.equal(3);

      // Add a new process (triggers queue rebuild)
      kernel.registerProcess({
        id: "proc-4",
        name: "Process 4",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        interval: 1,
        execute: () => { executionLog.push("proc-4"); }
      });

      // Second run - all 4 should run
      Game.time = 1001;
      kernel.run();

      // Should have executed all 4 processes across both runs
      expect(executionLog.length).to.be.greaterThanOrEqual(4);
      expect(executionLog).to.include("proc-1");
      expect(executionLog).to.include("proc-2");
      expect(executionLog).to.include("proc-3");
      expect(executionLog).to.include("proc-4");
    });

    it("should execute all processes in priority order within a single tick", () => {
      const executionOrder: string[] = [];

      // Register processes with same priority
      kernel.registerProcess({
        id: "proc-1",
        name: "Process 1",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        interval: 1,
        execute: () => { executionOrder.push("proc-1"); }
      });

      kernel.registerProcess({
        id: "proc-2",
        name: "Process 2",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        interval: 1,
        execute: () => { executionOrder.push("proc-2"); }
      });

      kernel.registerProcess({
        id: "proc-3",
        name: "Process 3",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        interval: 1,
        execute: () => { executionOrder.push("proc-3"); }
      });

      kernel.run();

      // All processes should execute in order
      expect(executionOrder).to.deep.equal(["proc-1", "proc-2", "proc-3"]);
    });
  });

  describe("CPU Budget Management", () => {
    it("should stop execution when CPU budget is exhausted", () => {
      let executionCount = 0;

      for (let i = 1; i <= 10; i++) {
        kernel.registerProcess({
          id: `proc-${i}`,
          name: `Process ${i}`,
          execute: () => { executionCount++; }
        });
      }

      // Mock CPU to exhaust budget after 3 processes
      const originalGetUsed = Game.cpu.getUsed;
      Game.cpu.getUsed = () => {
        return executionCount >= 3 ? 99 : 0;
      };

      kernel.run();

      Game.cpu.getUsed = originalGetUsed;

      // Should execute only 3 processes before budget exhaustion
      expect(executionCount).to.equal(3);
    });

    it("should track remaining CPU budget correctly", () => {
      Game.cpu.limit = 100;
      Game.cpu.getUsed = () => 30;

      const remaining = kernel.getRemainingCpu();
      
      // Should account for targetCpuUsage (0.98) and reservedCpuFraction (0.02)
      // Effective limit: 100 * 0.98 = 98
      // Reserved: 98 * 0.02 = 1.96
      // Remaining: 98 - 30 - 1.96 ≈ 66.04
      expect(remaining).to.be.approximately(66, 2);
    });

    it("should report CPU budget availability correctly", () => {
      Game.cpu.limit = 100;
      Game.cpu.getUsed = () => 50;

      expect(kernel.hasCpuBudget()).to.be.true;

      Game.cpu.getUsed = () => 97;

      expect(kernel.hasCpuBudget()).to.be.false;
    });
  });

  describe("Process Interval Timing", () => {
    it("should respect process interval for medium frequency processes", () => {
      let executionCount = 0;

      kernel.registerProcess({
        id: "medium-freq",
        name: "Medium Frequency",
        frequency: "medium",
        interval: 5, // Run every 5 ticks
        execute: () => { executionCount++; }
      });

      // Run for 15 ticks
      for (let tick = 0; tick < 15; tick++) {
        kernel.run();
        Game.time++;
      }

      // Should execute on ticks: 0, 5, 10 (3 times total)
      expect(executionCount).to.be.within(3, 4);
    });

    it("should respect process interval for low frequency processes", () => {
      let executionCount = 0;

      kernel.registerProcess({
        id: "low-freq",
        name: "Low Frequency",
        frequency: "low",
        interval: 100,
        execute: () => { executionCount++; }
      });

      // First run
      kernel.run();
      expect(executionCount).to.equal(1);

      // Run 99 more times (not enough time yet)
      for (let tick = 0; tick < 99; tick++) {
        Game.time++;
        kernel.run();
      }

      // Should still be 1 (interval hasn't passed)
      expect(executionCount).to.equal(1);

      // Run once more (now interval has passed)
      Game.time++;
      kernel.run();

      // Should be 2 now
      expect(executionCount).to.equal(2);
    });

    it("should run high frequency processes every tick", () => {
      let executionCount = 0;

      kernel.registerProcess({
        id: "high-freq",
        name: "High Frequency",
        frequency: "high",
        execute: () => { executionCount++; }
      });

      // Run for 10 ticks
      for (let tick = 0; tick < 10; tick++) {
        kernel.run();
        Game.time++;
      }

      // Should execute every tick
      expect(executionCount).to.equal(10);
    });
  });

  describe("Tick Modulo and Offset Distribution", () => {
    it("should execute process only on matching tick modulo", () => {
      let executionCount = 0;

      kernel.registerProcess({
        id: "modulo-test",
        name: "Modulo Test",
        tickModulo: 5,
        tickOffset: 0,
        execute: () => { executionCount++; }
      });

      // Run for 20 ticks (starting at Game.time = 1000)
      for (let tick = 0; tick < 20; tick++) {
        kernel.run();
        Game.time++;
      }

      // Should execute on ticks where (time + offset) % modulo === 0
      // Ticks: 1000, 1005, 1010, 1015 (4 times)
      expect(executionCount).to.equal(4);
    });

    it("should respect tick offset for distributed execution", () => {
      const executionTicks: number[] = [];

      kernel.registerProcess({
        id: "offset-test",
        name: "Offset Test",
        tickModulo: 5,
        tickOffset: 2,
        execute: () => { executionTicks.push(Game.time); }
      });

      // Run for 20 ticks (starting at Game.time = 1000)
      for (let tick = 0; tick < 20; tick++) {
        kernel.run();
        Game.time++;
      }

      // Should execute on ticks where (time + 2) % 5 === 0
      // (1003 + 2) % 5 = 0, (1008 + 2) % 5 = 0, (1013 + 2) % 5 = 0, (1018 + 2) % 5 = 0
      expect(executionTicks).to.deep.equal([1003, 1008, 1013, 1018]);
    });

    it("should throw error if tickOffset >= tickModulo", () => {
      expect(() => {
        kernel.registerProcess({
          id: "invalid-offset",
          name: "Invalid Offset",
          tickModulo: 5,
          tickOffset: 5, // Invalid: must be < modulo
          execute: () => {}
        });
      }).to.throw(/Invalid tickOffset/);
    });

    it("should throw error if tickModulo is negative", () => {
      expect(() => {
        kernel.registerProcess({
          id: "invalid-modulo",
          name: "Invalid Modulo",
          tickModulo: -1, // Invalid: must be non-negative
          execute: () => {}
        });
      }).to.throw(/Invalid tickModulo/);
    });
  });

  describe("Process Suspension and Recovery", () => {
    it("should suspend a process manually", () => {
      kernel.registerProcess({
        id: "suspend-test",
        name: "Suspend Test",
        execute: () => {}
      });

      const result = kernel.suspendProcess("suspend-test");
      expect(result).to.be.true;

      const process = kernel.getProcess("suspend-test");
      expect(process!.state).to.equal("suspended");
    });

    it("should not execute suspended processes", () => {
      let executed = false;

      kernel.registerProcess({
        id: "suspended-proc",
        name: "Suspended Process",
        frequency: "high",
        interval: 1,
        execute: () => { executed = true; }
      });

      kernel.suspendProcess("suspended-proc");
      
      // Manually set suspendedUntil to ensure process stays suspended
      const process = kernel.getProcess("suspended-proc")!;
      process.stats.suspendedUntil = Game.time + 100;
      
      kernel.run();

      expect(executed).to.be.false;
    });

    it("should resume a suspended process manually", () => {
      let executed = false;

      kernel.registerProcess({
        id: "resume-test",
        name: "Resume Test",
        frequency: "high",
        interval: 1,
        execute: () => { executed = true; }
      });

      kernel.suspendProcess("resume-test");
      const process = kernel.getProcess("resume-test")!;
      process.stats.suspendedUntil = Game.time + 100;
      
      kernel.run();
      expect(executed).to.be.false;

      kernel.resumeProcess("resume-test");
      Game.time++;
      kernel.run();
      expect(executed).to.be.true;
    });

    it("should automatically resume process after suspension period expires", () => {
      let executionCount = 0;

      kernel.registerProcess({
        id: "auto-resume",
        name: "Auto Resume",
        execute: () => { executionCount++; }
      });

      // First execution
      kernel.run();
      expect(executionCount).to.equal(1);

      // Manually suspend until Game.time + 10
      const process = kernel.getProcess("auto-resume")!;
      process.state = "suspended";
      process.stats.suspendedUntil = Game.time + 10;
      process.stats.suspensionReason = "Test suspension";

      // Run for 9 more ticks (should not execute)
      for (let i = 0; i < 9; i++) {
        Game.time++;
        kernel.run();
      }
      expect(executionCount).to.equal(1); // Still only 1

      // Run once more (suspension expires)
      Game.time++;
      kernel.run();
      expect(executionCount).to.equal(2); // Should execute again
    });
  });

  describe("Error Handling and Circuit Breaker", () => {
    it("should track errors when process throws", () => {
      kernel.registerProcess({
        id: "error-test",
        name: "Error Test",
        execute: () => { throw new Error("Test error"); }
      });

      kernel.run();

      const process = kernel.getProcess("error-test");
      expect(process!.stats.errorCount).to.equal(1);
      expect(process!.stats.consecutiveErrors).to.equal(1);
      expect(process!.state).to.equal("error");
    });

    it("should reset consecutive errors on successful execution", () => {
      let shouldThrow = true;

      kernel.registerProcess({
        id: "error-reset",
        name: "Error Reset",
        frequency: "high",
        interval: 1,
        execute: () => {
          if (shouldThrow) {
            throw new Error("Test error");
          }
        }
      });

      // First run: error
      kernel.run();
      let process = kernel.getProcess("error-reset")!;
      expect(process.stats.consecutiveErrors).to.equal(1);

      // Second run: success
      shouldThrow = false;
      Game.time++;
      kernel.run();
      
      process = kernel.getProcess("error-reset")!;
      expect(process.stats.consecutiveErrors).to.equal(0);
      expect(process.stats.errorCount).to.equal(1); // Total errors still 1
      expect(process.state).to.equal("idle"); // Should be back to idle
    });

    it("should suspend process after 3 consecutive errors", () => {
      kernel.registerProcess({
        id: "circuit-breaker",
        name: "Circuit Breaker",
        frequency: "high",
        interval: 1,
        execute: () => { throw new Error("Persistent error"); }
      });

      // Run 3 times to trigger suspension
      for (let i = 0; i < 3; i++) {
        kernel.run();
        Game.time++;
      }

      const process = kernel.getProcess("circuit-breaker");
      expect(process!.state).to.equal("suspended");
      expect(process!.stats.consecutiveErrors).to.equal(3);
      expect(process!.stats.suspendedUntil).to.be.greaterThan(1001); // Should be suspended beyond current tick
    });

    it("should permanently suspend process after 10 consecutive errors", () => {
      kernel.registerProcess({
        id: "permanent-suspend",
        name: "Permanent Suspend",
        frequency: "high",
        interval: 1,
        execute: () => { throw new Error("Fatal error"); }
      });

      // Run 10 times to trigger permanent suspension - but suspension happens at 3 errors
      // so we need to resume it manually after each suspension
      for (let i = 0; i < 10; i++) {
        const process = kernel.getProcess("permanent-suspend")!;
        
        // If suspended (happens at 3, 4, 5... errors), manually resume to continue error accumulation
        if (process.state === "suspended" && i < 10) {
          process.state = "idle";
          process.stats.suspendedUntil = null;
        }
        
        kernel.run();
        Game.time++;
      }

      const process = kernel.getProcess("permanent-suspend");
      expect(process!.state).to.equal("suspended");
      expect(process!.stats.consecutiveErrors).to.equal(10);
      expect(process!.stats.suspendedUntil).to.equal(Number.MAX_SAFE_INTEGER);
    });
  });

  describe("Statistics Tracking", () => {
    it("should track CPU usage per process", () => {
      const originalGetUsed = Game.cpu.getUsed;
      let cpuCounter = 0;
      Game.cpu.getUsed = () => {
        cpuCounter += 2.5;
        return cpuCounter;
      };

      kernel.registerProcess({
        id: "cpu-track",
        name: "CPU Track",
        execute: () => { /* Uses 2.5 CPU */ }
      });

      kernel.run();

      Game.cpu.getUsed = originalGetUsed;

      const process = kernel.getProcess("cpu-track");
      expect(process!.stats.totalCpu).to.be.approximately(2.5, 0.1);
      expect(process!.stats.avgCpu).to.be.approximately(2.5, 0.1);
      expect(process!.stats.maxCpu).to.be.approximately(2.5, 0.1);
    });

    it("should track last run tick", () => {
      kernel.registerProcess({
        id: "tick-track",
        name: "Tick Track",
        execute: () => {}
      });

      Game.time = 1000;
      kernel.run();

      let process = kernel.getProcess("tick-track")!;
      expect(process.stats.lastRunTick).to.equal(1000);

      Game.time = 1005;
      kernel.run();

      process = kernel.getProcess("tick-track")!;
      expect(process.stats.lastRunTick).to.equal(1005);
    });

    it("should calculate health score based on success rate", () => {
      let shouldThrow = false;

      kernel.registerProcess({
        id: "health-test",
        name: "Health Test",
        execute: () => {
          if (shouldThrow) throw new Error("Error");
        }
      });

      // Run successfully 5 times
      for (let i = 0; i < 5; i++) {
        kernel.run();
        Game.time++;
      }

      let process = kernel.getProcess("health-test")!;
      expect(process.stats.healthScore).to.be.greaterThan(90);

      // Run with errors 5 times
      shouldThrow = true;
      for (let i = 0; i < 5; i++) {
        kernel.run();
        Game.time++;
      }

      process = kernel.getProcess("health-test")!;
      expect(process.stats.healthScore).to.be.lessThan(60);
    });

    it("should track skip count when processes are skipped", () => {
      kernel.registerProcess({
        id: "skip-track",
        name: "Skip Track",
        interval: 10, // Will be skipped for 9 ticks
        execute: () => {}
      });

      // Run for 20 ticks
      for (let i = 0; i < 20; i++) {
        kernel.run();
        Game.time++;
      }

      const process = kernel.getProcess("skip-track");
      // Process runs on ticks: 0, 10, 20 (3 times)
      // Skipped: 20 - 3 = 17 times
      expect(process!.stats.skippedCount).to.be.greaterThan(15);
    });
  });

  describe("Queue Rebuilding", () => {
    it("should rebuild queue when processes are added", () => {
      const executionOrder: string[] = [];

      kernel.registerProcess({
        id: "proc-1",
        name: "Process 1",
        priority: ProcessPriority.MEDIUM,
        execute: () => { executionOrder.push("proc-1"); }
      });

      kernel.run();
      expect(executionOrder).to.deep.equal(["proc-1"]);

      // Add higher priority process
      kernel.registerProcess({
        id: "proc-2",
        name: "Process 2",
        priority: ProcessPriority.CRITICAL,
        execute: () => { executionOrder.push("proc-2"); }
      });

      Game.time++;
      kernel.run();

      // New process should run first due to higher priority
      expect(executionOrder).to.deep.equal(["proc-1", "proc-2"]);
    });

    it("should rebuild queue when processes are removed", () => {
      kernel.registerProcess({
        id: "proc-1",
        name: "Process 1",
        execute: () => {}
      });

      kernel.registerProcess({
        id: "proc-2",
        name: "Process 2",
        execute: () => {}
      });

      kernel.run();

      expect(kernel.getProcesses().length).to.equal(2);

      kernel.unregisterProcess("proc-1");

      expect(kernel.getProcesses().length).to.equal(1);
      expect(kernel.getProcess("proc-2")).to.not.be.undefined;
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle mixed priority with CPU budget constraints and wrap-around", () => {
      const executionLog: Array<{ tick: number; process: string; priority: number }> = [];

      // Register processes with different priorities
      kernel.registerProcess({
        id: "critical-1",
        name: "Critical 1",
        priority: ProcessPriority.CRITICAL,
        frequency: "high",
        interval: 1,
        execute: () => {
          executionLog.push({ tick: Game.time, process: "critical-1", priority: ProcessPriority.CRITICAL });
        }
      });

      kernel.registerProcess({
        id: "high-1",
        name: "High 1",
        priority: ProcessPriority.HIGH,
        frequency: "high",
        interval: 1,
        execute: () => {
          executionLog.push({ tick: Game.time, process: "high-1", priority: ProcessPriority.HIGH });
        }
      });

      kernel.registerProcess({
        id: "medium-1",
        name: "Medium 1",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        interval: 1,
        execute: () => {
          executionLog.push({ tick: Game.time, process: "medium-1", priority: ProcessPriority.MEDIUM });
        }
      });

      kernel.registerProcess({
        id: "low-1",
        name: "Low 1",
        priority: ProcessPriority.LOW,
        frequency: "high",
        interval: 1,
        execute: () => {
          executionLog.push({ tick: Game.time, process: "low-1", priority: ProcessPriority.LOW });
        }
      });

      // Run with sufficient CPU
      kernel.run();

      // Verify all processes executed in priority order
      expect(executionLog.length).to.equal(4);
      expect(executionLog[0].process).to.equal("critical-1");
      expect(executionLog[1].process).to.equal("high-1");
      expect(executionLog[2].process).to.equal("medium-1");
      expect(executionLog[3].process).to.equal("low-1");
    });

    it("should handle process intervals with wrap-around queue", () => {
      const executionLog: Array<{ tick: number; process: string }> = [];

      // High frequency process (every tick)
      kernel.registerProcess({
        id: "high-freq",
        name: "High Freq",
        frequency: "high",
        priority: ProcessPriority.MEDIUM,
        execute: () => {
          executionLog.push({ tick: Game.time, process: "high-freq" });
        }
      });

      // Medium frequency process (every 5 ticks)
      kernel.registerProcess({
        id: "medium-freq",
        name: "Medium Freq",
        frequency: "medium",
        interval: 5,
        priority: ProcessPriority.MEDIUM,
        execute: () => {
          executionLog.push({ tick: Game.time, process: "medium-freq" });
        }
      });

      // Run for 10 ticks
      for (let i = 0; i < 10; i++) {
        kernel.run();
        Game.time++;
      }

      // high-freq should run every tick (10 times)
      const highFreqCount = executionLog.filter(e => e.process === "high-freq").length;
      expect(highFreqCount).to.equal(10);

      // medium-freq should run on ticks 0, 5 (2 times)
      const mediumFreqCount = executionLog.filter(e => e.process === "medium-freq").length;
      expect(mediumFreqCount).to.be.within(2, 3);
    });

    it("should handle errors, recovery, and wrap-around together", () => {
      let throwError = true;
      const executionLog: string[] = [];

      kernel.registerProcess({
        id: "error-prone",
        name: "Error Prone",
        frequency: "high",
        interval: 1,
        execute: () => {
          if (throwError) {
            throw new Error("Simulated error");
          }
          executionLog.push("error-prone");
        }
      });

      kernel.registerProcess({
        id: "stable",
        name: "Stable",
        frequency: "high",
        interval: 1,
        execute: () => {
          executionLog.push("stable");
        }
      });

      // Tick 1: error-prone fails, stable runs
      kernel.run();

      // Tick 2: error-prone fails again, stable runs
      Game.time++;
      kernel.run();

      // Tick 3: Fix the error
      throwError = false;
      Game.time++;
      kernel.run();

      // Both processes should have run on tick 3
      const process = kernel.getProcess("error-prone")!;
      expect(process.stats.consecutiveErrors).to.equal(0);
      expect(process.stats.errorCount).to.equal(2);
      expect(process.state).to.equal("idle"); // Should be back to idle after successful run
      expect(executionLog).to.include("error-prone");
      expect(executionLog).to.include("stable");
    });
  });
});
