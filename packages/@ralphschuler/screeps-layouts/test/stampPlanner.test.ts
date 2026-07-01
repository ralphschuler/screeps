import { expect } from "chai";
import type { BlueprintPlan, BlueprintRoomFacts } from "../src/blueprints/types";

const EXTENSION = "extension" as BuildableStructureConstant;
const SPAWN = "spawn" as BuildableStructureConstant;
const TOWER = "tower" as BuildableStructureConstant;
const STORAGE = "storage" as BuildableStructureConstant;
const LINK = "link" as BuildableStructureConstant;
const TERMINAL = "terminal" as BuildableStructureConstant;
const EXTRACTOR = "extractor" as BuildableStructureConstant;
const LAB = "lab" as BuildableStructureConstant;
const FACTORY = "factory" as BuildableStructureConstant;
const NUKER = "nuker" as BuildableStructureConstant;
const OBSERVER = "observer" as BuildableStructureConstant;
const POWER_SPAWN = "powerSpawn" as BuildableStructureConstant;

function installScreepsConstants(): void {
  Object.assign(globalThis, {
    STRUCTURE_EXTENSION: EXTENSION,
    STRUCTURE_SPAWN: SPAWN,
    STRUCTURE_ROAD: "road",
    STRUCTURE_RAMPART: "rampart",
    STRUCTURE_WALL: "constructedWall",
    STRUCTURE_STORAGE: STORAGE,
    STRUCTURE_TERMINAL: TERMINAL,
    STRUCTURE_TOWER: TOWER,
    STRUCTURE_LINK: LINK,
    STRUCTURE_LAB: LAB,
    STRUCTURE_FACTORY: FACTORY,
    STRUCTURE_OBSERVER: OBSERVER,
    STRUCTURE_NUKER: NUKER,
    STRUCTURE_POWER_SPAWN: POWER_SPAWN,
    STRUCTURE_EXTRACTOR: EXTRACTOR,
    STRUCTURE_CONTAINER: "container",
    TERRAIN_MASK_WALL: 1,
    MAX_CONSTRUCTION_SITES: 100,
    OK: 0,
    ERR_INVALID_TARGET: -7
  });
}

function makeTerrain(walls: Array<{ x: number; y: number }> = []): Map<string, number> {
  return new Map(walls.map(wall => [`${wall.x},${wall.y}`, 1]));
}

function makeFacts(
  rcl: number,
  options: Partial<BlueprintRoomFacts> & { walls?: Array<{ x: number; y: number }> } = {}
): BlueprintRoomFacts {
  return {
    roomName: "W1N1",
    rcl,
    anchor: { x: 25, y: 25 },
    terrain: makeTerrain(options.walls),
    controller: { x: 25, y: 8 },
    sources: [{ x: 10, y: 25 }, { x: 40, y: 25 }],
    mineral: { x: 25, y: 40 },
    existingStructures: [],
    existingConstructionSites: [],
    ...options
  };
}

function count(plan: BlueprintPlan, structureType: BuildableStructureConstant): number {
  return plan.structures.filter(structure => structure.structureType === structureType).length;
}

function positionsOf(plan: BlueprintPlan, structureType: BuildableStructureConstant): string[] {
  return plan.structures
    .filter(structure => structure.structureType === structureType)
    .map(structure => `${structure.x},${structure.y}`);
}

function expectPlanPositionsInsidePlannerBounds(plan: BlueprintPlan): void {
  for (const collection of [plan.structures, plan.roads, plan.ramparts]) {
    for (const position of collection) {
      expect(position.x).to.be.within(1, 48);
      expect(position.y).to.be.within(1, 48);
    }
  }
}

