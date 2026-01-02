/**
 * Cross-Shard Carrier Role
 *
 * Specialized carrier for moving resources between shards via portals.
 * Implements portal navigation for cross-shard logistics.
 *
 * Behavior:
 * 1. Gather resources from source room (terminal/storage)
 * 2. Move to portal room
 * 3. Enter portal to target shard
 * 4. (On target shard) Move to target room
 * 5. Deliver resources to terminal/storage
 */

import type { CrossShardTransferRequest } from "./intershard/resourceTransferCoordinator";
import { logger } from "./core/logger";
import { resourceTransferCoordinator } from "./intershard/resourceTransferCoordinator";
import { cachedMoveTo } from "./utils/movement";

/**
 * Cross-shard carrier memory
 */
interface CrossShardCarrierMemory extends CreepMemory {
  role: "crossShardCarrier";
  transferRequestId?: string;
  workflowState?: "gathering" | "movingToPortal" | "enteringPortal" | "delivering";
  sourceRoom?: string;
  portalRoom?: string;
  targetShard?: string;
  targetRoom?: string;
  resourceType?: ResourceConstant;
}

/**
 * Run cross-shard carrier logic
 */
export function runCrossShardCarrier(creep: Creep): void {
  const memory = creep.memory as CrossShardCarrierMemory;

  // Initialize state if needed
  if (!memory.workflowState) {
    memory.workflowState = "gathering";
  }

  // Get transfer request
  let request: CrossShardTransferRequest | null = null;
  if (memory.transferRequestId) {
    request = resourceTransferCoordinator.getCreepRequest(creep.name);
  }

  // If no request, try to get one
  if (!request) {
    const requests = resourceTransferCoordinator.getPrioritizedRequests();
    if (requests.length > 0) {
      request = requests[0];
      if (request) {
        resourceTransferCoordinator.assignCreep(request.taskId, creep.name);
        memory.transferRequestId = request.taskId;
        memory.sourceRoom = request.sourceRoom;
        memory.portalRoom = request.portalRoom;
        memory.targetShard = request.targetShard;
        memory.targetRoom = request.targetRoom;
        memory.resourceType = request.resourceType;
        memory.workflowState = "gathering";
      }
    }
  }

  // If still no request, idle
  if (!request) {
    // Move to park position or recycle
    if (creep.ticksToLive && creep.ticksToLive < 100) {
      recycleSelf(creep);
    }
    return;
  }

  // Execute state machine
  switch (memory.workflowState) {
    case "gathering":
      handleGathering(creep, memory, request);
      break;
    case "movingToPortal":
      handleMovingToPortal(creep, memory, request);
      break;
    case "enteringPortal":
      handleEnteringPortal(creep, memory, request);
      break;
    case "delivering":
      handleDelivering(creep, memory, request);
      break;
  }
}

/**
 * Handle gathering state - collect resources from source
 */
function handleGathering(
  creep: Creep,
  memory: CrossShardCarrierMemory,
  request: CrossShardTransferRequest
): void {
  const sourceRoom = memory.sourceRoom;
  if (!sourceRoom) {
    logger.warn(`CrossShardCarrier ${creep.name} has no source room`, {
      subsystem: "CrossShardCarrier"
    });
    return;
  }

  // Move to source room if not there
  if (creep.room.name !== sourceRoom) {
    cachedMoveTo(creep, new RoomPosition(25, 25, sourceRoom), {
      cacheTtl: 100,
      visualizePathStyle: { stroke: "#ffaa00" }
    });
    return;
  }

  // Try to withdraw from terminal first, then storage
  const terminal = creep.room.terminal;
  const storage = creep.room.storage;

  if (creep.store.getFreeCapacity() === 0) {
    memory.workflowState = "movingToPortal";
    logger.info(`CrossShardCarrier ${creep.name} gathered resources, moving to portal`, {
      subsystem: "CrossShardCarrier"
    });
    return;
  }

  if (terminal && terminal.store.getUsedCapacity(request.resourceType) > 0) {
    const result = creep.withdraw(terminal, request.resourceType);
    if (result === ERR_NOT_IN_RANGE) {
      cachedMoveTo(creep, terminal, { cacheTtl: 50 });
    }
  } else if (storage && storage.store.getUsedCapacity(request.resourceType) > 0) {
    const result = creep.withdraw(storage, request.resourceType);
    if (result === ERR_NOT_IN_RANGE) {
      cachedMoveTo(creep, storage, { cacheTtl: 50 });
    }
  } else {
    logger.warn(
      `CrossShardCarrier ${creep.name} cannot find ${request.resourceType} in ${sourceRoom}`,
      { subsystem: "CrossShardCarrier" }
    );
  }
}

/**
 * Handle moving to portal state
 */
