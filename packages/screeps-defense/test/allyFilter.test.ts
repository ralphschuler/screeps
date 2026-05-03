/**
 * Tests for Non-Aggression Alliance System
 */

import { expect } from 'chai';
import {
  NON_AGGRESSION_PACT_PLAYERS,
  filterAllyCreeps,
  filterAllyPowerCreeps,
  filterAllyStructures,
  getActualHostileCreeps,
  getActualHostilePowerCreeps,
  getActualHostileStructures,
  isAllyCreep,
  isAllyPlayer,
  isAllyPowerCreep,
  isAllyStructure
} from '../src/index';

describe('Non-Aggression Alliance System', () => {
  const tooAngelCreep = {
    name: 'tooangel1',
    owner: { username: 'TooAngel' },
    room: { name: 'W1N1' }
  } as Creep;

  const tedRoastBeefCreep = {
    name: 'ted1',
    owner: { username: 'TedRoastBeef' },
    room: { name: 'W1N1' }
  } as Creep;

  const hostileCreep = {
    name: 'hostile1',
    owner: { username: 'EvilPlayer' },
    room: { name: 'W1N1' }
  } as Creep;

  describe('isAllyPlayer', () => {
    it('identifies permanent allies', () => {
      expect(NON_AGGRESSION_PACT_PLAYERS).to.include('TooAngel');
      expect(NON_AGGRESSION_PACT_PLAYERS).to.include('TedRoastBeef');
      expect(isAllyPlayer('TooAngel')).to.equal(true);
      expect(isAllyPlayer('TedRoastBeef')).to.equal(true);
      expect(isAllyPlayer('EvilPlayer')).to.equal(false);
    });
  });

  describe('creep filtering', () => {
    it('filters allied creeps from hostile lists', () => {
      expect(isAllyCreep(tooAngelCreep)).to.equal(true);
      expect(isAllyCreep(tedRoastBeefCreep)).to.equal(true);
      expect(isAllyCreep(hostileCreep)).to.equal(false);

      const actualHostiles = filterAllyCreeps([tooAngelCreep, hostileCreep, tedRoastBeefCreep]);

      expect(actualHostiles).to.deep.equal([hostileCreep]);
    });

    it('filters allies from room hostile detection', () => {
      const mockRoom = {
        find: (findConstant: FindConstant) => {
          if (findConstant === FIND_HOSTILE_CREEPS) {
            return [tooAngelCreep, tedRoastBeefCreep, hostileCreep];
          }
          return [];
        }
      } as Room;

      expect(getActualHostileCreeps(mockRoom)).to.deep.equal([hostileCreep]);
    });
  });

  describe('power creep filtering', () => {
    it('filters allied power creeps from hostile power creep lists', () => {
      const allyPowerCreep = {
        owner: { username: 'TooAngel' },
        room: { name: 'W1N1' }
      } as PowerCreep;

      const hostilePowerCreep = {
        owner: { username: 'Invader' },
        room: { name: 'W1N1' }
      } as PowerCreep;

      expect(isAllyPowerCreep(allyPowerCreep)).to.equal(true);
      expect(filterAllyPowerCreeps([allyPowerCreep, hostilePowerCreep])).to.deep.equal([hostilePowerCreep]);
    });

    it('filters allies from room hostile power creep detection', () => {
      const allyPowerCreep = {
        owner: { username: 'TedRoastBeef' },
        room: { name: 'W1N1' }
      } as PowerCreep;

      const hostilePowerCreep = {
        owner: { username: 'Invader' },
        room: { name: 'W1N1' }
      } as PowerCreep;

      const mockRoom = {
        find: (findConstant: FindConstant) => {
          if (findConstant === FIND_HOSTILE_POWER_CREEPS) {
            return [allyPowerCreep, hostilePowerCreep];
          }
          return [];
        }
      } as Room;

      expect(getActualHostilePowerCreeps(mockRoom)).to.deep.equal([hostilePowerCreep]);
    });
  });

  describe('structure filtering', () => {
    it('filters allied owned structures from hostile structure lists', () => {
      const allyRampart = {
        structureType: STRUCTURE_RAMPART,
        owner: { username: 'TooAngel' }
      } as StructureRampart;

      const hostileTower = {
        structureType: STRUCTURE_TOWER,
        owner: { username: 'EvilPlayer' }
      } as StructureTower;

      expect(isAllyStructure(allyRampart)).to.equal(true);
      expect(filterAllyStructures([allyRampart, hostileTower])).to.deep.equal([hostileTower]);
    });

    it('filters allies from room hostile structure detection', () => {
      const allySpawn = {
        structureType: STRUCTURE_SPAWN,
        owner: { username: 'TedRoastBeef' }
      } as StructureSpawn;

      const hostileSpawn = {
        structureType: STRUCTURE_SPAWN,
        owner: { username: 'EvilPlayer' }
      } as StructureSpawn;

      const mockRoom = {
        find: (findConstant: FindConstant) => {
          if (findConstant === FIND_HOSTILE_STRUCTURES) {
            return [allySpawn, hostileSpawn];
          }
          return [];
        }
      } as Room;

      expect(getActualHostileStructures(mockRoom)).to.deep.equal([hostileSpawn]);
    });
  });
});
