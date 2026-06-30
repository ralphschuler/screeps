import { assert } from "chai";
import { memoryManager } from "../src/manager.ts";
import { configureLogger, LogLevel } from "@ralphschuler/screeps-core";

describe("memoryManager", () => {
  let tick = 1000;

  beforeEach(() => {
    tick += 1;
    const g = global as any;

    g.Game = {
      time: tick,
      cpu: { bucket: 10000 },
      rooms: {},
      creeps: {},
      structures: {},
      getObjectById: () => null
    };

    g.Memory = {
      creeps: {},
      rooms: {}
    };

    // Keep test output quiet by suppressing info logging from migrations.
    configureLogger({
      level: LogLevel.ERROR,
      enableBatching: false,
      maxBatchSize: 50,
      cpuLogging: false
    });

    // Reset heap cache singleton state between tests
    delete g._heapCache;
  });

  it("initializes empire and cluster memory", () => {
    memoryManager.initialize();

    const mem = (global as any).Memory;

    assert.isObject(mem.empire, "empire memory exists");
    assert.isObject(mem.clusters, "clusters memory exists");
    assert.deepEqual(mem.empire.clusters, []);
    assert.deepEqual(mem.empire.claimQueue, []);
  });

  it("initializes and caches room swarm state", () => {
    memoryManager.initialize();

    const state = memoryManager.getOrInitSwarmState("W0N1");
    assert.equal(state.colonyLevel, "seedNest");
    assert.equal(state.posture, "eco");
    assert.isArray(state.eventLog);

    const cached = memoryManager.getSwarmState("W0N1");
    assert.strictEqual(cached, state);
  });

  it("refreshes cached empire memory when the Memory object is replaced", () => {
    memoryManager.initialize();
    const original = memoryManager.getEmpire();

    const replacement = {
      ...original,
      knownRooms: {
        W1N2: {
          name: "W1N2",
          lastSeen: tick,
          sources: 2,
          controllerLevel: 0,
          threatLevel: 0,
          scouted: true,
          terrain: "plains",
          isHighway: false,
          isSK: false
        }
      }
    };
    (global as any).Memory.empire = replacement;

    const refreshed = memoryManager.getEmpire();

    assert.strictEqual(refreshed, replacement);
    assert.isTrue(refreshed.knownRooms.W1N2.scouted);
  });

  it("refreshes cached swarm state when room Memory is replaced", () => {
    memoryManager.initialize();
    const original = memoryManager.getOrInitSwarmState("W0N1");
    const replacement = {
      ...original,
      remoteAssignments: ["W0N2"]
    };
    (global as any).Memory.rooms.W0N1.swarm = replacement;

    const refreshed = memoryManager.getSwarmState("W0N1");

    assert.strictEqual(refreshed, replacement);
    assert.deepEqual(refreshed!.remoteAssignments, ["W0N2"]);
  });

  it("records room discovery and refreshes last seen timestamp", () => {
    memoryManager.initialize();

    memoryManager.recordRoomSeen("W1N1");
    const firstSeen = (global as any).Memory.empire.knownRooms.W1N1.lastSeen;
    assert.equal(firstSeen, tick);

    tick += 12;
    (global as any).Game.time = tick;
    memoryManager.recordRoomSeen("W1N1");

    const secondSeen = (global as any).Memory.empire.knownRooms.W1N1.lastSeen;
    assert.equal(secondSeen, tick);
    assert.isAtLeast(secondSeen, firstSeen);
  });

  it("adds and prunes room events to a 20-entry FIFO", () => {
    memoryManager.initialize();

    const room = "W2N2";
    memoryManager.getOrInitSwarmState(room);

    for (let i = 0; i < 25; i += 1) {
      memoryManager.addRoomEvent(room, `event-${i}`, `detail-${i}`);
    }

    const swarm = memoryManager.getSwarmState(room);
    assert.isDefined(swarm);
    assert.equal(swarm!.eventLog.length, 20);
    assert.equal(swarm!.eventLog[0].type, "event-5");
    assert.equal(swarm!.eventLog[19].type, "event-24");
  });

  it("removes dead creeps from Memory.creeps", () => {
    memoryManager.initialize();

    (global as any).Memory.creeps = {
      deadA: { memory: {} },
      deadB: { memory: {} },
      aliveA: { memory: {} }
    };
    (global as any).Game.creeps = {
      aliveA: { name: "aliveA" } as Creep
    };

    const removed = memoryManager.cleanDeadCreeps();

    assert.equal(removed, 2);
    const memCreeps = (global as any).Memory.creeps;
    assert.isUndefined(memCreeps.deadA);
    assert.isUndefined(memCreeps.deadB);
    assert.isDefined(memCreeps.aliveA);
  });

  it("cleans dead creeps in bounded batches", () => {
    memoryManager.initialize();

    (global as any).Memory.creeps = {
      dead1: { memory: {} },
      dead2: { memory: {} },
      dead3: { memory: {} }
    };
    (global as any).Game.creeps = {};

    const firstPass = memoryManager.cleanDeadCreeps(2);
    const afterFirst = { ...(global as any).Memory.creeps };

    assert.equal(firstPass, 2);
    assert.deepEqual(Object.keys(afterFirst), ["dead3"]);

    const secondPass = memoryManager.cleanDeadCreeps(2);
    const afterSecond = (global as any).Memory.creeps as Record<string, { memory: object }>;

    assert.equal(secondPass, 1);
    assert.equal(Object.keys(afterSecond).length, 0);
  });

  it("caches hostile room checks", () => {
    memoryManager.initialize();

    const room = "W3N3";
    (global as any).Memory.rooms[room] = { hostile: true };

    assert.isTrue(memoryManager.isRoomHostile(room));

    // Mutating Memory after cache fill should stay cached for the same TTL window
    (global as any).Memory.rooms[room].hostile = false;

    assert.isTrue(
      memoryManager.isRoomHostile(room),
      "cached hostile flag should be reused within TTL"
    );
  });
});
