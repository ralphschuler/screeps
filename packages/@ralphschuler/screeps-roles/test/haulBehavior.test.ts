/**
 * Comprehensive tests for haulBehavior
 */

import { expect } from "chai";
import { haulBehavior } from "../src/behaviors/economy/index";
import { createContext } from "../src/framework/BehaviorContext";
import type { CreepContext, BehaviorResult } from "../src/framework/types";
import { createMockCreep, createMockRoom, resetMockGame } from "./setup";

describe("haulBehavior", () => {
  beforeEach(() => {
    resetMockGame();
  });

  describe("Basic Functionality", () => {
    it("should return idle when creep is empty and no energy sources available", () => {
      const room = createMockRoom("W1N1");
      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      // Mock room.find to return empty arrays
      room.find = (type: number) => [];

      const ctx = createContext(creep);
      const result = haulBehavior(ctx as CreepContext);

      expect(result.success).to.equal(false);
      expect(result.action.type).to.equal("idle");
      expect(result.error).to.equal("No energy sources available");
    });

    it("should return idle when no delivery targets available", () => {
      const room = createMockRoom("W1N1");
      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);

      const result = haulBehavior(ctx as CreepContext);

      expect(result.success).to.equal(false);
      expect(result.action.type).to.equal("idle");
      expect(result.error).to.equal("No delivery targets available");
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

      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      ctx.droppedResources = [resource];

      const result = haulBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("pickup");
      if (result.action.type === "pickup") {
        expect(result.action.target).to.equal(resource);
      }
    });

    it("should withdraw energy from tombstones when available", () => {
      const tombstone = {
        id: "tomb1",
        store: {
          getUsedCapacity: (resource?: ResourceConstant) => {
            if (resource === RESOURCE_ENERGY) return 100;
            if (resource === undefined) return 100;
            return 0;
          }
        },
        pos: { x: 26, y: 26, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      ctx.tombstones = [tombstone];

      const result = haulBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("withdraw");
      if (result.action.type === "withdraw") {
        expect(result.action.resourceType).to.equal(RESOURCE_ENERGY);
        expect(result.action.target).to.equal(tombstone);
      }
    });

    it("should withdraw minerals from tombstones when no energy available", () => {
      const tombstone = {
        id: "tomb1",
        store: {
          [RESOURCE_HYDROGEN]: 50,
          getUsedCapacity: (resource?: ResourceConstant) => {
            if (resource === RESOURCE_ENERGY) return 0;
            if (resource === RESOURCE_HYDROGEN) return 50;
            if (resource === undefined) return 50;
            return 0;
          }
        },
        pos: { x: 26, y: 26, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      ctx.tombstones = [tombstone];

      const result = haulBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("withdraw");
      if (result.action.type === "withdraw") {
        expect(result.action.resourceType).to.equal(RESOURCE_HYDROGEN);
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
      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      ctx.containers = [container];

      const result = haulBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("withdraw");
      if (result.action.type === "withdraw") {
        expect(result.action.resourceType).to.equal(RESOURCE_ENERGY);
      }
    });

    it("should withdraw minerals from mineral containers", () => {
      const mineralContainer = {
        id: "mineralCont1",
        structureType: STRUCTURE_CONTAINER,
        store: {
          [RESOURCE_HYDROGEN]: 100,
          getUsedCapacity: (resource?: ResourceConstant) => {
            if (resource === RESOURCE_HYDROGEN) return 100;
            if (resource === RESOURCE_ENERGY) return 0;
            return 0;
          }
        },
        pos: { x: 27, y: 27, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      ctx.mineralContainers = [mineralContainer];

      const result = haulBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("withdraw");
      if (result.action.type === "withdraw") {
        expect(result.action.resourceType).to.equal(RESOURCE_HYDROGEN);
      }
    });

    it("should withdraw from storage as last resort", () => {
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
      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);

      const result = haulBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("withdraw");
      if (result.action.type === "withdraw") {
        expect(result.action.target).to.equal(storage);
      }
    });
  });

  describe("Energy Delivery (working=true)", () => {
    it("should prioritize spawns over other structures", () => {
      const spawn = {
        id: "spawn1",
        structureType: STRUCTURE_SPAWN,
        store: {
          getFreeCapacity: (resource: string) => 100,
          getUsedCapacity: () => 200
        },
        pos: { x: 20, y: 20, roomName: "W1N1" }
      } as any;

      const extension = {
        id: "ext1",
        structureType: STRUCTURE_EXTENSION,
        store: {
          getFreeCapacity: (resource: string) => 50,
          getUsedCapacity: () => 0
        },
        pos: { x: 21, y: 21, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: (resource?: ResourceConstant) => {
            if (resource === RESOURCE_ENERGY) return 50;
            return 50;
          },
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      ctx.spawnStructures = [spawn, extension];

      const result = haulBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("transfer");
      if (result.action.type === "transfer") {
        expect(result.action.target).to.equal(spawn);
        expect(result.action.resourceType).to.equal(RESOURCE_ENERGY);
      }
    });

    it("should prioritize extensions over towers", () => {
      const extension = {
        id: "ext1",
        structureType: STRUCTURE_EXTENSION,
        store: {
          getFreeCapacity: (resource: string) => 50,
          getUsedCapacity: () => 0
        },
        pos: { x: 20, y: 20, roomName: "W1N1" }
      } as any;

      const tower = {
        id: "tower1",
        structureType: STRUCTURE_TOWER,
        store: {
          getFreeCapacity: (resource: string) => 500,
          getUsedCapacity: () => 500
        },
        pos: { x: 21, y: 21, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: (resource?: ResourceConstant) => {
            if (resource === RESOURCE_ENERGY) return 50;
            return 50;
          },
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      ctx.spawnStructures = [extension];
      ctx.towers = [tower];

      const result = haulBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("transfer");
      if (result.action.type === "transfer") {
        expect(result.action.target).to.equal(extension);
      }
    });

    it("should prioritize towers over storage", () => {
      const tower = {
        id: "tower1",
        structureType: STRUCTURE_TOWER,
        store: {
          getFreeCapacity: (resource: string) => 500,
          getUsedCapacity: () => 500
        },
        pos: { x: 20, y: 20, roomName: "W1N1" }
      } as any;

      const storage = {
        id: "storage1",
        structureType: STRUCTURE_STORAGE,
        store: {
          getFreeCapacity: (resource?: ResourceConstant) => 5000,
          getUsedCapacity: () => 5000
        },
        pos: { x: 21, y: 21, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1", { storage });
      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: (resource?: ResourceConstant) => {
            if (resource === RESOURCE_ENERGY) return 50;
            return 50;
          },
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      ctx.towers = [tower];

      const result = haulBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("transfer");
      if (result.action.type === "transfer") {
        expect(result.action.target).to.equal(tower);
      }
    });

    it("should deliver to storage when no critical structures need energy", () => {
      const storage = {
        id: "storage1",
        structureType: STRUCTURE_STORAGE,
        store: {
          getFreeCapacity: (resource?: ResourceConstant) => 5000,
          getUsedCapacity: () => 5000
        },
        pos: { x: 20, y: 20, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1", { storage });
      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: (resource?: ResourceConstant) => {
            if (resource === RESOURCE_ENERGY) return 50;
            return 50;
          },
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);

      const result = haulBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("transfer");
      if (result.action.type === "transfer") {
        expect(result.action.target).to.equal(storage);
      }
    });

    it("should deliver to containers as last resort", () => {
      const container = {
        id: "container1",
        structureType: STRUCTURE_CONTAINER,
        store: {
          getFreeCapacity: (resource?: ResourceConstant) => 100
        },
        pos: { x: 20, y: 20, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: (resource?: ResourceConstant) => {
            if (resource === RESOURCE_ENERGY) return 50;
            return 50;
          },
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      ctx.depositContainers = [container];

      const result = haulBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("transfer");
      if (result.action.type === "transfer") {
        expect(result.action.target).to.equal(container);
      }
    });

    it("should deliver minerals to terminal when available", () => {
      const terminal = {
        id: "terminal1",
        structureType: STRUCTURE_TERMINAL,
        store: {
          getFreeCapacity: () => 5000
        },
        pos: { x: 20, y: 20, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1", { terminal });
      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1", working: true },
        store: {
          [RESOURCE_HYDROGEN]: 50,
          getUsedCapacity: (resource?: ResourceConstant) => {
            if (resource === RESOURCE_ENERGY) return 0;
            if (resource === RESOURCE_HYDROGEN) return 50;
            return 50;
          },
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      }) as any;

      const ctx = createContext(creep);

      const result = haulBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("transfer");
      if (result.action.type === "transfer") {
        expect(result.action.target).to.equal(terminal);
        expect(result.action.resourceType).to.equal(RESOURCE_HYDROGEN);
      }
    });

    it("should deliver minerals to storage when no terminal", () => {
      const storage = {
        id: "storage1",
        structureType: STRUCTURE_STORAGE,
        store: {
          getFreeCapacity: () => 5000
        },
        pos: { x: 20, y: 20, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1", { storage });
      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1", working: true },
        store: {
          [RESOURCE_HYDROGEN]: 50,
          getUsedCapacity: (resource?: ResourceConstant) => {
            if (resource === RESOURCE_ENERGY) return 0;
            if (resource === RESOURCE_HYDROGEN) return 50;
            return 50;
          },
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      }) as any;

      const ctx = createContext(creep);

      const result = haulBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("transfer");
      if (result.action.type === "transfer") {
        expect(result.action.target).to.equal(storage);
        expect(result.action.resourceType).to.equal(RESOURCE_HYDROGEN);
      }
    });
  });

  describe("State Management", () => {
    it("should initialize working state to false when empty", () => {
      const room = createMockRoom("W1N1");
      room.find = () => [];

      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1" }, // No working property
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);
      haulBehavior(ctx as CreepContext);

      expect(ctx.memory.working).to.equal(false);
    });

    it("should initialize working state to true when has energy", () => {
      const room = createMockRoom("W1N1");
      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1" }, // No working property
        store: {
          getUsedCapacity: () => 25,
          getFreeCapacity: () => 25,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);
      haulBehavior(ctx as CreepContext);

      expect(ctx.memory.working).to.equal(true);
    });

    it("should transition from working to collecting when empty", () => {
      const room = createMockRoom("W1N1");
      room.find = () => [];

      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);
      haulBehavior(ctx as CreepContext);

      expect(ctx.memory.working).to.equal(false);
    });

    it("should transition from collecting to working when full", () => {
      const room = createMockRoom("W1N1");
      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1", working: false },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);
      haulBehavior(ctx as CreepContext);

      expect(ctx.memory.working).to.equal(true);
    });

    it("should switch to collection mode when has energy but no targets", () => {
      const room = createMockRoom("W1N1");
      const resource = {
        id: "resource1",
        resourceType: RESOURCE_ENERGY,
        amount: 100,
        pos: { x: 25, y: 25, roomName: "W1N1" }
      } as any;

      const creep = createMockCreep("hauler1", {
        room,
        memory: { role: "hauler", homeRoom: "W1N1", working: true },
        store: {
          getUsedCapacity: (resource?: ResourceConstant) => {
            if (resource === RESOURCE_ENERGY) return 25;
            return 25;
          },
          getFreeCapacity: () => 25,
          getCapacity: () => 50
        }
      });

      creep.pos.findClosestByPath = (targets: any[]) => targets[0] || null;

      const ctx = createContext(creep);
      ctx.droppedResources = [resource];

      const result = haulBehavior(ctx as CreepContext);

      // Should switch to collection mode and pick up the dropped resource
      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("pickup");
      expect(ctx.memory.working).to.equal(false);
    });
  });
});
