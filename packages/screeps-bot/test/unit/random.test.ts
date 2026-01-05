/**
 * Unit tests for deterministic random utilities
 */

import { assert } from "chai";
import {
  random,
  randomInt,
  shuffle,
  pick,
  createSeededRandom,
  resetRandom
} from "@ralphschuler/screeps-utils";

// Type for global with Game mock
interface GlobalWithGame {
  Game?: { time: number };
}

describe("Deterministic Random Utilities", () => {
  beforeEach(() => {
    // Reset random state before each test
    resetRandom();
  });

  describe("random", () => {
    it("should return a number between 0 and 1", () => {
      const value = random();
      assert.isNumber(value);
      assert.isAtLeast(value, 0);
      assert.isBelow(value, 1);
    });

    it("should return the same sequence for the same tick", () => {
      // Mock Game.time to be consistent
      (global as GlobalWithGame).Game = { time: 100 };
      
      const value1 = random();
      resetRandom(); // Reset to ensure we use the same tick seed
      const value2 = random();
      
      assert.equal(value1, value2, "Should return same value for same tick");
    });
  });

  describe("randomInt", () => {
    it("should return an integer within range [min, max)", () => {
      const value = randomInt(5, 10);
      assert.isNumber(value);
      assert.isAtLeast(value, 5);
      assert.isBelow(value, 10);
      assert.equal(Math.floor(value), value, "Should be an integer");
    });

    it("should handle single value range", () => {
      const value = randomInt(5, 6);
      assert.equal(value, 5);
    });

    it("should handle negative ranges", () => {
      const value = randomInt(-10, -5);
      assert.isAtLeast(value, -10);
      assert.isBelow(value, -5);
    });

    it("should return min when min equals max", () => {
      const value = randomInt(5, 5);
      assert.equal(value, 5);
    });
  });

  describe("shuffle", () => {
    it("should shuffle an array", () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffle(original);
      
      assert.lengthOf(shuffled, original.length);
      assert.notStrictEqual(shuffled, original, "Should return new array");
      
      // All elements should be present
      for (const item of original) {
        assert.include(shuffled, item);
      }
    });

    it("should not modify the original array", () => {
      const original = [1, 2, 3];
      const copy = [...original];
      shuffle(original);
      
      assert.deepEqual(original, copy);
    });

    it("should handle empty array", () => {
      const result = shuffle([]);
      assert.lengthOf(result, 0);
    });

    it("should handle single element array", () => {
      const result = shuffle([42]);
      assert.deepEqual(result, [42]);
    });

    it("should produce deterministic shuffles for same tick", () => {
      (global as GlobalWithGame).Game = { time: 100 };
      
      const arr = [1, 2, 3, 4, 5];
      const shuffled1 = shuffle(arr);
      resetRandom();
      const shuffled2 = shuffle(arr);
      
      assert.deepEqual(shuffled1, shuffled2);
    });
  });

  describe("pick", () => {
    it("should pick an element from array", () => {
      const arr = [10, 20, 30, 40, 50];
      const picked = pick(arr);
      
      assert.isDefined(picked);
      assert.include(arr, picked!);
    });

    it("should return undefined for empty array", () => {
      const picked = pick([]);
      assert.isUndefined(picked);
    });

    it("should return the only element for single-element array", () => {
      const picked = pick([42]);
      assert.equal(picked, 42);
    });

    it("should produce deterministic picks for same tick", () => {
      (global as GlobalWithGame).Game = { time: 100 };
      
      const arr = [1, 2, 3, 4, 5];
      const picked1 = pick(arr);
      resetRandom();
      const picked2 = pick(arr);
      
      assert.equal(picked1, picked2);
    });
  });

  describe("createSeededRandom", () => {
    it("should create a random instance with custom seed", () => {
      const rng = createSeededRandom(12345);
      
      assert.isDefined(rng.next);
      assert.isDefined(rng.nextInt);
    });

    it("should produce consistent values with same seed", () => {
      const rng1 = createSeededRandom(12345);
      const rng2 = createSeededRandom(12345);
      
      assert.equal(rng1.next(), rng2.next());
      assert.equal(rng1.next(), rng2.next());
    });

    it("should produce different values with different seeds", () => {
      const rng1 = createSeededRandom(12345);
      const rng2 = createSeededRandom(54321);
      
      assert.notEqual(rng1.next(), rng2.next());
    });

    it("should generate integers in range", () => {
      const rng = createSeededRandom(12345);
      const value = rng.nextInt(10, 20);
      
      assert.isAtLeast(value, 10);
      assert.isBelow(value, 20);
    });

    it("should be independent from global random", () => {
      (global as GlobalWithGame).Game = { time: 100 };
      
      const globalVal1 = random();
      const rng = createSeededRandom(99999);
      const seededVal = rng.next();
      const globalVal2 = random();
      
      // Global random should continue its sequence
      assert.notEqual(globalVal1, seededVal);
      assert.notEqual(globalVal2, seededVal);
    });
  });

  describe("resetRandom", () => {
    it("should reset the global random state", () => {
      (global as GlobalWithGame).Game = { time: 100 };
      
      const value1 = random();
      resetRandom();
      const value2 = random();
      
      // After reset with same tick, should get same value
      assert.equal(value1, value2);
    });
  });

  describe("Edge cases", () => {
    it("should handle Game not being defined", () => {
      delete (global as GlobalWithGame).Game;
      
      // Should not throw
      const value = random();
      assert.isNumber(value);
    });

    it("should handle very large tick values", () => {
      (global as GlobalWithGame).Game = { time: 999999999 };
      
      const value = random();
      assert.isNumber(value);
      assert.isAtLeast(value, 0);
      assert.isBelow(value, 1);
    });

    it("should handle zero tick", () => {
      (global as GlobalWithGame).Game = { time: 0 };
      
      const value = random();
      assert.isNumber(value);
    });

    it("should handle negative ranges gracefully in randomInt", () => {
      const value = randomInt(-100, -50);
      assert.isAtLeast(value, -100);
      assert.isBelow(value, -50);
    });

    it("should handle pick with different data types", () => {
      const numberArray = [1, 2, 3, 4, 5];
      const pickedNumber = pick(numberArray);
      assert.isDefined(pickedNumber);
      
      const stringArray = ["a", "b", "c"];
      const pickedString = pick(stringArray);
      assert.isDefined(pickedString);
      
      const objectArray = [{ id: 1 }, { id: 2 }];
      const pickedObject = pick(objectArray);
      assert.isDefined(pickedObject);
    });

    it("should shuffle array with duplicate elements", () => {
      const arr = [1, 1, 2, 2, 3, 3];
      const shuffled = shuffle(arr);
      
      assert.lengthOf(shuffled, 6);
      // Count occurrences
      const count = (arr: number[], val: number) => arr.filter(x => x === val).length;
      assert.equal(count(shuffled, 1), 2);
      assert.equal(count(shuffled, 2), 2);
      assert.equal(count(shuffled, 3), 2);
    });

    it("should handle createSeededRandom with zero seed", () => {
      const rng = createSeededRandom(0);
      const value = rng.next();
      assert.isNumber(value);
      assert.isAtLeast(value, 0);
      assert.isBelow(value, 1);
    });

    it("should handle createSeededRandom with negative seed", () => {
      const rng = createSeededRandom(-12345);
      const value = rng.next();
      assert.isNumber(value);
    });

    it("should handle very large arrays in shuffle", () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => i);
      const shuffled = shuffle(largeArray);
      
      assert.lengthOf(shuffled, 1000);
      // All elements should still be present
      assert.deepEqual(shuffled.sort((a, b) => a - b), largeArray);
    });
  });
});
