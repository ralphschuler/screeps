/**
 * SwarmBot main entry point coordinating all subsystems via kernel-based process management.
 */

import { getOwnedRooms } from "@ralphschuler/screeps-cache";
import { emergencyResponseManager } from "@ralphschuler/screeps-defense";
import { heapCache, memoryManager } from "@ralphschuler/screeps-memory";
import { configureSpawnIntegration, coordinateSpawning } from "@ralphschuler/screeps-spawn";
import { initializePheromoneEventHandlers, pheromoneManager } from "@ralphschuler/screeps-pheromones";
import { clearRoomCaches, runPowerRole, setRemoteMoveHandler, taskBoard } from "@ralphschuler/screeps-roles";
import { SS2TerminalComms } from "@ralphschuler/screeps-standards";
import { unifiedStats } from "@ralphschuler/screeps-stats";
import { runScheduledTasks } from "@ralphschuler/screeps-utils";
import { MapVisualizer, RoomVisualizer } from "@ralphschuler/screeps-visuals";
import { reconcileTraffic as finalizeMovement, preTick as initMovement } from "screeps-cartographer";
import { getConfig } from "./config";
import { botKernelRuntime } from "./core/botKernelRuntime";
import { getOwnedRoomsForTick, shouldRunOptionalTickWork } from "./core/botTickLifecycle";
import { creepProcessManager } from "./core/creepProcessManager";
import { kernel } from "./core/kernel";
import { LogLevel, configureLogger, logger } from "./core/logger";
import { initializeNativeCallsTracking } from "./core/nativeCallsTracker";
import { roomProcessManager } from "./core/roomProcessManager";
import { energyFlowPredictor } from "./economy/energyFlowPredictor";
import { powerBankHarvestingManager } from "./empire/powerBankHarvesting";
import { resourceTransferCoordinator } from "./intershard/resourceTransferCoordinator";
import { shardManager } from "./intershard/shardManager";
import { initializePathCacheEvents } from "./utils/pathfinding";
import { initializeRemotePathScheduler, moveToWithRemoteCache } from "./utils/remote-mining";

// =============================================================================
// Visualization Setup
// =============================================================================

// Create visualization instances with memory manager integration
const roomVisualizer = new RoomVisualizer({}, memoryManager);
const mapVisualizer = new MapVisualizer({}, memoryManager);

// Export for console commands
export { roomVisualizer, mapVisualizer };

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
      coordinateSpawning(room, swarm);
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

// Initialize systems on first tick
let systemsInitialized = false;

/**
 * Initialize systems that need first-tick setup
 */
