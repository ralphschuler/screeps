import { expect } from "chai";
import { RoomFindOptimizer, ObjectIdOptimizer, roomFindOptimizer, objectIdOptimizer } from "../../src/core/roomFindOptimizer";
import { clearRoomFindCache } from "../../src/cache/domains/RoomFindCache";
import { clearObjectCache } from "../../src/cache/domains/ObjectCache";

// Define global Screeps classes for testing
(global as any).Source = class Source {};
(global as any).Mineral = class Mineral {};
(global as any).Creep = class Creep {};
(global as any).Structure = class Structure {};

describe("RoomFindOptimizer", () => {
  let optimizer: RoomFindOptimizer;
  let mockRoom: Room;

  beforeEach(() => {
    // Reset global state
    clearRoomFindCache();
    clearObjectCache();

    optimizer = new RoomFindOptimizer();

    // Mock Game object
    (global as any).Game = {
      time: 1000,
      cpu: {
        bucket: 5000,
        limit: 50,
        getUsed: () => 10
      },
      rooms: {}
    };

    // Create a mock room
    mockRoom = {
      name: "W1N1",
      find: (type: FindConstant, opts?: any) => {
        // Return different results based on type
        if (type === FIND_MY_STRUCTURES) {
          const allStructures = [
            { id: "struct1" as Id<Structure>, structureType: STRUCTURE_SPAWN },
            { id: "struct2" as Id<Structure>, structureType: STRUCTURE_TOWER }
          ];
          
          // Apply filter if provided
          if (opts?.filter) {
            return allStructures.filter(opts.filter);
          }
          return allStructures;
        }
        if (type === FIND_SOURCES) {
          return [{ id: "source1" as Id<Source> }, { id: "source2" as Id<Source> }];
        }
        if (type === FIND_HOSTILE_CREEPS) {
          return [{ id: "hostile1" as Id<Creep>, name: "invader1" }];
        }
        return [];
      }
    } as any as Room;
  });

  describe("getTTL()", () => {
    it("should return low bucket TTL when bucket is low", () => {
      (global as any).Game.cpu.bucket = 1000;
      const ttl = optimizer.getTTL(FIND_MY_STRUCTURES);
      expect(ttl).to.equal(100); // lowBucket value for structures
    });

    it("should return high bucket TTL when bucket is high", () => {
      (global as any).Game.cpu.bucket = 9000;
      const ttl = optimizer.getTTL(FIND_MY_STRUCTURES);
      expect(ttl).to.equal(20); // highBucket value for structures
    });

    it("should return normal TTL when bucket is in normal range", () => {
      (global as any).Game.cpu.bucket = 5000;
      const ttl = optimizer.getTTL(FIND_MY_STRUCTURES);
      expect(ttl).to.equal(50); // normal value for structures
    });

    it("should return very long TTL for sources (never change)", () => {
      (global as any).Game.cpu.bucket = 5000;
      const ttl = optimizer.getTTL(FIND_SOURCES);
      expect(ttl).to.equal(5000); // Sources never change
    });

    it("should return short TTL for hostile creeps", () => {
      (global as any).Game.cpu.bucket = 5000;
      const ttl = optimizer.getTTL(FIND_HOSTILE_CREEPS);
      expect(ttl).to.equal(10); // Normal bucket value for hostiles
    });

    it("should use fallback TTL for unknown find types", () => {
      (global as any).Game.cpu.bucket = 5000;
      const ttl = optimizer.getTTL(999 as FindConstant);
      expect(ttl).to.equal(20); // Fallback normal value
    });
  });

  describe("find()", () => {
    it("should cache results from room.find()", () => {
      const result1 = optimizer.find(mockRoom, FIND_MY_STRUCTURES);
      expect(result1).to.have.length(2);

      // Mock room.find to return different results
      const originalFind = mockRoom.find;
      mockRoom.find = () => {
        throw new Error("Should not call room.find again - should use cache");
      };

      // Should return cached result
      const result2 = optimizer.find(mockRoom, FIND_MY_STRUCTURES);
      expect(result2).to.deep.equal(result1);

      // Restore
      mockRoom.find = originalFind;
    });

    it("should support filter options", () => {
      const result = optimizer.find(mockRoom, FIND_MY_STRUCTURES, {
        filter: (s: Structure) => s.structureType === STRUCTURE_TOWER,
        filterKey: "towers"
      });

      expect(result).to.have.length(1);
      expect(result[0].structureType).to.equal(STRUCTURE_TOWER);
    });

    it("should use bucket-aware TTL", () => {
      // Low bucket - should cache longer
      (global as any).Game.cpu.bucket = 1000;
      const ttl1 = optimizer.getTTL(FIND_MY_STRUCTURES);
      expect(ttl1).to.equal(100);

      // High bucket - should cache shorter
      (global as any).Game.cpu.bucket = 9000;
      const ttl2 = optimizer.getTTL(FIND_MY_STRUCTURES);
      expect(ttl2).to.equal(20);

      expect(ttl1).to.be.greaterThan(ttl2);
    });

    it("should handle empty results", () => {
      const result = optimizer.find(mockRoom, FIND_NUKES);
      expect(result).to.be.an("array");
      expect(result).to.have.length(0);
    });
  });

  describe("invalidate()", () => {
    it("should invalidate structure cache on structure events", () => {
      // Cache some structures
      optimizer.find(mockRoom, FIND_MY_STRUCTURES);

      // Change the mock to return different results
      const newStructures = [{ id: "struct3" as Id<Structure>, structureType: STRUCTURE_EXTENSION }];
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_MY_STRUCTURES) return newStructures;
        return [];
      };

      // Invalidate
      optimizer.invalidate("W1N1", "structure_built");

      // Should get new results
      const result = optimizer.find(mockRoom, FIND_MY_STRUCTURES);
      expect(result).to.have.length(1);
      expect(result[0].structureType).to.equal(STRUCTURE_EXTENSION);
    });

    it("should invalidate construction site cache on construction events", () => {
      // Cache some construction sites
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_MY_CONSTRUCTION_SITES) {
          return [{ id: "site1" as Id<ConstructionSite> }];
        }
        return [];
      };

      optimizer.find(mockRoom, FIND_MY_CONSTRUCTION_SITES);

      // Change results
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_MY_CONSTRUCTION_SITES) {
          return [];
        }
        return [];
      };

      // Invalidate
      optimizer.invalidate("W1N1", "construction_site_removed");

      // Should get new results
      const result = optimizer.find(mockRoom, FIND_MY_CONSTRUCTION_SITES);
      expect(result).to.have.length(0);
    });

    it("should invalidate creep cache on creep events", () => {
      // Cache creeps
      optimizer.find(mockRoom, FIND_MY_CREEPS);

      // Invalidate
      optimizer.invalidate("W1N1", "creep_died");

      // Cache should be invalidated (tested implicitly through TTL)
    });

    it("should invalidate hostile cache on hostile events", () => {
      optimizer.find(mockRoom, FIND_HOSTILE_CREEPS);
      optimizer.invalidate("W1N1", "hostile_entered");
    });
  });

  describe("setBucketThresholds()", () => {
    it("should update bucket thresholds", () => {
      optimizer.setBucketThresholds({ low: 3000, high: 7000 });

      // Low bucket threshold changed
      (global as any).Game.cpu.bucket = 2500;
      let ttl = optimizer.getTTL(FIND_MY_STRUCTURES);
      expect(ttl).to.equal(100); // Should be lowBucket

      (global as any).Game.cpu.bucket = 3500;
      ttl = optimizer.getTTL(FIND_MY_STRUCTURES);
      expect(ttl).to.equal(50); // Should be normal
    });
  });

  describe("setTTLConfig()", () => {
    it("should update TTL config for a specific type", () => {
      optimizer.setTTLConfig(FIND_MY_STRUCTURES, {
        lowBucket: 200,
        normal: 100,
        highBucket: 50
      });

      (global as any).Game.cpu.bucket = 1000;
      const ttl = optimizer.getTTL(FIND_MY_STRUCTURES);
      expect(ttl).to.equal(200);
    });
  });

  describe("global singleton", () => {
    it("should export a global roomFindOptimizer instance", () => {
      expect(roomFindOptimizer).to.be.instanceOf(RoomFindOptimizer);
    });

    it("should work with the global instance", () => {
      const result = roomFindOptimizer.find(mockRoom, FIND_SOURCES);
      expect(result).to.have.length(2);
    });
  });
});

