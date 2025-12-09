import { assert } from "chai";
import {
  calculatePathDistance,
  estimateRoundTripTicks,
  calculateRemoteHaulerRequirement,
  HAULER_TIERS
} from "../../src/empire/remoteHaulerDimensioning";

describe("remote hauler dimensioning", () => {
  describe("calculatePathDistance", () => {
    it("should calculate distance between adjacent rooms", () => {
      const distance = calculatePathDistance("E1N1", "E2N1");
      assert.equal(distance, 1, "Adjacent rooms should have distance 1");
    });

    it("should calculate distance between diagonal rooms", () => {
      const distance = calculatePathDistance("E1N1", "E2N2");
      assert.equal(distance, 2, "Diagonal rooms should have distance 2");
    });

    it("should calculate distance across quadrants", () => {
      const distance = calculatePathDistance("W1N1", "E1N1");
      assert.equal(distance, 2, "Rooms across W/E should have correct distance");
    });

    it("should handle same room", () => {
      const distance = calculatePathDistance("E1N1", "E1N1");
      assert.equal(distance, 0, "Same room should have distance 0");
    });

    it("should calculate long distances", () => {
      const distance = calculatePathDistance("E1N1", "E5N5");
      assert.equal(distance, 8, "Long distance should be calculated correctly");
    });
  });

  describe("estimateRoundTripTicks", () => {
    it("should estimate ticks for adjacent rooms", () => {
      const ticks = estimateRoundTripTicks(1, 1.0); // 1 room, all plains
      assert.isAbove(ticks, 0, "Should return positive ticks");
      assert.isBelow(ticks, 200, "Should be reasonable for 1 room");
    });

    it("should scale with distance", () => {
      const ticks1 = estimateRoundTripTicks(1, 1.0);
      const ticks2 = estimateRoundTripTicks(2, 1.0);
      
      assert.isAbove(ticks2, ticks1, "More distance should take more ticks");
      assert.approximately(ticks2, ticks1 * 2, 10, "Should scale roughly linearly");
    });

    it("should account for terrain factor", () => {
      const plainsTrip = estimateRoundTripTicks(1, 1.0);
      const swampTrip = estimateRoundTripTicks(1, 1.5);
      
      assert.isAbove(swampTrip, plainsTrip, "Swampy terrain should take longer");
    });

    it("should handle long distances", () => {
      const ticks = estimateRoundTripTicks(5, 1.2);
      assert.isAbove(ticks, 200, "Long distances should take many ticks");
      assert.isBelow(ticks, 1000, "Should not be unreasonably high");
    });
  });

  describe("calculateRemoteHaulerRequirement", () => {
    it("should calculate minimum haulers for short distance", () => {
      const result = calculateRemoteHaulerRequirement("E1N1", "E2N1", 2, 800);
      
      assert.isAtLeast(result.minHaulers, 1, "Should need at least 1 hauler");
      assert.equal(result.distance, 1, "Should calculate correct distance");
      assert.equal(result.energyPerTick, 20, "Should calculate energy per tick (2 sources * 10)");
    });

    it("should scale haulers with distance", () => {
      const shortDistance = calculateRemoteHaulerRequirement("E1N1", "E2N1", 2, 800);
      const longDistance = calculateRemoteHaulerRequirement("E1N1", "E5N1", 2, 800);
      
      assert.isAbove(
        longDistance.recommendedHaulers,
        shortDistance.recommendedHaulers,
        "Longer distance should need more haulers"
      );
    });

    it("should select appropriate hauler size based on energy", () => {
      const lowEnergy = calculateRemoteHaulerRequirement("E1N1", "E2N1", 2, 400);
      const highEnergy = calculateRemoteHaulerRequirement("E1N1", "E2N1", 2, 1600);
      
      assert.isBelow(
        lowEnergy.haulerConfig.capacity,
        highEnergy.haulerConfig.capacity,
        "Higher energy should select larger haulers"
      );
    });

    it("should scale haulers with source count", () => {
      const oneSource = calculateRemoteHaulerRequirement("E1N1", "E2N1", 1, 800);
      const twoSources = calculateRemoteHaulerRequirement("E1N1", "E2N1", 2, 800);
      
      assert.isAbove(
        twoSources.recommendedHaulers,
        oneSource.recommendedHaulers,
        "More sources should need more haulers"
      );
    });

    it("should calculate round trip ticks", () => {
      const result = calculateRemoteHaulerRequirement("E1N1", "E2N1", 2, 800);
      
      assert.isAbove(result.roundTripTicks, 0, "Should have positive round trip time");
    });

    it("should add buffer to minimum haulers", () => {
      const result = calculateRemoteHaulerRequirement("E1N1", "E2N1", 2, 800);
      
      assert.isAtLeast(
        result.recommendedHaulers,
        result.minHaulers,
        "Recommended should be at least minimum"
      );
    });
  });

  describe("HAULER_TIERS", () => {
    it("should have increasing capacities", () => {
      for (let i = 1; i < HAULER_TIERS.length; i++) {
        assert.isAbove(
          HAULER_TIERS[i].capacity,
          HAULER_TIERS[i - 1].capacity,
          "Each tier should have more capacity than previous"
        );
      }
    });

    it("should have balanced CARRY and MOVE parts", () => {
      for (const tier of HAULER_TIERS) {
        assert.equal(
          tier.carryParts,
          tier.moveParts,
          "Should have equal CARRY and MOVE parts for optimal speed"
        );
      }
    });

    it("should have correct capacity calculation", () => {
      for (const tier of HAULER_TIERS) {
        const expectedCapacity = tier.carryParts * 50;
        assert.equal(tier.capacity, expectedCapacity, "Capacity should be 50 per CARRY part");
      }
    });

    it("should have correct cost calculation", () => {
      for (const tier of HAULER_TIERS) {
        const expectedCost = tier.carryParts * 50 + tier.moveParts * 50;
        assert.equal(tier.cost, expectedCost, "Cost should be 50 per CARRY + 50 per MOVE");
      }
    });
  });

  describe("hauler efficiency calculations", () => {
    it("should handle very short distances efficiently", () => {
      const result = calculateRemoteHaulerRequirement("E1N1", "E2N1", 1, 1600);
      
      // For very short distances, shouldn't need many haulers
      assert.isAtMost(result.recommendedHaulers, 3, "Short distance should need few haulers");
    });

    it("should handle very long distances", () => {
      const result = calculateRemoteHaulerRequirement("E1N1", "E6N1", 2, 1600);
      
      // Long distances should need more haulers
      assert.isAtLeast(result.recommendedHaulers, 2, "Long distance should need multiple haulers");
    });

    it("should cap recommended haulers reasonably", () => {
      const result = calculateRemoteHaulerRequirement("E1N1", "E10N1", 3, 2400);
      
      // Even for very long distances, should cap at reasonable limit (sources * 2)
      assert.isAtMost(
        result.recommendedHaulers,
        result.energyPerTick / 10 * 2,
        "Should cap haulers at reasonable limit"
      );
    });
  });
});
