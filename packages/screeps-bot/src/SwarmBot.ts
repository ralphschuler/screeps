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
 * ARCHITECTURE:
 * The bot uses a central Kernel for process management:
 * - Process registration with priority and CPU budget
 * - CPU bucket-based scheduling
 * - Lifecycle management (init, run, cleanup)
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - CPU bucket management with early exit when bucket is low
 * - Priority-based creep execution (critical roles first)
 * - CPU budget checks between creeps
 * - Skips non-essential creeps when CPU is limited
 */

import type { RoleFamily, SwarmCreepMemory } from "./memory/schemas";
import { profiler } from "./core/profiler";
import { roomManager } from "./core/roomNode";
import { runSpawnManager } from "./logic/spawn";
import { memoryManager } from "./memory/manager";
import { runEconomyRole } from "./roles/economy";
import { runMilitaryRole } from "./roles/military";
import { runPowerCreepRole, runPowerRole } from "./roles/power";
import { runUtilityRole } from "./roles/utility";
import { clearRoomCaches } from "./roles/behaviors/context";
import { finalizeMovement, initMovement } from "./utils/movement";
import { clearMoveRequests, processMoveRequests } from "./utils/trafficManager";
import { kernel } from "./core/kernel";
import { registerAllProcesses } from "./core/processRegistry";
import { roomVisualizer } from "./visuals/roomVisualizer";
import { memorySegmentStats } from "./core/memorySegmentStats";
import { getConfig } from "./config";
import { LogLevel, configureLogger } from "./core/logger";

// =============================================================================
// Role Priority Configuration
// =============================================================================

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
// CPU Management (Delegated to Kernel)
// =============================================================================

/**
 * Check if we should skip non-essential work due to low bucket
 * Uses kernel's bucket mode for consistency
 */
function isLowBucket(): boolean {
  const mode = kernel.getBucketMode();
  return mode === "low" || mode === "critical";
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
 * Uses kernel for CPU budget checking.
 */
function runCreepsWithBudget(): void {
  const creeps = getSortedCreeps();
  const lowBucket = isLowBucket();
  let creepsRun = 0;
  let creepsSkipped = 0;

  for (const creep of creeps) {
    // Check CPU budget before each creep using kernel
    if (!kernel.hasCpuBudget()) {
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

// Initialize kernel and processes on first tick
let kernelInitialized = false;
let systemsInitialized = false;

/**
 * Initialize systems that need first-tick setup
 */
function initializeSystems(): void {
  // Configure logger based on config
  const config = getConfig();
  configureLogger({
    level: config.debug ? LogLevel.DEBUG : LogLevel.INFO,
    cpuLogging: config.profiling
  });

  // Initialize memory segment stats
  memorySegmentStats.initialize();

  systemsInitialized = true;
}

/**
 * Run visualizations for all owned rooms
 */
function runVisualizations(): void {
  const config = getConfig();
  if (!config.visualizations) return;

  const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
  for (const room of ownedRooms) {
    try {
      roomVisualizer.draw(room);
    } catch (err) {
      // Visualization errors shouldn't crash the main loop
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.log(`[SwarmBot] Visualization error in ${room.name}: ${errorMessage}`);
    }
  }
}

/**
 * Main loop for SwarmBot
 */
export function loop(): void {
  // Initialize systems on first tick
  if (!systemsInitialized) {
    initializeSystems();
  }

  // Initialize kernel and register processes on first tick
  if (!kernelInitialized) {
    registerAllProcesses();
    kernel.initialize();
    kernelInitialized = true;
  }

  // Critical bucket check - use kernel's bucket mode
  const bucketMode = kernel.getBucketMode();
  if (bucketMode === "critical") {
    console.log(`[SwarmBot] CRITICAL: CPU bucket at ${Game.cpu.bucket}, minimal processing`);
    // Only run movement finalization to prevent stuck creeps
    initMovement();
    clearMoveRequests();
    finalizeMovement();
    clearRoomCaches();
    profiler.finalizeTick();
    return;
  }

  // Clear per-tick caches at the start of each tick
  clearRoomCaches();

  // Initialize movement system (traffic management preTick)
  initMovement();

  // Clear move requests from previous tick
  clearMoveRequests();

  // Initialize memory structures
  memoryManager.initialize();

  // Run all owned rooms with error recovery
  profiler.measureSubsystem("rooms", () => {
    try {
      roomManager.run();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.log(`[SwarmBot] ERROR in room processing: ${errorMessage}`);
      if (err instanceof Error && err.stack) {
        console.log(err.stack);
      }
    }
  });

  // Run kernel processes (empire, cluster, market, nuke, pheromone managers)
  if (kernel.hasCpuBudget()) {
    profiler.measureSubsystem("kernel", () => {
      kernel.run();
    });
  }

  // Run spawns (high priority - always runs)
  profiler.measureSubsystem("spawns", () => {
    runSpawns();
  });

  // Run all creeps with CPU budget management
  profiler.measureSubsystem("creeps", () => {
    runCreepsWithBudget();
  });

  // Process move requests - ask blocking creeps to move out of the way
  // This runs after creeps have registered their movement intentions
  profiler.measureSubsystem("moveRequests", () => {
    processMoveRequests();
  });

  // Run power creeps (if we have budget)
  if (kernel.hasCpuBudget()) {
    profiler.measureSubsystem("powerCreeps", () => {
      runPowerCreeps();
    });
  }

  // Run visualizations (if enabled and budget allows)
  if (kernel.hasCpuBudget()) {
    profiler.measureSubsystem("visualizations", () => {
      runVisualizations();
    });
  }

  // Finalize movement system (traffic reconciliation)
  finalizeMovement();

  // Finalize profiler tick
  profiler.finalizeTick();
}

// Re-export key modules
export { memoryManager } from "./memory/manager";
export { roomManager } from "./core/roomNode";
export { profiler } from "./core/profiler";
export { logger } from "./core/logger";
export { kernel } from "./core/kernel";
export { scheduler } from "./core/scheduler";
export { coreProcessManager } from "./core/coreProcessManager";
export { pheromoneManager } from "./logic/pheromone";
export { evolutionManager, postureManager } from "./logic/evolution";
export { roomVisualizer } from "./visuals/roomVisualizer";
export { memorySegmentStats } from "./core/memorySegmentStats";
export { eventBus } from "./core/events";
export * from "./memory/schemas";
export * from "./config";
export * from "./core/processDecorators";
export * from "./core/commandRegistry";
export * from "./core/events";
