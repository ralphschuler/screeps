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

import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { ProcessPriority } from "../core/kernel";
import { logger } from "../core/logger";
import { memoryManager } from "../memory/manager";
import { deserializeInterShardMemory, serializeInterShardMemory } from "../intershard/schema";
import type { SharedEnemyIntel } from "../intershard/schema";

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
  updateInterval: 50,
  minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
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
    interval: 50,
    minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
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

    // Get current shard's enemy data using memoryManager
    const overmind = memoryManager.getOvermind();
    const enemyMap = new Map<string, SharedEnemyIntel>();

    // Initialize from existing global enemies
    if (interShardMemory.globalTargets.enemies) {
      for (const enemy of interShardMemory.globalTargets.enemies) {
        enemyMap.set(enemy.username, enemy);
      }
    }

    // Update with current shard data from overmind
    if (overmind.warTargets) {
      for (const target of overmind.warTargets) {
        const existing = enemyMap.get(target);
        if (existing) {
          existing.lastSeen = Game.time;
          existing.threatLevel = Math.max(existing.threatLevel, 1) as 0 | 1 | 2 | 3;
        } else {
          enemyMap.set(target, {
            username: target,
            rooms: [],
            threatLevel: 1,
            lastSeen: Game.time,
            isAlly: false
          });
        }
      }
    }

    // Update with room intel data
    if (overmind.roomIntel) {
      for (const roomName in overmind.roomIntel) {
        const intel = overmind.roomIntel[roomName];
        if (intel && intel.owner && !intel.owner.includes("Source Keeper")) {
          const existing = enemyMap.get(intel.owner);
          if (existing) {
            if (!existing.rooms.includes(roomName)) {
              existing.rooms.push(roomName);
            }
            existing.lastSeen = Math.max(existing.lastSeen, intel.lastSeen);
            existing.threatLevel = Math.max(existing.threatLevel, intel.threatLevel) as 0 | 1 | 2 | 3;
          } else {
            // New enemy player discovered
            enemyMap.set(intel.owner, {
              username: intel.owner,
              rooms: [roomName],
              threatLevel: intel.threatLevel,
              lastSeen: intel.lastSeen,
              isAlly: false
            });
          }
        }
      }
    }

    // Note: Alliance system has been removed per ROADMAP "Required Code Only" philosophy
    // The allies field in InterShardMemory schema remains for potential future use

    // Update intershard memory
    interShardMemory.globalTargets.enemies = Array.from(enemyMap.values());

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
   * Add ally to global list
   */
  public addGlobalAlly(username: string): void {
    const rawData = InterShardMemory.getLocal();
    if (!rawData) return;

    const interShardMemory = deserializeInterShardMemory(rawData);
    if (!interShardMemory) return;

    if (!interShardMemory.globalTargets.allies) {
      interShardMemory.globalTargets.allies = [];
    }

    if (!interShardMemory.globalTargets.allies.includes(username)) {
      interShardMemory.globalTargets.allies.push(username);
      logger.info(`Added global ally: ${username}`, { subsystem: "CrossShardIntel" });

      const serialized = serializeInterShardMemory(interShardMemory);
      InterShardMemory.setLocal(serialized);
    }
  }

  /**
   * Remove ally from global list
   */
  public removeGlobalAlly(username: string): void {
    const rawData = InterShardMemory.getLocal();
    if (!rawData) return;

    const interShardMemory = deserializeInterShardMemory(rawData);
    if (!interShardMemory) return;

    if (interShardMemory.globalTargets.allies) {
      const index = interShardMemory.globalTargets.allies.indexOf(username);
      if (index > -1) {
        interShardMemory.globalTargets.allies.splice(index, 1);
        logger.info(`Removed global ally: ${username}`, { subsystem: "CrossShardIntel" });

        const serialized = serializeInterShardMemory(interShardMemory);
        InterShardMemory.setLocal(serialized);
      }
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

  /**
   * Get global allies from intershard memory
   */
  public getGlobalAllies(): string[] {
    const rawData = InterShardMemory.getLocal();
    if (!rawData) return [];

    const interShardMemory = deserializeInterShardMemory(rawData);
    if (!interShardMemory) return [];

    return interShardMemory.globalTargets.allies || [];
  }
}

/**
 * Global cross-shard intel coordinator instance
 */
export const crossShardIntelCoordinator = new CrossShardIntelCoordinator();
