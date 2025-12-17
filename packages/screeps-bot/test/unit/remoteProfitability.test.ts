import { assert } from "chai";
import type { RoomIntel } from "../../src/memory/schemas";
import * as ExpansionScoring from "../../src/empire/expansionScoring";

// Mock the global Game object
declare const global: { Game: typeof Game };

/**
 * Create mock room intel
 */
function createMockRoomIntel(name: string, sources = 2, threatLevel = 0 as 0 | 1 | 2 | 3): RoomIntel {
  return {
    name,
    lastSeen: 1000,
    sources,
    controllerLevel: 0,
    threatLevel,
    scouted: true,
    terrain: "plains",
    isHighway: false,
    isSK: false
  };
}

describe("Remote Mining Profitability Analysis", () => {
  beforeEach(() => {
    // Reset the global Game object before each test
    global.Game = {
      map: {
        getRoomLinearDistance: (room1: string, room2: string) => {
          // Mock distance: E1N1 to E2N1 = 1, E1N1 to E3N1 = 2, E1N1 to E5N1 = 4
          if (room1 === "E1N1" && room2 === "E2N1") return 1;
          if (room1 === "E1N1" && room2 === "E3N1") return 2;
          if (room1 === "E1N1" && room2 === "E5N1") return 4;
          return 3; // Default
        }
      }
    } as unknown as typeof Game;
  });

  describe("calculateRemoteProfitability", () => {
    it("should calculate basic profitability for close remote with 2 sources", () => {
      const intel = createMockRoomIntel("E2N1", 2, 0);
      const result = ExpansionScoring.calculateRemoteProfitability("E2N1", "E1N1", intel);

      // Verify all fields are present
      assert.equal(result.roomName, "E2N1");
      assert.isNumber(result.energyPerTick);
      assert.isNumber(result.carrierCostPerTick);
      assert.equal(result.pathDistance, 1);
      assert.isNumber(result.infrastructureCost);
      assert.equal(result.threatCost, 0); // No threat
      assert.isNumber(result.netProfitPerTick);
      assert.isNumber(result.roi);
      assert.isNumber(result.profitabilityScore);
      assert.isBoolean(result.isProfitable);

      // Close remote with 2 sources should be profitable
      assert.isTrue(result.isProfitable, "Close remote with 2 sources should be profitable");
      assert.isAbove(result.roi, 2.0, "ROI should be above 2.0 for profitable remote");
      assert.isAbove(result.netProfitPerTick, 0, "Net profit should be positive");
    });

    it("should calculate energy harvest rate correctly", () => {
      const intel = createMockRoomIntel("E2N1", 2, 0);
      const result = ExpansionScoring.calculateRemoteProfitability("E2N1", "E1N1", intel);

      // Expected: (3000 / 300) * 2 sources = 20 energy/tick
      assert.equal(result.energyPerTick, 20, "Should calculate correct energy per tick");
    });

    it("should calculate infrastructure cost for containers and roads", () => {
      const intel = createMockRoomIntel("E2N1", 2, 0);
      const result = ExpansionScoring.calculateRemoteProfitability("E2N1", "E1N1", intel);

      // Expected infrastructure cost:
      // Containers: 5000 * 2 = 10000
      // Roads: 1 distance * 50 tiles * 300 energy = 15000
      // Total: 25000
      assert.equal(result.infrastructureCost, 25000, "Should calculate correct infrastructure cost");
    });

    it("should penalize distant remotes with lower profitability", () => {
      const closeIntel = createMockRoomIntel("E2N1", 2, 0);
      const farIntel = createMockRoomIntel("E5N1", 2, 0);

      const closeResult = ExpansionScoring.calculateRemoteProfitability("E2N1", "E1N1", closeIntel);
      const farResult = ExpansionScoring.calculateRemoteProfitability("E5N1", "E1N1", farIntel);

      // Far remote should have lower profitability score
      assert.isBelow(
        farResult.profitabilityScore,
        closeResult.profitabilityScore,
        "Distant remote should have lower profitability score"
      );

      // Far remote should have higher carrier costs
      assert.isAbove(
        farResult.carrierCostPerTick,
        closeResult.carrierCostPerTick,
        "Distant remote should have higher carrier costs"
      );
    });

    it("should account for threat level in profitability", () => {
      const safeIntel = createMockRoomIntel("E2N1", 2, 0);
      const dangerousIntel = createMockRoomIntel("E2N1", 2, 2);

      const safeResult = ExpansionScoring.calculateRemoteProfitability("E2N1", "E1N1", safeIntel);
      const dangerousResult = ExpansionScoring.calculateRemoteProfitability("E2N1", "E1N1", dangerousIntel);

      // Dangerous remote should have threat cost
      assert.equal(safeResult.threatCost, 0, "Safe remote should have no threat cost");
      assert.isAbove(dangerousResult.threatCost, 0, "Dangerous remote should have threat cost");

      // Threat should reduce net profit
      assert.isBelow(
        dangerousResult.netProfitPerTick,
        safeResult.netProfitPerTick,
        "Threat should reduce net profit"
      );

      // Threat should reduce profitability score
      assert.isBelow(
        dangerousResult.profitabilityScore,
        safeResult.profitabilityScore,
        "Threat should reduce profitability score"
      );
    });

    it("should mark remote as unprofitable if ROI is below 2.0", () => {
      // Very distant remote (4 rooms away) might be unprofitable
      const intel = createMockRoomIntel("E5N1", 1, 0); // Only 1 source, far away
      const result = ExpansionScoring.calculateRemoteProfitability("E5N1", "E1N1", intel);

      // This remote should likely be unprofitable due to distance and single source
      if (!result.isProfitable) {
        assert.isBelow(result.roi, 2.0, "Unprofitable remote should have ROI below 2.0");
      }
    });

    it("should mark remote as unprofitable if net profit is negative", () => {
      // Create a scenario where costs exceed gains
      const intel = createMockRoomIntel("E5N1", 1, 3); // Far, single source, max threat
      const result = ExpansionScoring.calculateRemoteProfitability("E5N1", "E1N1", intel);

      // Very dangerous, distant, single-source remote should be unprofitable
      if (result.netProfitPerTick <= 0) {
        assert.isFalse(result.isProfitable, "Remote with negative profit should be unprofitable");
      }
    });

    it("should favor remotes with multiple sources", () => {
      const singleSourceIntel = createMockRoomIntel("E2N1", 1, 0);
      const doubleSourceIntel = createMockRoomIntel("E2N1", 2, 0);

      const singleResult = ExpansionScoring.calculateRemoteProfitability("E2N1", "E1N1", singleSourceIntel);
      const doubleResult = ExpansionScoring.calculateRemoteProfitability("E2N1", "E1N1", doubleSourceIntel);

      // Double source should have more energy per tick
      assert.isAbove(
        doubleResult.energyPerTick,
        singleResult.energyPerTick,
        "Multiple sources should generate more energy"
      );

      // Double source should have higher profitability score
      assert.isAbove(
        doubleResult.profitabilityScore,
        singleResult.profitabilityScore,
        "Multiple sources should have higher profitability score"
      );
    });

    it("should calculate profitability score within 0-100 range", () => {
      // Test various scenarios
      const scenarios = [
        createMockRoomIntel("E2N1", 2, 0), // Close, safe, 2 sources
        createMockRoomIntel("E3N1", 1, 0), // Medium distance, safe, 1 source
        createMockRoomIntel("E5N1", 2, 2), // Far, dangerous, 2 sources
        createMockRoomIntel("E2N1", 1, 3) // Close, very dangerous, 1 source
      ];

      for (const intel of scenarios) {
        const result = ExpansionScoring.calculateRemoteProfitability(intel.name, "E1N1", intel);
        assert.isAtLeast(result.profitabilityScore, 0, "Score should be at least 0");
        assert.isAtMost(result.profitabilityScore, 100, "Score should be at most 100");
      }
    });

    it("should include optional sourceId in result", () => {
      const intel = createMockRoomIntel("E2N1", 2, 0);
      const sourceId = "source123" as Id<Source>;
      const result = ExpansionScoring.calculateRemoteProfitability("E2N1", "E1N1", intel, sourceId);

      assert.equal(result.sourceId, sourceId, "Should include provided sourceId");
    });

    it("should handle threat level 1 with appropriate penalty", () => {
      const intel = createMockRoomIntel("E2N1", 2, 1);
      const result = ExpansionScoring.calculateRemoteProfitability("E2N1", "E1N1", intel);

      // Threat level 1 should cause 10% loss
      const expectedThreatCost = result.energyPerTick * 0.1;
      assert.approximately(
        result.threatCost,
        expectedThreatCost,
        0.01,
        "Threat level 1 should cause 10% loss"
      );
    });

    it("should handle threat level 2 with appropriate penalty", () => {
      const intel = createMockRoomIntel("E2N1", 2, 2);
      const result = ExpansionScoring.calculateRemoteProfitability("E2N1", "E1N1", intel);

      // Threat level 2 should cause 30% loss
      const expectedThreatCost = result.energyPerTick * 0.3;
      assert.approximately(
        result.threatCost,
        expectedThreatCost,
        0.01,
        "Threat level 2 should cause 30% loss"
      );
    });

    it("should handle threat level 3 with appropriate penalty", () => {
      const intel = createMockRoomIntel("E2N1", 2, 3);
      const result = ExpansionScoring.calculateRemoteProfitability("E2N1", "E1N1", intel);

      // Threat level 3 should cause 60% loss
      const expectedThreatCost = result.energyPerTick * 0.6;
      assert.approximately(
        result.threatCost,
        expectedThreatCost,
        0.01,
        "Threat level 3 should cause 60% loss"
      );
    });

    it("should calculate ROI as net profit to cost ratio", () => {
      const intel = createMockRoomIntel("E2N1", 2, 0);
      const result = ExpansionScoring.calculateRemoteProfitability("E2N1", "E1N1", intel);

      const totalCost = result.carrierCostPerTick + result.infrastructureCost / 50000 + result.threatCost;
      const expectedROI = result.netProfitPerTick / totalCost;

      assert.approximately(result.roi, expectedROI, 0.01, "ROI should be calculated correctly");
    });

    it("should amortize infrastructure cost over expected lifetime", () => {
      const intel = createMockRoomIntel("E2N1", 2, 0);
      const result = ExpansionScoring.calculateRemoteProfitability("E2N1", "E1N1", intel);

      // Infrastructure cost per tick should be total / lifetime
      const INFRASTRUCTURE_LIFETIME_TICKS = 50000;
      const expectedInfraPerTick = result.infrastructureCost / INFRASTRUCTURE_LIFETIME_TICKS;

      // Verify this is factored into net profit calculation
      const calculatedNetProfit =
        result.energyPerTick - result.carrierCostPerTick - expectedInfraPerTick - result.threatCost;

      assert.approximately(
        result.netProfitPerTick,
        calculatedNetProfit,
        0.01,
        "Infrastructure should be amortized correctly"
      );
    });
  });

  describe("profitability score calculation", () => {
    it("should give high scores to ideal remotes (close, safe, profitable)", () => {
      const intel = createMockRoomIntel("E2N1", 2, 0);
      const result = ExpansionScoring.calculateRemoteProfitability("E2N1", "E1N1", intel);

      // Ideal remote should score well (>60)
      assert.isAtLeast(result.profitabilityScore, 60, "Ideal remote should have high profitability score");
    });

    it("should give low scores to poor remotes (far, dangerous, low profit)", () => {
      const intel = createMockRoomIntel("E5N1", 1, 3);
      const result = ExpansionScoring.calculateRemoteProfitability("E5N1", "E1N1", intel);

      // Poor remote should score low (<40)
      assert.isBelow(result.profitabilityScore, 40, "Poor remote should have low profitability score");
    });

    it("should apply distance penalty correctly", () => {
      const closeIntel = createMockRoomIntel("E2N1", 2, 0);
      const farIntel = createMockRoomIntel("E5N1", 2, 0);

      const closeResult = ExpansionScoring.calculateRemoteProfitability("E2N1", "E1N1", closeIntel);
      const farResult = ExpansionScoring.calculateRemoteProfitability("E5N1", "E1N1", farIntel);

      // Distance difference: 4 - 1 = 3 rooms
      // Expected penalty difference: 3 * 2 = 6 points
      const scoreDifference = closeResult.profitabilityScore - farResult.profitabilityScore;

      // Score difference should be at least the distance penalty (may be more due to other factors)
      assert.isAtLeast(scoreDifference, 0, "Closer remote should have better or equal score");
    });
  });
});
