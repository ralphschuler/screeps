/**
 * Cross-Shard Resource Transfer Coordinator
 *
 * Manages resource transfers between shards via portals.
 * Implements ROADMAP Section 11 requirements for cross-shard logistics.
 *
 * Design Principles:
 * - Uses portals for physical resource transfer between shards
 * - Coordinates with terminal managers for intra-shard transfers
 * - Tracks transfer progress and updates task status
 * - Prioritizes transfers based on task priority and shard needs
 */

import type { InterShardTask } from "./schema";
import { logger } from "../core/logger";
import { optimizeBody } from "../spawning/bodyOptimizer";
import { SpawnPriority, type SpawnRequest, spawnQueue } from "../spawning/spawnQueue";
import { shardManager } from "./shardManager";

/**
 * Transfer request for cross-shard resource movement
 */
export interface CrossShardTransferRequest {
  /** Task ID */
  taskId: string;
  /** Resource type */
  resourceType: ResourceConstant;
  /** Amount to transfer */
  amount: number;
  /** Source room on current shard */
  sourceRoom: string;
  /** Target shard */
  targetShard: string;
  /** Target room on target shard */
  targetRoom: string;
  /** Portal to use */
  portalRoom: string;
  /** Priority */
  priority: number;
  /** Status */
  status: "queued" | "gathering" | "moving" | "transferring" | "complete" | "failed";
  /** Creeps assigned to this transfer */
  assignedCreeps: string[];
  /** Amount transferred so far */
  transferred: number;
}

/**
 * Memory structure for transfer requests
 */
interface TransferCoordinatorMemory {
  requests: Record<string, CrossShardTransferRequest>;
  lastUpdate: number;
}

/**
 * Cross-Shard Resource Transfer Coordinator
 */
export class ResourceTransferCoordinator {
  private memory: TransferCoordinatorMemory;

  public constructor() {
    // Initialize memory
    if (!Memory.crossShardTransfers) {
      Memory.crossShardTransfers = {
        requests: {},
        lastUpdate: Game.time
      };
    }
    this.memory = Memory.crossShardTransfers;
  }

  /**
   * Main tick - process transfer requests
   */
  public run(): void {
    // Clean up old completed/failed requests
    this.cleanupOldRequests();

    // Get active transfer tasks from shard manager
    const tasks = shardManager.getActiveTransferTasks();

    // Create transfer requests for new tasks
    for (const task of tasks) {
      if (task.type !== "transfer" || !task.resourceType || !task.resourceAmount) continue;

      // Check if we already have a request for this task
      if (this.memory.requests[task.id]) continue;

      // Only create requests for tasks originating from this shard
      const currentShard = Game.shard?.name ?? "shard0";
      if (task.sourceShard !== currentShard) continue;

      this.createTransferRequest(task);
    }

    // Process existing requests
    for (const requestId in this.memory.requests) {
      const request = this.memory.requests[requestId];
      if (request) {
        this.processTransferRequest(request);
      }
    }

    this.memory.lastUpdate = Game.time;
  }

  /**
   * Create a transfer request from a task
   */
  private createTransferRequest(task: InterShardTask): void {
    if (!task.resourceType || !task.resourceAmount || !task.targetRoom) return;

    // Find optimal portal route
    const portal = shardManager.getOptimalPortalRoute(task.targetShard);
    if (!portal) {
      logger.warn(`No portal found to ${task.targetShard}, cannot create transfer request`, {
        subsystem: "CrossShardTransfer"
      });
      return;
    }

    // Find source room with the resource
    const sourceRoom = this.findSourceRoom(task.resourceType, task.resourceAmount);
    if (!sourceRoom) {
      logger.warn(`No room with sufficient ${task.resourceType} for transfer`, {
        subsystem: "CrossShardTransfer"
      });
      return;
    }

    const request: CrossShardTransferRequest = {
      taskId: task.id,
      resourceType: task.resourceType,
      amount: task.resourceAmount,
      sourceRoom,
      targetShard: task.targetShard,
      targetRoom: task.targetRoom,
      portalRoom: portal.sourceRoom,
      priority: task.priority,
      status: "queued",
      assignedCreeps: [],
      transferred: 0
    };

    this.memory.requests[task.id] = request;
    logger.info(
      `Created transfer request: ${task.resourceAmount} ${task.resourceType} from ${sourceRoom} to ${task.targetShard}/${task.targetRoom}`,
      { subsystem: "CrossShardTransfer" }
    );
  }

