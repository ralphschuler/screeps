/**
 * Console Commands
 *
 * All console commands available in the game using @Command decorators.
 * Commands are automatically registered and exposed to global scope.
 *
 * Categories:
 * - Logging: Commands for controlling log output
 * - Visualization: Commands for toggling visual overlays
 * - Statistics: Commands for viewing bot statistics
 * - Kernel: Commands for managing kernel processes
 * - Configuration: Commands for viewing/modifying bot configuration
 */

/* eslint-disable max-classes-per-file */

import { Command, commandRegistry, registerDecoratedCommands } from "./commandRegistry";
import { kernel } from "./kernel";
import { LogLevel, configureLogger, getLoggerConfig } from "./logger";
import { memorySegmentStats } from "./memorySegmentStats";
import { profiler } from "./profiler";
import { getConfig, updateConfig } from "../config";
import { roomVisualizer } from "../visuals/roomVisualizer";
import { mapVisualizer } from "../visuals/mapVisualizer";
import { creepProcessManager } from "./creepProcessManager";
import { roomProcessManager } from "./roomProcessManager";
import { labCommands, marketCommands, powerCommands } from "./advancedSystemCommands";
import { shardCommands } from "./shardCommands";

/**
 * Logging commands
 */
class LoggingCommands {
  @Command({
    name: "setLogLevel",
    description: "Set the log level for the bot",
    usage: "setLogLevel(level)",
    examples: [
      "setLogLevel('debug')",
      "setLogLevel('info')",
      "setLogLevel('warn')",
      "setLogLevel('error')",
      "setLogLevel('none')"
    ],
    category: "Logging"
  })
  public setLogLevel(level: string): string {
    const levelMap: Record<string, LogLevel> = {
      debug: LogLevel.DEBUG,
      info: LogLevel.INFO,
      warn: LogLevel.WARN,
      error: LogLevel.ERROR,
      none: LogLevel.NONE
    };

    const logLevel = levelMap[level.toLowerCase()];
    if (logLevel === undefined) {
      return `Invalid log level: ${level}. Valid levels: debug, info, warn, error, none`;
    }

    configureLogger({ level: logLevel });
    return `Log level set to: ${level.toUpperCase()}`;
  }

  @Command({
    name: "toggleDebug",
    description: "Toggle debug mode on/off (affects log level and debug features)",
    usage: "toggleDebug()",
    examples: ["toggleDebug()"],
    category: "Logging"
  })
  public toggleDebug(): string {
    const config = getConfig();
    const newValue = !config.debug;
    updateConfig({ debug: newValue });
    configureLogger({ level: newValue ? LogLevel.DEBUG : LogLevel.INFO });
    return `Debug mode: ${newValue ? "ENABLED" : "DISABLED"} (Log level: ${newValue ? "DEBUG" : "INFO"})`;
  }
}

/**
 * Visualization commands
 */
class VisualizationCommands {
  @Command({
    name: "toggleVisualizations",
    description: "Toggle all visualizations on/off",
    usage: "toggleVisualizations()",
    examples: ["toggleVisualizations()"],
    category: "Visualization"
  })
  public toggleVisualizations(): string {
    const config = getConfig();
    const newValue = !config.visualizations;
    updateConfig({ visualizations: newValue });
    return `Visualizations: ${newValue ? "ENABLED" : "DISABLED"}`;
  }

  @Command({
    name: "toggleVisualization",
    description: "Toggle a specific room visualization feature",
    usage: "toggleVisualization(key)",
    examples: [
      "toggleVisualization('showPheromones')",
      "toggleVisualization('showPaths')",
      "toggleVisualization('showCombat')"
    ],
    category: "Visualization"
  })
  public toggleVisualization(key: string): string {
    const config = roomVisualizer.getConfig();
    const validKeys = Object.keys(config).filter(
      k => k.startsWith("show") && typeof config[k as keyof typeof config] === "boolean"
    );

    if (!validKeys.includes(key)) {
      return `Invalid key: ${key}. Valid keys: ${validKeys.join(", ")}`;
    }

    const validKey = key as keyof typeof config;
    roomVisualizer.toggle(validKey);
    const newConfig = roomVisualizer.getConfig();
    const value = newConfig[validKey];
    return `Room visualization '${key}': ${value ? "ENABLED" : "DISABLED"}`;
  }

