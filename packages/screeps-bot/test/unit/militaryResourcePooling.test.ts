/**
 * Unit tests for Military Resource Pooling
 */

import { assert } from "chai";
import {
  calculateEnergyReservation,
  calculateBoostNeeds,
  getAvailableBoostMaterials,
  hasSufficientMilitaryEnergy,
  getMilitaryResourceSummary
} from "../../src/clusters/militaryResourcePooling";
import type { ClusterMemory } from "../../src/memory/schemas";

describe("Military Resource Pooling", () => {
  beforeEach(() => {
    // Setup basic Game mock
    (global as any).Game = {
      time: 1000,
      rooms: {},
      creeps: {}
    };
    (global as any).Memory = {
      colonies: {},
      rooms: {}
    };
  });

  describe("calculateEnergyReservation", () => {
    it("should return 0 for no threat", () => {
      const reservation = calculateEnergyReservation("W1N1", 0);
      assert.equal(reservation, 0, "No reservation for peaceful room");
    });

    it("should return increasing amounts for higher threat levels", () => {
      const level1 = calculateEnergyReservation("W1N1", 1);
      const level2 = calculateEnergyReservation("W1N1", 2);
      const level3 = calculateEnergyReservation("W1N1", 3);

      assert.equal(level1, 5000, "Level 1 threat reserves 5000");
      assert.equal(level2, 15000, "Level 2 threat reserves 15000");
      assert.equal(level3, 50000, "Level 3 threat reserves 50000");
    });

    // Note: Testing with active defense requests requires full memory manager setup
    // which is complex for unit tests. This is better tested at integration level.
    // The function will add +10000 energy when a defense request exists for the room.
  });

  describe("calculateBoostNeeds", () => {
    it("should calculate needs for defense squad", () => {
      const needs = calculateBoostNeeds("defense", 3);

      assert.isDefined(needs[RESOURCE_CATALYZED_GHODIUM_ALKALIDE], "Should need tough boost");
      assert.isDefined(needs[RESOURCE_CATALYZED_UTRIUM_ACID], "Should need attack boost");
      assert.isDefined(needs[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE], "Should need heal boost");
    });

    it("should scale needs based on squad size", () => {
      const small = calculateBoostNeeds("raid", 3);
      const large = calculateBoostNeeds("raid", 9);

      const smallAmount = small[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] ?? 0;
      const largeAmount = large[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] ?? 0;

      assert.isAbove(largeAmount, smallAmount, "Larger squad needs more boosts");
    });

    it("should handle siege operations with dismantle boosts", () => {
      const needs = calculateBoostNeeds("siege", 6);

      assert.isDefined(needs[RESOURCE_CATALYZED_ZYNTHIUM_ACID], "Should need dismantle boost");
      assert.isDefined(needs[RESOURCE_CATALYZED_GHODIUM_ALKALIDE], "Should need tough boost");
    });

    it("should return empty for unknown squad type", () => {
      const needs = calculateBoostNeeds("unknown" as any, 3);
      
      assert.isEmpty(Object.keys(needs), "Unknown type returns empty needs");
    });
  });

  describe("getAvailableBoostMaterials", () => {
    it("should return empty when no rooms have materials", () => {
      const cluster: Partial<ClusterMemory> = {
        memberRooms: ["W1N1"]
      };

      (global as any).Game.rooms = {
        W1N1: {
          terminal: {
            store: {
              getUsedCapacity: () => 0
            }
          }
        }
      };

      const available = getAvailableBoostMaterials(cluster as ClusterMemory);
      
      // All counts should be 0 or undefined
      const total = Object.values(available).reduce((sum, val) => sum + (val ?? 0), 0);
      assert.equal(total, 0, "No materials available");
    });

    it("should sum materials across terminal and storage", () => {
      const cluster: Partial<ClusterMemory> = {
        memberRooms: ["W1N1"]
      };

      (global as any).Game.rooms = {
        W1N1: {
          terminal: {
            store: {
              getUsedCapacity: (resource: ResourceConstant) => {
                if (resource === RESOURCE_CATALYZED_GHODIUM_ALKALIDE) return 300;
                return 0;
              }
            }
          },
          storage: {
            store: {
              getUsedCapacity: (resource: ResourceConstant) => {
                if (resource === RESOURCE_CATALYZED_GHODIUM_ALKALIDE) return 200;
                return 0;
              }
            }
          }
        }
      };

      const available = getAvailableBoostMaterials(cluster as ClusterMemory);
      
      assert.equal(
        available[RESOURCE_CATALYZED_GHODIUM_ALKALIDE],
        500,
        "Should sum terminal and storage"
      );
    });

    it("should aggregate across multiple rooms", () => {
      const cluster: Partial<ClusterMemory> = {
        memberRooms: ["W1N1", "W2N2"]
      };

      (global as any).Game.rooms = {
        W1N1: {
          terminal: {
            store: {
              getUsedCapacity: (resource: ResourceConstant) => {
                if (resource === RESOURCE_CATALYZED_GHODIUM_ALKALIDE) return 300;
                return 0;
              }
            }
          }
        },
        W2N2: {
          terminal: {
            store: {
              getUsedCapacity: (resource: ResourceConstant) => {
                if (resource === RESOURCE_CATALYZED_GHODIUM_ALKALIDE) return 400;
                return 0;
              }
            }
          }
        }
      };

      const available = getAvailableBoostMaterials(cluster as ClusterMemory);
      
      assert.equal(
        available[RESOURCE_CATALYZED_GHODIUM_ALKALIDE],
        700,
        "Should aggregate across rooms"
      );
    });
  });

  describe("hasSufficientMilitaryEnergy", () => {
    it("should return false when room has no storage", () => {
      (global as any).Game.rooms = {
        W1N1: {}
      };

      const result = hasSufficientMilitaryEnergy("W1N1", 10000);
      
      assert.isFalse(result, "No storage means insufficient");
    });

    // Note: Testing with specific energy levels requires full memory manager setup
    // The function calculates: available = storage.energy - calculateEnergyReservation(danger)
    // This is better tested at integration level with proper memory setup.
  });

  describe("getMilitaryResourceSummary", () => {
    // Note: These tests require full memory manager setup which is complex for unit tests
    // The summary function:
    // - Sums energy across all member room storages
    // - Calculates reserved energy based on danger levels
    // - Aggregates boost materials from terminals and storages
    // This is better tested at integration level with proper memory/game setup
    
    it("should return proper structure", () => {
      const cluster: Partial<ClusterMemory> = {
        memberRooms: []
      };

      const summary = getMilitaryResourceSummary(cluster as ClusterMemory);
      
      assert.isDefined(summary.totalEnergy, "Has totalEnergy field");
      assert.isDefined(summary.reservedEnergy, "Has reservedEnergy field");
      assert.isDefined(summary.availableEnergy, "Has availableEnergy field");
      assert.isDefined(summary.boostMaterials, "Has boostMaterials field");
    });
  });
});
