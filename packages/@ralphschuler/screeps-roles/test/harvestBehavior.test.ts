/**
 * Comprehensive tests for harvestBehavior
 */

import { expect } from "chai";
import { harvestBehavior } from "../src/behaviors/economy/index";
import { createContext } from "../src/framework/BehaviorContext";
import type { CreepContext } from "../src/framework/types";
import { createMockCreep, createMockRoom, resetMockGame } from "./setup";

describe("harvestBehavior", () => {
  beforeEach(() => {
    resetMockGame();
  });

  describe("Source Assignment", () => {
    it("should return idle when no sources available", () => {
      const room = createMockRoom("W1N1");
      room.find = (type: number) => [];

      const creep = createMockCreep("harvester1", {
        room,
        memory: { role: "harvester", homeRoom: "W1N1" },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      const ctx = createContext(creep);
      const result = harvestBehavior(ctx as CreepContext);

      expect(result.success).to.equal(false);
      expect(result.action.type).to.equal("idle");
      expect(result.error).to.equal("No source available to harvest");
    });

    it("should assign a source when not assigned", () => {
      const source1 = {
        id: "source1" as Id<Source>,
        pos: { x: 20, y: 20, roomName: "W1N1" },
        energy: 3000,
        energyCapacity: 3000
      } as any;

      const room = createMockRoom("W1N1");
      room.find = (type: number) => {
        if (type === FIND_SOURCES) return [source1];
        return [];
      };

      const creep = createMockCreep("harvester1", {
        room,
        memory: { role: "harvester", homeRoom: "W1N1" },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      // Mock isNearTo to return false (need to move)
      creep.pos.isNearTo = (target: any) => false;

      const ctx = createContext(creep);
      const result = harvestBehavior(ctx as CreepContext);

      // Should assign source and return moveTo
      expect(ctx.memory.sourceId).to.equal("source1");
      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("moveTo");
    });

    it("should balance load across multiple sources", () => {
      const source1 = {
        id: "source1" as Id<Source>,
        pos: { x: 20, y: 20, roomName: "W1N1" },
        energy: 3000
      } as any;

      const source2 = {
        id: "source2" as Id<Source>,
        pos: { x: 30, y: 30, roomName: "W1N1" },
        energy: 3000
      } as any;

      const room = createMockRoom("W1N1");
      room.find = (type: number) => {
        if (type === FIND_SOURCES) return [source1, source2];
        return [];
      };

      // Create first harvester assigned to source1
      const creep1 = createMockCreep("harvester1", {
        room,
        memory: { role: "harvester", homeRoom: "W1N1", sourceId: "source1" as Id<Source> }
      });
      (global as any).Game.creeps.harvester1 = creep1;

      // Create second harvester - should be assigned to source2
      const creep2 = createMockCreep("harvester2", {
        room,
        memory: { role: "harvester", homeRoom: "W1N1" },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      creep2.pos.isNearTo = (target: any) => false;

      const ctx = createContext(creep2);
      harvestBehavior(ctx as CreepContext);

      // Should assign to source2 (least loaded)
      expect(ctx.memory.sourceId).to.equal("source2");
    });
  });

  describe("Movement", () => {
    it("should move to source when not nearby", () => {
      const source = {
        id: "source1" as Id<Source>,
        pos: { x: 20, y: 20, roomName: "W1N1" },
        energy: 3000
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("harvester1", {
        room,
        memory: { role: "harvester", homeRoom: "W1N1", sourceId: "source1" as Id<Source> },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      // Mock getObjectById to return source
      (global as any).Game.getObjectById = (id: string) => {
        if (id === "source1") return source;
        return null;
      };

      // Mock isNearTo to return false
      creep.pos.isNearTo = (target: any) => false;

      const ctx = createContext(creep);
      const result = harvestBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("moveTo");
      if (result.action.type === "moveTo") {
        expect(result.action.target).to.equal(source);
      }
    });

    it("should not move when already near source", () => {
      const source = {
        id: "source1" as Id<Source>,
        pos: { x: 20, y: 20, roomName: "W1N1" },
        energy: 3000
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("harvester1", {
        room,
        memory: { role: "harvester", homeRoom: "W1N1", sourceId: "source1" as Id<Source> },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 50,
          getCapacity: () => 50
        }
      });

      (global as any).Game.getObjectById = (id: string) => {
        if (id === "source1") return source;
        return null;
      };

      // Mock isNearTo to return true
      creep.pos.isNearTo = (target: any) => true;

      const ctx = createContext(creep);
      const result = harvestBehavior(ctx as CreepContext);

      // Should harvest, not move
      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("harvest");
    });
  });

  describe("Harvesting", () => {
    it("should harvest when creep has free capacity", () => {
      const source = {
        id: "source1" as Id<Source>,
        pos: { x: 20, y: 20, roomName: "W1N1" },
        energy: 3000
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("harvester1", {
        room,
        memory: { role: "harvester", homeRoom: "W1N1", sourceId: "source1" as Id<Source> },
        store: {
          getUsedCapacity: () => 25,
          getFreeCapacity: () => 25,
          getCapacity: () => 50
        }
      });

      (global as any).Game.getObjectById = (id: string) => {
        if (id === "source1") return source;
        return null;
      };

      creep.pos.isNearTo = (target: any) => true;

      const ctx = createContext(creep);
      const result = harvestBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("harvest");
      if (result.action.type === "harvest") {
        expect(result.action.target).to.equal(source);
      }
    });

    it("should harvest when creep has no carry capacity (drop miner)", () => {
      const source = {
        id: "source1" as Id<Source>,
        pos: { x: 20, y: 20, roomName: "W1N1" },
        energy: 3000
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("harvester1", {
        room,
        memory: { role: "harvester", homeRoom: "W1N1", sourceId: "source1" as Id<Source> },
        store: {
          getUsedCapacity: () => 0,
          getFreeCapacity: () => 0,
          getCapacity: () => 0 // No CARRY parts
        },
        body: [
          { type: WORK, hits: 100 },
          { type: MOVE, hits: 100 }
        ]
      });

      (global as any).Game.getObjectById = (id: string) => {
        if (id === "source1") return source;
        return null;
      };

      creep.pos.isNearTo = (target: any) => true;

      const ctx = createContext(creep);
      const result = harvestBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("harvest");
    });
  });

  describe("Transferring", () => {
    it("should transfer to container when full and container nearby", () => {
      const source = {
        id: "source1" as Id<Source>,
        pos: { x: 20, y: 20, roomName: "W1N1" },
        energy: 3000
      } as any;

      const container = {
        id: "container1" as Id<StructureContainer>,
        structureType: STRUCTURE_CONTAINER,
        store: {
          getFreeCapacity: (resource: string) => 1000
        },
        pos: { x: 20, y: 21, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("harvester1", {
        room,
        memory: { role: "harvester", homeRoom: "W1N1", sourceId: "source1" as Id<Source> },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      (global as any).Game.getObjectById = (id: string) => {
        if (id === "source1") return source;
        return null;
      };

      creep.pos.isNearTo = (target: any) => true;
      (creep.pos.findInRange as any) = (type: number, range: number, filter?: any) => {
        if (type === FIND_STRUCTURES && range === 1) {
          return [container];
        }
        return [];
      };

      const ctx = createContext(creep);
      const result = harvestBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("transfer");
      if (result.action.type === "transfer") {
        expect(result.action.target).to.equal(container);
        expect(result.action.resourceType).to.equal(RESOURCE_ENERGY);
      }
    });

    it("should transfer to link when full and link nearby", () => {
      const source = {
        id: "source1" as Id<Source>,
        pos: { x: 20, y: 20, roomName: "W1N1" },
        energy: 3000
      } as any;

      const link = {
        id: "link1" as Id<StructureLink>,
        structureType: STRUCTURE_LINK,
        store: {
          getFreeCapacity: (resource: string) => 400
        },
        pos: { x: 20, y: 21, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("harvester1", {
        room,
        memory: { role: "harvester", homeRoom: "W1N1", sourceId: "source1" as Id<Source> },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      (global as any).Game.getObjectById = (id: string) => {
        if (id === "source1") return source;
        return null;
      };

      creep.pos.isNearTo = (target: any) => true;
      (creep.pos.findInRange as any) = (type: number, range: number, filter?: any) => {
        if (type === FIND_STRUCTURES && range === 1) {
          return []; // No containers
        }
        if (type === FIND_MY_STRUCTURES && range === 1) {
          return [link];
        }
        return [];
      };

      const ctx = createContext(creep);
      const result = harvestBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("transfer");
      if (result.action.type === "transfer") {
        expect(result.action.target).to.equal(link);
        expect(result.action.resourceType).to.equal(RESOURCE_ENERGY);
      }
    });

    it("should prioritize container over link when both available", () => {
      const source = {
        id: "source1" as Id<Source>,
        pos: { x: 20, y: 20, roomName: "W1N1" },
        energy: 3000
      } as any;

      const container = {
        id: "container1" as Id<StructureContainer>,
        structureType: STRUCTURE_CONTAINER,
        store: {
          getFreeCapacity: (resource: string) => 1000
        },
        pos: { x: 20, y: 21, roomName: "W1N1" }
      } as any;

      const link = {
        id: "link1" as Id<StructureLink>,
        structureType: STRUCTURE_LINK,
        store: {
          getFreeCapacity: (resource: string) => 400
        },
        pos: { x: 21, y: 20, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("harvester1", {
        room,
        memory: { role: "harvester", homeRoom: "W1N1", sourceId: "source1" as Id<Source> },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      (global as any).Game.getObjectById = (id: string) => {
        if (id === "source1") return source;
        return null;
      };

      creep.pos.isNearTo = (target: any) => true;
      (creep.pos.findInRange as any) = (type: number, range: number, filter?: any) => {
        if (type === FIND_STRUCTURES && range === 1) {
          return [container];
        }
        if (type === FIND_MY_STRUCTURES && range === 1) {
          return [link];
        }
        return [];
      };

      const ctx = createContext(creep);
      const result = harvestBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("transfer");
      if (result.action.type === "transfer") {
        expect(result.action.target).to.equal(container);
      }
    });

    it("should not transfer to full container", () => {
      const source = {
        id: "source1" as Id<Source>,
        pos: { x: 20, y: 20, roomName: "W1N1" },
        energy: 3000
      } as any;

      const container = {
        id: "container1" as Id<StructureContainer>,
        structureType: STRUCTURE_CONTAINER,
        store: {
          getFreeCapacity: (resource: string) => 0 // Full
        },
        pos: { x: 20, y: 21, roomName: "W1N1" }
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("harvester1", {
        room,
        memory: { role: "harvester", homeRoom: "W1N1", sourceId: "source1" as Id<Source> },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      (global as any).Game.getObjectById = (id: string) => {
        if (id === "source1") return source;
        return null;
      };

      creep.pos.isNearTo = (target: any) => true;
      (creep.pos.findInRange as any) = (type: number, range: number, filter?: any) => {
        if (type === FIND_STRUCTURES && range === 1) {
          return [container];
        }
        if (type === FIND_MY_STRUCTURES && range === 1) {
          return [];
        }
        return [];
      };

      const ctx = createContext(creep);
      const result = harvestBehavior(ctx as CreepContext);

      // Should drop instead of transferring to full container
      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("drop");
    });
  });

  describe("Dropping", () => {
    it("should drop energy when full and no transfer targets available", () => {
      const source = {
        id: "source1" as Id<Source>,
        pos: { x: 20, y: 20, roomName: "W1N1" },
        energy: 3000
      } as any;

      const room = createMockRoom("W1N1");
      const creep = createMockCreep("harvester1", {
        room,
        memory: { role: "harvester", homeRoom: "W1N1", sourceId: "source1" as Id<Source> },
        store: {
          getUsedCapacity: () => 50,
          getFreeCapacity: () => 0,
          getCapacity: () => 50
        }
      });

      (global as any).Game.getObjectById = (id: string) => {
        if (id === "source1") return source;
        return null;
      };

      creep.pos.isNearTo = (target: any) => true;
      (creep.pos.findInRange as any) = (type: number, range: number, filter?: any) => [];

      const ctx = createContext(creep);
      const result = harvestBehavior(ctx as CreepContext);

      expect(result.success).to.equal(true);
      expect(result.action.type).to.equal("drop");
      if (result.action.type === "drop") {
        expect(result.action.resourceType).to.equal(RESOURCE_ENERGY);
      }
    });
  });
});
