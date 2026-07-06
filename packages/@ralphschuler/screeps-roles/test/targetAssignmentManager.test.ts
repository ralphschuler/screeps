import { describe, it, beforeEach } from "mocha";
import { expect } from "chai";

import { getAssignedBuildTarget, getAssignedSource } from "../src/economy/targetAssignmentManager";
import { createMockCreep, createMockRoom, MockGame, resetMockGame } from "./setup";

describe("targetAssignmentManager memory initialization", () => {
  beforeEach(() => {
    resetMockGame();
    MockGame.getObjectById = () => null;
  });

  function site(id: string, structureType: BuildableStructureConstant, x: number, y: number, roomName = "W1N1"): ConstructionSite {
    return {
      id: id as Id<ConstructionSite>,
      structureType,
      pos: new RoomPosition(x, y, roomName)
    } as ConstructionSite;
  }

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

  it("assigns the highest-priority recovery construction type instead of the closest site", () => {
    const extension = site("EXT_SITE", STRUCTURE_EXTENSION, 10, 10);
    const tower = site("TOWER_SITE", STRUCTURE_TOWER, 40, 40);
    const wall = site("WALL_SITE", STRUCTURE_WALL, 5, 5);
    const homeRoom = createMockRoom("W1N1");
    (homeRoom as unknown as { find: Room["find"] }).find = (type: FindConstant) =>
      type === FIND_MY_CONSTRUCTION_SITES ? [wall, extension, tower] : [];

    const creep = createMockCreep("builder-priority", {
      room: homeRoom,
      memory: { role: "builder", homeRoom: "W1N1" },
      pos: {
        findClosestByRange: (sites: ConstructionSite[]) => sites[0] ?? null
      }
    });

    const result = getAssignedBuildTarget(creep);

    expect(result).to.equal(tower);
    expect(creep.memory.targetId).to.equal("TOWER_SITE");
  });

  it("replaces a stale lower-priority assignment when recovery-critical sites are available", () => {
    const extension = site("EXT_SITE", STRUCTURE_EXTENSION, 10, 10);
    const storage = site("STORAGE_SITE", STRUCTURE_STORAGE, 11, 11);
    const tower = site("TOWER_SITE", STRUCTURE_TOWER, 12, 12);
    const homeRoom = createMockRoom("W1N1");
    (homeRoom as unknown as { find: Room["find"] }).find = (type: FindConstant) =>
      type === FIND_MY_CONSTRUCTION_SITES ? [extension, storage, tower] : [];
    MockGame.getObjectById = (id) => (id === "EXT_SITE" ? extension : null);

    const creep = createMockCreep("builder-reassign", {
      room: homeRoom,
      memory: { role: "builder", homeRoom: "W1N1", targetId: "EXT_SITE" },
      pos: {
        findClosestByRange: (sites: ConstructionSite[]) => sites[0] ?? null
      }
    });

    const result = getAssignedBuildTarget(creep);

    expect(result).to.equal(tower);
    expect(creep.memory.targetId).to.equal("TOWER_SITE");
  });

  it("prioritizes missing RCL4 storage before an extra tower once tower coverage exists", () => {
    const extension = site("EXT_SITE", STRUCTURE_EXTENSION, 10, 10);
    const storage = site("STORAGE_SITE", STRUCTURE_STORAGE, 11, 11);
    const secondTower = site("SECOND_TOWER_SITE", STRUCTURE_TOWER, 12, 12);
    const homeRoom = createMockRoom("W1N1", { controller: { my: true, level: 5 } });
    const builtTower = { id: "BUILT_TOWER", structureType: STRUCTURE_TOWER } as StructureTower;
    (homeRoom as unknown as { find: Room["find"] }).find = (type: FindConstant) => {
      if (type === FIND_MY_CONSTRUCTION_SITES) return [extension, secondTower, storage];
      if (type === FIND_MY_STRUCTURES) return [builtTower];
      return [];
    };

    const creep = createMockCreep("builder-storage-recovery", {
      room: homeRoom,
      memory: { role: "builder", homeRoom: "W1N1" },
      pos: {
        findClosestByRange: (sites: ConstructionSite[]) => sites[0] ?? null
      }
    });

    const result = getAssignedBuildTarget(creep);

    expect(result).to.equal(storage);
    expect(creep.memory.targetId).to.equal("STORAGE_SITE");
  });
});
