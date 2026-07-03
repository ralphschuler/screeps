import { expect } from "chai";
import type { ClusterMemory } from "../src/types.ts";

let findAttackTargets: typeof import("../src/attackTargetSelector.ts").findAttackTargets;
let validateTarget: typeof import("../src/attackTargetSelector.ts").validateTarget;
let launchOffensiveOperation: typeof import("../src/offensiveOperations.ts").launchOffensiveOperation;

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
  (global as any).STRUCTURE_EXTRACTOR = "extractor";
  (global as any).STRUCTURE_POWER_SPAWN = "powerSpawn";
  (global as any).STRUCTURE_NUKER = "nuker";
  (global as any).STRUCTURE_OBSERVER = "observer";
  (global as any).STRUCTURE_INVADER_CORE = "invaderCore";
  (global as any).STRUCTURE_KEEPER_LAIR = "keeperLair";
  (global as any).STRUCTURE_PORTAL = "portal";
  (global as any).STRUCTURE_POWER_BANK = "powerBank";
  for (const structure of [
    "STRUCTURE_CONTAINER", "STRUCTURE_CONTROLLER", "STRUCTURE_EXTENSION", "STRUCTURE_EXTRACTOR", "STRUCTURE_FACTORY",
    "STRUCTURE_INVADER_CORE", "STRUCTURE_KEEPER_LAIR", "STRUCTURE_LAB", "STRUCTURE_LINK", "STRUCTURE_NUKER",
    "STRUCTURE_OBSERVER", "STRUCTURE_PORTAL", "STRUCTURE_POWER_BANK", "STRUCTURE_POWER_SPAWN", "STRUCTURE_RAMPART",
    "STRUCTURE_ROAD", "STRUCTURE_SPAWN", "STRUCTURE_STORAGE", "STRUCTURE_TERMINAL", "STRUCTURE_TOWER", "STRUCTURE_WALL"
  ]) {
    (global as any)[structure] ??= structure.replace("STRUCTURE_", "").toLowerCase();
  }
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
  (global as any).RESOURCE_CATALYZED_UTRIUM_ALKALIDE = "XUHO2";
  (global as any).RESOURCE_CATALYZED_KEANIUM_ALKALIDE = "XKHO2";
  (global as any).RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE = "XLHO2";
  (global as any).RESOURCE_CATALYZED_GHODIUM_ALKALIDE = "XGHO2";
  (global as any).RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE = "XZHO2";
  for (const resource of [
    "RESOURCE_ALLOY", "RESOURCE_BATTERY", "RESOURCE_BIOMASS", "RESOURCE_CELL", "RESOURCE_CIRCUIT",
    "RESOURCE_COMPOSITE", "RESOURCE_CONCENTRATE", "RESOURCE_CONDENSATE", "RESOURCE_CRYSTAL", "RESOURCE_DEVICE",
    "RESOURCE_EMANATION", "RESOURCE_ESSENCE", "RESOURCE_EXTRACT", "RESOURCE_FRAME", "RESOURCE_GHODIUM_ACID",
    "RESOURCE_GHODIUM_ALKALIDE", "RESOURCE_GHODIUM_HYDRIDE", "RESOURCE_GHODIUM_MELT", "RESOURCE_GHODIUM_OXIDE",
    "RESOURCE_HYDRAULICS", "RESOURCE_HYDROXIDE", "RESOURCE_KEANIUM_ACID", "RESOURCE_KEANIUM_ALKALIDE",
    "RESOURCE_KEANIUM_BAR", "RESOURCE_KEANIUM_HYDRIDE", "RESOURCE_KEANIUM_OXIDE", "RESOURCE_LEMERGIUM_ACID",
    "RESOURCE_LEMERGIUM_ALKALIDE", "RESOURCE_LEMERGIUM_BAR", "RESOURCE_LEMERGIUM_HYDRIDE",
    "RESOURCE_LEMERGIUM_OXIDE", "RESOURCE_LIQUID", "RESOURCE_MACHINE", "RESOURCE_METAL", "RESOURCE_MICROCHIP",
    "RESOURCE_MIST", "RESOURCE_MUSCLE", "RESOURCE_ORGANISM", "RESOURCE_ORGANOID", "RESOURCE_OXIDANT",
    "RESOURCE_PHLEGM", "RESOURCE_PURIFIER", "RESOURCE_REDUCTANT", "RESOURCE_SILICON", "RESOURCE_SPIRIT",
    "RESOURCE_SWITCH", "RESOURCE_TISSUE", "RESOURCE_TRANSISTOR", "RESOURCE_TUBE", "RESOURCE_UTRIUM_ACID",
    "RESOURCE_UTRIUM_ALKALIDE", "RESOURCE_UTRIUM_BAR", "RESOURCE_UTRIUM_HYDRIDE", "RESOURCE_UTRIUM_LEMERGITE",
    "RESOURCE_UTRIUM_OXIDE", "RESOURCE_WIRE", "RESOURCE_ZYNTHIUM_ACID", "RESOURCE_ZYNTHIUM_ALKALIDE",
    "RESOURCE_ZYNTHIUM_BAR", "RESOURCE_ZYNTHIUM_HYDRIDE", "RESOURCE_ZYNTHIUM_KEANITE", "RESOURCE_ZYNTHIUM_OXIDE"
  ]) {
    (global as any)[resource] ??= resource.replace("RESOURCE_", "").toLowerCase();
  }
  (global as any).FIND_SOURCES = 105;
  (global as any).FIND_MINERALS = 116;
  (global as any).FIND_DEPOSITS = 122;
  (global as any).FIND_STRUCTURES = 107;
  (global as any).FIND_MY_STRUCTURES = 108;
  (global as any).FIND_HOSTILE_STRUCTURES = 109;
  (global as any).FIND_MY_SPAWNS = 112;
  (global as any).FIND_MY_CONSTRUCTION_SITES = 114;
  (global as any).FIND_CONSTRUCTION_SITES = 111;
  (global as any).FIND_CREEPS = 101;
  (global as any).FIND_MY_CREEPS = 102;
  (global as any).FIND_HOSTILE_CREEPS = 103;
  (global as any).FIND_DROPPED_RESOURCES = 106;
  (global as any).FIND_TOMBSTONES = 119;
  (global as any).FIND_RUINS = 123;
  (global as any).FIND_FLAGS = 110;
  (global as any).FIND_NUKES = 117;
  (global as any).FIND_POWER_CREEPS = 120;
  (global as any).FIND_MY_POWER_CREEPS = 121;
  (global as any).LOOK_STRUCTURES = "structure";
  for (const look of [
    "LOOK_CONSTRUCTION_SITES", "LOOK_CREEPS", "LOOK_DEPOSITS", "LOOK_ENERGY", "LOOK_FLAGS", "LOOK_MINERALS",
    "LOOK_NUKES", "LOOK_POWER_CREEPS", "LOOK_RESOURCES", "LOOK_RUINS", "LOOK_SOURCES", "LOOK_STRUCTURES",
    "LOOK_TERRAIN", "LOOK_TOMBSTONES"
  ]) {
    (global as any)[look] ??= look.replace("LOOK_", "").toLowerCase();
  }
  (global as any).OK = 0;
  (global as any).ERR_NOT_ENOUGH_ENERGY = -6;
  (global as any).ERR_BUSY = -4;
  (global as any).ERR_NOT_FOUND = -5;
  (global as any).ERR_INVALID_ARGS = -10;
  (global as any).MOVE = "move";
  (global as any).WORK = "work";
  (global as any).CARRY = "carry";
  (global as any).ATTACK = "attack";
  (global as any).RANGED_ATTACK = "ranged_attack";
  (global as any).HEAL = "heal";
  (global as any).CLAIM = "claim";
  (global as any).TOUGH = "tough";
  (global as any).Game = {
    time: 10000,
    spawns: { Spawn1: { owner: { username: "Me" } } },
    creeps: {},
    rooms: {
      W1N1: {
        name: "W1N1",
        controller: { my: true },
        storage: { store: { energy: 200_000 } },
        terminal: { store: { energy: 0 } },
        energyCapacityAvailable: 3000
      }
    },
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

function makeRoomIntel(roomName: string, owner: string, lastSeen = Game.time): any {
  return {
    name: roomName,
    scouted: true,
    lastSeen,
    sources: 2,
    controllerLevel: 4,
    owner,
    towerCount: 0,
    spawnCount: 1,
    threatLevel: 0,
    terrain: "plains",
    isHighway: false,
    isSK: false
  };
}

function setEmpireForTarget(roomName: string, owner: string, warTargets: string[] = [owner]): void {
  (Memory as any).empire = {
    knownRooms: {
      [roomName]: makeRoomIntel(roomName, owner)
    },
    clusters: [],
    warTargets,
    ownedRooms: {},
    claimQueue: [],
    nukeCandidates: [],
    powerBanks: [],
    objectives: { expansion: [], military: [], economic: [] }
  };
}

describe("Attack target selector confirmed enemy policy", () => {
  before(async () => {
    installGlobals();
    ({ findAttackTargets, validateTarget } = await import("../src/attackTargetSelector.ts"));
    ({ launchOffensiveOperation } = await import("../src/offensiveOperations.ts"));
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

  it("never targets configured allies even when warTargets contain stale ally entries", () => {
    (Memory as any).empire = {
      diplomacy: { allies: ["FriendlyNeighbor"] },
      knownRooms: {
        W2N1: {
          name: "W2N1",
          scouted: true,
          lastSeen: Game.time,
          sources: 2,
          controllerLevel: 4,
          owner: "FriendlyNeighbor",
          towerCount: 0,
          spawnCount: 1,
          threatLevel: 3,
          isHighway: false,
          isSK: false
        }
      },
      clusters: [],
      warTargets: ["FriendlyNeighbor", "W2N1"],
      ownedRooms: {},
      claimQueue: [],
      nukeCandidates: [],
      powerBanks: [],
      objectives: { expansion: [], military: [], economic: [] }
    };

    expect(findAttackTargets(makeCluster())).to.deep.equal([]);
  });

  for (const allyName of ["TooAngel", "TedRoastBeef"]) {
    it(`refuses manual offensive launch against permanent ally ${allyName}`, () => {
      setEmpireForTarget("W2N1", allyName, [allyName, "W2N1"]);
      const cluster = makeCluster();

      expect(validateTarget("W2N1")).to.equal(false);
      expect(launchOffensiveOperation(cluster, "W2N1", "harassment")).to.equal(null);
      expect(cluster.squads).to.deep.equal([]);
      expect((Memory as any).empire.offensiveOperations).to.equal(undefined);
      expect((Memory as any).lastAttacked).to.equal(undefined);
    });
  }

  it("refuses manual offensive launch against runtime configured allies", () => {
    setEmpireForTarget("W2N1", "FriendlyNeighbor", ["FriendlyNeighbor", "W2N1"]);
    (Memory as any).empire.diplomacy = { allies: ["FriendlyNeighbor"] };
    const cluster = makeCluster();

    expect(validateTarget("W2N1")).to.equal(false);
    expect(launchOffensiveOperation(cluster, "W2N1", "harassment")).to.equal(null);
    expect(cluster.squads).to.deep.equal([]);
    expect((Memory as any).empire.offensiveOperations).to.equal(undefined);
  });

  it("refuses manual offensive launch for unconfirmed targets", () => {
    setEmpireForTarget("W2N1", "NeutralPlayer", []);
    const cluster = makeCluster();

    expect(validateTarget("W2N1")).to.equal(false);
    expect(launchOffensiveOperation(cluster, "W2N1", "harassment")).to.equal(null);
    expect(cluster.squads).to.deep.equal([]);
    expect((Memory as any).empire.offensiveOperations).to.equal(undefined);
  });

  it("refuses manual offensive launch with stale intel", () => {
    setEmpireForTarget("W2N1", "EnemyPlayer", ["EnemyPlayer"]);
    (Memory as any).empire.knownRooms.W2N1.lastSeen = Game.time - 5001;
    const cluster = makeCluster();

    expect(validateTarget("W2N1")).to.equal(false);
    expect(launchOffensiveOperation(cluster, "W2N1", "harassment")).to.equal(null);
    expect(cluster.squads).to.deep.equal([]);
    expect((Memory as any).empire.offensiveOperations).to.equal(undefined);
  });

  it("allows manual offensive launch for confirmed hostile targets", () => {
    setEmpireForTarget("W2N1", "EnemyPlayer", ["EnemyPlayer"]);
    const cluster = makeCluster();

    expect(validateTarget("W2N1")).to.equal(true);
    const operation = launchOffensiveOperation(cluster, "W2N1", "harassment");

    expect(operation).to.include({ clusterId: "cluster1", targetRoom: "W2N1", doctrine: "harassment", state: "forming" });
    expect(cluster.squads).to.have.length(1);
    expect((Memory as any).empire.offensiveOperations[operation!.id]).to.deep.equal(operation);
    expect((Memory as any).lastAttacked.W2N1).to.equal(Game.time);
  });
});
