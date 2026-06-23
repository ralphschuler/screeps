import { logger } from "@ralphschuler/screeps-core";
import type { SwarmState } from "@ralphschuler/screeps-memory";
import type { PheromoneConfig } from "./config";
import { clampPheromoneValue } from "./limits";

type DangerLevel = 0 | 1 | 2 | 3;

/** Immediate spike when non-allied hostiles are detected by room logic. */
export function applyHostileDetectionSignal(
  swarm: SwarmState,
  hostileCount: number,
  danger: DangerLevel,
  config: PheromoneConfig
): void {
  swarm.danger = danger;
  swarm.pheromones.defense = clampPheromoneValue(swarm.pheromones.defense + hostileCount * 5, config);

  applyPersistentThreatSignals(swarm, danger, config);

  logger.info(`Hostile detected: ${hostileCount} hostiles, danger=${danger}`, {
    room: swarm.role,
    subsystem: "Pheromone"
  });
}

/** Replace immediate defense pressure from a richer threat assessment score. */
export function applyThreatAssessmentSignal(
  swarm: SwarmState,
  threatScore: number,
  dangerLevel: DangerLevel,
  config: PheromoneConfig
): void {
  swarm.danger = dangerLevel;
  swarm.pheromones.defense = clampPheromoneValue(threatScore / 10, config);

  applyPersistentThreatSignals(swarm, dangerLevel, config);
}

/** Structure loss raises rebuild pressure; critical infrastructure raises siege. */
export function applyStructureDestroyedSignal(
  swarm: SwarmState,
  structureType: StructureConstant,
  config: PheromoneConfig
): void {
  swarm.pheromones.defense = clampPheromoneValue(swarm.pheromones.defense + 5, config);
  swarm.pheromones.build = clampPheromoneValue(swarm.pheromones.build + 10, config);

  if (isCriticalStructure(structureType)) {
    swarm.danger = Math.min(3, swarm.danger + 1) as DangerLevel;
    swarm.pheromones.siege = clampPheromoneValue(swarm.pheromones.siege + 15, config);
  }
}

/** Nuke sighting is always a critical siege signal. */
export function applyNukeDetectionSignal(swarm: SwarmState, config: PheromoneConfig): void {
  swarm.danger = 3;
  swarm.pheromones.siege = clampPheromoneValue(swarm.pheromones.siege + 50, config);
  swarm.pheromones.defense = clampPheromoneValue(swarm.pheromones.defense + 30, config);
}

/** Remote loss lowers expansion confidence while nudging defense upward. */
export function applyRemoteSourceLostSignal(swarm: SwarmState, config: PheromoneConfig): void {
  swarm.pheromones.expand = clampPheromoneValue(swarm.pheromones.expand - 10, config);
  swarm.pheromones.defense = clampPheromoneValue(swarm.pheromones.defense + 5, config);
}

function applyPersistentThreatSignals(swarm: SwarmState, danger: DangerLevel, config: PheromoneConfig): void {
  if (danger >= 2) {
    swarm.pheromones.war = clampPheromoneValue(swarm.pheromones.war + danger * 10, config);
  }

  if (danger >= 3) {
    swarm.pheromones.siege = clampPheromoneValue(swarm.pheromones.siege + 20, config);
  }
}

function isCriticalStructure(structureType: StructureConstant): boolean {
  return structureType === STRUCTURE_SPAWN || structureType === STRUCTURE_STORAGE || structureType === STRUCTURE_TOWER;
}
