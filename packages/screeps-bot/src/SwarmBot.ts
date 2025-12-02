/**
 * SwarmBot - Main Bot Entry Point
 *
 * Coordinates all swarm bot subsystems:
 * - Memory initialization
 * - Room management
 * - Creep role execution
 * - Spawning
 * - Strategic decisions
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - CPU bucket management with early exit when bucket is low
 * - Priority-based creep execution (critical roles first)
 * - CPU budget checks between creeps
 * - Skips non-essential creeps when CPU is limited
 */

import type { RoleFamily, SwarmCreepMemory, SwarmState } from "./memory/schemas";
import { profiler } from "./core/profiler";
import { roomManager } from "./core/roomNode";
import { runSpawnManager } from "./logic/spawn";
import { memoryManager } from "./memory/manager";
import { pheromoneManager } from "./logic/pheromone";
import { empireManager } from "./empire/empireManager";
import { clusterManager } from "./clusters/clusterManager";
import { runEconomyRole } from "./roles/economy";
import { runMilitaryRole } from "./roles/military";
import { runPowerCreepRole, runPowerRole } from "./roles/power";
import { runUtilityRole } from "./roles/utility";
import { clearRoomCaches } from "./roles/behaviors/context";
import { finalizeMovement, initMovement } from "./utils/movement";

// =============================================================================
// CPU Budget Configuration
// =============================================================================

/** CPU bucket thresholds */
const CPU_CONFIG = {
  /** Below this bucket level, skip non-essential work */
  CRITICAL_BUCKET: 1000,
  /** Below this bucket level, reduce workload */
  LOW_BUCKET: 3000,
  /** Target CPU usage as fraction of limit */
  TARGET_USAGE: 0.85,
  /** Reserved CPU for finalization (movement reconciliation, etc.) */
  RESERVED_CPU: 5,
  /** Minimum CPU threshold to prevent underflow in budget calculations */
  MIN_CPU_THRESHOLD: 1
};

/** Role priorities - higher values = run first */
const ROLE_PRIORITY: Record<string, number> = {
  // Critical economy roles
  harvester: 100,
  queenCarrier: 95,
  hauler: 90,

  // Military (always important)
  defender: 85,
  rangedDefender: 84,
  healer: 83,

  // Standard economy
  larvaWorker: 70,
  builder: 60,
  upgrader: 50,

  // Utility
  scout: 40,
  claimer: 35,
  remoteHarvester: 30,
  remoteHauler: 25,

  // Low priority
  mineralHarvester: 20,
  depositHarvester: 15,
  labTech: 10,
  factoryWorker: 5
};

// =============================================================================
// Creep Helpers
// =============================================================================

/**
 * Get role family from creep memory
 */
function getCreepFamily(creep: Creep): RoleFamily {
  const memory = creep.memory as unknown as SwarmCreepMemory;
  return memory.family ?? "economy";
}

/**
 * Get role priority for a creep (higher = runs first)
 */
function getCreepPriority(creep: Creep): number {
  const memory = creep.memory as unknown as SwarmCreepMemory;
  return ROLE_PRIORITY[memory.role] ?? 50;
}

/**
 * Run creep based on its role family
 */
function runCreep(creep: Creep): void {
  const family = getCreepFamily(creep);

  switch (family) {
    case "economy":
      runEconomyRole(creep);
      break;
    case "military":
      runMilitaryRole(creep);
      break;
    case "utility":
      runUtilityRole(creep);
      break;
    case "power":
      runPowerCreepRole(creep);
      break;
    default:
      runEconomyRole(creep);
  }
}

// =============================================================================
// CPU Management
// =============================================================================

/**
 * Check if we have CPU budget to continue processing.
 * Validates that CPU limit is sufficient before allowing processing.
 */
function hasCpuBudget(): boolean {
  const used = Game.cpu.getUsed();
  const limit = Game.cpu.limit;
  // Only allow processing if limit is sufficient for reserved CPU and minimum threshold
  if (limit < CPU_CONFIG.RESERVED_CPU + CPU_CONFIG.MIN_CPU_THRESHOLD) {
    return false;
  }
  const availableCpu = limit - used - CPU_CONFIG.RESERVED_CPU;
  return availableCpu >= CPU_CONFIG.MIN_CPU_THRESHOLD;
}

