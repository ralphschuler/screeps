/**
 * Memory Management Console Commands
 *
 * Commands for monitoring and managing memory usage, compression, and segmentation.
 */

import { Command } from "../core/commandRegistry";
import { memoryMonitor } from "./memoryMonitor";
import { memoryPruner } from "./memoryPruner";
import { memorySegmentManager, SEGMENT_ALLOCATION } from "./memorySegmentManager";
import { memoryCompressor } from "./memoryCompressor";
import { migrationRunner } from "./migrations";
import { memoryManager } from "./manager";

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
    const stats = memoryMonitor.checkMemoryUsage();
    const breakdown = stats.breakdown;

    let output = `Memory Status: ${stats.status.toUpperCase()}\n`;
    output += `Usage: ${memoryMonitor.formatBytes(stats.used)} / ${memoryMonitor.formatBytes(stats.limit)} (${(stats.percentage * 100).toFixed(1)}%)\n\n`;
    output += `Breakdown:\n`;
    output += `  Empire:        ${memoryMonitor.formatBytes(breakdown.empire)} (${((breakdown.empire / breakdown.total) * 100).toFixed(1)}%)\n`;
    output += `  Rooms:         ${memoryMonitor.formatBytes(breakdown.rooms)} (${((breakdown.rooms / breakdown.total) * 100).toFixed(1)}%)\n`;
    output += `  Creeps:        ${memoryMonitor.formatBytes(breakdown.creeps)} (${((breakdown.creeps / breakdown.total) * 100).toFixed(1)}%)\n`;
    output += `  Clusters:      ${memoryMonitor.formatBytes(breakdown.clusters)} (${((breakdown.clusters / breakdown.total) * 100).toFixed(1)}%)\n`;
    output += `  SS2 Queue:     ${memoryMonitor.formatBytes(breakdown.ss2PacketQueue)} (${((breakdown.ss2PacketQueue / breakdown.total) * 100).toFixed(1)}%)\n`;
    output += `  Other:         ${memoryMonitor.formatBytes(breakdown.other)} (${((breakdown.other / breakdown.total) * 100).toFixed(1)}%)\n`;

    return output;
  }

  @Command({
    name: "memory.analyze",
    description: "Analyze memory usage and show largest consumers",
    usage: "memory.analyze([topN])",
    examples: ["memory.analyze()", "memory.analyze(20)"],
    category: "Memory"
  })
  public analyze(topN = 10): string {
    const consumers = memoryMonitor.getLargestConsumers(topN);
    const recommendations = memoryPruner.getRecommendations();

    let output = `Top ${topN} Memory Consumers:\n`;
    consumers.forEach((consumer, i) => {
      output += `${i + 1}. ${consumer.type}:${consumer.name} - ${memoryMonitor.formatBytes(consumer.size)}\n`;
    });

    if (recommendations.length > 0) {
      output += `\nRecommendations:\n`;
      recommendations.forEach(rec => {
        output += `- ${rec}\n`;
      });
    } else {
      output += `\nNo recommendations at this time.\n`;
    }

    return output;
  }

  @Command({
    name: "memory.prune",
    description: "Manually trigger memory pruning to clean stale data",
    usage: "memory.prune()",
    examples: ["memory.prune()"],
    category: "Memory"
  })
  public prune(): string {
    const stats = memoryPruner.pruneAll();

    let output = `Memory Pruning Complete:\n`;
    output += `  Dead creeps removed:        ${stats.deadCreeps}\n`;
    output += `  Event log entries removed:  ${stats.eventLogs}\n`;
    output += `  Stale intel removed:        ${stats.staleIntel}\n`;
    output += `  Market history removed:     ${stats.marketHistory}\n`;
    output += `  Total bytes saved:          ${memoryMonitor.formatBytes(stats.bytesSaved)}\n`;

    return output;
  }

  @Command({
    name: "memory.segments",
    description: "Show memory segment allocation and usage",
    usage: "memory.segments()",
    examples: ["memory.segments()"],
    category: "Memory"
  })
  public segments(): string {
    const activeSegments = memorySegmentManager.getActiveSegments();

    let output = `Memory Segments:\n\n`;
    output += `Active segments: ${activeSegments.length}/10\n`;
    if (activeSegments.length > 0) {
      output += `  Loaded: [${activeSegments.join(", ")}]\n\n`;
    }

    output += `Allocation Strategy:\n`;
    for (const [type, range] of Object.entries(SEGMENT_ALLOCATION)) {
      output += `  ${type.padEnd(20)} ${range.start.toString().padStart(2)}-${range.end.toString().padEnd(2)}`;
      
      // Check if any segments in this range are active
      const activeInRange = activeSegments.filter(s => s >= range.start && s <= range.end);
      if (activeInRange.length > 0) {
        const sizes = activeInRange.map(s => {
          const size = memorySegmentManager.getSegmentSize(s);
          return `${s}:${memoryMonitor.formatBytes(size)}`;
        });
        output += ` [${sizes.join(", ")}]`;
      }
      output += `\n`;
    }

    return output;
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
    const currentVersion = migrationRunner.getCurrentVersion();
    const latestVersion = migrationRunner.getLatestVersion();
    const pending = migrationRunner.getPendingMigrations();

    let output = `Memory Migration Status:\n`;
    output += `  Current version: ${currentVersion}\n`;
    output += `  Latest version:  ${latestVersion}\n`;
    output += `  Status: ${pending.length > 0 ? "PENDING" : "UP TO DATE"}\n\n`;

    if (pending.length > 0) {
      output += `Pending Migrations:\n`;
      pending.forEach(migration => {
        output += `  v${migration.version}: ${migration.description}\n`;
      });
      output += `\nMigrations will run automatically on next tick.\n`;
    }

    return output;
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
