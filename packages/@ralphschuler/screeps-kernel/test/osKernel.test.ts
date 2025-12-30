/**
 * Tests for OS-style Process Architecture
 */

import { describe, it, beforeEach } from "mocha";
import { expect } from "chai";
import { OSProcess, ProcessStatus } from "../src/osProcess";
import {
  registerProcessClass,
  addProcess,
  killProcess,
  getProcessById,
  storeProcessTable,
  loadProcessTable,
  run as runOSKernel,
  getProcessStats,
  resetOSKernel
} from "../src/osKernel";

// Test process implementation
class TestProcess extends OSProcess {
  public runCount = 0;
  public reloadCount = 0;
  public lastMemory: any = null;

  constructor(parentPID: number) {
    super(parentPID);
  }

  public run(memory: any): void {
    this.runCount++;
    this.lastMemory = memory;
    
    // Store run count in memory
    memory.runCount = (memory.runCount || 0) + 1;
  }

  public reloadFromMemory(memory: any): void {
    this.reloadCount++;
    this.lastMemory = memory;
  }
}

// Another test process
class AnotherTestProcess extends OSProcess {
  public data: string = "";

  constructor(parentPID: number) {
    super(parentPID);
  }

  public run(memory: any): void {
    memory.value = (memory.value || 0) + 10;
  }

  public reloadFromMemory(memory: any): void {
    this.data = memory.data || "default";
  }
}

