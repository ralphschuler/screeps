/**
 * Blueprint Structure Validation Tests
 * 
 * Ensures that refactored blueprints maintain the same structure counts
 * and key properties as before the refactoring
 */

import { assert } from "chai";
import {
  EARLY_COLONY_BLUEPRINT,
  CORE_COLONY_BLUEPRINT,
  ECONOMIC_MATURITY_BLUEPRINT,
  WAR_READY_BLUEPRINT,
  COMPACT_BUNKER_BLUEPRINT
} from "../../src/layouts/blueprints/index";

describe("Blueprint Structure Validation (Post-Refactoring)", () => {
  
  describe("Early Colony Blueprint", () => {
    it("should have correct structure counts", () => {
      const blueprint = EARLY_COLONY_BLUEPRINT;
      
      // 1 spawn + 5 extensions = 6 structures
      assert.equal(blueprint.structures.length, 6, "Should have 6 total structures");
      
      const spawns = blueprint.structures.filter(s => s.structureType === STRUCTURE_SPAWN);
      assert.equal(spawns.length, 1, "Should have 1 spawn");
      
      const extensions = blueprint.structures.filter(s => s.structureType === STRUCTURE_EXTENSION);
      assert.equal(extensions.length, 5, "Should have 5 extensions");
    });
    
    it("should have 8 road positions (spawn ring)", () => {
      assert.equal(EARLY_COLONY_BLUEPRINT.roads.length, 8, "Should have 8 roads around spawn");
    });
    
    it("should have no ramparts at RCL 1-2", () => {
      assert.equal(EARLY_COLONY_BLUEPRINT.ramparts.length, 0, "Should have no ramparts");
    });
  });
  
  describe("Core Colony Blueprint", () => {
    it("should have correct structure counts", () => {
      const blueprint = CORE_COLONY_BLUEPRINT;
      
      // 1 spawn + 1 tower + 1 storage + 20 extensions = 23 structures
      assert.equal(blueprint.structures.length, 23, "Should have 23 total structures");
      
      const spawns = blueprint.structures.filter(s => s.structureType === STRUCTURE_SPAWN);
      assert.equal(spawns.length, 1, "Should have 1 spawn");
      
      const towers = blueprint.structures.filter(s => s.structureType === STRUCTURE_TOWER);
      assert.equal(towers.length, 1, "Should have 1 tower");
      
      const extensions = blueprint.structures.filter(s => s.structureType === STRUCTURE_EXTENSION);
      assert.equal(extensions.length, 20, "Should have 20 extensions");
    });
    
    it("should have roads including spawn ring and connectors", () => {
      const roads = CORE_COLONY_BLUEPRINT.roads;
      
      // 8 spawn ring + 8 diagonal + 12 radial + 3 storage access = 31 roads
      assert.equal(roads.length, 31, "Should have 31 total roads");
    });
  });
  
  describe("Economic Maturity Blueprint", () => {
    it("should have correct structure counts", () => {
      const blueprint = ECONOMIC_MATURITY_BLUEPRINT;
      
      // 2 spawns + 3 towers + storage + terminal + 30 extensions + 3 labs + 1 link
      const spawns = blueprint.structures.filter(s => s.structureType === STRUCTURE_SPAWN);
      assert.equal(spawns.length, 2, "Should have 2 spawns");
      
      const towers = blueprint.structures.filter(s => s.structureType === STRUCTURE_TOWER);
      assert.equal(towers.length, 3, "Should have 3 towers");
      
      const extensions = blueprint.structures.filter(s => s.structureType === STRUCTURE_EXTENSION);
      assert.equal(extensions.length, 30, "Should have 30 extensions");
      
      const labs = blueprint.structures.filter(s => s.structureType === STRUCTURE_LAB);
      assert.equal(labs.length, 3, "Should have 3 labs");
    });
    
    it("should have roads including two spawn rings", () => {
      const roads = ECONOMIC_MATURITY_BLUEPRINT.roads;
      
      // Should have roads around both spawns plus connectors
      assert.isAbove(roads.length, 16, "Should have roads for multiple spawns");
    });
    
    it("should protect critical structures with ramparts", () => {
      const ramparts = ECONOMIC_MATURITY_BLUEPRINT.ramparts;
      
      // Should protect spawns, storage, terminal
      assert.isAbove(ramparts.length, 0, "Should have ramparts");
      
      // Check that specific critical positions are protected
      const storageRampart = ramparts.find(r => r.x === 0 && r.y === 4);
      assert.exists(storageRampart, "Storage should be protected");
    });
  });
  
  describe("War Ready Blueprint", () => {
    it("should have correct structure counts", () => {
      const blueprint = WAR_READY_BLUEPRINT;
      
      // 3 spawns + 6 towers + storage + terminal + factory + 10 labs + special structures + 10 extensions + 3 links
      const spawns = blueprint.structures.filter(s => s.structureType === STRUCTURE_SPAWN);
      assert.equal(spawns.length, 3, "Should have 3 spawns");
      
      const towers = blueprint.structures.filter(s => s.structureType === STRUCTURE_TOWER);
      assert.equal(towers.length, 6, "Should have 6 towers (maximum)");
      
      const labs = blueprint.structures.filter(s => s.structureType === STRUCTURE_LAB);
      assert.equal(labs.length, 10, "Should have 10 labs");
      
      const extensions = blueprint.structures.filter(s => s.structureType === STRUCTURE_EXTENSION);
      assert.equal(extensions.length, 10, "Should have 10 extensions");
    });
    
    it("should have roads for all three spawns", () => {
      const roads = WAR_READY_BLUEPRINT.roads;
      
      // 3 spawn rings (8 each) + connectors + movement roads
      assert.isAbove(roads.length, 24, "Should have roads for 3 spawns plus connectors");
    });
    
    it("should protect all critical structures", () => {
      const ramparts = WAR_READY_BLUEPRINT.ramparts;
      
      // Should protect all spawns, towers, and special structures
      assert.isAbove(ramparts.length, 10, "Should have significant rampart coverage");
      
      // Verify all spawns are protected
      assert.exists(ramparts.find(r => r.x === 0 && r.y === 0), "Primary spawn protected");
      assert.exists(ramparts.find(r => r.x === -5 && r.y === -1), "West spawn protected");
      assert.exists(ramparts.find(r => r.x === 5 && r.y === -1), "East spawn protected");
    });
  });
  
  describe("Compact Bunker Blueprint", () => {
    it("should have correct structure counts for RCL 8", () => {
      const blueprint = COMPACT_BUNKER_BLUEPRINT;
      
      // 3 spawns + 6 towers + storage + terminal + factory + 10 labs + 60 extensions + special structures + 6 links
      const spawns = blueprint.structures.filter(s => s.structureType === STRUCTURE_SPAWN);
      assert.equal(spawns.length, 3, "Should have 3 spawns");
      
      const towers = blueprint.structures.filter(s => s.structureType === STRUCTURE_TOWER);
      assert.equal(towers.length, 6, "Should have 6 towers");
      
      const labs = blueprint.structures.filter(s => s.structureType === STRUCTURE_LAB);
      assert.equal(labs.length, 10, "Should have 10 labs");
      
      const extensions = blueprint.structures.filter(s => s.structureType === STRUCTURE_EXTENSION);
      assert.equal(extensions.length, 60, "Should have 60 extensions (maximum)");
    });
    
    it("should have ramparts protecting critical structures", () => {
      const ramparts = COMPACT_BUNKER_BLUEPRINT.ramparts;
      
      // Should protect core + spawns + towers + labs + perimeter
      assert.isAbove(ramparts.length, 15, "Should have comprehensive rampart coverage");
      
      // Verify storage protected
      assert.exists(ramparts.find(r => r.x === 0 && r.y === 0), "Storage should be protected");
    });
  });
});
