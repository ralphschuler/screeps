/**
 * Kernel Console Commands
 *
 * Commands for managing kernel processes and viewing kernel statistics.
 * Extracted from consoleCommands.ts for better modularity.
 */

import { Command } from "../commandRegistry";
import { creepProcessManager } from "../creepProcessManager";
import { kernel } from "../kernel";
import { roomProcessManager } from "../roomProcessManager";

/**
 * Kernel commands
 */
export class KernelCommands {
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
