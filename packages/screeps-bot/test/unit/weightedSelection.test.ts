/**
 * Unit tests for weighted selection utilities
 */

import { assert } from "chai";
import {
  weightedSelection,
  weightedSelectionEntry,
  selectTopN,
  selectTopNEntries,
  normalizeWeights,
  scaleWeights,
  addBonusWeight,
  combineWeights,
  fromRecord,
  toRecord,
  filterByMinWeight,
  getHighest,
  getLowest,
  applyDecay,
  clampWeights,
  type WeightedEntry
} from "../../src/utils/common/weightedSelection";
import { resetRandom } from "../../src/utils/common/random";

// Type for global with Game mock
interface GlobalWithGame {
  Game?: { time: number };
}

describe("Weighted Selection Utilities", () => {
  beforeEach(() => {
    // Reset random state for deterministic tests
    resetRandom();
    (global as GlobalWithGame).Game = { time: 100 };
  });

  describe("weightedSelection", () => {
    it("should select from weighted entries", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 10 },
        { key: "B", weight: 20 },
        { key: "C", weight: 30 }
      ];
      
      const selected = weightedSelection(entries);
      assert.isDefined(selected);
      assert.include(["A", "B", "C"], selected!);
    });

    it("should return undefined for empty array", () => {
      const selected = weightedSelection([]);
      assert.isUndefined(selected);
    });

    it("should ignore zero and negative weights", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 0 },
        { key: "B", weight: -5 },
        { key: "C", weight: 10 }
      ];
      
      const selected = weightedSelection(entries);
      assert.equal(selected, "C");
    });

    it("should return undefined when all weights are zero or negative", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 0 },
        { key: "B", weight: -5 }
      ];
      
      const selected = weightedSelection(entries);
      assert.isUndefined(selected);
    });

    it("should handle single entry", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "Solo", weight: 100 }
      ];
      
      const selected = weightedSelection(entries);
      assert.equal(selected, "Solo");
    });
  });

  describe("weightedSelectionEntry", () => {
    it("should return the full entry", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 10 }
      ];
      
      const selected = weightedSelectionEntry(entries);
      assert.isDefined(selected);
      assert.equal(selected!.key, "A");
      assert.equal(selected!.weight, 10);
    });

    it("should return undefined for empty array", () => {
      const selected = weightedSelectionEntry([]);
      assert.isUndefined(selected);
    });
  });

  describe("selectTopN", () => {
    it("should select top N entries by weight", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 10 },
        { key: "B", weight: 30 },
        { key: "C", weight: 20 },
        { key: "D", weight: 5 }
      ];
      
      const top2 = selectTopN(entries, 2);
      assert.lengthOf(top2, 2);
      assert.include(top2, "B");
      assert.include(top2, "C");
    });

    it("should return all entries if N is larger than array length", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 10 },
        { key: "B", weight: 20 }
      ];
      
      const top5 = selectTopN(entries, 5);
      assert.lengthOf(top5, 2);
    });

    it("should handle N = 0", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 10 }
      ];
      
      const top0 = selectTopN(entries, 0);
      assert.lengthOf(top0, 0);
    });
  });

  describe("selectTopNEntries", () => {
    it("should return full entries sorted by weight", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 10 },
        { key: "B", weight: 30 },
        { key: "C", weight: 20 }
      ];
      
      const top = selectTopNEntries(entries, 2);
      assert.lengthOf(top, 2);
      assert.equal(top[0]!.key, "B");
      assert.equal(top[1]!.key, "C");
    });
  });

  describe("normalizeWeights", () => {
    it("should normalize weights to sum to 1", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 10 },
        { key: "B", weight: 20 },
        { key: "C", weight: 70 }
      ];
      
      const normalized = normalizeWeights(entries);
      const sum = normalized.reduce((acc, e) => acc + e.weight, 0);
      
      assert.approximately(sum, 1, 0.0001);
      assert.approximately(normalized[0]!.weight, 0.1, 0.0001);
      assert.approximately(normalized[1]!.weight, 0.2, 0.0001);
      assert.approximately(normalized[2]!.weight, 0.7, 0.0001);
    });

    it("should filter out zero and negative weights", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 0 },
        { key: "B", weight: -10 },
        { key: "C", weight: 50 }
      ];
      
      const normalized = normalizeWeights(entries);
      assert.lengthOf(normalized, 1);
      assert.equal(normalized[0]!.weight, 1);
    });

    it("should return empty array when all weights are zero or negative", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 0 },
        { key: "B", weight: -5 }
      ];
      
      const normalized = normalizeWeights(entries);
      assert.lengthOf(normalized, 0);
    });
  });

  describe("scaleWeights", () => {
    it("should scale all weights by factor", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 10 },
        { key: "B", weight: 20 }
      ];
      
      const scaled = scaleWeights(entries, 2);
      assert.equal(scaled[0]!.weight, 20);
      assert.equal(scaled[1]!.weight, 40);
    });

    it("should clamp negative results to zero", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 10 }
      ];
      
      const scaled = scaleWeights(entries, -1);
      assert.equal(scaled[0]!.weight, 0);
    });
  });

  describe("addBonusWeight", () => {
    it("should add bonus to matching entries", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 10 },
        { key: "B", weight: 20 }
      ];
      
      const bonused = addBonusWeight(
        entries,
        e => e.key === "A",
        5
      );
      
      assert.equal(bonused[0]!.weight, 15);
      assert.equal(bonused[1]!.weight, 20);
    });

    it("should clamp negative results to zero", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 10 }
      ];
      
      const bonused = addBonusWeight(
        entries,
        () => true,
        -20
      );
      
      assert.equal(bonused[0]!.weight, 0);
    });
  });

  describe("combineWeights", () => {
    it("should combine weights from multiple lists", () => {
      const list1: WeightedEntry<string>[] = [
        { key: "A", weight: 10 },
        { key: "B", weight: 20 }
      ];
      
      const list2: WeightedEntry<string>[] = [
        { key: "A", weight: 5 },
        { key: "C", weight: 15 }
      ];
      
      const combined = combineWeights([list1, list2]);
      
      const aEntry = combined.find(e => e.key === "A");
      const bEntry = combined.find(e => e.key === "B");
      const cEntry = combined.find(e => e.key === "C");
      
      assert.equal(aEntry!.weight, 15); // 10 + 5
      assert.equal(bEntry!.weight, 20);
      assert.equal(cEntry!.weight, 15);
    });

    it("should support custom combiner function", () => {
      const list1: WeightedEntry<string>[] = [
        { key: "A", weight: 10 }
      ];
      
      const list2: WeightedEntry<string>[] = [
        { key: "A", weight: 20 }
      ];
      
      const combined = combineWeights(
        [list1, list2],
        weights => Math.max(...weights)
      );
      
      assert.equal(combined[0]!.weight, 20);
    });
  });

  describe("fromRecord and toRecord", () => {
    it("should convert record to weighted entries", () => {
      const record = { A: 10, B: 20, C: 30 };
      const entries = fromRecord(record);
      
      assert.lengthOf(entries, 3);
      const aEntry = entries.find(e => e.key === "A");
      assert.equal(aEntry!.weight, 10);
    });

    it("should convert weighted entries to record", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 10 },
        { key: "B", weight: 20 }
      ];
      
      const record = toRecord(entries);
      assert.equal(record.A, 10);
      assert.equal(record.B, 20);
    });

    it("should round-trip correctly", () => {
      const original = { X: 100, Y: 200, Z: 300 };
      const entries = fromRecord(original);
      const result = toRecord(entries);
      
      assert.deepEqual(result, original);
    });
  });

  describe("filterByMinWeight", () => {
    it("should filter entries below minimum weight", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 5 },
        { key: "B", weight: 15 },
        { key: "C", weight: 25 }
      ];
      
      const filtered = filterByMinWeight(entries, 10);
      assert.lengthOf(filtered, 2);
      assert.include(filtered.map(e => e.key), "B");
      assert.include(filtered.map(e => e.key), "C");
    });

    it("should include entries exactly at minimum", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 10 }
      ];
      
      const filtered = filterByMinWeight(entries, 10);
      assert.lengthOf(filtered, 1);
    });
  });

  describe("getHighest", () => {
    it("should return entry with highest weight", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 10 },
        { key: "B", weight: 30 },
        { key: "C", weight: 20 }
      ];
      
      const highest = getHighest(entries);
      assert.equal(highest!.key, "B");
      assert.equal(highest!.weight, 30);
    });

    it("should return undefined for empty array", () => {
      const highest = getHighest([]);
      assert.isUndefined(highest);
    });

    it("should handle ties by returning first occurrence", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 30 },
        { key: "B", weight: 30 }
      ];
      
      const highest = getHighest(entries);
      assert.equal(highest!.key, "A");
    });
  });

  describe("getLowest", () => {
    it("should return entry with lowest positive weight", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 10 },
        { key: "B", weight: 30 },
        { key: "C", weight: 5 }
      ];
      
      const lowest = getLowest(entries);
      assert.equal(lowest!.key, "C");
      assert.equal(lowest!.weight, 5);
    });

    it("should ignore zero and negative weights", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 0 },
        { key: "B", weight: -5 },
        { key: "C", weight: 10 }
      ];
      
      const lowest = getLowest(entries);
      assert.equal(lowest!.key, "C");
    });

    it("should return undefined when no positive weights", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 0 },
        { key: "B", weight: -5 }
      ];
      
      const lowest = getLowest(entries);
      assert.isUndefined(lowest);
    });
  });

  describe("applyDecay", () => {
    it("should decay all weights by factor", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 100 },
        { key: "B", weight: 50 }
      ];
      
      const decayed = applyDecay(entries, 0.5);
      assert.equal(decayed[0]!.weight, 50);
      assert.equal(decayed[1]!.weight, 25);
    });

    it("should handle decay factor > 1 (growth)", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 10 }
      ];
      
      const decayed = applyDecay(entries, 2);
      assert.equal(decayed[0]!.weight, 20);
    });
  });

  describe("clampWeights", () => {
    it("should clamp weights to range", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 5 },
        { key: "B", weight: 50 },
        { key: "C", weight: 25 }
      ];
      
      const clamped = clampWeights(entries, 10, 30);
      assert.equal(clamped[0]!.weight, 10); // Clamped from 5
      assert.equal(clamped[1]!.weight, 30); // Clamped from 50
      assert.equal(clamped[2]!.weight, 25); // Unchanged
    });

    it("should handle values at boundaries", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 10 },
        { key: "B", weight: 30 }
      ];
      
      const clamped = clampWeights(entries, 10, 30);
      assert.equal(clamped[0]!.weight, 10);
      assert.equal(clamped[1]!.weight, 30);
    });
  });

  describe("Edge cases", () => {
    it("should handle very small weights", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 0.0001 },
        { key: "B", weight: 0.0002 }
      ];
      
      const normalized = normalizeWeights(entries);
      const sum = normalized.reduce((acc, e) => acc + e.weight, 0);
      assert.approximately(sum, 1, 0.0001);
    });

    it("should handle very large weights", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 1000000 },
        { key: "B", weight: 2000000 }
      ];
      
      const normalized = normalizeWeights(entries);
      assert.approximately(normalized[0]!.weight, 1/3, 0.0001);
      assert.approximately(normalized[1]!.weight, 2/3, 0.0001);
    });

    it("should handle empty array in fromRecord", () => {
      const record: Record<string, number> = {};
      const entries = fromRecord(record);
      assert.lengthOf(entries, 0);
    });

    it("should handle empty array in toRecord", () => {
      const entries: WeightedEntry<string>[] = [];
      const record = toRecord(entries);
      assert.deepEqual(record, {});
    });

    it("should handle combineWeights with empty lists", () => {
      const combined = combineWeights([]);
      assert.lengthOf(combined, 0);
    });

    it("should handle combineWeights with empty nested lists", () => {
      const combined = combineWeights([[], []]);
      assert.lengthOf(combined, 0);
    });

    it("should handle scaleWeights with factor 0", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 100 }
      ];
      const scaled = scaleWeights(entries, 0);
      assert.equal(scaled[0]!.weight, 0);
    });

    it("should handle filterByMinWeight with all entries below threshold", () => {
      const entries: WeightedEntry<string>[] = [
        { key: "A", weight: 1 },
        { key: "B", weight: 2 }
      ];
      const filtered = filterByMinWeight(entries, 10);
      assert.lengthOf(filtered, 0);
    });
  });
});
