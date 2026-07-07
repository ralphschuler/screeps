import { expect } from "chai";
import { claimer, type CreepContext } from "../src/index";
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

describe("claimer behavior", () => {
  beforeEach(() => {
    resetMockGame();
  });

  it("retires a claimer with no active CLAIM parts instead of attempting controller actions", () => {
    const controller = {
      id: "controller1" as Id<StructureController>,
      pos: new RoomPosition(25, 25, "W2N1"),
    } as StructureController;
    const room = createMockRoom("W2N1", { controller });
    let suicideCalled = false;
    const creep = createMockCreep("claimer_invalid", {
      room,
      memory: {
        role: "claimer",
        homeRoom: "W1N1",
        targetRoom: "W2N1",
        task: "claim",
        state: { action: "claim", targetId: controller.id },
      },
      body: [
        { type: WORK, hits: 100 },
        { type: CARRY, hits: 100 },
        { type: MOVE, hits: 100 },
      ],
    });
    (creep as unknown as { suicide: () => ScreepsReturnCode }).suicide = () => {
      suicideCalled = true;
      return OK;
    };

    const action = claimer(createContext(creep, room));

    expect(action.type).to.equal("idle");
    expect(suicideCalled).to.equal(true);
    expect(creep.memory.state).to.equal(undefined);
    expect((creep.memory as CreepMemory & { task?: string }).task).to.equal(undefined);
  });

  it("allows claim-capable claimers to reserve the target room controller", () => {
    const controller = {
      id: "controller2" as Id<StructureController>,
      pos: new RoomPosition(25, 25, "W2N1"),
    } as StructureController;
    const room = createMockRoom("W2N1", { controller });
    let suicideCalled = false;
    const creep = createMockCreep("claimer_valid", {
      room,
      memory: {
        role: "claimer",
        homeRoom: "W1N1",
        targetRoom: "W2N1",
        task: "reserve",
      },
      body: [
        { type: CLAIM, hits: 100 },
        { type: MOVE, hits: 100 },
      ],
    });
    (creep as unknown as { suicide: () => ScreepsReturnCode }).suicide = () => {
      suicideCalled = true;
      return OK;
    };

    const action = claimer(createContext(creep, room));

    expect(action.type).to.equal("reserve");
    expect((action as Extract<typeof action, { type: "reserve" }>).target).to.equal(controller);
    expect(suicideCalled).to.equal(false);
  });
});
