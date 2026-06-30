import { expect } from "chai";
import {
  calculateMapThreatLevel,
  classifyHighwayRoom,
  getDangerColor,
  getMapThreatColor,
  getPostureColor
} from "../src/map-visualizer/rules.ts";

describe("map visualizer rules", () => {
  it("keeps danger color clamping and fallback behavior", () => {
    expect(getDangerColor(undefined)).to.equal("#00ff00");
    expect(getDangerColor(0)).to.equal("#00ff00");
    expect(getDangerColor(1)).to.equal("#ffff00");
    expect(getDangerColor(2)).to.equal("#ff8800");
    expect(getDangerColor(3)).to.equal("#ff0000");
    expect(getDangerColor(-5)).to.equal("#00ff00");
    expect(getDangerColor(99)).to.equal("#ff0000");
    expect(getDangerColor(1.5)).to.equal("#ffffff");
  });

  it("maps known postures and preserves unknown fallback color", () => {
    expect(getPostureColor("eco")).to.equal("#00ff00");
    expect(getPostureColor("expand")).to.equal("#00ffff");
    expect(getPostureColor("defense")).to.equal("#ffff00");
    expect(getPostureColor("war")).to.equal("#ff8800");
    expect(getPostureColor("siege")).to.equal("#ff0000");
    expect(getPostureColor("evacuate")).to.equal("#ff00ff");
    expect(getPostureColor("unknown")).to.equal("#ffffff");
  });

  it("calculates map-level threat and threshold colors", () => {
    expect(calculateMapThreatLevel(3, 4)).to.equal(11);
    expect(getMapThreatColor(10)).to.equal("#ff8800");
    expect(getMapThreatColor(11)).to.equal("#ff0000");
  });

  it("classifies highway overlays without changing legacy SK label rule", () => {
    expect(classifyHighwayRoom("W10N3")).to.deep.equal({ isHighway: true, showSourceKeeperLabel: false });
    expect(classifyHighwayRoom("E3S10")).to.deep.equal({ isHighway: true, showSourceKeeperLabel: false });
    expect(classifyHighwayRoom("W10N20")).to.deep.equal({ isHighway: true, showSourceKeeperLabel: true });
    expect(classifyHighwayRoom("debug-W10N20")).to.deep.equal({ isHighway: true, showSourceKeeperLabel: true });
    expect(classifyHighwayRoom("W9N9")).to.deep.equal({ isHighway: false, showSourceKeeperLabel: false });
    expect(classifyHighwayRoom("not-a-room")).to.deep.equal({ isHighway: false, showSourceKeeperLabel: false });
  });
});
