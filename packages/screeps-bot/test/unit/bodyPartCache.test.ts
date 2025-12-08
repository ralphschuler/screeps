/**
 * Unit tests for bodyPartCache module
 */

import { assert } from "chai";
import {
  getCachedBodyPartCount,
  hasCachedBodyPart,
  getCachedDamagePotential,
  getCachedHealPotential,
  getCachedCarryCapacity,
  getBodyPartCacheStats,
  clearBodyPartCache
} from "../../src/utils/bodyPartCache";

describe("bodyPartCache", () => {
  beforeEach(() => {
    // Reset Game
    // @ts-ignore: Setting up test environment
    global.Game = { time: 1000 };
    
    clearBodyPartCache();
  });

  function createMockCreep(name: string, body: BodyPartDefinition[]): Creep {
    return {
      name,
      body,
      store: {
        getCapacity: () => body.filter(p => p.type === CARRY).length * 50
      }
    } as unknown as Creep;
  }

  describe("getCachedBodyPartCount", () => {
    it("should count all body parts", () => {
      const creep = createMockCreep("test1", [
        { type: WORK, hits: 100 },
        { type: WORK, hits: 100 },
        { type: CARRY, hits: 100 },
        { type: MOVE, hits: 100 }
      ]);
      
      assert.equal(getCachedBodyPartCount(creep, WORK), 2);
      assert.equal(getCachedBodyPartCount(creep, CARRY), 1);
      assert.equal(getCachedBodyPartCount(creep, MOVE), 1);
      assert.equal(getCachedBodyPartCount(creep, ATTACK), 0);
    });

    it("should count only active parts when requested", () => {
      const creep = createMockCreep("test2", [
        { type: WORK, hits: 100 },
        { type: WORK, hits: 0 }, // damaged
        { type: CARRY, hits: 100 },
        { type: MOVE, hits: 0 } // damaged
      ]);
      
      assert.equal(getCachedBodyPartCount(creep, WORK, false), 2);
      assert.equal(getCachedBodyPartCount(creep, WORK, true), 1);
      assert.equal(getCachedBodyPartCount(creep, MOVE, false), 1);
      assert.equal(getCachedBodyPartCount(creep, MOVE, true), 0);
    });

    it("should use cache on repeated calls", () => {
      const creep = createMockCreep("test3", [
        { type: WORK, hits: 100 },
        { type: CARRY, hits: 100 }
      ]);
      
      const count1 = getCachedBodyPartCount(creep, WORK);
      const count2 = getCachedBodyPartCount(creep, WORK);
      
      assert.equal(count1, count2);
      assert.equal(count1, 1);
      
      // Should be in cache
      const stats = getBodyPartCacheStats();
      assert.equal(stats.size, 1);
    });
  });

  describe("hasCachedBodyPart", () => {
    it("should return true if creep has part", () => {
      const creep = createMockCreep("test4", [
        { type: ATTACK, hits: 100 },
        { type: MOVE, hits: 100 }
      ]);
      
      assert.isTrue(hasCachedBodyPart(creep, ATTACK));
      assert.isTrue(hasCachedBodyPart(creep, MOVE));
      assert.isFalse(hasCachedBodyPart(creep, HEAL));
    });

    it("should check active parts when requested", () => {
      const creep = createMockCreep("test5", [
        { type: ATTACK, hits: 100 },
        { type: HEAL, hits: 0 } // damaged
      ]);
      
      assert.isTrue(hasCachedBodyPart(creep, ATTACK, true));
      assert.isFalse(hasCachedBodyPart(creep, HEAL, true));
      assert.isTrue(hasCachedBodyPart(creep, HEAL, false));
    });
  });

  describe("getCachedDamagePotential", () => {
    it("should calculate damage from ATTACK parts", () => {
      const creep = createMockCreep("test6", [
        { type: ATTACK, hits: 100 },
        { type: ATTACK, hits: 100 },
        { type: MOVE, hits: 100 }
      ]);
      
      const damage = getCachedDamagePotential(creep);
      assert.equal(damage, 60); // 2 * 30
    });

    it("should calculate damage from RANGED_ATTACK parts", () => {
      const creep = createMockCreep("test7", [
        { type: RANGED_ATTACK, hits: 100 },
        { type: RANGED_ATTACK, hits: 100 },
        { type: RANGED_ATTACK, hits: 100 }
      ]);
      
      const damage = getCachedDamagePotential(creep);
      assert.equal(damage, 30); // 3 * 10
    });

    it("should calculate combined damage", () => {
      const creep = createMockCreep("test8", [
        { type: ATTACK, hits: 100 },
        { type: RANGED_ATTACK, hits: 100 },
        { type: MOVE, hits: 100 }
      ]);
      
      const damage = getCachedDamagePotential(creep);
      assert.equal(damage, 40); // 30 + 10
    });

    it("should ignore damaged parts", () => {
      const creep = createMockCreep("test9", [
        { type: ATTACK, hits: 100 },
        { type: ATTACK, hits: 0 }, // damaged
        { type: RANGED_ATTACK, hits: 0 } // damaged
      ]);
      
      const damage = getCachedDamagePotential(creep);
      assert.equal(damage, 30); // Only 1 ATTACK
    });
  });

  describe("getCachedHealPotential", () => {
    it("should calculate heal from HEAL parts", () => {
      const creep = createMockCreep("test10", [
        { type: HEAL, hits: 100 },
        { type: HEAL, hits: 100 },
        { type: MOVE, hits: 100 }
      ]);
      
      const heal = getCachedHealPotential(creep);
      assert.equal(heal, 24); // 2 * 12
    });

    it("should ignore damaged parts", () => {
      const creep = createMockCreep("test11", [
        { type: HEAL, hits: 100 },
        { type: HEAL, hits: 0 } // damaged
      ]);
      
      const heal = getCachedHealPotential(creep);
      assert.equal(heal, 12); // Only 1 HEAL
    });
  });

  describe("getCachedCarryCapacity", () => {
    it("should calculate carry capacity", () => {
      const creep = createMockCreep("test12", [
        { type: CARRY, hits: 100 },
        { type: CARRY, hits: 100 },
        { type: MOVE, hits: 100 }
      ]);
      
      const capacity = getCachedCarryCapacity(creep);
      assert.equal(capacity, 100); // 2 * 50
    });

    it("should ignore damaged parts", () => {
      const creep = createMockCreep("test13", [
        { type: CARRY, hits: 100 },
        { type: CARRY, hits: 0 } // damaged
      ]);
      
      const capacity = getCachedCarryCapacity(creep);
      assert.equal(capacity, 50); // Only 1 CARRY
    });
  });

  describe("cache invalidation", () => {
    it("should clear cache on new tick", () => {
      const creep = createMockCreep("test14", [
        { type: WORK, hits: 100 }
      ]);
      
      getCachedBodyPartCount(creep, WORK);
      
      const stats1 = getBodyPartCacheStats();
      assert.equal(stats1.size, 1);
      
      // Advance game time
      // @ts-ignore: Modifying test environment
      global.Game.time = 1001;
      
      // Cache should be cleared
      const stats2 = getBodyPartCacheStats();
      assert.equal(stats2.size, 0);
      assert.equal(stats2.tick, 1001);
    });
  });
});
