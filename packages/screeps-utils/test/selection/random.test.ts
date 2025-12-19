import { expect } from 'chai';
import { random, randomInt, shuffle, pick, resetRandom } from '../../src/selection/random';

declare global {
  // eslint-disable-next-line no-var
  var Game: { time: number };
}

// Mock Game global
global.Game = {
  time: 1000
};

describe('Random Utilities', () => {
  beforeEach(() => {
    resetRandom();
    global.Game.time = 1000;
  });

  describe('random()', () => {
    it('should return a number between 0 and 1', () => {
      const value = random();
      expect(value).to.be.a('number');
      expect(value).to.be.at.least(0);
      expect(value).to.be.lessThan(1);
    });

    it('should be deterministic for the same tick', () => {
      resetRandom();
      const value1 = random();
      resetRandom();
      const value2 = random();
      expect(value1).to.equal(value2);
    });

    it('should change when Game.time changes', () => {
      const value1 = random();
      global.Game.time = 1001;
      resetRandom();
      const value2 = random();
      expect(value1).to.not.equal(value2);
    });
  });

  describe('randomInt()', () => {
    it('should return an integer in range [min, max)', () => {
      for (let i = 0; i < 100; i++) {
        resetRandom();
        global.Game.time = 1000 + i;
        const value = randomInt(0, 10);
        expect(value).to.be.a('number');
        expect(value).to.be.at.least(0);
        expect(value).to.be.lessThan(10);
        expect(Number.isInteger(value)).to.be.true;
      }
    });

    it('should handle negative ranges', () => {
      resetRandom();
      const value = randomInt(-10, -5);
      expect(value).to.be.at.least(-10);
      expect(value).to.be.lessThan(-5);
    });
  });

  describe('shuffle()', () => {
    it('should return an array with the same elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      expect(shuffled).to.have.lengthOf(arr.length);
      expect(shuffled.sort()).to.deep.equal(arr);
    });

    it('should not modify the original array', () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      shuffle(arr);
      expect(arr).to.deep.equal(original);
    });

    it('should produce different orders for different ticks', () => {
      const arr = [1, 2, 3, 4, 5];
      resetRandom();
      global.Game.time = 1000;
      const shuffled1 = shuffle(arr);
      
      resetRandom();
      global.Game.time = 1001;
      const shuffled2 = shuffle(arr);
      
      // With high probability, they should be different
      // (Extremely unlikely to get the same shuffle twice)
      expect(shuffled1.join('')).to.not.equal(shuffled2.join(''));
    });
  });

  describe('pick()', () => {
    it('should return an element from the array', () => {
      const arr = [1, 2, 3, 4, 5];
      const picked = pick(arr);
      expect(arr).to.include(picked);
    });

    it('should return undefined for empty array', () => {
      const picked = pick([]);
      expect(picked).to.equal(undefined);
    });

    it('should be deterministic for the same tick', () => {
      const arr = [1, 2, 3, 4, 5];
      resetRandom();
      const picked1 = pick(arr);
      resetRandom();
      const picked2 = pick(arr);
      expect(picked1).to.equal(picked2);
    });
  });
});
