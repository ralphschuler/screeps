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
    nukeScanPerformed: true,
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

  it("plans structure loss on every distributed room-process offset", () => {
    for (const time of [101, 102, 103, 104]) {
      const intent = planDefensePostureIntent(
        snapshot({
          time,
          previousStructures: {
            lastStructureCount: 3,
            spawns: ["spawn1", "spawn2"],
            towers: ["tower1"],
            lastTick: time - 1
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
        lastTick: time
      });
    }
  });

  it("detects a spawn loss even when another structure is added in the same tick", () => {
    const intent = planDefensePostureIntent(
      snapshot({
        time: 101,
        previousStructures: {
          lastStructureCount: 2,
          spawns: ["spawn1"],
          towers: ["tower1"],
          lastTick: 100
        },
        currentStructures: {
          spawns: [],
          towers: ["tower1", "tower2"]
        }
      })
    );

    assert.deepEqual(intent.kernelEvents, [
      {
        type: "structure.destroyed",
        payload: { roomName: "W1N1", structureType: STRUCTURE_SPAWN, structureId: "unknown", source: "W1N1" }
      }
    ]);
    assert.deepEqual(intent.nextStructureTracking, {
      lastStructureCount: 2,
      spawns: [],
      towers: ["tower1", "tower2"],
      lastTick: 101
    });
  });

  it("does not re-emit structure loss for the same room tick", () => {
    const intent = planDefensePostureIntent(
      snapshot({
        previousStructures: {
          lastStructureCount: 2,
          spawns: ["spawn1"],
          towers: ["tower1"],
          lastTick: 100
        },
        currentStructures: {
          spawns: [],
          towers: []
        }
      })
    );

    assert.deepEqual(intent.kernelEvents, []);
  });

  it("plans first nuke detection on every room-process offset", () => {
    for (const time of [100, 101, 102, 103, 104]) {
      const detected = planDefensePostureIntent(
        snapshot({
          time,
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
      assert.equal(detected.nextDanger, 3);
      assert.deepEqual(detected.pheromoneEffects, [{ type: "nukeDetected" }]);
      assert.deepEqual(detected.kernelEvents, [
        {
          type: "nuke.detected",
          payload: {
            roomName: "W1N1",
            nukeId: "nuke1" as Id<Nuke>,
            landingTick: time + 500,
            launchRoomName: "W9N9",
            source: "W1N1"
          }
        }
      ]);
    }
  });

  it("preserves nuke danger when the scan is skipped", () => {
    const skipped = planDefensePostureIntent(
      snapshot({
        currentDanger: 3,
        nukeDetected: true,
        nukeScanPerformed: false,
        nukes: []
      })
    );

    assert.equal(skipped.nextNukeDetected, true);
    assert.equal(skipped.nextDanger, 3);
    assert.deepEqual(skipped.pheromoneEffects, []);
    assert.deepEqual(skipped.kernelEvents, []);
  });

  it("clears nuke state only after an explicit empty scan", () => {
    const retained = planDefensePostureIntent(
      snapshot({
        nukeDetected: true,
        nukes: [
          {
            id: "nuke1" as Id<Nuke>,
            timeToLand: 450,
            launchRoomName: "W9N9"
          }
        ]
      })
    );
    assert.equal(retained.nextDanger, 3);
    assert.equal(retained.nextNukeDetected, true);
    assert.deepEqual(retained.kernelEvents, []);

    const cleared = planDefensePostureIntent(
      snapshot({ currentDanger: 3, nukeDetected: true, nukes: [] })
    );
    assert.equal(cleared.nextNukeDetected, false);
    assert.equal(cleared.nextDanger, 0);
    assert.deepEqual(cleared.kernelEvents, []);
  });

  it("does not emit hostile-clear when a first nuke supersedes existing danger", () => {
    const intent = planDefensePostureIntent(
      snapshot({
        currentDanger: 2,
        nukes: [
          {
            id: "nuke1" as Id<Nuke>,
            timeToLand: 500,
            launchRoomName: "W9N9"
          }
        ]
      })
    );

    assert.equal(intent.nextDanger, 3);
    assert.deepEqual(intent.kernelEvents, [
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
  });

  it("exposes tower action planning as an intent surface", () => {
    assert.deepEqual(planTowerDefenseIntent({ towers: [] }), []);
  });

  it("honors the global tower wounded-target rollback flag", () => {
    const previousMemory = (global as typeof globalThis & { Memory?: unknown }).Memory;
    (global as typeof globalThis & { Memory?: unknown }).Memory = {
      defenseSettings: { towerPreferWoundedTargets: false }
    };

    try {
      const fullRanger = {
        id: "full-ranger",
        hits: 500,
        hitsMax: 500,
        body: [{ type: RANGED_ATTACK }],
        getActiveBodyparts: (part: BodyPartConstant) => (part === RANGED_ATTACK ? 1 : 0)
      } as unknown as Creep;
      const woundedRanger = {
        id: "wounded-ranger",
        hits: 125,
        hitsMax: 500,
        body: [{ type: RANGED_ATTACK }],
        getActiveBodyparts: (part: BodyPartConstant) => (part === RANGED_ATTACK ? 1 : 0)
      } as unknown as Creep;
      const tower = {
        store: { getUsedCapacity: () => 100 }
      } as unknown as StructureTower;

      const actions = planTowerDefenseIntent({
        towers: [tower],
        hostiles: [fullRanger, woundedRanger],
        posture: "eco",
        rcl: 6,
        danger: 2,
        isCombatPosture: false,
        wallRepairTarget: 10000
      });

      assert.equal(actions[0]?.target, fullRanger);
    } finally {
      (global as typeof globalThis & { Memory?: unknown }).Memory = previousMemory;
    }
  });

  it("honors the global tower siege-healing rollback flag", () => {
    const previousMemory = (global as typeof globalThis & { Memory?: unknown }).Memory;
    (global as typeof globalThis & { Memory?: unknown }).Memory = {
      defenseSettings: { towerHealInSiege: false }
    };

    try {
      const damagedCreep = { hits: 50, hitsMax: 100 } as Creep;
      const tower = {
        store: { getUsedCapacity: () => 100 },
        pos: { findClosestByRange: (type: FindConstant) => (type === FIND_MY_CREEPS ? damagedCreep : null) }
      } as unknown as StructureTower;

      const actions = planTowerDefenseIntent({
        towers: [tower],
        hostiles: [],
        posture: "siege",
        rcl: 6,
        danger: 3,
        isCombatPosture: true,
        wallRepairTarget: 10000
      });

      assert.deepEqual(actions, []);
    } finally {
      (global as typeof globalThis & { Memory?: unknown }).Memory = previousMemory;
    }
  });

  it("defers tower maintenance actions when bucket is in survival mode", () => {
    const tower = {
      store: { getUsedCapacity: () => 1000 },
      pos: {
        findClosestByRange: () => ({ hits: 100, hitsMax: 200, id: "damaged" })
      }
    } as unknown as StructureTower;

    const actions = planTowerDefenseIntent({
      towers: [tower],
      hostiles: [],
      posture: "eco",
      rcl: 6,
      danger: 1,
      isCombatPosture: false,
      wallRepairTarget: 10000,
      bucket: 1000
    });

    assert.deepEqual(actions, []);
  });

  it("allows tower maintenance actions with healthy bucket", () => {
    const tower = {
      store: { getUsedCapacity: () => 1000 },
      pos: {
        findClosestByRange: () => ({ hits: 100, hitsMax: 200, id: "damaged" })
      }
    } as unknown as StructureTower;

    const actions = planTowerDefenseIntent({
      towers: [tower],
      hostiles: [],
      posture: "eco",
      rcl: 6,
      danger: 1,
      isCombatPosture: false,
      wallRepairTarget: 10000,
      bucket: 2000
    });

    assert.lengthOf(actions, 1);
    assert.equal(actions[0]?.type, "heal");
    assert.equal(actions[0]?.target.id, "damaged");
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
