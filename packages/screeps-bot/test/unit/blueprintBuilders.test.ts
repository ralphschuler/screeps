/**
 * Unit tests for blueprint builder helpers
 * 
 * Validates that helper functions generate correct positions and structures
 */

import { assert } from "chai";
import {
  createSpawnRoadRing,
  createRadialRoads,
  createStructureProtection,
  type Position
} from "../../src/layouts/blueprints/builders";

describe("Blueprint Builder Helpers", () => {
  
  describe("createSpawnRoadRing", () => {
    it("should create 8 road positions around spawn", () => {
      const center: Position = { x: 0, y: 0 };
      const roads = createSpawnRoadRing(center);
      
      assert.equal(roads.length, 8, "Should create exactly 8 road positions");
      
      // Verify all 8 adjacent positions are present
      const expectedPositions = [
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: 1, y: -1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: -1, y: 1 },
        { x: 0, y: 1 },
        { x: 1, y: 1 }
      ];
      
      for (const expected of expectedPositions) {
        const found = roads.find(r => r.x === expected.x && r.y === expected.y);
        assert.exists(found, `Road at (${expected.x}, ${expected.y}) should exist`);
      }
    });
    
    it("should create road ring at offset position", () => {
      const center: Position = { x: 5, y: -1 };
      const roads = createSpawnRoadRing(center);
      
      assert.equal(roads.length, 8, "Should create exactly 8 road positions");
      
      // Verify positions are offset correctly
      const foundCenter = roads.find(r => r.x === 5 && r.y === 0);
      assert.exists(foundCenter, "Should have road at (5, 0) - east of center");
      
      const foundCorner = roads.find(r => r.x === 6 && r.y === -2);
      assert.exists(foundCorner, "Should have road at (6, -2) - northeast corner");
    });
  });
  
  describe("createRadialRoads", () => {
    it("should create roads in specified directions", () => {
      const center: Position = { x: 0, y: 0 };
      const roads = createRadialRoads(center, 3, ['north', 'south']);
      
      assert.equal(roads.length, 6, "Should create 3 roads north + 3 roads south");
      
      // Verify north roads
      assert.exists(roads.find(r => r.x === 0 && r.y === -1), "Road at (0, -1)");
      assert.exists(roads.find(r => r.x === 0 && r.y === -2), "Road at (0, -2)");
      assert.exists(roads.find(r => r.x === 0 && r.y === -3), "Road at (0, -3)");
      
      // Verify south roads
      assert.exists(roads.find(r => r.x === 0 && r.y === 1), "Road at (0, 1)");
      assert.exists(roads.find(r => r.x === 0 && r.y === 2), "Road at (0, 2)");
      assert.exists(roads.find(r => r.x === 0 && r.y === 3), "Road at (0, 3)");
    });
    
    it("should create roads in all four directions", () => {
      const center: Position = { x: 0, y: 0 };
      const roads = createRadialRoads(center, 2, ['north', 'south', 'east', 'west']);
      
      assert.equal(roads.length, 8, "Should create 2 roads per direction x 4 directions");
    });
  });
  
  describe("createStructureProtection", () => {
    it("should create ramparts for specified structure types", () => {
      const structures = [
        { x: 0, y: 0, structureType: STRUCTURE_SPAWN },
        { x: 2, y: 2, structureType: STRUCTURE_TOWER },
        { x: 4, y: 4, structureType: STRUCTURE_EXTENSION },
        { x: -2, y: 0, structureType: STRUCTURE_SPAWN }
      ];
      
      const ramparts = createStructureProtection(
        structures,
        [STRUCTURE_SPAWN, STRUCTURE_TOWER]
      );
      
      assert.equal(ramparts.length, 3, "Should create ramparts for 2 spawns + 1 tower");
      
      // Verify spawn ramparts
      assert.exists(ramparts.find(r => r.x === 0 && r.y === 0), "Rampart at spawn (0, 0)");
      assert.exists(ramparts.find(r => r.x === -2 && r.y === 0), "Rampart at spawn (-2, 0)");
      
      // Verify tower rampart
      assert.exists(ramparts.find(r => r.x === 2 && r.y === 2), "Rampart at tower (2, 2)");
      
      // Verify extension not protected
      assert.notExists(ramparts.find(r => r.x === 4 && r.y === 4), "Extension should not have rampart");
    });
    
    it("should handle empty structure list", () => {
      const ramparts = createStructureProtection([], [STRUCTURE_SPAWN]);
      assert.equal(ramparts.length, 0, "Should return empty array for empty structures");
    });
  });
});
