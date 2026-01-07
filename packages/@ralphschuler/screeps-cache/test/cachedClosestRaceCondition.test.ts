/**
 * Test for cached closest race condition fix
 *
 * This test verifies that when multiple creeps target the same structure,
 * and one fills it, the other creep properly clears its cache and finds
 * a new target instead of getting stuck in an infinite loop.
 */

import { assert } from "chai";
import { findCachedClosest, clearClosestCache as clearCache } from "../../src/cache";

// Mock creep memory interface
interface MockCreepMemory {
  _ct?: Record<string, { 
    i: Id<_HasId>;  // Target ID
    t: number;      // Cache tick (Game.time when cached)
    k: string;      // Type key for validation
  }>;
}

// Mock creep interface
interface MockCreep {
  name: string;
  memory: MockCreepMemory;
  pos: {
    findClosestByRange<T>(targets: T[]): T | null;
    getRangeTo(target: RoomPosition): number;
  };
}

// Mock room object interface
interface MockRoomObject {
  id: Id<_HasId>;
  pos: RoomPosition;
  structureType?: StructureConstant;
  store?: {
    getFreeCapacity(resource: ResourceConstant): number;
  };
}

// Setup mock Game object
function setupMockGame(time: number): void {
  (global as any).Game = {
    time,
    getObjectById: (id: Id<_HasId>) => {
      // Return mock objects by ID
      const mockObjects: Record<string, MockRoomObject> = {
        ext1: {
          id: "ext1" as Id<StructureExtension>,
          pos: { x: 10, y: 10, roomName: "W1N1" } as RoomPosition,
          structureType: STRUCTURE_EXTENSION,
          store: {
            getFreeCapacity: () => 50 // Has capacity
          }
        },
        ext2: {
          id: "ext2" as Id<StructureExtension>,
          pos: { x: 12, y: 10, roomName: "W1N1" } as RoomPosition,
          structureType: STRUCTURE_EXTENSION,
          store: {
            getFreeCapacity: () => 50 // Has capacity
          }
        }
      };
      return mockObjects[id as string];
    }
  };
}

