import { expect } from "chai";
import sinon from "sinon";

import { StatisticsCommands } from "../../src/core/commands/StatisticsCommands";
import { unifiedStats } from "@ralphschuler/screeps-stats";
import { memoryManager } from "../../src/memory/manager";

describe("StatisticsCommands compatibility with live memory shapes", () => {
  let sandbox: sinon.SinonSandbox;
  let commands: StatisticsCommands;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    global.Game = {
      creeps: {},
      rooms: {
        W1N1: {
          name: "W1N1",
          find: () => []
        } as any
      },
      spawns: {},
      time: 12_345,
      cpu: {
        getUsed: () => 0,
        limit: 20,
        tickLimit: 500,
        bucket: 10000,
        shardLimits: {},
        unlocked: false,
        unlockedTime: 0
      },
      powerCreeps: {},
      gcl: { level: 1, progress: 0, progressTotal: 1000000 },
      gpl: { level: 0, progress: 0, progressTotal: 1000000 },
      market: {
        credits: 0,
        incomingTransactions: [],
        outgoingTransactions: [],
        orders: {}
      }
    } as any;

    global.Memory = {
      creeps: {},
      rooms: {},
      stats: {}
    } as any;

    commands = new StatisticsCommands();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("cpuBreakdown() uses legacy Memory.stats.cpu.getUsed and cpu.usage fallback", () => {
    global.Memory = {
      stats: {
        tick: 12_345,
        cpu: {
          usage: {
            W1N1: {
              init: 0.04045
            }
          },
          getUsed: 2.95,
          limit: 20,
          bucket: 906
        },
        processes: {},
        rooms: {},
        subsystems: {},
        creeps: {}
      }
    } as any;

    const output = commands.cpuBreakdown();

    expect(output).to.contain("Total CPU: 2.95/20 (14.8%)");
    expect(output).to.contain("Bucket: 906");
  });

  it("diagnoseRoom() reads legacy room keys from snapshot metrics and brain", () => {
    const snapshot = {
      tick: 12_345,
      rooms: {
        W1N1: {
          name: "W1N1",
          rcl: 4,
          energy: {
            available: 0,
            capacity: 0,
            storage: 1200
          },
          controller: {
            progressPercent: 42.5
          },
          profiler: {
            avgCpu: 0.25,
            peakCpu: 0.31,
            samples: 12
          },
          brain: {
            danger: 2,
            posture_code: 2,
            colony_level_code: 0
          },
          metrics: {
            energy: {
              harvested: 500,
              capacity_total: 2500
            },
            hostile_count: 3,
            construction_sites: 2
          },
          hostiles: 0
        }
      },
      processes: {},
      subsystems: {},
      roles: {},
      creeps: {},
      cpu: {
        used: 1,
        limit: 20,
        bucket: 10000,
        percent: 5
      },
      timestamp: 0
    } as any;

    sandbox.stub(unifiedStats, "getCurrentSnapshot").returns(snapshot);
    sandbox.stub(memoryManager, "getSwarmState").returns({ danger: 1, posture: "war" } as any);

    const output = commands.diagnoseRoom("W1N1");

    expect(output).to.contain("Room Diagnostic: W1N1");
    expect(output).to.contain("Hostiles: 3");
    expect(output).to.contain("Energy Harvested: 500");
    expect(output).to.contain("Energy Capacity: 2500");
    expect(output).to.contain("Construction Sites: 2");
  });
});
