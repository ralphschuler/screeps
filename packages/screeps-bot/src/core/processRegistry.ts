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

import { clusterManager } from "@ralphschuler/screeps-clusters";
import { defenseCoordinator, evacuationManager } from "@ralphschuler/screeps-defense";
import { factoryManager, linkManager, marketManager, terminalManager } from "@ralphschuler/screeps-economy";
import { getConfig } from "../config";
import { crossShardIntelCoordinator } from "../empire/crossShardIntel";
import { empireManager } from "../empire/empireManager";
import { expansionManager } from "../empire/expansionManager";
import { intelScanner } from "../empire/intelScanner";
import { nukeManager } from "../empire/nukeManager";
import { pixelBuyingManager } from "../empire/pixelBuyingManager";
import { pixelGenerationManager } from "../empire/pixelGenerationManager";
import { powerBankHarvestingManager } from "../empire/powerBankHarvesting";
import { powerCreepManager } from "../empire/powerCreepManager";
import { remoteInfrastructureManager } from "../empire/remoteInfrastructure";
import { tooAngelManager } from "../empire/tooangel/tooAngelManager";
import { shardManager } from "../intershard/shardManager";
import { coreProcessManager } from "./coreProcessManager";
import { kernel, ProcessPriority, type ProcessFrequency } from "./kernel";
import { logger } from "./logger";
import { registerAllDecoratedProcesses } from "./processDecorators";

interface ManualProcessRegistration {
  id: string;
  name: string;
  priority: ProcessPriority;
  frequency: ProcessFrequency;
  interval: number;
  minBucket: number;
  cpuBudget: number;
  execute: () => void;
}

/**
 * Register framework-package managers that use @ralphschuler/screeps-kernel decorators.
 *
 * The bot keeps its own configured Kernel instance in ./kernel, while framework package
 * decorators record metadata against the framework singleton. Registering these managers
 * explicitly keeps terminal/link/factory/market work on the bot kernel that actually runs.
 */
function registerFrameworkEconomyProcesses(): void {
  const optionalWorkMinBucket = getConfig().cpu.bucketThresholds.lowMode;

  const processes: ManualProcessRegistration[] = [
    {
      id: "terminal:manager",
      name: "Terminal Manager",
      priority: ProcessPriority.MEDIUM,
      frequency: "medium",
      interval: 20,
      minBucket: 0,
      cpuBudget: 0.1,
      execute: () => terminalManager.run()
    },
    {
      id: "factory:manager",
      name: "Factory Manager",
      priority: ProcessPriority.LOW,
      frequency: "medium",
      interval: 30,
      minBucket: 0,
      cpuBudget: 0.05,
      execute: () => factoryManager.run()
    },
    {
      id: "link:manager",
      name: "Link Manager",
      priority: ProcessPriority.MEDIUM,
      frequency: "medium",
      interval: 5,
      minBucket: 0,
      cpuBudget: 0.05,
      execute: () => linkManager.run()
    },
    {
      id: "empire:market",
      name: "Market Manager",
      priority: ProcessPriority.LOW,
      frequency: "low",
      interval: 300,
      minBucket: optionalWorkMinBucket,
      cpuBudget: 0.02,
      execute: () => marketManager.run()
    }
  ];

  for (const process of processes) {
    kernel.registerProcess(process);
  }
}

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
    intelScanner,
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
    clusterManager,
    // Defense processes
    evacuationManager,
    defenseCoordinator
  );

  registerFrameworkEconomyProcesses();

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
