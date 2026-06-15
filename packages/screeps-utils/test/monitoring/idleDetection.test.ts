import { expect } from "chai";
import { canSkipBehaviorEvaluation, isTargetStillValid } from "../../src/monitoring/idleDetection.ts";

class MockRoomPosition {
  public constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly roomName: string
  ) {}
}

describe("idle detection utilities", () => {
  beforeEach(() => {
    (globalThis as { RoomPosition?: typeof MockRoomPosition }).RoomPosition = MockRoomPosition;
  });

  it("accepts a state that started on tick zero once it is old enough", () => {
    const targetId = "target-1" as Id<_HasId>;
    const target = { id: targetId, pos: new MockRoomPosition(10, 10, "W1N1") };
    const creep = {
      pos: {
        getRangeTo: () => 1
      }
    } as unknown as Creep;

    (globalThis as { Game?: Partial<Game> }).Game = {
      time: 5,
      getObjectById: id => (id === targetId ? target : null)
    } as Partial<Game>;

    expect(
      canSkipBehaviorEvaluation(creep, { action: "harvest", targetId, startTick: 0 }, "harvester", {
        minStateAge: 3
      })
    ).to.equal(true);
  });

  it("rejects targets outside the requested maximum range", () => {
    const targetId = "target-2" as Id<_HasId>;
    const target = { id: targetId, pos: new MockRoomPosition(15, 15, "W1N1") };
    const creep = {
      pos: {
        getRangeTo: () => 4
      }
    } as unknown as Creep;

    (globalThis as { Game?: Partial<Game> }).Game = {
      time: 10,
      getObjectById: id => (id === targetId ? target : null)
    } as Partial<Game>;

    expect(isTargetStillValid(creep, targetId, 3)).to.equal(false);
  });
});
