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
 * TODO(P2): TEST - Add integration tests for empire decision-making logic
 * Verify expansion and war decisions are made correctly
 */

import { ProcessPriority } from "../core/kernel";
import { logger } from "../core/logger";
import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { unifiedStats } from "../core/unifiedStats";
import { memoryManager } from "../memory/manager";
import type { ExpansionCandidate, EmpireMemory, RoomIntel } from "../memory/schemas";
import * as ExpansionScoring from "./expansionScoring";

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
  gclNotifyThreshold: 90 // Notify when GCL progress is at 90%
};

/**
 * Empire Manager Class
 */
@ProcessClass()
export class EmpireManager {
  private config: EmpireConfig;
  private lastRun = 0;

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

    // Update last run time
    this.lastRun = Game.time;
    empire.lastUpdate = Game.time;

    // Run empire subsystems
    unifiedStats.measureSubsystem("empire:expansion", () => {
      this.updateExpansionQueue(empire);
    });

    unifiedStats.measureSubsystem("empire:powerBanks", () => {
      this.updatePowerBanks(empire);
    });

    unifiedStats.measureSubsystem("empire:warTargets", () => {
      this.updateWarTargets(empire);
    });

    unifiedStats.measureSubsystem("empire:objectives", () => {
      this.updateObjectives(empire);
    });

    // NEW: Automated room intel refresh
    unifiedStats.measureSubsystem("empire:intelRefresh", () => {
      this.refreshRoomIntel(empire);
    });

    // NEW: Automated GCL progress tracking
    unifiedStats.measureSubsystem("empire:gclTracking", () => {
      this.trackGCLProgress(empire);
    });

    // NEW: Automated expansion readiness check
    unifiedStats.measureSubsystem("empire:expansionReadiness", () => {
      this.checkExpansionReadiness(empire);
    });

    // NEW: Automated nuke candidate refresh
    unifiedStats.measureSubsystem("empire:nukeCandidates", () => {
      this.refreshNukeCandidates(empire);
    });

    // NEW: Automated cluster health monitoring
    unifiedStats.measureSubsystem("empire:clusterHealth", () => {
      this.monitorClusterHealth();
    });

    // NEW: Automated power bank profitability assessment
    unifiedStats.measureSubsystem("empire:powerBankProfitability", () => {
      this.assessPowerBankProfitability(empire);
    });

    // Log CPU usage
    const cpuUsed = Game.cpu.getUsed() - cpuStart;
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

    // Score all scouted rooms
    const candidates: ExpansionCandidate[] = [];

    for (const roomName in empire.knownRooms) {
      const intel = empire.knownRooms[roomName];

      // Skip if already owned or claimed
      if (intel.owner || intel.reserver) {
        continue;
      }

      // Skip if not scouted
      if (!intel.scouted) {
        continue;
      }

      // Calculate score
      const score = this.scoreExpansionCandidate(intel, ownedRooms);

      if (score >= this.config.minExpansionScore) {
        candidates.push({
          roomName: intel.name,
          score,
          distance: this.getMinDistanceToOwned(intel.name, ownedRooms),
          claimed: false,
          lastEvaluated: Game.time
        });
      }
    }

    // Sort by score (highest first)
    candidates.sort((a, b) => b.score - a.score);

    // Update claim queue (keep top 10)
    empire.claimQueue = candidates.slice(0, 10);

