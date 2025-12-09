/**
 * Expansion Manager - Remote Mining and Room Claiming Coordinator
 *
 * Coordinates expansion activities:
 * - Identifies and assigns remote mining rooms
 * - Assigns claim targets to claimers from expansion queue
 * - Assigns reserve targets to reservers for remote rooms
 *
 * Addresses Issue: Bot not expanding into other rooms
 */

import type { OvermindMemory, RoomIntel } from "../memory/schemas";
import { ProcessPriority, kernel } from "../core/kernel";
import { logger } from "../core/logger";
import { memoryManager } from "../memory/manager";
import { MediumFrequencyProcess, ProcessClass } from "../core/processDecorators";

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
}

const DEFAULT_CONFIG: ExpansionManagerConfig = {
  updateInterval: 20,
  minBucket: 4000,
  maxRemoteDistance: 2,
  maxRemotesPerRoom: 3,
  minRemoteSources: 1,
  minRclForRemotes: 3
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
    minBucket: 4000,
    cpuBudget: 0.02
  })
  public run(): void {
    const overmind = memoryManager.getOvermind();

    // Update last run time
    this.lastRun = Game.time;

    // Update remote room assignments for all owned rooms
    this.updateRemoteAssignments(overmind);

    // Assign targets to claimers from expansion queue
    this.assignClaimerTargets(overmind);

    // Assign targets to reservers for remote rooms
    this.assignReserverTargets();
  }

  /**
   * Update remote room assignments for all owned rooms
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

      // Find new remote candidates if we need more
      if (validRemotes.length < this.config.maxRemotesPerRoom) {
        const candidates = this.findRemoteCandidates(room.name, overmind, validRemotes);
        const slotsAvailable = this.config.maxRemotesPerRoom - validRemotes.length;
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
   */
  private assignClaimerTargets(overmind: OvermindMemory): void {
    // Get next expansion target
    const nextTarget = this.getNextExpansionTarget(overmind);
    if (!nextTarget) return;

    // Find claimers without targets
    for (const creep of Object.values(Game.creeps)) {
      const memory = creep.memory as unknown as {
        role?: string;
        targetRoom?: string;
        task?: string;
        family?: string;
      };

      if (memory.role === "claimer" && !memory.targetRoom) {
        // Assign the expansion target
        memory.targetRoom = nextTarget.roomName;
        memory.task = "claim";
        logger.info(`Assigned claim target ${nextTarget.roomName} to ${creep.name}`, { subsystem: "Expansion" });

        // Mark as claimed in queue
        nextTarget.claimed = true;
        break; // Only assign one claimer per tick
      }
    }
  }

  /**
   * Assign targets to reservers for remote rooms
   */
  private assignReserverTargets(): void {
    // Find claimers without targets that should reserve
    for (const creep of Object.values(Game.creeps)) {
      const memory = creep.memory as unknown as {
        role?: string;
        targetRoom?: string;
        task?: string;
        homeRoom?: string;
        family?: string;
      };

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
      const memory = creep.memory as unknown as {
        role?: string;
        targetRoom?: string;
        task?: string;
      };

      if (memory.role === "claimer" && memory.targetRoom === roomName && memory.task === "reserve") {
        return true;
      }
    }
    return false;
  }

  /**
   * Get next expansion target from queue
   */
  private getNextExpansionTarget(overmind: OvermindMemory): { roomName: string; claimed: boolean } | null {
    // Check if we can expand (GCL limit)
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    if (ownedRooms.length >= Game.gcl.level) {
      return null;
    }

    // Find unclaimed target from queue
    const unclaimed = overmind.claimQueue.filter(c => !c.claimed);
    if (unclaimed.length === 0) return null;

    return unclaimed[0];
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