function initializeSystems(): void {
  // Configure logger based on config
  const config = getConfig();
  configureLogger({
    level: config.debug ? LogLevel.DEBUG : LogLevel.INFO,
    cpuLogging: config.profiling,
    // Performance optimizations enabled by default
    enableBatching: true,
    maxBatchSize: 50
  });

  logger.info("Bot initialized", { subsystem: "SwarmBot", meta: { debug: config.debug, profiling: config.profiling } });

  configureSpawnIntegration({
    energyFlowPredictor,
    powerBankHarvestingManager,
    resourceTransferCoordinator,
    emergencyResponseManager,
    kernel
  });

  // Initialize unified stats system
  unifiedStats.initialize();

  // Initialize native calls tracking if enabled
  if (config.profiling) {
    initializeNativeCallsTracking();
  }

  // Initialize pheromone event handlers for event-driven updates
  initializePheromoneEventHandlers(kernel, memoryManager, pheromoneManager);

  // Initialize path cache event handlers for automatic invalidation
  initializePathCacheEvents();

  // Initialize remote path cache scheduler for periodic precaching
  initializeRemotePathScheduler();
  setRemoteMoveHandler(moveToWithRemoteCache);

  // Initialize heap cache system for memory persistence
  heapCache.initialize();

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

  // Use unified cache system for owned rooms
  const ownedRooms = getOwnedRooms();

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
  // Initialize systems on first tick so logger, stats, caches, and inter-shard state are ready
  // even on respawning or temporarily abandoned shards.
  if (!systemsInitialized) {
    initializeSystems();
  }

  // Keep lightweight maintenance ahead of the no-owned-room guard. Dead creep cleanup,
  // migrations, and memory pruning still matter on respawn/abandoned shards, while the
  // MemoryManager internally gates expensive work by tick interval.
  memoryManager.initialize();

  // Sync kernel CPU configuration with runtime config so bucket-mode checks are accurate.
  const bucketMode = botKernelRuntime.configureForCurrentTick();
  if (bucketMode === "critical" && Game.time % 10 === 0) {
    logger.warn(`CRITICAL: CPU bucket at ${Game.cpu.bucket}, running core work and deferring optional work`, {
      subsystem: "SwarmBot"
    });
  }

  // Shard abandonment guard: if no owned rooms, skip colony processing but retain the
  // lightweight global maintenance above.
  const ownedRoomCount = Object.values(Game.rooms).filter(r => r.controller?.my).length;
  if (ownedRoomCount === 0) {
    // No rooms owned — either respawning, first tick, or abandoned shard.
    if (Game.time % 100 === 0) {
      logger.info(`Shard idle (no owned rooms) at tick ${Game.time}`, { subsystem: "SwarmBot" });
    }
    // Skip colony work to save CPU on abandoned shards
    logger.flush();
    return;
  }

  // Log every 10 ticks to confirm main loop is running
  if (Game.time % 10 === 0) {
    logger.info(`SwarmBot loop executing at tick ${Game.time}`, {
      subsystem: "SwarmBot",
      meta: { systemsInitialized }
    });
  }

  // Initialize kernel and register processes on first owned-room tick.
  botKernelRuntime.ensureProcessesRegistered();

  // Start stats collection for this tick
  unifiedStats.startTick();

  // Clear per-tick caches at the start of each tick.
  // Target assignment cache in targetDistribution.ts uses unified cache with TTL=1.
  clearRoomCaches();

  // Clear event bus tick-specific caches for coalescing
  botKernelRuntime.startEventTick();

  const ownedRooms = getOwnedRoomsForTick({
    tick: Game.time,
    rooms: () => Object.values(Game.rooms),
    cache: global as unknown as Record<string, unknown>
  });

  // Refresh persistent room task boards before creep processes request work.
  unifiedStats.measureSubsystem("taskBoard", () => {
    for (const room of ownedRooms) taskBoard.refreshRoom(room);
  });

  // Initialize movement system (traffic management preTick)
  initMovement();

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
    botKernelRuntime.runProcesses();
  });

  // Process queued events from event bus
  // This also clears tick events map for event coalescing
  unifiedStats.measureSubsystem("eventQueue", () => {
    botKernelRuntime.processQueuedEvents();
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

  // Run visualizations only when bucket health is normal/high.
  if (shouldRunOptionalTickWork({ hasCpuBudget: kernel.hasCpuBudget(), bucketMode })) {
    unifiedStats.measureSubsystem("visualizations", () => {
      runVisualizations();
    });
  }

  // Finalize movement system (traffic reconciliation)
  finalizeMovement();

  // Run scheduled tasks (computation spreading) when bucket health allows optional work.
  if (shouldRunOptionalTickWork({ hasCpuBudget: kernel.hasCpuBudget(), bucketMode })) {
    unifiedStats.measureSubsystem("scheduledTasks", () => {
      const availableCpu = Math.max(0, Game.cpu.limit - Game.cpu.getUsed());
      runScheduledTasks(availableCpu);
    });
  }

  // Persist heap cache to Memory periodically
  // This happens automatically based on the cache's internal interval
  memoryManager.persistHeapCache();

  // Collect kernel process stats before finalizing
  unifiedStats.collectProcessStats(
    kernel.getProcesses().reduce((map, p) => {
      map.set(p.id, p);
      return map;
    }, new Map())
  );

  // Collect kernel budget stats (adaptive budgets)
  unifiedStats.collectKernelBudgetStats(kernel);

  // Set the number of processes skipped this tick
  unifiedStats.setSkippedProcesses(kernel.getSkippedProcessesThisTick());

  // Finalize unified stats for this tick - collects and exports all metrics
  unifiedStats.finalizeTick();

  // Flush batched log messages to console
  // This should be the last operation in the tick to capture all logs
  logger.flush();
}

// Re-export key modules
export { memoryManager } from "@ralphschuler/screeps-memory";
export { roomManager } from "./core/roomNode";
export { unifiedStats } from "@ralphschuler/screeps-stats";
export { logger } from "./core/logger";
export { kernel } from "./core/kernel";
export { scheduler } from "./core/scheduler";
export { coreProcessManager } from "./core/coreProcessManager";
export { creepProcessManager } from "./core/creepProcessManager";
export { roomProcessManager } from "./core/roomProcessManager";
export { pheromoneManager } from "@ralphschuler/screeps-pheromones";
export { evolutionManager, postureManager } from "./logic/evolution";
export { eventBus } from "./core/events";

// Re-export optimization layer
export {
  roomFindOptimizer,
  objectIdOptimizer,
  optimizedFind,
  optimizedGetById,
  RoomFindOptimizer,
  ObjectIdOptimizer
} from "./core/roomFindOptimizer";
export type { RoomEvent, BucketThresholds, TTLConfig } from "./core/roomFindOptimizer";

export * from "@ralphschuler/screeps-memory";
export * from "./config";
export * from "./core/processDecorators";
export * from "./core/commandRegistry";