describe("stamp blueprint planner", () => {
  before(installScreepsConstants);

  it("produces exact mandatory RCL8 structure counts in an open room", async () => {
    const { planRoomBlueprint } = await import("../src/blueprints/planner.ts");
    const plan = planRoomBlueprint(makeFacts(8));

    expect(plan.errors).to.deep.equal([]);
    expect(count(plan, EXTENSION)).to.equal(60);
    expect(count(plan, SPAWN)).to.equal(3);
    expect(count(plan, TOWER)).to.equal(6);
    expect(count(plan, LINK)).to.equal(6);
    expect(count(plan, LAB)).to.equal(10);
    expect(count(plan, STORAGE)).to.equal(1);
    expect(count(plan, TERMINAL)).to.equal(1);
    expect(count(plan, EXTRACTOR)).to.equal(1);
    expect(count(plan, FACTORY)).to.equal(1);
    expect(count(plan, OBSERVER)).to.equal(1);
    expect(count(plan, POWER_SPAWN)).to.equal(1);
    expect(count(plan, NUKER)).to.equal(1);
  });

  it("caps early RCL extension demand instead of overbuilding pods", async () => {
    const { planRoomBlueprint } = await import("../src/blueprints/planner.ts");
    const rcl2 = planRoomBlueprint(makeFacts(2));
    const rcl3 = planRoomBlueprint(makeFacts(3));

    expect(count(rcl2, EXTENSION)).to.equal(5);
    expect(count(rcl2, TOWER)).to.equal(0);
    expect(count(rcl3, EXTENSION)).to.equal(10);
    expect(count(rcl3, TOWER)).to.equal(1);
  });

  it("adds RCL4 storage and exactly 20 extensions", async () => {
    const { planRoomBlueprint } = await import("../src/blueprints/planner.ts");
    const plan = planRoomBlueprint(makeFacts(4));

    expect(plan.errors).to.deep.equal([]);
    expect(count(plan, EXTENSION)).to.equal(20);
    expect(count(plan, STORAGE)).to.equal(1);
    expect(count(plan, TOWER)).to.equal(1);
    expect(count(plan, TERMINAL)).to.equal(0);
  });

  it("adds RCL6 terminal, extractor, compact labs, and 40 extensions", async () => {
    const { planRoomBlueprint } = await import("../src/blueprints/planner.ts");
    const plan = planRoomBlueprint(makeFacts(6));

    expect(plan.errors).to.deep.equal([]);
    expect(count(plan, EXTENSION)).to.equal(40);
    expect(count(plan, TERMINAL)).to.equal(1);
    expect(count(plan, EXTRACTOR)).to.equal(1);
    expect(count(plan, LAB)).to.equal(3);
  });

  it("falls back for blocked extension pod members without underbuilding", async () => {
    const { planRoomBlueprint } = await import("../src/blueprints/planner.ts");
    const blockedFirstPod = [
      { x: 18, y: 23 }, { x: 20, y: 23 }, { x: 19, y: 24 }, { x: 17, y: 24 }, { x: 21, y: 24 },
      { x: 19, y: 26 }, { x: 17, y: 26 }, { x: 21, y: 26 }, { x: 18, y: 27 }, { x: 20, y: 27 }
    ];
    const wallKeys = new Set(blockedFirstPod.map(point => `${point.x},${point.y}`));
    const plan = planRoomBlueprint(makeFacts(8, { walls: blockedFirstPod }));

    expect(plan.errors).to.deep.equal([]);
    expect(count(plan, EXTENSION)).to.equal(60);
    expect(positionsOf(plan, EXTENSION).some(position => wallKeys.has(position))).to.equal(false);
    expect(plan.structures.some(structure => structure.structureType === EXTENSION && structure.placedBy === "fallback")).to.equal(true);
  });

  it("keeps lab counts when preferred lab cluster tiles are blocked", async () => {
    const { planRoomBlueprint } = await import("../src/blueprints/planner.ts");
    const blockedLabs = [
      { x: 29, y: 26 }, { x: 30, y: 26 }, { x: 29, y: 27 }, { x: 30, y: 27 }, { x: 28, y: 26 },
      { x: 29, y: 25 }, { x: 31, y: 26 }, { x: 31, y: 27 }, { x: 30, y: 25 }, { x: 28, y: 27 }
    ];
    const plan = planRoomBlueprint(makeFacts(8, { walls: blockedLabs }));

    expect(plan.errors).to.deep.equal([]);
    expect(count(plan, LAB)).to.equal(10);
    expect(plan.structures.some(structure => structure.structureType === LAB && structure.placedBy === "fallback")).to.equal(true);
  });

  it("counts existing structures and sites toward demand", async () => {
    const { planRoomBlueprint } = await import("../src/blueprints/planner.ts");
    const existingStructures = Array.from({ length: 5 }, (_, index) => ({
      x: 10 + index,
      y: 10,
      structureType: EXTENSION
    }));
    const plan = planRoomBlueprint(makeFacts(2, { existingStructures }));

    expect(count(plan, EXTENSION)).to.equal(5);
    expect(plan.structures.filter(structure => structure.structureType === EXTENSION && structure.placedBy === "fixed")).to.have.length(5);
  });

  it("honors an explicit planner anchor for stable bot cleanup and construction", async () => {
    const { planRoomBlueprint } = await import("../src/blueprints/planner.ts");
    const plan = planRoomBlueprint(makeFacts(4, { anchor: { x: 25, y: 25 } }), 4, { anchor: { x: 30, y: 31 } });

    expect(plan.anchor).to.deep.equal({ x: 30, y: 31 });
    expect(plan.structures.some(structure => structure.source.startsWith("HUB_CORE") && structure.x === 30 && structure.y === 31)).to.equal(true);
  });

  it("clamps explicit planner anchors into the safe buildable stamp area", async () => {
    const { planRoomBlueprint } = await import("../src/blueprints/planner.ts");
    const plan = planRoomBlueprint(makeFacts(8, { anchor: { x: 25, y: 25 } }), 8, { anchor: { x: 1, y: 1 } });

    expect(plan.anchor).to.deep.equal({ x: 9, y: 9 });
    expect(plan.errors).to.deep.equal([]);
    expect(count(plan, EXTENSION)).to.equal(60);
    expectPlanPositionsInsidePlannerBounds(plan);
  });

  it("clamps existing-spawn-derived anchors near room edges", async () => {
    const { planRoomBlueprint } = await import("../src/blueprints/planner.ts");
    const existingStructures = [{ x: 47, y: 47, structureType: SPAWN }];
    const plan = planRoomBlueprint(makeFacts(8, { anchor: undefined, existingStructures }));

    expect(plan.anchor).to.deep.equal({ x: 40, y: 40 });
    expect(count(plan, SPAWN)).to.equal(3);
    expect(plan.structures.some(structure => structure.structureType === SPAWN && structure.x === 47 && structure.y === 47 && structure.placedBy === "fixed")).to.equal(true);
    expectPlanPositionsInsidePlannerBounds(plan);
  });

  it("adopts an existing offset spawn instead of requiring duplicate spawn1 placement", async () => {
    const { planRoomBlueprint } = await import("../src/blueprints/planner.ts");
    const existingStructures = [{ x: 20, y: 20, structureType: SPAWN }];
    const plan = planRoomBlueprint(makeFacts(8, { existingStructures }));

    expect(count(plan, SPAWN)).to.equal(3);
    expect(plan.structures.some(structure => structure.structureType === SPAWN && structure.x === 20 && structure.y === 20 && structure.placedBy === "fixed")).to.equal(true);
  });

  it("adds road access and rampart overlays to fallback critical structures", async () => {
    const { planRoomBlueprint } = await import("../src/blueprints/planner.ts");
    const plan = planRoomBlueprint(makeFacts(3, { walls: [{ x: 23, y: 23 }] }));
    const fallbackTower = plan.structures.find(structure => structure.structureType === TOWER && structure.placedBy === "fallback");

    expect(fallbackTower).to.not.equal(undefined);
    expect(plan.ramparts.some(rampart => rampart.x === fallbackTower?.x && rampart.y === fallbackTower?.y)).to.equal(true);
    expect(plan.roads.some(road => Math.max(Math.abs(road.x - Number(fallbackTower?.x)), Math.abs(road.y - Number(fallbackTower?.y))) === 1)).to.equal(true);
  });

  it("filters construction queue by current RCL and caller cap", async () => {
    const { planRoomBlueprint } = await import("../src/blueprints/planner.ts");
    const { buildConstructionQueue } = await import("../src/blueprints/constructionQueue.ts");
    const plan = planRoomBlueprint(makeFacts(8));
    const queue = buildConstructionQueue(plan, { currentRcl: 3, maxItems: 5 });

    expect(queue).to.have.length(5);
    expect(queue.every(item => item.minRcl <= 3)).to.equal(true);
    expect(queue.some(item => item.structureType === LAB)).to.equal(false);
  });

  it("does not emit construction sites when the global 100 site cap is reached", async () => {
    const { planRoomBlueprint } = await import("../src/blueprints/planner.ts");
    const { issueConstructionSites } = await import("../src/blueprints/constructionQueue.ts");
    const plan = planRoomBlueprint(makeFacts(3));
    const oldGame = (globalThis as { Game?: unknown }).Game;
    (globalThis as { Game?: unknown }).Game = { constructionSites: Object.fromEntries(Array.from({ length: 100 }, (_, index) => [`site${index}`, {}])) };

    const room = {
      controller: { level: 3 },
      find: () => [],
      createConstructionSite: () => {
        throw new Error("must not create site at cap");
      }
    } as unknown as Room;

    try {
      expect(issueConstructionSites(room, plan, 3)).to.equal(0);
    } finally {
      (globalThis as { Game?: unknown }).Game = oldGame;
    }
  });

  it("continues past rejected high-priority construction candidates", async () => {
    const { issueConstructionSites } = await import("../src/blueprints/constructionQueue.ts");
    const oldGame = (globalThis as { Game?: unknown }).Game;
    const calls: Array<{ x: number; y: number; structureType: BuildableStructureConstant }> = [];
    const plan: BlueprintPlan = {
      roomName: "W1N1",
      rcl: 5,
      anchor: { x: 25, y: 25 },
      structures: [
        { x: 10, y: 10, structureType: EXTENSION, minRcl: 2, priority: 300, source: "blocked-1", placedBy: "stamp" },
        { x: 11, y: 10, structureType: EXTENSION, minRcl: 2, priority: 299, source: "blocked-2", placedBy: "stamp" },
        { x: 12, y: 10, structureType: EXTENSION, minRcl: 2, priority: 298, source: "blocked-3", placedBy: "stamp" },
        { x: 13, y: 10, structureType: EXTENSION, minRcl: 2, priority: 297, source: "valid-extension", placedBy: "stamp" }
      ],
      roads: [],
      ramparts: [],
      unplaced: [],
      errors: [],
      stamps: [],
      version: "test"
    };
    const room = {
      controller: { level: 5 },
      find: () => [],
      createConstructionSite: (x: number, y: number, structureType: BuildableStructureConstant) => {
        calls.push({ x, y, structureType });
        return x === 13 && y === 10 ? OK : ERR_INVALID_TARGET;
      }
    } as unknown as Room;

    (globalThis as { Game?: unknown }).Game = { constructionSites: {} };

    try {
      expect(issueConstructionSites(room, plan, 1)).to.equal(1);
      expect(calls.map(call => `${call.structureType}:${call.x},${call.y}`)).to.deep.equal([
        "extension:10,10",
        "extension:11,10",
        "extension:12,10",
        "extension:13,10"
      ]);
    } finally {
      (globalThis as { Game?: unknown }).Game = oldGame;
    }
  });
});
