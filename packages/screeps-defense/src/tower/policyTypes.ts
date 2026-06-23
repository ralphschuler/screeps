export type TowerAction =
  | { type: "attack"; target: Creep }
  | { type: "heal"; target: Creep }
  | { type: "repair"; target: Structure }
  | { type: "idle" };

export type TowerMaintenanceAction =
  | { type: "heal"; target: Creep }
  | { type: "repair"; target: Structure };

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

export interface TowerTargetOptions {
  /** Set false to roll back wounded-hostile focus-fire tie-breaking. */
  preferWoundedTargets?: boolean;
}
