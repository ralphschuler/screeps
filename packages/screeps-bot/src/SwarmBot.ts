/**
 * SwarmBot main entry point coordinating all subsystems via kernel-based process management.
 */

import type { RoleFamily, SwarmCreepMemory } from "./memory/schemas";
import { roomManager } from "./core/roomNode";
import { runSpawnManager } from "./logic/spawn";
import { memoryManager } from "./memory/manager";
import { clearRoomCaches } from "./roles/behaviors/context";
import { preTick as initMovement, reconcileTraffic as finalizeMovement } from "screeps-cartographer";
import { clearTargetAssignments } from "./utils/targetDistribution";
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
import { initializePathCacheEvents } from "./utils/pathCacheEvents";
import { runScheduledTasks } from "./utils/computationScheduler";
import { heapCache } from "./memory/heapCache";
import { simpleAllies } from "./standards/SimpleAlliesManager";
import { runAllianceDiplomacy } from "./empire/allianceDiplomacy";
import { SS2TerminalComms } from "./standards/SS2TerminalComms";
import { initializeRemotePathScheduler } from "./utils/remotePathScheduler";
import { shardManager } from "./intershard/shardManager";

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
  
  logger.info("Bot initialized", { subsystem: "SwarmBot", meta: { debug: config.debug, profiling: config.profiling } });

  // Initialize unified stats system
  unifiedStats.initialize();

  // Initialize native calls tracking if enabled
  if (config.profiling) {
    initializeNativeCallsTracking();
  }

  // Initialize pheromone event handlers for event-driven updates
  initializePheromoneEventHandlers();

  // Initialize path cache event handlers for automatic invalidation
  initializePathCacheEvents();

  // Initialize remote path cache scheduler for periodic precaching
  initializeRemotePathScheduler();

  // Initialize heap cache system for memory persistence
  heapCache.initialize();

  // Initialize alliance system with configuration
  simpleAllies.updateConfig({
    allies: config.alliance.allies,
    allySegmentID: config.alliance.allySegmentID,
    enabled: config.alliance.enabled
  });

  // Initialize shard manager for multi-shard coordination
  // Note: shardManager is already registered as a kernel process
  // This just loads the InterShardMemory on startup
  shardManager.initialize();

  systemsInitialized = true;
}

/**
 * Run visualizations for all owned rooms and map-level visuals
 * OPTIMIZATION: Use cached owned rooms list
 * 
 * TODO(P3): PERF - Visualization optimization improvements:
 * - Add CPU budget for visualizations to prevent them consuming too much
 *   (in low bucket, skip or simplify visualizations to preserve CPU)
 * - Implement selective visualization based on observed rooms
 *   (only draw visuals for rooms currently visible to reduce overhead)
 * - Add visualization layers (basic/detailed/debug) controlled by flags
 *   (allow users to toggle between minimal, standard, and verbose visualizations)
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
  // Log every 10 ticks to confirm main loop is running
  if (!systemsInitialized || Game.time % 10 === 0) {
    logger.info(`SwarmBot loop executing at tick ${Game.time}`, {
      subsystem: "SwarmBot",
      meta: { systemsInitialized }
    });
  }
  
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

  // Log bucket mode for monitoring (informational only - does not affect execution)
  // Per BUCKET_MANAGEMENT.md: bucket mode is informational only and does not affect CPU limits or which processes run
  const bucketMode = kernel.getBucketMode();
  if (bucketMode === "critical" && Game.time % 10 === 0) {
    logger.warn(`CRITICAL: CPU bucket at ${Game.cpu.bucket}, continuing normal processing`, {
      subsystem: "SwarmBot"
    });
  }

  // Clear per-tick caches at the start of each tick
  // BUGFIX: Clear target assignments to prevent creeps from clustering on same targets
  clearTargetAssignments();
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

  // Initialize memory structures
  memoryManager.initialize();

  // Initialize alliance system (reads ally segments)
  // This must happen early to have ally data available for decision-making
  unifiedStats.measureSubsystem("allianceInit", () => {
    simpleAllies.initRun();
  });

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

  // Process SS2 Terminal Communications packet queue
  // Sends queued multi-packet messages respecting terminal cooldowns
  unifiedStats.measureSubsystem("ss2PacketQueue", () => {
    SS2TerminalComms.processQueue();
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

  // Run scheduled tasks (computation spreading)
  // This runs low-priority tasks when CPU budget allows
  if (kernel.hasCpuBudget()) {
    unifiedStats.measureSubsystem("scheduledTasks", () => {
      const availableCpu = Math.max(0, Game.cpu.limit - Game.cpu.getUsed());
      runScheduledTasks(availableCpu);
    });
  }

  // Run alliance diplomacy system (generate requests, process ally data)
  // This runs periodically based on CPU budget
  if (kernel.hasCpuBudget() && Game.time % 10 === 0) {
    unifiedStats.measureSubsystem("allianceDiplomacy", () => {
      runAllianceDiplomacy();
    });
  }

  // Finalize alliance system (publish our segment)
  // This must happen near the end to include all generated requests
  unifiedStats.measureSubsystem("allianceFinalize", () => {
    simpleAllies.endRun();
  });

  // Persist heap cache to Memory periodically
  // This happens automatically based on the cache's internal interval
  memoryManager.persistHeapCache();

  // Collect kernel process stats before finalizing
  unifiedStats.collectProcessStats(kernel.getProcesses().reduce((map, p) => {
    map.set(p.id, p);
    return map;
  }, new Map()));

  // Set the number of processes skipped this tick
  unifiedStats.setSkippedProcesses(kernel.getSkippedProcessesThisTick());

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

// Deprecated exports - redirect to unifiedStats with console warnings
import { unifiedStats as _unifiedStats } from "./core/unifiedStats";
import { memorySegmentStats as _memorySegmentStats } from "./core/memorySegmentStats";

/**
 * @deprecated Use unifiedStats instead. This export will be removed in a future version.
 * profiler.ts has been consolidated into unifiedStats.ts for better performance and maintainability.
 */
export const profiler = new Proxy(_unifiedStats, {
  get(target, prop) {
    if (prop === Symbol.toStringTag) return "Profiler";
    console.log(`[DEPRECATION WARNING] profiler.${String(prop)} is deprecated. Use unifiedStats.${String(prop)} instead.`);
    return (target as any)[prop];
  }
});

/**
 * @deprecated Use unifiedStats instead. This export will be removed in a future version.
 * stats.ts has been consolidated into unifiedStats.ts for better performance and maintainability.
 */
export const statsManager = new Proxy(_unifiedStats, {
  get(target, prop) {
    if (prop === Symbol.toStringTag) return "StatsManager";
    console.log(`[DEPRECATION WARNING] statsManager.${String(prop)} is deprecated. Use unifiedStats.${String(prop)} instead.`);
    return (target as any)[prop];
  }
});

/**
 * @deprecated memorySegmentStats is still available but consider using unifiedStats for most use cases.
 */
export { memorySegmentStats } from "./core/memorySegmentStats";

export * from "./memory/schemas";
export * from "./config";
export * from "./core/processDecorators";
export * from "./core/commandRegistry";
