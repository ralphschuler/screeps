import { assert } from "chai";
import {
  runSpawnManager,
  ROLE_DEFINITIONS,
  countCreepsByRole,
  getAllSpawnableRoles
} from "../../src/logic/spawn";
import type { SwarmState } from "../../src/memory/schemas";
import { kernel } from "../../src/core/kernel";

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
 * Create a mock Room with spawn
 */
function createMockRoom(
  name: string,
  energyAvailable: number,
  energyCapacity: number,
  hasStorage = false
): Room {
  const mockSpawn = {
    name: `Spawn1`,
    spawning: false,
    spawnCreep: (body: BodyPartConstant[], creepName: string, opts?: SpawnOptions) => {
      // Calculate cost of body
      const costs: Record<BodyPartConstant, number> = {
        [MOVE]: 50,
        [WORK]: 100,
        [CARRY]: 50,
        [ATTACK]: 80,
        [RANGED_ATTACK]: 150,
        [HEAL]: 250,
        [CLAIM]: 600,
        [TOUGH]: 10
      };
      const cost = body.reduce((sum, part) => sum + costs[part], 0);

      if (cost > energyAvailable) {
        return ERR_NOT_ENOUGH_ENERGY;
      }

      // Successfully spawned - add to Game.creeps
      const memory = (opts?.memory as unknown as Record<string, unknown>) ?? {};
      const creep = {
        name: creepName,
        memory,
        spawning: true
      } as unknown as Creep;
      global.Game.creeps[creepName] = creep;
      return OK;
    },
    room: null as unknown as Room
  } as unknown as StructureSpawn;

  const room = {
    name,
    energyAvailable,
    energyCapacityAvailable: energyCapacity,
    storage: hasStorage ? { store: { [RESOURCE_ENERGY]: 10000 } } : undefined,
    controller: { level: 4, my: true },
    find: (type: FindConstant) => {
      if (type === FIND_MY_SPAWNS) {
        return [mockSpawn];
      }
      if (type === FIND_SOURCES) {
        // Return mock sources so roles that need sources can spawn
        return [
          { id: "source1" as Id<Source>, pos: { x: 25, y: 25 } },
          { id: "source2" as Id<Source>, pos: { x: 30, y: 30 } }
        ] as unknown as Source[];
      }
      if (type === FIND_MY_CONSTRUCTION_SITES) {
        return [];
      }
      if (type === FIND_MINERALS) {
        return [];
      }
      if (type === FIND_MY_STRUCTURES) {
        return [];
      }
      return [];
    }
  } as unknown as Room;

  mockSpawn.room = room;
  return room;
}

/**
 * Create mock creeps with specific roles
 */
