import { describe, it, beforeEach } from "mocha";
import { expect } from "chai";

import { getAssignedBuildTarget, getAssignedSource } from "../src/economy/targetAssignmentManager";
import { createMockCreep, createMockRoom, MockGame, resetMockGame } from "./setup";

describe("targetAssignmentManager memory initialization", () => {
  beforeEach(() => {
    resetMockGame();
    MockGame.getObjectById = () => null;
  });

  it("initializes missing core memory fields for assignment lookups", () => {
    const creep = createMockCreep("worker1", {
      memory: {}
    });

    const source = getAssignedSource(creep);

    expect(source).to.equal(null);
    expect(creep.memory.role).to.equal("unknown");
    expect(creep.memory.homeRoom).to.equal("W1N1");
    expect(creep.memory.working).to.equal(false);
    expect(creep.memory.room).to.equal("W1N1");
  });

  it("keeps normal builder construction assignment local", () => {
    const localSite = { id: "LOCAL_SITE" as Id<ConstructionSite>, pos: new RoomPosition(10, 10, "W1N1") } as ConstructionSite;
    const remoteSite = { id: "REMOTE_SITE" as Id<ConstructionSite>, pos: new RoomPosition(10, 10, "W2N1") } as ConstructionSite;
    const homeRoom = createMockRoom("W1N1");
    (homeRoom as unknown as { find: Room["find"] }).find = (type: FindConstant) =>
      type === FIND_MY_CONSTRUCTION_SITES ? [localSite] : [];
    MockGame.rooms.W1N1 = homeRoom;
    MockGame.rooms.W2N1 = {
      name: "W2N1",
      find: (type: FindConstant) => type === FIND_MY_CONSTRUCTION_SITES ? [remoteSite] : []
    } as Room;
    const creep = createMockCreep("builder1", {
      room: homeRoom,
      memory: { role: "builder", homeRoom: "W1N1" },
      pos: { findClosestByRange: () => localSite }
    });

    const result = getAssignedBuildTarget(creep);

    expect(result).to.equal(localSite);
    expect(creep.memory.targetId).to.equal("LOCAL_SITE");
  });

  it("returns source for stored sourceId and preserves assignment memory", () => {
    const source = {
      id: "SRC1" as Id<Source>
    } as unknown as Source;

    MockGame.getObjectById = (id) => (id === "SRC1" ? source : null);

    const creep = createMockCreep("worker2", {
      memory: {
        sourceId: "SRC1" as Id<Source>
      }
    });

    const result = getAssignedSource(creep);

    expect(result).to.equal(source);
    expect(creep.memory.sourceId).to.equal("SRC1");
  });
});