  @Command({
    name: "toggleMapVisualization",
    description: "Toggle a specific map visualization feature",
    usage: "toggleMapVisualization(key)",
    examples: [
      "toggleMapVisualization('showRoomStatus')",
      "toggleMapVisualization('showConnections')",
      "toggleMapVisualization('showThreats')",
      "toggleMapVisualization('showExpansion')"
    ],
    category: "Visualization"
  })
  public toggleMapVisualization(key: string): string {
    const config = mapVisualizer.getConfig();
    const validKeys = Object.keys(config).filter(
      k => k.startsWith("show") && typeof config[k as keyof typeof config] === "boolean"
    );

    if (!validKeys.includes(key)) {
      return `Invalid key: ${key}. Valid keys: ${validKeys.join(", ")}`;
    }

    const validKey = key as keyof typeof config;
    mapVisualizer.toggle(validKey);
    const newConfig = mapVisualizer.getConfig();
    const value = newConfig[validKey];
    return `Map visualization '${key}': ${value ? "ENABLED" : "DISABLED"}`;
  }

  @Command({
    name: "showMapConfig",
    description: "Show current map visualization configuration",
    usage: "showMapConfig()",
    examples: ["showMapConfig()"],
    category: "Visualization"
  })
  public showMapConfig(): string {
    const config = mapVisualizer.getConfig();
    return Object.entries(config)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join("\n");
  }

  @Command({
    name: "setVisMode",
    description: "Set visualization mode preset (debug, presentation, minimal, performance)",
    usage: "setVisMode(mode)",
    examples: [
      "setVisMode('debug')",
      "setVisMode('presentation')",
      "setVisMode('minimal')",
      "setVisMode('performance')"
    ],
    category: "Visualization"
  })
  public setVisMode(mode: string): string {
    const validModes = ["debug", "presentation", "minimal", "performance"];
    if (!validModes.includes(mode)) {
      return `Invalid mode: ${mode}. Valid modes: ${validModes.join(", ")}`;
    }

    const { visualizationManager } = require("../visuals/visualizationManager");
    visualizationManager.setMode(mode as "debug" | "presentation" | "minimal" | "performance");
    return `Visualization mode set to: ${mode}`;
  }

  @Command({
    name: "toggleVisLayer",
    description: "Toggle a specific visualization layer",
    usage: "toggleVisLayer(layer)",
    examples: [
      "toggleVisLayer('pheromones')",
      "toggleVisLayer('paths')",
      "toggleVisLayer('defense')",
      "toggleVisLayer('economy')",
      "toggleVisLayer('performance')"
    ],
    category: "Visualization"
  })
  public toggleVisLayer(layer: string): string {
    const { visualizationManager } = require("../visuals/visualizationManager");
    const { VisualizationLayer } = require("../memory/schemas");
    
    const layerMap: Record<string, number> = {
      pheromones: VisualizationLayer.Pheromones,
      paths: VisualizationLayer.Paths,
      traffic: VisualizationLayer.Traffic,
      defense: VisualizationLayer.Defense,
      economy: VisualizationLayer.Economy,
      construction: VisualizationLayer.Construction,
      performance: VisualizationLayer.Performance
    };

    const vizLayer = layerMap[layer.toLowerCase()];
    if (!vizLayer) {
      return `Unknown layer: ${layer}. Valid layers: ${Object.keys(layerMap).join(", ")}`;
    }

    visualizationManager.toggleLayer(vizLayer);
    const enabled = visualizationManager.isLayerEnabled(vizLayer);
    return `Layer ${layer}: ${enabled ? "enabled" : "disabled"}`;
  }

