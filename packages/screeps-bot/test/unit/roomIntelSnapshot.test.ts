import { expect } from "chai";
import { buildStubRoomIntel, buildVisibleRoomIntel, classifyRoomName } from "../../src/empire/roomIntelSnapshot";

describe("Visible room intel snapshot Module", () => {
  it("classifies highway and Source Keeper rooms from room names", () => {
    expect(classifyRoomName("W10N1")).to.deep.equal({ isHighway: true, isSK: false });
    expect(classifyRoomName("W9N1")).to.deep.equal({ isHighway: true, isSK: false });
    expect(classifyRoomName("W0N0")).to.deep.equal({ isHighway: true, isSK: false });
    expect(classifyRoomName("W6N6")).to.deep.equal({ isHighway: false, isSK: false });
    expect(classifyRoomName("W5N5")).to.deep.equal({ isHighway: false, isSK: true });
    expect(classifyRoomName("W4N1")).to.deep.equal({ isHighway: false, isSK: false });
    expect(classifyRoomName("W2N2")).to.deep.equal({ isHighway: false, isSK: false });
  });

  it("builds compact stub intel for undiscovered rooms", () => {
    expect(buildStubRoomIntel("W2N2")).to.deep.include({
      name: "W2N2",
      lastSeen: 0,
      sources: 0,
      controllerLevel: 0,
      threatLevel: 0,
      scouted: false,
      terrain: "mixed",
      isHighway: false,
      isSK: false
    });
  });

  it("builds visible room intel with threat and structure observations", () => {
    const intel = buildVisibleRoomIntel({
      roomName: "W2N2",
      tick: 500,
      sources: 2,
      controllerLevel: 4,
      owner: "Enemy",
      reserver: "Reserver",
      mineralType: RESOURCE_UTRIUM,
      hostileCreeps: 1,
      hostileTowers: 2,
      hostileSpawns: 1,
      portals: 1,
      terrain: { plains: 1000, swamps: 200 }
    });

    expect(intel).to.deep.include({
      name: "W2N2",
      lastSeen: 500,
      sources: 2,
      controllerLevel: 4,
      owner: "Enemy",
      reserver: "Reserver",
      mineralType: RESOURCE_UTRIUM,
      threatLevel: 1,
      scouted: true,
      terrain: "plains",
      towerCount: 2,
      spawnCount: 1,
      hasPortal: true
    });
  });
});
