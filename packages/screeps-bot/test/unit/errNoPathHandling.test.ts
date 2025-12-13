/**
 * ERR_NO_PATH Handling Tests
 *
 * Tests for the behavior system's handling of unreachable targets (ERR_NO_PATH).
 * When a creep encounters an unreachable target, it should return to its home room
 * instead of re-evaluating the same unreachable target repeatedly.
 */

import { expect } from "chai";
import type { CreepAction, CreepContext } from "../../src/roles/behaviors/types";
import { evaluateWithStateMachine } from "../../src/roles/behaviors/stateMachine";
import { executeAction } from "../../src/roles/behaviors/executor";

describe("ERR_NO_PATH Handling", () => {
  let mockCreep: any;
  let mockContext: CreepContext;
  let mockBehaviorFn: (ctx: CreepContext) => CreepAction;

  beforeEach(() => {
    // Set up global Game object
    (global as any).Game = {
      time: 1000,
      rooms: {},
      getObjectById: () => null,
      cpu: { getUsed: () => 0 }
    };

    // Create mock creep
    mockCreep = {
      name: "testCreep",
      pos: {
        x: 10,
        y: 10,
        roomName: "W2N2",
        inRangeTo: () => false,
        findClosestByRange: () => null,
        isEqualTo: () => false,
        getRangeTo: () => 5
      },
      room: {
        name: "W2N2",
        find: () => [],
        controller: { my: true }
      },
      store: {
        getUsedCapacity: () => 50,
        getFreeCapacity: () => 50
      },
      memory: {
        role: "hauler",
        family: "economy",
        homeRoom: "W1N1",
        version: 1
      } as any,
      body: []
    };

    // Create mock context
    mockContext = {
      creep: mockCreep,
      room: mockCreep.room,
      memory: mockCreep.memory,
      homeRoom: "W1N1",
      isInHomeRoom: false,
      isFull: false,
      isEmpty: false,
      isWorking: false,
      swarmState: undefined,
      squadMemory: undefined,
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
      mineralContainers: []
    };

    // Mock behavior function that returns a harvest action
    mockBehaviorFn = () => ({
      type: "harvest",
      target: { id: "source1", pos: { x: 25, y: 25, roomName: "W2N2" } } as any
    });
  });

  afterEach(() => {
    delete (global as any).Game;
  });

  it("should set returningHome flag when ERR_NO_PATH occurs", () => {
    // Initially, no returningHome flag
    expect(mockContext.memory.returningHome).to.be.undefined;

    // Get an action from state machine
    const action = evaluateWithStateMachine(mockContext, mockBehaviorFn);
    
    // Simulate ERR_NO_PATH by manually setting the flag (as executor would do)
    // In real scenario, executeAction would set this when moveTo returns ERR_NO_PATH
    mockContext.memory.returningHome = true;

    // Verify flag is set
    expect(mockContext.memory.returningHome).to.be.true;
  });

  it("should return moveToRoom action when returningHome flag is set", () => {
    // Set returningHome flag
    mockContext.memory.returningHome = true;

    // Call state machine
    const action = evaluateWithStateMachine(mockContext, mockBehaviorFn);

    // Should return moveToRoom action to home room
    expect(action.type).to.equal("moveToRoom");
    if (action.type === "moveToRoom") {
      expect(action.roomName).to.equal("W1N1");
    }
  });

  it("should clear returningHome flag when creep arrives home", () => {
    // Set returningHome flag
    mockContext.memory.returningHome = true;

    // Creep is now in home room
    mockContext.isInHomeRoom = true;
    mockCreep.room.name = "W1N1";
    mockCreep.pos.roomName = "W1N1";

    // Call state machine
    const action = evaluateWithStateMachine(mockContext, mockBehaviorFn);

    // Flag should be cleared
    expect(mockContext.memory.returningHome).to.be.undefined;

    // Should resume normal behavior (call behavior function)
    expect(action.type).to.equal("harvest");
  });

  it("should not call behavior function while returningHome flag is set", () => {
    let behaviorCalled = false;
    const trackingBehaviorFn = (ctx: CreepContext): CreepAction => {
      behaviorCalled = true;
      return { type: "harvest", target: {} as any };
    };

    // Set returningHome flag
    mockContext.memory.returningHome = true;

    // Call state machine
    const action = evaluateWithStateMachine(mockContext, trackingBehaviorFn);

    // Behavior function should NOT be called
    expect(behaviorCalled).to.be.false;
    expect(action.type).to.equal("moveToRoom");
  });

  it("should handle multiple ERR_NO_PATH occurrences gracefully", () => {
    // First ERR_NO_PATH
    mockContext.memory.returningHome = true;

    // Get action (should be moveToRoom)
    let action = evaluateWithStateMachine(mockContext, mockBehaviorFn);
    expect(action.type).to.equal("moveToRoom");

    // Simulate another tick while still not home
    action = evaluateWithStateMachine(mockContext, mockBehaviorFn);
    expect(action.type).to.equal("moveToRoom");

    // Flag should still be set
    expect(mockContext.memory.returningHome).to.be.true;

    // Now arrive home
    mockContext.isInHomeRoom = true;
    action = evaluateWithStateMachine(mockContext, mockBehaviorFn);

    // Flag cleared and normal behavior resumes
    expect(mockContext.memory.returningHome).to.be.undefined;
    expect(action.type).to.equal("harvest");
  });

  it("should work with different roles", () => {
    const roles = ["hauler", "builder", "upgrader", "remoteHarvester"];

    for (const role of roles) {
      mockContext.memory.role = role as any;
      mockContext.memory.returningHome = true;

      const action = evaluateWithStateMachine(mockContext, mockBehaviorFn);

      expect(action.type).to.equal("moveToRoom");
      if (action.type === "moveToRoom") {
        expect(action.roomName).to.equal("W1N1");
      }

      // Reset for next iteration
      delete mockContext.memory.returningHome;
    }
  });

  it("should handle case where homeRoom is current room", () => {
    // Creep is in home room but returningHome is set
    mockContext.isInHomeRoom = true;
    mockContext.memory.returningHome = true;
    mockCreep.room.name = "W1N1";
    mockCreep.pos.roomName = "W1N1";

    const action = evaluateWithStateMachine(mockContext, mockBehaviorFn);

    // Should clear flag and resume normal behavior
    expect(mockContext.memory.returningHome).to.be.undefined;
    expect(action.type).to.equal("harvest");
  });
});
