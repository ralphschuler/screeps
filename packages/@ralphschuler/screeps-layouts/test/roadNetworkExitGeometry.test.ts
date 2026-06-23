import { expect } from "chai";

class TestRoomPosition {
  public constructor(public x: number, public y: number, public roomName: string) {}

  public getRangeTo(pos: { x: number; y: number }): number {
    return Math.max(Math.abs(this.x - pos.x), Math.abs(this.y - pos.y));
  }
}

describe("roadNetworkExitGeometry", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      RoomPosition: TestRoomPosition,
      TERRAIN_MASK_WALL: 1
    });

    Game.map = {
      getRoomTerrain: () => ({
        get: (x: number, y: number) => (x === 10 && y === 0 ? TERRAIN_MASK_WALL : 0)
      })
    } as unknown as Game["map"];
  });

  it("derives adjacent room exit directions without touching game state", async () => {
    const { getExitDirection } = await import("../src/road-network/exitGeometry.ts");

    expect(getExitDirection("W1N1", "W0N1")).to.equal("right");
    expect(getExitDirection("W1N1", "W2N1")).to.equal("left");
    expect(getExitDirection("W1N1", "W1N0")).to.equal("bottom");
    expect(getExitDirection("W1N1", "W1N2")).to.equal("top");
    expect(getExitDirection("W0N1", "E0N1")).to.equal("right");
    expect(getExitDirection("E0N1", "W0N1")).to.equal("left");
    expect(getExitDirection("W1N0", "W1S0")).to.equal("bottom");
    expect(getExitDirection("W1S0", "W1N0")).to.equal("top");
    expect(getExitDirection("W1N1", "W1N1")).to.equal(null);
    expect(getExitDirection("W1N1", "W0N0")).to.equal(null);
    expect(getExitDirection("W1N1", "E0N1")).to.equal(null);
    expect(getExitDirection("not-a-room", "W1N1")).to.equal(null);
    expect(getExitDirection("prefix-W1N1", "W1N1")).to.equal(null);
  });

  it("returns walkable exit tiles and protects near-exit positions", async () => {
    const { getExitPositions, isNearExit } = await import("../src/road-network/exitGeometry.ts");

    const positions = getExitPositions("W1N1", "top");

    expect(positions).to.have.length(49);
    expect(positions.some(pos => pos.x === 10 && pos.y === 0)).to.equal(false);
    expect(isNearExit(new RoomPosition(3, 20, "W1N1"), 3)).to.equal(true);
    expect(isNearExit(new RoomPosition(4, 20, "W1N1"), 3)).to.equal(false);
  });

  it("chooses the closest exit by room range", async () => {
    const { findClosestExit } = await import("../src/road-network/exitGeometry.ts");

    const closest = findClosestExit(new RoomPosition(25, 25, "W1N1"), [
      new RoomPosition(0, 10, "W1N1"),
      new RoomPosition(40, 25, "W1N1")
    ]);

    expect(closest?.x).to.equal(40);
    expect(closest?.y).to.equal(25);
    expect(findClosestExit(new RoomPosition(25, 25, "W1N1"), [])).to.equal(null);
  });
});
