/**
 * Pheromone-based coordination system with metrics collection, periodic updates, and diffusion.
 */

import { logger } from "@ralphschuler/screeps-core";
import { safeFind } from "@ralphschuler/screeps-utils";
import type { PheromoneState, SwarmState } from "@ralphschuler/screeps-memory";

/** Pheromone system configuration */
export interface PheromoneConfig {
  updateInterval: number;
  decayFactors: Record<keyof PheromoneState, number>;
  diffusionRates: Record<keyof PheromoneState, number>;
  maxValue: number;
  minValue: number;
}

/** Default pheromone configuration */
export const DEFAULT_PHEROMONE_CONFIG: PheromoneConfig = {
  updateInterval: 5,
  decayFactors: {
    expand: 0.95,
    harvest: 0.9,
    build: 0.92,
    upgrade: 0.93,
    defense: 0.97,
    war: 0.98,
    siege: 0.99,
    logistics: 0.91,
    nukeTarget: 0.99
  },
  diffusionRates: {
    expand: 0.3,
    harvest: 0.1,
    build: 0.15,
    upgrade: 0.1,
    defense: 0.4,
    war: 0.5,
    siege: 0.6,
    logistics: 0.2,
    nukeTarget: 0.1
  },
  maxValue: 100,
  minValue: 0
};

/**
 * Rolling average tracker for metrics
 */
export class RollingAverage {
  private values: number[] = [];
  private sum = 0;

  public constructor(private maxSamples: number = 10) {}

  public add(value: number): number {
    this.values.push(value);
    this.sum += value;

    if (this.values.length > this.maxSamples) {
      const removed = this.values.shift();
      this.sum -= removed ?? 0;
    }

    return this.get();
  }

  public get(): number {
    return this.values.length > 0 ? this.sum / this.values.length : 0;
  }

  public reset(): void {
    this.values = [];
    this.sum = 0;
  }
}

/** Room metrics tracker */
export interface RoomMetricsTracker {
  energyHarvested: RollingAverage;
  energySpawning: RollingAverage;
  energyConstruction: RollingAverage;
  energyRepair: RollingAverage;
  energyTower: RollingAverage;
  controllerProgress: RollingAverage;
  hostileCount: RollingAverage;
  damageReceived: RollingAverage;
  idleWorkers: RollingAverage;
  lastControllerProgress: number;
}

/** Create a new metrics tracker */
export function createMetricsTracker(): RoomMetricsTracker {
  return {
    energyHarvested: new RollingAverage(10),
    energySpawning: new RollingAverage(10),
    energyConstruction: new RollingAverage(10),
    energyRepair: new RollingAverage(10),
    energyTower: new RollingAverage(10),
    controllerProgress: new RollingAverage(10),
    hostileCount: new RollingAverage(5),
    damageReceived: new RollingAverage(5),
    idleWorkers: new RollingAverage(10),
    lastControllerProgress: 0
  };
}

/** Pheromone Manager */
export class PheromoneManager {
  private config: PheromoneConfig;
  private trackers: Map<string, RoomMetricsTracker> = new Map();

  public constructor(config: Partial<PheromoneConfig> = {}) {
    this.config = { ...DEFAULT_PHEROMONE_CONFIG, ...config };
  }

  /**
   * Get or create metrics tracker for a room
   */
  public getTracker(roomName: string): RoomMetricsTracker {
    let tracker = this.trackers.get(roomName);
    if (!tracker) {
      tracker = createMetricsTracker();
      this.trackers.set(roomName, tracker);
    }
    return tracker;
  }

