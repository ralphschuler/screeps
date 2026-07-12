import { assert } from "chai";
import type { EmpireMemory, IncomingNukeAlert, NukeInFlight } from "../src/schemas/empireSchemas.ts";
import { MemoryPruner } from "../src/pruner.ts";

const createNukeAlert = (impactTick: number): IncomingNukeAlert => ({
  nukeId: `nuke-${impactTick}`,
  roomName: "W1N1",
  landingPos: { x: 25, y: 25 },
  impactTick,
  timeToLand: Math.max(0, impactTick - 1000),
  detectedAt: 500,
  evacuationTriggered: false
});

const createNukeInFlight = (impactTick: number): NukeInFlight => ({
  id: `nuke-${impactTick}`,
  sourceRoom: "W2N2",
  targetRoom: "W1N1",
  targetPos: { x: 25, y: 25 },
  launchTick: 0,
  impactTick
});

describe("MemoryPruner nuke tracking", () => {
  let pruner: MemoryPruner;

  beforeEach(() => {
    (globalThis as any).Game = {
      time: 1000,
      rooms: {},
      creeps: {},
      getObjectById: () => null
    };
    (globalThis as any).Memory = { creeps: {}, rooms: {} };
    pruner = new MemoryPruner();
  });

  it("removes expired nuke records while preserving current and future impacts", () => {
    const empire = {
      nukesInFlight: [
        createNukeInFlight(999),
        createNukeInFlight(1000),
        createNukeInFlight(1001)
      ],
      incomingNukes: [
        createNukeAlert(999),
        createNukeAlert(1000),
        createNukeAlert(1001)
      ]
    } as EmpireMemory;
    (globalThis as any).Memory.empire = empire;

    const pruned = pruner.pruneOldNukes();

    assert.equal(pruned, 2);
    assert.deepEqual(empire.nukesInFlight?.map(nuke => nuke.impactTick), [1000, 1001]);
    assert.deepEqual(empire.incomingNukes?.map(alert => alert.impactTick), [1000, 1001]);
    assert.equal(Object.keys(empire.nukesInFlight ?? {}).length, 2);
  });

  it("runs nuke cleanup through the regular pruneAll maintenance path", () => {
    const empire = {
      nukesInFlight: [createNukeInFlight(999)],
      incomingNukes: [createNukeAlert(999)]
    } as EmpireMemory;
    (globalThis as any).Memory.empire = empire;

    pruner.pruneAll();

    assert.deepEqual(empire.nukesInFlight, []);
    assert.deepEqual(empire.incomingNukes, []);
  });

  it("handles missing empire and nuke arrays safely", () => {
    assert.equal(pruner.pruneOldNukes(), 0);

    (globalThis as any).Memory.empire = {};
    assert.equal(pruner.pruneOldNukes(), 0);
  });
});
