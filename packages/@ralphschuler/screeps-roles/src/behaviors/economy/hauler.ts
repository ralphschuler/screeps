/**
 * Hauler Behavior
 * 
 * Transport resources from various sources to appropriate destinations.
 * - Energy: harvesters → spawns/extensions/towers/storage
 * - Minerals: tombstones/dropped → terminal/storage
 * - Comprehensively empties tombstones to recover all resources
 * Uses cached target finding to reduce CPU usage.
 */

import type { CreepAction, CreepContext } from "../types";
import { findDistributedTarget, registerAssignment } from "@ralphschuler/screeps-utils";
import { findCachedClosest } from "../../cache";
import { updateWorkingState, switchToCollectionMode } from "./common/stateManagement";
import { createLogger } from "@ralphschuler/screeps-core";
import { taskBoard, type TaskType } from "../../tasks";
import { hasTaskBoardCriticalEnergyDelivery } from "./common/energyManagement";
import { getTerminalEnergyExportRequest } from "../../tasks/energyExport";
import {
  MATURE_ROOM_STORAGE_RESERVE_ENERGY,
  MATURE_ROOM_TERMINAL_RESERVE_ENERGY
} from "@ralphschuler/screeps-economy/reserves";

const logger = createLogger("HaulerBehavior");

const TERMINAL_ENERGY_TARGET = MATURE_ROOM_TERMINAL_RESERVE_ENERGY;
const STORAGE_ENERGY_RESERVE = MATURE_ROOM_STORAGE_RESERVE_ENERGY;
const MINERAL_STORAGE_BUFFER = 5000;
const TERMINAL_MINERAL_TARGET = 10000;
const HAULER_DISTRIBUTED_TARGET_CACHE_TTL = 5;
const DEFENSE_REFUEL_TASK = "defenseRefuel";
const DEFENSE_REFUEL_CORE_DELIVERY_TASKS: TaskType[] = ["refillSpawn", "refillExtension"];

interface HaulerTargetCacheMemory {
  haulerTargetCache?: Record<string, { id: string; tick: number }>;
}

/**
 * Hauler - Transport all resources to appropriate destinations.
 * - Energy to spawns/extensions/towers/storage
 * - Minerals to terminal/storage
 * - Empties tombstones completely to recover all resources
 * Uses cached target finding to reduce CPU usage.
 */
