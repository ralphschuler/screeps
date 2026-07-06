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
 *
 * Addresses Issues: #5, #26, #30
 */

import { clusterManager } from "@ralphschuler/screeps-clusters";
import { evacuationManager } from "@ralphschuler/screeps-defense";
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

interface FrameworkProcessRegistration {
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
 * Register framework-package manager fallbacks when package metadata was loaded
 * through a different source/dist path before decorator registration.
 *
 * The shared kernel decorator store is the primary path. These fallbacks are a
 * bot integration adapter that preserves existing process IDs and keeps package
 * managers on the bot kernel when metadata is unavailable at runtime.
 */
function registerFrameworkPackageProcessFallbacks(): void {
  const optionalWorkMinBucket = getConfig().cpu.bucketThresholds.lowMode;
  const processes: FrameworkProcessRegistration[] = [
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
    },
    {
      id: "cluster:manager",
      name: "Cluster Manager",
      priority: ProcessPriority.MEDIUM,
      frequency: "medium",
      interval: 10,
      minBucket: 0,
      cpuBudget: 0.03,
      execute: () => clusterManager.run()
    },
    {
      id: "cluster:evacuation",
      name: "Evacuation Manager",
      priority: ProcessPriority.HIGH,
      frequency: "medium",
      interval: 5,
      minBucket: 0,
      cpuBudget: 0.02,
      execute: () => evacuationManager.run()
    }
  ];

  const fallbackProcessIds: string[] = [];

  for (const process of processes) {
    if (!kernel.getProcess(process.id)) {
      kernel.registerProcess(process);
      fallbackProcessIds.push(process.id);
    }
  }

  if (fallbackProcessIds.length > 0) {
    logger.warn("Registered framework package process fallbacks because decorator metadata was unavailable", {
      subsystem: "ProcessRegistry",
      meta: { processIds: fallbackProcessIds }
    });
  }
}

/**
 * Apply bot-runtime scheduling overrides after decorator registration.
 *
 * Framework decorators own process metadata and execution binding; the bot may still
 * tune runtime policy such as optional-work bucket thresholds from local config.
 */
function applyBotRuntimeProcessOverrides(): void {
  const marketProcess = kernel.getProcess("empire:market");
  if (!marketProcess) {
    return;
  }

  marketProcess.interval = 300;
  marketProcess.minBucket = getConfig().cpu.bucketThresholds.lowMode;
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
    evacuationManager
  );

  registerFrameworkPackageProcessFallbacks();
  applyBotRuntimeProcessOverrides();

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
