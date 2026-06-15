/**
 * Military Resource Pooling - Cluster-wide Military Resource Coordination
 *
 * Manages resource pooling for military operations:
 * - Energy reservation for emergency military spawning
 * - Boost material coordination across cluster
 * - Military supply tracking and allocation
 * - Priority resource routing to rooms under attack
 *
 * Addresses Issue: #36 - Resource coordination for military operations
 */

import { logger } from "@ralphschuler/screeps-core";
import type { ClusterMemory } from "./types";
import { memoryManager } from "./adapters/memoryAdapter";
import { planEmergencyEnergyRoute, planMilitaryBoostAllocation } from "./militaryResourcePoolingIntent";

/**
 * Military resource reservation per room
 */
export interface MilitaryResourceReservation {
  roomName: string;
  energyReserved: number;
  boostMaterials: Partial<Record<ResourceConstant, number>>;
  priority: number;
  lastUpdate: number;
}

/**
 * Boost material requirements based on operation type
 */
const BOOST_REQUIREMENTS: Record<string, Partial<Record<ResourceConstant, number>>> = {
  defense: {
    [RESOURCE_CATALYZED_GHODIUM_ALKALIDE]: 300, // Tough boost
    [RESOURCE_CATALYZED_UTRIUM_ACID]: 300, // Attack boost
    [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]: 300 // Heal boost
  },
  raid: {
    [RESOURCE_CATALYZED_GHODIUM_ALKALIDE]: 600,
    [RESOURCE_CATALYZED_UTRIUM_ACID]: 600,
    [RESOURCE_CATALYZED_KEANIUM_ALKALIDE]: 300, // Ranged boost
    [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]: 600
  },
  siege: {
    [RESOURCE_CATALYZED_GHODIUM_ALKALIDE]: 900,
    [RESOURCE_CATALYZED_UTRIUM_ACID]: 600,
    [RESOURCE_CATALYZED_ZYNTHIUM_ACID]: 900, // Dismantle boost
    [RESOURCE_CATALYZED_KEANIUM_ALKALIDE]: 600,
    [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]: 900
  }
};

/**
 * Minimum energy to reserve for emergency military spawning per threat level
 */
const EMERGENCY_ENERGY_RESERVE = {
  0: 0, // No threat
  1: 5000, // Low threat - 1 defender
  2: 15000, // Medium threat - small squad
  3: 50000 // High threat - large squad
};

/**
 * Calculate energy reservation needed for a room based on threat
 */
export function calculateEnergyReservation(roomName: string, dangerLevel: 0 | 1 | 2 | 3): number {
  // Base reservation on danger level
  let reservation = EMERGENCY_ENERGY_RESERVE[dangerLevel];

  // Increase reservation if room has active defense requests
  const clusters = memoryManager.getClusters();
  for (const clusterId in clusters) {
    const cluster = clusters[clusterId];
    const hasDefenseRequest = cluster.defenseRequests.some(req => req.roomName === roomName && req.urgency >= 2);

    if (hasDefenseRequest) {
      reservation += 10000; // Additional reserve for active defense
    }
  }

  return reservation;
}

/**
 * Calculate boost material needs for a squad
 */
export function calculateBoostNeeds(
  squadType: "defense" | "harass" | "raid" | "siege",
  memberCount: number
): Partial<Record<ResourceConstant, number>> {
  const baseRequirements = BOOST_REQUIREMENTS[squadType] ?? {};
  const needs: Partial<Record<ResourceConstant, number>> = {};

  // Scale requirements based on squad size
  const scaleFactor = Math.max(1, Math.floor(memberCount / 3));

  for (const resource in baseRequirements) {
    const amount = baseRequirements[resource as ResourceConstant];
    if (amount) {
      needs[resource as ResourceConstant] = amount * scaleFactor;
    }
  }

  return needs;
}

/**
 * Get available boost materials in cluster
 */
