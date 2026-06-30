import { getActualHostileCreeps } from "@ralphschuler/screeps-core";
import type { SwarmState } from "@ralphschuler/screeps-memory";
import type { RoomMetricsTracker } from "./rollingAverage";
import { getRoomSources } from "./sourceCache";

/**
 * Update rolling room metrics used by pheromone contribution rules.
 *
 * Metrics are deliberately sampled from current room state and written back to
 * `swarm.metrics`; no strategic decisions are made here.
 */
export function updateRoomMetrics(room: Room, swarm: SwarmState, tracker: RoomMetricsTracker): void {
  const sources = getRoomSources(room);
  tracker.energyHarvested.add(calculateHarvestedEnergy(sources));

  updateControllerProgress(room, tracker);

  // Permanent allies must never become threat signals. Filtering lives in core.
  const hostiles = getActualHostileCreeps(room);
  tracker.hostileCount.add(hostiles.length);
  tracker.damageReceived.add(calculatePotentialHostileDamage(hostiles));

  writeMetricsSnapshot(swarm, tracker);
}

function calculateHarvestedEnergy(sources: Source[]): number {
  let totalSourceCapacity = 0;
  let totalSourceEnergy = 0;

  for (const source of sources) {
    totalSourceCapacity += source.energyCapacity;
    totalSourceEnergy += source.energy;
  }

  return totalSourceCapacity - totalSourceEnergy;
}

function updateControllerProgress(room: Room, tracker: RoomMetricsTracker): void {
  if (!room.controller?.my) return;

  const progressDelta = room.controller.progress - tracker.lastControllerProgress;
  if (progressDelta > 0 && progressDelta < 100000) {
    tracker.controllerProgress.add(progressDelta);
  }
  tracker.lastControllerProgress = room.controller.progress;
}

function calculatePotentialHostileDamage(hostiles: Creep[]): number {
  let potentialDamage = 0;

  for (const hostile of hostiles) {
    for (const part of hostile.body) {
      if (part.hits <= 0) continue;

      if (part.type === ATTACK) {
        potentialDamage += 30;
      } else if (part.type === RANGED_ATTACK) {
        potentialDamage += 10;
      }
    }
  }

  return potentialDamage;
}

function writeMetricsSnapshot(swarm: SwarmState, tracker: RoomMetricsTracker): void {
  swarm.metrics.energyHarvested = tracker.energyHarvested.get();
  swarm.metrics.controllerProgress = tracker.controllerProgress.get();
  swarm.metrics.hostileCount = Math.round(tracker.hostileCount.get());
  swarm.metrics.damageReceived = tracker.damageReceived.get();
}
