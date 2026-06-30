import { expect } from "chai";

function installScreepsConstants(): void {
  Object.assign(globalThis, {
    FIND_STRUCTURES: 107,
    FIND_MY_STRUCTURES: 108,
    FIND_MY_CONSTRUCTION_SITES: 114,
    FIND_CONSTRUCTION_SITES: 111,
    FIND_MY_SPAWNS: 112,
    FIND_SOURCES: 105,
    FIND_MINERALS: 116,
    STRUCTURE_EXTENSION: "extension",
    STRUCTURE_SPAWN: "spawn",
    STRUCTURE_ROAD: "road",
    STRUCTURE_RAMPART: "rampart",
    STRUCTURE_STORAGE: "storage",
    STRUCTURE_TERMINAL: "terminal",
    STRUCTURE_TOWER: "tower",
    STRUCTURE_LINK: "link",
    STRUCTURE_LAB: "lab",
    STRUCTURE_FACTORY: "factory",
    STRUCTURE_OBSERVER: "observer",
    STRUCTURE_NUKER: "nuker",
    STRUCTURE_POWER_SPAWN: "powerSpawn",
    STRUCTURE_EXTRACTOR: "extractor",
    TERRAIN_MASK_WALL: 1,
    OK: 0
  });

  (globalThis as any).PathFinder = {
    CostMatrix: class { public set(): void {} },
    search: () => ({ incomplete: false, path: [] })
  };
  (globalThis as any).Game = {
    time: 1,
    rooms: {},
    map: { getRoomTerrain: () => ({ get: () => 0 }) }
  };
  (globalThis as any).RoomPosition = class {
    public constructor(public x: number, public y: number, public roomName: string) {}
    public getRangeTo(target: { x: number; y: number }): number {
      return Math.max(Math.abs(this.x - target.x), Math.abs(this.y - target.y));
    }
  };
}

interface MockRoomOptions {
  rcl: number;
  storage?: { x: number; y: number };
  controller?: { x: number; y: number; my?: boolean };
  spawns?: Array<{ x: number; y: number }>;
  sources?: Array<{ id: string; x: number; y: number }>;
  walls?: Array<{ x: number; y: number }>;
  structures?: Array<{ x: number; y: number; structureType: string }>;
  sites?: Array<{ x: number; y: number; structureType: string }>;
  createConstructionSiteCalls?: Array<{ x: number; y: number; structureType: string }>;
}

function position(x: number, y: number, roomName = "W1N1") {
  return {
    x,
    y,
    roomName,
    getRangeTo(target: { pos?: { x: number; y: number }; x?: number; y?: number }) {
      const other = target.pos ?? target;
      return Math.max(Math.abs(x - Number(other.x)), Math.abs(y - Number(other.y)));
    }
  };
}

function store(used = 0, capacity = 800) {
  return {
    getUsedCapacity: () => used,
    getFreeCapacity: () => capacity - used,
    getCapacity: () => capacity
  };
}

function createRoom(options: MockRoomOptions): Room {
  const roomName = "W1N1";
  const walls = new Set((options.walls ?? []).map(pos => `${pos.x},${pos.y}`));
  const structures = [
    ...(options.structures ?? []).map((structure, index) => ({
      id: `structure-${index}`,
      pos: position(structure.x, structure.y, roomName),
      structureType: structure.structureType,
      store: store()
    }))
  ];
  const sites = (options.sites ?? []).map((site, index) => ({
    id: `site-${index}`,
    pos: position(site.x, site.y, roomName),
    structureType: site.structureType
  }));
  const spawns = (options.spawns ?? []).map((spawn, index) => ({
    id: `spawn-${index}`,
    pos: position(spawn.x, spawn.y, roomName),
    structureType: STRUCTURE_SPAWN,
    store: store(0, 300)
  }));
  const sources = (options.sources ?? []).map(source => ({
    id: source.id,
    pos: position(source.x, source.y, roomName)
  }));

  const applyFilter = <T>(items: T[], opts?: { filter?: (item: T) => boolean }) => opts?.filter ? items.filter(opts.filter) : items;

  const room = {
    name: roomName,
    controller: options.controller
      ? { id: "controller", my: options.controller.my ?? true, level: options.rcl, pos: position(options.controller.x, options.controller.y, roomName) }
      : undefined,
    storage: options.storage
      ? { id: "storage", structureType: STRUCTURE_STORAGE, pos: position(options.storage.x, options.storage.y, roomName), store: store(50000, 100000) }
      : undefined,
    getTerrain: () => ({ get: (x: number, y: number) => walls.has(`${x},${y}`) ? TERRAIN_MASK_WALL : 0 }),
    find: (constant: number, opts?: { filter?: (item: any) => boolean }) => {
      if (constant === FIND_STRUCTURES || constant === FIND_MY_STRUCTURES) return applyFilter([...structures, ...spawns, ...(room.storage ? [room.storage] : [])], opts);
      if (constant === FIND_MY_CONSTRUCTION_SITES || constant === FIND_CONSTRUCTION_SITES) return applyFilter(sites, opts);
      if (constant === FIND_MY_SPAWNS) return applyFilter(spawns, opts);
      if (constant === FIND_SOURCES) return applyFilter(sources, opts);
      if (constant === FIND_MINERALS) return [];
      return [];
    },
    createConstructionSite: (x: number, y: number, structureType: string) => {
      options.createConstructionSiteCalls?.push({ x, y, structureType });
      return OK;
    }
  } as unknown as Room;

  for (const structure of structures) {
    (structure as any).room = room;
    (structure as any).my = true;
    (structure as any).destroy = () => OK;
  }
  (globalThis as any).Game.rooms[roomName] = room;

  return room;
}

