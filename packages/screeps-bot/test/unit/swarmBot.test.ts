import { expect } from "chai";

import { __testing } from "../../src/SwarmBot";
import { Game as MockGame } from "./mock";

describe("SwarmBot creep prioritization", () => {
  beforeEach(() => {
    // @ts-ignore allow overriding the global Game object for tests
    global.Game = { ...MockGame, creeps: {}, rooms: {} };
  });

  it("orders creeps by priority using counting buckets", () => {
    const high = { spawning: false, memory: { role: "harvester" } } as unknown as Creep;
    const mid = { spawning: false, memory: { role: "builder" } } as unknown as Creep;
    const defaultPriority = { spawning: false, memory: { role: "unknownRole" } } as unknown as Creep;
    const low = { spawning: false, memory: { role: "labTech" } } as unknown as Creep;

    // @ts-ignore test setup
    global.Game.creeps = { high, mid, defaultPriority, low };

    const { creeps, skippedLow } = __testing.getPrioritizedCreeps(false);

    const priorities = creeps.map(creep => __testing.getCreepPriority(creep));

    expect(priorities).to.deep.equal([100, 60, 50, 10]);
    expect(skippedLow).to.equal(0);
  });

  it("skips low-priority creeps when low bucket optimization is enabled", () => {
    const high = { spawning: false, memory: { role: "harvester" } } as unknown as Creep;
    const low = { spawning: false, memory: { role: "labTech" } } as unknown as Creep;

    // @ts-ignore test setup
    global.Game.creeps = { high, low };

    const { creeps, skippedLow } = __testing.getPrioritizedCreeps(true);

    expect(creeps.map(creep => creep.memory.role)).to.deep.equal(["harvester"]);
    expect(skippedLow).to.equal(1);
  });
});
