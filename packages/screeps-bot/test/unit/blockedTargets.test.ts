import { assert } from "chai";
import {
  blockTarget,
  isTargetBlocked,
  clearBlockedTargets,
  cleanupExpiredBlocks
} from "../../src/utils/blockedTargets";
import type { StuckTrackingMemory } from "../../src/roles/behaviors/types";

/**
 * Mock creep for testing
 */
function createMockCreep(memory: Partial<StuckTrackingMemory> = {}): Creep {
  const mockCreep = {
    name: "TestCreep",
    memory: memory as any
  };
  return mockCreep as unknown as Creep;
}

/**
 * Setup Game.time mock
 */
function setupGameTime(time: number): void {
  (global as any).Game = { time };
}

describe("Blocked Targets", () => {
  beforeEach(() => {
    setupGameTime(1000);
  });

  describe("blockTarget", () => {
    it("should block a target for the configured duration", () => {
      const creep = createMockCreep();
      const targetId = "target1" as Id<_HasId>;

      blockTarget(creep, targetId);

      const memory = creep.memory as unknown as StuckTrackingMemory;
      assert.isDefined(memory.blockedTargets);
      assert.isDefined(memory.blockedTargets![targetId]);
      // Should be blocked until Game.time + 50
      assert.equal(memory.blockedTargets![targetId], 1050);
    });

    it("should create blockedTargets object if it doesn't exist", () => {
      const creep = createMockCreep();
      const memory = creep.memory as unknown as StuckTrackingMemory;
      
      assert.isUndefined(memory.blockedTargets);

      blockTarget(creep, "target1" as Id<_HasId>);

      assert.isDefined(memory.blockedTargets);
    });

    it("should allow blocking multiple targets", () => {
      const creep = createMockCreep();
      const target1 = "target1" as Id<_HasId>;
      const target2 = "target2" as Id<_HasId>;

      blockTarget(creep, target1);
      blockTarget(creep, target2);

      const memory = creep.memory as unknown as StuckTrackingMemory;
      assert.isDefined(memory.blockedTargets![target1]);
      assert.isDefined(memory.blockedTargets![target2]);
    });
  });

  describe("isTargetBlocked", () => {
    it("should return false when target is not blocked", () => {
      const creep = createMockCreep();
      const targetId = "target1" as Id<_HasId>;

      const result = isTargetBlocked(creep, targetId);

      assert.isFalse(result);
    });

    it("should return true when target is actively blocked", () => {
      const creep = createMockCreep();
      const targetId = "target1" as Id<_HasId>;

      blockTarget(creep, targetId);
      const result = isTargetBlocked(creep, targetId);

      assert.isTrue(result);
    });

    it("should return false and cleanup when block has expired", () => {
      const creep = createMockCreep();
      const targetId = "target1" as Id<_HasId>;

      // Block at time 1000
      setupGameTime(1000);
      blockTarget(creep, targetId);

      // Move time forward past expiration (50 ticks)
      setupGameTime(1051);
      const result = isTargetBlocked(creep, targetId);

      assert.isFalse(result);
      
      // Verify block was cleaned up
      const memory = creep.memory as unknown as StuckTrackingMemory;
      assert.isUndefined(memory.blockedTargets?.[targetId]);
    });

    it("should return false when blockedTargets is undefined", () => {
      const creep = createMockCreep();
      const targetId = "target1" as Id<_HasId>;

      const result = isTargetBlocked(creep, targetId);

      assert.isFalse(result);
    });

    it("should handle edge case where block expires exactly at current time", () => {
      const creep = createMockCreep();
      const targetId = "target1" as Id<_HasId>;

      setupGameTime(1000);
      blockTarget(creep, targetId);

      // Move to exact expiration time
      setupGameTime(1050);
      const result = isTargetBlocked(creep, targetId);

      // At expiration time, block should be expired
      assert.isFalse(result);
    });
  });

  describe("clearBlockedTargets", () => {
    it("should remove all blocked targets", () => {
      const creep = createMockCreep();
      blockTarget(creep, "target1" as Id<_HasId>);
      blockTarget(creep, "target2" as Id<_HasId>);

      clearBlockedTargets(creep);

      const memory = creep.memory as unknown as StuckTrackingMemory;
      assert.isUndefined(memory.blockedTargets);
    });

    it("should handle creep with no blocked targets", () => {
      const creep = createMockCreep();

      // Should not throw
      clearBlockedTargets(creep);

      const memory = creep.memory as unknown as StuckTrackingMemory;
      assert.isUndefined(memory.blockedTargets);
    });
  });

  describe("cleanupExpiredBlocks", () => {
    it("should remove only expired blocks", () => {
      const creep = createMockCreep();
      const target1 = "target1" as Id<_HasId>;
      const target2 = "target2" as Id<_HasId>;

      setupGameTime(1000);
      blockTarget(creep, target1);
      
      setupGameTime(1010);
      blockTarget(creep, target2);

      // Move to time where target1 expires but target2 doesn't
      setupGameTime(1050);
      cleanupExpiredBlocks(creep);

      const memory = creep.memory as unknown as StuckTrackingMemory;
      assert.isUndefined(memory.blockedTargets?.[target1], "target1 should be expired");
      assert.isDefined(memory.blockedTargets?.[target2], "target2 should still be blocked");
    });

    it("should delete blockedTargets when all blocks expired", () => {
      const creep = createMockCreep();
      const target1 = "target1" as Id<_HasId>;

      setupGameTime(1000);
      blockTarget(creep, target1);

      // Move past expiration
      setupGameTime(1100);
      cleanupExpiredBlocks(creep);

      const memory = creep.memory as unknown as StuckTrackingMemory;
      assert.isUndefined(memory.blockedTargets);
    });

    it("should handle creep with no blocked targets", () => {
      const creep = createMockCreep();

      // Should not throw
      cleanupExpiredBlocks(creep);

      const memory = creep.memory as unknown as StuckTrackingMemory;
      assert.isUndefined(memory.blockedTargets);
    });

    it("should keep active blocks unchanged", () => {
      const creep = createMockCreep();
      const target1 = "target1" as Id<_HasId>;

      setupGameTime(1000);
      blockTarget(creep, target1);

      // Run cleanup before expiration
      setupGameTime(1020);
      cleanupExpiredBlocks(creep);

      const memory = creep.memory as unknown as StuckTrackingMemory;
      assert.isDefined(memory.blockedTargets![target1], "target1 should still be blocked");
      assert.equal(memory.blockedTargets![target1], 1050, "expiration time should be unchanged");
    });
  });
});
