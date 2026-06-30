import type { PheromoneState, SwarmState } from "@ralphschuler/screeps-memory";
import type { PheromoneConfig } from "./config";
import { clampPheromoneValue } from "./limits";
import type { RoomMetricsTracker } from "./rollingAverage";
import { getRoomSources } from "./sourceCache";

/** Apply configured evaporation before adding this tick's local signals. */
export function applyPheromoneDecay(pheromones: PheromoneState, config: PheromoneConfig): void {
  for (const key of Object.keys(pheromones) as (keyof PheromoneState)[]) {
    const decayFactor = config.decayFactors[key];
    pheromones[key] = clampPheromoneValue(pheromones[key] * decayFactor, config);
  }
}

/**
 * Convert current room metrics into pheromone pressure.
 *
 * This module keeps arithmetic rules separate from manager orchestration so the
 * public `PheromoneManager` stays small and the signal math is easy to audit.
 */
export function applyRoomPheromoneContributions(
  swarm: SwarmState,
  room: Room,
  tracker: RoomMetricsTracker,
  config: PheromoneConfig
): void {
  const pheromones = swarm.pheromones;

  applyHarvestContribution(pheromones, room, config);
  applyBuildContribution(pheromones, room, config);
  applyUpgradeContribution(pheromones, room, config);
  applyDefenseContribution(pheromones, tracker, config);
  applyWarAndSiegeContribution(swarm, config);
  applyLogisticsContribution(pheromones, room, config);
  applyExpandContribution(swarm, tracker, config);
}

function applyHarvestContribution(pheromones: PheromoneState, room: Room, config: PheromoneConfig): void {
  const sources = getRoomSources(room);
  if (sources.length === 0) return;

  const avgEnergy = sources.reduce((sum, source) => sum + source.energy, 0) / sources.length;
  pheromones.harvest = clampPheromoneValue(pheromones.harvest + (avgEnergy / 3000) * 10, config);
}

function applyBuildContribution(pheromones: PheromoneState, room: Room, config: PheromoneConfig): void {
  const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
  if (sites.length === 0) return;

  pheromones.build = clampPheromoneValue(pheromones.build + Math.min(sites.length * 2, 20), config);
}

function applyUpgradeContribution(pheromones: PheromoneState, room: Room, config: PheromoneConfig): void {
  if (!room.controller?.my) return;

  const progressPercent = room.controller.progress / room.controller.progressTotal;
  if (progressPercent < 0.5) {
    pheromones.upgrade = clampPheromoneValue(pheromones.upgrade + (1 - progressPercent) * 15, config);
  }
}

function applyDefenseContribution(
  pheromones: PheromoneState,
  tracker: RoomMetricsTracker,
  config: PheromoneConfig
): void {
  const hostileAvg = tracker.hostileCount.get();
  if (hostileAvg > 0) {
    pheromones.defense = clampPheromoneValue(pheromones.defense + hostileAvg * 10, config);
  }
}

function applyWarAndSiegeContribution(swarm: SwarmState, config: PheromoneConfig): void {
  if (swarm.danger >= 2) {
    swarm.pheromones.war = clampPheromoneValue(swarm.pheromones.war + swarm.danger * 10, config);
  }

  if (swarm.danger >= 3) {
    swarm.pheromones.siege = clampPheromoneValue(swarm.pheromones.siege + 20, config);
  }
}

function applyLogisticsContribution(pheromones: PheromoneState, room: Room, config: PheromoneConfig): void {
  if (!room.storage) return;

  const spawns = room.find(FIND_MY_SPAWNS);
  const spawnEnergy = spawns.reduce((sum, spawn) => sum + spawn.store.getUsedCapacity(RESOURCE_ENERGY), 0);
  const maxSpawnEnergy = spawns.length * 300;

  if (spawnEnergy < maxSpawnEnergy * 0.5) {
    pheromones.logistics = clampPheromoneValue(pheromones.logistics + 10, config);
  }
}

function applyExpandContribution(swarm: SwarmState, tracker: RoomMetricsTracker, config: PheromoneConfig): void {
  const energyBalance = tracker.energyHarvested.get() - swarm.metrics.energySpawning;
  if (energyBalance > 0 && swarm.danger === 0) {
    swarm.pheromones.expand = clampPheromoneValue(swarm.pheromones.expand + Math.min(energyBalance / 100, 10), config);
  }
}
