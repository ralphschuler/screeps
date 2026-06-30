/**
 * Statistics Console Commands
 *
 * Commands for viewing bot statistics, CPU usage, and performance metrics.
 * Extracted from consoleCommands.ts for better modularity.
 */

import {
  clearRoomFindCache,
  getCacheStatistics,
  getRoomFindCacheStats,
  resetCacheStats
} from "@ralphschuler/screeps-cache";
import { memoryManager } from "@ralphschuler/screeps-memory";
import { memorySegmentStats, unifiedStats } from "@ralphschuler/screeps-stats";
import { getConfig, updateConfig } from "../../config";
import { Command } from "../commandRegistry";
import { configureLogger } from "../logger";

type StatsRecord = Record<string, unknown>;

interface StatsMemoryView {
  stats?: StatsRecord & {
    cpu_details?: CpuDetailsSnapshot;
    cpu?: StatsRecord;
    processes?: Record<string, CpuBreakdownProcess>;
    rooms?: Record<string, CpuBreakdownRoom>;
    subsystems?: Record<string, CpuBreakdownSubsystem>;
    creeps?: Record<string, CpuBreakdownCreep>;
  };
}

interface CpuDetailsSnapshot {
  enabled?: unknown;
  expires_tick?: unknown;
  sample_rate?: unknown;
  labels?: unknown[];
  entries?: Record<string, CpuDetailEntry>;
}

interface CpuDetailEntry extends StatsRecord {
  avg_cpu?: unknown;
  total_cpu?: unknown;
  max_cpu?: unknown;
  calls?: unknown;
}

interface CpuBreakdownProcess extends StatsRecord {
  name?: unknown;
  avg_cpu?: unknown;
  avgCpu?: unknown;
  max_cpu?: unknown;
  maxCpu?: unknown;
  run_count?: unknown;
  runCount?: unknown;
}

interface CpuBreakdownRoom extends StatsRecord {
  name?: unknown;
  roomName?: unknown;
  rcl?: unknown;
  profiler?: StatsRecord;
}

interface CpuBreakdownSubsystem extends StatsRecord {
  name?: unknown;
  avg_cpu?: unknown;
  avgCpu?: unknown;
  calls?: unknown;
  callCount?: unknown;
}

interface CpuBreakdownCreep extends StatsRecord {
  name?: unknown;
  role?: unknown;
  cpu?: unknown;
  current_room?: unknown;
  currentRoom?: unknown;
}

/**
 * Statistics commands
 */
export class StatisticsCommands {
  private toNumber(value: unknown): number | undefined {
    if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  }

  private toNumberOrZero(value: unknown): number {
    return this.toNumber(value) ?? 0;
  }

  private sumNumericValues(value: unknown): number {
    if (value == null) return 0;

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    if (Array.isArray(value)) {
      return value.reduce((sum, item) => sum + this.sumNumericValues(item), 0);
    }

    if (typeof value === "object") {
      return Object.values(value as Record<string, unknown>).reduce<number>((sum, item) => sum + this.sumNumericValues(item), 0);
    }

    return 0;
  }

  private asRecord(value: unknown): StatsRecord | undefined {
    return value && typeof value === "object" ? value as StatsRecord : undefined;
  }

  private getStatsValue(stats: unknown, key: string): number | undefined {
    return this.toNumber(this.asRecord(stats)?.[key]);
  }

  private getRoomBrainMetrics(roomStats: unknown): {
    postureCode: number;
    dangerLevel: number;
    hostileCount: number;
  } {
    const typedRoom = (roomStats ?? {}) as {
      brain?: {
        danger?: unknown;
        dangerLevel?: unknown;
        postureCode?: unknown;
        posture_code?: unknown;
      };
      metrics?: {
        hostileCount?: unknown;
        hostile_count?: unknown;
      };
      hostiles?: unknown;
    };

    const roomBrain = typedRoom.brain ?? {};
    const postureCode = this.toNumber(roomBrain.postureCode) ?? this.toNumber(roomBrain.posture_code) ?? 0;
    const dangerLevel = this.toNumber(roomBrain.danger) ?? this.toNumber(roomBrain.dangerLevel) ?? 0;
    const hostileCount = this.toNumber(typedRoom.metrics?.hostileCount)
      ?? this.toNumber(typedRoom.metrics?.hostile_count)
      ?? this.toNumber(typedRoom.hostiles)
      ?? 0;

    return { postureCode, dangerLevel, hostileCount };
  }

