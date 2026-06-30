import { expect } from "chai";

type PositionLike = { x: number; y: number; roomName: string; getRangeTo: (other: { x: number; y: number }) => number };

function position(x: number, y: number): PositionLike {
  return {
    x,
    y,
    roomName: "W0N0",
    getRangeTo: (other: { x: number; y: number }) => Math.abs(x - other.x) + Math.abs(y - other.y)
  };
}

function createMostlyWalledRoom(options: {
  controllerX: number;
  controllerY: number;
  sourceA: [number, number];
  sourceB: [number, number];
  openRadius: number;
  fallbackRadius?: number;
}): Room {
  const { controllerX, controllerY, sourceA, sourceB, openRadius } = options;
  const open: Set<string> = new Set<string>();

  for (let x = controllerX - openRadius; x <= controllerX + openRadius; x++) {
    for (let y = controllerY - openRadius; y <= controllerY + openRadius; y++) {
      if (x >= 1 && x <= 48 && y >= 1 && y <= 48) {
        open.add(`${x},${y}`);
      }
    }
  }

  const terrain = {
    get: (x: number, y: number) => (open.has(`${x},${y}`) ? 0 : 1)
  };

  return {
    name: "W0N0",
    controller: {
      pos: position(controllerX, controllerY)
    } as unknown as StructureController,
    find: (type: number) => {
      if (type === FIND_SOURCES) {
        return [
          { pos: position(sourceA[0], sourceA[1]) },
          { pos: position(sourceB[0], sourceB[1]) }
        ] as unknown as Source[];
      }
      return [];
    },
    getTerrain: () => terrain
  } as Room;
}

describe("Blueprint selector", () => {
  before(() => {
    Object.assign(globalThis, {
      FIND_SOURCES: 105,
      TERRAIN_MASK_WALL: 1,
      STRUCTURE_EXTENSION: "extension",
      STRUCTURE_SPAWN: "spawn",
      STRUCTURE_ROAD: "road",
      STRUCTURE_TOWER: "tower",
      STRUCTURE_STORAGE: "storage",
      STRUCTURE_TERMINAL: "terminal",
      STRUCTURE_FACTORY: "factory",
      STRUCTURE_LAB: "lab",
      STRUCTURE_NUKER: "nuker",
      STRUCTURE_OBSERVER: "observer",
      STRUCTURE_POWER_SPAWN: "powerSpawn",
      STRUCTURE_LINK: "link",
      STRUCTURE_RAMPART: "rampart"
    });
  });

  it("clamps invalid high RCL values to RCL 8 structure limits", async () => {
    const { getStructuresForRCL } = await import("../src/blueprints/selector.ts");
    const { EARLY_COLONY_BLUEPRINT } = await import("../src/blueprints/definitions/early-colony.ts");

    const structures = getStructuresForRCL(EARLY_COLONY_BLUEPRINT, 9);

    expect(structures.filter(s => s.structureType === "extension")).to.have.length(60);
    expect(structures.filter(s => s.structureType === "spawn")).to.have.length(1);
  });

  it("clamps invalid low RCL values to RCL 1 structure limits", async () => {
    const { getStructuresForRCL } = await import("../src/blueprints/selector.ts");
    const { EARLY_COLONY_BLUEPRINT } = await import("../src/blueprints/definitions/early-colony.ts");

    const structures = getStructuresForRCL(EARLY_COLONY_BLUEPRINT, 0);

    expect(structures.filter(s => s.structureType === "extension")).to.have.length(0);
    expect(structures.filter(s => s.structureType === "spawn")).to.have.length(1);
  });

  it("treats non-finite RCL values as RCL 1 structure limits", async () => {
    const { getStructuresForRCL } = await import("../src/blueprints/selector.ts");
    const { EARLY_COLONY_BLUEPRINT } = await import("../src/blueprints/definitions/early-colony.ts");

    const structures = getStructuresForRCL(EARLY_COLONY_BLUEPRINT, Number.NaN);

    expect(structures.filter(s => s.structureType === "extension")).to.have.length(0);
    expect(structures.filter(s => s.structureType === "spawn")).to.have.length(1);
  });
});
