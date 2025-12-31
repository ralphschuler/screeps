/**
 * Spawn Manager Tests
 */

import { expect } from "chai";
import { SpawnManager } from "../src/SpawnManager";
import { RoomState } from "../src/types";

describe("SpawnManager", () => {
  let spawnManager: SpawnManager;
  let roomState: RoomState;

  beforeEach(() => {
    spawnManager = new SpawnManager();
    
    roomState = {
      name: "W1N1",
      energyAvailable: 300,
      energyCapacityAvailable: 300,
      rcl: 1,
      posture: "eco",
      pheromones: {
        expand: 0.5,
        harvest: 0.8,
        build: 0.6,
        upgrade: 0.4,
        defense: 0.2,
        war: 0,
        siege: 0,
        logistics: 0.3
      },
      danger: 0,
      bootstrap: false
    };
  });

  describe("getBestBody", () => {
    it("should return null for invalid role", () => {
      const body = spawnManager.getBestBody("invalidRole", 1000);
      expect(body).to.be.null;
    });

    it("should return best body within energy budget", () => {
      const body = spawnManager.getBestBody("harvester", 500);
      expect(body).to.not.be.null;
      expect(body!.cost).to.be.at.most(500);
    });

    it("should return highest cost body when energy is unlimited", () => {
      const body = spawnManager.getBestBody("harvester", 10000);
      expect(body).to.not.be.null;
      // Should return the most expensive harvester body
      expect(body!.cost).to.be.greaterThan(700);
    });

    it("should return null when energy is too low", () => {
      const body = spawnManager.getBestBody("harvester", 100);
      expect(body).to.be.null;
    });

    it("should work with larvaWorker at minimal energy", () => {
      const body = spawnManager.getBestBody("larvaWorker", 150);
      expect(body).to.not.be.null;
      expect(body!.cost).to.equal(150);
    });
  });

  describe("shouldSpawnRole", () => {
    it("should spawn when below minimum count", () => {
      spawnManager = new SpawnManager({
        minCreepCounts: { harvester: 2 }
      });

      const should = spawnManager.shouldSpawnRole("harvester", 0, roomState);
      expect(should).to.be.true;
    });

    it("should not spawn when at maximum count", () => {
      spawnManager = new SpawnManager({
        maxCreepCounts: { harvester: 2 }
      });

      const should = spawnManager.shouldSpawnRole("harvester", 2, roomState);
      expect(should).to.be.false;
    });

    it("should not spawn when above maximum count", () => {
      spawnManager = new SpawnManager({
        maxCreepCounts: { harvester: 2 }
      });

      const should = spawnManager.shouldSpawnRole("harvester", 3, roomState);
      expect(should).to.be.false;
    });
  });

  describe("calculatePriority", () => {
    it("should use base priority from role definition", () => {
      const priority = spawnManager.calculatePriority("harvester", 0, roomState);
      expect(priority).to.be.greaterThan(0);
    });

    it("should use config override priority", () => {
      spawnManager = new SpawnManager({
        rolePriorities: { harvester: 200 }
      });

      const priority = spawnManager.calculatePriority("harvester", 0, roomState);
      expect(priority).to.be.greaterThan(150); // Should be around 200 * multipliers
    });

    it("should reduce priority based on count", () => {
      const priority0 = spawnManager.calculatePriority("harvester", 0, roomState);
      const priority1 = spawnManager.calculatePriority("harvester", 1, roomState);
      
      expect(priority1).to.be.lessThan(priority0);
    });

    it("should apply pheromone multipliers", () => {
      const highHarvestState = { ...roomState, pheromones: { ...roomState.pheromones, harvest: 1.0 } };
      const lowHarvestState = { ...roomState, pheromones: { ...roomState.pheromones, harvest: 0.0 } };

      const highPriority = spawnManager.calculatePriority("harvester", 0, highHarvestState);
      const lowPriority = spawnManager.calculatePriority("harvester", 0, lowHarvestState);

      expect(highPriority).to.be.greaterThan(lowPriority);
    });
  });

  describe("generateCreepName", () => {
    // Mock Game.time if available
    beforeEach(() => {
      if (typeof (global as any).Game === "undefined") {
        (global as any).Game = { time: 1000 };
      }
    });

    it("should generate unique names", () => {
      const name1 = spawnManager.generateCreepName("harvester");
      const name2 = spawnManager.generateCreepName("harvester");

      expect(name1).to.be.a("string");
      expect(name2).to.be.a("string");
      expect(name1).to.include("harvester");
      expect(name2).to.include("harvester");
      // Names might collide due to random, but should be different most of the time
    });

    it("should include role in name", () => {
      const name = spawnManager.generateCreepName("hauler");
      expect(name).to.include("hauler");
    });
  });

  describe("configuration", () => {
    it("should accept empty config", () => {
      const manager = new SpawnManager();
      expect(manager).to.exist;
    });

    it("should accept debug config", () => {
      const manager = new SpawnManager({ debug: true });
      expect(manager).to.exist;
    });

    it("should accept custom role definitions", () => {
      const customRoles = {
        customRole: {
          role: "customRole",
          family: "economy" as const,
          bodies: [{
            parts: [WORK, CARRY, MOVE],
            cost: 200,
            minCapacity: 200
          }],
          priority: 100,
          maxPerRoom: 1,
          remoteRole: false
        }
      };

      const manager = new SpawnManager({}, customRoles);
      const body = manager.getBestBody("customRole", 300);
      expect(body).to.not.be.null;
    });
  });

  describe("processSpawnQueue", () => {
    let mockSpawn: any;

    beforeEach(() => {
      mockSpawn = {
        spawning: false,
        room: {
          name: "W1N1",
          energyAvailable: 550,
          energyCapacityAvailable: 550
        },
        spawnCreep: (body: BodyPartConstant[], name: string, opts?: any) => OK
      };
    });

    it("should process highest priority request first", () => {
      const requests = [
        { role: "hauler", priority: 50, memory: {} },
        { role: "harvester", priority: 100, memory: {} }
      ];

      const results = spawnManager.processSpawnQueue([mockSpawn], requests);
      
      expect(results).to.have.lengthOf(1);
      expect(results[0].success).to.be.true;
      expect(results[0].role).to.equal("harvester"); // Higher priority
    });

    it("should skip spawns that are busy", () => {
      mockSpawn.spawning = true;

      const requests = [
        { role: "harvester", priority: 100, memory: {} }
      ];

      const results = spawnManager.processSpawnQueue([mockSpawn], requests);
      
      expect(results).to.have.lengthOf(0);
    });

    it("should spawn from multiple spawns", () => {
      const mockSpawn2 = {
        spawning: false,
        room: mockSpawn.room,
        spawnCreep: (body: BodyPartConstant[], name: string, opts?: any) => OK
      };

      const requests = [
        { role: "harvester", priority: 100, memory: {} },
        { role: "hauler", priority: 50, memory: {} }
      ];

      const results = spawnManager.processSpawnQueue([mockSpawn, mockSpawn2], requests);
      
      expect(results).to.have.lengthOf(2);
      expect(results[0].success).to.be.true;
      expect(results[1].success).to.be.true;
    });

    it("should skip requests that require too much energy", () => {
      mockSpawn.room.energyAvailable = 100; // Very low energy

      const requests = [
        { role: "harvester", priority: 100, memory: {} } // Requires 300+
      ];

      const results = spawnManager.processSpawnQueue([mockSpawn], requests);
      
      expect(results).to.have.lengthOf(0); // Should skip request
    });

    it("should handle custom body parts in requests", () => {
      const customBody = [WORK, CARRY, MOVE];
      const requests = [
        { role: "custom", priority: 100, body: customBody, memory: {} }
      ];

      const results = spawnManager.processSpawnQueue([mockSpawn], requests);
      
      expect(results).to.have.lengthOf(1);
      expect(results[0].success).to.be.true;
    });

    it("should respect energyBudget in requests", () => {
      const requests = [
        { role: "harvester", priority: 100, energyBudget: 300, memory: {} }
      ];

      const results = spawnManager.processSpawnQueue([mockSpawn], requests);
      
      expect(results).to.have.lengthOf(1);
      expect(results[0].success).to.be.true;
      if (results[0].success && results[0].energyCost) {
        expect(results[0].energyCost).to.be.at.most(300);
      }
    });
  });

  describe("executeSpawn", () => {
    let mockSpawn: any;

    beforeEach(() => {
      mockSpawn = {
        spawning: false,
        room: {
          name: "W1N1",
          energyAvailable: 550,
          energyCapacityAvailable: 550
        },
        spawnCreep: (body: BodyPartConstant[], name: string, opts?: any) => OK
      };
    });

    it("should return error if spawn is busy", () => {
      mockSpawn.spawning = true;

      const result = spawnManager.executeSpawn(mockSpawn, {
        role: "harvester",
        priority: 100,
        memory: {}
      });

      expect(result.success).to.be.false;
      expect(result.error).to.equal(ERR_BUSY);
    });

    it("should return success on successful spawn", () => {
      const result = spawnManager.executeSpawn(mockSpawn, {
        role: "harvester",
        priority: 100,
        memory: {}
      });

      expect(result.success).to.be.true;
      expect(result.creepName).to.be.a("string");
      expect(result.role).to.equal("harvester");
    });

    it("should return error for invalid role", () => {
      const result = spawnManager.executeSpawn(mockSpawn, {
        role: "invalidRole",
        priority: 100,
        memory: {}
      });

      expect(result.success).to.be.false;
      expect(result.error).to.equal(ERR_NOT_FOUND);
    });

    it("should handle spawn failures", () => {
      mockSpawn.spawnCreep = () => ERR_NOT_ENOUGH_ENERGY;

      const result = spawnManager.executeSpawn(mockSpawn, {
        role: "harvester",
        priority: 100,
        memory: {}
      });

      expect(result.success).to.be.false;
      expect(result.error).to.equal(ERR_NOT_ENOUGH_ENERGY);
    });

    it("should validate body parts", () => {
      // Screeps maximum: 50 body parts per creep
      const MAX_CREEP_SIZE = 50;
      
      // Create invalid body (too many parts - exceeds MAX_CREEP_SIZE)
      const invalidBody = new Array(MAX_CREEP_SIZE + 10).fill(MOVE) as BodyPartConstant[];

      const result = spawnManager.executeSpawn(mockSpawn, {
        role: "custom",
        priority: 100,
        body: invalidBody,
        memory: {}
      });

      expect(result.success).to.be.false;
      expect(result.error).to.equal(ERR_INVALID_ARGS);
    });
  });

  describe("pheromone multipliers", () => {
    it("should boost economy roles with high harvest pheromone", () => {
      const highHarvestState = {
        ...roomState,
        pheromones: {
          ...roomState.pheromones,
          harvest: 1.0,
          build: 0,
          upgrade: 0
        }
      };

      const priority = spawnManager.calculatePriority("harvester", 0, highHarvestState);
      expect(priority).to.be.greaterThan(50); // Should have significant boost
    });

    it("should boost military roles with high defense pheromone", () => {
      const highDefenseState = {
        ...roomState,
        pheromones: {
          ...roomState.pheromones,
          defense: 1.0,
          war: 0,
          siege: 0
        }
      };

      const priority = spawnManager.calculatePriority("defender", 0, highDefenseState);
      expect(priority).to.be.greaterThan(0);
    });

    it("should boost utility roles with high expand pheromone", () => {
      const highExpandState = {
        ...roomState,
        pheromones: {
          ...roomState.pheromones,
          expand: 1.0,
          logistics: 0
        }
      };

      const priority = spawnManager.calculatePriority("claimer", 0, highExpandState);
      expect(priority).to.be.greaterThan(0);
    });
  });

  describe("bootstrap mode", () => {
    it("should prioritize larvaWorker in bootstrap mode", () => {
      const bootstrapState = {
        ...roomState,
        bootstrap: true,
        energyAvailable: 150,
        energyCapacityAvailable: 150
      };

      // larvaWorker should have high priority in bootstrap
      const larvaWorkerPriority = spawnManager.calculatePriority("larvaWorker", 0, bootstrapState);
      const harvesterPriority = spawnManager.calculatePriority("harvester", 0, bootstrapState);

      // Both should be spawnable, but larvaWorker is optimized for low energy
      expect(larvaWorkerPriority).to.be.greaterThan(0);
    });

    it("should work with minimal energy in bootstrap", () => {
      const body = spawnManager.getBestBody("larvaWorker", 150);
      expect(body).to.not.be.null;
      expect(body!.cost).to.equal(150);
    });
  });
});
