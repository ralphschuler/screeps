/**
 * Statistics Console Commands
 *
 * Commands for viewing bot statistics, CPU usage, and performance metrics.
 * Extracted from consoleCommands.ts for better modularity.
 */

import { Command } from "../commandRegistry";
import { memorySegmentStats, unifiedStats } from "@ralphschuler/screeps-stats";
import { getConfig, updateConfig } from "../../config";
import { configureLogger } from "../logger";
import { getCacheStatistics, resetCacheStats } from "@ralphschuler/screeps-cache";
import { getRoomFindCacheStats, clearRoomFindCache } from "@ralphschuler/screeps-cache";
import { memoryManager } from "../../memory/manager";

/**
 * Statistics commands
 */
export class StatisticsCommands {
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
      const creepMemory = creep.memory as { role?: string };
      const role = creepMemory.role ?? 'unknown';
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