describe("CachedClosest Race Condition Fix", () => {
  beforeEach(() => {
    setupMockGame(1000);
  });

  afterEach(() => {
    delete (global as any).Game;
  });

  it("should return different targets for two creeps when first target is no longer in array", () => {
    // Create two mock creeps
    const creep1: MockCreep = {
      name: "larvaWorker1",
      memory: {},
      pos: {
        findClosestByRange<T>(targets: T[]): T | null {
          return targets.length > 0 ? targets[0] : null;
        },
        getRangeTo: () => 5
      }
    };

    const creep2: MockCreep = {
      name: "hauler1",
      memory: {},
      pos: {
        findClosestByRange<T>(targets: T[]): T | null {
          return targets.length > 0 ? targets[0] : null;
        },
        getRangeTo: () => 5
      }
    };

    // Both extensions available
    const extension1 = Game.getObjectById("ext1" as Id<StructureExtension>);
    const extension2 = Game.getObjectById("ext2" as Id<StructureExtension>);
    assert.exists(extension1, "Extension 1 should exist");
    assert.exists(extension2, "Extension 2 should exist");

    let targets = [extension1!, extension2!] as (RoomObject & _HasId)[];

    // Creep 1 finds and caches extension 1
    const target1 = findCachedClosest(creep1 as unknown as Creep, targets, "deliver_ext", 10);
    assert.equal(target1?.id, "ext1", "Creep 1 should target extension 1");
    assert.exists(creep1.memory._ct?.["deliver_ext"], "Creep 1 should have cached target");

    // Simulate creep 1 filling extension 1 - remove it from targets array
    targets = [extension2!] as (RoomObject & _HasId)[];

    // Creep 1 tries to use cached target - should fail validation and find new target
    const target1Again = findCachedClosest(creep1 as unknown as Creep, targets, "deliver_ext", 10);
    assert.equal(
      target1Again?.id,
      "ext2",
      "Creep 1 should get extension 2 after extension 1 is no longer valid"
    );

    // Creep 2 should also get extension 2 (the only available target)
    const target2 = findCachedClosest(creep2 as unknown as Creep, targets, "deliver_ext", 10);
    assert.equal(target2?.id, "ext2", "Creep 2 should target extension 2");
  });

  it("should properly clear cache when clearCache is called", () => {
    const creep: MockCreep = {
      name: "testCreep",
      memory: {},
      pos: {
        findClosestByRange<T>(targets: T[]): T | null {
          return targets.length > 0 ? targets[0] : null;
        },
        getRangeTo: () => 5
      }
    };

    const extension1 = Game.getObjectById("ext1" as Id<StructureExtension>);
    const extension2 = Game.getObjectById("ext2" as Id<StructureExtension>);
    // Need at least 2 targets to trigger caching
    // Note: findCachedClosest has a fast path optimization for single targets
    // that returns the target directly without caching (see cachedClosest.ts:78-80)
    const targets = [extension1!, extension2!] as (RoomObject & _HasId)[];

    // Find and cache target
    findCachedClosest(creep as unknown as Creep, targets, "deliver_ext", 10);
    assert.exists(creep.memory._ct?.["deliver_ext"], "Cache should exist after find");

    // Clear cache
    clearCache(creep as unknown as Creep);
    assert.notExists(
      creep.memory._ct,
      "Cache should be cleared after clearCache() is called"
    );
  });

  it("should find new target after clearing specific cache key", () => {
    const creep: MockCreep = {
      name: "testCreep",
      memory: {},
      pos: {
        findClosestByRange<T>(targets: T[]): T | null {
          return targets.length > 0 ? targets[0] : null;
        },
        getRangeTo: () => 5
      }
    };

    const extension1 = Game.getObjectById("ext1" as Id<StructureExtension>);
    const extension2 = Game.getObjectById("ext2" as Id<StructureExtension>);
    let targets = [extension1!] as (RoomObject & _HasId)[];

    // Find and cache extension 1
    const target1 = findCachedClosest(creep as unknown as Creep, targets, "deliver_ext", 10);
    assert.equal(target1?.id, "ext1", "Should cache extension 1");

    // Clear cache for specific key
    clearCache(creep as unknown as Creep, "deliver_ext");

    // Change targets to only extension 2
    targets = [extension2!] as (RoomObject & _HasId)[];

    // Should find extension 2 now (cache was cleared)
    const target2 = findCachedClosest(creep as unknown as Creep, targets, "deliver_ext", 10);
    assert.equal(
      target2?.id,
      "ext2",
      "Should find extension 2 after cache was cleared and targets changed"
    );
  });

  it("should respect cache TTL", () => {
    setupMockGame(1000); // Start at tick 1000

    const creep: MockCreep = {
      name: "testCreep",
      memory: {},
      pos: {
        findClosestByRange<T>(targets: T[]): T | null {
          return targets.length > 0 ? targets[0] : null;
        },
        getRangeTo: () => 5
      }
    };

    const extension1 = Game.getObjectById("ext1" as Id<StructureExtension>);
    const extension2 = Game.getObjectById("ext2" as Id<StructureExtension>);
    let targets = [extension1!, extension2!] as (RoomObject & _HasId)[];

    // Cache extension 1 with TTL of 10
    findCachedClosest(creep as unknown as Creep, targets, "deliver_ext", 10);
    assert.equal(creep.memory._ct?.["deliver_ext"]?.i, "ext1", "Should cache extension 1");

    // Advance time by 5 ticks - cache still valid
    setupMockGame(1005);
    const targetStillCached = findCachedClosest(
      creep as unknown as Creep,
      targets,
      "deliver_ext",
      10
    );
    assert.equal(targetStillCached?.id, "ext1", "Cache should still return extension 1");

    // Advance time by 11 ticks total - cache expired
    setupMockGame(1011);
    targets = [extension2!] as (RoomObject & _HasId)[]; // Only extension 2 available now

    const targetAfterExpiry = findCachedClosest(
      creep as unknown as Creep,
      targets,
      "deliver_ext",
      10
    );
    assert.equal(
      targetAfterExpiry?.id,
      "ext2",
      "Should find new target after cache expires"
    );
  });
});