  /**
   * Update metrics from a room.
   * OPTIMIZATION: Reuses cached sources to reduce duplicate find() calls.
   */
  public updateMetrics(room: Room, swarm: SwarmState): void {
    const tracker = this.getTracker(room.name);

    // OPTIMIZATION: Cache sources to share with calculateContributions
    const cacheKey = `sources_${room.name}`;
    const cached = (global as unknown as Record<string, { sources: Source[]; tick: number } | undefined>)[cacheKey];
    let sources: Source[];

    if (cached && cached.tick === Game.time) {
      sources = cached.sources;
    } else {
      sources = room.find(FIND_SOURCES);
      (global as unknown as Record<string, { sources: Source[]; tick: number }>)[cacheKey] = { sources, tick: Game.time };
    }

    // Use a single loop for efficiency
    let totalSourceCapacity = 0;
    let totalSourceEnergy = 0;
    for (const source of sources) {
      totalSourceCapacity += source.energyCapacity;
      totalSourceEnergy += source.energy;
    }
    const harvested = totalSourceCapacity - totalSourceEnergy;
    tracker.energyHarvested.add(harvested);

    // Controller progress
    if (room.controller?.my) {
      const progressDelta = room.controller.progress - tracker.lastControllerProgress;
      if (progressDelta > 0 && progressDelta < 100000) {
        tracker.controllerProgress.add(progressDelta);
      }
      tracker.lastControllerProgress = room.controller.progress;
    }

    // Calculate damage in a single loop
    const hostiles = safeFind(room, FIND_HOSTILE_CREEPS);
    tracker.hostileCount.add(hostiles.length);

    let potentialDamage = 0;
    for (const hostile of hostiles) {
      for (const part of hostile.body) {
        if (part.hits > 0) {
          if (part.type === ATTACK) {
            potentialDamage += 30;
          } else if (part.type === RANGED_ATTACK) {
            potentialDamage += 10;
          }
        }
      }
    }
    tracker.damageReceived.add(potentialDamage);

    // Update swarm metrics
    swarm.metrics.energyHarvested = tracker.energyHarvested.get();
    swarm.metrics.controllerProgress = tracker.controllerProgress.get();
    swarm.metrics.hostileCount = Math.round(tracker.hostileCount.get());
    swarm.metrics.damageReceived = tracker.damageReceived.get();
  }

  /** Periodic pheromone update */
  public updatePheromones(swarm: SwarmState, room: Room): void {
    if (Game.time < swarm.nextUpdateTick) return;

    const pheromones = swarm.pheromones;

    // Apply decay
    for (const key of Object.keys(pheromones) as (keyof PheromoneState)[]) {
      const decayFactor = this.config.decayFactors[key];
      pheromones[key] = this.clamp(pheromones[key] * decayFactor);
    }

    // Calculate contributions
    this.calculateContributions(swarm, room);

    // Set next update tick
    swarm.nextUpdateTick = Game.time + this.config.updateInterval;
    swarm.lastUpdate = Game.time;
  }

  /**
   * Calculate pheromone contributions from current state.
   * OPTIMIZATION: Reuses sources cached by updateMetrics.
   */
  private calculateContributions(swarm: SwarmState, room: Room): void {
    const pheromones = swarm.pheromones;
    const tracker = this.getTracker(room.name);

    // OPTIMIZATION: Sources already cached in updateMetrics
    const cacheKey = `sources_${room.name}`;
    const cached = (global as unknown as Record<string, { sources: Source[]; tick: number } | undefined>)[cacheKey];
    let sources: Source[];

    if (cached && cached.tick === Game.time) {
      sources = cached.sources;
    } else {
      sources = room.find(FIND_SOURCES);
      (global as unknown as Record<string, { sources: Source[]; tick: number }>)[cacheKey] = { sources, tick: Game.time };
    }

    if (sources.length > 0) {
      const avgEnergy = sources.reduce((sum, s) => sum + s.energy, 0) / sources.length;
      pheromones.harvest = this.clamp(pheromones.harvest + (avgEnergy / 3000) * 10);
    }

    // Build contribution based on construction sites
    const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
    if (sites.length > 0) {
      pheromones.build = this.clamp(pheromones.build + Math.min(sites.length * 2, 20));
    }

    // Upgrade contribution based on controller progress
    if (room.controller?.my) {
      const progressPercent = room.controller.progress / room.controller.progressTotal;
      if (progressPercent < 0.5) {
        pheromones.upgrade = this.clamp(pheromones.upgrade + (1 - progressPercent) * 15);
      }
    }

    // Defense contribution based on hostiles
    const hostileAvg = tracker.hostileCount.get();
    if (hostileAvg > 0) {
      pheromones.defense = this.clamp(pheromones.defense + hostileAvg * 10);
    }

    // War contribution if threat is sustained
    if (swarm.danger >= 2) {
      pheromones.war = this.clamp(pheromones.war + swarm.danger * 10);
    }

    // Siege if critical threat
    if (swarm.danger >= 3) {
      pheromones.siege = this.clamp(pheromones.siege + 20);
    }

    // OPTIMIZATION: Use cached spawns from structure cache if available
    if (room.storage) {
      const spawns = room.find(FIND_MY_SPAWNS);
      const spawnEnergy = spawns.reduce((sum, s) => sum + s.store.getUsedCapacity(RESOURCE_ENERGY), 0);
      const maxSpawnEnergy = spawns.length * 300;
      if (spawnEnergy < maxSpawnEnergy * 0.5) {
        pheromones.logistics = this.clamp(pheromones.logistics + 10);
      }
    }

    // Expand contribution if economy is stable
    const energyBalance = tracker.energyHarvested.get() - swarm.metrics.energySpawning;
    if (energyBalance > 0 && swarm.danger === 0) {
      pheromones.expand = this.clamp(pheromones.expand + Math.min(energyBalance / 100, 10));
    }
  }