  @Command({
    name: "showVisPerf",
    description: "Show visualization performance metrics",
    usage: "showVisPerf()",
    examples: ["showVisPerf()"],
    category: "Visualization"
  })
  public showVisPerf(): string {
    const { visualizationManager } = require("../visuals/visualizationManager");
    const metrics = visualizationManager.getPerformanceMetrics();
    
    let result = "=== Visualization Performance ===\n";
    result += `Total CPU: ${metrics.totalCost.toFixed(3)}\n`;
    result += `% of Budget: ${metrics.percentOfBudget.toFixed(2)}%\n`;
    result += "\nPer-Layer Costs:\n";
    
    for (const [layer, cost] of Object.entries(metrics.layerCosts)) {
      const costValue = cost as number;
      if (costValue > 0) {
        result += `  ${layer}: ${costValue.toFixed(3)} CPU\n`;
      }
    }
    
    return result;
  }

  @Command({
    name: "showVisConfig",
    description: "Show current visualization configuration",
    usage: "showVisConfig()",
    examples: ["showVisConfig()"],
    category: "Visualization"
  })
  public showVisConfig(): string {
    const { visualizationManager } = require("../visuals/visualizationManager");
    const { VisualizationLayer } = require("../memory/schemas");
    const config = visualizationManager.getConfig();
    
    let result = "=== Visualization Configuration ===\n";
    result += `Mode: ${config.mode}\n`;
    result += "\nEnabled Layers:\n";
    
    const layerNames: Record<number, string> = {
      [VisualizationLayer.Pheromones]: "Pheromones",
      [VisualizationLayer.Paths]: "Paths",
      [VisualizationLayer.Traffic]: "Traffic",
      [VisualizationLayer.Defense]: "Defense",
      [VisualizationLayer.Economy]: "Economy",
      [VisualizationLayer.Construction]: "Construction",
      [VisualizationLayer.Performance]: "Performance"
    };

    for (const [value, name] of Object.entries(layerNames)) {
      const layer = parseInt(value, 10);
      const enabled = (config.enabledLayers & layer) !== 0;
      result += `  ${name}: ${enabled ? "✓" : "✗"}\n`;
    }
    
    return result;
  }

  @Command({
    name: "clearVisCache",
    description: "Clear visualization cache",
    usage: "clearVisCache(roomName?)",
    examples: ["clearVisCache()", "clearVisCache('W1N1')"],
    category: "Visualization"
  })
  public clearVisCache(roomName?: string): string {
    const { visualizationManager } = require("../visuals/visualizationManager");
    visualizationManager.clearCache(roomName);
    
    if (roomName) {
      return `Visualization cache cleared for room: ${roomName}`;
    }
    return "All visualization caches cleared";
  }
}

/**
 * Statistics commands
 */
class StatisticsCommands {
  @Command({
    name: "showStats",
    description: "Show current bot statistics from memory segment",
    usage: "showStats()",
    examples: ["showStats()"],
    category: "Statistics"
  })
  public showStats(): string {
    const stats = memorySegmentStats.getLatestStats();
    if (!stats) {
      return "No stats available yet. Wait for a few ticks.";
    }

    return `=== SwarmBot Stats (Tick ${stats.tick}) ===
CPU: ${stats.cpuUsed.toFixed(2)}/${stats.cpuLimit} (Bucket: ${stats.cpuBucket})
GCL: ${stats.gclLevel} (${(stats.gclProgress * 100).toFixed(1)}%)
GPL: ${stats.gplLevel}
Creeps: ${stats.totalCreeps}
Rooms: ${stats.totalRooms}
${stats.rooms.map(r => `  ${r.roomName}: RCL${r.rcl} | ${r.creepCount} creeps | ${r.storageEnergy}E`).join("\n")}`;
  }

