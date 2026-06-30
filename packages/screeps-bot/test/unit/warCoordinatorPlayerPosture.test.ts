import { expect } from "chai";
import type { EmpireMemory } from "@ralphschuler/screeps-memory";
import { WarCoordinator } from "../../src/empire/warCoordinator";

function createRoomIntel(overrides: Partial<EmpireMemory["knownRooms"][string]> = {}): any {
  return {
    name: "W0N0",
    owner: "Enemy",
    reserver: undefined,
    sources: 2,
    mineral: undefined,
    lastSeen: Game.time,
    scouted: true,
    threatLevel: 0,
    isHighway: false,
    isSK: false,
    hasPortal: false,
    ...overrides
  };
}

function empire(): EmpireMemory {
  return {
    knownRooms: {
      W2N2: createRoomIntel({
        name: "W2N2",
        owner: "Enemy",
        threatLevel: 0
      })
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
      ...mem.knownRooms["W2N2"],
      name: "W1N1",
      owner: "me"
    };
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

  it("never keeps allied players or allied-owned rooms as war targets", () => {
    const mem = empire();
    mem.warTargets = ["TooAngel"];
    mem.knownRooms.W9N9 = createRoomIntel({
      name: "W9N9",
      owner: "TooAngel",
      threatLevel: 5,
      controllerLevel: 8,
      towerCount: 6,
      spawnCount: 3
    });
    mem.playerPostures!.players.TooAngel = {
      username: "TooAngel",
      incidents: [],
      lastIncidentTick: Game.time,
      attackCount: 3,
      state: "war",
      warDeclaredAt: Game.time
    };

    new WarCoordinator().updateWarTargets(mem);

    expect(mem.warTargets).to.not.include("TooAngel");
    expect(mem.warTargets).to.not.include("W9N9");
  });

  it("requires visible threat before adding proactive war targets outside war mode", () => {
    const mem = empire();
    mem.objectives.warMode = false;
    mem.warTargets = [];
    mem.knownRooms = {
      W2N2: createRoomIntel({ name: "W2N2", owner: "Enemy", threatLevel: 1, controllerLevel: 3 }),
      W3N3: createRoomIntel({ name: "W3N3", owner: "Enemy", threatLevel: 2, controllerLevel: 1 })
    };

    new WarCoordinator().updateWarTargets(mem);

    expect(mem.warTargets).to.deep.equal(["W3N3"]);
  });

  it("ranks proactive targets by strategic score and keeps top candidates", () => {
    const mem = empire();
    mem.objectives.warMode = true;
    mem.warTargets = [];
    mem.knownRooms = {
      W2N2: createRoomIntel({
        name: "W2N2",
        owner: "Enemy",
        threatLevel: 0,
        controllerLevel: 8,
        towerCount: 2,
        spawnCount: 1
      }),
      W3N3: createRoomIntel({
        name: "W3N3",
        owner: "Enemy",
        threatLevel: 0,
        controllerLevel: 3,
        towerCount: 4,
        spawnCount: 2
      }),
      W4N4: createRoomIntel({
        name: "W4N4",
        owner: "Enemy",
        threatLevel: 3,
        controllerLevel: 1,
        towerCount: 0,
        spawnCount: 0
      }),
      W5N5: createRoomIntel({
        name: "W5N5",
        owner: "Enemy",
        threatLevel: 1,
        controllerLevel: 8,
        towerCount: 0,
        spawnCount: 0
      }),
      W6N6: createRoomIntel({
        name: "W6N6",
        owner: "Enemy",
        threatLevel: 2,
        controllerLevel: 5,
        towerCount: 1,
        spawnCount: 3
      }),
      W7N7: createRoomIntel({
        name: "W7N7",
        owner: "Enemy",
        threatLevel: 1,
        controllerLevel: 2,
        towerCount: 3,
        spawnCount: 0
      })
    };

    (global as any).Game.map = {
      getRoomLinearDistance: roomName => {
        if (roomName === "W2N2") return 1;
        return 2;
      }
    };

    new WarCoordinator().updateWarTargets(mem);

    expect(mem.warTargets.length).to.equal(5);
    expect(mem.warTargets[0]).to.equal("W2N2");
  });
});
