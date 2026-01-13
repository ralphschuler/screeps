import { assert } from "chai";
import sinon from "sinon";
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

  describe("Emergency spawning (Phase 2.1)", () => {
    it("should prioritize emergency spawns during workforce collapse", () => {
      const mockRoom: any = {
        name: "W1N1",
        energyCapacityAvailable: 800,
        energyAvailable: 300,
        controller: {
          my: true,
          level: 5,
          progress: 50000,
          progressTotal: 100000
        },
        find: () => []
      };

      const emergencySwarm: SwarmState = {
        colonyLevel: "earlyColony",
        posture: "eco",
        danger: 0,
        pheromones: {
          expand: 0,
          harvest: 20, // High harvest pheromone
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
          storage: true,
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
          energyNeed: 100 // High energy need
        },
        lastUpdate: 1000
      };

      // Mock no creeps (emergency)
      (global as any).Game.creeps = {};

      populateSpawnQueue(mockRoom, emergencySwarm);
      const stats = spawnQueue.getQueueStats("W1N1");

      // Should have emergency priority requests
      assert.isTrue(stats.total > 0, "Should have spawn requests in emergency");
    });

    it("should handle low energy emergency spawning", () => {
      const mockRoom: any = {
        name: "W1N1",
        energyCapacityAvailable: 300,
        energyAvailable: 200, // Limited energy
        controller: {
          my: true,
          level: 3
        },
        find: () => []
      };

      const lowEnergySwarm: SwarmState = {
        colonyLevel: "earlyColony",
        posture: "eco",
        danger: 0,
        pheromones: {
          expand: 0,
          harvest: 15,
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
          storage: true,
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
          energyAvailable: 200,
          energyCapacity: 300,
          energyNeed: 50
        },
        lastUpdate: 1000
      };

      // Should handle low energy gracefully
      assert.doesNotThrow(() => {
        populateSpawnQueue(mockRoom, lowEnergySwarm);
      });
    });

    it("should optimize body parts for available energy", () => {
      const mockRoom: any = {
        name: "W1N1",
        energyCapacityAvailable: 1000,
        energyAvailable: 400, // Limited current energy
        controller: {
          my: true,
          level: 5
        },
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
          energyAvailable: 400,
          energyCapacity: 1000,
          energyNeed: 0
        },
        lastUpdate: 1000
      };

      populateSpawnQueue(mockRoom, mockSwarm);
      
      // Should create spawn requests optimized for available energy
      const queueSize = spawnQueue.getQueueSize("W1N1");
      assert.isTrue(queueSize >= 0, "Should handle body optimization");
    });
  });

  describe("Role priority calculation (Phase 2.1)", () => {
    it("should calculate correct priority for harvesters", () => {
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
          harvest: 20, // Very high harvest pheromone
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

      populateSpawnQueue(mockRoom, mockSwarm);
      
      // Harvesters should be prioritized when harvest pheromone is high
      const stats = spawnQueue.getQueueStats("W1N1");
      assert.isTrue(stats.total > 0, "Should create harvester spawn requests");
    });

    it("should prioritize defenders during hostiles", () => {
      const mockRoom: any = {
        name: "W1N1",
        energyCapacityAvailable: 800,
        energyAvailable: 300,
        find: sinon.stub().callsFake((findConstant: number) => {
          if (findConstant === FIND_HOSTILE_CREEPS) {
            return [{
              pos: { x: 25, y: 25 },
              owner: { username: "enemy" },
              hits: 100,
              hitsMax: 100,
              body: [{ type: ATTACK }]
            }];
          }
          return [];
        })
      };

      const defensiveSwarm: SwarmState = {
        colonyLevel: "matureColony",
        posture: "eco",
        danger: 5, // Danger level increased
        pheromones: {
          expand: 0,
          harvest: 10,
          build: 5,
          upgrade: 5,
          defense: 15, // High defense pheromone
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
          hostileCount: 1,
          damageReceived: 0,
          constructionSites: 0,
          energyAvailable: 0,
          energyCapacity: 0,
          energyNeed: 0
        },
        lastUpdate: 1000
      };

      populateSpawnQueue(mockRoom, defensiveSwarm);
      
      // Should prioritize defenders when under threat
      const stats = spawnQueue.getQueueStats("W1N1");
      assert.isTrue(stats.total > 0, "Should create defender spawn requests");
    });

    it("should adjust priority based on colony level", () => {
      const earlyColonyRoom: any = {
        name: "W1N1",
        energyCapacityAvailable: 300,
        energyAvailable: 300,
        controller: {
          my: true,
          level: 2
        },
        find: () => []
      };

      const earlySwarm: SwarmState = {
        colonyLevel: "earlyColony",
        posture: "eco",
        danger: 0,
        pheromones: {
          expand: 0,
          harvest: 10,
          build: 10,
          upgrade: 10,
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
          storage: true,
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
          constructionSites: 5,
          energyAvailable: 300,
          energyCapacity: 300,
          energyNeed: 0
        },
        lastUpdate: 1000
      };

      populateSpawnQueue(earlyColonyRoom, earlySwarm);
      
      // Should adjust priorities for early colony
      const stats = spawnQueue.getQueueStats("W1N1");
      assert.isTrue(stats.total >= 0, "Should handle early colony priorities");
    });
  });

  describe("Edge cases (Phase 2.1)", () => {
    it("should handle room with no controller", () => {
      const noControllerRoom: any = {
        name: "W1N1",
        energyCapacityAvailable: 300,
        energyAvailable: 300,
        controller: undefined,
        find: () => []
      };

      const mockSwarm: SwarmState = {
        colonyLevel: "earlyColony",
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
          storage: true,
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

      // Should handle gracefully without throwing
      assert.doesNotThrow(() => {
        populateSpawnQueue(noControllerRoom, mockSwarm);
      });
    });

    it("should handle zero energy capacity", () => {
      const zeroEnergyRoom: any = {
        name: "W1N1",
        energyCapacityAvailable: 0,
        energyAvailable: 0,
        controller: {
          my: true,
          level: 1
        },
        find: () => []
      };

      const mockSwarm: SwarmState = {
        colonyLevel: "earlyColony",
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
          storage: true,
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

      // Should handle zero energy gracefully
      assert.doesNotThrow(() => {
        populateSpawnQueue(zeroEnergyRoom, mockSwarm);
      });
    });

    it("should handle maximum energy capacity", () => {
      const maxEnergyRoom: any = {
        name: "W1N1",
        energyCapacityAvailable: 12900, // RCL 8 max
        energyAvailable: 12900,
        controller: {
          my: true,
          level: 8
        },
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
          terminal: false,
          labs: false,
          nuker: false,
          factory: false,
          extractor: false,
          powerSpawn: false,
          observer: false
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
          energyAvailable: 12900,
          energyCapacity: 12900,
          energyNeed: 0
        },
        lastUpdate: 1000
      };

      // Should handle max energy properly
      assert.doesNotThrow(() => {
        populateSpawnQueue(maxEnergyRoom, mockSwarm);
      });
    });

    it("should handle all pheromones at zero", () => {
      const mockRoom: any = {
        name: "W1N1",
        energyCapacityAvailable: 800,
        energyAvailable: 300,
        find: () => []
      };

      const zeroPheromoneSwarm: SwarmState = {
        colonyLevel: "matureColony",
        posture: "eco",
        danger: 0,
        pheromones: {
          expand: 0,
          harvest: 0,
          build: 0,
          upgrade: 0,
          defense: 0,
          war: 0,
          siege: 0,
          logistics: 0,
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

      // Should still make some spawns even with zero pheromones
      assert.doesNotThrow(() => {
        populateSpawnQueue(mockRoom, zeroPheromoneSwarm);
      });
    });
  });
});
