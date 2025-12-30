/**
 * Unit tests for EventBus - Priority Ordering and Bucket Filtering
 * 
 * Tests cover:
 * 1. Handler priority ordering (handlers execute highest priority first)
 * 2. Event queue priority ordering (queued events sorted by priority)
 * 3. Bucket-aware event filtering and deferral
 * 4. Handler minBucket requirements
 */

import { expect } from "chai";
import { EventBus, EventPriority } from "../src/events";

describe("EventBus", () => {
  let eventBus: EventBus;
  let originalBucket: number;

  beforeEach(() => {
    // Create fresh event bus for each test
    eventBus = new EventBus({
      enableLogging: false,
      lowBucketThreshold: 2000,
      criticalBucketThreshold: 1000,
      maxEventsPerTick: 50,
      maxQueueSize: 200,
      maxEventAge: 100
    });

    // Save original bucket value
    originalBucket = Game.cpu.bucket;
    
    // Reset Game.time
    Game.time = 1000;
  });

  afterEach(() => {
    // Restore original bucket
    Game.cpu.bucket = originalBucket;
    
    // Clean up event bus
    eventBus.clear();
  });

  describe("Handler Priority Ordering", () => {
    it("should execute handlers in priority order (highest first)", () => {
      const executionOrder: number[] = [];

      // Register handlers with different priorities
      eventBus.on("cpu.spike", () => {
        executionOrder.push(10);
      }, { priority: 10 });

      eventBus.on("cpu.spike", () => {
        executionOrder.push(100);
      }, { priority: 100 });

      eventBus.on("cpu.spike", () => {
        executionOrder.push(50);
      }, { priority: 50 });

      eventBus.on("cpu.spike", () => {
        executionOrder.push(75);
      }, { priority: 75 });

      // Emit event with high bucket (immediate processing)
      Game.cpu.bucket = 5000;
      eventBus.emit("cpu.spike", {
        cpuUsed: 100,
        cpuLimit: 50,
        subsystem: "test"
      });

      // Verify handlers executed in priority order
      expect(executionOrder).to.deep.equal([100, 75, 50, 10]);
    });

    it("should maintain priority order when handlers are added dynamically", () => {
      const executionOrder: number[] = [];

      // Add initial handler
      eventBus.on("cpu.spike", () => {
        executionOrder.push(50);
      }, { priority: 50 });

      // Add higher priority handler
      eventBus.on("cpu.spike", () => {
        executionOrder.push(100);
      }, { priority: 100 });

      // Add lower priority handler
      eventBus.on("cpu.spike", () => {
        executionOrder.push(25);
      }, { priority: 25 });

      // Emit event
      Game.cpu.bucket = 5000;
      eventBus.emit("cpu.spike", {
        cpuUsed: 100,
        cpuLimit: 50,
        subsystem: "test"
      });

      // Verify execution order
      expect(executionOrder).to.deep.equal([100, 50, 25]);
    });
  });

  describe("Event Queue Priority Ordering", () => {
    it("should process queued events in priority order", () => {
      const processedEvents: string[] = [];

      // Register handlers that track which events were processed
      eventBus.on("cpu.spike", (event) => {
        processedEvents.push(`cpu.spike-${event.subsystem}`);
      });

      eventBus.on("bucket.modeChange", (event) => {
        processedEvents.push(`bucket.modeChange-${event.oldMode}`);
      });

      eventBus.on("creep.died", (event) => {
        processedEvents.push(`creep.died-${event.creepName}`);
      });

      eventBus.on("spawn.completed", (event) => {
        processedEvents.push(`spawn.completed-${event.creepName}`);
      });

      // Set bucket to queue events (between critical and low threshold)
      Game.cpu.bucket = 1500; // criticalBucketThreshold < bucket < lowBucketThreshold

      // Emit events with different default priorities
      // BACKGROUND priority (10)
      eventBus.emit("cpu.spike", {
        cpuUsed: 100,
        cpuLimit: 50,
        subsystem: "low"
      });

      // BACKGROUND priority (10)
      eventBus.emit("bucket.modeChange", {
        oldMode: "low",
        newMode: "high",
        bucket: 5000
      });

      // NORMAL priority (50)
      eventBus.emit("spawn.completed", {
        roomName: "W1N1",
        creepName: "worker1",
        role: "worker",
        cost: 300
      });

      // HIGH priority (75)
      eventBus.emit("creep.died", {
        creepName: "guard1",
        role: "guard",
        homeRoom: "W1N1",
        cause: "combat"
      });

      // Verify events are queued (not processed immediately)
      const stats = eventBus.getStats();
      expect(stats.queueSize).to.equal(4);
      expect(stats.eventsProcessed).to.equal(0);

      // Process queue with high bucket
      Game.cpu.bucket = 5000;
      eventBus.processQueue();

      // Verify HIGH priority event processed first
      expect(processedEvents[0]).to.equal("creep.died-guard1");
      // Then NORMAL priority
      expect(processedEvents[1]).to.equal("spawn.completed-worker1");
      // Then BACKGROUND events in FIFO order
      expect(processedEvents[2]).to.equal("cpu.spike-low");
      expect(processedEvents[3]).to.equal("bucket.modeChange-low");
    });

    it("should process same-priority events in FIFO order (oldest first)", () => {
      const processedEvents: number[] = [];

      eventBus.on("cpu.spike", (event) => {
        processedEvents.push(event.cpuUsed);
      });

      // Set bucket to queue events
      Game.cpu.bucket = 1500;

      // Emit multiple events with same priority at different times
      Game.time = 1000;
      eventBus.emit("cpu.spike", {
        cpuUsed: 1,
        cpuLimit: 50,
        subsystem: "test"
      });

      Game.time = 1001;
      eventBus.emit("cpu.spike", {
        cpuUsed: 2,
        cpuLimit: 50,
        subsystem: "test"
      });

      Game.time = 1002;
      eventBus.emit("cpu.spike", {
        cpuUsed: 3,
        cpuLimit: 50,
        subsystem: "test"
      });

      // Process queue
      Game.cpu.bucket = 5000;
      eventBus.processQueue();

      // Verify FIFO order (oldest first)
      expect(processedEvents).to.deep.equal([1, 2, 3]);
    });
  });

  describe("Bucket Filtering", () => {
    it("should process events immediately when bucket >= lowBucketThreshold", () => {
      let handlerCalled = false;

      eventBus.on("cpu.spike", () => {
        handlerCalled = true;
      });

      // Set bucket above low threshold
      Game.cpu.bucket = 2500; // > lowBucketThreshold (2000)

      eventBus.emit("cpu.spike", {
        cpuUsed: 100,
        cpuLimit: 50,
        subsystem: "test"
      });

      // Verify event processed immediately
      expect(handlerCalled).to.be.true;
      
      // Verify not queued
      const stats = eventBus.getStats();
      expect(stats.queueSize).to.equal(0);
      expect(stats.eventsProcessed).to.equal(1);
      expect(stats.eventsDeferred).to.equal(0);
    });

    it("should queue events when criticalBucketThreshold <= bucket < lowBucketThreshold", () => {
      let handlerCalled = false;

      eventBus.on("cpu.spike", () => {
        handlerCalled = true;
      });

      // Set bucket between critical and low threshold
      Game.cpu.bucket = 1500; // criticalBucketThreshold (1000) < bucket < lowBucketThreshold (2000)

      eventBus.emit("cpu.spike", {
        cpuUsed: 100,
        cpuLimit: 50,
        subsystem: "test"
      });

      // Verify event not processed immediately
      expect(handlerCalled).to.be.false;
      
      // Verify queued
      const stats = eventBus.getStats();
      expect(stats.queueSize).to.equal(1);
      expect(stats.eventsDeferred).to.equal(1);
      expect(stats.eventsProcessed).to.equal(0);
    });

    it("should process only critical events when bucket < criticalBucketThreshold", () => {
      const processedEvents: string[] = [];

      eventBus.on("cpu.spike", () => {
        processedEvents.push("cpu.spike");
      });

      eventBus.on("hostile.detected", () => {
        processedEvents.push("hostile.detected");
      });

      // Set bucket below critical threshold
      Game.cpu.bucket = 500; // < criticalBucketThreshold (1000)

      // Emit BACKGROUND priority event
      eventBus.emit("cpu.spike", {
        cpuUsed: 100,
        cpuLimit: 50,
        subsystem: "test"
      });

      // Emit CRITICAL priority event
      eventBus.emit("hostile.detected", {
        roomName: "W1N1",
        hostileId: "hostile1" as Id<Creep>,
        hostileOwner: "enemy",
        bodyParts: 10,
        threatLevel: 5
      });

      // Verify only critical event processed
      expect(processedEvents).to.deep.equal(["hostile.detected"]);
      
      const stats = eventBus.getStats();
      expect(stats.eventsProcessed).to.equal(1);
      expect(stats.eventsDropped).to.equal(1); // Background event dropped
    });

    it("should always process events marked as immediate regardless of bucket", () => {
      let handlerCalled = false;

      eventBus.on("cpu.spike", () => {
        handlerCalled = true;
      });

      // Set bucket very low
      Game.cpu.bucket = 100;

      // Emit with immediate flag
      eventBus.emit("cpu.spike", {
        cpuUsed: 100,
        cpuLimit: 50,
        subsystem: "test"
      }, { immediate: true });

      // Verify processed immediately despite low bucket
      expect(handlerCalled).to.be.true;
    });
  });

  describe("Handler minBucket Filtering", () => {
    it("should skip handlers when bucket < minBucket", () => {
      const executionOrder: string[] = [];

      // Register handler with priority 40 (lower than requires-1500 so it runs after)
      eventBus.on("cpu.spike", () => {
        executionOrder.push("no-requirement");
      }, { priority: 40 });

      // Register handler with minBucket requirement (higher priority so it would run first if bucket allows)
      eventBus.on("cpu.spike", () => {
        executionOrder.push("requires-3000");
      }, { minBucket: 3000, priority: 100 });

      // Register another handler with lower minBucket (middle priority)
      eventBus.on("cpu.spike", () => {
        executionOrder.push("requires-1500");
      }, { minBucket: 1500, priority: 50 });

      // Set bucket at 2000
      Game.cpu.bucket = 2000;

      eventBus.emit("cpu.spike", {
        cpuUsed: 100,
        cpuLimit: 50,
        subsystem: "test"
      });

      // Verify only handlers with satisfied minBucket executed
      // Order: requires-1500 (priority 50, minBucket 1500) -> no-requirement (priority 40, minBucket 0)
      expect(executionOrder).to.deep.equal(["requires-1500", "no-requirement"]);
      expect(executionOrder).to.not.include("requires-3000");
    });

    it("should execute all handlers when bucket meets all minBucket requirements", () => {
      const executionOrder: string[] = [];

      eventBus.on("cpu.spike", () => {
        executionOrder.push("no-requirement");
      });

      eventBus.on("cpu.spike", () => {
        executionOrder.push("requires-3000");
      }, { minBucket: 3000 });

      eventBus.on("cpu.spike", () => {
        executionOrder.push("requires-1500");
      }, { minBucket: 1500 });

      // Set bucket high enough for all handlers
      Game.cpu.bucket = 5000;

      eventBus.emit("cpu.spike", {
        cpuUsed: 100,
        cpuLimit: 50,
        subsystem: "test"
      });

      // Verify all handlers executed
      expect(executionOrder).to.have.lengthOf(3);
      expect(executionOrder).to.include("no-requirement");
      expect(executionOrder).to.include("requires-3000");
      expect(executionOrder).to.include("requires-1500");
    });
  });

  describe("processQueue Behavior", () => {
    it("should skip queue processing when bucket < criticalBucketThreshold", () => {
      const processedEvents: string[] = [];

      eventBus.on("cpu.spike", () => {
        processedEvents.push("cpu.spike");
      });

      // Queue an event
      Game.cpu.bucket = 1500;
      eventBus.emit("cpu.spike", {
        cpuUsed: 100,
        cpuLimit: 50,
        subsystem: "test"
      });

      // Verify queued
      expect(eventBus.getStats().queueSize).to.equal(1);

      // Try to process with bucket below critical
      Game.cpu.bucket = 500;
      eventBus.processQueue();

      // Verify not processed
      expect(processedEvents).to.have.lengthOf(0);
      expect(eventBus.getStats().queueSize).to.equal(1);
    });

    it("should reduce max events processed when bucket < lowBucketThreshold", () => {
      const processedEvents: string[] = [];

      eventBus.on("cpu.spike", () => {
        processedEvents.push("cpu.spike");
      });

      // Queue multiple events
      Game.cpu.bucket = 1500;
      for (let i = 0; i < 60; i++) {
        eventBus.emit("cpu.spike", {
          cpuUsed: 100,
          cpuLimit: 50,
          subsystem: `test-${i}`
        });
      }

      // Verify all queued
      expect(eventBus.getStats().queueSize).to.equal(60);

      // Process with bucket between critical and low (should process maxEventsPerTick / 2 = 25)
      Game.cpu.bucket = 1500;
      eventBus.processQueue();

      // Verify reduced processing (25 instead of 50)
      expect(processedEvents).to.have.lengthOf(25);
      expect(eventBus.getStats().queueSize).to.equal(35);
    });

    it("should process full maxEventsPerTick when bucket >= lowBucketThreshold", () => {
      const processedEvents: string[] = [];

      eventBus.on("cpu.spike", () => {
        processedEvents.push("cpu.spike");
      });

      // Queue multiple events
      Game.cpu.bucket = 1500;
      for (let i = 0; i < 60; i++) {
        eventBus.emit("cpu.spike", {
          cpuUsed: 100,
          cpuLimit: 50,
          subsystem: `test-${i}`
        });
      }

      // Verify all queued
      expect(eventBus.getStats().queueSize).to.equal(60);

      // Process with high bucket (should process up to maxEventsPerTick = 50)
      Game.cpu.bucket = 5000;
      eventBus.processQueue();

      // Verify full processing (50 events)
      expect(processedEvents).to.have.lengthOf(50);
      expect(eventBus.getStats().queueSize).to.equal(10);
    });

    it("should drop old events that exceed maxEventAge", () => {
      const processedEvents: string[] = [];

      eventBus.on("cpu.spike", () => {
        processedEvents.push("cpu.spike");
      });

      // Queue events at different times
      Game.cpu.bucket = 1500;
      Game.time = 1000;
      eventBus.emit("cpu.spike", {
        cpuUsed: 1,
        cpuLimit: 50,
        subsystem: "old"
      });

      Game.time = 1050;
      eventBus.emit("cpu.spike", {
        cpuUsed: 2,
        cpuLimit: 50,
        subsystem: "medium"
      });

      Game.time = 1100;
      eventBus.emit("cpu.spike", {
        cpuUsed: 3,
        cpuLimit: 50,
        subsystem: "new"
      });

      // Verify all queued
      expect(eventBus.getStats().queueSize).to.equal(3);

      // Advance time beyond maxEventAge for first event
      Game.time = 1110; // First event age: 110 > maxEventAge (100)
      
      // Process queue
      Game.cpu.bucket = 5000;
      eventBus.processQueue();

      // Verify old event dropped (only 2 processed)
      expect(processedEvents).to.have.lengthOf(2);
      
      const stats = eventBus.getStats();
      expect(stats.eventsDropped).to.equal(1);
    });
  });

  describe("Integration - Priority and Bucket Together", () => {
    it("should process high-priority queued events first when bucket recovers", () => {
      const processedEvents: string[] = [];

      eventBus.on("cpu.spike", () => {
        processedEvents.push("background");
      });

      eventBus.on("creep.died", () => {
        processedEvents.push("high");
      });

      eventBus.on("spawn.completed", () => {
        processedEvents.push("normal");
      });

      eventBus.on("market.transaction", () => {
        processedEvents.push("low");
      });

      // Queue events with low bucket
      Game.cpu.bucket = 1500;
      
      eventBus.emit("cpu.spike", {
        cpuUsed: 100,
        cpuLimit: 50,
        subsystem: "test"
      }); // BACKGROUND (10)

      eventBus.emit("spawn.completed", {
        roomName: "W1N1",
        creepName: "worker1",
        role: "worker",
        cost: 300
      }); // NORMAL (50)

      eventBus.emit("creep.died", {
        creepName: "worker1",
        role: "worker",
        homeRoom: "W1N1",
        cause: "combat"
      }); // HIGH (75)

      eventBus.emit("market.transaction", {
        resourceType: "energy" as ResourceConstant,
        amount: 1000,
        price: 0.01,
        incoming: true,
        roomName: "W1N1"
      }); // LOW (25)

      // Verify all queued
      expect(eventBus.getStats().queueSize).to.equal(4);

      // Process with recovered bucket
      Game.cpu.bucket = 5000;
      eventBus.processQueue();

      // Verify processing order: HIGH (75) -> NORMAL (50) -> LOW (25) -> BACKGROUND (10)
      expect(processedEvents).to.deep.equal(["high", "normal", "low", "background"]);
    });
  });
});
