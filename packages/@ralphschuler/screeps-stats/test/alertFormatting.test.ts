import { expect } from "chai";
import { formatAnomalyDetails, formatBudgetAlertDetails } from "../src/unified-stats/alertFormatting.ts";
import type { CPUAnomaly, CPUBudgetAlert, ProcessStatsEntry } from "../src/statsTypes.ts";

const budgetAlert = (target: string, percentUsed: number, cpuUsed = 1, budgetLimit = 1): CPUBudgetAlert => ({
  severity: percentUsed >= 1 ? "critical" : "warning",
  target,
  targetType: "room",
  cpuUsed,
  budgetLimit,
  percentUsed,
  tick: 1234
});

const processStats = (tickModulo: number): ProcessStatsEntry => ({
  id: "room:W9N9",
  name: "Room W9N9",
  priority: 1,
  frequency: "medium",
  state: "running",
  totalCpu: 0,
  runCount: 0,
  avgCpu: 0,
  maxCpu: 0,
  lastRunTick: 0,
  skippedCount: 0,
  errorCount: 0,
  cpuBudget: 0,
  minBucket: 0,
  tickModulo
});

const anomaly = (target: string, multiplier: number, context?: string): CPUAnomaly => ({
  type: "spike",
  target,
  targetType: "process",
  current: multiplier,
  baseline: 1,
  multiplier,
  tick: 1234,
  context
});

describe("CPU alert formatting", () => {
  it("sorts budget alerts by severity payload, caps details, and reports omissions", () => {
    const alerts = [
      budgetAlert("W1N1", 0.81, 0.081, 0.1),
      budgetAlert("W2N2", 1.2, 0.12, 0.1),
      budgetAlert("W3N3", 2.4, 0.24, 0.1),
      budgetAlert("W4N4", 0.95, 0.095, 0.1),
      budgetAlert("W5N5", 1.6, 0.16, 0.1),
      budgetAlert("W6N6", 1.1, 0.11, 0.1)
    ];

    expect(formatBudgetAlertDetails(alerts)).to.equal(
      "W3N3: 240.0% (0.240/0.100 CPU), " +
      "W5N5: 160.0% (0.160/0.100 CPU), " +
      "W2N2: 120.0% (0.120/0.100 CPU), " +
      "W6N6: 110.0% (0.110/0.100 CPU), " +
      "W4N4: 95.0% (0.095/0.100 CPU), " +
      "... 1 more omitted"
    );
  });

  it("can omit CPU numbers and include distributed room cadence", () => {
    expect(formatBudgetAlertDetails([budgetAlert("W9N9", 0.85, 0.085, 0.1)], {
      includeCpuUsage: false,
      processes: {
        "room:W9N9": processStats(5)
      }
    })).to.equal("W9N9: 85.0% [runs every 5 ticks]");
  });

  it("sorts anomaly details by multiplier and keeps optional context", () => {
    const anomalies = [
      anomaly("process-1", 2, "medium cadence"),
      anomaly("process-2", 8),
      anomaly("process-3", 3),
      anomaly("process-4", 7),
      anomaly("process-5", 4),
      anomaly("process-6", 5)
    ];

    expect(formatAnomalyDetails(anomalies)).to.equal(
      "process-2 (spike): 8.000 CPU (8.0x baseline), " +
      "process-4 (spike): 7.000 CPU (7.0x baseline), " +
      "process-6 (spike): 5.000 CPU (5.0x baseline), " +
      "process-5 (spike): 4.000 CPU (4.0x baseline), " +
      "process-3 (spike): 3.000 CPU (3.0x baseline), " +
      "... 1 more omitted"
    );
  });
});
