import { expect } from "chai";
import { formatKernelHealthReport, formatKernelProcessList, formatKernelStatsReport } from "../../src/core/kernelOperationsReport";

describe("Kernel operations report Module", () => {
  const processes = [
    {
      id: "slow",
      name: "Slow Process",
      priority: 10,
      frequency: "low",
      state: "active",
      stats: { runCount: 2, avgCpu: 0.25, healthScore: 40, errorCount: 2, consecutiveErrors: 1, lastSuccessfulRunTick: 90 }
    },
    {
      id: "fast",
      name: "Fast Process",
      priority: 100,
      frequency: "high",
      state: "active",
      stats: { runCount: 5, avgCpu: 0.05, healthScore: 100, errorCount: 0, consecutiveErrors: 0, lastSuccessfulRunTick: 99 }
    }
  ];

  it("formats kernel stats from a snapshot", () => {
    const report = formatKernelStatsReport({
      bucketMode: "normal",
      cpuBucket: 9000,
      cpuLimit: 49,
      targetCpuUsage: 0.98,
      gameCpuLimit: 50,
      remainingCpu: 12.5,
      stats: {
        totalProcesses: 2,
        activeProcesses: 2,
        suspendedProcesses: 0,
        totalCpuUsed: 1.234,
        avgCpuPerProcess: 0.617,
        avgHealthScore: 70,
        topCpuProcesses: [{ name: "Slow Process", avgCpu: 0.25 }],
        unhealthyProcesses: [{ name: "Slow Process", healthScore: 40, consecutiveErrors: 1 }]
      }
    });

    expect(report).to.include("Bucket Mode: NORMAL");
    expect(report).to.include("Slow Process: 0.2500 avg CPU");
    expect(report).to.include("Unhealthy Processes (Health < 50):");
  });

  it("formats process lists sorted by priority", () => {
    const report = formatKernelProcessList(processes);

    expect(report.indexOf("fast | Fast Process")).to.be.lessThan(report.indexOf("slow | Slow Process"));
    expect(report).to.include("✓100");
    expect(report).to.include("✗40");
  });

  it("formats health lists sorted worst first", () => {
    const report = formatKernelHealthReport(processes, 100, { avgHealthScore: 70, suspendedProcesses: 0 });

    expect(report.indexOf("Slow Process")).to.be.lessThan(report.indexOf("Fast Process"));
    expect(report).to.include("Average Health: 70.0/100");
  });
});
