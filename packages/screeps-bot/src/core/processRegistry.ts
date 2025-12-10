/**
 * Process Registry
 *
 * Centralizes registration of all processes with the kernel.
 * All processes use decorators for declarative process definition.
 *
 * Process classes with @ProcessClass() and @Process decorators are:
 * - CoreProcessManager (core:pixelGeneration, core:memoryCleanup, core:memorySizeCheck,
 *                       core:memorySegmentStats, cluster:pheromoneDiffusion, room:labConfig,
 *                       room:pathCachePrecache)
 * - TerminalManager (terminal:manager)
 * - FactoryManager (factory:manager)
 * - LinkManager (link:manager)
 * - EmpireManager (empire:manager)
 * - ExpansionManager (expansion:manager)
 * - RemoteInfrastructureManager (remote:infrastructure)
 * - ClusterManager (cluster:manager)
 * - MarketManager (empire:market)
 * - NukeManager (empire:nuke)
 * - PowerBankHarvestingManager (empire:powerBank)
 * - PowerCreepManager (empire:powerCreep)
 * - ShardManager (empire:shard)
 * - EvacuationManager (cluster:evacuation)
 *
 * Addresses Issues: #5, #26, #30
 */

import { clusterManager } from "../clusters/clusterManager";
import { evacuationManager } from "../defense/evacuationManager";
import { terminalManager } from "../economy/terminalManager";
import { factoryManager } from "../economy/factoryManager";
import { linkManager } from "../economy/linkManager";
import { empireManager } from "../empire/empireManager";
import { expansionManager } from "../empire/expansionManager";
import { marketManager } from "../empire/marketManager";
import { nukeManager } from "../empire/nukeManager";
import { powerBankHarvestingManager } from "../empire/powerBankHarvesting";
import { powerCreepManager } from "../empire/powerCreepManager";
import { remoteInfrastructureManager } from "../empire/remoteInfrastructure";
import { shardManager } from "../intershard/shardManager";
import { coreProcessManager } from "./coreProcessManager";
import { kernel } from "./kernel";
import { logger } from "./logger";
import { registerAllDecoratedProcesses } from "./processDecorators";

/**
 * Register all processes with the kernel using decorators
 */
export function registerAllProcesses(): void {
  logger.info("Registering all processes with kernel...", { subsystem: "ProcessRegistry" });

  // Register all manager instances with their decorated methods
  registerAllDecoratedProcesses(
    // Core processes
    coreProcessManager,
    // Economy processes
    terminalManager,
    factoryManager,
    linkManager,
    // Empire processes
    empireManager,
    expansionManager,
    remoteInfrastructureManager,
    marketManager,
    nukeManager,
    powerBankHarvestingManager,
    powerCreepManager,
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
