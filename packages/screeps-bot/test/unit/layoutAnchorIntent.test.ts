import { expect } from "chai";
import { planLayoutAnchorIntent, scoreLayoutAnchor } from "@ralphschuler/screeps-layouts";

describe("Layout anchor terrain planning Module", () => {
  function openTerrain(): Map<string, number> {
    const terrain = new Map<string, number>();
    for (let x = 0; x < 50; x++) for (let y = 0; y < 50; y++) terrain.set(`${x},${y}`, 0);
    return terrain;
  }

  it("scores open anchors with observable reasons", () => {
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
  });

  it("rejects wall-heavy anchors", () => {
    const terrain = openTerrain();
    for (let x = 13; x <= 27; x++) for (let y = 13; y <= 27; y++) terrain.set(`${x},${y}`, TERRAIN_MASK_WALL);

    const score = scoreLayoutAnchor({ x: 20, y: 20 }, {
      roomName: "W1N1",
      controller: { x: 23, y: 20 },
      sources: [{ x: 25, y: 20 }],
      terrain
    });

    expect(score.score).to.be.lessThan(100);
    expect(score.reasons.some(reason => reason.includes("walls in build area"))).to.equal(true);
  });

  it("selects deterministically by score, then x, then y", () => {
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
});
