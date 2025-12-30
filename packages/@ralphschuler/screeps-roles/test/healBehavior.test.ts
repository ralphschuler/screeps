/**
 * Tests for heal behavior
 */

import { expect } from "chai";
import { healBehavior, type CreepContext, type BehaviorResult } from "../src/index";

describe("healBehavior", () => {
  // Mock creep with heal parts
  const mockHealerCreep = {
    hits: 1000,
    hitsMax: 1000,
    pos: {
      findInRange: (type: number, range: number, opts?: any) => [] as Creep[],
      findClosestByRange: (targets: Creep[]) => null as Creep | null,
      getRangeTo: (target: any) => 5
    },
    getActiveBodyparts: (type: BodyPartConstant) => type === HEAL ? 2 : 0
  } as unknown as Creep;

  // Base mock context
  const createMockContext = (overrides?: Partial<CreepContext>): CreepContext => ({
    creep: mockHealerCreep,
    room: {
      find: () => [] as any[]
    } as unknown as Room,
    memory: { role: "healer", homeRoom: "W1N1" },
    homeRoom: "W1N1",
    isInHomeRoom: true,
    isFull: false,
    isEmpty: true,
    isWorking: false,
    assignedSource: null,
    assignedMineral: null,
    energyAvailable: true,
    nearbyEnemies: false,
    constructionSiteCount: 0,
    damagedStructureCount: 0,
    droppedResources: [],
    containers: [],
    depositContainers: [],
    spawnStructures: [],
    towers: [],
    storage: undefined,
    terminal: undefined,
    hostiles: [],
    damagedAllies: [],
    prioritizedSites: [],
    repairTargets: [],
    labs: [],
    factory: undefined,
    tombstones: [],
    mineralContainers: [],
    ...overrides
  });

  describe("Priority 1: Self-healing", () => {
    it("should heal self when critically damaged (< 50% health)", () => {
      const ctx = createMockContext();
      ctx.creep.hits = 400; // 40% health
      ctx.creep.hitsMax = 1000;

      const result: BehaviorResult = healBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("heal");
      expect((result.action as any).target).to.equal(ctx.creep);
      expect(result.context).to.equal("heal:self-critical");
    });

    it("should heal self when at exactly 50% health", () => {
      const ctx = createMockContext();
      ctx.creep.hits = 500; // 50% health
      ctx.creep.hitsMax = 1000;

      const result: BehaviorResult = healBehavior(ctx);

      // At exactly 50%, should still heal (< 50% threshold)
      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("heal");
      expect((result.action as any).target).to.equal(ctx.creep);
    });

    it("should not self-heal when health is above 50%", () => {
      const ctx = createMockContext();
      ctx.creep.hits = 600; // 60% health
      ctx.creep.hitsMax = 1000;

      const result: BehaviorResult = healBehavior(ctx);

      // Should not be self-healing (context would be different)
      if (result.action.type === "heal") {
        expect((result.action as any).target).to.not.equal(ctx.creep);
      }
    });
  });

  describe("Priority 2: Healing damaged allies", () => {
    it("should heal most damaged ally in range with melee heal (range 1)", () => {
      const damagedAlly1 = {
        hits: 800,
        hitsMax: 1000,
        pos: { x: 10, y: 10, roomName: "W1N1" }
      } as unknown as Creep;
      
      const damagedAlly2 = {
        hits: 300,
        hitsMax: 1000,
        pos: { x: 11, y: 10, roomName: "W1N1" }
      } as unknown as Creep;

      const ctx = createMockContext();
      ctx.creep.hits = 1000; // Full health
      
      // Mock findInRange to return damaged allies
      ctx.creep.pos.findInRange = (type: number, range: number, opts?: any) => {
        if (type === FIND_MY_CREEPS && range === 3) {
          return [damagedAlly1, damagedAlly2];
        }
        return [];
      };

      // Mock getRangeTo to return 1 (adjacent)
      ctx.creep.pos.getRangeTo = (target: any) => {
        return target === damagedAlly2 ? 1 : 3;
      };

      const result: BehaviorResult = healBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("heal");
      expect((result.action as any).target).to.equal(damagedAlly2);
      expect(result.context).to.equal("heal:ally-melee");
    });

    it("should use ranged heal for allies at range 2-3", () => {
      const damagedAlly = {
        hits: 500,
        hitsMax: 1000,
        pos: { x: 12, y: 10, roomName: "W1N1" }
      } as unknown as Creep;

      const ctx = createMockContext();
      ctx.creep.hits = 1000; // Full health
      
      ctx.creep.pos.findInRange = (type: number, range: number, opts?: any) => {
        if (type === FIND_MY_CREEPS && range === 3) {
          return [damagedAlly];
        }
        return [];
      };

      // Mock getRangeTo to return 2
      ctx.creep.pos.getRangeTo = (target: any) => 2;

      const result: BehaviorResult = healBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("rangedHeal");
      expect((result.action as any).target).to.equal(damagedAlly);
      expect(result.context).to.equal("heal:ally-ranged");
    });

    it("should prioritize most damaged ally when multiple are in range", () => {
      const ally1 = {
        hits: 900,
        hitsMax: 1000,
        pos: { x: 10, y: 10, roomName: "W1N1" }
      } as unknown as Creep;
      
      const ally2 = {
        hits: 200,
        hitsMax: 1000,
        pos: { x: 11, y: 10, roomName: "W1N1" }
      } as unknown as Creep;
      
      const ally3 = {
        hits: 600,
        hitsMax: 1000,
        pos: { x: 12, y: 10, roomName: "W1N1" }
      } as unknown as Creep;

      const ctx = createMockContext();
      ctx.creep.hits = 1000; // Full health
      
      ctx.creep.pos.findInRange = (type: number, range: number, opts?: any) => {
        if (type === FIND_MY_CREEPS && range === 3) {
          return [ally1, ally2, ally3];
        }
        return [];
      };

      ctx.creep.pos.getRangeTo = () => 2;

      const result: BehaviorResult = healBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("rangedHeal");
      // Should target ally2 as it's most damaged (200/1000 = 20%)
      expect((result.action as any).target).to.equal(ally2);
    });
  });

  describe("Priority 3: Following military creeps", () => {
    it("should follow military creeps when hostiles present", () => {
      const militaryCreep = {
        pos: { x: 20, y: 20, roomName: "W1N1" },
        getActiveBodyparts: (type: BodyPartConstant) => type === ATTACK ? 5 : 0
      } as unknown as Creep;

      const ctx = createMockContext();
      ctx.creep.hits = 1000; // Full health
      ctx.hostiles = [{ pos: { x: 30, y: 30, roomName: "W1N1" } } as Creep];
      
      // No damaged allies in range
      ctx.creep.pos.findInRange = () => [];
      
      // Mock room.find to return military creeps
      ctx.room.find = (type: number, opts?: any) => {
        if (type === FIND_MY_CREEPS) {
          return [militaryCreep];
        }
        return [];
      };

      // Mock findClosestByRange
      ctx.creep.pos.findClosestByRange = (targets: Creep[]) => {
        return targets.length > 0 ? militaryCreep : null;
      };

      // Mock getRangeTo to return > 3 (needs to move closer)
      ctx.creep.pos.getRangeTo = () => 5;

      const result: BehaviorResult = healBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("moveTo");
      expect((result.action as any).target).to.equal(militaryCreep);
      expect(result.context).to.equal("heal:follow-military");
    });

    it("should not move if already within range 3 of military", () => {
      const militaryCreep = {
        pos: { x: 20, y: 20, roomName: "W1N1" },
        getActiveBodyparts: (type: BodyPartConstant) => type === ATTACK ? 5 : 0
      } as unknown as Creep;

      const ctx = createMockContext();
      ctx.creep.hits = 1000;
      ctx.hostiles = [{ pos: { x: 30, y: 30, roomName: "W1N1" } } as Creep];
      
      ctx.creep.pos.findInRange = () => [];
      
      ctx.room.find = (type: number) => {
        if (type === FIND_MY_CREEPS) {
          return [militaryCreep];
        }
        return [];
      };

      ctx.creep.pos.findClosestByRange = (targets: Creep[]) => {
        return targets.length > 0 ? militaryCreep : null;
      };

      // Already within range 3
      ctx.creep.pos.getRangeTo = () => 2;

      const result: BehaviorResult = healBehavior(ctx);

      expect(result.success).to.be.true;
      // Should idle instead of moving
      expect(result.action.type).to.equal("idle");
      expect(result.context).to.equal("heal:idle");
    });
  });

  describe("Priority 4: Idle", () => {
    it("should idle when no targets to heal and no hostiles", () => {
      const ctx = createMockContext();
      ctx.creep.hits = 1000; // Full health
      ctx.hostiles = []; // No hostiles
      
      // No damaged allies in range
      ctx.creep.pos.findInRange = () => [];

      const result: BehaviorResult = healBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("idle");
      expect(result.context).to.equal("heal:idle");
    });

    it("should idle when fully healthy and no damaged allies", () => {
      const ctx = createMockContext();
      ctx.creep.hits = 1000;
      ctx.creep.hitsMax = 1000;
      
      ctx.creep.pos.findInRange = () => [];
      ctx.hostiles = [];

      const result: BehaviorResult = healBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("idle");
      expect(result.context).to.equal("heal:idle");
    });
  });

  describe("Edge cases", () => {
    it("should handle creep with zero max health", () => {
      const ctx = createMockContext();
      ctx.creep.hits = 0;
      ctx.creep.hitsMax = 0;

      const result: BehaviorResult = healBehavior(ctx);

      // Should not crash
      expect(result).to.have.property("action");
      expect(result).to.have.property("success");
    });

    it("should handle empty room", () => {
      const ctx = createMockContext();
      ctx.creep.hits = 1000;
      ctx.room.find = () => [];
      ctx.creep.pos.findInRange = () => [];

      const result: BehaviorResult = healBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("idle");
    });
  });
});
