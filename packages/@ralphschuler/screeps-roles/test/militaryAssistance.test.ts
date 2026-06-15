import { expect } from "chai";
import { guard, ranger, type CreepContext } from "../src/index";
import { createMockCreep, createMockRoom, resetMockGame } from "./setup";

function createAssistContext(role: "guard" | "ranger", hostileStructures: Structure[]): CreepContext {
  const room = createMockRoom("W2N1");
  (room as any).find = (type: number) => {
    if (type === FIND_HOSTILE_CREEPS) return [];
    if (type === FIND_HOSTILE_STRUCTURES) return hostileStructures;
    if (type === FIND_MY_CREEPS) return [];
    if (type === FIND_MY_SPAWNS) return [];
    return [];
  };

  const creep = createMockCreep(`${role}1`, {
    room,
    memory: { role, family: "military", homeRoom: "W1N1", assistTarget: "W2N1" },
    body: role === "guard"
      ? [{ type: ATTACK, hits: 100 }, { type: MOVE, hits: 100 }]
      : [{ type: RANGED_ATTACK, hits: 100 }, { type: MOVE, hits: 100 }],
    pos: {
      x: 25,
      y: 25,
      roomName: "W2N1",
      getRangeTo: () => (role === "guard" ? 1 : 3),
      findClosestByRange: (targets: unknown) => Array.isArray(targets) ? targets[0] : null,
      findInRange: () => [],
      isEqualTo: () => false,
      isNearTo: () => false,
      inRangeTo: () => false,
      findClosestByPath: () => null,
      lookFor: () => []
    }
  });

  Game.rooms.W2N1 = room;
  Game.creeps[creep.name] = creep;

  return {
    creep,
    room,
    memory: creep.memory as CreepContext["memory"],
    swarmState: undefined,
    squadMemory: undefined,
    homeRoom: "W1N1",
    isInHomeRoom: false,
    isFull: false,
    isEmpty: true,
    isWorking: false,
    assignedSource: null,
    assignedMineral: null,
    energyAvailable: false,
    nearbyEnemies: false,
    constructionSiteCount: 0,
    damagedStructureCount: 0,
    droppedResources: [],
    containers: [],
    depositContainers: [],
    spawnStructures: [],
    towers: [],
    storage: undefined,
    terminal: undefined,
    hostiles: [],
    damagedAllies: [],
    prioritizedSites: [],
    repairTargets: [],
    labs: [],
    factory: undefined,
    tombstones: [],
    mineralContainers: []
  };
}

describe("military assistance behavior", () => {
  beforeEach(resetMockGame);

  it("keeps guard assistance active and attacks hostile structures when no hostile creeps remain", () => {
    const hostileStructure = {
      structureType: STRUCTURE_SPAWN,
      owner: { username: "Invader" },
      pos: { roomName: "W2N1", x: 26, y: 25 }
    } as Structure;
    const ctx = createAssistContext("guard", [hostileStructure]);

    const action = guard(ctx);

    expect(ctx.creep.memory.assistTarget).to.equal("W2N1");
    expect(action).to.deep.equal({ type: "attack", target: hostileStructure });
  });

  it("keeps ranger assistance active and attacks hostile structures when no hostile creeps remain", () => {
    const hostileStructure = {
      structureType: STRUCTURE_SPAWN,
      owner: { username: "Invader" },
      pos: { roomName: "W2N1", x: 28, y: 25 }
    } as Structure;
    const ctx = createAssistContext("ranger", [hostileStructure]);

    const action = ranger(ctx);

    expect(ctx.creep.memory.assistTarget).to.equal("W2N1");
    expect(action).to.deep.equal({ type: "rangedAttack", target: hostileStructure });
  });
});
