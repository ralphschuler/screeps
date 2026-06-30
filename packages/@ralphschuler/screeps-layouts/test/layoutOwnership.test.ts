import { expect } from "chai";
import type { Position } from "../src/index.ts";

function installScreepsConstants(): void {
  Object.assign(globalThis, {
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
    STRUCTURE_RAMPART: "rampart",
    STRUCTURE_WALL: "constructedWall",
    STRUCTURE_EXTRACTOR: "extractor",
    STRUCTURE_CONTAINER: "container",
    TERRAIN_MASK_WALL: 1,
    TERRAIN_MASK_SWAMP: 2
  });
}

function openTerrain(): Map<string, number> {
  const terrain = new Map<string, number>();
  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 50; y++) {
      terrain.set(`${x},${y}`, 0);
    }
  }
  return terrain;
}

describe("layout package ownership", () => {
  before(installScreepsConstants);

  it("exposes deterministic layout anchor planning through the package Interface", async () => {
    const { planLayoutAnchorIntent, scoreLayoutAnchor } = await import("../src/index.ts");
    const score = scoreLayoutAnchor({ x: 20, y: 20 }, {
      roomName: "W1N1",
      controller: { x: 23, y: 20 },
      sources: [{ x: 25, y: 20 }],
      mineral: { x: 28, y: 20 },
      terrain: openTerrain()
    });

    expect(score.score).to.be.greaterThan(100);
    expect(score.reasons).to.include("Open terrain");
    expect(score.reasons).to.include("Controller 3 tiles away");

    const intent = planLayoutAnchorIntent({
      roomName: "W1N1",
      controller: { x: 24, y: 24 },
      sources: [{ x: 28, y: 24 }],
      terrain: openTerrain()
    });

    expect(intent.selected).to.not.equal(null);
    expect(intent.selected?.pos.x).to.be.lessThan(40);
    expect(intent.selected?.pos.y).to.be.lessThan(40);
  });

  it("exposes extension and builder helpers through the package Interface", async () => {
    const { createSpawnRoadRing, generateExtensionPattern } = await import("../src/index.ts");
    expect(generateExtensionPattern(4)).to.deep.equal([
      { x: -2, y: 0, structureType: STRUCTURE_EXTENSION },
      { x: 2, y: 0, structureType: STRUCTURE_EXTENSION },
      { x: 0, y: -2, structureType: STRUCTURE_EXTENSION },
      { x: 0, y: 2, structureType: STRUCTURE_EXTENSION }
    ]);

    const center: Position = { x: 0, y: 0 };
    expect(createSpawnRoadRing(center)).to.have.length(8);
  });
});