  @Command({
    name: "cacheStats",
    description: "Show object cache statistics (hits, misses, hit rate, CPU savings)",
    usage: "cacheStats()",
    examples: ["cacheStats()"],
    category: "Statistics"
  })
  public cacheStats(): string {
    const { getCacheStatistics } = require("../utils/objectCache");
    const stats = getCacheStatistics();
    
    return `=== Object Cache Statistics ===
Cache Size: ${stats.size} entries
Cache Hits: ${stats.hits}
Cache Misses: ${stats.misses}
Hit Rate: ${stats.hitRate.toFixed(2)}%
Estimated CPU Saved: ${stats.cpuSaved.toFixed(3)} CPU

Performance: ${stats.hitRate >= 80 ? "Excellent" : stats.hitRate >= 60 ? "Good" : stats.hitRate >= 40 ? "Fair" : "Poor"}`;
  }

  @Command({
    name: "resetCacheStats",
    description: "Reset cache statistics counters (for benchmarking)",
    usage: "resetCacheStats()",
    examples: ["resetCacheStats()"],
    category: "Statistics"
  })
  public resetCacheStats(): string {
    const { resetCacheStats } = require("../utils/objectCache");
    resetCacheStats();
    return "Cache statistics reset";
  }

  @Command({
    name: "toggleProfiling",
    description: "Toggle CPU profiling on/off",
    usage: "toggleProfiling()",
    examples: ["toggleProfiling()"],
    category: "Statistics"
  })
  public toggleProfiling(): string {
    const config = getConfig();
    const newValue = !config.profiling;
    updateConfig({ profiling: newValue });
    profiler.setEnabled(newValue);
    configureLogger({ cpuLogging: newValue });
    return `Profiling: ${newValue ? "ENABLED" : "DISABLED"}`;
  }

