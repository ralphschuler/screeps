/**
 * Idle Creep Detection
 *
 * Detects creeps that are truly idle and can skip expensive behavior evaluation.
 * This is a significant CPU optimization for large swarms (1000+ creeps).
 *
 * A creep is considered idle when:
 * 1. It's at its work position (e.g., harvester at source, upgrader at controller)
 * 2. It has an ongoing state that's still valid
 * 3. It doesn't need to make new decisions
 *
 * Design Principles (from ROADMAP.md Section 18):
 * - "Idle creep detection: Skip behavior evaluation for truly idle creeps"
 * - CPU savings: ~0.1-0.2 CPU per skipped creep
 * - With 142 creeps, ~20-40% may be in idle working state
 * - Potential savings: 3-8 CPU
 */

import type { SwarmCreepMemory } from "../memory/schemas";

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if an object is a RoomObject.
 * RoomObjects have pos and room properties.
 */
function isRoomObject(obj: unknown): obj is RoomObject {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "pos" in obj &&
    obj.pos instanceof RoomPosition &&
    "room" in obj &&
    obj.room instanceof Room
  );
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Roles that can benefit from idle detection (stationary workers).
 * Mobile roles like haulers and military units are excluded.
 * 
 * OPTIMIZATION: Extended in performance optimization to include more roles.
 * With 100+ creeps, extending idle detection to builders can save 1-2 CPU.
 * Note: "repairer" is not a defined role in this bot, so it's excluded.
 */
const IDLE_ELIGIBLE_ROLES = new Set([
  "harvester", // Stationary at source
  "upgrader", // Often stationary at controller
  "mineralHarvester", // Stationary at mineral
  "depositHarvester", // Stationary at deposit
  "factoryWorker", // Stationary at factory
  "labTech", // Stationary at labs
  "builder" // Can be stationary at construction site
]);

/**
 * Energy threshold for harvesters.
 * If harvester is at source and has less than this in store, it's actively working.
 */
const HARVESTER_WORKING_THRESHOLD = 40;

/**
 * Minimum ticks a creep must have a valid state to be considered idle.
 * This prevents false positives for creeps that just started a task.
 * OPTIMIZATION: Reduced from 3 to 2 to allow idle detection to kick in sooner
 */
const MIN_STATE_AGE_FOR_IDLE = 2;

// =============================================================================
// Public API
// =============================================================================

/**
 * Check if a creep can skip behavior evaluation this tick.
 * Returns true if the creep is:
 * - In an idle-eligible role
 * - Has a valid ongoing state
 * - Is actively working (not just standing around)
 * - Doesn't need to make new decisions
 *
 * @param creep - The creep to check
 * @returns true if creep can skip behavior evaluation
 */
export function canSkipBehaviorEvaluation(creep: Creep): boolean {
  const memory = creep.memory as unknown as SwarmCreepMemory;
  
  // Only certain roles are eligible
  if (!IDLE_ELIGIBLE_ROLES.has(memory.role)) {
    return false;
  }
  
  // Must have a valid state that's been active for a few ticks
  const state = memory.state;
  if (!state || !state.startTick) {
    return false;
  }
  
  const stateAge = Game.time - state.startTick;
  if (stateAge < MIN_STATE_AGE_FOR_IDLE) {
    return false;
  }
  
  // Role-specific checks
  switch (memory.role) {
    case "harvester":
      return isHarvesterIdle(creep, state);
    
    case "upgrader":
      return isUpgraderIdle(creep, state);
    
    case "mineralHarvester":
      return isMineralHarvesterIdle(creep, state);
    
    case "builder":
      return isBuilderIdle(creep, state);
    
    case "depositHarvester":
    case "factoryWorker":
    case "labTech":
      // These roles can be idle if they have a valid state
      // The state machine will handle checking if state is still valid
      return true;
    
    default:
      return false;
  }
}

// =============================================================================
// Role-Specific Idle Checks
// =============================================================================

/**
 * Check if a harvester is idle (actively harvesting at source).
 * Harvester is idle when:
 * - State is "harvest" or "transfer"
 * - Has valid target (source or container/link)
 * - Is next to target
 * - Has space to continue harvesting (not full)
 */
function isHarvesterIdle(creep: Creep, state: NonNullable<SwarmCreepMemory["state"]>): boolean {
  // Must be harvesting or transferring to nearby container/link
  if (state.action !== "harvest" && state.action !== "transfer") {
    return false;
  }
  
  // Validate target still exists
  if (!state.targetId) {
    return false;
  }
  
  const target = Game.getObjectById(state.targetId);
  if (!target || !isRoomObject(target)) {
    return false;
  }
  
  // Must be adjacent to target
  if (!creep.pos.isNearTo(target.pos)) {
    return false;
  }
  
  // If harvesting, must not be full
  if (state.action === "harvest") {
    const carryCapacity = creep.store.getCapacity();
    if (carryCapacity !== null && carryCapacity > 0) {
      // Has carry capacity - check if full
      if (creep.store.getFreeCapacity() === 0) {
        return false; // Full, needs to transfer
      }
    }
    // Drop miners (no carry) are always idle when harvesting
  }
  
  // If transferring, must have energy to transfer
  if (state.action === "transfer") {
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) < HARVESTER_WORKING_THRESHOLD) {
      return false; // Not enough energy, needs to harvest
    }
  }
  
  return true;
}

/**
 * Check if an upgrader is idle (actively upgrading controller).
 * Upgrader is idle when:
 * - State is "upgrade" or "withdraw" (getting energy from nearby container)
 * - Has valid target
 * - Is in range of target
 * - Has energy to upgrade (for upgrade state) or space to withdraw (for withdraw state)
 */
