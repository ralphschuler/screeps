import { assert } from "chai";
import {
  runSpawnManager,
  ROLE_DEFINITIONS,
  getBestBody,
  isEmergencySpawnState,
  isBootstrapMode,
  getBootstrapRole
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
    colonyLevel: "seedNest",
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
    controller: { level: 1, my: true }, // RCL 1 for seedNest stage
    find: (type: FindConstant) => {
      if (type === FIND_MY_SPAWNS) {
        return [mockSpawn];
      }
      if (type === FIND_SOURCES) {
        // Return mock sources
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

describe("workforce collapse recovery", () => {
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

    // Mock kernel.emit to prevent errors and capture events
    if (!kernel.emit) {
      const mockEmit: typeof kernel.emit = () => {};
      Object.assign(kernel, { emit: mockEmit });
    }
  });

  describe("ultra-minimal emergency body (150 energy)", () => {
    it("should have a 150 energy body for larvaWorker", () => {
      const larvaWorkerDef = ROLE_DEFINITIONS["larvaWorker"];
      assert.isNotNull(larvaWorkerDef, "larvaWorker role should exist");

      // Check for 150 energy body
      const ultraMinimalBody = larvaWorkerDef.bodies.find(b => b.cost === 150);
      assert.isNotNull(ultraMinimalBody, "Should have 150 energy body");
      assert.deepEqual(
        ultraMinimalBody!.parts,
        [WORK, CARRY],
        "Ultra-minimal body should be [WORK, CARRY]"
      );
    });

    it("should spawn ultra-minimal larvaWorker with exactly 150 energy", () => {
      // Setup: Total workforce collapse with only 150 energy
      const room = createMockRoom("E1N1", 150, 300);
      global.Game.rooms["E1N1"] = room;
      global.Game.creeps = {}; // No creeps at all

      const swarm = createMockSwarmState();

      // Verify we're in emergency state
      assert.isTrue(isEmergencySpawnState("E1N1"), "Should be in emergency state");
      assert.isTrue(isBootstrapMode("E1N1", room), "Should be in bootstrap mode");

      // Run spawn manager
      runSpawnManager(room, swarm);

      // Should have spawned ultra-minimal larvaWorker
      const creeps = Object.values(global.Game.creeps);
      assert.equal(creeps.length, 1, "Should spawn exactly one creep");

      const memory = creeps[0].memory as unknown as Record<string, unknown>;
      assert.equal(memory.role, "larvaWorker", "Should spawn larvaWorker");
    });

    it("should spawn ultra-minimal larvaWorker with 175 energy", () => {
      // Setup: Total workforce collapse with 175 energy (between 150 and 200)
      const room = createMockRoom("E1N1", 175, 300);
      global.Game.rooms["E1N1"] = room;
      global.Game.creeps = {};

      const swarm = createMockSwarmState();

      // Run spawn manager
      runSpawnManager(room, swarm);

      // Should have spawned ultra-minimal larvaWorker (150 energy is best fit)
      const creeps = Object.values(global.Game.creeps);
      assert.equal(creeps.length, 1, "Should spawn exactly one creep");

      const memory = creeps[0].memory as unknown as Record<string, unknown>;
      assert.equal(memory.role, "larvaWorker", "Should spawn larvaWorker");
    });

    it("should prefer standard 200 energy body when available", () => {
      // Setup: Room with 200 energy available
      const room = createMockRoom("E1N1", 200, 300);
      global.Game.rooms["E1N1"] = room;
      global.Game.creeps = {};

      const swarm = createMockSwarmState();

      // Run spawn manager
      runSpawnManager(room, swarm);

      // Should spawn with 200 energy body (includes MOVE)
      const creeps = Object.values(global.Game.creeps);
      assert.equal(creeps.length, 1, "Should spawn exactly one creep");
    });
  });

  describe("total workforce collapse scenarios", () => {
    it("should recover from complete workforce loss with minimal energy", () => {
      // Scenario: All creeps dead, spawn has 150 energy, no extensions
      const room = createMockRoom("E1N1", 150, 300);
      global.Game.rooms["E1N1"] = room;
      global.Game.creeps = {};

      const swarm = createMockSwarmState();

      // Verify crisis detection
      assert.isTrue(isEmergencySpawnState("E1N1"), "Should detect emergency");
      assert.isTrue(isBootstrapMode("E1N1", room), "Should be in bootstrap mode");

      // First spawn - should get ultra-minimal larvaWorker
      runSpawnManager(room, swarm);
      assert.equal(Object.keys(global.Game.creeps).length, 1, "Should spawn first larvaWorker");

      // Simulate having more energy now (larvaWorker harvested some)
      const room2 = createMockRoom("E1N1", 200, 300);
      global.Game.rooms["E1N1"] = room2;

      // Second spawn - should get standard larvaWorker or first harvester
      runSpawnManager(room2, swarm);
      assert.isAtLeast(Object.keys(global.Game.creeps).length, 1, "Should maintain spawning");
    });

    it("should not spawn when energy is below 150", () => {
      // Scenario: Total collapse with insufficient energy (< 150)
      const room = createMockRoom("E1N1", 100, 300);
      global.Game.rooms["E1N1"] = room;
      global.Game.creeps = {};

      const swarm = createMockSwarmState();

      // Should detect emergency but can't spawn
      assert.isTrue(isEmergencySpawnState("E1N1"), "Should detect emergency");

      const creepsBefore = Object.keys(global.Game.creeps).length;
      runSpawnManager(room, swarm);
      const creepsAfter = Object.keys(global.Game.creeps).length;

      // Should not spawn (waiting for energy)
      assert.equal(creepsAfter, creepsBefore, "Should not spawn with insufficient energy");
    });

    it("should handle multi-spawn room with one spawn having energy", () => {
      // In Screeps, room.energyAvailable already aggregates all spawns
      // This test verifies our logic handles the aggregated value correctly
      const room = createMockRoom("E1N1", 180, 600); // Two spawns = 600 capacity
      global.Game.rooms["E1N1"] = room;
      global.Game.creeps = {};

      const swarm = createMockSwarmState();

      // Should spawn with 150 energy body even though capacity is higher
      runSpawnManager(room, swarm);

      const creeps = Object.values(global.Game.creeps);
      assert.equal(creeps.length, 1, "Should spawn one creep");
    });
  });

  describe("getBestBody emergency behavior", () => {
    it("should select ultra-minimal body when only 150 energy available", () => {
      const larvaWorkerDef = ROLE_DEFINITIONS["larvaWorker"];
      const body = getBestBody(larvaWorkerDef, 150);

      assert.isNotNull(body, "Should find a body");
      assert.equal(body!.cost, 150, "Should select 150 energy body");
      assert.deepEqual(body!.parts, [WORK, CARRY], "Should be ultra-minimal body");
    });

    it("should select standard body when 200+ energy available", () => {
      const larvaWorkerDef = ROLE_DEFINITIONS["larvaWorker"];
      const body = getBestBody(larvaWorkerDef, 200);

      assert.isNotNull(body, "Should find a body");
      assert.equal(body!.cost, 200, "Should select 200 energy body");
      assert.include(body!.parts, MOVE, "Should include MOVE part");
    });

    it("should return null when energy below minimum", () => {
      const larvaWorkerDef = ROLE_DEFINITIONS["larvaWorker"];
      const body = getBestBody(larvaWorkerDef, 100);

      assert.isNull(body, "Should not find body with only 100 energy");
    });
  });

  describe("bootstrap order with limited energy", () => {
    it("should follow bootstrap order correctly during recovery", () => {
      const room = createMockRoom("E1N1", 200, 300);
      global.Game.rooms["E1N1"] = room;

      const swarm = createMockSwarmState();

      // Stage 1: No creeps - should spawn larvaWorker
      global.Game.creeps = {};
      let role = getBootstrapRole("E1N1", room, swarm);
      assert.equal(role, "larvaWorker", "First spawn should be larvaWorker");

      // Stage 2: One larvaWorker - should spawn harvester
      global.Game.creeps = {
        larvaWorker_1: {
          memory: { role: "larvaWorker", homeRoom: "E1N1", family: "economy", version: 1 }
        } as unknown as Creep
      };
      role = getBootstrapRole("E1N1", room, swarm);
      assert.equal(role, "harvester", "Second spawn should be harvester");

      // Stage 3: LarvaWorker + Harvester - should spawn hauler
      global.Game.creeps = {
        larvaWorker_1: {
          memory: { role: "larvaWorker", homeRoom: "E1N1", family: "economy", version: 1 }
        } as unknown as Creep,
        harvester_1: {
          memory: { role: "harvester", homeRoom: "E1N1", family: "economy", version: 1 }
        } as unknown as Creep
      };
      role = getBootstrapRole("E1N1", room, swarm);
      assert.equal(role, "hauler", "Third spawn should be hauler");
    });
  });

  describe("emergency event emission", () => {
    it("should emit emergency event when energy is critically low", () => {
      const room = createMockRoom("E1N1", 100, 300);
      global.Game.rooms["E1N1"] = room;
      global.Game.creeps = {};

      const swarm = createMockSwarmState();

      // Mock kernel.emit to capture events
      const events: Array<{ type: string; data: Record<string, unknown> }> = [];
      kernel.emit = ((type: string, data: Record<string, unknown>) => {
        events.push({ type, data });
      }) as typeof kernel.emit;

      // Run spawn manager - should emit emergency event
      runSpawnManager(room, swarm);

      // Check for emergency event
      const emergencyEvent = events.find(e => e.type === "spawn.emergency");
      assert.isDefined(emergencyEvent, "Should emit spawn.emergency event");
      assert.equal(emergencyEvent?.data.energyAvailable, 100, "Should report correct energy");
    });

    it("should not emit emergency event when energy is sufficient", () => {
      const room = createMockRoom("E1N1", 300, 300);
      global.Game.rooms["E1N1"] = room;
      global.Game.creeps = {};

      const swarm = createMockSwarmState();

      // Mock kernel.emit to capture events
      const events: Array<{ type: string; data: Record<string, unknown> }> = [];
      kernel.emit = ((type: string, data: Record<string, unknown>) => {
        events.push({ type, data });
      }) as typeof kernel.emit;

      // Run spawn manager
      runSpawnManager(room, swarm);

      // Should have spawn.completed event but not spawn.emergency
      const emergencyEvent = events.find(e => e.type === "spawn.emergency");
      assert.isUndefined(emergencyEvent, "Should not emit emergency event with sufficient energy");
    });
  });
});
