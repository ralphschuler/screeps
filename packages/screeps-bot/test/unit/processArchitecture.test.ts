import { expect } from "chai";
import { formatProcessTopologySnapshot } from "../../src/core/processArchitecture";
import { ProcessPriority } from "../../src/core/kernel";
import type { ProcessTopologySnapshot } from "../../src/core/kernel";

describe("Process architecture module", () => {
  it("formats topology, scheduling, and health as one observable interface", () => {
    const snapshot: ProcessTopologySnapshot = {
      nodes: [
        {
          id: "room:W1N1",
          name: "Room W1N1",
          group: "room",
          layer: "room",
          priority: ProcessPriority.HIGH,
          frequency: "high",
          minBucket: 0,
          cpuBudget: 0.08,
          interval: 1,
          tickModulo: 5,
          tickOffset: 2,
          state: "idle",
          runCount: 12,
          avgCpu: 0.0312,
          maxCpu: 0.06,
          lastRunTick: 101,
          skippedCount: 3,
          consecutiveCpuSkips: 1,
          errorCount: 0,
          consecutiveErrors: 0,
          healthScore: 98
        },
        {
          id: "creep:Bob",
          name: "Creep Bob",
          parentId: "room:W1N1",
          group: "creep",
          layer: "creep",
          priority: ProcessPriority.MEDIUM,
          frequency: "high",
          minBucket: 0,
          cpuBudget: 0.01,
          interval: 1,
          state: "idle",
          runCount: 20,
          avgCpu: 0.0023,
          maxCpu: 0.004,
          lastRunTick: 102,
          skippedCount: 0,
          consecutiveCpuSkips: 0,
          errorCount: 1,
          consecutiveErrors: 0,
          healthScore: 90
        }
      ],
      childrenByParent: { "room:W1N1": ["creep:Bob"] },
      nodesByLayer: { room: ["room:W1N1"], creep: ["creep:Bob"] },
      nodesByGroup: { room: ["room:W1N1"], creep: ["creep:Bob"] },
      rootIds: ["room:W1N1"],
      summary: {
        total: 2,
        roots: 1,
        edges: 1,
        byLayer: { room: 1, creep: 1 },
        byGroup: { room: 1, creep: 1 },
        byState: { idle: 2, running: 0, suspended: 0, error: 0 }
      }
    };

    const output = formatProcessTopologySnapshot(snapshot);

    expect(output).to.include("=== Process Architecture Topology ===");
    expect(output).to.include("Processes: 2 total, 1 roots, 1 edges");
    expect(output).to.include("Layers: creep=1, room=1");
    expect(output).to.include("room:W1N1 | root | room | room | 75 | high | interval=1 modulo=5 offset=2 | idle | runs=12 avg=0.0312 max=0.0600 last=101 skipped=3 cpuSkips=1 errors=0 consecutiveErrors=0 health=98");
    expect(output).to.include("creep:Bob | room:W1N1 | creep | creep | 50 | high | interval=1 | idle | runs=20 avg=0.0023 max=0.0040 last=102 skipped=0 cpuSkips=0 errors=1 consecutiveErrors=0 health=90");
    expect(output).to.include("room:W1N1 -> creep:Bob");
  });
});
