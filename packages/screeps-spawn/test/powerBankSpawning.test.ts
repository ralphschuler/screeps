import { expect } from "chai";
import type { SwarmState } from "@ralphschuler/screeps-memory";
import { configureSpawnIntegration, populateSpawnQueue, spawnQueue, SpawnPriority } from "../src/index";
import { buildSpawnMemory } from "../src/spawnRequestExecution";

function createSwarm(): SwarmState {
  return {
    posture: "eco",
    danger: 0,
    remoteAssignments: []
  } as SwarmState;
}

function createRoom(name: string): Room {
  let spawn: StructureSpawn;
  const room = {
    name,
    energyAvailable: 3000,
    energyCapacityAvailable: 3000,
    controller: { my: true, level: 8 },
    find: (type: FindConstant) => {
      if (type === FIND_MY_SPAWNS) return [spawn];
      if (type === FIND_MY_CREEPS) return Object.values(Game.creeps).filter(creep => creep.memory.homeRoom === name);
      if (
        type === FIND_HOSTILE_CREEPS ||
        type === FIND_MY_STRUCTURES ||
        type === FIND_STRUCTURES ||
        type === FIND_MINERALS ||
        type === FIND_SOURCES ||
        type === FIND_MY_CONSTRUCTION_SITES
      ) return [];
      return [];
    }
  } as unknown as Room;

  spawn = {
    id: `${name}-spawn` as Id<StructureSpawn>,
    room,
    spawning: false
  } as StructureSpawn;

  return room;
}

function seedStableEconomy(homeRoom: string): void {
  for (const role of ["harvester", "hauler", "upgrader"]) {
    Game.creeps[`${role}1`] = {
      name: `${role}1`,
      spawning: false,
      memory: { role, homeRoom }
    } as Creep;
  }
}

function resetWorld(): void {
  const game = ((globalThis as unknown as { Game?: Partial<Game> }).Game ??= {}) as Partial<Game> & {
    creeps: Record<string, Creep>;
    rooms: Record<string, Room>;
  };
  game.time = 5000;
  game.creeps = {};
  game.rooms = { W1N1: createRoom("W1N1") };
  game.spawns = {};
  game.gcl = { level: 8 } as GlobalControlLevel;
  game.map = { getRoomLinearDistance: () => 1 } as GameMap;
  (globalThis as unknown as { Memory: Memory }).Memory = { rooms: {}, creeps: {} } as Memory;
  spawnQueue.clearQueue("W1N1");
  configureSpawnIntegration({
    powerBankHarvestingManager: {
      requestSpawns: () => ({ powerHarvesters: 0, healers: 0, powerCarriers: 0, operations: [] })
    }
  });
}

describe("power-bank spawn requests", () => {
  beforeEach(resetWorld);

  it("queues operation creeps with target-room memory", () => {
    seedStableEconomy("W1N1");
    configureSpawnIntegration({
      powerBankHarvestingManager: {
        requestSpawns: () => ({
          powerHarvesters: 1,
          healers: 1,
          powerCarriers: 1,
          operations: [
            { targetRoom: "W10N10", powerHarvesters: 1, healers: 1, powerCarriers: 1 }
          ]
        })
      }
    });

    populateSpawnQueue(Game.rooms.W1N1, createSwarm());

    const requests = spawnQueue.getPendingRequests("W1N1").filter(request => request.additionalMemory?.task === "powerBank");
    expect(requests.map(request => request.role)).to.include.members(["powerHarvester", "healer", "powerCarrier"]);
    for (const request of requests) {
      expect(request.targetRoom).to.equal("W10N10");
      expect(request.additionalMemory).to.include({ task: "powerBank", targetRoom: "W10N10" });
      expect(buildSpawnMemory(request)).to.include({ targetRoom: "W10N10", task: "powerBank" });
    }
  });

  it("counts queued operation requests by target room before adding more", () => {
    seedStableEconomy("W1N1");
    spawnQueue.addRequest({
      id: "existing-power-harvester",
      roomName: "W1N1",
      role: "powerHarvester",
      family: "power",
      body: { parts: [ATTACK, MOVE], cost: 130, minCapacity: 130 },
      priority: SpawnPriority.NORMAL,
      targetRoom: "W10N10",
      additionalMemory: { task: "powerBank", targetRoom: "W10N10" },
      createdAt: Game.time
    });
    configureSpawnIntegration({
      powerBankHarvestingManager: {
        requestSpawns: () => ({
          powerHarvesters: 1,
          healers: 0,
          powerCarriers: 1,
          operations: [
            { targetRoom: "W10N10", powerHarvesters: 1, healers: 0, powerCarriers: 1 }
          ]
        })
      }
    });

    populateSpawnQueue(Game.rooms.W1N1, createSwarm());

    const operationRequests = spawnQueue.getPendingRequests("W1N1")
      .filter(request => request.additionalMemory?.task === "powerBank" && request.targetRoom === "W10N10");
    expect(operationRequests.filter(request => request.role === "powerHarvester")).to.have.length(1);
    expect(operationRequests.filter(request => request.role === "powerCarrier")).to.have.length(1);
  });
});
