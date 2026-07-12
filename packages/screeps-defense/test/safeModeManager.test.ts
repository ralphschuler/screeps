import { assert } from "chai";
import type { SwarmState } from "@ralphschuler/screeps-memory";
import { SafeModeManager } from "../src";

function createSwarm(danger = 2): SwarmState {
  return {
    posture: "defensive",
    danger,
    pheromones: {},
    eventLog: [],
    missingStructures: {},
    metrics: {},
    lastUpdate: Game.time
  } as unknown as SwarmState;
}

function createHostile(parts: BodyPartConstant[]): Creep {
  return {
    owner: { username: "Invader" },
    room: { name: "W1N1" },
    body: parts.map(type => ({ type, hits: 100 }))
  } as unknown as Creep;
}

function createRoom(hostiles: Creep[], defenders: Creep[] = []): { room: Room; getSafeModeCalls: () => number } {
  let safeModeCalls = 0;
  const spawn = { name: "Spawn1", hits: 5000, hitsMax: 5000 } as StructureSpawn;
  const controller = {
    my: true,
    safeModeAvailable: 1,
    activateSafeMode: () => {
      safeModeCalls++;
      return OK;
    }
  } as unknown as StructureController;

  const room = {
    name: "W1N1",
    controller,
    find: (type: FindConstant) => {
      if (type === FIND_HOSTILE_CREEPS) return hostiles;
      if (type === FIND_MY_SPAWNS) return [spawn];
      if (type === FIND_MY_CREEPS) return defenders;
      return [];
    }
  } as unknown as Room;

  return { room, getSafeModeCalls: () => safeModeCalls };
}

describe("safe mode manager", () => {
  beforeEach(() => {
    (global as any).Memory = { creeps: {}, rooms: {}, spawns: {}, flags: {}, powerCreeps: {} };
  });

  it("does not spend safe mode on a non-dangerous scout creep by default", () => {
    const { room, getSafeModeCalls } = createRoom([createHostile([MOVE])]);

    new SafeModeManager().checkSafeMode(room, createSwarm(2));

    assert.equal(getSafeModeCalls(), 0);
  });

  it("still activates safe mode when dangerous hostiles overwhelm the room", () => {
    const { room, getSafeModeCalls } = createRoom([createHostile([ATTACK, MOVE])]);

    new SafeModeManager().checkSafeMode(room, createSwarm(2));

    assert.equal(getSafeModeCalls(), 1);
  });

  it("activates safe mode for high-WORK siege hostiles even with one defender", () => {
    const defender = { memory: { role: "guard" }, body: [{ type: ATTACK, hits: 100 }] } as unknown as Creep;
    const { room, getSafeModeCalls } = createRoom([createHostile([WORK, WORK, WORK, WORK, WORK, MOVE])], [defender]);

    new SafeModeManager().checkSafeMode(room, createSwarm(3));

    assert.equal(getSafeModeCalls(), 1);
  });

  it("does not let spawning or disarmed defenders suppress safe mode", () => {
    const defenders = [
      { spawning: true, hits: 100, memory: { role: "guard" }, body: [{ type: ATTACK, hits: 100 }] },
      { spawning: false, hits: 100, memory: { role: "ranger" }, body: [{ type: RANGED_ATTACK, hits: 0 }] },
    ] as unknown as Creep[];
    const { room, getSafeModeCalls } = createRoom([createHostile([ATTACK, MOVE])], defenders);

    new SafeModeManager().checkSafeMode(room, createSwarm(3));

    assert.equal(getSafeModeCalls(), 1);
  });

  it("can disable dangerous-hostile gating through Memory", () => {
    (Memory as any).defenseSettings = { safeModeDangerousHostilesOnly: false };
    const { room, getSafeModeCalls } = createRoom([createHostile([MOVE])]);

    new SafeModeManager().checkSafeMode(room, createSwarm(2));

    assert.equal(getSafeModeCalls(), 1);
  });
});