  @Command({
    name: "cpuBreakdown",
    description: "Show detailed CPU breakdown by process, room, creep, and subsystem",
    usage: "cpuBreakdown(type?)",
    examples: [
      "cpuBreakdown() // Show all breakdowns",
      "cpuBreakdown('process') // Show only process breakdown",
      "cpuBreakdown('room') // Show only room breakdown",
      "cpuBreakdown('creep') // Show only creep breakdown",
      "cpuBreakdown('subsystem') // Show only subsystem breakdown"
    ],
    category: "Statistics"
  })
  public cpuBreakdown(type?: string): string {
    const mem = Memory as unknown as Record<string, any>;
    const stats = mem.stats;
    
    if (!stats) {
      return "No stats available. Stats collection may be disabled.";
    }

    const showAll = !type;
    const lines: string[] = ["=== CPU Breakdown ==="];
    lines.push(`Tick: ${stats.tick}`);
    lines.push(`Total CPU: ${stats.cpu.used.toFixed(2)}/${stats.cpu.limit} (${stats.cpu.percent.toFixed(1)}%)`);
    lines.push(`Bucket: ${stats.cpu.bucket}`);
    lines.push("");

    // Process breakdown
    if (showAll || type === "process") {
      const processes = stats.processes || {};
      const processList = Object.values(processes) as any[];
      if (processList.length > 0) {
        lines.push("=== Process CPU Usage ===");
        const sorted = processList.sort((a: any, b: any) => b.avg_cpu - a.avg_cpu);
        for (const proc of sorted.slice(0, 10)) {
          const procAny = proc as any;
          lines.push(`  ${procAny.name}: ${procAny.avg_cpu.toFixed(3)} CPU (runs: ${procAny.run_count}, max: ${procAny.max_cpu.toFixed(3)})`);
        }
        lines.push("");
      }
    }

    // Room breakdown
    if (showAll || type === "room") {
      const rooms = stats.rooms || {};
      const roomList = Object.values(rooms) as any[];
      if (roomList.length > 0) {
        lines.push("=== Room CPU Usage ===");
        const sorted = roomList.sort((a: any, b: any) => b.profiler.avg_cpu - a.profiler.avg_cpu);
        for (const room of sorted) {
          const roomAny = room as any;
          const roomName = roomAny.name || 'unknown';
          lines.push(`  ${roomName}: ${roomAny.profiler.avg_cpu.toFixed(3)} CPU (RCL ${roomAny.rcl})`);
        }
        lines.push("");
      }
    }

    // Subsystem breakdown
    if (showAll || type === "subsystem") {
      const subsystems = stats.subsystems || {};
      const subsystemList = Object.values(subsystems) as any[];
      if (subsystemList.length > 0) {
        lines.push("=== Subsystem CPU Usage ===");
        const sorted = subsystemList.sort((a: any, b: any) => b.avg_cpu - a.avg_cpu);
        for (const subsys of sorted.slice(0, 10)) {
          const subsysAny = subsys as any;
          const subsysName = subsysAny.name || 'unknown';
          lines.push(`  ${subsysName}: ${subsysAny.avg_cpu.toFixed(3)} CPU (calls: ${subsysAny.calls})`);
        }
        lines.push("");
      }
    }

    // Creep breakdown (top 10)
    if (showAll || type === "creep") {
      const creeps = stats.creeps || {};
      const creepList = Object.values(creeps) as any[];
      if (creepList.length > 0) {
        lines.push("=== Top Creeps by CPU (Top 10) ===");
        const sorted = creepList.sort((a: any, b: any) => b.cpu - a.cpu);
        for (const creep of sorted.slice(0, 10)) {
          const creepAny = creep as any;
          if (creepAny.cpu > 0) {
            const creepName = creepAny.name || `${creepAny.role}_unknown`;
            lines.push(`  ${creepName} (${creepAny.role}): ${creepAny.cpu.toFixed(3)} CPU in ${creepAny.current_room}`);
          }
        }
        lines.push("");
      }
    }

    return lines.join("\n");
  }
}

/**
 * Configuration commands
 */
class ConfigurationCommands {
  @Command({
    name: "showConfig",
    description: "Show current bot configuration",
    usage: "showConfig()",
    examples: ["showConfig()"],
    category: "Configuration"
  })
  public showConfig(): string {
    const config = getConfig();
    const loggerConfig = getLoggerConfig();
    return `=== SwarmBot Config ===
Debug: ${String(config.debug)}
Profiling: ${String(config.profiling)}
Visualizations: ${String(config.visualizations)}
Logger Level: ${LogLevel[loggerConfig.level]}
CPU Logging: ${String(loggerConfig.cpuLogging)}`;
  }
}

/**
 * Kernel commands
 */
class KernelCommands {
  @Command({
    name: "showKernelStats",
    description: "Show kernel statistics including CPU usage and process info",
    usage: "showKernelStats()",
    examples: ["showKernelStats()"],
    category: "Kernel"
  })
  public showKernelStats(): string {
    const stats = kernel.getStatsSummary();
    const config = kernel.getConfig();
    const bucketMode = kernel.getBucketMode();

    let output = `=== Kernel Stats ===
Bucket Mode: ${bucketMode.toUpperCase()}
CPU Bucket: ${Game.cpu.bucket}
CPU Limit: ${kernel.getCpuLimit().toFixed(2)} (${(config.targetCpuUsage * 100).toFixed(0)}% of ${Game.cpu.limit})
Remaining CPU: ${kernel.getRemainingCpu().toFixed(2)}

Processes: ${stats.totalProcesses} total (${stats.activeProcesses} active, ${stats.suspendedProcesses} suspended)
Total CPU Used: ${stats.totalCpuUsed.toFixed(3)}
Avg CPU/Process: ${stats.avgCpuPerProcess.toFixed(4)}
Avg Health Score: ${stats.avgHealthScore.toFixed(1)}/100

Top CPU Consumers:`;

    for (const proc of stats.topCpuProcesses) {
      output += `\n  ${proc.name}: ${proc.avgCpu.toFixed(4)} avg CPU`;
    }

    if (stats.unhealthyProcesses.length > 0) {
      output += "\n\nUnhealthy Processes (Health < 50):";
      for (const proc of stats.unhealthyProcesses) {
        output += `\n  ${proc.name}: ${proc.healthScore.toFixed(1)}/100 (${proc.consecutiveErrors} consecutive errors)`;
      }
    }

    return output;
  }

