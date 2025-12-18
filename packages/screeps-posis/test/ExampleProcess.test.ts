/**
 * Unit tests for ExampleProcess
 */

import { expect } from "chai";
import { ExampleProcess } from "../src/examples/ExampleProcess";
import type { IPosisProcessContext } from "../src/process/IPosisProcess";
import type { IPosisProcessSyscalls } from "../src/kernel/IPosisKernel";

describe("ExampleProcess", () => {
  let process: ExampleProcess;
  let mockContext: IPosisProcessContext;
  let mockSyscalls: IPosisProcessSyscalls;
  let processMemory: Record<string, unknown>;
  let sharedMemory: Map<string, unknown>;
  let loggedMessages: Array<{ level: string; message: string; metadata?: Record<string, unknown> }>;

  beforeEach(() => {
    processMemory = {};
    sharedMemory = new Map();
    loggedMessages = [];
    
    mockSyscalls = {
      sleep: () => {},
      wake: () => {},
      fork: () => {},
      kill: () => {},
      setPriority: () => {},
      sendMessage: () => {},
      getMessages: () => [],
      getSharedMemory: (key: string) => sharedMemory.get(key),
      setSharedMemory: (key: string, value: unknown) => {
        sharedMemory.set(key, value);
      }
    };

    mockContext = {
      id: "example-process",
      parentId: undefined,
      memory: processMemory,
      syscalls: mockSyscalls,
      on: () => {},
      emit: () => {},
      log: (level: string, message: string, metadata?: Record<string, unknown>) => {
        loggedMessages.push({ level, message, metadata });
      }
    };

    process = new ExampleProcess("example-process");
  });

  describe("initialization", () => {
    it("should initialize correctly", () => {
      expect(process.id).to.equal("example-process");
      expect(process.name).to.equal("ExampleProcess");
      expect(process.priority).to.equal(50);
    });

    it("should log initialization message", () => {
      process.init(mockContext);
      
      const initLog = loggedMessages.find(log => log.message.includes("initialized"));
      expect(initLog).to.not.be.undefined;
      expect(initLog!.level).to.equal("info");
    });
  });

  describe("run behavior", () => {
    beforeEach(() => {
      process.init(mockContext);
      loggedMessages = []; // Clear init logs
    });

    it("should increment counter on each run", () => {
      process.run();
      process.run();
      process.run();
      
      const state = process.serialize();
      expect(state.counter).to.equal(3);
    });

    it("should update shared memory counter", () => {
      process.run();
      
      const globalCounter = sharedMemory.get("globalCounter");
      expect(globalCounter).to.equal(1);
      
      process.run();
      const updatedCounter = sharedMemory.get("globalCounter");
      expect(updatedCounter).to.equal(2);
    });

    it("should log every 10 ticks", () => {
      for (let i = 0; i < 15; i++) {
        process.run();
      }
      
      const periodicLogs = loggedMessages.filter(log => 
        log.message.includes("Process running, counter:")
      );
      
      expect(periodicLogs.length).to.equal(1); // At tick 10
      expect(periodicLogs[0].message).to.include("counter: 10");
    });

    it("should sleep after 20 runs", () => {
      let sleepCalled = false;
      let sleepDuration = 0;
      
      mockSyscalls.sleep = (ticks: number) => {
        sleepCalled = true;
        sleepDuration = ticks;
      };
      
      for (let i = 0; i < 20; i++) {
        process.run();
      }
      
      expect(sleepCalled).to.be.true;
      expect(sleepDuration).to.equal(5);
    });
  });

  describe("message handling", () => {
    beforeEach(() => {
      process.init(mockContext);
    });

    it("should handle incoming messages", () => {
      const message = { type: "greeting", text: "Hello!" };
      process.onMessage(message, "parent-process");
      
      const state = process.serialize();
      expect(state.lastMessage).to.equal("Hello!");
    });

    it("should log received messages", () => {
      loggedMessages = [];
      
      const message = { type: "test", text: "Test message" };
      process.onMessage(message, "sender-123");
      
      const messageLog = loggedMessages.find(log => 
        log.message.includes("Received message from sender-123")
      );
      
      expect(messageLog).to.not.be.undefined;
      expect(messageLog!.message).to.include("Test message");
    });
  });

  describe("state persistence", () => {
    beforeEach(() => {
      process.init(mockContext);
    });

    it("should serialize counter state", () => {
      for (let i = 0; i < 5; i++) {
        process.run();
      }
      
      const state = process.serialize();
      expect(state.counter).to.equal(5);
    });

    it("should serialize last message", () => {
      const message = { type: "greeting", text: "Hello!" };
      process.onMessage(message, "sender");
      
      const state = process.serialize();
      expect(state.lastMessage).to.equal("Hello!");
    });

    it("should deserialize state correctly", () => {
      const state = {
        counter: 42,
        lastMessage: "Restored message"
      };
      
      process.deserialize(state);
      
      const serialized = process.serialize();
      expect(serialized.counter).to.equal(42);
      expect(serialized.lastMessage).to.equal("Restored message");
    });
  });

  describe("cleanup", () => {
    beforeEach(() => {
      process.init(mockContext);
    });

    it("should log cleanup message with final counter", () => {
      for (let i = 0; i < 7; i++) {
        process.run();
      }
      
      loggedMessages = [];
      process.cleanup();
      
      const cleanupLog = loggedMessages.find(log => 
        log.message.includes("cleaning up")
      );
      
      expect(cleanupLog).to.not.be.undefined;
      expect(cleanupLog!.metadata?.finalCounter).to.equal(7);
    });
  });
});
