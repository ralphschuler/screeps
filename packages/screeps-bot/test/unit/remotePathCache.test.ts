/**
 * Unit tests for remotePathCache module
 */

import { assert } from "chai";
import {
  getRemoteMiningPath,
  cacheRemoteMiningPath,
  precacheRemoteRoutes
} from "../../src/utils/remotePathCache.js";
import { clearPathCache } from "../../src/utils/pathCache.js";

describe("remotePathCache", () => {
  beforeEach(() => {
    // Reset Game and global state
    // @ts-ignore: Setting up test environment
    global.Game = {
      time: 1000,
      rooms: {}
    };

    // Set up Screeps constants for tests
    (global as any).FIND_SOURCES = 105;
    (global as any).FIND_STRUCTURES = 107;
    (global as any).STRUCTURE_CONTAINER = "container";

    // Mock Room.serializePath and Room.deserializePath
    // @ts-ignore: Setting up test environment
    global.Room = {
      serializePath: (path: PathStep[]): string => {
        return JSON.stringify(path);
      },
      deserializePath: (serialized: string): PathStep[] => {
        return JSON.parse(serialized);
      }
    };

    // Mock PathFinder for testing
    (global as any).PathFinder = {
      search: (from: RoomPosition, goal: any, opts?: any) => {
        // Mock successful pathfinding with a simple path
        return {
          path: [
            { x: from.x + 1, y: from.y + 1, dx: 1, dy: 1, direction: 2 },
            { x: from.x + 2, y: from.y + 2, dx: 1, dy: 1, direction: 2 },
            { x: goal.pos.x, y: goal.pos.y, dx: 0, dy: 0, direction: 0 }
          ],
          ops: 50,
          cost: 5,
          incomplete: false
        };
      },
      CostMatrix: class CostMatrix {
        private data: number[][];
        constructor() {
          this.data = Array(50).fill(null).map(() => Array(50).fill(0));
        }
        set(x: number, y: number, value: number): void {
          this.data[y][x] = value;
        }
        get(x: number, y: number): number {
          return this.data[y][x];
        }
      }
    };

    clearPathCache();
  });

  describe("getRemoteMiningPath", () => {
    it("should return null for uncached path", () => {
      const from = new RoomPosition(10, 10, "W1N1");
      const to = new RoomPosition(20, 20, "W2N2");

      const result = getRemoteMiningPath(from, to, "harvester");
      assert.isNull(result);
    });

    it("should return cached path after caching", () => {
      const from = new RoomPosition(10, 10, "W1N1");
      const to = new RoomPosition(20, 20, "W2N2");
      const path: PathStep[] = [
        { x: 11, y: 11, dx: 1, dy: 1, direction: 2 },
        { x: 12, y: 12, dx: 1, dy: 1, direction: 2 },
        { x: 13, y: 13, dx: 1, dy: 1, direction: 2 }
      ];

      cacheRemoteMiningPath(from, to, path, "harvester");
      const result = getRemoteMiningPath(from, to, "harvester");

      assert.isNotNull(result);
      assert.equal(result!.length, 3);
      assert.equal(result![0].x, 11);
      assert.equal(result![0].y, 11);
    });

    it("should cache harvester and hauler routes independently", () => {
      const from = new RoomPosition(10, 10, "W1N1");
      const to = new RoomPosition(20, 20, "W2N2");
      const harvesterPath: PathStep[] = [{ x: 11, y: 11, dx: 1, dy: 1, direction: 2 }];
      const haulerPath: PathStep[] = [{ x: 21, y: 21, dx: 1, dy: 1, direction: 2 }];

      cacheRemoteMiningPath(from, to, harvesterPath, "harvester");
      cacheRemoteMiningPath(from, to, haulerPath, "hauler");

      const harvesterResult = getRemoteMiningPath(from, to, "harvester");
      const haulerResult = getRemoteMiningPath(from, to, "hauler");

      assert.isNotNull(harvesterResult);
      assert.isNotNull(haulerResult);
      assert.equal(harvesterResult![0].x, 11);
      assert.equal(haulerResult![0].x, 21);
    });

    it("should respect TTL and expire paths after 500 ticks", () => {
      const from = new RoomPosition(10, 10, "W1N1");
      const to = new RoomPosition(20, 20, "W2N2");
      const path: PathStep[] = [{ x: 11, y: 11, dx: 1, dy: 1, direction: 2 }];

      cacheRemoteMiningPath(from, to, path, "harvester");

      // Should be available immediately
      let result = getRemoteMiningPath(from, to, "harvester");
      assert.isNotNull(result);

      // Advance time by 400 ticks - should still be available
      // @ts-ignore
      global.Game.time = 1400;
      result = getRemoteMiningPath(from, to, "harvester");
      assert.isNotNull(result);

      // Advance time by 200 more ticks (total 600 from cache) - should be expired
      // @ts-ignore
      global.Game.time = 1600;
      result = getRemoteMiningPath(from, to, "harvester");
      assert.isNull(result);
    });
  });

  describe("precacheRemoteRoutes", () => {
    it("should precache routes from spawn to remote sources", () => {
      const homeRoom = {
        name: "W1N1",
        storage: undefined,
        find: (type: FindConstant) => {
          if (type === (global as any).FIND_MY_SPAWNS) {
            return [{
              pos: new RoomPosition(25, 25, "W1N1")
            }];
          }
          return [];
        }
      } as unknown as Room;

      const remoteRoom = {
        name: "W2N2",
        find: (type: FindConstant) => {
          if (type === (global as any).FIND_SOURCES) {
            return [{
              pos: new RoomPosition(10, 10, "W2N2")
            }];
          }
          if (type === (global as any).FIND_STRUCTURES) {
            return [];
          }
          return [];
        }
      } as unknown as Room;

      // @ts-ignore
      global.Game.rooms = {
        W1N1: homeRoom,
        W2N2: remoteRoom
      };

      precacheRemoteRoutes(homeRoom, ["W2N2"]);

      // Check that a path was cached
      const cachedPath = getRemoteMiningPath(
        new RoomPosition(25, 25, "W1N1"),
        new RoomPosition(10, 10, "W2N2"),
        "harvester"
      );

      assert.isNotNull(cachedPath);
    });

    it("should precache routes from remote containers to home storage", () => {
      const homeRoom = {
        name: "W1N1",
        storage: {
          pos: new RoomPosition(25, 25, "W1N1")
        } as StructureStorage,
        find: (type: FindConstant) => {
          if (type === (global as any).FIND_MY_SPAWNS) {
            return [];
          }
          return [];
        }
      } as unknown as Room;

      const remoteRoom = {
        name: "W2N2",
        find: (type: FindConstant) => {
          if (type === (global as any).FIND_SOURCES) {
            return [{
              pos: new RoomPosition(10, 10, "W2N2")
            }];
          }
          if (type === (global as any).FIND_STRUCTURES) {
            return [{
              structureType: "container",
              pos: new RoomPosition(11, 11, "W2N2")
            }];
          }
          return [];
        }
      } as unknown as Room;

      // @ts-ignore
      global.Game.rooms = {
        W1N1: homeRoom,
        W2N2: remoteRoom
      };

      precacheRemoteRoutes(homeRoom, ["W2N2"]);

      // Check that a path was cached from container to storage
      const cachedPath = getRemoteMiningPath(
        new RoomPosition(11, 11, "W2N2"),
        new RoomPosition(25, 25, "W1N1"),
        "hauler"
      );

      assert.isNotNull(cachedPath);
    });

    it("should handle rooms without visible remote rooms gracefully", () => {
      const homeRoom = {
        name: "W1N1",
        storage: {
          pos: new RoomPosition(25, 25, "W1N1")
        } as StructureStorage,
        find: () => []
      } as unknown as Room;

      // @ts-ignore
      global.Game.rooms = {
        W1N1: homeRoom
        // W2N2 is not visible
      };

      // Should not throw error
      assert.doesNotThrow(() => {
        precacheRemoteRoutes(homeRoom, ["W2N2"]);
      });
    });

    it("should handle rooms without storage or spawns gracefully", () => {
      const homeRoom = {
        name: "W1N1",
        storage: undefined,
        find: () => []
      } as unknown as Room;

      // Should not throw error and should warn about missing storage/spawns
      assert.doesNotThrow(() => {
        precacheRemoteRoutes(homeRoom, ["W2N2"]);
      });
    });
  });
});
