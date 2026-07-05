import { expect } from "chai";
import type { SwarmState } from "@ralphschuler/screeps-memory";
import {
  getClaimerSpawnAssignment,
  getPioneerSpawnAssignment,
  needsRole
} from "../src/spawnNeedsAnalyzer";
import { createSpawnPlan } from "../src/spawnIntentCompiler";
import { spawnQueue, SpawnPriority } from "../src/spawnQueue";

type RoomOptions = {
  my?: boolean;
  hasSpawn?: boolean;
  spawnSite?: boolean;
  owner?: string;
  reserver?: string;
  hostileCreeps?: Creep[];
};

function createRoom(name: string, opts: RoomOptions = {}): Room {
  const controller: Partial<StructureController> = {
    my: opts.my ?? false,
    level: 3
  };
  if (opts.owner) {
    controller.owner = { username: opts.owner } as Owner;
  }
  if (opts.reserver) {
    controller.reservation = { username: opts.reserver, ticksToEnd: 5000 };
  }

  return {
    name,
    energyAvailable: 800,
    energyCapacityAvailable: 800,
    controller,
    find: (type: FindConstant) => {
      if (type === FIND_MY_SPAWNS) {
        return opts.hasSpawn ? [{ id: `${name}-spawn`, room: { name } }] : [];
      }
      if (type === FIND_MY_CONSTRUCTION_SITES) {
        return opts.spawnSite ? [{ id: `${name}-spawn-site`, structureType: STRUCTURE_SPAWN }] : [];
      }
      if (type === FIND_HOSTILE_CREEPS) {
        return opts.hostileCreeps ?? [];
      }
      if (type === FIND_MY_CREEPS || type === FIND_MY_STRUCTURES || type === FIND_STRUCTURES || type === FIND_MINERALS) {
        return [];
      }
      return [];
    }
  } as unknown as Room;
}

function createSwarm(overrides: Partial<SwarmState> = {}): SwarmState {
  return {
    posture: "eco",
    danger: 0,
    remoteAssignments: [],
    ...overrides
  } as SwarmState;
}

function createDangerousHostile(username = "Invader", parts: BodyPartConstant[] = [ATTACK]): Creep {
  return {
    owner: { username },
    body: parts.map(type => ({ type, hits: 100 }))
  } as Creep;
}

function addStableHomeCreep(name: string, role: string, homeRoom = "E1N1"): void {
  Game.creeps[name] = {
    name,
    spawning: false,
    memory: { role, homeRoom }
  } as Creep;
}

function seedStableHomeEconomy(homeRoom = "E1N1"): void {
  addStableHomeCreep(`${homeRoom}-harvester`, "harvester", homeRoom);
  addStableHomeCreep(`${homeRoom}-hauler`, "hauler", homeRoom);
  addStableHomeCreep(`${homeRoom}-upgrader`, "upgrader", homeRoom);
}

function createClaimerCreep(targetRoom: string, parts: BodyPartConstant[]): Creep {
  return {
    memory: { role: "claimer", targetRoom, task: "claim" },
    body: parts.map(type => ({ type, hits: 100 })),
    getActiveBodyparts: (part: BodyPartConstant) => parts.filter(type => type === part).length
  } as unknown as Creep;
}

function createConstructionSite(roomName: string, structureType: BuildableStructureConstant): ConstructionSite {
  return {
    id: `${roomName}-${structureType}` as Id<ConstructionSite>,
    my: true,
    owner: { username: "me" },
    pos: { roomName },
    structureType
  } as ConstructionSite;
}

function setEmpireMemory(overrides: Record<string, unknown> = {}): void {
  (global as any).Memory = {
    rooms: {},
    empire: {
      knownRooms: {},
      clusters: [],
      warTargets: [],
      ownedRooms: {},
      recoveryRooms: {},
      claimQueue: [],
      nukeCandidates: [],
      powerBanks: [],
      objectives: {
        targetPowerLevel: 0,
        targetRoomCount: 1,
        warMode: false,
        expansionPaused: false
      },
      lastUpdate: 0,
      ...overrides
    }
  };
}

