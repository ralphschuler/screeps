/**
 * Empire Manager - Global Meta-Layer
 *
 * Coordinates empire-wide strategic decisions:
 * - War target management
 * - Expansion decisions
 * - Power bank tracking
 * - Nuke candidate evaluation
 * - Global resource allocation
 * - Inter-shard coordination
 *
 * Runs every 20-50 ticks depending on CPU availability.
 *
 * Addresses Issues: #6, #20, #36
 *
 * TODO(P2): ARCH - Implement multi-shard coordination via InterShardMemory (ROADMAP Section 3)
 * Track shard roles, resources, and portal networks across shards
 * TODO(P2): FEATURE - Add expansion candidate scoring with multiple factors
 * Consider source count, mineral type, distance, hostile neighbors, portals
 * TODO(P2): ARCH - Implement war target prioritization based on strategic value
 * High-value targets: blocking expansion, valuable resources, weak defenses
 * TODO(P3): FEATURE - Add GCL progress notifications for planning expansion timing
 * Alert when GCL is about to level up so expansion can be prepared
 * TODO(P3): FEATURE - Consider implementing empire statistics dashboard
 * Track total rooms, energy income, military strength, market activity
 * TODO(P3): ARCH - Add automatic shard migration for load balancing
 * When one shard is overloaded, migrate operations to less crowded shards
 * TODO(P3): ARCH - Implement portal network graph for inter-shard travel optimization
 * Pre-compute best portal routes for expansion and resource sharing
 *
 * Test Coverage: Tests exist in empireManager.test.ts covering:
 * - Empire initialization and room tracking
 * - Expansion candidate selection and scoring
 * - War target prioritization
 * - GCL-based empire decisions
 * TODO(P2): TEST - Expand integration tests for complex multi-room scenarios
 */

import { logger } from "@ralphschuler/screeps-core";
import { isAllyPlayer } from "@ralphschuler/screeps-defense";
import { memoryManager } from "@ralphschuler/screeps-memory";
import type { EmpireMemory, ExpansionCandidate, RoomIntel } from "@ralphschuler/screeps-memory";
import { unifiedStats } from "@ralphschuler/screeps-stats";
import { ProcessPriority } from "../core/kernel";
import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { clusterMonitor } from "./clusterMonitor";
import { planExpansionClaimQueue } from "./expansionOpportunityModule";
import { roomIntelManager } from "./roomIntelManager";
import { warCoordinator } from "./warCoordinator";

/**
 * Empire Manager Configuration
 */
export interface EmpireConfig {
  /** Update interval in ticks */
  updateInterval: number;
  /** Minimum bucket to run empire logic */
  minBucket: number;
  /** Maximum CPU budget per tick (fraction of limit) */
  maxCpuBudget: number;
  /** Minimum GCL before expansion */
  minGclForExpansion: number;
  /** Maximum distance for expansion candidates */
  maxExpansionDistance: number;
  /** Minimum room score for expansion */
  minExpansionScore: number;
  /** Interval to refresh room intel (ticks) */
  intelRefreshInterval: number;
  /** Minimum RCL for rooms to be considered stable */
  minStableRcl: number;
  /** GCL progress notification threshold (%) */
  gclNotifyThreshold: number;
  /** Interval to discover nearby rooms (ticks) */
  roomDiscoveryInterval: number;
  /** Maximum distance for room discovery */
  maxRoomDiscoveryDistance: number;
  /** Maximum number of rooms to discover per tick */
  maxRoomsToDiscoverPerTick: number;
}

const DEFAULT_CONFIG: EmpireConfig = {
  updateInterval: 30,
  minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
  maxCpuBudget: 0.05, // 5% of CPU limit
  minGclForExpansion: 2,
  maxExpansionDistance: 10,
  minExpansionScore: 50,
  intelRefreshInterval: 100,
  minStableRcl: 4,
  gclNotifyThreshold: 90, // Notify when GCL progress is at 90%
  roomDiscoveryInterval: 100, // Discover rooms every 100 ticks
  maxRoomDiscoveryDistance: 5, // Discover rooms up to 5 linear distance
  maxRoomsToDiscoverPerTick: 50 // Limit memory spike from discovering too many rooms at once
};

