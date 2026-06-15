import { expect } from "chai";

type FindOptions<T> = { filter?: (value: T) => boolean };

class TestRoomPosition {
  public constructor(public x: number, public y: number, public roomName: string) {}

  public getRangeTo(pos: { x: number; y: number }): number {
    return Math.max(Math.abs(this.x - pos.x), Math.abs(this.y - pos.y));
  }
}

function installGlobals(searchCalls: { count: number }): void {
  Object.assign(globalThis, {
    FIND_SOURCES: 105,
    FIND_MINERALS: 116,
    FIND_STRUCTURES: 107,
    FIND_MY_CONSTRUCTION_SITES: 111,
    FIND_CONSTRUCTION_SITES: 108,
    FIND_MY_SPAWNS: 109,
    TERRAIN_MASK_WALL: 1,
    STRUCTURE_ROAD: "road",
    STRUCTURE_CONTAINER: "container",
    STRUCTURE_RAMPART: "rampart",
    RoomPosition: TestRoomPosition,
    PathFinder: {
      CostMatrix: class {
        public set(): void {}
      },
      search: (from: RoomPosition, goal: { pos: RoomPosition }) => {
        searchCalls.count++;
        return {
          path: [new RoomPosition(from.x, from.y, from.roomName), goal.pos],
          incomplete: false,
          ops: 1,
          cost: 1
        };
      }
    }
  });

  Game.time = 1000;
  Game.map = {
    getRoomTerrain: () => ({ get: () => 0 })
  } as unknown as Game["map"];
}

function createRoom(existingRoadKeys: () => string[], options: { storage?: boolean } = { storage: true }): Room {
  const terrain = { get: () => 0 };
  const room = {
    name: "W0N0",
    controller: {
      level: 5,
      pos: new RoomPosition(20, 20, "W0N0")
    },
    storage: options.storage === false ? undefined : {
      pos: new RoomPosition(25, 25, "W0N0")
    },
    getTerrain: () => terrain,
    find: (type: FindConstant, options?: FindOptions<unknown>) => {
      let results: unknown[] = [];
      if (type === FIND_SOURCES) {
        results = [{ pos: new RoomPosition(10, 10, "W0N0") }];
      } else if (type === FIND_MINERALS || type === FIND_MY_CONSTRUCTION_SITES || type === FIND_CONSTRUCTION_SITES || type === FIND_MY_SPAWNS) {
        results = [];
      } else if (type === FIND_STRUCTURES) {
        results = existingRoadKeys().map(key => {
          const [x, y] = key.split(",").map(Number);
          return {
            structureType: STRUCTURE_ROAD,
            pos: new RoomPosition(x, y, "W0N0")
          };
        });
      }

      return options?.filter ? results.filter(options.filter) : results;
    }
  } as unknown as Room;

  Game.rooms = { W0N0: room };
  return room;
}

describe("roadNetworkPlanner", () => {
  beforeEach(async () => {
    const searchCalls = { count: 0 };
    installGlobals(searchCalls);
    const planner = await import("../src/roadNetworkPlanner.ts");
    planner.clearAllRoadNetworkCaches();
  });

  it("reuses cached valid road positions for repeated room/anchor/blueprint/remotes calls", async () => {
    const searchCalls = { count: 0 };
    installGlobals(searchCalls);
    const { clearAllRoadNetworkCaches, getValidRoadPositions } = await import("../src/roadNetworkPlanner.ts");
    clearAllRoadNetworkCaches();
    const room = createRoom(() => []);
    const anchor = new RoomPosition(25, 25, "W0N0");

    getValidRoadPositions(room, anchor, [{ x: 0, y: 1 }], []);
    const firstCallCount = searchCalls.count;
    getValidRoadPositions(room, anchor, [{ x: 0, y: 1 }], []);

    expect(firstCallCount).to.be.greaterThan(0);
    expect(searchCalls.count).to.equal(firstCallCount);
  });

  it("keeps existing exit-road fallback fresh while using cached planned roads", async () => {
    const searchCalls = { count: 0 };
    installGlobals(searchCalls);
    const { clearAllRoadNetworkCaches, getValidRoadPositions } = await import("../src/roadNetworkPlanner.ts");
    clearAllRoadNetworkCaches();
    let existingRoadKeys: string[] = [];
    const room = createRoom(() => existingRoadKeys);
    const anchor = new RoomPosition(25, 25, "W0N0");

    const first = getValidRoadPositions(room, anchor, [], []);
    const firstCallCount = searchCalls.count;
    existingRoadKeys = ["1,20"];
    const second = getValidRoadPositions(room, anchor, [], []);

    expect(first.has("1,20")).to.equal(false);
    expect(second.has("1,20")).to.equal(true);
    expect(searchCalls.count).to.equal(firstCallCount);
  });

  it("recalculates road networks when the anchor changes", async () => {
    const searchCalls = { count: 0 };
    installGlobals(searchCalls);
    const { calculateRoadNetwork, clearAllRoadNetworkCaches } = await import("../src/roadNetworkPlanner.ts");
    clearAllRoadNetworkCaches();
    const room = createRoom(() => [], { storage: false });

    const first = calculateRoadNetwork(room, new RoomPosition(12, 12, "W0N0"));
    const firstCallCount = searchCalls.count;
    const second = calculateRoadNetwork(room, new RoomPosition(35, 35, "W0N0"));

    expect(searchCalls.count).to.be.greaterThan(firstCallCount);
    expect(first.positions.has("12,12")).to.equal(true);
    expect(second.positions.has("35,35")).to.equal(true);
  });

  it("clears cached valid road positions with clearRoadNetworkCache", async () => {
    const searchCalls = { count: 0 };
    installGlobals(searchCalls);
    const { clearAllRoadNetworkCaches, clearRoadNetworkCache, getValidRoadPositions } = await import("../src/roadNetworkPlanner.ts");
    clearAllRoadNetworkCaches();
    const room = createRoom(() => []);
    const anchor = new RoomPosition(25, 25, "W0N0");

    getValidRoadPositions(room, anchor, [], []);
    const firstCallCount = searchCalls.count;
    clearRoadNetworkCache("W0N0");
    getValidRoadPositions(room, anchor, [], []);

    expect(searchCalls.count).to.be.greaterThan(firstCallCount);
  });
});
