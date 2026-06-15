import { expect } from "chai";
import {
  calculatePathDistance,
  calculateRemoteHaulerRequirement,
  estimateRoundTripTicks
} from "../src/remote/haulerDimensioning.ts";

describe("Remote Hauler Dimensioning", () => {
  it("uses cached path length when provided", () => {
    const requirement = calculateRemoteHaulerRequirement("W1N1", "W2N1", 1, 800, {
      pathLength: 75,
      safetyBuffer: 1
    });

    expect(requirement.roundTripTicks).to.equal(150);
    expect(requirement.distance).to.equal(1);
  });

  it("models reserved remotes as higher output than unreserved remotes", () => {
    const unreserved = calculateRemoteHaulerRequirement("W1N1", "W2N1", 2, 800, {
      pathLength: 50,
      reserved: false,
      safetyBuffer: 1
    });
    const reserved = calculateRemoteHaulerRequirement("W1N1", "W2N1", 2, 800, {
      pathLength: 50,
      reserved: true,
      safetyBuffer: 1
    });

    expect(unreserved.energyPerTick).to.equal(10);
    expect(reserved.energyPerTick).to.equal(20);
    expect(reserved.minHaulers).to.be.greaterThan(unreserved.minHaulers);
  });

  it("estimates room distance and round-trip ticks deterministically", () => {
    expect(calculatePathDistance("W1N1", "W3N2")).to.equal(3);
    expect(estimateRoundTripTicks(2, 1.5)).to.equal(300);
  });

  it("counts rooms across the W/E and N/S zero boundaries", () => {
    expect(calculatePathDistance("W0N0", "E0N0")).to.equal(1);
    expect(calculatePathDistance("E0N0", "E0S0")).to.equal(1);
    expect(calculatePathDistance("W1N1", "E1S1")).to.equal(6);
  });
});
