import { expect } from "chai";
import type { ClusterMemory } from "../src/types.ts";

function installScreepsConstants(): void {
  Object.assign(globalThis, {
    MOVE: "move",
    WORK: "work",
    CARRY: "carry",
    ATTACK: "attack",
    RANGED_ATTACK: "ranged_attack",
    HEAL: "heal",
    TOUGH: "tough",
    CLAIM: "claim",
    RESOURCE_ENERGY: "energy",
    RESOURCE_POWER: "power",
    RESOURCE_UTRIUM: "U",
    RESOURCE_GHODIUM: "G",
    RESOURCE_CATALYZED_GHODIUM_ACID: "XGH2O",
    RESOURCE_CATALYZED_UTRIUM_ACID: "XUH2O",
    RESOURCE_CATALYZED_LEMERGIUM_ACID: "XLH2O",
    RESOURCE_CATALYZED_KEANIUM_ACID: "XKH2O",
    RESOURCE_CATALYZED_ZYNTHIUM_ACID: "XZH2O",
    RESOURCE_OPS: "ops",
    FIND_MY_CREEPS: 101,
    FIND_HOSTILE_CREEPS: 102,
    FIND_MY_SPAWNS: 103,
    FIND_MY_STRUCTURES: 104,
    FIND_SOURCES: 105,
    FIND_SOURCES_ACTIVE: 106,
    FIND_MINERALS: 107,
    FIND_MY_CONSTRUCTION_SITES: 108,
    FIND_STRUCTURES: 109,
    FIND_HOSTILE_POWER_CREEPS: 110,
    FIND_HOSTILE_STRUCTURES: 111,
    FIND_NUKES: 112,
    FIND_DEPOSITS: 113,
    FIND_CONSTRUCTION_SITES: 114,
    FIND_CREEPS: 115,
    FIND_DROPPED_RESOURCES: 116,
    FIND_TOMBSTONES: 117,
    FIND_RUINS: 118,
    FIND_FLAGS: 119,
    FIND_POWER_CREEPS: 120,
    FIND_MY_POWER_CREEPS: 121,
    STRUCTURE_SPAWN: "spawn",
    STRUCTURE_STORAGE: "storage",
    STRUCTURE_TERMINAL: "terminal",
    STRUCTURE_EXTENSION: "extension",
    STRUCTURE_ROAD: "road",
    STRUCTURE_TOWER: "tower",
    STRUCTURE_RAMPART: "rampart",
    STRUCTURE_WALL: "constructedWall",
    STRUCTURE_CONTAINER: "container",
    STRUCTURE_LINK: "link",
    STRUCTURE_LAB: "lab",
    STRUCTURE_FACTORY: "factory",
    STRUCTURE_POWER_SPAWN: "powerSpawn",
    STRUCTURE_NUKER: "nuker",
    STRUCTURE_OBSERVER: "observer",
    STRUCTURE_EXTRACTOR: "extractor"
  });
  (globalThis as any).Game = {
    time: 0,
    rooms: {},
    creeps: {},
    spawns: {},
    gcl: { level: 1 },
    cpu: { getUsed: () => 0, bucket: 10000, limit: 100 }
  };
  (globalThis as any).Memory = {};
}

function clusterWithAttack(): ClusterMemory {
  return {
    id: "cluster_W1N1",
    coreRoom: "W1N1",
    memberRooms: ["W1N1", "W2N1", "W4N1"],
    remoteRooms: [],
    forwardBases: [],
    role: "mixed",
    metrics: {
      energyIncome: 0,
      energyConsumption: 0,
      energyBalance: 0,
      warIndex: 0,
      economyIndex: 0,
      militaryReadiness: 0,
      roomCount: 3,
      averageRCL: 4
    },
    rallyPoints: [],
    squads: [],
    defenseRequests: [
      {
        roomName: "W1N1",
        guardsNeeded: 1,
        rangersNeeded: 1,
        healersNeeded: 0,
        urgency: 2,
        createdAt: 1000,
        threat: "hostile creep attacking structures",
        assignedCreeps: []
      }
    ],
    resourceRequests: [],
    lastUpdate: 1000
  } as ClusterMemory;
}