describe("link network planner", () => {
  before(installScreepsConstants);

  it("orders link candidates by score, then x, then y", async () => {
    const { selectCandidate } = await import("../src/link-network");
    const room = { getTerrain: () => ({ get: () => 0 }) } as unknown as Room;
    const blocked = new Set<string>();
    const used = new Set<string>();

    expect(selectCandidate(room, position(10, 10) as RoomPosition, 1, 1, blocked, used, position(10, 5) as RoomPosition))
      .to.deep.include({ x: 9, y: 9, score: 4 });
    expect(selectCandidate(room, position(10, 10) as RoomPosition, 1, 1, blocked, used, position(6, 10) as RoomPosition))
      .to.deep.include({ x: 9, y: 9, score: 3 });
  });

  it("plans no links before RCL 5", async () => {
    const { planLinkNetwork } = await import("../src/index.ts");
    const room = createRoom({ rcl: 4, storage: { x: 25, y: 25 }, controller: { x: 25, y: 35 }, spawns: [{ x: 20, y: 20 }], sources: [] });

    expect(planLinkNetwork(room).placements).to.deep.equal([]);
  });

  it("plans a usable source-to-controller link pair at RCL 5", async () => {
    const { planLinkNetwork } = await import("../src/index.ts");
    const room = createRoom({
      rcl: 5,
      storage: { x: 25, y: 25 },
      controller: { x: 25, y: 35 },
      spawns: [{ x: 20, y: 20 }],
      sources: [{ id: "source", x: 40, y: 40 }]
    });

    const roles = planLinkNetwork(room).placements.map(placement => placement.role);

    expect(roles).to.deep.equal(["controller", "source"]);
  });

  it("adds storage after source/controller links as RCL capacity increases", async () => {
    const { planLinkNetwork } = await import("../src/index.ts");
    const room = createRoom({
      rcl: 7,
      storage: { x: 25, y: 25 },
      controller: { x: 25, y: 35 },
      spawns: [{ x: 20, y: 20 }],
      sources: [
        { id: "near-source", x: 24, y: 24 },
        { id: "far-source", x: 40, y: 40 }
      ]
    });

    const plan = planLinkNetwork(room);

    expect(plan.placements.map(placement => placement.role)).to.deep.equal(["controller", "source", "source", "storage"]);
    expect(plan.placements.filter(placement => placement.role === "source").map(placement => placement.targetId)).to.deep.equal([
      "far-source",
      "near-source"
    ]);
  });

  it("rejects walls, borders, occupied tiles, and duplicate positions", async () => {
    const { planLinkNetwork } = await import("../src/index.ts");
    const room = createRoom({
      rcl: 8,
      storage: { x: 2, y: 2 },
      controller: { x: 2, y: 10 },
      spawns: [{ x: 10, y: 10 }],
      sources: [{ id: "source", x: 20, y: 20 }],
      walls: [{ x: 1, y: 1 }, { x: 2, y: 1 }],
      structures: [{ x: 3, y: 2, structureType: STRUCTURE_EXTENSION }],
      sites: [{ x: 2, y: 3, structureType: STRUCTURE_ROAD }]
    });

    const plan = planLinkNetwork(room);
    const keys = plan.placements.map(placement => `${placement.x},${placement.y}`);

    expect(keys).not.to.include("1,1");
    expect(keys).not.to.include("2,1");
    expect(keys).not.to.include("3,2");
    expect(keys).not.to.include("2,3");
    expect(new Set(keys).size).to.equal(keys.length);
  });

  it("places missing planned link construction sites while respecting RCL link limits", async () => {
    const { placeLinkConstructionSites } = await import("../src/index.ts");
    const calls: Array<{ x: number; y: number; structureType: string }> = [];
    const room = createRoom({
      rcl: 5,
      storage: { x: 25, y: 25 },
      controller: { x: 25, y: 35 },
      spawns: [{ x: 20, y: 20 }],
      sources: [{ id: "source", x: 40, y: 40 }],
      createConstructionSiteCalls: calls
    });

    expect(placeLinkConstructionSites(room, 3)).to.equal(2);
    expect(calls.map(call => call.structureType)).to.deep.equal([STRUCTURE_LINK, STRUCTURE_LINK]);
  });

  it("classifies exact planned source links before functional receiver fallbacks", async () => {
    const { classifyFunctionalLink, planLinkNetwork } = await import("../src/index.ts");
    const room = createRoom({
      rcl: 5,
      storage: { x: 25, y: 25 },
      controller: { x: 25, y: 35 },
      spawns: [{ x: 20, y: 20 }],
      sources: [{ id: "source", x: 26, y: 25 }]
    });
    const sourcePlacement = planLinkNetwork(room).placements.find(placement => placement.role === "source");
    expect(sourcePlacement).to.not.equal(undefined);

    const link = {
      pos: position(sourcePlacement!.x, sourcePlacement!.y),
      structureType: STRUCTURE_LINK
    } as StructureLink;

    expect(link.pos.getRangeTo(room.storage!)).to.be.lessThanOrEqual(2);
    expect(classifyFunctionalLink(room, link)).to.equal("source");
  });

  it("protects built functional links even when they are not exact planned positions", async () => {
    const { getPlannedLinkPositionKeys, getProtectedLinkPositionKeys } = await import("../src/index.ts");
    const functionalControllerLink = { x: 27, y: 35 };
    const key = `${functionalControllerLink.x},${functionalControllerLink.y}`;
    const room = createRoom({
      rcl: 5,
      storage: { x: 25, y: 25 },
      controller: { x: 25, y: 35 },
      spawns: [{ x: 20, y: 20 }],
      sources: [{ id: "source", x: 40, y: 40 }],
      structures: [{ ...functionalControllerLink, structureType: STRUCTURE_LINK }]
    });

    expect(getPlannedLinkPositionKeys(room).has(key)).to.equal(false);
    expect(getProtectedLinkPositionKeys(room).has(key)).to.equal(true);
  });

  it("does not mark planned dynamic links as misplaced blueprint cleanup targets", async () => {
    const { findMisplacedStructures, planLinkNetwork } = await import("../src/index.ts");
    const baseRoom = createRoom({
      rcl: 5,
      storage: { x: 25, y: 25 },
      controller: { x: 25, y: 35 },
      spawns: [{ x: 20, y: 20 }],
      sources: [{ id: "source", x: 40, y: 40 }]
    });
    const sourcePlacement = planLinkNetwork(baseRoom).placements.find(placement => placement.role === "source");
    expect(sourcePlacement).to.not.equal(undefined);

    const room = createRoom({
      rcl: 5,
      storage: { x: 25, y: 25 },
      controller: { x: 25, y: 35 },
      spawns: [{ x: 20, y: 20 }],
      sources: [{ id: "source", x: 40, y: 40 }],
      structures: [{ x: sourcePlacement!.x, y: sourcePlacement!.y, structureType: STRUCTURE_LINK }]
    });
    const linklessBlueprint = { name: "linkless", rcl: 5, anchor: { x: 20, y: 20 }, structures: [], roads: [], ramparts: [] };

    const misplaced = findMisplacedStructures(room, position(20, 20) as RoomPosition, linklessBlueprint);

    expect(misplaced.map(item => item.structure.structureType)).not.to.include(STRUCTURE_LINK);
  });
});
