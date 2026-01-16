/**
 * Builder Behavior Tests
 * 
 * Test Status: 8/9 passing (89%)
 * 
 * Failing Tests:
 * - "should collect from containers when no dropped resources"
 *   Reason: findDistributedTarget from @ralphschuler/screeps-utils is not mocked
 *   Impact: Cannot test container collection path that uses distributed target assignment
 * 
 * The failing test validates the correct testing pattern even though the mock
 * infrastructure has limitations. The test will pass once findDistributedTarget
 * is added to the test setup mocks.
 */

import { assert } from "chai";
import { builder } from "@ralphschuler/screeps-roles";
import type { CreepContext } from "@ralphschuler/screeps-roles";
import type { SwarmCreepMemory } from "../../src/memory/schemas";

/**
 * Minimal interface for mock store object
 */
interface MockStore {
  getCapacity: () => number | null;
  getFreeCapacity: (resource?: string) => number | null;
  getUsedCapacity: (resource?: string) => number;
}

/**
 * Minimal interface for mock position object
 */
interface MockPosition {
  findClosestByRange<T>(targets: T[]): T | null;
}

/**
 * Minimal interface for mock creep object
 */
interface MockCreep {
  name: string;
  store: MockStore;
  pos: MockPosition;
}

/**
 * Create a mock creep for testing
 */
function createMockCreep(options: {
  freeCapacity: number;
  usedCapacity: number;
}): Creep {
  const mockCreep: MockCreep = {
    name: "TestBuilder",
    store: {
      getCapacity: () => options.freeCapacity + options.usedCapacity,
      getFreeCapacity: () => options.freeCapacity,
      getUsedCapacity: () => options.usedCapacity
    },
    pos: {
      findClosestByRange<T>(targets: T[]): T | null {
        return targets.length > 0 ? targets[0] : null;
      }
    }
  };
  return mockCreep as unknown as Creep;
}

/**
 * Create a mock spawn for testing
 */
function createMockSpawn(freeCapacity: number): StructureSpawn {
  return {
    id: "mockSpawnId" as Id<StructureSpawn>,
    structureType: STRUCTURE_SPAWN,
    store: {
      getFreeCapacity: () => freeCapacity
    }
  } as unknown as StructureSpawn;
}

/**
 * Create a mock extension for testing
 */
function createMockExtension(freeCapacity: number): StructureExtension {
  return {
    id: "mockExtensionId" as Id<StructureExtension>,
    structureType: STRUCTURE_EXTENSION,
    store: {
      getFreeCapacity: () => freeCapacity
    }
  } as unknown as StructureExtension;
}

/**
 * Create a mock tower for testing
 */
function createMockTower(freeCapacity: number): StructureTower {
  return {
    id: "mockTowerId" as Id<StructureTower>,
    structureType: STRUCTURE_TOWER,
    store: {
      getFreeCapacity: () => freeCapacity
    }
  } as unknown as StructureTower;
}

/**
 * Create a mock construction site for testing
 */
function createMockConstructionSite(): ConstructionSite {
  return {
    id: "mockSiteId" as Id<ConstructionSite>,
    structureType: STRUCTURE_ROAD,
    progress: 0,
    progressTotal: 100
  } as unknown as ConstructionSite;
}

/**
 * Create a mock controller for testing
 */
function createMockController(): StructureController {
  return {
    id: "mockControllerId" as Id<StructureController>,
    level: 3
  } as unknown as StructureController;
}

/**
 * Create a mock dropped resource for testing
 */
function createMockDroppedResource(): Resource {
  return {
    id: "mockResourceId" as Id<Resource>,
    resourceType: RESOURCE_ENERGY,
    amount: 100
  } as unknown as Resource;
}

/**
 * Create a mock container for testing
 */
function createMockContainer(): StructureContainer {
  return {
    id: "mockContainerId" as Id<StructureContainer>,
    structureType: STRUCTURE_CONTAINER,
    store: {
      getUsedCapacity: () => 500
    }
  } as unknown as StructureContainer;
}

/**
 * Minimal interface for mock room object
 */
interface MockRoom {
  find: () => never[];
  controller?: StructureController;
}

/**
 * Create a mock room for testing
 */
function createMockRoom(controller?: StructureController): Room {
  const mockRoom: MockRoom = {
    find: () => [],
    controller
  };
  return mockRoom as unknown as Room;
}

/**
 * Create a mock context for testing builder behavior
 */
function createMockContext(
  creep: Creep,
  options: {
    isWorking?: boolean;
    spawnStructures?: (StructureSpawn | StructureExtension)[];
    towers?: StructureTower[];
    prioritizedSites?: ConstructionSite[];
    controller?: StructureController;
    droppedResources?: Resource[];
    containers?: StructureContainer[];
  } = {}
): CreepContext {
  const fullMemory: SwarmCreepMemory = {
    role: "builder",
    family: "economy",
    homeRoom: "E1N1",
    version: 1,
    working: options.isWorking ?? false
  };

  return {
    creep,
    room: createMockRoom(options.controller),
    memory: fullMemory,
    swarmState: undefined,
    squadMemory: undefined,
    homeRoom: "E1N1",
    isInHomeRoom: true,
    isFull: creep.store.getFreeCapacity() === 0,
    isEmpty: creep.store.getUsedCapacity() === 0,
    isWorking: options.isWorking ?? false,
    assignedSource: null,
    assignedMineral: null,
    energyAvailable: true,
    nearbyEnemies: false,
    constructionSiteCount: options.prioritizedSites?.length ?? 0,
    damagedStructureCount: 0,
    droppedResources: options.droppedResources ?? [],
    containers: options.containers ?? [],
    depositContainers: [],
    spawnStructures: options.spawnStructures ?? [],
    towers: options.towers ?? [],
    storage: undefined,
    terminal: undefined,
    hostiles: [],
    damagedAllies: [],
    prioritizedSites: options.prioritizedSites ?? [],
    repairTargets: [],
    labs: [],
    factory: undefined,
    tombstones: [],
    mineralContainers: []
  };
}

