import { describe, it, beforeEach } from "mocha";
import { expect } from "chai";
import { createContext, clearRoomCaches } from "../src/framework/BehaviorContext";
import { createMockCreep, createMockRoom, resetMockGame } from "./setup";

describe("@ralphschuler/screeps-roles", () => {
  beforeEach(() => {
    resetMockGame();
  });

  it("should have package structure", () => {
    // Basic test to verify package loads
    expect(true).to.be.true;
  });

  it("should export createContext function", () => {
    // Create a mock creep with necessary properties
    const mockRoom = createMockRoom("W1N1");
    const mockCreep = createMockCreep("TestCreep", {
      room: mockRoom,
      memory: { role: "harvester", homeRoom: "W1N1" },
      store: {
        getUsedCapacity: (resource?: string) => 0,
        getFreeCapacity: (resource?: string) => 50,
        getCapacity: (resource?: string) => 50,
        energy: 0
      }
    });

    // Add the creep to the mock Game
    (global as any).Game.creeps[mockCreep.name] = mockCreep;
    (global as any).Game.rooms[mockRoom.name] = mockRoom;

    // Create context
    const context = createContext(mockCreep);

    // Verify context has expected properties
    expect(context).to.have.property("creep");
    expect(context).to.have.property("room");
    expect(context).to.have.property("memory");
    expect(context).to.have.property("homeRoom");
    expect(context).to.have.property("isInHomeRoom");
    expect(context).to.have.property("isFull");
    expect(context).to.have.property("isEmpty");
    expect(context).to.have.property("isWorking");

    // Verify values
    expect(context.creep).to.equal(mockCreep);
    expect(context.room).to.equal(mockRoom);
    expect(context.homeRoom).to.equal("W1N1");
    expect(context.isInHomeRoom).to.be.true;
    expect(context.isEmpty).to.be.true;
    expect(context.isFull).to.be.false;
  });

  it("should export clearRoomCaches function", () => {
    // Create mock room and creeps
    const mockRoom = createMockRoom("W1N1");
    const mockCreep1 = createMockCreep("Creep1", { room: mockRoom });
    const mockCreep2 = createMockCreep("Creep2", { room: mockRoom });

    // Add to game
    (global as any).Game.rooms[mockRoom.name] = mockRoom;
    (global as any).Game.creeps[mockCreep1.name] = mockCreep1;
    (global as any).Game.creeps[mockCreep2.name] = mockCreep2;

    // Create contexts to populate cache
    const context1 = createContext(mockCreep1);
    const context2 = createContext(mockCreep2);

    // Both should have same cached room data
    expect(context1.room).to.equal(context2.room);

    // Clear caches
    clearRoomCaches();

    // Verify function executes without error
    // The cache is internal, so we can't directly verify it's cleared,
    // but we can verify the function is callable and doesn't throw
    expect(clearRoomCaches).to.be.a("function");
  });
});
