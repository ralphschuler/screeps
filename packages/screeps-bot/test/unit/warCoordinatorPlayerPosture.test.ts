import { expect } from "chai";
import type { EmpireMemory } from "@ralphschuler/screeps-memory";
import { WarCoordinator } from "../../src/empire/warCoordinator";

function empire(): EmpireMemory {
  return {
    knownRooms: {
      W2N2: {
        name: "W2N2",
        owner: "Enemy",
        reserver: undefined,
        sources: 2,
        mineral: undefined,
        lastScouted: Game.time,
        scouted: true,
        threatLevel: 0,
        expansionScore: 0,
        remoteScore: 0,
        distance: 1,
        exits: [],
        isHighway: false,
        isSK: false,
        hasPortal: false
      } as any
    },
    clusters: [],
    warTargets: ["Enemy"],
    ownedRooms: {},
    claimQueue: [],
    nukeCandidates: [],
    powerBanks: [],
    playerPostures: {
      players: {
        Enemy: {
          username: "Enemy",
          incidents: [],
          lastIncidentTick: Game.time,
          attackCount: 3,
          state: "war",
          warDeclaredAt: Game.time
        }
      },
      threshold: 3,
      windowTicks: 20000
    },
    objectives: { targetPowerLevel: 0, targetRoomCount: 1, warMode: true, expansionPaused: false },
    lastUpdate: Game.time
  };
}

describe("WarCoordinator player posture targets", () => {
  beforeEach(() => {
    (global as any).Game = (global as any).Game ?? {};
    (global as any).Game.time = 3000;
    (global as any).Game.rooms = {
      W1N1: { name: "W1N1", controller: { my: true, owner: { username: "me" } } }
    };
    (global as any).Game.spawns = {
      Spawn1: { owner: { username: "me" } }
    };
    (global as any).Game.map = {
      getRoomLinearDistance: () => 1
    };
  });

  it("preserves player war posture targets and resolves owned rooms", () => {
    const mem = empire();
    new WarCoordinator().updateWarTargets(mem);

    expect(mem.warTargets).to.include("Enemy");
    expect(mem.warTargets).to.include("W2N2");
  });

  it("does not resolve self war posture entries into owned room targets", () => {
    const mem = empire();
    mem.knownRooms.W1N1 = {
      ...mem.knownRooms.W2N2,
      name: "W1N1",
      owner: "me"
    } as any;
    mem.playerPostures!.players.me = {
      username: "me",
      incidents: [],
      lastIncidentTick: Game.time,
      attackCount: 3,
      state: "war",
      warDeclaredAt: Game.time
    };

    new WarCoordinator().updateWarTargets(mem);

    expect(mem.warTargets).to.not.include("W1N1");
  });
});
