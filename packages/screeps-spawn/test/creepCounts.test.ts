import { expect } from "chai";
import {
  countCreepsByRole,
  countCreepsOfRole,
  countRemoteCreepsByTargetRoom
} from "../src/spawnNeedsAnalyzer";

function createCreep(memory: Partial<CreepMemory>, spawning = false): Creep {
  return { memory, spawning } as Creep;
}

describe("spawn creep count helpers", () => {
  beforeEach(() => {
    Game.time = 1000;
    Game.creeps = {};
  });

  it("counts home-room roles while active counts exclude spawning creeps", () => {
    Game.creeps = {
      harvester1: createCreep({ role: "harvester", homeRoom: "E1N1" }),
      harvester2: createCreep({ role: "harvester", homeRoom: "E1N1" }, true),
      unnamedRole: createCreep({ homeRoom: "E1N1" }),
      otherRoom: createCreep({ role: "harvester", homeRoom: "E2N1" })
    };

    const total = countCreepsByRole("E1N1");
    const active = countCreepsByRole("E1N1", true);

    expect(total.get("harvester")).to.equal(2);
    expect(total.get("unknown")).to.equal(1);
    expect(active.get("harvester")).to.equal(1);
    expect(active.get("unknown")).to.equal(1);
    expect(countCreepsOfRole("E1N1", "harvester")).to.equal(2);
  });

  it("invalidates per-tick caches when Game.creeps changes or the tick advances", () => {
    Game.creeps = {
      worker1: createCreep({ role: "worker", homeRoom: "E1N1" })
    };
    expect(countCreepsOfRole("E1N1", "worker")).to.equal(1);

    Game.creeps = {
      ...Game.creeps,
      worker2: createCreep({ role: "worker", homeRoom: "E1N1" })
    };
    expect(countCreepsOfRole("E1N1", "worker")).to.equal(2);

    Game.creeps.worker3 = createCreep({ role: "worker", homeRoom: "E1N1" });
    Game.time += 1;
    expect(countCreepsOfRole("E1N1", "worker")).to.equal(3);
  });

  it("counts remote creeps by home room, role, and assigned target room", () => {
    Game.creeps = {
      remoteA: createCreep({ role: "remoteHarvester", homeRoom: "E1N1", targetRoom: "E2N1" }),
      remoteB: createCreep({ role: "remoteHarvester", homeRoom: "E1N1", targetRoom: "E2N1" }),
      remoteC: createCreep({ role: "remoteHarvester", homeRoom: "E1N1", targetRoom: "E3N1" }),
      remoteD: createCreep({ role: "remoteHarvester", homeRoom: "E4N1", targetRoom: "E2N1" }),
      guard: createCreep({ role: "remoteGuard", homeRoom: "E1N1", targetRoom: "E2N1" })
    };

    expect(countRemoteCreepsByTargetRoom("E1N1", "remoteHarvester", "E2N1")).to.equal(2);
  });
});