/**
 * Bucket-aware execution modes for empire planning workloads.
 *
 * Based on docs/COMPETITIVE_STRATEGY_AND_AGENT_PROMPT:
 * - >8000: full planning mode
 * - 4000-8000: normal, incremental mode
 * - 1500-4000: degraded mode
 * - <1500: panic mode
 */
type BucketMode = "panic" | "degraded" | "normal" | "full";

const BUCKET_MODE_BREAKPOINTS = {
  full: 8000,
  normal: 6000,
  degraded: 1500
} as const;

/**
 * Empire Manager Class
 */
@ProcessClass()
export class EmpireManager {
  private config: EmpireConfig;

  public constructor(config: Partial<EmpireConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main empire tick - runs periodically
   * Registered as kernel process via decorator
   */
  @LowFrequencyProcess("empire:manager", "Empire Manager", {
    priority: ProcessPriority.MEDIUM,
    interval: 30,
    minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
    cpuBudget: 0.05
  })
  public run(): void {
    const cpuStart = Game.cpu.getUsed();
    const empire = memoryManager.getEmpire();
    const cpuBucket = Game.cpu.bucket ?? 0;

    if (cpuBucket < this.config.minBucket) {
      if (Game.time % 100 === 0) {
        logger.warn(`Empire manager skipped - bucket ${cpuBucket.toFixed(0)} below minimum ${this.config.minBucket}`, {
          subsystem: "Empire"
        });
      }
      return;
    }

    const bucketMode = this.getBucketMode(cpuBucket);
    const runDegradedWork = this.shouldRunDegradedModeWork(bucketMode);
    const runNormalWork = this.shouldRunNormalModeWork(bucketMode);
    const runFullWork = this.shouldRunFullModeWork(bucketMode);

    empire.lastUpdate = Game.time;

    // Expansion and power-bank discovery are optional while the bucket is recovering.
    if (runNormalWork) {
      unifiedStats.measureSubsystem("empire:expansion", () => {
        this.updateExpansionQueue(empire);
      });

      unifiedStats.measureSubsystem("empire:powerBanks", () => {
        this.updatePowerBanks(empire);
      });
    }

    // Critical strategic safety still runs.
    unifiedStats.measureSubsystem("empire:warTargets", () => {
      warCoordinator.updateWarTargets(empire);
    });

    unifiedStats.measureSubsystem("empire:objectives", () => {
      this.updateObjectives(empire);
    });

    // NEW: Automated GCL progress tracking
    unifiedStats.measureSubsystem("empire:gclTracking", () => {
      this.trackGCLProgress(empire);
    });

    // NEW: Automated expansion readiness check
    if (runNormalWork) {
      unifiedStats.measureSubsystem("empire:expansionReadiness", () => {
        this.checkExpansionReadiness(empire);
      });
    }

    // New: Adaptive intelligence workloads based on bucket reserve
    if (runDegradedWork) {
      unifiedStats.measureSubsystem("empire:intelRefresh", () => {
        roomIntelManager.refreshRoomIntel(empire);
      });

      unifiedStats.measureSubsystem("empire:roomDiscovery", () => {
        roomIntelManager.discoverNearbyRooms(empire);
      });
    }

    if (runNormalWork) {
      unifiedStats.measureSubsystem("empire:nukeCandidates", () => {
        this.refreshNukeCandidates(empire);
      });
    }

    if (runFullWork) {
      // NEW: Automated cluster health monitoring
      unifiedStats.measureSubsystem("empire:clusterHealth", () => {
        clusterMonitor.monitorClusterHealth();
      });

      // NEW: Automated power bank profitability assessment
      unifiedStats.measureSubsystem("empire:powerBankProfitability", () => {
        this.assessPowerBankProfitability(empire);
      });
    }

    // Log CPU usage
    const cpuUsed = Game.cpu.getUsed() - cpuStart;
    const cpuBudget = Game.cpu.limit * this.config.maxCpuBudget;
    if (cpuUsed > cpuBudget) {
      logger.warn(
        `Empire tick used ${cpuUsed.toFixed(2)} CPU > budget ${cpuBudget.toFixed(2)} (${bucketMode}/${cpuBucket.toFixed(0)})`,
        { subsystem: "Empire" }
      );
    }

    if (Game.time % 100 === 0) {
      logger.info(`Empire tick completed in ${cpuUsed.toFixed(2)} CPU`, { subsystem: "Empire" });
    }
  }

  /**
   * Remove owned rooms from claim queue
   */
  private cleanupClaimQueue(empire: EmpireMemory, ownedRoomNames: Set<string>): void {
    const initialQueueLength = empire.claimQueue.length;
    empire.claimQueue = empire.claimQueue.filter(candidate => {
      const isNowOwned = ownedRoomNames.has(candidate.roomName);
      if (isNowOwned) {
        logger.info(`Removing ${candidate.roomName} from claim queue - now owned`, { subsystem: "Empire" });
        return false;
      }
      return true;
    });

    if (empire.claimQueue.length < initialQueueLength) {
      logger.info(`Cleaned up claim queue: removed ${initialQueueLength - empire.claimQueue.length} owned room(s)`, {
        subsystem: "Empire"
      });
    }
  }

  /**
   * Update expansion queue with scored candidates
   */
  private updateExpansionQueue(empire: EmpireMemory): void {
    // Check if we can expand
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    const ownedRoomNames = new Set(ownedRooms.map(r => r.name));
    const gclLevel = Game.gcl.level;

    // Update room intel for newly owned rooms to ensure intel.owner is current
    // This ensures the expansion queue filtering works correctly
    const spawns = Object.values(Game.spawns);
    if (spawns.length > 0 && spawns[0].owner) {
      const myUsername = spawns[0].owner.username;
      for (const room of ownedRooms) {
        const intel = empire.knownRooms[room.name];
        if (intel && intel.owner !== myUsername) {
          intel.owner = myUsername;
          logger.info(`Updated room intel for ${room.name} - now owned by ${myUsername}`, { subsystem: "Empire" });
        }
      }
    }

    // Always cleanup the claim queue to remove owned rooms
    this.cleanupClaimQueue(empire, ownedRoomNames);

    if (ownedRooms.length >= gclLevel) {
      // At GCL limit, don't evaluate expansion
      return;
    }

    if (gclLevel < this.config.minGclForExpansion) {
      // Too early to expand
      return;
    }

    if (empire.objectives.expansionPaused) {
      // Expansion manually paused
      return;
    }

    const plan = planExpansionClaimQueue(empire, ownedRooms, {
      maxExpansionDistance: this.config.maxExpansionDistance,
      minExpansionScore: this.config.minExpansionScore,
      maxCandidates: 10
    });

    empire.claimQueue = plan.claimQueue;

    if (plan.claimQueue.length > 0 && Game.time % 100 === 0) {
      logger.info(
        `Expansion queue updated: ${plan.claimQueue.length} candidates, top score: ${plan.claimQueue[0].score}`,
        {
          subsystem: "Empire"
        }
      );
    }
  }

  /**
   * Convert current CPU bucket into execution mode.
   */
  private getBucketMode(bucket: number): BucketMode {
    if (bucket >= BUCKET_MODE_BREAKPOINTS.full) {
      return "full";
    }
    if (bucket >= BUCKET_MODE_BREAKPOINTS.normal) {
      return "normal";
    }
    if (bucket >= BUCKET_MODE_BREAKPOINTS.degraded) {
      return "degraded";
    }
    return "panic";
  }

  private shouldRunDegradedModeWork(mode: BucketMode): boolean {
    return mode === "normal" || mode === "full";
  }

  private shouldRunNormalModeWork(mode: BucketMode): boolean {
    return mode === "normal" || mode === "full";
  }

  private shouldRunFullModeWork(mode: BucketMode): boolean {
    return mode === "full";
  }

  /**
   * Update power bank tracking
   */
  private updatePowerBanks(empire: EmpireMemory): void {
    // Remove expired power banks
    empire.powerBanks = empire.powerBanks.filter(pb => pb.decayTick > Game.time);

    // Check visible rooms for power banks
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      const foundPowerBanks = room.find(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_POWER_BANK
      });
      const powerBanks = foundPowerBanks as StructurePowerBank[];

      for (const pb of powerBanks) {
        // Check if already tracked
        const existing = empire.powerBanks.find(
          entry => entry.roomName === roomName && entry.pos.x === pb.pos.x && entry.pos.y === pb.pos.y
        );

        if (!existing) {
          // Add new power bank
          empire.powerBanks.push({
            roomName,
            pos: { x: pb.pos.x, y: pb.pos.y },
            power: pb.power,
            decayTick: Game.time + (pb.ticksToDecay ?? 5000),
            active: false
          });

          logger.info(`Power bank discovered in ${roomName}: ${pb.power} power`, { subsystem: "Empire" });
        }
      }
    }
  }

  /**
   * Update war targets
   */

  /**
   * Update global objectives and sync empire.ownedRooms
   */
  private updateObjectives(empire: EmpireMemory): void {
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);

    // Sync empire.ownedRooms — always current, while preserving operator/cluster assignments.
    const previousOwnedRooms = empire.ownedRooms;
    empire.ownedRooms = {};
    for (const room of ownedRooms) {
      const previous = previousOwnedRooms[room.name];
      const ownedRoom = {
        name: room.name,
        rcl: room.controller?.level ?? 0,
        role: previous?.role ?? "core",
        clusterId: previous?.clusterId ?? `${room.name}-cluster`
      };
      empire.ownedRooms[room.name] = {
        ...ownedRoom
      };
      (empire.ownedRooms[room.name] as { energyAvailable?: number; energyCapacityAvailable?: number }).energyAvailable = room.energyAvailable;
      (empire.ownedRooms[room.name] as { energyCapacityAvailable?: number }).energyCapacityAvailable = room.energyCapacityAvailable;
    }

    // Remove stale allied ownership/reservation entries from memory (room not currently ours)
    const ownedRoomNames = new Set(ownedRooms.map(room => room.name));

    const recoveryRooms = empire.recoveryRooms ?? {};
    empire.recoveryRooms = recoveryRooms;
    for (const [roomName, previous] of Object.entries(previousOwnedRooms)) {
      if (ownedRoomNames.has(roomName)) {
        delete recoveryRooms[roomName];
        continue;
      }
      if (!recoveryRooms[roomName]) {
        recoveryRooms[roomName] = {
          roomName,
          lostAt: Game.time,
          rcl: previous.rcl,
          role: previous.role,
          clusterId: previous.clusterId
        };
      }
    }

    for (const roomName of ownedRoomNames) {
      delete recoveryRooms[roomName];
    }

    for (const roomName in recoveryRooms) {
      if (Game.time - recoveryRooms[roomName].lostAt > 200000) {
        delete recoveryRooms[roomName];
      }
    }

    for (const roomName in empire.knownRooms) {
      const intel = empire.knownRooms[roomName];
      if (!intel) continue;

      if (intel.owner && isAllyPlayer(intel.owner) && !ownedRoomNames.has(roomName)) {
        delete intel.owner;
      }

      if (intel.reserver && isAllyPlayer(intel.reserver) && !ownedRoomNames.has(roomName)) {
        delete intel.reserver;
      }
    }

    // Update target room count (GCL level)
    empire.objectives.targetRoomCount = Game.gcl.level;

    // Update target power level (based on owned rooms)
    empire.objectives.targetPowerLevel = Math.min(25, ownedRooms.length * 3);

    // Auto-enable war mode if we have war targets
    if (empire.warTargets.length > 0 && !empire.objectives.warMode) {
      empire.objectives.warMode = true;
      logger.warn("War mode enabled due to active war targets", { subsystem: "Empire" });
    }

    // Auto-disable war mode if no war targets for 1000 ticks
    if (empire.warTargets.length === 0 && empire.objectives.warMode) {
      empire.objectives.warMode = false;
      logger.info("War mode disabled - no active war targets", { subsystem: "Empire" });
    }
  }

  /**
   * Get next expansion target
   */
  public getNextExpansionTarget(): ExpansionCandidate | null {
    const empire = memoryManager.getEmpire();
    const unclaimed = empire.claimQueue.filter(c => !c.claimed);
    return unclaimed.length > 0 ? unclaimed[0] : null;
  }

  /**
   * Mark expansion target as claimed
   */
  public markExpansionClaimed(roomName: string): void {
    const empire = memoryManager.getEmpire();
    const candidate = empire.claimQueue.find(c => c.roomName === roomName);
    if (candidate) {
      candidate.claimed = true;
      logger.info(`Marked expansion target as claimed: ${roomName}`, { subsystem: "Empire" });
    }
  }

  private trackGCLProgress(empire: EmpireMemory): void {
    const gclProgress = (Game.gcl.progress / Game.gcl.progressTotal) * 100;

    // Notify when approaching next GCL level
    if (gclProgress >= this.config.gclNotifyThreshold && Game.time % 500 === 0) {
      logger.info(
        `GCL ${Game.gcl.level} progress: ${gclProgress.toFixed(1)}% (${Game.gcl.progress}/${Game.gcl.progressTotal})`,
        { subsystem: "Empire" }
      );
    }

    // Update target room count objective
    empire.objectives.targetRoomCount = Game.gcl.level;
  }

  private checkExpansionReadiness(empire: EmpireMemory): void {
    const allRooms = Object.values(Game.rooms).filter(r => r.controller?.my);

    // Don't expand if at GCL limit
    if (allRooms.length >= Game.gcl.level) {
      return;
    }

    // Count stable rooms (RCL >= minStableRcl OR RCL >= 5 with storage)
    // Single-room RCL 5 bases are inherently stable enough to expand
    const stableRooms = allRooms.filter(r => {
      const rcl = r.controller?.level ?? 0;
      if (rcl >= 5) return true; // RCL 5+ is always stable
      const hasStorage = r.storage !== undefined;
      return rcl >= this.config.minStableRcl && hasStorage;
    });

    // Need at least one stable room to expand
    if (stableRooms.length === 0) {
      if (!empire.objectives.expansionPaused) {
        empire.objectives.expansionPaused = true;
        logger.info("Expansion paused: waiting for stable room (RCL >= 4 with storage)", { subsystem: "Empire" });
      }
      return;
    }

    // Check if we have enough energy reserves in stable rooms
    const totalEnergy = stableRooms.reduce((sum, r) => sum + (r.storage?.store[RESOURCE_ENERGY] ?? 0), 0);
    const avgEnergy = totalEnergy / stableRooms.length;
    const minEnergyForExpansion = 50000; // Need 50k average to expand

    if (avgEnergy < minEnergyForExpansion) {
      if (!empire.objectives.expansionPaused) {
        empire.objectives.expansionPaused = true;
        logger.info(
          `Expansion paused: insufficient energy reserves (${avgEnergy.toFixed(0)} < ${minEnergyForExpansion})`,
          {
            subsystem: "Empire"
          }
        );
      }
      return;
    }

    // All conditions met - ready to expand
    if (empire.objectives.expansionPaused) {
      empire.objectives.expansionPaused = false;
      logger.info(`Expansion resumed: ${stableRooms.length} stable rooms with ${avgEnergy.toFixed(0)} avg energy`, {
        subsystem: "Empire"
      });
    }
  }

  /**
   * Refresh nuke candidates based on current war targets
   */
  private refreshNukeCandidates(empire: EmpireMemory): void {
    // Only refresh every 500 ticks
    if (Game.time % 500 !== 0) {
      return;
    }

    // Clear old launched nukes
    empire.nukeCandidates = empire.nukeCandidates.filter(nc => {
      if (nc.launched && Game.time - nc.launchTick > 50000) {
        return false; // Nuke has impacted
      }
      return true;
    });

    // Only evaluate nuke candidates if in war mode
    if (!empire.objectives.warMode || empire.warTargets.length === 0) {
      return;
    }

    // Score war targets for nuke worthiness
    for (const roomName of empire.warTargets) {
      const intel = empire.knownRooms[roomName];
      if (!intel || !intel.scouted) {
        continue;
      }

      // Check if already a nuke candidate
      const existing = empire.nukeCandidates.find(nc => nc.roomName === roomName);
      if (existing && !existing.launched) {
        continue; // Already a candidate
      }

      // Calculate nuke score
      const score = this.scoreNukeCandidate(intel);

      if (score >= 50) {
        empire.nukeCandidates.push({
          roomName,
          score,
          launched: false,
          launchTick: 0
        });

        logger.info(`Added nuke candidate: ${roomName} (score: ${score})`, { subsystem: "Empire" });
      }
    }

    // Sort by score
    empire.nukeCandidates.sort((a, b) => b.score - a.score);

    // Keep only top 10
    empire.nukeCandidates = empire.nukeCandidates.slice(0, 10);
  }

  /**
   * Score a room as a nuke candidate
   */
  private scoreNukeCandidate(intel: RoomIntel): number {
    let score = 0;

    // High RCL rooms are more valuable targets
    score += intel.controllerLevel * 10;

    // Towers make nuking more valuable (disrupts defense)
    score += (intel.towerCount ?? 0) * 15;

    // Spawns are critical infrastructure
    score += (intel.spawnCount ?? 0) * 20;

    // SK rooms and highway rooms are not good nuke targets
    if (intel.isSK || intel.isHighway) {
      return 0;
    }

    return score;
  }

  /**
   * Monitor cluster health and detect issues
   * Automatically triggers rebalancing when clusters are unhealthy
   */

  /**
   * Assess power bank profitability based on distance, power amount, and decay time
   * Automatically marks unprofitable power banks as inactive
   */
  private assessPowerBankProfitability(empire: EmpireMemory): void {
    // Only assess every 100 ticks
    if (Game.time % 100 !== 0) {
      return;
    }

    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    if (ownedRooms.length === 0) {
      return;
    }

    for (const pb of empire.powerBanks) {
      if (pb.active) {
        continue; // Already harvesting
      }

      // Find closest owned room
      let minDistance = Infinity;
      let closestRoom: Room | null = null;

      for (const room of ownedRooms) {
        const distance = Game.map.getRoomLinearDistance(room.name, pb.roomName);
        if (distance < minDistance) {
          minDistance = distance;
          closestRoom = room;
        }
      }

      if (!closestRoom) {
        continue;
      }

      // Calculate profitability score
      const timeRemaining = pb.decayTick - Game.time;
      const ticksPerRoom = 50; // Approximate travel time per room
      const travelTime = minDistance * ticksPerRoom;
      const harvestTime = pb.power / 2; // Approximate time to harvest (2 power per tick with good squad)
      const totalTime = travelTime * 2 + harvestTime; // Round trip + harvest

      // Power bank is profitable if we have enough time and it's reasonably close
      const isProfitable =
        timeRemaining > totalTime * 1.5 && // Need 50% time buffer
        minDistance <= 5 && // Max 5 rooms away
        pb.power >= 1000 && // Minimum 1000 power
        (closestRoom.controller?.level ?? 0) >= 7; // Need RCL 7+ for power squads

      // Log profitability assessment
      if (!isProfitable && Game.time % 500 === 0) {
        logger.debug(
          `Power bank in ${pb.roomName} not profitable: ` +
            `power=${pb.power}, distance=${minDistance}, timeRemaining=${timeRemaining}, ` +
            `requiredTime=${totalTime.toFixed(0)}`,
          { subsystem: "Empire" }
        );
      } else if (isProfitable && Game.time % 500 === 0) {
        logger.info(
          `Profitable power bank in ${pb.roomName}: ` +
            `power=${pb.power}, distance=${minDistance}, timeRemaining=${timeRemaining}`,
          { subsystem: "Empire" }
        );
      }
    }
  }
}

/**
 * Global empire manager instance
 */
export const empireManager = new EmpireManager();
