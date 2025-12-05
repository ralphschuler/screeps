/**
 * Process Registry
 *
 * Centralizes registration of all processes with the kernel.
 * Replaces the previous taskRegistry with kernel-based process management.
 *
 * Processes are organized by subsystem:
 * - Core processes (memory, cleanup)
 * - Room processes (per-room logic)
 * - Empire processes (global coordination)
 * - Cluster processes (multi-room coordination)
 *
 * Addresses Issues: #5, #30
 */

import {
  kernel,
  ProcessPriority,
  createHighFrequencyProcess,
  createMediumFrequencyProcess,
  createLowFrequencyProcess
} from "./kernel";
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
 * Register all core processes with the kernel
 */
export function registerCoreProcesses(): void {
  logger.info("Registering core processes...", { subsystem: "ProcessRegistry" });

  // Memory Cleanup - Remove dead creeps
  // Note: Uses createLowFrequencyProcess as base but overrides interval to 50 ticks
  // (instead of default 20) since memory cleanup doesn't need to run as frequently
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
    interval: 50,     // Override: runs every 50 ticks
    minBucket: 1000,  // Override: can run even at low bucket
    cpuBudget: 0.01   // Override: very low CPU budget
  });

  // Memory Size Check - Monitor usage
  // Note: Runs every 100 ticks to monitor memory usage and warn if near limit
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

  // Memory Segment Stats - Update stats (every 10 ticks)
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

  logger.debug("Core processes registered", { subsystem: "ProcessRegistry" });
}

/**
 * Register all empire processes with the kernel
 */
export function registerEmpireProcesses(): void {
  logger.info("Registering empire processes...", { subsystem: "ProcessRegistry" });

  // Empire Manager - Global strategic coordination (every 30 ticks)
  kernel.registerProcess({
    ...createLowFrequencyProcess(
      "empire:manager",
      "Empire Manager",
      () => empireManager.run(),
      ProcessPriority.MEDIUM
    ),
    interval: 30,
    minBucket: 5000,
    cpuBudget: 0.05
  });

  // Market Manager - Trading automation (every 100 ticks)
  kernel.registerProcess({
    ...createLowFrequencyProcess(
      "empire:market",
      "Market Manager",
      () => marketManager.run(),
      ProcessPriority.LOW
    ),
    interval: 100,
    minBucket: 7000,
    cpuBudget: 0.02
  });

  // Nuke Manager - Nuclear warfare (every 500 ticks)
  kernel.registerProcess({
    ...createLowFrequencyProcess(
      "empire:nuke",
      "Nuke Manager",
      () => nukeManager.run(),
      ProcessPriority.LOW
    ),
    interval: 500,
    minBucket: 8000,
    cpuBudget: 0.01
  });

  // Shard Manager - Multi-shard coordination (every 100 ticks)
  kernel.registerProcess({
    ...createLowFrequencyProcess(
      "empire:shard",
      "Shard Manager",
      () => shardManager.run(),
      ProcessPriority.LOW
    ),
    interval: 100,
    minBucket: 5000,
    cpuBudget: 0.02
  });

  // Power Bank Harvesting Manager (every 50 ticks)
  kernel.registerProcess({
    ...createLowFrequencyProcess(
      "empire:powerBank",
      "Power Bank Harvesting",
      () => powerBankHarvestingManager.run(),
      ProcessPriority.LOW
    ),
    interval: 50,
    minBucket: 7000,
    cpuBudget: 0.02
  });

  logger.debug("Empire processes registered", { subsystem: "ProcessRegistry" });
}

/**
 * Register all cluster processes with the kernel
 */
export function registerClusterProcesses(): void {
  logger.info("Registering cluster processes...", { subsystem: "ProcessRegistry" });

  // Cluster Manager - Multi-room coordination (every 10 ticks)
  kernel.registerProcess({
    ...createMediumFrequencyProcess(
      "cluster:manager",
      "Cluster Manager",
      () => clusterManager.run(),
      ProcessPriority.MEDIUM
    ),
    interval: 10,
    minBucket: 3000,
    cpuBudget: 0.03
  });

  // Pheromone Diffusion - Inter-room communication (every 10 ticks)
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

  // Evacuation Manager - Room evacuation (every 5 ticks)
  kernel.registerProcess({
    ...createMediumFrequencyProcess(
      "cluster:evacuation",
      "Evacuation Manager",
      () => evacuationManager.run(),
      ProcessPriority.HIGH
    ),
    interval: 5,
    minBucket: 2000,
    cpuBudget: 0.02
  });

  logger.debug("Cluster processes registered", { subsystem: "ProcessRegistry" });
}

/**
 * Register all room processes with the kernel
 */
export function registerRoomProcesses(): void {
  logger.info("Registering room processes...", { subsystem: "ProcessRegistry" });

  // Lab Config Manager - Initialize lab configurations (every 200 ticks)
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

  // Path Cache Precaching - Pre-cache room paths (every 1000 ticks)
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

  logger.debug("Room processes registered", { subsystem: "ProcessRegistry" });
}

/**
 * Register all processes with the kernel
 */
export function registerAllProcesses(): void {
  logger.info("Registering all processes with kernel...", { subsystem: "ProcessRegistry" });

  registerCoreProcesses();
  registerEmpireProcesses();
  registerClusterProcesses();
  registerRoomProcesses();

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
