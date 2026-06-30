import { expect } from "chai";
import type { ClusterMemory } from "../src/types.ts";

let findAttackTargets: typeof import("../src/attackTargetSelector.ts").findAttackTargets;

function installGlobals(): void {
  (global as any).STRUCTURE_SPAWN = "spawn";
  (global as any).STRUCTURE_EXTENSION = "extension";
  (global as any).STRUCTURE_ROAD = "road";
  (global as any).STRUCTURE_WALL = "constructedWall";
  (global as any).STRUCTURE_RAMPART = "rampart";
  (global as any).STRUCTURE_CONTROLLER = "controller";
  (global as any).STRUCTURE_TOWER = "tower";
  (global as any).STRUCTURE_STORAGE = "storage";
  (global as any).STRUCTURE_TERMINAL = "terminal";
  (global as any).STRUCTURE_LINK = "link";
  (global as any).STRUCTURE_LAB = "lab";
  (global as any).STRUCTURE_CONTAINER = "container";
  (global as any).STRUCTURE_FACTORY = "factory";
  (global as any).STRUCTURE_POWER_SPAWN = "powerSpawn";
  (global as any).STRUCTURE_NUKER = "nuker";
  (global as any).STRUCTURE_OBSERVER = "observer";
  (global as any).RESOURCE_ENERGY = "energy";
  (global as any).RESOURCE_POWER = "power";
  (global as any).RESOURCE_OPS = "ops";
  (global as any).RESOURCE_HYDROGEN = "H";
  (global as any).RESOURCE_OXYGEN = "O";
  (global as any).RESOURCE_UTRIUM = "U";
  (global as any).RESOURCE_LEMERGIUM = "L";
  (global as any).RESOURCE_KEANIUM = "K";
  (global as any).RESOURCE_ZYNTHIUM = "Z";
  (global as any).RESOURCE_CATALYST = "X";
  (global as any).RESOURCE_GHODIUM = "G";
  (global as any).RESOURCE_CATALYZED_GHODIUM_ACID = "XGH2O";
  (global as any).RESOURCE_CATALYZED_LEMERGIUM_ACID = "XLH2O";
  (global as any).RESOURCE_CATALYZED_UTRIUM_ACID = "XUH2O";
  (global as any).RESOURCE_CATALYZED_KEANIUM_ACID = "XKH2O";
  (global as any).RESOURCE_CATALYZED_ZYNTHIUM_ACID = "XZH2O";
  (global as any).RESOURCE_CATALYZED_UTRIUM_ALKALIDE = "XUH2O";
  (global as any).RESOURCE_CATALYZED_KEANIUM_ALKALIDE = "XKH2O";
  (global as any).RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE = "XLH2O";
  (global as any).FIND_STRUCTURES = 107;
  (global as any).FIND_HOSTILE_STRUCTURES = 109;
  (global as any).Game = {
    time: 10000,
    spawns: { Spawn1: { owner: { username: "Me" } } },
    map: { getRoomLinearDistance: () => 1 }
  };
  (global as any).Memory = {};
}

function makeCluster(): ClusterMemory {
  return {
    id: "cluster1",
    coreRoom: "W1N1",
    memberRooms: ["W1N1"],
    remoteRooms: [],
    forwardBases: [],
    role: "war",
    metrics: { energyIncome: 0, energyConsumption: 0, energyBalance: 0, warIndex: 100, economyIndex: 80 },
    squads: [],
    rallyPoints: [],
    defenseRequests: [],
    resourceRequests: [],
    lastUpdate: 0
  };
}

describe("Attack target selector confirmed enemy policy", () => {
  before(async () => {
    installGlobals();
    ({ findAttackTargets } = await import("../src/attackTargetSelector.ts"));
  });

  beforeEach(installGlobals);

  it("skips neutral non-allied rooms by default", () => {
    (Memory as any).empire = {
      knownRooms: {
        W2N1: {
          name: "W2N1",
          scouted: true,
          lastSeen: Game.time,
          sources: 2,
          controllerLevel: 4,
          owner: "NeutralPlayer",
          towerCount: 0,
          spawnCount: 1,
          threatLevel: 0,
          isHighway: false,
          isSK: false
        }
      },
      clusters: [],
      warTargets: [],
      ownedRooms: {},
      claimQueue: [],
      nukeCandidates: [],
      powerBanks: [],
      objectives: { expansion: [], military: [], economic: [] }
    };

    expect(findAttackTargets(makeCluster())).to.deep.equal([]);
  });

  it("allows explicit war targets and hostile posture owners", () => {
    (Memory as any).empire = {
      knownRooms: {
        W2N1: {
          name: "W2N1",
          scouted: true,
          lastSeen: Game.time,
          sources: 2,
          controllerLevel: 4,
          owner: "EnemyPlayer",
          towerCount: 0,
          spawnCount: 1,
          threatLevel: 0,
          isHighway: false,
          isSK: false
        },
        W3N1: {
          name: "W3N1",
          scouted: true,
          lastSeen: Game.time,
          sources: 2,
          controllerLevel: 4,
          owner: "Raider",
          towerCount: 0,
          spawnCount: 1,
          threatLevel: 0,
          isHighway: false,
          isSK: false
        }
      },
      clusters: [],
      warTargets: ["EnemyPlayer"],
      playerPostures: {
        threshold: 3,
        windowTicks: 50000,
        players: {
          Raider: { username: "Raider", incidents: [], lastIncidentTick: Game.time, attackCount: 4, state: "war" }
        }
      },
      ownedRooms: {},
      claimQueue: [],
      nukeCandidates: [],
      powerBanks: [],
      objectives: { expansion: [], military: [], economic: [] }
    };

    expect(findAttackTargets(makeCluster()).map(target => target.roomName)).to.have.members(["W2N1", "W3N1"]);
  });

  it("never targets permanent allies even when warTargets contain stale ally entries", () => {
    (Memory as any).empire = {
      knownRooms: {
        W2N1: {
          name: "W2N1",
          scouted: true,
          lastSeen: Game.time,
          sources: 2,
          controllerLevel: 4,
          owner: "TooAngel",
          towerCount: 0,
          spawnCount: 1,
          threatLevel: 0,
          isHighway: false,
          isSK: false
        }
      },
      clusters: [],
      warTargets: ["TooAngel", "W2N1"],
      ownedRooms: {},
      claimQueue: [],
      nukeCandidates: [],
      powerBanks: [],
      objectives: { expansion: [], military: [], economic: [] }
    };

    expect(findAttackTargets(makeCluster())).to.deep.equal([]);
  });
});
