import { assert } from "chai";
import { scout } from "../src/behaviors/utility";
import type { CreepContext } from "../src/behaviors/types";
import { resetMockGame } from "./setup";

interface TestRoomIntel {
  name: string;
  lastSeen: number;
  sources: number;
  controllerLevel: number;
  threatLevel: 0 | 1 | 2 | 3;
  scouted: boolean;
  terrain: "plains" | "swamp" | "mixed";
  isHighway: boolean;
  isSK: boolean;
}

function stubIntel(roomName: string, overrides: Partial<TestRoomIntel> = {}): TestRoomIntel {
  return {
    name: roomName,
    lastSeen: 0,
    sources: 0,
    controllerLevel: 0,
    threatLevel: 0,
    scouted: false,
    terrain: "mixed",
    isHighway: false,
    isSK: false,
    ...overrides
  };
}

function createVisibleRoom(roomName: string, sourceCount = 0): Room {
  const sources = Array.from({ length: sourceCount }, (_, index) => ({ id: `source${index}` }));
  return {
    name: roomName,
    controller: { level: 0 },
    getTerrain: () => ({ get: () => 0 }),
    find: (type: FindConstant) => {
      if (type === FIND_SOURCES) return sources;
      if (type === FIND_MINERALS) return [];
      if (type === FIND_STRUCTURES) return [];
      if (type === FIND_HOSTILE_CREEPS) return [];
      return [];
    }
  } as unknown as Room;
}

function createScoutContext(room: Room, memory: Record<string, unknown> = {}, rangeToExplorePosition = 0): CreepContext {
  const creepMemory = {
    role: "scout",
    family: "utility",
    homeRoom: "W1N1",
    version: 1,
    ...memory
  };
  const creep = {
    name: "Scout1",
    room,
    memory: creepMemory,
    pos: {
      x: 25,
      y: 25,
      roomName: room.name,
      getRangeTo: () => rangeToExplorePosition
    }
  } as unknown as Creep;

  return {
    creep,
    room,
    memory: creepMemory,
    swarmState: undefined,
    squadMemory: undefined,
    homeRoom: "W1N1",
    isInHomeRoom: room.name === "W1N1",
    isFull: false,
    isEmpty: true,
    isWorking: false,
    assignedSource: null,
    assignedMineral: null,
    energyAvailable: false,
    nearbyEnemies: false,
    constructionSiteCount: 0,
    damagedStructureCount: 0,
    droppedResources: [],
    containers: [],
    sourceContainers: [],
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
  } as unknown as CreepContext;
}

describe("scout behavior", () => {
  beforeEach(() => {
    resetMockGame();
    Game.time = 500;
    (global as any).TERRAIN_MASK_WALL = 1;
    (global as any).TERRAIN_MASK_SWAMP = 2;
    (global as any).RoomPosition = class RoomPosition {
      public constructor(public x: number, public y: number, public roomName: string) {}
    };
    (Game as unknown as { map: Partial<Game["map"]> }).map = {
      describeExits: roomName => (roomName === "W1N1" ? { 1: "W1N2" } : { 3: "W1N1" })
    };
    (Memory as unknown as { empire: unknown }).empire = {
      knownRooms: {
        W1N1: stubIntel("W1N1", { scouted: true, lastSeen: Game.time, sources: 2 }),
        W1N2: stubIntel("W1N2")
      },
      clusters: [],
      warTargets: [],
      ownedRooms: {},
      claimQueue: [],
      nukeCandidates: [],
      powerBanks: [],
      objectives: { targetPowerLevel: 0, targetRoomCount: 1, warMode: false, expansionPaused: false },
      lastUpdate: Game.time
    };
  });

  it("targets adjacent unscouted stub intel even before its age exceeds the rescan interval", () => {
    const room = createVisibleRoom("W1N1");

    const action = scout(createScoutContext(room));

    assert.deepInclude(action, { type: "moveToRoom", roomName: "W1N2" });
  });

  it("targets adjacent rooms that do not have intel yet", () => {
    const room = createVisibleRoom("W1N1");
    delete (Memory as unknown as { empire: { knownRooms: Record<string, TestRoomIntel> } }).empire.knownRooms.W1N2;

    const action = scout(createScoutContext(room));

    assert.deepInclude(action, { type: "moveToRoom", roomName: "W1N2" });
  });

  it("falls back to deterministic adjacent rooms when describeExits has no data", () => {
    (Game as unknown as { map: Partial<Game["map"]> }).map = {
      describeExits: () => null
    };
    const room = createVisibleRoom("W1N1");

    const action = scout(createScoutContext(room));

    assert.deepInclude(action, { type: "moveToRoom", roomName: "W1N2" });
  });

  it("uses deterministic adjacent rooms when describeExits returns only stale fully-scouted exits", () => {
    (Game as unknown as { map: Partial<Game["map"]> }).map = {
      describeExits: () => ({ 3: "W0N1" })
    };
    const knownRooms = (Memory as unknown as { empire: { knownRooms: Record<string, TestRoomIntel> } }).empire.knownRooms;
    knownRooms.W0N1 = stubIntel("W0N1", { scouted: true, lastSeen: Game.time, sources: 2 });
    delete knownRooms.W1N2;
    const room = createVisibleRoom("W1N1");

    const action = scout(createScoutContext(room));

    assert.deepInclude(action, { type: "moveToRoom", roomName: "W1N2" });
  });

  it("records full intel when the scout reaches an unscouted room with fresh stub intel", () => {
    const room = createVisibleRoom("W1N2", 2);

    scout(createScoutContext(room, { targetRoom: "W1N2" }));

    const intel = (Memory as unknown as { empire: { knownRooms: Record<string, TestRoomIntel> } }).empire.knownRooms.W1N2;
    assert.isTrue(intel.scouted, "visible unscouted stubs should become scouted after the scout explores them");
    assert.equal(intel.sources, 2, "full scout intel should include visible source count");
  });
});
