/**
 * Shard Manager - Multi-Shard Coordination
 *
 * Manages shard-specific strategies:
 * - Shard role assignment (core, frontier, resource, backup, war)
 * - CPU limit distribution via Game.cpu.setShardLimits
 * - Shard health monitoring
 * - Inter-shard communication strategy
 *
 * Addresses Issue: #7
 */

import type {
  InterShardMemorySchema,
  InterShardTask,
  PortalInfo,
  ShardHealthMetrics,
  ShardRole,
  ShardState
} from "./schema";
import {
  INTERSHARD_MEMORY_LIMIT,
  createDefaultInterShardMemory,
  createDefaultShardState,
  deserializeInterShardMemory,
  serializeInterShardMemory
} from "./schema";
import { logger } from "../core/logger";
import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { ProcessPriority } from "../core/kernel";

/**
 * Shard Manager Configuration
 */
export interface ShardManagerConfig {
  /** Update interval in ticks */
  updateInterval: number;
  /** Minimum bucket to run shard logic */
  minBucket: number;
  /** Maximum CPU budget per tick */
  maxCpuBudget: number;
  /** Default CPU limit per shard */
  defaultCpuLimit: number;
}

const DEFAULT_CONFIG: ShardManagerConfig = {
  updateInterval: 100,
  minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
  maxCpuBudget: 0.02,
  defaultCpuLimit: 20
};

/**
 * CPU distribution based on shard role
 */
const ROLE_CPU_WEIGHTS: Record<ShardRole, number> = {
  core: 1.5, // Core shards get more CPU
  frontier: 0.8, // Frontier shards get less
  resource: 1.0, // Resource shards get standard
  backup: 0.5, // Backup shards get minimal
  war: 1.2 // War shards get above average
};

/**
 * Shard Manager Class
 */
@ProcessClass()
export class ShardManager {
  private config: ShardManagerConfig;
  private lastRun = 0;
  private interShardMemory: InterShardMemorySchema;

  public constructor(config: Partial<ShardManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.interShardMemory = createDefaultInterShardMemory();
  }

