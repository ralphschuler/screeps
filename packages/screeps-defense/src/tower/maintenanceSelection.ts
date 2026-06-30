import type { TowerActionPolicyInput, TowerMaintenanceAction } from "./policyTypes";

interface TowerActionPolicySettings {
  /**
   * Maintenance threshold mirrors competitive strategy work modes.
   * Below this bucket, defer non-critical tower maintenance.
   */
  maintenanceBucketThreshold: number;
}

const TOWER_POLICY_DEFAULTS: TowerActionPolicySettings = {
  maintenanceBucketThreshold: 1500
};

function resolveBucket(inputBucket: number | undefined): number {
  if (typeof inputBucket === "number" && Number.isFinite(inputBucket)) {
    return inputBucket;
  }

  if (typeof Game !== "undefined" && Number.isFinite(Game.cpu?.bucket)) {
    return Game.cpu.bucket;
  }

  return 10000;
}

export function canPerformTowerMaintenance(bucket: number | undefined): boolean {
  return resolveBucket(bucket) >= TOWER_POLICY_DEFAULTS.maintenanceBucketThreshold;
}

export function getTowerRepairReserveEnergy(input: TowerActionPolicyInput): number {
  if (input.repairReserveEnergy !== undefined) {
    return Math.max(0, Math.min(TOWER_CAPACITY, input.repairReserveEnergy));
  }

  if (input.danger >= 2 || input.isCombatPosture) {
    return Math.floor(TOWER_CAPACITY * 0.75);
  }

  return Math.floor(TOWER_CAPACITY * 0.5);
}

/**
 * Pick the best non-attack tower action for the current room state.
 *
 * Maintenance order is intentionally conservative:
 * 1. heal friendly creeps when allowed by posture;
 * 2. repair ordinary structures before decay causes churn;
 * 3. top up walls/ramparts only after routine repairs are clear.
 */
export function selectTowerMaintenanceAction(input: TowerActionPolicyInput): TowerMaintenanceAction | null {
  if (!canPerformTowerMaintenance(input.bucket) || input.hostiles.length > 0) {
    return null;
  }

  const healingTarget = selectTowerHealingTarget(input);
  if (healingTarget) {
    return { type: "heal", target: healingTarget };
  }

  if (!canSpendTowerEnergyOnRepair(input)) {
    return null;
  }

  const routineRepairTarget = selectRoutineRepairTarget(input);
  if (routineRepairTarget) {
    return { type: "repair", target: routineRepairTarget };
  }

  const fortificationTarget = selectFortificationRepairTarget(input);
  if (fortificationTarget) {
    return { type: "repair", target: fortificationTarget };
  }

  return null;
}

function selectTowerHealingTarget(input: TowerActionPolicyInput): Creep | null {
  if (!shouldHealFriendly(input)) return null;

  return input.tower.pos.findClosestByRange(FIND_MY_CREEPS, {
    filter: isWoundedFriendly
  });
}

function shouldHealFriendly(input: TowerActionPolicyInput): boolean {
  return input.posture !== "siege" || input.allowSiegeHealing !== false;
}

function isWoundedFriendly(creep: Creep): boolean {
  return creep.hits < creep.hitsMax;
}

function canSpendTowerEnergyOnRepair(input: TowerActionPolicyInput): boolean {
  return input.tower.store.getUsedCapacity(RESOURCE_ENERGY) > getTowerRepairReserveEnergy(input);
}

function selectRoutineRepairTarget(input: TowerActionPolicyInput): Structure | null {
  if (!canRepairDuringCurrentPosture(input)) return null;

  return input.tower.pos.findClosestByRange(FIND_STRUCTURES, {
    filter: isRoutineRepairTarget
  });
}

function isRoutineRepairTarget(structure: Structure): boolean {
  return (
    structure.hits < structure.hitsMax * 0.8 &&
    structure.structureType !== STRUCTURE_WALL &&
    structure.structureType !== STRUCTURE_RAMPART
  );
}

function selectFortificationRepairTarget(input: TowerActionPolicyInput): Structure | null {
  if (!canRepairDuringCurrentPosture(input) || input.hostiles.length > 0) return null;

  return input.tower.pos.findClosestByRange(FIND_STRUCTURES, {
    filter: (structure) => isFortificationBelowRepairTarget(structure, input.wallRepairTarget)
  });
}

function canRepairDuringCurrentPosture(input: TowerActionPolicyInput): boolean {
  return !input.isCombatPosture;
}

function isFortificationBelowRepairTarget(structure: Structure, wallRepairTarget: number): boolean {
  return isFortification(structure) && structure.hits < wallRepairTarget;
}

function isFortification(structure: Structure): boolean {
  return structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART;
}
