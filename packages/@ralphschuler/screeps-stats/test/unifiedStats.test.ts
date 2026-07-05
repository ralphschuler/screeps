import { expect } from "chai";
import { UnifiedStatsManager } from "../src/unifiedStats.ts";
import type { RoomStatsEntry } from "../src/statsTypes.ts";

type RoomStatsOverrides = Omit<Partial<RoomStatsEntry>, "energy" | "controller" | "brain" | "metrics" | "profiler"> & {
  energy?: Partial<RoomStatsEntry["energy"]>;
  controller?: Partial<RoomStatsEntry["controller"]>;
  brain?: Partial<RoomStatsEntry["brain"]>;
  metrics?: Partial<RoomStatsEntry["metrics"]>;
  profiler?: Partial<RoomStatsEntry["profiler"]>;
};

function makeRoomStats(overrides: RoomStatsOverrides = {}): RoomStatsEntry {
  const base: RoomStatsEntry = {
    name: "W1N1",
    rcl: 1,
    energy: {
      available: 0,
      capacity: 0,
      storage: 0,
      terminal: 0
    },
    controller: {
      progress: 0,
      progressTotal: 1,
      progressPercent: 0,
      ticksToDowngrade: 1000,
      downgradeRisk: false
    },
    creeps: 0,
    hostiles: 0,
    brain: {
      danger: 0,
      postureCode: 0,
      colonyLevelCode: 0
    },
    pheromones: {},
    metrics: {
      energyHarvested: 0,
      energySpawning: 0,
      energyConstruction: 0,
      energyRepair: 0,
      energyTower: 0,
      energyAvailableForSharing: 0,
      energyCapacityTotal: 0,
      energyNeed: 0,
      controllerProgress: 0,
      hostileCount: 0,
      damageReceived: 0,
      constructionSites: 0
    },
    profiler: {
      avgCpu: 0,
      peakCpu: 0,
      samples: 1
    }
  };

  return {
    ...base,
    ...overrides,
    energy: { ...base.energy, ...overrides.energy },
    controller: { ...base.controller, ...overrides.controller },
    brain: { ...base.brain, ...overrides.brain },
    metrics: { ...base.metrics, ...overrides.metrics },
    profiler: { ...base.profiler, ...overrides.profiler }
  };
}

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
    (Game as unknown as { rooms: Record<string, unknown> }).rooms = {};
    (Game as unknown as { creeps: Record<string, unknown> }).creeps = {};
  });

  it("preserves profiler memory when publishing stats to Memory", () => {
    const manager = new UnifiedStatsManager();

    (manager as unknown as { publishToMemory(): void }).publishToMemory();

    const profiler = (Memory as unknown as { stats: { profiler?: { rooms: Record<string, { samples: number }> } } }).stats.profiler;
    expect(profiler?.rooms.W17S29.samples).to.equal(42);
  });

  it("publishes a fresh zero-room idle tick for abandoned shards", () => {
    const manager = new UnifiedStatsManager({ logInterval: 0, segmentUpdateInterval: Number.MAX_SAFE_INTEGER });
    const game = Game as unknown as { time: number; cpu: typeof Game.cpu };
    const originalCpu = game.cpu;

    try {
      game.time = 76166543;
      game.cpu = {
        ...(Game.cpu as unknown as object),
        bucket: 906,
        limit: 20,
        getUsed: () => 0
      } as typeof Game.cpu;

      manager.publishIdleTick();

      const stats = (Memory as unknown as { stats: { tick: number; rooms: Record<string, unknown>; cpu: { bucket: number }; empire: { rooms: number } } }).stats;
      expect(stats.tick).to.equal(76166543);
      expect(stats.cpu.bucket).to.equal(906);
      expect(stats.empire.rooms).to.equal(0);
      expect(stats.rooms).to.deep.equal({});
    } finally {
      game.cpu = originalCpu;
    }
  });

  it("keeps idle tick publishing robust when legacy creep mocks lack room data", () => {
    const manager = new UnifiedStatsManager({ logInterval: 0, segmentUpdateInterval: Number.MAX_SAFE_INTEGER });
    (Game as unknown as { creeps: Record<string, unknown> }).creeps = {
      legacyDrone: {
        memory: undefined,
        hits: undefined,
        hitsMax: undefined,
        body: undefined,
        fatigue: undefined
      }
    };

    manager.publishIdleTick();

    const creepStats = (Memory as unknown as { stats: { creeps: Record<string, { current_room: string; home_room: string; body_parts: number }> } }).stats.creeps.legacyDrone;
    expect(creepStats.current_room).to.equal("unknown");
    expect(creepStats.home_room).to.equal("unknown");
    expect(creepStats.body_parts).to.equal(0);
  });

  it("drops stale room stats when room ownership is lost", () => {
    const manager = new UnifiedStatsManager({ logInterval: 0, segmentUpdateInterval: Number.MAX_SAFE_INTEGER });
    const state = manager as unknown as { currentSnapshot: { rooms: Record<string, unknown> } };

    state.currentSnapshot.rooms = {
      W12S8: {
        name: "W12S8",
        rcl: 4,
        energy: {
          available: 300,
          capacity: 300,
          storage: 200,
          terminal: 0
        },
        controller: {
          progress: 100,
          progressTotal: 200,
          progressPercent: 50,
          ticksToDowngrade: 1000,
          downgradeRisk: false
        },
        creeps: 5,
        hostiles: 0,
        brain: {
          danger: 0,
          postureCode: 0,
          colonyLevelCode: 0
        },
        pheromones: {},
        metrics: {
          energyHarvested: 0,
          energySpawning: 0,
          energyConstruction: 0,
          energyRepair: 0,
          energyTower: 0,
          energyAvailableForSharing: 0,
          energyCapacityTotal: 0,
          energyNeed: 0,
          controllerProgress: 0,
          hostileCount: 0,
          damageReceived: 0,
          constructionSites: 0
        },
        profiler: {
          avgCpu: 0,
          peakCpu: 0,
          samples: 1
        }
      } as Record<string, unknown>
    };

    (Game as unknown as { rooms: Record<string, unknown> }).rooms = {
      W12S8: {
        name: "W12S8",
        controller: {
          my: false
        }
      } as Record<string, unknown>
    };

    manager.startTick();

    expect((manager as unknown as { currentSnapshot: { rooms: Record<string, unknown> } }).currentSnapshot.rooms.W12S8).to.equal(undefined);
  });

  it("retains room stats for still-owned visible rooms", () => {
    const manager = new UnifiedStatsManager({ logInterval: 0, segmentUpdateInterval: Number.MAX_SAFE_INTEGER });
    const state = manager as unknown as { currentSnapshot: { rooms: Record<string, unknown> } };

    state.currentSnapshot.rooms = {
      W1N1: makeRoomStats({
        name: "W1N1",
        rcl: 1,
        energy: {
          available: 300,
          capacity: 300,
          storage: 0,
          terminal: 0
        },
        controller: {
          progress: 0,
          progressTotal: 100,
          progressPercent: 0,
          ticksToDowngrade: 999,
          downgradeRisk: false
        },
        creeps: 2,
        metrics: {
          energyCapacityTotal: 300
        }
      }) as Record<string, unknown>
    };

    (Game as unknown as { rooms: Record<string, unknown> }).rooms = {
      W1N1: {
        name: "W1N1",
        controller: {
          my: true
        }
      } as Record<string, unknown>
    };

    manager.startTick();

    expect((manager as unknown as { currentSnapshot: { rooms: Record<string, unknown> } }).currentSnapshot.rooms.W1N1).to.exist;
  });

  it("summarizes task-board amounts by type for live backlog diagnosis", () => {
    const manager = new UnifiedStatsManager({ logInterval: 0, segmentUpdateInterval: Number.MAX_SAFE_INTEGER });
    (Memory as Memory & { creepTaskBoard?: unknown }).creepTaskBoard = {
      rooms: {
        W1N1: {
          stats: { staleReservations: 1, blockedReservations: 2 },
          tasks: {
            spawn: { type: "refillSpawn", status: "open", priority: 200, amount: 300, reservations: {} },
            extension: { type: "refillExtension", status: "assigned", priority: 100, amount: 200, reservations: { hauler1: { amount: 50 } } },
            storage: { type: "storeEnergy", status: "open", priority: 10, amount: 1000, reservations: { hauler2: { amount: 100 } } },
            defend: { type: "defend", status: "open", priority: 200, amount: 5000, reservations: {} }
          }
        }
      }
    };

    const stats = (manager as unknown as {
      getRoomTaskBoardStats(roomName: string): NonNullable<RoomStatsEntry["taskBoard"]>;
    }).getRoomTaskBoardStats("W1N1");

    expect(stats).to.include({
      tasks: 4,
      openTasks: 3,
      assignedTasks: 1,
      reservations: 2,
      staleReservations: 1,
      blockedReservations: 2,
      amount: 6500,
      reservedAmount: 150,
      remainingAmount: 6350,
      deliveryAmount: 1500,
      deliveryReservedAmount: 150,
      deliveryRemainingAmount: 1350,
      criticalDeliveryRemainingAmount: 450
    });
    expect(stats.byType.refillExtension).to.deep.equal({
      tasks: 1,
      openTasks: 0,
      assignedTasks: 1,
      reservations: 1,
      amount: 200,
      reservedAmount: 50,
      remainingAmount: 150
    });
  });

  it("publishes compact task-board amount stats to Memory.stats", () => {
    const manager = new UnifiedStatsManager({ logInterval: 0, segmentUpdateInterval: Number.MAX_SAFE_INTEGER });
    const taskBoard = {
      tasks: 1,
      openTasks: 1,
      assignedTasks: 0,
      reservations: 1,
      staleReservations: 0,
      blockedReservations: 0,
      amount: 200,
      reservedAmount: 50,
      remainingAmount: 150,
      deliveryAmount: 200,
      deliveryReservedAmount: 50,
      deliveryRemainingAmount: 150,
      criticalDeliveryRemainingAmount: 150,
      byType: {
        refillExtension: {
          tasks: 1,
          openTasks: 1,
          assignedTasks: 0,
          reservations: 1,
          amount: 200,
          reservedAmount: 50,
          remainingAmount: 150
        }
      }
    };
    const state = manager as unknown as { currentSnapshot: { rooms: Record<string, RoomStatsEntry> } };
    state.currentSnapshot.rooms = { W1N1: makeRoomStats({ name: "W1N1", taskBoard }) };

    (manager as unknown as { publishToMemory(): void }).publishToMemory();

    const published = (Memory as unknown as {
      stats: { rooms: Record<string, { taskBoard: Record<string, unknown> }> };
    }).stats.rooms.W1N1.taskBoard;
    expect(published).to.include({
      tasks: 1,
      open_tasks: 1,
      assigned_tasks: 0,
      amount: 200,
      reserved_amount: 50,
      remaining_amount: 150,
      delivery_remaining_amount: 150,
      critical_delivery_remaining_amount: 150
    });
    expect((published.by_type as Record<string, Record<string, number>>).refillExtension).to.include({
      remaining_amount: 150,
      reserved_amount: 50
    });
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
