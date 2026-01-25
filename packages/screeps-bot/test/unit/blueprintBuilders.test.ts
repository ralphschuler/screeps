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
  createCheckerboardExtensions,
  createConnectorRoads,
  createExtensionMovementRoads,
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
  
  describe("createCheckerboardExtensions", () => {
    it("should create extensions in checkerboard pattern", () => {
      const center: Position = { x: 0, y: 0 };
      const extensions = createCheckerboardExtensions(center, 5, 2, 2);
      
      assert.equal(extensions.length, 5, "Should create exactly 5 extensions");
      
      // Verify all extensions follow checkerboard pattern (|x|+|y| % 2 == 0)
      for (const ext of extensions) {
        const sum = Math.abs(ext.x) + Math.abs(ext.y);
        assert.equal(sum % 2, 0, `Extension at (${ext.x},${ext.y}) should follow checkerboard pattern`);
        assert.equal(ext.structureType, STRUCTURE_EXTENSION, "Should be extension type");
      }
    });
    
    it("should respect center offset", () => {
      const center: Position = { x: 10, y: 5 };
      const extensions = createCheckerboardExtensions(center, 3, 2, 2);
      
      assert.equal(extensions.length, 3, "Should create 3 extensions");
      
      // Verify positions are offset from center
      for (const ext of extensions) {
        const dx = ext.x - center.x;
        const dy = ext.y - center.y;
        assert.equal((Math.abs(dx) + Math.abs(dy)) % 2, 0, "Should maintain checkerboard pattern relative to center");
      }
    });
    
    it("should limit count to requested amount", () => {
      const center: Position = { x: 0, y: 0 };
      const extensions = createCheckerboardExtensions(center, 3, 2, 10);
      
      assert.equal(extensions.length, 3, "Should create exactly 3 extensions even with larger radius");
    });
  });
  
  describe("createConnectorRoads", () => {
    it("should create roads between two positions", () => {
      const from: Position = { x: 0, y: 0 };
      const to: Position = { x: 5, y: 0 };
      const roads = createConnectorRoads(from, to, false);
      
      // Should create roads at x: 1, 2, 3, 4 (not including ends)
      assert.equal(roads.length, 4, "Should create 4 intermediate roads");
      
      assert.exists(roads.find(r => r.x === 1 && r.y === 0), "Road at (1, 0)");
      assert.exists(roads.find(r => r.x === 2 && r.y === 0), "Road at (2, 0)");
      assert.exists(roads.find(r => r.x === 3 && r.y === 0), "Road at (3, 0)");
      assert.exists(roads.find(r => r.x === 4 && r.y === 0), "Road at (4, 0)");
    });
    
    it("should include end positions when requested", () => {
      const from: Position = { x: 0, y: 0 };
      const to: Position = { x: 3, y: 0 };
      const roads = createConnectorRoads(from, to, true);
      
      // Should include start and end positions
      assert.exists(roads.find(r => r.x === 0 && r.y === 0), "Road at start (0, 0)");
      assert.exists(roads.find(r => r.x === 3 && r.y === 0), "Road at end (3, 0)");
    });
    
    it("should create L-shaped path for diagonal connections", () => {
      const from: Position = { x: 0, y: 0 };
      const to: Position = { x: 3, y: 3 };
      const roads = createConnectorRoads(from, to, false);
      
      // Should create horizontal then vertical path
      assert.isAbove(roads.length, 0, "Should create connector roads");
    });
  });
  
  describe("createExtensionMovementRoads", () => {
    it("should create movement roads in odd-sum pattern", () => {
      const center: Position = { x: 0, y: 0 };
      const roads = createExtensionMovementRoads(center, 3);
      
      // All roads should have odd sum (complement to checkerboard extensions)
      for (const road of roads) {
        const dx = road.x - center.x;
        const dy = road.y - center.y;
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        
        if (dist > 1 && dist <= 3) {
          const sum = Math.abs(dx) + Math.abs(dy);
          assert.equal(sum % 2, 1, `Road at (${road.x},${road.y}) should have odd sum for movement between extensions`);
        }
      }
    });
    
    it("should create roads within specified radius", () => {
      const center: Position = { x: 0, y: 0 };
      const radius = 2;
      const roads = createExtensionMovementRoads(center, radius);
      
      for (const road of roads) {
        const dx = road.x - center.x;
        const dy = road.y - center.y;
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        
        assert.isAtMost(dist, radius, `Road at (${road.x},${road.y}) should be within radius ${radius}`);
      }
    });
  });
});