function isUpgraderIdle(creep: Creep, state: NonNullable<SwarmCreepMemory["state"]>): boolean {
  // Must be upgrading or withdrawing
  if (state.action !== "upgrade" && state.action !== "withdraw") {
    return false;
  }
  
  // Validate target
  if (!state.targetId) {
    return false;
  }
  
  const target = Game.getObjectById(state.targetId);
  if (!target || !isRoomObject(target)) {
    return false;
  }
  
  // Must be in range
  const inRange = creep.pos.inRangeTo(target.pos, 3);
  if (!inRange) {
    return false;
  }
  
  // If upgrading, must have energy
  if (state.action === "upgrade") {
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      return false;
    }
  }
  
  // If withdrawing, must have space
  if (state.action === "withdraw") {
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      return false;
    }
  }
  
  return true;
}

/**
 * Check if a mineral harvester is idle (actively mining mineral).
 * Similar to regular harvester but for minerals.
 */
function isMineralHarvesterIdle(creep: Creep, state: NonNullable<SwarmCreepMemory["state"]>): boolean {
  // Must be harvesting mineral
  if (state.action !== "harvestMineral") {
    return false;
  }
  
  // Validate target
  if (!state.targetId) {
    return false;
  }
  
  const target = Game.getObjectById(state.targetId);
  if (!target || !isRoomObject(target)) {
    return false;
  }
  
  // Must be adjacent
  if (!creep.pos.isNearTo(target.pos)) {
    return false;
  }
  
  // Must not be full
  if (creep.store.getFreeCapacity() === 0) {
    return false;
  }
  
  return true;
}

/**
 * Check if a builder is idle (actively building at construction site).
 * Builder is idle when:
 * - State is "build"
 * - Has valid target (construction site)
 * - Is in range of target (range 3)
 * - Has energy to build
 */
function isBuilderIdle(creep: Creep, state: NonNullable<SwarmCreepMemory["state"]>): boolean {
  // Must be building
  if (state.action !== "build") {
    return false;
  }
  
  // Validate target
  if (!state.targetId) {
    return false;
  }
  
  const target = Game.getObjectById(state.targetId);
  if (!target || !isRoomObject(target)) {
    return false;
  }
  
  // Must be in range (build range is 3)
  if (!creep.pos.inRangeTo(target.pos, 3)) {
    return false;
  }
  
  // Must have energy
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
    return false;
  }
  
  return true;
}

/**
 * Check if a repairer is idle (actively repairing structure).
 * Repairer is idle when:
 * - State is "repair"
 * - Has valid target (structure)
 * - Is in range of target (range 3)
 * - Has energy to repair
 * 
 * NOTE: Currently unused as "repairer" is not a defined role in this bot.
 * Kept for future use when repairer role is added.
 */
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
function isRepairerIdle(creep: Creep, state: NonNullable<SwarmCreepMemory["state"]>): boolean {
  // Must be repairing
  if (state.action !== "repair") {
    return false;
  }
  
  // Validate target
  if (!state.targetId) {
    return false;
  }
  
  const target = Game.getObjectById(state.targetId);
  if (!target || !isRoomObject(target)) {
    return false;
  }
  
  // Must be in range (repair range is 3)
  if (!creep.pos.inRangeTo(target.pos, 3)) {
    return false;
  }
  
  // Must have energy
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
    return false;
  }
  
  return true;
}

/**
 * Execute the creep's current action without re-evaluating behavior.
 * This is called for idle creeps that can skip behavior evaluation.
 * 
 * @param creep - The creep to execute action for
 * @returns true if action was executed successfully
 */
export function executeIdleAction(creep: Creep): boolean {
  const memory = creep.memory as unknown as SwarmCreepMemory;
  const state = memory.state;
  
  if (!state || !state.targetId) {
    return false;
  }
  
  const target = Game.getObjectById(state.targetId);
  if (!target || !isRoomObject(target)) {
    return false;
  }
  
  // Execute the action based on state with proper type validation
  switch (state.action) {
    case "harvest":
      // Validate target is a Source
      if ("energy" in target && "energyCapacity" in target && "ticksToRegeneration" in target) {
        return creep.harvest(target as Source) === OK;
      }
      return false;
    
    case "harvestMineral":
      // Validate target is a Mineral
      if ("mineralType" in target && "mineralAmount" in target && "ticksToRegeneration" in target) {
        return creep.harvest(target as Mineral) === OK;
      }
      return false;
    
    case "transfer":
      // Validate target has store property (structures with storage)
      if ("store" in target && target.store && typeof target.store === "object") {
        return creep.transfer(target as AnyStoreStructure, RESOURCE_ENERGY) === OK;
      }
      return false;
    
    case "withdraw":
      // Validate target has store property (structures with storage)
      if ("store" in target && target.store && typeof target.store === "object") {
        return creep.withdraw(target as AnyStoreStructure, RESOURCE_ENERGY) === OK;
      }
      return false;
    
    case "upgrade":
      // Validate target is a Controller
      if ("level" in target && "progress" in target && "my" in target) {
        return creep.upgradeController(target as StructureController) === OK;
      }
      return false;
    
    case "build":
      // Validate target is a ConstructionSite
      if ("progressTotal" in target && "progress" in target) {
        return creep.build(target as ConstructionSite) === OK;
      }
      return false;
    
    case "repair":
      // Validate target is a Structure
      if ("hits" in target && "hitsMax" in target) {
        return creep.repair(target as Structure) === OK;
      }
      return false;
    
    default:
      return false;
  }
}