  @Command({
    name: "listProcesses",
    description: "List all registered kernel processes",
    usage: "listProcesses()",
    examples: ["listProcesses()"],
    category: "Kernel"
  })
  public listProcesses(): string {
    const processes = kernel.getProcesses();

    if (processes.length === 0) {
      return "No processes registered with kernel.";
    }

    let output = "=== Registered Processes ===\n";
    output += "ID | Name | Priority | Frequency | State | Runs | Avg CPU | Health | Errors\n";
    output += "-".repeat(100) + "\n";

    const sorted = [...processes].sort((a, b) => b.priority - a.priority);

    for (const p of sorted) {
      const avgCpu = p.stats.avgCpu.toFixed(4);
      const health = p.stats.healthScore.toFixed(0);
      const healthIndicator = p.stats.healthScore >= 80 ? "✓" : p.stats.healthScore >= 50 ? "⚠" : "✗";
      output += `${p.id} | ${p.name} | ${p.priority} | ${p.frequency} | ${p.state} | ${p.stats.runCount} | ${avgCpu} | ${healthIndicator}${health} | ${p.stats.errorCount}(${p.stats.consecutiveErrors})\n`;
    }

    return output;
  }

  @Command({
    name: "suspendProcess",
    description: "Suspend a kernel process by ID",
    usage: "suspendProcess(processId)",
    examples: ["suspendProcess('empire:manager')", "suspendProcess('cluster:manager')"],
    category: "Kernel"
  })
  public suspendProcess(processId: string): string {
    const success = kernel.suspendProcess(processId);
    if (success) {
      return `Process "${processId}" suspended.`;
    }
    return `Process "${processId}" not found.`;
  }

  @Command({
    name: "resumeProcess",
    description: "Resume a suspended kernel process",
    usage: "resumeProcess(processId)",
    examples: ["resumeProcess('empire:manager')"],
    category: "Kernel"
  })
  public resumeProcess(processId: string): string {
    const success = kernel.resumeProcess(processId);
    if (success) {
      return `Process "${processId}" resumed.`;
    }
    return `Process "${processId}" not found or not suspended.`;
  }

  @Command({
    name: "resetKernelStats",
    description: "Reset all kernel process statistics",
    usage: "resetKernelStats()",
    examples: ["resetKernelStats()"],
    category: "Kernel"
  })
  public resetKernelStats(): string {
    kernel.resetStats();
    return "Kernel statistics reset.";
  }

  @Command({
    name: "showProcessHealth",
    description: "Show health status of all processes with detailed metrics",
    usage: "showProcessHealth()",
    examples: ["showProcessHealth()"],
    category: "Kernel"
  })
  public showProcessHealth(): string {
    const processes = kernel.getProcesses();

    if (processes.length === 0) {
      return "No processes registered with kernel.";
    }

    // Sort by health score (ascending - worst first)
    const sorted = [...processes].sort((a, b) => a.stats.healthScore - b.stats.healthScore);

    let output = "=== Process Health Status ===\n";
    output += "Name | Health | Errors | Consecutive | Status | Last Success\n";
    output += "-".repeat(80) + "\n";

    for (const p of sorted) {
      const health = p.stats.healthScore.toFixed(0);
      const healthIcon = p.stats.healthScore >= 80 ? "✓" : p.stats.healthScore >= 50 ? "⚠" : "✗";
      const ticksSinceSuccess = p.stats.lastSuccessfulRunTick > 0 
        ? Game.time - p.stats.lastSuccessfulRunTick 
        : "never";
      const status = p.state === "suspended" 
        ? `SUSPENDED (${p.stats.suspensionReason})` 
        : p.state.toUpperCase();
      
      output += `${p.name} | ${healthIcon} ${health}/100 | ${p.stats.errorCount} | ${p.stats.consecutiveErrors} | ${status} | ${ticksSinceSuccess}\n`;
    }

    const stats = kernel.getStatsSummary();
    output += `\nAverage Health: ${stats.avgHealthScore.toFixed(1)}/100`;
    output += `\nSuspended Processes: ${stats.suspendedProcesses}`;

    return output;
  }

