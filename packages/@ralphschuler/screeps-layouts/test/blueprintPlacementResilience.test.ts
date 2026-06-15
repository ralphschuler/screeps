import { expect } from "chai";
import type { Blueprint } from "../src/blueprints/types";

function installScreepsConstants(): void {
  Object.assign(globalThis, {
    FIND_SOURCES: 105,
    FIND_STRUCTURES: 107,
    FIND_MY_STRUCTURES: 106,
    FIND_CONSTRUCTION_SITES: 108,
    FIND_MY_SPAWNS: 109,
    FIND_MY_CONSTRUCTION_SITES: 114,
    FIND_MINERALS: 116,
    STRUCTURE_EXTENSION: "extension",
    STRUCTURE_SPAWN: "spawn",
    STRUCTURE_ROAD: "road",
    STRUCTURE_RAMPART: "rampart",
    STRUCTURE_WALL: "constructedWall",
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
    OK: 0,
    ERR_INVALID_TARGET: -7,
    ERR_INVALID_ARGS: -10,
    ERR_RCL_NOT_ENOUGH: -14,
    RoomPosition: class {
      public constructor(public x: number, public y: number, public roomName: string) {}
    },
    PathFinder: {
      CostMatrix: class { public set(): void {} },
      search: () => ({ path: [], incomplete: false, ops: 0, cost: 0 })
    }
  });
  Object.assign(globalThis, {
    Game: {
      time: 1,
      rooms: {},
      map: { getRoomTerrain: () => ({ get: () => 0 }) }
    }
  });
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

const blueprint: Blueprint = {
  name: "testBlueprint",
  rcl: 6,
  type: "spread",
  anchor: { x: 10, y: 10 },
  minSpaceRadius: 1,
  structures: [{ x: 0, y: 0, structureType: "lab" as BuildableStructureConstant }],
  roads: []
};

function existingExtensions(): Array<{ x: number; y: number; structureType: StructureConstant }> {
  return Array.from({ length: 40 }, (_, index) => ({
    x: (index % 40) + 1,
    y: 1,
    structureType: STRUCTURE_EXTENSION
  }));
}

function createRoom(options: {
  walls?: Array<{ x: number; y: number }>;
  structures?: Array<{ x: number; y: number; structureType: StructureConstant }>;
  sites?: Array<{ x: number; y: number; structureType: BuildableStructureConstant }>;
  createResult?: (x: number, y: number, structureType: BuildableStructureConstant) => ScreepsReturnCode;
  minerals?: Array<{ x: number; y: number }>;
  calls: Array<{ x: number; y: number; structureType: BuildableStructureConstant }>;
}): Room {
  const walls = new Set((options.walls ?? []).map(wall => `${wall.x},${wall.y}`));
  const structures = (options.structures ?? []).map((structure, index) => ({
    id: `structure-${index}`,
    structureType: structure.structureType,
    pos: position(structure.x, structure.y)
  }));
  const sites = (options.sites ?? []).map((site, index) => ({
    id: `site-${index}`,
    structureType: site.structureType,
    pos: position(site.x, site.y)
  }));
  const minerals = (options.minerals ?? []).map((mineral, index) => ({
    id: `mineral-${index}`,
    pos: position(mineral.x, mineral.y)
  }));

  return {
    name: "W1N1",
    controller: { my: true, level: 6 },
    getTerrain: () => ({ get: (x: number, y: number) => walls.has(`${x},${y}`) ? TERRAIN_MASK_WALL : 0 }),
    find: (type: number) => {
      if (type === FIND_STRUCTURES) return structures;
      if (type === FIND_MY_CONSTRUCTION_SITES) return sites;
      if (type === FIND_MINERALS) return minerals;
      return [];
    },
    createConstructionSite: (x: number, y: number, structureType: BuildableStructureConstant) => {
      options.calls.push({ x, y, structureType });
      return options.createResult?.(x, y, structureType) ?? OK;
    }
  } as unknown as Room;
}

describe("blueprint placement resilience", () => {
  before(installScreepsConstants);

  it("relocates a blueprint structure when the preferred tile is terrain-blocked", async () => {
    const { placeConstructionSites } = await import("../src/blueprints/placer.ts");
    const calls: Array<{ x: number; y: number; structureType: BuildableStructureConstant }> = [];
    const room = createRoom({ walls: [{ x: 10, y: 10 }], structures: existingExtensions(), calls });

    const placed = placeConstructionSites(room, position(10, 10) as RoomPosition, blueprint);

    expect(placed).to.equal(1);
    expect(calls[0]).to.include({ structureType: STRUCTURE_LAB });
    expect(`${calls[0]?.x},${calls[0]?.y}`).to.not.equal("10,10");
  });

  it("keeps scanning alternate tiles when createConstructionSite rejects the preferred tile", async () => {
    const { placeConstructionSites } = await import("../src/blueprints/placer.ts");
    const calls: Array<{ x: number; y: number; structureType: BuildableStructureConstant }> = [];
    const room = createRoom({
      calls,
      structures: existingExtensions(),
      createResult: (x, y) => x === 10 && y === 10 ? ERR_INVALID_TARGET : OK
    });

    const placed = placeConstructionSites(room, position(10, 10) as RoomPosition, blueprint);

    expect(placed).to.equal(1);
    expect(calls.map(call => `${call.x},${call.y}`)).to.include("10,10");
    expect(calls.some(call => call.x !== 10 || call.y !== 10)).to.equal(true);
  });

  it("does not auto-destroy expensive misplaced structures during cleanup", async () => {
    const { destroyMisplacedStructures } = await import("../src/blueprints/placer.ts");
    let destroyed = 0;
    const room = {
      name: "W1N1",
      getTerrain: () => ({ get: () => 0 }),
      find: (type: number, options?: { filter?: (structure: Structure) => boolean }) => {
        if (type !== FIND_STRUCTURES) return [];
        const structures = [{
          my: true,
          structureType: STRUCTURE_TOWER,
          pos: { x: 20, y: 20, toString: () => "20,20" },
          room: { name: "W1N1" },
          destroy: () => {
            destroyed++;
            return OK;
          }
        }] as unknown as Structure[];
        return options?.filter ? structures.filter(options.filter) : structures;
      }
    } as unknown as Room;

    const removed = destroyMisplacedStructures(room, position(10, 10) as RoomPosition, blueprint, 1);

    expect(removed).to.equal(0);
    expect(destroyed).to.equal(0);
  });

  it("does not relocate extractors away from the mineral tile", async () => {
    const { placeConstructionSites } = await import("../src/blueprints/placer.ts");
    const calls: Array<{ x: number; y: number; structureType: BuildableStructureConstant }> = [];
    const room = createRoom({
      calls,
      structures: existingExtensions(),
      minerals: [{ x: 12, y: 12 }],
      createResult: (x, y, structureType) => structureType === STRUCTURE_EXTRACTOR && x === 12 && y === 12 ? ERR_INVALID_TARGET : OK
    });

    placeConstructionSites(
      room,
      position(10, 10) as RoomPosition,
      { ...blueprint, structures: [] }
    );

    expect(calls.filter(call => call.structureType === STRUCTURE_EXTRACTOR).map(call => `${call.x},${call.y}`)).to.deep.equal([
      "12,12"
    ]);
  });
});