    if (candidates.length > 0 && Game.time % 100 === 0) {
      logger.info(`Expansion queue updated: ${candidates.length} candidates, top score: ${candidates[0].score}`, {
        subsystem: "Empire"
      });
    }
  }

  /**
   * Score an expansion candidate (multi-factor expansion scoring)
   * Implements comprehensive scoring based on ROADMAP Section 7 & 9 requirements
   */
  private scoreExpansionCandidate(intel: RoomIntel, ownedRooms: Room[]): number {
    let score = 0;

    // 1. Source count scoring (primary economic factor)
    // 2 sources = +40 points, 1 source = +20 points
    if (intel.sources === 2) {
      score += 40;
    } else if (intel.sources === 1) {
      score += 20;
    }

    // 2. Mineral type value (rare minerals get bonus)
    score += ExpansionScoring.getMineralBonus(intel.mineralType);

    // 3. Distance penalty (linear penalty from nearest owned room)
    const distance = this.getMinDistanceToOwned(intel.name, ownedRooms);
    if (distance > this.config.maxExpansionDistance) {
      return 0; // Too far
    }
    score -= distance * 5;

    // 4. Hostile presence penalty (check adjacent rooms for hostile players)
    const hostilePenalty = ExpansionScoring.calculateHostilePenalty(intel.name);
    score -= hostilePenalty;

    // 5. Threat level penalty
    score -= intel.threatLevel * 15;

    // 6. Terrain analysis
    score += ExpansionScoring.getTerrainBonus(intel.terrain);

    // 7. Highway proximity bonus (strategic value)
    if (ExpansionScoring.isNearHighway(intel.name)) {
      score += 10;
    }

    // 8. Portal proximity bonus (strategic value for cross-shard expansion)
    const portalBonus = ExpansionScoring.getPortalProximityBonus(intel.name);
    score += portalBonus;

    // 9. Controller level bonus (faster startup if previously owned)
    if (intel.controllerLevel > 0 && !intel.owner) {
      // Previously owned but now abandoned - bonus for existing infrastructure
      score += intel.controllerLevel * 2;
    }

    // 10. Cluster proximity bonus (prefer expansion near existing clusters)
    const clusterBonus = ExpansionScoring.getClusterProximityBonus(intel.name, ownedRooms, distance);
    score += clusterBonus;

    // 11. Highway rooms are not good for expansion (cannot claim)
    if (intel.isHighway) {
      return 0;
    }

    // 12. SK rooms require special handling - heavily penalize for now
    if (intel.isSK) {
      score -= 50;
    }

    return Math.max(0, score);
  }

  /**
   * Get minimum distance from room to any owned room
   */
  private getMinDistanceToOwned(roomName: string, ownedRooms: Room[]): number {
    let minDistance = Infinity;

    for (const room of ownedRooms) {
      const distance = Game.map.getRoomLinearDistance(roomName, room.name);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }

    return minDistance;
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
  private updateWarTargets(empire: EmpireMemory): void {
    // Remove war targets that are no longer valid
    empire.warTargets = empire.warTargets.filter(target => {
      // Check if target still exists and is hostile
      const intel = empire.knownRooms[target];
      if (!intel) return false;

      // Remove if room is now owned by us
      if (intel.owner === (Object.values(Game.spawns)[0]?.owner.username ?? "")) {
        return false;
      }

      return true;
    });

    // Auto-add war targets based on threat
    if (empire.objectives.warMode) {
      for (const roomName in empire.knownRooms) {
        const intel = empire.knownRooms[roomName];

        // Add high-threat rooms as war targets
        if (intel.threatLevel >= 2 && !empire.warTargets.includes(roomName)) {
          empire.warTargets.push(roomName);
          logger.warn(`Added war target: ${roomName} (threat level ${intel.threatLevel})`, { subsystem: "Empire" });
        }
      }
    }
  }

  /**
   * Update global objectives
   */
  private updateObjectives(empire: EmpireMemory): void {
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);

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

  /**
   * Automated room intel refresh system
   * Updates intel for owned and nearby rooms periodically
   */
  private refreshRoomIntel(empire: EmpireMemory): void {
    // Only refresh every N ticks
    if (Game.time % this.config.intelRefreshInterval !== 0) {
      return;
    }

    let updatedCount = 0;

    // Update intel for all visible rooms
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!empire.knownRooms[roomName]) {
        empire.knownRooms[roomName] = this.createRoomIntel(room);
        updatedCount++;
      } else {
        this.updateRoomIntel(empire.knownRooms[roomName], room);
        updatedCount++;
      }
    }

    if (updatedCount > 0 && Game.time % 500 === 0) {
      logger.info(`Refreshed intel for ${updatedCount} rooms`, { subsystem: "Empire" });
    }
  }

  /**
   * Create room intel from a Room object
   */
  private createRoomIntel(room: Room): RoomIntel {
    const sources = room.find(FIND_SOURCES);
    const mineral = room.find(FIND_MINERALS)[0];
    const controller = room.controller;
    
    // Calculate terrain type
    let plainCount = 0;
    let swampCount = 0;
    const terrain = new Room.Terrain(room.name);
    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) {
        const tile = terrain.get(x, y);
        if (tile === TERRAIN_MASK_SWAMP) swampCount++;
        else if (tile === 0) plainCount++;
      }
    }
    const terrainType = swampCount > plainCount ? "swamp" : plainCount > swampCount ? "plains" : "mixed";

    return {
      name: room.name,
      lastSeen: Game.time,
      sources: sources.length,
      controllerLevel: controller?.level ?? 0,
      owner: controller?.owner?.username,
      reserver: controller?.reservation?.username,
      mineralType: mineral?.mineralType,
      threatLevel: 0,
      scouted: true,
      terrain: terrainType,
      isHighway: false,
      isSK: false,
      towerCount: room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER }).length,
      spawnCount: room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_SPAWN }).length
    };
  }

  /**
   * Update existing room intel from a Room object
   */
  private updateRoomIntel(intel: RoomIntel, room: Room): void {
    intel.lastSeen = Game.time;
    
    const controller = room.controller;
    if (controller) {
      intel.controllerLevel = controller.level ?? 0;
      intel.owner = controller.owner?.username;
      intel.reserver = controller.reservation?.username;
    }

    // Update threat level based on hostiles
    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    const dangerousHostiles = hostiles.filter(h => 
      h.body.some(p => p.type === ATTACK || p.type === RANGED_ATTACK || p.type === WORK)
    );
    
    if (dangerousHostiles.length >= 5) {
      intel.threatLevel = 3;
    } else if (dangerousHostiles.length >= 2) {
      intel.threatLevel = 2;
    } else if (dangerousHostiles.length > 0) {
      intel.threatLevel = 1;
    } else {
      intel.threatLevel = 0;
    }

    // Update structure counts
    intel.towerCount = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER }).length;
    intel.spawnCount = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_SPAWN }).length;
  }

  /**
   * Track GCL progress and notify when approaching next level
   */
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

  /**
   * Check if owned rooms are ready for expansion
   * Automatically unpause expansion when conditions are met
   */
  private checkExpansionReadiness(empire: EmpireMemory): void {
    const allRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    
    // Don't expand if at GCL limit
    if (allRooms.length >= Game.gcl.level) {
      return;
    }

    // Count stable rooms (RCL >= minStableRcl with storage)
    const stableRooms = allRooms.filter(r => {
      const rcl = r.controller?.level ?? 0;
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
        logger.info(`Expansion paused: insufficient energy reserves (${avgEnergy.toFixed(0)} < ${minEnergyForExpansion})`, {
          subsystem: "Empire"
        });
      }
      return;
    }

    // All conditions met - ready to expand
    if (empire.objectives.expansionPaused) {
      empire.objectives.expansionPaused = false;
      logger.info(
        `Expansion resumed: ${stableRooms.length} stable rooms with ${avgEnergy.toFixed(0)} avg energy`,
        { subsystem: "Empire" }
      );
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
  private monitorClusterHealth(): void {
    // Only check every 50 ticks
    if (Game.time % 50 !== 0) {
      return;
    }

    const clusters = memoryManager.getClusters();
    const allOwnedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);

    for (const clusterId in clusters) {
      const cluster = clusters[clusterId];
      
      // Calculate cluster health metrics
      const clusterRooms = allOwnedRooms.filter(r => cluster.memberRooms.includes(r.name));
      
      if (clusterRooms.length === 0) {
        continue;
      }

      // Check energy availability across cluster
      const totalEnergy = clusterRooms.reduce((sum, r) => {
        return sum + (r.storage?.store[RESOURCE_ENERGY] ?? 0) + (r.terminal?.store[RESOURCE_ENERGY] ?? 0);
      }, 0);
      const avgEnergy = totalEnergy / clusterRooms.length;

      // Check CPU usage per room
      const avgCpuPerRoom = Game.cpu.getUsed() / allOwnedRooms.length;

      // Detect unhealthy conditions
      const lowEnergy = avgEnergy < 30000;
      const highCpu = avgCpuPerRoom > 2.0;

      // Log warnings for unhealthy clusters
      if (lowEnergy && Game.time % 500 === 0) {
        logger.warn(
          `Cluster ${clusterId} has low energy: ${avgEnergy.toFixed(0)} avg (threshold: 30000)`,
          { subsystem: "Empire" }
        );
      }

      if (highCpu && Game.time % 500 === 0) {
        logger.warn(
          `Cluster ${clusterId} has high CPU usage: ${avgCpuPerRoom.toFixed(2)} per room`,
          { subsystem: "Empire" }
        );
      }

      // Update cluster metrics
      if (!cluster.metrics) {
        cluster.metrics = {
          energyIncome: 0,
          energyConsumption: 0,
          energyBalance: 0,
          warIndex: 0,
          economyIndex: 0
        };
      }

      // Calculate economy health index (0-100)
      const energyScore = Math.min(100, (avgEnergy / 100000) * 100);
      const roomCountScore = (clusterRooms.length / cluster.memberRooms.length) * 100;
      cluster.metrics.economyIndex = Math.round((energyScore + roomCountScore) / 2);

      // Trigger rebalancing if economy index is low
      if (cluster.metrics.economyIndex < 40 && Game.time % 500 === 0) {
        logger.warn(
          `Cluster ${clusterId} economy index low: ${cluster.metrics.economyIndex} - consider rebalancing`,
          { subsystem: "Empire" }
        );
      }
    }
  }

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
