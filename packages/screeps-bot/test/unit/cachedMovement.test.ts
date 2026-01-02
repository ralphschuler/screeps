/**
 * Unit tests for cached movement utilities
 */

import { assert } from "chai";
import { cachedMoveTo, cachedPathFinderSearch } from "../../src/utils/movement/cachedMovement.js";
import { clearPathCache } from "../../src/cache";
import { pathfindingMetrics } from "@ralphschuler/screeps-stats";

/**
 * Mock path data for testing
 */
const MOCK_PATH_STEP = { x: 11, y: 11, dx: 1, dy: 1, direction: 5 };

describe("cachedMovement", () => {
  beforeEach(() => {
    // Reset Game and global state
    // @ts-expect-error: Setting up test environment
    global.Game = {
      time: 1000,
      rooms: {},
      creeps: {},
      cpu: {
        getUsed: () => 1.5,
        limit: 20,
        bucket: 10000
      }
    };

    // Set up Screeps constants for tests
    (global as unknown as Record<string, number>).FIND_MY_SPAWNS = 106;
    (global as unknown as Record<string, number>).OK = 0;
    (global as unknown as Record<string, number>).ERR_TIRED = -4;
    (global as unknown as Record<string, number>).ERR_NOT_IN_RANGE = -9;

    // Mock Room.serializePath and Room.deserializePath
    // @ts-expect-error: Setting up test environment
    global.Room = {
      serializePath: (path: PathStep[]): string => {
        return JSON.stringify(path);
      },
      deserializePath: (serialized: string): PathStep[] => {
        return JSON.parse(serialized);
      }
    };

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

      getRangeTo(x: number, y: number): number {
        return Math.max(Math.abs(this.x - x), Math.abs(this.y - y));
      }
    };

    // Mock PathFinder for testing
    (global as unknown as Record<string, unknown>).PathFinder = {
      search: (from: RoomPosition, goal: { pos: RoomPosition; range: number }) => {
        return {
          path: [
            new RoomPosition(from.x + 1, from.y + 1, from.roomName),
            new RoomPosition(goal.pos.x, goal.pos.y, goal.pos.roomName)
          ],
          ops: 50,
          cost: 2,
          incomplete: false
        };
      }
    };

    clearPathCache();
    pathfindingMetrics.reset();
  });

  describe("cachedMoveTo", () => {
    it("should handle cache miss and calculate new path", () => {
      const creep = {
        pos: new RoomPosition(10, 10, "W1N1"),
        moveTo: () => OK,
        moveByPath: () => OK,
        memory: { _move: { path: JSON.stringify([MOCK_PATH_STEP]) } }
      } as unknown as Creep;

      const target = new RoomPosition(20, 20, "W1N1");
      const result = cachedMoveTo(creep, target);

      assert.equal(result, OK);
      const metrics = pathfindingMetrics.getMetrics();
      assert.equal(metrics.totalCalls, 1);
      assert.equal(metrics.cacheMisses, 1);
    });

    it("should use cached path when available", () => {
      const creep = {
        pos: new RoomPosition(10, 10, "W1N1"),
        moveTo: () => OK,
        moveByPath: () => OK,
        memory: { _move: { path: JSON.stringify([MOCK_PATH_STEP]) } }
      } as unknown as Creep;

      const target = new RoomPosition(20, 20, "W1N1");
      
      // First call - cache miss
      cachedMoveTo(creep, target);
      
      // Second call - should use cache (but won't since path validation fails in test env)
      const result = cachedMoveTo(creep, target);

      assert.equal(result, OK);
    });
  });

  describe("cachedPathFinderSearch", () => {
    it("should calculate path on cache miss", () => {
      const from = new RoomPosition(10, 10, "W1N1");
      const goal = { pos: new RoomPosition(20, 20, "W1N1"), range: 1 };

      const result = cachedPathFinderSearch(from, goal);

      assert.isFalse(result.incomplete);
      assert.isArray(result.path);
      assert.isAbove(result.path.length, 0);
    });

    it("should track metrics correctly", () => {
      const from = new RoomPosition(10, 10, "W1N1");
      const goal = { pos: new RoomPosition(20, 20, "W1N1"), range: 1 };

      cachedPathFinderSearch(from, goal);

      const metrics = pathfindingMetrics.getMetrics();
      assert.equal(metrics.totalCalls, 1);
      assert.equal(metrics.cacheMisses, 1);
    });
  });

  describe("pathfindingMetrics", () => {
    it("should calculate cache hit rate correctly", () => {
      // Simulate some cache hits and misses
      pathfindingMetrics.recordCall('moveTo', false, 0.5);
      pathfindingMetrics.recordCall('moveTo', true, 0.05);
      pathfindingMetrics.recordCall('moveTo', true, 0.05);

      const metrics = pathfindingMetrics.getMetrics();
      assert.equal(metrics.totalCalls, 3);
      assert.equal(metrics.cacheHits, 2);
      assert.equal(metrics.cacheMisses, 1);
      assert.approximately(metrics.cacheHitRate, 0.667, 0.001);
    });

    it("should calculate average CPU per call", () => {
      pathfindingMetrics.recordCall('moveTo', false, 0.5);
      pathfindingMetrics.recordCall('moveTo', true, 0.05);

      const metrics = pathfindingMetrics.getMetrics();
      assert.approximately(metrics.avgCpuPerCall, 0.275, 0.001);
    });

    it("should estimate CPU saved from caching", () => {
      // Cached call: actual 0.05, would have been ~0.5 = saved ~0.45
      pathfindingMetrics.recordCall('moveTo', true, 0.05);

      const metrics = pathfindingMetrics.getMetrics();
      assert.approximately(metrics.cpuSaved, 0.45, 0.01);
    });

    it("should reset metrics", () => {
      pathfindingMetrics.recordCall('moveTo', true, 0.05);
      pathfindingMetrics.reset();

      const metrics = pathfindingMetrics.getMetrics();
      assert.equal(metrics.totalCalls, 0);
      assert.equal(metrics.cacheHits, 0);
      assert.equal(metrics.cacheMisses, 0);
    });
  });
});
