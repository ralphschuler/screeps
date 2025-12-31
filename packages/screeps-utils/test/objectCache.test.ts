/**
 * Object Cache Tests
 * Tests for game object caching and TTL management
 */

import { expect } from 'chai';
import {
  getCachedObject,
  getCachedStructure,
  getCachedCreep,
  getCachedSource,
  getCacheStatistics,
  warmObjectCache,
  clearObjectCache
} from '../src/cache/objectCache';

describe('Object Cache', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearObjectCache();
    
    // Reset Game.time
    (global as any).Game.time = 1000;
  });

  describe('getCachedObject', () => {
    it('should return null for non-existent object', () => {
      (global as any).Game.getObjectById = () => null;
      
      const obj = getCachedObject('test123' as Id<any>);
      expect(obj).to.be.null;
    });

    it('should cache object on first access', () => {
      const mockObject = { id: 'obj1', hits: 100 };
      (global as any).Game.getObjectById = (id: string) => {
        return id === 'obj1' ? mockObject : null;
      };
      
      const obj1 = getCachedObject('obj1' as Id<any>);
      expect(obj1).to.equal(mockObject);
    });

    it('should return cached object on subsequent access', () => {
      const mockObject = { id: 'obj1', hits: 100 };
      let callCount = 0;
      
      (global as any).Game.getObjectById = (id: string) => {
        callCount++;
        return id === 'obj1' ? mockObject : null;
      };
      
      getCachedObject('obj1' as Id<any>, 5);
      getCachedObject('obj1' as Id<any>, 5);
      getCachedObject('obj1' as Id<any>, 5);
      
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
      getCachedObject('obj1' as Id<any>, 5);
      expect(callCount).to.equal(1);
      
      // Access at tick 1003 (within TTL)
      (global as any).Game.time = 1003;
      getCachedObject('obj1' as Id<any>, 5);
      expect(callCount).to.equal(1); // Still cached
      
      // Access at tick 1006 (beyond TTL of 5)
      (global as any).Game.time = 1006;
      getCachedObject('obj1' as Id<any>, 5);
      expect(callCount).to.equal(2); // Re-fetched
    });

    it('should handle different TTL values', () => {
      const mockObject = { id: 'obj1', hits: 100 };
      
      (global as any).Game.getObjectById = () => mockObject;
      
      // Cache with TTL of 10
      getCachedObject('obj1' as Id<any>, 10);
      
      // Should still be cached at tick 1009
      (global as any).Game.time = 1009;
      const obj1 = getCachedObject('obj1' as Id<any>, 10);
      expect(obj1).to.equal(mockObject);
      
      // Should expire at tick 1011
      (global as any).Game.time = 1011;
      const obj2 = getCachedObject('obj1' as Id<any>, 10);
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
      getCachedObject('obj1' as Id<any>, 5);
      
      // Second access - hit
      getCachedObject('obj1' as Id<any>, 5);
      getCachedObject('obj1' as Id<any>, 5);
      
      const stats = getCacheStatistics();
      expect(stats.hits).to.equal(2);
      expect(stats.misses).to.equal(1);
      expect(stats.size).to.be.greaterThan(0);
    });

    it('should calculate hit rate', () => {
      const mockObject = { id: 'obj1', value: 'test' };
      
      (global as any).Game.getObjectById = () => mockObject;
      
      // 1 miss, 3 hits
      getCachedObject('obj1' as Id<any>, 5);
      getCachedObject('obj1' as Id<any>, 5);
      getCachedObject('obj1' as Id<any>, 5);
      getCachedObject('obj1' as Id<any>, 5);
      
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
      
      getCachedObject('obj1' as Id<any>, 5);
      getCachedObject('obj2' as Id<any>, 5);
      getCachedObject('obj3' as Id<any>, 5);
      
      const stats = getCacheStatistics();
      expect(stats.size).to.equal(3);
    });
  });

  describe('warmObjectCache', () => {
    it('should pre-populate cache with room objects', () => {
      const mockRoom = {
        name: 'W1N1',
        controller: { id: 'ctrl1' },
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
      
      warmObjectCache(mockRoom as any);
      
      const stats = getCacheStatistics();
      expect(stats.size).to.be.greaterThan(0);
    });
  });

  describe('clearObjectCache', () => {
    it('should clear all cached entries', () => {
      const mockObject = { id: 'obj1' };
      
      (global as any).Game.getObjectById = () => mockObject;
      
      getCachedObject('obj1' as Id<any>, 5);
      
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