function createMockCreeps(config: Record<string, number>, homeRoom = "E1N1"): void {
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

describe("spawn energy constraints", () => {
  beforeEach(() => {
    // Reset the global Game object before each test
    global.Game = {
      creeps: {},
      rooms: {},
      time: 1000,
      gcl: {
        level: 1,
        progress: 0,
        progressTotal: 1000000
      },
      cpu: {
        bucket: 10000,
        limit: 20,
        tickLimit: 500,
        getUsed: () => 10
      }
    } as unknown as typeof Game;

    // Mock kernel.emit to prevent errors
    if (!kernel.emit) {
      const mockEmit: typeof kernel.emit = () => {};
      Object.assign(kernel, { emit: mockEmit });
    }
  });

  describe("fallback to cheaper roles when energy is insufficient", () => {
    it("should wait for optimal body instead of spawning small creep when not in bootstrap", () => {
      // Setup: Room with limited energy (300 available, 800 capacity)
      const room = createMockRoom("E1N1", 300, 800);
      global.Game.rooms["E1N1"] = room;

      // Create existing creeps - we need enough to exit bootstrap mode
      // Bootstrap requires: larvaWorker(1), harvester(2), hauler(1), upgrader(1)
      createMockCreeps({
        larvaWorker: 1,
        harvester: 2,
        hauler: 1,
        upgrader: 1
        // Now out of bootstrap mode, still need builder (0 of 2), more upgraders (1 of 2), etc.
      });

      const swarm = createMockSwarmState();

      const creepsBefore = Object.keys(global.Game.creeps).length;

      // Verify spawnable roles exist
      const spawnableRoles = getAllSpawnableRoles(room, swarm);
      assert.isAbove(spawnableRoles.length, 0, "Should have at least one spawnable role");

      // Run spawn manager
      runSpawnManager(room, swarm);

      // CHANGED BEHAVIOR: Should NOT spawn when we can't afford optimal bodies
      // With 300 energy available and 800 capacity, system should wait for more energy
      // to spawn optimal-sized creeps instead of small inefficient ones
      const creepsAfter = Object.keys(global.Game.creeps);
      assert.equal(
        creepsAfter.length,
        creepsBefore,
        "Should wait for optimal energy instead of spawning small creep"
      );
    });

    it("should not spawn anything if no affordable roles exist", () => {
      // Setup: Room with very limited energy (only 50 energy - can't spawn anything useful)
      const room = createMockRoom("E1N1", 50, 800);
      global.Game.rooms["E1N1"] = room;

      // Create some existing creeps
      createMockCreeps({
        harvester: 2,
        hauler: 2,
        upgrader: 2,
        builder: 2
      });

      const swarm = createMockSwarmState();

      const creepsBefore = Object.keys(global.Game.creeps).length;

      // Run spawn manager
      runSpawnManager(room, swarm);

      // Should not have spawned anything (50 energy is too low for any body)
      const creepsAfter = Object.keys(global.Game.creeps).length;
      assert.equal(creepsAfter, creepsBefore, "Should not spawn when energy too low");
    });

    it("should spawn when energy is sufficient for optimal body", () => {
      // Setup: Room with moderate energy that can afford optimal bodies
      const room = createMockRoom("E1N1", 800, 800);
      global.Game.rooms["E1N1"] = room;

      // Create existing creeps - most roles are at max, forcing selection
      // of roles that might be expensive
      createMockCreeps({
        larvaWorker: 1,
        harvester: 2,
        hauler: 2,
        upgrader: 1
      });

      const swarm = createMockSwarmState();

      const creepsBefore = Object.keys(global.Game.creeps).length;

      // Run spawn manager
      runSpawnManager(room, swarm);

      // Should have spawned something since we have full energy capacity available
      const creepsAfter = Object.keys(global.Game.creeps).length;
      assert.isAbove(
        creepsAfter,
        creepsBefore,
        "Should spawn optimal body when full energy is available"
      );
    });

    it("should spawn in bootstrap mode with limited energy", () => {
      // Setup: Empty room with just enough energy for a larvaWorker
      const room = createMockRoom("E1N1", 200, 300);
      global.Game.rooms["E1N1"] = room;

      // No creeps - should be in bootstrap mode
      global.Game.creeps = {};

      const swarm = createMockSwarmState();

      // Run spawn manager
      runSpawnManager(room, swarm);

      // Should have spawned a larvaWorker (bootstrap priority)
      const creeps = Object.values(global.Game.creeps);
      assert.equal(creeps.length, 1, "Should spawn one creep");

      const memory = creeps[0].memory as unknown as Record<string, unknown>;
      assert.equal(memory.role, "larvaWorker", "Should spawn larvaWorker in bootstrap mode");
    });
    
    it("should spawn smaller bodies in bootstrap mode even when capacity is higher", () => {
      // Setup: Room in bootstrap mode with limited energy but higher capacity
      const room = createMockRoom("E1N1", 250, 800);
      global.Game.rooms["E1N1"] = room;

      // No creeps - should be in bootstrap mode
      global.Game.creeps = {};

      const swarm = createMockSwarmState();

      // Run spawn manager
      runSpawnManager(room, swarm);

      // Should have spawned a larvaWorker with smaller body (250 energy)
      // even though capacity is 800 - this is correct bootstrap behavior
      const creeps = Object.values(global.Game.creeps);
      assert.equal(creeps.length, 1, "Should spawn one creep in bootstrap mode");

      const memory = creeps[0].memory as unknown as Record<string, unknown>;
      assert.equal(memory.role, "larvaWorker", "Should spawn larvaWorker with available energy");
    });

    it("should wait for optimal energy when all cheap roles are maxed", () => {
      // Setup: Room with limited energy
      const room = createMockRoom("E1N1", 150, 800);
      global.Game.rooms["E1N1"] = room;

      // Create existing creeps - most roles maxed out
      createMockCreeps({
        larvaWorker: 3,
        harvester: 2,
        hauler: 2,
        upgrader: 2
      });

      const swarm = createMockSwarmState();

      const creepsBefore = Object.keys(global.Game.creeps).length;

      // Run spawn manager
      runSpawnManager(room, swarm);

      // With new behavior, should wait for optimal energy rather than spawning small creeps
      // Even scout (50 energy) won't be spawned if the optimal body costs more
      const creepsAfter = Object.keys(global.Game.creeps).length;

      // Should not spawn when we can't afford optimal bodies
      assert.equal(
        creepsAfter,
        creepsBefore,
        "Should wait for optimal energy instead of spawning minimal creeps"
      );
    });
  });

  describe("role selection with various energy levels", () => {
    it("should spawn larger bodies when more energy is available", () => {
      // Setup: Room with high energy capacity and available energy
      const room = createMockRoom("E1N1", 1500, 1500);
      global.Game.rooms["E1N1"] = room;

      global.Game.creeps = {}; // No creeps - bootstrap mode

      const swarm = createMockSwarmState();

      // Run spawn manager
      runSpawnManager(room, swarm);

      // Should spawn a larvaWorker with a larger body
      const creeps = Object.values(global.Game.creeps);
      assert.equal(creeps.length, 1, "Should spawn one creep");

      const memory = creeps[0].memory as unknown as Record<string, unknown>;
      assert.equal(memory.role, "larvaWorker", "Should spawn larvaWorker");
    });

    it("should spawn minimum body when energy is low", () => {
      // Setup: Room with low energy
      const room = createMockRoom("E1N1", 200, 300);
      global.Game.rooms["E1N1"] = room;

      global.Game.creeps = {}; // No creeps

      const swarm = createMockSwarmState();

      // Run spawn manager
      runSpawnManager(room, swarm);

      // Should spawn a larvaWorker with minimum body (200 energy)
      const creeps = Object.values(global.Game.creeps);
      assert.equal(creeps.length, 1, "Should spawn one creep");

      const memory = creeps[0].memory as unknown as Record<string, unknown>;
      assert.equal(memory.role, "larvaWorker", "Should spawn larvaWorker with minimum body");
    });
  });

  describe("MAX_ROLE_ATTEMPTS limit", () => {
    it("should not get stuck in infinite loop", () => {
      // Setup: Room with some energy
      const room = createMockRoom("E1N1", 500, 800);
      global.Game.rooms["E1N1"] = room;

      // Create existing creeps
      createMockCreeps({
        harvester: 1,
        hauler: 1
      });

      const swarm = createMockSwarmState();

      // Run spawn manager - should complete without hanging
      const startTime = Date.now();
      runSpawnManager(room, swarm);
      const endTime = Date.now();

      // Should complete quickly (under 100ms in test environment)
      assert.isBelow(endTime - startTime, 100, "Should not hang");
    });
  });
});
