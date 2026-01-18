/**
 * Process Registry
 *
 * Centralizes registration of all processes with the kernel.
 * All processes use decorators for declarative process definition.
 *
 * Process classes with @ProcessClass() and @Process decorators are:
 * - CoreProcessManager (core:memoryCleanup, core:memorySizeCheck,
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
 * - PixelBuyingManager (empire:pixelBuying)
 * - PixelGenerationManager (empire:pixelGeneration)
 * - NukeManager (empire:nuke)
 * - PowerBankHarvestingManager (empire:powerBank)
 * - PowerCreepManager (empire:powerCreep)
 * - ShardManager (empire:shard)
 * - CrossShardIntelCoordinator (empire:crossShardIntel)
 * - TooAngelManager (empire:tooangel)
 * - EvacuationManager (cluster:evacuation)
 * - DefenseCoordinator (cluster:defense)
 *
 * Addresses Issues: #5, #26, #30
 */

// TODO: Fix screeps-clusters package - it has broken imports referencing ../core/kernel
// which don't exist in that package structure. These imports should either:
// 1. Import from @ralphschuler/screeps-kernel instead, OR
// 2. The cluster code should be moved into screeps-bot/src/clusters/
// Temporarily commented out to fix runtime error with missing @ralphschuler/screeps-kernel
// import { clusterManager } from "@ralphschuler/screeps-clusters";
import { defenseCoordinator, evacuationManager } from "@ralphschuler/screeps-defense";
import { terminalManager, factoryManager, linkManager, marketManager } from "@ralphschuler/screeps-economy";
import { empireManager } from "../empire/empireManager";
import { expansionManager } from "../empire/expansionManager";
import { nukeManager } from "../empire/nukeManager";
import { pixelBuyingManager } from "../empire/pixelBuyingManager";
import { pixelGenerationManager } from "../empire/pixelGenerationManager";
import { powerBankHarvestingManager } from "../empire/powerBankHarvesting";
import { powerCreepManager } from "../empire/powerCreepManager";
import { remoteInfrastructureManager } from "../empire/remoteInfrastructure";
import { shardManager } from "../intershard/shardManager";
import { crossShardIntelCoordinator } from "../empire/crossShardIntel";
import { tooAngelManager } from "../empire/tooangel/tooAngelManager";
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
    pixelBuyingManager,
    pixelGenerationManager,
    nukeManager,
    powerBankHarvestingManager,
    powerCreepManager,
    shardManager,
    crossShardIntelCoordinator,
    tooAngelManager,
    // Cluster processes
    // TODO: Re-enable clusterManager after fixing @ralphschuler/screeps-clusters package
    // clusterManager,
    // Defense processes
    evacuationManager,
    defenseCoordinator
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
