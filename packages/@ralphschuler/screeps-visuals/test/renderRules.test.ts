import { expect } from "chai";
import {
  calculateCreepThreat,
  getStructureDepthOpacity,
  getThreatVisualStyle
} from "../src/room-visualizer/renderRules.ts";

type MutableGlobal = typeof globalThis & {
  ATTACK: ATTACK;
  RANGED_ATTACK: RANGED_ATTACK;
  HEAL: HEAL;
  TOUGH: TOUGH;
  WORK: WORK;
  MOVE: MOVE;
  STRUCTURE_RAMPART: STRUCTURE_RAMPART;
  STRUCTURE_TOWER: STRUCTURE_TOWER;
  STRUCTURE_SPAWN: STRUCTURE_SPAWN;
  STRUCTURE_STORAGE: STRUCTURE_STORAGE;
  STRUCTURE_TERMINAL: STRUCTURE_TERMINAL;
  STRUCTURE_ROAD: STRUCTURE_ROAD;
  STRUCTURE_WALL: STRUCTURE_WALL;
  STRUCTURE_EXTENSION: STRUCTURE_EXTENSION;
};

const setScreepsConstants = (): void => {
  const g = globalThis as MutableGlobal;
  g.ATTACK = "attack";
  g.RANGED_ATTACK = "ranged_attack";
  g.HEAL = "heal";
  g.TOUGH = "tough";
  g.WORK = "work";
  g.MOVE = "move";
  g.STRUCTURE_RAMPART = "rampart";
  g.STRUCTURE_TOWER = "tower";
  g.STRUCTURE_SPAWN = "spawn";
  g.STRUCTURE_STORAGE = "storage";
  g.STRUCTURE_TERMINAL = "terminal";
  g.STRUCTURE_ROAD = "road";
  g.STRUCTURE_WALL = "constructedWall";
  g.STRUCTURE_EXTENSION = "extension";
};

const bodyPart = (type: BodyPartConstant, hits = 100, boost?: ResourceConstant): BodyPartDefinition => ({
  type,
  hits,
  ...(boost ? { boost } : {})
} as BodyPartDefinition);

describe("visual render rules", () => {
  beforeEach(setScreepsConstants);

  it("scores only live threat-relevant creep body parts", () => {
    const threat = calculateCreepThreat({
      body: [
        bodyPart(ATTACK),
        bodyPart(RANGED_ATTACK),
        bodyPart(HEAL),
        bodyPart(TOUGH),
        bodyPart(WORK),
        bodyPart(MOVE),
        bodyPart(ATTACK, 0),
        bodyPart(ATTACK, 100, "UH" as ResourceConstant)
      ]
    });

    expect(threat).to.equal(38);
    expect(calculateCreepThreat({})).to.equal(0);
  });

  it("keeps existing threat marker thresholds and animation rule", () => {
    expect(getThreatVisualStyle(10)).to.include({ color: "#ffff00", animated: false });
    expect(getThreatVisualStyle(11)).to.include({ color: "#ff8800", animated: false });
    expect(getThreatVisualStyle(31)).to.include({ color: "#ff0000", animated: true });

    const style = getThreatVisualStyle(50);
    expect(style.radius).to.equal(0.9);
    expect(style.opacity).to.be.closeTo(0.35, 0.0001);
  });

  it("maps structures to depth opacity without changing visual hierarchy", () => {
    expect(getStructureDepthOpacity(STRUCTURE_RAMPART)).to.equal(0.8);
    expect(getStructureDepthOpacity(STRUCTURE_TOWER)).to.equal(0.9);
    expect(getStructureDepthOpacity(STRUCTURE_SPAWN)).to.equal(0.85);
    expect(getStructureDepthOpacity(STRUCTURE_STORAGE)).to.equal(0.85);
    expect(getStructureDepthOpacity(STRUCTURE_TERMINAL)).to.equal(0.85);
    expect(getStructureDepthOpacity(STRUCTURE_ROAD)).to.equal(0.3);
    expect(getStructureDepthOpacity(STRUCTURE_WALL)).to.equal(0.9);
    expect(getStructureDepthOpacity(STRUCTURE_EXTENSION)).to.equal(0.7);
  });
});
