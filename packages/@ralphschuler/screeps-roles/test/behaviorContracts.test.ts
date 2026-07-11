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
  remoteHauler,
  remoteWorker,
  evaluateWithStateMachine,
  TaskPriority,
  clearRoomCaches,
  createContext as createRuntimeContext,
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
    delete (Memory as Memory & { creepTaskBoard?: unknown }).creepTaskBoard;
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
    };
  }

  function makeEnergyStore(used: number, capacity: number): Store<RESOURCE_ENERGY, false> {
    return {
      [RESOURCE_ENERGY]: used,
      getUsedCapacity: (resource?: ResourceConstant) => resource === undefined || resource === RESOURCE_ENERGY ? used : 0,
      getFreeCapacity: (resource?: ResourceConstant) => resource === undefined || resource === RESOURCE_ENERGY ? Math.max(0, capacity - used) : 0,
      getCapacity: () => capacity
    } as unknown as Store<RESOURCE_ENERGY, false>;
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

  it("prioritizes recovery-critical tower and storage construction before extension backlog", () => {
    const room = createMockRoom("W1N1", {
      controller: { my: true, level: 5 }
    });
    const sites = [
      { id: "extension-site", structureType: STRUCTURE_EXTENSION, pos: new RoomPosition(24, 25, room.name) },
      { id: "road-site", structureType: STRUCTURE_ROAD, pos: new RoomPosition(23, 25, room.name) },
      { id: "storage-site", structureType: STRUCTURE_STORAGE, pos: new RoomPosition(25, 25, room.name) },
      { id: "wall-site", structureType: STRUCTURE_WALL, pos: new RoomPosition(26, 25, room.name) },
      { id: "tower-site", structureType: STRUCTURE_TOWER, pos: new RoomPosition(25, 24, room.name) }
    ] as unknown as ConstructionSite[];
    (room as unknown as { find: Room["find"] }).find = ((type: FindConstant) => {
      if (type === FIND_MY_CONSTRUCTION_SITES) return sites;
      return [];
    }) as Room["find"];
    const creep = createMockCreep("builder1", {
      room,
      memory: { role: "builder", homeRoom: room.name, working: true },
      store: makeEnergyStore(50, 50),
      pos: {
        findClosestByRange: (candidateSites: ConstructionSite[]) => candidateSites[0] ?? null
      }
    });

    Game.rooms[room.name] = room;
    Game.creeps[creep.name] = creep;
    clearRoomCaches();

    const ctx = createRuntimeContext(creep);

    expect(ctx.prioritizedSites.map(site => site.structureType)).to.deep.equal([
      STRUCTURE_TOWER,
      STRUCTURE_STORAGE,
      STRUCTURE_EXTENSION,
      STRUCTURE_WALL,
      STRUCTURE_ROAD
    ]);

    const action = buildBehavior(ctx);

    expect(action.type).to.equal("build");
    expect(action.target).to.equal(ctx.prioritizedSites[0]);
  });

  it("uses bootstrap extensions before recovery storage while spawn capacity is still minimal", () => {
    const room = createMockRoom("W1N1", {
      controller: { my: true, level: 5 }
    });
    const sites = [
      { id: "extension-site", structureType: STRUCTURE_EXTENSION, pos: new RoomPosition(24, 25, room.name) },
      { id: "second-tower-site", structureType: STRUCTURE_TOWER, pos: new RoomPosition(25, 24, room.name) },
      { id: "storage-site", structureType: STRUCTURE_STORAGE, pos: new RoomPosition(25, 25, room.name) }
    ] as unknown as ConstructionSite[];
    const builtTower = {
      id: "built-tower",
      structureType: STRUCTURE_TOWER,
      store: makeEnergyStore(1000, 1000)
    } as StructureTower;
    (room as unknown as { find: Room["find"] }).find = ((type: FindConstant) => {
      if (type === FIND_MY_CONSTRUCTION_SITES) return sites;
      if (type === FIND_MY_STRUCTURES) return [builtTower];
      return [];
    }) as Room["find"];
    const creep = createMockCreep("builder1", {
      room,
      memory: { role: "builder", homeRoom: room.name, working: true },
      store: makeEnergyStore(50, 50),
      pos: {
        findClosestByRange: (candidateSites: ConstructionSite[]) => candidateSites[0] ?? null
      }
    });

    Game.rooms[room.name] = room;
    Game.creeps[creep.name] = creep;
    clearRoomCaches();

    const ctx = createRuntimeContext(creep);

    expect(ctx.prioritizedSites.map(site => site.structureType)).to.deep.equal([
      STRUCTURE_EXTENSION,
      STRUCTURE_STORAGE,
      STRUCTURE_TOWER
    ]);

    const action = buildBehavior(ctx);

    expect(action.type).to.equal("build");
    expect(action.target).to.equal(ctx.prioritizedSites[0]);
  });

  it("promotes missing recovery storage before an extra tower after tower coverage exists", () => {
    const room = createMockRoom("W1N1", {
      controller: { my: true, level: 5 }
    });
    (room as unknown as { energyCapacityAvailable: number }).energyCapacityAvailable = 650;
    const sites = [
      { id: "extension-site", structureType: STRUCTURE_EXTENSION, pos: new RoomPosition(24, 25, room.name) },
      { id: "second-tower-site", structureType: STRUCTURE_TOWER, pos: new RoomPosition(25, 24, room.name) },
      { id: "storage-site", structureType: STRUCTURE_STORAGE, pos: new RoomPosition(25, 25, room.name) }
    ] as unknown as ConstructionSite[];
    const builtTower = {
      id: "built-tower",
      structureType: STRUCTURE_TOWER,
      store: makeEnergyStore(1000, 1000)
    } as StructureTower;
    (room as unknown as { find: Room["find"] }).find = ((type: FindConstant) => {
      if (type === FIND_MY_CONSTRUCTION_SITES) return sites;
      if (type === FIND_MY_STRUCTURES) return [builtTower];
      return [];
    }) as Room["find"];
    const creep = createMockCreep("builder1", {
      room,
      memory: { role: "builder", homeRoom: room.name, working: true },
      store: makeEnergyStore(50, 50),
      pos: {
        findClosestByRange: (candidateSites: ConstructionSite[]) => candidateSites[0] ?? null
      }
    });

    Game.rooms[room.name] = room;
    Game.creeps[creep.name] = creep;
    clearRoomCaches();

    const ctx = createRuntimeContext(creep);

    expect(ctx.prioritizedSites.map(site => site.structureType)).to.deep.equal([
      STRUCTURE_STORAGE,
      STRUCTURE_TOWER,
      STRUCTURE_EXTENSION
    ]);

    const action = buildBehavior(ctx);

    expect(action.type).to.equal("build");
    expect(action.target).to.equal(ctx.prioritizedSites[0]);
  });

  it("derives source-adjacent containers from cached visible sources and structures", () => {
    const room = createMockRoom("W1N1");
    const sourceContainer = {
      id: "source-container" as Id<StructureContainer>,
      structureType: STRUCTURE_CONTAINER,
      pos: { x: 20, y: 20, roomName: room.name },
      store: makeEnergyStore(500, 2000)
    } as unknown as StructureContainer;
    const genericContainer = {
      id: "generic-container" as Id<StructureContainer>,
      structureType: STRUCTURE_CONTAINER,
      pos: { x: 10, y: 10, roomName: room.name },
      store: makeEnergyStore(500, 2000)
    } as unknown as StructureContainer;
    const source = {
      id: "source1" as Id<Source>,
      pos: {
        getRangeTo: (target: RoomPosition) => target === sourceContainer.pos ? 2 : 8
      }
    } as unknown as Source;
    const findCounts = new Map<FindConstant, number>();
    (room as unknown as { find: Room["find"] }).find = ((type: FindConstant) => {
      findCounts.set(type, (findCounts.get(type) ?? 0) + 1);
      if (type === FIND_SOURCES) return [source];
      if (type === FIND_STRUCTURES) return [genericContainer, sourceContainer];
      return [];
    }) as Room["find"];
    const creep = createMockCreep("hauler1", {
      room,
      memory: { role: "hauler", homeRoom: room.name, working: false }
    });

    Game.rooms[room.name] = room;
    Game.creeps[creep.name] = creep;
    clearRoomCaches();

    const ctx = createRuntimeContext(creep);

    expect(ctx.sourceContainers).to.deep.equal([sourceContainer]);
    expect(ctx.sourceContainers).to.deep.equal([sourceContainer]);
    expect(findCounts.get(FIND_SOURCES)).to.equal(1);
    expect(findCounts.get(FIND_STRUCTURES)).to.equal(1);
  });

  it("reuses cached structures for regular and mineral containers", () => {
    const room = createMockRoom("W1N1");
    const energyContainer = {
      id: "energy-container" as Id<StructureContainer>,
      structureType: STRUCTURE_CONTAINER,
      pos: { x: 10, y: 10, roomName: room.name },
      store: makeEnergyStore(500, 2000)
    } as unknown as StructureContainer;
    const mineralContainer = {
      id: "mineral-container" as Id<StructureContainer>,
      structureType: STRUCTURE_CONTAINER,
      pos: { x: 20, y: 20, roomName: room.name },
      store: {
        [RESOURCE_ENERGY]: 0,
        [RESOURCE_HYDROGEN]: 100,
        getUsedCapacity: (resource?: ResourceConstant) => {
          if (resource === undefined) return 100;
          if (resource === RESOURCE_HYDROGEN) return 100;
          return 0;
        },
        getFreeCapacity: () => 1900,
        getCapacity: () => 2000
      }
    } as unknown as StructureContainer;
    const road = {
      id: "road" as Id<StructureRoad>,
      structureType: STRUCTURE_ROAD,
      pos: { x: 15, y: 15, roomName: room.name }
    } as unknown as StructureRoad;
    const structures = [energyContainer, mineralContainer, road] as Structure[];
    const findCounts = new Map<FindConstant, number>();
    (room as unknown as { find: Room["find"] }).find = ((type: FindConstant, opts?: { filter?: (structure: Structure) => boolean }) => {
      findCounts.set(type, (findCounts.get(type) ?? 0) + 1);
      if (type !== FIND_STRUCTURES) return [];
      return opts?.filter ? structures.filter(opts.filter) : structures;
    }) as Room["find"];
    const creep = createMockCreep("hauler1", {
      room,
      memory: { role: "hauler", homeRoom: room.name, working: false }
    });

    Game.rooms[room.name] = room;
    Game.creeps[creep.name] = creep;
    clearRoomCaches();

    const ctx = createRuntimeContext(creep);

    expect(ctx.containers).to.deep.equal([energyContainer, mineralContainer]);
    expect(ctx.mineralContainers).to.deep.equal([mineralContainer]);
    expect(ctx.mineralContainers).to.deep.equal([mineralContainer]);
    expect(findCounts.get(FIND_STRUCTURES)).to.equal(1);

    findCounts.clear();
    clearRoomCaches();
    const mineralFirstContext = createRuntimeContext(creep);

    expect(mineralFirstContext.mineralContainers).to.deep.equal([mineralContainer]);
    expect(mineralFirstContext.containers).to.deep.equal([energyContainer, mineralContainer]);
    expect(findCounts.get(FIND_STRUCTURES)).to.equal(1);
  });

  it("keeps builder, upgrader, and hauler critical energy delivery priority aligned", () => {
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
      ["upgrader", upgradeBehavior],
      ["hauler", haulBehavior]
    ];

    for (const [role, behavior] of behaviors) {
      const ctx = createContext(role);
      ctx.memory.working = true;
      (ctx.creep as unknown as { store: Creep["store"] }).store = makeEnergyStore(50, 50) as Creep["store"];
      ctx.spawnStructures = [fullSpawn, extension];

      const action = behavior(ctx);

      expect(action.type).to.equal("transfer");
      expect((action as Extract<CreepAction, { type: "transfer" }>).target).to.equal(extension);
    }
  });

  it("returns a displaced local hauler to its home room before foreign-room logistics", () => {
    const ctx = createContext("hauler");
    const foreignRoom = createMockRoom("W1N2");
    const foreignContainer = {
      id: "foreign-container" as Id<StructureContainer>,
      structureType: STRUCTURE_CONTAINER,
      store: makeEnergyStore(1000, 2000)
    } as StructureContainer;
    ctx.room = foreignRoom;
    ctx.creep.room = foreignRoom;
    ctx.isInHomeRoom = false;
    ctx.containers = [foreignContainer];

    const action = evaluateWithStateMachine(ctx, evaluateEconomyBehavior);

    expect(action).to.deep.equal({
      type: "remoteMoveToRoom",
      roomName: ctx.homeRoom,
      routeType: "hauler"
    });
    expect(ctx.memory.state).to.include({
      action: "remoteMoveToRoom",
      targetRoom: ctx.homeRoom
    });
  });

  it("keeps hauler critical delivery ordering at spawn, extension, then tower before storage", () => {
    const ctx = createContext("hauler");
    ctx.memory.working = true;
    (ctx.creep as unknown as { store: Creep["store"] }).store = makeEnergyStore(50, 50) as Creep["store"];
    const spawn = {
      id: "spawn-needs-energy",
      structureType: STRUCTURE_SPAWN,
      store: { getFreeCapacity: () => 0 }
    } as unknown as StructureSpawn;
    const extension = {
      id: "extension-needs-energy",
      structureType: STRUCTURE_EXTENSION,
      store: { getFreeCapacity: () => 0 }
    } as unknown as StructureExtension;
    const tower = {
      id: "tower-needs-energy",
      structureType: STRUCTURE_TOWER,
      store: { getFreeCapacity: () => 0 }
    } as unknown as StructureTower;
    const storage = {
      id: "storage-fallback",
      store: { getFreeCapacity: () => 1000 }
    } as unknown as StructureStorage;
    ctx.spawnStructures = [spawn, extension];
    ctx.towers = [tower];
    ctx.storage = storage;

    (spawn.store as unknown as { getFreeCapacity: () => number }).getFreeCapacity = () => 300;
    expect((haulBehavior(ctx) as Extract<CreepAction, { type: "transfer" }>).target).to.equal(spawn);

    (spawn.store as unknown as { getFreeCapacity: () => number }).getFreeCapacity = () => 0;
    (extension.store as unknown as { getFreeCapacity: () => number }).getFreeCapacity = () => 50;
    expect((haulBehavior(ctx) as Extract<CreepAction, { type: "transfer" }>).target).to.equal(extension);

    (extension.store as unknown as { getFreeCapacity: () => number }).getFreeCapacity = () => 0;
    (tower.store as unknown as { getFreeCapacity: () => number }).getFreeCapacity = () => 100;
    expect((haulBehavior(ctx) as Extract<CreepAction, { type: "transfer" }>).target).to.equal(tower);

    (tower.store as unknown as { getFreeCapacity: () => number }).getFreeCapacity = () => 0;
    expect((haulBehavior(ctx) as Extract<CreepAction, { type: "transfer" }>).target).to.equal(storage);
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

  it("prioritizes source-adjacent container energy for defenseRefuel haulers before closer generic containers", () => {
    const ctx = createContext("hauler");
    ctx.memory.task = "defenseRefuel";

    const dropped = {
      id: "drop1",
      resourceType: RESOURCE_ENERGY,
      amount: 500,
      pos: new RoomPosition(24, 25, ctx.room.name)
    } as Resource<RESOURCE_ENERGY>;
    const closerGenericContainer = {
      id: "genericContainer1" as Id<StructureContainer>,
      structureType: STRUCTURE_CONTAINER,
      pos: new RoomPosition(24, 25, ctx.room.name),
      store: makeEnergyStore(500, 2000)
    } as unknown as StructureContainer;
    const fartherSourceContainer = {
      id: "sourceContainer1" as Id<StructureContainer>,
      structureType: STRUCTURE_CONTAINER,
      pos: new RoomPosition(20, 20, ctx.room.name),
      store: makeEnergyStore(500, 2000)
    } as unknown as StructureContainer;

    const action = evaluateEconomyBehavior({
      ...ctx,
      droppedResources: [dropped],
      containers: [closerGenericContainer, fartherSourceContainer],
      sourceContainers: [fartherSourceContainer]
    });

    expect(action.type).to.equal("withdraw");
    expect((action as Extract<CreepAction, { type: "withdraw" }>).target).to.equal(fartherSourceContainer);
    expect((action as Extract<CreepAction, { type: "withdraw" }>).resourceType).to.equal(RESOURCE_ENERGY);
  });

  it("fills spawn and extension targets before task-board tower work for defenseRefuel haulers", () => {
    const room = createMockRoom("W1N1");
    const extension = {
      id: "extension1",
      structureType: STRUCTURE_EXTENSION,
      pos: new RoomPosition(24, 25, room.name),
      store: makeEnergyStore(0, 50)
    } as unknown as StructureExtension;
    const tower = {
      id: "tower1",
      structureType: STRUCTURE_TOWER,
      pos: new RoomPosition(25, 25, room.name),
      store: makeEnergyStore(200, 1000)
    } as unknown as StructureTower;
    const storage = {
      id: "storage1",
      store: makeEnergyStore(0, 100000)
    } as unknown as StructureStorage;
    const creep = createMockCreep("hauler1", {
      room,
      memory: { role: "hauler", homeRoom: room.name, task: "defenseRefuel", working: true },
      store: makeEnergyStore(50, 50)
    });

    Game.rooms[room.name] = room;
    Game.creeps[creep.name] = creep;
    (Game as unknown as { getObjectById: (id: string) => unknown }).getObjectById = id => id === "tower1" ? tower : null;
    (Memory as Memory & { creepTaskBoard?: unknown }).creepTaskBoard = {
      enabled: true,
      rooms: {
        [room.name]: {
          roomName: room.name,
          lastGeneratedTick: Game.time,
          lastCleanedTick: 0,
          stats: { generated: 0, assigned: 0, completed: 0, invalidated: 0, staleReservations: 0, preemptions: 0 },
          tasks: {
            "W1N1:refillTower:tower1": {
              id: "W1N1:refillTower:tower1",
              roomName: room.name,
              type: "refillTower",
              priority: 100,
              status: "open",
              targetId: "tower1" as Id<StructureTower>,
              targetPos: { x: 25, y: 25, roomName: room.name },
              resourceType: RESOURCE_ENERGY,
              amount: 800,
              reservedAmount: 0,
              maxAssignments: 1,
              assignedCreeps: [],
              reservations: {},
              allowedRoles: ["hauler"],
              createdTick: Game.time,
              updatedTick: Game.time,
              expiresTick: Game.time + 50
            }
          }
        }
      }
    };

    const action = evaluateEconomyBehavior({
      ...createContext("hauler"),
      creep,
      room,
      memory: creep.memory as CreepContext["memory"],
      isEmpty: false,
      isFull: true,
      isWorking: true,
      spawnStructures: [extension],
      towers: [tower],
      storage
    });

    expect(action.type).to.equal("transfer");
    expect((action as Extract<CreepAction, { type: "transfer" }>).target).to.equal(extension);
  });

  it("does not duplicate a reserved spawn or extension refill task for defenseRefuel haulers", () => {
    const room = createMockRoom("W1N1");
    const extension = {
      id: "extension1",
      structureType: STRUCTURE_EXTENSION,
      pos: new RoomPosition(24, 25, room.name),
      store: makeEnergyStore(0, 50)
    } as unknown as StructureExtension;
    const storage = {
      id: "storage1",
      store: makeEnergyStore(0, 100000)
    } as unknown as StructureStorage;
    const creep = createMockCreep("hauler1", {
      room,
      memory: { role: "hauler", homeRoom: room.name, task: "defenseRefuel", working: true },
      store: makeEnergyStore(50, 50)
    });
    const otherHauler = createMockCreep("otherHauler", {
      room,
      memory: { role: "hauler", homeRoom: room.name, working: true },
      store: makeEnergyStore(50, 50)
    });

    Game.rooms[room.name] = room;
    Game.creeps[creep.name] = creep;
    Game.creeps[otherHauler.name] = otherHauler;
    (Game as unknown as { getObjectById: (id: string) => unknown }).getObjectById = id => id === "extension1" ? extension : null;
    (Memory as Memory & { creepTaskBoard?: unknown }).creepTaskBoard = {
      enabled: true,
      rooms: {
        [room.name]: {
          roomName: room.name,
          lastGeneratedTick: Game.time,
          lastCleanedTick: 0,
          stats: { generated: 0, assigned: 0, completed: 0, invalidated: 0, staleReservations: 0, preemptions: 0 },
          tasks: {
            "W1N1:refillExtension:extension1": {
              id: "W1N1:refillExtension:extension1",
              roomName: room.name,
              type: "refillExtension",
              priority: 100,
              status: "assigned",
              targetId: "extension1" as Id<StructureExtension>,
              targetPos: { x: 24, y: 25, roomName: room.name },
              resourceType: RESOURCE_ENERGY,
              amount: 50,
              reservedAmount: 50,
              maxAssignments: 1,
              assignedCreeps: [otherHauler.name],
              reservations: {
                [otherHauler.name]: {
                  creepName: otherHauler.name,
                  amount: 50,
                  assignedTick: Game.time,
                  expiresTick: Game.time + 10
                }
              },
              allowedRoles: ["hauler"],
              createdTick: Game.time,
              updatedTick: Game.time,
              expiresTick: Game.time + 50
            }
          }
        }
      }
    };

    const action = evaluateEconomyBehavior({
      ...createContext("hauler"),
      creep,
      room,
      memory: creep.memory as CreepContext["memory"],
      isEmpty: false,
      isFull: true,
      isWorking: true,
      spawnStructures: [extension],
      storage
    });

    expect(action.type).to.equal("transfer");
    expect((action as Extract<CreepAction, { type: "transfer" }>).target).to.equal(storage);
  });

  it("falls back to normal hauler energy collection when defenseRefuel has no usable source-container energy", () => {
    const lowEnergySourceContainer = {
      id: "sourceContainer1" as Id<StructureContainer>,
      structureType: STRUCTURE_CONTAINER,
      pos: new RoomPosition(20, 20, "W1N1"),
      store: makeEnergyStore(100, 2000)
    } as unknown as StructureContainer;
    const storage = {
      id: "storage1",
      store: makeEnergyStore(1000, 100000)
    } as unknown as StructureStorage;
    const ctx = createContext("hauler");
    ctx.memory.task = "defenseRefuel";

    const action = evaluateEconomyBehavior({
      ...ctx,
      sourceContainers: [lowEnergySourceContainer],
      containers: [lowEnergySourceContainer],
      storage
    });

    expect(action.type).to.equal("withdraw");
    expect((action as Extract<CreepAction, { type: "withdraw" }>).target).to.equal(storage);
    expect((action as Extract<CreepAction, { type: "withdraw" }>).resourceType).to.equal(RESOURCE_ENERGY);
  });

  it("withdraws bounded terminal energy for an emergency defenseRefuel hauler when source containers are empty", () => {
    const terminal = {
      id: "terminal1",
      cooldown: 0,
      store: makeEnergyStore(10_000, 0)
    } as unknown as StructureTerminal;
    const ctx = createContext("hauler");
    ctx.memory.task = "defenseRefuel";

    const action = evaluateEconomyBehavior({
      ...ctx,
      sourceContainers: [],
      containers: [],
      terminal
    });

    expect(action.type).to.equal("withdraw");
    expect((action as Extract<CreepAction, { type: "withdraw" }>).target).to.equal(terminal);
    expect((action as Extract<CreepAction, { type: "withdraw" }>).resourceType).to.equal(RESOURCE_ENERGY);
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

  it("preserves low mature storage reserves for builders by harvesting instead", () => {
    const ctx = createContext("builder");
    const roomName = `W9N${Game.time}`;
    (ctx.room as unknown as { name: string }).name = roomName;
    (ctx.creep.pos as unknown as { roomName: string }).roomName = roomName;
    ctx.homeRoom = roomName;
    ctx.memory.homeRoom = roomName;

    const storage = {
      id: "storage1",
      pos: { x: 20, y: 20, roomName },
      store: makeEnergyStore(1000, 1000000)
    } as unknown as StructureStorage;
    const source = {
      id: "source1" as Id<Source>,
      energy: 3000,
      pos: { x: 10, y: 10, roomName }
    } as unknown as Source;
    Game.rooms[roomName] = ctx.room;
    ctx.room.controller = { my: true, level: 6 } as StructureController;
    ctx.room.storage = storage;
    ctx.storage = storage;
    (ctx.room as unknown as { find: (type: FindConstant) => unknown[] }).find = type => type === FIND_SOURCES ? [source] : [];
    clearRoomCaches();

    const action = evaluateEconomyBehavior(ctx);

    expect(action.type).to.equal("harvest");
    expect((action as Extract<CreepAction, { type: "harvest" }>).target).to.equal(source);
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

  it("remoteHauler unloads partial cargo to home storage before returning remote", () => {
    const homeRoom = createMockRoom("W1N1");
    const storage = {
      id: "home-storage" as Id<StructureStorage>,
      structureType: STRUCTURE_STORAGE,
      pos: new RoomPosition(25, 25, "W1N1"),
      room: homeRoom,
      store: { getUsedCapacity: () => 0, getFreeCapacity: () => 1000 }
    } as unknown as StructureStorage;
    const creep = createMockCreep("remoteHauler1", {
      room: homeRoom,
      memory: { role: "remoteHauler", homeRoom: "W1N1", targetRoom: "W2N1", working: false },
      store: makeEnergyStore(25, 100)
    });

    const action = remoteHauler({
      ...createContext("remoteHauler"),
      creep,
      room: homeRoom,
      memory: creep.memory as CreepContext["memory"],
      homeRoom: "W1N1",
      isInHomeRoom: true,
      isFull: false,
      isEmpty: false,
      storage,
      hostiles: []
    });

    expect(action.type).to.equal("transfer");
    expect((action as Extract<CreepAction, { type: "transfer" }>).target).to.equal(storage);
    expect((action as Extract<CreepAction, { type: "transfer" }>).resourceType).to.equal(RESOURCE_ENERGY);
  });

  it("remoteHauler unloads partial cargo to home deposit containers when storage is unavailable", () => {
    const homeRoom = createMockRoom("W1N1");
    const container = {
      id: "home-container" as Id<StructureContainer>,
      structureType: STRUCTURE_CONTAINER,
      pos: new RoomPosition(24, 25, "W1N1"),
      room: homeRoom,
      store: { getUsedCapacity: () => 0, getFreeCapacity: () => 1500 }
    } as unknown as StructureContainer;
    const creep = createMockCreep("remoteHauler2", {
      room: homeRoom,
      memory: { role: "remoteHauler", homeRoom: "W1N1", targetRoom: "W2N1", working: false },
      store: makeEnergyStore(25, 100)
    });

    const action = remoteHauler({
      ...createContext("remoteHauler"),
      creep,
      room: homeRoom,
      memory: creep.memory as CreepContext["memory"],
      homeRoom: "W1N1",
      isInHomeRoom: true,
      isFull: false,
      isEmpty: false,
      depositContainers: [container],
      hostiles: []
    });

    expect(action.type).to.equal("transfer");
    expect((action as Extract<CreepAction, { type: "transfer" }>).target).to.equal(container);
    expect((action as Extract<CreepAction, { type: "transfer" }>).resourceType).to.equal(RESOURCE_ENERGY);
  });

  it("remoteHauler unloads non-energy cargo to home storage", () => {
    const homeRoom = createMockRoom("W1N1");
    const storage = {
      id: "home-storage" as Id<StructureStorage>,
      structureType: STRUCTURE_STORAGE,
      pos: new RoomPosition(25, 25, "W1N1"),
      room: homeRoom,
      store: { getUsedCapacity: () => 0, getFreeCapacity: () => 1000 }
    } as unknown as StructureStorage;
    const creep = createMockCreep("remoteHauler3", {
      room: homeRoom,
      memory: { role: "remoteHauler", homeRoom: "W1N1", targetRoom: "W2N1", working: false },
      store: {
        [RESOURCE_HYDROGEN]: 25,
        getUsedCapacity: (resource?: ResourceConstant) => resource === undefined || resource === RESOURCE_HYDROGEN ? 25 : 0,
        getFreeCapacity: (resource?: ResourceConstant) => resource === undefined || resource === RESOURCE_HYDROGEN ? 75 : 0,
        getCapacity: () => 100
      } as unknown as Store<ResourceConstant, false>
    });

    const action = remoteHauler({
      ...createContext("remoteHauler"),
      creep,
      room: homeRoom,
      memory: creep.memory as CreepContext["memory"],
      homeRoom: "W1N1",
      isInHomeRoom: true,
      isFull: false,
      isEmpty: false,
      storage,
      hostiles: []
    });

    expect(action.type).to.equal("transfer");
    expect((action as Extract<CreepAction, { type: "transfer" }>).target).to.equal(storage);
    expect((action as Extract<CreepAction, { type: "transfer" }>).resourceType).to.equal(RESOURCE_HYDROGEN);
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

  it("preserves task-board transfer amounts and refreshes the reservation during stateful delivery", () => {
    const room = createMockRoom("W1N1");
    const extension = {
      id: "extension1" as Id<StructureExtension>,
      structureType: STRUCTURE_EXTENSION,
      pos: new RoomPosition(10, 10, room.name),
      room,
      store: { getFreeCapacity: () => 50 }
    } as unknown as StructureExtension;
    const taskId = `${room.name}:refillExtension:${extension.id}`;
    const creep = createMockCreep("hauler1", {
      room,
      pos: new RoomPosition(25, 25, room.name),
      memory: {
        role: "hauler",
        homeRoom: room.name,
        assignedTaskId: taskId,
        working: true
      },
      store: makeEnergyStore(200, 200)
    });
    Game.rooms[room.name] = room;
    Game.creeps[creep.name] = creep;
    (Game as unknown as { getObjectById: (id: string) => unknown }).getObjectById = id =>
      id === extension.id ? extension : null;
    (Memory as any).creepTaskBoard = {
      enabled: true,
      rooms: {
        [room.name]: {
          roomName: room.name,
          tasks: {
            [taskId]: {
              id: taskId,
              roomName: room.name,
              type: "refillExtension",
              priority: TaskPriority.HIGH,
              targetId: extension.id,
              targetPos: { x: 10, y: 10, roomName: room.name },
              resourceType: RESOURCE_ENERGY,
              amount: 50,
              reservedAmount: 50,
              maxAssignments: 1,
              allowedRoles: ["hauler"],
              status: "assigned",
              assignedCreeps: [creep.name],
              reservations: {
                [creep.name]: {
                  creepName: creep.name,
                  amount: 50,
                  assignedTick: Game.time,
                  expiresTick: Game.time
                }
              },
              createdTick: Game.time,
              updatedTick: Game.time,
              expiresTick: Game.time + 50
            }
          },
          lastGeneratedTick: Game.time,
          lastCleanedTick: Game.time,
          stats: { generated: 0, assigned: 1, completed: 0, invalidated: 0, staleReservations: 0, preemptions: 0 }
        }
      }
    };

    const ctx = {
      ...createContext("hauler"),
      creep,
      room,
      memory: creep.memory as CreepContext["memory"],
      isEmpty: false,
      isWorking: true
    };

    const firstAction = evaluateWithStateMachine(ctx, () => ({
      type: "transfer",
      target: extension,
      resourceType: RESOURCE_ENERGY,
      amount: 50
    }));
    expect((firstAction as Extract<CreepAction, { type: "transfer" }>).amount).to.equal(50);
    expect(creep.memory.state?.data).to.deep.include({ resourceType: RESOURCE_ENERGY, amount: 50 });

    Game.time++;
    const continuedAction = evaluateWithStateMachine(ctx, () => ({ type: "idle" }));

    expect(continuedAction.type).to.equal("transfer");
    expect((continuedAction as Extract<CreepAction, { type: "transfer" }>).amount).to.equal(50);
    const reservation = (Memory as any).creepTaskBoard.rooms[room.name].tasks[taskId].reservations[creep.name];
    expect(reservation.expiresTick).to.equal(Game.time + 15);
  });

  it("hydrates legacy task-board transfer state amounts from the active reservation", () => {
    const room = createMockRoom("W1N1");
    const extension = {
      id: "extension1" as Id<StructureExtension>,
      structureType: STRUCTURE_EXTENSION,
      pos: new RoomPosition(10, 10, room.name),
      room,
      store: { getFreeCapacity: () => 50 }
    } as unknown as StructureExtension;
    const taskId = `${room.name}:refillExtension:${extension.id}`;
    const creep = createMockCreep("hauler1", {
      room,
      memory: {
        role: "hauler",
        homeRoom: room.name,
        assignedTaskId: taskId,
        working: true,
        state: {
          action: "transfer",
          targetId: extension.id,
          startTick: Game.time,
          timeout: 25,
          data: { resourceType: RESOURCE_ENERGY }
        }
      },
      store: makeEnergyStore(200, 200)
    });
    Game.rooms[room.name] = room;
    Game.creeps[creep.name] = creep;
    (Game as unknown as { getObjectById: (id: string) => unknown }).getObjectById = id =>
      id === extension.id ? extension : null;
    (Memory as any).creepTaskBoard = {
      enabled: true,
      rooms: {
        [room.name]: {
          roomName: room.name,
          tasks: {
            [taskId]: {
              id: taskId,
              roomName: room.name,
              type: "refillExtension",
              priority: TaskPriority.HIGH,
              targetId: extension.id,
              targetPos: { x: 10, y: 10, roomName: room.name },
              resourceType: RESOURCE_ENERGY,
              amount: 50,
              reservedAmount: 50,
              maxAssignments: 1,
              allowedRoles: ["hauler"],
              status: "assigned",
              assignedCreeps: [creep.name],
              reservations: {
                [creep.name]: {
                  creepName: creep.name,
                  amount: 50,
                  assignedTick: Game.time,
                  expiresTick: Game.time
                }
              },
              createdTick: Game.time,
              updatedTick: Game.time,
              expiresTick: Game.time + 50
            }
          },
          lastGeneratedTick: Game.time,
          lastCleanedTick: Game.time,
          stats: { generated: 0, assigned: 1, completed: 0, invalidated: 0, staleReservations: 0, preemptions: 0 }
        }
      }
    };

    Game.time++;
    const action = evaluateWithStateMachine({
      ...createContext("hauler"),
      creep,
      room,
      memory: creep.memory as CreepContext["memory"],
      isEmpty: false,
      isWorking: true
    }, () => ({ type: "idle" }));

    expect(action.type).to.equal("transfer");
    expect((action as Extract<CreepAction, { type: "transfer" }>).amount).to.equal(50);
    const reservation = (Memory as any).creepTaskBoard.rooms[room.name].tasks[taskId].reservations[creep.name];
    expect(reservation.expiresTick).to.equal(Game.time + 15);
  });

  it("clears stale task-board delivery state when its reservation no longer exists", () => {
    const room = createMockRoom("W1N1");
    const extension = {
      id: "extension1" as Id<StructureExtension>,
      structureType: STRUCTURE_EXTENSION,
      pos: new RoomPosition(10, 10, room.name),
      room,
      store: { getFreeCapacity: () => 50 }
    } as unknown as StructureExtension;
    const taskId = `${room.name}:refillExtension:${extension.id}`;
    const creep = createMockCreep("hauler1", {
      room,
      memory: {
        role: "hauler",
        homeRoom: room.name,
        assignedTaskId: taskId,
        working: true,
        state: {
          action: "transfer",
          targetId: extension.id,
          startTick: Game.time,
          timeout: 25,
          data: { resourceType: RESOURCE_ENERGY, amount: 50 }
        }
      },
      store: makeEnergyStore(200, 200)
    });
    Game.rooms[room.name] = room;
    Game.creeps[creep.name] = creep;
    (Game as unknown as { getObjectById: (id: string) => unknown }).getObjectById = id =>
      id === extension.id ? extension : null;
    (Memory as any).creepTaskBoard = {
      enabled: true,
      rooms: {
        [room.name]: {
          roomName: room.name,
          tasks: {
            [taskId]: {
              id: taskId,
              roomName: room.name,
              type: "refillExtension",
              priority: TaskPriority.HIGH,
              targetId: extension.id,
              targetPos: { x: 10, y: 10, roomName: room.name },
              resourceType: RESOURCE_ENERGY,
              amount: 50,
              reservedAmount: 0,
              maxAssignments: 1,
              allowedRoles: ["hauler"],
              status: "open",
              assignedCreeps: [],
              reservations: {},
              createdTick: Game.time,
              updatedTick: Game.time,
              expiresTick: Game.time + 50
            }
          },
          lastGeneratedTick: Game.time,
          lastCleanedTick: Game.time,
          stats: { generated: 0, assigned: 1, completed: 0, invalidated: 0, staleReservations: 0, preemptions: 0 }
        }
      }
    };

    const action = evaluateWithStateMachine({
      ...createContext("hauler"),
      creep,
      room,
      memory: creep.memory as CreepContext["memory"],
      isEmpty: false,
      isWorking: true
    }, () => ({ type: "idle" }));

    expect(action.type).to.equal("idle");
    expect(creep.memory.state).to.equal(undefined);
    expect((creep.memory as { assignedTaskId?: string }).assignedTaskId).to.equal(undefined);
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
      store: { getUsedCapacity: () => 50000, getFreeCapacity: () => 950000 }
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
