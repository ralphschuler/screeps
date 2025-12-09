/**
 * Unit tests for Offensive Doctrine system
 */

import { assert } from "chai";
import {
  selectDoctrine,
  canLaunchDoctrine,
  getTargetPriority,
  getDoctrineComposition,
  DOCTRINE_CONFIGS
} from "../../src/clusters/offensiveDoctrine";
import type { ClusterMemory } from "../../src/memory/schemas";

describe("Offensive Doctrine", () => {
  describe("selectDoctrine", () => {
    it("should select harassment for weak targets", () => {
      const doctrine = selectDoctrine("W1N1", {
        towerCount: 0,
        spawnCount: 1,
        rcl: 3
      });

      assert.equal(doctrine, "harassment", "Should select harassment doctrine");
    });

    it("should select raid for medium targets", () => {
      const doctrine = selectDoctrine("W1N1", {
        towerCount: 2,
        spawnCount: 2,
        rcl: 5
      });

      assert.equal(doctrine, "raid", "Should select raid doctrine");
    });

    it("should select siege for strong targets", () => {
      const doctrine = selectDoctrine("W1N1", {
        towerCount: 4,
        spawnCount: 3,
        rcl: 7
      });

      assert.equal(doctrine, "siege", "Should select siege doctrine");
    });

    it("should default to harassment without intel", () => {
      const doctrine = selectDoctrine("W1N1");

      assert.equal(doctrine, "harassment", "Should default to harassment");
    });
  });

  describe("getDoctrineComposition", () => {
    it("should return correct composition for harassment", () => {
      const comp = getDoctrineComposition("harassment");

      assert.equal(comp.harassers, 3, "Should have 3 harassers");
      assert.equal(comp.rangers, 1, "Should have 1 ranger");
      assert.equal(comp.healers, 0, "Should have 0 healers");
      assert.equal(comp.siegeUnits, 0, "Should have 0 siege units");
    });

    it("should return correct composition for raid", () => {
      const comp = getDoctrineComposition("raid");

      assert.equal(comp.soldiers, 2, "Should have 2 soldiers");
      assert.equal(comp.rangers, 3, "Should have 3 rangers");
      assert.equal(comp.healers, 2, "Should have 2 healers");
    });

    it("should return correct composition for siege", () => {
      const comp = getDoctrineComposition("siege");

      assert.equal(comp.rangers, 4, "Should have 4 rangers");
      assert.equal(comp.healers, 3, "Should have 3 healers");
      assert.equal(comp.siegeUnits, 2, "Should have 2 siege units");
    });
  });

  describe("getTargetPriority", () => {
    it("should prioritize workers for harassment", () => {
      const workerPriority = getTargetPriority("harassment", "workers");
      const towerPriority = getTargetPriority("harassment", "towers");

      assert.isTrue(workerPriority > towerPriority, "Workers should be higher priority than towers");
    });

    it("should prioritize towers and spawns for siege", () => {
      const towerPriority = getTargetPriority("siege", "towers");
      const spawnPriority = getTargetPriority("siege", "spawns");
      const workerPriority = getTargetPriority("siege", "workers");

      assert.isTrue(towerPriority > workerPriority, "Towers should be higher priority than workers");
      assert.isTrue(spawnPriority > workerPriority, "Spawns should be higher priority than workers");
    });
  });

  describe("doctrine configs", () => {
    it("should have valid configurations for all doctrine types", () => {
      for (const [doctrine, config] of Object.entries(DOCTRINE_CONFIGS)) {
        assert.isDefined(config.composition, `${doctrine} should have composition`);
        assert.isDefined(config.targetPriority, `${doctrine} should have target priority`);
        assert.isNumber(config.minEnergy, `${doctrine} should have min energy`);
        assert.isBoolean(config.useBoosts, `${doctrine} should have useBoosts flag`);
        assert.isNumber(config.retreatThreshold, `${doctrine} should have retreat threshold`);
        
        // Validate retreat threshold is between 0 and 1
        assert.isTrue(
          config.retreatThreshold >= 0 && config.retreatThreshold <= 1,
          `${doctrine} retreat threshold should be between 0 and 1`
        );
      }
    });

    it("should have escalating energy requirements", () => {
      const harassmentEnergy = DOCTRINE_CONFIGS.harassment.minEnergy;
      const raidEnergy = DOCTRINE_CONFIGS.raid.minEnergy;
      const siegeEnergy = DOCTRINE_CONFIGS.siege.minEnergy;

      assert.isTrue(
        harassmentEnergy < raidEnergy && raidEnergy < siegeEnergy,
        "Energy requirements should escalate with doctrine intensity"
      );
    });
  });
});