describe("defense reinforcements", () => {
  before(installScreepsConstants);

  it("plans reinforcement spawns from the nearest safe helper room with assist memory", async () => {
    const { planDefenseReinforcementSpawns } = await import("../src/defenseReinforcements.ts");

    const intents = planDefenseReinforcementSpawns({
      cluster: clusterWithAttack(),
      now: 1234,
      rooms: {
        W1N1: { roomName: "W1N1", owned: true, safe: false, availableSpawns: 1, energyCapacityAvailable: 800, distances: {} },
        W2N1: {
          roomName: "W2N1",
          owned: true,
          safe: true,
          availableSpawns: 1,
          energyCapacityAvailable: 800,
          distances: { W1N1: 1 }
        },
        W4N1: {
          roomName: "W4N1",
          owned: true,
          safe: true,
          availableSpawns: 1,
          energyCapacityAvailable: 1800,
          distances: { W1N1: 3 }
        }
      }
    });

    expect(intents.map(intent => [intent.roomName, intent.role, intent.targetRoom, intent.additionalMemory.assistTarget])).to.deep.equal([
      ["W2N1", "guard", "W1N1", "W1N1"],
      ["W2N1", "ranger", "W1N1", "W1N1"]
    ]);
  });

  it("does not duplicate an already pending reinforcement for the same helper, role, and target", async () => {
    const { planDefenseReinforcementSpawns } = await import("../src/defenseReinforcements.ts");

    const intents = planDefenseReinforcementSpawns({
      cluster: clusterWithAttack(),
      now: 1234,
      rooms: {
        W1N1: { roomName: "W1N1", owned: true, safe: false, availableSpawns: 1, energyCapacityAvailable: 800, distances: {} },
        W2N1: {
          roomName: "W2N1",
          owned: true,
          safe: true,
          availableSpawns: 1,
          energyCapacityAvailable: 800,
          distances: { W1N1: 1 },
          pendingAssist: [{ role: "guard", targetRoom: "W1N1" }]
        },
        W4N1: {
          roomName: "W4N1",
          owned: true,
          safe: true,
          availableSpawns: 1,
          energyCapacityAvailable: 1800,
          distances: { W1N1: 3 }
        }
      }
    });

    expect(intents.map(intent => [intent.roomName, intent.role, intent.targetRoom])).to.deep.equal([
      ["W2N1", "ranger", "W1N1"]
    ]);
  });

  it("keeps unmet demand when pending reinforcements cover only part of a larger request", async () => {
    const { planDefenseReinforcementSpawns } = await import("../src/defenseReinforcements.ts");
    const cluster = clusterWithAttack();
    cluster.defenseRequests[0]!.guardsNeeded = 3;
    cluster.defenseRequests[0]!.rangersNeeded = 0;

    const intents = planDefenseReinforcementSpawns({
      cluster,
      now: 1235,
      rooms: {
        W1N1: { roomName: "W1N1", owned: true, safe: false, availableSpawns: 1, energyCapacityAvailable: 800, distances: {} },
        W2N1: {
          roomName: "W2N1",
          owned: true,
          safe: true,
          availableSpawns: 1,
          energyCapacityAvailable: 800,
          distances: { W1N1: 1 },
          pendingAssist: [
            { role: "guard", targetRoom: "W1N1" },
            { role: "guard", targetRoom: "W1N1" }
          ]
        },
        W4N1: {
          roomName: "W4N1",
          owned: true,
          safe: true,
          availableSpawns: 1,
          energyCapacityAvailable: 1800,
          distances: { W1N1: 3 }
        }
      }
    });

    expect(intents.map(intent => [intent.roomName, intent.role, intent.targetRoom])).to.deep.equal([
      ["W2N1", "guard", "W1N1"]
    ]);
    expect(cluster.defenseRequests[0]!.guardsNeeded).to.equal(3);
  });

  it("builds affordable guard bodies for low-RCL helper rooms", async () => {
    const { buildDefenseReinforcementBody } = await import("../src/defenseReinforcements.ts");

    const body = buildDefenseReinforcementBody("guard", 300);

    expect(body?.cost).to.be.at.most(300);
    expect(body?.parts).to.include(ATTACK);
    expect(body?.parts).to.include(MOVE);
  });

  it("plans squad fallback across helper rooms when no single defender can overpower the attacker", async () => {
    const { planDefenseReinforcementSpawns } = await import("../src/defenseReinforcements.ts");
    const cluster = clusterWithAttack();
    cluster.memberRooms = ["W1N1", "W2N1", "W3N1"];
    cluster.defenseRequests[0]!.guardsNeeded = 1;
    cluster.defenseRequests[0]!.rangersNeeded = 0;

    const intents = planDefenseReinforcementSpawns({
      cluster,
      now: 1237,
      targetThreats: {
        W1N1: {
          hostileCount: 1,
          strongest: { partCount: 24, attack: 420, ranged: 0, heal: 0, dismantle: 0, score: 480 },
          total: { partCount: 24, attack: 420, ranged: 0, heal: 0, dismantle: 0, score: 480 }
        }
      },
      rooms: {
        W1N1: { roomName: "W1N1", owned: true, safe: false, availableSpawns: 1, energyCapacityAvailable: 800, distances: {} },
        W2N1: {
          roomName: "W2N1",
          owned: true,
          safe: true,
          availableSpawns: 1,
          energyCapacityAvailable: 800,
          distances: { W1N1: 1 }
        },
        W3N1: {
          roomName: "W3N1",
          owned: true,
          safe: true,
          availableSpawns: 1,
          energyCapacityAvailable: 800,
          distances: { W1N1: 2 }
        }
      }
    });

    const guardIntents = intents.filter(intent => intent.role === "guard");
    expect(guardIntents.length).to.be.greaterThan(1);
    expect(new Set(guardIntents.map(intent => intent.roomName)).size).to.be.greaterThan(1);
  });

  it("treats helper rooms containing only allied creeps as safe", async () => {
    const { queueDefenseReinforcementSpawns } = await import("../src/defenseReinforcements.ts");
    const queued: unknown[] = [];
    const spawn = { spawning: false };
    const ally = { owner: { username: "TooAngel" } };

    (globalThis as any).Game = {
      time: 1236,
      map: { getRoomLinearDistance: () => 1 },
      rooms: {
        W1N1: {
          name: "W1N1",
          controller: { my: true },
          energyCapacityAvailable: 800,
          find: (type: FindConstant) => (type === FIND_MY_SPAWNS ? [spawn] : [])
        },
        W2N1: {
          name: "W2N1",
          controller: { my: true },
          energyCapacityAvailable: 800,
          find: (type: FindConstant) => {
            if (type === FIND_MY_SPAWNS) return [spawn];
            if (type === FIND_HOSTILE_CREEPS) return [ally];
            return [];
          }
        }
      }
    };

    const count = queueDefenseReinforcementSpawns(clusterWithAttack(), {
      getPendingRequests: () => [],
      addRequest: request => queued.push(request)
    });

    expect(count).to.equal(2);
    expect(queued.map((request: any) => request.roomName)).to.deep.equal(["W2N1", "W2N1"]);
  });
});
