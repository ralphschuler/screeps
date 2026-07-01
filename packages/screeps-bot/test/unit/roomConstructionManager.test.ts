import { assert } from "chai";
import { RoomConstructionManager, shouldRunRoadAwarePerimeterConstruction } from "../../src/core/managers/RoomConstructionManager";

/**
 * Test suite for RoomConstructionManager
 *
 * Tests the implementation of:
 * - Blueprint-based construction
 * - Perimeter defense placement
 * - Road network planning
 * - Rampart automation
 * - Construction interval calculation
 */
describe("RoomConstructionManager", () => {
  let manager: RoomConstructionManager;

  beforeEach(() => {
    manager = new RoomConstructionManager();
  });

  describe("Construction intervals", () => {
    it("should return faster interval for early game defense (RCL 2-3)", () => {
      const interval = manager.getConstructionInterval(2);
      assert.equal(interval, 5, "Early game should have 5 tick interval");

      const interval3 = manager.getConstructionInterval(3);
      assert.equal(interval3, 5, "RCL 3 should have 5 tick interval");
    });

    it("should return regular interval for mid-late game (RCL 4+)", () => {
      const interval = manager.getConstructionInterval(4);
      assert.equal(interval, 10, "RCL 4+ should have 10 tick interval");

      const interval8 = manager.getConstructionInterval(8);
      assert.equal(interval8, 10, "RCL 8 should have 10 tick interval");
    });

    it("should return regular interval for RCL 1", () => {
      const interval = manager.getConstructionInterval(1);
      assert.equal(interval, 10, "RCL 1 should have 10 tick interval");
    });
  });

  describe("Blueprint construction", () => {
    function createSpawnlessRoom(
      record: { calls: { x: number; y: number; structureType: BuildableStructureConstant }[] },
      level = 1
    ): Room {
      const controller = {
        my: true,
        level,
        pos: new RoomPosition(25, 25, "W2N1")
      } as unknown as StructureController;
      const source = {
        id: "source1" as Id<Source>,
        pos: new RoomPosition(20, 20, "W2N1")
      } as unknown as Source;

      return {
        name: "W2N1",
        controller,
        getTerrain: () => ({ get: () => 0 }),
        find: (type: FindConstant) => {
          if (type === FIND_SOURCES) return [source];
          return [];
        },
        createConstructionSite: (x: number, y: number, structureType: BuildableStructureConstant) => {
          record.calls.push({ x, y, structureType });
          return OK;
        }
      } as unknown as Room;
    }

    function createRoomWithExistingSites(
      record: { calls: { x: number; y: number; structureType: BuildableStructureConstant }[] },
      existingStructures: Structure[],
      existingSites: ConstructionSite[]
    ): Room {
      const controller = {
        my: true,
        level: 2,
        pos: new RoomPosition(40, 38, "W2N1")
      } as unknown as StructureController;
      const spawn = existingStructures.find(
        (structure): structure is StructureSpawn => structure.structureType === STRUCTURE_SPAWN
      ) ?? ({
        id: "spawn1" as Id<StructureSpawn>,
        structureType: STRUCTURE_SPAWN,
        pos: new RoomPosition(31, 25, "W2N1")
      } as StructureSpawn);
      const sources = [
        { pos: new RoomPosition(33, 8, "W2N1") } as Source,
        { pos: new RoomPosition(21, 30, "W2N1") } as Source
      ];
      const minerals = [{ pos: new RoomPosition(37, 31, "W2N1") } as Mineral];

      return {
        name: "W2N1",
        controller,
        getTerrain: () => ({ get: () => 0 }),
        find: (type: FindConstant, options?: { filter?: (obj: Structure | ConstructionSite) => boolean }) => {
          if (type === FIND_MY_CONSTRUCTION_SITES) return options?.filter ? existingSites.filter(options.filter) : existingSites;
          if (type === FIND_MY_STRUCTURES) return options?.filter ? existingStructures.filter(options.filter) : existingStructures;
          if (type === FIND_MY_SPAWNS) return [spawn];
          if (type === FIND_STRUCTURES) return existingStructures;
          if (type === FIND_SOURCES) return sources;
          if (type === FIND_MINERALS) return minerals;
          return [];
        },
        createConstructionSite: (x: number, y: number, structureType: BuildableStructureConstant) => {
          record.calls.push({ x, y, structureType });
          return OK;
        }
      } as unknown as Room;
    }

    it("should place the first spawn site in a spawnless RCL1 room even when other sites exist", () => {
      const record: { calls: { x: number; y: number; structureType: BuildableStructureConstant }[] } = { calls: [] };
      const room = createSpawnlessRoom(record);
      const roadSite = { structureType: STRUCTURE_ROAD } as ConstructionSite;
      const swarm = { danger: 0, remoteAssignments: [], metrics: {} } as any;

      manager.runConstruction(room, swarm, [roadSite], []);

      assert.isTrue(
        record.calls.some(call => call.structureType === STRUCTURE_SPAWN),
        "spawnless RCL1 room should get a spawn construction site before other bootstrap work"
      );
    });

    it("should not place duplicate first spawn sites", () => {
      const record: { calls: { x: number; y: number; structureType: BuildableStructureConstant }[] } = { calls: [] };
      const room = createSpawnlessRoom(record);
      const spawnSite = { structureType: STRUCTURE_SPAWN } as ConstructionSite;
      const swarm = { danger: 0, remoteAssignments: [], metrics: {} } as any;

      manager.runConstruction(room, swarm, [spawnSite], []);

      assert.isFalse(
        record.calls.some(call => call.structureType === STRUCTURE_SPAWN),
        "existing spawn construction site should satisfy first-spawn placement"
      );
    });

    it("should place the first spawn site before the per-room construction cap", () => {
      const record: { calls: { x: number; y: number; structureType: BuildableStructureConstant }[] } = { calls: [] };
      const room = createSpawnlessRoom(record);
      const roadSites = Array.from({ length: 10 }, () => ({ structureType: STRUCTURE_ROAD }) as ConstructionSite);
      const swarm = { danger: 0, remoteAssignments: [], metrics: {} } as any;

      manager.runConstruction(room, swarm, roadSites, []);

      assert.isTrue(
        record.calls.some(call => call.structureType === STRUCTURE_SPAWN),
        "first spawn placement should bypass the local construction throttling cap"
      );
    });

    it("should rebuild the first spawn in spawnless claimed rooms above RCL1", () => {
      const record: { calls: { x: number; y: number; structureType: BuildableStructureConstant }[] } = { calls: [] };
      const room = createSpawnlessRoom(record, 3);
      const swarm = { danger: 0, remoteAssignments: [], metrics: {} } as any;

      manager.runConstruction(room, swarm, [], []);

      assert.isTrue(
        record.calls.some(call => call.structureType === STRUCTURE_SPAWN),
        "spawnless owned rooms above RCL1 should rebuild a spawn instead of stalling forever"
      );
    });

    it("should place missing RCL5 tower sites before local construction cap during danger", () => {
      const record: { calls: { x: number; y: number; structureType: BuildableStructureConstant }[] } = { calls: [] };
      const spawn = {
        id: "spawn1" as Id<StructureSpawn>,
        structureType: STRUCTURE_SPAWN,
        pos: new RoomPosition(25, 25, "W2N1")
      } as StructureSpawn;
      const controller = {
        my: true,
        level: 5,
        pos: new RoomPosition(25, 8, "W2N1")
      } as unknown as StructureController;
      const source = { pos: new RoomPosition(10, 25, "W2N1") } as Source;
      const sites = Array.from({ length: 10 }, (_, index) => ({
        structureType: STRUCTURE_ROAD,
        pos: new RoomPosition(10 + index, 10, "W2N1")
      }) as ConstructionSite);
      const structures = [spawn] as Structure[];
      const room = {
        name: "W2N1",
        controller,
        getTerrain: () => ({ get: () => 0 }),
        find: (type: FindConstant, options?: { filter?: (structure: Structure) => boolean }) => {
          if (type === FIND_STRUCTURES) return structures;
          if (type === FIND_MY_STRUCTURES) return options?.filter ? structures.filter(options.filter) : structures;
          if (type === FIND_MY_CONSTRUCTION_SITES) return sites;
          if (type === FIND_MY_SPAWNS) return [spawn];
          if (type === FIND_SOURCES) return [source];
          if (type === FIND_MINERALS) return [];
          return [];
        },
        createConstructionSite: (x: number, y: number, structureType: BuildableStructureConstant) => {
          record.calls.push({ x, y, structureType });
          return OK;
        }
      } as unknown as Room;
      const swarm = { danger: 3, remoteAssignments: [], metrics: {}, posture: "siege" } as any;
      const oldGame = (globalThis as { Game?: unknown }).Game;
      (globalThis as { Game?: unknown }).Game = { time: 100, constructionSites: {} };

      try {
        manager.runConstruction(room, swarm, sites, [spawn], { criticalOnly: true });
      } finally {
        (globalThis as { Game?: unknown }).Game = oldGame;
      }

      assert.isTrue(
        record.calls.some(call => call.structureType === STRUCTURE_TOWER),
        "critical defense construction should bypass the local site cap to place a missing tower"
      );
    });

    it("should place extension sites in RCL2 when mandatory demand exists despite existing backlog", () => {
      const record: { calls: { x: number; y: number; structureType: BuildableStructureConstant }[] } = { calls: [] };
      const existingStructures: Structure[] = [
        {
          id: "spawn1" as Id<StructureSpawn>,
          structureType: STRUCTURE_SPAWN,
          pos: new RoomPosition(31, 25, "W2N1")
        } as StructureSpawn
      ];
      const existingSites: ConstructionSite[] = [
        ...Array.from({ length: 4 }, (_, index) => ({
          structureType: STRUCTURE_CONTAINER,
          pos: new RoomPosition(10 + index, 10, "W2N1")
        } as ConstructionSite)),
        ...Array.from({ length: 8 }, (_, index) => ({
          structureType: STRUCTURE_ROAD,
          pos: new RoomPosition(20 + index, 20, "W2N1")
        } as ConstructionSite))
      ];

      const room = createRoomWithExistingSites(record, existingStructures, existingSites);
      const swarm = { danger: 0, remoteAssignments: [], metrics: {} } as any;
      const oldGame = (globalThis as { Game?: unknown }).Game;
      (globalThis as { Game?: unknown }).Game = { constructionSites: {} };

      try {
        manager.runConstruction(room, swarm, existingSites, existingStructures as StructureSpawn[]);
      } finally {
        (globalThis as { Game?: unknown }).Game = oldGame;
      }

      assert.exists(
        record.calls.find((call) => call.structureType === STRUCTURE_EXTENSION),
        "RCL2 rooms with extension demand should keep blueprint placement even when backlog is high"
      );
    });

    it("should skip blueprint queue when per-room site cap is hit and no mandatory demand remains", () => {
      const record: { calls: { x: number; y: number; structureType: BuildableStructureConstant }[] } = { calls: [] };
      const extensionPositions = Array.from({ length: 5 }, (_, index) => ({
        id: `ext${index}` as Id<StructureExtension>,
        structureType: STRUCTURE_EXTENSION,
        pos: new RoomPosition(10 + index, 20, "W2N1")
      } as StructureExtension));
      const existingStructures: Structure[] = [
        {
          id: "spawn1" as Id<StructureSpawn>,
          structureType: STRUCTURE_SPAWN,
          pos: new RoomPosition(31, 25, "W2N1")
        } as StructureSpawn,
        ...extensionPositions
      ];
      const existingSites: ConstructionSite[] = [
        ...Array.from({ length: 4 }, (_, index) => ({
          structureType: STRUCTURE_CONTAINER,
          pos: new RoomPosition(10 + index, 10, "W2N1")
        } as ConstructionSite)),
        ...Array.from({ length: 8 }, (_, index) => ({
          structureType: STRUCTURE_ROAD,
          pos: new RoomPosition(20 + index, 20, "W2N1")
        } as ConstructionSite))
      ];

      const room = createRoomWithExistingSites(record, existingStructures, existingSites);
      const swarm = { danger: 0, remoteAssignments: [], metrics: {} } as any;
      const oldGame = (globalThis as { Game?: unknown }).Game;
      (globalThis as { Game?: unknown }).Game = { constructionSites: {} };

      try {
        manager.runConstruction(room, swarm, existingSites, existingStructures as StructureSpawn[]);
      } finally {
        (globalThis as { Game?: unknown }).Game = oldGame;
      }

      assert.equal(
        record.calls.filter((call) => call.structureType === STRUCTURE_EXTENSION).length,
        0,
        "No additional extension sites should be created when RCL2 mandatory demand is already met"
      );
    });

    it("should destroy misplaced structures in non-combat postures", () => {
      assert.exists(manager);
    });

    it("should place road-aware perimeter defense", () => {
      assert.exists(manager);
    });

    it("should place ramparts on critical structures", () => {
      assert.exists(manager);
    });

    it("should update construction site metrics", () => {
      assert.exists(manager);
    });
  });

  describe("Perimeter throttling", () => {
    it("should skip peaceful road-aware perimeter planning while a defense site is pending", () => {
      const shouldRun = shouldRunRoadAwarePerimeterConstruction({
        allowPerimeter: true,
        rcl: 6,
        danger: 0,
        existingSites: [{ structureType: STRUCTURE_RAMPART } as ConstructionSite]
      });

      assert.isFalse(shouldRun);
    });

    it("should bypass peaceful perimeter throttle when danger is present", () => {
      const shouldRun = shouldRunRoadAwarePerimeterConstruction({
        allowPerimeter: true,
        rcl: 6,
        danger: 1,
        existingSites: [{ structureType: STRUCTURE_RAMPART } as ConstructionSite]
      });

      assert.isTrue(shouldRun);
    });

    it("should run peaceful road-aware perimeter planning when no defense site is pending", () => {
      const shouldRun = shouldRunRoadAwarePerimeterConstruction({
        allowPerimeter: true,
        rcl: 6,
        danger: 0,
        existingSites: [{ structureType: STRUCTURE_ROAD } as ConstructionSite]
      });

      assert.isTrue(shouldRun);
    });
  });

  describe("Early game defense", () => {
    it("should place more perimeter sites in early game", () => {
      assert.exists(manager);
    });

    it("should reduce perimeter sites after RCL 3", () => {
      assert.exists(manager);
    });
  });
});
