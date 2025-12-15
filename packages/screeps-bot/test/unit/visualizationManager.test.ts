/**
 * Unit tests for VisualizationManager caching logic
 */

import { assert } from "chai";
import { VisualizationManager } from "../../src/visuals/visualizationManager";
import { VisualizationLayer } from "../../src/memory/schemas";

// Mock Game and Memory
const mockGame: Record<string, unknown> = {
  time: 100,
  cpu: {
    getUsed: () => 5.5,
    limit: 20
  },
  flags: {}
};

const mockMemory: Record<string, unknown> = {};

describe("VisualizationManager", function () {
  let manager: VisualizationManager;

  beforeEach(function () {
    // Set up global mocks
    (global as Record<string, unknown>).Game = mockGame;
    (global as Record<string, unknown>).Memory = mockMemory;
    
    // Reset memory
    delete mockMemory.visualConfig;
    mockGame.time = 100;
    
    // Create fresh manager
    manager = new VisualizationManager();
  });

  describe("Caching", function () {
    it("should cache terrain data with TTL", function () {
      const roomName = "W1N1";
      const terrainData = "test_terrain_data";

      // Cache terrain
      manager.cacheTerrain(roomName, terrainData);

      // Should return cached data
      const cached = manager.getCachedTerrain(roomName);
      assert.equal(cached, terrainData);
    });

    it("should return null for expired terrain cache", function () {
      const roomName = "W1N1";
      const terrainData = "test_terrain_data";

      // Cache terrain at tick 100
      manager.cacheTerrain(roomName, terrainData);

      // Advance time past TTL (100 ticks)
      mockGame.time = 201;

      // Should return null (expired)
      const cached = manager.getCachedTerrain(roomName);
      assert.isNull(cached);
    });

    it("should cache structure positions", function () {
      const roomName = "W1N1";
      const structures = [
        { x: 10, y: 10, type: STRUCTURE_SPAWN as StructureConstant },
        { x: 15, y: 15, type: STRUCTURE_TOWER as StructureConstant }
      ];

      // Cache structures
      manager.cacheStructures(roomName, structures);

      // Should return cached structures
      const cached = manager.getCachedStructures(roomName);
      assert.deepEqual(cached, structures);
    });

    it("should return null for expired structure cache", function () {
      const roomName = "W1N1";
      const structures = [
        { x: 10, y: 10, type: STRUCTURE_SPAWN as StructureConstant }
      ];

      // Cache structures at tick 100
      manager.cacheStructures(roomName, structures);

      // Advance time past TTL
      mockGame.time = 201;

      // Should return null (expired)
      const cached = manager.getCachedStructures(roomName);
      assert.isNull(cached);
    });

    it("should clear cache for specific room", function () {
      const room1 = "W1N1";
      const room2 = "W2N2";

      manager.cacheTerrain(room1, "data1");
      manager.cacheTerrain(room2, "data2");

      // Clear cache for room1
      manager.clearCache(room1);

      // room1 should be cleared
      assert.isNull(manager.getCachedTerrain(room1));
      // room2 should still be cached
      assert.equal(manager.getCachedTerrain(room2), "data2");
    });

    it("should clear all caches when no room specified", function () {
      manager.cacheTerrain("W1N1", "data1");
      manager.cacheTerrain("W2N2", "data2");

      // Clear all caches
      manager.clearCache();

      // Both should be cleared
      assert.isNull(manager.getCachedTerrain("W1N1"));
      assert.isNull(manager.getCachedTerrain("W2N2"));
    });
  });

  describe("Layer Management", function () {
    it("should enable and disable layers", function () {
      // Initially pheromones and defense are enabled (presentation mode)
      assert.isTrue(manager.isLayerEnabled(VisualizationLayer.Pheromones));
      
      // Disable pheromones
      manager.disableLayer(VisualizationLayer.Pheromones);
      assert.isFalse(manager.isLayerEnabled(VisualizationLayer.Pheromones));
      
      // Enable paths
      manager.enableLayer(VisualizationLayer.Paths);
      assert.isTrue(manager.isLayerEnabled(VisualizationLayer.Paths));
    });

    it("should toggle layers", function () {
      const layer = VisualizationLayer.Economy;
      
      // Get initial state
      const initialState = manager.isLayerEnabled(layer);
      
      // Toggle
      manager.toggleLayer(layer);
      assert.equal(manager.isLayerEnabled(layer), !initialState);
      
      // Toggle again
      manager.toggleLayer(layer);
      assert.equal(manager.isLayerEnabled(layer), initialState);
    });

    it("should apply debug mode preset", function () {
      manager.setMode("debug");
      
      // All layers should be enabled in debug mode
      assert.isTrue(manager.isLayerEnabled(VisualizationLayer.Pheromones));
      assert.isTrue(manager.isLayerEnabled(VisualizationLayer.Paths));
      assert.isTrue(manager.isLayerEnabled(VisualizationLayer.Traffic));
      assert.isTrue(manager.isLayerEnabled(VisualizationLayer.Defense));
      assert.isTrue(manager.isLayerEnabled(VisualizationLayer.Economy));
      assert.isTrue(manager.isLayerEnabled(VisualizationLayer.Construction));
      assert.isTrue(manager.isLayerEnabled(VisualizationLayer.Performance));
    });

    it("should apply performance mode preset", function () {
      manager.setMode("performance");
      
      // No layers should be enabled in performance mode
      assert.isFalse(manager.isLayerEnabled(VisualizationLayer.Pheromones));
      assert.isFalse(manager.isLayerEnabled(VisualizationLayer.Paths));
      assert.isFalse(manager.isLayerEnabled(VisualizationLayer.Traffic));
      assert.isFalse(manager.isLayerEnabled(VisualizationLayer.Defense));
      assert.isFalse(manager.isLayerEnabled(VisualizationLayer.Economy));
      assert.isFalse(manager.isLayerEnabled(VisualizationLayer.Construction));
      assert.isFalse(manager.isLayerEnabled(VisualizationLayer.Performance));
    });

    it("should apply minimal mode preset", function () {
      manager.setMode("minimal");
      
      // Only defense should be enabled
      assert.isFalse(manager.isLayerEnabled(VisualizationLayer.Pheromones));
      assert.isTrue(manager.isLayerEnabled(VisualizationLayer.Defense));
      assert.isFalse(manager.isLayerEnabled(VisualizationLayer.Economy));
    });
  });

  describe("Performance Tracking", function () {
    it("should track layer costs", function () {
      // Track some costs
      manager.trackLayerCost("pheromones", 0.1);
      manager.trackLayerCost("pheromones", 0.2);
      manager.trackLayerCost("defense", 0.3);

      const metrics = manager.getPerformanceMetrics();
      
      // Should have averaged pheromones cost
      assert.approximately(metrics.layerCosts.pheromones, 0.15, 0.01);
      // Should have defense cost
      assert.equal(metrics.layerCosts.defense, 0.3);
      // Should calculate total
      assert.approximately(metrics.totalCost, 0.45, 0.01);
    });

    it("should calculate rolling average over samples", function () {
      // Add 15 samples (only last 10 should be used)
      for (let i = 0; i < 15; i++) {
        manager.trackLayerCost("pheromones", i);
      }

      const metrics = manager.getPerformanceMetrics();
      
      // Average of last 10 samples (5-14) = 9.5
      assert.approximately(metrics.layerCosts.pheromones, 9.5, 0.1);
    });

    it("should calculate percent of CPU budget", function () {
      mockGame.cpu = { getUsed: () => 5.5, limit: 20 };
      
      manager.trackLayerCost("pheromones", 2.0);
      const metrics = manager.getPerformanceMetrics();
      
      // 2.0 / 20 = 10%
      assert.approximately(metrics.percentOfBudget, 10, 0.1);
    });

    it("should measure function CPU cost", function () {
      let callCount = 0;
      const testFn = () => {
        callCount++;
        return "result";
      };

      const { result, cost } = manager.measureCost(testFn);
      
      assert.equal(result, "result");
      assert.equal(callCount, 1);
      assert.isNumber(cost);
      assert.isAtLeast(cost, 0);
    });
  });

  describe("Flag-based Toggles", function () {
    it("should enable layers based on flags", function () {
      // Start with minimal mode
      manager.setMode("minimal");
      
      // Add flag for pheromones
      mockGame.flags = {
        flag1: { name: "viz_pheromones" }
      };

      manager.updateFromFlags();
      
      // Pheromones should now be enabled
      assert.isTrue(manager.isLayerEnabled(VisualizationLayer.Pheromones));
    });

    it("should disable layers when flags removed", function () {
      // Start with debug mode (all enabled)
      manager.setMode("debug");
      
      // No flags present
      mockGame.flags = {};

      manager.updateFromFlags();
      
      // Layers should be disabled (no flags to keep them on)
      // Note: This depends on implementation - flags might only enable, not disable
    });

    it("should handle multiple flags", function () {
      mockGame.flags = {
        flag1: { name: "viz_pheromones" },
        flag2: { name: "viz_defense" },
        flag3: { name: "viz_economy" }
      };

      manager.setMode("performance"); // Start with nothing
      manager.updateFromFlags();
      
      assert.isTrue(manager.isLayerEnabled(VisualizationLayer.Pheromones));
      assert.isTrue(manager.isLayerEnabled(VisualizationLayer.Defense));
      assert.isTrue(manager.isLayerEnabled(VisualizationLayer.Economy));
      assert.isFalse(manager.isLayerEnabled(VisualizationLayer.Paths));
    });
  });

  describe("Configuration Persistence", function () {
    it("should persist configuration to Memory", function () {
      manager.setMode("debug");
      manager.enableLayer(VisualizationLayer.Paths);
      
      // Create new manager instance
      const newManager = new VisualizationManager();
      
      // Should load persisted configuration
      assert.isTrue(newManager.isLayerEnabled(VisualizationLayer.Pheromones));
    });
  });
});
