/**
 * Expansion Manager - Remote Mining and Room Claiming Coordinator
 *
 * Coordinates expansion activities:
 * - Identifies and assigns remote mining rooms with profitability analysis
 * - Assigns claim targets to claimers from expansion queue
 * - Assigns reserve targets to reservers for remote rooms
 * - Monitors and cancels failed expansion attempts
 *
 * Features:
 * ✅ Multi-factor scoring for expansion candidates (sources, minerals, distance, threats, portals, clusters)
 * ✅ Expansion path safety analysis (2-range hostile scanning, war zone detection)
 * ✅ GCL-based expansion timing optimization
 * ✅ Cluster-aware expansion (prefer expansion near existing rooms)
 * ✅ Remote mining profitability analysis (ROI >2x threshold)
 * ✅ Expansion cancellation (timeout, claimer death, hostile claims, low energy)
 */

import { MediumFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { ProcessPriority, kernel } from "../core/kernel";
import { logger } from "../core/logger";
import { memoryManager } from "../memory/manager";
import type { OvermindMemory, RoomIntel } from "../memory/schemas";
import * as ExpansionScoring from "./expansionScoring";

/**
 * Simplified creep memory interface for expansion tasks
 */
interface ClaimerMemory {
  role?: string;
  targetRoom?: string;
  task?: string;
  homeRoom?: string;
  family?: string;
}

/**
 * Expansion Manager Configuration
 */
export interface ExpansionManagerConfig {
  /** Update interval in ticks */
  updateInterval: number;
  /** Minimum bucket to run expansion logic */
  minBucket: number;
  /** Maximum linear distance for remote mining rooms */
  maxRemoteDistance: number;
  /** Maximum number of remote rooms per owned room */
  maxRemotesPerRoom: number;
  /** Minimum sources required in a remote room */
  minRemoteSources: number;
  /** Minimum RCL required before enabling remote mining */
  minRclForRemotes: number;
  /** Minimum RCL required before claiming new rooms (stability threshold) */
  minRclForClaiming: number;
  /** Minimum GCL progress (0-1) before attempting next claim */
  minGclProgressForClaim: number;
  /** Prefer expansion within this distance of existing clusters */
  clusterExpansionDistance: number;
  /** Minimum percentage of owned rooms that must be stable before expansion */
  minStableRoomPercentage: number;
}

const DEFAULT_CONFIG: ExpansionManagerConfig = {
  updateInterval: 20,
  minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
  maxRemoteDistance: 2,
  maxRemotesPerRoom: 3,
  minRemoteSources: 1,
  minRclForRemotes: 3,
  minRclForClaiming: 4,
  minGclProgressForClaim: 0.7, // 70% GCL progress before next claim
  clusterExpansionDistance: 5,
  minStableRoomPercentage: 0.6 // 60% of rooms must be RCL 4+ to expand
};

/**
 * Expansion Manager Class
 */
@ProcessClass()
export class ExpansionManager {
  private config: ExpansionManagerConfig;
  private lastRun = 0;
  private cachedUsername = "";
  private usernameLastTick = 0;

  public constructor(config: Partial<ExpansionManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main expansion tick - runs periodically
   * Registered as kernel process via decorator
   */
  @MediumFrequencyProcess("expansion:manager", "Expansion Manager", {
    priority: ProcessPriority.LOW,
    interval: 20,
    minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
    cpuBudget: 0.02
  })
  public run(): void {
    const overmind = memoryManager.getOvermind();

    // Update last run time
    this.lastRun = Game.time;

    // Monitor expansion progress and cancel failed attempts
    this.monitorExpansionProgress(overmind);

    // Update remote room assignments for all owned rooms
    this.updateRemoteAssignments(overmind);

    // Check if we're ready for expansion
    const expansionReady = this.isExpansionReady(overmind);

    // Assign targets to claimers from expansion queue (only if ready)
    if (expansionReady) {
      this.assignClaimerTargets(overmind);
    }

    // Assign targets to reservers for remote rooms
    this.assignReserverTargets();
  }

  /**
   * Update remote room assignments for all owned rooms
   * Prioritizes room stability before assigning remotes
   */
  private updateRemoteAssignments(overmind: OvermindMemory): void {
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);

    for (const room of ownedRooms) {
      const swarm = memoryManager.getSwarmState(room.name);
      if (!swarm) continue;

      // Check RCL requirement
      const rcl = room.controller?.level ?? 0;
      if (rcl < this.config.minRclForRemotes) {
        continue;
      }

      // Get current remote assignments
      const currentRemotes = swarm.remoteAssignments ?? [];

      // Validate current assignments (remove invalid ones)
      const validRemotes = this.validateRemoteAssignments(currentRemotes, overmind, room.name);

      // Calculate remote capacity based on room stability
      const maxRemotes = this.calculateRemoteCapacity(room, swarm);

      // Find new remote candidates if we need more and room is stable
      if (validRemotes.length < maxRemotes) {
        const candidates = this.findRemoteCandidates(room.name, overmind, validRemotes);
        const slotsAvailable = maxRemotes - validRemotes.length;
        const newRemotes = candidates.slice(0, slotsAvailable);

        for (const remoteName of newRemotes) {
          if (!validRemotes.includes(remoteName)) {
            validRemotes.push(remoteName);
            logger.info(`Assigned remote room ${remoteName} to ${room.name}`, { subsystem: "Expansion" });
          }
        }
      }

      // Update swarm state if changed
      if (JSON.stringify(validRemotes) !== JSON.stringify(swarm.remoteAssignments)) {
        swarm.remoteAssignments = validRemotes;
      }
    }
  }

  /**
   * Calculate remote mining capacity based on room stability
   * Returns reduced capacity for less stable rooms to prioritize owned room development
   */
  private calculateRemoteCapacity(room: Room, swarm: { danger: number }): number {
    const rcl = room.controller?.level ?? 0;

    // New rooms (RCL 3-4) get limited remotes
    if (rcl < 4) {
      return Math.min(1, this.config.maxRemotesPerRoom);
    }

    // Developing rooms (RCL 4-6) get moderate remotes
    if (rcl < 7) {
      return Math.min(2, this.config.maxRemotesPerRoom);
    }

    // Check room energy stability - reduce remotes if critically low
    // Changed from 50000 to 10000 to allow remote mining to BUILD UP energy reserves
    // instead of requiring high reserves before enabling remote mining (chicken-and-egg problem)
    const storage = room.storage;
    if (storage && storage.store.getUsedCapacity(RESOURCE_ENERGY) < 10000) {
      // Critically low energy - reduce remote capacity
      return Math.min(1, this.config.maxRemotesPerRoom);
    }

    // Check danger level - reduce remotes if under threat
    if (swarm.danger >= 2) {
      return Math.min(1, this.config.maxRemotesPerRoom);
    }

    // Mature rooms (RCL 7-8) with good energy get full capacity
    return this.config.maxRemotesPerRoom;
  }

  /**
   * Validate existing remote assignments (remove invalid ones)
   */
  private validateRemoteAssignments(
    remotes: string[],
    overmind: OvermindMemory,
    homeRoom: string
  ): string[] {
    return remotes.filter(remoteName => {
      const intel = overmind.roomIntel[remoteName];

      // Remove if no intel (not scouted yet - keep it for now)
      if (!intel) return true;

      let reason: "hostile" | "claimed" | "unreachable" | null = null;

      // Remove if now owned by someone else
      if (intel.owner) {
        logger.info(`Removing remote ${remoteName} - now owned by ${intel.owner}`, { subsystem: "Expansion" });
        reason = "claimed";
      }

      // Remove if reserved by hostile
      const myUsername = this.getMyUsername();
      if (!reason && intel.reserver && intel.reserver !== myUsername) {
        logger.info(`Removing remote ${remoteName} - reserved by ${intel.reserver}`, { subsystem: "Expansion" });
        reason = "hostile";
      }

      // Remove if too dangerous
      if (!reason && intel.threatLevel >= 3) {
        logger.info(`Removing remote ${remoteName} - threat level ${intel.threatLevel}`, { subsystem: "Expansion" });
        reason = "hostile";
      }

      // Remove if too far (in case config changed)
      if (!reason) {
        const distance = Game.map.getRoomLinearDistance(homeRoom, remoteName);
        if (distance > this.config.maxRemoteDistance) {
          logger.info(`Removing remote ${remoteName} - too far (${distance})`, { subsystem: "Expansion" });
          reason = "unreachable";
        }
      }

      // Emit remote lost event if we're removing this remote
      if (reason) {
        kernel.emit("remote.lost", {
          homeRoom,
          remoteRoom: remoteName,
          reason,
          source: homeRoom
        });
        return false;
      }

      return true;
    });
  }

  /**
   * Find remote mining candidates for a room
   */
  private findRemoteCandidates(
    homeRoom: string,
    overmind: OvermindMemory,
    currentRemotes: string[]
  ): string[] {
    const candidates: { roomName: string; score: number }[] = [];
    const myUsername = this.getMyUsername();

    for (const roomName in overmind.roomIntel) {
      // Skip if already assigned
      if (currentRemotes.includes(roomName)) continue;

      // Skip if already assigned to another room
      if (this.isRemoteAssignedElsewhere(roomName, homeRoom)) continue;

      const intel = overmind.roomIntel[roomName];

      // Skip if not scouted
      if (!intel.scouted) continue;

      // Skip if owned or reserved by someone else
      if (intel.owner) continue;
      if (intel.reserver && intel.reserver !== myUsername) continue;

      // Skip if it's a highway or SK room
      if (intel.isHighway || intel.isSK) continue;

      // Skip if too few sources
      if (intel.sources < this.config.minRemoteSources) continue;

      // Skip if too dangerous
      if (intel.threatLevel >= 2) continue;

      // Check distance (skip same room with distance 0, and rooms too far)
      const distance = Game.map.getRoomLinearDistance(homeRoom, roomName);
      if (distance < 1 || distance > this.config.maxRemoteDistance) continue;

      // Check profitability (must have >2x ROI)
      const profitability = ExpansionScoring.calculateRemoteProfitability(roomName, homeRoom, intel);
      if (!profitability.isProfitable) {
        if (Game.time % 1000 === 0) {
          logger.debug(
            `Skipping remote ${roomName} - not profitable (ROI: ${profitability.roi.toFixed(2)})`,
            { subsystem: "Expansion" }
          );
        }
        continue;
      }

      // Calculate score (higher = better)
      const score = this.scoreRemoteCandidate(intel, distance);
      candidates.push({ roomName, score });
    }

    // Sort by score (highest first)
    candidates.sort((a, b) => b.score - a.score);

    return candidates.map(c => c.roomName);
  }

  /**
   * Score a remote mining candidate
   */
  private scoreRemoteCandidate(intel: RoomIntel, distance: number): number {
    let score = 0;

    // Sources (most important)
    score += intel.sources * 50;

    // Distance penalty (closer is better)
    score -= distance * 20;

    // Threat penalty
    score -= intel.threatLevel * 30;

    // Terrain bonus
    if (intel.terrain === "plains") {
      score += 10;
    } else if (intel.terrain === "swamp") {
      score -= 10;
    }

    return score;
  }

  /**
   * Score a room for claiming (multi-factor expansion scoring)
   * Implements comprehensive scoring based on ROADMAP Section 7 & 9 requirements
   */
  private scoreClaimCandidate(
    intel: RoomIntel,
    distance: number,
    overmind: OvermindMemory,
    ownedRooms: Room[]
  ): number {
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

    return score;
  }

  /**
   * Check if a remote is already assigned to another owned room
   */
  private isRemoteAssignedElsewhere(remoteName: string, excludeRoom: string): boolean {
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);

    for (const room of ownedRooms) {
      if (room.name === excludeRoom) continue;

      const swarm = memoryManager.getSwarmState(room.name);
      if (swarm?.remoteAssignments?.includes(remoteName)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Assign targets to claimers from expansion queue
   * Triggers automatic claimer spawning if no claimer is available
   */
  private assignClaimerTargets(overmind: OvermindMemory): void {
    // Get next expansion target
    const nextTarget = this.getNextExpansionTarget(overmind);
    if (!nextTarget) return;

    // Check if we already have a claimer assigned or en route
    const hasClaimerForTarget = Object.values(Game.creeps).some(creep => {
      const memory = creep.memory as ClaimerMemory;
      return memory.role === "claimer" && memory.targetRoom === nextTarget.roomName && memory.task === "claim";
    });

    if (hasClaimerForTarget) {
      // Already have a claimer for this target
      return;
    }

    // Find claimers without targets
    let assignedClaimer = false;
    for (const creep of Object.values(Game.creeps)) {
      const memory = creep.memory as ClaimerMemory;

      if (memory.role === "claimer" && !memory.targetRoom) {
        // Assign the expansion target
        memory.targetRoom = nextTarget.roomName;
        memory.task = "claim";
        logger.info(`Assigned claim target ${nextTarget.roomName} to ${creep.name}`, { subsystem: "Expansion" });

        // Mark as claimed in queue
        nextTarget.claimed = true;
        assignedClaimer = true;
        break; // Only assign one claimer per tick
      }
    }

    // If no claimer was assigned, trigger automatic spawning
    if (!assignedClaimer) {
      this.requestClaimerSpawn(nextTarget.roomName, overmind);
    }
  }

  /**
   * Request a claimer to be spawned for expansion
   * Sets room posture to 'expand' to trigger claimer spawning
   */
  private requestClaimerSpawn(targetRoom: string, _overmind: OvermindMemory): void {
    // Find the best room to spawn the claimer from (closest stable room)
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    const stableRooms = ownedRooms.filter(r => (r.controller?.level ?? 0) >= this.config.minRclForClaiming);

    if (stableRooms.length === 0) return;

    // Find closest stable room to target
    let closestRoom: Room | null = null;
    let minDistance = 999;

    for (const room of stableRooms) {
      const distance = Game.map.getRoomLinearDistance(room.name, targetRoom);
      if (distance < minDistance) {
        minDistance = distance;
        closestRoom = room;
      }
    }

    if (!closestRoom) return;

    // Set room posture to 'expand' to prioritize claimer spawning
    const swarm = memoryManager.getSwarmState(closestRoom.name);
    if (swarm) {
      // Only change posture if not in critical defensive state
      if (swarm.posture !== "defensive" && swarm.posture !== "evacuate" && swarm.danger < 2) {
        if (swarm.posture !== "expand") {
          swarm.posture = "expand";
          logger.info(
            `Set ${closestRoom.name} to expand posture for claiming ${targetRoom} (distance: ${minDistance})`,
            { subsystem: "Expansion" }
          );
        }
      }
    }
  }

  /**
   * Assign targets to reservers for remote rooms
   */
  private assignReserverTargets(): void {
    // Find claimers without targets that should reserve
    for (const creep of Object.values(Game.creeps)) {
      const memory = creep.memory as ClaimerMemory;

      // Skip if not a claimer or already has target
      if (memory.role !== "claimer" || memory.targetRoom) continue;

      // Find a remote room that needs reservation
      const homeRoom = memory.homeRoom;
      if (!homeRoom) continue;

      const swarm = memoryManager.getSwarmState(homeRoom);
      if (!swarm?.remoteAssignments?.length) continue;

      // Find remote that needs reservation
      for (const remoteName of swarm.remoteAssignments) {
        // Check if room already has a reserver assigned
        if (this.hasReserverAssigned(remoteName)) continue;

        // Assign this claimer as a reserver
        memory.targetRoom = remoteName;
        memory.task = "reserve";
        logger.info(`Assigned reserve target ${remoteName} to ${creep.name}`, { subsystem: "Expansion" });
        break;
      }
    }
  }

  /**
   * Check if a room already has a reserver assigned
   */
  private hasReserverAssigned(roomName: string): boolean {
    for (const creep of Object.values(Game.creeps)) {
      const memory = creep.memory as ClaimerMemory;

      if (memory.role === "claimer" && memory.targetRoom === roomName && memory.task === "reserve") {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if empire is ready for expansion
   * Implements GCL-based pacing and room stability checks
   */
  private isExpansionReady(overmind: OvermindMemory): boolean {
    // Check if expansion is paused
    if (overmind.objectives.expansionPaused) {
      return false;
    }

    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);

    // Check GCL limit
    if (ownedRooms.length >= Game.gcl.level) {
      return false;
    }

    // Check GCL progress threshold (70% by default)
    // Only expand when we're close to the next GCL level
    const gclProgress = Game.gcl.progress / Game.gcl.progressTotal;
    if (gclProgress < this.config.minGclProgressForClaim) {
      if (Game.time % 500 === 0) {
        logger.info(
          `Waiting for GCL progress: ${(gclProgress * 100).toFixed(1)}% (need ${(this.config.minGclProgressForClaim * 100).toFixed(0)}%)`,
          { subsystem: "Expansion" }
        );
      }
      return false;
    }

    // Check room stability - ensure existing rooms are mature enough
    const stableRooms = ownedRooms.filter(r => (r.controller?.level ?? 0) >= this.config.minRclForClaiming);
    const stablePercentage = stableRooms.length / ownedRooms.length;

    if (stablePercentage < this.config.minStableRoomPercentage) {
      if (Game.time % 500 === 0) {
        logger.info(
          `Waiting for room stability: ${stableRooms.length}/${ownedRooms.length} rooms stable (${(stablePercentage * 100).toFixed(0)}%, need ${(this.config.minStableRoomPercentage * 100).toFixed(0)}%)`,
          { subsystem: "Expansion" }
        );
      }
      return false;
    }

    return true;
  }

  /**
   * Get next expansion target from queue with cluster-based prioritization
   */
  private getNextExpansionTarget(overmind: OvermindMemory): { roomName: string; claimed: boolean } | null {
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);

    // Check if we can expand (GCL limit)
    if (ownedRooms.length >= Game.gcl.level) {
      return null;
    }

    // Get unclaimed targets from queue
    const unclaimed = overmind.claimQueue.filter(c => !c.claimed);
    if (unclaimed.length === 0) return null;

    // Prioritize expansion targets near existing clusters
    const clusteredTargets = unclaimed.map(target => {
      const minDistance = this.getMinDistanceToOwned(target.roomName, ownedRooms);
      const isNearCluster = minDistance <= this.config.clusterExpansionDistance;
      const clusterBonus = isNearCluster ? 100 : 0;

      return {
        ...target,
        clusterScore: target.score + clusterBonus,
        distanceToCluster: minDistance
      };
    });

    // Sort by cluster score (higher = better)
    clusteredTargets.sort((a, b) => b.clusterScore - a.clusterScore);

    // Log cluster-based priority decision
    if (Game.time % 100 === 0 && clusteredTargets.length > 0) {
      const best = clusteredTargets[0];
      logger.info(
        `Next expansion target: ${best.roomName} (score: ${best.score}, cluster bonus: ${best.clusterScore - best.score}, distance: ${best.distanceToCluster})`,
        { subsystem: "Expansion" }
      );
    }

    return clusteredTargets[0];
  }

  /**
   * Calculate minimum distance from a room to any owned room
   */
  private getMinDistanceToOwned(roomName: string, ownedRooms: Room[]): number {
    if (ownedRooms.length === 0) return 999;

    let minDistance = 999;
    for (const room of ownedRooms) {
      const distance = Game.map.getRoomLinearDistance(roomName, room.name);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }

    return minDistance;
  }

  /**
   * Get my username (cached per tick)
   */
  private getMyUsername(): string {
    // Cache username per tick to avoid repeated lookups
    if (this.usernameLastTick !== Game.time || !this.cachedUsername) {
      const spawns = Object.values(Game.spawns);
      if (spawns.length > 0) {
        this.cachedUsername = spawns[0].owner.username;
      }
      this.usernameLastTick = Game.time;
    }
    return this.cachedUsername;
  }

  /**
   * Perform safety analysis for a room expansion candidate
   * Scans 2-range radius for hostile structures and threats
   */
  private performSafetyAnalysis(roomName: string, overmind: OvermindMemory): {
    isSafe: boolean;
    threatDescription: string;
  } {
    const threats: string[] = [];

    // Scan 2-range radius for hostile structures
    const nearbyRooms = ExpansionScoring.getRoomsInRange(roomName, 2);

    for (const nearbyRoom of nearbyRooms) {
      const intel = overmind.roomIntel[nearbyRoom];
      if (!intel) continue;

      // Check for hostile ownership
      if (intel.owner && !ExpansionScoring.isAlly(intel.owner)) {
        threats.push(`Hostile player ${intel.owner} in ${nearbyRoom}`);
      }

      // Check for hostile structures
      if (intel.towerCount && intel.towerCount > 0) {
        threats.push(`${intel.towerCount} towers in ${nearbyRoom}`);
      }
      if (intel.spawnCount && intel.spawnCount > 0) {
        threats.push(`${intel.spawnCount} spawns in ${nearbyRoom}`);
      }

      // Check for high threat level
      if (intel.threatLevel >= 2) {
        threats.push(`Threat level ${intel.threatLevel} in ${nearbyRoom}`);
      }
    }

    // Check if room is between two hostile players (war zone)
    if (ExpansionScoring.isInWarZone(roomName)) {
      threats.push("Room is in potential war zone between hostile players");
    }

    return {
      isSafe: threats.length === 0,
      threatDescription: threats.length > 0 ? threats.join("; ") : "No threats detected"
    };
  }

  /**
   * Monitor and cancel failed expansion attempts
   * Auto-cancels if claimer dies repeatedly, room becomes hostile, or energy drops
   */
  private monitorExpansionProgress(overmind: OvermindMemory): void {
    const now = Game.time;

    // Check each claimed expansion target for progress
    for (const candidate of overmind.claimQueue) {
      if (!candidate.claimed) continue;

      // Check if expansion has timed out (5000 ticks from last evaluation)
      const timeSinceEvaluation = now - candidate.lastEvaluated;
      if (timeSinceEvaluation > 5000) {
        // Check if the room is actually claimed
        const room = Game.rooms[candidate.roomName];
        if (room?.controller?.my) {
          // Successfully claimed! Mark as complete and remove from queue
          logger.info(`Expansion to ${candidate.roomName} completed successfully`, { subsystem: "Expansion" });
          this.removeFromClaimQueue(overmind, candidate.roomName);
          continue;
        }

        // Not claimed yet - cancel the attempt
        logger.warn(`Expansion to ${candidate.roomName} timed out after ${timeSinceEvaluation} ticks`, {
          subsystem: "Expansion"
        });
        this.cancelExpansion(overmind, candidate.roomName, "timeout");
        continue;
      }

      // Check if claimer died repeatedly
      const hasActiveClaimer = Object.values(Game.creeps).some(creep => {
        const memory = creep.memory as ClaimerMemory;
        return memory.role === "claimer" && memory.targetRoom === candidate.roomName && memory.task === "claim";
      });

      if (!hasActiveClaimer && timeSinceEvaluation > 1000) {
        // No claimer and it's been a while - likely died
        logger.warn(`No active claimer for ${candidate.roomName} expansion`, { subsystem: "Expansion" });
        this.cancelExpansion(overmind, candidate.roomName, "claimer_died");
        continue;
      }

      // Check if room became hostile before claim completes
      const intel = overmind.roomIntel[candidate.roomName];
      if (intel?.owner && intel.owner !== this.getMyUsername()) {
        logger.warn(`${candidate.roomName} claimed by ${intel.owner} before we could claim it`, {
          subsystem: "Expansion"
        });
        this.cancelExpansion(overmind, candidate.roomName, "hostile_claim");
        continue;
      }

      // Check if energy reserves dropped below threshold
      const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
      const totalEnergy = ownedRooms.reduce((sum, r) => sum + (r.storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0), 0);
      const avgEnergy = ownedRooms.length > 0 ? totalEnergy / ownedRooms.length : 0;

      if (avgEnergy < 20000) {
        // Low energy - cancel expansion to focus on economy
        logger.warn(`Cancelling expansion to ${candidate.roomName} due to low energy (avg: ${avgEnergy})`, {
          subsystem: "Expansion"
        });
        this.cancelExpansion(overmind, candidate.roomName, "low_energy");
        continue;
      }
    }
  }

  /**
   * Cancel an expansion attempt
   */
  private cancelExpansion(overmind: OvermindMemory, roomName: string, reason: string): void {
    // Remove from claim queue
    this.removeFromClaimQueue(overmind, roomName);

    // Cancel any claimers assigned to this room
    for (const creep of Object.values(Game.creeps)) {
      const memory = creep.memory as ClaimerMemory;
      if (memory.role === "claimer" && memory.targetRoom === roomName && memory.task === "claim") {
        // Clear their target so they can be reassigned
        memory.targetRoom = undefined;
        memory.task = undefined;
        logger.info(`Cleared target for ${creep.name} due to expansion cancellation`, { subsystem: "Expansion" });
      }
    }

    logger.info(`Cancelled expansion to ${roomName}, reason: ${reason}`, { subsystem: "Expansion" });
  }

  /**
   * Remove a room from the claim queue
   */
  private removeFromClaimQueue(overmind: OvermindMemory, roomName: string): void {
    const idx = overmind.claimQueue.findIndex(c => c.roomName === roomName);
    if (idx !== -1) {
      overmind.claimQueue.splice(idx, 1);
    }
  }

  /**
   * Manual: Add remote room assignment
   */
  public addRemoteRoom(homeRoom: string, remoteRoom: string): boolean {
    const swarm = memoryManager.getSwarmState(homeRoom);
    if (!swarm) {
      logger.error(`Cannot add remote: ${homeRoom} not found`, { subsystem: "Expansion" });
      return false;
    }

    if (!swarm.remoteAssignments) {
      swarm.remoteAssignments = [];
    }

    if (swarm.remoteAssignments.includes(remoteRoom)) {
      logger.warn(`Remote ${remoteRoom} already assigned to ${homeRoom}`, { subsystem: "Expansion" });
      return false;
    }

    swarm.remoteAssignments.push(remoteRoom);
    logger.info(`Manually added remote ${remoteRoom} to ${homeRoom}`, { subsystem: "Expansion" });
    return true;
  }

  /**
   * Manual: Remove remote room assignment
   */
  public removeRemoteRoom(homeRoom: string, remoteRoom: string): boolean {
    const swarm = memoryManager.getSwarmState(homeRoom);
    if (!swarm?.remoteAssignments) {
      return false;
    }

    const idx = swarm.remoteAssignments.indexOf(remoteRoom);
    if (idx === -1) {
      return false;
    }

    swarm.remoteAssignments.splice(idx, 1);
    logger.info(`Manually removed remote ${remoteRoom} from ${homeRoom}`, { subsystem: "Expansion" });
    return true;
  }
}

/**
 * Global expansion manager instance
 */
export const expansionManager = new ExpansionManager();
