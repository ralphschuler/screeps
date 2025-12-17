import { expect } from "chai";
import { Kernel, ProcessPriority, buildKernelConfigFromCpu } from "../../src/core/kernel";
import { getConfig, resetConfig } from "../../src/config";
import { eventBus } from "../../src/core/events";

describe("Kernel process health monitoring", () => {
  let kernel: Kernel;
  let eventLog: Array<{ event: string; data: any }>;

  beforeEach(() => {
    resetConfig();
    eventLog = [];
    
    // Mock Game global
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

    // Subscribe to process events for testing
    kernel.on('process.suspended', (event) => {
      eventLog.push({ event: 'suspended', data: event });
    });

    kernel.on('process.recovered', (event) => {
      eventLog.push({ event: 'recovered', data: event });
    });
  });

  afterEach(() => {
    eventLog = [];
  });

  describe("Health score calculation", () => {
    it("should start with 100 health for new processes", () => {
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => {}
      });

      const process = kernel.getProcess("test");
      expect(process?.stats.healthScore).to.equal(100);
    });

    it("should maintain high health score for successful runs", () => {
      let runCount = 0;
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => { runCount++; }
      });

      // Run 10 times successfully
      for (let i = 0; i < 10; i++) {
        Game.time = i;
        kernel.run();
      }

      const process = kernel.getProcess("test");
      expect(process?.stats.runCount).to.equal(10);
      expect(process?.stats.errorCount).to.equal(0);
      expect(process?.stats.consecutiveErrors).to.equal(0);
      expect(process?.stats.healthScore).to.be.greaterThan(90);
    });

    it("should decrease health score when errors occur", () => {
      let shouldFail = false;
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => {
          if (shouldFail) {
            throw new Error("Test error");
          }
        }
      });

      // Run successfully once
      kernel.run();
      Game.time++;

      // Now fail twice
      shouldFail = true;
      kernel.run();
      Game.time++;
      kernel.run();
      Game.time++;

      const process = kernel.getProcess("test");
      expect(process?.stats.runCount).to.equal(3);
      expect(process?.stats.errorCount).to.equal(2);
      expect(process?.stats.consecutiveErrors).to.equal(2);
      // Health score should be reduced but not zero (2/3 success rate ~= 33%)
      // Plus penalty for consecutive errors (2 * 15 = 30)
      expect(process?.stats.healthScore).to.be.lessThan(70);
      expect(process?.stats.healthScore).to.be.greaterThan(0);
    });

    it("should give bonus for recent successful runs", () => {
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => {}
      });

      // Run successfully
      kernel.run();
      Game.time = 50; // Recent run (within 100 ticks)
      kernel.run();

      const process = kernel.getProcess("test");
      // Should have health > 100 but capped at 100
      expect(process?.stats.healthScore).to.equal(100);
    });
  });

  describe("Consecutive error tracking", () => {
    it("should track consecutive errors", () => {
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => {
          throw new Error("Test error");
        }
      });

      // Run 3 times, all should fail
      for (let i = 0; i < 3; i++) {
        Game.time = i;
        kernel.run();
      }

      const process = kernel.getProcess("test");
      expect(process?.stats.consecutiveErrors).to.equal(3);
      expect(process?.stats.errorCount).to.equal(3);
    });

    it("should reset consecutive errors on successful run", () => {
      let shouldFail = true;
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => {
          if (shouldFail) {
            throw new Error("Test error");
          }
        }
      });

      // Fail twice
      kernel.run();
      Game.time++;
      kernel.run();
      Game.time++;

      let process = kernel.getProcess("test");
      expect(process?.stats.consecutiveErrors).to.equal(2);

      // Now succeed
      shouldFail = false;
      kernel.run();
      Game.time++;

      process = kernel.getProcess("test");
      expect(process?.stats.consecutiveErrors).to.equal(0);
      expect(process?.stats.errorCount).to.equal(2); // Total errors still 2
      expect(process?.stats.lastSuccessfulRunTick).to.equal(2);
    });
  });

  describe("Automatic suspension after 3 failures", () => {
    it("should suspend process after 3 consecutive failures", () => {
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => {
          throw new Error("Test error");
        }
      });

      // Run 3 times, should suspend on 3rd failure
      for (let i = 0; i < 3; i++) {
        Game.time = i;
        kernel.run();
      }

      const process = kernel.getProcess("test");
      expect(process?.state).to.equal("suspended");
      expect(process?.stats.suspendedUntil).to.not.be.null;
      expect(process?.stats.suspensionReason).to.include("3 consecutive failures");
      
      // Should emit suspension event
      expect(eventLog).to.have.lengthOf(1);
      expect(eventLog[0].event).to.equal("suspended");
      expect(eventLog[0].data.processId).to.equal("test");
      expect(eventLog[0].data.consecutive).to.equal(3);
      expect(eventLog[0].data.permanent).to.be.false;
    });

    it("should use exponential backoff for suspension duration", () => {
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => {
          throw new Error("Test error");
        }
      });

      // Fail 3 times
      for (let i = 0; i < 3; i++) {
        Game.time = i;
        kernel.run();
      }

      const process = kernel.getProcess("test");
      const expectedDuration = Math.pow(2, 3); // 2^3 = 8 ticks
      expect(process?.stats.suspendedUntil).to.equal(Game.time + expectedDuration);
    });

    it("should not run suspended processes", () => {
      let runCount = 0;
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => {
          runCount++;
          throw new Error("Test error");
        }
      });

      // Fail 3 times to trigger suspension
      for (let i = 0; i < 3; i++) {
        Game.time = i;
        kernel.run();
      }

      const runCountBeforeSuspension = runCount;
      
      // Try to run again - should be skipped due to suspension
      Game.time++;
      kernel.run();

      expect(runCount).to.equal(runCountBeforeSuspension);
    });
  });

  describe("Circuit breaker after 10 failures", () => {
    it("should permanently suspend process after 10 consecutive failures", () => {
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => {
          throw new Error("Test error");
        }
      });

      // Fail 10 times
      for (let i = 0; i < 10; i++) {
        Game.time = i * 1000; // Large time gaps to avoid suspension blocking
        
        // If suspended, manually resume to continue testing
        const process = kernel.getProcess("test");
        if (process && process.state === "suspended") {
          kernel.resumeProcess("test");
        }
        
        kernel.run();
      }

      const process = kernel.getProcess("test");
      expect(process?.state).to.equal("suspended");
      expect(process?.stats.suspendedUntil).to.equal(Number.MAX_SAFE_INTEGER);
      expect(process?.stats.suspensionReason).to.include("Circuit breaker");
      expect(process?.stats.suspensionReason).to.include("permanent");
      
      // Should emit permanent suspension event
      const suspensionEvents = eventLog.filter(e => e.event === "suspended");
      const permanentSuspension = suspensionEvents.find(e => e.data.permanent === true);
      expect(permanentSuspension).to.not.be.undefined;
      expect(permanentSuspension?.data.consecutive).to.equal(10);
    });
  });

  describe("Automatic recovery", () => {
    it("should automatically resume process when suspension expires", () => {
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => {
          throw new Error("Test error");
        }
      });

      // Fail 3 times to trigger suspension
      for (let i = 0; i < 3; i++) {
        Game.time = i;
        kernel.run();
      }

      const process = kernel.getProcess("test");
      const resumeTime = process?.stats.suspendedUntil || 0;
      
      expect(process?.state).to.equal("suspended");
      
      // Advance time past suspension period
      Game.time = resumeTime + 1;
      kernel.run();

      // Process should be resumed automatically
      const processAfter = kernel.getProcess("test");
      expect(processAfter?.state).to.not.equal("suspended");
      expect(processAfter?.stats.suspendedUntil).to.be.null;
      expect(processAfter?.stats.suspensionReason).to.be.null;
      
      // Should emit recovery event
      const recoveryEvents = eventLog.filter(e => e.event === "recovered");
      expect(recoveryEvents).to.have.lengthOf(1);
      expect(recoveryEvents[0].data.processId).to.equal("test");
    });

    it("should not resume before suspension expires", () => {
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => {
          throw new Error("Test error");
        }
      });

      // Fail 3 times
      for (let i = 0; i < 3; i++) {
        Game.time = i;
        kernel.run();
      }

      const process = kernel.getProcess("test");
      const resumeTime = process?.stats.suspendedUntil || 0;
      
      // Try to run before suspension expires
      Game.time = resumeTime - 1;
      kernel.run();

      // Should still be suspended
      const processAfter = kernel.getProcess("test");
      expect(processAfter?.state).to.equal("suspended");
    });
  });

  describe("Manual resume", () => {
    it("should allow manual resume of suspended processes", () => {
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => {
          throw new Error("Test error");
        }
      });

      // Fail 3 times to trigger suspension
      for (let i = 0; i < 3; i++) {
        Game.time = i;
        kernel.run();
      }

      expect(kernel.getProcess("test")?.state).to.equal("suspended");
      
      // Clear event log before manual resume
      eventLog = [];
      
      // Manually resume
      const result = kernel.resumeProcess("test");
      expect(result).to.be.true;

      const process = kernel.getProcess("test");
      expect(process?.state).to.not.equal("suspended");
      expect(process?.stats.suspendedUntil).to.be.null;
      expect(process?.stats.suspensionReason).to.be.null;
      
      // Should emit recovery event with manual flag
      expect(eventLog).to.have.lengthOf(1);
      expect(eventLog[0].event).to.equal("recovered");
      expect(eventLog[0].data.manual).to.be.true;
    });

    it("should return false when trying to resume non-existent process", () => {
      const result = kernel.resumeProcess("non-existent");
      expect(result).to.be.false;
    });

    it("should return false when trying to resume non-suspended process", () => {
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => {}
      });

      const result = kernel.resumeProcess("test");
      expect(result).to.be.false;
    });
  });

  describe("Stats summary integration", () => {
    it("should include health metrics in stats summary", () => {
      // Register a healthy process
      kernel.registerProcess({
        id: "healthy",
        name: "Healthy Process",
        priority: ProcessPriority.HIGH,
        frequency: "high",
        execute: () => {}
      });

      // Register an unhealthy process
      kernel.registerProcess({
        id: "unhealthy",
        name: "Unhealthy Process",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => {
          throw new Error("Test error");
        }
      });

      // Run processes
      kernel.run();
      Game.time++;
      kernel.run();

      const stats = kernel.getStatsSummary();
      
      expect(stats.avgHealthScore).to.be.lessThan(100);
      expect(stats.avgHealthScore).to.be.greaterThan(0);
      expect(stats.unhealthyProcesses).to.have.lengthOf(1);
      expect(stats.unhealthyProcesses[0].name).to.equal("Unhealthy Process");
    });

    it("should track suspended processes in summary", () => {
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => {
          throw new Error("Test error");
        }
      });

      // Fail 3 times to trigger suspension
      for (let i = 0; i < 3; i++) {
        Game.time = i;
        kernel.run();
      }

      const stats = kernel.getStatsSummary();
      expect(stats.suspendedProcesses).to.equal(1);
      expect(stats.activeProcesses).to.equal(0);
    });
  });

  describe("Process state transitions", () => {
    it("should track state correctly: idle -> running -> idle", () => {
      let state: string = "";
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => {
          const process = kernel.getProcess("test");
          state = process?.state || "";
        }
      });

      const processBefore = kernel.getProcess("test");
      expect(processBefore?.state).to.equal("idle");

      kernel.run();
      expect(state).to.equal("running");

      const processAfter = kernel.getProcess("test");
      expect(processAfter?.state).to.equal("idle");
    });

    it("should track state correctly: idle -> running -> error -> suspended", () => {
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => {
          throw new Error("Test error");
        }
      });

      // Fail 3 times
      for (let i = 0; i < 3; i++) {
        Game.time = i;
        kernel.run();
      }

      const process = kernel.getProcess("test");
      expect(process?.state).to.equal("suspended");
    });
  });
});