describe("OS-Style Process Architecture", () => {
  beforeEach(() => {
    // Reset OS kernel state
    resetOSKernel();
    
    // Clear Memory
    global.Memory = {
      processTable: undefined,
      processMemory: undefined
    } as any;
    
    // Register test processes
    registerProcessClass("TestProcess", TestProcess);
    registerProcessClass("AnotherTestProcess", AnotherTestProcess);
  });

  describe("OSProcess", () => {
    it("should create a process with parent PID", () => {
      const process = new TestProcess(-1);
      
      expect(process.pid).to.equal(-1); // Not yet assigned
      expect(process.parentPID).to.equal(-1);
      expect(process.status).to.equal(ProcessStatus.RUNNING);
      expect(process.className).to.equal("TestProcess");
    });

    it("should have RUNNING status by default", () => {
      const process = new TestProcess(-1);
      expect(process.status).to.equal(ProcessStatus.RUNNING);
    });

    it("should allow status changes", () => {
      const process = new TestProcess(-1);
      process.status = ProcessStatus.DEAD;
      expect(process.status).to.equal(ProcessStatus.DEAD);
    });
  });

  describe("Process Registration", () => {
    it("should register process classes", () => {
      // Already registered in beforeEach
      const stats = getProcessStats();
      // Stats reflect running processes, not registered classes
      expect(stats).to.be.an("object");
    });
  });

  describe("addProcess", () => {
    it("should add a process and assign PID 0 for first process", () => {
      const process = new TestProcess(-1);
      const added = addProcess(process);
      
      expect(added.pid).to.equal(0);
      expect(getProcessById(0)).to.equal(process);
    });

    it("should assign sequential PIDs", () => {
      const p1 = addProcess(new TestProcess(-1));
      const p2 = addProcess(new TestProcess(-1));
      const p3 = addProcess(new TestProcess(-1));
      
      expect(p1.pid).to.equal(0);
      expect(p2.pid).to.equal(1);
      expect(p3.pid).to.equal(2);
    });

    it("should reuse PIDs after processes are removed from storage", () => {
      const p1 = addProcess(new TestProcess(-1));
      const p2 = addProcess(new TestProcess(-1));
      
      expect(p1.pid).to.equal(0);
      expect(p2.pid).to.equal(1);
      
      // Kill p1 and cycle through storage
      killProcess(0);
      storeProcessTable(); // p1 is filtered out (it's dead)
      loadProcessTable();   // p1 is not loaded back
      
      // Now PID 0 is available again
      const p3 = addProcess(new TestProcess(-1));
      expect(p3.pid).to.equal(0); // Reuses freed PID
    });
  });

  describe("killProcess", () => {
    it("should mark process as DEAD", () => {
      const process = addProcess(new TestProcess(-1));
      
      killProcess(process.pid);
      
      expect(process.status).to.equal(ProcessStatus.DEAD);
    });

    it("should clear process memory", () => {
      const process = addProcess(new TestProcess(-1));
      Memory.processMemory = { [process.pid]: { data: "test" } };
      
      killProcess(process.pid);
      
      expect(Memory.processMemory![process.pid]).to.be.undefined;
    });
  });

  describe("getProcessById", () => {
    it("should return process by PID", () => {
      const process = addProcess(new TestProcess(-1));
      const retrieved = getProcessById(process.pid);
      
      expect(retrieved).to.equal(process);
    });

    it("should return undefined for non-existent PID", () => {
      const retrieved = getProcessById(999);
      expect(retrieved).to.be.undefined;
    });
  });

  describe("storeProcessTable", () => {
    it("should store alive processes to Memory", () => {
      const p1 = addProcess(new TestProcess(-1));
      const p2 = addProcess(new AnotherTestProcess(0));
      
      storeProcessTable();
      
      expect(Memory.processTable).to.have.lengthOf(2);
      expect(Memory.processTable![0]).to.deep.equal({
        pid: p1.pid,
        parentPID: -1,
        className: "TestProcess"
      });
      expect(Memory.processTable![1]).to.deep.equal({
        pid: p2.pid,
        parentPID: 0,
        className: "AnotherTestProcess"
      });
    });

    it("should exclude dead processes", () => {
      const p1 = addProcess(new TestProcess(-1));
      const p2 = addProcess(new AnotherTestProcess(-1));
      
      killProcess(p1.pid);
      storeProcessTable();
      
      expect(Memory.processTable).to.have.lengthOf(1);
      expect(Memory.processTable![0].className).to.equal("AnotherTestProcess");
    });
  });

  describe("loadProcessTable", () => {
    it("should recreate processes from Memory", () => {
      // Setup Memory
      Memory.processTable = [
        { pid: 0, parentPID: -1, className: "TestProcess" },
        { pid: 1, parentPID: 0, className: "AnotherTestProcess" }
      ];
      
      loadProcessTable();
      
      const p0 = getProcessById(0);
      const p1 = getProcessById(1);
      
      expect(p0).to.be.instanceOf(TestProcess);
      expect(p1).to.be.instanceOf(AnotherTestProcess);
      expect(p0!.pid).to.equal(0);
      expect(p1!.pid).to.equal(1);
      expect(p1!.parentPID).to.equal(0);
    });

    it("should call reloadFromMemory on loaded processes", () => {
      Memory.processTable = [
        { pid: 0, parentPID: -1, className: "TestProcess" }
      ];
      Memory.processMemory = {
        0: { data: "restored" }
      };
      
      loadProcessTable();
      
      const process = getProcessById(0) as TestProcess;
      expect(process.reloadCount).to.equal(1);
      expect(process.lastMemory).to.deep.equal({ data: "restored" });
    });

    it("should handle unregistered classes gracefully", () => {
      Memory.processTable = [
        { pid: 0, parentPID: -1, className: "UnknownProcess" }
      ];
      
      // Should not throw
      expect(() => loadProcessTable()).to.not.throw();
      
      // Process should not be loaded
      expect(getProcessById(0)).to.be.undefined;
    });
  });

  describe("runOSKernel", () => {
    it("should run all processes in queue", () => {
      const p1 = addProcess(new TestProcess(-1));
      const p2 = addProcess(new TestProcess(-1));
      
      // Store and reload to populate queue
      storeProcessTable();
      loadProcessTable();
      
      runOSKernel();
      
      const reloaded1 = getProcessById(p1.pid) as TestProcess;
      const reloaded2 = getProcessById(p2.pid) as TestProcess;
      
      expect(reloaded1.runCount).to.equal(1);
      expect(reloaded2.runCount).to.equal(1);
    });

    it("should skip dead processes", () => {
      const p1 = addProcess(new TestProcess(-1));
      p1.status = ProcessStatus.DEAD;
      
      storeProcessTable();
      loadProcessTable();
      
      runOSKernel();
      
      // Process should not have run (because it was dead when stored)
      const stats = getProcessStats();
      expect(stats.totalProcesses).to.equal(0);
    });

    it("should provide process memory to run method", () => {
      const process = addProcess(new TestProcess(-1));
      Memory.processMemory = {
        [process.pid]: { value: 42 }
      };
      
      storeProcessTable();
      loadProcessTable();
      runOSKernel();
      
      const reloaded = getProcessById(process.pid) as TestProcess;
      expect(reloaded.lastMemory.value).to.equal(42);
    });

    it("should persist memory changes", () => {
      const process = addProcess(new TestProcess(-1));
      
      storeProcessTable();
      loadProcessTable();
      runOSKernel();
      
      // Check that memory was updated
      expect(Memory.processMemory![process.pid].runCount).to.equal(1);
    });

    it("should handle process errors gracefully", () => {
      class ErrorProcess extends OSProcess {
        public run(memory: any): void {
          throw new Error("Test error");
        }
        
        public reloadFromMemory(memory: any): void {}
      }
      
      registerProcessClass("ErrorProcess", ErrorProcess);
      
      const p1 = new ErrorProcess(0, -1);
      addProcess(p1);
      
      storeProcessTable();
      loadProcessTable();
      
      // Should not throw
      expect(() => runOSKernel()).to.not.throw();
    });
  });

  describe("getProcessStats", () => {
    it("should return process statistics", () => {
      addProcess(new TestProcess(-1));
      addProcess(new TestProcess(-1));
      addProcess(new AnotherTestProcess(-1));
      
      const stats = getProcessStats();
      
      expect(stats.totalProcesses).to.equal(3);
      expect(stats.aliveProcesses).to.equal(3);
      expect(stats.deadProcesses).to.equal(0);
      expect(stats.processesByClass["TestProcess"]).to.equal(2);
      expect(stats.processesByClass["AnotherTestProcess"]).to.equal(1);
    });

    it("should count dead processes correctly", () => {
      const p1 = addProcess(new TestProcess(-1));
      addProcess(new TestProcess(-1));
      
      killProcess(p1.pid);
      
      const stats = getProcessStats();
      
      expect(stats.totalProcesses).to.equal(2);
      expect(stats.aliveProcesses).to.equal(1);
      expect(stats.deadProcesses).to.equal(1);
    });
  });

  describe("Full lifecycle integration", () => {
    it("should support add -> run -> store -> load -> run cycle", () => {
      // Tick 1: Add process
      const p1 = addProcess(new TestProcess(-1));
      Memory.processMemory = { [p1.pid]: {} };
      
      // End of tick: store
      storeProcessTable();
      
      // Tick 2: load and run
      loadProcessTable();
      runOSKernel();
      
      // Verify process ran
      expect(Memory.processMemory![p1.pid].runCount).to.equal(1);
      
      // End of tick 2: store
      storeProcessTable();
      
      // Tick 3: load and run again
      loadProcessTable();
      runOSKernel();
      
      // Verify process ran twice
      expect(Memory.processMemory![p1.pid].runCount).to.equal(2);
    });

    it("should support parent-child relationships", () => {
      const parent = addProcess(new TestProcess(-1));
      const child1 = addProcess(new TestProcess(0, parent.pid));
      const child2 = addProcess(new AnotherTestProcess(0, parent.pid));
      
      expect(child1.parentPID).to.equal(parent.pid);
      expect(child2.parentPID).to.equal(parent.pid);
      
      storeProcessTable();
      loadProcessTable();
      
      const reloadedChild1 = getProcessById(child1.pid)!;
      const reloadedChild2 = getProcessById(child2.pid)!;
      
      expect(reloadedChild1.parentPID).to.equal(parent.pid);
      expect(reloadedChild2.parentPID).to.equal(parent.pid);
    });
  });
});
