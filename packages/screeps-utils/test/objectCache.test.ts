/**
 * Object Cache Tests
 * Tests for game object caching and TTL management
 */

import { expect } from 'chai';
import {
  getCachedObjectById,
  getCachedStructure,
  getCachedCreep,
  getCachedSource,
  getCacheStatistics,
  prefetchRoomObjects,
  clearObjectCache,
  warmCache
} from '../src/cache/objectCache';

describe('Object Cache', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearObjectCache();
    
    // Reset Game.time
    (global as any).Game.time = 1000;
  });

  describe('getCachedObjectById', () => {
    it('should return null for non-existent object', () => {
      (global as any).Game.getObjectById = () => null;
      
      const obj = getCachedObjectById('test123' as Id<any>);
      expect(obj).to.be.null;
    });

    it('should cache object on first access', () => {
      const mockObject = { id: 'obj1', hits: 100 };
      (global as any).Game.getObjectById = (id: string) => {
        return id === 'obj1' ? mockObject : null;
      };
      
      const obj1 = getCachedObjectById('obj1' as Id<any>);
      expect(obj1).to.equal(mockObject);
    });

    it('should return cached object on subsequent access', () => {
      const mockObject = { id: 'obj1', hits: 100 };
      let callCount = 0;
      
      (global as any).Game.getObjectById = (id: string) => {
        callCount++;
        return id === 'obj1' ? mockObject : null;
      };
      
      getCachedObjectById('obj1' as Id<any>, 5);
      getCachedObjectById('obj1' as Id<any>, 5);
      getCachedObjectById('obj1' as Id<any>, 5);
      
      // Should only call getObjectById once (first time)
      expect(callCount).to.equal(1);
    });

    it('should respect TTL expiration', () => {
      const mockObject = { id: 'obj1', hits: 100 };
      let callCount = 0;
      
      (global as any).Game.getObjectById = (id: string) => {
        callCount++;
        return id === 'obj1' ? mockObject : null;
      };
      
      // First access at tick 1000
      getCachedObjectById('obj1' as Id<any>, 5);
      expect(callCount).to.equal(1);
      
      // Access at tick 1003 (within TTL)
      (global as any).Game.time = 1003;
      getCachedObjectById('obj1' as Id<any>, 5);
      expect(callCount).to.equal(1); // Still cached
      
      // Access at tick 1006 (beyond TTL of 5)
      (global as any).Game.time = 1006;
      getCachedObjectById('obj1' as Id<any>, 5);
      expect(callCount).to.equal(2); // Re-fetched
    });

    it('should handle different TTL values', () => {
      const mockObject = { id: 'obj1', hits: 100 };
      
      (global as any).Game.getObjectById = () => mockObject;
      
      // Cache with TTL of 10
      getCachedObjectById('obj1' as Id<any>, 10);
      
      // Should still be cached at tick 1009
      (global as any).Game.time = 1009;
      const obj1 = getCachedObjectById('obj1' as Id<any>, 10);
      expect(obj1).to.equal(mockObject);
      
      // Should expire at tick 1011
      (global as any).Game.time = 1011;
      const obj2 = getCachedObjectById('obj1' as Id<any>, 10);
      expect(obj2).to.equal(mockObject);
    });
  });

  describe('getCachedStructure', () => {
    it('should cache structure with default TTL', () => {
      const mockStructure = {
        id: 'struct1',
        structureType: STRUCTURE_SPAWN,
        hits: 5000
      };
      
      (global as any).Game.getObjectById = () => mockStructure;
      
      const struct = getCachedStructure('struct1' as Id<StructureSpawn>);
      expect(struct).to.equal(mockStructure);
    });

    it('should return null for non-existent structure', () => {
      (global as any).Game.getObjectById = () => null;
      
      const struct = getCachedStructure('missing' as Id<Structure>);
      expect(struct).to.be.null;
    });
  });

  describe('getCachedCreep', () => {
    it('should cache creep with short TTL', () => {
      const mockCreep = {
        id: 'creep1',
        name: 'Worker1',
        hits: 100
      };
      
      (global as any).Game.getObjectById = () => mockCreep;
      
      const creep = getCachedCreep('creep1' as Id<Creep>);
      expect(creep).to.equal(mockCreep);
    });

    it('should expire creep cache after 1 tick', () => {
      const mockCreep = { id: 'creep1', name: 'Worker1' };
      let callCount = 0;
      
      (global as any).Game.getObjectById = () => {
        callCount++;
        return mockCreep;
      };
      
      // First access
      getCachedCreep('creep1' as Id<Creep>);
      expect(callCount).to.equal(1);
      
      // Same tick - should use cache
      getCachedCreep('creep1' as Id<Creep>);
      expect(callCount).to.equal(1);
      
      // Next tick - should re-fetch
      (global as any).Game.time = 1001;
      getCachedCreep('creep1' as Id<Creep>);
      expect(callCount).to.equal(2);
    });
  });

  describe('getCachedSource', () => {
    it('should cache source with medium TTL', () => {
      const mockSource = {
        id: 'source1',
        energy: 3000,
        energyCapacity: 3000
      };
      
      (global as any).Game.getObjectById = () => mockSource;
      
      const source = getCachedSource('source1' as Id<Source>);
      expect(source).to.equal(mockSource);
    });
  });

  describe('getCacheStatistics', () => {
    it('should track cache hits and misses', () => {
      const mockObject = { id: 'obj1', value: 'test' };
      
      (global as any).Game.getObjectById = (id: string) => {
        return id === 'obj1' ? mockObject : null;
      };
      
      // First access - miss
      getCachedObjectById('obj1' as Id<any>, 5);
      
      // Second access - hit
      getCachedObjectById('obj1' as Id<any>, 5);
      getCachedObjectById('obj1' as Id<any>, 5);
      
      const stats = getCacheStatistics();
      expect(stats.hits).to.equal(2);
      expect(stats.misses).to.equal(1);
      expect(stats.size).to.be.greaterThan(0);
    });

    it('should calculate hit rate', () => {
      const mockObject = { id: 'obj1', value: 'test' };
      
      (global as any).Game.getObjectById = () => mockObject;
      
      // 1 miss, 3 hits
      getCachedObjectById('obj1' as Id<any>, 5);
      getCachedObjectById('obj1' as Id<any>, 5);
      getCachedObjectById('obj1' as Id<any>, 5);
      getCachedObjectById('obj1' as Id<any>, 5);
      
      const stats = getCacheStatistics();
      expect(stats.hitRate).to.equal(75); // 3/4 = 75%
    });

    it('should track cache size', () => {
      const obj1 = { id: 'obj1' };
      const obj2 = { id: 'obj2' };
      const obj3 = { id: 'obj3' };
      
      (global as any).Game.getObjectById = (id: string) => {
        if (id === 'obj1') return obj1;
        if (id === 'obj2') return obj2;
        if (id === 'obj3') return obj3;
        return null;
      };
      
      getCachedObjectById('obj1' as Id<any>, 5);
      getCachedObjectById('obj2' as Id<any>, 5);
      getCachedObjectById('obj3' as Id<any>, 5);
      
      const stats = getCacheStatistics();
      expect(stats.size).to.equal(3);
    });
  });

  describe('prefetchRoomObjects', () => {
    it('should pre-populate cache with room objects', () => {
      const mockRoom = {
        name: 'W1N1',
        controller: { id: 'ctrl1', my: true },
        storage: { id: 'storage1' },
        terminal: { id: 'terminal1' },
        find: (type: number) => {
          if (type === FIND_MY_SPAWNS) {
            return [{ id: 'spawn1' }];
          }
          if (type === FIND_SOURCES) {
            return [{ id: 'source1' }, { id: 'source2' }];
          }
          return [];
        }
      };
      
      (global as any).Game.getObjectById = (id: string) => {
        const objects: any = {
          'ctrl1': mockRoom.controller,
          'storage1': mockRoom.storage,
          'terminal1': mockRoom.terminal,
          'spawn1': { id: 'spawn1' },
          'source1': { id: 'source1' },
          'source2': { id: 'source2' }
        };
        return objects[id] || null;
      };
      
      prefetchRoomObjects(mockRoom as any);
      
      const stats = getCacheStatistics();
      expect(stats.size).to.be.greaterThan(0);
    });
  });

  describe('warmCache', () => {
    it('should pre-populate owned room spawns and towers without lookups', () => {
      const spawn = { id: 'spawn1', structureType: STRUCTURE_SPAWN };
      const tower = { id: 'tower1', structureType: STRUCTURE_TOWER };
      const controller = { id: 'ctrl1', my: true };
      let lookupCount = 0;
      const mockRoom = {
        name: 'W1N1',
        controller,
        find: (type: number, opts?: { filter?: (structure: any) => boolean }) => {
          if (type === FIND_SOURCES) return [];
          if (type === FIND_MY_SPAWNS) return [spawn];
          if (type === FIND_MY_STRUCTURES) return [tower].filter(structure => opts?.filter?.(structure) ?? true);
          return [];
        }
      };

      (global as any).Game.rooms = { W1N1: mockRoom };
      (global as any).Game.getObjectById = () => {
        lookupCount++;
        return null;
      };

      warmCache();

      expect(getCachedObjectById('spawn1' as Id<any>)).to.equal(spawn);
      expect(getCachedObjectById('tower1' as Id<any>)).to.equal(tower);
      expect(lookupCount).to.equal(0);
    });
  });

  describe('clearObjectCache', () => {
    it('should clear all cached entries', () => {
      const mockObject = { id: 'obj1' };
      
      (global as any).Game.getObjectById = () => mockObject;
      
      getCachedObjectById('obj1' as Id<any>, 5);
      
      let stats = getCacheStatistics();
      expect(stats.size).to.be.greaterThan(0);
      
      clearObjectCache();
      
      stats = getCacheStatistics();
      expect(stats.size).to.equal(0);
      expect(stats.hits).to.equal(0);
      expect(stats.misses).to.equal(0);
    });
  });
});
