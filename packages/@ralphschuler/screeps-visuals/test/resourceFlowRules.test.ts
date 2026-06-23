import { expect } from "chai";
import { getFlowPoint, getTopStoredResources } from "../src/room-visualizer/resourceFlowRules.ts";

describe("resource flow visual rules", () => {
  it("selects the top three significant stored resources", () => {
    const resources = getTopStoredResources({
      energy: 1500,
      H: 800,
      O: 4000,
      U: 2000,
      K: 3000
    } as Partial<Record<ResourceConstant, number>>);

    expect(resources).to.deep.equal(["O", "K", "U"]);
  });

  it("interpolates the animated flow point from game time", () => {
    expect(getFlowPoint({ x: 10, y: 20 }, { x: 30, y: 40 }, 5)).to.deep.equal({ x: 15, y: 25 });
    expect(getFlowPoint({ x: 10, y: 20 }, { x: 30, y: 40 }, 20)).to.deep.equal({ x: 10, y: 20 });
  });
});
