import { expect } from "chai";
import { Game as MockGame } from "./mock";
import {
  getRoomTowers,
  getRoomSpawns,
  getRoomLinks,
  getRoomStorage,
  getRoomTerminal,
  getRoomController,
  getRoomSources,
  getRoomMineral,
  clearStructureCache,
  invalidateRoomStructureCache
} from "../../src/cache";

describe("StructureCache", () => {
  let tickCounter = 0;

  beforeEach(() => {
    tickCounter++;
    // @ts-ignore test setup
    global.Game = {
      ...MockGame,
      time: tickCounter,
      rooms: {}
    };
    clearStructureCache();
  });

  describe("getRoomTowers", () => {
    it("should return all towers in room", () => {
      const tower1 = {
        id: "tower1" as Id<StructureTower>,
        structureType: STRUCTURE_TOWER
      } as StructureTower;

      const tower2 = {
        id: "tower2" as Id<StructureTower>,
        structureType: STRUCTURE_TOWER
      } as StructureTower;

      const spawn = {
        id: "spawn1" as Id<StructureSpawn>,
        structureType: STRUCTURE_SPAWN
      } as StructureSpawn;

      const room = {
        name: "W1N1",
        find: (type: FindConstant, opts?: any) => {
          if (type === FIND_MY_STRUCTURES) {
            const structures = [tower1, tower2, spawn];
            if (opts?.filter) {
              return structures.filter((s: any) =>
                opts.filter.structureType ? s.structureType === opts.filter.structureType : true
              );
            }
            return structures;
          }
          return [];
        }
      } as Room;

      const towers = getRoomTowers(room);
      expect(towers).to.have.lengthOf(2);
      expect(towers[0].structureType).to.equal(STRUCTURE_TOWER);
    });

    it("should cache results with TTL of 10 ticks", () => {
      let callCount = 0;
      const room = {
        name: "W1N1",
        find: (type: FindConstant, opts?: any) => {
          callCount++;
          return [];
        }
      } as Room;

      // First call
      getRoomTowers(room);
      expect(callCount).to.equal(1);

      // Second call (same tick) - should use cache
      getRoomTowers(room);
      expect(callCount).to.equal(1);

      // Advance 5 ticks - still cached
      tickCounter += 5;
      // @ts-ignore test setup
      global.Game.time = tickCounter;
      getRoomTowers(room);
      expect(callCount).to.equal(1);

      // Advance to tick 11 - cache expired
      tickCounter += 6;
      // @ts-ignore test setup
      global.Game.time = tickCounter;
      getRoomTowers(room);
      expect(callCount).to.equal(2);
    });
  });

  describe("getRoomSpawns", () => {
    it("should return all spawns in room", () => {
      const spawn1 = {
        id: "spawn1" as Id<StructureSpawn>,
        name: "Spawn1",
        structureType: STRUCTURE_SPAWN
      } as StructureSpawn;

      const spawn2 = {
        id: "spawn2" as Id<StructureSpawn>,
        name: "Spawn2",
        structureType: STRUCTURE_SPAWN
      } as StructureSpawn;

      const room = {
        name: "W1N1",
        find: (type: FindConstant) => {
          if (type === FIND_MY_SPAWNS) {
            return [spawn1, spawn2];
          }
          return [];
        }
      } as Room;

      const spawns = getRoomSpawns(room);
      expect(spawns).to.have.lengthOf(2);
      expect(spawns[0].structureType).to.equal(STRUCTURE_SPAWN);
    });
  });

  describe("getRoomStorage", () => {
    it("should return storage if exists", () => {
      const storage = {
        id: "storage1" as Id<StructureStorage>,
        structureType: STRUCTURE_STORAGE,
        store: {}
      } as StructureStorage;

      const room = {
        name: "W1N1",
        storage
      } as Room;

      const result = getRoomStorage(room);
      expect(result).to.not.be.undefined;
      expect(result?.structureType).to.equal(STRUCTURE_STORAGE);
    });

    it("should return undefined if no storage", () => {
      const room = {
        name: "W1N1",
        storage: undefined
      } as Room;

      const result = getRoomStorage(room);
      expect(result).to.be.undefined;
    });
  });

  describe("getRoomController", () => {
    it("should cache controller with long TTL", () => {
      let callCount = 0;
      const controller = {
        id: "controller1" as Id<StructureController>,
        my: true,
        level: 5
      } as StructureController;

      const room = {
        name: "W1N1",
        get controller() {
          callCount++;
          return controller;
        }
      } as Room;

      // First call
      getRoomController(room);
      expect(callCount).to.equal(1);

      // Advance 50 ticks - still cached (TTL is 100)
      tickCounter += 50;
      // @ts-ignore test setup
      global.Game.time = tickCounter;
      getRoomController(room);
      expect(callCount).to.equal(1);
    });
  });

  describe("getRoomSources", () => {
    it("should return all sources in room", () => {
      const source1 = {
        id: "source1" as Id<Source>,
        pos: { x: 10, y: 10 }
      } as Source;

      const source2 = {
        id: "source2" as Id<Source>,
        pos: { x: 20, y: 20 }
      } as Source;

      const room = {
        name: "W1N1",
        find: (type: FindConstant) => {
          if (type === FIND_SOURCES) {
            return [source1, source2];
          }
          return [];
        }
      } as Room;

      const sources = getRoomSources(room);
      expect(sources).to.have.lengthOf(2);
    });

    it("should cache sources indefinitely (TTL = -1)", () => {
      let callCount = 0;
      const room = {
        name: "W1N1",
        find: (type: FindConstant) => {
          callCount++;
          return [];
        }
      } as Room;

      // First call
      getRoomSources(room);
      expect(callCount).to.equal(1);

      // Advance 1000 ticks - still cached
      tickCounter += 1000;
      // @ts-ignore test setup
      global.Game.time = tickCounter;
      getRoomSources(room);
      expect(callCount).to.equal(1);
    });
  });

  describe("getRoomMineral", () => {
    it("should return mineral if exists", () => {
      const mineral = {
        id: "mineral1" as Id<Mineral>,
        mineralType: RESOURCE_HYDROGEN as MineralConstant,
        pos: { x: 25, y: 25 }
      } as Mineral;

      const room = {
        name: "W1N1",
        find: (type: FindConstant) => {
          if (type === FIND_MINERALS) {
            return [mineral];
          }
          return [];
        }
      } as Room;

      const result = getRoomMineral(room);
      expect(result).to.not.be.undefined;
      expect(result?.mineralType).to.equal(RESOURCE_HYDROGEN);
    });

    it("should cache mineral indefinitely", () => {
      let callCount = 0;
      const room = {
        name: "W1N1",
        find: (type: FindConstant) => {
          callCount++;
          return [];
        }
      } as Room;

      // First call
      getRoomMineral(room);
      expect(callCount).to.equal(1);

      // Advance many ticks - still cached
      tickCounter += 500;
      // @ts-ignore test setup
      global.Game.time = tickCounter;
      getRoomMineral(room);
      expect(callCount).to.equal(1);
    });
  });

  describe("invalidateRoomStructureCache", () => {
    it("should invalidate all structure caches for a room", () => {
      let callCount = 0;
      const room = {
        name: "W1N1",
        find: (type: FindConstant) => {
          callCount++;
          return [];
        },
        storage: undefined,
        terminal: undefined,
        controller: undefined
      } as Room;

      // Cache multiple structure types
      getRoomTowers(room);
      getRoomSpawns(room);
      getRoomLinks(room);

      const initialCallCount = callCount;

      // Invalidate all
      invalidateRoomStructureCache("W1N1");

      // Next calls should recompute
      getRoomTowers(room);
      getRoomSpawns(room);
      getRoomLinks(room);

      expect(callCount).to.be.greaterThan(initialCallCount);
    });
  });
});
