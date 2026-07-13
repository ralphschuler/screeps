import { expect } from "chai";

import {
  getAdjacentRooms,
  isHostileApproachingRoom,
  type TrackedHostileMovement
} from "../src/threat/threatGeometry.ts";

function track(roomName: string, vector?: { dx: number; dy: number }): TrackedHostileMovement {
  return {
    lastPos: { roomName },
    vector
  };
}

describe("ThreatPredictor room approach geometry", () => {
  it("returns valid neighbors across both zero boundaries", () => {
    expect(getAdjacentRooms("W0N0")).to.deep.equal(["W0N1", "W0S0", "E0N0", "W1N0"]);
    expect(getAdjacentRooms("E0S0")).to.deep.equal(["E0N0", "E0S1", "E1S0", "W0S0"]);
    expect(getAdjacentRooms("not-a-room")).to.deep.equal([]);
  });

  it("recognizes movement toward east and west target rooms", () => {
    expect(isHostileApproachingRoom(track("W0N0", { dx: 1, dy: 0 }), "E0N0")).to.equal(true);
    expect(isHostileApproachingRoom(track("E0N0", { dx: -1, dy: 0 }), "W0N0")).to.equal(true);
    expect(isHostileApproachingRoom(track("W0N0", { dx: -1, dy: 0 }), "E0N0")).to.equal(false);
  });

  it("recognizes movement toward north and south target rooms", () => {
    expect(isHostileApproachingRoom(track("E0N1", { dx: 0, dy: 1 }), "E0N0")).to.equal(true);
    expect(isHostileApproachingRoom(track("E0S0", { dx: 0, dy: -1 }), "E0N0")).to.equal(true);
    expect(isHostileApproachingRoom(track("E0N1", { dx: 0, dy: -1 }), "E0N0")).to.equal(false);
  });

  it("does not escalate adjacent hostiles with unknown, stationary, or opposite movement", () => {
    expect(isHostileApproachingRoom(track("W0N0"), "E0N0")).to.equal(false);
    expect(isHostileApproachingRoom(track("W0N0", { dx: 0, dy: 0 }), "E0N0")).to.equal(false);
    expect(isHostileApproachingRoom(track("W0N0", { dx: 1, dy: 1 }), "E0N0")).to.equal(true);
    expect(isHostileApproachingRoom(track("W0N0", { dx: -1, dy: 1 }), "E0N0")).to.equal(false);
    expect(isHostileApproachingRoom(track("W0N0", { dx: 1, dy: 0 }), "E1N0")).to.equal(false);
  });

  it("treats a hostile already inside the target room as present regardless of vector", () => {
    expect(isHostileApproachingRoom(track("E0N0"), "E0N0")).to.equal(true);
  });
});
