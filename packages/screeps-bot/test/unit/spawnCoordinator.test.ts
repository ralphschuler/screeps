import { assert } from "chai";
import { spawnQueue, SpawnPriority } from "../../src/spawning/spawnQueue";
import { populateSpawnQueue, processSpawnQueue } from "../../src/spawning/spawnCoordinator";
import type { SwarmState } from "../../src/memory/schemas";

describe("SpawnCoordinator", () => {
  beforeEach(() => {
    // Setup mock Game object
    (global as any).Game = {
      time: 1000,
      rooms: {},
      creeps: {},
      getObjectById: () => null
    };

    // Clear spawn queue
    spawnQueue.clearQueue("W1N1");
  });

  afterEach(() => {
    delete (global as any).Game;
  });

  describe("populateSpawnQueue", () => {
    it("should add spawn requests to queue", () => {
      const mockRoom: any = {
        name: "W1N1",
        energyCapacityAvailable: 800,
        energyAvailable: 300,
        find: () => []
      };

      const mockSwarm: SwarmState = {
        colonyLevel: "matureColony",
        posture: "eco",
        danger: 0,
        pheromones: {
          expand: 0,
          harvest: 10,
          build: 5,
          upgrade: 5,
          defense: 0,
          war: 0,
          siege: 0,
          logistics: 5,
          nukeTarget: 0
        },
        nextUpdateTick: 0,
        eventLog: [],
        missingStructures: {
          spawn: false,
          storage: false,
          terminal: true,
          labs: true,
          nuker: true,
          factory: true,
          extractor: true,
          powerSpawn: true,
          observer: true
        },
        role: "capital",
        remoteAssignments: [],
        metrics: {
          energyHarvested: 0,
          energySpawning: 0,
          energyConstruction: 0,
          energyRepair: 0,
          energyTower: 0,
          controllerProgress: 0,
          hostileCount: 0,
          damageReceived: 0,
          constructionSites: 0,
          energyAvailable: 0,
          energyCapacity: 0,
          energyNeed: 0
        },
        lastUpdate: 1000
      };

      // Initially queue should be empty
      assert.equal(spawnQueue.getQueueSize("W1N1"), 0);

      // Populate queue
      populateSpawnQueue(mockRoom, mockSwarm);

      // Queue should now have requests
      const queueSize = spawnQueue.getQueueSize("W1N1");
      assert.isTrue(queueSize > 0, "Queue should have requests after population");

      const stats = spawnQueue.getQueueStats("W1N1");
      assert.isTrue(stats.total > 0);
    });

    it("should not duplicate requests if queue already populated", () => {
      const mockRoom: any = {
        name: "W1N1",
        energyCapacityAvailable: 800,
        energyAvailable: 300,
        find: () => []
      };

      const mockSwarm: SwarmState = {
        colonyLevel: "matureColony",
        posture: "eco",
        danger: 0,
        pheromones: {
          expand: 0,
          harvest: 10,
          build: 5,
          upgrade: 5,
          defense: 0,
          war: 0,
          siege: 0,
          logistics: 5,
          nukeTarget: 0
        },
        nextUpdateTick: 0,
        eventLog: [],
        missingStructures: {
          spawn: false,
          storage: false,
          terminal: true,
          labs: true,
          nuker: true,
          factory: true,
          extractor: true,
          powerSpawn: true,
          observer: true
        },
        role: "capital",
        remoteAssignments: [],
        metrics: {
          energyHarvested: 0,
          energySpawning: 0,
          energyConstruction: 0,
          energyRepair: 0,
          energyTower: 0,
          controllerProgress: 0,
          hostileCount: 0,
          damageReceived: 0,
          constructionSites: 0,
          energyAvailable: 0,
          energyCapacity: 0,
          energyNeed: 0
        },
        lastUpdate: 1000
      };

      // Populate once
      populateSpawnQueue(mockRoom, mockSwarm);
      const firstSize = spawnQueue.getQueueSize("W1N1");

      // Populate again
      populateSpawnQueue(mockRoom, mockSwarm);
      const secondSize = spawnQueue.getQueueSize("W1N1");

      // Size should not change (no duplicates)
      assert.equal(firstSize, secondSize, "Queue size should not change on second population");
    });
  });

  describe("processSpawnQueue", () => {
    it("should return 0 when no spawns available", () => {
      const mockRoom: any = {
        name: "W1N1",
        energyAvailable: 300,
        find: () => [] // No spawns
      };

      const spawned = processSpawnQueue(mockRoom);
      assert.equal(spawned, 0);
    });

    it("should return 0 when queue is empty", () => {
      const mockRoom: any = {
        name: "W1N1",
        energyAvailable: 300,
        find: () => [{ spawning: false }] // One available spawn
      };

      // Clear queue to ensure it's empty
      spawnQueue.clearQueue("W1N1");

      const spawned = processSpawnQueue(mockRoom);
      assert.equal(spawned, 0);
    });
  });
});
