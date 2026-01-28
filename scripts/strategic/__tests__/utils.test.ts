/**
 * Tests for Statistical Utility Functions
 */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
  average,
  standardDeviation,
  percentile,
  min,
  max,
  isStatisticallySignificant,
  percentChange
} from '../utils.js';

describe('Statistical Utilities', () => {
  describe('average', () => {
    it('should calculate average of numbers', () => {
      expect(average([1, 2, 3, 4, 5])).to.equal(3);
      expect(average([10, 20, 30])).to.equal(20);
    });

    it('should handle single value', () => {
      expect(average([42])).to.equal(42);
    });

    it('should return 0 for empty array', () => {
      expect(average([])).to.equal(0);
    });

    it('should handle negative numbers', () => {
      expect(average([-1, -2, -3])).to.equal(-2);
    });

    it('should handle decimal numbers', () => {
      const result = average([1.5, 2.5, 3.5]);
      expect(result).to.be.closeTo(2.5, 0.001);
    });
  });

  describe('standardDeviation', () => {
    it('should calculate standard deviation', () => {
      const result = standardDeviation([2, 4, 4, 4, 5, 5, 7, 9]);
      expect(result).to.be.closeTo(2.138, 0.01);
    });

    it('should return 0 for single value', () => {
      expect(standardDeviation([5])).to.equal(0);
    });

    it('should return 0 for empty array', () => {
      expect(standardDeviation([])).to.equal(0);
    });

    it('should return 0 for identical values', () => {
      expect(standardDeviation([5, 5, 5, 5])).to.equal(0);
    });

    it('should handle negative numbers', () => {
      const result = standardDeviation([-2, -1, 0, 1, 2]);
      expect(result).to.be.greaterThan(0);
    });
  });

  describe('percentile', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    it('should calculate 50th percentile (median)', () => {
      expect(percentile(data, 50)).to.equal(5.5);
    });

    it('should calculate 95th percentile', () => {
      const result = percentile(data, 95);
      expect(result).to.be.closeTo(9.55, 0.01);
    });

    it('should calculate 99th percentile', () => {
      const result = percentile(data, 99);
      expect(result).to.be.closeTo(9.91, 0.01);
    });

    it('should handle 0th percentile (min)', () => {
      expect(percentile(data, 0)).to.equal(1);
    });

    it('should handle 100th percentile (max)', () => {
      expect(percentile(data, 100)).to.equal(10);
    });

    it('should throw error for invalid percentile', () => {
      expect(() => percentile(data, -1)).to.throw();
      expect(() => percentile(data, 101)).to.throw();
    });

    it('should return 0 for empty array', () => {
      expect(percentile([], 50)).to.equal(0);
    });

    it('should handle single value', () => {
      expect(percentile([42], 50)).to.equal(42);
    });
  });

  describe('min', () => {
    it('should find minimum value', () => {
      expect(min([5, 2, 8, 1, 9])).to.equal(1);
    });

    it('should handle negative numbers', () => {
      expect(min([5, -2, 8, 1, -9])).to.equal(-9);
    });

    it('should return 0 for empty array', () => {
      expect(min([])).to.equal(0);
    });

    it('should handle single value', () => {
      expect(min([42])).to.equal(42);
    });
  });

  describe('max', () => {
    it('should find maximum value', () => {
      expect(max([5, 2, 8, 1, 9])).to.equal(9);
    });

    it('should handle negative numbers', () => {
      expect(max([-5, -2, -8, -1, -9])).to.equal(-1);
    });

    it('should return 0 for empty array', () => {
      expect(max([])).to.equal(0);
    });

    it('should handle single value', () => {
      expect(max([42])).to.equal(42);
    });
  });

  describe('isStatisticallySignificant', () => {
    it('should detect significant increase', () => {
      const result = isStatisticallySignificant(15, 10, 2, 1);
      expect(result.isSignificant).to.be.true;
      expect(result.direction).to.equal('higher');
    });

    it('should detect significant decrease', () => {
      const result = isStatisticallySignificant(5, 10, 2, 1);
      expect(result.isSignificant).to.be.true;
      expect(result.direction).to.equal('lower');
    });

    it('should detect stable (within 1 sigma)', () => {
      const result = isStatisticallySignificant(11, 10, 2, 1);
      expect(result.isSignificant).to.be.false;
      expect(result.direction).to.equal('stable');
    });

    it('should use different sigma multipliers', () => {
      // Within 1 sigma
      const result1 = isStatisticallySignificant(11, 10, 2, 1);
      expect(result1.isSignificant).to.be.false;

      // Same value, but 2 sigma threshold - still within range
      const result2 = isStatisticallySignificant(11, 10, 2, 2);
      expect(result2.isSignificant).to.be.false;

      // Outside 2 sigma
      const result3 = isStatisticallySignificant(16, 10, 2, 2);
      expect(result3.isSignificant).to.be.true;
    });
  });

  describe('percentChange', () => {
    it('should calculate positive percent change', () => {
      expect(percentChange(100, 120)).to.equal(20);
    });

    it('should calculate negative percent change', () => {
      expect(percentChange(100, 80)).to.equal(-20);
    });

    it('should handle zero baseline', () => {
      expect(percentChange(0, 50)).to.equal(100);
    });

    it('should handle both zero', () => {
      expect(percentChange(0, 0)).to.equal(0);
    });

    it('should calculate decimal changes', () => {
      const result = percentChange(100, 105);
      expect(result).to.be.closeTo(5, 0.001);
    });

    it('should handle large changes', () => {
      expect(percentChange(10, 100)).to.equal(900);
    });
  });
});
