import { ErrorMapper } from "utils/ErrorMapper";
import { loop as swarmLoop, roomVisualizer, memorySegmentStats, updateConfig, getConfig, kernel } from "./SwarmBot";
import { configureLogger, LogLevel, getLoggerConfig } from "./core/logger";
import { profiler } from "./core/profiler";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
  }

}

// Syntax for adding proprties to `global` (ex "global.log")
declare const global: {
  log: any;
  // Console commands for logging and visualization
  setLogLevel: (level: string) => string;
  toggleVisualizations: () => string;
  toggleDebug: () => string;
  toggleProfiling: () => string;
  showStats: () => string;
  showConfig: () => string;
  toggleVisualization: (key: string) => string;
  // Kernel commands
  showKernelStats: () => string;
  listProcesses: () => string;
  suspendProcess: (processId: string) => string;
  resumeProcess: (processId: string) => string;
  resetKernelStats: () => string;
};

// =============================================================================
// Console Commands
// =============================================================================

/**
 * Set the log level
 * Usage: setLogLevel("debug") | setLogLevel("info") | setLogLevel("warn") | setLogLevel("error")
 */
global.setLogLevel = (level: string): string => {
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
};

/**
 * Toggle visualizations on/off
 * Usage: toggleVisualizations()
 */
global.toggleVisualizations = (): string => {
  const config = getConfig();
  const newValue = !config.visualizations;
  updateConfig({ visualizations: newValue });
  return `Visualizations: ${newValue ? "ENABLED" : "DISABLED"}`;
};

/**
 * Toggle debug mode on/off
 * Usage: toggleDebug()
 */
global.toggleDebug = (): string => {
  const config = getConfig();
  const newValue = !config.debug;
  updateConfig({ debug: newValue });
  configureLogger({ level: newValue ? LogLevel.DEBUG : LogLevel.INFO });
  return `Debug mode: ${newValue ? "ENABLED" : "DISABLED"} (Log level: ${newValue ? "DEBUG" : "INFO"})`;
};

/**
 * Toggle profiling on/off
 * Usage: toggleProfiling()
 */
global.toggleProfiling = (): string => {
  const config = getConfig();
  const newValue = !config.profiling;
  updateConfig({ profiling: newValue });
  profiler.setEnabled(newValue);
  configureLogger({ cpuLogging: newValue });
  return `Profiling: ${newValue ? "ENABLED" : "DISABLED"}`;
};

/**
 * Show current stats from memory segment
 * Usage: showStats()
 */
global.showStats = (): string => {
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
};

/**
 * Show current configuration
 * Usage: showConfig()
 */
global.showConfig = (): string => {
  const config = getConfig();
  const loggerConfig = getLoggerConfig();
  return `=== SwarmBot Config ===
Debug: ${String(config.debug)}
Profiling: ${String(config.profiling)}
Visualizations: ${String(config.visualizations)}
Logger Level: ${LogLevel[loggerConfig.level]}
CPU Logging: ${String(loggerConfig.cpuLogging)}`;
};

/**
 * Toggle specific visualization features
 * Usage: toggleVisualization("showPheromones") | toggleVisualization("showPaths") etc.
 */
global.toggleVisualization = (key: string): string => {
  // Get valid toggle keys dynamically from config (only boolean properties that start with 'show')
  const config = roomVisualizer.getConfig();
  const validKeys = Object.keys(config).filter(
    k => k.startsWith("show") && typeof config[k as keyof typeof config] === "boolean"
  );

  if (!validKeys.includes(key)) {
    return `Invalid key: ${key}. Valid keys: ${validKeys.join(", ")}`;
  }

  // Type-safe toggle using validated key
  const validKey = key as keyof typeof config;
  roomVisualizer.toggle(validKey);
  const newConfig = roomVisualizer.getConfig();
  const value = newConfig[validKey];
  return `Visualization '${key}': ${value ? "ENABLED" : "DISABLED"}`;
};

// =============================================================================
// Kernel Console Commands
// =============================================================================

/**
 * Show kernel statistics
 * Usage: showKernelStats()
 */
global.showKernelStats = (): string => {
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

Top CPU Consumers:`;

  for (const proc of stats.topCpuProcesses) {
    output += `\n  ${proc.name}: ${proc.avgCpu.toFixed(4)} avg CPU`;
  }

  return output;
};

/**
 * List all registered processes
 * Usage: listProcesses()
 */
global.listProcesses = (): string => {
  const processes = kernel.getProcesses();

  if (processes.length === 0) {
    return "No processes registered with kernel.";
  }

  let output = "=== Registered Processes ===\n";
  output += "ID | Name | Priority | Frequency | State | Runs | Avg CPU | Skipped | Errors\n";
  output += "-".repeat(90) + "\n";

  // Sort by priority
  const sorted = [...processes].sort((a, b) => b.priority - a.priority);

  for (const p of sorted) {
    const avgCpu = p.stats.avgCpu.toFixed(4);
    output += `${p.id} | ${p.name} | ${p.priority} | ${p.frequency} | ${p.state} | ${p.stats.runCount} | ${avgCpu} | ${p.stats.skippedCount} | ${p.stats.errorCount}\n`;
  }

  return output;
};

/**
 * Suspend a process
 * Usage: suspendProcess("empire:manager")
 */
global.suspendProcess = (processId: string): string => {
  const success = kernel.suspendProcess(processId);
  if (success) {
    return `Process "${processId}" suspended.`;
  }
  return `Process "${processId}" not found.`;
};

/**
 * Resume a suspended process
 * Usage: resumeProcess("empire:manager")
 */
global.resumeProcess = (processId: string): string => {
  const success = kernel.resumeProcess(processId);
  if (success) {
    return `Process "${processId}" resumed.`;
  }
  return `Process "${processId}" not found or not suspended.`;
};

/**
 * Reset kernel statistics
 * Usage: resetKernelStats()
 */
global.resetKernelStats = (): string => {
  kernel.resetStats();
  return "Kernel statistics reset.";
};

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  // Run the SwarmBot main loop
  swarmLoop();
});