  /** Clamp pheromone value to valid range */
  private clamp(value: number): number {
    return Math.max(this.config.minValue, Math.min(this.config.maxValue, value));
  }

  // ============================================================================
  // Event-Driven Updates
  // ============================================================================

  /**
   * Handle hostile detection
   */
  public onHostileDetected(swarm: SwarmState, hostileCount: number, danger: 0 | 1 | 2 | 3): void {
    swarm.danger = danger;
    swarm.pheromones.defense = this.clamp(swarm.pheromones.defense + hostileCount * 5);

    if (danger >= 2) {
      swarm.pheromones.war = this.clamp(swarm.pheromones.war + danger * 10);
    }

    if (danger >= 3) {
      swarm.pheromones.siege = this.clamp(swarm.pheromones.siege + 20);
    }

    logger.info(`Hostile detected: ${hostileCount} hostiles, danger=${danger}`, {
      room: swarm.role,
      subsystem: "Pheromone"
    });
  }

  /**
   * Update danger pheromone based on threat assessment
   * Integrates with threat assessment system for more accurate danger signaling
   * 
   * @param swarm - Swarm state to update
   * @param threatScore - Composite threat score from threat assessment
   * @param dangerLevel - Calculated danger level (0-3)
   */
  public updateDangerFromThreat(swarm: SwarmState, threatScore: number, dangerLevel: 0 | 1 | 2 | 3): void {
    // Set danger level
    swarm.danger = dangerLevel;

    // Update defense pheromone based on threat score
    swarm.pheromones.defense = this.clamp(threatScore / 10);

    // Update war pheromone if persistent threat
    if (dangerLevel >= 2) {
      swarm.pheromones.war = this.clamp(swarm.pheromones.war + dangerLevel * 10);
    }

    // Update siege pheromone if critical threat
    if (dangerLevel >= 3) {
      swarm.pheromones.siege = this.clamp(swarm.pheromones.siege + 20);
    }
  }

  /**
   * Diffuse danger pheromone to neighboring cluster rooms
   * 
   * @param sourceRoom - Room with threat
   * @param threatScore - Composite threat score
   * @param clusterRooms - All rooms in the cluster
   */
  public diffuseDangerToCluster(sourceRoom: string, threatScore: number, clusterRooms: string[]): void {
    for (const neighborRoom of clusterRooms) {
      if (neighborRoom === sourceRoom) continue;

      const room = Game.rooms[neighborRoom];
      if (!room?.controller?.my) continue;

      // Get or initialize neighbor swarm state
      const neighborSwarm = (room.memory as unknown as { swarm?: SwarmState }).swarm;
      if (!neighborSwarm) continue;

      // Diffuse defense pheromone based on difference from source-equivalent level
      const sourceDefenseLevel = this.clamp(threatScore / 10);
      const neighborDefense = neighborSwarm.pheromones.defense;
      const positiveDifference = Math.max(0, sourceDefenseLevel - neighborDefense);
      const diffusedAmount = positiveDifference * 0.05; // 5% of difference toward source level
      neighborSwarm.pheromones.defense = this.clamp(
        neighborDefense + diffusedAmount
      );
    }
  }

  /**
   * Handle structure destroyed
   */
  public onStructureDestroyed(swarm: SwarmState, structureType: StructureConstant): void {
    swarm.pheromones.defense = this.clamp(swarm.pheromones.defense + 5);
    swarm.pheromones.build = this.clamp(swarm.pheromones.build + 10);

    // Critical structures increase danger
    if (structureType === STRUCTURE_SPAWN || structureType === STRUCTURE_STORAGE || structureType === STRUCTURE_TOWER) {
      swarm.danger = Math.min(3, swarm.danger + 1) as 0 | 1 | 2 | 3;
      swarm.pheromones.siege = this.clamp(swarm.pheromones.siege + 15);
    }
  }