  /**
   * Initialize shard manager - load from InterShardMemory
   */
  public initialize(): void {
    try {
      const rawData = InterShardMemory.getLocal();
      if (rawData) {
        const parsed = deserializeInterShardMemory(rawData);
        if (parsed) {
          this.interShardMemory = parsed;
          logger.debug("Loaded InterShardMemory", { subsystem: "Shard" });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error(`Failed to load InterShardMemory: ${errorMessage}`, { subsystem: "Shard" });
    }

    // Ensure current shard is tracked
    const currentShard = Game.shard?.name ?? "shard0";
    if (!this.interShardMemory.shards[currentShard]) {
      this.interShardMemory.shards[currentShard] = createDefaultShardState(currentShard);
    }
  }

  /**
   * Main shard tick - runs periodically
   * Registered as kernel process via decorator
   */
  @LowFrequencyProcess("empire:shard", "Shard Manager", {
    priority: ProcessPriority.LOW,
    interval: 100,
    minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
    cpuBudget: 0.02
  })
  public run(): void {
    this.lastRun = Game.time;

    // Update current shard health
    this.updateCurrentShardHealth();

    // Check and process inter-shard tasks
    this.processInterShardTasks();

    // Scan for portals
    this.scanForPortals();

    // Auto-assign shard role if needed
    this.autoAssignShardRole();

    // Distribute CPU limits if on multi-shard
    if (Object.keys(this.interShardMemory.shards).length > 1) {
      this.distributeCpuLimits();
    }

    // Sync with other shards
    this.syncInterShardMemory();

    // Log status periodically
    if (Game.time % 500 === 0) {
      this.logShardStatus();
    }
  }

  /**
   * Update current shard's health metrics
   */
  private updateCurrentShardHealth(): void {
    const currentShard = Game.shard?.name ?? "shard0";
    const shardState = this.interShardMemory.shards[currentShard];
    if (!shardState) return;

    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);

    // Calculate health metrics
    const cpuUsage = Game.cpu.getUsed() / Game.cpu.limit;
    const cpuCategory: ShardHealthMetrics["cpuCategory"] =
      cpuUsage < 0.5 ? "low" : cpuUsage < 0.75 ? "medium" : cpuUsage < 0.9 ? "high" : "critical";

    const avgRCL =
      ownedRooms.length > 0
        ? ownedRooms.reduce((sum, r) => sum + (r.controller?.level ?? 0), 0) / ownedRooms.length
        : 0;

    // Calculate economy index (0-100)
    let economyIndex = 0;
    for (const room of ownedRooms) {
      const storage = room.storage;
      if (storage) {
        const energy = storage.store.getUsedCapacity(RESOURCE_ENERGY);
        economyIndex += Math.min(100, energy / 5000);
      }
    }
    economyIndex = ownedRooms.length > 0 ? economyIndex / ownedRooms.length : 0;

    // Calculate war index based on danger levels
    let warIndex = 0;
    for (const room of ownedRooms) {
      const hostiles = room.find(FIND_HOSTILE_CREEPS).length;
      warIndex += Math.min(100, hostiles * 10);
    }
    warIndex = ownedRooms.length > 0 ? warIndex / ownedRooms.length : 0;

    // Update health metrics
    shardState.health = {
      cpuCategory,
      cpuUsage: Math.round(cpuUsage * 100) / 100,
      bucketLevel: Game.cpu.bucket,
      economyIndex: Math.round(economyIndex),
      warIndex: Math.round(warIndex),
      commodityIndex: 0, // TODO: Calculate based on factory production
      roomCount: ownedRooms.length,
      avgRCL: Math.round(avgRCL * 10) / 10,
      creepCount: Object.keys(Game.creeps).length,
      lastUpdate: Game.time
    };

    // Update CPU history (keep last 10 entries)
    const cpuHistory = shardState.cpuHistory ?? [];
    cpuHistory.push({
      tick: Game.time,
      cpuLimit: Game.cpu.limit,
      cpuUsed: Game.cpu.getUsed(),
      bucketLevel: Game.cpu.bucket
    });
    // Keep only last 10 entries
    shardState.cpuHistory = cpuHistory.slice(-10);

    // Update current CPU limit
    if (Game.cpu.shardLimits) {
      shardState.cpuLimit = Game.cpu.shardLimits[currentShard];
    }
  }

  /**
   * Process inter-shard tasks
   */
  private processInterShardTasks(): void {
    const currentShard = Game.shard?.name ?? "shard0";
    const tasks = this.interShardMemory.tasks.filter(
      t => t.targetShard === currentShard && t.status === "pending"
    );

    for (const task of tasks) {
      switch (task.type) {
        case "colonize":
          this.handleColonizeTask(task);
          break;
        case "reinforce":
          this.handleReinforceTask(task);
          break;
        case "transfer":
          this.handleTransferTask(task);
          break;
        case "evacuate":
          this.handleEvacuateTask(task);
          break;
      }
    }

    // Clean up completed/failed tasks older than 5000 ticks
    this.interShardMemory.tasks = this.interShardMemory.tasks.filter(
      t => t.status === "pending" || t.status === "active" || Game.time - t.createdAt < 5000
    );
  }

  /**
   * Handle colonize task
   */
  private handleColonizeTask(task: InterShardTask): void {
    // Mark task as active
    task.status = "active";
    const targetRoom = task.targetRoom ?? 'unknown';
    logger.info(`Processing colonize task: ${targetRoom} from ${task.sourceShard}`, {
      subsystem: "Shard"
    });
  }

  /**
   * Handle reinforce task
   */
  private handleReinforceTask(task: InterShardTask): void {
    task.status = "active";
    const targetRoom = task.targetRoom ?? 'unknown';
    logger.info(`Processing reinforce task: ${targetRoom} from ${task.sourceShard}`, {
      subsystem: "Shard"
    });
  }

  /**
   * Handle transfer task
   */
  private handleTransferTask(task: InterShardTask): void {
    task.status = "active";
    logger.info(`Processing transfer task from ${task.sourceShard}`, { subsystem: "Shard" });
  }

  /**
   * Handle evacuate task
   */
  private handleEvacuateTask(task: InterShardTask): void {
    task.status = "active";
    const targetRoom = task.targetRoom ?? 'unknown';
    logger.info(`Processing evacuate task: ${targetRoom} to ${task.targetShard}`, {
      subsystem: "Shard"
    });
  }

  /**
   * Scan for portals in visible rooms
   */
  private scanForPortals(): void {
    const currentShard = Game.shard?.name ?? "shard0";
    const shardState = this.interShardMemory.shards[currentShard];
    if (!shardState) return;

    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      const foundPortals = room.find(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_PORTAL
      });
      const portals = foundPortals as StructurePortal[];

      for (const portal of portals) {
        // Check if portal leads to another shard
        const destination = portal.destination;
        if (!destination) continue;

        // Check if it's an inter-shard portal (destination is RoomPosition on different shard)
        if ("shard" in destination) {
          const targetShard = (destination as { shard: string }).shard;
          const targetRoom = (destination as { room: string }).room;

          // Check if already tracked
          const existing = shardState.portals.find(
            p => p.sourceRoom === roomName && p.targetShard === targetShard
          );

          if (existing) {
            // Update existing portal
            existing.lastScouted = Game.time;
            // Determine stability: portals without decay tick are stable
            existing.isStable = portal.ticksToDecay === undefined;
            if (portal.ticksToDecay !== undefined) {
              existing.decayTick = Game.time + portal.ticksToDecay;
            }
          } else {
            const portalInfo: PortalInfo = {
              sourceRoom: roomName,
              sourcePos: { x: portal.pos.x, y: portal.pos.y },
              targetShard,
              targetRoom,
              threatRating: 0,
              lastScouted: Game.time,
              isStable: portal.ticksToDecay === undefined,
              traversalCount: 0
            };

            // Check for decay tick on unstable portals
            if (portal.ticksToDecay !== undefined) {
              portalInfo.decayTick = Game.time + portal.ticksToDecay;
            }

            shardState.portals.push(portalInfo);
            logger.info(`Discovered portal in ${roomName} to ${targetShard}/${targetRoom}`, {
              subsystem: "Shard"
            });
          }
        }
      }
    }

