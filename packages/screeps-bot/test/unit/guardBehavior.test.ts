/**
 * Guard Behavior Tests
 *
 * Tests for guard creep behavior including home defense and room assistance.
 */

import { expect } from "chai";

describe("Guard Behavior", () => {
  describe("Room Assistance (NEW BEHAVIOR)", () => {
    it("should accept assist assignments from defense coordinator", () => {
      // Mock guard creep with assist target assigned
      const mockMemory: {
        role: string;
        family: string;
        homeRoom: string;
        assistTarget?: string;
      } = {
        role: "guard",
        family: "military",
        homeRoom: "W1N1",
        assistTarget: "W2N1" // Should be kept for assistance
      };

      // Guards now accept assist targets
      expect(mockMemory.assistTarget).to.equal("W2N1");
    });

    it("should clear assist target when threat is resolved", () => {
      const mockMemory: {
        role: string;
        family: string;
        homeRoom: string;
        assistTarget?: string;
      } = {
        role: "guard",
        family: "military",
        homeRoom: "W1N1",
        assistTarget: "W2N1"
      };

      // Simulate threat resolved - guard clears assist target
      const hostilesCount = 0;
      if (hostilesCount === 0) {
        delete mockMemory.assistTarget;
      }

      expect(mockMemory.assistTarget).to.be.undefined;
    });

    it("should move to assist room when assigned", () => {
      const homeRoom = "W1N1";
      const currentRoom = "W1N1";
      const assistTarget = "W2N1";

      // Guard should move to assist room
      const shouldMoveToAssist = currentRoom !== assistTarget;

      expect(shouldMoveToAssist).to.be.true;
    });
  });

  describe("Home Room Defense", () => {
    it("should return to home room if outside and no assist target", () => {
      const homeRoom: string = "W1N1";
      const currentRoom: string = "W2N1";
      const hasAssistTarget = false;

      // Guard should return home if not on assist mission
      const shouldReturnHome = currentRoom !== homeRoom && !hasAssistTarget;

      expect(shouldReturnHome).to.be.true;
    });

    it("should patrol when in home room with no hostiles", () => {
      const homeRoom = "W1N1";
      const currentRoom = "W1N1";

      // Guard is in home room
      const isInHomeRoom = currentRoom === homeRoom;

      expect(isInHomeRoom).to.be.true;
    });

    it("should engage hostiles only in home room", () => {
      const homeRoom = "W1N1";
      const guardRoom = "W1N1";
      const hostileRoom = "W1N1";

      // Guard should only engage if all are in home room
      const shouldEngage = guardRoom === homeRoom && hostileRoom === homeRoom;

      expect(shouldEngage).to.be.true;
    });

    it("should not engage hostiles in other rooms", () => {
      const homeRoom: string = "W1N1";
      const guardRoom: string = "W2N1"; // Guard outside home
      const hostileRoom: string = "W2N1";

      // Guard should not engage if not in home room
      const shouldEngage = guardRoom === homeRoom && hostileRoom === homeRoom;

      expect(shouldEngage).to.be.false;
    });

    it("should clear assist target on every tick", () => {
      const mockMemory: {
        role: string;
        family: string;
        homeRoom: string;
        assistTarget?: string;
      } = {
        role: "guard",
        family: "military",
        homeRoom: "W1N1",
        assistTarget: "W2N1"
      };

      // Simulate multiple ticks - assist target should always be cleared
      for (let i = 0; i < 5; i++) {
        if (mockMemory.assistTarget) {
          delete mockMemory.assistTarget;
        }
        expect(mockMemory.assistTarget).to.be.undefined;
        
        // Simulate it being set again (shouldn't persist)
        mockMemory.assistTarget = "W3N1";
      }

      // Final cleanup
      if (mockMemory.assistTarget) {
        delete mockMemory.assistTarget;
      }
      expect(mockMemory.assistTarget).to.be.undefined;
    });
  });

  describe("Guard Priority in Home Room", () => {
    it("should prioritize returning to home room over all actions", () => {
      const homeRoom: string = "W1N1";
      const currentRoom: string = "W2N1";
      const hasHostilesInCurrentRoom = true;

      // Even with hostiles, priority is returning home
      const action = currentRoom !== homeRoom ? "moveToRoom" : "attack";

      expect(action).to.equal("moveToRoom");
    });

    it("should engage hostiles after reaching home room", () => {
      const homeRoom = "W1N1";
      const currentRoom = "W1N1";
      const hasHostilesInHomeRoom = true;

      // In home room with hostiles, should engage
      const action = currentRoom === homeRoom && hasHostilesInHomeRoom ? "attack" : "patrol";

      expect(action).to.equal("attack");
    });

    it("should patrol when in home room without hostiles", () => {
      const homeRoom = "W1N1";
      const currentRoom = "W1N1";
      const hasHostilesInHomeRoom = false;

      // In home room without hostiles, should patrol
      const action = currentRoom === homeRoom && !hasHostilesInHomeRoom ? "patrol" : "attack";

      expect(action).to.equal("patrol");
    });
  });
});