  /**
   * Find a room with sufficient resources for transfer
   */
  private findSourceRoom(resourceType: ResourceConstant, amount: number): string | null {
    const ownedRooms = Object.values(Game.rooms).filter(
      r => r.controller?.my && r.terminal && r.storage
    );

    // Prefer rooms with terminals and sufficient resources
    for (const room of ownedRooms) {
      const terminal = room.terminal;
      const storage = room.storage;

      if (terminal && terminal.store.getUsedCapacity(resourceType) >= amount) {
        return room.name;
      }

      if (storage && storage.store.getUsedCapacity(resourceType) >= amount) {
        return room.name;
      }
    }

    return null;
  }

  /**
   * Process a transfer request
   */
  private processTransferRequest(request: CrossShardTransferRequest): void {
    switch (request.status) {
      case "queued":
        this.handleQueuedRequest(request);
        break;
      case "gathering":
        this.handleGatheringRequest(request);
        break;
      case "moving":
        this.handleMovingRequest(request);
        break;
      case "transferring":
        this.handleTransferringRequest(request);
        break;
    }

    // Update task progress
    const progress = Math.round((request.transferred / request.amount) * 100);
    shardManager.updateTaskProgress(request.taskId, progress);
  }

  /**
   * Handle queued request - spawn carrier creeps
   */
  private handleQueuedRequest(request: CrossShardTransferRequest): void {
    // Check if we need to spawn carriers
    const neededCarryCapacity = request.amount - request.transferred;
    const existingCreeps = request.assignedCreeps
      .map(name => Game.creeps[name])
      .filter(c => c !== undefined);

    const currentCapacity = existingCreeps.reduce((sum, c) => sum + c.carryCapacity, 0);

    if (currentCapacity >= neededCarryCapacity) {
      request.status = "gathering";
      logger.info(`Transfer request ${request.taskId} moving to gathering phase`, {
        subsystem: "CrossShardTransfer"
      });
      return;
    }

    // Request spawning of carrier creeps
    const room = Game.rooms[request.sourceRoom];
    if (!room || !room.controller?.my) {
      logger.warn(`Source room ${request.sourceRoom} not available for spawning carriers`, {
        subsystem: "CrossShardTransfer"
      });
      return;
    }

    // Calculate how many carriers we need
    const capacityNeeded = neededCarryCapacity - currentCapacity;
    const maxEnergy = room.energyCapacityAvailable;

    // Optimize body for the carrier
    let body;
    try {
      body = optimizeBody({
        maxEnergy,
        role: "crossShardCarrier"
      });
    } catch (error) {
      logger.error(`Failed to optimize body for crossShardCarrier: ${String(error)}`, {
        subsystem: "CrossShardTransfer"
      });
      return;
    }

    // Calculate how many carriers we need based on body capacity
    const carrierCapacity = body.parts.filter(p => p === CARRY).length * 50;
    const carriersNeeded = Math.ceil(capacityNeeded / carrierCapacity);

    // Limit to spawning a reasonable number at once
    const maxCarriersPerRequest = 3;
    const carriersToSpawn = Math.min(carriersNeeded, maxCarriersPerRequest);

    // Map priority to spawn priority
    let spawnPriority = SpawnPriority.NORMAL;
    if (request.priority >= 80) {
      spawnPriority = SpawnPriority.HIGH;
    } else if (request.priority >= 50) {
      spawnPriority = SpawnPriority.NORMAL;
    } else {
      spawnPriority = SpawnPriority.LOW;
    }

    // Add spawn requests to queue
    for (let i = 0; i < carriersToSpawn; i++) {
      const spawnRequest: SpawnRequest = {
        id: `crossShardCarrier_${request.taskId}_${i}_${Game.time}`,
        roomName: request.sourceRoom,
        role: "crossShardCarrier",
        family: "economy",
        body,
        priority: spawnPriority,
        createdAt: Game.time,
        additionalMemory: {
          transferRequestId: request.taskId,
          sourceRoom: request.sourceRoom,
          portalRoom: request.portalRoom,
          targetShard: request.targetShard,
          targetRoom: request.targetRoom,
          resourceType: request.resourceType,
          state: "gathering"
        }
      };

      spawnQueue.addRequest(spawnRequest);
      logger.info(
        `Requested spawn of crossShardCarrier for transfer ${request.taskId} (${i + 1}/${carriersToSpawn})`,
        { subsystem: "CrossShardTransfer" }
      );
    }

    logger.debug(
      `Transfer request ${request.taskId} needs ${capacityNeeded} carry capacity, requested ${carriersToSpawn} carriers`,
      { subsystem: "CrossShardTransfer" }
    );
  }

