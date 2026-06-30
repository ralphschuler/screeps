import { expect } from "chai";
import {
  getDominantPheromone,
  getPheromoneBarFillWidth,
  getPheromoneColor
} from "../src/room-visualizer/pheromoneRules.ts";

describe("pheromone visual rules", () => {
  it("keeps the strict heatmap threshold and dominant-color fallback", () => {
    expect(getDominantPheromone({ harvest: 10, build: 9 })).to.equal(null);

    const dominant = getDominantPheromone({ harvest: 10, build: 11, mystery: 50 });

    expect(dominant).to.deep.equal({
      name: "mystery",
      value: 50,
      color: "#888888",
      opacity: 0.075
    });
  });

  it("uses documented pheromone colors and caps bar width", () => {
    expect(getPheromoneColor("defense")).to.equal("#ff0000");
    expect(getPheromoneColor("unknown")).to.equal("#888888");
    expect(getPheromoneBarFillWidth(50, 6)).to.equal(3);
    expect(getPheromoneBarFillWidth(200, 6)).to.equal(6);
  });
});