    // Clean up expired portals
    shardState.portals = shardState.portals.filter(
      p => !p.decayTick || p.decayTick > Game.time
    );
  }

  /**
   * Auto-assign shard role based on metrics
   */
  private autoAssignShardRole(): void {
    const currentShard = Game.shard?.name ?? "shard0";
    const shardState = this.interShardMemory.shards[currentShard];
    if (!shardState) return;

    const health = shardState.health;
    const allShards = Object.values(this.interShardMemory.shards);

    // Determine role based on metrics with improved logic
    let newRole: ShardRole = shardState.role;

    // War role: high war index or under active attack
    if (health.warIndex > 50) {
      newRole = "war";
    }
    // Frontier role: low room count and low RCL, actively expanding
    else if (health.roomCount < 3 && health.avgRCL < 4) {
      newRole = "frontier";
    }
    // Resource role: strong economy, multiple mature rooms
    else if (health.economyIndex > 70 && health.roomCount >= 3 && health.avgRCL >= 6) {
      newRole = "resource";
    }
    // Backup role: minimal presence, used for redundancy
    else if (allShards.length > 1 && health.roomCount < 2 && health.avgRCL < 3) {
      newRole = "backup";
    }
    // Core role: stable, growing empire
    else if (health.roomCount >= 2 && health.avgRCL >= 4) {
      newRole = "core";
    }

    // Additional logic: transition from frontier to core when established
    if (shardState.role === "frontier" && health.roomCount >= 3 && health.avgRCL >= 5) {
      newRole = "core";
      logger.info("Transitioning from frontier to core shard", { subsystem: "Shard" });
    }

    // Transition from war back to previous role when war index drops
    if (shardState.role === "war" && health.warIndex < 20) {
      // Determine best role based on current state
      if (health.economyIndex > 70 && health.roomCount >= 3) {
        newRole = "resource";
      } else if (health.roomCount >= 2) {
        newRole = "core";
      } else {
        newRole = "frontier";
      }
      logger.info(`War ended, transitioning to ${newRole}`, { subsystem: "Shard" });
    }

    if (newRole !== shardState.role) {
      shardState.role = newRole;
      logger.info(`Auto-assigned shard role: ${newRole}`, { subsystem: "Shard" });
    }
  }

  /**
   * Calculate CPU efficiency for a shard based on its history
   */
  private calculateCpuEfficiency(shard: ShardState): number {
    if (!shard.cpuHistory || shard.cpuHistory.length === 0) return 1.0;

    // Calculate average CPU usage efficiency
    let totalEfficiency = 0;
    for (const entry of shard.cpuHistory) {
      if (entry.cpuLimit > 0) {
        totalEfficiency += entry.cpuUsed / entry.cpuLimit;
      }
    }
    return totalEfficiency / shard.cpuHistory.length;
  }

  /**
   * Calculate weight for a shard based on role, load, and efficiency
   */
  private calculateShardWeight(
    shard: ShardState,
    shardName: string,
    currentShard: string
  ): number {
    let weight = ROLE_CPU_WEIGHTS[shard.role];

    // Adjust weight based on bucket level
    const bucketLevel = shardName === currentShard ? Game.cpu.bucket : shard.health.bucketLevel;
    if (bucketLevel < 2000) {
      weight *= 0.8; // Reduce allocation if bucket is critically low
    } else if (bucketLevel < 5000) {
      weight *= 0.9; // Slightly reduce allocation if bucket is low
    } else if (bucketLevel > 9000) {
      weight *= 1.1; // Increase allocation if bucket is very high
    }

    // Adjust based on CPU efficiency (high usage = needs more)
    const efficiency = this.calculateCpuEfficiency(shard);
    if (efficiency > 0.95) {
      weight *= 1.15; // Shard is using almost all CPU, likely needs more
    } else if (efficiency < 0.6) {
      weight *= 0.85; // Shard is underutilizing CPU
    }

    // War shards with high war index get priority
    if (shard.role === "war" && shard.health.warIndex > 50) {
      weight *= 1.2;
    }

    return weight;
  }

  /**
   * Distribute CPU limits across shards based on roles and load
   */
  private distributeCpuLimits(): void {
    try {
      const shards = this.interShardMemory.shards;
      const shardNames = Object.keys(shards);
      const totalCpu = Game.cpu.shardLimits
        ? Object.values(Game.cpu.shardLimits).reduce((sum, cpu) => sum + cpu, 0)
        : this.config.defaultCpuLimit * shardNames.length;

      const currentShard = Game.shard?.name ?? "shard0";

      // Calculate weighted distribution with dynamic adjustments
      const weights: Record<string, number> = {};
      let totalWeight = 0;

      for (const name of shardNames) {
        const shard = shards[name];
        if (!shard) continue;

        const weight = this.calculateShardWeight(shard, name, currentShard);
        weights[name] = weight;
        totalWeight += weight;
      }

      // Build new limits
      const newLimits: { [shard: string]: number } = {};
      for (const name of shardNames) {
        if (weights[name]) {
          newLimits[name] = Math.max(5, Math.round((weights[name] / totalWeight) * totalCpu));
        }
      }

      // Only update if different from current
      if (Game.cpu.shardLimits) {
        const currentLimits = Game.cpu.shardLimits;
        const needsUpdate = shardNames.some(
          name => Math.abs((currentLimits[name] ?? 0) - (newLimits[name] ?? 0)) > 1
        );

        if (needsUpdate) {
          const result = Game.cpu.setShardLimits(newLimits);
          if (result === OK) {
            logger.info(`Updated shard CPU limits: ${JSON.stringify(newLimits)}`, {
              subsystem: "Shard"
            });
          }
        }
      }
    } catch (err) {
      // setShardLimits may not be available in private servers
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.debug(`Could not set shard limits: ${errorMessage}`, { subsystem: "Shard" });
    }
  }

  /**
   * Sync InterShardMemory with other shards
   * Enhanced with validation and recovery mechanisms
   */
  private syncInterShardMemory(): void {
    try {
      this.interShardMemory.lastSync = Game.time;

      // Validate before serialization
      const validationResult = this.validateInterShardMemory();
      if (!validationResult.valid) {
        logger.warn(
          `InterShardMemory validation failed: ${validationResult.errors.join(", ")}`,
          { subsystem: "Shard" }
        );
        // Attempt to fix validation issues
        this.repairInterShardMemory();
      }

      const serialized = serializeInterShardMemory(this.interShardMemory);

      // Check size limit
      if (serialized.length > INTERSHARD_MEMORY_LIMIT) {
        logger.warn(
          `InterShardMemory size exceeds limit: ${serialized.length}/${INTERSHARD_MEMORY_LIMIT}`,
          { subsystem: "Shard" }
        );
        // Trim old data if needed
        this.trimInterShardMemory();
        
        // Try serializing again after trim
        const trimmedSerialized = serializeInterShardMemory(this.interShardMemory);
        if (trimmedSerialized.length > INTERSHARD_MEMORY_LIMIT) {
          logger.error(
            `InterShardMemory still too large after trim: ${trimmedSerialized.length}/${INTERSHARD_MEMORY_LIMIT}`,
            { subsystem: "Shard" }
          );
          // Last resort: remove all but current shard
          this.emergencyTrim();
          return;
        }
        
        InterShardMemory.setLocal(trimmedSerialized);
        return;
      }

      InterShardMemory.setLocal(serialized);
      
      // Periodically verify sync succeeded
      if (Game.time % 50 === 0) {
        this.verifySyncIntegrity();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error(`Failed to sync InterShardMemory: ${errorMessage}`, { subsystem: "Shard" });
      
      // Attempt recovery
      this.attemptSyncRecovery();
    }
  }

  /**
   * Validate InterShardMemory structure and data integrity
   */
  private validateInterShardMemory(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check version
    if (typeof this.interShardMemory.version !== "number") {
      errors.push("Invalid version");
    }

    // Check shards object
    if (typeof this.interShardMemory.shards !== "object") {
      errors.push("Invalid shards object");
    } else {
      // Validate each shard state
      for (const [name, shard] of Object.entries(this.interShardMemory.shards)) {
        if (!shard.health || typeof shard.health.lastUpdate !== "number") {
          errors.push(`Shard ${name} has invalid health data`);
        }
        if (!Array.isArray(shard.portals)) {
          errors.push(`Shard ${name} has invalid portals array`);
        }
        if (!Array.isArray(shard.activeTasks)) {
          errors.push(`Shard ${name} has invalid activeTasks array`);
        }
      }
    }

    // Check tasks array
    if (!Array.isArray(this.interShardMemory.tasks)) {
      errors.push("Invalid tasks array");
    }

    // Check lastSync
    if (typeof this.interShardMemory.lastSync !== "number") {
      errors.push("Invalid lastSync");
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Repair corrupted InterShardMemory data
   */
  private repairInterShardMemory(): void {
    // Ensure version is valid
    if (typeof this.interShardMemory.version !== "number") {
      this.interShardMemory.version = 1;
    }

    // Ensure shards object exists
    if (typeof this.interShardMemory.shards !== "object") {
      this.interShardMemory.shards = {};
    }

    // Repair each shard state
    for (const [name, shard] of Object.entries(this.interShardMemory.shards)) {
      if (!shard.health || typeof shard.health.lastUpdate !== "number") {
        this.interShardMemory.shards[name] = createDefaultShardState(name);
      }
      if (!Array.isArray(shard.portals)) {
        shard.portals = [];
      }
      if (!Array.isArray(shard.activeTasks)) {
        shard.activeTasks = [];
      }
    }

    // Ensure tasks array exists
    if (!Array.isArray(this.interShardMemory.tasks)) {
      this.interShardMemory.tasks = [];
    }

    // Ensure globalTargets exists
    if (!this.interShardMemory.globalTargets) {
      this.interShardMemory.globalTargets = { targetPowerLevel: 0 };
    }

    // Ensure lastSync is valid
    if (typeof this.interShardMemory.lastSync !== "number") {
      this.interShardMemory.lastSync = Game.time;
    }

    logger.info("Repaired InterShardMemory structure", { subsystem: "Shard" });
  }

  /**
   * Verify sync integrity by checking if data was written correctly
   */
  private verifySyncIntegrity(): void {
    try {
      const rawData = InterShardMemory.getLocal();
      if (!rawData) {
        logger.warn("InterShardMemory verification failed: no data present", {
          subsystem: "Shard"
        });
        return;
      }

      const parsed = deserializeInterShardMemory(rawData);
      if (!parsed) {
        logger.warn("InterShardMemory verification failed: deserialization failed", {
          subsystem: "Shard"
        });
        return;
      }

      // Check if current shard is present
      const currentShard = Game.shard?.name ?? "shard0";
      if (!parsed.shards[currentShard]) {
        logger.warn(
          `InterShardMemory verification failed: current shard ${currentShard} not found`,
          { subsystem: "Shard" }
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.warn(`InterShardMemory verification failed: ${errorMessage}`, {
        subsystem: "Shard"
      });
    }
  }

  /**
   * Attempt to recover from sync failure
   */
  private attemptSyncRecovery(): void {
    try {
      logger.info("Attempting InterShardMemory recovery", { subsystem: "Shard" });

      // Try to load from InterShardMemory first
      const rawData = InterShardMemory.getLocal();
      if (rawData) {
        const parsed = deserializeInterShardMemory(rawData);
        if (parsed) {
          // Successfully recovered from InterShardMemory
          this.interShardMemory = parsed;
          logger.info("Recovered InterShardMemory from storage", { subsystem: "Shard" });
          return;
        }
      }

      // If that fails, recreate with current shard only
      const currentShard = Game.shard?.name ?? "shard0";
      this.interShardMemory = createDefaultInterShardMemory();
      this.interShardMemory.shards[currentShard] = createDefaultShardState(currentShard);

      logger.info("Recreated InterShardMemory with current shard only", {
        subsystem: "Shard"
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error(`InterShardMemory recovery failed: ${errorMessage}`, {
        subsystem: "Shard"
      });
    }
  }

  /**
   * Emergency trim: keep only current shard data
   */
  private emergencyTrim(): void {
    const currentShard = Game.shard?.name ?? "shard0";
    const currentShardState = this.interShardMemory.shards[currentShard];

    if (currentShardState) {
      // Keep only current shard
      this.interShardMemory.shards = { [currentShard]: currentShardState };

      // Clear all tasks except those involving current shard
      this.interShardMemory.tasks = this.interShardMemory.tasks.filter(
        t => t.sourceShard === currentShard || t.targetShard === currentShard
      );

      // Keep only most recent portals
      currentShardState.portals = currentShardState.portals
        .sort((a, b) => b.lastScouted - a.lastScouted)
        .slice(0, 10);

      logger.warn("Emergency trim applied to InterShardMemory", { subsystem: "Shard" });
    }
  }

  /**
   * Trim old data from InterShardMemory to stay under size limit
   */
  private trimInterShardMemory(): void {
    // Remove completed/failed tasks older than 1000 ticks
    this.interShardMemory.tasks = this.interShardMemory.tasks.filter(
      t => t.status === "pending" || t.status === "active" || Game.time - t.createdAt < 1000
    );

    // Remove old portal entries that haven't been scouted recently
    for (const shardName in this.interShardMemory.shards) {
      const shard = this.interShardMemory.shards[shardName];
      if (shard) {
        shard.portals = shard.portals.filter(p => Game.time - p.lastScouted < 10000);
      }
    }
  }

  /**
   * Log shard status
   */
  private logShardStatus(): void {
    const currentShard = Game.shard?.name ?? "shard0";
    const shardState = this.interShardMemory.shards[currentShard];
    if (!shardState) return;

    const health = shardState.health;
    logger.info(
      `Shard ${currentShard} (${shardState.role}): ` +
        `${health.roomCount} rooms, RCL ${health.avgRCL}, ` +
        `CPU: ${health.cpuCategory}, Eco: ${health.economyIndex}%, War: ${health.warIndex}%`,
      { subsystem: "Shard" }
    );
  }

  /**
   * Create a new inter-shard task
   */
  public createTask(
    type: InterShardTask["type"],
    targetShard: string,
    targetRoom?: string,
    priority = 50
  ): void {
    const currentShard = Game.shard?.name ?? "shard0";

    const task: InterShardTask = {
      id: `${Game.time}-${Math.random().toString(36).substring(2, 11)}`,
      type,
      sourceShard: currentShard,
      targetShard,
      priority,
      status: "pending",
      createdAt: Game.time
    };

    if (targetRoom) {
      task.targetRoom = targetRoom;
    }

    this.interShardMemory.tasks.push(task);
    logger.info(`Created inter-shard task: ${type} to ${targetShard}`, { subsystem: "Shard" });
  }

  /**
   * Get current shard state
   */
  public getCurrentShardState(): ShardState | undefined {
    const currentShard = Game.shard?.name ?? "shard0";
    return this.interShardMemory.shards[currentShard];
  }

  /**
   * Get all known shards
   */
  public getAllShards(): ShardState[] {
    return Object.values(this.interShardMemory.shards);
  }

  /**
   * Get portals to a specific shard
   */
  public getPortalsToShard(targetShard: string): PortalInfo[] {
    const currentShard = Game.shard?.name ?? "shard0";
    const shardState = this.interShardMemory.shards[currentShard];
    if (!shardState) return [];

    return shardState.portals.filter(p => p.targetShard === targetShard);
  }

  /**
   * Set shard role manually
   */
  public setShardRole(role: ShardRole): void {
    const currentShard = Game.shard?.name ?? "shard0";
    const shardState = this.interShardMemory.shards[currentShard];
    if (shardState) {
      shardState.role = role;
      logger.info(`Set shard role to: ${role}`, { subsystem: "Shard" });
    }
  }

  /**
   * Create a cross-shard resource transfer task
   */
  public createResourceTransferTask(
    targetShard: string,
    targetRoom: string,
    resourceType: ResourceConstant,
    amount: number,
    priority = 50
  ): void {
    const currentShard = Game.shard?.name ?? "shard0";

    const task: InterShardTask = {
      id: `${Game.time}-transfer-${Math.random().toString(36).substring(2, 11)}`,
      type: "transfer",
      sourceShard: currentShard,
      targetShard,
      targetRoom,
      resourceType,
      resourceAmount: amount,
      priority,
      status: "pending",
      createdAt: Game.time,
      progress: 0
    };

    this.interShardMemory.tasks.push(task);
    logger.info(
      `Created resource transfer task: ${amount} ${resourceType} to ${targetShard}/${targetRoom}`,
      { subsystem: "Shard" }
    );
  }

  /**
   * Get optimal portal route to target shard
   * Returns the best portal based on stability, distance, and threat rating
   */
  public getOptimalPortalRoute(targetShard: string, fromRoom?: string): PortalInfo | null {
    const currentShard = Game.shard?.name ?? "shard0";
    const shardState = this.interShardMemory.shards[currentShard];
    if (!shardState) return null;

    const portalsToTarget = shardState.portals.filter(p => p.targetShard === targetShard);
    if (portalsToTarget.length === 0) return null;

    // Score portals based on multiple factors
    const scoredPortals = portalsToTarget.map(portal => {
      let score = 100;

      // Stability is most important
      if (portal.isStable) {
        score += 50;
      }

      // Low threat is good
      score -= portal.threatRating * 15;

      // Higher traversal count indicates reliability
      score += Math.min((portal.traversalCount ?? 0) * 2, 20);

      // Distance factor if source room is specified
      if (fromRoom) {
        const distance = Game.map.getRoomLinearDistance(fromRoom, portal.sourceRoom);
        score -= distance * 2;
      }

      // Recent scouting is better
      const ticksSinceScout = Game.time - portal.lastScouted;
      if (ticksSinceScout < 1000) {
        score += 10;
      } else if (ticksSinceScout > 5000) {
        score -= 10;
      }

      return { portal, score };
    });

    // Sort by score descending and return best
    scoredPortals.sort((a, b) => b.score - a.score);
    return scoredPortals[0]?.portal ?? null;
  }

  /**
   * Track portal traversal for reliability metrics
   */
  public recordPortalTraversal(sourceRoom: string, targetShard: string, success: boolean): void {
    const currentShard = Game.shard?.name ?? "shard0";
    const shardState = this.interShardMemory.shards[currentShard];
    if (!shardState) return;

    const portal = shardState.portals.find(
      p => p.sourceRoom === sourceRoom && p.targetShard === targetShard
    );

    if (portal) {
      if (success) {
        portal.traversalCount = (portal.traversalCount ?? 0) + 1;
        // Successful traversals reduce threat rating slightly
        portal.threatRating = Math.max(0, portal.threatRating - 0.1);
      } else {
        // Failed traversals increase threat rating
        portal.threatRating = Math.min(3, portal.threatRating + 0.5);
      }
    }
  }

  /**
   * Update task progress
   */
  public updateTaskProgress(taskId: string, progress: number, status?: InterShardTask["status"]): void {
    const task = this.interShardMemory.tasks.find(t => t.id === taskId);
    if (task) {
      task.progress = Math.min(100, Math.max(0, progress));
      task.updatedAt = Game.time;
      if (status) {
        task.status = status;
      }
    }
  }

  /**
   * Get active resource transfer tasks for this shard
   */
  public getActiveTransferTasks(): InterShardTask[] {
    const currentShard = Game.shard?.name ?? "shard0";
    return this.interShardMemory.tasks.filter(
      t => t.type === "transfer" && 
           (t.sourceShard === currentShard || t.targetShard === currentShard) &&
           (t.status === "pending" || t.status === "active")
    );
  }

  /**
   * Cancel a task
   */
  public cancelTask(taskId: string): void {
    const task = this.interShardMemory.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = "failed";
      task.updatedAt = Game.time;
      logger.info(`Cancelled task ${taskId}`, { subsystem: "Shard" });
    }
  }

  /**
   * Get sync status and health metrics
   */
  public getSyncStatus(): {
    lastSync: number;
    ticksSinceSync: number;
    memorySize: number;
    sizePercent: number;
    shardsTracked: number;
    activeTasks: number;
    totalPortals: number;
    isHealthy: boolean;
  } {
    const serialized = serializeInterShardMemory(this.interShardMemory);
    const memorySize = serialized.length;
    const sizePercent = (memorySize / INTERSHARD_MEMORY_LIMIT) * 100;
    const ticksSinceSync = Game.time - this.interShardMemory.lastSync;

    // Calculate health
    const isHealthy = 
      memorySize < INTERSHARD_MEMORY_LIMIT * 0.9 && // Less than 90% full
      ticksSinceSync < 500; // Synced within last 500 ticks

    // Count portals across all shards
    let totalPortals = 0;
    for (const shard of Object.values(this.interShardMemory.shards)) {
      totalPortals += shard.portals.length;
    }

    return {
      lastSync: this.interShardMemory.lastSync,
      ticksSinceSync,
      memorySize,
      sizePercent: Math.round(sizePercent * 100) / 100,
      shardsTracked: Object.keys(this.interShardMemory.shards).length,
      activeTasks: this.interShardMemory.tasks.filter(t => 
        t.status === "pending" || t.status === "active"
      ).length,
      totalPortals,
      isHealthy
    };
  }

  /**
   * Force a full sync with validation
   */
  public forceSync(): void {
    logger.info("Forcing InterShardMemory sync with validation", { subsystem: "Shard" });
    this.syncInterShardMemory();
  }

  /**
   * Get InterShardMemory size and usage statistics
   */
  public getMemoryStats(): {
    size: number;
    limit: number;
    percent: number;
    breakdown: {
      shards: number;
      tasks: number;
      portals: number;
      other: number;
    };
  } {
    const fullSerialized = serializeInterShardMemory(this.interShardMemory);
    const size = fullSerialized.length;

    // Estimate breakdown by serializing individual parts
    const shardsOnly = serializeInterShardMemory({
      ...this.interShardMemory,
      tasks: [],
      globalTargets: { targetPowerLevel: 0 }
    }).length;

    const tasksOnly = JSON.stringify(this.interShardMemory.tasks).length;

    let portalsCount = 0;
    for (const shard of Object.values(this.interShardMemory.shards)) {
      portalsCount += JSON.stringify(shard.portals).length;
    }

    return {
      size,
      limit: INTERSHARD_MEMORY_LIMIT,
      percent: Math.round((size / INTERSHARD_MEMORY_LIMIT) * 10000) / 100,
      breakdown: {
        shards: shardsOnly,
        tasks: tasksOnly,
        portals: portalsCount,
        other: size - shardsOnly - tasksOnly
      }
    };
  }
}

/**
 * Global shard manager instance
 */
export const shardManager = new ShardManager();
