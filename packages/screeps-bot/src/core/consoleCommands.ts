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
import { memorySegmentStats, unifiedStats } from "@ralphschuler/screeps-stats";
import { getConfig, updateConfig } from "../config";
import { roomVisualizer, mapVisualizer } from "../SwarmBot";
import { creepProcessManager } from "./creepProcessManager";
import { roomProcessManager } from "./roomProcessManager";
import { labCommands, marketCommands, powerCommands } from "./advancedSystemCommands";
import { shardCommands } from "./shardCommands";
import { economyCommands } from "../economy/economyCommands";
import { expansionCommands } from "../empire/expansionCommands";
import { tooAngelCommands } from "../empire/tooangel/consoleCommands";
import { memoryCommands } from "../memory/memoryCommands";
import { memoryManager } from "../memory/manager";
import { UICommands } from "./uiCommands";
import { visualizationManager } from "../visuals/visualizationManager";
import { VisualizationLayer } from "../memory/schemas";
import { getCacheStatistics, resetCacheStats } from "../cache/domains/ObjectCache";
import { getRoomFindCacheStats, clearRoomFindCache } from "../cache/domains/RoomFindCache";
import { globalCache } from "../cache";
import { LoggingCommands } from "./commands/LoggingCommands";
import { SystemCommands } from "./commands/SystemCommands";
import { ConfigurationCommands } from "./commands/ConfigurationCommands";

/**
 * Logging commands - imported from commands/LoggingCommands.ts
 */
// Re-export for backward compatibility
export { LoggingCommands } from "./commands/LoggingCommands";

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
    const stats = getCacheStatistics();
    
    return `=== Object Cache Statistics ===
Cache Size: ${stats.size} entries
Cache Hits: ${stats.hits}
Cache Misses: ${stats.misses}
Hit Rate: ${stats.hitRate.toFixed(2)}%
Estimated CPU Saved: ${(stats.cpuSaved ?? 0).toFixed(3)} CPU

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
    resetCacheStats();
    return "Cache statistics reset";
  }

  @Command({
    name: "roomFindCacheStats",
    description: "Show room.find() cache statistics (hits, misses, hit rate)",
    usage: "roomFindCacheStats()",
    examples: ["roomFindCacheStats()"],
    category: "Statistics"
  })
  public roomFindCacheStats(): string {
    const stats = getRoomFindCacheStats();
    
    const hitRatePercent = (stats.hitRate * 100).toFixed(2);
    const totalQueries = stats.hits + stats.misses;
    const avgEntriesPerRoom = stats.rooms > 0 ? (stats.totalEntries / stats.rooms).toFixed(1) : "0";
    
    // Estimate CPU saved (conservative estimate: 0.05 CPU per cache hit)
    const estimatedCpuSaved = (stats.hits * 0.05).toFixed(3);
    
    return `=== Room.find() Cache Statistics ===
Cached Rooms: ${stats.rooms}
Total Entries: ${stats.totalEntries}
Avg Entries/Room: ${avgEntriesPerRoom}

Total Queries: ${totalQueries}
Cache Hits: ${stats.hits}
Cache Misses: ${stats.misses}
Hit Rate: ${hitRatePercent}%

Cache Invalidations: ${stats.invalidations}
Estimated CPU Saved: ~${estimatedCpuSaved} CPU this tick

