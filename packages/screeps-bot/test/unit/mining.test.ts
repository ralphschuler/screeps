import { assert } from "chai";
import { mineralHarvester, depositHarvester } from "@ralphschuler/screeps-roles";
import type { CreepContext } from "@ralphschuler/screeps-roles";
import type { SwarmCreepMemory } from "../../src/memory/schemas";

/**
 * Minimal interface for mock store object
 */
interface MockStore {
  getCapacity: () => number | null;
  getFreeCapacity: (resource?: string) => number | null;
  getUsedCapacity: (resource?: string) => number;
  [key: string]: unknown;
}

/**
 * Minimal interface for mock position object
 */
interface MockPosition {
  findInRange<T>(
    type: number,
    range: number,
    opts?: { filter: (obj: unknown) => boolean }
  ): T[];
  lookFor(type: string): Structure[];
  x: number;
  y: number;
  roomName: string;
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
  storeContents?: Record<string, number>;
}): Creep {
  const storeContents = options.storeContents ?? {};
  const mockCreep: MockCreep = {
    name: "TestMiner",
    store: {
      getCapacity: () => options.freeCapacity + options.usedCapacity,
      getFreeCapacity: (resource?: string) => {
        if (resource && storeContents[resource]) {
          return options.freeCapacity;
        }
        return options.freeCapacity;
      },
      getUsedCapacity: (resource?: string) => {
        if (resource && storeContents[resource]) {
          return storeContents[resource];
        }
        return options.usedCapacity;
      },
      ...storeContents
    },
    pos: {
      findInRange: () => [],
      lookFor: () => [],
      x: 25,
      y: 25,
      roomName: "E1N1"
    }
  };
  return mockCreep as unknown as Creep;
}

/**
 * Create a mock mineral for testing
 */
function createMockMineral(options: {
  mineralAmount: number;
  mineralType: MineralConstant;
  hasExtractor: boolean;
}): Mineral {
  const mockPos = {
    findInRange: () => [],
    lookFor: (type: string) => {
      if (type === LOOK_STRUCTURES && options.hasExtractor) {
        return [
          {
            structureType: STRUCTURE_EXTRACTOR
          }
        ] as Structure[];
      }
      return [];
    },
    x: 25,
    y: 25,
    roomName: "E1N1"
  };

  return {
    id: "mockMineralId" as Id<Mineral>,
    mineralAmount: options.mineralAmount,
    mineralType: options.mineralType,
    pos: mockPos
  } as unknown as Mineral;
}

/**
 * Create a mock container for testing
 */
function createMockContainer(freeCapacity: number): StructureContainer {
  return {
    id: "mockContainerId" as Id<StructureContainer>,
    structureType: STRUCTURE_CONTAINER,
    store: {
      getFreeCapacity: () => freeCapacity
    }
  } as unknown as StructureContainer;
}

/**
 * Create a mock storage for testing
 */
function createMockStorage(): StructureStorage {
  return {
    id: "mockStorageId" as Id<StructureStorage>,
    structureType: STRUCTURE_STORAGE
  } as unknown as StructureStorage;
}

/**
 * Create a mock terminal for testing
 */
function createMockTerminal(): StructureTerminal {
  return {
    id: "mockTerminalId" as Id<StructureTerminal>,
    structureType: STRUCTURE_TERMINAL
  } as unknown as StructureTerminal;
}

/**
 * Create a mock deposit for testing
 */
function createMockDeposit(options: {
  cooldown: number;
  depositType: DepositConstant;
}): Deposit {
  return {
    id: "mockDepositId" as Id<Deposit>,
    cooldown: options.cooldown,
    depositType: options.depositType,
    pos: {
      x: 25,
      y: 25,
      roomName: "E2N1"
    }
  } as unknown as Deposit;
}

/**
 * Minimal interface for mock room object
 */
interface MockRoom {
  find: (type: number) => unknown[];
  name: string;
}

/**
 * Create a mock room for testing
 */
function createMockRoom(options: {
  minerals?: Mineral[];
  deposits?: Deposit[];
}): Room {
  const mockRoom: MockRoom = {
    find: (type: number) => {
      if (type === FIND_MINERALS) {
        return options.minerals ?? [];
      }
      if (type === FIND_DEPOSITS) {
        return options.deposits ?? [];
      }
      return [];
    },
    name: "E1N1"
  };
  return mockRoom as unknown as Room;
}

/**
 * Mock Game.getObjectById for deposit testing
 */
function mockGetObjectById(depositId: string | undefined, deposit: Deposit | null) {
  const originalGetObjectById = (Game as any).getObjectById;
  (Game as any).getObjectById = (id: string) => {
    if (id === depositId) {
      return deposit;
    }
    return null;
  };
  return () => {
    (Game as any).getObjectById = originalGetObjectById;
  };
}

