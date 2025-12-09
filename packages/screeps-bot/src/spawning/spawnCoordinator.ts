/**
 * Spawn Coordinator
 *
 * High-level spawn coordination that integrates:
 * - Spawn queue management
 * - Body optimization
 * - Multi-spawn coordination
 * - Emergency priority handling
 * - Boost integration
 *
 * This module bridges the existing spawn.ts logic with the new
 * spawn queue and body optimizer systems.
 */

import type { SwarmState } from "../memory/schemas";
import { spawnQueue, SpawnPriority, type SpawnRequest } from "./spawnQueue";
import { optimizeBody } from "./bodyOptimizer";
import { 
  determineNextRole, 
  ROLE_DEFINITIONS, 
  countCreepsByRole,
  isEmergencySpawnState,
  getRemoteRoomNeedingWorkers,
  type BodyTemplate
} from "../logic/spawn";
import { logger } from "../core/logger";

/**
 * Populate spawn queue for a room
 * Analyzes room needs and adds spawn requests to the queue
 */
export function populateSpawnQueue(room: Room, swarm: SwarmState): void {
  // Skip if queue already has requests (avoid duplicate analysis)
  const queueSize = spawnQueue.getQueueSize(room.name);
  if (queueSize > 0) {
    return;
  }

  const counts = countCreepsByRole(room.name);
  const isEmergency = isEmergencySpawnState(room.name);

  // Determine what roles are needed
  for (const [roleName, def] of Object.entries(ROLE_DEFINITIONS)) {
    const current = counts.get(roleName) ?? 0;
    
    // Check if we need more of this role
    if (current >= def.maxPerRoom) {
      continue;
    }

    // Calculate priority
    let priority = def.priority;

    // Emergency boost for critical economy roles
    if (isEmergency && (roleName === "larvaWorker" || roleName === "harvester")) {
      priority = SpawnPriority.EMERGENCY;
    } else {
      // Map base priorities to queue priorities
      if (priority >= 90) {
        priority = SpawnPriority.HIGH;
      } else if (priority >= 60) {
        priority = SpawnPriority.NORMAL;
      } else {
        priority = SpawnPriority.LOW;
      }
    }

    // Create spawn request with optimized body
    const maxEnergy = room.energyCapacityAvailable;
    let body: BodyTemplate;

    try {
      body = optimizeBody({
        maxEnergy,
        role: roleName
      });
    } catch (error) {
      logger.error(`Failed to optimize body for ${roleName}: ${error}`, {
        subsystem: "SpawnCoordinator"
      });
      continue;
    }

    // Add request to queue
    const request: SpawnRequest = {
      id: `${roleName}_${Game.time}_${Math.random().toString(36).substring(2, 11)}`,
      roomName: room.name,
      role: def.role,
      family: def.family,
      body,
      priority,
      createdAt: Game.time
    };

    // Add target room for remote roles
    if (roleName === "remoteHarvester" || roleName === "remoteHauler") {
      const targetRoom = getRemoteRoomNeedingWorkers(room.name, roleName, swarm);
      if (targetRoom) {
        request.targetRoom = targetRoom;
      }
    }

    spawnQueue.addRequest(request);
  }

  const stats = spawnQueue.getQueueStats(room.name);
  logger.debug(
    `Populated spawn queue for ${room.name}: ${stats.total} requests (E:${stats.emergency}, H:${stats.high}, N:${stats.normal}, L:${stats.low})`,
    { subsystem: "SpawnCoordinator" }
  );
}

/**
 * Process spawns for a room using the spawn queue
 * Uses all available spawns to process queue
 */
export function processSpawnQueue(room: Room): number {
  const availableSpawns = spawnQueue.getAvailableSpawns(room.name);
  if (availableSpawns.length === 0) {
    return 0;
  }

  const energyAvailable = room.energyAvailable;
  let spawnsInitiated = 0;

  // Try to spawn with each available spawn
  for (const spawn of availableSpawns) {
    const request = spawnQueue.getNextRequest(room.name, energyAvailable);
    if (!request) {
      break; // No more affordable requests
    }

    // Attempt spawn
    const result = spawn.spawnCreep(request.body.parts, generateCreepName(request.role), {
      memory: {
        role: request.role,
        family: request.family,
        homeRoom: request.roomName,
        targetRoom: request.targetRoom,
        version: 1
      } as any
    });

    if (result === OK) {
      spawnsInitiated++;
      spawnQueue.markInProgress(room.name, request.id, spawn.id);
      spawnQueue.removeRequest(room.name, request.id);

      logger.info(
        `Spawned ${request.role} in ${room.name} (priority: ${request.priority}, cost: ${request.body.cost})`,
        { subsystem: "SpawnCoordinator" }
      );
    } else if (result !== ERR_NOT_ENOUGH_ENERGY) {
      // Failed for non-energy reason, remove from queue
      spawnQueue.removeRequest(room.name, request.id);
      logger.warn(
        `Spawn failed for ${request.role} in ${room.name}: ${result}`,
        { subsystem: "SpawnCoordinator" }
      );
    }
    // If ERR_NOT_ENOUGH_ENERGY, leave in queue to try later
  }

  return spawnsInitiated;
}

/**
 * Generate unique creep name
 */
function generateCreepName(role: string): string {
  return `${role}_${Game.time}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * Coordinate spawning for a room
 * Main entry point that combines queue management and processing
 */
export function coordinateSpawning(room: Room, swarm: SwarmState): void {
  // First, populate queue if empty
  populateSpawnQueue(room, swarm);

  // Then process the queue
  const spawned = processSpawnQueue(room);

  if (spawned > 0) {
    logger.debug(
      `Spawned ${spawned} creeps in ${room.name}`,
      { subsystem: "SpawnCoordinator" }
    );
  }

  // Log queue statistics periodically
  if (Game.time % 100 === 0) {
    const stats = spawnQueue.getQueueStats(room.name);
    logger.debug(
      `Spawn queue stats for ${room.name}: ${stats.total} pending (${stats.inProgress} in progress)`,
      { subsystem: "SpawnCoordinator" }
    );
  }
}

/**
 * Check if room needs emergency spawns
 */
export function needsEmergencySpawn(room: Room): boolean {
  return isEmergencySpawnState(room.name) || spawnQueue.hasEmergencySpawns(room.name);
}

/**
 * Get spawn queue status for a room
 */
export function getSpawnQueueStatus(roomName: string): {
  queueSize: number;
  hasEmergency: boolean;
  stats: ReturnType<typeof spawnQueue.getQueueStats>;
} {
  return {
    queueSize: spawnQueue.getQueueSize(roomName),
    hasEmergency: spawnQueue.hasEmergencySpawns(roomName),
    stats: spawnQueue.getQueueStats(roomName)
  };
}
