import { expect } from "chai";
import { EventBus, EventPriority } from "../../src/core/events";
import { Game, Memory } from "./mock";

describe("EventBus", () => {
  let eventBus: EventBus;

  beforeEach(() => {
    // Reset global mocks
    // @ts-ignore: allow adding Game to global
    global.Game = {
      ...Game,
      time: 12345,
      cpu: {
        ...Game.cpu,
        bucket: 10000
      }
    };
    // @ts-ignore: allow adding Memory to global
    global.Memory = { ...Memory };

    // Create fresh event bus for each test
    eventBus = new EventBus({
      enableLogging: false,
      maxEventsPerTick: 50,
      maxQueueSize: 200,
      lowBucketThreshold: 2000,
      criticalBucketThreshold: 1000,
      maxEventAge: 100
    });
  });

  describe("on()", () => {
    it("should register a handler for an event", () => {
      const handler = () => {};
      eventBus.on("hostile.detected", handler);

      expect(eventBus.hasHandlers("hostile.detected")).to.be.true;
      expect(eventBus.getHandlerCount("hostile.detected")).to.equal(1);
    });

    it("should return an unsubscribe function", () => {
      const handler = () => {};
      const unsubscribe = eventBus.on("hostile.detected", handler);

      expect(eventBus.getHandlerCount("hostile.detected")).to.equal(1);

      unsubscribe();

      expect(eventBus.getHandlerCount("hostile.detected")).to.equal(0);
    });

    it("should allow multiple handlers for the same event", () => {
      eventBus.on("hostile.detected", () => {});
      eventBus.on("hostile.detected", () => {});
      eventBus.on("hostile.detected", () => {});

      expect(eventBus.getHandlerCount("hostile.detected")).to.equal(3);
    });
  });

  describe("emit()", () => {
    it("should call handler when event is emitted", () => {
      let called = false;
      let receivedPayload: any = null;

      eventBus.on("hostile.detected", (event) => {
        called = true;
        receivedPayload = event;
      });

      eventBus.emit("hostile.detected", {
        roomName: "W1N1",
        hostileId: "123abc" as Id<Creep>,
        hostileOwner: "Invader",
        bodyParts: 5,
        threatLevel: 2
      });

      expect(called).to.be.true;
      expect(receivedPayload.roomName).to.equal("W1N1");
      expect(receivedPayload.hostileOwner).to.equal("Invader");
      expect(receivedPayload.tick).to.equal(12345);
    });

    it("should call multiple handlers in priority order", () => {
      const callOrder: number[] = [];

      eventBus.on("hostile.detected", () => callOrder.push(1), { priority: EventPriority.LOW });
      eventBus.on("hostile.detected", () => callOrder.push(2), { priority: EventPriority.CRITICAL });
      eventBus.on("hostile.detected", () => callOrder.push(3), { priority: EventPriority.NORMAL });

      eventBus.emit("hostile.detected", {
        roomName: "W1N1",
        hostileId: "123abc" as Id<Creep>,
        hostileOwner: "Invader",
        bodyParts: 5,
        threatLevel: 2
      });

      // Higher priority handlers should be called first
      expect(callOrder).to.deep.equal([2, 3, 1]);
    });

    it("should add tick to payload automatically", () => {
      let receivedTick: number | undefined;

      eventBus.on("spawn.completed", (event) => {
        receivedTick = event.tick;
      });

      eventBus.emit("spawn.completed", {
        roomName: "W1N1",
        creepName: "Harvester1",
        role: "harvester",
        cost: 300
      });

      expect(receivedTick).to.equal(12345);
    });
  });

  describe("once()", () => {
    it("should call handler only once", () => {
      let callCount = 0;

      eventBus.once("hostile.detected", () => {
        callCount++;
      });

      eventBus.emit("hostile.detected", {
        roomName: "W1N1",
        hostileId: "123abc" as Id<Creep>,
        hostileOwner: "Invader",
        bodyParts: 5,
        threatLevel: 2
      });

      eventBus.emit("hostile.detected", {
        roomName: "W1N1",
        hostileId: "456def" as Id<Creep>,
        hostileOwner: "Invader",
        bodyParts: 5,
        threatLevel: 2
      });

      expect(callCount).to.equal(1);
    });
  });

  describe("offAll()", () => {
    it("should remove all handlers for an event", () => {
      eventBus.on("hostile.detected", () => {});
      eventBus.on("hostile.detected", () => {});
      eventBus.on("hostile.detected", () => {});

      expect(eventBus.getHandlerCount("hostile.detected")).to.equal(3);

      eventBus.offAll("hostile.detected");

      expect(eventBus.getHandlerCount("hostile.detected")).to.equal(0);
    });
  });

  describe("bucket awareness", () => {
    it("should process events immediately with high bucket", () => {
      let called = false;

      // @ts-ignore
      global.Game.cpu.bucket = 10000;

      eventBus.on("hostile.detected", () => {
        called = true;
      });

      eventBus.emit("hostile.detected", {
        roomName: "W1N1",
        hostileId: "123abc" as Id<Creep>,
        hostileOwner: "Invader",
        bodyParts: 5,
        threatLevel: 2
      });

      expect(called).to.be.true;
    });

    it("should queue non-critical events in low bucket", () => {
      let called = false;

      // @ts-ignore
      global.Game.cpu.bucket = 1500; // Low bucket

      eventBus.on("pheromone.update", () => {
        called = true;
      });

      // Emit a low-priority event
      eventBus.emit("pheromone.update", {
        roomName: "W1N1",
        pheromoneType: "harvest",
        oldValue: 50,
        newValue: 60
      });

      // Should not be called immediately
      expect(called).to.be.false;

      // Increase bucket and process queue
      // @ts-ignore
      global.Game.cpu.bucket = 10000;
      eventBus.processQueue();

      expect(called).to.be.true;
    });

    it("should always process critical events immediately", () => {
      let called = false;

      // @ts-ignore
      global.Game.cpu.bucket = 500; // Very low bucket (below critical threshold)

      eventBus.on("hostile.detected", () => {
        called = true;
      });

      // Critical events should still be processed
      eventBus.emit("hostile.detected", {
        roomName: "W1N1",
        hostileId: "123abc" as Id<Creep>,
        hostileOwner: "Invader",
        bodyParts: 5,
        threatLevel: 2
      }, { immediate: true });

      expect(called).to.be.true;
    });
  });

  describe("getStats()", () => {
    it("should track event statistics", () => {
      eventBus.on("hostile.detected", () => {});
      eventBus.on("spawn.completed", () => {});

      eventBus.emit("hostile.detected", {
        roomName: "W1N1",
        hostileId: "123abc" as Id<Creep>,
        hostileOwner: "Invader",
        bodyParts: 5,
        threatLevel: 2
      });

      const stats = eventBus.getStats();

      expect(stats.eventsEmitted).to.equal(1);
      expect(stats.eventsProcessed).to.equal(1);
      expect(stats.handlersInvoked).to.equal(1);
      expect(stats.handlerCount).to.equal(2);
    });
  });

  describe("clear()", () => {
    it("should clear all handlers and reset stats", () => {
      eventBus.on("hostile.detected", () => {});
      eventBus.on("spawn.completed", () => {});

      eventBus.emit("hostile.detected", {
        roomName: "W1N1",
        hostileId: "123abc" as Id<Creep>,
        hostileOwner: "Invader",
        bodyParts: 5,
        threatLevel: 2
      });

      eventBus.clear();

      const stats = eventBus.getStats();

      expect(stats.eventsEmitted).to.equal(0);
      expect(stats.handlerCount).to.equal(0);
    });
  });

  describe("error handling", () => {
    it("should continue calling handlers after one throws", () => {
      const callOrder: number[] = [];

      eventBus.on("hostile.detected", () => {
        callOrder.push(1);
      }, { priority: EventPriority.CRITICAL });

      eventBus.on("hostile.detected", () => {
        throw new Error("Test error");
      }, { priority: EventPriority.HIGH });

      eventBus.on("hostile.detected", () => {
        callOrder.push(3);
      }, { priority: EventPriority.NORMAL });

      // Should not throw
      eventBus.emit("hostile.detected", {
        roomName: "W1N1",
        hostileId: "123abc" as Id<Creep>,
        hostileOwner: "Invader",
        bodyParts: 5,
        threatLevel: 2
      });

      // All non-throwing handlers should be called
      expect(callOrder).to.deep.equal([1, 3]);
    });
  });
});
