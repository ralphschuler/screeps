/**
 * Memory Management Console Commands
 *
 * Commands for monitoring and managing memory usage, compression, and segmentation.
 */

import {
  memoryManager,
  memoryCompressor,
  memoryMonitor,
  memoryPruner,
  SEGMENT_ALLOCATION,
  memorySegmentManager,
  migrationRunner
} from "@ralphschuler/screeps-memory";
import { Command } from "../core/commandRegistry";
import {
  formatMemoryConsumerReport,
  formatMemoryMigrationReport,
  formatMemoryPruneReport,
  formatMemorySegmentsReport,
  formatMemoryStatusReport
} from "./memoryOperationsReport";

/**
 * Memory management commands
 */
export class MemoryCommands {
  @Command({
    name: "memory.status",
    description: "Show current memory usage and status",
    usage: "memory.status()",
    examples: ["memory.status()"],
    category: "Memory"
  })
  public status(): string {
    return formatMemoryStatusReport(memoryMonitor.checkMemoryUsage(), memoryMonitor);
  }

  @Command({
    name: "memory.analyze",
    description: "Analyze memory usage and show largest consumers",
    usage: "memory.analyze([topN])",
    examples: ["memory.analyze()", "memory.analyze(20)"],
    category: "Memory"
  })
  public analyze(topN = 10): string {
    return formatMemoryConsumerReport(
      { topN, consumers: memoryMonitor.getLargestConsumers(topN), recommendations: memoryPruner.getRecommendations() },
      memoryMonitor
    );
  }

  @Command({
    name: "memory.prune",
    description: "Manually trigger memory pruning to clean stale data",
    usage: "memory.prune()",
    examples: ["memory.prune()"],
    category: "Memory"
  })
  public prune(): string {
    return formatMemoryPruneReport(memoryPruner.pruneAll(), memoryMonitor);
  }

  @Command({
    name: "memory.segments",
    description: "Show memory segment allocation and usage",
    usage: "memory.segments()",
    examples: ["memory.segments()"],
    category: "Memory"
  })
  public segments(): string {
    return formatMemorySegmentsReport(
      {
        activeSegments: memorySegmentManager.getActiveSegments(),
        allocation: SEGMENT_ALLOCATION,
        segmentSize: segment => memorySegmentManager.getSegmentSize(segment)
      },
      memoryMonitor
    );
  }

  @Command({
    name: "memory.compress",
    description: "Test compression on a memory path",
    usage: "memory.compress(path)",
    examples: ["memory.compress('empire.knownRooms')"],
    category: "Memory"
  })
  public compress(path: string): string {
    // Get data from memory path
    const parts = path.split(".");
    let data: unknown = Memory as unknown as Record<string, unknown>;

    for (const part of parts) {
      if (data && typeof data === "object" && part in data) {
        data = (data as Record<string, unknown>)[part];
      } else {
        return `Path not found: ${path}`;
      }
    }

    if (!data) {
      return `No data at path: ${path}`;
    }

    const stats = memoryCompressor.getCompressionStats(data);

    let output = `Compression Test for: ${path}\n`;
    output += `  Original size:    ${memoryMonitor.formatBytes(stats.originalSize)}\n`;
    output += `  Compressed size:  ${memoryMonitor.formatBytes(stats.compressedSize)}\n`;
    output += `  Bytes saved:      ${memoryMonitor.formatBytes(stats.bytesSaved)}\n`;
    output += `  Compression ratio: ${(stats.ratio * 100).toFixed(1)}%\n`;
    output += `  Worth compressing: ${stats.ratio < 0.9 ? "YES" : "NO"}\n`;

    return output;
  }

  @Command({
    name: "memory.migrations",
    description: "Show migration status and pending migrations",
    usage: "memory.migrations()",
    examples: ["memory.migrations()"],
    category: "Memory"
  })
  public migrations(): string {
    return formatMemoryMigrationReport({
      currentVersion: migrationRunner.getCurrentVersion(),
      latestVersion: migrationRunner.getLatestVersion(),
      pending: migrationRunner.getPendingMigrations()
    });
  }

  @Command({
    name: "memory.migrate",
    description: "Manually trigger memory migrations",
    usage: "memory.migrate()",
    examples: ["memory.migrate()"],
    category: "Memory"
  })
  public migrate(): string {
    const before = migrationRunner.getCurrentVersion();
    migrationRunner.runMigrations();
    const after = migrationRunner.getCurrentVersion();

    if (after > before) {
      return `Migrated from v${before} to v${after}`;
    } else {
      return `No migrations needed (current: v${after})`;
    }
  }

  @Command({
    name: "memory.reset",
    description: "Clear all memory (DANGEROUS - requires confirmation)",
    usage: "memory.reset('CONFIRM')",
    examples: ["memory.reset('CONFIRM')"],
    category: "Memory"
  })
  public reset(confirmation?: string): string {
    if (confirmation !== "CONFIRM") {
      return `WARNING: This will clear ALL memory!\nTo confirm, use: memory.reset('CONFIRM')`;
    }

    // Clear main memory
    const mem = Memory as unknown as Record<string, unknown>;
    for (const key in mem) {
      delete mem[key];
    }

    // Clear all memory segments (0-99)
    for (let segmentId = 0; segmentId < 100; segmentId++) {
      RawMemory.segments[segmentId] = "";
    }

    // Reinitialize
    memoryManager.initialize();

    return `Memory reset complete. All data cleared (main memory + 100 segments).`;
  }
}

/**
 * Global memory commands instance
 */
export const memoryCommands = new MemoryCommands();
