/**
 * Process Registry
 *
 * Centralizes registration of all processes with the kernel.
 * Uses process decorators for declarative process definition on manager classes.
 *
 * Process classes with @ProcessClass() and @Process decorators are:
 * - EmpireManager (empire:manager)
 * - ClusterManager (cluster:manager)
 * - MarketManager (empire:market)
 * - NukeManager (empire:nuke)
 * - PowerBankHarvestingManager (empire:powerBank)
 * - ShardManager (empire:shard)
 * - EvacuationManager (cluster:evacuation)
 *
 * Core processes and utility processes without a dedicated class are
 * registered manually below.
 *
 * Addresses Issues: #5, #30
 */

import {
  kernel,
  ProcessPriority,
  createMediumFrequencyProcess,
  createLowFrequencyProcess
} from "./kernel";
import { registerDecoratedProcesses, registerAllDecoratedProcesses } from "./processDecorators";
import type { SwarmState } from "../memory/schemas";
import { empireManager } from "../empire/empireManager";
import { clusterManager } from "../clusters/clusterManager";
import { marketManager } from "../empire/marketManager";
import { nukeManager } from "../empire/nukeManager";
import { powerBankHarvestingManager } from "../empire/powerBankHarvesting";
import { pheromoneManager } from "../logic/pheromone";
import { memoryManager } from "../memory/manager";
import { shardManager } from "../intershard/shardManager";
import { evacuationManager } from "../defense/evacuationManager";
import { labConfigManager } from "../labs/labConfig";
import { memorySegmentStats } from "./memorySegmentStats";
import { globalPathCache } from "../utils/globalPathCache";
import { logger } from "./logger";

/**
 * Register core processes that don't belong to a dedicated manager class
 */
export function registerCoreProcesses(): void {
  logger.info("Registering core processes...", { subsystem: "ProcessRegistry" });

  // Memory Cleanup - Remove dead creeps
  kernel.registerProcess({
    ...createLowFrequencyProcess(
      "core:memoryCleanup",
      "Memory Cleanup",
      () => {
        for (const name in Memory.creeps) {
          if (!Game.creeps[name]) {
            delete Memory.creeps[name];
          }
        }
      },
      ProcessPriority.LOW
    ),
    interval: 50,
    minBucket: 1000,
    cpuBudget: 0.01
  });

  // Memory Size Check - Monitor usage
  kernel.registerProcess({
    ...createLowFrequencyProcess(
      "core:memorySizeCheck",
      "Memory Size Check",
      () => {
        const used = RawMemory.get().length;
        const limit = 2 * 1024 * 1024; // 2MB
        const percentage = (used / limit) * 100;

        if (percentage > 90) {
          logger.error(`Memory usage critical: ${percentage.toFixed(1)}% (${used}/${limit} bytes)`, {
            subsystem: "Memory"
          });
        } else if (percentage > 75) {
          logger.warn(`Memory usage high: ${percentage.toFixed(1)}% (${used}/${limit} bytes)`, {
            subsystem: "Memory"
          });
        }
      },
      ProcessPriority.IDLE
    ),
    interval: 100,
    minBucket: 1000,
    cpuBudget: 0.005
  });

  // Memory Segment Stats - Update stats
  kernel.registerProcess({
    ...createMediumFrequencyProcess(
      "core:memorySegmentStats",
      "Memory Segment Stats",
      () => memorySegmentStats.run(),
      ProcessPriority.IDLE
    ),
    interval: 10,
    minBucket: 2000,
    cpuBudget: 0.01
  });

  // Pheromone Diffusion - Inter-room communication
  kernel.registerProcess({
    ...createMediumFrequencyProcess(
      "cluster:pheromoneDiffusion",
      "Pheromone Diffusion",
      () => {
        const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
        const swarmStates = new Map<string, SwarmState>();
        for (const room of ownedRooms) {
          const state = memoryManager.getSwarmState(room.name);
          if (state) {
            swarmStates.set(room.name, state);
          }
        }
        pheromoneManager.applyDiffusion(swarmStates);
      },
      ProcessPriority.MEDIUM
    ),
    interval: 10,
    minBucket: 2000,
    cpuBudget: 0.02
  });

  // Lab Config Manager - Initialize lab configurations
  kernel.registerProcess({
    ...createLowFrequencyProcess(
      "room:labConfig",
      "Lab Config Manager",
      () => {
        const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
        for (const room of ownedRooms) {
          labConfigManager.initialize(room.name);
        }
      },
      ProcessPriority.LOW
    ),
    interval: 200,
    minBucket: 3000,
    cpuBudget: 0.01
  });

  // Path Cache Precaching - Pre-cache room paths
  kernel.registerProcess({
    ...createLowFrequencyProcess(
      "room:pathCachePrecache",
      "Path Cache Precache",
      () => {
        const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
        for (const room of ownedRooms) {
          globalPathCache.precacheRoomPaths(room.name);
        }
      },
      ProcessPriority.IDLE
    ),
    interval: 1000,
    minBucket: 8000,
    cpuBudget: 0.03
  });

  logger.debug("Core processes registered", { subsystem: "ProcessRegistry" });
}

/**
 * Register all decorator-based manager processes
 */
export function registerDecoratorProcesses(): void {
  logger.info("Registering decorator-based processes...", { subsystem: "ProcessRegistry" });

  // Register all manager instances with their decorated methods
  registerAllDecoratedProcesses(
    empireManager,
    clusterManager,
    marketManager,
    nukeManager,
    powerBankHarvestingManager,
    shardManager,
    evacuationManager
  );

  logger.debug("Decorator-based processes registered", { subsystem: "ProcessRegistry" });
}

/**
 * Register all processes with the kernel
 */
export function registerAllProcesses(): void {
  logger.info("Registering all processes with kernel...", { subsystem: "ProcessRegistry" });

  // Register core processes (without dedicated manager classes)
  registerCoreProcesses();

  // Register decorator-based manager processes
  registerDecoratorProcesses();

  logger.info(`Registered ${kernel.getProcesses().length} processes with kernel`, {
    subsystem: "ProcessRegistry"
  });
}

/**
 * Unregister all processes (for testing/reset)
 */
export function unregisterAllProcesses(): void {
  const processes = kernel.getProcesses();
  for (const process of processes) {
    kernel.unregisterProcess(process.id);
  }
  logger.info("Unregistered all processes from kernel", { subsystem: "ProcessRegistry" });
}
