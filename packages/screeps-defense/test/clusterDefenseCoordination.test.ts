import { expect } from "chai";
import { memoryManager } from "@ralphschuler/screeps-memory";
import { coordinateClusterDefense } from "../src/coordination/clusterDefense";
import { DefenseCoordinator } from "../src/coordination/defenseCoordinator";

function installScreepsConstants(): void {
  Object.assign(globalThis, {
    OK: 0,
    MOVE: "move",
    WORK: "work",
    CARRY: "carry",
    ATTACK: "attack",
    RANGED_ATTACK: "ranged_attack",
    HEAL: "heal",
    TOUGH: "tough",
    CLAIM: "claim",
    RESOURCE_ENERGY: "energy",
    FIND_HOSTILE_CREEPS: 102,
    FIND_MY_CREEPS: 101,
    FIND_MY_STRUCTURES: 104,
    FIND_NUKES: 100,
    STRUCTURE_SPAWN: "spawn",
    STRUCTURE_STORAGE: "storage",
    STRUCTURE_TERMINAL: "terminal",
    STRUCTURE_TOWER: "tower"
  });
}

interface MockFindOptions<T> {
  filter?: (item: T) => boolean;
}

interface MockRoomSetup {
  name: string;
  hostiles?: Creep[];
  myCreeps?: Creep[];
  myStructures?: Structure[];
}

function withFilter<T>(items: T[], options?: MockFindOptions<T>): T[] {
  return options?.filter ? items.filter(options.filter) : items;
}

function createMockRoom(setup: MockRoomSetup): Room {
  const hostiles = setup.hostiles ?? [];
  const myCreeps = setup.myCreeps ?? [];
  const myStructures = setup.myStructures ?? [];

  return {
    name: setup.name,
    controller: { my: true, level: 4, safeModeAvailable: 0 } as StructureController,
    find(type: FindConstant, options?: MockFindOptions<unknown>): unknown[] {
      switch (type) {
        case FIND_HOSTILE_CREEPS:
          return withFilter(hostiles, options as MockFindOptions<Creep>);
        case FIND_MY_CREEPS:
          return withFilter(myCreeps, options as MockFindOptions<Creep>);
        case FIND_MY_STRUCTURES:
          return withFilter(myStructures, options as MockFindOptions<Structure>);
        case FIND_NUKES:
          return [];
        default:
          return [];
      }
    }
  } as unknown as Room;
}

function createHostile(roomName: string): Creep {
  return {
    id: "hostile1" as Id<Creep>,
    room: { name: roomName } as Room,
    owner: { username: "Invader" },
    hits: 100,
    body: [
      { type: ATTACK, hits: 100 },
      { type: MOVE, hits: 100 }
    ],
    pos: { x: 25, y: 25, roomName } as RoomPosition
  } as unknown as Creep;
}

function createGuard(name: string, roomName: string): Creep {
  return {
    name,
    memory: { role: "guard", family: "military", homeRoom: roomName },
    room: { name: roomName } as Room
  } as unknown as Creep;
}

describe("cluster defense coordination", () => {
  before(installScreepsConstants);

  beforeEach(() => {
    const clusterId = "cluster_W1N1";
    const guard = createGuard("guard1", "W2N1");

    (globalThis as unknown as { Memory: Memory }).Memory = {
      rooms: {
        W1N1: { swarm: { danger: 1, clusterId, metrics: {} } },
        W2N1: { swarm: { danger: 0, clusterId, metrics: {} } }
      },
      clusters: {
        [clusterId]: {
          id: clusterId,
          coreRoom: "W1N1",
          memberRooms: ["W1N1", "W2N1"],
          remoteRooms: [],
          forwardBases: [],
          role: "mixed",
          metrics: { energyIncome: 0, energyConsumption: 0, energyBalance: 0, warIndex: 0, economyIndex: 50 },
          squads: [],
          rallyPoints: [],
          defenseRequests: [],
          resourceRequests: [],
          lastUpdate: 0
        }
      }
    } as unknown as Memory;

    (globalThis as unknown as { Game: Game }).Game = {
      time: 20,
      rooms: {
        W1N1: createMockRoom({ name: "W1N1", hostiles: [createHostile("W1N1")] }),
        W2N1: createMockRoom({ name: "W2N1", myCreeps: [guard] })
      },
      creeps: { guard1: guard }
    } as unknown as Game;

    memoryManager.getHeapCache().clear();
  });

  it("accepts a cluster id and assigns an idle helper-room defender with staged assist memory", () => {
    coordinateClusterDefense("cluster_W1N1");

    expect(Game.creeps.guard1.memory).to.include({
      assistTarget: "W1N1",
      targetRoom: "W1N1",
      task: "defenseAssist",
      defenseSquadId: "defenseAssist:W2N1:W1N1:20",
      defenseSquadSize: 1,
      defenseSquadCreatedAt: 20
    });
  });

  it("recovers staged defense-assist assignments after coordinator heap state resets", () => {
    Game.creeps.guard1.memory = {
      role: "guard",
      family: "military",
      homeRoom: "W2N1",
      assistTarget: "W1N1",
      targetRoom: "W1N1",
      task: "defenseAssist",
      defenseSquadId: "defenseAssist:W2N1:W1N1:10",
      defenseSquadSize: 1,
      defenseSquadCreatedAt: 10
    } as CreepMemory;

    const freshCoordinator = new DefenseCoordinator();

    const expectedAssignment = {
      creepName: "guard1",
      targetRoom: "W1N1",
      assignedAt: 10,
      eta: Game.time
    };

    expect(freshCoordinator.getAssignmentsForRoom("W1N1")).to.deep.equal([expectedAssignment]);
    expect(freshCoordinator.getAllAssignments()).to.deep.equal([expectedAssignment]);

    freshCoordinator.cancelAssignment("guard1");

    expect(Game.creeps.guard1.memory).to.not.have.property("assistTarget");
    expect(Game.creeps.guard1.memory).to.not.have.property("targetRoom");
    expect(Game.creeps.guard1.memory).to.not.have.property("task");
    expect(Game.creeps.guard1.memory).to.not.have.property("defenseSquadId");
    expect(freshCoordinator.getAllAssignments()).to.deep.equal([]);
  });
});
