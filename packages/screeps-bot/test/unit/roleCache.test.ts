/**
 * Unit tests for roleCache module
 */

import { assert } from "chai";
import {
  getRoleCache,
  setRoleCache,
  deleteRoleCache,
  hasRoleCache,
  clearRoleTypeCache,
  clearAllRoleCache,
  getRoleCacheStats,
  getCachedRepairTarget,
  getCachedBuildTarget,
  getAssignedSource,
  getSourceContainer,
  getControllerEnergySource,
  clearTargetCaches
} from "../../src/utils/caching/roleCache";

describe("roleCache", () => {
  beforeEach(() => {
    // Reset Game
    // @ts-ignore: Setting up test environment
    global.Game = { time: 1000, getObjectById: () => null };
    
    clearAllRoleCache();
  });

  function createMockCreep(name: string): Creep {
    return {
      name,
      pos: { x: 25, y: 25 }
    } as unknown as Creep;
  }

  describe("basic cache operations", () => {
    it("should store and retrieve values", () => {
      const creep = createMockCreep("builder1");
      
      setRoleCache(creep, "builder", "repairTarget", "target123");
      const value = getRoleCache<string>(creep, "builder", "repairTarget");
      
      assert.equal(value, "target123");
    });

    it("should return undefined for non-existent cache", () => {
      const creep = createMockCreep("builder1");
      
      const value = getRoleCache(creep, "builder", "repairTarget");
      assert.isUndefined(value);
    });

    it("should support multiple data keys per creep", () => {
      const creep = createMockCreep("builder1");
      
      setRoleCache(creep, "builder", "repairTarget", "target1");
      setRoleCache(creep, "builder", "buildTarget", "target2");
      
      assert.equal(getRoleCache(creep, "builder", "repairTarget"), "target1");
      assert.equal(getRoleCache(creep, "builder", "buildTarget"), "target2");
    });

    it("should isolate caches between different creeps", () => {
      const creep1 = createMockCreep("builder1");
      const creep2 = createMockCreep("builder2");
      
      setRoleCache(creep1, "builder", "repairTarget", "target1");
      setRoleCache(creep2, "builder", "repairTarget", "target2");
      
      assert.equal(getRoleCache(creep1, "builder", "repairTarget"), "target1");
      assert.equal(getRoleCache(creep2, "builder", "repairTarget"), "target2");
    });

    it("should isolate caches between different roles", () => {
      const creep = createMockCreep("creep1");
      
      setRoleCache(creep, "builder", "target", "build");
      setRoleCache(creep, "miner", "target", "mine");
      
      assert.equal(getRoleCache(creep, "builder", "target"), "build");
      assert.equal(getRoleCache(creep, "miner", "target"), "mine");
    });
  });

  describe("TTL and expiration", () => {
    it("should expire cache after TTL", () => {
      const creep = createMockCreep("builder1");
      
      // Set with short TTL
      setRoleCache(creep, "builder", "repairTarget", "target123", 5);
      
      // Within TTL
      // @ts-ignore
      global.Game.time = 1003;
      assert.equal(getRoleCache(creep, "builder", "repairTarget"), "target123");
      
      // After TTL
      // @ts-ignore
      global.Game.time = 1006;
      assert.isUndefined(getRoleCache(creep, "builder", "repairTarget"));
    });

    it("should use default TTL based on data key", () => {
      const creep = createMockCreep("miner1");
      
      // assignedSource has default TTL of 100
      setRoleCache(creep, "miner", "assignedSource", "source123");
      
      // Should still be valid after 50 ticks
      // @ts-ignore
      global.Game.time = 1050;
      assert.equal(getRoleCache(creep, "miner", "assignedSource"), "source123");
      
      // Should expire after 100 ticks
      // @ts-ignore
      global.Game.time = 1101;
      assert.isUndefined(getRoleCache(creep, "miner", "assignedSource"));
    });

    it("should use fallback default TTL for unknown keys", () => {
      const creep = createMockCreep("creep1");
      
      // Unknown key should use default TTL of 10
      setRoleCache(creep, "role", "unknownKey", "value");
      
      // Should still be valid after 8 ticks
      // @ts-ignore
      global.Game.time = 1008;
      assert.equal(getRoleCache(creep, "role", "unknownKey"), "value");
      
      // Should expire after 10 ticks
      // @ts-ignore
      global.Game.time = 1011;
      assert.isUndefined(getRoleCache(creep, "role", "unknownKey"));
    });
  });

  describe("cache deletion", () => {
    it("should delete specific cache entry", () => {
      const creep = createMockCreep("builder1");
      
      setRoleCache(creep, "builder", "repairTarget", "target1");
      setRoleCache(creep, "builder", "buildTarget", "target2");
      
      deleteRoleCache(creep, "builder", "repairTarget");
      
      assert.isUndefined(getRoleCache(creep, "builder", "repairTarget"));
      assert.equal(getRoleCache(creep, "builder", "buildTarget"), "target2");
    });

    it("should delete all cache entries for a creep", () => {
      const creep = createMockCreep("builder1");
      
      setRoleCache(creep, "builder", "repairTarget", "target1");
      setRoleCache(creep, "builder", "buildTarget", "target2");
      
      deleteRoleCache(creep, "builder");
      
      assert.isUndefined(getRoleCache(creep, "builder", "repairTarget"));
      assert.isUndefined(getRoleCache(creep, "builder", "buildTarget"));
    });

    it("should clear all caches for a role type", () => {
      const creep1 = createMockCreep("builder1");
      const creep2 = createMockCreep("builder2");
      const creep3 = createMockCreep("miner1");
      
      setRoleCache(creep1, "builder", "target", "t1");
      setRoleCache(creep2, "builder", "target", "t2");
      setRoleCache(creep3, "miner", "target", "t3");
      
      clearRoleTypeCache("builder");
      
      assert.isUndefined(getRoleCache(creep1, "builder", "target"));
      assert.isUndefined(getRoleCache(creep2, "builder", "target"));
      assert.equal(getRoleCache(creep3, "miner", "target"), "t3"); // Not affected
    });
  });

  describe("cache checking", () => {
    it("should check if cache exists", () => {
      const creep = createMockCreep("builder1");
      
      assert.isFalse(hasRoleCache(creep, "builder", "repairTarget"));
      
      setRoleCache(creep, "builder", "repairTarget", "target123");
      assert.isTrue(hasRoleCache(creep, "builder", "repairTarget"));
    });

    it("should return false for expired cache", () => {
      const creep = createMockCreep("builder1");
      
      setRoleCache(creep, "builder", "repairTarget", "target123", 5);
      assert.isTrue(hasRoleCache(creep, "builder", "repairTarget"));
      
      // After expiration
      // @ts-ignore
      global.Game.time = 1006;
      assert.isFalse(hasRoleCache(creep, "builder", "repairTarget"));
    });
  });

  describe("statistics", () => {
    it("should track cache statistics", () => {
      const creep1 = createMockCreep("builder1");
      const creep2 = createMockCreep("builder2");
      const creep3 = createMockCreep("miner1");
      
      setRoleCache(creep1, "builder", "target1", "t1");
      setRoleCache(creep1, "builder", "target2", "t2");
      setRoleCache(creep2, "builder", "target1", "t3");
      setRoleCache(creep3, "miner", "source", "s1");
      
      const stats = getRoleCacheStats();
      
      assert.equal(stats.roles, 2); // builder and miner
      assert.equal(stats.creeps, 3);
      assert.equal(stats.totalEntries, 4);
      assert.equal(stats.entriesByRole.builder, 3);
      assert.equal(stats.entriesByRole.miner, 1);
    });
  });

  describe("helper functions", () => {
    describe("getCachedRepairTarget", () => {
      it("should return cached target if valid", () => {
        const creep = createMockCreep("builder1");
        const mockStructure = {
          id: "struct1" as Id<Structure>,
          hits: 100,
          hitsMax: 1000
        } as Structure;
        
        // Mock Game.getObjectById
        // @ts-ignore
        global.Game.getObjectById = (id: Id<any>) => {
          if (id === mockStructure.id) return mockStructure;
          return null;
        };
        
        // Set cache
        setRoleCache(creep, "builder", "repairTarget", mockStructure.id);
        
        // Should return cached target
        const target = getCachedRepairTarget(creep, () => null);
        assert.equal(target?.id, mockStructure.id);
      });

      it("should compute new target if cache invalid", () => {
        const creep = createMockCreep("builder1");
        const mockStructure = {
          id: "struct1" as Id<Structure>,
          hits: 100,
          hitsMax: 1000
        } as Structure;
        
        let computeCalled = false;
        const computeFn = () => {
          computeCalled = true;
          return mockStructure;
        };
        
        // @ts-ignore
        global.Game.getObjectById = () => mockStructure;
        
        const target = getCachedRepairTarget(creep, computeFn);
        
        assert.isTrue(computeCalled);
        assert.equal(target?.id, mockStructure.id);
        
        // Verify it was cached
        assert.isTrue(hasRoleCache(creep, "builder", "repairTarget"));
      });

      it("should invalidate cache if structure fully repaired", () => {
        const creep = createMockCreep("builder1");
        const mockStructure = {
          id: "struct1" as Id<Structure>,
          hits: 1000,
          hitsMax: 1000 // Fully repaired
        } as Structure;
        
        // @ts-ignore
        global.Game.getObjectById = () => mockStructure;
        
        // Set cache with damaged structure ID
        setRoleCache(creep, "builder", "repairTarget", mockStructure.id);
        
        let computeCalled = false;
        const target = getCachedRepairTarget(creep, () => {
          computeCalled = true;
          return null;
        });
        
        // Should compute new target since cached structure is fully repaired
        assert.isTrue(computeCalled);
        assert.isNull(target);
      });
    });

    describe("getCachedBuildTarget", () => {
      it("should return cached site if valid", () => {
        const creep = createMockCreep("builder1");
        const mockSite = {
          id: "site1" as Id<ConstructionSite>
        } as ConstructionSite;
        
        // @ts-ignore
        global.Game.getObjectById = () => mockSite;
        
        setRoleCache(creep, "builder", "buildTarget", mockSite.id);
        
        const target = getCachedBuildTarget(creep, () => null);
        assert.equal(target?.id, mockSite.id);
      });

      it("should compute new target if cache invalid", () => {
        const creep = createMockCreep("builder1");
        const mockSite = {
          id: "site1" as Id<ConstructionSite>
        } as ConstructionSite;
        
        let computeCalled = false;
        const target = getCachedBuildTarget(creep, () => {
          computeCalled = true;
          return mockSite;
        });
        
        assert.isTrue(computeCalled);
        assert.equal(target?.id, mockSite.id);
        assert.isTrue(hasRoleCache(creep, "builder", "buildTarget"));
      });
    });

    describe("getAssignedSource", () => {
      it("should assign and return source", () => {
        const creep = createMockCreep("miner1");
        const sourceId = "source1" as Id<Source>;
        const mockSource = { id: sourceId } as Source;
        
        // @ts-ignore
        global.Game.getObjectById = () => mockSource;
        
        const source = getAssignedSource(creep, sourceId);
        assert.equal(source?.id, sourceId);
        
        // Should be cached
        assert.isTrue(hasRoleCache(creep, "miner", "assignedSource"));
      });

      it("should return cached source", () => {
        const creep = createMockCreep("miner1");
        const sourceId = "source1" as Id<Source>;
        const mockSource = { id: sourceId } as Source;
        
        // @ts-ignore
        global.Game.getObjectById = () => mockSource;
        
        // Set cache
        setRoleCache(creep, "miner", "assignedSource", sourceId);
        
        // Should return cached without needing to pass sourceId
        const source = getAssignedSource(creep);
        assert.equal(source?.id, sourceId);
      });
    });

    describe("clearTargetCaches", () => {
      it("should clear multiple target caches", () => {
        const creep = createMockCreep("builder1");
        
        setRoleCache(creep, "builder", "repairTarget", "t1");
        setRoleCache(creep, "builder", "buildTarget", "t2");
        setRoleCache(creep, "builder", "otherData", "t3");
        
        clearTargetCaches(creep, "builder", ["repairTarget", "buildTarget"]);
        
        assert.isFalse(hasRoleCache(creep, "builder", "repairTarget"));
        assert.isFalse(hasRoleCache(creep, "builder", "buildTarget"));
        assert.isTrue(hasRoleCache(creep, "builder", "otherData")); // Not cleared
      });
    });
  });
});
