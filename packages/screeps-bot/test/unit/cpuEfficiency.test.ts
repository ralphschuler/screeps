/**
 * Unit tests for CPU efficiency utilities
 */

import { assert } from "chai";
import {
  throttle,
  throttleWithDefault,
  filterWithMemoization,
  chebyshevDistance,
  isWithinRange,
  findClosestByRangeFast,
  sumValues,
  groupBy,
  isLowBucket,
  hasCpuBudget
} from "@ralphschuler/screeps-utils";

// Type for global with Game mock
interface GlobalWithGame {
  Game?: {
    time: number;
    cpu?: {
      bucket: number;
      limit: number;
      getUsed: () => number;
    };
  };
}

describe("CPU Efficiency Utilities", () => {
  beforeEach(() => {
    // Mock Game.time for testing
    (global as GlobalWithGame).Game = { time: 100 };
  });

  afterEach(() => {
    delete (global as GlobalWithGame).Game;
  });

  describe("throttle", () => {
    it("should execute function when tick is at interval", () => {
      (global as GlobalWithGame).Game!.time = 100;
      
      const result = throttle(() => "executed", 10);
      assert.equal(result, "executed");
    });

    it("should return undefined when tick is not at interval", () => {
      (global as GlobalWithGame).Game!.time = 101;
      
      const result = throttle(() => "executed", 10);
      assert.isUndefined(result);
    });

    it("should use offset to spread load", () => {
      (global as GlobalWithGame).Game!.time = 105;
      
      // Without offset: 105 % 10 = 5, won't execute
      const result1 = throttle(() => "executed", 10);
      assert.isUndefined(result1);
      
      // With offset 5: (105 + 5) % 10 = 0, will execute
      const result2 = throttle(() => "executed", 10, 5);
      assert.equal(result2, "executed");
    });

    it("should work with different intervals", () => {
      (global as GlobalWithGame).Game!.time = 120;
      
      assert.isDefined(throttle(() => true, 1)); // Every tick
      assert.isDefined(throttle(() => true, 2)); // 120 % 2 = 0
      assert.isDefined(throttle(() => true, 3)); // 120 % 3 = 0
      assert.isDefined(throttle(() => true, 5)); // 120 % 5 = 0
      assert.isUndefined(throttle(() => true, 7)); // 120 % 7 = 1
    });

    it("should handle interval of 1 (execute every tick)", () => {
      for (let tick = 0; tick < 10; tick++) {
        (global as GlobalWithGame).Game!.time = tick;
        const result = throttle(() => tick, 1);
        assert.equal(result, tick);
      }
    });

    it("should preserve function return value", () => {
      (global as GlobalWithGame).Game!.time = 200;
      
      const objectResult = throttle(() => ({ key: "value" }), 1);
      assert.deepEqual(objectResult, { key: "value" });
      
      const arrayResult = throttle(() => [1, 2, 3], 1);
      assert.deepEqual(arrayResult, [1, 2, 3]);
      
      const numberResult = throttle(() => 42, 1);
      assert.equal(numberResult, 42);
    });
  });

  describe("throttleWithDefault", () => {
    it("should execute function when tick is at interval", () => {
      (global as GlobalWithGame).Game!.time = 100;
      
      const result = throttleWithDefault(() => "executed", 10, "default");
      assert.equal(result, "executed");
    });

    it("should return default value when tick is not at interval", () => {
      (global as GlobalWithGame).Game!.time = 101;
      
      const result = throttleWithDefault(() => "executed", 10, "default");
      assert.equal(result, "default");
    });

    it("should use offset to spread load", () => {
      (global as GlobalWithGame).Game!.time = 105;
      
      const result1 = throttleWithDefault(() => "executed", 10, "default");
      assert.equal(result1, "default");
      
      const result2 = throttleWithDefault(() => "executed", 10, "default", 5);
      assert.equal(result2, "executed");
    });

    it("should handle different default value types", () => {
      (global as GlobalWithGame).Game!.time = 101; // Won't execute (101 % 10 != 0)
      
      const stringResult = throttleWithDefault(() => "executed", 10, "default");
      assert.equal(stringResult, "default");
      
      const numberResult = throttleWithDefault(() => 99, 10, 0);
      assert.equal(numberResult, 0);
      
      const objectResult = throttleWithDefault(() => ({}), 10, { default: true });
      assert.deepEqual(objectResult, { default: true });
      
      const arrayResult = throttleWithDefault(() => [99], 10, []);
      assert.deepEqual(arrayResult, []);
    });

    it("should work with interval of 1", () => {
      for (let tick = 0; tick < 5; tick++) {
        (global as GlobalWithGame).Game!.time = tick;
        const result = throttleWithDefault(() => "executed", 1, "default");
        assert.equal(result, "executed");
      }
    });
  });

  describe("filterWithMemoization", () => {
    it("should filter array using predicate", () => {
      const array = [1, 2, 3, 4, 5];
      const result = filterWithMemoization(
        array,
        x => x,
        x => x % 2 === 0
      );
      
      assert.deepEqual(result, [2, 4]);
    });

    it("should memoize predicate calls for duplicate keys", () => {
      const array = [
        { id: 1, value: "a" },
        { id: 2, value: "b" },
        { id: 1, value: "c" }, // Duplicate id
        { id: 3, value: "d" }
      ];
      
      let predicateCalls = 0;
      const result = filterWithMemoization(
        array,
        item => item.id,
        item => {
          predicateCalls++;
          return item.id % 2 === 1; // Keep odd ids
        }
      );
      
      // Should only call predicate 3 times (for ids 1, 2, 3), not 4
      assert.equal(predicateCalls, 3);
      assert.lengthOf(result, 3); // Items with ids 1, 1, 3
    });

    it("should handle empty array", () => {
      const result = filterWithMemoization(
        [],
        x => x,
        () => true
      );
      
      assert.deepEqual(result, []);
    });

    it("should handle all items failing predicate", () => {
      const array = [1, 2, 3];
      const result = filterWithMemoization(
        array,
        x => x,
        () => false
      );
      
      assert.deepEqual(result, []);
    });

    it("should handle all items passing predicate", () => {
      const array = [1, 2, 3];
      const result = filterWithMemoization(
        array,
        x => x,
        () => true
      );
      
      assert.deepEqual(result, [1, 2, 3]);
    });

    it("should work with complex key functions", () => {
      const array = [
        { type: "A", value: 1 },
        { type: "B", value: 2 },
        { type: "A", value: 3 },
        { type: "C", value: 4 }
      ];
      
      let calls = 0;
      const result = filterWithMemoization(
        array,
        item => item.type,
        item => {
          calls++;
          return item.type === "A" || item.type === "C";
        }
      );
      
      assert.equal(calls, 3); // Called for A, B, C
      assert.lengthOf(result, 3); // Two A's and one C
    });
  });

  describe("chebyshevDistance", () => {
    it("should calculate distance correctly", () => {
      assert.equal(chebyshevDistance(0, 0, 0, 0), 0);
      assert.equal(chebyshevDistance(0, 0, 3, 4), 4);
      assert.equal(chebyshevDistance(5, 5, 10, 10), 5);
      assert.equal(chebyshevDistance(10, 10, 5, 5), 5);
    });

    it("should handle horizontal movement", () => {
      assert.equal(chebyshevDistance(0, 0, 5, 0), 5);
      assert.equal(chebyshevDistance(5, 0, 0, 0), 5);
    });

    it("should handle vertical movement", () => {
      assert.equal(chebyshevDistance(0, 0, 0, 5), 5);
      assert.equal(chebyshevDistance(0, 5, 0, 0), 5);
    });

    it("should handle diagonal movement", () => {
      // Diagonal: max of 3 and 3 = 3
      assert.equal(chebyshevDistance(0, 0, 3, 3), 3);
      assert.equal(chebyshevDistance(10, 10, 7, 7), 3);
    });

    it("should handle negative coordinates", () => {
      assert.equal(chebyshevDistance(-5, -5, 5, 5), 10);
      assert.equal(chebyshevDistance(5, 5, -5, -5), 10);
      assert.equal(chebyshevDistance(-10, -10, -5, -5), 5);
    });

    it("should be symmetric", () => {
      const d1 = chebyshevDistance(1, 2, 5, 8);
      const d2 = chebyshevDistance(5, 8, 1, 2);
      assert.equal(d1, d2);
    });

    it("should match Screeps getRangeTo semantics", () => {
      // In Screeps, range is the max of |dx| and |dy|
      // Point (0,0) to (3,4): max(3,4) = 4
      assert.equal(chebyshevDistance(0, 0, 3, 4), 4);
      
      // Point (10,10) to (15,12): max(5,2) = 5
      assert.equal(chebyshevDistance(10, 10, 15, 12), 5);
    });
  });

  describe("isWithinRange", () => {
    it("should return true when positions are within range", () => {
      assert.isTrue(isWithinRange(0, 0, 0, 0, 0)); // Same position
      assert.isTrue(isWithinRange(0, 0, 1, 1, 1)); // Adjacent diagonal
      assert.isTrue(isWithinRange(0, 0, 3, 4, 5)); // Within range 5
    });

    it("should return false when positions are out of range", () => {
      assert.isFalse(isWithinRange(0, 0, 5, 5, 4)); // Range 5 > limit 4
      assert.isFalse(isWithinRange(0, 0, 10, 0, 9)); // Horizontal, range 10 > limit 9
      assert.isFalse(isWithinRange(0, 0, 0, 10, 9)); // Vertical, range 10 > limit 9
    });

    it("should handle exact range match", () => {
      assert.isTrue(isWithinRange(0, 0, 5, 5, 5)); // Exactly at range 5
      assert.isTrue(isWithinRange(10, 10, 20, 20, 10)); // Exactly at range 10
    });

    it("should handle range 0 (same position only)", () => {
      assert.isTrue(isWithinRange(5, 5, 5, 5, 0));
      assert.isFalse(isWithinRange(5, 5, 6, 5, 0));
      assert.isFalse(isWithinRange(5, 5, 5, 6, 0));
    });

    it("should handle range 1 (adjacent positions)", () => {
      // All 8 adjacent positions
      assert.isTrue(isWithinRange(5, 5, 4, 5, 1)); // Left
      assert.isTrue(isWithinRange(5, 5, 6, 5, 1)); // Right
      assert.isTrue(isWithinRange(5, 5, 5, 4, 1)); // Top
      assert.isTrue(isWithinRange(5, 5, 5, 6, 1)); // Bottom
      assert.isTrue(isWithinRange(5, 5, 4, 4, 1)); // Top-left
      assert.isTrue(isWithinRange(5, 5, 6, 4, 1)); // Top-right
      assert.isTrue(isWithinRange(5, 5, 4, 6, 1)); // Bottom-left
      assert.isTrue(isWithinRange(5, 5, 6, 6, 1)); // Bottom-right
      
      // Not adjacent
      assert.isFalse(isWithinRange(5, 5, 3, 5, 1));
      assert.isFalse(isWithinRange(5, 5, 7, 5, 1));
    });

    it("should handle negative coordinates", () => {
      assert.isTrue(isWithinRange(-5, -5, 0, 0, 5));
      assert.isTrue(isWithinRange(5, 5, -5, -5, 10));
      assert.isFalse(isWithinRange(-10, -10, 10, 10, 19));
    });

    it("should be symmetric", () => {
      const r1 = isWithinRange(1, 2, 5, 8, 6);
      const r2 = isWithinRange(5, 8, 1, 2, 6);
      assert.equal(r1, r2);
    });

    it("should be consistent with chebyshevDistance", () => {
      // If chebyshevDistance <= range, isWithinRange should be true
      const x1 = 10, y1 = 15, x2 = 13, y2 = 20;
      const distance = chebyshevDistance(x1, y1, x2, y2);
      
      assert.isTrue(isWithinRange(x1, y1, x2, y2, distance));
      assert.isTrue(isWithinRange(x1, y1, x2, y2, distance + 1));
      assert.isFalse(isWithinRange(x1, y1, x2, y2, distance - 1));
    });
  });

  describe("findClosestByRangeFast", () => {
    const createMockPos = (x: number, y: number, roomName = "W1N1"): RoomPosition => ({
      x, y, roomName
    } as RoomPosition);

    it("should return null for empty array", () => {
      const pos = createMockPos(25, 25);
      const result = findClosestByRangeFast(pos, []);
      assert.isNull(result);
    });

    it("should find closest item in same room", () => {
      const pos = createMockPos(25, 25);
      const items = [
        { id: "1", pos: createMockPos(30, 30) },
        { id: "2", pos: createMockPos(20, 20) },
        { id: "3", pos: createMockPos(40, 40) }
      ];
      
      const closest = findClosestByRangeFast(pos, items);
      assert.equal(closest?.id, "2"); // (20,20) is closest
    });

    it("should skip items in different rooms", () => {
      const pos = createMockPos(25, 25, "W1N1");
      const items = [
        { id: "1", pos: createMockPos(26, 26, "W2N2") },
        { id: "2", pos: createMockPos(30, 30, "W1N1") }
      ];
      
      const closest = findClosestByRangeFast(pos, items);
      assert.equal(closest?.id, "2"); // Only item in same room
    });

    it("should return null when all items are in different rooms", () => {
      const pos = createMockPos(25, 25, "W1N1");
      const items = [
        { id: "1", pos: createMockPos(26, 26, "W2N2") },
        { id: "2", pos: createMockPos(30, 30, "E1S1") }
      ];
      
      const closest = findClosestByRangeFast(pos, items);
      assert.isNull(closest);
    });

    it("should handle tie by returning first found", () => {
      const pos = createMockPos(25, 25);
      const items = [
        { id: "1", pos: createMockPos(20, 20) }, // Distance 5
        { id: "2", pos: createMockPos(30, 30) }, // Distance 5
        { id: "3", pos: createMockPos(20, 30) }  // Distance 5
      ];
      
      const closest = findClosestByRangeFast(pos, items);
      assert.equal(closest?.id, "1"); // First item at minimum distance
    });
  });

  describe("sumValues", () => {
    it("should sum numeric values", () => {
      const array = [1, 2, 3, 4, 5];
      const sum = sumValues(array, x => x);
      assert.equal(sum, 15);
    });

    it("should sum extracted values from objects", () => {
      const array = [
        { value: 10 },
        { value: 20 },
        { value: 30 }
      ];
      const sum = sumValues(array, obj => obj.value);
      assert.equal(sum, 60);
    });

    it("should return 0 for empty array", () => {
      const sum = sumValues([], x => x);
      assert.equal(sum, 0);
    });

    it("should handle negative values", () => {
      const array = [10, -5, 3, -2];
      const sum = sumValues(array, x => x);
      assert.equal(sum, 6);
    });

    it("should handle floating point values", () => {
      const array = [1.5, 2.3, 3.7];
      const sum = sumValues(array, x => x);
      assert.approximately(sum, 7.5, 0.0001);
    });

    it("should work with complex extraction logic", () => {
      const array = [
        { items: [1, 2, 3] },
        { items: [4, 5] },
        { items: [6] }
      ];
      const sum = sumValues(array, obj => obj.items.length);
      assert.equal(sum, 6); // 3 + 2 + 1
    });
  });

  describe("groupBy", () => {
    it("should group items by key", () => {
      const array = [
        { type: "A", value: 1 },
        { type: "B", value: 2 },
        { type: "A", value: 3 },
        { type: "C", value: 4 }
      ];
      
      const groups = groupBy(array, item => item.type);
      
      assert.equal(groups.size, 3);
      assert.lengthOf(groups.get("A")!, 2);
      assert.lengthOf(groups.get("B")!, 1);
      assert.lengthOf(groups.get("C")!, 1);
    });

    it("should handle empty array", () => {
      const groups = groupBy([], x => x);
      assert.equal(groups.size, 0);
    });

    it("should handle all items in same group", () => {
      const array = [1, 2, 3, 4];
      const groups = groupBy(array, () => "same");
      
      assert.equal(groups.size, 1);
      assert.lengthOf(groups.get("same")!, 4);
    });

    it("should handle all items in different groups", () => {
      const array = [1, 2, 3];
      const groups = groupBy(array, x => x);
      
      assert.equal(groups.size, 3);
      assert.lengthOf(groups.get(1)!, 1);
      assert.lengthOf(groups.get(2)!, 1);
      assert.lengthOf(groups.get(3)!, 1);
    });

    it("should work with numeric keys", () => {
      const array = ["a", "bb", "ccc", "dd", "e"];
      const groups = groupBy(array, s => s.length);
      
      assert.equal(groups.size, 3);
      assert.deepEqual(groups.get(1), ["a", "e"]);
      assert.deepEqual(groups.get(2), ["bb", "dd"]);
      assert.deepEqual(groups.get(3), ["ccc"]);
    });
  });

  describe("isLowBucket", () => {
    beforeEach(() => {
      (global as GlobalWithGame).Game = {
        time: 100,
        cpu: { bucket: 5000, limit: 100, getUsed: () => 0 }
      };
    });

    it("should return false when bucket is above default threshold", () => {
      (global as GlobalWithGame).Game!.cpu.bucket = 5000;
      assert.isFalse(isLowBucket());
    });

    it("should return true when bucket is below default threshold", () => {
      (global as GlobalWithGame).Game!.cpu.bucket = 1000;
      assert.isTrue(isLowBucket());
    });

    it("should use custom threshold", () => {
      (global as GlobalWithGame).Game!.cpu.bucket = 3000;
      
      assert.isFalse(isLowBucket(2000)); // 3000 > 2000
      assert.isTrue(isLowBucket(4000));  // 3000 < 4000
    });

    it("should handle bucket exactly at threshold", () => {
      (global as GlobalWithGame).Game!.cpu.bucket = 2000;
      assert.isFalse(isLowBucket(2000)); // Not below, equal
    });
  });

  describe("hasCpuBudget", () => {
    beforeEach(() => {
      (global as GlobalWithGame).Game = {
        time: 100,
        cpu: {
          bucket: 10000,
          limit: 100,
          getUsed: () => 50
        }
      };
    });

    it("should return true when enough CPU remaining", () => {
      (global as GlobalWithGame).Game!.cpu.getUsed = () => 50;
      (global as GlobalWithGame).Game!.cpu.limit = 100;
      
      // Used: 50, Limit: 100 * 0.8 = 80, Remaining: 30
      assert.isTrue(hasCpuBudget(20)); // Need 20, have 30
    });

    it("should return false when not enough CPU remaining", () => {
      (global as GlobalWithGame).Game!.cpu.getUsed = () => 70;
      (global as GlobalWithGame).Game!.cpu.limit = 100;
      
      // Used: 70, Limit: 100 * 0.8 = 80, Remaining: 10
      assert.isFalse(hasCpuBudget(20)); // Need 20, have 10
    });

    it("should use custom target usage", () => {
      (global as GlobalWithGame).Game!.cpu.getUsed = () => 60;
      (global as GlobalWithGame).Game!.cpu.limit = 100;
      
      // With 0.9: Used 60, Limit 90, Remaining 30
      assert.isTrue(hasCpuBudget(20, 0.9));
      
      // With 0.7: Used 60, Limit 70, Remaining 10
      assert.isFalse(hasCpuBudget(20, 0.7));
    });

    it("should default to no minimum CPU needed", () => {
      (global as GlobalWithGame).Game!.cpu.getUsed = () => 79;
      (global as GlobalWithGame).Game!.cpu.limit = 100;
      
      // Used: 79, Limit: 80, Remaining: 1
      assert.isTrue(hasCpuBudget()); // Default minCpuNeeded = 0
    });

    it("should handle edge case of exactly at limit", () => {
      (global as GlobalWithGame).Game!.cpu.getUsed = () => 80;
      (global as GlobalWithGame).Game!.cpu.limit = 100;
      
      // Used: 80, Limit: 80, Remaining: 0
      assert.isTrue(hasCpuBudget(0)); // Exactly 0 remaining
      assert.isFalse(hasCpuBudget(1)); // Need 1, have 0
    });
  });

  describe("Integration scenarios", () => {
    it("should use throttle with distance calculations", () => {
      (global as GlobalWithGame).Game!.time = 100;
      
      // Only calculate distance every 10 ticks
      const result = throttle(() => {
        return chebyshevDistance(0, 0, 25, 25);
      }, 10);
      
      assert.equal(result, 25);
    });

    it("should combine isWithinRange with filterWithMemoization", () => {
      const positions = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 5, y: 5 },
        { x: 10, y: 10 }
      ];
      
      const origin = { x: 0, y: 0 };
      const maxRange = 5;
      
      const nearby = filterWithMemoization(
        positions,
        pos => `${pos.x},${pos.y}`,
        pos => isWithinRange(origin.x, origin.y, pos.x, pos.y, maxRange)
      );
      
      assert.lengthOf(nearby, 3); // First 3 positions are within range 5
    });

    it("should use groupBy with sumValues", () => {
      const items = [
        { type: "energy", amount: 100 },
        { type: "mineral", amount: 50 },
        { type: "energy", amount: 200 },
        { type: "mineral", amount: 30 }
      ];
      
      const groups = groupBy(items, item => item.type);
      const energyTotal = sumValues(groups.get("energy")!, item => item.amount);
      const mineralTotal = sumValues(groups.get("mineral")!, item => item.amount);
      
      assert.equal(energyTotal, 300);
      assert.equal(mineralTotal, 80);
    });
  });
});
