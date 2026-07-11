/**
 * Threat Assessment Tests
 * Tests for hostile threat analysis and danger level calculation
 */

import { expect } from 'chai';
import {
  assessThreat,
  calculateTowerDamage,
  calculateDangerLevel,
  estimateDefenderCost,
  type HostileBody
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
      const mockHostile: HostileBody = {
        body: [
          { type: ATTACK, hits: 100 },
          { type: MOVE, hits: 50 }
        ]
      };

      const cost = estimateDefenderCost([mockHostile]);
      expect(cost).to.be.a('number');
      expect(cost).to.be.greaterThan(0);
    });

    it('should return 0 for no hostiles', () => {
      const cost = estimateDefenderCost([]);
      expect(cost).to.equal(0);
    });

    it('should scale with hostile strength', () => {
      const weakHostile: HostileBody = {
        body: [
          { type: ATTACK, hits: 100 },
          { type: MOVE, hits: 50 }
        ]
      };

      const strongHostile: HostileBody = {
        body: [
          { type: ATTACK, hits: 100 },
          { type: ATTACK, hits: 100 },
          { type: ATTACK, hits: 100 },
          { type: MOVE, hits: 50 },
          { type: MOVE, hits: 50 },
          { type: MOVE, hits: 50 }
        ]
      };

      const weakCost = estimateDefenderCost([weakHostile]);
      const strongCost = estimateDefenderCost([strongHostile]);

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

    it('should treat an incoming nuke as critical without visible hostiles', () => {
      const incomingNuke = {
        id: 'nuke-only',
        launchRoomName: 'W2N2',
        timeToLand: 5000
      };
      const tower = {
        structureType: STRUCTURE_TOWER,
        store: { getUsedCapacity: () => 100 },
        pos: { getRangeTo: () => 5 }
      };
      mockRoom.find = (type: number) => {
        if (type === FIND_NUKES) return [incomingNuke];
        if (type === FIND_MY_STRUCTURES) return [tower];
        return [];
      };

      const analysis = assessThreat(mockRoom);

      expect(analysis.dangerLevel).to.equal(3);
      expect(analysis.threatScore).to.equal(500);
      expect(analysis.hostileCount).to.equal(0);
      expect(analysis.totalHostileDPS).to.equal(0);
      expect(analysis.assistanceRequired).to.equal(false);
      expect(analysis.assistancePriority).to.equal(0);
      expect(Number.isFinite(analysis.assistancePriority)).to.equal(true);
      expect(analysis.recommendedResponse).to.equal('safemode');
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

      mockRoom.find = (type: number) => type === FIND_HOSTILE_CREEPS ? [mockHostile] : [];

      const analysis = assessThreat(mockRoom);
      
      expect(analysis.hostileCount).to.equal(1);
      expect(analysis.dangerLevel).to.be.greaterThan(0);
      expect(analysis.threatScore).to.be.greaterThan(0);
    });

    it('filters permanent allies before scoring threat', () => {
      const tooAngel = {
        id: 'ally-tooangel',
        body: [
          { type: ATTACK, hits: 100 },
          { type: HEAL, hits: 100 }
        ],
        hits: 200,
        hitsMax: 200,
        owner: { username: 'TooAngel' }
      };
      const tedRoastBeef = {
        id: 'ally-ted',
        body: [
          { type: RANGED_ATTACK, hits: 100 },
          { type: WORK, hits: 100 }
        ],
        hits: 200,
        hitsMax: 200,
        owner: { username: 'TedRoastBeef' }
      };
      const enemy = {
        id: 'enemy',
        body: [
          { type: ATTACK, hits: 100 },
          { type: MOVE, hits: 50 }
        ],
        hits: 150,
        hitsMax: 150,
        owner: { username: 'Enemy' }
      };

      mockRoom.find = (type: number) => type === FIND_HOSTILE_CREEPS ? [tooAngel, tedRoastBeef, enemy] : [];

      const analysis = assessThreat(mockRoom);

      expect(analysis.hostileCount).to.equal(1);
      expect(analysis.totalHostileDPS).to.equal(30);
      expect(analysis.totalHostileHitPoints).to.equal(150);
      expect(analysis.healerCount).to.equal(0);
      expect(analysis.rangedCount).to.equal(0);
      expect(analysis.dismantlerCount).to.equal(0);
      expect(analysis.meleeCount).to.equal(1);
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

      mockRoom.find = (type: number) => type === FIND_HOSTILE_CREEPS ? [mockHostile] : [];

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

      mockRoom.find = (type: number) => type === FIND_HOSTILE_CREEPS ? [mockHealer] : [];

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

      mockRoom.find = (type: number) => type === FIND_HOSTILE_CREEPS ? [mockRanged] : [];

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

      mockRoom.find = (type: number) => type === FIND_HOSTILE_CREEPS ? [mockDismantler] : [];

      const analysis = assessThreat(mockRoom);
      
      expect(analysis.dismantlerCount).to.equal(1);
    });

    it('treats a single active WORK part as a defensive dismantle threat', () => {
      const mockDismantler = {
        id: 'worker-dismantler',
        body: [
          { type: WORK, hits: 100 },
          { type: MOVE, hits: 50 }
        ],
        hits: 150,
        hitsMax: 150,
        owner: { username: 'Enemy' }
      };

      mockRoom.find = (type: number) => type === FIND_HOSTILE_CREEPS ? [mockDismantler] : [];

      const analysis = assessThreat(mockRoom);

      expect(analysis.dismantlerCount).to.equal(1);
      expect(analysis.totalHostileDPS).to.equal(50);
      expect(analysis.threatScore).to.be.at.least(100);
      expect(analysis.estimatedDefenderCost).to.be.greaterThan(0);
      expect(analysis.recommendedResponse).not.to.equal('monitor');
    });

    it('allows WORK-part dismantle threat scoring rollback through Memory', () => {
      const memory = Memory as unknown as { defenseSettings?: { workPartThreatScoring?: boolean } };
      const previousSettings = memory.defenseSettings;
      memory.defenseSettings = { ...previousSettings, workPartThreatScoring: false };

      try {
        const mockDismantler = {
          id: 'worker-dismantler',
          body: [
            { type: WORK, hits: 100 },
            { type: MOVE, hits: 50 }
          ],
          hits: 150,
          hitsMax: 150,
          owner: { username: 'Enemy' }
        };

        mockRoom.find = (type: number) => type === FIND_HOSTILE_CREEPS ? [mockDismantler] : [];

        const analysis = assessThreat(mockRoom);

        expect(analysis.dismantlerCount).to.equal(0);
        expect(analysis.totalHostileDPS).to.equal(0);
        expect(analysis.threatScore).to.equal(0);
        expect(analysis.estimatedDefenderCost).to.equal(0);
        expect(analysis.recommendedResponse).to.equal('monitor');
      } finally {
        memory.defenseSettings = previousSettings;
      }
    });

    it('should recommend appropriate response', () => {
      const mockWeakHostile = {
        id: 'weak1',
        body: [{ type: ATTACK, hits: 100 }],
        hits: 100,
        hitsMax: 100,
        owner: { username: 'Enemy' }
      };

      mockRoom.find = (type: number) => type === FIND_HOSTILE_CREEPS ? [mockWeakHostile] : [];

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

      mockRoom.find = (type: number) => type === FIND_HOSTILE_CREEPS ? mockHostiles : [];

      const analysis = assessThreat(mockRoom);
      
      expect(analysis.totalHostileHitPoints).to.equal(200);
    });
  });
});