  /**
   * Handle nuke detection
   */
  public onNukeDetected(swarm: SwarmState): void {
    swarm.danger = 3;
    swarm.pheromones.siege = this.clamp(swarm.pheromones.siege + 50);
    swarm.pheromones.defense = this.clamp(swarm.pheromones.defense + 30);
  }

  /**
   * Handle remote source lost
   */
  public onRemoteSourceLost(swarm: SwarmState): void {
    swarm.pheromones.expand = this.clamp(swarm.pheromones.expand - 10);
    swarm.pheromones.defense = this.clamp(swarm.pheromones.defense + 5);
  }

  // ============================================================================
  // Pheromone Diffusion
  // ============================================================================

  /**
   * Apply diffusion to neighboring rooms
   */
  public applyDiffusion(rooms: Map<string, SwarmState>): void {
    const diffusionQueue: {
      source: string;
      target: string;
      type: keyof PheromoneState;
      amount: number;
      sourceIntensity: number;
    }[] = [];

    for (const [roomName, swarm] of rooms) {
      const neighbors = this.getNeighborRoomNames(roomName);

      for (const neighborName of neighbors) {
        const neighborSwarm = rooms.get(neighborName);
        if (!neighborSwarm) continue;

        // Diffuse defense, war, expand, and siege
        const diffusibleTypes: (keyof PheromoneState)[] = ["defense", "war", "expand", "siege"];

        for (const type of diffusibleTypes) {
          const intensity = swarm.pheromones[type];
          if (intensity > 1) {
            const rate = this.config.diffusionRates[type];
            diffusionQueue.push({
              source: roomName,
              target: neighborName,
              type,
              amount: intensity * rate * 0.5,
              sourceIntensity: intensity
            });
          }
        }
      }
    }

    // Apply diffusion
    for (const diff of diffusionQueue) {
      const targetSwarm = rooms.get(diff.target);
      if (targetSwarm) {
        const newValue = targetSwarm.pheromones[diff.type] + diff.amount;
        // Cap the target pheromone level to not exceed the source room's level
        // This prevents rooms from pushing each other higher than their own level
        targetSwarm.pheromones[diff.type] = this.clamp(Math.min(newValue, diff.sourceIntensity));
      }
    }
  }

  /**
   * Get neighboring room names
   */
  private getNeighborRoomNames(roomName: string): string[] {
    const match = roomName.match(/^([WE])(\d+)([NS])(\d+)$/);
    if (!match) return [];

    const [, wx, xStr, wy, yStr] = match;
    if (!wx || !xStr || !wy || !yStr) return [];

    const x = parseInt(xStr, 10);
    const y = parseInt(yStr, 10);

    const neighbors: string[] = [];

    // Cardinal directions
    if (wy === "N") {
      neighbors.push(`${wx}${x}N${y + 1}`);
    } else {
      if (y > 0) {
        neighbors.push(`${wx}${x}S${y - 1}`);
      } else {
        neighbors.push(`${wx}${x}N0`);
      }
    }

    if (wy === "S") {
      neighbors.push(`${wx}${x}S${y + 1}`);
    } else {
      if (y > 0) {
        neighbors.push(`${wx}${x}N${y - 1}`);
      } else {
        neighbors.push(`${wx}${x}S0`);
      }
    }

    if (wx === "E") {
      neighbors.push(`E${x + 1}${wy}${y}`);
    } else {
      if (x > 0) {
        neighbors.push(`W${x - 1}${wy}${y}`);
      } else {
        neighbors.push(`E0${wy}${y}`);
      }
    }

    if (wx === "W") {
      neighbors.push(`W${x + 1}${wy}${y}`);
    } else {
      if (x > 0) {
        neighbors.push(`E${x - 1}${wy}${y}`);
      } else {
        neighbors.push(`W0${wy}${y}`);
      }
    }

    return neighbors;
  }

  /**
   * Get dominant pheromone for a room
   */
  public getDominantPheromone(pheromones: PheromoneState): keyof PheromoneState | null {
    let maxKey: keyof PheromoneState | null = null;
    let maxValue = 1; // Minimum threshold

    for (const key of Object.keys(pheromones) as (keyof PheromoneState)[]) {
      if (pheromones[key] > maxValue) {
        maxValue = pheromones[key];
        maxKey = key;
      }
    }

    return maxKey;
  }
}

/**
 * Global pheromone manager instance
 */
export const pheromoneManager = new PheromoneManager();