/**
 * Check if we should skip non-essential work due to low bucket
 */
function isLowBucket(): boolean {
  return Game.cpu.bucket < CPU_CONFIG.LOW_BUCKET;
}

/**
 * Check if bucket is critically low - skip most work
 */
function isCriticalBucket(): boolean {
  return Game.cpu.bucket < CPU_CONFIG.CRITICAL_BUCKET;
}

/**
 * Get creeps sorted by priority
 */
function getSortedCreeps(): Creep[] {
  return Object.values(Game.creeps)
    .filter(c => !c.spawning)
    .sort((a, b) => getCreepPriority(b) - getCreepPriority(a));
}

// =============================================================================
// Subsystem Runners
// =============================================================================

/**
 * Run all power creeps
 */
function runPowerCreeps(): void {
  for (const powerCreep of Object.values(Game.powerCreeps)) {
    if (powerCreep.ticksToLive !== undefined) {
      runPowerRole(powerCreep);
    }
  }
}

/**
 * Run spawn logic for all owned rooms
 */
function runSpawns(): void {
  for (const room of Object.values(Game.rooms)) {
    if (room.controller?.my) {
      const swarm = memoryManager.getSwarmState(room.name);
      if (swarm) {
        runSpawnManager(room, swarm);
      }
    }
  }
}

/**
 * Run creeps with CPU budget management.
 * Creeps are sorted by priority so critical roles run first.
 */
function runCreepsWithBudget(): void {
  const creeps = getSortedCreeps();
  const lowBucket = isLowBucket();
  let creepsRun = 0;
  let creepsSkipped = 0;

  for (const creep of creeps) {
    // Check CPU budget before each creep
    if (!hasCpuBudget()) {
      creepsSkipped += (creeps.length - creepsRun - creepsSkipped);
      break;
    }

    // In low bucket mode, skip low-priority creeps
    if (lowBucket && getCreepPriority(creep) < 50) {
      creepsSkipped++;
      continue;
    }

    runCreep(creep);
    creepsRun++;
  }

  // Log if we skipped creeps - reduce frequency when bucket is low to save CPU
  const logInterval = lowBucket ? 100 : 50;
  if (creepsSkipped > 0 && Game.time % logInterval === 0) {
    console.log(`[SwarmBot] Skipped ${creepsSkipped} creeps due to CPU (bucket: ${Game.cpu.bucket})`);
  }
}

// =============================================================================
// Main Loop
// =============================================================================

/**
 * Main loop for SwarmBot
 */
export function loop(): void {
  // Critical bucket check - minimal processing
  if (isCriticalBucket()) {
    console.log(`[SwarmBot] CRITICAL: CPU bucket at ${Game.cpu.bucket}, minimal processing`);
    // Only run movement finalization to prevent stuck creeps
    initMovement();
    finalizeMovement();
    clearRoomCaches();
    profiler.finalizeTick();
    return;
  }

  // Clear per-tick caches at the start of each tick
  clearRoomCaches();

  // Initialize movement system (cartographer preTick)
  initMovement();

  // Initialize memory structures
  memoryManager.initialize();

  // Run all owned rooms
  profiler.measureSubsystem("rooms", () => {
    roomManager.run();
  });

  // Run empire manager (every 30 ticks for strategic decisions)
  if (hasCpuBudget()) {
    profiler.measureSubsystem("empire", () => {
      empireManager.run();
    });
  }

  // Run cluster manager (every 20 ticks for inter-room coordination)
  if (hasCpuBudget()) {
    profiler.measureSubsystem("clusters", () => {
      clusterManager.run();
    });
  }

  // Run pheromone diffusion (every 10 ticks - Issue #4)
  if (Game.time % 10 === 0 && hasCpuBudget()) {
    profiler.measureSubsystem("pheromones", () => {
      runPheromoneDiffusion();
    });
  }

  // Check for safe mode triggers (Issue #21)
  if (hasCpuBudget()) {
    checkSafeModeNeeded();
  }

  // Check for nukes (Issue #11)
  if (Game.time % 100 === 0 && hasCpuBudget()) {
    checkForNukes();
  }

  // Run spawns (high priority - always runs)
  profiler.measureSubsystem("spawns", () => {
    runSpawns();
  });

  // Run all creeps with CPU budget management
  profiler.measureSubsystem("creeps", () => {
    runCreepsWithBudget();
  });

  // Run power creeps (if we have budget)
  if (hasCpuBudget()) {
    profiler.measureSubsystem("powerCreeps", () => {
      runPowerCreeps();
    });
  }

  // Clean up dead creeps (every 50 ticks, low priority)
  if (Game.time % 50 === 0 && hasCpuBudget()) {
    memoryManager.cleanDeadCreeps();
  }

  // Finalize movement system (cartographer reconcileTraffic)
  finalizeMovement();

  // Finalize profiler tick
  profiler.finalizeTick();
}

