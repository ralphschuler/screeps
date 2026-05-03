import { expect } from "chai";
import {
  buildBehavior,
  executeAction,
  guard,
  harvestBehavior,
  haulBehavior,
  healer,
  remoteHarvester,
  setRemoteMoveHandler,
  soldier,
  upgradeBehavior,
  type CreepAction,
  type CreepContext
} from "../src/index";
import { createMockCreep, createMockRoom, resetMockGame } from "./setup";

describe("Behavior Contracts", () => {
  beforeEach(() => {
    resetMockGame();
    setRemoteMoveHandler(undefined);
  });

  afterEach(() => {
    setRemoteMoveHandler(undefined);
  });

  function createContext(role: string): CreepContext {
    const room = createMockRoom("W1N1");
    const creep = createMockCreep(`${role}1`, {
      room,
      memory: { role, homeRoom: "W1N1", working: false }
    });

    Game.rooms[room.name] = room;
    Game.creeps[creep.name] = creep;

    return {
      creep,
      room,
      memory: creep.memory as CreepContext["memory"],
      swarmState: undefined,
      squadMemory: undefined,
      homeRoom: "W1N1",
      isInHomeRoom: true,
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

  it("exports current economy behavior functions", () => {
    expect(harvestBehavior).to.be.a("function");
    expect(haulBehavior).to.be.a("function");
    expect(buildBehavior).to.be.a("function");
    expect(upgradeBehavior).to.be.a("function");
  });

  it("returns CreepAction objects from economy behaviors", () => {
    const behaviors: Array<[string, (ctx: CreepContext) => CreepAction]> = [
      ["harvester", harvestBehavior],
      ["hauler", haulBehavior],
      ["builder", buildBehavior],
      ["upgrader", upgradeBehavior]
    ];

    for (const [role, behavior] of behaviors) {
      const action = behavior(createContext(role));
      expect(action).to.have.property("type");
      expect(action.type).to.be.a("string");
    }
  });

  it("exports current military behavior functions", () => {
    expect(guard).to.be.a("function");
    expect(soldier).to.be.a("function");
    expect(healer).to.be.a("function");
  });

  it("routes remote movement actions through the injected movement handler", () => {
    const ctx = createContext("remoteHauler");
    const target = { pos: ctx.creep.pos } as RoomObject;
    let called = false;

    setRemoteMoveHandler((creep, moveTarget, routeType) => {
      called = true;
      expect(creep).to.equal(ctx.creep);
      expect(moveTarget).to.equal(target);
      expect(routeType).to.equal("hauler");
      return OK;
    });

    executeAction(ctx.creep, { type: "remoteMoveTo", target, routeType: "hauler" }, ctx);

    expect(called).to.equal(true);
  });

  it("assigns remote harvesters across visible sources instead of always picking the first", () => {
    const room = createMockRoom("W2N2");
    const sources = [
      { id: "sourceA", pos: { roomName: "W2N2", x: 10, y: 10 } },
      { id: "sourceB", pos: { roomName: "W2N2", x: 40, y: 40 } }
    ] as Source[];
    (room as any).find = (type: number) => (type === FIND_SOURCES ? sources : []);

    const creep = createMockCreep("remoteHarvester1", {
      room,
      memory: {
        role: "remoteHarvester",
        homeRoom: "W1N1",
        targetRoom: "W2N2",
        working: false
      }
    });
    Game.rooms[room.name] = room;
    Game.creeps = {
      remoteHarvester1: creep,
      remoteHarvester2: createMockCreep("remoteHarvester2", {
        room,
        memory: {
          role: "remoteHarvester",
          homeRoom: "W1N1",
          targetRoom: "W2N2",
          sourceId: "sourceA"
        }
      })
    };

    const ctx = {
      ...createContext("remoteHarvester"),
      creep,
      room,
      memory: creep.memory as CreepContext["memory"],
      homeRoom: "W1N1",
      isInHomeRoom: false
    };

    const action = remoteHarvester(ctx);

    expect(ctx.memory.sourceId).to.equal("sourceB");
    expect(action.type).to.equal("remoteMoveTo");
  });
});
