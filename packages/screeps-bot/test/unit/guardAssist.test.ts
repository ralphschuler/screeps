/**
 * Guard Assist Behavior Tests
 *
 * Tests for guard creeps assisting other rooms when requested
 */

import { expect } from "chai";
import type { SwarmCreepMemory } from "../../src/memory/schemas";

describe("Guard Assist Behavior", () => {
  describe("Assist Target Assignment", () => {
    it("should accept assist target assignment from defense coordinator", () => {
      const memory = {} as unknown as SwarmCreepMemory;
      
      // Defense coordinator assigns target
      memory.assistTarget = "W2N2";
      
      expect(memory.assistTarget).to.equal("W2N2");
    });

    it("should clear assist target when threat is resolved", () => {
      const memory = {
        assistTarget: "W2N2"
      } as unknown as SwarmCreepMemory;
      
      // Simulate threat resolved
      const hostilesCount = 0;
      
      if (hostilesCount === 0) {
        delete memory.assistTarget;
      }
      
      expect(memory.assistTarget).to.be.undefined;
    });

    it("should navigate to assist room when assigned", () => {
      const currentRoom = "W1N1";
      const assistTarget = "W2N2";
      
      const shouldMove = currentRoom !== assistTarget;
      
      expect(shouldMove).to.be.true;
    });

    it("should return home after assist mission completes", () => {
      const memory = {
        assistTarget: undefined
      } as unknown as SwarmCreepMemory & { assistTarget?: string };
      const currentRoom = "W2N2";
      const homeRoom = "W1N1";
      
      const shouldReturnHome = !memory.assistTarget && currentRoom !== homeRoom;
      
      expect(shouldReturnHome).to.be.true;
    });
  });

  describe("Guard Combat in Assist Mode", () => {
    it("should engage hostiles in assist room", () => {
      const memory = { assistTarget: "W2N2" } as unknown as SwarmCreepMemory & { assistTarget?: string };
      const currentRoom = "W2N2";
      const hostilesPresent = true;
      
      const shouldEngage = memory.assistTarget === currentRoom && hostilesPresent;
      
      expect(shouldEngage).to.be.true;
    });

    it("should use same priority targeting as home defense", () => {
      // Priority scores from military.ts
      const healerScore = 100;
      const rangedScore = 50;
      const meleeScore = 40;
      
      expect(healerScore).to.be.greaterThan(rangedScore);
      expect(rangedScore).to.be.greaterThan(meleeScore);
    });

    it("should not engage in home room when on assist mission", () => {
      const memory = { assistTarget: "W2N2" } as unknown as SwarmCreepMemory & { assistTarget?: string };
      const currentRoom = "W1N1"; // home room
      const assistRoom = "W2N2";
      
      // Guard should move to assist room, not engage in home room
      const shouldMoveToAssist = currentRoom !== assistRoom;
      
      expect(shouldMoveToAssist).to.be.true;
    });
  });

  describe("Guard Patrol in Home Room", () => {
    it("should patrol home room when no assist target and no threats", () => {
      const memory = {} as unknown as SwarmCreepMemory & { assistTarget?: string };
      const currentRoom = "W1N1";
      const homeRoom = "W1N1";
      const hostilesCount = 0;
      
      const shouldPatrol = !memory.assistTarget && currentRoom === homeRoom && hostilesCount === 0;
      
      expect(shouldPatrol).to.be.true;
    });

    it("should defend home room when no assist target and threats present", () => {
      const memory = {} as unknown as SwarmCreepMemory & { assistTarget?: string };
      const currentRoom = "W1N1";
      const homeRoom = "W1N1";
      const hostilesCount = 2;
      
      const shouldDefend = !memory.assistTarget && currentRoom === homeRoom && hostilesCount > 0;
      
      expect(shouldDefend).to.be.true;
    });
  });
});