function resetWorld(): void {
  Game.time = 1000;
  Game.creeps = {};
  Game.constructionSites = {};
  Game.rooms = {
    E1N1: createRoom("E1N1", { my: true, hasSpawn: true })
  };
  Game.spawns = {
    Spawn1: {
      id: "spawn1" as Id<StructureSpawn>,
      owner: { username: "me" },
      room: { name: "E1N1" }
    } as StructureSpawn
  };
  Game.gcl = { level: 3 } as GlobalControlLevel;
  Game.map = {
    getRoomLinearDistance: (from: string, to: string) => {
      const distances: Record<string, number> = {
        "E1N1:E2N1": 1,
        "E1N1:E3N1": 3,
        "E2N1:E3N1": 1
      };
      return distances[`${from}:${to}`] ?? distances[`${to}:${from}`] ?? 10;
    }
  } as GameMap;
  setEmpireMemory();
  spawnQueue.clearQueue("E1N1");
  spawnQueue.clearQueue("E2N1");
  spawnQueue.clearQueue("E3N1");
}

describe("claimer and pioneer demand", () => {
  beforeEach(resetWorld);

  it("claims recovery rooms before normal expansion targets", () => {
    Game.rooms.E3N1 = createRoom("E3N1");
    setEmpireMemory({
      recoveryRooms: {
        E3N1: { roomName: "E3N1", lostAt: 10, rcl: 3, role: "core", clusterId: "c1" }
      },
      claimQueue: [{ roomName: "E4N1", claimed: false, score: 100 }]
    });

    const assignment = getClaimerSpawnAssignment("E1N1", createSwarm());

    expect(assignment).to.deep.equal({ targetRoom: "E3N1", task: "claim" });
    expect(needsRole("E1N1", "claimer", createSwarm())).to.equal(true);
  });

  it("reserves safe remotes when the GCL cap blocks new claims", () => {
    Game.gcl = { level: 1 } as GlobalControlLevel;
    Game.rooms.E2N1 = createRoom("E2N1");
    setEmpireMemory({
      claimQueue: [{ roomName: "E3N1", claimed: false, score: 100 }]
    });

    const assignment = getClaimerSpawnAssignment("E1N1", createSwarm({ remoteAssignments: ["E2N1"] }));

    expect(assignment).to.deep.equal({ targetRoom: "E2N1", task: "reserve" });
  });

  it("ignores active claimers without CLAIM parts when de-duplicating claim targets", () => {
    Game.rooms.E3N1 = createRoom("E3N1");
    Game.creeps.invalidClaimer = createClaimerCreep("E3N1", [WORK, CARRY, MOVE]);
    setEmpireMemory({
      recoveryRooms: {
        E3N1: { roomName: "E3N1", lostAt: 10, rcl: 3, role: "core", clusterId: "c1" }
      }
    });

    expect(getClaimerSpawnAssignment("E1N1", createSwarm())).to.deep.equal({ targetRoom: "E3N1", task: "claim" });
  });

  it("treats active CLAIM-bodied claimers as assigned claim targets", () => {
    Game.rooms.E3N1 = createRoom("E3N1");
    Game.creeps.validClaimer = createClaimerCreep("E3N1", [CLAIM, MOVE]);
    setEmpireMemory({
      recoveryRooms: {
        E3N1: { roomName: "E3N1", lostAt: 10, rcl: 3, role: "core", clusterId: "c1" }
      }
    });

    expect(getClaimerSpawnAssignment("E1N1", createSwarm())).to.equal(null);
  });

  it("claims neutral owned spawn construction sites when the empire queue has not caught up", () => {
    Game.rooms.E3N1 = createRoom("E3N1", { spawnSite: true });
    Game.constructionSites = {
      staleSpawn: createConstructionSite("E3N1", STRUCTURE_SPAWN)
    };
    seedStableHomeEconomy();

    expect(getClaimerSpawnAssignment("E1N1", createSwarm())).to.deep.equal({ targetRoom: "E3N1", task: "claim" });

    const plan = createSpawnPlan(Game.rooms.E1N1, createSwarm());
    const request = plan.requests.find(spawnRequest => spawnRequest.role === "claimer");

    expect(request?.targetRoom).to.equal("E3N1");
    expect(request?.additionalMemory).to.deep.equal({ task: "claim" });
  });

  it("prioritizes owned spawn construction claims over normal expansion queue entries", () => {
    Game.rooms.E3N1 = createRoom("E3N1", { spawnSite: true });
    Game.constructionSites = {
      staleSpawn: createConstructionSite("E3N1", STRUCTURE_SPAWN)
    };
    setEmpireMemory({
      claimQueue: [{ roomName: "E2N1", claimed: false, score: 999 }]
    });

    expect(getClaimerSpawnAssignment("E1N1", createSwarm())).to.deep.equal({ targetRoom: "E3N1", task: "claim" });
  });

  it("skips unsafe owned spawn construction claims and falls back to the expansion queue", () => {
    Game.rooms.E3N1 = createRoom("E3N1", { spawnSite: true, hostileCreeps: [createDangerousHostile()] });
    Game.constructionSites = {
      unsafeSpawn: createConstructionSite("E3N1", STRUCTURE_SPAWN)
    };
    setEmpireMemory({
      claimQueue: [{ roomName: "E2N1", claimed: false, score: 100 }]
    });

    expect(getClaimerSpawnAssignment("E1N1", createSwarm())).to.deep.equal({ targetRoom: "E2N1", task: "claim" });
  });

  it("treats hostile claim parts as unsafe for owned spawn construction claims", () => {
    Game.rooms.E3N1 = createRoom("E3N1", { spawnSite: true, hostileCreeps: [createDangerousHostile("Invader", [CLAIM])] });
    Game.constructionSites = {
      unsafeClaimSpawn: createConstructionSite("E3N1", STRUCTURE_SPAWN)
    };
    setEmpireMemory({
      claimQueue: [{ roomName: "E2N1", claimed: false, score: 100 }]
    });

    expect(getClaimerSpawnAssignment("E1N1", createSwarm())).to.deep.equal({ targetRoom: "E2N1", task: "claim" });
  });

  it("does not bypass expansion pause for owned spawn construction claims", () => {
    Game.rooms.E2N1 = createRoom("E2N1");
    Game.rooms.E3N1 = createRoom("E3N1", { spawnSite: true });
    Game.constructionSites = {
      pausedSpawn: createConstructionSite("E3N1", STRUCTURE_SPAWN)
    };
    setEmpireMemory({
      objectives: {
        targetPowerLevel: 0,
        targetRoomCount: 1,
        warMode: false,
        expansionPaused: true
      },
      claimQueue: [{ roomName: "E3N1", claimed: false, score: 999 }]
    });

    expect(getClaimerSpawnAssignment("E1N1", createSwarm({ remoteAssignments: ["E2N1"] }))).to.deep.equal({
      targetRoom: "E2N1",
      task: "reserve"
    });
  });

  it("ignores queued claimers without CLAIM parts when de-duplicating claim targets", () => {
    Game.rooms.E3N1 = createRoom("E3N1");
    spawnQueue.addRequest({
      id: "invalid_queued_claimer",
      roomName: "E1N1",
      role: "claimer",
      family: "utility",
      body: { parts: [WORK, CARRY, MOVE], cost: 200, minCapacity: 200 },
      priority: 100,
      targetRoom: "E3N1",
      additionalMemory: { task: "claim" },
      createdAt: Game.time
    });
    setEmpireMemory({
      recoveryRooms: {
        E3N1: { roomName: "E3N1", lostAt: 10, rcl: 3, role: "core", clusterId: "c1" }
      }
    });

    expect(getClaimerSpawnAssignment("E1N1", createSwarm())).to.deep.equal({ targetRoom: "E3N1", task: "claim" });
  });

  it("skips unsafe recovery and remote reservation targets", () => {
    Game.rooms.E2N1 = createRoom("E2N1", { owner: "enemy" });
    Game.rooms.E3N1 = createRoom("E3N1");
    setEmpireMemory({
      recoveryRooms: {
        E2N1: { roomName: "E2N1", lostAt: 10, rcl: 3, role: "core", clusterId: "c1" },
        E3N1: { roomName: "E3N1", lostAt: 20, rcl: 3, role: "core", clusterId: "c1" }
      }
    });

    expect(getClaimerSpawnAssignment("E1N1", createSwarm())).to.deep.equal({ targetRoom: "E3N1", task: "claim" });

    Game.gcl = { level: 1 } as GlobalControlLevel;
    setEmpireMemory({
      knownRooms: {
        E2N1: { roomName: "E2N1", scouted: false, owner: "enemy", threatLevel: 0 },
        E3N1: { roomName: "E3N1", scouted: false, threatLevel: 0 }
      }
    });
    delete Game.rooms.E2N1;
    delete Game.rooms.E3N1;

    expect(getClaimerSpawnAssignment("E1N1", createSwarm({ remoteAssignments: ["E2N1", "E3N1"] }))).to.deep.equal({
      targetRoom: "E3N1",
      task: "reserve"
    });
  });

  it("assigns pioneers only from the closest safe parent room", () => {
    Game.rooms.E2N1 = createRoom("E2N1", { my: true, hasSpawn: true });
    Game.rooms.E3N1 = createRoom("E3N1", { my: true, spawnSite: true });
    Game.spawns.Spawn2 = {
      id: "spawn2" as Id<StructureSpawn>,
      owner: { username: "me" },
      room: { name: "E2N1" }
    } as StructureSpawn;

    expect(getPioneerSpawnAssignment("E1N1", createSwarm())).to.equal(null);
    expect(getPioneerSpawnAssignment("E2N1", createSwarm())).to.deep.equal({
      targetRoom: "E3N1",
      task: "bootstrapSpawn",
      priority: SpawnPriority.EMERGENCY
    });
  });

  it("promotes spawnless-room pioneer recovery with a spawn site to emergency priority", () => {
    Game.rooms.E2N1 = createRoom("E2N1", { my: true, spawnSite: true });
    seedStableHomeEconomy();

    const pioneerRequest = createSpawnPlan(Game.rooms.E1N1, createSwarm()).requests.find(request =>
      request.role === "pioneer" && request.targetRoom === "E2N1"
    );

    expect(pioneerRequest?.priority).to.equal(SpawnPriority.EMERGENCY);
    expect(pioneerRequest?.additionalMemory).to.deep.equal({ task: "bootstrapSpawn" });
  });

  it("keeps normal spawnless pioneer recovery high priority without a spawn site", () => {
    Game.rooms.E2N1 = createRoom("E2N1", { my: true });
    seedStableHomeEconomy();

    const pioneerRequest = createSpawnPlan(Game.rooms.E1N1, createSwarm()).requests.find(request =>
      request.role === "pioneer" && request.targetRoom === "E2N1"
    );

    expect(pioneerRequest?.priority).to.equal(SpawnPriority.HIGH);
    expect(pioneerRequest?.additionalMemory).to.deep.equal({ task: "bootstrapSpawn" });
  });

  it("continues pioneer recovery for a second spawnless room when another target has a full bootstrap wave", () => {
    Game.rooms.E2N1 = createRoom("E2N1", { my: true, spawnSite: true });
    Game.rooms.E3N1 = createRoom("E3N1", { my: true, spawnSite: true });
    seedStableHomeEconomy();

    for (let i = 1; i <= 3; i++) {
      Game.creeps[`pioneer${i}`] = {
        spawning: false,
        memory: {
          role: "pioneer",
          homeRoom: "E1N1",
          targetRoom: "E2N1",
          task: "bootstrapSpawn"
        }
      } as Creep;
    }

    expect(getPioneerSpawnAssignment("E1N1", createSwarm())).to.deep.equal({
      targetRoom: "E3N1",
      task: "bootstrapSpawn",
      priority: SpawnPriority.EMERGENCY
    });
    expect(needsRole("E1N1", "pioneer", createSwarm())).to.equal(true);

    const plan = createSpawnPlan(Game.rooms.E1N1, createSwarm());
    const pioneerDemand = plan.demands.find(demand => demand.roleName === "pioneer" && demand.targetRoom === "E3N1");
    const pioneerRequest = plan.requests.find(request => request.role === "pioneer" && request.targetRoom === "E3N1");

    expect(pioneerDemand?.missing).to.equal(1);
    expect(pioneerRequest?.priority).to.equal(SpawnPriority.EMERGENCY);
    expect(pioneerRequest?.additionalMemory).to.deep.equal({ task: "bootstrapSpawn" });
  });

  it("suppresses pioneer demand when a spawnless room already has enough bootstrap workers", () => {
    Game.rooms.E2N1 = createRoom("E2N1", { my: true });
    Game.creeps.pioneer1 = {
      memory: { role: "pioneer", targetRoom: "E2N1", task: "bootstrapSpawn" }
    } as Creep;

    expect(getPioneerSpawnAssignment("E1N1", createSwarm())).to.equal(null);
    expect(needsRole("E1N1", "pioneer", createSwarm())).to.equal(false);
  });

  it("does not send pioneers into spawnless owned rooms with dangerous hostiles", () => {
    Game.rooms.E2N1 = createRoom("E2N1", { my: true, hostileCreeps: [createDangerousHostile()] });

    expect(getPioneerSpawnAssignment("E1N1", createSwarm())).to.equal(null);
    expect(needsRole("E1N1", "pioneer", createSwarm())).to.equal(false);
  });
});
