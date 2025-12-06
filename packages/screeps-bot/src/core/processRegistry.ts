/**
 * Process Registry
 *
 * Centralizes registration of all processes with the kernel.
 * All processes use decorators for declarative process definition.
 *
 * Process classes with @ProcessClass() and @Process decorators are:
 * - CoreProcessManager (core:memoryCleanup, core:memorySizeCheck, core:memorySegmentStats,
 *                       cluster:pheromoneDiffusion, room:labConfig, room:pathCachePrecache)
 * - EmpireManager (empire:manager)
 * - ClusterManager (cluster:manager)
 * - MarketManager (empire:market)
 * - NukeManager (empire:nuke)
 * - PowerBankHarvestingManager (empire:powerBank)
 * - ShardManager (empire:shard)
 * - EvacuationManager (cluster:evacuation)
 *
 * Addresses Issues: #5, #30
 */

import { kernel } from "./kernel";
import { registerAllDecoratedProcesses } from "./processDecorators";
import { coreProcessManager } from "./coreProcessManager";
import { empireManager } from "../empire/empireManager";
import { clusterManager } from "../clusters/clusterManager";
import { marketManager } from "../empire/marketManager";
import { nukeManager } from "../empire/nukeManager";
import { powerBankHarvestingManager } from "../empire/powerBankHarvesting";
import { shardManager } from "../intershard/shardManager";
import { evacuationManager } from "../defense/evacuationManager";
import { logger } from "./logger";

/**
 * Register all processes with the kernel using decorators
 */
export function registerAllProcesses(): void {
  logger.info("Registering all processes with kernel...", { subsystem: "ProcessRegistry" });

  // Register all manager instances with their decorated methods
  registerAllDecoratedProcesses(
    // Core processes
    coreProcessManager,
    // Empire processes
    empireManager,
    marketManager,
    nukeManager,
    powerBankHarvestingManager,
    shardManager,
    // Cluster processes
    clusterManager,
    evacuationManager
  );

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
