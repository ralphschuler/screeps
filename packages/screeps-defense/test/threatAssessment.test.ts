/**
 * Threat Assessment Tests
 * Tests for hostile threat analysis and danger level calculation
 */

import { expect } from 'chai';
import {
  assessThreat,
  calculateTowerDamage,
  calculateDangerLevel,
  estimateDefenderCost
} from '../src/threat/threatAssessment';

describe('Threat Assessment', () => {
  
  describe('calculateTowerDamage', () => {
    it('should return maximum damage at close range (≤5)', () => {
      expect(calculateTowerDamage(0)).to.equal(600);
      expect(calculateTowerDamage(5)).to.equal(600);
    });

    it('should return minimum damage at far range (≥20)', () => {
      expect(calculateTowerDamage(20)).to.equal(150);
      expect(calculateTowerDamage(25)).to.equal(150);
      expect(calculateTowerDamage(30)).to.equal(150);
    });

    it('should linearly interpolate damage at medium range', () => {
      // At range 10 (midpoint between 5 and 20)
      expect(calculateTowerDamage(10)).to.equal(450);
      
      // At range 15 (3/4 of the way from 5 to 20)
      expect(calculateTowerDamage(15)).to.equal(300);
    });

    it('should handle edge cases', () => {
      expect(calculateTowerDamage(6)).to.be.lessThan(600);
      expect(calculateTowerDamage(6)).to.be.greaterThan(150);
      
      expect(calculateTowerDamage(19)).to.be.greaterThan(150);
      expect(calculateTowerDamage(19)).to.be.lessThan(600);
    });

    it('should return positive damage values', () => {
      for (let range = 0; range <= 50; range++) {
        expect(calculateTowerDamage(range)).to.be.greaterThan(0);
      }
    });
  });

  describe('calculateDangerLevel', () => {
    it('should return 0 for no threat', () => {
      expect(calculateDangerLevel(0)).to.equal(0);
    });

    it('should return 1 for hostile sighted', () => {
      expect(calculateDangerLevel(100)).to.equal(1);
      expect(calculateDangerLevel(499)).to.equal(1);
    });

    it('should return 2 for active attack', () => {
      expect(calculateDangerLevel(500)).to.equal(2);
      expect(calculateDangerLevel(999)).to.equal(2);
    });

    it('should return 3 for siege', () => {
      expect(calculateDangerLevel(1000)).to.equal(3);
      expect(calculateDangerLevel(5000)).to.equal(3);
    });

    it('should handle boundary conditions', () => {
      expect(calculateDangerLevel(99)).to.equal(0);
      expect(calculateDangerLevel(100)).to.equal(1);
      
      expect(calculateDangerLevel(499)).to.equal(1);
      expect(calculateDangerLevel(500)).to.equal(2);
      
      expect(calculateDangerLevel(999)).to.equal(2);
      expect(calculateDangerLevel(1000)).to.equal(3);
    });
  });

  describe('estimateDefenderCost', () => {
    it('should estimate cost for basic attackers', () => {
      const mockHostile = {
        body: [
          { type: ATTACK, hits: 100 },
          { type: MOVE, hits: 50 }
        ],
        hits: 150,
        hitsMax: 150
      };

      const cost = estimateDefenderCost([mockHostile as any]);
      expect(cost).to.be.a('number');
      expect(cost).to.be.greaterThan(0);
    });

    it('should return 0 for no hostiles', () => {
      const cost = estimateDefenderCost([]);
      expect(cost).to.equal(0);
    });

    it('should scale with hostile strength', () => {
      const weakHostile = {
        body: [
          { type: ATTACK, hits: 100 },
          { type: MOVE, hits: 50 }
        ],
        hits: 150,
        hitsMax: 150
      };

      const strongHostile = {
        body: [
          { type: ATTACK, hits: 100 },
          { type: ATTACK, hits: 100 },
          { type: ATTACK, hits: 100 },
          { type: MOVE, hits: 50 },
          { type: MOVE, hits: 50 },
          { type: MOVE, hits: 50 }
        ],
        hits: 450,
        hitsMax: 450
      };

      const weakCost = estimateDefenderCost([weakHostile as any]);
      const strongCost = estimateDefenderCost([strongHostile as any]);

      expect(strongCost).to.be.greaterThan(weakCost);
    });
  });

  describe('assessThreat', () => {
    let mockRoom: any;

    beforeEach(() => {
      mockRoom = {
        name: 'W1N1',
        find: (type: number) => []
      };
    });

    it('should return zero threat for empty room', () => {
      const analysis = assessThreat(mockRoom);
      
      expect(analysis.dangerLevel).to.equal(0);
      expect(analysis.threatScore).to.equal(0);
      expect(analysis.hostileCount).to.equal(0);
      expect(analysis.recommendedResponse).to.equal('monitor');
    });

    it('should detect hostile creeps', () => {
      const mockHostile = {
        id: 'hostile1',
        body: [
          { type: ATTACK, hits: 100 },
          { type: MOVE, hits: 50 }
        ],
        hits: 150,
        hitsMax: 150,
        owner: { username: 'Enemy' }
      };

      mockRoom.find = (type: number) => [mockHostile];

      const analysis = assessThreat(mockRoom);
      
      expect(analysis.hostileCount).to.equal(1);
      expect(analysis.dangerLevel).to.be.greaterThan(0);
      expect(analysis.threatScore).to.be.greaterThan(0);
    });

    it('should count attack parts correctly', () => {
      const mockHostile = {
        id: 'hostile1',
        body: [
          { type: ATTACK, hits: 100 },
          { type: ATTACK, hits: 100 },
          { type: MOVE, hits: 50 }
        ],
        hits: 250,
        hitsMax: 250,
        owner: { username: 'Enemy' }
      };

      mockRoom.find = (type: number) => [mockHostile];

      const analysis = assessThreat(mockRoom);
      
      expect(analysis.meleeCount).to.equal(1);
      expect(analysis.totalHostileDPS).to.be.greaterThan(0);
    });

    it('should detect healers', () => {
      const mockHealer = {
        id: 'healer1',
        body: [
          { type: HEAL, hits: 100 },
          { type: MOVE, hits: 50 }
        ],
        hits: 150,
        hitsMax: 150,
        owner: { username: 'Enemy' }
      };

      mockRoom.find = (type: number) => [mockHealer];

      const analysis = assessThreat(mockRoom);
      
      expect(analysis.healerCount).to.equal(1);
    });

    it('should detect ranged attackers', () => {
      const mockRanged = {
        id: 'ranged1',
        body: [
          { type: RANGED_ATTACK, hits: 100 },
          { type: MOVE, hits: 50 }
        ],
        hits: 150,
        hitsMax: 150,
        owner: { username: 'Enemy' }
      };

      mockRoom.find = (type: number) => [mockRanged];

      const analysis = assessThreat(mockRoom);
      
      expect(analysis.rangedCount).to.equal(1);
    });

    it('should detect dismantlers', () => {
      const mockDismantler = {
        id: 'dismantler1',
        body: [
          { type: WORK, hits: 100 },
          { type: WORK, hits: 100 },
          { type: WORK, hits: 100 },
          { type: WORK, hits: 100 },
          { type: WORK, hits: 100 },
          { type: MOVE, hits: 50 }
        ],
        hits: 550,
        hitsMax: 550,
        owner: { username: 'Enemy' }
      };

      mockRoom.find = (type: number) => [mockDismantler];

      const analysis = assessThreat(mockRoom);
      
      expect(analysis.dismantlerCount).to.equal(1);
    });

    it('should recommend appropriate response', () => {
      const mockWeakHostile = {
        id: 'weak1',
        body: [{ type: ATTACK, hits: 100 }],
        hits: 100,
        hitsMax: 100,
        owner: { username: 'Enemy' }
      };

      mockRoom.find = (type: number) => [mockWeakHostile];

      const analysis = assessThreat(mockRoom);
      
      expect(analysis.recommendedResponse).to.be.oneOf([
        'monitor', 'defend', 'assist', 'retreat', 'safemode'
      ]);
    });

    it('should calculate total hit points', () => {
      const mockHostiles = [
        {
          id: 'h1',
          body: [{ type: ATTACK, hits: 100 }],
          hits: 100,
          hitsMax: 100,
          owner: { username: 'Enemy' }
        },
        {
          id: 'h2',
          body: [{ type: ATTACK, hits: 100 }],
          hits: 100,
          hitsMax: 100,
          owner: { username: 'Enemy' }
        }
      ];

      mockRoom.find = (type: number) => mockHostiles;

      const analysis = assessThreat(mockRoom);
      
      expect(analysis.totalHostileHitPoints).to.equal(200);
    });
  });
});
