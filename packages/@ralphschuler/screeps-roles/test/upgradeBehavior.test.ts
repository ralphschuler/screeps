/**
 * Comprehensive tests for upgradeBehavior
 */

import { expect } from "chai";
import { upgradeBehavior } from "../src/behaviors/economy/index";
import { createContext } from "../src/framework/BehaviorContext";
import type { CreepContext, BehaviorResult } from "../src/framework/types";
import { createMockCreep, createMockRoom, resetMockGame } from "./setup";

describe("upgradeBehavior", () => {
  beforeEach(() => {
    resetMockGame();
  });

  describe("Basic Functionality", () => {
    it("should return idle when creep is empty and no energy sources available", () => {
      const room = createMockRoom("W1N1", {
        controller: {
          id: "controller1",
          my: true,
          pos: { x: 25, y: 25, roomName: "W1N1" },
          level: 3,
          progress: 0,
          progressTotal: 1000
        } as any
      });

      const creep = createMockCreep("upgrader1", {
        room,
        memory: { role: "upgrader", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      // Mock room.find to return empty arrays
      room.find = (type: number) => [];

      const ctx = createContext(creep);
      const result = upgradeBehavior(ctx as CreepContext);

      expect(result.success).to.equal(false);
      expect(result.action.type).to.equal("idle");
      expect(result.error).to.equal("No energy sources available");
    });

    it("should return idle when no controller is available", () => {
      const room = createMockRoom("W1N1"); // No controller
      const creep = createMockCreep("upgrader1", {
        room,
        memory: { role: "upgrader", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);
      const result = upgradeBehavior(ctx as CreepContext);

      expect(result.success).to.equal(false);
      expect(result.action.type).to.equal("idle");
      expect(result.error).to.equal("No controller available to upgrade");
    });
  });

  describe("Energy Collection (working=false)", () => {
    it("should withdraw from nearby link when available", () => {
      const controller = {
        id: "controller1",
        my: true,
        pos: {
          x: 25,
          y: 25,
          roomName: "W1N1",
          findInRange: (type: number, range: number, opts?: any) => {
            if (type === FIND_MY_STRUCTURES && range === 2) {
              return [{
                id: "link1",
                structureType: STRUCTURE_LINK,
                store: {
                  getUsedCapacity: (resource: string) => 100
                },
                pos: { x: 24, y: 24, roomName: "W1N1" }
              }];
            }
            return [];
          }
        },
        level: 3
      } as any;

      const room = createMockRoom("W1N1", { controller });
      const creep = createMockCreep("upgrader1", {
        room,
        memory: { role: "upgrader", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);
      const result = upgradeBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("withdraw");
      if (result.action.type === "withdraw") {
        expect(result.action.resourceType).to.equal(RESOURCE_ENERGY);
      }
    });

    it("should withdraw from nearby container when no link available", () => {
      const controller = {
        id: "controller1",
        my: true,
        pos: {
          x: 25,
          y: 25,
          roomName: "W1N1",
          findInRange: () => []
        },
        level: 3
      } as any;

      const container = {
        id: "container1",
        structureType: STRUCTURE_CONTAINER,
        store: {
          getUsedCapacity: (resource: string) => 100
        },
        pos: { x: 26, y: 26, roomName: "W1N1" }
      };

      const room = createMockRoom("W1N1", { controller });
      const creep = createMockCreep("upgrader1", {
        room,
        memory: { role: "upgrader", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      // Mock findInRange to return nearby container
      creep.pos.findInRange = (type: number, range: number, opts?: any) => {
        if (type === FIND_STRUCTURES && range === 3) {
          return [container];
        }
        return [];
      };
      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      const result = upgradeBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("withdraw");
    });

    it("should withdraw from storage when available and has enough energy", () => {
      const controller = {
        id: "controller1",
        my: true,
        pos: {
          x: 25,
          y: 25,
          roomName: "W1N1",
          findInRange: () => []
        },
        level: 3
      } as any;

      const storage = {
        id: "storage1",
        structureType: STRUCTURE_STORAGE,
        store: {
          getUsedCapacity: (resource: string) => 5000,
          getFreeCapacity: () => 5000
        },
        pos: { x: 20, y: 20, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1", { controller, storage });
      const creep = createMockCreep("upgrader1", {
        room,
        memory: { role: "upgrader", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      // Mock findInRange to return empty
      creep.pos.findInRange = () => [];

      const ctx = createContext(creep);
      const result = upgradeBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("withdraw");
      if (result.action.type === "withdraw") {
        expect(result.action.target).to.equal(storage);
      }
    });

    it("should harvest from source as last resort", () => {
      const controller = {
        id: "controller1",
        my: true,
        pos: {
          x: 25,
          y: 25,
          roomName: "W1N1",
          findInRange: () => []
        },
        level: 3
      } as any;

      const source = {
        id: "source1",
        energy: 3000,
        pos: { x: 10, y: 10, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1", { controller });
      room.find = (type: number, opts?: any) => {
        if (type === FIND_SOURCES) {
          return [source];
        }
        return [];
      };

      const creep = createMockCreep("upgrader1", {
        room,
        memory: { role: "upgrader", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      creep.pos.findInRange = () => [];
      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      const result = upgradeBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("harvest");
      if (result.action.type === "harvest") {
        expect(result.action.target).to.equal(source);
      }
    });
  });

  describe("Energy Delivery (working=true)", () => {
    it("should prioritize spawns over upgrading", () => {
      const controller = {
        id: "controller1",
        my: true,
        pos: { x: 25, y: 25, roomName: "W1N1" },
        level: 3
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

      const room = createMockRoom("W1N1", { controller });
      const creep = createMockCreep("upgrader1", {
        room,
        memory: { role: "upgrader", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      ctx.spawnStructures = [spawn];

      const result = upgradeBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("transfer");
      if (result.action.type === "transfer") {
        expect(result.action.target).to.equal(spawn);
        expect(result.action.resourceType).to.equal(RESOURCE_ENERGY);
      }
    });

    it("should prioritize extensions over upgrading", () => {
      const controller = {
        id: "controller1",
        my: true,
        pos: { x: 25, y: 25, roomName: "W1N1" },
        level: 3
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

      const room = createMockRoom("W1N1", { controller });
      const creep = createMockCreep("upgrader1", {
        room,
        memory: { role: "upgrader", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      ctx.spawnStructures = [extension];

      const result = upgradeBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("transfer");
      if (result.action.type === "transfer") {
        expect(result.action.target).to.equal(extension);
      }
    });

    it("should prioritize towers over upgrading", () => {
      const controller = {
        id: "controller1",
        my: true,
        pos: { x: 25, y: 25, roomName: "W1N1" },
        level: 3
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

      const room = createMockRoom("W1N1", { controller });
      const creep = createMockCreep("upgrader1", {
        room,
        memory: { role: "upgrader", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      ctx.towers = [tower];

      const result = upgradeBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("transfer");
      if (result.action.type === "transfer") {
        expect(result.action.target).to.equal(tower);
      }
    });

    it("should upgrade controller when no critical structures need energy", () => {
      const controller = {
        id: "controller1",
        my: true,
        pos: { x: 25, y: 25, roomName: "W1N1" },
        level: 3,
        progress: 0,
        progressTotal: 1000
      } as any;

      const room = createMockRoom("W1N1", { controller });
      const creep = createMockCreep("upgrader1", {
        room,
        memory: { role: "upgrader", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);

      const result = upgradeBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("upgrade");
      if (result.action.type === "upgrade") {
        expect(result.action.target).to.equal(controller);
      }
    });
  });

  describe("State Management", () => {
    it("should initialize working state to false when empty", () => {
      const controller = {
        id: "controller1",
        my: true,
        pos: { x: 25, y: 25, roomName: "W1N1", findInRange: () => [] },
        level: 3
      } as any;

      const room = createMockRoom("W1N1", { controller });
      room.find = () => [];

      const creep = createMockCreep("upgrader1", {
        room,
        memory: { role: "upgrader", homeRoom: "W1N1" }, // No working property
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      creep.pos.findInRange = () => [];

      const ctx = createContext(creep);
      upgradeBehavior(ctx as CreepContext);

      expect(ctx.memory.working).to.equal(false);
    });

    it("should initialize working state to true when has energy", () => {
      const controller = {
        id: "controller1",
        my: true,
        pos: { x: 25, y: 25, roomName: "W1N1" },
        level: 3
      } as any;

      const room = createMockRoom("W1N1", { controller });
      const creep = createMockCreep("upgrader1", {
        room,
        memory: { role: "upgrader", homeRoom: "W1N1" }, // No working property
        store: {
          getUsedCapacity: () => 25,
          getFreeCapacity: () => 25,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);
      upgradeBehavior(ctx as CreepContext);

      expect(ctx.memory.working).to.equal(true);
    });

    it("should transition from working to collecting when empty", () => {
      const controller = {
        id: "controller1",
        my: true,
        pos: { x: 25, y: 25, roomName: "W1N1", findInRange: () => [] },
        level: 3
      } as any;

      const room = createMockRoom("W1N1", { controller });
      room.find = () => [];

      const creep = createMockCreep("upgrader1", {
        room,
        memory: { role: "upgrader", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      creep.pos.findInRange = () => [];

      const ctx = createContext(creep);
      upgradeBehavior(ctx as CreepContext);

      expect(ctx.memory.working).to.equal(false);
    });

    it("should transition from collecting to working when full", () => {
      const controller = {
        id: "controller1",
        my: true,
        pos: { x: 25, y: 25, roomName: "W1N1" },
        level: 3
      } as any;

      const room = createMockRoom("W1N1", { controller });
      const creep = createMockCreep("upgrader1", {
        room,
        memory: { role: "upgrader", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);
      upgradeBehavior(ctx as CreepContext);

      expect(ctx.memory.working).to.equal(true);
    });
  });
});
