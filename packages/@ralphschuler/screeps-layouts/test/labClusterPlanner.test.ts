import { expect } from "chai";

function installScreepsConstants(): void {
  Object.assign(globalThis, {
    FIND_STRUCTURES: 107,
    FIND_MY_STRUCTURES: 108,
    FIND_MY_CONSTRUCTION_SITES: 114,
    FIND_MY_SPAWNS: 112,
    STRUCTURE_LAB: "lab",
    STRUCTURE_RAMPART: "rampart",
    STRUCTURE_STORAGE: "storage",
    STRUCTURE_TERMINAL: "terminal",
    STRUCTURE_SPAWN: "spawn",
    STRUCTURE_ROAD: "road",
    TERRAIN_MASK_WALL: 1,
    OK: 0
  });
}

function pos(x: number, y: number, roomName = "W17S29") {
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

function structure(structureType: string, x: number, y: number) {
  return { id: `${structureType}-${x}-${y}`, structureType, pos: pos(x, y), my: true };
}

function createRoom(options: {
  rcl?: number;
  walls?: Array<{ x: number; y: number }>;
  structures?: any[];
  sites?: any[];
  calls?: Array<{ x: number; y: number; structureType: string }>;
} = {}): Room {
  const walls = new Set((options.walls ?? []).map(tile => `${tile.x},${tile.y}`));
  const calls = options.calls ?? [];
  const spawn = structure(STRUCTURE_SPAWN, 31, 8);
  const storage = structure(STRUCTURE_STORAGE, 35, 12);
  const terminal = structure(STRUCTURE_TERMINAL, 33, 12);
  const structures = [spawn, storage, terminal, ...(options.structures ?? [])];
  const sites = options.sites ?? [];

  const applyFilter = <T>(items: T[], opts?: { filter?: (item: T) => boolean }) => opts?.filter ? items.filter(opts.filter) : items;

  return {
    name: "W17S29",
    controller: { my: true, level: options.rcl ?? 6 },
    storage,
    terminal,
    getTerrain: () => ({ get: (x: number, y: number) => walls.has(`${x},${y}`) ? TERRAIN_MASK_WALL : 0 }),
    find: (type: number, opts?: { filter?: (item: any) => boolean }) => {
      if (type === FIND_STRUCTURES || type === FIND_MY_STRUCTURES) return applyFilter(structures, opts);
      if (type === FIND_MY_CONSTRUCTION_SITES) return applyFilter(sites, opts);
      if (type === FIND_MY_SPAWNS) return applyFilter([spawn], opts);
      return [];
    },
    createConstructionSite: (x: number, y: number, structureType: string) => {
      calls.push({ x, y, structureType });
      return OK;
    }
  } as unknown as Room;
}

describe("lab cluster planner", () => {
  before(installScreepsConstants);

  it("fills missing RCL6 labs around an existing lab when static blueprint slots are walls", async () => {
    const { placeLabClusterConstructionSites } = await import("../src/labClusterPlanner.ts");
    const calls: Array<{ x: number; y: number; structureType: string }> = [];
    const existingLab = structure(STRUCTURE_LAB, 26, 13);
    const room = createRoom({
      structures: [existingLab],
      walls: [
        { x: 27, y: 12 },
        { x: 28, y: 13 },
        { x: 27, y: 13 },
        { x: 28, y: 12 }
      ],
      calls
    });

    const placed = placeLabClusterConstructionSites(room, 3);

    expect(placed).to.equal(2);
    expect(calls.every(call => call.structureType === STRUCTURE_LAB)).to.equal(true);
    for (const call of calls) {
      expect(pos(call.x, call.y).getRangeTo(existingLab)).to.be.at.most(2);
    }
  });

  it("plans all currently allowed labs when a room has no labs yet", async () => {
    const { planLabCluster } = await import("../src/labClusterPlanner.ts");
    const room = createRoom();

    const plan = planLabCluster(room);

    expect(plan?.desiredCount).to.equal(3);
    expect(plan?.positions).to.have.length(3);
    expect(plan?.missingCount).to.equal(3);
  });

  it("does not exceed the current RCL lab limit", async () => {
    const { planLabCluster } = await import("../src/labClusterPlanner.ts");
    const room = createRoom({ rcl: 5 });

    expect(planLabCluster(room)).to.equal(null);
  });
});
