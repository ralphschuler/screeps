import { expect } from "chai";
import {
  buildBehavior,
  executeAction,
  evaluateEconomyBehavior,
  evaluateUtilityBehavior,
  getUtilityStateInterrupt,
  guard,
  harvestBehavior,
  haulBehavior,
  healer,
  remoteHarvester,
  remoteWorker,
  evaluateWithStateMachine,
  setLabManagerProvider,
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
    (Game as unknown as { getObjectById: (id: string) => unknown }).getObjectById = () => null;
    setLabManagerProvider(undefined);
    setRemoteMoveHandler(undefined);
  });

  afterEach(() => {
    setLabManagerProvider(undefined);
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

  it("keeps builder and upgrader critical energy delivery priority aligned", () => {
    const extension = {
      id: "extension1",
      structureType: STRUCTURE_EXTENSION,
      store: { getFreeCapacity: () => 50 }
    } as unknown as StructureExtension;
    const fullSpawn = {
      id: "spawn1",
      structureType: STRUCTURE_SPAWN,
      store: { getFreeCapacity: () => 0 }
    } as unknown as StructureSpawn;

    const behaviors: Array<[string, (ctx: CreepContext) => CreepAction]> = [
      ["builder", buildBehavior],
      ["upgrader", upgradeBehavior]
    ];

    for (const [role, behavior] of behaviors) {
      const ctx = createContext(role);
      ctx.memory.working = true;
      (ctx.creep as unknown as { store: Creep["store"] }).store = {
        getUsedCapacity: () => 50,
        getFreeCapacity: () => 0,
        getCapacity: () => 50
      } as Creep["store"];
      ctx.spawnStructures = [fullSpawn, extension];

      const action = behavior(ctx);

      expect(action.type).to.equal("transfer");
      expect((action as Extract<CreepAction, { type: "transfer" }>).target).to.equal(extension);
    }
  });

  it("routes labTech through configured lab resource needs", () => {
    const lab = {
      id: "lab1",
      structureType: STRUCTURE_LAB,
      store: { getFreeCapacity: () => 2000, getUsedCapacity: () => 0 }
    } as unknown as StructureLab;
    const terminal = {
      id: "terminal1",
      store: {
        [RESOURCE_HYDROGEN]: 2000,
        getUsedCapacity: (resource?: ResourceConstant) => resource === RESOURCE_HYDROGEN ? 2000 : 2000,
        getFreeCapacity: () => 10000
      }
    } as unknown as StructureTerminal;
    (Game as unknown as { getObjectById: (id: string) => unknown }).getObjectById = id => id === "lab1" ? lab : null;
    setLabManagerProvider({
      getLabResourceNeeds: () => [{
        labId: "lab1" as Id<StructureLab>,
        resourceType: RESOURCE_HYDROGEN,
        amount: 1000,
        priority: 10
      }],
      getLabOverflow: () => []
    });

    const ctx = createContext("labTech");
    const action = evaluateEconomyBehavior({
      ...ctx,
      terminal,
      labs: [lab]
    });

    expect(action.type).to.equal("withdraw");
    expect((action as Extract<CreepAction, { type: "withdraw" }>).target).to.equal(terminal);
    expect((action as Extract<CreepAction, { type: "withdraw" }>).resourceType).to.equal(RESOURCE_HYDROGEN);
  });

  it("does not fill arbitrary input labs when no configured lab need exists", () => {
    const lab = {
      id: "lab1",
      structureType: STRUCTURE_LAB,
      store: { getFreeCapacity: () => 2000, getUsedCapacity: () => 0 }
    } as unknown as StructureLab;
    const terminal = {
      id: "terminal1",
      store: {
        [RESOURCE_HYDROGEN]: 2000,
        getUsedCapacity: (resource?: ResourceConstant) => resource === RESOURCE_HYDROGEN ? 2000 : 2000,
        getFreeCapacity: () => 10000
      }
    } as unknown as StructureTerminal;

    const ctx = createContext("labTech");
    const action = evaluateEconomyBehavior({
      ...ctx,
      terminal,
      labs: [lab]
    });

    expect(action.type).to.equal("idle");
  });

  it("keeps spawn delivery ahead of terminal energy buffering", () => {
    const room = createMockRoom("W1N1");
    const spawn = {
      id: "spawn1",
      structureType: STRUCTURE_SPAWN,
      store: { getFreeCapacity: () => 300 }
    } as unknown as StructureSpawn;
    const storage = {
      id: "storage1",
      store: {
        [RESOURCE_ENERGY]: 100000,
        getUsedCapacity: (resource?: ResourceConstant) => resource === RESOURCE_ENERGY ? 100000 : 100000,
        getFreeCapacity: () => 100000
      }
    } as unknown as StructureStorage;
    const terminal = {
      id: "terminal1",
      cooldown: 0,
      store: {
        [RESOURCE_ENERGY]: 1000,
        getUsedCapacity: (resource?: ResourceConstant) => resource === RESOURCE_ENERGY ? 1000 : 1000,
        getFreeCapacity: () => 10000
      }
    } as unknown as StructureTerminal;
    const creep = createMockCreep("hauler1", {
      room,
      memory: { role: "hauler", homeRoom: room.name, working: true },
      store: {
        [RESOURCE_ENERGY]: 50,
        getUsedCapacity: (resource?: ResourceConstant) => resource === RESOURCE_ENERGY || resource === undefined ? 50 : 0,
        getFreeCapacity: () => 0,
        getCapacity: () => 50
      }
    });

    const action = evaluateEconomyBehavior({
      ...createContext("hauler"),
      creep,
      room,
      memory: creep.memory as CreepContext["memory"],
      isEmpty: false,
      isFull: true,
      isWorking: true,
      spawnStructures: [spawn],
      storage,
      terminal
    });

    expect(action.type).to.equal("transfer");
    expect((action as Extract<CreepAction, { type: "transfer" }>).target).to.equal(spawn);
  });

  it("delivers carried energy to terminal when core delivery is satisfied", () => {
    const room = createMockRoom("W1N1");
    const storage = {
      id: "storage1",
      store: {
        [RESOURCE_ENERGY]: 100000,
        getUsedCapacity: (resource?: ResourceConstant) => resource === RESOURCE_ENERGY ? 100000 : 100000,
        getFreeCapacity: () => 100000
      }
    } as unknown as StructureStorage;
    const terminal = {
      id: "terminal1",
      cooldown: 0,
      store: {
        [RESOURCE_ENERGY]: 1000,
        getUsedCapacity: (resource?: ResourceConstant) => resource === RESOURCE_ENERGY ? 1000 : 1000,
        getFreeCapacity: () => 10000
      }
    } as unknown as StructureTerminal;
    const creep = createMockCreep("hauler1", {
      room,
      memory: { role: "hauler", homeRoom: room.name, working: true },
      store: {
        [RESOURCE_ENERGY]: 50,
        getUsedCapacity: (resource?: ResourceConstant) => resource === RESOURCE_ENERGY || resource === undefined ? 50 : 0,
        getFreeCapacity: () => 0,
        getCapacity: () => 50
      }
    });

    const action = evaluateEconomyBehavior({
      ...createContext("hauler"),
      creep,
      room,
      memory: creep.memory as CreepContext["memory"],
      isEmpty: false,
      isFull: true,
      isWorking: true,
      storage,
      terminal
    });

    expect(action.type).to.equal("transfer");
    expect((action as Extract<CreepAction, { type: "transfer" }>).target).to.equal(terminal);
  });

  it("delivers carried energy to terminal for storage overflow export even after base terminal buffer is met", () => {
    const storage = {
      id: "storage1",
      store: {
        [RESOURCE_ENERGY]: 850000,
        getUsedCapacity: (resource?: ResourceConstant) => resource === RESOURCE_ENERGY ? 850000 : 850000,
        getFreeCapacity: () => 150000
      }
    } as unknown as StructureStorage;
    const terminal = {
      id: "terminal1",
      cooldown: 0,
      store: {
        [RESOURCE_ENERGY]: 50000,
        getUsedCapacity: (resource?: ResourceConstant) => resource === RESOURCE_ENERGY ? 50000 : 50000,
        getFreeCapacity: () => 250000
      }
    } as unknown as StructureTerminal;
    const room = createMockRoom("W1N1", { controller: { my: true, level: 8 }, storage, terminal });
    (terminal as unknown as { room: Room }).room = room;
    const creep = createMockCreep("hauler1", {
      room,
      memory: { role: "hauler", homeRoom: room.name, working: true },
      store: {
        [RESOURCE_ENERGY]: 50,
        getUsedCapacity: (resource?: ResourceConstant) => resource === RESOURCE_ENERGY || resource === undefined ? 50 : 0,
        getFreeCapacity: () => 0,
        getCapacity: () => 50
      }
    });

    Game.rooms[room.name] = room;
    Game.creeps[creep.name] = creep;
    (Game as unknown as { getObjectById: (id: string) => unknown }).getObjectById = id => id === "terminal1" ? terminal : storage;

    const action = evaluateEconomyBehavior({
      ...createContext("hauler"),
      creep,
      room,
      memory: creep.memory as CreepContext["memory"],
      isEmpty: false,
      isFull: true,
      isWorking: true,
      storage,
      terminal
    });

    expect(action.type).to.equal("transfer");
    expect((action as Extract<CreepAction, { type: "transfer" }>).target).to.equal(terminal);
  });

  it("withdraws storage energy to buffer a low terminal", () => {
    const storage = {
      id: "storage1",
      store: {
        [RESOURCE_ENERGY]: 100000,
        getUsedCapacity: (resource?: ResourceConstant) => resource === RESOURCE_ENERGY ? 100000 : 100000,
        getFreeCapacity: () => 100000
      }
    } as unknown as StructureStorage;
    const terminal = {
      id: "terminal1",
      cooldown: 0,
      store: {
        [RESOURCE_ENERGY]: 1000,
        getUsedCapacity: (resource?: ResourceConstant) => resource === RESOURCE_ENERGY ? 1000 : 1000,
        getFreeCapacity: () => 10000
      }
    } as unknown as StructureTerminal;

    const ctx = createContext("hauler");
    const action = evaluateEconomyBehavior({
      ...ctx,
      storage,
      terminal
    });

    expect(action.type).to.equal("withdraw");
    expect((action as Extract<CreepAction, { type: "withdraw" }>).target).to.equal(storage);
    expect((action as Extract<CreepAction, { type: "withdraw" }>).resourceType).to.equal(RESOURCE_ENERGY);
  });

  it("withdraws storage energy for terminal export when storage exceeds overflow threshold", () => {
    const storage = {
      id: "storage1",
      store: {
        [RESOURCE_ENERGY]: 850000,
        getUsedCapacity: (resource?: ResourceConstant) => resource === RESOURCE_ENERGY ? 850000 : 850000,
        getFreeCapacity: () => 150000
      }
    } as unknown as StructureStorage;
    const terminal = {
      id: "terminal1",
      cooldown: 0,
      store: {
        [RESOURCE_ENERGY]: 50000,
        getUsedCapacity: (resource?: ResourceConstant) => resource === RESOURCE_ENERGY ? 50000 : 50000,
        getFreeCapacity: () => 250000
      }
    } as unknown as StructureTerminal;
    const room = createMockRoom("W1N1", { controller: { my: true, level: 8 }, storage, terminal });
    const ctx = createContext("hauler");

    const action = evaluateEconomyBehavior({
      ...ctx,
      room,
      storage,
      terminal
    });

    expect(action.type).to.equal("withdraw");
    expect((action as Extract<CreepAction, { type: "withdraw" }>).target).to.equal(storage);
    expect((action as Extract<CreepAction, { type: "withdraw" }>).resourceType).to.equal(RESOURCE_ENERGY);
  });

  it("withdraws surplus storage minerals for terminal market buffering", () => {
    const storage = {
      id: "storage1",
      store: {
        [RESOURCE_ENERGY]: 100000,
        [RESOURCE_HYDROGEN]: 9000,
        getUsedCapacity: (resource?: ResourceConstant) => {
          if (resource === RESOURCE_ENERGY) return 100000;
          if (resource === RESOURCE_HYDROGEN) return 9000;
          return 109000;
        },
        getFreeCapacity: () => 100000
      }
    } as unknown as StructureStorage;
    const terminal = {
      id: "terminal1",
      cooldown: 0,
      store: {
        [RESOURCE_ENERGY]: 25000,
        [RESOURCE_HYDROGEN]: 1000,
        getUsedCapacity: (resource?: ResourceConstant) => {
          if (resource === RESOURCE_ENERGY) return 25000;
          if (resource === RESOURCE_HYDROGEN) return 1000;
          return 26000;
        },
        getFreeCapacity: () => 10000
      }
    } as unknown as StructureTerminal;

    const ctx = createContext("hauler");
    const action = evaluateEconomyBehavior({
      ...ctx,
      storage,
      terminal
    });

    expect(action.type).to.equal("withdraw");
    expect((action as Extract<CreepAction, { type: "withdraw" }>).target).to.equal(storage);
    expect((action as Extract<CreepAction, { type: "withdraw" }>).resourceType).to.equal(RESOURCE_HYDROGEN);
  });

  it("exports current military behavior functions", () => {
    expect(guard).to.be.a("function");
    expect(soldier).to.be.a("function");
    expect(healer).to.be.a("function");
  });

  it("remoteWorker builds remote construction before hauling home", () => {
    const remoteRoom = createMockRoom("W2N1");
    const site = {
      id: "remote-container-site" as Id<ConstructionSite>,
      structureType: STRUCTURE_CONTAINER,
      pos: new RoomPosition(20, 20, "W2N1"),
      room: remoteRoom
    } as ConstructionSite;
    (remoteRoom as unknown as { find: Room["find"] }).find = (type: FindConstant) => {
      if (type === FIND_MY_CONSTRUCTION_SITES) return [site];
      return [];
    };
    const creep = createMockCreep("remoteWorker1", {
      room: remoteRoom,
      memory: { role: "remoteWorker", homeRoom: "W1N1", targetRoom: "W2N1", working: true },
      store: { getUsedCapacity: () => 50, getFreeCapacity: () => 0, getCapacity: () => 50, energy: 50 }
    });

    const action = remoteWorker({
      ...createContext("remoteWorker"),
      creep,
      room: remoteRoom,
      memory: creep.memory as CreepContext["memory"],
      homeRoom: "W1N1",
      isInHomeRoom: false,
      isFull: true,
      isEmpty: false,
      hostiles: []
    });

    expect(action.type).to.equal("build");
    expect((action as Extract<CreepAction, { type: "build" }>).target).to.equal(site);
  });

  it("remoteWorker retreats home from dangerous remote hostiles", () => {
    const remoteRoom = createMockRoom("W2N1");
    const hostile = { getActiveBodyparts: (part: BodyPartConstant) => part === ATTACK ? 1 : 0 } as Creep;
    const creep = createMockCreep("remoteWorker2", {
      room: remoteRoom,
      memory: { role: "remoteWorker", homeRoom: "W1N1", targetRoom: "W2N1", working: false }
    });

    const action = remoteWorker({
      ...createContext("remoteWorker"),
      creep,
      room: remoteRoom,
      memory: creep.memory as CreepContext["memory"],
      homeRoom: "W1N1",
      isInHomeRoom: false,
      hostiles: [hostile]
    });

    expect(action.type).to.equal("remoteMoveToRoom");
    expect((action as Extract<CreepAction, { type: "remoteMoveToRoom" }>).roomName).to.equal("W1N1");
  });

  it("remoteWorker unloads excess remote energy after returning home", () => {
    const homeRoom = createMockRoom("W1N1");
    const storage = {
      id: "home-storage" as Id<StructureStorage>,
      structureType: STRUCTURE_STORAGE,
      pos: new RoomPosition(25, 25, "W1N1"),
      room: homeRoom,
      store: { getUsedCapacity: () => 0, getFreeCapacity: () => 1000 }
    } as unknown as StructureStorage;
    const creep = createMockCreep("remoteWorker3", {
      room: homeRoom,
      memory: { role: "remoteWorker", homeRoom: "W1N1", targetRoom: "W2N1", working: true },
      store: { getUsedCapacity: () => 50, getFreeCapacity: () => 0, getCapacity: () => 50, energy: 50 }
    });

    const action = remoteWorker({
      ...createContext("remoteWorker"),
      creep,
      room: homeRoom,
      memory: creep.memory as CreepContext["memory"],
      homeRoom: "W1N1",
      isInHomeRoom: true,
      isFull: true,
      isEmpty: false,
      storage,
      hostiles: []
    });

    expect(action.type).to.equal("transfer");
    expect((action as Extract<CreepAction, { type: "transfer" }>).target).to.equal(storage);
    expect((action as Extract<CreepAction, { type: "transfer" }>).resourceType).to.equal(RESOURCE_ENERGY);
  });

  it("remoteWorker unloads at home before reacting to local hostiles", () => {
    const homeRoom = createMockRoom("W1N1");
    const storage = {
      id: "home-storage" as Id<StructureStorage>,
      structureType: STRUCTURE_STORAGE,
      pos: new RoomPosition(25, 25, "W1N1"),
      room: homeRoom,
      store: { getUsedCapacity: () => 0, getFreeCapacity: () => 1000 }
    } as unknown as StructureStorage;
    const hostile = { getActiveBodyparts: (part: BodyPartConstant) => part === ATTACK ? 1 : 0 } as Creep;
    const creep = createMockCreep("remoteWorker3b", {
      room: homeRoom,
      memory: { role: "remoteWorker", homeRoom: "W1N1", targetRoom: "W2N1", working: true },
      store: { getUsedCapacity: () => 50, getFreeCapacity: () => 0, getCapacity: () => 50, energy: 50 }
    });

    const action = remoteWorker({
      ...createContext("remoteWorker"),
      creep,
      room: homeRoom,
      memory: creep.memory as CreepContext["memory"],
      homeRoom: "W1N1",
      isInHomeRoom: true,
      isFull: true,
      isEmpty: false,
      storage,
      hostiles: [hostile]
    });

    expect(action.type).to.equal("transfer");
    expect((action as Extract<CreepAction, { type: "transfer" }>).target).to.equal(storage);
  });

  it("interrupts committed remoteWorker work when dangerous remote hostiles appear", () => {
    const remoteRoom = createMockRoom("W2N1");
    const site = {
      id: "remote-container-site" as Id<ConstructionSite>,
      structureType: STRUCTURE_CONTAINER,
      pos: new RoomPosition(20, 20, "W2N1"),
      room: remoteRoom
    } as ConstructionSite;
    (Game as unknown as { getObjectById: (id: string) => unknown }).getObjectById = id =>
      id === "remote-container-site" ? site : null;
    const hostile = { getActiveBodyparts: (part: BodyPartConstant) => part === ATTACK ? 1 : 0 } as Creep;
    const creep = createMockCreep("remoteWorker4", {
      room: remoteRoom,
      pos: new RoomPosition(25, 25, "W2N1"),
      memory: {
        role: "remoteWorker",
        homeRoom: "W1N1",
        targetRoom: "W2N1",
        working: true,
        state: { action: "build", targetId: "remote-container-site" as Id<ConstructionSite>, startTick: Game.time, timeout: 25 }
      },
      store: { getUsedCapacity: () => 50, getFreeCapacity: () => 0, getCapacity: () => 50, energy: 50 }
    });

    const action = evaluateWithStateMachine({
      ...createContext("remoteWorker"),
      creep,
      room: remoteRoom,
      memory: creep.memory as CreepContext["memory"],
      homeRoom: "W1N1",
      isInHomeRoom: false,
      isFull: true,
      isEmpty: false,
      hostiles: [hostile]
    }, evaluateUtilityBehavior, { interrupt: getUtilityStateInterrupt });

    expect(action.type).to.equal("remoteMoveToRoom");
    expect((action as Extract<CreepAction, { type: "remoteMoveToRoom" }>).roomName).to.equal("W1N1");
    expect(creep.memory.state?.action).to.equal("remoteMoveToRoom");
    expect(creep.memory.state?.targetRoom).to.equal("W1N1");
  });

  it("keeps room movement state active while on the target room exit", () => {
    const room = createMockRoom("W2N1");
    const creep = createMockCreep("mover1", {
      room,
      pos: new RoomPosition(0, 25, "W2N1"),
      memory: {
        role: "remoteWorker",
        homeRoom: "W1N1",
        targetRoom: "W2N1",
        state: { action: "remoteMoveToRoom", targetRoom: "W2N1", startTick: Game.time, timeout: 25, data: { routeType: "hauler" } }
      }
    });
    const action = evaluateWithStateMachine({
      ...createContext("remoteWorker"),
      creep,
      room,
      memory: creep.memory as CreepContext["memory"],
      homeRoom: "W1N1",
      isInHomeRoom: false
    }, () => ({ type: "idle" }));

    expect(action.type).to.equal("remoteMoveToRoom");
  });

  it("completes room movement state after entering target room interior", () => {
    const room = createMockRoom("W2N1");
    const creep = createMockCreep("mover2", {
      room,
      pos: new RoomPosition(25, 25, "W2N1"),
      memory: {
        role: "remoteWorker",
        homeRoom: "W1N1",
        targetRoom: "W2N1",
        state: { action: "remoteMoveToRoom", targetRoom: "W2N1", startTick: Game.time, timeout: 25, data: { routeType: "hauler" } }
      }
    });
    const action = evaluateWithStateMachine({
      ...createContext("remoteWorker"),
      creep,
      room,
      memory: creep.memory as CreepContext["memory"],
      homeRoom: "W1N1",
      isInHomeRoom: false
    }, () => ({ type: "idle" }));

    expect(action.type).to.equal("idle");
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

  it("prefers queen carrier transfer into storage link for spawn-link handoff", () => {
    const room = createMockRoom("W1N1");
    const storage = {
      id: "storage1",
      pos: { getRangeTo: (target: any) => target.id === "storageLink" ? 1 : 99 },
      store: { getFreeCapacity: () => 100000, getUsedCapacity: () => 50000 }
    } as unknown as StructureStorage;
    const spawn = {
      id: "spawn1",
      structureType: STRUCTURE_SPAWN,
      pos: { getRangeTo: (target: any) => target.id === "spawnLink" ? 1 : 99 },
      store: { getFreeCapacity: () => 300 }
    } as unknown as StructureSpawn;
    const storageLink = {
      id: "storageLink",
      structureType: STRUCTURE_LINK,
      pos: { getRangeTo: (target: any) => target.id === "storage1" ? 1 : 99 },
      store: { getFreeCapacity: () => 700, getUsedCapacity: () => 0 }
    } as unknown as StructureLink;
    const spawnLink = {
      id: "spawnLink",
      structureType: STRUCTURE_LINK,
      pos: { getRangeTo: (target: any) => target.id === "spawn1" ? 1 : 99 },
      store: { getFreeCapacity: () => 800, getUsedCapacity: () => 0 }
    } as unknown as StructureLink;
    (room as any).storage = storage;
    (room as any).energyAvailable = 300;
    (room as any).energyCapacityAvailable = 800;
    (room as any).find = (type: number, opts?: { filter?: (structure: any) => boolean }) => {
      if (type === FIND_MY_SPAWNS) return [spawn];
      if (type === FIND_STRUCTURES || type === FIND_MY_STRUCTURES) {
        const structures = [spawn, storageLink, spawnLink];
        return opts?.filter ? structures.filter(opts.filter) : structures;
      }
      return [];
    };
    const creep = createMockCreep("queen1", {
      room,
      memory: { role: "queenCarrier", homeRoom: room.name, working: true },
      store: {
        getUsedCapacity: () => 100,
        getFreeCapacity: () => 0,
        getCapacity: () => 100
      }
    });

    const action = evaluateEconomyBehavior({
      ...createContext("queenCarrier"),
      creep,
      room,
      memory: creep.memory as CreepContext["memory"],
      storage,
      spawnStructures: [spawn]
    });

    expect(action.type).to.equal("transfer");
    expect((action as Extract<CreepAction, { type: "transfer" }>).target).to.equal(storageLink);
  });

  it("prefers queen carrier withdraw from spawn link before storage during spawn refill", () => {
    const room = createMockRoom("W1N1");
    const spawn = { id: "spawn1", pos: { getRangeTo: (target: any) => target.id === "spawnLink" ? 1 : 99 } };
    const spawnLink = {
      id: "spawnLink",
      structureType: STRUCTURE_LINK,
      pos: { getRangeTo: (target: any) => target.id === "spawn1" ? 1 : 99 },
      store: { getUsedCapacity: () => 400 }
    } as unknown as StructureLink;
    const storage = {
      id: "storage1",
      store: { getUsedCapacity: () => 50000 }
    } as unknown as StructureStorage;
    (room as any).storage = storage;
    (room as any).energyAvailable = 300;
    (room as any).energyCapacityAvailable = 800;
    (room as any).find = (type: number, opts?: { filter?: (structure: any) => boolean }) => {
      if (type === FIND_MY_SPAWNS) return [spawn];
      if (type === FIND_MY_STRUCTURES) return opts?.filter ? [spawnLink].filter(opts.filter) : [spawnLink];
      return [];
    };
    const creep = createMockCreep("queen1", {
      room,
      memory: { role: "queenCarrier", homeRoom: room.name, working: false },
      store: {
        getUsedCapacity: () => 0,
        getFreeCapacity: () => 100,
        getCapacity: () => 100
      }
    });

    const action = evaluateEconomyBehavior({
      ...createContext("queenCarrier"),
      creep,
      room,
      memory: creep.memory as CreepContext["memory"],
      storage
    });

    expect(action.type).to.equal("withdraw");
    expect((action as Extract<CreepAction, { type: "withdraw" }>).target).to.equal(spawnLink);
  });

  it("prefers filling a nearby source link before a source container", () => {
    const room = createMockRoom("W1N1");
    const source = { id: "source1", pos: { roomName: room.name, x: 10, y: 10 } } as Source;
    const link = {
      id: "link1",
      structureType: STRUCTURE_LINK,
      store: { getFreeCapacity: () => 600 }
    } as unknown as StructureLink;
    const container = {
      id: "container1",
      structureType: STRUCTURE_CONTAINER,
      store: { getFreeCapacity: () => 1000 }
    } as unknown as StructureContainer;
    const creep = createMockCreep("harvester1", {
      room,
      memory: { role: "harvester", homeRoom: room.name, sourceId: source.id },
      store: {
        getUsedCapacity: () => 50,
        getFreeCapacity: () => 0,
        getCapacity: () => 50
      },
      pos: {
        roomName: room.name,
        isNearTo: () => true,
        findInRange: (type: number, range: number, opts?: { filter?: (structure: any) => boolean }) => {
          const structures = type === FIND_MY_STRUCTURES ? [link] : [container];
          return opts?.filter ? structures.filter(opts.filter) : structures;
        }
      }
    });
    Game.rooms[room.name] = room;
    Game.creeps[creep.name] = creep;

    const action = harvestBehavior({
      ...createContext("harvester"),
      creep,
      room,
      memory: creep.memory as CreepContext["memory"],
      assignedSource: source
    });

    expect(action.type).to.equal("transfer");
    expect((action as Extract<CreepAction, { type: "transfer" }>).target).to.equal(link);
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
