/**
 * Spawn Queue Management
 *
 * Manages spawn queue with priority-based ordering:
 * - Emergency spawns (workforce collapse)
 * - High priority (defenders, critical economy roles)
 * - Normal priority (standard economy roles)
 * - Low priority (utility, expansion roles)
 *
 * Supports:
 * - Multi-spawn coordination (distributes tasks across available spawns)
 * - Priority preemption (higher priority spawns can interrupt lower priority)
 * - Emergency detection and fast-track spawning
 */

import type { CreepRole, RoleFamily, SwarmCreepMemory } from "./botTypes";
import type { BodyTemplate } from "./types";
import { logger } from "@ralphschuler/screeps-core";

/**
 * Spawn priority levels
 */
export enum SpawnPriority {
  /** Critical emergency spawns (workforce collapse, no energy producers) */
  EMERGENCY = 1000,
  /** High priority (defenders during attack, critical roles) */
  HIGH = 500,
  /** Normal priority (standard economy roles) */
  NORMAL = 100,
  /** Low priority (utility, expansion, optimization) */
  LOW = 50
}

/**
 * Spawn request entry in the queue
 */
export interface SpawnRequest {
  /** Unique ID for this request */
  id: string;
  /** Room where spawn should occur */
  roomName: string;
  /** Role to spawn */
  role: CreepRole;
  /** Role family */
  family: RoleFamily;
  /** Body template to use */
  body: BodyTemplate;
  /** Priority level */
  priority: number;
  /** Optional target room for remote roles */
  targetRoom?: string;
  /** Optional source ID for harvesters */
  sourceId?: Id<Source>;
  /** Optional boost requirements */
  boostRequirements?: {
    resourceType: ResourceConstant;
    bodyParts: BodyPartConstant[];
  }[];
  /** Game tick when request was created */
  createdAt: number;
  /** Optional: Specific spawn ID to use */
  spawnId?: Id<StructureSpawn>;
  /** Additional memory fields */
  additionalMemory?: Partial<SwarmCreepMemory>;
}

/**
 * Spawn queue state for a room
 */
export interface SpawnQueueState {
  /** Queue of pending spawn requests, sorted by priority */
  requests: SpawnRequest[];
  /** Spawns currently in progress */
  inProgress: Map<string, { spawnId: Id<StructureSpawn>; requestId: string }>;
  /** Last update tick */
  lastUpdate: number;
}

/**
 * Global spawn queue manager
 * Stores queues per room
 */
class SpawnQueueManager {
  private queues: Map<string, SpawnQueueState> = new Map();

  /**
   * Get or create spawn queue for a room
   */
  private getQueue(roomName: string): SpawnQueueState {
    if (!this.queues.has(roomName)) {
      this.queues.set(roomName, {
        requests: [],
        inProgress: new Map(),
        lastUpdate: Game.time
      });
    }
    return this.queues.get(roomName)!;
  }

  /**
   * Add a spawn request to the queue
   */
  addRequest(request: SpawnRequest): void {
    const queue = this.getQueue(request.roomName);

    // Assign unique ID if not provided
    if (!request.id) {
      request.id = `${request.role}_${Game.time}_${Math.random().toString(36).substring(2, 11)}`;
    }

    // Add to queue
    queue.requests.push(request);

    // Sort by priority (highest first)
    queue.requests.sort((a, b) => b.priority - a.priority);

    logger.debug(
      `Added spawn request: ${request.role} (priority: ${request.priority}) for room ${request.roomName}`,
      { subsystem: "SpawnQueue" }
    );
  }

  /**
   * Get next spawn request for a room
   * Returns the highest priority request that can be spawned
   */
  getNextRequest(roomName: string, availableEnergy: number): SpawnRequest | null {
    const queue = this.getQueue(roomName);

    // Clean up completed spawns
    this.cleanupInProgress(queue);

    // Find first request that fits energy budget
    for (let i = 0; i < queue.requests.length; i++) {
      const request = queue.requests[i];

      // Check if already in progress
      if (this.isRequestInProgress(queue, request.id)) {
        continue;
      }

      // Check energy requirement
      if (request.body.cost <= availableEnergy) {
        return request;
      }
    }

    return null;
  }

  /**
   * Remove a request from the queue
   */
  removeRequest(roomName: string, requestId: string): void {
    const queue = this.getQueue(roomName);
    queue.requests = queue.requests.filter(r => r.id !== requestId);
  }

  /**
   * Mark a request as in progress
   */
  markInProgress(roomName: string, requestId: string, spawnId: Id<StructureSpawn>): void {
    const queue = this.getQueue(roomName);
    queue.inProgress.set(requestId, { spawnId, requestId });
  }

  /**
   * Check if a request is currently being spawned
   */
  private isRequestInProgress(queue: SpawnQueueState, requestId: string): boolean {
    return queue.inProgress.has(requestId);
  }

