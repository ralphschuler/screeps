/**
 * Resource Sharing Module
 *
 * Handles inter-room resource sharing for rooms without terminals (RCL 1-5).
 * Uses carrier creeps to transfer energy between rooms to stabilize economies.
 *
 * Key Features:
 * - Calculates resource needs and surplus for each room
 * - Creates resource transfer requests based on urgency
 * - Coordinates carrier creep spawning and routing
 * - Prioritizes critical energy needs for spawn survival
 *
 * Addresses Issue: Allow rooms to share resources between each other
 */

import type { ClusterMemory, ResourceTransferRequest, SwarmState } from "../memory/schemas";
import { logger } from "../core/logger";
import { memoryManager } from "../memory/manager";

/**
 * Resource sharing configuration
 */
export interface ResourceSharingConfig {
  /** Minimum bucket to run resource sharing */
  minBucket: number;
  /** Critical energy threshold (spawn in danger) */
  criticalEnergyThreshold: number;
  /** Medium energy threshold (low on energy) */
  mediumEnergyThreshold: number;
  /** Low energy threshold (could use help) */
  lowEnergyThreshold: number;
  /** Surplus energy threshold (can help others) */
  surplusEnergyThreshold: number;
  /** Minimum transfer amount */
  minTransferAmount: number;
  /** Maximum active requests per room */
  maxRequestsPerRoom: number;
  /** Request timeout in ticks */
  requestTimeout: number;
  /** Focus room medium energy threshold (prioritize upgrading) */
  focusRoomMediumThreshold: number;
  /** Focus room low energy threshold (accumulate for upgrading) */
  focusRoomLowThreshold: number;
}

const DEFAULT_CONFIG: ResourceSharingConfig = {
  minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
  // Request help before reaching bootstrap emergency threshold (150 energy)
  // This gives buffer time for carrier to arrive with energy
  criticalEnergyThreshold: 300, // Spawn needs energy urgently
  mediumEnergyThreshold: 1000, // Running low
  lowEnergyThreshold: 3000, // Could use some help
  surplusEnergyThreshold: 10000, // Has plenty to share
  minTransferAmount: 500,
  maxRequestsPerRoom: 3,
  requestTimeout: 500,
  focusRoomMediumThreshold: 5000, // Focus room accumulates more for upgrading
  focusRoomLowThreshold: 15000 // Focus room satisfied with higher reserves
};

/**
 * Room resource status
 */
interface RoomResourceStatus {
  roomName: string;
  hasTerminal: boolean;
  energyAvailable: number;
  energyCapacity: number;
  energyNeed: 0 | 1 | 2 | 3;
  canProvide: number;
  needsAmount: number;
}

/**
 * Resource Sharing Manager
 */
export class ResourceSharingManager {
  private config: ResourceSharingConfig;