/**
 * Run pheromone diffusion across owned rooms (Issue #4)
 */
function runPheromoneDiffusion(): void {
  const swarmStates = new Map<string, SwarmState>();
  
  for (const room of Object.values(Game.rooms)) {
    if (room.controller?.my) {
      const swarm = memoryManager.getSwarmState(room.name);
      if (swarm) {
        swarmStates.set(room.name, swarm);
      }
    }
  }
  
  if (swarmStates.size > 1) {
    pheromoneManager.applyDiffusion(swarmStates);
  }
}

/**
 * Check if any room needs safe mode activation (Issue #21)
 */
function checkSafeModeNeeded(): void {
  for (const room of Object.values(Game.rooms)) {
    if (!room.controller?.my) continue;
    
    const swarm = memoryManager.getSwarmState(room.name);
    if (!swarm) continue;
    
    // Only trigger in high danger situations
    if (swarm.danger < 3) continue;
    
    // Check if critical structures are being attacked
    const spawns = room.find(FIND_MY_SPAWNS);
    const storage = room.storage;
    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    
    // Check if spawns are under direct attack
    for (const spawn of spawns) {
      if (spawn.hits < spawn.hitsMax * 0.3) {
        // Spawn is critically damaged
        const nearbyHostiles = hostiles.filter(h => h.pos.getRangeTo(spawn) <= 3);
        if (nearbyHostiles.length > 0 && room.controller && room.controller.safeModeAvailable > 0) {
          const result = room.controller.activateSafeMode();
          if (result === OK) {
            console.log(`[SwarmBot] SAFE MODE ACTIVATED in ${room.name} - spawn under attack!`);
            memoryManager.addRoomEvent(room.name, "safeMode", "Spawn critically damaged");
          }
          return;
        }
      }
    }
    
    // Check if storage is under attack
    if (storage && storage.hits < storage.hitsMax * 0.2) {
      const nearbyHostiles = hostiles.filter(h => h.pos.getRangeTo(storage) <= 3);
      if (nearbyHostiles.length > 0 && room.controller && room.controller.safeModeAvailable > 0) {
        const result = room.controller.activateSafeMode();
        if (result === OK) {
          console.log(`[SwarmBot] SAFE MODE ACTIVATED in ${room.name} - storage under attack!`);
          memoryManager.addRoomEvent(room.name, "safeMode", "Storage critically damaged");
        }
        return;
      }
    }
  }
}

/**
 * Check for incoming nukes (Issue #11)
 */
function checkForNukes(): void {
  for (const room of Object.values(Game.rooms)) {
    if (!room.controller?.my) continue;
    
    const nukes = room.find(FIND_NUKES);
    if (nukes.length > 0) {
      const swarm = memoryManager.getSwarmState(room.name);
      if (swarm) {
        pheromoneManager.onNukeDetected(swarm);
        
        for (const nuke of nukes) {
          const timeToLand = nuke.timeToLand;
          console.log(`[SwarmBot] NUKE DETECTED in ${room.name}! Landing in ${timeToLand} ticks at (${nuke.pos.x}, ${nuke.pos.y})`);
          memoryManager.addRoomEvent(room.name, "nukeDetected", `Landing in ${timeToLand} ticks`);
        }
      }
    }
  }
}

// Re-export key modules
export { memoryManager } from "./memory/manager";
export { roomManager } from "./core/roomNode";
export { profiler } from "./core/profiler";
export { logger } from "./core/logger";
export { scheduler } from "./core/scheduler";
export { pheromoneManager } from "./logic/pheromone";
export { evolutionManager, postureManager } from "./logic/evolution";
export { empireManager } from "./empire/empireManager";
export { clusterManager } from "./clusters/clusterManager";
export * from "./memory/schemas";
export * from "./config";
