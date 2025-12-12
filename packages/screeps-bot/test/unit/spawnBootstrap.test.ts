import { assert } from "chai";
import {
  getEnergyProducerCount,
  getTransportCount,
  isBootstrapMode,
  getBootstrapRole,
  determineNextRole,
  countCreepsByRole
} from "../../src/logic/spawn";
import type { SwarmState } from "../../src/memory/schemas";
import { memoryManager } from "../../src/memory/manager";

// Mock the global Game object
declare const global: { Game: typeof Game };

/**
 * Create a mock SwarmState for testing
 */
function createMockSwarmState(): SwarmState {
  return {
    colonyLevel: "foragingExpansion",
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
    lastUpdate: 0
  };
}

/**
 * Create a mock Room object
 */
function createMockRoom(name: string, hasStorage = false, sourceCount = 2): Room {
  const mockSources = Array(sourceCount).fill(null).map((_, i) => ({
    id: `source_${i}` as Id<Source>,
    pos: { x: 25 + i, y: 25, roomName: name }
  }));
  
  return {
    name,
    storage: hasStorage ? { store: { [RESOURCE_ENERGY]: 10000 } } : undefined,
    controller: { level: 4, my: true },
    find: (type: FindConstant) => {
      if (type === FIND_SOURCES) {
        return mockSources;
      }
      return [];
    },
    lookAt: () => []
  } as unknown as Room;
}

/**
 * Create mock creeps with specific roles
 */
function createMockCreeps(config: Record<string, number>, homeRoom = "E1N1"): void {
  global.Game.creeps = {};
  let id = 0;
  for (const [role, count] of Object.entries(config)) {
    for (let i = 0; i < count; i++) {
      const name = `${role}_${id++}`;
      global.Game.creeps[name] = {
        name,
        memory: {
          role,
          homeRoom,
          family: "economy",
          version: 1
        }
      } as unknown as Creep;
    }
  }
}

