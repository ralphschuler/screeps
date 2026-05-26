import { expect } from "chai";
import { heapCache } from "@ralphschuler/screeps-memory";
import { needsRole } from "@ralphschuler/screeps-spawn";
import { ROLE_DEFINITIONS } from "@ralphschuler/screeps-spawn";

const swarm = {
  colonyLevel: "matureColony",
  posture: "eco",
  danger: 0,
  pheromones: { expand: 0, harvest: 10, build: 0, upgrade: 50, defense: 0, war: 0, siege: 0, logistics: 10, nukeTarget: 0 },
  nextUpdateTick: 0,
  eventLog: [],
  missingStructures: {},
  role: "capital",
  remoteAssignments: [],
  metrics: {}
} as any;

function resetEmpire(): void {
  (global as any).Game = (global as any).Game ?? {};
  (global as any).Memory = (global as any).Memory ?? {};
  (global as any).Game.time = 2000;
  heapCache.clear();
  (global as any).Game.gcl = { level: 2, progress: 0, progressTotal: 1000 };
  (global as any).Game.creeps = {};
  (global as any).Game.rooms = {
    W1N1: {
      name: "W1N1",
      controller: { my: true, level: 8 },
      find: () => []
    }
  };
  (global as any).Memory.empire = {
    knownRooms: {},
    clusters: [],
    warTargets: [],
    ownedRooms: {},
    claimQueue: [{ roomName: "W1N2", claimed: false, score: 100 }],
    nukeCandidates: [],
    powerBanks: [],
    objectives: { targetPowerLevel: 0, targetRoomCount: 1, warMode: false, expansionPaused: false },
    lastUpdate: 2000
  };
}

describe("growth pressure spawning", () => {
  beforeEach(resetEmpire);

  it("raises upgrader spawn pressure in safe mature rooms", () => {
    for (let i = 0; i < 5; i++) {
      (Game.creeps as any)[`upgrader${i}`] = { memory: { role: "upgrader", homeRoom: "W1N1" } };
    }

    expect(needsRole("W1N1", "upgrader", swarm)).to.equal(true);
  });

  it("pushes late-room upgrader pressure beyond the previous cap", () => {
    for (let i = 0; i < 8; i++) {
      (Game.creeps as any)[`upgrader${i}`] = { memory: { role: "upgrader", homeRoom: "W1N1" } };
    }

    expect(needsRole("W1N1", "upgrader", swarm)).to.equal(true);
  });

  it("still caps very aggressive upgrader pressure", () => {
    for (let i = 0; i < 12; i++) {
      (Game.creeps as any)[`upgrader${i}`] = { memory: { role: "upgrader", homeRoom: "W1N1" } };
    }

    expect(needsRole("W1N1", "upgrader", swarm)).to.equal(false);
  });

  it("prioritizes and scales claimers when a GCL slot and claim target exist", () => {
    for (let i = 0; i < 4; i++) {
      (Game.creeps as any)[`claimer${i}`] = { memory: { role: "claimer", homeRoom: "W1N1" } };
    }

    expect(ROLE_DEFINITIONS.claimer.priority).to.equal(95);
    expect(ROLE_DEFINITIONS.claimer.maxPerRoom).to.equal(6);
    expect(needsRole("W1N1", "claimer", swarm)).to.equal(true);
  });
});
