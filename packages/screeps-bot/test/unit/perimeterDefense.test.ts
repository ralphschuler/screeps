/**
 * Tests for Perimeter Defense System
 */

import { assert } from "chai";
import "mocha";
import {
  findRoomExits,
  identifyChokePoints,
  calculatePerimeterPositions,
  ExitPosition
} from "../../src/defense/perimeterDefense";

// Mock Game.map.getRoomTerrain
const mockTerrainCache = new Map<string, Map<string, number>>();

function createMockTerrain(roomName: string, walls: Array<[number, number]>): void {
  const terrain = new Map<string, number>();
  
  // Initialize all tiles as plain
  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 50; y++) {
      terrain.set(`${x},${y}`, 0);
    }
  }
  
  // Set walls
  for (const [x, y] of walls) {
    terrain.set(`${x},${y}`, TERRAIN_MASK_WALL);
  }
  
  mockTerrainCache.set(roomName, terrain);
}

function getMockTerrain(roomName: string): RoomTerrain {
  const terrain = mockTerrainCache.get(roomName);
  if (!terrain) {
    throw new Error(`No mock terrain for room ${roomName}`);
  }
  
  return {
    get: (x: number, y: number) => terrain.get(`${x},${y}`) ?? 0,
    getRawBuffer: () => {
      throw new Error("Not implemented");
    }
  } as RoomTerrain;
}

// Mock Game.map
(global as any).Game = {
  map: {
    getRoomTerrain: getMockTerrain
  }
};

