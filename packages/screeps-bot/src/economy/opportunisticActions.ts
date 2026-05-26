import { createLogger } from "@ralphschuler/screeps-core";
import type { CreepAction } from "@ralphschuler/screeps-roles";
import {
  DEFAULT_OPPORTUNISTIC_CONFIG,
  planOpportunisticIntent,
  type OpportunisticIntentSnapshot,
  type OpportunisticTargetCandidate
} from "./opportunisticIntent";

const logger = createLogger("OpportunisticActions");

export function opportunisticPickup(creep: Creep, primaryAction: CreepAction): CreepAction {
  const intent = planOpportunisticIntent(buildSnapshot(creep, primaryAction));
  if (intent.type !== "pickup") return primaryAction;
  const target = Game.getObjectById<Resource>(intent.targetId as Id<Resource>);
  if (!target) return primaryAction;
  logger.debug(`${creep.name} opportunistically picking up ${target.amount} energy at ${target.pos}`);
  return { type: "pickup", target };
}

export function opportunisticRepair(creep: Creep, primaryAction: CreepAction): CreepAction {
  const snapshot = buildSnapshot(creep, primaryAction);
  const intent = planOpportunisticIntent({ ...snapshot, droppedEnergy: [], energyReceivers: [] });
  if (intent.type !== "repair") return primaryAction;
  const target = Game.getObjectById<Structure>(intent.targetId as Id<Structure>);
  if (!target) return primaryAction;
  logger.debug(
    `${creep.name} opportunistically repairing ${target.structureType} at ${target.pos} (${target.hits}/${target.hitsMax})`
  );
  return { type: "repair", target };
}

export function opportunisticTransfer(creep: Creep, primaryAction: CreepAction): CreepAction {
  const snapshot = buildSnapshot(creep, primaryAction);
  const intent = planOpportunisticIntent({ ...snapshot, droppedEnergy: [], damagedStructures: [] });
  if (intent.type !== "transfer") return primaryAction;
  const target = Game.getObjectById<StructureSpawn | StructureExtension | StructureTower>(
    intent.targetId as Id<StructureSpawn | StructureExtension | StructureTower>
  );
  if (!target) return primaryAction;
  logger.debug(`${creep.name} opportunistically transferring to ${target.structureType} at ${target.pos}`);
  return { type: "transfer", target, resourceType: intent.resourceType };
}

export function applyOpportunisticActions(creep: Creep, primaryAction: CreepAction): CreepAction {
  const snapshot = buildSnapshot(creep, primaryAction);
  const intent = planOpportunisticIntent(snapshot);

  switch (intent.type) {
    case "pickup": {
      const target = Game.getObjectById<Resource>(intent.targetId as Id<Resource>);
      return target ? { type: "pickup", target } : primaryAction;
    }
    case "transfer": {
      const target = Game.getObjectById<StructureSpawn | StructureExtension | StructureTower>(
        intent.targetId as Id<StructureSpawn | StructureExtension | StructureTower>
      );
      return target ? { type: "transfer", target, resourceType: intent.resourceType } : primaryAction;
    }
    case "repair": {
      const target = Game.getObjectById<Structure>(intent.targetId as Id<Structure>);
      return target ? { type: "repair", target } : primaryAction;
    }
    case "keepPrimary":
      return primaryAction;
  }
}

export function getOpportunisticStats(): { enabled: boolean; minBucket: number; currentBucket: number } {
  return {
    enabled: Game.cpu.bucket >= DEFAULT_OPPORTUNISTIC_CONFIG.minBucket,
    minBucket: DEFAULT_OPPORTUNISTIC_CONFIG.minBucket,
    currentBucket: Game.cpu.bucket
  };
}

function buildSnapshot(creep: Creep, primaryAction: CreepAction): OpportunisticIntentSnapshot {
  return {
    bucket: Game.cpu.bucket,
    primaryActionType: primaryAction.type,
    freeCapacity: creep.store.getFreeCapacity(),
    usedEnergy: creep.store.getUsedCapacity(RESOURCE_ENERGY),
    workParts: creep.getActiveBodyparts(WORK),
    droppedEnergy: findDroppedEnergy(creep),
    damagedStructures: findDamagedStructures(creep),
    energyReceivers: findEnergyReceivers(creep)
  };
}

function findDroppedEnergy(creep: Creep): OpportunisticTargetCandidate[] {
  return creep.pos
    .findInRange(FIND_DROPPED_RESOURCES, DEFAULT_OPPORTUNISTIC_CONFIG.maxRange, {
      filter: (resource: Resource) =>
        resource.resourceType === RESOURCE_ENERGY && resource.amount >= DEFAULT_OPPORTUNISTIC_CONFIG.minDroppedEnergy
    })
    .map(resource => ({ id: resource.id, range: creep.pos.getRangeTo(resource), amount: resource.amount }));
}

function findDamagedStructures(creep: Creep): OpportunisticTargetCandidate[] {
  return creep.pos
    .findInRange(FIND_STRUCTURES, DEFAULT_OPPORTUNISTIC_CONFIG.maxRange, {
      filter: (structure: Structure) =>
        structure.hits < structure.hitsMax * DEFAULT_OPPORTUNISTIC_CONFIG.maxRepairHitsRatio &&
        structure.structureType !== STRUCTURE_WALL &&
        structure.structureType !== STRUCTURE_RAMPART
    })
    .map(structure => ({
      id: structure.id,
      range: creep.pos.getRangeTo(structure),
      structureType: structure.structureType,
      hits: structure.hits,
      hitsMax: structure.hitsMax
    }));
}

function findEnergyReceivers(creep: Creep): OpportunisticTargetCandidate[] {
  const receivers = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
    filter: (structure: AnyOwnedStructure) => {
      if (structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_EXTENSION) {
        return structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }
      if (structure.structureType === STRUCTURE_TOWER) {
        return structure.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
      }
      return false;
    }
  }) as (StructureSpawn | StructureExtension | StructureTower)[];

  return receivers.map(structure => ({
    id: structure.id,
    range: creep.pos.getRangeTo(structure),
    structureType: structure.structureType
  }));
}
