export type TowerAction =
  | { type: "attack"; target: Creep }
  | { type: "heal"; target: Creep }
  | { type: "repair"; target: Structure }
  | { type: "idle" };

export interface TowerActionPolicyInput {
  tower: StructureTower;
  hostiles: Creep[];
  posture: string;
  rcl: number;
  danger: number;
  isCombatPosture: boolean;
  wallRepairTarget: number;
  /**
   * Current CPU bucket. When low, tower maintenance actions (heal/repair) are deferred.
   */
  bucket?: number;
  /**
   * Prefer already-wounded hostiles when threat priority ties so towers finish kills.
   * Set false to roll back to stable insertion-order tie-breaking.
   */
  preferWoundedTargets?: boolean;
  /**
   * Minimum tower energy kept back for attacks/heals before spending on repairs.
   * Set to 0 or TOWER_ENERGY_COST to disable most reservation behavior for rollback.
   */
  repairReserveEnergy?: number;
  /** Set false to roll back siege-posture tower healing. */
  allowSiegeHealing?: boolean;
}

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

function shouldPerformMaintenance(bucket: number | undefined): boolean {
  return resolveBucket(bucket) >= TOWER_POLICY_DEFAULTS.maintenanceBucketThreshold;
}

export interface TowerTargetOptions {
  /** Set false to roll back wounded-hostile focus-fire tie-breaking. */
  preferWoundedTargets?: boolean;
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

export function selectTowerTarget(hostiles: Creep[], options: TowerTargetOptions = {}): Creep | null {
  const preferWoundedTargets = options.preferWoundedTargets !== false;
  let bestTarget: Creep | null = null;

  for (const hostile of hostiles) {
    if (!bestTarget || compareTowerTargets(hostile, bestTarget, preferWoundedTargets) < 0) {
      bestTarget = hostile;
    }
  }

  return bestTarget;
}

function compareTowerTargets(a: Creep, b: Creep, preferWoundedTargets: boolean): number {
  const priorityDelta = getHostilePriority(b) - getHostilePriority(a);
  if (priorityDelta !== 0) return priorityDelta;

  if (!preferWoundedTargets) return 0;

  const woundDelta = getHitRatio(a) - getHitRatio(b);
  if (woundDelta !== 0) return woundDelta;

  return getHits(a) - getHits(b);
}

function getHits(hostile: Creep): number {
  return typeof hostile.hits === "number" ? hostile.hits : Infinity;
}

function getHitRatio(hostile: Creep): number {
  if (typeof hostile.hits !== "number" || typeof hostile.hitsMax !== "number" || hostile.hitsMax <= 0) {
    return 1;
  }
  return hostile.hits / hostile.hitsMax;
}

export function getHostilePriority(hostile: Creep): number {
  let score = 0;

  score += hostile.getActiveBodyparts(HEAL) * 100;
  score += hostile.getActiveBodyparts(RANGED_ATTACK) * 50;
  score += hostile.getActiveBodyparts(ATTACK) * 40;
  score += hostile.getActiveBodyparts(CLAIM) * 60;
  score += hostile.getActiveBodyparts(WORK) * 30;

  if (score > 0 && hostile.body.some((part) => part.boost)) {
    score += 20;
  }

  return score;
}

export function selectTowerAction(input: TowerActionPolicyInput): TowerAction {
  const primaryTarget =
    input.hostiles.length > 0 ? selectTowerTarget(input.hostiles, { preferWoundedTargets: input.preferWoundedTargets }) : null;
  if (primaryTarget) {
    return { type: "attack", target: primaryTarget };
  }

  // Survival mode (very low bucket): keep towers on core combat only.
  // At this bucket level we skip non-critical maintenance for better resilience.
  const canMaintain = shouldPerformMaintenance(input.bucket);
  if (!canMaintain) {
    return { type: "idle" };
  }

  if (input.posture !== "siege" || input.allowSiegeHealing !== false) {
    const damaged = input.tower.pos.findClosestByRange(FIND_MY_CREEPS, {
      filter: (c) => c.hits < c.hitsMax,
    });
    if (damaged) return { type: "heal", target: damaged };
  }

  const repairReserveEnergy = getTowerRepairReserveEnergy(input);
  const canSpendOnRepair =
    input.tower.store.getUsedCapacity(RESOURCE_ENERGY) > repairReserveEnergy;

  if (!input.isCombatPosture && canSpendOnRepair) {
    const damaged = input.tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (s) =>
        s.hits < s.hitsMax * 0.8 &&
        s.structureType !== STRUCTURE_WALL &&
        s.structureType !== STRUCTURE_RAMPART,
    });
    if (damaged) return { type: "repair", target: damaged };
  }

  if (!input.isCombatPosture && input.hostiles.length === 0 && canSpendOnRepair) {
    const wallOrRampart = input.tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (s) =>
        (s.structureType === STRUCTURE_WALL ||
          s.structureType === STRUCTURE_RAMPART) &&
        s.hits < input.wallRepairTarget,
    });
    if (wallOrRampart) return { type: "repair", target: wallOrRampart };
  }

  return { type: "idle" };
}
