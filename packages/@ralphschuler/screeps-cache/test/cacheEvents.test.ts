/**
 * Cache Events Integration Tests
 *
 * Tests for event-based cache invalidation functions
 */

import { assert } from "chai";
import { CacheCoherenceManager, CacheLayer } from "../../src/cache/CacheCoherence";
import { CacheManager } from "../../src/cache/CacheManager";

describe("CacheEvents - Invalidation Functions", () => {
  let coherence: CacheCoherenceManager;
  let objectCache: CacheManager;
  let pathCache: CacheManager;
  let roleCache: CacheManager;

  beforeEach(() => {
    // Setup Game mock
    const g = global as any;
    g.Game = {
      time: 1000,
      cpu: { bucket: 10000 },
      rooms: {},
      creeps: {},
      structures: {},
      getObjectById: () => null
    };
    g.Memory = {};
    g.STRUCTURE_TOWER = "tower";
    g.STRUCTURE_ROAD = "road";
    
    // Create fresh instances
    coherence = new CacheCoherenceManager();
    objectCache = new CacheManager('heap');
    pathCache = new CacheManager('heap');
    roleCache = new CacheManager('heap');
    
    // Register caches
    coherence.registerCache("object", objectCache, CacheLayer.L1);
    coherence.registerCache("path", pathCache, CacheLayer.L2);
    coherence.registerCache("role", roleCache, CacheLayer.L2);
  });

  describe("Creep-based Invalidation", () => {
    it("should invalidate creep-related caches", () => {
      // Setup: Add some creep data to caches
      objectCache.set("creep:Worker1", { name: "Worker1" }, { namespace: "object" });
      roleCache.set("W1N1:harvester:Worker1", { target: "source1" }, { namespace: "role" });
      
      // Simulate event handler invalidation
      coherence.invalidate({
        type: "creep",
        creepName: "Worker1",
        namespaces: ["object", "role"]
      });
      
      // Verify caches were invalidated
      const objectValue = objectCache.get("creep:Worker1", { namespace: "object" });
      assert.isUndefined(objectValue);
    });
  });

  describe("Structure-based Invalidation", () => {
    it("should invalidate structure and path caches", () => {
      // Setup: Add structure and path data
      objectCache.set("structure:123", { type: "tower" }, { namespace: "object" });
      pathCache.set("W1N1:1,2:W1N1:3,4", "path1", { namespace: "path" });
      
      // Simulate structure destroyed invalidation
      coherence.invalidate({
        type: "object",
        objectId: "structure:123",
        namespaces: ["object"]
      });
      
      coherence.invalidate({
        type: "room",
        roomName: "W1N1",
        namespaces: ["path"]
      });
      
      // Verify invalidation
      const structValue = objectCache.get("structure:123", { namespace: "object" });
      assert.isUndefined(structValue);
      
      const pathValue = pathCache.get("W1N1:1,2:W1N1:3,4", { namespace: "path" });
      assert.isUndefined(pathValue);
    });
  });

  describe("Room-based Invalidation", () => {
    it("should invalidate path caches for a room", () => {
      // Setup: Add path data
      pathCache.set("W1N1:1,2:W1N1:3,4", "path1", { namespace: "path" });
      pathCache.set("W2N2:5,6:W2N2:7,8", "path2", { namespace: "path" });
      
      // Simulate construction complete invalidation
      coherence.invalidate({
        type: "room",
        roomName: "W1N1",
        namespaces: ["path"]
      });
      
      // W1N1 paths should be invalidated
      const path1 = pathCache.get("W1N1:1,2:W1N1:3,4", { namespace: "path" });
      assert.isUndefined(path1);
      
      // W2N2 paths should remain
      const path2 = pathCache.get("W2N2:5,6:W2N2:7,8", { namespace: "path" });
      assert.equal(path2, "path2");
    });
  });

  describe("Multiple Sequential Invalidations", () => {
    it("should handle multiple invalidations correctly", () => {
      // Setup
      objectCache.set("creep:Worker1", "data1", { namespace: "object" });
      objectCache.set("creep:Worker2", "data2", { namespace: "object" });
      pathCache.set("W1N1:path", "path1", { namespace: "path" });
      
      // Invalidate creep
      coherence.invalidate({
        type: "creep",
        creepName: "Worker1",
        namespaces: ["object"]
      });
      
      // Invalidate room paths
      coherence.invalidate({
        type: "room",
        roomName: "W1N1",
        namespaces: ["path"]
      });
      
      // Worker1 should be gone
      assert.isUndefined(objectCache.get("creep:Worker1", { namespace: "object" }));
      
      // Worker2 should remain
      assert.equal(objectCache.get("creep:Worker2", { namespace: "object" }), "data2");
      
      // Path should be gone
      assert.isUndefined(pathCache.get("W1N1:path", { namespace: "path" }));
    });
  });
});
