/**
 * Shard Manager - Multi-Shard Coordination (Framework Wrapper)
 *
 * This is a thin wrapper around @ralphschuler/screeps-intershard's ShardManager
 * that integrates with the bot's kernel and process management.
 *
 * Manages shard-specific strategies:
 * - Shard role assignment (core, frontier, resource, backup, war)
 * - CPU limit distribution via Game.cpu.setShardLimits
 * - Shard health monitoring
 * - Inter-shard communication strategy
 *
 * Addresses Issue: #7
 */

import { ShardManager as FrameworkShardManager } from "@ralphschuler/screeps-intershard";
import type { ShardManagerConfig } from "@ralphschuler/screeps-intershard";
import { ProcessPriority } from "../core/kernel";
import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";

/**
 * Shard Manager Wrapper Class - Wraps framework ShardManager
 */
@ProcessClass()
export class ShardManager extends FrameworkShardManager {
  public constructor(config: Partial<ShardManagerConfig> = {}) {
    super(config);
  }

  /**
   * Main shard tick - runs periodically
   * Registered as kernel process via decorator
   * Overrides framework stub decorator with real bot decorator
   */
  @LowFrequencyProcess("empire:shard", "Shard Manager", {
    priority: ProcessPriority.LOW,
    interval: 100,
    minBucket: 0,
    cpuBudget: 0.02
  })
  public run(): void {
    super.run();
  }
}

/**
 * Global shard manager instance
 */
export const shardManager = new ShardManager();
