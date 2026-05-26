import { assert } from "chai";
import {
  type DefensePostureSnapshot,
  planDefensePostureIntent,
  planTowerDefenseIntent
} from "../../src/core/managers/roomDefensePostureModule";

function snapshot(overrides: Partial<DefensePostureSnapshot> = {}): DefensePostureSnapshot {
  return {
    roomName: "W1N1",
    time: 100,
    currentDanger: 0,
    nukeDetected: false,
    currentStructures: {
      spawns: ["spawn1"],
      towers: ["tower1"]
    },
    hostiles: [],
    nukes: [],
    ...overrides
  };
}

describe("Room defense posture Module", () => {
  it("plans hostile detection events and pheromone effects when danger increases", () => {
    const intent = planDefensePostureIntent(
      snapshot({
        currentDanger: 0,
        clusterId: "cluster1",
        clusterMemberRooms: ["W1N1", "W1N2"],
        hostiles: [
          {
            id: "hostile1" as Id<Creep>,
            owner: "Enemy",
            bodyParts: 5
          }
        ],
        threat: {
          dangerLevel: 2,
          threatScore: 75
        }
      })
    );

    assert.equal(intent.nextDanger, 2);
    assert.deepEqual(intent.pheromoneEffects, [
      { type: "danger", threatScore: 75, dangerLevel: 2 },
      { type: "diffuseDanger", roomName: "W1N1", threatScore: 75, memberRooms: ["W1N1", "W1N2"] }
    ]);
    assert.deepEqual(intent.roomEvents, [
      { roomName: "W1N1", type: "hostileDetected", message: "1 hostiles, danger=2, score=75" }
    ]);
    assert.deepEqual(intent.kernelEvents, [
      {
        type: "hostile.detected",
        payload: {
          roomName: "W1N1",
          hostileId: "hostile1" as Id<Creep>,
          hostileOwner: "Enemy",
          bodyParts: 5,
          threatLevel: 2,
          source: "W1N1"
        }
      }
    ]);
    assert.isTrue(intent.recordAttackers);
  });

  it("plans hostile clear when danger was nonzero and no hostiles remain", () => {
    const intent = planDefensePostureIntent(snapshot({ currentDanger: 2 }));

    assert.equal(intent.nextDanger, 0);
    assert.deepEqual(intent.kernelEvents, [
      { type: "hostile.cleared", payload: { roomName: "W1N1", source: "W1N1" } }
    ]);
  });

  it("plans structure destroyed events and next tracking on structure count ticks", () => {
    const intent = planDefensePostureIntent(
      snapshot({
        previousStructures: {
          lastStructureCount: 3,
          spawns: ["spawn1", "spawn2"],
          towers: ["tower1"],
          lastTick: 95
        },
        currentStructures: {
          spawns: ["spawn1"],
          towers: []
        }
      })
    );

    assert.deepEqual(intent.kernelEvents, [
      {
        type: "structure.destroyed",
        payload: { roomName: "W1N1", structureType: STRUCTURE_SPAWN, structureId: "unknown", source: "W1N1" }
      },
      {
        type: "structure.destroyed",
        payload: { roomName: "W1N1", structureType: STRUCTURE_TOWER, structureId: "unknown", source: "W1N1" }
      }
    ]);
    assert.deepEqual(intent.nextStructureTracking, {
      lastStructureCount: 1,
      spawns: ["spawn1"],
      towers: [],
      lastTick: 100
    });
  });

  it("plans first nuke detection once and clears nuke state when gone", () => {
    const detected = planDefensePostureIntent(
      snapshot({
        nukeDetected: false,
        nukes: [
          {
            id: "nuke1" as Id<Nuke>,
            timeToLand: 500,
            launchRoomName: "W9N9"
          }
        ]
      })
    );

    assert.equal(detected.nextNukeDetected, true);
    assert.deepEqual(detected.pheromoneEffects, [{ type: "nukeDetected" }]);
    assert.deepEqual(detected.kernelEvents, [
      {
        type: "nuke.detected",
        payload: {
          roomName: "W1N1",
          nukeId: "nuke1" as Id<Nuke>,
          landingTick: 600,
          launchRoomName: "W9N9",
          source: "W1N1"
        }
      }
    ]);

    const cleared = planDefensePostureIntent(snapshot({ nukeDetected: true, nukes: [] }));
    assert.equal(cleared.nextNukeDetected, false);
  });

  it("exposes tower action planning as an intent surface", () => {
    assert.deepEqual(planTowerDefenseIntent({ towers: [] }), []);
  });

  it("plans tower attack actions without executing tower side effects", () => {
    const attacked: Creep[] = [];
    const hostile = {
      body: [{ type: ATTACK }],
      getActiveBodyparts: (part: BodyPartConstant) => (part === ATTACK ? 1 : 0)
    } as unknown as Creep;
    const tower = {
      store: { getUsedCapacity: () => 100 },
      attack: (target: Creep) => {
        attacked.push(target);
        return OK;
      }
    } as unknown as StructureTower;

    const actions = planTowerDefenseIntent({
      towers: [tower],
      hostiles: [hostile],
      posture: "eco",
      rcl: 6,
      danger: 2,
      isCombatPosture: false,
      wallRepairTarget: 10000
    });

    assert.lengthOf(actions, 1);
    assert.equal(actions[0]?.type, "attack");
    assert.equal(actions[0]?.target, hostile);
    assert.deepEqual(attacked, []);
  });
});