/**
 * Create a mock context for testing mining behaviors
 */
function createMockContext(
  creep: Creep,
  room: Room,
  options: {
    role: string;
    isFull?: boolean;
    isEmpty?: boolean;
    storage?: StructureStorage;
    terminal?: StructureTerminal;
    memory?: Partial<SwarmCreepMemory>;
  }
): CreepContext {
  const fullMemory: SwarmCreepMemory = {
    role: options.role,
    family: "economy",
    homeRoom: "E1N1",
    version: 1,
    ...options.memory
  };

  return {
    creep,
    room,
    memory: fullMemory,
    swarmState: undefined,
    squadMemory: undefined,
    homeRoom: "E1N1",
    isInHomeRoom: true,
    isFull: options.isFull ?? false,
    isEmpty: options.isEmpty ?? true,
    isWorking: false,
    assignedSource: null,
    assignedMineral: null,
    energyAvailable: true,
    nearbyEnemies: false,
    constructionSiteCount: 0,
    damagedStructureCount: 0,
    droppedResources: [],
    containers: [],
    depositContainers: [],
    spawnStructures: [],
    towers: [],
    storage: options.storage,
    terminal: options.terminal,
    hostiles: [],
    damagedAllies: [],
    prioritizedSites: [],
    repairTargets: [],
    labs: [],
    factory: undefined,
    tombstones: [],
    mineralContainers: []
  };
}

describe("mineralHarvester behavior", () => {
  describe("when mineral is available", () => {
    it("should harvest mineral when not full and mineral has resources", () => {
      const creep = createMockCreep({
        freeCapacity: 50,
        usedCapacity: 0
      });
      const mineral = createMockMineral({
        mineralAmount: 1000,
        mineralType: RESOURCE_HYDROGEN,
        hasExtractor: true
      });
      const room = createMockRoom({ minerals: [mineral] });

      const ctx = createMockContext(creep, room, {
        role: "mineralHarvester",
        isFull: false,
        isEmpty: true
      });

      const action = mineralHarvester(ctx);

      assert.equal(action.type, "harvestMineral");
      if (action.type === "harvestMineral") {
        assert.equal(action.target, mineral);
      }
    });

    it("should transfer to nearby container when full", () => {
      const container = createMockContainer(500);
      const creep = createMockCreep({
        freeCapacity: 0,
        usedCapacity: 50,
        storeContents: { [RESOURCE_HYDROGEN]: 50 }
      });
      
      // Mock findInRange to return the container
      (creep.pos as any).findInRange = () => [container];

      const mineral = createMockMineral({
        mineralAmount: 1000,
        mineralType: RESOURCE_HYDROGEN,
        hasExtractor: true
      });
      const room = createMockRoom({ minerals: [mineral] });

      const ctx = createMockContext(creep, room, {
        role: "mineralHarvester",
        isFull: true,
        isEmpty: false
      });

      const action = mineralHarvester(ctx);

      assert.equal(action.type, "transfer");
      if (action.type === "transfer") {
        assert.equal(action.target, container);
        assert.equal(action.resourceType, RESOURCE_HYDROGEN);
      }
    });

    it("should transfer to terminal when full and no nearby container", () => {
      const terminal = createMockTerminal();
      const creep = createMockCreep({
        freeCapacity: 0,
        usedCapacity: 50,
        storeContents: { [RESOURCE_HYDROGEN]: 50 }
      });
      const mineral = createMockMineral({
        mineralAmount: 1000,
        mineralType: RESOURCE_HYDROGEN,
        hasExtractor: true
      });
      const room = createMockRoom({ minerals: [mineral] });

      const ctx = createMockContext(creep, room, {
        role: "mineralHarvester",
        isFull: true,
        isEmpty: false,
        terminal
      });

      const action = mineralHarvester(ctx);

      assert.equal(action.type, "transfer");
      if (action.type === "transfer") {
        assert.equal(action.target, terminal);
        assert.equal(action.resourceType, RESOURCE_HYDROGEN);
      }
    });

    it("should transfer to storage when full and no terminal", () => {
      const storage = createMockStorage();
      const creep = createMockCreep({
        freeCapacity: 0,
        usedCapacity: 50,
        storeContents: { [RESOURCE_HYDROGEN]: 50 }
      });
      const mineral = createMockMineral({
        mineralAmount: 1000,
        mineralType: RESOURCE_HYDROGEN,
        hasExtractor: true
      });
      const room = createMockRoom({ minerals: [mineral] });

      const ctx = createMockContext(creep, room, {
        role: "mineralHarvester",
        isFull: true,
        isEmpty: false,
        storage
      });

      const action = mineralHarvester(ctx);

      assert.equal(action.type, "transfer");
      if (action.type === "transfer") {
        assert.equal(action.target, storage);
        assert.equal(action.resourceType, RESOURCE_HYDROGEN);
      }
    });
  });

  describe("when mineral is depleted", () => {
    it("should move to storage when mineral is depleted and storage exists", () => {
      const storage = createMockStorage();
      const creep = createMockCreep({
        freeCapacity: 50,
        usedCapacity: 0
      });
      const mineral = createMockMineral({
        mineralAmount: 0,
        mineralType: RESOURCE_HYDROGEN,
        hasExtractor: true
      });
      const room = createMockRoom({ minerals: [mineral] });

      const ctx = createMockContext(creep, room, {
        role: "mineralHarvester",
        isFull: false,
        isEmpty: true,
        storage
      });

      const action = mineralHarvester(ctx);

      assert.equal(action.type, "moveTo");
      if (action.type === "moveTo") {
        assert.equal(action.target, storage);
      }
    });

    it("should idle when mineral is depleted and no storage", () => {
      const creep = createMockCreep({
        freeCapacity: 50,
        usedCapacity: 0
      });
      const mineral = createMockMineral({
        mineralAmount: 0,
        mineralType: RESOURCE_HYDROGEN,
        hasExtractor: true
      });
      const room = createMockRoom({ minerals: [mineral] });

      const ctx = createMockContext(creep, room, {
        role: "mineralHarvester",
        isFull: false,
        isEmpty: true
      });

      const action = mineralHarvester(ctx);

      assert.equal(action.type, "idle");
    });
  });

  describe("when no extractor or mineral", () => {
    it("should idle when no extractor on mineral", () => {
      const creep = createMockCreep({
        freeCapacity: 50,
        usedCapacity: 0
      });
      const mineral = createMockMineral({
        mineralAmount: 1000,
        mineralType: RESOURCE_HYDROGEN,
        hasExtractor: false
      });
      const room = createMockRoom({ minerals: [mineral] });

      const ctx = createMockContext(creep, room, {
        role: "mineralHarvester",
        isFull: false,
        isEmpty: true
      });

      const action = mineralHarvester(ctx);

      assert.equal(action.type, "idle");
    });

    it("should idle when no mineral in room", () => {
      const creep = createMockCreep({
        freeCapacity: 50,
        usedCapacity: 0
      });
      const room = createMockRoom({ minerals: [] });

      const ctx = createMockContext(creep, room, {
        role: "mineralHarvester",
        isFull: false,
        isEmpty: true
      });

      const action = mineralHarvester(ctx);

      assert.equal(action.type, "idle");
    });
  });
});

