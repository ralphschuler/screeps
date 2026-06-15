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

function createRoom(hostiles: Creep[]): { room: Room; getSafeModeCalls: () => number } {
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
      if (type === FIND_MY_CREEPS) return [];
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

  it("can disable dangerous-hostile gating through Memory", () => {
    (Memory as any).defenseSettings = { safeModeDangerousHostilesOnly: false };
    const { room, getSafeModeCalls } = createRoom([createHostile([MOVE])]);

    new SafeModeManager().checkSafeMode(room, createSwarm(2));

    assert.equal(getSafeModeCalls(), 1);
  });
});
