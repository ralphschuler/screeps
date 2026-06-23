/**
 * Pheromone Manager - public facade for room-level swarm signals.
 *
 * The manager owns package state (config + rolling trackers). Domain math lives in
 * smaller modules so decay, metrics, events, and diffusion can be audited without
 * reading one large orchestrator.
 */

import type { PheromoneState, SwarmState } from "@ralphschuler/screeps-memory";
import { DEFAULT_PHEROMONE_CONFIG, type PheromoneConfig } from "./config";
import { applyPheromoneDecay, applyRoomPheromoneContributions } from "./contributionRules";
import { applyDiffusion, diffuseDangerToCluster } from "./diffusionRules";
import {
  applyHostileDetectionSignal,
  applyNukeDetectionSignal,
  applyRemoteSourceLostSignal,
  applyStructureDestroyedSignal,
  applyThreatAssessmentSignal
} from "./eventSignals";
import { createMetricsTracker, type RoomMetricsTracker } from "./rollingAverage";
import { updateRoomMetrics } from "./metrics";

// Re-export for tests and external consumers that intentionally import config from manager.
export { DEFAULT_PHEROMONE_CONFIG } from "./config";
export type { PheromoneConfig } from "./config";

/** Coordinates pheromone sampling, updates, event spikes, and diffusion. */
export class PheromoneManager {
  private config: PheromoneConfig;
  private trackers: Map<string, RoomMetricsTracker> = new Map();

  public constructor(config: Partial<PheromoneConfig> = {}) {
    this.config = { ...DEFAULT_PHEROMONE_CONFIG, ...config };
  }

  /** Get or create the rolling metrics tracker for a room. */
  public getTracker(roomName: string): RoomMetricsTracker {
    let tracker = this.trackers.get(roomName);
    if (!tracker) {
      tracker = createMetricsTracker();
      this.trackers.set(roomName, tracker);
    }
    return tracker;
  }

  /** Sample room state and refresh the swarm metrics snapshot. */
  public updateMetrics(room: Room, swarm: SwarmState): void {
    updateRoomMetrics(room, swarm, this.getTracker(room.name));
  }

  /** Apply the periodic decay/contribution pass when the room is due. */
  public updatePheromones(swarm: SwarmState, room: Room): void {
    if (Game.time < swarm.nextUpdateTick) return;

    applyPheromoneDecay(swarm.pheromones, this.config);
    applyRoomPheromoneContributions(swarm, room, this.getTracker(room.name), this.config);

    swarm.nextUpdateTick = Game.time + this.config.updateInterval;
    swarm.lastUpdate = Game.time;
  }

  /** Handle hostile detection. */
  public onHostileDetected(swarm: SwarmState, hostileCount: number, danger: 0 | 1 | 2 | 3): void {
    applyHostileDetectionSignal(swarm, hostileCount, danger, this.config);
  }

  /** Update danger pheromone based on threat assessment. */
  public updateDangerFromThreat(swarm: SwarmState, threatScore: number, dangerLevel: 0 | 1 | 2 | 3): void {
    applyThreatAssessmentSignal(swarm, threatScore, dangerLevel, this.config);
  }

  /** Diffuse danger pheromone to neighboring cluster rooms. */
  public diffuseDangerToCluster(sourceRoom: string, threatScore: number, clusterRooms: string[]): void {
    diffuseDangerToCluster(sourceRoom, threatScore, clusterRooms, this.config);
  }

  /** Handle structure destroyed. */
  public onStructureDestroyed(swarm: SwarmState, structureType: StructureConstant): void {
    applyStructureDestroyedSignal(swarm, structureType, this.config);
  }

  /** Handle nuke detection. */
  public onNukeDetected(swarm: SwarmState): void {
    applyNukeDetectionSignal(swarm, this.config);
  }

  /** Handle remote source lost. */
  public onRemoteSourceLost(swarm: SwarmState): void {
    applyRemoteSourceLostSignal(swarm, this.config);
  }

  /** Apply configured diffusion between neighboring room swarms. */
  public applyDiffusion(rooms: Map<string, SwarmState>): void {
    applyDiffusion(rooms, this.config);
  }

  /** Return the strongest pheromone above the minimum action threshold. */
  public getDominantPheromone(pheromones: PheromoneState): keyof PheromoneState | null {
    let maxKey: keyof PheromoneState | null = null;
    let maxValue = 1;

    for (const key of Object.keys(pheromones) as (keyof PheromoneState)[]) {
      if (pheromones[key] > maxValue) {
        maxValue = pheromones[key];
        maxKey = key;
      }
    }

    return maxKey;
  }
}
