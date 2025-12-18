import { expect } from "chai";
import { expansionCommands } from "../../src/empire/expansionCommands";

// Mock the global Game object
declare const global: { Game: typeof Game; Memory: typeof Memory };

describe("expansion console commands", () => {
  beforeEach(() => {
    // Setup minimal Game mock
    // @ts-ignore test setup
    global.Game = {
      time: 1000,
      gcl: {
        level: 2,
        progress: 700000,
        progressTotal: 1000000
      },
      rooms: {},
      creeps: {},
      spawns: {}
    };

    // Setup minimal Memory mock
    // @ts-ignore test setup
    global.Memory = {
      overmind: {
        roomsSeen: {},
        roomIntel: {},
        claimQueue: [
          {
            roomName: "W1N1",
            score: 85,
            distance: 3,
            claimed: false,
            lastEvaluated: 900
          },
          {
            roomName: "W2N2",
            score: 75,
            distance: 5,
            claimed: true,
            lastEvaluated: 950
          }
        ],
        warTargets: [],
        nukeCandidates: [],
        powerBanks: [],
        objectives: {
          targetPowerLevel: 0,
          targetRoomCount: 1,
          warMode: false,
          expansionPaused: false
        },
        lastRun: 0
      }
    };
  });

  describe("expansion.status()", () => {
    it("should return formatted status string", () => {
      const result = expansionCommands.status();
      
      expect(result).to.be.a("string");
      expect(result).to.include("Expansion System Status");
      expect(result).to.include("GCL: Level 2");
      expect(result).to.include("70.0% to next"); // 700000/1000000 = 70%
      expect(result).to.include("Claim Queue");
    });

    it("should show expansion readiness when slots available", () => {
      // 0 owned rooms, GCL 2 = 2 slots available
      const result = expansionCommands.status();
      
      expect(result).to.include("Available Room Slots: 2");
      expect(result).to.include("READY");
    });

    it("should show at GCL limit when no slots available", () => {
      // Add 2 owned rooms to match GCL 2
      // @ts-ignore test setup
      global.Game.rooms = {
        W1N1: { controller: { my: true, level: 4 } },
        W2N2: { controller: { my: true, level: 5 } }
      };
      
      const result = expansionCommands.status();
      
      expect(result).to.include("Available Room Slots: 0");
      expect(result).to.include("AT GCL LIMIT");
    });

    it("should list top expansion candidates", () => {
      const result = expansionCommands.status();
      
      expect(result).to.include("Top Expansion Candidates");
      expect(result).to.include("W1N1"); // First unclaimed candidate
      expect(result).to.include("Score 85");
      expect(result).to.include("Distance 3");
    });

    it("should show active expansion attempts", () => {
      const result = expansionCommands.status();
      
      expect(result).to.include("Active Expansion Attempts");
      expect(result).to.include("W2N2"); // Claimed candidate
    });
  });

  describe("expansion.pause()", () => {
    it("should return confirmation message", () => {
      const result = expansionCommands.pause();
      
      expect(result).to.include("paused");
      expect(result).to.include("expansion.resume()");
    });
  });

  describe("expansion.resume()", () => {
    it("should return confirmation message", () => {
      const result = expansionCommands.resume();
      
      expect(result).to.include("resumed");
    });
  });

  describe("expansion.clearQueue()", () => {
    it("should return count of cleared candidates", () => {
      const result = expansionCommands.clearQueue();
      
      // Should report clearing candidates
      expect(result).to.include("Cleared");
      expect(result).to.include("candidates");
    });

    it("should handle empty queue", () => {
      // Clear queue first
      expansionCommands.clearQueue();
      
      // Clear again - should handle gracefully
      const result = expansionCommands.clearQueue();
      
      expect(result).to.include("Cleared");
    });
  });
});