export function getAvailableBoostMaterials(cluster: ClusterMemory): Partial<Record<ResourceConstant, number>> {
  const available: Partial<Record<ResourceConstant, number>> = {};

  for (const roomName of cluster.memberRooms) {
    const room = Game.rooms[roomName];
    if (!room || !room.terminal) continue;

    // Check terminal for boost materials
    for (const resource in BOOST_REQUIREMENTS.siege) {
      const amount = room.terminal.store.getUsedCapacity(resource as ResourceConstant);
      if (amount > 0) {
        const current = available[resource as ResourceConstant] ?? 0;
        available[resource as ResourceConstant] = current + amount;
      }
    }

    // Check storage for boost materials
    if (room.storage) {
      for (const resource in BOOST_REQUIREMENTS.siege) {
        const amount = room.storage.store.getUsedCapacity(resource as ResourceConstant);
        if (amount > 0) {
          const current = available[resource as ResourceConstant] ?? 0;
          available[resource as ResourceConstant] = current + amount;
        }
      }
    }
  }

  return available;
}

/**
 * Allocate boost materials for a squad
 */
export function allocateBoostMaterials(
  cluster: ClusterMemory,
  squadId: string,
  needs: Partial<Record<ResourceConstant, number>>
): { success: boolean; allocated: string[] } {
  const intent = planMilitaryBoostAllocation({ squadId, needs, available: getAvailableBoostMaterials(cluster) });

  if (!intent.success) {
    for (const missing of intent.missing) {
      logger.warn(
        `Insufficient boost material ${missing.resourceType} for squad ${squadId}: need ${missing.needed}, have ${missing.available}`,
        { subsystem: "MilitaryPool" }
      );
    }
    return { success: false, allocated: [] };
  }

  logger.info(`Allocated boost materials for squad ${squadId}: ${intent.allocated.join(", ")}`, {
    subsystem: "MilitaryPool"
  });

  return { success: true, allocated: intent.allocated };
}

/**
 * Route emergency energy to a room under attack
 */
export function routeEmergencyEnergy(
  cluster: ClusterMemory,
  targetRoom: string,
  amount: number
): { success: boolean; sourceRoom?: string } {
  if (amount <= 0) {
    return { success: false };
  }

  const sources = cluster.memberRooms.flatMap(roomName => {
    const room = Game.rooms[roomName];
    const swarm = memoryManager.getSwarmState(roomName);
    if (!room || !swarm) return [];

    const storageEnergy = room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0;
    const terminalEnergy = room.terminal?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0;

    return [
      {
        roomName,
        availableEnergy: storageEnergy + terminalEnergy,
        reservedEnergy: calculateEnergyReservation(roomName, swarm.danger),
        hasTerminal: Boolean(room.terminal),
        terminalEnergy
      }
    ];
  });

  const routeIntent = planEmergencyEnergyRoute({
    targetRoom,
    amount,
    targetHasTerminal: Boolean(Game.rooms[targetRoom]?.terminal),
    sources,
    distance: (fromRoom, toRoom) => {
      const roomMap = (Game as any).map;
      if (typeof roomMap?.getRoomLinearDistance === "function") {
        return roomMap.getRoomLinearDistance(fromRoom, toRoom);
      }

      return 0;
    }
  });

  if (!routeIntent.success) {
    logger.warn(`No available energy source for emergency routing to ${targetRoom} (need ${amount})`, {
      subsystem: "MilitaryPool"
    });
    return { success: false };
  }

  const bestSource = routeIntent.sourceRoom;
  const sourceRoom = Game.rooms[bestSource];
  const targetRoomObj = Game.rooms[targetRoom];

  const existingOutstanding = cluster.resourceRequests
    .filter(
      req =>
        req.toRoom === targetRoom &&
        req.fromRoom === bestSource &&
        req.resourceType === RESOURCE_ENERGY &&
        req.delivered < req.amount
    )
    .reduce((sum, req) => sum + (req.amount - req.delivered), 0);

  const requestAmount = amount - existingOutstanding;

  if (requestAmount <= 0) {
    logger.debug(`Emergency transfer already queued for ${amount} energy from ${bestSource} to ${targetRoom}`, {
      subsystem: "MilitaryPool"
    });
    return { success: true, sourceRoom: bestSource };
  }

  if (routeIntent.delivery === "terminal" && sourceRoom?.terminal && targetRoomObj?.terminal) {
    // Terminal transfer
    const result = sourceRoom.terminal.send(RESOURCE_ENERGY, requestAmount, targetRoom);
    if (result === OK) {
      logger.info(`Emergency energy routed: ${requestAmount} from ${bestSource} to ${targetRoom}`, {
        subsystem: "MilitaryPool"
      });
      return { success: true, sourceRoom: bestSource };
    }

    logger.warn(`Failed emergency terminal transfer ${requestAmount} energy from ${bestSource} to ${targetRoom}: ${result}`, {
      subsystem: "MilitaryPool"
    });
  } else {
    // Create hauler transfer request
    logger.info(`Creating hauler transfer request: ${requestAmount} energy from ${bestSource} to ${targetRoom}`, {
      subsystem: "MilitaryPool"
    });

    // Add to resource requests (will be handled by resource sharing manager)
    cluster.resourceRequests.push({
      toRoom: targetRoom,
      fromRoom: bestSource,
      resourceType: RESOURCE_ENERGY,
      amount: requestAmount,
      priority: 5, // Highest priority
      createdAt: Game.time,
      assignedCreeps: [],
      delivered: 0
    });

    return { success: true, sourceRoom: bestSource };
  }

  return { success: false };
}