describe("depositHarvester behavior", () => {
  describe("when deposit is available", () => {
    it("should find and harvest from deposit with low cooldown", () => {
      const deposit = createMockDeposit({
        cooldown: 50,
        depositType: RESOURCE_MIST
      });
      const creep = createMockCreep({
        freeCapacity: 50,
        usedCapacity: 0
      });
      const room = createMockRoom({ deposits: [deposit] });

      const restoreGetObjectById = mockGetObjectById("mockDepositId", deposit);

      const ctx = createMockContext(creep, room, {
        role: "depositHarvester",
        isFull: false,
        isEmpty: true
      });

      const action = depositHarvester(ctx);

      assert.equal(action.type, "harvestDeposit");
      if (action.type === "harvestDeposit") {
        assert.equal(action.target, deposit);
      }

      restoreGetObjectById();
    });

    it("should select deposit with lowest cooldown when multiple exist", () => {
      const deposit1 = createMockDeposit({
        cooldown: 100,
        depositType: RESOURCE_MIST
      });
      const deposit2 = createMockDeposit({
        cooldown: 30,
        depositType: RESOURCE_MIST
      });
      (deposit2 as any).id = "mockDeposit2Id" as Id<Deposit>;

      const creep = createMockCreep({
        freeCapacity: 50,
        usedCapacity: 0
      });
      const room = createMockRoom({ deposits: [deposit1, deposit2] });

      const restoreGetObjectById = mockGetObjectById("mockDeposit2Id", deposit2);

      const ctx = createMockContext(creep, room, {
        role: "depositHarvester",
        isFull: false,
        isEmpty: true
      });

      const action = depositHarvester(ctx);

      assert.equal(action.type, "harvestDeposit");
      if (action.type === "harvestDeposit") {
        assert.equal(action.target, deposit2, "Should select deposit with lowest cooldown");
      }

      restoreGetObjectById();
    });

    it("should clear target and idle when deposit cooldown is too high", () => {
      const deposit = createMockDeposit({
        cooldown: 150,
        depositType: RESOURCE_MIST
      });
      const creep = createMockCreep({
        freeCapacity: 50,
        usedCapacity: 0
      });
      const room = createMockRoom({ deposits: [deposit] });

      const restoreGetObjectById = mockGetObjectById("mockDepositId", deposit);

      const ctx = createMockContext(creep, room, {
        role: "depositHarvester",
        isFull: false,
        isEmpty: true,
        memory: { targetId: "mockDepositId" as Id<Deposit> }
      });

      const action = depositHarvester(ctx);

      assert.equal(action.type, "idle");
      assert.isUndefined(ctx.memory.targetId, "Should clear targetId when cooldown too high");

      restoreGetObjectById();
    });
  });

  describe("when full and returning home", () => {
    it("should transfer to terminal in home room when full", () => {
      const terminal = createMockTerminal();
      const creep = createMockCreep({
        freeCapacity: 0,
        usedCapacity: 50,
        storeContents: { [RESOURCE_MIST]: 50 }
      });
      const room = createMockRoom({});
      
      // Mock Game.rooms to return home room with terminal
      const originalRooms = Game.rooms;
      (Game as any).rooms = {
        E1N1: {
          terminal,
          storage: undefined
        }
      };

      const ctx = createMockContext(creep, room, {
        role: "depositHarvester",
        isFull: true,
        isEmpty: false
      });

      const action = depositHarvester(ctx);

      assert.equal(action.type, "transfer");
      if (action.type === "transfer") {
        assert.equal(action.target, terminal);
        assert.equal(action.resourceType, RESOURCE_MIST);
      }

      (Game as any).rooms = originalRooms;
    });

    it("should transfer to storage in home room when full and no terminal", () => {
      const storage = createMockStorage();
      const creep = createMockCreep({
        freeCapacity: 0,
        usedCapacity: 50,
        storeContents: { [RESOURCE_MIST]: 50 }
      });
      const room = createMockRoom({});
      
      // Mock Game.rooms to return home room with storage
      const originalRooms = Game.rooms;
      (Game as any).rooms = {
        E1N1: {
          terminal: undefined,
          storage
        }
      };

      const ctx = createMockContext(creep, room, {
        role: "depositHarvester",
        isFull: true,
        isEmpty: false
      });

      const action = depositHarvester(ctx);

      assert.equal(action.type, "transfer");
      if (action.type === "transfer") {
        assert.equal(action.target, storage);
        assert.equal(action.resourceType, RESOURCE_MIST);
      }

      (Game as any).rooms = originalRooms;
    });

    it("should move to home room when full but home room not visible", () => {
      const creep = createMockCreep({
        freeCapacity: 0,
        usedCapacity: 50,
        storeContents: { [RESOURCE_MIST]: 50 }
      });
      const room = createMockRoom({});
      
      // Mock Game.rooms with no home room
      const originalRooms = Game.rooms;
      (Game as any).rooms = {};

      const ctx = createMockContext(creep, room, {
        role: "depositHarvester",
        isFull: true,
        isEmpty: false
      });

      const action = depositHarvester(ctx);

      assert.equal(action.type, "moveToRoom");
      if (action.type === "moveToRoom") {
        assert.equal(action.roomName, "E1N1");
      }

      (Game as any).rooms = originalRooms;
    });
  });

  describe("when no valid deposit", () => {
    it("should idle when no deposits in room", () => {
      const creep = createMockCreep({
        freeCapacity: 50,
        usedCapacity: 0
      });
      const room = createMockRoom({ deposits: [] });

      const ctx = createMockContext(creep, room, {
        role: "depositHarvester",
        isFull: false,
        isEmpty: true
      });

      const action = depositHarvester(ctx);

      assert.equal(action.type, "idle");
    });

    it("should clear target and idle when deposit no longer exists", () => {
      const creep = createMockCreep({
        freeCapacity: 50,
        usedCapacity: 0
      });
      const room = createMockRoom({ deposits: [] });

      const restoreGetObjectById = mockGetObjectById("invalidDepositId", null);

      const ctx = createMockContext(creep, room, {
        role: "depositHarvester",
        isFull: false,
        isEmpty: true,
        memory: { targetId: "invalidDepositId" as Id<Deposit> }
      });

      const action = depositHarvester(ctx);

      assert.equal(action.type, "idle");
      assert.isUndefined(ctx.memory.targetId, "Should clear targetId when deposit doesn't exist");

      restoreGetObjectById();
    });
  });
});
