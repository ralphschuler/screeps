import { assert } from "chai";
import { spawnQueue, SpawnPriority, type SpawnRequest } from "../../src/spawning/spawnQueue";

describe("SpawnQueue", () => {
  beforeEach(() => {
    // Setup mock Game object
    (global as any).Game = {
      time: 1000,
      rooms: {},
      creeps: {},
      getObjectById: () => null
    };
  });

  afterEach(() => {
    // Clean up
    delete (global as any).Game;
  });

  describe("addRequest", () => {
    it("should add a request to the queue", () => {
      const request: SpawnRequest = {
        id: "test1",
        roomName: "W1N1",
        role: "harvester",
        family: "economy",
        body: {
          parts: [WORK, WORK, MOVE],
          cost: 250,
          minCapacity: 250
        },
        priority: SpawnPriority.NORMAL,
        createdAt: 1000
      };

      spawnQueue.addRequest(request);

      const pending = spawnQueue.getPendingRequests("W1N1");
      assert.equal(pending.length, 1);
      assert.equal(pending[0].id, "test1");
    });

    it("should sort requests by priority", () => {
      spawnQueue.clearQueue("W1N1");

      const lowPriority: SpawnRequest = {
        id: "low",
        roomName: "W1N1",
        role: "builder",
        family: "economy",
        body: { parts: [WORK, CARRY, MOVE], cost: 200, minCapacity: 200 },
        priority: SpawnPriority.LOW,
        createdAt: 1000
      };

      const highPriority: SpawnRequest = {
        id: "high",
        roomName: "W1N1",
        role: "guard",
        family: "military",
        body: { parts: [ATTACK, MOVE], cost: 130, minCapacity: 130 },
        priority: SpawnPriority.HIGH,
        createdAt: 1000
      };

      spawnQueue.addRequest(lowPriority);
      spawnQueue.addRequest(highPriority);

      const pending = spawnQueue.getPendingRequests("W1N1");
      assert.equal(pending.length, 2);
      assert.equal(pending[0].id, "high", "High priority should be first");
      assert.equal(pending[1].id, "low", "Low priority should be second");
    });

    it("should handle emergency priority", () => {
      spawnQueue.clearQueue("W1N1");

      const normalPriority: SpawnRequest = {
        id: "normal",
        roomName: "W1N1",
        role: "hauler",
        family: "economy",
        body: { parts: [CARRY, MOVE], cost: 100, minCapacity: 100 },
        priority: SpawnPriority.NORMAL,
        createdAt: 1000
      };

      const emergencyPriority: SpawnRequest = {
        id: "emergency",
        roomName: "W1N1",
        role: "larvaWorker",
        family: "economy",
        body: { parts: [WORK, CARRY], cost: 150, minCapacity: 150 },
        priority: SpawnPriority.EMERGENCY,
        createdAt: 1000
      };

      spawnQueue.addRequest(normalPriority);
      spawnQueue.addRequest(emergencyPriority);

      const pending = spawnQueue.getPendingRequests("W1N1");
      assert.equal(pending[0].id, "emergency", "Emergency should be first");
    });
  });

  describe("getNextRequest", () => {
    beforeEach(() => {
      spawnQueue.clearQueue("W1N1");
    });

    it("should return highest priority request that fits energy budget", () => {
      const cheap: SpawnRequest = {
        id: "cheap",
        roomName: "W1N1",
        role: "harvester",
        family: "economy",
        body: { parts: [WORK, CARRY], cost: 150, minCapacity: 150 },
        priority: SpawnPriority.LOW,
        createdAt: 1000
      };

      const expensive: SpawnRequest = {
        id: "expensive",
        roomName: "W1N1",
        role: "upgrader",
        family: "economy",
        body: { parts: [WORK, WORK, WORK, CARRY, MOVE], cost: 450, minCapacity: 450 },
        priority: SpawnPriority.HIGH,
        createdAt: 1000
      };

      spawnQueue.addRequest(cheap);
      spawnQueue.addRequest(expensive);

      // With only 200 energy, should get cheap request even though expensive has higher priority
      const next = spawnQueue.getNextRequest("W1N1", 200);
      assert.equal(next?.id, "cheap");
    });

    it("should return null when no affordable requests exist", () => {
      const expensive: SpawnRequest = {
        id: "expensive",
        roomName: "W1N1",
        role: "upgrader",
        family: "economy",
        body: { parts: [WORK, WORK, WORK, CARRY, MOVE], cost: 450, minCapacity: 450 },
        priority: SpawnPriority.HIGH,
        createdAt: 1000
      };

      spawnQueue.addRequest(expensive);

      const next = spawnQueue.getNextRequest("W1N1", 100);
      assert.isNull(next);
    });

    it("should return highest priority affordable request", () => {
      const low: SpawnRequest = {
        id: "low",
        roomName: "W1N1",
        role: "builder",
        family: "economy",
        body: { parts: [WORK, CARRY, MOVE], cost: 200, minCapacity: 200 },
        priority: SpawnPriority.LOW,
        createdAt: 1000
      };

      const high: SpawnRequest = {
        id: "high",
        roomName: "W1N1",
        role: "guard",
        family: "military",
        body: { parts: [ATTACK, MOVE], cost: 130, minCapacity: 130 },
        priority: SpawnPriority.HIGH,
        createdAt: 1000
      };

      spawnQueue.addRequest(low);
      spawnQueue.addRequest(high);

      const next = spawnQueue.getNextRequest("W1N1", 300);
      assert.equal(next?.id, "high", "Should return high priority request when affordable");
    });
  });

  describe("getQueueStats", () => {
    beforeEach(() => {
      spawnQueue.clearQueue("W1N1");
    });

    it("should count requests by priority level", () => {
      spawnQueue.addRequest({
        id: "e1",
        roomName: "W1N1",
        role: "larvaWorker",
        family: "economy",
        body: { parts: [WORK], cost: 100, minCapacity: 100 },
        priority: SpawnPriority.EMERGENCY,
        createdAt: 1000
      });

      spawnQueue.addRequest({
        id: "h1",
        roomName: "W1N1",
        role: "guard",
        family: "military",
        body: { parts: [ATTACK, MOVE], cost: 130, minCapacity: 130 },
        priority: SpawnPriority.HIGH,
        createdAt: 1000
      });

      spawnQueue.addRequest({
        id: "n1",
        roomName: "W1N1",
        role: "hauler",
        family: "economy",
        body: { parts: [CARRY, MOVE], cost: 100, minCapacity: 100 },
        priority: SpawnPriority.NORMAL,
        createdAt: 1000
      });

      spawnQueue.addRequest({
        id: "l1",
        roomName: "W1N1",
        role: "scout",
        family: "utility",
        body: { parts: [MOVE], cost: 50, minCapacity: 50 },
        priority: SpawnPriority.LOW,
        createdAt: 1000
      });

      const stats = spawnQueue.getQueueStats("W1N1");
      assert.equal(stats.total, 4);
      assert.equal(stats.emergency, 1);
      assert.equal(stats.high, 1);
      assert.equal(stats.normal, 1);
      assert.equal(stats.low, 1);
    });
  });

  describe("removeRequest", () => {
    beforeEach(() => {
      spawnQueue.clearQueue("W1N1");
    });

    it("should remove a request from queue", () => {
      spawnQueue.addRequest({
        id: "test1",
        roomName: "W1N1",
        role: "harvester",
        family: "economy",
        body: { parts: [WORK, MOVE], cost: 150, minCapacity: 150 },
        priority: SpawnPriority.NORMAL,
        createdAt: 1000
      });

      assert.equal(spawnQueue.getQueueSize("W1N1"), 1);

      spawnQueue.removeRequest("W1N1", "test1");

      assert.equal(spawnQueue.getQueueSize("W1N1"), 0);
    });
  });

  describe("hasEmergencySpawns", () => {
    beforeEach(() => {
      spawnQueue.clearQueue("W1N1");
    });

    it("should return true when emergency spawns exist", () => {
      spawnQueue.addRequest({
        id: "emergency",
        roomName: "W1N1",
        role: "larvaWorker",
        family: "economy",
        body: { parts: [WORK, CARRY], cost: 150, minCapacity: 150 },
        priority: SpawnPriority.EMERGENCY,
        createdAt: 1000
      });

      assert.isTrue(spawnQueue.hasEmergencySpawns("W1N1"));
    });

    it("should return false when no emergency spawns exist", () => {
      spawnQueue.addRequest({
        id: "normal",
        roomName: "W1N1",
        role: "hauler",
        family: "economy",
        body: { parts: [CARRY, MOVE], cost: 100, minCapacity: 100 },
        priority: SpawnPriority.NORMAL,
        createdAt: 1000
      });

      assert.isFalse(spawnQueue.hasEmergencySpawns("W1N1"));
    });
  });
});
