import { expect } from "chai";
import { planResourceSharingIntent } from "../src/resourceSharingIntent.ts";

(globalThis as any).RESOURCE_ENERGY ??= "energy";

describe("Resource sharing transfer intent Module", () => {
  const policy = { minTransferAmount: 500, maxRequestsPerRoom: 2, maxDistance: 3 };

  it("plans energy transfer from nearest surplus room to highest-need room", () => {
    const intent = planResourceSharingIntent({
      time: 123,
      policy,
      existingRequests: [],
      distance: (from, to) => (from === "W2N2" && to === "W1N1" ? 1 : 3),
      rooms: [
        { roomName: "W1N1", hasTerminal: false, energyNeed: 3, canProvide: 0, needsAmount: 800 },
        { roomName: "W2N2", hasTerminal: false, energyNeed: 0, canProvide: 2000, needsAmount: 500 },
        { roomName: "W3N3", hasTerminal: false, energyNeed: 0, canProvide: 3000, needsAmount: 500 }
      ]
    });

    expect(intent.plannedRequests).to.deep.equal([
      {
        toRoom: "W1N1",
        fromRoom: "W2N2",
        resourceType: RESOURCE_ENERGY,
        amount: 800,
        priority: 3,
        createdAt: 123,
        assignedCreeps: [],
        delivered: 0
      }
    ]);
  });

  it("respects max requests and avoids duplicate provider pairs", () => {
    const intent = planResourceSharingIntent({
      time: 123,
      policy: { ...policy, maxRequestsPerRoom: 1 },
      existingRequests: [{ fromRoom: "W2N2", toRoom: "W1N1" }],
      distance: () => 1,
      rooms: [
        { roomName: "W1N1", hasTerminal: false, energyNeed: 2, canProvide: 0, needsAmount: 1000 },
        { roomName: "W2N2", hasTerminal: false, energyNeed: 0, canProvide: 2000, needsAmount: 500 }
      ]
    });

    expect(intent.plannedRequests).to.deep.equal([]);
    expect(intent.skippedRooms).to.deep.equal([{ roomName: "W1N1", reason: "max-requests" }]);
  });

  it("does not plan for rooms with terminals", () => {
    const intent = planResourceSharingIntent({
      time: 123,
      policy,
      existingRequests: [],
      distance: () => 1,
      rooms: [
        { roomName: "W1N1", hasTerminal: true, energyNeed: 3, canProvide: 0, needsAmount: 1000 },
        { roomName: "W2N2", hasTerminal: false, energyNeed: 0, canProvide: 2000, needsAmount: 500 }
      ]
    });

    expect(intent.plannedRequests).to.deep.equal([]);
  });

  it("respects max request cap per source room", () => {
    const intent = planResourceSharingIntent({
      time: 123,
      policy: { ...policy, maxRequestsPerRoom: 1 },
      existingRequests: [{ fromRoom: "W2N2", toRoom: "W1N2" }],
      distance: () => 1,
      rooms: [
        { roomName: "W1N1", hasTerminal: false, energyNeed: 3, canProvide: 0, needsAmount: 1000 },
        { roomName: "W2N2", hasTerminal: false, energyNeed: 0, canProvide: 4000, needsAmount: 500 },
        { roomName: "W3N3", hasTerminal: false, energyNeed: 0, canProvide: 4000, needsAmount: 500 }
      ]
    });

    expect(intent.plannedRequests).to.deep.equal([
      {
        toRoom: "W1N1",
        fromRoom: "W3N3",
        resourceType: RESOURCE_ENERGY,
        amount: 1000,
        priority: 3,
        createdAt: 123,
        assignedCreeps: [],
        delivered: 0
      }
    ]);
  });
});
