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
import { roomManager } from "./core/roomNode";
import { runSpawnManager } from "./logic/spawn";
import { memoryManager } from "./memory/manager";
import { clearRoomCaches } from "./roles/behaviors/context";
import { finalizeMovement, initMovement } from "./utils/movement";
import { clearMoveRequests, processMoveRequests } from "./utils/trafficManager";
import { kernel } from "./core/kernel";
import { registerAllProcesses } from "./core/processRegistry";
import { roomVisualizer } from "./visuals/roomVisualizer";
import { mapVisualizer } from "./visuals/mapVisualizer";
import { getConfig } from "./config";
import { LogLevel, configureLogger, logger } from "./core/logger";
import { initializeNativeCallsTracking } from "./core/nativeCallsTracker";
import { unifiedStats } from "./core/unifiedStats";
import { creepProcessManager } from "./core/creepProcessManager";
import { roomProcessManager } from "./core/roomProcessManager";
import { runPowerRole } from "./roles/power";
import { initializePheromoneEventHandlers } from "./logic/pheromoneEventHandlers";

// =============================================================================
// Note: Creep and room management has been migrated to kernel processes
// See creepProcessManager and roomProcessManager for the new implementation
// =============================================================================

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
      const swarm = memoryManager.getOrInitSwarmState(room.name);
      runSpawnManager(room, swarm);
    }
  }
}

/**
 * Synchronize creep and room processes with the kernel.
 * This registers/unregisters processes as creeps spawn/die and rooms are claimed/lost.
 */
function syncKernelProcesses(): void {
  creepProcessManager.syncCreepProcesses();
  roomProcessManager.syncRoomProcesses();
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

  // Initialize unified stats system
  unifiedStats.initialize();

  // Initialize native calls tracking if enabled
  if (config.profiling) {
    initializeNativeCallsTracking();
  }

  // Initialize pheromone event handlers for event-driven updates
  initializePheromoneEventHandlers();

  systemsInitialized = true;
}

/**
 * Run visualizations for all owned rooms and map-level visuals
 * OPTIMIZATION: Use cached owned rooms list
 */