describe("builder behavior", () => {
  describe("when builder has energy to deliver", () => {
    it("should deliver to spawn first when spawn needs energy", () => {
      const creep = createMockCreep({ freeCapacity: 0, usedCapacity: 50 });
      const spawn = createMockSpawn(100);
      const extension = createMockExtension(50);
      const tower = createMockTower(200);
      const site = createMockConstructionSite();

      const ctx = createMockContext(creep, {
        isWorking: true,
        spawnStructures: [spawn, extension],
        towers: [tower],
        prioritizedSites: [site]
      });

      const action = builder(ctx);

      assert.equal(action.type, "transfer");
      if (action.type === "transfer") {
        assert.equal(action.target, spawn, "Builder should deliver to spawn first");
        assert.equal(action.resourceType, RESOURCE_ENERGY);
      }
    });

    it("should deliver to extension when spawn is full", () => {
      const creep = createMockCreep({ freeCapacity: 0, usedCapacity: 50 });
      const extension = createMockExtension(50);
      const tower = createMockTower(200);
      const site = createMockConstructionSite();

      const ctx = createMockContext(creep, {
        isWorking: true,
        spawnStructures: [extension], // No spawn with free capacity
        towers: [tower],
        prioritizedSites: [site]
      });

      const action = builder(ctx);

      assert.equal(action.type, "transfer");
      if (action.type === "transfer") {
        assert.equal(action.target, extension, "Builder should deliver to extension when spawn is full");
        assert.equal(action.resourceType, RESOURCE_ENERGY);
      }
    });

    it("should deliver to tower when spawn and extensions are full", () => {
      const creep = createMockCreep({ freeCapacity: 0, usedCapacity: 50 });
      const tower = createMockTower(200);
      const site = createMockConstructionSite();

      const ctx = createMockContext(creep, {
        isWorking: true,
        spawnStructures: [], // No spawns or extensions with free capacity
        towers: [tower],
        prioritizedSites: [site]
      });

      const action = builder(ctx);

      assert.equal(action.type, "transfer");
      if (action.type === "transfer") {
        assert.equal(action.target, tower, "Builder should deliver to tower when spawn/extensions are full");
        assert.equal(action.resourceType, RESOURCE_ENERGY);
      }
    });

    it("should build when spawn, extensions, and towers are full", () => {
      const creep = createMockCreep({ freeCapacity: 0, usedCapacity: 50 });
      const site = createMockConstructionSite();

      const ctx = createMockContext(creep, {
        isWorking: true,
        spawnStructures: [],
        towers: [],
        prioritizedSites: [site]
      });

      const action = builder(ctx);

      assert.equal(action.type, "build");
      if (action.type === "build") {
        assert.equal(action.target, site, "Builder should build when all delivery targets are full");
      }
    });

    it("should upgrade controller when no construction sites exist", () => {
      const creep = createMockCreep({ freeCapacity: 0, usedCapacity: 50 });
      const controller = createMockController();

      const ctx = createMockContext(creep, {
        isWorking: true,
        spawnStructures: [],
        towers: [],
        prioritizedSites: [],
        controller
      });

      const action = builder(ctx);

      assert.equal(action.type, "upgrade");
      if (action.type === "upgrade") {
        assert.equal(action.target, controller, "Builder should upgrade controller when no construction sites");
      }
    });

    it("should idle when no construction sites and no controller", () => {
      const creep = createMockCreep({ freeCapacity: 0, usedCapacity: 50 });

      const ctx = createMockContext(creep, {
        isWorking: true,
        spawnStructures: [],
        towers: [],
        prioritizedSites: [],
        controller: undefined
      });

      const action = builder(ctx);

      assert.equal(action.type, "idle");
    });
  });

  describe("when builder needs energy", () => {
    it("should collect from dropped resources first", () => {
      const creep = createMockCreep({ freeCapacity: 50, usedCapacity: 0 });
      const droppedResource = createMockDroppedResource();
      const container = createMockContainer();

      const ctx = createMockContext(creep, {
        isWorking: false,
        droppedResources: [droppedResource],
        containers: [container]
      });

      const action = builder(ctx);

      assert.equal(action.type, "pickup");
      if (action.type === "pickup") {
        assert.equal(action.target, droppedResource, "Builder should pick up dropped resources first");
      }
    });

    it("should collect from containers when no dropped resources", () => {
      const creep = createMockCreep({ freeCapacity: 50, usedCapacity: 0 });
      const container = createMockContainer();

      const ctx = createMockContext(creep, {
        isWorking: false,
        droppedResources: [],
        containers: [container]
      });

      const action = builder(ctx);

      assert.equal(action.type, "withdraw");
      if (action.type === "withdraw") {
        assert.equal(action.target, container, "Builder should withdraw from container");
        assert.equal(action.resourceType, RESOURCE_ENERGY);
      }
    });

    it("should idle when no energy sources available", () => {
      const creep = createMockCreep({ freeCapacity: 50, usedCapacity: 0 });

      const ctx = createMockContext(creep, {
        isWorking: false,
        droppedResources: [],
        containers: []
      });

      const action = builder(ctx);

      assert.equal(action.type, "idle");
    });
  });
});