  public constructor(config: Partial<ResourceSharingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Process resource sharing for a cluster
   */
  public processCluster(cluster: ClusterMemory): void {
    if (Game.cpu.bucket < this.config.minBucket) {
      return; // Skip if CPU is low
    }

    // Clean up old/completed requests
    this.cleanupRequests(cluster);

    // Get resource status for all rooms
    const roomStatuses = this.getRoomStatuses(cluster);

    // Find rooms without terminals that need help or can help
    const preTerminalRooms = roomStatuses.filter(r => !r.hasTerminal);

    if (preTerminalRooms.length < 2) {
      return; // Need at least 2 rooms to share
    }

    // Create resource transfer requests
    this.createTransferRequests(cluster, preTerminalRooms);
  }

  /**
   * Clean up old or completed requests
   */
  private cleanupRequests(cluster: ClusterMemory): void {
    cluster.resourceRequests = cluster.resourceRequests.filter(req => {
      // Remove if too old
      if (Game.time - req.createdAt > this.config.requestTimeout) {
        logger.debug(`Resource request from ${req.fromRoom} to ${req.toRoom} expired`, {
          subsystem: "ResourceSharing"
        });
        return false;
      }

      // Remove if completed
      if (req.delivered >= req.amount) {
        logger.info(
          `Resource transfer completed: ${req.delivered} ${req.resourceType} from ${req.fromRoom} to ${req.toRoom}`,
          { subsystem: "ResourceSharing" }
        );
        return false;
      }

      // Remove if either room no longer exists in cluster
      if (!cluster.memberRooms.includes(req.toRoom) || !cluster.memberRooms.includes(req.fromRoom)) {
        return false;
      }

      // Check if need is still valid
      const toRoom = Game.rooms[req.toRoom];
      if (toRoom) {
        const swarm = memoryManager.getSwarmState(req.toRoom);
        if (swarm && swarm.metrics.energyNeed === 0) {
          logger.debug(`Resource request from ${req.fromRoom} to ${req.toRoom} no longer needed`, {
            subsystem: "ResourceSharing"
          });
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get resource status for all rooms in cluster
   */
  private getRoomStatuses(cluster: ClusterMemory): RoomResourceStatus[] {
    const statuses: RoomResourceStatus[] = [];

    for (const roomName of cluster.memberRooms) {
      const room = Game.rooms[roomName];
      if (!room || !room.controller?.my) continue;

      const swarm = memoryManager.getSwarmState(roomName);
      if (!swarm) continue;

      const isFocusRoom = cluster.focusRoom === roomName;

      // Calculate available energy and capacity
      const { energyAvailable, energyCapacity } = this.calculateRoomEnergy(room);

      // Determine energy need level
      const energyNeed = this.calculateEnergyNeed(room, energyAvailable, swarm, isFocusRoom);

      // Calculate how much can be provided
      let canProvide = 0;
      if (isFocusRoom) {
        // Focus room should not provide resources to others
        canProvide = 0;
      } else if (energyAvailable > this.config.surplusEnergyThreshold) {
        canProvide = energyAvailable - this.config.mediumEnergyThreshold;
      }

      // Calculate how much is needed
      let needsAmount = 0;
      if (energyNeed === 3) {
        needsAmount = this.config.criticalEnergyThreshold - energyAvailable;
      } else if (energyNeed === 2) {
        needsAmount = this.config.mediumEnergyThreshold - energyAvailable;
      } else if (energyNeed === 1) {
        needsAmount = this.config.lowEnergyThreshold - energyAvailable;
      }
      
      // Focus room gets more aggressive about requesting resources
      if (isFocusRoom && energyNeed > 0) {
        needsAmount = Math.max(needsAmount, this.config.minTransferAmount * 2);
      } else {
        needsAmount = Math.max(needsAmount, this.config.minTransferAmount);
      }

      statuses.push({
        roomName,
        hasTerminal: room.terminal !== undefined && room.terminal.my,
        energyAvailable,
        energyCapacity,
        energyNeed,
        canProvide,
        needsAmount
      });

      // Update swarm metrics
      swarm.metrics.energyAvailable = energyAvailable;
      swarm.metrics.energyCapacity = energyCapacity;
      swarm.metrics.energyNeed = energyNeed;
    }

    return statuses;
  }

  /**
   * Calculate available energy and capacity for a room
   */
  private calculateRoomEnergy(room: Room): { energyAvailable: number; energyCapacity: number } {
    let energyAvailable = 0;
    let energyCapacity = 0;

    // Include storage
    if (room.storage) {
      energyAvailable += room.storage.store.getUsedCapacity(RESOURCE_ENERGY);
      energyCapacity += room.storage.store.getCapacity();
    }

    // Include containers (but not link containers)
    const containers = room.find(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_CONTAINER
    }) as StructureContainer[];

    for (const container of containers) {
      energyAvailable += container.store.getUsedCapacity(RESOURCE_ENERGY);
      energyCapacity += container.store.getCapacity();
    }

    return { energyAvailable, energyCapacity };
  }

  /**
   * Calculate energy need level for a room
   * Focus rooms have higher thresholds to ensure they get priority for upgrading
   */
  private calculateEnergyNeed(room: Room, energyAvailable: number, _swarm: SwarmState, isFocusRoom = false): 0 | 1 | 2 | 3 {
    // Critical: spawn in danger of not being able to spawn
    if (energyAvailable < this.config.criticalEnergyThreshold) {
      // Extra critical if spawn is low on energy and can't spawn
      // Bootstrap system can work with 150 energy (ultra-minimal larvaWorker)
      const spawns = room.find(FIND_MY_SPAWNS);
      if (spawns.length > 0 && room.energyAvailable < 150) {
        return 3;
      }
      return 3;
    }

    // Focus room has higher thresholds to accumulate more energy for upgrading
    if (isFocusRoom) {
      // Focus room considers itself "medium need" up to configured threshold
      if (energyAvailable < this.config.focusRoomMediumThreshold) {
        return 2;
      }
      // Focus room considers itself "low need" up to configured threshold
      if (energyAvailable < this.config.focusRoomLowThreshold) {
        return 1;
      }
      // Focus room is satisfied once it has significant reserves
      return 0;
    }

    // Non-focus rooms use standard thresholds
    // Medium: running low on energy
    if (energyAvailable < this.config.mediumEnergyThreshold) {
      return 2;
    }

    // Low: could use some help
    if (energyAvailable < this.config.lowEnergyThreshold) {
      return 1;
    }

    // No need
    return 0;
  }

  /**
   * Create resource transfer requests
   */
  private createTransferRequests(cluster: ClusterMemory, rooms: RoomResourceStatus[]): void {
    // Sort by need (highest first)
    const needyRooms = rooms.filter(r => r.energyNeed > 0).sort((a, b) => b.energyNeed - a.energyNeed);

    // Sort providers by surplus (highest first)
    const providerRooms = rooms.filter(r => r.canProvide > 0).sort((a, b) => b.canProvide - a.canProvide);

    if (needyRooms.length === 0 || providerRooms.length === 0) {
      return; // No matches possible
    }

    // Match needy rooms with providers
    for (const needyRoom of needyRooms) {
      // Check if room already has too many active requests
      const existingRequests = cluster.resourceRequests.filter(r => r.toRoom === needyRoom.roomName);
      if (existingRequests.length >= this.config.maxRequestsPerRoom) {
        continue;
      }

      // Find best provider (closest with surplus)
      let bestProvider: RoomResourceStatus | null = null;
      let bestDistance = Infinity;

      for (const provider of providerRooms) {
        if (provider.roomName === needyRoom.roomName) continue;

        // Check if already providing to this room
        const alreadyProviding = cluster.resourceRequests.some(
          r => r.fromRoom === provider.roomName && r.toRoom === needyRoom.roomName
        );
        if (alreadyProviding) continue;

        const distance = Game.map.getRoomLinearDistance(provider.roomName, needyRoom.roomName);
        if (distance < bestDistance && provider.canProvide >= this.config.minTransferAmount) {
          bestDistance = distance;
          bestProvider = provider;
        }
      }

      if (bestProvider && bestDistance <= 3) {
        // Only transfer between nearby rooms
        // Create transfer request
        const amount = Math.min(needyRoom.needsAmount, bestProvider.canProvide);

        const request: ResourceTransferRequest = {
          toRoom: needyRoom.roomName,
          fromRoom: bestProvider.roomName,
          resourceType: RESOURCE_ENERGY,
          amount,
          priority: needyRoom.energyNeed,
          createdAt: Game.time,
          assignedCreeps: [],
          delivered: 0
        };

        cluster.resourceRequests.push(request);

        logger.info(
          `Created resource transfer: ${amount} energy from ${bestProvider.roomName} to ${needyRoom.roomName} (priority ${request.priority}, distance ${bestDistance})`,
          { subsystem: "ResourceSharing" }
        );

        // Reduce provider's available amount
        bestProvider.canProvide -= amount;
      }
    }
  }

  /**
   * Get active transfer requests for a room
   */
  public getRequestsForRoom(cluster: ClusterMemory, roomName: string): ResourceTransferRequest[] {
    return cluster.resourceRequests.filter(r => r.toRoom === roomName || r.fromRoom === roomName);
  }

  /**
   * Update request progress
   */
  public updateRequestProgress(cluster: ClusterMemory, requestIndex: number, amount: number): void {
    if (requestIndex >= 0 && requestIndex < cluster.resourceRequests.length) {
      const request = cluster.resourceRequests[requestIndex];
      request.delivered += amount;

      logger.debug(`Updated transfer progress: ${request.delivered}/${request.amount} from ${request.fromRoom} to ${request.toRoom}`, {
        subsystem: "ResourceSharing"
      });
    }
  }
}

/**
 * Global resource sharing manager instance
 */
export const resourceSharingManager = new ResourceSharingManager();
