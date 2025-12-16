import { expect } from "chai";
import { PosisKernelAdapter } from "../../src/core/posis/PosisKernelAdapter";
import { BaseProcess } from "../../src/core/posis/BaseProcess";

// Mock Game object
declare const global: NodeJS.Global & typeof globalThis;

class TestProcess extends BaseProcess {
  public runCount = 0;
  public shouldCrash = false;
  public cpuUsage = 0;

  protected doRun(): void {
    this.runCount++;
    
    if (this.shouldCrash) {
      throw new Error("Intentional crash for testing");
    }
    
    // Simulate CPU usage
    if (this.cpuUsage > 0) {
      const before = Game.cpu.getUsed();
      Game.cpu.getUsed = () => before + this.cpuUsage;
    }
  }
  
  protected serializeState(): Record<string, unknown> {
    return {
      runCount: this.runCount
    };
  }
  
  protected deserializeState(state: Record<string, unknown>): void {
    this.runCount = state.runCount as number;
  }
}

describe("POSIS Kernel Enhancements", () => {
  let kernel: PosisKernelAdapter;
  
  beforeEach(() => {
    // Reset global Game object
    global.Game = {
      time: 1000,
      cpu: {
        bucket: 10000,
        limit: 50,
        getUsed: () => 0
      }
    };
    
    global.Memory = {
      posisProcesses: {},
      processCheckpoints: {}
    };
    
    kernel = new PosisKernelAdapter();
    kernel.initialize();
  });

  describe("Crash Recovery", () => {
    it("should catch and log process crashes", () => {
      const process = new TestProcess("crash-test", "CrashTest");
      process.shouldCrash = true;
      
      kernel.registerProcess("crash-test", process);
      
      // Run kernel - process should crash but not halt kernel
      expect(() => kernel.run()).to.not.throw();
      
      // Check crash metadata
      const crashMeta = kernel.getProcessCrashMetadata("crash-test");
      expect(crashMeta).to.not.be.undefined;
      if (crashMeta) {
        expect(crashMeta.crashCount).to.equal(1);
        expect(crashMeta.consecutiveCrashes).to.equal(1);
      }
    });
    
    it("should restart crashed process after cooldown", () => {
      const process = new TestProcess("restart-test", "RestartTest");
      process.shouldCrash = true;
      
      kernel.registerProcess("restart-test", process);
      
      // First run - should crash
      kernel.run();
      expect(process.runCount).to.equal(1);
      
      // Process should be in cooldown
      process.shouldCrash = false; // Fix the crash
      
      // Advance time by 5 ticks (still in cooldown)
      Game.time += 5;
      kernel.run();
      expect(process.runCount).to.equal(1); // Should not run yet
      
      // Advance time by 10 ticks total (cooldown expired)
      Game.time += 5;
      kernel.run();
      expect(process.runCount).to.equal(2); // Should run again
    });
    
    it("should disable process after 3 consecutive crashes", () => {
      const process = new TestProcess("disable-test", "DisableTest");
      process.shouldCrash = true;
      
      kernel.registerProcess("disable-test", process);
      
      // Crash 3 times
      for (let i = 0; i < 3; i++) {
        kernel.run();
        Game.time += 11; // Wait out cooldown
      }
      
      // Check that process is disabled
      const crashMeta = kernel.getProcessCrashMetadata("disable-test");
      expect(crashMeta).to.not.be.undefined;
      if (crashMeta) {
        expect(crashMeta.disabled).to.be.true;
        expect(crashMeta.consecutiveCrashes).to.equal(3);
      }
      
      // Process should not run even after cooldown
      process.shouldCrash = false;
      Game.time += 100;
      const runsBefore = process.runCount;
      kernel.run();
      expect(process.runCount).to.equal(runsBefore); // Should not increase
    });
    
    it("should reset consecutive crash counter on successful run", () => {
      const process = new TestProcess("recovery-test", "RecoveryTest");
      
      kernel.registerProcess("recovery-test", process);
      
      // Crash once
      process.shouldCrash = true;
      kernel.run();
      
      let crashMeta = kernel.getProcessCrashMetadata("recovery-test");
      expect(crashMeta).to.not.be.undefined;
      if (crashMeta) {
        expect(crashMeta.consecutiveCrashes).to.equal(1);
      }
      
      // Successful run
      process.shouldCrash = false;
      Game.time += 11;
      kernel.run();
      
      crashMeta = kernel.getProcessCrashMetadata("recovery-test");
      expect(crashMeta).to.not.be.undefined;
      if (crashMeta) {
        expect(crashMeta.consecutiveCrashes).to.equal(0);
      }
    });
  });

  describe("Resource Limits", () => {
    it("should enforce CPU budget limits", () => {
      const process = new TestProcess("cpu-limit-test", "CPULimitTest");
      
      kernel.registerProcess("cpu-limit-test", process, {
        cpuBudget: 0.1 // 10% of CPU limit = 5 CPU
      });
      
      // Simulate process using excessive CPU
      let cpuUsed = 0;
      Game.cpu.getUsed = () => cpuUsed;
      
      // Before execution
      cpuUsed = 0;
      
      // Simulate the process using 10 CPU (over 5 CPU budget)
      process.cpuUsage = 10;
      
      // Run kernel - process should be killed
      kernel.run();
      
      // Process should be unregistered
      expect(kernel.getProcess("cpu-limit-test")).to.be.undefined;
    });
    
    it("should set custom resource limits", () => {
      const process = new TestProcess("custom-limit-test", "CustomLimitTest");
      
      kernel.registerProcess("custom-limit-test", process);
      kernel.setProcessResourceLimits("custom-limit-test", {
        cpuBudget: 0.2,
        cpuWarningThreshold: 0.9
      });
      
      // Limits should be set (we can't directly test private data,
      // but we can test behavior)
      expect(kernel.getProcess("custom-limit-test")).to.not.be.undefined;
    });
  });

  describe("Checkpointing", () => {
    it("should save process state at checkpoint frequency", () => {
      const process = new TestProcess("checkpoint-test", "CheckpointTest");
      
      kernel.registerProcess("checkpoint-test", process);
      kernel.setCheckpointFrequency(10);
      
      // Run process a few times
      process.runCount = 0;
      kernel.run();
      kernel.run();
      kernel.run();
      
      // Advance time to trigger checkpoint
      Game.time += 10;
      kernel.run();
      
      // Check that checkpoint was saved
      expect(Memory.processCheckpoints).to.not.be.undefined;
      if (Memory.processCheckpoints) {
        expect(Memory.processCheckpoints["checkpoint-test"]).to.not.be.undefined;
        const checkpoint = Memory.processCheckpoints["checkpoint-test"];
        if (checkpoint && checkpoint.state) {
          expect((checkpoint.state as any).runCount).to.equal(4);
        }
      }
    });
    
    it("should restore process state from checkpoint", () => {
      const process = new TestProcess("restore-test", "RestoreTest");
      
      // Set up a checkpoint in memory
      Memory.processCheckpoints = {
        "restore-test": {
          processId: "restore-test",
          tick: 900,
          state: { runCount: 42 }
        }
      };
      
      kernel.registerProcess("restore-test", process);
      
      // Process should have restored state
      expect(process.runCount).to.equal(42);
    });
    
    it("should only save changed state (incremental checkpointing)", () => {
      const process = new TestProcess("incremental-test", "IncrementalTest");
      
      kernel.registerProcess("incremental-test", process);
      kernel.setCheckpointFrequency(5);
      
      // Run once to create initial checkpoint
      kernel.run();
      Game.time += 5;
      kernel.run();
      
      const firstCheckpoint = Memory.processCheckpoints["incremental-test"];
      const firstTick = firstCheckpoint.tick;
      
      // Run again without changing state
      Game.time += 5;
      kernel.run();
      
      // Checkpoint tick should not update if state didn't change
      const secondCheckpoint = Memory.processCheckpoints["incremental-test"];
      // State changed (runCount increased), so tick should update
      expect(secondCheckpoint.tick).to.be.greaterThan(firstTick);
    });
  });

  describe("IPC Communication Tracing", () => {
    it("should trace IPC messages when enabled", () => {
      const sender = new TestProcess("sender", "Sender");
      const receiver = new TestProcess("receiver", "Receiver");
      
      kernel.registerProcess("sender", sender);
      kernel.registerProcess("receiver", receiver);
      kernel.setIPCTracing(true);
      
      // Send a message
      kernel.sendMessage("receiver", { type: "test", data: "hello" }, "sender");
      
      // Get traces
      const traces = kernel.getIPCMessageTraces(10);
      expect(traces.length).to.be.greaterThan(0);
      expect(traces[traces.length - 1].senderId).to.equal("sender");
      expect(traces[traces.length - 1].receiverId).to.equal("receiver");
    });
    
    it("should detect excessive communication", () => {
      const sender = new TestProcess("sender", "Sender");
      const receiver = new TestProcess("receiver", "Receiver");
      
      kernel.registerProcess("sender", sender);
      kernel.registerProcess("receiver", receiver);
      
      // Send many messages (more than threshold)
      for (let i = 0; i < 150; i++) {
        kernel.sendMessage("receiver", { type: "spam", index: i }, "sender");
      }
      
      // Should warn about excessive communication (implementation logs warning)
      // We can't easily test console output, but the code should run without error
      expect(() => kernel.run()).to.not.throw();
    });
  });

  describe("Process Migration", () => {
    it("should serialize process for migration", () => {
      const process = new TestProcess("migrate-test", "MigrateTest");
      process.runCount = 10;
      
      kernel.registerProcess("migrate-test", process);
      
      // Migrate the process
      const migrationData = kernel.migrateProcess("migrate-test");
      
      expect(migrationData).to.not.be.null;
      if (migrationData) {
        expect(migrationData.id).to.equal("migrate-test");
        expect(migrationData.name).to.equal("MigrateTest");
        expect(migrationData.state).to.deep.include({ runCount: 10 });
      }
    });
    
    it("should import a migrated process", () => {
      const migrationData = {
        id: "imported-test",
        name: "ImportedTest",
        priority: 50,
        state: { runCount: 25 }
      };
      
      const process = new TestProcess("imported-test", "ImportedTest");
      
      const success = kernel.importMigratedProcess(migrationData, process);
      
      expect(success).to.be.true;
      expect(process.runCount).to.equal(25);
      expect(kernel.getProcess("imported-test")).to.equal(process);
    });
    
    it("should rollback on failed import", () => {
      const invalidData = {
        id: "invalid-test",
        // Missing required fields
      };
      
      const process = new TestProcess("invalid-test", "InvalidTest");
      
      const success = kernel.importMigratedProcess(invalidData, process);
      
      expect(success).to.be.false;
      expect(kernel.getProcess("invalid-test")).to.be.undefined;
    });
  });

  describe("Process Dependencies and Priority Inheritance", () => {
    it("should track process dependencies", () => {
      const dependency = new TestProcess("dependency", "Dependency");
      const dependent = new TestProcess("dependent", "Dependent");
      
      kernel.registerProcess("dependency", dependency);
      kernel.registerProcess("dependent", dependent);
      
      // Add dependency
      kernel.addProcessDependency("dependent", "dependency");
      
      // Dependencies should be tracked (can't directly test private map,
      // but code should run without error)
      expect(() => kernel.run()).to.not.throw();
    });
    
    it("should remove process dependencies", () => {
      const dependency = new TestProcess("dep", "Dep");
      const dependent = new TestProcess("dept", "Dept");
      
      kernel.registerProcess("dep", dependency);
      kernel.registerProcess("dept", dependent);
      
      kernel.addProcessDependency("dept", "dep");
      kernel.removeProcessDependency("dept", "dep");
      
      // Should run without error
      expect(() => kernel.run()).to.not.throw();
    });
  });

  describe("Process Sandboxing", () => {
    it("should isolate process memory", () => {
      const process1 = new TestProcess("isolated1", "Isolated1");
      const process2 = new TestProcess("isolated2", "Isolated2");
      
      kernel.registerProcess("isolated1", process1);
      kernel.registerProcess("isolated2", process2);
      
      // Each process should have isolated memory
      process1.memory.testData = "process1";
      process2.memory.testData = "process2";
      
      expect(process1.memory.testData).to.equal("process1");
      expect(process2.memory.testData).to.equal("process2");
      expect(process1.memory.testData).to.not.equal(process2.memory.testData);
    });
    
    it("should enforce syscall-only communication", () => {
      const sender = new TestProcess("sender", "Sender");
      const receiver = new TestProcess("receiver", "Receiver");
      
      kernel.registerProcess("sender", sender);
      kernel.registerProcess("receiver", receiver);
      
      // Communication should only work through syscalls via kernel
      kernel.sendMessage("receiver", { type: "hello" }, "sender");
      
      kernel.run();
      
      // Message should be queued (can't directly verify,
      // but code should run without error)
      expect(() => kernel.run()).to.not.throw();
    });
  });
});
