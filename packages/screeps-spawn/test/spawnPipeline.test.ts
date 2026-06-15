/**
 * Spawn Pipeline Tests
 */

import { expect } from "chai";
import { spawnQueue, SpawnPriority, type SpawnRequest } from "../src/spawnQueue.ts";

interface SpawnCallTracker {
  calls: number;
}

function getBodyCost(parts: BodyPartConstant[]): number {
  const costs: Partial<Record<BodyPartConstant, number>> = {
    [MOVE]: 50,
    [WORK]: 100,
    [CARRY]: 50,
    [ATTACK]: 80,
    [RANGED_ATTACK]: 150,
    [HEAL]: 250,
    [CLAIM]: 600,
    [TOUGH]: 10
  };

  return parts.reduce((acc, part) => acc + (costs[part] ?? 0), 0);
}

function createRequest(
  roomName: string,
  role: SpawnRequest["role"],
  family: SpawnRequest["family"],
  priority: SpawnPriority,
  parts: BodyPartConstant[],
  id: string,
  createdAt: number
): SpawnRequest {
  return {
    id,
    roomName,
    role,
    family,
    body: {
      parts,
      cost: getBodyCost(parts)
    },
    priority,
    createdAt
  };
}

describe("spawn pipeline and queue energy budgeting", () => {
  const roomName = "W1N1";
  let room: { name: string; energyAvailable: number; energyCapacityAvailable: number; find: (type: number) => any[] };
  let spawnA: any;
  let spawnB: any;
  let roomEnergy: number;
  let spawnATracker: SpawnCallTracker;
  let spawnBTracker: SpawnCallTracker;

  const spawnCreepFactory = (tracker: SpawnCallTracker) => {
    return (body: BodyPartConstant[]) => {
      tracker.calls++;

      const cost = getBodyCost(body);
      if (cost > roomEnergy) {
        return ERR_NOT_ENOUGH_ENERGY;
      }

      roomEnergy -= cost;
      return OK;
    };
  };

  beforeEach(() => {
    spawnATracker = { calls: 0 };
    spawnBTracker = { calls: 0 };
    roomEnergy = 350;

    room = {
      name: roomName,
      energyAvailable: 350,
      energyCapacityAvailable: 1000,
      find: (type: number) => {
        if (type === FIND_MY_SPAWNS) {
          return [spawnA, spawnB];
        }

        return [];
      }
    };

    spawnA = {
      id: "spawnA" as Id<StructureSpawn>,
      room,
      spawning: false,
      spawnCreep: (body: BodyPartConstant[]) => spawnCreepFactory(spawnATracker)(body)
    };

    spawnB = {
      id: "spawnB" as Id<StructureSpawn>,
      room,
      spawning: false,
      spawnCreep: (body: BodyPartConstant[]) => spawnCreepFactory(spawnBTracker)(body)
    };

    (globalThis as any).Memory = {};
    (globalThis as any).Game = {
      rooms: {
        [roomName]: room
      },
      time: 1,
      getObjectById: (id: string) => {
        if (id === spawnA.id) return spawnA as any;
        if (id === spawnB.id) return spawnB as any;

        return null;
      }
    };

    spawnQueue.clearQueue(roomName);
  });

  it("apply room energy budgeting in SpawnQueue.processQueue", () => {
    room.find = (type: number) => {
      if (type === FIND_MY_SPAWNS) {
        return [spawnA, spawnB];
      }

      return [];
    };

    spawnQueue.addRequest(
      createRequest(roomName, "harvester", "economy", SpawnPriority.HIGH, [WORK, WORK, WORK], "expensive-queue", 1)
    );
    spawnQueue.addRequest(
      createRequest(roomName, "hauler", "economy", SpawnPriority.NORMAL, [CARRY, MOVE, WORK, MOVE], "cheap-queue", 1)
    );

    const queued = spawnQueue.processQueue(roomName);

    expect(queued).to.equal(1);
    expect(spawnATracker.calls).to.equal(1);
    expect(spawnBTracker.calls).to.equal(0);
    expect(roomEnergy).to.equal(50);
    expect(spawnQueue.getQueueSize(roomName)).to.equal(1);
  });
});
