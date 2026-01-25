/**
 * Memory Monitor
 *
 * Monitors memory usage and provides alerts when approaching limits.
 * Tracks memory consumption by category to identify optimization targets.
 *
 * ROADMAP Section 4: Memory-Limit ca. 2 MB monitoring and alerting
 */

import { createLogger } from "@ralphschuler/screeps-core";

const logger = createLogger("MemoryMonitor");

/** Memory limit in bytes (2MB) */
const MEMORY_LIMIT_BYTES = 2 * 1024 * 1024;

/** Warning threshold (80% of limit) */
const WARNING_THRESHOLD = 0.8;

/** Critical threshold (90% of limit) */
const CRITICAL_THRESHOLD = 0.9;

/**
 * Memory status levels
 */
export type MemoryStatus = "normal" | "warning" | "critical";

/**
 * Memory usage breakdown by category
 */
export interface MemoryBreakdown {
  /** Empire memory size in bytes */
  empire: number;
  /** All rooms memory size in bytes */
  rooms: number;
  /** All creeps memory size in bytes */
  creeps: number;
  /** Clusters memory size in bytes */
  clusters: number;
  /** SS2 packet queue size in bytes */
  ss2PacketQueue: number;
  /** Other/unknown memory size in bytes */
  other: number;
  /** Total memory size in bytes */
  total: number;
}

/**
 * Memory usage statistics
 */
export interface MemoryStats {
  /** Current memory usage in bytes */
  used: number;
  /** Memory limit in bytes */
  limit: number;
  /** Usage percentage (0-1) */
  percentage: number;
  /** Current status */
  status: MemoryStatus;
  /** Memory breakdown by category */
  breakdown: MemoryBreakdown;
}

/**
 * Memory Monitor class
 */
export class MemoryMonitor {
  private lastCheckTick = 0;
  private lastStatus: MemoryStatus = "normal";

  /**
   * Check memory usage and return status
   */
  public checkMemoryUsage(): MemoryStats {
    const used = RawMemory.get().length;
    const percentage = used / MEMORY_LIMIT_BYTES;
    
    let status: MemoryStatus = "normal";
    if (percentage >= CRITICAL_THRESHOLD) {
      status = "critical";
    } else if (percentage >= WARNING_THRESHOLD) {
      status = "warning";
    }

    // Log status changes
    if (status !== this.lastStatus) {
      if (status === "critical") {
        Game.notify(
          `CRITICAL: Memory at ${(percentage * 100).toFixed(1)}% (${this.formatBytes(used)}/${this.formatBytes(MEMORY_LIMIT_BYTES)})`
        );
        logger.error("Memory usage critical", {
          meta: { used, limit: MEMORY_LIMIT_BYTES, percentage }
        });
      } else if (status === "warning") {
        logger.warn("Memory usage warning", {
          meta: { used, limit: MEMORY_LIMIT_BYTES, percentage }
        });
      } else {
        logger.info("Memory usage normal", {
          meta: { used, limit: MEMORY_LIMIT_BYTES, percentage }
        });
      }
      this.lastStatus = status;
    }

    const breakdown = this.getMemoryBreakdown();

    return {
      used,
      limit: MEMORY_LIMIT_BYTES,
      percentage,
      status,
      breakdown
    };
  }

  /**
   * Get detailed memory breakdown by category
   */
  public getMemoryBreakdown(): MemoryBreakdown {
    const mem = Memory as unknown as Record<string, unknown>;

    const empireSize = this.getObjectSize(mem.empire);
    const roomsSize = this.getObjectSize(Memory.rooms);
    const creepsSize = this.getObjectSize(Memory.creeps);
    const clustersSize = this.getObjectSize(mem.clusters);
    const ss2Size = this.getObjectSize(mem.ss2PacketQueue);

    const total = RawMemory.get().length;
    const accounted = empireSize + roomsSize + creepsSize + clustersSize + ss2Size;
    const other = Math.max(0, total - accounted);

    return {
      empire: empireSize,
      rooms: roomsSize,
      creeps: creepsSize,
      clusters: clustersSize,
      ss2PacketQueue: ss2Size,
      other,
      total
    };
  }

  /**
   * Get size of an object in bytes
   */
  private getObjectSize(obj: unknown): number {
    if (obj === undefined || obj === null) return 0;
    return JSON.stringify(obj).length;
  }

  /**
   * Format bytes to human-readable string
   */
  public formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  }

  /**
   * Log memory breakdown to console
   */
  public logBreakdown(): void {
    const breakdown = this.getMemoryBreakdown();
    const stats = this.checkMemoryUsage();

    logger.info("Memory Usage", {
      meta: {
        used: this.formatBytes(stats.used),
        limit: this.formatBytes(stats.limit),
        percentage: `${(stats.percentage * 100).toFixed(1)}%`,
        status: stats.status.toUpperCase()
      }
    });

    logger.info("Memory Breakdown", {
      meta: {
        empire: `${this.formatBytes(breakdown.empire)} (${((breakdown.empire / breakdown.total) * 100).toFixed(1)}%)`,
        rooms: `${this.formatBytes(breakdown.rooms)} (${((breakdown.rooms / breakdown.total) * 100).toFixed(1)}%)`,
        creeps: `${this.formatBytes(breakdown.creeps)} (${((breakdown.creeps / breakdown.total) * 100).toFixed(1)}%)`,
        clusters: `${this.formatBytes(breakdown.clusters)} (${((breakdown.clusters / breakdown.total) * 100).toFixed(1)}%)`,
        ss2Queue: `${this.formatBytes(breakdown.ss2PacketQueue)} (${((breakdown.ss2PacketQueue / breakdown.total) * 100).toFixed(1)}%)`,
        other: `${this.formatBytes(breakdown.other)} (${((breakdown.other / breakdown.total) * 100).toFixed(1)}%)`
      }
    });
  }

  /**
   * Get largest memory consumers (top N rooms/clusters)
   */
  public getLargestConsumers(topN = 10): { type: string; name: string; size: number }[] {
    const consumers: { type: string; name: string; size: number }[] = [];

    // Check rooms
    if (Memory.rooms) {
      for (const roomName in Memory.rooms) {
        consumers.push({
          type: "room",
          name: roomName,
          size: this.getObjectSize(Memory.rooms[roomName])
        });
      }
    }

    // Check clusters
    const mem = Memory as unknown as Record<string, unknown>;
    const clusters = mem.clusters as Record<string, unknown> | undefined;
    if (clusters) {
      for (const clusterId in clusters) {
        consumers.push({
          type: "cluster",
          name: clusterId,
          size: this.getObjectSize(clusters[clusterId])
        });
      }
    }

    // Sort by size descending and return top N
    return consumers.sort((a, b) => b.size - a.size).slice(0, topN);
  }
}

/**
 * Global memory monitor instance
 */
export const memoryMonitor = new MemoryMonitor();
