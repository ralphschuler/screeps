/**
 * Tests for attack behavior
 */

import { expect } from "chai";
import { attackBehavior, type CreepContext, type BehaviorResult } from "../src/index";

describe("attackBehavior", () => {
  // Mock attacker creep with attack and ranged attack parts
  const mockAttackerCreep = {
    hits: 1000,
    hitsMax: 1000,
    pos: {
      x: 25,
      y: 25,
      roomName: "W1N1",
      findInRange: (type: number, range: number, opts?: any) => [] as any[],
      findClosestByRange: (targets: any[] | number, opts?: any) => {
        // Handle both array and number (FindConstant) inputs
        if (Array.isArray(targets)) {
          return targets.length > 0 ? targets[0] : null;
        }
        return null;
      },
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
    creep: mockAttackerCreep,
    room: {
      name: "W1N1",
      find: (type: number, opts?: any) => [] as any[]
    } as unknown as Room,
    memory: { role: "soldier", homeRoom: "W1N1" },
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

  describe("Priority 1: Move to target room", () => {
    it("should move to assigned target room when not there", () => {
      const ctx = createMockContext();
      ctx.memory.targetRoom = "W2N1";
      ctx.room.name = "W1N1"; // Different room

      const result: BehaviorResult = attackBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("moveToRoom");
      expect((result.action as any).roomName).to.equal("W2N1");
      expect(result.context).to.equal("attack:move-to-target");
    });

    it("should stay in home room when no target room assigned", () => {
      const ctx = createMockContext();
      // No targetRoom in memory - should default to homeRoom

      const result: BehaviorResult = attackBehavior(ctx);

      // Should not move to another room
      expect(result.action.type).to.not.equal("moveToRoom");
    });

    it("should not move when already in target room", () => {
      const ctx = createMockContext();
      ctx.memory.targetRoom = "W1N1";
      ctx.room.name = "W1N1"; // Already in target room

      const result: BehaviorResult = attackBehavior(ctx);

      // Should not be moving to room
      expect(result.action.type).to.not.equal("moveToRoom");
    });
  });

  describe("Priority 2: Attack hostile creeps", () => {
    it("should use ranged attack on hostile at range 3", () => {
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

      const result: BehaviorResult = attackBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("rangedAttack");
      expect((result.action as any).target).to.equal(hostile);
      expect(result.context).to.equal("attack:ranged-attack-creep");
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

      const result: BehaviorResult = attackBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("attack");
      expect((result.action as any).target).to.equal(hostile);
      expect(result.context).to.equal("attack:melee-attack-creep");
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

      const result: BehaviorResult = attackBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("moveTo");
      expect((result.action as any).target).to.equal(hostile);
      expect(result.context).to.equal("attack:approach-hostile");
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

      const result: BehaviorResult = attackBehavior(ctx);

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

      const result: BehaviorResult = attackBehavior(ctx);

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

      const result: BehaviorResult = attackBehavior(ctx);

      expect(result.success).to.be.true;
      // Should target boosted creep (boost adds priority)
      expect((result.action as any).target).to.equal(boosted);
    });
  });

  describe("Priority 3: Attack hostile structures", () => {
    it("should attack hostile structure when no creeps present", () => {
      const hostileSpawn = {
        structureType: STRUCTURE_SPAWN,
        pos: { x: 30, y: 30, roomName: "W1N1" },
        hits: 5000,
        hitsMax: 5000
      } as StructureSpawn;

      const ctx = createMockContext({
        hostiles: [] // No hostile creeps
      });

      // Mock room.find to return hostile structures
      ctx.room.find = (type: number, opts?: any) => {
        if (type === FIND_HOSTILE_STRUCTURES) {
          return [hostileSpawn];
        }
        return [];
      };

      // Mock findClosestByRange
      ctx.creep.pos.findClosestByRange = (targets: any) => {
        if (Array.isArray(targets) && targets.length > 0) {
          return hostileSpawn;
        }
        return null;
      };

      ctx.creep.pos.getRangeTo = (target: any) => target === hostileSpawn ? 1 : 10;

      const result: BehaviorResult = attackBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("attack");
      expect((result.action as any).target).to.equal(hostileSpawn);
      expect(result.context).to.equal("attack:melee-attack-structure");
    });

    it("should use ranged attack on structure at range 3", () => {
      const hostileTower = {
        structureType: STRUCTURE_TOWER,
        pos: { x: 28, y: 25, roomName: "W1N1" },
        hits: 3000,
        hitsMax: 3000
      } as StructureTower;

      const ctx = createMockContext({
        hostiles: []
      });

      ctx.room.find = (type: number, opts?: any) => {
        if (type === FIND_HOSTILE_STRUCTURES) {
          return [hostileTower];
        }
        return [];
      };

      ctx.creep.pos.findClosestByRange = (targets: any) => {
        if (Array.isArray(targets) && targets.length > 0) {
          return hostileTower;
        }
        return null;
      };

      ctx.creep.pos.getRangeTo = (target: any) => target === hostileTower ? 3 : 10;

      const result: BehaviorResult = attackBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("rangedAttack");
      expect((result.action as any).target).to.equal(hostileTower);
      expect(result.context).to.equal("attack:ranged-attack-structure");
    });

    it("should move towards structure when out of range", () => {
      const hostileExtension = {
        structureType: STRUCTURE_EXTENSION,
        pos: { x: 40, y: 40, roomName: "W1N1" },
        hits: 1000,
        hitsMax: 1000
      } as StructureExtension;

      const ctx = createMockContext({
        hostiles: []
      });

      ctx.room.find = (type: number, opts?: any) => {
        if (type === FIND_HOSTILE_STRUCTURES) {
          return [hostileExtension];
        }
        return [];
      };

      ctx.creep.pos.findClosestByRange = (targets: any) => {
        if (Array.isArray(targets) && targets.length > 0) {
          return hostileExtension;
        }
        return null;
      };

      ctx.creep.pos.getRangeTo = (target: any) => target === hostileExtension ? 10 : 10;

      const result: BehaviorResult = attackBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("moveTo");
      expect((result.action as any).target).to.equal(hostileExtension);
      expect(result.context).to.equal("attack:approach-structure");
    });

    it("should not attack controllers", () => {
      const controller = {
        structureType: STRUCTURE_CONTROLLER,
        pos: { x: 30, y: 30, roomName: "W1N1" }
      } as StructureController;

      const ctx = createMockContext({
        hostiles: []
      });

      // Mock room.find to filter out controllers
      ctx.room.find = (type: number, opts?: any) => {
        if (type === FIND_HOSTILE_STRUCTURES) {
          // Filter should exclude controllers
          const allStructures = [controller];
          if (opts?.filter) {
            return allStructures.filter(opts.filter);
          }
          return allStructures;
        }
        return [];
      };

      const result: BehaviorResult = attackBehavior(ctx);

      expect(result.success).to.be.true;
      // Should idle since controller should be filtered out
      expect(result.action.type).to.equal("idle");
      expect(result.context).to.equal("attack:idle");
    });

    it("should prioritize hostile creeps over structures", () => {
      const hostile = {
        hits: 1000,
        hitsMax: 1000,
        pos: { x: 26, y: 25, roomName: "W1N1" },
        body: [{ type: ATTACK, hits: 100 }],
        getActiveBodyparts: (type: BodyPartConstant) => type === ATTACK ? 5 : 0
      } as unknown as Creep;

      const hostileSpawn = {
        structureType: STRUCTURE_SPAWN,
        pos: { x: 27, y: 25, roomName: "W1N1" },
        hits: 5000,
        hitsMax: 5000
      } as StructureSpawn;

      const ctx = createMockContext({
        hostiles: [hostile]
      });

      ctx.room.find = (type: number, opts?: any) => {
        if (type === FIND_HOSTILE_STRUCTURES) {
          return [hostileSpawn];
        }
        return [];
      };

      ctx.creep.pos.getRangeTo = (target: any) => 1;

      const result: BehaviorResult = attackBehavior(ctx);

      expect(result.success).to.be.true;
      // Should attack creep, not structure
      expect((result.action as any).target).to.equal(hostile);
      expect(result.context).to.include("creep");
    });
  });

  describe("Priority 4: Idle", () => {
    it("should idle when no targets available", () => {
      const ctx = createMockContext({
        hostiles: []
      });

      ctx.room.find = () => [];

      const result: BehaviorResult = attackBehavior(ctx);

      expect(result.success).to.be.true;
      expect(result.action.type).to.equal("idle");
      expect(result.context).to.equal("attack:idle");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty hostile list", () => {
      const ctx = createMockContext({
        hostiles: []
      });

      const result: BehaviorResult = attackBehavior(ctx);

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

      const result: BehaviorResult = attackBehavior(ctx);

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

      const result: BehaviorResult = attackBehavior(ctx);

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

      const result: BehaviorResult = attackBehavior(ctx);

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

      const result: BehaviorResult = attackBehavior(ctx);

      expect(result.success).to.be.true;
      // Should target one of them (deterministic based on array order)
      expect([hostile1, hostile2]).to.include((result.action as any).target);
    });

    it("should handle creep with no attack parts at all", () => {
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

      // Creep with no attack parts
      ctx.creep.getActiveBodyparts = () => 0;

      ctx.creep.pos.getRangeTo = (target: any) => 1;

      const result: BehaviorResult = attackBehavior(ctx);

      expect(result.success).to.be.true;
      // Should still try to move towards hostile
      expect(result.action.type).to.equal("moveTo");
      expect((result.action as any).target).to.equal(hostile);
    });
  });
});
