import { expect } from "chai";
import type { SwarmState } from "@ralphschuler/screeps-memory";
import { createSpawnPlan } from "../src/spawnIntentCompiler";
import { needsRole } from "../src/spawnNeedsAnalyzer";
import {
  REMOTE_ECONOMY_ROLES,
  getRemoteRoleMaxPerRemote,
  isRemoteEconomyRole
} from "../src/remoteRoleDemand";

function createRemoteRoom(
  name: string,
  opts: { sourceCount?: number; constructionSites?: number; repairTargets?: Structure[] } = {}
): Room {
  const sourceCount = opts.sourceCount ?? 2;
  const constructionSites = opts.constructionSites ?? 0;
  const repairTargets = opts.repairTargets ?? [];

  return {
    name,
    controller: { reservation: { username: "me", ticksToEnd: 5000 } },
    find: (type: FindConstant, findOpts?: { filter?: (structure: Structure) => boolean }) => {
      if (type === FIND_SOURCES) {
        return Array.from({ length: sourceCount }, (_, index) => ({ id: `${name}-source-${index}` }));
      }
      if (type === FIND_MY_CONSTRUCTION_SITES) {
        return Array.from({ length: constructionSites }, (_, index) => ({ id: `${name}-site-${index}` }));
      }
      if (type === FIND_STRUCTURES) {
        return findOpts?.filter ? repairTargets.filter(findOpts.filter) : repairTargets;
      }
      return [];
    }
  } as unknown as Room;
}

function createRepairTarget(structureType: StructureConstant, hits: number, hitsMax = 1000): Structure {
  return { structureType, hits, hitsMax } as Structure;
}

function createHomeRoom(name = "E1N1"): Room {
  return {
    name,
    energyAvailable: 800,
    energyCapacityAvailable: 800,
    controller: { my: true, level: 3 },
    find: (type: FindConstant) => {
      if (type === FIND_HOSTILE_CREEPS || type === FIND_MY_CREEPS || type === FIND_MY_STRUCTURES) return [];
      if (type === FIND_MY_SPAWNS) return [{ id: `${name}-spawn` }];
      return [];
    }
  } as unknown as Room;
}

function createRemoteSwarm(remoteAssignments: string[]): SwarmState {
  return {
    posture: "eco",
    danger: 0,
    remoteAssignments
  } as SwarmState;
}

function createRemoteCreeps(role: string, homeRoom: string, targetRooms: string[]): Record<string, Creep> {
  return Object.fromEntries(
    targetRooms.map((targetRoom, index) => [
      `${role}${index}`,
      {
        spawning: false,
        memory: { role, homeRoom, targetRoom }
      } as Creep
    ])
  );
}

describe("remote role demand helpers", () => {
  beforeEach(() => {
    (global as any).Game = {
      ...(global as any).Game,
      rooms: {
        E1N1: { name: "E1N1", energyCapacityAvailable: 800 }
      },
      creeps: {},
      spawns: { Spawn1: { owner: { username: "me" } } }
    };
  });

  it("centralizes the remote economy role set", () => {
    expect(REMOTE_ECONOMY_ROLES).to.deep.equal(["remoteHarvester", "remoteHauler", "remoteWorker"]);
    expect(isRemoteEconomyRole("remoteHarvester")).to.equal(true);
    expect(isRemoteEconomyRole("remoteHauler")).to.equal(true);
    expect(isRemoteEconomyRole("remoteWorker")).to.equal(true);
    expect(isRemoteEconomyRole("remoteGuard")).to.equal(false);
    expect(isRemoteEconomyRole("harvester")).to.equal(false);
  });

  it("sizes visible remote harvesters from visible sources", () => {
    const remoteRoom = createRemoteRoom("E2N1", { sourceCount: 3 });

    expect(getRemoteRoleMaxPerRemote("E1N1", "E2N1", "remoteHarvester", remoteRoom)).to.equal(3);
  });

  it("keeps invisible remote harvesters on the conservative two-source estimate", () => {
    expect(getRemoteRoleMaxPerRemote("E1N1", "E2N1", "remoteHarvester", undefined)).to.equal(2);
  });

  it("caps invisible remote haulers while using visible reserved-room throughput", () => {
    expect(getRemoteRoleMaxPerRemote("E1N1", "E7N1", "remoteHauler", undefined)).to.equal(2);
    expect(getRemoteRoleMaxPerRemote("E1N1", "E8N1", "remoteHauler", createRemoteRoom("E8N1"))).to.be.greaterThan(2);
  });

  it("only requests remote workers when visible infrastructure work exists", () => {
    expect(getRemoteRoleMaxPerRemote("E1N1", "E2N1", "remoteWorker", undefined)).to.equal(0);
    expect(getRemoteRoleMaxPerRemote("E1N1", "E2N1", "remoteWorker", createRemoteRoom("E2N1"))).to.equal(0);

    expect(
      getRemoteRoleMaxPerRemote("E1N1", "E3N1", "remoteWorker", createRemoteRoom("E3N1", { constructionSites: 1 }))
    ).to.equal(1);

    expect(
      getRemoteRoleMaxPerRemote("E1N1", "E4N1", "remoteWorker", createRemoteRoom("E4N1", { constructionSites: 6 }))
    ).to.equal(2);
  });

  it("counts only damaged remote roads and containers as remote worker repair demand", () => {
    const remoteRoom = createRemoteRoom("E5N1", {
      repairTargets: [
        createRepairTarget(STRUCTURE_CONTAINER, 500),
        createRepairTarget(STRUCTURE_ROAD, 700),
        createRepairTarget(STRUCTURE_ROAD, 900),
        createRepairTarget(STRUCTURE_RAMPART, 100)
      ]
    });

    expect(getRemoteRoleMaxPerRemote("E1N1", "E5N1", "remoteWorker", remoteRoom)).to.equal(1);
  });

  it("does not spawn remote workers beyond the home-room role cap", () => {
    const remoteAssignments = ["E2N1", "E3N1", "E4N1", "E5N1", "E6N1"];
    const swarm = createRemoteSwarm(remoteAssignments);
    const homeRoom = createHomeRoom();

    Game.rooms.E1N1 = homeRoom;
    for (const remoteName of remoteAssignments) {
      Game.rooms[remoteName] = createRemoteRoom(remoteName, { constructionSites: 1 });
    }
    Game.creeps = createRemoteCreeps("remoteWorker", "E1N1", ["E2N1", "E3N1", "E4N1", "E5N1"]);

    expect(needsRole("E1N1", "remoteWorker", swarm)).to.equal(false);
    expect(createSpawnPlan(homeRoom, swarm).requests.some(request => request.role === "remoteWorker")).to.equal(false);
  });

  it("keeps remote harvester demand driven by assigned remote source coverage", () => {
    const remoteAssignments = ["E2N1", "E3N1", "E4N1", "E5N1"];
    const swarm = createRemoteSwarm(remoteAssignments);

    Game.rooms.E1N1 = createHomeRoom();
    for (const remoteName of remoteAssignments) {
      Game.rooms[remoteName] = createRemoteRoom(remoteName, { sourceCount: 2 });
    }
    Game.creeps = createRemoteCreeps("remoteHarvester", "E1N1", [
      "E2N1",
      "E2N1",
      "E3N1",
      "E3N1",
      "E4N1",
      "E4N1"
    ]);

    expect(needsRole("E1N1", "remoteHarvester", swarm)).to.equal(true);
  });
});