  @Command({
    name: "resumeAllProcesses",
    description: "Resume all suspended processes (use with caution)",
    usage: "resumeAllProcesses()",
    examples: ["resumeAllProcesses()"],
    category: "Kernel"
  })
  public resumeAllProcesses(): string {
    const processes = kernel.getProcesses();
    const suspended = processes.filter(p => p.state === "suspended");
    
    if (suspended.length === 0) {
      return "No suspended processes to resume.";
    }

    let resumed = 0;
    for (const p of suspended) {
      if (kernel.resumeProcess(p.id)) {
        resumed++;
      }
    }

    return `Resumed ${resumed} of ${suspended.length} suspended processes.`;
  }

  @Command({
    name: "showCreepStats",
    description: "Show statistics about creep processes managed by the kernel",
    usage: "showCreepStats()",
    examples: ["showCreepStats()"],
    category: "Kernel"
  })
  public showCreepStats(): string {
    const stats = creepProcessManager.getStats();
    
    let output = `=== Creep Process Stats ===
Total Creeps: ${stats.totalCreeps}
Registered Processes: ${stats.registeredCreeps}

Creeps by Priority:`;

    for (const [priority, count] of Object.entries(stats.creepsByPriority)) {
      output += `\n  ${priority}: ${count}`;
    }

    return output;
  }

  @Command({
    name: "showRoomStats",
    description: "Show statistics about room processes managed by the kernel",
    usage: "showRoomStats()",
    examples: ["showRoomStats()"],
    category: "Kernel"
  })
  public showRoomStats(): string {
    const stats = roomProcessManager.getStats();
    
    let output = `=== Room Process Stats ===
Total Rooms: ${stats.totalRooms}
Registered Processes: ${stats.registeredRooms}
Owned Rooms: ${stats.ownedRooms}

Rooms by Priority:`;

    for (const [priority, count] of Object.entries(stats.roomsByPriority)) {
      output += `\n  ${priority}: ${count}`;
    }

    return output;
  }

  @Command({
    name: "listCreepProcesses",
    description: "List all creep processes with their details",
    usage: "listCreepProcesses(role?)",
    examples: ["listCreepProcesses()", "listCreepProcesses('harvester')"],
    category: "Kernel"
  })
  public listCreepProcesses(role?: string): string {
    const allProcesses = kernel.getProcesses();
    let creepProcesses = allProcesses.filter(p => p.id.startsWith("creep:"));
    
    if (role) {
      creepProcesses = creepProcesses.filter(p => p.name.includes(`(${role})`));
    }

    if (creepProcesses.length === 0) {
      return role 
        ? `No creep processes found with role: ${role}`
        : "No creep processes registered.";
    }

    let output = role 
      ? `=== Creep Processes (Role: ${role}) ===\n`
      : "=== All Creep Processes ===\n";
    output += "Name | Priority | Runs | Avg CPU | Errors\n";
    output += "-".repeat(70) + "\n";

    const sorted = [...creepProcesses].sort((a, b) => b.priority - a.priority);

    for (const p of sorted) {
      const avgCpu = p.stats.avgCpu.toFixed(4);
      output += `${p.name} | ${p.priority} | ${p.stats.runCount} | ${avgCpu} | ${p.stats.errorCount}\n`;
    }

    output += `\nTotal: ${creepProcesses.length} creep processes`;

    return output;
  }

