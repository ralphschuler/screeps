export interface KernelStatsReportInput {
  bucketMode: string;
  cpuBucket: number;
  cpuLimit: number;
  targetCpuUsage: number;
  gameCpuLimit: number;
  remainingCpu: number;
  stats: {
    totalProcesses: number;
    activeProcesses: number;
    suspendedProcesses: number;
    totalCpuUsed: number;
    avgCpuPerProcess: number;
    avgHealthScore: number;
    topCpuProcesses: { name: string; avgCpu: number }[];
    unhealthyProcesses: { name: string; healthScore: number; consecutiveErrors: number }[];
  };
}

export interface KernelProcessReportNode {
  id: string;
  name: string;
  priority: number;
  frequency: string;
  state: string;
  stats: {
    runCount: number;
    avgCpu: number;
    healthScore: number;
    errorCount: number;
    consecutiveErrors: number;
    lastSuccessfulRunTick: number;
    suspensionReason?: string;
  };
}

export function formatKernelStatsReport(input: KernelStatsReportInput): string {
  const lines = [
    "=== Kernel Stats ===",
    `Bucket Mode: ${input.bucketMode.toUpperCase()}`,
    `CPU Bucket: ${input.cpuBucket}`,
    `CPU Limit: ${input.cpuLimit.toFixed(2)} (${(input.targetCpuUsage * 100).toFixed(0)}% of ${input.gameCpuLimit})`,
    `Remaining CPU: ${input.remainingCpu.toFixed(2)}`,
    "",
    `Processes: ${input.stats.totalProcesses} total (${input.stats.activeProcesses} active, ${input.stats.suspendedProcesses} suspended)`,
    `Total CPU Used: ${input.stats.totalCpuUsed.toFixed(3)}`,
    `Avg CPU/Process: ${input.stats.avgCpuPerProcess.toFixed(4)}`,
    `Avg Health Score: ${input.stats.avgHealthScore.toFixed(1)}/100`,
    "",
    "Top CPU Consumers:"
  ];

  for (const proc of input.stats.topCpuProcesses) lines.push(`  ${proc.name}: ${proc.avgCpu.toFixed(4)} avg CPU`);

  if (input.stats.unhealthyProcesses.length > 0) {
    lines.push("", "Unhealthy Processes (Health < 50):");
    for (const proc of input.stats.unhealthyProcesses) {
      lines.push(`  ${proc.name}: ${proc.healthScore.toFixed(1)}/100 (${proc.consecutiveErrors} consecutive errors)`);
    }
  }

  return lines.join("\n");
}

export function formatKernelProcessList(processes: KernelProcessReportNode[]): string {
  if (processes.length === 0) return "No processes registered with kernel.";

  const lines = [
    "=== Registered Processes ===",
    "ID | Name | Priority | Frequency | State | Runs | Avg CPU | Health | Errors",
    "-".repeat(100)
  ];

  for (const process of [...processes].sort((a, b) => b.priority - a.priority)) {
    const healthIcon = process.stats.healthScore >= 80 ? "✓" : process.stats.healthScore >= 50 ? "⚠" : "✗";
    lines.push(
      `${process.id} | ${process.name} | ${process.priority} | ${process.frequency} | ${process.state} | ${process.stats.runCount} | ${process.stats.avgCpu.toFixed(4)} | ${healthIcon}${process.stats.healthScore.toFixed(0)} | ${process.stats.errorCount}(${process.stats.consecutiveErrors})`
    );
  }

  return lines.join("\n") + "\n";
}

export function formatKernelHealthReport(
  processes: KernelProcessReportNode[],
  now: number,
  summary: { avgHealthScore: number; suspendedProcesses: number }
): string {
  if (processes.length === 0) return "No processes registered with kernel.";

  const lines = [
    "=== Process Health Status ===",
    "Name | Health | Errors | Consecutive | Status | Last Success",
    "-".repeat(80)
  ];

  for (const process of [...processes].sort((a, b) => a.stats.healthScore - b.stats.healthScore)) {
    const healthIcon = process.stats.healthScore >= 80 ? "✓" : process.stats.healthScore >= 50 ? "⚠" : "✗";
    const ticksSinceSuccess = process.stats.lastSuccessfulRunTick > 0 ? now - process.stats.lastSuccessfulRunTick : "never";
    const status = process.state === "suspended" ? `SUSPENDED (${process.stats.suspensionReason})` : process.state.toUpperCase();
    lines.push(
      `${process.name} | ${healthIcon} ${process.stats.healthScore.toFixed(0)}/100 | ${process.stats.errorCount} | ${process.stats.consecutiveErrors} | ${status} | ${ticksSinceSuccess}`
    );
  }

  lines.push("", `Average Health: ${summary.avgHealthScore.toFixed(1)}/100`, `Suspended Processes: ${summary.suspendedProcesses}`);
  return lines.join("\n");
}
