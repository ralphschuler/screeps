/**
 * Unit tests for safe find utilities
 */

import { assert } from "chai";
import sinon from "sinon";
import {
  safeFind,
  safeFindClosestByRange,
  safeFindInRange,
  safeFindClosestByPath
} from "../../src/utils/optimization/safeFind";

// Mock room interface
interface MockRoom {
  name: string;
  find: sinon.SinonStub;
}

// Mock position interface
interface MockPosition {
  roomName: string;
  x: number;
  y: number;
  findClosestByRange: sinon.SinonStub;
  findInRange: sinon.SinonStub;
  findClosestByPath: sinon.SinonStub;
}

describe("Safe Find Utilities", () => {
  let mockRoom: MockRoom;
  let mockPos: MockPosition;

  beforeEach(() => {
    // Create mock room
    mockRoom = {
      name: "W1N1",
      find: sinon.stub()
    };

    // Create mock position
    mockPos = {
      roomName: "W1N1",
      x: 25,
      y: 25,
      findClosestByRange: sinon.stub(),
      findInRange: sinon.stub(),
      findClosestByPath: sinon.stub()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("safeFind", () => {
    it("should return results from room.find when successful", () => {
      const mockResults = [{ id: "structure1" }, { id: "structure2" }];
      mockRoom.find.returns(mockResults);

      const results = safeFind(mockRoom, FIND_STRUCTURES);

      assert.deepEqual(results, mockResults);
      assert.isTrue(mockRoom.find.calledOnce);
      assert.isTrue(mockRoom.find.calledWith(FIND_STRUCTURES));
    });

    it("should pass options to room.find", () => {
      const mockResults = [{ id: "structure1" }];
      const opts = { filter: (s: Structure) => s.structureType === STRUCTURE_SPAWN };
      mockRoom.find.returns(mockResults);

      const results = safeFind(mockRoom, FIND_STRUCTURES, opts);

      assert.deepEqual(results, mockResults);
      assert.isTrue(mockRoom.find.calledWith(FIND_STRUCTURES, opts));
    });

    it("should return empty array when room.find throws error", () => {
      mockRoom.find.throws(new TypeError("Cannot read property 'username' of undefined"));

      const results = safeFind(mockRoom, FIND_STRUCTURES);

      assert.isArray(results);
      assert.lengthOf(results, 0);
    });

    it("should handle different error types", () => {
      mockRoom.find.throws(new Error("Some other error"));

      const results = safeFind(mockRoom, FIND_STRUCTURES);

      assert.isArray(results);
      assert.lengthOf(results, 0);
    });

    it("should handle string errors", () => {
      mockRoom.find.throws("String error");

      const results = safeFind(mockRoom, FIND_STRUCTURES);

      assert.isArray(results);
      assert.lengthOf(results, 0);
    });
  });

  describe("safeFindClosestByRange", () => {
    it("should return result from findClosestByRange when successful", () => {
      const mockResult = { id: "creep1", pos: mockPos };
      mockPos.findClosestByRange.returns(mockResult);

      const result = safeFindClosestByRange(mockPos, FIND_MY_CREEPS);

      assert.deepEqual(result, mockResult);
      assert.isTrue(mockPos.findClosestByRange.calledOnce);
      assert.isTrue(mockPos.findClosestByRange.calledWith(FIND_MY_CREEPS));
    });

    it("should pass options to findClosestByRange", () => {
      const mockResult = { id: "creep1" };
      const opts = { filter: (c: Creep) => c.memory.role === "harvester" };
      mockPos.findClosestByRange.returns(mockResult);

      const result = safeFindClosestByRange(mockPos, FIND_MY_CREEPS, opts);

      assert.deepEqual(result, mockResult);
      assert.isTrue(mockPos.findClosestByRange.calledWith(FIND_MY_CREEPS, opts));
    });

    it("should return null when findClosestByRange throws error", () => {
      mockPos.findClosestByRange.throws(new TypeError("Cannot read property 'username' of undefined"));

      const result = safeFindClosestByRange(mockPos, FIND_HOSTILE_CREEPS);

      assert.isNull(result);
    });

    it("should return null when no match found (native behavior)", () => {
      mockPos.findClosestByRange.returns(null);

      const result = safeFindClosestByRange(mockPos, FIND_MY_CREEPS);

      assert.isNull(result);
    });

    it("should handle different error types", () => {
      mockPos.findClosestByRange.throws(new Error("Random error"));

      const result = safeFindClosestByRange(mockPos, FIND_STRUCTURES);

      assert.isNull(result);
    });
  });

  describe("safeFindInRange", () => {
    it("should return results from findInRange when successful", () => {
      const mockResults = [{ id: "source1" }, { id: "source2" }];
      mockPos.findInRange.returns(mockResults);

      const results = safeFindInRange(mockPos, FIND_SOURCES, 5);

      assert.deepEqual(results, mockResults);
      assert.isTrue(mockPos.findInRange.calledOnce);
      assert.isTrue(mockPos.findInRange.calledWith(FIND_SOURCES, 5));
    });

    it("should pass options to findInRange", () => {
      const mockResults = [{ id: "source1" }];
      const opts = { filter: (s: Source) => s.energy > 0 };
      mockPos.findInRange.returns(mockResults);

      const results = safeFindInRange(mockPos, FIND_SOURCES, 5, opts);

      assert.deepEqual(results, mockResults);
      assert.isTrue(mockPos.findInRange.calledWith(FIND_SOURCES, 5, opts));
    });

    it("should return empty array when findInRange throws error", () => {
      mockPos.findInRange.throws(new TypeError("Cannot read property 'username' of undefined"));

      const results = safeFindInRange(mockPos, FIND_HOSTILE_STRUCTURES, 10);

      assert.isArray(results);
      assert.lengthOf(results, 0);
    });

    it("should handle range of 0", () => {
      const mockResults = [{ id: "adjacent1" }];
      mockPos.findInRange.returns(mockResults);

      const results = safeFindInRange(mockPos, FIND_STRUCTURES, 0);

      assert.deepEqual(results, mockResults);
      assert.isTrue(mockPos.findInRange.calledWith(FIND_STRUCTURES, 0));
    });

    it("should handle large ranges", () => {
      const mockResults = [{ id: "far1" }, { id: "far2" }];
      mockPos.findInRange.returns(mockResults);

      const results = safeFindInRange(mockPos, FIND_RUINS, 50);

      assert.deepEqual(results, mockResults);
    });

    it("should handle different error types", () => {
      mockPos.findInRange.throws(new Error("Some error"));

      const results = safeFindInRange(mockPos, FIND_STRUCTURES, 5);

      assert.isArray(results);
      assert.lengthOf(results, 0);
    });
  });

  describe("safeFindClosestByPath", () => {
    it("should return result from findClosestByPath when successful", () => {
      const mockResult = { id: "exit1", pos: mockPos };
      mockPos.findClosestByPath.returns(mockResult);

      const result = safeFindClosestByPath(mockPos, FIND_EXIT);

      assert.deepEqual(result, mockResult);
      assert.isTrue(mockPos.findClosestByPath.calledOnce);
      assert.isTrue(mockPos.findClosestByPath.calledWith(FIND_EXIT));
    });

    it("should pass options to findClosestByPath", () => {
      const mockResult = { id: "source1" };
      const opts = {
        filter: (s: Source) => s.energy > 0,
        ignoreCreeps: true,
        maxOps: 2000
      };
      mockPos.findClosestByPath.returns(mockResult);

      const result = safeFindClosestByPath(mockPos, FIND_SOURCES, opts);

      assert.deepEqual(result, mockResult);
      assert.isTrue(mockPos.findClosestByPath.calledWith(FIND_SOURCES, opts));
    });

    it("should return null when findClosestByPath throws error", () => {
      mockPos.findClosestByPath.throws(new TypeError("Cannot read property 'username' of undefined"));

      const result = safeFindClosestByPath(mockPos, FIND_HOSTILE_SPAWNS);

      assert.isNull(result);
    });

    it("should return null when no path found (native behavior)", () => {
      mockPos.findClosestByPath.returns(null);

      const result = safeFindClosestByPath(mockPos, FIND_EXIT);

      assert.isNull(result);
    });

    it("should handle pathfinding options", () => {
      const mockResult = { id: "dest1" };
      const opts = {
        ignoreCreeps: false,
        ignoreRoads: true,
        costCallback: sinon.stub()
      };
      mockPos.findClosestByPath.returns(mockResult);

      const result = safeFindClosestByPath(mockPos, FIND_MY_SPAWNS, opts);

      assert.deepEqual(result, mockResult);
    });

    it("should handle different error types", () => {
      mockPos.findClosestByPath.throws(new Error("Pathfinding error"));

      const result = safeFindClosestByPath(mockPos, FIND_STRUCTURES);

      assert.isNull(result);
    });
  });

  describe("Error handling consistency", () => {
    it("should handle TypeError consistently across all functions", () => {
      const error = new TypeError("Cannot read property 'username' of undefined");
      
      mockRoom.find.throws(error);
      mockPos.findClosestByRange.throws(error);
      mockPos.findInRange.throws(error);
      mockPos.findClosestByPath.throws(error);

      const findResult = safeFind(mockRoom, FIND_STRUCTURES);
      const rangeResult = safeFindClosestByRange(mockPos, FIND_STRUCTURES);
      const inRangeResult = safeFindInRange(mockPos, FIND_STRUCTURES, 5);
      const pathResult = safeFindClosestByPath(mockPos, FIND_STRUCTURES);

      assert.lengthOf(findResult, 0);
      assert.isNull(rangeResult);
      assert.lengthOf(inRangeResult, 0);
      assert.isNull(pathResult);
    });

    it("should not interfere with normal null/empty results", () => {
      mockRoom.find.returns([]);
      mockPos.findClosestByRange.returns(null);
      mockPos.findInRange.returns([]);
      mockPos.findClosestByPath.returns(null);

      const findResult = safeFind(mockRoom, FIND_STRUCTURES);
      const rangeResult = safeFindClosestByRange(mockPos, FIND_STRUCTURES);
      const inRangeResult = safeFindInRange(mockPos, FIND_STRUCTURES, 5);
      const pathResult = safeFindClosestByPath(mockPos, FIND_STRUCTURES);

      // Should pass through normal empty/null results
      assert.lengthOf(findResult, 0);
      assert.isNull(rangeResult);
      assert.lengthOf(inRangeResult, 0);
      assert.isNull(pathResult);
    });
  });
});
