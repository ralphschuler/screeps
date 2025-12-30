/**
 * Comprehensive tests for buildBehavior
 */

import { expect } from "chai";
import { buildBehavior } from "../src/behaviors/economy/index";
import { createContext } from "../src/framework/BehaviorContext";
import type { CreepContext, BehaviorResult } from "../src/framework/types";
import { createMockCreep, createMockRoom, resetMockGame } from "./setup";

describe("buildBehavior", () => {
  beforeEach(() => {
    resetMockGame();
  });

  describe("Basic Functionality", () => {
    it("should return idle when creep is empty and no energy sources available", () => {
      const room = createMockRoom("W1N1");
      const creep = createMockCreep("builder1", {
        room,
        memory: { role: "builder", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      // Mock room.find to return empty arrays
      room.find = (type: number) => [];

      const ctx = createContext(creep);
      const result = buildBehavior(ctx as CreepContext);

      expect(result.success).to.equal(false);
      expect(result.action.type).to.equal("idle");
      expect(result.error).to.equal("No energy sources available");
    });

    it("should return idle when no construction sites or controller available", () => {
      const room = createMockRoom("W1N1"); // No controller or construction sites
      const creep = createMockCreep("builder1", {
        room,
        memory: { role: "builder", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);

      const result = buildBehavior(ctx as CreepContext);

      expect(result.success).to.equal(false);
      expect(result.action.type).to.equal("idle");
      expect(result.error).to.equal("No construction sites or controller available");
    });
  });

  describe("Energy Collection (working=false)", () => {
    it("should pickup dropped resources when available", () => {
      const room = createMockRoom("W1N1");
      const resource = {
        id: "resource1",
        resourceType: RESOURCE_ENERGY,
        amount: 100,
        pos: { x: 25, y: 25, roomName: "W1N1" }
      } as any;

      const creep = createMockCreep("builder1", {
        room,
        memory: { role: "builder", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      ctx.droppedResources = [resource];

      const result = buildBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("pickup");
      if (result.action.type === "pickup") {
        expect(result.action.target).to.equal(resource);
      }
    });

    it("should withdraw from container when available", () => {
      const container = {
        id: "container1",
        structureType: STRUCTURE_CONTAINER,
        store: {
          getUsedCapacity: (resource: string) => 200
        },
        pos: { x: 26, y: 26, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("builder1", {
        room,
        memory: { role: "builder", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      ctx.containers = [container];

      const result = buildBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("withdraw");
      if (result.action.type === "withdraw") {
        expect(result.action.resourceType).to.equal(RESOURCE_ENERGY);
      }
    });

    it("should withdraw from storage when available", () => {
      const storage = {
        id: "storage1",
        structureType: STRUCTURE_STORAGE,
        store: {
          getUsedCapacity: (resource: string) => 5000,
          getFreeCapacity: () => 5000
        },
        pos: { x: 20, y: 20, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1", { storage });
      const creep = createMockCreep("builder1", {
        room,
        memory: { role: "builder", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);

      const result = buildBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("withdraw");
      if (result.action.type === "withdraw") {
        expect(result.action.target).to.equal(storage);
      }
    });

    it("should harvest from source as last resort", () => {
      const source = {
        id: "source1",
        energy: 3000,
        pos: { x: 10, y: 10, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1");
      room.find = (type: number, opts?: any) => {
        if (type === FIND_SOURCES) {
          return [source];
        }
        return [];
      };

      const creep = createMockCreep("builder1", {
        room,
        memory: { role: "builder", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);

      const result = buildBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("harvest");
      if (result.action.type === "harvest") {
        expect(result.action.target).to.equal(source);
      }
    });
  });

  describe("Building and Delivery (working=true)", () => {
    it("should prioritize spawns over building", () => {
      const constructionSite = {
        id: "site1",
        structureType: STRUCTURE_ROAD,
        pos: { x: 30, y: 30, roomName: "W1N1" },
        progress: 0,
        progressTotal: 300
      } as any;

      const spawn = {
        id: "spawn1",
        structureType: STRUCTURE_SPAWN,
        store: {
          getFreeCapacity: (resource: string) => 100,
          getUsedCapacity: () => 200
        },
        pos: { x: 20, y: 20, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("builder1", {
        room,
        memory: { role: "builder", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      ctx.spawnStructures = [spawn];
      ctx.prioritizedSites = [constructionSite];

      const result = buildBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("transfer");
      if (result.action.type === "transfer") {
        expect(result.action.target).to.equal(spawn);
        expect(result.action.resourceType).to.equal(RESOURCE_ENERGY);
      }
    });

    it("should prioritize extensions over building", () => {
      const constructionSite = {
        id: "site1",
        structureType: STRUCTURE_ROAD,
        pos: { x: 30, y: 30, roomName: "W1N1" },
        progress: 0,
        progressTotal: 300
      } as any;

      const extension = {
        id: "ext1",
        structureType: STRUCTURE_EXTENSION,
        store: {
          getFreeCapacity: (resource: string) => 50,
          getUsedCapacity: () => 0
        },
        pos: { x: 20, y: 20, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("builder1", {
        room,
        memory: { role: "builder", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      ctx.spawnStructures = [extension];
      ctx.prioritizedSites = [constructionSite];

      const result = buildBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("transfer");
      if (result.action.type === "transfer") {
        expect(result.action.target).to.equal(extension);
      }
    });

    it("should prioritize towers over building", () => {
      const constructionSite = {
        id: "site1",
        structureType: STRUCTURE_ROAD,
        pos: { x: 30, y: 30, roomName: "W1N1" },
        progress: 0,
        progressTotal: 300
      } as any;

      const tower = {
        id: "tower1",
        structureType: STRUCTURE_TOWER,
        store: {
          getFreeCapacity: (resource: string) => 500,
          getUsedCapacity: () => 500
        },
        pos: { x: 20, y: 20, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("builder1", {
        room,
        memory: { role: "builder", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      ctx.towers = [tower];
      ctx.prioritizedSites = [constructionSite];

      const result = buildBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("transfer");
      if (result.action.type === "transfer") {
        expect(result.action.target).to.equal(tower);
      }
    });

    it("should build construction sites when no critical structures need energy", () => {
      const constructionSite = {
        id: "site1",
        structureType: STRUCTURE_ROAD,
        pos: { x: 30, y: 30, roomName: "W1N1" },
        progress: 0,
        progressTotal: 300
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("builder1", {
        room,
        memory: { role: "builder", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);
      ctx.prioritizedSites = [constructionSite];

      const result = buildBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("build");
      if (result.action.type === "build") {
        expect(result.action.target).to.equal(constructionSite);
      }
    });

    it("should upgrade controller when no construction sites available", () => {
      const controller = {
        id: "controller1",
        my: true,
        pos: { x: 25, y: 25, roomName: "W1N1" },
        level: 3,
        progress: 0,
        progressTotal: 1000
      } as any;

      const room = createMockRoom("W1N1", { controller });
      const creep = createMockCreep("builder1", {
        room,
        memory: { role: "builder", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);

      const result = buildBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("upgrade");
      if (result.action.type === "upgrade") {
        expect(result.action.target).to.equal(controller);
      }
    });
  });

  describe("State Management", () => {
    it("should initialize working state to false when empty", () => {
      const room = createMockRoom("W1N1");
      room.find = () => [];

      const creep = createMockCreep("builder1", {
        room,
        memory: { role: "builder", homeRoom: "W1N1" }, // No working property
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);
      buildBehavior(ctx as CreepContext);

      expect(ctx.memory.working).to.equal(false);
    });

    it("should initialize working state to true when has energy", () => {
      const room = createMockRoom("W1N1");
      const creep = createMockCreep("builder1", {
        room,
        memory: { role: "builder", homeRoom: "W1N1" }, // No working property
        store: {
          getUsedCapacity: () => 25,
          getFreeCapacity: () => 25,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);
      buildBehavior(ctx as CreepContext);

      expect(ctx.memory.working).to.equal(true);
    });

    it("should transition from working to collecting when empty", () => {
      const room = createMockRoom("W1N1");
      room.find = () => [];

      const creep = createMockCreep("builder1", {
        room,
        memory: { role: "builder", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);
      buildBehavior(ctx as CreepContext);

      expect(ctx.memory.working).to.equal(false);
    });

    it("should transition from collecting to working when full", () => {
      const room = createMockRoom("W1N1");
      const creep = createMockCreep("builder1", {
        room,
        memory: { role: "builder", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);
      buildBehavior(ctx as CreepContext);

      expect(ctx.memory.working).to.equal(true);
    });
  });
});