/**
 * Update military resource reservations for all rooms in cluster
 */
export function updateMilitaryReservations(cluster: ClusterMemory): void {
  for (const roomName of cluster.memberRooms) {
    const swarm = memoryManager.getSwarmState(roomName);
    if (!swarm) continue;

    const reservation = calculateEnergyReservation(roomName, swarm.danger);

    // Log significant reservations
    if (reservation > 0 && Game.time % 100 === 0) {
      logger.debug(`Military energy reservation for ${roomName}: ${reservation} (danger ${swarm.danger})`, {
        subsystem: "MilitaryPool"
      });
    }
  }
}

/**
 * Check if room has sufficient energy for military operations
 */
export function hasSufficientMilitaryEnergy(roomName: string, requiredAmount: number): boolean {
  const room = Game.rooms[roomName];
  if (!room) return false;

  const swarm = memoryManager.getSwarmState(roomName);
  if (!swarm) return false;

  const storageEnergy = room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0;
  const terminalEnergy = room.terminal?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0;
  const available = storageEnergy + terminalEnergy;
  const reserved = calculateEnergyReservation(roomName, swarm.danger);
  const excess = available - reserved;

  return excess >= requiredAmount;
}

/**
 * Get cluster-wide military resource summary
 */
export function getMilitaryResourceSummary(cluster: ClusterMemory): {
  totalEnergy: number;
  reservedEnergy: number;
  availableEnergy: number;
  boostMaterials: Partial<Record<ResourceConstant, number>>;
} {
  let totalEnergy = 0;
  let reservedEnergy = 0;

  for (const roomName of cluster.memberRooms) {
    const room = Game.rooms[roomName];
    if (!room) continue;

    const storageEnergy = room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0;
    const terminalEnergy = room.terminal?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0;

    totalEnergy += storageEnergy + terminalEnergy;


    const swarm = memoryManager.getSwarmState(roomName);
    if (swarm) {
      reservedEnergy += calculateEnergyReservation(roomName, swarm.danger);
    }
  }

  const boostMaterials = getAvailableBoostMaterials(cluster);

  return {
    totalEnergy,
    reservedEnergy,
    availableEnergy: Math.max(0, totalEnergy - reservedEnergy),
    boostMaterials
  };
}