describe("Perimeter Defense", () => {
  describe("findRoomExits", () => {
    it("should find all exits in a room with no walls on edges", () => {
      // Create room with no wall edges
      createMockTerrain("W1N1", []);
      
      const exits = findRoomExits("W1N1");
      
      // Should have exits on all 4 edges
      // Top: 50, Bottom: 50, Left: 48 (excluding corners), Right: 48 (excluding corners)
      // Total: 50 + 50 + 48 + 48 = 196
      assert.equal(exits.length, 196, "Should find all edge exits");
    });

    it("should not include wall tiles as exits", () => {
      // Create room with some walls on edges
      const walls: Array<[number, number]> = [];
      for (let x = 0; x < 10; x++) {
        walls.push([x, 0]); // Top edge walls
      }
      
      createMockTerrain("W1N2", walls);
      const exits = findRoomExits("W1N2");
      
      // Should have 196 - 10 = 186 exits
      assert.equal(exits.length, 186, "Should exclude wall tiles from exits");
    });

    it("should correctly identify exit directions", () => {
      createMockTerrain("W1N3", []);
      const exits = findRoomExits("W1N3");
      
      const topExits = exits.filter(e => e.exitDirection === FIND_EXIT_TOP);
      const bottomExits = exits.filter(e => e.exitDirection === FIND_EXIT_BOTTOM);
      const leftExits = exits.filter(e => e.exitDirection === FIND_EXIT_LEFT);
      const rightExits = exits.filter(e => e.exitDirection === FIND_EXIT_RIGHT);
      
      assert.equal(topExits.length, 50, "Should have 50 top exits");
      assert.equal(bottomExits.length, 50, "Should have 50 bottom exits");
      assert.equal(leftExits.length, 48, "Should have 48 left exits");
      assert.equal(rightExits.length, 48, "Should have 48 right exits");
      
      // Verify coordinates
      assert.equal(topExits[0]?.y, 0, "Top exits should be at y=0");
      assert.equal(bottomExits[0]?.y, 49, "Bottom exits should be at y=49");
      assert.equal(leftExits[0]?.x, 0, "Left exits should be at x=0");
      assert.equal(rightExits[0]?.x, 49, "Right exits should be at x=49");
    });
  });

  describe("identifyChokePoints", () => {
    it("should identify narrow passages as choke points", () => {
      // Create room with a narrow passage (3 tiles wide) on top edge
      const walls: Array<[number, number]> = [];
      
      // Top edge: walls everywhere except positions 24, 25, 26 (3 tile passage)
      for (let x = 0; x < 50; x++) {
        if (x < 24 || x > 26) {
          walls.push([x, 0]);
        }
      }
      
      createMockTerrain("W2N1", walls);
      const exits = findRoomExits("W2N1");
      const chokePoints = identifyChokePoints("W2N1", exits);
      
      assert.isAtLeast(chokePoints.length, 3, "Should identify the 3-tile passage as choke points");
      assert.isTrue(
        chokePoints.every(cp => cp.isChokePoint),
        "All identified positions should be marked as choke points"
      );
    });

    it("should not identify wide passages as choke points", () => {
      // Create room with a wide passage (10 tiles wide)
      const walls: Array<[number, number]> = [];
      
      // Top edge: walls everywhere except positions 20-29 (10 tile passage)
      for (let x = 0; x < 50; x++) {
        if (x < 20 || x > 29) {
          walls.push([x, 0]);
        }
      }
      
      createMockTerrain("W2N2", walls);
      const exits = findRoomExits("W2N2");
      const chokePoints = identifyChokePoints("W2N2", exits);
      
      // Wide passages (>4 tiles) should not be choke points
      const topChokePoints = chokePoints.filter(cp => cp.y === 0);
      assert.equal(topChokePoints.length, 0, "Wide passages should not be choke points");
    });

    it("should identify multiple choke points in different directions", () => {
      const walls: Array<[number, number]> = [];
      
      // Top: 2-tile passage at 24-25
      for (let x = 0; x < 50; x++) {
        if (x < 24 || x > 25) {
          walls.push([x, 0]);
        }
      }
      
      // Left: 3-tile passage at y=24-26
      for (let y = 1; y < 49; y++) {
        if (y < 24 || y > 26) {
          walls.push([0, y]);
        }
      }
      
      createMockTerrain("W2N3", walls);
      const exits = findRoomExits("W2N3");
      const chokePoints = identifyChokePoints("W2N3", exits);
      
      const topChokes = chokePoints.filter(cp => cp.exitDirection === FIND_EXIT_TOP);
      const leftChokes = chokePoints.filter(cp => cp.exitDirection === FIND_EXIT_LEFT);
      
      assert.isAtLeast(topChokes.length, 2, "Should identify top choke point");
      assert.isAtLeast(leftChokes.length, 3, "Should identify left choke point");
    });
  });

  describe("calculatePerimeterPositions", () => {
    it("should place walls one tile inside from exits", () => {
      createMockTerrain("W3N1", []);
      const plan = calculatePerimeterPositions("W3N1");
      
      // Verify positions are one tile inside
      const topWalls = plan.walls.filter(w => w.exitDirection === FIND_EXIT_TOP);
      const bottomWalls = plan.walls.filter(w => w.exitDirection === FIND_EXIT_BOTTOM);
      const leftWalls = plan.walls.filter(w => w.exitDirection === FIND_EXIT_LEFT);
      const rightWalls = plan.walls.filter(w => w.exitDirection === FIND_EXIT_RIGHT);
      
      assert.isTrue(
        topWalls.every(w => w.y === 1),
        "Top walls should be at y=1 (one inside from y=0)"
      );
      assert.isTrue(
        bottomWalls.every(w => w.y === 48),
        "Bottom walls should be at y=48 (one inside from y=49)"
      );
      assert.isTrue(
        leftWalls.every(w => w.x === 1),
        "Left walls should be at x=1 (one inside from x=0)"
      );
      assert.isTrue(
        rightWalls.every(w => w.x === 48),
        "Right walls should be at x=48 (one inside from x=49)"
      );
    });

    it("should skip positions that are terrain walls", () => {
      // Create room with walls at some inner positions
      const walls: Array<[number, number]> = [
        [1, 10], // Left edge, one inside
        [48, 20] // Right edge, one inside
      ];
      
      createMockTerrain("W3N2", walls);
      const plan = calculatePerimeterPositions("W3N2");
      
      // These positions should not be in the plan
      const hasWallPos1 = plan.walls.some(w => w.x === 1 && w.y === 10);
      const hasWallPos2 = plan.walls.some(w => w.x === 48 && w.y === 20);
      
      assert.isFalse(hasWallPos1, "Should skip terrain walls");
      assert.isFalse(hasWallPos2, "Should skip terrain walls");
    });

    it("should mark choke points correctly in the plan", () => {
      // Create room with a choke point
      const walls: Array<[number, number]> = [];
      
      // Top edge: narrow passage at 24-26
      for (let x = 0; x < 50; x++) {
        if (x < 24 || x > 26) {
          walls.push([x, 0]);
        }
      }
      
      createMockTerrain("W3N3", walls);
      const plan = calculatePerimeterPositions("W3N3");
      
      const chokeWalls = plan.walls.filter(w => w.isChokePoint);
      assert.isAtLeast(chokeWalls.length, 3, "Should have choke point walls");
      
      // All choke walls should be from the narrow passage
      assert.isTrue(
        chokeWalls.every(w => w.y === 1 && w.x >= 24 && w.x <= 26),
        "Choke walls should be at the narrow passage"
      );
    });
  });
});
