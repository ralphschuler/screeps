import { expect } from "chai";
import { selectTowerAction, selectTowerTarget } from "../src";

function hostile(
  id: string,
  parts: Partial<Record<BodyPartConstant, number>>,
  boosted = false,
): Creep {
  return {
    id,
    body: boosted
      ? [{ type: MOVE, hits: 100, boost: "ZO" as BoostConstant }]
      : [],
    getActiveBodyparts: (part: BodyPartConstant) => parts[part] ?? 0,
  } as unknown as Creep;
}

function tower(
  targets: Record<number, RoomObject | null> = {},
): StructureTower {
  return {
    store: { getUsedCapacity: () => 100 },
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
});
