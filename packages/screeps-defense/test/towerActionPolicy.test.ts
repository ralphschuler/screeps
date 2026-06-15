import { expect } from "chai";
import { selectTowerAction, selectTowerTarget } from "../src";

function hostile(
  id: string,
  parts: Partial<Record<BodyPartConstant, number>>,
  boosted = false,
  hits = 500,
  hitsMax = 500,
): Creep {
  return {
    id,
    hits,
    hitsMax,
    body: boosted
      ? [{ type: MOVE, hits: 100, boost: "ZO" as BoostConstant }]
      : [],
    getActiveBodyparts: (part: BodyPartConstant) => parts[part] ?? 0,
  } as unknown as Creep;
}

function tower(
  targets: Record<number, RoomObject | null> = {},
  energy = 100,
): StructureTower {
  return {
    store: { getUsedCapacity: () => energy },
    pos: { findClosestByRange: (type: number) => targets[type] ?? null },
  } as unknown as StructureTower;
}

describe("tower action policy", () => {
  it("selects a focus-fire attack target without mutating hostile order", () => {
    const melee = hostile("melee", { [ATTACK]: 2 });
    const healer = hostile("healer", { [HEAL]: 1 });
    const ranged = hostile("ranged", { [RANGED_ATTACK]: 1 });
    const hostiles = [melee, healer, ranged];

    const target = selectTowerTarget(hostiles);

    expect(target).to.equal(healer);
    expect(hostiles).to.deep.equal([melee, healer, ranged]);
  });

  it("prefers a wounded hostile when threat priority ties", () => {
    const fullRanger = hostile("full-ranger", { [RANGED_ATTACK]: 1 }, false, 500, 500);
    const woundedRanger = hostile("wounded-ranger", { [RANGED_ATTACK]: 1 }, false, 125, 500);

    const target = selectTowerTarget([fullRanger, woundedRanger]);

    expect(target).to.equal(woundedRanger);
  });

  it("allows wounded hostile tie-breaker rollback", () => {
    const fullRanger = hostile("full-ranger", { [RANGED_ATTACK]: 1 }, false, 500, 500);
    const woundedRanger = hostile("wounded-ranger", { [RANGED_ATTACK]: 1 }, false, 125, 500);

    const target = selectTowerTarget([fullRanger, woundedRanger], { preferWoundedTargets: false });

    expect(target).to.equal(fullRanger);
  });

  it("returns heal before repair when peaceful and a friendly is damaged", () => {
    const damagedCreep = { hits: 50, hitsMax: 100 } as Creep;
    const damagedStructure = {
      hits: 50,
      hitsMax: 100,
      structureType: STRUCTURE_ROAD,
    } as Structure;

    const action = selectTowerAction({
      tower: tower({
        [FIND_MY_CREEPS]: damagedCreep,
        [FIND_STRUCTURES]: damagedStructure,
      }),
      hostiles: [],
      posture: "eco",
      rcl: 4,
      danger: 0,
      isCombatPosture: false,
      wallRepairTarget: 1000,
    });

    expect(action).to.deep.equal({ type: "heal", target: damagedCreep });
  });

  it("heals wounded friendly creeps in siege when no hostile target is present", () => {
    const damagedCreep = { hits: 50, hitsMax: 100 } as Creep;

    const action = selectTowerAction({
      tower: tower({ [FIND_MY_CREEPS]: damagedCreep }),
      hostiles: [],
      posture: "siege",
      rcl: 6,
      danger: 3,
      isCombatPosture: true,
      wallRepairTarget: 1000,
      bucket: 3000,
    });

    expect(action).to.deep.equal({ type: "heal", target: damagedCreep });
  });

  it("defers healing and repair when bucket is in survival mode", () => {
    const damagedCreep = { hits: 50, hitsMax: 100 } as Creep;

    const action = selectTowerAction({
      tower: tower({ [FIND_MY_CREEPS]: damagedCreep }),
      hostiles: [],
      posture: "eco",
      rcl: 6,
      danger: 0,
      isCombatPosture: false,
      wallRepairTarget: 1000,
      bucket: 800,
    });

    expect(action).to.deep.equal({ type: "idle" });
  });

  it("continues attacking in low bucket when hostiles are present", () => {
    const hostile = { hits: 500, hitsMax: 1000, body: [{ type: ATTACK, hits: 100 }] } as Creep;
    const action = selectTowerAction({
      tower: tower({}, 100),
      hostiles: [hostile],
      posture: "eco",
      rcl: 6,
      danger: 1,
      isCombatPosture: false,
      wallRepairTarget: 1000,
      bucket: 800,
    });

    expect(action.type).to.equal("attack");
  });

  it("allows siege healing rollback", () => {
    const damagedCreep = { hits: 50, hitsMax: 100 } as Creep;

    const action = selectTowerAction({
      tower: tower({ [FIND_MY_CREEPS]: damagedCreep }),
      hostiles: [],
      posture: "siege",
      rcl: 6,
      danger: 3,
      isCombatPosture: true,
      wallRepairTarget: 1000,
      allowSiegeHealing: false,
    });

    expect(action).to.deep.equal({ type: "idle" });
  });

  it("reserves half-full tower energy by default instead of repairing", () => {
    const damagedStructure = {
      hits: 50,
      hitsMax: 100,
      structureType: STRUCTURE_ROAD,
    } as Structure;

    const action = selectTowerAction({
      tower: tower({ [FIND_STRUCTURES]: damagedStructure }, 500),
      hostiles: [],
      posture: "eco",
      rcl: 4,
      danger: 0,
      isCombatPosture: false,
      wallRepairTarget: 1000,
    });

    expect(action).to.deep.equal({ type: "idle" });
  });

  it("repairs when energy is above the default defensive reserve", () => {
    const damagedStructure = {
      hits: 50,
      hitsMax: 100,
      structureType: STRUCTURE_ROAD,
    } as Structure;

    const action = selectTowerAction({
      tower: tower({ [FIND_STRUCTURES]: damagedStructure }, 510),
      hostiles: [],
      posture: "eco",
      rcl: 4,
      danger: 0,
      isCombatPosture: false,
      wallRepairTarget: 1000,
    });

    expect(action).to.deep.equal({ type: "repair", target: damagedStructure });
  });

  it("allows explicit repair reserve override as a rollback knob", () => {
    const damagedStructure = {
      hits: 50,
      hitsMax: 100,
      structureType: STRUCTURE_ROAD,
    } as Structure;

    const action = selectTowerAction({
      tower: tower({ [FIND_STRUCTURES]: damagedStructure }, 20),
      hostiles: [],
      posture: "eco",
      rcl: 4,
      danger: 0,
      isCombatPosture: false,
      wallRepairTarget: 1000,
      repairReserveEnergy: 10,
    });

    expect(action).to.deep.equal({ type: "repair", target: damagedStructure });
  });
});
