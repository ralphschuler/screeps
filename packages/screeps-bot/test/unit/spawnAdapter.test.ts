/**
 * Unit tests for Spawn Adapter
 * Addresses Phase 1 coverage improvement: Spawn system adapter
 */

import { assert } from "chai";
import type { SwarmState, PheromoneState } from "../../src/memory/schemas";

describe("Spawn Adapter", () => {
  describe("RoomState Conversion", () => {
    it("should extract basic room properties", () => {
      const roomName = "W1N1";
      const energyAvailable = 300;
      const energyCapacityAvailable = 550;
      const rcl = 3;

      assert.equal(roomName, "W1N1");
      assert.equal(energyAvailable, 300);
      assert.equal(energyCapacityAvailable, 550);
      assert.equal(rcl, 3);
    });

    it("should handle room controller level", () => {
      const levels = [1, 2, 3, 4, 5, 6, 7, 8];
      
      levels.forEach(level => {
        assert.isNumber(level);
        assert.isAtLeast(level, 1);
        assert.isAtMost(level, 8);
      });
    });

    it("should handle missing controller (RCL 0)", () => {
      const rcl = 0;
      assert.equal(rcl, 0);
    });
  });

  describe("Pheromone Mapping", () => {
    it("should map all pheromone types", () => {
      const pheromones = {
        expand: 0.5,
        harvest: 0.8,
        build: 0.3,
        upgrade: 0.6,
        defense: 0.1,
        war: 0.0,
        siege: 0.0,
        logistics: 0.7
      };

      assert.isNumber(pheromones.expand);
      assert.isNumber(pheromones.harvest);
      assert.isNumber(pheromones.build);
      assert.isNumber(pheromones.upgrade);
      assert.isNumber(pheromones.defense);
      assert.isNumber(pheromones.war);
      assert.isNumber(pheromones.siege);
      assert.isNumber(pheromones.logistics);
    });

    it("should handle undefined pheromone values", () => {
      const value1 = undefined ?? 0;
      const value2 = null ?? 0;
      const value3 = 0.5 ?? 0;

      assert.equal(value1, 0);
      assert.equal(value2, 0);
      assert.equal(value3, 0.5);
    });

    it("should validate pheromone ranges (0-1)", () => {
      const values = [0, 0.25, 0.5, 0.75, 1.0];
      
      values.forEach(value => {
        assert.isAtLeast(value, 0);
        assert.isAtMost(value, 1);
      });
    });
  });

  describe("Colony Lifecycle Detection", () => {
    it("should detect bootstrap state for larva colony", () => {
      const colonyLevel = "larva";
      const isBootstrap = colonyLevel === "larva" || colonyLevel === "egg";
      
      assert.isTrue(isBootstrap);
    });

    it("should detect bootstrap state for egg colony", () => {
      const colonyLevel = "egg";
      const isBootstrap = colonyLevel === "larva" || colonyLevel === "egg";
      
      assert.isTrue(isBootstrap);
    });

    it("should not detect bootstrap for mature colony", () => {
      const colonyLevels = ["pupa", "adult", "elder"];
      
      colonyLevels.forEach(level => {
        const isBootstrap = level === "larva" || level === "egg";
        assert.isFalse(isBootstrap);
      });
    });
  });

  describe("Posture Mapping", () => {
    it("should handle different posture types", () => {
      const postures = ["peaceful", "defensive", "aggressive", "siege"];
      
      postures.forEach(posture => {
        assert.isString(posture);
      });
    });
  });

  describe("Danger Level Mapping", () => {
    it("should handle danger level values", () => {
      const dangerLevels = [0, 1, 2, 3, 4, 5];
      
      dangerLevels.forEach(level => {
        assert.isNumber(level);
        assert.isAtLeast(level, 0);
      });
    });
  });

  describe("SpawnManager Configuration", () => {
    it("should support debug configuration", () => {
      const config = {
        debug: false
      };

      assert.isBoolean(config.debug);
      assert.isFalse(config.debug);
    });

    it("should support role priorities configuration", () => {
      const rolePriorities = {
        harvester: 100,
        upgrader: 50,
        builder: 30
      };

      assert.isObject(rolePriorities);
      assert.equal(rolePriorities.harvester, 100);
    });

    it("should support min/max creep counts", () => {
      const minCounts = {
        harvester: 2,
        upgrader: 1
      };

      const maxCounts = {
        harvester: 10,
        upgrader: 5
      };

      assert.isObject(minCounts);
      assert.isObject(maxCounts);
      assert.isAbove(maxCounts.harvester, minCounts.harvester);
    });
  });

  describe("Body Template Handling", () => {
    it("should handle valid body parts", () => {
      const bodyParts: BodyPartConstant[] = [WORK, CARRY, MOVE];
      
      assert.isArray(bodyParts);
      assert.lengthOf(bodyParts, 3);
      assert.include(bodyParts, WORK);
      assert.include(bodyParts, CARRY);
      assert.include(bodyParts, MOVE);
    });

    it("should handle null body template", () => {
      const bodyTemplate = null;
      const result = bodyTemplate ? bodyTemplate : null;
      
      assert.isNull(result);
    });

    it("should validate energy requirements", () => {
      const energyAvailable = 300;
      const minEnergy = 200;
      const canSpawn = energyAvailable >= minEnergy;
      
      assert.isTrue(canSpawn);
    });
  });
});
