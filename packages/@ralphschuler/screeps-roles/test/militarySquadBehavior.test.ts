import { expect } from "chai";
import { guard, healer, soldier, siege, type CreepContext } from "../src/index";
import { createMockCreep, createMockRoom, resetMockGame } from "./setup";

function makeContext(creep: Creep, room: Room): CreepContext {
  return {
    creep,
    room,
    memory: creep.memory as CreepContext["memory"],
    swarmState: undefined,
    squadMemory: undefined,
    homeRoom: (creep.memory as any).homeRoom ?? room.name,
    isInHomeRoom: room.name === ((creep.memory as any).homeRoom ?? room.name),
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
}

function installSquad(squad: Record<string, unknown>): void {
  (Memory as any).clusters = {
    cluster1: {
      squads: [squad]
    }
  };
}

describe("military squad behavior", () => {
  beforeEach(resetMockGame);

  it("resolves squad memory from canonical cluster memory and waits at rally until full quorum", () => {
    const room = createMockRoom("W1N1");
    Game.rooms[room.name] = room;
    const guardCreep = createMockCreep("guard1", {
      room,
      memory: { role: "guard", family: "military", homeRoom: "W1N1", squadId: "squad1" },
      body: [{ type: ATTACK, hits: 100 }, { type: MOVE, hits: 100 }]
    });
    (guardCreep.pos as any).getRangeTo = () => 0;
    Game.creeps[guardCreep.name] = guardCreep;
    installSquad({
      id: "squad1",
      type: "defense",
      members: ["guard1"],
      targetComposition: { guard: 2, healer: 1 },
      rallyRoom: "W1N1",
      targetRooms: ["W2N1"],
      state: "gathering",
      createdAt: Game.time,
      stagingTimeoutAt: Game.time + 100,
      retreatThreshold: 0.3
    });

    const action = guard(makeContext(guardCreep, room));

    expect(action.type).to.equal("wait");
    expect((action as { position: RoomPosition }).position.roomName).to.equal("W1N1");
  });

  it("allows a safe partial quorum after timeout when combat and healer roles are present", () => {
    const room = createMockRoom("W1N1");
    Game.rooms[room.name] = room;
    const guardCreep = createMockCreep("guard1", {
      room,
      memory: { role: "guard", family: "military", homeRoom: "W1N1", squadId: "squad1" },
      body: [{ type: ATTACK, hits: 100 }, { type: MOVE, hits: 100 }]
    });
    (guardCreep.pos as any).getRangeTo = () => 0;
    const healerCreep = createMockCreep("healer1", {
      room,
      memory: { role: "healer", family: "military", homeRoom: "W1N1", squadId: "squad1" },
      body: [{ type: HEAL, hits: 100 }, { type: MOVE, hits: 100 }]
    });
    Game.creeps = { guard1: guardCreep, healer1: healerCreep } as typeof Game.creeps;
    installSquad({
      id: "squad1",
      type: "defense",
      members: ["guard1", "healer1"],
      targetComposition: { guard: 2, healer: 1 },
      rallyRoom: "W1N1",
      targetRooms: ["W2N1"],
      state: "gathering",
      createdAt: Game.time - 400,
      stagingTimeoutAt: Game.time - 1,
      retreatThreshold: 0.3
    });

    const action = guard(makeContext(guardCreep, room));

    expect(action.type).to.equal("idle");
  });

  it("healer with squadId follows squad behavior before targetRoom solo behavior", () => {
    const room = createMockRoom("W1N1");
    Game.rooms[room.name] = room;
    const healerCreep = createMockCreep("healer1", {
      room,
      memory: { role: "healer", family: "military", homeRoom: "W1N1", squadId: "squad1", targetRoom: "W9N9" },
      body: [{ type: HEAL, hits: 100 }, { type: MOVE, hits: 100 }]
    });
    (healerCreep.pos as any).getRangeTo = () => 0;
    Game.creeps[healerCreep.name] = healerCreep;
    installSquad({
      id: "squad1",
      type: "raid",
      members: ["healer1"],
      targetComposition: { healer: 1, ranger: 1 },
      rallyRoom: "W1N1",
      targetRooms: ["W2N1"],
      state: "gathering",
      createdAt: Game.time,
      stagingTimeoutAt: Game.time + 100,
      retreatThreshold: 0.4
    });

    const action = healer(makeContext(healerCreep, room));

    expect(action.type).to.equal("wait");
  });

  it("squad attacking uses primitive combat instead of recursively invoking soldier role", () => {
    const room = createMockRoom("W2N1");
    const hostile = createMockCreep("enemy", {
      room,
      memory: { role: "enemy", homeRoom: "W2N1" },
      body: [{ type: ATTACK, hits: 100 }]
    });
    (hostile as any).owner = { username: "Enemy" };
    const attacker = createMockCreep("soldier1", {
      room,
      memory: { role: "soldier", family: "military", homeRoom: "W1N1", squadId: "squad1" },
      body: [{ type: ATTACK, hits: 100 }, { type: MOVE, hits: 100 }],
      pos: { ...((hostile as any).pos), getRangeTo: () => 1, findClosestByRange: (targets: unknown) => Array.isArray(targets) ? targets[0] : null }
    });
    Game.rooms[room.name] = room;
    Game.creeps = { soldier1: attacker } as typeof Game.creeps;
    installSquad({
      id: "squad1",
      type: "raid",
      members: ["soldier1"],
      targetComposition: { soldier: 1 },
      rallyRoom: "W1N1",
      targetRooms: ["W2N1"],
      state: "attacking",
      createdAt: Game.time,
      stagingTimeoutAt: Game.time,
      retreatThreshold: 0.3
    });
    const ctx = makeContext(attacker, room);
    ctx.hostiles = [hostile];

    const action = soldier(ctx);

    expect(action).to.deep.equal({ type: "attack", target: hostile });
  });

  it("siege squad tries to hold a 2x2 offset while moving in target room", () => {
    const room = createMockRoom("W2N1");
    (room as any).getTerrain = () => ({ get: () => 0 });
    const anchor = createMockCreep("siegeA", {
      room,
      memory: { role: "siegeUnit", family: "military", homeRoom: "W1N1", squadId: "squad1" },
      body: [{ type: WORK, hits: 100 }, { type: MOVE, hits: 100 }],
      pos: new RoomPosition(20, 20, "W2N1")
    });
    const member = createMockCreep("siegeB", {
      room,
      memory: { role: "siegeUnit", family: "military", homeRoom: "W1N1", squadId: "squad1" },
      body: [{ type: WORK, hits: 100 }, { type: MOVE, hits: 100 }],
      pos: { ...new RoomPosition(19, 20, "W2N1"), getRangeTo: () => 2 }
    });
    Game.rooms[room.name] = room;
    Game.creeps = { siegeA: anchor, siegeB: member } as typeof Game.creeps;
    installSquad({
      id: "squad1",
      type: "siege",
      members: ["siegeA", "siegeB"],
      targetComposition: { siegeUnit: 2 },
      rallyRoom: "W1N1",
      targetRooms: ["W2N1"],
      state: "moving",
      createdAt: Game.time,
      stagingTimeoutAt: Game.time,
      retreatThreshold: 0.3
    });

    const action = siege(makeContext(member, room));

    expect(action.type).to.equal("moveTo");
    expect((action as { target: RoomPosition }).target.x).to.equal(21);
    expect((action as { target: RoomPosition }).target.y).to.equal(20);
  });
});