  @Command({
    name: "listRoomProcesses",
    description: "List all room processes with their details",
    usage: "listRoomProcesses()",
    examples: ["listRoomProcesses()"],
    category: "Kernel"
  })
  public listRoomProcesses(): string {
    const allProcesses = kernel.getProcesses();
    const roomProcesses = allProcesses.filter(p => p.id.startsWith("room:"));

    if (roomProcesses.length === 0) {
      return "No room processes registered.";
    }

    let output = "=== Room Processes ===\n";
    output += "Name | Priority | Runs | Avg CPU | Errors\n";
    output += "-".repeat(70) + "\n";

    const sorted = [...roomProcesses].sort((a, b) => b.priority - a.priority);

    for (const p of sorted) {
      const avgCpu = p.stats.avgCpu.toFixed(4);
      output += `${p.name} | ${p.priority} | ${p.stats.runCount} | ${avgCpu} | ${p.stats.errorCount}\n`;
    }

    output += `\nTotal: ${roomProcesses.length} room processes`;

    return output;
  }
}

/**
 * System commands
 */
class SystemCommands {
  @Command({
    name: "listCommands",
    description: "List all available commands (alias for help)",
    usage: "listCommands()",
    examples: ["listCommands()"],
    category: "System"
  })
  public listCommands(): string {
    return commandRegistry.generateHelp();
  }

  @Command({
    name: "commandHelp",
    description: "Get detailed help for a specific command",
    usage: "commandHelp(commandName)",
    examples: ["commandHelp('setLogLevel')", "commandHelp('suspendProcess')"],
    category: "System"
  })
  public commandHelp(commandName: string): string {
    return commandRegistry.generateCommandHelp(commandName);
  }
}

// =============================================================================
// Command instances (singletons)
// =============================================================================

const loggingCommands = new LoggingCommands();
const visualizationCommands = new VisualizationCommands();
const statisticsCommands = new StatisticsCommands();
const configurationCommands = new ConfigurationCommands();
const kernelCommands = new KernelCommands();
const systemCommands = new SystemCommands();

/**
 * Register all console commands with the command registry
 * @param lazy - If true, defer actual registration until first command is used
 */
export function registerAllConsoleCommands(lazy = false): void {
  const doRegistration = (): void => {
    // Initialize command registry first
    commandRegistry.initialize();

    // Register decorated commands from all command class instances
    registerDecoratedCommands(loggingCommands);
    registerDecoratedCommands(visualizationCommands);
    registerDecoratedCommands(statisticsCommands);
    registerDecoratedCommands(configurationCommands);
    registerDecoratedCommands(kernelCommands);
    registerDecoratedCommands(systemCommands);

    // Register advanced system commands
    registerDecoratedCommands(labCommands);
    registerDecoratedCommands(marketCommands);
    registerDecoratedCommands(powerCommands);
    registerDecoratedCommands(shardCommands);

    // Expose all commands to global scope
    commandRegistry.exposeToGlobal();
  };

  if (lazy) {
    // Initialize command registry with just the help command
    commandRegistry.initialize();
    // Enable lazy loading - commands will be registered on first access
    commandRegistry.enableLazyLoading(doRegistration);
    // Expose just the help command initially
    commandRegistry.exposeToGlobal();
  } else {
    // Immediate registration
    doRegistration();
  }
}

// Export command classes for potential extension
export {
  loggingCommands,
  visualizationCommands,
  statisticsCommands,
  configurationCommands,
  kernelCommands,
  systemCommands,
  labCommands,
  marketCommands,
  powerCommands,
  shardCommands
};
