/**
 * Defense Assistance System Tests
 *
 * Tests for neighbor room defense coordination.
 */

import { assert } from "chai";
import {
  needsDefenseAssistance,
  createDefenseRequest,
  analyzeDefenderNeeds
} from "../../src/spawning/defenderManager";
import type { SwarmState } from "../../src/memory/schemas";
import { createDefaultSwarmState } from "../../src/memory/schemas";

describe("Defense Assistance System", () => {
  let mockRoom: Partial<Room>;
  let mockSwarm: SwarmState;

  beforeEach(() => {
    // Create a basic mock room
    mockRoom = {
      name: "W1N1",
      energyAvailable: 300,
      find: (type: FindConstant) => {
        if (type === FIND_HOSTILE_CREEPS) {
          // Simulate 2 hostile creeps with attack parts
          return [
            {
              body: [
                { type: ATTACK, hits: 100 },
                { type: ATTACK, hits: 100 },
                { type: MOVE, hits: 50 }
              ],
              getActiveBodyparts: (type: BodyPartConstant) => {
                if (type === ATTACK) return 2;
                if (type === MOVE) return 1;
                return 0;
              }
            },
            {
              body: [
                { type: RANGED_ATTACK, hits: 100 },
                { type: MOVE, hits: 50 }
              ],
              getActiveBodyparts: (type: BodyPartConstant) => {
                if (type === RANGED_ATTACK) return 1;
                if (type === MOVE) return 1;
                return 0;
              }
            }
          ] as Creep[];
        } else if (type === FIND_MY_SPAWNS) {
          // Room has a spawn but it's spawning
          return [
            {
              spawning: { name: "test", remainingTime: 10 }
            }
          ] as StructureSpawn[];
        } else if (type === FIND_MY_CREEPS) {
          // No existing defenders
          return [] as Creep[];
        }
        return [];
      }
    } as Partial<Room>;

    // Create mock swarm state with high danger
    mockSwarm = createDefaultSwarmState();
    mockSwarm.danger = 2; // Significant threat
  });

  describe("needsDefenseAssistance", () => {
    it("should return true when room has threats but no spawns available", () => {
      const result = needsDefenseAssistance(mockRoom as Room, mockSwarm);
      assert.isTrue(result, "Room should need assistance when spawn is busy");
    });

    it("should return false when danger level is low", () => {
      mockSwarm.danger = 0;
      const result = needsDefenseAssistance(mockRoom as Room, mockSwarm);
      assert.isFalse(result, "Room should not need assistance when danger is low");
    });

    it("should return false when danger is 1 (not significant)", () => {
      mockSwarm.danger = 1;
      const result = needsDefenseAssistance(mockRoom as Room, mockSwarm);
      assert.isFalse(result, "Room should not need assistance for minor threats");
    });

    it("should return true when room has no spawns", () => {
      mockSwarm.danger = 2;
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_HOSTILE_CREEPS) {
          return [{ body: [{ type: ATTACK, hits: 100 }] }] as Creep[];
        } else if (type === FIND_MY_SPAWNS) {
          return []; // No spawns
        } else if (type === FIND_MY_CREEPS) {
          return [];
        }
        return [];
      };

      const result = needsDefenseAssistance(mockRoom as Room, mockSwarm);
      assert.isTrue(result, "Room should need assistance when it has no spawns");
    });

    it("should return false when room has enough defenders", () => {
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_HOSTILE_CREEPS) {
          return [{ body: [{ type: ATTACK, hits: 100 }] }] as Creep[];
        } else if (type === FIND_MY_SPAWNS) {
          return [{ spawning: null }] as StructureSpawn[];
        } else if (type === FIND_MY_CREEPS) {
          // Has sufficient defenders
          return [
            { memory: { role: "guard" } },
            { memory: { role: "ranger" } }
          ] as unknown as Creep[];
        }
        return [];
      };

      const result = needsDefenseAssistance(mockRoom as Room, mockSwarm);
      assert.isFalse(result, "Room should not need assistance when it has defenders");
    });

    it("should return true for critical threats with defender deficit", () => {
      mockSwarm.danger = 3; // Critical
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_HOSTILE_CREEPS) {
          // Multiple powerful hostiles
          return [
            { body: [{ type: ATTACK, hits: 100 }, { type: ATTACK, hits: 100 }] },
            { body: [{ type: RANGED_ATTACK, hits: 100 }] },
            { body: [{ type: HEAL, hits: 100 }] }
          ] as Creep[];
        } else if (type === FIND_MY_SPAWNS) {
          return [{ spawning: null }] as StructureSpawn[];
        } else if (type === FIND_MY_CREEPS) {
          // Only 1 defender
          return [{ memory: { role: "guard" } }] as unknown as Creep[];
        }
        return [];
      };

      const result = needsDefenseAssistance(mockRoom as Room, mockSwarm);
      assert.isTrue(result, "Room should need assistance for critical threats with defender deficit");
    });
  });

  describe("createDefenseRequest", () => {
    it("should create a defense request when assistance is needed", () => {
      const request = createDefenseRequest(mockRoom as Room, mockSwarm);
      
      assert.isNotNull(request, "Should create a defense request");
      if (request) {
        assert.equal(request.roomName, "W1N1");
        assert.isAtLeast(request.guardsNeeded, 1, "Should need at least 1 guard");
        assert.isAtLeast(request.rangersNeeded, 1, "Should need at least 1 ranger");
        assert.isAtLeast(request.urgency, 1, "Should have urgency >= 1");
        assert.isNumber(request.createdAt);
        assert.isString(request.threat);
        assert.isNotEmpty(request.threat, "Should have threat description");
      }
    });

    it("should return null when assistance is not needed", () => {
      mockSwarm.danger = 0;
      const request = createDefenseRequest(mockRoom as Room, mockSwarm);
      assert.isNull(request, "Should not create request when assistance not needed");
    });

    it("should calculate correct defender counts based on threat composition", () => {
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_HOSTILE_CREEPS) {
          // 3 melee attackers, need guards
          return [
            {
              body: [
                { type: ATTACK, hits: 100 },
                { type: ATTACK, hits: 100 },
                { type: ATTACK, hits: 100 }
              ],
              getActiveBodyparts: (type: BodyPartConstant) => type === ATTACK ? 3 : 0
            }
          ] as Creep[];
        } else if (type === FIND_MY_SPAWNS) {
          return [];
        } else if (type === FIND_MY_CREEPS) {
          return [];
        }
        return [];
      };

      const request = createDefenseRequest(mockRoom as Room, mockSwarm);
      
      assert.isNotNull(request);
      if (request) {
        assert.isAtLeast(request.guardsNeeded, 1, "Should need guards for melee attackers");
      }
    });
  });

  describe("analyzeDefenderNeeds", () => {
    it("should return zero needs when no hostiles present", () => {
      mockRoom.find = () => [];
      const needs = analyzeDefenderNeeds(mockRoom as Room);
      
      assert.equal(needs.guards, 0);
      assert.equal(needs.rangers, 0);
      assert.equal(needs.healers, 0);
      assert.equal(needs.urgency, 1.0);
      assert.isEmpty(needs.reasons);
    });

    it("should calculate needs based on hostile body composition", () => {
      const needs = analyzeDefenderNeeds(mockRoom as Room);
      
      assert.isAtLeast(needs.guards, 1, "Should need guards for attack parts");
      assert.isAtLeast(needs.rangers, 1, "Should need rangers for ranged attack parts");
      assert.isArray(needs.reasons);
      assert.isNotEmpty(needs.reasons);
    });

    it("should increase urgency for boosted enemies", () => {
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_HOSTILE_CREEPS) {
          return [
            {
              body: [
                { type: ATTACK, hits: 100, boost: "UH2O" }, // Boosted
                { type: MOVE, hits: 50 }
              ],
              getActiveBodyparts: (type: BodyPartConstant) => type === ATTACK ? 1 : 1
            }
          ] as Creep[];
        }
        return [];
      };

      const needs = analyzeDefenderNeeds(mockRoom as Room);
      
      assert.isAtLeast(needs.urgency, 2.0, "Should have high urgency for boosted enemies");
      assert.include(needs.reasons.join(" "), "boosted", "Should mention boosted threat");
    });

    it("should detect large attacks", () => {
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_HOSTILE_CREEPS) {
          // 5 hostiles = large attack
          return Array(5).fill({
            body: [{ type: ATTACK, hits: 100 }],
            getActiveBodyparts: () => 1
          }) as Creep[];
        }
        return [];
      };

      const needs = analyzeDefenderNeeds(mockRoom as Room);
      
      assert.isAtLeast(needs.urgency, 1.5, "Should have elevated urgency for large attacks");
      assert.include(needs.reasons.join(" "), "large attack", "Should mention large attack");
    });
  });
});
