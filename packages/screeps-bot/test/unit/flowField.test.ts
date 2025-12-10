/**
 * Flow Field System Tests
 *
 * Tests for the flow field implementation for advanced traffic management.
 */

import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import {
  createFlowField,
  getFlowDirection,
  getCommonTargets,
  getFlowFieldStats,
  clearFlowFieldCache,
  cacheFlowField
} from "../../src/utils/flowField";

describe("Flow Field System", () => {
  beforeEach(() => {
    // Clear flow field cache before each test
    clearFlowFieldCache();
  });

  describe("createFlowField", () => {
    it("should create a flow field with correct dimensions", () => {
      // Mock Game.rooms
      const mockRoom = {
        name: "W1N1",
        getTerrain: () => ({
          get: (x: number, y: number) => {
            // Simple terrain: walls on edges, plains elsewhere
            if (x === 0 || x === 49 || y === 0 || y === 49) {
              return TERRAIN_MASK_WALL;
            }
            return 0; // Plains
          }
        }),
        lookForAt: () => [] // No structures
      };

      (global as { Game?: Partial<Game> }).Game = {
        rooms: { W1N1: mockRoom as unknown as Room }
      } as Partial<Game>;

      const targetPos = new RoomPosition(25, 25, "W1N1");
      const field = createFlowField("W1N1", targetPos);

      expect(field).to.not.be.null;
      expect(field.roomName).to.equal("W1N1");
      expect(field.targetPos.x).to.equal(25);
      expect(field.targetPos.y).to.equal(25);
      expect(field.directions).to.have.lengthOf(50);
      expect(field.costs).to.have.lengthOf(50);
      expect(field.directions[0]).to.have.lengthOf(50);
      expect(field.costs[0]).to.have.lengthOf(50);
    });

    it("should mark target position with zero cost", () => {
      const mockRoom = {
        name: "W1N1",
        getTerrain: () => ({
          get: () => 0 // All plains
        }),
        lookForAt: () => []
      };

      (global as { Game?: Partial<Game> }).Game = {
        rooms: { W1N1: mockRoom as unknown as Room }
      } as Partial<Game>;

      const targetPos = new RoomPosition(25, 25, "W1N1");
      const field = createFlowField("W1N1", targetPos);

      expect(field.costs[25][25]).to.equal(0);
      expect(field.directions[25][25]).to.equal(0); // At destination
    });

    it("should handle swamp terrain with higher costs", () => {
      const mockRoom = {
        name: "W1N1",
        getTerrain: () => ({
          get: (x: number, y: number) => {
            // Create a swamp path
            if (x === 20 && y >= 20 && y <= 30) {
              return TERRAIN_MASK_SWAMP;
            }
            return 0;
          }
        }),
        lookForAt: () => []
      };

      (global as { Game?: Partial<Game> }).Game = {
        rooms: { W1N1: mockRoom as unknown as Room }
      } as Partial<Game>;

      const targetPos = new RoomPosition(25, 25, "W1N1");
      const field = createFlowField("W1N1", targetPos);

      // Cost through swamp should be higher
      const swampCost = field.costs[20][25];
      const plainsCost = field.costs[24][25];

      expect(swampCost).to.be.greaterThan(plainsCost);
    });
  });

  describe("getFlowDirection", () => {
    it("should return null for positions outside the field", () => {
      const mockRoom = {
        name: "W1N1",
        getTerrain: () => ({
          get: () => 0
        }),
        lookForAt: () => []
      };

      (global as { Game?: Partial<Game> }).Game = {
        rooms: { W1N1: mockRoom as unknown as Room }
      } as Partial<Game>;

      const targetPos = new RoomPosition(25, 25, "W1N1");
      const field = createFlowField("W1N1", targetPos);

      // Different room
      const wrongRoomPos = new RoomPosition(25, 25, "W2N2");
      expect(getFlowDirection(field, wrongRoomPos)).to.be.null;

      // Out of bounds (handled by createFlowField bounds)
      const outOfBoundsPos = new RoomPosition(50, 50, "W1N1");
      expect(getFlowDirection(field, outOfBoundsPos)).to.be.null;
    });

    it("should return 0 at target position (at destination)", () => {
      const mockRoom = {
        name: "W1N1",
        getTerrain: () => ({
          get: () => 0
        }),
        lookForAt: () => []
      };

      (global as { Game?: Partial<Game> }).Game = {
        rooms: { W1N1: mockRoom as unknown as Room }
      } as Partial<Game>;

      const targetPos = new RoomPosition(25, 25, "W1N1");
      const field = createFlowField("W1N1", targetPos);

      expect(getFlowDirection(field, targetPos)).to.equal(0);
    });

    it("should return valid direction constants for reachable positions", () => {
      const mockRoom = {
        name: "W1N1",
        getTerrain: () => ({
          get: () => 0
        }),
        lookForAt: () => []
      };

      (global as { Game?: Partial<Game> }).Game = {
        rooms: { W1N1: mockRoom as unknown as Room }
      } as Partial<Game>;

      const targetPos = new RoomPosition(25, 25, "W1N1");
      const field = createFlowField("W1N1", targetPos);

      // Position to the left of target should point RIGHT
      const leftPos = new RoomPosition(20, 25, "W1N1");
      const direction = getFlowDirection(field, leftPos);

      expect(direction).to.not.be.null;
      expect(direction).to.be.oneOf([TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT]);
    });
  });

  describe("getCommonTargets", () => {
    it("should return empty array for rooms without controller", () => {
      (global as { Game?: Partial<Game> }).Game = {
        rooms: {}
      } as Partial<Game>;

      const targets = getCommonTargets("W1N1");
      expect(targets).to.be.an("array").that.is.empty;
    });

    it("should include storage, controller, and sources", () => {
      const mockStorage = { pos: new RoomPosition(20, 20, "W1N1") };
      const mockController = { pos: new RoomPosition(25, 25, "W1N1"), my: true };
      const mockSource1 = { pos: new RoomPosition(10, 10, "W1N1") };
      const mockSource2 = { pos: new RoomPosition(40, 40, "W1N1") };

      const mockRoom = {
        name: "W1N1",
        storage: mockStorage,
        controller: mockController,
        find: (type: FindConstant) => {
          if (type === FIND_SOURCES) {
            return [mockSource1, mockSource2];
          }
          return [];
        }
      };

      (global as { Game?: Partial<Game> }).Game = {
        rooms: { W1N1: mockRoom as unknown as Room }
      } as Partial<Game>;

      const targets = getCommonTargets("W1N1");

      expect(targets).to.have.lengthOf(4); // Storage + controller + 2 sources
      expect(targets).to.deep.include(mockStorage.pos);
      expect(targets).to.deep.include(mockController.pos);
      expect(targets).to.deep.include(mockSource1.pos);
      expect(targets).to.deep.include(mockSource2.pos);
    });
  });

  describe("getFlowFieldStats", () => {
    it("should return zero stats when cache is empty", () => {
      clearFlowFieldCache();

      const stats = getFlowFieldStats();

      expect(stats.cachedFields).to.equal(0);
      expect(stats.roomsWithFields).to.equal(0);
      expect(stats.totalMemoryEstimate).to.equal(0);
    });

    it("should return accurate stats after creating fields", () => {
      const mockRoom = {
        name: "W1N1",
        getTerrain: () => ({
          get: () => 0
        }),
        lookForAt: () => []
      };

      (global as { Game?: Partial<Game> }).Game = {
        rooms: { W1N1: mockRoom as unknown as Room },
        time: 1000
      } as Partial<Game>;

      // Create multiple flow fields and cache them manually
      const target1 = new RoomPosition(10, 10, "W1N1");
      const target2 = new RoomPosition(20, 20, "W1N1");

      const field1 = createFlowField("W1N1", target1);
      const field2 = createFlowField("W1N1", target2);
      
      cacheFlowField(field1);
      cacheFlowField(field2);

      const stats = getFlowFieldStats();

      // Note: stats tracking is in global cache, not persistent
      // The test creates fields which should update the cache
      expect(stats.cachedFields).to.be.greaterThan(0);
      expect(stats.roomsWithFields).to.be.greaterThan(0);
      expect(stats.totalMemoryEstimate).to.be.greaterThan(0);
    });
  });
});
