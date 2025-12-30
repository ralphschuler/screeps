/**
 * Tests for defend behavior
 */

import { expect } from "chai";
import { defendBehavior, type CreepContext, type BehaviorResult } from "../src/index";

describe("defendBehavior", () => {
  // Mock defender creep with attack and ranged attack parts
  const mockDefenderCreep = {
    hits: 1000,
    hitsMax: 1000,
    pos: {
      x: 25,
      y: 25,
      roomName: "W1N1",
      findInRange: (type: number, range: number, opts?: any) => [] as Creep[],
      findClosestByRange: (targets: Creep[]) => null as Creep | null,
      getRangeTo: (target: any) => 5
    },
    getActiveBodyparts: (type: BodyPartConstant) => {
      if (type === ATTACK) return 5;
      if (type === RANGED_ATTACK) return 3;
      return 0;
    }
  } as unknown as Creep;

  // Base mock context
  const createMockContext = (overrides?: Partial<CreepContext>): CreepContext => ({
    creep: mockDefenderCreep,
    room: {
      name: "W1N1",
      find: () => [] as any[]
    } as unknown as Room,
    memory: { role: "guard", homeRoom: "W1N1" },
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

  describe("Priority 1: Return to home room", () => {
    it("should return to home room when not there", () => {
      const ctx = createMockContext({
        isInHomeRoom: false
      });
      ctx.room.name = "W2N1"; // Different room

      const result: BehaviorResult = defendBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("moveToRoom");
      expect((result.action as any).roomName).to.equal("W1N1");
      expect(result.context).to.equal("defend:return-home");
    });

    it("should not return home when already in home room", () => {
      const ctx = createMockContext({
        isInHomeRoom: true
      });

      const result: BehaviorResult = defendBehavior(ctx);

      // Should not be returning home
      expect(result.action.type).to.not.equal("moveToRoom");
    });
  });

  describe("Priority 2: Engage hostiles", () => {
    it("should use ranged attack on hostile in range 3", () => {
      const hostile = {
        hits: 1000,
        hitsMax: 1000,
        pos: { x: 28, y: 25, roomName: "W1N1" },
        body: [{ type: ATTACK, hits: 100 }],
        getActiveBodyparts: (type: BodyPartConstant) => type === ATTACK ? 5 : 0
      } as unknown as Creep;

      const ctx = createMockContext({
        hostiles: [hostile]
      });

      // Mock getRangeTo to return 3
      ctx.creep.pos.getRangeTo = (target: any) => target === hostile ? 3 : 10;

      const result: BehaviorResult = defendBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("rangedAttack");
      expect((result.action as any).target).to.equal(hostile);
      expect(result.context).to.equal("defend:ranged-attack");
    });

    it("should use melee attack on hostile at range 1", () => {
      const hostile = {
        hits: 1000,
        hitsMax: 1000,
        pos: { x: 26, y: 25, roomName: "W1N1" },
        body: [{ type: ATTACK, hits: 100 }],
        getActiveBodyparts: (type: BodyPartConstant) => type === ATTACK ? 5 : 0
      } as unknown as Creep;

      const ctx = createMockContext({
        hostiles: [hostile]
      });

      // Mock getRangeTo to return 1 (adjacent)
      ctx.creep.pos.getRangeTo = (target: any) => target === hostile ? 1 : 10;

      const result: BehaviorResult = defendBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("attack");
      expect((result.action as any).target).to.equal(hostile);
      expect(result.context).to.equal("defend:melee-attack");
    });

    it("should move towards hostile when out of range", () => {
      const hostile = {
        hits: 1000,
        hitsMax: 1000,
        pos: { x: 35, y: 35, roomName: "W1N1" },
        body: [{ type: ATTACK, hits: 100 }],
        getActiveBodyparts: (type: BodyPartConstant) => type === ATTACK ? 5 : 0
      } as unknown as Creep;

      const ctx = createMockContext({
        hostiles: [hostile]
      });

      // Mock getRangeTo to return 10 (far away)
      ctx.creep.pos.getRangeTo = (target: any) => target === hostile ? 10 : 10;

      const result: BehaviorResult = defendBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("moveTo");
      expect((result.action as any).target).to.equal(hostile);
      expect(result.context).to.equal("defend:approach-hostile");
    });

    it("should prioritize healers over other hostiles", () => {
      const healer = {
        hits: 500,
        hitsMax: 1000,
        pos: { x: 20, y: 20, roomName: "W1N1" },
        body: [{ type: HEAL, hits: 100 }],
        getActiveBodyparts: (type: BodyPartConstant) => type === HEAL ? 5 : 0
      } as unknown as Creep;

      const melee = {
        hits: 1000,
        hitsMax: 1000,
        pos: { x: 26, y: 25, roomName: "W1N1" },
        body: [{ type: ATTACK, hits: 100 }],
        getActiveBodyparts: (type: BodyPartConstant) => type === ATTACK ? 5 : 0
      } as unknown as Creep;

      const ctx = createMockContext({
        hostiles: [melee, healer]
      });

      // Mock getRangeTo
      ctx.creep.pos.getRangeTo = (target: any) => {
        if (target === healer) return 8;
        if (target === melee) return 1;
        return 10;
      };

      const result: BehaviorResult = defendBehavior(ctx);

      expect(result.success).to.be.true;
      // Should target healer (higher priority) even though melee is closer
      expect((result.action as any).target).to.equal(healer);
    });

    it("should prioritize ranged attackers over melee", () => {
      const ranged = {
        hits: 800,
        hitsMax: 1000,
        pos: { x: 20, y: 20, roomName: "W1N1" },
        body: [{ type: RANGED_ATTACK, hits: 100 }],
        getActiveBodyparts: (type: BodyPartConstant) => type === RANGED_ATTACK ? 3 : 0
      } as unknown as Creep;

      const melee = {
        hits: 1000,
        hitsMax: 1000,
        pos: { x: 26, y: 25, roomName: "W1N1" },
        body: [{ type: ATTACK, hits: 100 }],
        getActiveBodyparts: (type: BodyPartConstant) => type === ATTACK ? 5 : 0
      } as unknown as Creep;

      const ctx = createMockContext({
        hostiles: [melee, ranged]
      });

      ctx.creep.pos.getRangeTo = (target: any) => {
        if (target === ranged) return 5;
        if (target === melee) return 1;
        return 10;
      };

      const result: BehaviorResult = defendBehavior(ctx);

      expect(result.success).to.be.true;
      // Should target ranged (higher priority)
      expect((result.action as any).target).to.equal(ranged);
    });

    it("should prioritize boosted creeps", () => {
      const boosted = {
        hits: 1000,
        hitsMax: 1000,
        pos: { x: 20, y: 20, roomName: "W1N1" },
        body: [{ type: WORK, hits: 100, boost: "UH" as MineralBoostConstant }],
        getActiveBodyparts: (type: BodyPartConstant) => type === WORK ? 5 : 0
      } as unknown as Creep;

      const worker = {
        hits: 1000,
        hitsMax: 1000,
        pos: { x: 26, y: 25, roomName: "W1N1" },
        body: [{ type: WORK, hits: 100 }],
        getActiveBodyparts: (type: BodyPartConstant) => type === WORK ? 5 : 0
      } as unknown as Creep;

      const ctx = createMockContext({
        hostiles: [worker, boosted]
      });

      ctx.creep.pos.getRangeTo = () => 5;

      const result: BehaviorResult = defendBehavior(ctx);

      expect(result.success).to.be.true;
      // Should target boosted creep (boost adds priority)
      expect((result.action as any).target).to.equal(boosted);
    });
  });

  describe("Priority 3: Patrol when no hostiles", () => {
    it("should patrol near spawn when no hostiles present", () => {
      const spawn = {
        structureType: STRUCTURE_SPAWN,
        pos: { x: 25, y: 25, roomName: "W1N1" }
      } as StructureSpawn;

      const ctx = createMockContext({
        spawnStructures: [spawn],
        hostiles: []
      });

      // Mock creep far from spawn area
      ctx.creep.pos.x = 10;
      ctx.creep.pos.y = 10;
      ctx.creep.pos.getRangeTo = (target: any) => {
        if (target.x && target.y) {
          // Simple distance calculation
          const dx = Math.abs(ctx.creep.pos.x - target.x);
          const dy = Math.abs(ctx.creep.pos.y - target.y);
          return Math.max(dx, dy);
        }
        return 10;
      };

      const result: BehaviorResult = defendBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("moveTo");
      expect(result.context).to.equal("defend:patrol");
    });

    it("should idle when already at patrol position", () => {
      const spawn = {
        structureType: STRUCTURE_SPAWN,
        pos: { x: 25, y: 25, roomName: "W1N1" }
      } as StructureSpawn;

      const ctx = createMockContext({
        spawnStructures: [spawn],
        hostiles: []
      });

      // Mock creep already at spawn
      ctx.creep.pos.x = 25;
      ctx.creep.pos.y = 25;
      ctx.creep.pos.getRangeTo = (target: any) => 0;

      const result: BehaviorResult = defendBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("idle");
      expect(result.context).to.equal("defend:idle");
    });
  });

  describe("Priority 4: Idle", () => {
    it("should idle when no spawns and no hostiles", () => {
      const ctx = createMockContext({
        spawnStructures: [],
        hostiles: []
      });

      const result: BehaviorResult = defendBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("idle");
      expect(result.context).to.equal("defend:idle");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty hostile list", () => {
      const ctx = createMockContext({
        hostiles: []
      });

      const result: BehaviorResult = defendBehavior(ctx);

      // Should not crash
      expect(result).to.have.property("action");
      expect(result).to.have.property("success");
      expect(result.success).to.be.true;
    });

    it("should handle creep with only melee parts (no ranged)", () => {
      const hostile = {
        hits: 1000,
        hitsMax: 1000,
        pos: { x: 28, y: 25, roomName: "W1N1" },
        body: [{ type: ATTACK, hits: 100 }],
        getActiveBodyparts: (type: BodyPartConstant) => type === ATTACK ? 5 : 0
      } as unknown as Creep;

      const ctx = createMockContext({
        hostiles: [hostile]
      });

      // Creep with only melee (no ranged)
      ctx.creep.getActiveBodyparts = (type: BodyPartConstant) => {
        if (type === ATTACK) return 5;
        return 0;
      };

      ctx.creep.pos.getRangeTo = (target: any) => 3;

      const result: BehaviorResult = defendBehavior(ctx);

      expect(result.success).to.be.true;
      // Should move to engage (not ranged attack)
      expect(result.action.type).to.equal("moveTo");
    });

    it("should handle creep with only ranged parts (no melee)", () => {
      const hostile = {
        hits: 1000,
        hitsMax: 1000,
        pos: { x: 26, y: 25, roomName: "W1N1" },
        body: [{ type: ATTACK, hits: 100 }],
        getActiveBodyparts: (type: BodyPartConstant) => type === ATTACK ? 5 : 0
      } as unknown as Creep;

      const ctx = createMockContext({
        hostiles: [hostile]
      });

      // Creep with only ranged (no melee)
      ctx.creep.getActiveBodyparts = (type: BodyPartConstant) => {
        if (type === RANGED_ATTACK) return 3;
        return 0;
      };

      ctx.creep.pos.getRangeTo = (target: any) => 1;

      const result: BehaviorResult = defendBehavior(ctx);

      expect(result.success).to.be.true;
      // Should use ranged attack even at range 1 (no melee available)
      expect(result.action.type).to.equal("rangedAttack");
    });

    it("should handle hostile with no body parts", () => {
      const hostile = {
        hits: 1000,
        hitsMax: 1000,
        pos: { x: 26, y: 25, roomName: "W1N1" },
        body: [],
        getActiveBodyparts: () => 0
      } as unknown as Creep;

      const ctx = createMockContext({
        hostiles: [hostile]
      });

      ctx.creep.pos.getRangeTo = () => 5;

      const result: BehaviorResult = defendBehavior(ctx);

      expect(result.success).to.be.true;
      // Should still engage the hostile (move towards it)
      expect((result.action as any).target).to.equal(hostile);
    });

    it("should handle multiple hostiles with equal priority", () => {
      const hostile1 = {
        hits: 1000,
        hitsMax: 1000,
        pos: { x: 20, y: 20, roomName: "W1N1" },
        body: [{ type: ATTACK, hits: 100 }],
        getActiveBodyparts: (type: BodyPartConstant) => type === ATTACK ? 5 : 0
      } as unknown as Creep;

      const hostile2 = {
        hits: 1000,
        hitsMax: 1000,
        pos: { x: 30, y: 30, roomName: "W1N1" },
        body: [{ type: ATTACK, hits: 100 }],
        getActiveBodyparts: (type: BodyPartConstant) => type === ATTACK ? 5 : 0
      } as unknown as Creep;

      const ctx = createMockContext({
        hostiles: [hostile1, hostile2]
      });

      ctx.creep.pos.getRangeTo = () => 5;

      const result: BehaviorResult = defendBehavior(ctx);

      expect(result.success).to.be.true;
      // Should target one of them (deterministic based on array order)
      expect([hostile1, hostile2]).to.include((result.action as any).target);
    });
  });
});