  private getRoomMetricValue(roomStats: unknown, camelKey: string, snakeKey: string): number {
    const metrics = this.asRecord(this.asRecord(roomStats)?.metrics);
    const energyMetrics = this.asRecord(metrics?.energy);
    return this.toNumber(metrics?.[camelKey])
      ?? this.toNumber(energyMetrics?.[snakeKey])
      ?? this.toNumber(metrics?.[snakeKey])
      ?? 0;
  }

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

Performance: ${stats.hitRate >= 0.8 ? "Excellent OK" : stats.hitRate >= 0.6 ? "Good" : stats.hitRate >= 0.5 ? "Fair" : "Poor - Consider more caching"}`;
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
    name: "enableCpuDetails",
    description: "Enable temporary fine-grained CPU detail profiling",
    usage: "enableCpuDetails(ttl?, sampleRate?, labels?)",
    examples: ["enableCpuDetails(500, 1)", "enableCpuDetails(200, 5, ['remoteInfrastructure', 'taskBoard'])"],
    category: "Statistics"
  })
  public enableCpuDetails(ttl = 500, sampleRate = 1, labels?: string[]): string {
    const status = unifiedStats.enableCpuDetails(ttl, sampleRate, labels);
    return `CPU details enabled until tick ${status.expiresTick ?? "unknown"} (sampleRate=${status.sampleRate ?? 1}, labels=${(status.labels ?? []).join(",") || "all"})`;
  }

  @Command({
    name: "disableCpuDetails",
    description: "Disable temporary fine-grained CPU detail profiling",
    usage: "disableCpuDetails()",
    examples: ["disableCpuDetails()"],
    category: "Statistics"
  })
  public disableCpuDetails(): string {
    unifiedStats.disableCpuDetails();
    return "CPU details disabled";
  }

  @Command({
    name: "cpuDetails",
    description: "Show temporary fine-grained CPU detail profiler output",
    usage: "cpuDetails()",
    examples: ["cpuDetails()"],
    category: "Statistics"
  })
  public cpuDetails(): string {
    const mem = Memory as unknown as StatsMemoryView;
    const details = mem.stats?.cpu_details;
    const status = unifiedStats.getCpuDetailsStatus();
    if (!details) {
      return `CPU details ${status.enabled ? "enabled" : "disabled"}; no samples published yet`;
    }

    const entries = Object.entries(details.entries ?? {});
    const labels = Array.isArray(details.labels) ? details.labels.join(",") : "";
    const lines = [
      `=== CPU Details ===`,
      `Enabled: ${String(details.enabled)} | Expires: ${details.expires_tick ?? "n/a"} | Sample rate: ${details.sample_rate ?? 1} | Labels: ${labels || "all"}`
    ];

    for (const [name, entry] of entries.sort((a, b) => this.toNumberOrZero(b[1].avg_cpu) - this.toNumberOrZero(a[1].avg_cpu)).slice(0, 20)) {
      lines.push(`  ${name}: avg ${this.toNumberOrZero(entry.avg_cpu).toFixed(3)} | total ${this.toNumberOrZero(entry.total_cpu).toFixed(3)} | max ${this.toNumberOrZero(entry.max_cpu).toFixed(3)} | calls ${this.toNumberOrZero(entry.calls).toFixed(0)}`);
    }

    if (entries.length === 0) lines.push("  No detail samples this tick");
    return lines.join("\n");
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
    const mem = Memory as unknown as StatsMemoryView;
    const stats = mem.stats;

    if (!stats) {
      return "No stats available. Stats collection may be disabled.";
    }

    const showAll = !type;
    const lines: string[] = ["=== CPU Breakdown ==="];
    const cpuStats = this.asRecord(stats.cpu);
    const cpuUsed = this.toNumberOrZero(this.getStatsValue(cpuStats, "used")
      ?? this.getStatsValue(cpuStats, "getUsed")
      ?? this.sumNumericValues(this.asRecord(cpuStats?.usage)));
    const cpuLimit = this.toNumberOrZero(this.getStatsValue(cpuStats, "limit") ?? this.toNumberOrZero(cpuStats?.tickLimit));
    const cpuPercent = this.toNumberOrZero(this.getStatsValue(stats.cpu, "percent")
      ?? (cpuLimit > 0 ? (cpuUsed / cpuLimit) * 100 : 0));
    const cpuBucket = this.toNumberOrZero(this.getStatsValue(stats.cpu, "bucket"));

    lines.push(`Tick: ${this.toNumberOrZero(stats.tick)}`);
    lines.push(`Total CPU: ${cpuUsed.toFixed(2)}/${cpuLimit.toFixed(0)} (${cpuPercent.toFixed(1)}%)`);
    lines.push(`Bucket: ${cpuBucket.toFixed(0)}`);
    lines.push("");

    // Process breakdown
    if (showAll || type === "process") {
      const processList = Object.values(stats.processes ?? {});
      if (processList.length > 0) {
        lines.push("=== Process CPU Usage ===");
        const sorted = processList.sort((a, b) => {
          const aCpu = this.toNumberOrZero(this.getStatsValue(a, "avg_cpu") ?? this.getStatsValue(a, "avgCpu"));
          const bCpu = this.toNumberOrZero(this.getStatsValue(b, "avg_cpu") ?? this.getStatsValue(b, "avgCpu"));
          return bCpu - aCpu;
        });
        for (const proc of sorted.slice(0, 10)) {
          const procAvg = this.toNumberOrZero(this.getStatsValue(proc, "avg_cpu") ?? this.getStatsValue(proc, "avgCpu"));
          const procMax = this.toNumberOrZero(this.getStatsValue(proc, "max_cpu") ?? this.getStatsValue(proc, "maxCpu"));
          const procRuns = this.toNumberOrZero(proc.run_count ?? proc.runCount);
          lines.push(`  ${String(proc.name ?? "unknown")}: ${procAvg.toFixed(3)} CPU (runs: ${procRuns.toFixed(0)}, max: ${procMax.toFixed(3)})`);
        }
        lines.push("");
      }
    }

    // Room breakdown
    if (showAll || type === "room") {
      const roomList = Object.values(stats.rooms ?? {});
      if (roomList.length > 0) {
        lines.push("=== Room CPU Usage ===");
        const sorted = roomList.sort((a, b) => {
          const aCpu = this.toNumberOrZero(this.getStatsValue(a.profiler, "avg_cpu") ?? this.getStatsValue(a.profiler, "avgCpu"));
          const bCpu = this.toNumberOrZero(this.getStatsValue(b.profiler, "avg_cpu") ?? this.getStatsValue(b.profiler, "avgCpu"));
          return bCpu - aCpu;
        });
        for (const room of sorted) {
          const roomCpu = this.toNumberOrZero(this.getStatsValue(room.profiler, "avg_cpu") ?? this.getStatsValue(room.profiler, "avgCpu"));
          const roomRcl = this.toNumberOrZero(room.rcl);
          const roomName = room.name ?? room.roomName ?? "unknown";
          lines.push(`  ${String(roomName)}: ${roomCpu.toFixed(3)} CPU (RCL ${roomRcl})`);
        }
        lines.push("");
      }
    }

    // Subsystem breakdown
    if (showAll || type === "subsystem") {
      const subsystemList = Object.values(stats.subsystems ?? {});
      if (subsystemList.length > 0) {
        lines.push("=== Subsystem CPU Usage ===");
        const sorted = subsystemList.sort((a, b) => {
          const aCpu = this.toNumberOrZero(this.getStatsValue(a, "avg_cpu") ?? this.getStatsValue(a, "avgCpu"));
          const bCpu = this.toNumberOrZero(this.getStatsValue(b, "avg_cpu") ?? this.getStatsValue(b, "avgCpu"));
          return bCpu - aCpu;
        });
        for (const subsys of sorted.slice(0, 10)) {
          const subsysName = subsys.name ?? "unknown";
          const subsysAvg = this.toNumberOrZero(this.getStatsValue(subsys, "avg_cpu") ?? this.getStatsValue(subsys, "avgCpu"));
          const subsysCalls = this.toNumberOrZero(subsys.calls ?? subsys.callCount);
          lines.push(`  ${String(subsysName)}: ${subsysAvg.toFixed(3)} CPU (calls: ${subsysCalls.toFixed(0)})`);
        }
        lines.push("");
      }
    }

    // Creep breakdown (top 10)
    if (showAll || type === "creep") {
      const creepList = Object.values(stats.creeps ?? {});
      if (creepList.length > 0) {
        lines.push("=== Top Creeps by CPU (Top 10) ===");
        const sorted = creepList.sort((a, b) => {
          const aCpu = this.toNumberOrZero(this.getStatsValue(a, "cpu"));
          const bCpu = this.toNumberOrZero(this.getStatsValue(b, "cpu"));
          return bCpu - aCpu;
        });
        for (const creep of sorted.slice(0, 10)) {
          const creepCpu = this.toNumberOrZero(this.getStatsValue(creep, "cpu"));
          if (creepCpu > 0) {
            const role = creep.role ?? "unknown";
            const creepName = creep.name ?? `${String(role)}_unknown`;
            const room = creep.current_room ?? creep.currentRoom ?? "unknown";
            lines.push(`  ${String(creepName)} (${String(role)}): ${creepCpu.toFixed(3)} CPU in ${String(room)}`);
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
      result += "OK All rooms within budget!\n";
    } else {
      result += `Alerts: ${report.alerts.length}\n`;

      const critical = report.alerts.filter(a => a.severity === "critical");
      const warnings = report.alerts.filter(a => a.severity === "warning");

      if (critical.length > 0) {
        result += "\nCRITICAL CRITICAL (>=100% of budget):\n";
        for (const alert of critical) {
          result += `  ${alert.target}: ${alert.cpuUsed.toFixed(3)} CPU / ${alert.budgetLimit.toFixed(3)} limit (${(alert.percentUsed * 100).toFixed(1)}%)\n`;
        }
      }

      if (warnings.length > 0) {
        result += "\nWARNING  WARNING (>=80% of budget):\n";
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
      return "OK No CPU anomalies detected";
    }

    let result = `=== CPU Anomalies Detected: ${anomalies.length} ===\n\n`;

    const spikes = anomalies.filter(a => a.type === "spike");
    const sustained = anomalies.filter(a => a.type === "sustained_high");

    if (spikes.length > 0) {
      result += `CPU CPU Spikes (${spikes.length}):\n`;
      for (const anomaly of spikes) {
        result += `  ${anomaly.target}: ${anomaly.current.toFixed(3)} CPU (${anomaly.multiplier.toFixed(1)}x baseline ${anomaly.baseline.toFixed(3)})\n`;
        if (anomaly.context) {
          result += `    Context: ${anomaly.context}\n`;
        }
      }
      result += "\n";
    }

    if (sustained.length > 0) {
      result += `SUMMARY Sustained High Usage (${sustained.length}):\n`;
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
      const postureCode = this.getRoomBrainMetrics(room).postureCode;
      const posture = unifiedStats.postureCodeToName(postureCode);
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

    let result = `----------------------------------------------
`;
    result += `  Room Diagnostic: ${roomName}\n`;
    result += `----------------------------------------------
\n`;

    // Basic Info
    const roomBrain = this.getRoomBrainMetrics(roomStats);
    const roomMetrics = {
      energyHarvested: this.getRoomMetricValue(roomStats, "energyHarvested", "harvested"),
      energyCapacityTotal: this.getRoomMetricValue(roomStats, "energyCapacityTotal", "capacity_total"),
      constructionSites: this.getRoomMetricValue(roomStats, "constructionSites", "construction_sites")
    };

    result += `SUMMARY Basic Info:\n`;
    result += `  RCL: ${roomStats.rcl}\n`;
    result += `  Controller Progress: ${roomStats.controller.progressPercent.toFixed(1)}%\n`;
    result += `  Posture: ${unifiedStats.postureCodeToName(roomBrain.postureCode)}\n`;
    result += `  Danger Level: ${roomBrain.dangerLevel}\n`;
    result += `  Hostiles: ${roomBrain.hostileCount}\n\n`;

    // CPU Analysis
    result += `CPU CPU Analysis:\n`;
    result += `  Average CPU: ${roomStats.profiler.avgCpu.toFixed(3)}\n`;
    result += `  Peak CPU: ${roomStats.profiler.peakCpu.toFixed(3)}\n`;
    result += `  Samples: ${roomStats.profiler.samples}\n`;
    result += `  Budget: ${adjustedBudget.toFixed(3)} (base ${baseBudget}, modulo ${tickModulo})\n`;

    const cpuPercent = (roomStats.profiler.avgCpu / adjustedBudget) * 100;
    const status = cpuPercent >= 100 ? "CRITICAL CRITICAL" : cpuPercent >= 80 ? "WARNING  WARNING" : "OK OK";
    result += `  Status: ${status} (${cpuPercent.toFixed(1)}% of budget)\n`;

    if (tickModulo > 1) {
      result += `  Note: Room runs every ${tickModulo} ticks (distributed execution)\n`;
    }
    result += `\n`;

    // Process Info
    if (roomProcess) {
      result += `PROCESS Process Info:\n`;
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
    result += `CREEPS Creeps: ${creepsInRoom.length} total\n`;

    const creepsByRole: Record<string, number> = {};
    for (const creep of creepsInRoom) {
      const creepMemory = creep.memory as { role?: string };
      const role = creepMemory.role ?? "unknown";
      creepsByRole[role] = (creepsByRole[role] || 0) + 1;
    }

    const roleList = Object.entries(creepsByRole)
      .sort((a, b) => b[1] - a[1])
      .map(([role, count]) => `${role}: ${count}`)
      .join(", ");
    result += `  By Role: ${roleList}\n\n`;

    // Metrics
    result += `METRICS Metrics:\n`;
    result += `  Energy Harvested: ${roomMetrics.energyHarvested}\n`;
    result += `  Energy in Storage: ${roomStats.energy.storage}\n`;
    result += `  Energy Capacity: ${roomMetrics.energyCapacityTotal}\n`;
    result += `  Construction Sites: ${roomMetrics.constructionSites}\n\n`;

    // Recommendations
    result += `RECOMMENDATIONS Recommendations:\n`;

    if (cpuPercent >= 150) {
      result += `  WARNING  CRITICAL: CPU usage is ${cpuPercent.toFixed(0)}% of budget!\n`;
      result += `     - Check for infinite loops or stuck creeps\n`;
      result += `     - Review construction sites (${roomMetrics.constructionSites} active)\n`;
      result += `     - Consider reducing creep count (${creepsInRoom.length} creeps)\n`;
    } else if (cpuPercent >= 100) {
      result += `  WARNING  Room is over budget. Consider optimizations:\n`;
      result += `     - Reduce creep count if excessive (currently ${creepsInRoom.length})\n`;
      result += `     - Limit construction sites (currently ${roomMetrics.constructionSites})\n`;
      result += `     - Review pathfinding (check for recalculation issues)\n`;
    } else if (cpuPercent >= 80) {
      result += `  INFO  Room is nearing budget limit (${cpuPercent.toFixed(1)}%)\n`;
      result += `     - Monitor for increases in CPU usage\n`;
    } else {
      result += `  OK Room is performing well within budget\n`;
    }

    if (roomBrain.hostileCount > 0) {
      result += `  WARNING  ${roomBrain.hostileCount} hostiles detected - defense active\n`;
      result += `     - War mode increases CPU budget to ${isWarRoom ? adjustedBudget.toFixed(3) : (0.25 * tickModulo).toFixed(3)}\n`;
    }

    result += `\n`;
    result += `Use cpuBreakdown('room') to see all rooms\n`;
    result += `Use cpuProfile() for detailed profiling`;

    return result;
  }
}