export function hauler(ctx: CreepContext): CreepAction {
  const isWorking = updateWorkingState(ctx);
  const isDefenseRefuel = ctx.memory.task === DEFENSE_REFUEL_TASK;
  logger.debug(`${ctx.creep.name} hauler state: working=${isWorking}, energy=${ctx.creep.store.getUsedCapacity(RESOURCE_ENERGY)}/${ctx.creep.store.getCapacity()}`);

  if (isWorking) {
    // Check what resource we're carrying
    const carriedResources = Object.keys(ctx.creep.store) as ResourceConstant[];
    const resourceType = carriedResources[0];
    const energyCarried = ctx.creep.store.getUsedCapacity(RESOURCE_ENERGY);
    
    // If carrying minerals (not energy), deliver to terminal or storage
    if (energyCarried === 0 && resourceType && resourceType !== RESOURCE_ENERGY) {
      const target = ctx.terminal ?? ctx.storage;
      if (target) return { type: "transfer", target, resourceType };
    }

    if (isDefenseRefuel) {
      const defenseRefuelDelivery = findDefenseRefuelDelivery(ctx);
      if (defenseRefuelDelivery) return defenseRefuelDelivery;
    }
    
    const assignedDelivery = taskBoard.getAssignedDeliveryAction(ctx);
    if (assignedDelivery) return assignedDelivery;

    // Deliver energy with priority: spawn > extensions > towers > storage > containers
    // OPTIMIZATION: Increased cache times to reduce pathfinding overhead
    // BUGFIX: Filter by capacity HERE for fresh state, not in room cache
    if (!hasTaskBoardCriticalEnergyDelivery(ctx)) {
      // 1. Spawns first (highest priority, cache 10 ticks - increased from 5)
      const spawns = ctx.spawnStructures.filter(
        (s): s is StructureSpawn =>
          s.structureType === STRUCTURE_SPAWN &&
          s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      );
      if (spawns.length > 0) {
        const closest = findCachedClosest(ctx.creep, spawns, "hauler_spawn", 10);
        if (closest) {
          logger.debug(`${ctx.creep.name} hauler delivering to spawn ${closest.id}`);
          return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
        }
      }

      // 2. Extensions second (cache 10 ticks - increased from 5)
      const extensions = ctx.spawnStructures.filter(
        (s): s is StructureExtension =>
          s.structureType === STRUCTURE_EXTENSION &&
          s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      );
      if (extensions.length > 0) {
        const closest = findCachedClosest(ctx.creep, extensions, "hauler_ext", 10);
        if (closest) return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
      }

      // 3. Towers third (cache 15 ticks - increased from 10)
      // FIX: Lower threshold from 200 to 100 to keep towers better stocked for defense
      // Towers need to be kept full for rapid response to threats (ROADMAP.md Section 12)
      const towersWithCapacity = ctx.towers.filter(
        t => t.store.getFreeCapacity(RESOURCE_ENERGY) >= 100
      );
      if (towersWithCapacity.length > 0) {
        const closest = findCachedClosest(ctx.creep, towersWithCapacity, "hauler_tower", 15);
        if (closest) return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
      }
    }

    const terminalBufferAction = deliverTerminalBuffer(ctx, resourceType);
    if (terminalBufferAction) return terminalBufferAction;

    // 4. Storage fourth
    if (ctx.storage && ctx.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      return { type: "transfer", target: ctx.storage, resourceType: RESOURCE_ENERGY };
    }

    // 5. Containers last (cache 15 ticks - increased from 10)
    // BUGFIX: Filter by capacity HERE for fresh state, not in room cache
    const depositContainersWithCapacity = ctx.depositContainers.filter(
      c => c.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    );
    if (depositContainersWithCapacity.length > 0) {
      const closest = findCachedClosest(ctx.creep, depositContainersWithCapacity, "hauler_cont", 15);
      if (closest) return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
    }

    // FIX: No valid delivery targets found, but creep still has energy
    // Switch to collection mode to top off capacity instead of idling
    // This prevents the deadlock where haulers with partial energy get stuck
    // in working=true state with no valid targets
    if (!ctx.isEmpty) {
      logger.debug(`${ctx.creep.name} hauler has energy but no targets, switching to collection mode`);
      switchToCollectionMode(ctx);
      // Fall through to collection logic below
    } else {
      logger.warn(`${ctx.creep.name} hauler idle (empty, working=true, no targets)`);
      return { type: "idle" };
    }
  }

  // Collect resources - priority order
  // BUGFIX: Use distributed targets for containers to prevent clustering with larvaWorkers
  if (isDefenseRefuel) {
    const defenseRefuelCollection = findDefenseRefuelCollection(ctx);
    if (defenseRefuelCollection) return defenseRefuelCollection;
  }

  // 1. Dropped resources (use cached - transient and rarely contested)
  // Collects all resource types, not just energy
  if (ctx.droppedResources.length > 0) {
    const closest = findCachedClosest(ctx.creep, ctx.droppedResources, "hauler_drop", 5);
    if (closest) return reserveForEnergyCollection(ctx, { type: "pickup", target: closest });
  }

  // 2. Tombstones (use cached - transient targets)
  // OPTIMIZATION: Use cached tombstones from room context to avoid expensive room.find()
  // BUGFIX: Filter by capacity HERE for fresh state, not in room cache
  // Collect ALL resources from tombstones, not just energy, to fully empty them
  const tombstonesWithResources = ctx.tombstones.filter(
    t => t.store.getUsedCapacity() > 0
  );
  if (tombstonesWithResources.length > 0) {
    const tombstone = findCachedClosest(ctx.creep, tombstonesWithResources, "hauler_tomb", 10);
    if (tombstone) {
      // Prioritize energy first, then other resources
      if (tombstone.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        return reserveForEnergyCollection(ctx, { type: "withdraw", target: tombstone, resourceType: RESOURCE_ENERGY });
      }
      // If no energy, pick up any other resource type
      const resourceTypes = Object.keys(tombstone.store) as ResourceConstant[];
      const otherResource = resourceTypes.find(r => r !== RESOURCE_ENERGY && tombstone.store.getUsedCapacity(r) > 0);
      if (otherResource) {
        return { type: "withdraw", target: tombstone, resourceType: otherResource };
      }
    }
  }

  // 3. Containers with energy (use distributed - most contested!)
  // BUGFIX: Filter by capacity HERE for fresh state, not in room cache
  // BUGFIX: Use findDistributedTarget to prevent multiple haulers/larvaWorkers from same container
  const containersWithEnergy = ctx.containers.filter(
    c => c.store.getUsedCapacity(RESOURCE_ENERGY) > 100
  );
  if (containersWithEnergy.length > 0) {
    const distributed = getCachedDistributedTarget(ctx.creep, containersWithEnergy, "energy_container");
    if (distributed) {
      logger.debug(`${ctx.creep.name} hauler withdrawing from container ${distributed.id} with ${distributed.store.getUsedCapacity(RESOURCE_ENERGY)} energy`);
      return reserveForEnergyCollection(ctx, { type: "withdraw", target: distributed, resourceType: RESOURCE_ENERGY });
    } else {
      // BUGFIX: If distribution returns null (shouldn't happen but defensive), fall back to closest container
      logger.warn(`${ctx.creep.name} hauler found ${containersWithEnergy.length} containers but distribution returned null, falling back to closest`);
      const fallback = ctx.creep.pos.findClosestByRange(containersWithEnergy);
      if (fallback) {
        logger.debug(`${ctx.creep.name} hauler using fallback container ${fallback.id}`);
        return reserveForEnergyCollection(ctx, { type: "withdraw", target: fallback, resourceType: RESOURCE_ENERGY });
      }
    }
  }

  // 4. Containers with minerals (use distributed for mineral transport)
  // OPTIMIZATION: Use cached mineral containers from room context to avoid expensive room.find()
  if (ctx.mineralContainers.length > 0) {
    const distributed = getCachedDistributedTarget(ctx.creep, ctx.mineralContainers, "mineral_container");
    if (distributed) {
      // Find first mineral type in container using Object.keys for better performance
      const mineralType = Object.keys(distributed.store).find(
        r => r !== RESOURCE_ENERGY && distributed.store.getUsedCapacity(r as ResourceConstant) > 0
      ) as ResourceConstant | undefined;
      
      if (mineralType) {
        return { type: "withdraw", target: distributed, resourceType: mineralType };
      }
    } else {
      // BUGFIX: If distribution returns null (shouldn't happen but defensive), fall back to closest container
      logger.warn(`${ctx.creep.name} hauler found ${ctx.mineralContainers.length} mineral containers but distribution returned null, falling back to closest`);
      const fallback = ctx.creep.pos.findClosestByRange(ctx.mineralContainers);
      if (fallback) {
        const mineralType = Object.keys(fallback.store).find(
          r => r !== RESOURCE_ENERGY && fallback.store.getUsedCapacity(r as ResourceConstant) > 0
        ) as ResourceConstant | undefined;
        
        if (mineralType) {
          logger.debug(`${ctx.creep.name} hauler using fallback mineral container ${fallback.id}`);
          return { type: "withdraw", target: fallback, resourceType: mineralType };
        }
      }
    }
  }

  const terminalSupplyAction = collectTerminalBufferFromStorage(ctx);
  if (terminalSupplyAction) return reserveForEnergyCollection(ctx, terminalSupplyAction);

  // 5. Storage (single target, no distribution needed)
  if (ctx.storage && ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    logger.debug(`${ctx.creep.name} hauler withdrawing from storage`);
    return reserveForEnergyCollection(ctx, { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY });
  }

  logger.warn(`${ctx.creep.name} hauler idle (no energy sources found)`);
  return { type: "idle" };
}

