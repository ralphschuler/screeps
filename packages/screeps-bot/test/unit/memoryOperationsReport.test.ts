import { expect } from "chai";
import {
  formatMemoryConsumerReport,
  formatMemoryMigrationReport,
  formatMemoryPruneReport,
  formatMemoryStatusReport
} from "../../src/memory/memoryOperationsReport";

const formatter = { formatBytes: (bytes: number) => `${bytes}B` };

describe("Memory operations report Module", () => {
  it("formats memory status from a snapshot", () => {
    const report = formatMemoryStatusReport(
      {
        status: "ok",
        used: 100,
        limit: 1000,
        percentage: 0.1,
        breakdown: { total: 100, empire: 20, rooms: 20, creeps: 20, clusters: 10, ss2PacketQueue: 5, other: 25 }
      },
      formatter
    );

    expect(report).to.include("Memory Status: OK");
    expect(report).to.include("Usage: 100B / 1000B (10.0%)");
    expect(report).to.include("Empire");
  });

  it("formats memory consumers with recommendations", () => {
    const report = formatMemoryConsumerReport(
      { topN: 1, consumers: [{ type: "room", name: "W1N1", size: 50 }], recommendations: ["prune rooms"] },
      formatter
    );

    expect(report).to.include("Top 1 Memory Consumers:");
    expect(report).to.include("1. room:W1N1 - 50B");
    expect(report).to.include("- prune rooms");
  });

  it("formats prune and migration summaries", () => {
    expect(formatMemoryPruneReport({ deadCreeps: 1, eventLogs: 2, staleIntel: 3, marketHistory: 4, bytesSaved: 5 }, formatter)).to.include(
      "Total bytes saved:          5B"
    );

    expect(formatMemoryMigrationReport({ currentVersion: 1, latestVersion: 2, pending: [{ version: 2, description: "next" }] })).to.include(
      "v2: next"
    );
  });
});
