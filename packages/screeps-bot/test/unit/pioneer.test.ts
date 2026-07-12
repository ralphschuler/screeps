import { assert } from "chai";
import { pioneer } from "@ralphschuler/screeps-roles";
import type { CreepContext } from "@ralphschuler/screeps-roles";
import type { SwarmCreepMemory } from "../../src/memory/schemas";

function createStore(used: number, free: number): Store<ResourceConstant, false> {
  return {
    getUsedCapacity: () => used,
    getFreeCapacity: () => free,
    getCapacity: () => used + free
  } as unknown as Store<ResourceConstant, false>;
}

function createCreep(roomName: string, used = 0, free = 50): Creep {
  return {
    name: "Pioneer1",
    room: { name: roomName },
    store: createStore(used, free),
    pos: { findClosestByRange: <T>(targets: T[]) => targets[0] ?? null, getRangeTo: () => 1 },
    memory: {}
  } as unknown as Creep;
}

function createRoom(name: string, controller?: StructureController, myCreeps: Creep[] = []): Room {
  return {
    name,
    controller,
    find: (type: FindConstant) => type === FIND_MY_CREEPS ? myCreeps : []
  } as unknown as Room;
}

function createController(): StructureController {
  return { id: "controller1" as Id<StructureController>, my: true, level: 1 } as unknown as StructureController;
}

function createSite(type: BuildableStructureConstant): ConstructionSite {
  return { id: `${type}Site` as Id<ConstructionSite>, structureType: type } as unknown as ConstructionSite;
}

function createHostile(parts: BodyPartConstant[]): Creep {
  return {
    body: parts.map(type => ({ type, hits: 100 })),
    pos: { x: 25, y: 25, roomName: "W2N1" }
  } as unknown as Creep;
}

function createCombatEscort(role: "guard" | "ranger" = "guard"): Creep {
  const combatPart = role === "guard" ? ATTACK : RANGED_ATTACK;
  return {
    spawning: false,
    memory: { role },
    body: [combatPart, MOVE].map(type => ({ type, hits: 100 }))
  } as unknown as Creep;
}

function createContext(options: {
  roomName?: string;
  targetRoom?: string;
  used?: number;
  free?: number;
  working?: boolean;
  sites?: ConstructionSite[];
  hostiles?: Creep[];
  myCreeps?: Creep[];
  controller?: StructureController;
} = {}): CreepContext {
  const roomName = options.roomName ?? "W2N1";
  const targetRoom = options.targetRoom ?? "W2N1";
  const creep = createCreep(roomName, options.used ?? 0, options.free ?? 50);
  const controller = options.controller ?? createController();
  const room = createRoom(roomName, controller, options.myCreeps);
  (creep as any).room = room;

  const memory: SwarmCreepMemory = {
    role: "pioneer",
    family: "economy",
    homeRoom: "W1N1",
    targetRoom,
    task: "bootstrapSpawn",
    working: options.working,
    version: 1
  };

  return {
    creep,
    room,
    memory,
    swarmState: undefined,
    squadMemory: undefined,
    homeRoom: "W1N1",
    isInHomeRoom: roomName === "W1N1",
    isFull: (options.free ?? 50) === 0,
    isEmpty: (options.used ?? 0) === 0,
    isWorking: options.working ?? false,
    assignedSource: null,
    assignedMineral: null,
    energyAvailable: true,
    nearbyEnemies: (options.hostiles ?? []).length > 0,
    constructionSiteCount: options.sites?.length ?? 0,
    damagedStructureCount: 0,
    droppedResources: [],
    containers: [],
    depositContainers: [],
    spawnStructures: [],
    towers: [],
    storage: undefined,
    terminal: undefined,
    hostiles: options.hostiles ?? [],
    damagedAllies: [],
    prioritizedSites: options.sites ?? [],
    repairTargets: [],
    labs: [],
    factory: undefined,
    tombstones: [],
    mineralContainers: []
  };
}

describe("pioneer behavior", () => {
  it("travels to its claimed target room instead of working in the parent room", () => {
    const ctx = createContext({ roomName: "W1N1", targetRoom: "W2N1" });

    const action = pioneer(ctx);

    assert.equal(action.type, "remoteMoveToRoom");
    if (action.type === "remoteMoveToRoom") {
      assert.equal(action.roomName, "W2N1");
    }
  });

  it("builds spawn construction sites before other work", () => {
    const spawnSite = createSite(STRUCTURE_SPAWN);
    const roadSite = createSite(STRUCTURE_ROAD);
    const ctx = createContext({ used: 50, free: 0, working: true, sites: [roadSite, spawnSite] });

    const action = pioneer(ctx);

    assert.equal(action.type, "build");
    if (action.type === "build") {
      assert.equal(action.target, spawnSite);
    }
  });

  it("upgrades the claimed controller when no spawn site exists", () => {
    const controller = createController();
    const ctx = createContext({ used: 50, free: 0, working: true, sites: [], controller });

    const action = pioneer(ctx);

    assert.equal(action.type, "upgrade");
    if (action.type === "upgrade") {
      assert.equal(action.target, controller);
    }
  });

  it("retreats to the parent room from dangerous hostiles in the target room", () => {
    const hostile = createHostile([ATTACK]);
    const ctx = createContext({ roomName: "W2N1", targetRoom: "W2N1", hostiles: [hostile] });

    const action = pioneer(ctx);

    assert.equal(action.type, "remoteMoveToRoom");
    if (action.type === "remoteMoveToRoom") {
      assert.equal(action.roomName, "W1N1");
    }
  });

  it("continues spawn recovery while a combat escort holds the hostile target room", () => {
    const hostile = createHostile([ATTACK]);
    const spawnSite = createSite(STRUCTURE_SPAWN);
    const ctx = createContext({
      roomName: "W2N1",
      targetRoom: "W2N1",
      used: 50,
      free: 0,
      working: true,
      hostiles: [hostile],
      myCreeps: [createCombatEscort()],
      sites: [spawnSite]
    });

    const action = pioneer(ctx);

    assert.equal(action.type, "build");
    if (action.type === "build") {
      assert.equal(action.target, spawnSite);
    }
  });

  it("retreats when the visible escort is insufficient for a coordinated attack", () => {
    const hostiles = [createHostile([ATTACK]), createHostile([ATTACK])];
    const ctx = createContext({
      roomName: "W2N1",
      targetRoom: "W2N1",
      hostiles,
      myCreeps: [createCombatEscort()]
    });

    const action = pioneer(ctx);

    assert.equal(action.type, "remoteMoveToRoom");
    if (action.type === "remoteMoveToRoom") {
      assert.equal(action.roomName, "W1N1");
    }
  });

  it("retreats from a controller attacker when no combat escort is available", () => {
    const ctx = createContext({
      roomName: "W2N1",
      targetRoom: "W2N1",
      hostiles: [createHostile([CLAIM])]
    });

    const action = pioneer(ctx);

    assert.equal(action.type, "remoteMoveToRoom");
  });
});
