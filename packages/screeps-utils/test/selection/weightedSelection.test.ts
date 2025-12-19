import { expect } from 'chai';
import {
  weightedSelection,
  selectTopN,
  normalizeWeights,
  scaleWeights,
  getHighest,
  getLowest,
  WeightedEntry
} from '../../src/selection/weightedSelection';
import { resetRandom } from '../../src/selection/random';

// Mock Game global
(global as any).Game = {
  time: 1000
};

describe('Weighted Selection Utilities', () => {
  beforeEach(() => {
    resetRandom();
    (global as any).Game.time = 1000;
  });

  describe('weightedSelection()', () => {
    it('should select from weighted entries', () => {
      const entries: WeightedEntry<string>[] = [
        { key: 'a', weight: 0.7 },
        { key: 'b', weight: 0.3 }
      ];
      const selected = weightedSelection(entries);
      expect(selected).to.be.oneOf(['a', 'b']);
    });

    it('should return undefined for empty array', () => {
      const selected = weightedSelection([]);
      expect(selected).to.be.undefined;
    });

    it('should ignore zero and negative weights', () => {
      const entries: WeightedEntry<string>[] = [
        { key: 'a', weight: 1 },
        { key: 'b', weight: 0 },
        { key: 'c', weight: -1 }
      ];
      const selected = weightedSelection(entries);
      expect(selected).to.equal('a');
    });

    it('should return undefined if all weights are zero or negative', () => {
      const entries: WeightedEntry<string>[] = [
        { key: 'a', weight: 0 },
        { key: 'b', weight: -1 }
      ];
      const selected = weightedSelection(entries);
      expect(selected).to.be.undefined;
    });
  });

  describe('selectTopN()', () => {
    it('should select top N entries by weight', () => {
      const entries: WeightedEntry<string>[] = [
        { key: 'a', weight: 5 },
        { key: 'b', weight: 3 },
        { key: 'c', weight: 8 },
        { key: 'd', weight: 1 }
      ];
      const top2 = selectTopN(entries, 2);
      expect(top2).to.have.lengthOf(2);
      expect(top2).to.include('c'); // highest weight
      expect(top2).to.include('a'); // second highest
    });

    it('should return all entries if N exceeds array length', () => {
      const entries: WeightedEntry<string>[] = [
        { key: 'a', weight: 5 },
        { key: 'b', weight: 3 }
      ];
      const top10 = selectTopN(entries, 10);
      expect(top10).to.have.lengthOf(2);
    });
  });

  describe('normalizeWeights()', () => {
    it('should normalize weights to sum to 1', () => {
      const entries: WeightedEntry<string>[] = [
        { key: 'a', weight: 2 },
        { key: 'b', weight: 3 },
        { key: 'c', weight: 5 }
      ];
      const normalized = normalizeWeights(entries);
      const sum = normalized.reduce((acc, e) => acc + e.weight, 0);
      expect(sum).to.be.closeTo(1, 0.0001);
    });

    it('should filter out zero and negative weights', () => {
      const entries: WeightedEntry<string>[] = [
        { key: 'a', weight: 2 },
        { key: 'b', weight: 0 },
        { key: 'c', weight: -1 }
      ];
      const normalized = normalizeWeights(entries);
      expect(normalized).to.have.lengthOf(1);
      expect(normalized[0].key).to.equal('a');
      expect(normalized[0].weight).to.equal(1);
    });
  });

  describe('scaleWeights()', () => {
    it('should scale all weights by a factor', () => {
      const entries: WeightedEntry<string>[] = [
        { key: 'a', weight: 2 },
        { key: 'b', weight: 4 }
      ];
      const scaled = scaleWeights(entries, 2);
      expect(scaled[0].weight).to.equal(4);
      expect(scaled[1].weight).to.equal(8);
    });

    it('should not produce negative weights', () => {
      const entries: WeightedEntry<string>[] = [
        { key: 'a', weight: 2 }
      ];
      const scaled = scaleWeights(entries, -1);
      expect(scaled[0].weight).to.equal(0);
    });
  });

  describe('getHighest()', () => {
    it('should return entry with highest weight', () => {
      const entries: WeightedEntry<string>[] = [
        { key: 'a', weight: 2 },
        { key: 'b', weight: 5 },
        { key: 'c', weight: 3 }
      ];
      const highest = getHighest(entries);
      expect(highest?.key).to.equal('b');
      expect(highest?.weight).to.equal(5);
    });

    it('should return undefined for empty array', () => {
      const highest = getHighest([]);
      expect(highest).to.be.undefined;
    });
  });

  describe('getLowest()', () => {
    it('should return entry with lowest positive weight', () => {
      const entries: WeightedEntry<string>[] = [
        { key: 'a', weight: 2 },
        { key: 'b', weight: 5 },
        { key: 'c', weight: 3 }
      ];
      const lowest = getLowest(entries);
      expect(lowest?.key).to.equal('a');
      expect(lowest?.weight).to.equal(2);
    });

    it('should ignore zero and negative weights', () => {
      const entries: WeightedEntry<string>[] = [
        { key: 'a', weight: 0 },
        { key: 'b', weight: 5 },
        { key: 'c', weight: -1 }
      ];
      const lowest = getLowest(entries);
      expect(lowest?.key).to.equal('b');
    });

    it('should return undefined for empty array', () => {
      const lowest = getLowest([]);
      expect(lowest).to.be.undefined;
    });
  });
});
