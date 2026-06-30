import { expect } from "chai";
import { UnifiedStatsManager } from "../src/unifiedStats.ts";

describe("UnifiedStatsManager", () => {
  beforeEach(() => {
    (globalThis as typeof globalThis & { Memory: Memory }).Memory.stats = {
      profiler: {
        rooms: {
          W17S29: {
            avgCpu: 2,
            peakCpu: 5,
            samples: 42,
            lastTick: 1234,
            controllerProgress: 100,
            storageEnergy: 900000
          }
        },
        subsystems: {},
        roles: {},
        tickCount: 7,
        lastUpdate: 1234
      }
    };
  });

  it("preserves profiler memory when publishing stats to Memory", () => {
    const manager = new UnifiedStatsManager();

    (manager as unknown as { publishToMemory(): void }).publishToMemory();

    const profiler = (Memory as unknown as { stats: { profiler?: { rooms: Record<string, { samples: number }> } } }).stats.profiler;
    expect(profiler?.rooms.W17S29.samples).to.equal(42);
  });

  it("captures gated CPU detail samples and auto-disables after TTL", () => {
    const manager = new UnifiedStatsManager({ logInterval: 0, segmentUpdateInterval: Number.MAX_SAFE_INTEGER });
    (Game as unknown as { time: number }).time = 2000;

    let cpu = 0;
    const originalGetUsed = Game.cpu.getUsed;
    (Game.cpu as unknown as { getUsed: () => number }).getUsed = () => {
      cpu += 0.5;
      return cpu;
    };

    try {
      manager.enableCpuDetails(2, 1, ["remoteInfrastructure"]);
      manager.startTick();
      const result = manager.measureCpuDetail("remoteInfrastructure.calculateRemoteRoads", () => "ok");
      manager.finalizeTick();

      expect(result).to.equal("ok");
      const details = (Memory as unknown as { stats: { cpu_details: { enabled: boolean; entries: Record<string, { avg_cpu: number; calls: number }> } } }).stats.cpu_details;
      expect(details.enabled).to.equal(true);
      expect(details.entries["remoteInfrastructure.calculateRemoteRoads"].avg_cpu).to.be.greaterThan(0);
      expect(details.entries["remoteInfrastructure.calculateRemoteRoads"].calls).to.equal(1);

      (Game as unknown as { time: number }).time = 2002;
      manager.startTick();
      manager.measureCpuDetail("remoteInfrastructure.calculateRemoteRoads", () => undefined);
      manager.finalizeTick();
      expect((Memory as unknown as { stats: { cpu_details: { enabled: boolean } } }).stats.cpu_details.enabled).to.equal(false);
    } finally {
      (Game.cpu as unknown as { getUsed: () => number }).getUsed = originalGetUsed;
      manager.disableCpuDetails();
    }
  });

  it("does not measure CPU details when disabled", () => {
    const manager = new UnifiedStatsManager({ logInterval: 0, segmentUpdateInterval: Number.MAX_SAFE_INTEGER });
    manager.disableCpuDetails();

    let getUsedCalls = 0;
    const originalGetUsed = Game.cpu.getUsed;
    (Game.cpu as unknown as { getUsed: () => number }).getUsed = () => {
      getUsedCalls++;
      return 0;
    };

    try {
      const result = manager.measureCpuDetail("market.updateOrderStats", () => 42);
      expect(result).to.equal(42);
      expect(getUsedCalls).to.equal(0);
    } finally {
      (Game.cpu as unknown as { getUsed: () => number }).getUsed = originalGetUsed;
    }
  });

  it("throttles and caps CPU anomaly console warnings", () => {
    const originalLog = console.log;
    const logs: string[] = [];
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(" "));
    };

    try {
      const manager = new UnifiedStatsManager({
        logInterval: 0,
        segmentUpdateInterval: Number.MAX_SAFE_INTEGER,
        anomalyDetection: {
          enabled: true,
          spikeThreshold: 2,
          minSamples: 1
        }
      });

      const installProcessAnomalies = () => {
        manager.startTick();
        const snapshot = (manager as unknown as { currentSnapshot: { processes: Record<string, unknown> } }).currentSnapshot;
        snapshot.processes = {};
        for (let i = 1; i <= 8; i++) {
          snapshot.processes[`process-${i}`] = {
            id: `process-${i}`,
            name: `Process ${i}`,
            priority: 1,
            frequency: "medium",
            state: "running",
            totalCpu: 0,
            runCount: 10,
            avgCpu: 1,
            maxCpu: 2 + i,
            lastRunTick: Game.time,
            skippedCount: 0,
            errorCount: 0,
            cpuBudget: 0,
            minBucket: 0
          };
        }
      };

      (Game as unknown as { time: number }).time = 1000;
      installProcessAnomalies();
      manager.finalizeTick();

      (Game as unknown as { time: number }).time = 1001;
      installProcessAnomalies();
      manager.finalizeTick();

      let anomalyLogs = logs.filter(line => line.includes("CPU Anomalies"));
      expect(anomalyLogs).to.have.length(1);
      expect(anomalyLogs[0]).to.include("CPU Anomalies: 8 detected");
      expect(anomalyLogs[0]).to.include("... 3 more omitted");

      (Game as unknown as { time: number }).time = 1050;
      installProcessAnomalies();
      manager.finalizeTick();

      anomalyLogs = logs.filter(line => line.includes("CPU Anomalies"));
      expect(anomalyLogs).to.have.length(2);
    } finally {
      console.log = originalLog;
    }
  });
});
