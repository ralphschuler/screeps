import { assert } from "chai";
import { harvester } from "../../src/roles/behaviors/economy";
import type { CreepContext } from "../../src/roles/behaviors/types";
import type { SwarmCreepMemory } from "../../src/memory/schemas";

/**
 * Create a mock creep for testing
 */
function createMockCreep(options: {
  capacity: number;
  freeCapacity: number;
  usedCapacity: number;
  isNearToSource: boolean;
}): Creep {
  return {
    name: "TestHarvester",
    store: {
      getCapacity: () => options.capacity,
      getFreeCapacity: () => options.freeCapacity,
      getUsedCapacity: () => options.usedCapacity
    },
    pos: {
      isNearTo: () => options.isNearToSource
    }
  } as unknown as Creep;
}

/**
 * Create a mock source for testing
 */
function createMockSource(): Source {
  return {
    id: "mockSourceId" as Id<Source>,
    energy: 3000
  } as unknown as Source;
}

/**
 * Create a mock context for testing harvester behavior
 */
function createMockContext(
  creep: Creep,
  source: Source | null,
  memory: Partial<SwarmCreepMemory> = {}
): CreepContext {
  const fullMemory: SwarmCreepMemory = {
    role: "harvester",
    family: "economy",
    homeRoom: "E1N1",
    version: 1,
    ...memory
  };

  return {
    creep,
    room: {} as Room,
    memory: fullMemory,
    swarmState: undefined,
    squadMemory: undefined,
    homeRoom: "E1N1",
    targetRoom: undefined,
    isInHomeRoom: true,
    isInTargetRoom: true,
    isFull: false,
    isEmpty: true,
    isWorking: false,
    assignedSource: source,
    assignedMineral: null,
    energyAvailable: true,
    nearbyEnemies: false,
    constructionSiteCount: 0,
    damagedStructureCount: 0,
    droppedResources: [],
    containers: [],
    spawnStructures: [],
    towers: [],
    storage: undefined,
    terminal: undefined,
    hostiles: [],
    damagedAllies: [],
    prioritizedSites: [],
    repairTargets: [],
    labs: [],
    factory: undefined
  };
}

describe("harvester behavior", () => {
  describe("when creep has no carry capacity (drop miner)", () => {
    it("should return harvest action when near source", () => {
      const source = createMockSource();
      const creep = createMockCreep({
        capacity: 0,
        freeCapacity: 0,
        usedCapacity: 0,
        isNearToSource: true
      });
      const ctx = createMockContext(creep, source);

      const action = harvester(ctx);

      assert.equal(action.type, "harvest");
      if (action.type === "harvest") {
        assert.equal(action.target, source);
      }
    });
  });

  describe("when creep has carry capacity", () => {
    it("should return harvest action when near source and has free capacity", () => {
      const source = createMockSource();
      const creep = createMockCreep({
        capacity: 50,
        freeCapacity: 50,
        usedCapacity: 0,
        isNearToSource: true
      });
      const ctx = createMockContext(creep, source);

      const action = harvester(ctx);

      assert.equal(action.type, "harvest");
      if (action.type === "harvest") {
        assert.equal(action.target, source);
      }
    });

    it("should return drop action when full and no container/link nearby", () => {
      const source = createMockSource();
      const creep = createMockCreep({
        capacity: 50,
        freeCapacity: 0,
        usedCapacity: 50,
        isNearToSource: true
      });
      // Add findInRange mock for container/link search
      (creep.pos as any).findInRange = () => [];
      const ctx = createMockContext(creep, source);

      const action = harvester(ctx);

      assert.equal(action.type, "drop");
    });
  });

  describe("when not near source", () => {
    it("should return moveTo action", () => {
      const source = createMockSource();
      const creep = createMockCreep({
        capacity: 0,
        freeCapacity: 0,
        usedCapacity: 0,
        isNearToSource: false
      });
      const ctx = createMockContext(creep, source);

      const action = harvester(ctx);

      assert.equal(action.type, "moveTo");
      if (action.type === "moveTo") {
        assert.equal(action.target, source);
      }
    });
  });

  describe("when no source assigned", () => {
    it("should return idle when no sources available", () => {
      const creep = createMockCreep({
        capacity: 0,
        freeCapacity: 0,
        usedCapacity: 0,
        isNearToSource: false
      });
      // Mock room.find to return empty sources
      const ctx = createMockContext(creep, null);
      ctx.room = {
        find: () => []
      } as unknown as Room;

      const action = harvester(ctx);

      assert.equal(action.type, "idle");
    });
  });
});
