/**
 * Cross-Shard Intelligence Coordinator
 *
 * Coordinates intelligence sharing across shards:
 * - Share enemy intelligence
 * - Coordinate threat responses
 * - Share war targets
 *
 * Addresses Issue: Intelligence & Coordination (cross-shard coordination)
 */

import { isKnownAllyPlayer, logger } from "@ralphschuler/screeps-core";
import { deserializeInterShardMemory, serializeInterShardMemory } from "@ralphschuler/screeps-intershard";
import type { SharedEnemyIntel } from "@ralphschuler/screeps-intershard";
import { memoryManager } from "@ralphschuler/screeps-memory";
import { ProcessPriority } from "../core/kernel";
import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { mergeCrossShardEnemyIntel } from "./crossShardIntelMerge";

/**
 * Cross-Shard Intel Configuration
 */
export interface CrossShardIntelConfig {
  /** Update interval in ticks */
  updateInterval: number;
  /** Minimum bucket to run sync */
  minBucket: number;
  /** Maximum CPU budget per tick (fraction of limit) */
  maxCpuBudget: number;
}

const DEFAULT_CONFIG: CrossShardIntelConfig = {
  updateInterval: 300,
  minBucket: 6000,
  maxCpuBudget: 0.01 // 1% of CPU limit
};

/**
 * Cross-Shard Intel Coordinator Class
 */
@ProcessClass()
export class CrossShardIntelCoordinator {
  private config: CrossShardIntelConfig;
  private lastRun = 0;

  public constructor(config: Partial<CrossShardIntelConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main sync tick - runs periodically
   * Registered as kernel process via decorator
   */
  @LowFrequencyProcess("empire:crossShardIntel", "Cross-Shard Intel", {
    priority: ProcessPriority.LOW,
    interval: 300,
    minBucket: 6000,
    cpuBudget: 0.01
  })
  public run(): void {
    this.lastRun = Game.time;

    // Load current intershard memory
    const rawData = InterShardMemory.getLocal();
    if (!rawData) return;

    const interShardMemory = deserializeInterShardMemory(rawData);
    if (!interShardMemory) return;

    // Update enemy intelligence
    this.updateEnemyIntelligence(interShardMemory);

    // Save updated intershard memory
    const serialized = serializeInterShardMemory(interShardMemory);
    InterShardMemory.setLocal(serialized);
  }

  /**
   * Update enemy intelligence in intershard memory
   */
  private updateEnemyIntelligence(interShardMemory: ReturnType<typeof deserializeInterShardMemory>): void {
    if (!interShardMemory) return;

    const empire = memoryManager.getEmpire();
    const knownRooms = Object.entries(empire.knownRooms ?? {}).map(([roomName, intel]) => ({
      roomName,
      owner: intel?.owner,
      threatLevel: (intel?.threatLevel ?? 0) as 0 | 1 | 2 | 3,
      lastSeen: intel?.lastSeen ?? 0
    }));

    const intent = mergeCrossShardEnemyIntel({
      existingEnemies: interShardMemory.globalTargets.enemies ?? [],
      warTargets: empire.warTargets ?? [],
      knownRooms,
      now: Game.time,
      isAlly: username => isKnownAllyPlayer(username, { empire })
    });

    interShardMemory.globalTargets.enemies = intent.enemies;

    // Log summary periodically
    if (Game.time % 500 === 0) {
      const totalEnemies = interShardMemory.globalTargets.enemies.length;
      const highThreatEnemies = interShardMemory.globalTargets.enemies.filter(e => e.threatLevel >= 2).length;
      logger.info(`Cross-shard intel: ${totalEnemies} enemies tracked, ${highThreatEnemies} high threat`, {
        subsystem: "CrossShardIntel"
      });
    }
  }

  /**
   * Get global enemies from intershard memory
   */
  public getGlobalEnemies(): SharedEnemyIntel[] {
    const rawData = InterShardMemory.getLocal();
    if (!rawData) return [];

    const interShardMemory = deserializeInterShardMemory(rawData);
    if (!interShardMemory) return [];

    return interShardMemory.globalTargets.enemies || [];
  }
}

/**
 * Global cross-shard intel coordinator instance
 */
export const crossShardIntelCoordinator = new CrossShardIntelCoordinator();