  /**
   * Handle gathering request - collect resources from source
   */
  private handleGatheringRequest(request: CrossShardTransferRequest): void {
    const creeps = request.assignedCreeps
      .map(name => Game.creeps[name])
      .filter(c => c !== undefined);

    if (creeps.length === 0) {
      // No creeps available, go back to queued
      request.status = "queued";
      return;
    }

    // Check if all creeps have gathered resources
    const allGathered = creeps.every(
      c => c.store.getUsedCapacity(request.resourceType) > 0
    );

    if (allGathered) {
      request.status = "moving";
      logger.info(`Transfer request ${request.taskId} moving to portal`, {
        subsystem: "CrossShardTransfer"
      });
    }
  }

  /**
   * Handle moving request - move to portal
   */
  private handleMovingRequest(request: CrossShardTransferRequest): void {
    const creeps = request.assignedCreeps
      .map(name => Game.creeps[name])
      .filter(c => c !== undefined);

    if (creeps.length === 0) {
      request.status = "failed";
      shardManager.updateTaskProgress(request.taskId, request.transferred, "failed");
      return;
    }

    // Check if any creeps have reached the portal room
    const creepsInPortalRoom = creeps.filter(c => c.room.name === request.portalRoom);

    if (creepsInPortalRoom.length > 0) {
      request.status = "transferring";
      logger.info(`Transfer request ${request.taskId} reached portal, transferring`, {
        subsystem: "CrossShardTransfer"
      });
    }
  }

  /**
   * Handle transferring request - go through portal
   */
  private handleTransferringRequest(request: CrossShardTransferRequest): void {
    const creeps = request.assignedCreeps
      .map(name => Game.creeps[name])
      .filter(c => c !== undefined);

    // Check if creeps have gone through portal (they disappear from this shard)
    const creepsGone = creeps.length === 0;

    if (creepsGone) {
      // Assume successful transfer
      request.status = "complete";
      request.transferred = request.amount;
      shardManager.updateTaskProgress(request.taskId, 100, "complete");
      
      // Record successful portal traversal
      shardManager.recordPortalTraversal(request.portalRoom, request.targetShard, true);
      
      logger.info(`Transfer request ${request.taskId} completed`, {
        subsystem: "CrossShardTransfer"
      });
    }
  }

  /**
   * Clean up old completed/failed requests
   */
  private cleanupOldRequests(): void {
    const cleanupAge = 5000; // 5000 ticks
    
    for (const requestId in this.memory.requests) {
      const request = this.memory.requests[requestId];
      if (!request) continue;

      if (
        (request.status === "complete" || request.status === "failed") &&
        Game.time - this.memory.lastUpdate > cleanupAge
      ) {
        delete this.memory.requests[requestId];
      }
    }
  }

  /**
   * Get transfer request for a creep
   */
  public getCreepRequest(creepName: string): CrossShardTransferRequest | null {
    for (const requestId in this.memory.requests) {
      const request = this.memory.requests[requestId];
      if (request && request.assignedCreeps.includes(creepName)) {
        return request;
      }
    }
    return null;
  }

  /**
   * Assign creep to transfer request
   */
  public assignCreep(requestId: string, creepName: string): void {
    const request = this.memory.requests[requestId];
    if (request && !request.assignedCreeps.includes(creepName)) {
      request.assignedCreeps.push(creepName);
      logger.info(`Assigned creep ${creepName} to transfer request ${requestId}`, {
        subsystem: "CrossShardTransfer"
      });
    }
  }

  /**
   * Get all active transfer requests
   */
  public getActiveRequests(): CrossShardTransferRequest[] {
    return Object.values(this.memory.requests).filter(
      r => r.status !== "complete" && r.status !== "failed"
    );
  }

  /**
   * Get prioritized requests for spawning
   */
  public getPrioritizedRequests(): CrossShardTransferRequest[] {
    return this.getActiveRequests()
      .filter(r => r.status === "queued")
      .sort((a, b) => b.priority - a.priority);
  }
}

/**
 * Global resource transfer coordinator instance
 */
export const resourceTransferCoordinator = new ResourceTransferCoordinator();

// Extend Memory interface
declare global {
  interface Memory {
    crossShardTransfers?: TransferCoordinatorMemory;
  }
}