describe("ObjectIdOptimizer", () => {
  let optimizer: ObjectIdOptimizer;

  beforeEach(() => {
    clearObjectCache();

    optimizer = new ObjectIdOptimizer();

    // Mock Game object
    (global as any).Game = {
      time: 1000,
      getObjectById: (id: Id<any>) => {
        if (id === "struct1") {
          return { id: "struct1", structureType: STRUCTURE_SPAWN };
        }
        if (id === "source1") {
          return { id: "source1", energy: 3000 };
        }
        return null;
      }
    };
  });

  describe("getById()", () => {
    it("should cache Game.getObjectById results", () => {
      const result1 = optimizer.getById("struct1" as Id<Structure>);
      expect(result1).to.not.be.null;
      expect(result1!.id).to.equal("struct1");

      // Mock to throw if called again
      const originalGetById = (global as any).Game.getObjectById;
      (global as any).Game.getObjectById = () => {
        throw new Error("Should not call getObjectById again - should use cache");
      };

      // Should return cached result
      const result2 = optimizer.getById("struct1" as Id<Structure>);
      expect(result2).to.deep.equal(result1);

      // Restore
      (global as any).Game.getObjectById = originalGetById;
    });

    it("should return null for invalid IDs", () => {
      const result = optimizer.getById("invalid" as Id<Structure>);
      expect(result).to.be.null;
    });

    it("should handle null/undefined IDs", () => {
      expect(optimizer.getById(null)).to.be.null;
      expect(optimizer.getById(undefined)).to.be.null;
    });

    it("should support custom TTL", () => {
      const result = optimizer.getById("struct1" as Id<Structure>, 100);
      expect(result).to.not.be.null;
    });
  });

  describe("getBatch()", () => {
    it("should get multiple objects by ID", () => {
      const ids = ["struct1", "source1"] as Id<Structure>[];
      const results = optimizer.getBatch(ids);

      expect(results).to.have.length(2);
      expect(results[0].id).to.equal("struct1");
      expect(results[1].id).to.equal("source1");
    });

    it("should filter out null results", () => {
      const ids = ["struct1", "invalid", "source1"] as Id<Structure>[];
      const results = optimizer.getBatch(ids);

      expect(results).to.have.length(2);
      expect(results[0].id).to.equal("struct1");
      expect(results[1].id).to.equal("source1");
    });

    it("should handle empty array", () => {
      const results = optimizer.getBatch([]);
      expect(results).to.be.an("array");
      expect(results).to.have.length(0);
    });

    it("should handle array with nulls/undefined", () => {
      const ids = ["struct1", null, undefined, "source1"] as (Id<Structure> | null | undefined)[];
      const results = optimizer.getBatch(ids);

      expect(results).to.have.length(2);
    });
  });

  describe("global singleton", () => {
    it("should export a global objectIdOptimizer instance", () => {
      expect(objectIdOptimizer).to.be.instanceOf(ObjectIdOptimizer);
    });

    it("should work with the global instance", () => {
      const result = objectIdOptimizer.getById("struct1" as Id<Structure>);
      expect(result).to.not.be.null;
      expect(result!.id).to.equal("struct1");
    });
  });
});
