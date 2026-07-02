import { expect } from "chai";
import { compileSpawnDemandToRequest, type SpawnDemand } from "../src/spawnIntentCompiler";
import { ROLE_DEFINITIONS } from "../src/roleDefinitions";
import { SpawnPriority } from "../src/spawnQueue";

function createRoom(energyCapacityAvailable: number): Room {
  return {
    name: "E1N1",
    energyAvailable: energyCapacityAvailable,
    energyCapacityAvailable,
    controller: { my: true, level: 3 },
    find: () => []
  } as unknown as Room;
}

function createClaimerDemand(overrides: Partial<SpawnDemand> = {}): SpawnDemand {
  return {
    roleName: "claimer",
    def: ROLE_DEFINITIONS.claimer,
    current: 0,
    target: 1,
    missing: 1,
    priority: SpawnPriority.HIGH,
    targetRoom: "E2N1",
    task: "claim",
    ...overrides
  };
}

describe("spawn intent compiler", () => {
  beforeEach(() => {
    (globalThis as any).Game = {
      time: 1000,
      rooms: {},
      creeps: {},
      spawns: {}
    };
    (globalThis as any).Memory = {};
  });

  it("does not compile a low-energy claimer as a worker-bodied fallback", () => {
    const room = createRoom(300);
    Game.rooms.E1N1 = room;

    const request = compileSpawnDemandToRequest(room, createClaimerDemand());

    expect(request).to.equal(null);
  });

  it("compiles affordable claimers with CLAIM parts", () => {
    const room = createRoom(650);
    Game.rooms.E1N1 = room;

    const request = compileSpawnDemandToRequest(room, createClaimerDemand());

    expect(request).to.not.equal(null);
    expect(request!.body.parts).to.deep.equal([CLAIM, MOVE]);
    expect(request!.targetRoom).to.equal("E2N1");
    expect(request!.additionalMemory?.task).to.equal("claim");
  });

  it("rejects claimer body overrides that lack CLAIM parts", () => {
    const room = createRoom(650);
    Game.rooms.E1N1 = room;

    const request = compileSpawnDemandToRequest(
      room,
      createClaimerDemand({
        bodyOverride: { parts: [WORK, CARRY, MOVE], cost: 200, minCapacity: 200 }
      })
    );

    expect(request).to.equal(null);
  });
});
