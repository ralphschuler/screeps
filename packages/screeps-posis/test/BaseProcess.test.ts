/**
 * Unit tests for BaseProcess
 */

import { expect } from "chai";
import { BaseProcess } from "../src/process/BaseProcess";
import type { IPosisProcessContext, IPosisProcessState } from "../src/process/IPosisProcess";
import type { IPosisProcessSyscalls } from "../src/kernel/IPosisKernel";

class TestProcess extends BaseProcess {
  public runCount = 0;
  public lastMessage: { message: unknown; senderId: string } | null = null;

  protected doRun(): void {
    this.runCount++;
  }

  protected handleMessage(message: unknown, senderId: string): void {
    this.lastMessage = { message, senderId };
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

describe("BaseProcess", () => {
  let process: TestProcess;
  let mockContext: IPosisProcessContext;
  let mockSyscalls: IPosisProcessSyscalls;
  let processMemory: Record<string, unknown>;

  beforeEach(() => {
    processMemory = {};
    
    mockSyscalls = {
      sleep: () => {},
      wake: () => {},
      fork: () => {},
      kill: () => {},
      setPriority: () => {},
      sendMessage: () => {},
      getMessages: () => [],
      getSharedMemory: () => undefined,
      setSharedMemory: () => {}
    };

    mockContext = {
      id: "test-process",
      parentId: undefined,
      memory: processMemory,
      syscalls: mockSyscalls,
      on: () => {},
      emit: () => {},
      log: () => {}
    };

    process = new TestProcess("test-process", "TestProcess", 50);
  });

  describe("initialization", () => {
    it("should initialize with correct properties", () => {
      expect(process.id).to.equal("test-process");
      expect(process.name).to.equal("TestProcess");
      expect(process.priority).to.equal(50);
      expect(process.state).to.equal("idle");
    });

    it("should initialize context when init is called", () => {
      process.init(mockContext);
      expect(process.context).to.equal(mockContext);
    });

    it("should throw error when accessing syscalls before init", () => {
      expect(() => (process as any).syscalls).to.throw(/not initialized/);
    });

    it("should throw error when accessing memory before init", () => {
      expect(() => (process as any).memory).to.throw(/not initialized/);
    });
  });

  describe("run", () => {
    beforeEach(() => {
      process.init(mockContext);
    });

    it("should execute doRun when run is called", () => {
      process.run();
      expect(process.runCount).to.equal(1);
    });

    it("should set state to running during execution", () => {
      let stateWhileRunning: IPosisProcessState = "idle";
      
      class StateCheckProcess extends BaseProcess {
        constructor(id: string, name: string, priority: number) {
          super(id, name, priority);
        }
        
        protected doRun(): void {
          stateWhileRunning = this.state;
        }
      }
      
      const stateProcess = new StateCheckProcess("state-test", "StateCheckProcess", 50);
      stateProcess.init(mockContext);
      stateProcess.run();
      
      expect(stateWhileRunning).to.equal("running");
      expect(stateProcess.state).to.equal("idle");
    });

    it("should set state to error on exception", () => {
      class ErrorProcess extends BaseProcess {
        protected doRun(): void {
          throw new Error("Test error");
        }
      }
      
      const errorProcess = new ErrorProcess("error-test", "ErrorProcess", 50);
      errorProcess.init(mockContext);
      
      expect(() => errorProcess.run()).to.throw("Test error");
      expect(errorProcess.state).to.equal("error");
    });

    it("should reset to idle after successful run", () => {
      process.run();
      expect(process.state).to.equal("idle");
    });
  });

  describe("message handling", () => {
    beforeEach(() => {
      process.init(mockContext);
    });

    it("should handle incoming messages", () => {
      const message = { type: "test", data: "hello" };
      process.onMessage(message, "sender-process");
      
      expect(process.lastMessage).to.not.be.null;
      expect(process.lastMessage!.message).to.deep.equal(message);
      expect(process.lastMessage!.senderId).to.equal("sender-process");
    });
  });

  describe("serialization", () => {
    beforeEach(() => {
      process.init(mockContext);
    });

    it("should serialize process state", () => {
      process.runCount = 42;
      const state = process.serialize();
      
      expect(state.id).to.equal("test-process");
      expect(state.priority).to.equal(50);
      expect(state.runCount).to.equal(42);
    });

    it("should deserialize process state", () => {
      const state = {
        id: "test-process",
        priority: 75,
        state: "sleeping" as IPosisProcessState,
        runCount: 100
      };
      
      process.deserialize(state);
      
      expect(process.priority).to.equal(75);
      expect(process.state).to.equal("sleeping");
      expect(process.runCount).to.equal(100);
    });
  });

  describe("helper methods", () => {
    let sleepTicks: number | undefined;
    let sentMessage: { targetId: string; message: unknown } | undefined;
    let sharedMemory: Map<string, unknown>;

    beforeEach(() => {
      sleepTicks = undefined;
      sentMessage = undefined;
      sharedMemory = new Map();
      
      mockSyscalls.sleep = (ticks: number) => {
        sleepTicks = ticks;
      };
      
      mockSyscalls.sendMessage = (targetId: string, message: unknown) => {
        sentMessage = { targetId, message };
      };
      
      mockSyscalls.getSharedMemory = (key: string) => {
        return sharedMemory.get(key);
      };
      
      mockSyscalls.setSharedMemory = (key: string, value: unknown) => {
        sharedMemory.set(key, value);
      };
      
      process.init(mockContext);
    });

    it("should call sleep syscall", () => {
      (process as any).sleep(10);
      expect(sleepTicks).to.equal(10);
    });

    it("should call sendMessage syscall", () => {
      const message = { data: "test" };
      (process as any).sendMessage("target", message);
      
      expect(sentMessage).to.not.be.undefined;
      expect(sentMessage!.targetId).to.equal("target");
      expect(sentMessage!.message).to.deep.equal(message);
    });

    it("should get and set shared memory", () => {
      (process as any).setSharedMemory("key1", "value1");
      const value = (process as any).getSharedMemory("key1");
      
      expect(value).to.equal("value1");
    });
  });
});