describe("spawn bootstrap system", () => {
  beforeEach(() => {
    // Reset the global Game object before each test
    global.Game = {
      creeps: {},
      rooms: {
        E1N1: createMockRoom("E1N1")
      },
      time: 1000,
      gcl: {
        level: 1,
        progress: 0,
        progressTotal: 1000000
      }
    } as unknown as typeof Game;

    // Mock memoryManager.getOvermind() for claimer tests
    (memoryManager as any).getOvermind = () => ({
      claimQueue: []
    });
  });

  describe("getEnergyProducerCount", () => {
    it("should return 0 when no creeps exist", () => {
      const counts = countCreepsByRole("E1N1");
      const result = getEnergyProducerCount(counts);
      assert.equal(result, 0);
    });

    it("should count harvesters", () => {
      createMockCreeps({ harvester: 2 });
      const counts = countCreepsByRole("E1N1");
      const result = getEnergyProducerCount(counts);
      assert.equal(result, 2);
    });

    it("should count larvaWorkers", () => {
      createMockCreeps({ larvaWorker: 3 });
      const counts = countCreepsByRole("E1N1");
      const result = getEnergyProducerCount(counts);
      assert.equal(result, 3);
    });

    it("should count both harvesters and larvaWorkers", () => {
      createMockCreeps({ harvester: 1, larvaWorker: 2 });
      const counts = countCreepsByRole("E1N1");
      const result = getEnergyProducerCount(counts);
      assert.equal(result, 3);
    });
  });

  describe("getTransportCount", () => {
    it("should return 0 when no transport creeps exist", () => {
      createMockCreeps({ harvester: 2 });
      const counts = countCreepsByRole("E1N1");
      const result = getTransportCount(counts);
      assert.equal(result, 0);
    });

    it("should count haulers", () => {
      createMockCreeps({ hauler: 2 });
      const counts = countCreepsByRole("E1N1");
      const result = getTransportCount(counts);
      assert.equal(result, 2);
    });

    it("should count larvaWorkers as transport", () => {
      createMockCreeps({ larvaWorker: 3 });
      const counts = countCreepsByRole("E1N1");
      const result = getTransportCount(counts);
      assert.equal(result, 3);
    });
  });

  describe("isBootstrapMode", () => {
    it("should return true when no creeps exist", () => {
      global.Game.creeps = {};
      const room = createMockRoom("E1N1");
      const result = isBootstrapMode("E1N1", room);
      assert.isTrue(result);
    });

    it("should return true when only harvesters exist (no transport)", () => {
      createMockCreeps({ harvester: 2 });
      const room = createMockRoom("E1N1");
      const result = isBootstrapMode("E1N1", room);
      assert.isTrue(result);
    });

    it("should return false when minimum critical roles exist", () => {
      createMockCreeps({
        larvaWorker: 1,
        harvester: 2,
        hauler: 1,
        upgrader: 1
      });
      const room = createMockRoom("E1N1", false, 2); // 2 sources
      global.Game.rooms["E1N1"] = room;
      const result = isBootstrapMode("E1N1", room);
      assert.isFalse(result);
    });

    it("should return true when storage exists but no queenCarrier", () => {
      createMockCreeps({
        harvester: 2,
        hauler: 1
      });
      const room = createMockRoom("E1N1", true, 2); // Has storage, 2 sources
      global.Game.rooms["E1N1"] = room;
      const result = isBootstrapMode("E1N1", room);
      assert.isTrue(result);
    });

    it("should handle storage case requiring queenCarrier", () => {
      createMockCreeps({
        harvester: 2,
        hauler: 1,
        larvaWorker: 1,
        upgrader: 1
      });
      const room = createMockRoom("E1N1", true, 2); // Has storage, 2 sources
      global.Game.rooms["E1N1"] = room;
      const result = isBootstrapMode("E1N1", room);
      // queenCarrier is in bootstrap order with condition for storage,
      // so bootstrap mode is still active until queenCarrier is spawned
      assert.isTrue(result);
    });
  });

  describe("getBootstrapRole", () => {
    it("should return larvaWorker when no creeps exist", () => {
      global.Game.creeps = {};
      const room = createMockRoom("E1N1");
      const swarm = createMockSwarmState();
      const result = getBootstrapRole("E1N1", room, swarm);
      assert.equal(result, "larvaWorker");
    });

    it("should return harvester after first larvaWorker is spawned", () => {
      createMockCreeps({ larvaWorker: 1 });
      const room = createMockRoom("E1N1");
      const swarm = createMockSwarmState();
      const result = getBootstrapRole("E1N1", room, swarm);
      assert.equal(result, "harvester");
    });

    it("should return hauler after first harvester is spawned", () => {
      createMockCreeps({ larvaWorker: 1, harvester: 1 });
      const room = createMockRoom("E1N1");
      const swarm = createMockSwarmState();
      const result = getBootstrapRole("E1N1", room, swarm);
      assert.equal(result, "hauler");
    });

    it("should return second harvester after first hauler when room has 2 sources", () => {
      createMockCreeps({ larvaWorker: 1, harvester: 1, hauler: 1 });
      const room = createMockRoom("E1N1", false, 2); // 2 sources
      global.Game.rooms["E1N1"] = room;
      const swarm = createMockSwarmState();
      const result = getBootstrapRole("E1N1", room, swarm);
      assert.equal(result, "harvester");
    });

    it("should follow bootstrap order correctly", () => {
      createMockCreeps({
        larvaWorker: 1,
        harvester: 2,
        hauler: 1
      });
      const room = createMockRoom("E1N1", false, 2); // 2 sources
      global.Game.rooms["E1N1"] = room;
      const swarm = createMockSwarmState();
      const result = getBootstrapRole("E1N1", room, swarm);
      // Next in order after harvesters (2) and haulers (1) is queenCarrier (if storage)
      // or upgrader if no storage
      assert.equal(result, "upgrader");
    });

    it("should request queenCarrier when storage exists", () => {
      createMockCreeps({
        larvaWorker: 1,
        harvester: 2,
        hauler: 1
      });
      const room = createMockRoom("E1N1", true, 2); // Has storage, 2 sources
      // Update global Game.rooms to use room with storage
      global.Game.rooms["E1N1"] = room;
      const swarm = createMockSwarmState();
      const result = getBootstrapRole("E1N1", room, swarm);
      assert.equal(result, "queenCarrier");
    });

    it("should return null when all bootstrap roles are satisfied", () => {
      createMockCreeps({
        larvaWorker: 1,
        harvester: 2,
        hauler: 1,
        upgrader: 1
      });
      const room = createMockRoom("E1N1", false, 2); // 2 sources
      global.Game.rooms["E1N1"] = room;
      const swarm = createMockSwarmState();
      const result = getBootstrapRole("E1N1", room, swarm);
      assert.isNull(result);
    });
  });

  describe("determineNextRole with bootstrap", () => {
    it("should use bootstrap mode when no creeps exist", () => {
      global.Game.creeps = {};
      const room = createMockRoom("E1N1");
      const swarm = createMockSwarmState();
      const result = determineNextRole(room, swarm);
      // In bootstrap mode, should deterministically return larvaWorker first
      assert.equal(result, "larvaWorker");
    });

    it("should exit bootstrap mode when critical roles are filled", () => {
      createMockCreeps({
        larvaWorker: 1,
        harvester: 2,
        hauler: 1,
        upgrader: 1
      });
      const room = createMockRoom("E1N1", false, 2); // 2 sources
      global.Game.rooms["E1N1"] = room;
      const swarm = createMockSwarmState();

      // Should not be in bootstrap mode, so weighted selection applies
      // The result could vary based on weighted selection, but won't be
      // forced to larvaWorker since bootstrap mode is inactive
      const result = determineNextRole(room, swarm);
      // Result could be any role that needs spawning (builder, more upgraders, etc.)
      // The important thing is that bootstrap logic is not forcing the decision
      assert.isNotNull(result); // Some role should be needed
    });
  });

  describe("bootstrap with single source room", () => {
    it("should NOT require 2nd harvester in room with only 1 source", () => {
      createMockCreeps({
        larvaWorker: 1,
        harvester: 1,
        hauler: 1
      });
      const room = createMockRoom("E1N1", false, 1); // Single source room
      global.Game.rooms["E1N1"] = room;
      const result = isBootstrapMode("E1N1", room);
      
      // FIXED: Should not be in bootstrap mode with 1 harvester in a 1-source room
      // Previously would get stuck requiring 2 harvesters regardless of source count
      assert.isFalse(result, "Bootstrap mode should exit with 1 harvester in 1-source room");
    });

    it("should require 2nd harvester in room with 2 sources", () => {
      createMockCreeps({
        larvaWorker: 1,
        harvester: 1,
        hauler: 1
      });
      const room = createMockRoom("E1N1", false, 2); // Two source room
      global.Game.rooms["E1N1"] = room;
      const result = isBootstrapMode("E1N1", room);
      
      // Should still be in bootstrap mode, needing 2nd harvester
      assert.isTrue(result, "Bootstrap mode should continue until 2nd harvester in 2-source room");
    });

    it("should exit bootstrap after spawning correct number of harvesters for sources", () => {
      // Room with 1 source
      createMockCreeps({
        larvaWorker: 1,
        harvester: 1,
        hauler: 1,
        upgrader: 1
      });
      const singleSourceRoom = createMockRoom("E1N1", false, 1);
      global.Game.rooms["E1N1"] = singleSourceRoom;
      const result1 = isBootstrapMode("E1N1", singleSourceRoom);
      assert.isFalse(result1, "1-source room should exit bootstrap with 1 harvester");

      // Room with 2 sources - still needs 2nd harvester
      createMockCreeps({
        larvaWorker: 1,
        harvester: 1,
        hauler: 1,
        upgrader: 1
      });
      const twoSourceRoom = createMockRoom("E2N2", false, 2);
      global.Game.rooms["E2N2"] = twoSourceRoom;
      const result2 = isBootstrapMode("E2N2", twoSourceRoom);
      assert.isTrue(result2, "2-source room should stay in bootstrap with only 1 harvester");

      // Room with 2 sources - both harvesters spawned
      createMockCreeps({
        larvaWorker: 1,
        harvester: 2,
        hauler: 1,
        upgrader: 1
      });
      global.Game.creeps["harvester_0"].memory.homeRoom = "E2N2";
      global.Game.creeps["harvester_1"].memory.homeRoom = "E2N2";
      const result3 = isBootstrapMode("E2N2", twoSourceRoom);
      assert.isFalse(result3, "2-source room should exit bootstrap with 2 harvesters");
    });
  });
});
