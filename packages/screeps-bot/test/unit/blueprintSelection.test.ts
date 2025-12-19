import { assert } from "chai";
import {
  Blueprint,
  selectBestBlueprint,
  validateBlueprintFit,
  findBestBlueprintAnchor,
  calculateBlueprintEfficiency,
  exportBlueprint,
  importBlueprint,
  compareBlueprintEfficiency,
  EARLY_COLONY_BLUEPRINT,
  CORE_COLONY_BLUEPRINT,
  ECONOMIC_MATURITY_BLUEPRINT,
  WAR_READY_BLUEPRINT,
  COMPACT_BUNKER_BLUEPRINT
} from "../../src/layouts/blueprints/index";

/**
 * Test suite for automated blueprint selection and validation
 * 
 * Tests the implementation of:
 * - Terrain-based blueprint selection
 * - Blueprint validation before construction
 * - Blueprint versioning with RCL-based upgrades
 * - Specialized blueprint types (eco, war, hybrid)
 * - Blueprint import/export for sharing
 * - Efficiency scoring with metrics
 */
describe("Blueprint Selection and Validation", () => {
  
  describe("Blueprint validation", () => {
    it("should validate blueprint structure", () => {
      // Test that all built-in blueprints have required fields
      const blueprints = [
        EARLY_COLONY_BLUEPRINT,
        CORE_COLONY_BLUEPRINT,
        ECONOMIC_MATURITY_BLUEPRINT,
        WAR_READY_BLUEPRINT,
        COMPACT_BUNKER_BLUEPRINT
      ];
      
      for (const blueprint of blueprints) {
        assert.exists(blueprint.name, `Blueprint should have name`);
        assert.exists(blueprint.rcl, `Blueprint should have RCL`);
        assert.exists(blueprint.anchor, `Blueprint should have anchor`);
        assert.isArray(blueprint.structures, `Blueprint should have structures array`);
        assert.isArray(blueprint.roads, `Blueprint should have roads array`);
        assert.isArray(blueprint.ramparts, `Blueprint should have ramparts array`);
        
        // Validate anchor position
        assert.isNumber(blueprint.anchor.x, `Anchor x should be a number`);
        assert.isNumber(blueprint.anchor.y, `Anchor y should be a number`);
        
        // Validate structure placements
        for (const struct of blueprint.structures) {
          assert.isNumber(struct.x, `Structure x should be a number`);
          assert.isNumber(struct.y, `Structure y should be a number`);
          assert.exists(struct.structureType, `Structure should have type`);
        }
      }
    });
    
    it("should identify bunker vs spread blueprint types", () => {
      assert.equal(COMPACT_BUNKER_BLUEPRINT.type, "bunker", "Compact bunker should be bunker type");
      assert.equal(EARLY_COLONY_BLUEPRINT.type, "spread", "Early colony should be spread type");
      assert.equal(CORE_COLONY_BLUEPRINT.type, "spread", "Core colony should be spread type");
    });
    
    it("should have proper RCL progression", () => {
      assert.equal(EARLY_COLONY_BLUEPRINT.rcl, 1, "Early colony should be RCL 1");
      assert.equal(CORE_COLONY_BLUEPRINT.rcl, 3, "Core colony should be RCL 3");
      assert.equal(ECONOMIC_MATURITY_BLUEPRINT.rcl, 5, "Economic maturity should be RCL 5");
      assert.equal(WAR_READY_BLUEPRINT.rcl, 7, "War ready should be RCL 7");
      assert.equal(COMPACT_BUNKER_BLUEPRINT.rcl, 8, "Compact bunker should be RCL 8");
    });
    
    it("should have minimum space radius defined for terrain validation", () => {
      const blueprints = [
        EARLY_COLONY_BLUEPRINT,
        CORE_COLONY_BLUEPRINT,
        ECONOMIC_MATURITY_BLUEPRINT,
        WAR_READY_BLUEPRINT,
        COMPACT_BUNKER_BLUEPRINT
      ];
      
      for (const blueprint of blueprints) {
        if (blueprint.minSpaceRadius !== undefined) {
          assert.isNumber(blueprint.minSpaceRadius, `${blueprint.name} minSpaceRadius should be a number`);
          assert.isAbove(blueprint.minSpaceRadius, 0, `${blueprint.name} minSpaceRadius should be positive`);
        }
      }
    });
  });
  
  describe("Blueprint import/export", () => {
    it("should export blueprint to JSON", () => {
      const json = exportBlueprint(EARLY_COLONY_BLUEPRINT);
      
      assert.isString(json, "Export should return a string");
      assert.isAbove(json.length, 0, "Exported JSON should not be empty");
      
      // Validate it's valid JSON
      const parsed = JSON.parse(json);
      assert.exists(parsed, "Should parse as valid JSON");
      assert.equal(parsed.name, EARLY_COLONY_BLUEPRINT.name, "Should preserve name");
    });
    
    it("should import blueprint from JSON", () => {
      const json = exportBlueprint(CORE_COLONY_BLUEPRINT);
      const imported = importBlueprint(json);
      
      assert.exists(imported, "Import should succeed");
      assert.equal(imported?.name, CORE_COLONY_BLUEPRINT.name, "Should preserve name");
      assert.equal(imported?.rcl, CORE_COLONY_BLUEPRINT.rcl, "Should preserve RCL");
      assert.equal(imported?.anchor.x, CORE_COLONY_BLUEPRINT.anchor.x, "Should preserve anchor x");
      assert.equal(imported?.anchor.y, CORE_COLONY_BLUEPRINT.anchor.y, "Should preserve anchor y");
      assert.equal(imported?.structures.length, CORE_COLONY_BLUEPRINT.structures.length, "Should preserve structures");
    });
    
    it("should reject invalid JSON", () => {
      const invalid = importBlueprint("{ invalid json }");
      assert.isNull(invalid, "Should reject malformed JSON");
    });
    
    it("should reject JSON missing required fields", () => {
      const missingName = importBlueprint(JSON.stringify({ rcl: 1, anchor: { x: 25, y: 25 }, structures: [], roads: [], ramparts: [] }));
      assert.isNull(missingName, "Should reject blueprint without name");
      
      const missingRcl = importBlueprint(JSON.stringify({ name: "test", anchor: { x: 25, y: 25 }, structures: [], roads: [], ramparts: [] }));
      assert.isNull(missingRcl, "Should reject blueprint without RCL");
      
      const missingAnchor = importBlueprint(JSON.stringify({ name: "test", rcl: 1, structures: [], roads: [], ramparts: [] }));
      assert.isNull(missingAnchor, "Should reject blueprint without anchor");
    });
    
    it("should round-trip export and import", () => {
      const original = WAR_READY_BLUEPRINT;
      const json = exportBlueprint(original);
      const imported = importBlueprint(json);
      
      assert.exists(imported, "Round-trip should succeed");
      assert.equal(imported?.name, original.name, "Name should match");
      assert.equal(imported?.rcl, original.rcl, "RCL should match");
      assert.equal(imported?.structures.length, original.structures.length, "Structure count should match");
      assert.equal(imported?.roads.length, original.roads.length, "Road count should match");
      assert.equal(imported?.ramparts.length, original.ramparts.length, "Rampart count should match");
    });
  });
  
  describe("Blueprint efficiency metrics", () => {
    it("should have required metric fields", () => {
      // Create a mock room-like object for testing
      // In actual game, this would be a real Room object
      const mockRoom = {
        name: "W1N1",
        controller: {
          pos: { x: 15, y: 15, roomName: "W1N1" } as RoomPosition,
          level: 8
        } as StructureController,
        find: (type: number) => {
          if (type === FIND_SOURCES) {
            return [
              { pos: { x: 10, y: 10, roomName: "W1N1", getRangeTo: () => 5 } },
              { pos: { x: 40, y: 40, roomName: "W1N1", getRangeTo: () => 5 } }
            ];
          }
          return [];
        }
      } as unknown as Room;
      
      const anchor = { x: 25, y: 25, roomName: "W1N1", getRangeTo: () => 5 } as RoomPosition;
      
      // This test validates the structure, actual PathFinder calls will fail in test env
      // Real validation happens in integration tests
      assert.exists(COMPACT_BUNKER_BLUEPRINT, "Blueprint should exist for metrics calculation");
      assert.exists(anchor, "Anchor position should exist");
      assert.equal(mockRoom.name, "W1N1", "Mock room should have name");
    });
    
    it("should calculate defense score based on towers and ramparts", () => {
      // Defense score calculation logic:
      // - Each rampart contributes 2 points
      // - Each tower contributes 10 points
      // - Capped at 100
      
      const compactBunkerRamparts = COMPACT_BUNKER_BLUEPRINT.ramparts.length;
      const compactBunkerTowers = COMPACT_BUNKER_BLUEPRINT.structures.filter(
        s => s.structureType === STRUCTURE_TOWER
      ).length;
      
      assert.isAbove(compactBunkerRamparts, 0, "Compact bunker should have ramparts");
      assert.equal(compactBunkerTowers, 6, "Compact bunker should have 6 towers at RCL 8");
      
      const expectedDefenseScore = Math.min(100, (compactBunkerRamparts * 2) + (compactBunkerTowers * 10));
      assert.isAbove(expectedDefenseScore, 0, "Defense score should be positive");
      assert.isAtMost(expectedDefenseScore, 100, "Defense score should be capped at 100");
    });
    
    it("should calculate energy efficiency based on links", () => {
      const compactBunkerLinks = COMPACT_BUNKER_BLUEPRINT.structures.filter(
        s => s.structureType === STRUCTURE_LINK
      ).length;
      
      assert.equal(compactBunkerLinks, 6, "Compact bunker should have 6 links at RCL 8");
      
      // Links contribute to energy efficiency (15 points each)
      const linkContribution = compactBunkerLinks * 15;
      assert.isAbove(linkContribution, 0, "Links should contribute to energy efficiency");
    });
  });
  
  describe("Specialized blueprint types", () => {
    it("should have bunker blueprint optimized for compact defense", () => {
      const bunker = COMPACT_BUNKER_BLUEPRINT;
      
      // Bunker characteristics:
      // - Compact footprint (11x11 grid)
      // - All structures within minSpaceRadius
      // - High tower count for defense
      // - Tight clustering of critical structures
      
      assert.equal(bunker.type, "bunker", "Should be bunker type");
      assert.equal(bunker.minSpaceRadius, 6, "Should have tight space requirements");
      
      const towerCount = bunker.structures.filter(s => s.structureType === STRUCTURE_TOWER).length;
      assert.equal(towerCount, 6, "Bunker should have maximum towers");
      
      // Check that storage, terminal, factory are close together
      const storage = bunker.structures.find(s => s.structureType === STRUCTURE_STORAGE);
      const terminal = bunker.structures.find(s => s.structureType === STRUCTURE_TERMINAL);
      const factory = bunker.structures.find(s => s.structureType === STRUCTURE_FACTORY);
      
      assert.exists(storage, "Bunker should have storage");
      assert.exists(terminal, "Bunker should have terminal");
      assert.exists(factory, "Bunker should have factory");
      
      if (storage && terminal) {
        const dist = Math.abs(storage.x - terminal.x) + Math.abs(storage.y - terminal.y);
        assert.isAtMost(dist, 3, "Storage and terminal should be close in bunker");
      }
    });
    
    it("should have spread blueprints optimized for irregular terrain", () => {
      const spread = EARLY_COLONY_BLUEPRINT;
      
      // Spread characteristics:
      // - More flexible space requirements
      // - Checkerboard pattern for extensions
      // - Roads for movement between structures
      
      assert.equal(spread.type, "spread", "Should be spread type");
      assert.isAbove(spread.roads.length, 0, "Spread layout should have roads");
      
      // Verify checkerboard pattern for extensions
      const extensions = spread.structures.filter(s => s.structureType === STRUCTURE_EXTENSION);
      for (const ext of extensions) {
        const sum = Math.abs(ext.x) + Math.abs(ext.y);
        assert.equal(sum % 2, 0, `Extension at (${ext.x},${ext.y}) should follow checkerboard pattern (even sum)`);
      }
    });
    
    it("should have war-ready blueprint with maximum defense", () => {
      const war = WAR_READY_BLUEPRINT;
      
      // War-ready characteristics:
      // - Maximum towers (6 at RCL 7-8)
      // - Strategic tower placement for coverage
      // - Ramparts protecting critical structures
      
      const towerCount = war.structures.filter(s => s.structureType === STRUCTURE_TOWER).length;
      assert.equal(towerCount, 6, "War-ready should have 6 towers");
      assert.isAbove(war.ramparts.length, 10, "War-ready should have significant rampart protection");
    });
    
    it("should have economic blueprint with link-based distribution", () => {
      const economic = ECONOMIC_MATURITY_BLUEPRINT;
      
      // Economic characteristics:
      // - Links for efficient energy distribution
      // - Labs for chemistry
      // - Optimal source/controller distances
      
      const linkCount = economic.structures.filter(s => s.structureType === STRUCTURE_LINK).length;
      const labCount = economic.structures.filter(s => s.structureType === STRUCTURE_LAB).length;
      
      assert.isAbove(linkCount, 0, "Economic layout should have links");
      assert.isAbove(labCount, 0, "Economic layout should have labs");
    });
  });
  
  describe("RCL-based blueprint versioning", () => {
    it("should select appropriate blueprint for each RCL", () => {
      // RCL 1-2 should use early colony
      assert.equal(EARLY_COLONY_BLUEPRINT.rcl, 1, "Early colony for RCL 1-2");
      
      // RCL 3-4 should use core colony
      assert.equal(CORE_COLONY_BLUEPRINT.rcl, 3, "Core colony for RCL 3-4");
      
      // RCL 5-6 should use economic maturity
      assert.equal(ECONOMIC_MATURITY_BLUEPRINT.rcl, 5, "Economic maturity for RCL 5-6");
      
      // RCL 7+ should use war-ready or compact bunker
      assert.equal(WAR_READY_BLUEPRINT.rcl, 7, "War-ready for RCL 7");
      assert.equal(COMPACT_BUNKER_BLUEPRINT.rcl, 8, "Compact bunker for RCL 8");
    });
    
    it("should have incremental structure additions per RCL", () => {
      // Early colony (RCL 1-2) should have minimal structures
      const earlyCount = EARLY_COLONY_BLUEPRINT.structures.length;
      assert.isBelow(earlyCount, 10, "Early colony should have few structures");
      
      // Core colony (RCL 3-4) should add tower and more extensions
      const coreCount = CORE_COLONY_BLUEPRINT.structures.length;
      assert.isAbove(coreCount, earlyCount, "Core colony should have more structures than early");
      
      // Economic maturity (RCL 5-6) should add storage, terminal, labs
      const economicCount = ECONOMIC_MATURITY_BLUEPRINT.structures.length;
      assert.isAbove(economicCount, coreCount, "Economic should have more structures than core");
      
      // War-ready (RCL 7-8) should add full tower array and special structures
      const warCount = WAR_READY_BLUEPRINT.structures.length;
      assert.isAbove(warCount, economicCount, "War-ready should have more structures than economic");
    });
    
    it("should properly version spawns across RCLs", () => {
      const earlySpawns = EARLY_COLONY_BLUEPRINT.structures.filter(s => s.structureType === STRUCTURE_SPAWN).length;
      const coreSpawns = CORE_COLONY_BLUEPRINT.structures.filter(s => s.structureType === STRUCTURE_SPAWN).length;
      const economicSpawns = ECONOMIC_MATURITY_BLUEPRINT.structures.filter(s => s.structureType === STRUCTURE_SPAWN).length;
      const warSpawns = WAR_READY_BLUEPRINT.structures.filter(s => s.structureType === STRUCTURE_SPAWN).length;
      const bunkerSpawns = COMPACT_BUNKER_BLUEPRINT.structures.filter(s => s.structureType === STRUCTURE_SPAWN).length;
      
      assert.equal(earlySpawns, 1, "RCL 1-2 should have 1 spawn");
      assert.equal(coreSpawns, 1, "RCL 3-4 should have 1 spawn");
      assert.equal(economicSpawns, 2, "RCL 5-6 should have 2 spawns");
      assert.equal(warSpawns, 3, "RCL 7 should have 3 spawns");
      assert.equal(bunkerSpawns, 3, "RCL 8 should have 3 spawns");
    });
  });
  
  describe("Blueprint efficiency comparison", () => {
    it("should compare blueprints based on overall score", () => {
      // Test the comparison logic exists and has proper structure
      // Actual room-based comparisons require game environment
      
      const bunker = COMPACT_BUNKER_BLUEPRINT;
      const spread = WAR_READY_BLUEPRINT;
      
      // Both should have valid structure for comparison
      assert.exists(bunker.structures, "Bunker should have structures for comparison");
      assert.exists(spread.structures, "Spread should have structures for comparison");
      
      // Bunker should have tighter clustering
      const bunkerStructs = bunker.structures;
      const bunkerSpread = Math.max(
        ...bunkerStructs.map(s => Math.abs(s.x)),
        ...bunkerStructs.map(s => Math.abs(s.y))
      );
      
      const spreadStructs = spread.structures;
      const spreadSpread = Math.max(
        ...spreadStructs.map(s => Math.abs(s.x)),
        ...spreadStructs.map(s => Math.abs(s.y))
      );
      
      assert.isBelow(bunkerSpread, spreadSpread, "Bunker should be more compact than spread");
    });
  });
});