function handleMovingToPortal(
  creep: Creep,
  memory: CrossShardCarrierMemory,
  _request: CrossShardTransferRequest
): void {
  const portalRoom = memory.portalRoom;
  if (!portalRoom) {
    logger.warn(`CrossShardCarrier ${creep.name} has no portal room`, {
      subsystem: "CrossShardCarrier"
    });
    return;
  }

  // Check if already in portal room
  if (creep.room.name === portalRoom) {
    memory.workflowState = "enteringPortal";
    return;
  }

  // Move to portal room
  cachedMoveTo(creep, new RoomPosition(25, 25, portalRoom), {
    cacheTtl: 100,
    visualizePathStyle: { stroke: "#00ffaa" }
  });
}

/**
 * Handle entering portal state
 */
function handleEnteringPortal(
  creep: Creep,
  memory: CrossShardCarrierMemory,
  request: CrossShardTransferRequest
): void {
  // Find portal in room
  const structures = creep.room.find(FIND_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_PORTAL
  });
  const portals = structures as StructurePortal[];

  // Find portal leading to target shard
  const targetPortal = portals.find(p => {
    const dest = p.destination;
    return dest && "shard" in dest && dest.shard === request.targetShard;
  });

  if (!targetPortal) {
    logger.warn(
      `CrossShardCarrier ${creep.name} cannot find portal to ${request.targetShard} in ${creep.room.name}`,
      { subsystem: "CrossShardCarrier" }
    );
    return;
  }

  // Move to portal
  cachedMoveTo(creep, targetPortal, { cacheTtl: 20 });

  // Check if we're adjacent to portal (about to enter)
  if (creep.pos.isNearTo(targetPortal)) {
    logger.info(
      `CrossShardCarrier ${creep.name} entering portal to ${request.targetShard}`,
      { subsystem: "CrossShardCarrier" }
    );
  }

  // Note: Once creep enters portal, it will appear on the target shard
  // and this code won't run anymore on this shard
}

/**
 * Handle delivering state (runs on target shard)
 */
function handleDelivering(
  creep: Creep,
  memory: CrossShardCarrierMemory,
  _request: CrossShardTransferRequest
): void {
  const targetRoom = memory.targetRoom;
  if (!targetRoom) {
    logger.warn(`CrossShardCarrier ${creep.name} has no target room`, {
      subsystem: "CrossShardCarrier"
    });
    return;
  }

  // Move to target room if not there
  if (creep.room.name !== targetRoom) {
    cachedMoveTo(creep, new RoomPosition(25, 25, targetRoom), {
      cacheTtl: 100,
      visualizePathStyle: { stroke: "#0000ff" }
    });
    return;
  }

  // Deliver to terminal or storage
  const terminal = creep.room.terminal;
  const storage = creep.room.storage;

  if (creep.store.getUsedCapacity() === 0) {
    // Delivery complete, recycle or suicide
    logger.info(`CrossShardCarrier ${creep.name} completed delivery on ${Game.shard?.name}`, {
      subsystem: "CrossShardCarrier"
    });
    recycleSelf(creep);
    return;
  }

  // Try to deliver to terminal first, then storage
  if (terminal) {
    const resourceType = Object.keys(creep.store)[0] as ResourceConstant;
    const result = creep.transfer(terminal, resourceType);
    if (result === ERR_NOT_IN_RANGE) {
      cachedMoveTo(creep, terminal, { cacheTtl: 50 });
    }
  } else if (storage) {
    const resourceType = Object.keys(creep.store)[0] as ResourceConstant;
    const result = creep.transfer(storage, resourceType);
    if (result === ERR_NOT_IN_RANGE) {
      cachedMoveTo(creep, storage, { cacheTtl: 50 });
    }
  }
}

/**
 * Recycle creep at nearest spawn
 */
function recycleSelf(creep: Creep): void {
  const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
  if (spawn) {
    if (creep.pos.isNearTo(spawn)) {
      spawn.recycleCreep(creep);
    } else {
      cachedMoveTo(creep, spawn, { cacheTtl: 50 });
    }
  } else {
    creep.suicide();
  }
}

/**
 * Detect if carrier has crossed to target shard
 * (Called when creep appears on new shard)
 */
export function handleCrossShardArrival(creep: Creep): void {
  const memory = creep.memory as CrossShardCarrierMemory;
  
  // If creep has a transfer request and is on the target shard, switch to delivering
  // Only transition if not already in a final state
  if (
    memory.targetShard === Game.shard?.name &&
    memory.workflowState !== "delivering" &&
    creep.store.getUsedCapacity() > 0
  ) {
    memory.workflowState = "delivering";
    logger.info(
      `CrossShardCarrier ${creep.name} arrived on target shard ${Game.shard?.name}`,
      { subsystem: "CrossShardCarrier" }
    );
  }
}
