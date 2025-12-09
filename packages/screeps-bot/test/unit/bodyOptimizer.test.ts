import { assert } from "chai";
import {
  optimizeBody,
  optimizeHarvesterBody,
  optimizeHaulerBody,
  optimizeUpgraderBody,
  optimizeCombatBody,
  validateBody,
  calculateBodyCost,
  generateBodyTiers
} from "../../src/spawning/bodyOptimizer";

describe("BodyOptimizer", () => {
  describe("calculateBodyCost", () => {
    it("should calculate correct cost for simple body", () => {
      const parts = [WORK, CARRY, MOVE];
      const cost = calculateBodyCost(parts);
      assert.equal(cost, 200); // 100 + 50 + 50
    });

    it("should calculate correct cost for complex body", () => {
      const parts = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
      const cost = calculateBodyCost(parts);
      assert.equal(cost, 550); // 300 (3*WORK) + 100 (2*CARRY) + 150 (3*MOVE)
    });
  });

  describe("optimizeHarvesterBody", () => {
    it("should create optimal harvester for 300 energy", () => {
      const body = optimizeHarvesterBody({
        maxEnergy: 300,
        role: "harvester"
      });

      assert.isTrue(body.cost <= 300, `Body cost ${body.cost} should be <= 300`);
      assert.isAtLeast(body.parts.filter(p => p === WORK).length, 2);
      assert.isAtLeast(body.parts.filter(p => p === MOVE).length, 1);
    });

    it("should create optimal harvester for 800 energy", () => {
      const body = optimizeHarvesterBody({
        maxEnergy: 800,
        role: "harvester"
      });

      assert.isTrue(body.cost <= 800);
      // Should have multiple WORK parts for efficient mining
      assert.isAtLeast(body.parts.filter(p => p === WORK).length, 5);
    });

    it("should not exceed max body parts", () => {
      const body = optimizeHarvesterBody({
        maxEnergy: 5000,
        role: "harvester"
      });

      assert.isAtMost(body.parts.length, 50);
    });
  });

  describe("optimizeHaulerBody", () => {
    it("should scale hauler body with distance", () => {
      const shortDistance = optimizeHaulerBody({
        maxEnergy: 1000,
        role: "hauler",
        distance: 5,
        hasRoads: false
      });

      const longDistance = optimizeHaulerBody({
        maxEnergy: 1000,
        role: "hauler",
        distance: 20,
        hasRoads: false
      });

      // Long distance should have more CARRY parts
      const shortCarry = shortDistance.parts.filter(p => p === CARRY).length;
      const longCarry = longDistance.parts.filter(p => p === CARRY).length;

      assert.isTrue(longCarry > shortCarry, "Long distance hauler should have more CARRY");
    });

    it("should optimize for roads", () => {
      const noRoads = optimizeHaulerBody({
        maxEnergy: 800,
        role: "hauler",
        distance: 10,
        hasRoads: false
      });

      const withRoads = optimizeHaulerBody({
        maxEnergy: 800,
        role: "hauler",
        distance: 10,
        hasRoads: true
      });

      // With roads, should have more CARRY per MOVE
      const noRoadsRatio = noRoads.parts.filter(p => p === CARRY).length / noRoads.parts.filter(p => p === MOVE).length;
      const withRoadsRatio = withRoads.parts.filter(p => p === CARRY).length / withRoads.parts.filter(p => p === MOVE).length;

      assert.isTrue(withRoadsRatio > noRoadsRatio, "Roads should allow higher CARRY:MOVE ratio");
    });

    it("should respect energy budget", () => {
      const body = optimizeHaulerBody({
        maxEnergy: 500,
        role: "hauler",
        distance: 15,
        hasRoads: false
      });

      assert.isAtMost(body.cost, 500);
    });
  });

  describe("optimizeUpgraderBody", () => {
    it("should create balanced upgrader body", () => {
      const body = optimizeUpgraderBody({
        maxEnergy: 800,
        role: "upgrader"
      });

      const work = body.parts.filter(p => p === WORK).length;
      const carry = body.parts.filter(p => p === CARRY).length;
      const move = body.parts.filter(p => p === MOVE).length;

      // Should have more WORK than CARRY
      assert.isTrue(work > carry);
      // Should have MOVE parts
      assert.isAtLeast(move, 1);
      // Should not exceed budget
      assert.isAtMost(body.cost, 800);
    });

    it("should cap WORK parts at reasonable level", () => {
      const body = optimizeUpgraderBody({
        maxEnergy: 5000,
        role: "upgrader"
      });

      const work = body.parts.filter(p => p === WORK).length;
      // Max 15 WORK (controller downgrade threshold)
      assert.isAtMost(work, 15);
    });
  });

  describe("optimizeCombatBody", () => {
    it("should create combat body without boost", () => {
      const body = optimizeCombatBody({
        maxEnergy: 800,
        role: "soldier",
        willBoost: false
      });

      const tough = body.parts.filter(p => p === TOUGH).length;
      const attack = body.parts.filter(p => p === ATTACK).length;
      const move = body.parts.filter(p => p === MOVE).length;

      assert.isAtLeast(tough, 1, "Should have TOUGH parts");
      assert.isAtLeast(attack, 1, "Should have ATTACK parts");
      assert.isAtLeast(move, 1, "Should have MOVE parts");
      assert.isAtMost(body.cost, 800);
    });

    it("should optimize for boosting", () => {
      const unboosted = optimizeCombatBody({
        maxEnergy: 1000,
        role: "soldier",
        willBoost: false
      });

      const boosted = optimizeCombatBody({
        maxEnergy: 1000,
        role: "soldier",
        willBoost: true
      });

      const unboostedTough = unboosted.parts.filter(p => p === TOUGH).length;
      const boostedTough = boosted.parts.filter(p => p === TOUGH).length;

      // Boosted should prioritize TOUGH (cheap and effective when boosted)
      assert.isTrue(boostedTough >= unboostedTough, "Boosted body should have more TOUGH");
    });
  });

  describe("optimizeBody", () => {
    it("should route to correct optimizer for harvester", () => {
      const body = optimizeBody({
        maxEnergy: 500,
        role: "harvester"
      });

      const work = body.parts.filter(p => p === WORK).length;
      assert.isAtLeast(work, 2, "Harvester should have WORK parts");
    });

    it("should route to correct optimizer for hauler", () => {
      const body = optimizeBody({
        maxEnergy: 500,
        role: "hauler"
      });

      const carry = body.parts.filter(p => p === CARRY).length;
      assert.isAtLeast(carry, 2, "Hauler should have CARRY parts");
    });

    it("should route to correct optimizer for upgrader", () => {
      const body = optimizeBody({
        maxEnergy: 500,
        role: "upgrader"
      });

      const work = body.parts.filter(p => p === WORK).length;
      const carry = body.parts.filter(p => p === CARRY).length;

      assert.isAtLeast(work, 1, "Upgrader should have WORK");
      assert.isAtLeast(carry, 1, "Upgrader should have CARRY");
    });

    it("should handle unknown roles with default", () => {
      const body = optimizeBody({
        maxEnergy: 500,
        role: "unknownRole"
      });

      assert.isTrue(body.cost <= 500);
      assert.isAtLeast(body.parts.length, 1);
    });
  });

  describe("validateBody", () => {
    it("should validate correct body", () => {
      const body = {
        parts: [WORK, CARRY, MOVE],
        cost: 200,
        minCapacity: 200
      };

      assert.isTrue(validateBody(body));
    });

    it("should reject body with too many parts", () => {
      const parts = Array(51).fill(MOVE);
      const body = {
        parts,
        cost: 2550,
        minCapacity: 2550
      };

      assert.isFalse(validateBody(body));
    });

    it("should reject body with incorrect cost", () => {
      const body = {
        parts: [WORK, CARRY, MOVE],
        cost: 999, // Wrong cost
        minCapacity: 200
      };

      assert.isFalse(validateBody(body));
    });
  });

  describe("generateBodyTiers", () => {
    it("should generate multiple body tiers", () => {
      const tiers = generateBodyTiers("harvester", [300, 600, 1000]);

      assert.equal(tiers.length, 3);
      assert.isAtMost(tiers[0].cost, 300);
      assert.isAtMost(tiers[1].cost, 600);
      assert.isAtMost(tiers[2].cost, 1000);

      // Higher tiers should have more parts
      assert.isTrue(tiers[1].parts.length >= tiers[0].parts.length);
      assert.isTrue(tiers[2].parts.length >= tiers[1].parts.length);
    });

    it("should create valid bodies for all tiers", () => {
      const tiers = generateBodyTiers("hauler", [200, 400, 800]);

      for (const tier of tiers) {
        assert.isTrue(validateBody(tier));
      }
    });
  });
});
