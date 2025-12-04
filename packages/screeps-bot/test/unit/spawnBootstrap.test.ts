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
      constructionSites: 0
    },
    lastUpdate: 0
  };
}

/**
 * Create a mock Room object
 */
function createMockRoom(name: string, hasStorage = false): Room {
  return {
    name,
    storage: hasStorage ? { store: { [RESOURCE_ENERGY]: 10000 } } : undefined,
    controller: { level: 4, my: true },
    find: () => [],
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
      time: 1000
    } as unknown as typeof Game;
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
        larvaWorker: 2,
        harvester: 2,
        hauler: 2,
        upgrader: 1
      });
      const room = createMockRoom("E1N1");
      const result = isBootstrapMode("E1N1", room);
      assert.isFalse(result);
    });

    it("should return true when storage exists but no queenCarrier", () => {
      createMockCreeps({
        harvester: 2,
        hauler: 2
      });
      const room = createMockRoom("E1N1", true); // Has storage
      const result = isBootstrapMode("E1N1", room);
      assert.isTrue(result);
    });

    it("should handle storage case with larvaWorkers as fallback", () => {
      createMockCreeps({
        harvester: 2,
        hauler: 2,
        larvaWorker: 2,
        upgrader: 1
      });
      const room = createMockRoom("E1N1", true); // Has storage
      const result = isBootstrapMode("E1N1", room);
      // Has larvaWorkers so not in bootstrap mode due to queenCarrier,
      // but queenCarrier is in bootstrap order so still needs it
      assert.isTrue(result); // Still true because queenCarrier minCount (1) not met
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

    it("should return larvaWorker until minCount (2) is reached", () => {
      createMockCreeps({ larvaWorker: 1 });
      const room = createMockRoom("E1N1");
      const swarm = createMockSwarmState();
      const result = getBootstrapRole("E1N1", room, swarm);
      assert.equal(result, "larvaWorker");
    });

    it("should return harvester after larvaWorkers are spawned", () => {
      createMockCreeps({ larvaWorker: 2 });
      const room = createMockRoom("E1N1");
      const swarm = createMockSwarmState();
      const result = getBootstrapRole("E1N1", room, swarm);
      assert.equal(result, "harvester");
    });

    it("should return hauler after first harvester", () => {
      createMockCreeps({ larvaWorker: 2, harvester: 1 });
      const room = createMockRoom("E1N1");
      const swarm = createMockSwarmState();
      const result = getBootstrapRole("E1N1", room, swarm);
      assert.equal(result, "hauler");
    });

    it("should follow bootstrap order correctly", () => {
      createMockCreeps({
        larvaWorker: 2,
        harvester: 2,
        hauler: 2
      });
      const room = createMockRoom("E1N1");
      const swarm = createMockSwarmState();
      const result = getBootstrapRole("E1N1", room, swarm);
      // Next in order after harvesters (2) and haulers (2) is queenCarrier (if storage)
      // or upgrader if no storage
      assert.equal(result, "upgrader");
    });

    it("should request queenCarrier when storage exists", () => {
      createMockCreeps({
        larvaWorker: 2,
        harvester: 2,
        hauler: 2
      });
      const room = createMockRoom("E1N1", true); // Has storage
      const swarm = createMockSwarmState();
      const result = getBootstrapRole("E1N1", room, swarm);
      assert.equal(result, "queenCarrier");
    });

    it("should return null when all bootstrap roles are satisfied", () => {
      createMockCreeps({
        larvaWorker: 2,
        harvester: 2,
        hauler: 2,
        upgrader: 1
      });
      const room = createMockRoom("E1N1");
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
        larvaWorker: 2,
        harvester: 2,
        hauler: 2,
        upgrader: 1
      });
      const room = createMockRoom("E1N1");
      const swarm = createMockSwarmState();

      // Should not be in bootstrap mode, so weighted selection applies
      // The result could vary but should be a valid role
      const result = determineNextRole(room, swarm);
      // Result should be null or a role string - not specifically larvaWorker
      // since we're past bootstrap mode
      assert.notEqual(result, "larvaWorker"); // Already at maxPerRoom for larvaWorker (6), but have 2
    });
  });
});