function reserveForEnergyCollection(ctx: CreepContext, action: CreepAction): CreepAction {
  if (action.type === "withdraw" && action.resourceType === RESOURCE_ENERGY) {
    taskBoard.reserveDeliveryWork(ctx);
  }
  if (action.type === "pickup" && action.target.resourceType === RESOURCE_ENERGY) {
    taskBoard.reserveDeliveryWork(ctx);
  }
  return action;
}

function findDefenseRefuelDelivery(ctx: CreepContext): CreepAction | null {
  const assignedCoreDelivery = taskBoard.getAssignedAction(ctx, DEFENSE_REFUEL_CORE_DELIVERY_TASKS);
  if (assignedCoreDelivery?.type === "transfer") return assignedCoreDelivery;

  if (taskBoard.hasActiveTask(ctx.room.name, DEFENSE_REFUEL_CORE_DELIVERY_TASKS)) return null;

  const spawns = ctx.spawnStructures.filter(
    (s): s is StructureSpawn =>
      s.structureType === STRUCTURE_SPAWN &&
      s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  );
  if (spawns.length > 0) {
    const closest = findCachedClosest(ctx.creep, spawns, "defense_refuel_spawn", 3);
    if (closest) return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
  }

  const extensions = ctx.spawnStructures.filter(
    (s): s is StructureExtension =>
      s.structureType === STRUCTURE_EXTENSION &&
      s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  );
  if (extensions.length > 0) {
    const closest = findCachedClosest(ctx.creep, extensions, "defense_refuel_ext", 3);
    if (closest) return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
  }

  return null;
}

