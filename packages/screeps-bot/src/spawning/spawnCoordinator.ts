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
import { SpawnPriority, type SpawnRequest, spawnQueue } from "./spawnQueue";
import { optimizeBody } from "./bodyOptimizer";
import { 
  type BodyTemplate, 
  ROLE_DEFINITIONS, 
  countCreepsByRole,
  determineNextRole,
  getRemoteRoomNeedingWorkers,
  isEmergencySpawnState
} from "../logic/spawn";
import { logger } from "../core/logger";
import { 
  analyzeDefenderNeeds, 
  getCurrentDefenders, 
  getDefenderPriorityBoost 
} from "./defenderManager";
import { emergencyResponseManager } from "../defense/emergencyResponse";
import { powerBankHarvestingManager } from "../empire/powerBankHarvesting";

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

  // Check if we need emergency defenders
  const defenderNeeds = analyzeDefenderNeeds(room);
  const currentDefenders = getCurrentDefenders(room);
  const emergencyState = emergencyResponseManager.getEmergencyState(room.name);

  // Add defender requests first if there's a threat
  if (defenderNeeds.guards > 0 || defenderNeeds.rangers > 0 || defenderNeeds.healers > 0) {
    addDefenderRequests(room, swarm, defenderNeeds, currentDefenders);
  }

  // Add power bank operation requests
  addPowerBankRequests(room);

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
    } else if (emergencyState && (roleName === "guard" || roleName === "ranger" || roleName === "healer")) {
      // Boost defender priority during emergencies
      // getDefenderPriorityBoost returns a numeric boost (e.g., 100 * urgency)
      // We need to check if we actually need this defender role
      const boost = getDefenderPriorityBoost(room, swarm, roleName);
      if (boost >= 100) {
        // High urgency (urgency >= 1.0), use EMERGENCY priority
        priority = SpawnPriority.EMERGENCY;
      } else if (boost > 0) {
        // Some urgency, use HIGH priority
        priority = SpawnPriority.HIGH;
      }
      // else keep original priority
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
 * Add defender spawn requests to queue
 */
function addDefenderRequests(
  room: Room,
  swarm: SwarmState,
  needs: ReturnType<typeof analyzeDefenderNeeds>,
  current: ReturnType<typeof getCurrentDefenders>
): void {
  const maxEnergy = room.energyCapacityAvailable;
  const emergencyEnergy = room.energyAvailable;

  // Determine priority based on urgency
  let priority = SpawnPriority.HIGH;
  if (needs.urgency >= 2.0) {
    priority = SpawnPriority.EMERGENCY;
  }

  // Add guard requests
  const guardsNeeded = Math.max(0, needs.guards - current.guards);
  for (let i = 0; i < guardsNeeded; i++) {
    try {
      // Use emergency energy if priority is emergency, otherwise use max capacity
      const energyToUse = priority === SpawnPriority.EMERGENCY ? emergencyEnergy : maxEnergy;
      const body = optimizeBody({
        maxEnergy: energyToUse,
        role: "guard"
      });

      const request: SpawnRequest = {
        id: `guard_defense_${Game.time}_${i}`,
        roomName: room.name,
        role: "guard",
        family: "military",
        body,
        priority,
        createdAt: Game.time
      };

      spawnQueue.addRequest(request);
    } catch (error) {
      logger.error(`Failed to create guard spawn request: ${error}`, {
        subsystem: "SpawnCoordinator"
      });
    }
  }

  // Add ranger requests
  const rangersNeeded = Math.max(0, needs.rangers - current.rangers);
  for (let i = 0; i < rangersNeeded; i++) {
    try {
      const energyToUse = priority === SpawnPriority.EMERGENCY ? emergencyEnergy : maxEnergy;
      const body = optimizeBody({
        maxEnergy: energyToUse,
        role: "ranger"
      });

      const request: SpawnRequest = {
        id: `ranger_defense_${Game.time}_${i}`,
        roomName: room.name,
        role: "ranger",
        family: "military",
        body,
        priority,
        createdAt: Game.time
      };

      spawnQueue.addRequest(request);
    } catch (error) {
      logger.error(`Failed to create ranger spawn request: ${error}`, {
        subsystem: "SpawnCoordinator"
      });
    }
  }

  // Add healer requests (lower priority)
  const healersNeeded = Math.max(0, needs.healers - current.healers);
  if (healersNeeded > 0 && needs.urgency >= 1.5) {
    for (let i = 0; i < healersNeeded; i++) {
      try {
        const body = optimizeBody({
          maxEnergy,
          role: "healer"
        });

        const request: SpawnRequest = {
          id: `healer_defense_${Game.time}_${i}`,
          roomName: room.name,
          role: "healer",
          family: "military",
          body,
          priority: SpawnPriority.HIGH,
          createdAt: Game.time
        };

        spawnQueue.addRequest(request);
      } catch (error) {
        logger.error(`Failed to create healer spawn request: ${error}`, {
          subsystem: "SpawnCoordinator"
        });
      }
    }
  }

  if (guardsNeeded > 0 || rangersNeeded > 0 || healersNeeded > 0) {
    logger.info(
      `Added defender spawn requests: ${guardsNeeded} guards, ${rangersNeeded} rangers, ${healersNeeded} healers (priority: ${priority})`,
      { subsystem: "SpawnCoordinator" }
    );
  }
}

/**
 * Add power bank operation spawn requests to queue
 */
function addPowerBankRequests(room: Room): void {
  const requests = powerBankHarvestingManager.requestSpawns(room.name);
  
  if (requests.powerHarvesters === 0 && requests.healers === 0 && requests.powerCarriers === 0) {
    return;
  }

  const maxEnergy = room.energyCapacityAvailable;
  const priority = SpawnPriority.NORMAL; // Medium priority for power bank ops

  // Add power harvester requests
  for (let i = 0; i < requests.powerHarvesters; i++) {
    try {
      const body = optimizeBody({
        maxEnergy,
        role: "powerHarvester"
      });

      const request: SpawnRequest = {
        id: `powerHarvester_${Game.time}_${i}`,
        roomName: room.name,
        role: "powerHarvester",
        family: "power",
        body,
        priority,
        createdAt: Game.time
      };

      spawnQueue.addRequest(request);
    } catch (error) {
      logger.error(`Failed to create power harvester spawn request: ${error}`, {
        subsystem: "SpawnCoordinator"
      });
    }
  }

  // Add healer requests for power bank support
  for (let i = 0; i < requests.healers; i++) {
    try {
      const body = optimizeBody({
        maxEnergy,
        role: "healer"
      });

      const request: SpawnRequest = {
        id: `healer_powerBank_${Game.time}_${i}`,
        roomName: room.name,
        role: "healer",
        family: "military",
        body,
        priority,
        createdAt: Game.time
      };

      spawnQueue.addRequest(request);
    } catch (error) {
      logger.error(`Failed to create power bank healer spawn request: ${error}`, {
        subsystem: "SpawnCoordinator"
      });
    }
  }

  // Add power carrier requests
  for (let i = 0; i < requests.powerCarriers; i++) {
    try {
      const body = optimizeBody({
        maxEnergy,
        role: "powerCarrier"
      });

      const request: SpawnRequest = {
        id: `powerCarrier_${Game.time}_${i}`,
        roomName: room.name,
        role: "powerCarrier",
        family: "power",
        body,
        priority,
        createdAt: Game.time
      };

      spawnQueue.addRequest(request);
    } catch (error) {
      logger.error(`Failed to create power carrier spawn request: ${error}`, {
        subsystem: "SpawnCoordinator"
      });
    }
  }

  if (requests.powerHarvesters > 0 || requests.healers > 0 || requests.powerCarriers > 0) {
    logger.info(
      `Added power bank spawn requests: ${requests.powerHarvesters} harvesters, ${requests.healers} healers, ${requests.powerCarriers} carriers`,
      { subsystem: "SpawnCoordinator" }
    );
  }
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