Performance: ${stats.hitRate >= 0.8 ? "Excellent ✓" : stats.hitRate >= 0.6 ? "Good" : stats.hitRate >= 0.5 ? "Fair" : "Poor - Consider more caching"}`;
  }

  @Command({
    name: "clearRoomFindCache",
    description: "Clear all room.find() cache entries and reset stats",
    usage: "clearRoomFindCache()",
    examples: ["clearRoomFindCache()"],
    category: "Statistics"
  })
  public clearRoomFindCache(): string {
    clearRoomFindCache();
    return "Room.find() cache cleared and statistics reset";
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
    unifiedStats.setEnabled(newValue);
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

  @Command({
    name: "cpuBudget",
    description: "Show CPU budget status and violations for all rooms",
    usage: "cpuBudget()",
    examples: ["cpuBudget()"],
    category: "Statistics"
  })
  public cpuBudget(): string {
    const report = unifiedStats.validateBudgets();
    
    let result = `=== CPU Budget Report (Tick ${report.tick}) ===\n`;
    result += `Rooms Evaluated: ${report.roomsEvaluated}\n`;
    result += `Within Budget: ${report.roomsWithinBudget}\n`;
    result += `Over Budget: ${report.roomsOverBudget}\n\n`;
    
    if (report.alerts.length === 0) {
      result += "✓ All rooms within budget!\n";
    } else {
      result += `Alerts: ${report.alerts.length}\n`;
      
      const critical = report.alerts.filter(a => a.severity === "critical");
      const warnings = report.alerts.filter(a => a.severity === "warning");
      
      if (critical.length > 0) {
        result += "\n🔴 CRITICAL (≥100% of budget):\n";
        for (const alert of critical) {
          result += `  ${alert.target}: ${alert.cpuUsed.toFixed(3)} CPU / ${alert.budgetLimit.toFixed(3)} limit (${(alert.percentUsed * 100).toFixed(1)}%)\n`;
        }
      }
      
      if (warnings.length > 0) {
        result += "\n⚠️  WARNING (≥80% of budget):\n";
        for (const alert of warnings) {
          result += `  ${alert.target}: ${alert.cpuUsed.toFixed(3)} CPU / ${alert.budgetLimit.toFixed(3)} limit (${(alert.percentUsed * 100).toFixed(1)}%)\n`;
        }
      }
    }
    
    return result;
  }

  @Command({
    name: "cpuAnomalies",
    description: "Detect and show CPU usage anomalies (spikes and sustained high usage)",
    usage: "cpuAnomalies()",
    examples: ["cpuAnomalies()"],
    category: "Statistics"
  })
  public cpuAnomalies(): string {
    const anomalies = unifiedStats.detectAnomalies();
    
    if (anomalies.length === 0) {
      return "✓ No CPU anomalies detected";
    }
    
    let result = `=== CPU Anomalies Detected: ${anomalies.length} ===\n\n`;
    
    const spikes = anomalies.filter(a => a.type === "spike");
    const sustained = anomalies.filter(a => a.type === "sustained_high");
    
    if (spikes.length > 0) {
      result += `⚡ CPU Spikes (${spikes.length}):\n`;
      for (const anomaly of spikes) {
        result += `  ${anomaly.target}: ${anomaly.current.toFixed(3)} CPU (${anomaly.multiplier.toFixed(1)}x baseline ${anomaly.baseline.toFixed(3)})\n`;
        if (anomaly.context) {
          result += `    Context: ${anomaly.context}\n`;
        }
      }
      result += "\n";
    }
    
    if (sustained.length > 0) {
      result += `📊 Sustained High Usage (${sustained.length}):\n`;
      for (const anomaly of sustained) {
        result += `  ${anomaly.target}: ${anomaly.current.toFixed(3)} CPU (${anomaly.multiplier.toFixed(1)}x budget ${anomaly.baseline.toFixed(3)})\n`;
        if (anomaly.context) {
          result += `    Context: ${anomaly.context}\n`;
        }
      }
    }
    
    return result;
  }

  @Command({
    name: "cpuProfile",
    description: "Show comprehensive CPU profiling breakdown by room and subsystem",
    usage: "cpuProfile(showAll?)",
    examples: ["cpuProfile()", "cpuProfile(true)"],
    category: "Statistics"
  })
  public cpuProfile(showAll = false): string {
    const snapshot = unifiedStats.getCurrentSnapshot();
    
    let result = `=== CPU Profile (Tick ${snapshot.tick}) ===\n`;
    result += `Total: ${snapshot.cpu.used.toFixed(2)} / ${snapshot.cpu.limit} (${snapshot.cpu.percent.toFixed(1)}%)\n`;
    result += `Bucket: ${snapshot.cpu.bucket}\n`;
    result += `Heap: ${snapshot.cpu.heapUsed.toFixed(2)} MB\n\n`;
    
    // Room breakdown
    const rooms = Object.values(snapshot.rooms).sort((a, b) => b.profiler.avgCpu - a.profiler.avgCpu);
    const topRooms = showAll ? rooms : rooms.slice(0, 10);
    
    result += `Top ${topRooms.length} Rooms by CPU:\n`;
    for (const room of topRooms) {
      const posture = unifiedStats.postureCodeToName(room.brain.postureCode);
      result += `  ${room.name} (RCL${room.rcl}, ${posture}): avg ${room.profiler.avgCpu.toFixed(3)} | peak ${room.profiler.peakCpu.toFixed(3)} | samples ${room.profiler.samples}\n`;
    }
    
    // Process breakdown
    result += `\nTop Kernel Processes by CPU:\n`;
    const processes = Object.values(snapshot.processes)
      .filter(p => p.avgCpu > 0.001)
      .sort((a, b) => b.avgCpu - a.avgCpu)
      .slice(0, showAll ? 999 : 10);
    
    for (const proc of processes) {
      const budgetPct = proc.cpuBudget > 0 ? ((proc.avgCpu / proc.cpuBudget) * 100).toFixed(0) : "N/A";
      result += `  ${proc.name} (${proc.frequency}): avg ${proc.avgCpu.toFixed(3)} / budget ${proc.cpuBudget.toFixed(3)} (${budgetPct}%)\n`;
    }
    
    return result;
  }

  @Command({
    name: "diagnoseRoom",
    description: "Comprehensive diagnostic for a specific room showing CPU usage, budget status, and potential issues",
    usage: "diagnoseRoom(roomName)",
    examples: ["diagnoseRoom('W16S52')", "diagnoseRoom('E1S1')"],
    category: "Statistics"
  })
  public diagnoseRoom(roomName: string): string {
    if (!roomName) {
      return "Error: Room name required. Usage: diagnoseRoom('W16S52')";
    }

    const room = Game.rooms[roomName];
    if (!room) {
      return `Error: Room ${roomName} not visible. Make sure you have vision in this room.`;
    }

    const snapshot = unifiedStats.getCurrentSnapshot();
    const roomStats = snapshot.rooms[roomName];
    
    if (!roomStats) {
      return `Error: No stats available for ${roomName}. The room may not have been processed yet.`;
    }

    // Get room process info
    const processId = `room:${roomName}`;
    const roomProcess = snapshot.processes[processId];
    
    // Get budget limit
    const swarm = memoryManager.getSwarmState(roomName);
    const isWarRoom = swarm && (swarm.posture === "war" || swarm.posture === "siege" || swarm.danger >= 2);
    const baseBudget = isWarRoom ? 0.25 : 0.1;
    const tickModulo = roomProcess?.tickModulo ?? 1;
    const adjustedBudget = baseBudget * tickModulo;
    
    let result = `═══════════════════════════════════════════════\n`;
    result += `  Room Diagnostic: ${roomName}\n`;
    result += `═══════════════════════════════════════════════\n\n`;
    
    // Basic Info
    result += `📊 Basic Info:\n`;
    result += `  RCL: ${roomStats.rcl}\n`;
    result += `  Controller Progress: ${roomStats.controller.progressPercent.toFixed(1)}%\n`;
    result += `  Posture: ${unifiedStats.postureCodeToName(roomStats.brain.postureCode)}\n`;
    result += `  Danger Level: ${roomStats.brain.dangerLevel}\n`;
    result += `  Hostiles: ${roomStats.metrics.hostileCount}\n\n`;
    
    // CPU Analysis
    result += `⚡ CPU Analysis:\n`;
    result += `  Average CPU: ${roomStats.profiler.avgCpu.toFixed(3)}\n`;
    result += `  Peak CPU: ${roomStats.profiler.peakCpu.toFixed(3)}\n`;
    result += `  Samples: ${roomStats.profiler.samples}\n`;
    result += `  Budget: ${adjustedBudget.toFixed(3)} (base ${baseBudget}, modulo ${tickModulo})\n`;
    
    const cpuPercent = (roomStats.profiler.avgCpu / adjustedBudget) * 100;
    const status = cpuPercent >= 100 ? "🔴 CRITICAL" : cpuPercent >= 80 ? "⚠️  WARNING" : "✅ OK";
    result += `  Status: ${status} (${cpuPercent.toFixed(1)}% of budget)\n`;
    
    if (tickModulo > 1) {
      result += `  Note: Room runs every ${tickModulo} ticks (distributed execution)\n`;
    }
    result += `\n`;
    
    // Process Info
    if (roomProcess) {
      result += `🔧 Process Info:\n`;
      result += `  Process ID: ${roomProcess.id}\n`;
      result += `  State: ${roomProcess.state}\n`;
      result += `  Priority: ${roomProcess.priority}\n`;
      result += `  Run Count: ${roomProcess.runCount}\n`;
      result += `  Skipped: ${roomProcess.skippedCount}\n`;
      result += `  Errors: ${roomProcess.errorCount}\n`;
      result += `  Last Run: Tick ${roomProcess.lastRunTick} (${Game.time - roomProcess.lastRunTick} ticks ago)\n\n`;
    }
    
    // Creeps Analysis
    const creepsInRoom = Object.values(Game.creeps).filter(c => c.room.name === roomName);
    result += `👥 Creeps: ${creepsInRoom.length} total\n`;
    
    const creepsByRole: Record<string, number> = {};
    for (const creep of creepsInRoom) {
      const role = (creep.memory as any).role || 'unknown';
      creepsByRole[role] = (creepsByRole[role] || 0) + 1;
    }
    
    const roleList = Object.entries(creepsByRole)
      .sort((a, b) => b[1] - a[1])
      .map(([role, count]) => `${role}: ${count}`)
      .join(', ');
    result += `  By Role: ${roleList}\n\n`;
    
    // Metrics
    result += `📈 Metrics:\n`;
    result += `  Energy Harvested: ${roomStats.metrics.energyHarvested}\n`;
    result += `  Energy in Storage: ${roomStats.energy.storage}\n`;
    result += `  Energy Capacity: ${roomStats.metrics.energyCapacityTotal}\n`;
    result += `  Construction Sites: ${roomStats.metrics.constructionSites}\n\n`;
    
    // Recommendations
    result += `💡 Recommendations:\n`;
    
    if (cpuPercent >= 150) {
      result += `  ⚠️  CRITICAL: CPU usage is ${cpuPercent.toFixed(0)}% of budget!\n`;
      result += `     - Check for infinite loops or stuck creeps\n`;
      result += `     - Review construction sites (${roomStats.metrics.constructionSites} active)\n`;
      result += `     - Consider reducing creep count (${creepsInRoom.length} creeps)\n`;
    } else if (cpuPercent >= 100) {
      result += `  ⚠️  Room is over budget. Consider optimizations:\n`;
      result += `     - Reduce creep count if excessive (currently ${creepsInRoom.length})\n`;
      result += `     - Limit construction sites (currently ${roomStats.metrics.constructionSites})\n`;
      result += `     - Review pathfinding (check for recalculation issues)\n`;
    } else if (cpuPercent >= 80) {
      result += `  ℹ️  Room is nearing budget limit (${cpuPercent.toFixed(1)}%)\n`;
      result += `     - Monitor for increases in CPU usage\n`;
    } else {
      result += `  ✅ Room is performing well within budget\n`;
    }
    
    if (roomStats.metrics.hostileCount > 0) {
      result += `  ⚠️  ${roomStats.metrics.hostileCount} hostiles detected - defense active\n`;
      result += `     - War mode increases CPU budget to ${isWarRoom ? adjustedBudget.toFixed(3) : (0.25 * tickModulo).toFixed(3)}\n`;
    }
    
    result += `\n`;
    result += `Use cpuBreakdown('room') to see all rooms\n`;
    result += `Use cpuProfile() for detailed profiling`;
    
    return result;
  }
}

/**
 * Configuration commands - imported from commands/ConfigurationCommands.ts
 */
export { ConfigurationCommands } from "./commands/ConfigurationCommands";

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
 * System commands - imported from commands/SystemCommands.ts
 */
export { SystemCommands } from "./commands/SystemCommands";

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
    registerDecoratedCommands(economyCommands);
    registerDecoratedCommands(expansionCommands);
    registerDecoratedCommands(memoryCommands);

    // Register TooAngel commands as global object
    (global as unknown as Record<string, unknown>).tooangel = tooAngelCommands;

    // Expose utility modules to global for use in UI command strings
    // These are needed because Screeps doesn't support require() at runtime
    const g = global as unknown as Record<string, unknown>;
    g.botConfig = { getConfig, updateConfig };
    g.botLogger = { configureLogger };
    g.botVisualizationManager = visualizationManager;
    g.botCacheManager = globalCache;

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
  shardCommands,
  expansionCommands,
  tooAngelCommands,
  memoryCommands,
  UICommands
};
