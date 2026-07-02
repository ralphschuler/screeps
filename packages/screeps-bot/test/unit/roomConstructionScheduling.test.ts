import { assert } from "chai";
import sinon from "sinon";
import { emergencyResponseManager, safeModeManager } from "@ralphschuler/screeps-defense";
import { memoryManager } from "@ralphschuler/screeps-memory";
import { pheromoneManager } from "@ralphschuler/screeps-pheromones";
import { unifiedStats } from "@ralphschuler/screeps-stats";
import {
  isRoomConstructionDue,
  recordRoomConstructionRun,
  RoomNode,
  type RoomConstructionScheduleOwner
} from "../../src/core/roomNode";
import { evolutionManager, postureManager } from "../../src/logic/evolution";
import { roomConstructionManager, roomDefenseManager, roomEconomyManager } from "../../src/core/managers";

describe("room construction scheduling", () => {
  it("runs construction when a room process executes after a missed interval tick", () => {
    const swarm: RoomConstructionScheduleOwner = {
      constructionSchedule: {
        lastRunTick: 990,
        nextRunTick: 1000,
        interval: 10
      }
    };

    assert.isFalse(isRoomConstructionDue(swarm, 999, 10), "construction should wait until the remembered due tick");
    assert.isTrue(isRoomConstructionDue(swarm, 1003, 10), "late room process run should still execute due construction");
  });

  it("records the next construction due tick from the actual run tick", () => {
    const swarm: RoomConstructionScheduleOwner = {};

    assert.isTrue(isRoomConstructionDue(swarm, 1003, 10), "new rooms should run once when construction is first checked");
    recordRoomConstructionRun(swarm, 1003, 10);

    assert.deepEqual(swarm.constructionSchedule, {
      lastRunTick: 1003,
      nextRunTick: 1013,
      interval: 10
    });
    assert.isFalse(isRoomConstructionDue(swarm, 1012, 10), "construction should not run before the remembered next tick");
    assert.isTrue(isRoomConstructionDue(swarm, 1013, 10), "construction should run at the remembered next tick");
  });

  it("clamps invalid construction intervals to at least one tick", () => {
    const swarm: RoomConstructionScheduleOwner = {};

    assert.isTrue(isRoomConstructionDue(swarm, 100, 0.5));
    recordRoomConstructionRun(swarm, 100, 0.5);

    assert.deepEqual(swarm.constructionSchedule, {
      lastRunTick: 100,
      nextRunTick: 101,
      interval: 1
    });
  });
});

describe("RoomNode construction scheduling", () => {
  const originalGame = Game;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    (globalThis as { Game: typeof Game }).Game = originalGame;
  });

  function createRoom(): Room {
    const controller = {
      id: "controller1" as Id<StructureController>,
      my: true,
      level: 5
    } as StructureController;

    return {
      name: "W1N1",
      controller,
      find: (type: FindConstant) => {
        if (type === FIND_MY_STRUCTURES) return [];
        if (type === FIND_SOURCES) return [];
        if (type === FIND_MY_CONSTRUCTION_SITES) return [];
        return [];
      }
    } as unknown as Room;
  }

  function stubRoomNodeCollaborators(swarm: RoomConstructionScheduleOwner & { posture: string; danger: number }) {
    sandbox.stub(unifiedStats, "startRoom").returns(0);
    sandbox.stub(unifiedStats, "recordRoom");
    sandbox.stub(unifiedStats, "endRoom");
    sandbox.stub(memoryManager, "getOrInitSwarmState").returns(swarm as never);
    sandbox.stub(pheromoneManager, "updateMetrics");
    sandbox.stub(pheromoneManager, "updatePheromones");
    sandbox.stub(roomDefenseManager, "updateThreatAssessment");
    sandbox.stub(roomDefenseManager, "runTowerControl");
    sandbox.stub(emergencyResponseManager, "assess");
    sandbox.stub(safeModeManager, "checkSafeMode");
    sandbox.stub(evolutionManager, "updateEvolutionStage");
    sandbox.stub(evolutionManager, "updateMissingStructures");
    sandbox.stub(postureManager, "updatePosture");
    sandbox.stub(postureManager, "allowsBuilding").returns(true);
    sandbox.stub(roomConstructionManager, "getConstructionInterval").returns(10);
    sandbox.stub(roomEconomyManager, "runResourceProcessing");
    return sandbox.stub(roomConstructionManager, "runConstruction");
  }

  it("runs construction when the room process resumes after the remembered due tick", () => {
    const room = createRoom();
    const swarm = {
      posture: "eco",
      danger: 0,
      constructionSchedule: {
        lastRunTick: 990,
        nextRunTick: 1000,
        interval: 10
      }
    };
    const runConstruction = stubRoomNodeCollaborators(swarm);
    (globalThis as { Game: typeof Game }).Game = {
      ...originalGame,
      time: 1003,
      rooms: { W1N1: room },
      cpu: { ...originalGame.cpu, bucket: 10000, getUsed: () => 0 }
    };

    new RoomNode("W1N1", { enableProcessing: false, enablePheromones: false }).run(1);

    assert.isTrue(runConstruction.calledOnce, "late room process run should not wait for another exact modulo tick");
    assert.deepEqual(swarm.constructionSchedule, {
      lastRunTick: 1003,
      nextRunTick: 1013,
      interval: 10
    });
  });
});