function runVisualizations(): void {
  const config = getConfig();
  if (!config.visualizations) return;

  const cacheKey = "_ownedRooms";
  const cacheTickKey = "_ownedRoomsTick";
  const globalCache = global as unknown as Record<string, Room[] | number | undefined>;
  const cachedRooms = globalCache[cacheKey] as Room[] | undefined;
  const cachedTick = globalCache[cacheTickKey] as number | undefined;
  const ownedRooms = (cachedRooms && cachedTick === Game.time)
    ? cachedRooms
    : Object.values(Game.rooms).filter(r => r.controller?.my);

  // Draw room-level visualizations
  for (const room of ownedRooms) {
    try {
      roomVisualizer.draw(room);
    } catch (err) {
      // Visualization errors shouldn't crash the main loop
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error(`Visualization error in ${room.name}: ${errorMessage}`, {
        subsystem: "visualizations",
        room: room.name
      });
    }
  }

  // Draw map-level visualizations
  try {
    mapVisualizer.draw();
  } catch (err) {
    // Visualization errors shouldn't crash the main loop
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error(`Map visualization error: ${errorMessage}`, {
      subsystem: "visualizations"
    });
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

  // Sync kernel CPU configuration with runtime config
  kernel.updateFromCpuConfig(getConfig().cpu);

  // Initialize kernel and register processes on first tick
  if (!kernelInitialized) {
    registerAllProcesses();
    kernel.initialize();
    kernelInitialized = true;
  }

  // Start stats collection for this tick
  unifiedStats.startTick();

  // Critical bucket check - use kernel's bucket mode
  const bucketMode = kernel.getBucketMode();
  if (bucketMode === "critical") {
    logger.warn(`CRITICAL: CPU bucket at ${Game.cpu.bucket}, minimal processing`, {
      subsystem: "SwarmBot"
    });
    // Only run movement finalization to prevent stuck creeps
    initMovement();
    clearMoveRequests();
    finalizeMovement();
    clearRoomCaches();
    unifiedStats.finalizeTick();
    return;
  }

  // Clear per-tick caches at the start of each tick
  clearRoomCaches();

  // Cache owned rooms list (used frequently, expensive to compute)
  // This cache is shared across all subsystems in the same tick
  const cacheKey = "_ownedRooms";
  const cacheTickKey = "_ownedRoomsTick";
  const globalCache = global as unknown as Record<string, Room[] | number | undefined>;
  const cachedRooms = globalCache[cacheKey] as Room[] | undefined;
  const cachedTick = globalCache[cacheTickKey] as number | undefined;

  let ownedRooms: Room[];
  if (cachedRooms && cachedTick === Game.time) {
    ownedRooms = cachedRooms;
  } else {
    ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    globalCache[cacheKey] = ownedRooms;
    globalCache[cacheTickKey] = Game.time;
  }

  // Initialize movement system (traffic management preTick)
  initMovement();

  // Clear move requests from previous tick
  clearMoveRequests();

  // Initialize memory structures
  memoryManager.initialize();

  // Synchronize creep and room processes with kernel
  // This must happen before kernel.run() to ensure all processes are registered
  unifiedStats.measureSubsystem("processSync", () => {
    syncKernelProcesses();
  });

  // Run kernel processes - this now includes:
  // - All creep processes (registered by creepProcessManager)
  // - All room processes (registered by roomProcessManager)
  // - Empire, cluster, market, nuke, pheromone managers (registered by processRegistry)
  // The kernel's wrap-around queue ensures fair execution of all processes
  unifiedStats.measureSubsystem("kernel", () => {
    kernel.run();
  });

  // Run spawns (high priority - always runs)
  unifiedStats.measureSubsystem("spawns", () => {
    runSpawns();
  });

  // Process move requests - ask blocking creeps to move out of the way
  // This runs after creeps have registered their movement intentions
  unifiedStats.measureSubsystem("moveRequests", () => {
    processMoveRequests();
  });

  // Run power creeps (if we have budget)
  if (kernel.hasCpuBudget()) {
    unifiedStats.measureSubsystem("powerCreeps", () => {
      runPowerCreeps();
    });
  }

  // Run visualizations (if enabled and budget allows)
  if (kernel.hasCpuBudget()) {
    unifiedStats.measureSubsystem("visualizations", () => {
      runVisualizations();
    });
  }

  // Finalize movement system (traffic reconciliation)
  finalizeMovement();

  // Persist heap cache to Memory periodically
  // This happens automatically based on the cache's internal interval
  memoryManager.persistHeapCache();

  // Finalize unified stats for this tick - collects and exports all metrics
  unifiedStats.finalizeTick();
}

// Re-export key modules
export { memoryManager } from "./memory/manager";
export { roomManager } from "./core/roomNode";
export { unifiedStats } from "./core/unifiedStats";
export { logger } from "./core/logger";
export { kernel } from "./core/kernel";
export { scheduler } from "./core/scheduler";
export { coreProcessManager } from "./core/coreProcessManager";
export { creepProcessManager } from "./core/creepProcessManager";
export { roomProcessManager } from "./core/roomProcessManager";
export { pheromoneManager } from "./logic/pheromone";
export { evolutionManager, postureManager } from "./logic/evolution";
export { roomVisualizer } from "./visuals/roomVisualizer";
export { mapVisualizer } from "./visuals/mapVisualizer";
export { eventBus } from "./core/events";
// Legacy exports for backward compatibility (deprecated - use unifiedStats)
export { profiler } from "./core/profiler";
export { statsManager } from "./core/stats";
export { memorySegmentStats } from "./core/memorySegmentStats";
export * from "./memory/schemas";
export * from "./config";
export * from "./core/processDecorators";
export * from "./core/commandRegistry";
