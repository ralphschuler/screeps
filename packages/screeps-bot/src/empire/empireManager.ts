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
 */

import type { ExpansionCandidate, OvermindMemory, RoomIntel } from "../memory/schemas";
import { memoryManager } from "../memory/manager";
import { logger } from "../core/logger";
import { profiler } from "../core/profiler";
import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { ProcessPriority } from "../core/kernel";

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
}

const DEFAULT_CONFIG: EmpireConfig = {
  updateInterval: 30,
  minBucket: 5000,
  maxCpuBudget: 0.05, // 5% of CPU limit
  minGclForExpansion: 2,
  maxExpansionDistance: 10,
  minExpansionScore: 50
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
    minBucket: 5000,
    cpuBudget: 0.05
  })
  public run(): void {
    const cpuStart = Game.cpu.getUsed();
    const overmind = memoryManager.getOvermind();

    // Update last run time
    this.lastRun = Game.time;
    overmind.lastRun = Game.time;

    // Run empire subsystems
    profiler.measureSubsystem("empire:expansion", () => {
      this.updateExpansionQueue(overmind);
    });

    profiler.measureSubsystem("empire:powerBanks", () => {
      this.updatePowerBanks(overmind);
    });

    profiler.measureSubsystem("empire:warTargets", () => {
      this.updateWarTargets(overmind);
    });

    profiler.measureSubsystem("empire:objectives", () => {
      this.updateObjectives(overmind);
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
  private cleanupClaimQueue(overmind: OvermindMemory, ownedRoomNames: Set<string>): void {
    const initialQueueLength = overmind.claimQueue.length;
    overmind.claimQueue = overmind.claimQueue.filter(candidate => {
      const isNowOwned = ownedRoomNames.has(candidate.roomName);
      if (isNowOwned) {
        logger.info(`Removing ${candidate.roomName} from claim queue - now owned`, { subsystem: "Empire" });
        return false;
      }
      return true;
    });
    
    if (overmind.claimQueue.length < initialQueueLength) {
      logger.info(`Cleaned up claim queue: removed ${initialQueueLength - overmind.claimQueue.length} owned room(s)`, {
        subsystem: "Empire"
      });
    }
  }

  /**
   * Update expansion queue with scored candidates
   */
  private updateExpansionQueue(overmind: OvermindMemory): void {
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
        const intel = overmind.roomIntel[room.name];
        if (intel && intel.owner !== myUsername) {
          intel.owner = myUsername;
          logger.info(`Updated room intel for ${room.name} - now owned by ${myUsername}`, { subsystem: "Empire" });
        }
      }
    }

    // Always cleanup the claim queue to remove owned rooms
    this.cleanupClaimQueue(overmind, ownedRoomNames);

    if (ownedRooms.length >= gclLevel) {
      // At GCL limit, don't evaluate expansion
      return;
    }

    if (gclLevel < this.config.minGclForExpansion) {
      // Too early to expand
      return;
    }

    if (overmind.objectives.expansionPaused) {
      // Expansion manually paused
      return;
    }

    // Score all scouted rooms
    const candidates: ExpansionCandidate[] = [];

    for (const roomName in overmind.roomIntel) {
      const intel = overmind.roomIntel[roomName];

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
    overmind.claimQueue = candidates.slice(0, 10);

    if (candidates.length > 0 && Game.time % 100 === 0) {
      logger.info(`Expansion queue updated: ${candidates.length} candidates, top score: ${candidates[0].score}`, {
        subsystem: "Empire"
      });
    }
  }

  /**
   * Score an expansion candidate
   */
  private scoreExpansionCandidate(intel: RoomIntel, ownedRooms: Room[]): number {
    let score = 0;

    // Source count (most important)
    score += intel.sources * 40;

    // Distance penalty (prefer closer rooms)
    const distance = this.getMinDistanceToOwned(intel.name, ownedRooms);
    if (distance > this.config.maxExpansionDistance) {
      return 0; // Too far
    }
    score -= distance * 3;

    // Mineral bonus (strategic minerals worth more)
    if (intel.mineralType) {
      const strategicMinerals: MineralConstant[] = [RESOURCE_CATALYST, RESOURCE_ZYNTHIUM, RESOURCE_KEANIUM];
      if (strategicMinerals.includes(intel.mineralType)) {
        score += 15;
      } else {
        score += 10;
      }
    }

    // Terrain bonus (plains preferred over swamp)
    if (intel.terrain === "plains") {
      score += 10;
    } else if (intel.terrain === "swamp") {
      score -= 5;
    }

    // Threat penalty
    score -= intel.threatLevel * 20;

    // Highway rooms are not good for expansion
    if (intel.isHighway) {
      return 0;
    }

    // SK rooms are not good for early expansion
    if (intel.isSK) {
      score -= 30;
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
  private updatePowerBanks(overmind: OvermindMemory): void {
    // Remove expired power banks
    overmind.powerBanks = overmind.powerBanks.filter(pb => pb.decayTick > Game.time);

    // Check visible rooms for power banks
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      const foundPowerBanks = room.find(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_POWER_BANK
      });
      const powerBanks = foundPowerBanks as StructurePowerBank[];

      for (const pb of powerBanks) {
        // Check if already tracked
        const existing = overmind.powerBanks.find(
          entry => entry.roomName === roomName && entry.pos.x === pb.pos.x && entry.pos.y === pb.pos.y
        );

        if (!existing) {
          // Add new power bank
          overmind.powerBanks.push({
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
  private updateWarTargets(overmind: OvermindMemory): void {
    // Remove war targets that are no longer valid
    overmind.warTargets = overmind.warTargets.filter(target => {
      // Check if target still exists and is hostile
      const intel = overmind.roomIntel[target];
      if (!intel) return false;

      // Remove if room is now owned by us
      if (intel.owner === (Object.values(Game.spawns)[0]?.owner.username ?? "")) {
        return false;
      }

      return true;
    });

    // Auto-add war targets based on threat
    if (overmind.objectives.warMode) {
      for (const roomName in overmind.roomIntel) {
        const intel = overmind.roomIntel[roomName];

        // Add high-threat rooms as war targets
        if (intel.threatLevel >= 2 && !overmind.warTargets.includes(roomName)) {
          overmind.warTargets.push(roomName);
          logger.warn(`Added war target: ${roomName} (threat level ${intel.threatLevel})`, { subsystem: "Empire" });
        }
      }
    }
  }

  /**
   * Update global objectives
   */
  private updateObjectives(overmind: OvermindMemory): void {
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);

    // Update target room count (GCL level)
    overmind.objectives.targetRoomCount = Game.gcl.level;

    // Update target power level (based on owned rooms)
    overmind.objectives.targetPowerLevel = Math.min(25, ownedRooms.length * 3);

    // Auto-enable war mode if we have war targets
    if (overmind.warTargets.length > 0 && !overmind.objectives.warMode) {
      overmind.objectives.warMode = true;
      logger.warn("War mode enabled due to active war targets", { subsystem: "Empire" });
    }

    // Auto-disable war mode if no war targets for 1000 ticks
    if (overmind.warTargets.length === 0 && overmind.objectives.warMode) {
      overmind.objectives.warMode = false;
      logger.info("War mode disabled - no active war targets", { subsystem: "Empire" });
    }
  }

  /**
   * Get next expansion target
   */
  public getNextExpansionTarget(): ExpansionCandidate | null {
    const overmind = memoryManager.getOvermind();
    const unclaimed = overmind.claimQueue.filter(c => !c.claimed);
    return unclaimed.length > 0 ? unclaimed[0] : null;
  }

  /**
   * Mark expansion target as claimed
   */
  public markExpansionClaimed(roomName: string): void {
    const overmind = memoryManager.getOvermind();
    const candidate = overmind.claimQueue.find(c => c.roomName === roomName);
    if (candidate) {
      candidate.claimed = true;
      logger.info(`Marked expansion target as claimed: ${roomName}`, { subsystem: "Empire" });
    }
  }
}

/**
 * Global empire manager instance
 */
export const empireManager = new EmpireManager();
