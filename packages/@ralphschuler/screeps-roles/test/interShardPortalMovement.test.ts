import { expect } from "chai";
import { evaluateWithStateMachine } from "../src/behaviors/stateMachine";
import { interShardClaimer } from "../src/behaviors/interShardClaim";
import { interShardPioneer } from "../src/behaviors/economy/interShardPioneer";
import type { CreepAction, CreepContext } from "../src/behaviors/types";
import { createMockCreep, createMockRoom, resetMockGame } from "./setup";

function createContext(creep: Creep, room: Room): CreepContext {
  return {
    creep,
    room,
    memory: creep.memory as CreepContext["memory"],
    swarmState: undefined,
    squadMemory: undefined,
    homeRoom: creep.memory.homeRoom ?? room.name,
    isInHomeRoom: creep.memory.homeRoom === room.name,
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
    mineralContainers: [],
  };
}

function createPortalRoom() {
  const room = createMockRoom("W20S20");
  const portal = {
    structureType: STRUCTURE_PORTAL,
    pos: new RoomPosition(29, 12, room.name),
    destination: { shard: "shard0", room: room.name },
  } as unknown as StructurePortal;
  room.find = (_type: number, options?: { filter?: (value: Structure) => boolean }) =>
    options?.filter ? [portal].filter(options.filter) : [portal];
  return { room, portal };
}

describe("inter-shard portal movement", () => {
  let localMemory: string;

  beforeEach(() => {
    resetMockGame();
    (globalThis.Game as typeof Game & { shard?: { name: string } }).shard = { name: "shard1" };
    localMemory = "";
    (globalThis as unknown as { InterShardMemory: InterShardMemory }).InterShardMemory = {
      getLocal: () => localMemory,
      setLocal: value => {
        localMemory = value;
      },
      getRemote: () => null,
    };
  });

  it("stages claim scout memory before asking it to step onto the portal tile", () => {
    const { room, portal } = createPortalRoom();
    localMemory = JSON.stringify({ "portals:": { room: room.name } });
    const creep = createMockCreep("interShardScout", {
      room,
      memory: {
        role: "interShardScout",
        homeRoom: "W1N1",
        targetShard: "shard0",
        portalRoom: room.name,
      },
    });

    const action = interShardClaimer(createContext(creep, room));

    expect(action.type).to.equal("moveTo");
    expect((action as Extract<CreepAction, { type: "moveTo" }>).target).to.deep.equal({
      pos: portal.pos,
      range: 0,
    });
    const root = JSON.parse(localMemory);
    expect(root["portals:"]).to.deep.equal({ room: room.name });
    expect(root["creepHandoffs:"].outgoing[creep.name].memory).to.include({
      role: "interShardScout",
      targetShard: "shard0",
      portalRoom: room.name,
    });
  });

  it("holds a claim scout outside the portal when its memory cannot be staged", () => {
    const { room } = createPortalRoom();
    const oversizedPayload = JSON.stringify({ existing: "x".repeat(102350) });
    localMemory = oversizedPayload;
    const creep = createMockCreep("interShardScout", {
      room,
      memory: {
        role: "interShardScout",
        homeRoom: "W1N1",
        targetShard: "shard0",
        portalRoom: room.name,
      },
    });

    expect(interShardClaimer(createContext(creep, room))).to.deep.equal({
      type: "idle",
    });
    expect(localMemory).to.equal(oversizedPayload);
  });

  it("stages pioneer memory before asking it to step onto the portal tile", () => {
    const { room, portal } = createPortalRoom();
    const creep = createMockCreep("interShardPioneer", {
      room,
      memory: {
        role: "interShardPioneer",
        homeRoom: "W1N1",
        targetShard: "shard0",
        portalRoom: room.name,
      },
    });

    const action = interShardPioneer(createContext(creep, room));

    expect(action.type).to.equal("moveTo");
    expect((action as Extract<CreepAction, { type: "moveTo" }>).target).to.deep.equal({
      pos: portal.pos,
      range: 0,
    });
    expect(JSON.parse(localMemory)["creepHandoffs:"].outgoing[creep.name].memory.role).to.equal(
      "interShardPioneer",
    );
  });

  it("preserves an exact portal range when reconstructing a movement state", () => {
    const room = createMockRoom("W20S20");
    const creep = createMockCreep("interShardScout", {
      room,
      memory: {
        role: "interShardScout",
        homeRoom: "W1N1",
        state: {
          action: "moveTo",
          targetPos: { x: 29, y: 12, roomName: room.name },
          targetRange: 0,
          startTick: Game.time,
          timeout: 25,
        },
      },
    });
    creep.pos.inRangeTo = (_target: RoomPosition, range: number) => range > 0;

    const action = evaluateWithStateMachine(createContext(creep, room), () => {
      throw new Error("state should still be active");
    });

    expect(action.type).to.equal("moveTo");
    expect((action as Extract<CreepAction, { type: "moveTo" }>).target).to.deep.equal({
      pos: new RoomPosition(29, 12, room.name),
      range: 0,
    });
  });
});
