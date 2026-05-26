import type { CreepAction } from "@ralphschuler/screeps-roles";

export interface OpportunisticConfig {
  minBucket: number;
  maxRange: number;
  minDroppedEnergy: number;
  maxRepairHitsRatio: number;
  criticalRepairHitsRatio: number;
  minFreeCapacity: number;
}

export const DEFAULT_OPPORTUNISTIC_CONFIG: OpportunisticConfig = {
  minBucket: 2000,
  maxRange: 3,
  minDroppedEnergy: 50,
  maxRepairHitsRatio: 0.5,
  criticalRepairHitsRatio: 0.3,
  minFreeCapacity: 50
};

export interface OpportunisticTargetCandidate {
  id: string;
  range: number;
  amount?: number;
  structureType?: StructureConstant;
  hits?: number;
  hitsMax?: number;
}

export interface OpportunisticIntentSnapshot {
  bucket: number;
  primaryActionType: CreepAction["type"];
  freeCapacity: number;
  usedEnergy: number;
  workParts: number;
  droppedEnergy: OpportunisticTargetCandidate[];
  damagedStructures: OpportunisticTargetCandidate[];
  energyReceivers: OpportunisticTargetCandidate[];
}

export type OpportunisticIntent =
  | { type: "keepPrimary"; reason: string }
  | { type: "pickup"; targetId: string; reason: string }
  | { type: "transfer"; targetId: string; resourceType: ResourceConstant; reason: string }
  | { type: "repair"; targetId: string; reason: string };

export function planOpportunisticIntent(
  snapshot: OpportunisticIntentSnapshot,
  config: OpportunisticConfig = DEFAULT_OPPORTUNISTIC_CONFIG
): OpportunisticIntent {
  if (snapshot.primaryActionType === "idle") return { type: "keepPrimary", reason: "primary-idle" };
  if (snapshot.bucket < config.minBucket) return { type: "keepPrimary", reason: "low-bucket" };

  const pickup = selectPickup(snapshot, config);
  if (pickup) return { type: "pickup", targetId: pickup.id, reason: "nearby-energy" };

  const transfer = selectTransfer(snapshot);
  if (transfer) return { type: "transfer", targetId: transfer.id, resourceType: RESOURCE_ENERGY, reason: "nearby-energy-receiver" };

  const repair = selectRepair(snapshot, config);
  if (repair) return { type: "repair", targetId: repair.id, reason: "nearby-critical-repair" };

  return { type: "keepPrimary", reason: "no-opportunity" };
}

function selectPickup(snapshot: OpportunisticIntentSnapshot, config: OpportunisticConfig): OpportunisticTargetCandidate | undefined {
  if (snapshot.primaryActionType === "pickup" || snapshot.primaryActionType === "withdraw") return undefined;
  if (snapshot.freeCapacity < config.minFreeCapacity) return undefined;

  return [...snapshot.droppedEnergy]
    .filter(candidate => candidate.range <= 1 && (candidate.amount ?? 0) >= config.minDroppedEnergy)
    .sort(compareByRangeThenId)[0];
}

function selectTransfer(snapshot: OpportunisticIntentSnapshot): OpportunisticTargetCandidate | undefined {
  if (snapshot.primaryActionType === "transfer") return undefined;
  if (snapshot.usedEnergy <= 0) return undefined;

  return [...snapshot.energyReceivers].sort((a, b) => {
    const priorityCompare = receiverPriority(b.structureType) - receiverPriority(a.structureType);
    if (priorityCompare !== 0) return priorityCompare;
    return compareByRangeThenId(a, b);
  })[0];
}

function selectRepair(snapshot: OpportunisticIntentSnapshot, config: OpportunisticConfig): OpportunisticTargetCandidate | undefined {
  if (snapshot.primaryActionType === "repair") return undefined;
  if (snapshot.workParts <= 0 || snapshot.usedEnergy <= 0) return undefined;

  return [...snapshot.damagedStructures]
    .filter(candidate => {
      if (candidate.structureType === STRUCTURE_WALL || candidate.structureType === STRUCTURE_RAMPART) return false;
      if (candidate.range > 1) return false;
      const hits = candidate.hits ?? 0;
      const hitsMax = candidate.hitsMax ?? 1;
      return hits < hitsMax * config.maxRepairHitsRatio && hits < hitsMax * config.criticalRepairHitsRatio;
    })
    .sort(compareByRangeThenId)[0];
}

function receiverPriority(structureType: StructureConstant | undefined): number {
  if (structureType === STRUCTURE_SPAWN) return 3;
  if (structureType === STRUCTURE_EXTENSION) return 2;
  if (structureType === STRUCTURE_TOWER) return 1;
  return 0;
}

function compareByRangeThenId(a: OpportunisticTargetCandidate, b: OpportunisticTargetCandidate): number {
  const rangeCompare = a.range - b.range;
  if (rangeCompare !== 0) return rangeCompare;
  return a.id.localeCompare(b.id);
}
