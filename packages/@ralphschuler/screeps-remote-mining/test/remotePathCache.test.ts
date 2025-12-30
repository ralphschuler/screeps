/**
 * Unit tests for RemotePathCache
 */

import { assert } from "chai";
import { RemotePathCache } from "../src/paths/remotePathCache";
import type { IPathCache, ILogger } from "../src/types";

// Screeps constants
const TOP = 1;
const TOP_RIGHT = 2;
const RIGHT = 3;
const BOTTOM_RIGHT = 4;
const BOTTOM = 5;
const BOTTOM_LEFT = 6;
const LEFT = 7;
const TOP_LEFT = 8;

// Mock implementations for testing
class MockPathCache implements IPathCache {
  private cache = new Map<string, { path: PathStep[]; expires: number }>();

  private makeKey(from: RoomPosition, to: RoomPosition): string {
    return `${from.roomName}:${from.x},${from.y}->${to.roomName}:${to.x},${to.y}`;
  }

  getCachedPath(from: RoomPosition, to: RoomPosition): PathStep[] | null {
    const key = this.makeKey(from, to);
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Game.time >= entry.expires) {
      this.cache.delete(key);
      return null;
    }
    return entry.path;
  }

  cachePath(from: RoomPosition, to: RoomPosition, path: PathStep[], options?: { ttl?: number }): void {
    const key = this.makeKey(from, to);
    this.cache.set(key, {
      path,
      expires: Game.time + (options?.ttl || 100)
    });
  }

  convertRoomPositionsToPathSteps(positions: RoomPosition[]): PathStep[] {
    return positions.map((p, i) => {
      const prev = i > 0 ? positions[i - 1] : null;
      let dx = 0;
      let dy = 0;
      let direction: DirectionConstant = TOP;
      
      if (prev && prev.roomName === p.roomName) {
        dx = p.x - prev.x;
        dy = p.y - prev.y;
        // Simple direction calculation
        if (dy === -1 && dx === 0) direction = TOP;
        else if (dy === -1 && dx === 1) direction = TOP_RIGHT;
        else if (dy === 0 && dx === 1) direction = RIGHT;
        else if (dy === 1 && dx === 1) direction = BOTTOM_RIGHT;
        else if (dy === 1 && dx === 0) direction = BOTTOM;
        else if (dy === 1 && dx === -1) direction = BOTTOM_LEFT;
        else if (dy === 0 && dx === -1) direction = LEFT;
        else if (dy === -1 && dx === -1) direction = TOP_LEFT;
      }
      
      return { x: p.x, y: p.y, dx, dy, direction };
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

class MockLogger implements ILogger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
}

describe("RemotePathCache", () => {
  let pathCache: MockPathCache;
  let logger: MockLogger;
  let remotePathCache: RemotePathCache;

  beforeEach(() => {
    // Reset Game and global state
    // @ts-expect-error: Setting up test environment
    global.Game = {
      time: 1000,
      rooms: {}
    };

    // Set up Screeps constants for tests
    (global as unknown as Record<string, number>).FIND_SOURCES = 105;
    (global as unknown as Record<string, number>).FIND_STRUCTURES = 107;
    (global as unknown as Record<string, number>).FIND_MY_SPAWNS = 106;
    (global as unknown as Record<string, string>).STRUCTURE_CONTAINER = "container";

    // Mock RoomPosition
    // @ts-expect-error: Setting up test environment
    global.RoomPosition = class RoomPosition {
      x: number;
      y: number;
      roomName: string;
      
      constructor(x: number, y: number, roomName: string) {
        this.x = x;
        this.y = y;
        this.roomName = roomName;
      }
    };

    // Mock PathFinder for testing
    (global as unknown as Record<string, unknown>).PathFinder = {
      search: (from: RoomPosition, goal: { pos: RoomPosition; range: number }) => {
        // Mock successful pathfinding with a simple path
        return {
          path: [
            new RoomPosition(from.x + 1, from.y + 1, from.roomName),
            new RoomPosition(from.x + 2, from.y + 2, from.roomName),
            new RoomPosition(goal.pos.x, goal.pos.y, goal.pos.roomName)
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

    pathCache = new MockPathCache();
    logger = new MockLogger();
    remotePathCache = new RemotePathCache(pathCache, logger);
  });

  describe("getRemoteMiningPath", () => {
    it("should return null for uncached path", () => {
      const from = new RoomPosition(10, 10, "W1N1");
      const to = new RoomPosition(20, 20, "W2N2");

      const result = remotePathCache.getRemoteMiningPath(from, to, "harvester");
      assert.isNull(result);
    });

    it("should return cached path after caching", () => {
      const from = new RoomPosition(10, 10, "W1N1");
      const to = new RoomPosition(20, 20, "W2N2");
      const path: PathStep[] = [
        { x: 11, y: 11, dx: 1, dy: 1, direction: BOTTOM_RIGHT },
        { x: 12, y: 12, dx: 1, dy: 1, direction: BOTTOM_RIGHT },
        { x: 13, y: 13, dx: 1, dy: 1, direction: BOTTOM_RIGHT }
      ];

      remotePathCache.cacheRemoteMiningPath(from, to, path, "harvester");
      const result = remotePathCache.getRemoteMiningPath(from, to, "harvester");

      assert.isNotNull(result);
      assert.equal(result!.length, 3);
      assert.equal(result![0].x, 11);
      assert.equal(result![0].y, 11);
    });

    it("should respect TTL and expire paths after 500 ticks", () => {
      const from = new RoomPosition(10, 10, "W1N1");
      const to = new RoomPosition(20, 20, "W2N2");
      const path: PathStep[] = [{ x: 11, y: 11, dx: 1, dy: 1, direction: BOTTOM_RIGHT }];

      remotePathCache.cacheRemoteMiningPath(from, to, path, "harvester");

      // Should be available immediately
      let result = remotePathCache.getRemoteMiningPath(from, to, "harvester");
      assert.isNotNull(result);

      // Advance time by 400 ticks - should still be available
      // @ts-expect-error: Setting up test environment
      global.Game.time = 1400;
      result = remotePathCache.getRemoteMiningPath(from, to, "harvester");
      assert.isNotNull(result);

      // Advance time by 200 more ticks (total 600 from cache) - should be expired
      // @ts-expect-error: Setting up test environment
      global.Game.time = 1600;
      result = remotePathCache.getRemoteMiningPath(from, to, "harvester");
      assert.isNull(result);
    });
  });

  describe("precacheRemoteRoutes", () => {
    it("should precache routes from spawn to remote sources", () => {
      const homeRoom = {
        name: "W1N1",
        storage: undefined,
        find: (type: FindConstant) => {
          if (type === (global as unknown as Record<string, number>).FIND_MY_SPAWNS) {
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
          if (type === (global as unknown as Record<string, number>).FIND_SOURCES) {
            return [{
              pos: new RoomPosition(10, 10, "W2N2")
            }];
          }
          if (type === (global as unknown as Record<string, number>).FIND_STRUCTURES) {
            return [];
          }
          return [];
        }
      } as unknown as Room;

      // @ts-expect-error: Setting up test environment
      global.Game.rooms = {
        W1N1: homeRoom,
        W2N2: remoteRoom
      };

      remotePathCache.precacheRemoteRoutes(homeRoom, ["W2N2"]);

      // Check that a path was cached
      const cachedPath = remotePathCache.getRemoteMiningPath(
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
          if (type === (global as unknown as Record<string, number>).FIND_MY_SPAWNS) {
            return [];
          }
          return [];
        }
      } as unknown as Room;

      const remoteRoom = {
        name: "W2N2",
        find: (type: FindConstant) => {
          if (type === (global as unknown as Record<string, number>).FIND_SOURCES) {
            return [{
              pos: new RoomPosition(10, 10, "W2N2")
            }];
          }
          if (type === (global as unknown as Record<string, number>).FIND_STRUCTURES) {
            return [{
              structureType: "container",
              pos: new RoomPosition(11, 11, "W2N2")
            }];
          }
          return [];
        }
      } as unknown as Room;

      // @ts-expect-error: Setting up test environment
      global.Game.rooms = {
        W1N1: homeRoom,
        W2N2: remoteRoom
      };

      remotePathCache.precacheRemoteRoutes(homeRoom, ["W2N2"]);

      // Check that a path was cached from container to storage
      const cachedPath = remotePathCache.getRemoteMiningPath(
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

      // @ts-expect-error: Setting up test environment
      global.Game.rooms = {
        W1N1: homeRoom
        // W2N2 is not visible
      };

      // Should not throw error
      assert.doesNotThrow(() => {
        remotePathCache.precacheRemoteRoutes(homeRoom, ["W2N2"]);
      });
    });

    it("should handle rooms without storage or spawns gracefully", () => {
      const homeRoom = {
        name: "W1N1",
        storage: undefined,
        find: () => []
      } as unknown as Room;

      // Should not throw error
      assert.doesNotThrow(() => {
        remotePathCache.precacheRemoteRoutes(homeRoom, ["W2N2"]);
      });
    });
  });

  describe("getOrCalculateRemotePath", () => {
    it("should return cached path if available", () => {
      const from = new RoomPosition(10, 10, "W1N1");
      const to = new RoomPosition(20, 20, "W2N2");
      const path: PathStep[] = [{ x: 11, y: 11, dx: 1, dy: 1, direction: BOTTOM_RIGHT }];

      remotePathCache.cacheRemoteMiningPath(from, to, path, "harvester");
      const result = remotePathCache.getOrCalculateRemotePath(from, to, "harvester");

      assert.isNotNull(result);
      assert.equal(result![0].x, 11);
    });

    it("should calculate new path if not cached", () => {
      const from = new RoomPosition(10, 10, "W1N1");
      const to = new RoomPosition(20, 20, "W2N2");

      const result = remotePathCache.getOrCalculateRemotePath(from, to, "harvester");

      assert.isNotNull(result);
      assert.isTrue(result!.length > 0);
    });

    it("should cache calculated paths", () => {
      const from = new RoomPosition(10, 10, "W1N1");
      const to = new RoomPosition(20, 20, "W2N2");

      // First call calculates
      remotePathCache.getOrCalculateRemotePath(from, to, "harvester");

      // Second call should use cache
      const cached = remotePathCache.getRemoteMiningPath(from, to, "harvester");
      assert.isNotNull(cached);
    });
  });
});