  /**
   * Clean up completed spawn operations
   */
  private cleanupInProgress(queue: SpawnQueueState): void {
    // Remove completed spawns
    const toRemove: string[] = [];

    for (const [requestId, { spawnId }] of queue.inProgress) {
      const spawn = Game.getObjectById(spawnId);
      if (!spawn || !spawn.spawning) {
        toRemove.push(requestId);
      }
    }

    for (const requestId of toRemove) {
      queue.inProgress.delete(requestId);
    }
  }

  /**
   * Get all pending requests for a room
   */
  getPendingRequests(roomName: string): SpawnRequest[] {
    const queue = this.getQueue(roomName);
    return [...queue.requests];
  }

  /**
   * Get queue size for a room
   */
  getQueueSize(roomName: string): number {
    const queue = this.getQueue(roomName);
    return queue.requests.length;
  }

  /**
   * Clear all requests for a room
   */
  clearQueue(roomName: string): void {
    const queue = this.getQueue(roomName);
    queue.requests = [];
    logger.debug(`Cleared spawn queue for room ${roomName}`, { subsystem: "SpawnQueue" });
  }

  /**
   * Get available spawns in a room
   */
  getAvailableSpawns(roomName: string): StructureSpawn[] {
    const room = Game.rooms[roomName];
    if (!room) return [];

    const spawns = room.find(FIND_MY_SPAWNS);
    return spawns.filter(s => !s.spawning);
  }

  /**
   * Process spawn queue for a room
   * Attempts to spawn from queue using available spawns
   * Returns number of spawns initiated
   */
  processQueue(roomName: string): number {
    const room = Game.rooms[roomName];
    if (!room) return 0;

    const availableSpawns = this.getAvailableSpawns(roomName);
    if (availableSpawns.length === 0) return 0;

    const queue = this.getQueue(roomName);
    let spawnsInitiated = 0;

    // Try to spawn using each available spawn
    for (const spawn of availableSpawns) {
      const request = this.getNextRequest(roomName, room.energyAvailable);
      if (!request) break; // No more spawnable requests

      // Attempt to spawn
      const result = this.executeSpawn(spawn, request);
      if (result === OK) {
        spawnsInitiated++;
        this.markInProgress(roomName, request.id, spawn.id);
        this.removeRequest(roomName, request.id);
      } else if (result !== ERR_NOT_ENOUGH_ENERGY) {
        // If spawn failed for non-energy reason, remove from queue
        this.removeRequest(roomName, request.id);
        logger.warn(
          `Spawn request failed: ${request.role} in ${roomName} (error: ${result})`,
          { subsystem: "SpawnQueue" }
        );
      }
    }

    return spawnsInitiated;
  }

  /**
   * Execute a spawn request
   */
  private executeSpawn(spawn: StructureSpawn, request: SpawnRequest): ScreepsReturnCode {
    const name = this.generateCreepName(request.role);

    const memory: SwarmCreepMemory = {
      role: request.role,
      family: request.family,
      homeRoom: request.roomName,
      version: 1,
      ...request.additionalMemory
    };

    // Add optional fields
    if (request.targetRoom) {
      memory.targetRoom = request.targetRoom;
    }
    if (request.sourceId) {
      memory.sourceId = request.sourceId;
    }
    if (request.boostRequirements) {
      memory.boostRequirements = request.boostRequirements;
    }

    return spawn.spawnCreep(request.body.parts, name, {
      memory: memory as unknown as CreepMemory
    });
  }

  /**
   * Generate unique creep name
   */
  private generateCreepName(role: CreepRole): string {
    return `${role}_${Game.time}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Check if room has emergency spawns in queue
   */
  hasEmergencySpawns(roomName: string): boolean {
    const queue = this.getQueue(roomName);
    return queue.requests.some(r => r.priority >= SpawnPriority.EMERGENCY);
  }

  /**
   * Count spawns by priority level
   */
  countByPriority(roomName: string, priority: SpawnPriority): number {
    const queue = this.getQueue(roomName);
    return queue.requests.filter(r => r.priority >= priority).length;
  }

  /**
   * Get statistics about the spawn queue
   */
  getQueueStats(roomName: string): {
    total: number;
    emergency: number;
    high: number;
    normal: number;
    low: number;
    inProgress: number;
  } {
    const queue = this.getQueue(roomName);
    return {
      total: queue.requests.length,
      emergency: queue.requests.filter(r => r.priority >= SpawnPriority.EMERGENCY).length,
      high: queue.requests.filter(r => r.priority >= SpawnPriority.HIGH && r.priority < SpawnPriority.EMERGENCY).length,
      normal: queue.requests.filter(r => r.priority >= SpawnPriority.NORMAL && r.priority < SpawnPriority.HIGH).length,
      low: queue.requests.filter(r => r.priority < SpawnPriority.NORMAL).length,
      inProgress: queue.inProgress.size
    };
  }
}

// Export singleton instance
export const spawnQueue = new SpawnQueueManager();