function findDefenseRefuelCollection(ctx: CreepContext): CreepAction | null {
  // Spawn demand only creates defenseRefuel haulers when helper-room source containers
  // hold useful energy; role behavior consumes the context's container contract here.
  const containersWithEnergy = ctx.containers.filter(
    c => c.store.getUsedCapacity(RESOURCE_ENERGY) > 100
  );
  if (containersWithEnergy.length === 0) return null;

  const target = getCachedDistributedTarget(ctx.creep, containersWithEnergy, "energy_container");
  if (target) return { type: "withdraw", target, resourceType: RESOURCE_ENERGY };

  const fallback = ctx.creep.pos.findClosestByRange(containersWithEnergy);
  if (fallback) return { type: "withdraw", target: fallback, resourceType: RESOURCE_ENERGY };

  return null;
}

function getCachedDistributedTarget<T extends RoomObject & _HasId>(creep: Creep, targets: T[], typeKey: string): T | null {
  const memory = (creep.memory ??= {} as CreepMemory) as HaulerTargetCacheMemory;
  const cache = memory.haulerTargetCache ??= {};
  const cached = cache[typeKey];

  if (cached && Game.time - cached.tick <= HAULER_DISTRIBUTED_TARGET_CACHE_TTL) {
    const target = targets.find(candidate => candidate.id === cached.id);
    if (target) {
      registerAssignment(creep, target, typeKey);
      return target;
    }
  }

  const target = findDistributedTarget(creep, targets, typeKey);
  if (target) {
    cache[typeKey] = { id: target.id, tick: Game.time };
  } else {
    delete cache[typeKey];
  }
  return target;
}

function deliverTerminalBuffer(ctx: CreepContext, resourceType: ResourceConstant | undefined): CreepAction | null {
  if (!resourceType || !ctx.terminal || !ctx.storage) return null;

  if (resourceType === RESOURCE_ENERGY) {
    const terminalEnergy = ctx.terminal.store.getUsedCapacity(RESOURCE_ENERGY);
    const storageEnergy = ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY);
    const terminalFree = ctx.terminal.store.getFreeCapacity(RESOURCE_ENERGY);

    const exportRequest = getTerminalEnergyExportRequest(ctx.room);

    if (
      (terminalEnergy < TERMINAL_ENERGY_TARGET && storageEnergy > STORAGE_ENERGY_RESERVE && terminalFree > 0) ||
      Boolean(exportRequest)
    ) {
      return { type: "transfer", target: ctx.terminal, resourceType: RESOURCE_ENERGY };
    }

    return null;
  }

  const terminalFree = ctx.terminal.store.getFreeCapacity(resourceType);
  if (terminalFree > 0) {
    return { type: "transfer", target: ctx.terminal, resourceType };
  }

  return null;
}

function collectTerminalBufferFromStorage(ctx: CreepContext): CreepAction | null {
  if (!ctx.storage || !ctx.terminal) return null;
  if (ctx.terminal.cooldown > 0) return null;

  const terminalFree = ctx.terminal.store.getFreeCapacity();
  if (terminalFree <= 0) return null;

  const terminalEnergy = ctx.terminal.store.getUsedCapacity(RESOURCE_ENERGY);
  const storageEnergy = ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY);

  if (
    (terminalEnergy < TERMINAL_ENERGY_TARGET && storageEnergy > STORAGE_ENERGY_RESERVE) ||
    getTerminalEnergyExportRequest(ctx.room)
  ) {
    return { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY };
  }

  const resources = Object.keys(ctx.storage.store) as ResourceConstant[];
  for (const resourceType of resources) {
    if (resourceType === RESOURCE_ENERGY) continue;

    const storageAmount = ctx.storage.store.getUsedCapacity(resourceType);
    const terminalAmount = ctx.terminal.store.getUsedCapacity(resourceType);

    if (storageAmount > MINERAL_STORAGE_BUFFER && terminalAmount < TERMINAL_MINERAL_TARGET) {
      return { type: "withdraw", target: ctx.storage, resourceType };
    }
  }

  return null;
}
