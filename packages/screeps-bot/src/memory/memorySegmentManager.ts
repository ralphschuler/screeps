/**
 * Memory Segment Manager
 *
 * Manages data persistence in RawMemory segments for rarely-accessed data.
 * Each segment can store up to 100KB, and there are 100 segments available (0-99).
 *
 * ROADMAP Section 4: Memory.segments für rarely-accessed data
 *
 * Segment Allocation Strategy:
 * - 0-9:   Active room data (hot data that needs frequent access)
 * - 10-19: Historical intel (accessed every 100-1000 ticks)
 * - 20-29: Market history and price trends (accessed every 500+ ticks)
 * - 30-39: Alliance/Standards data (SS2 protocol packets)
 * - 40-49: Archived empire state (old expansion candidates, war history)
 * - 50-89: Reserved for future use
 * - 90-99: Stats and monitoring data (used by memorySegmentStats)
 */

import { logger } from "../core/logger";

/**
 * Segment allocation map
 */
export const SEGMENT_ALLOCATION = {
  /** Active room data segments */
  ACTIVE_ROOMS: { start: 0, end: 9 },
  /** Historical intel segments */
  HISTORICAL_INTEL: { start: 10, end: 19 },
  /** Market history segments */
  MARKET_HISTORY: { start: 20, end: 29 },
  /** Alliance data segments */
  ALLIANCE_DATA: { start: 30, end: 39 },
  /** Archived empire state */
  ARCHIVED_EMPIRE: { start: 40, end: 49 },
  /** Reserved for future use */
  RESERVED: { start: 50, end: 89 },
  /** Stats and monitoring */
  STATS: { start: 90, end: 99 }
} as const;

/**
 * Segment data wrapper with metadata
 */
interface SegmentData<T = unknown> {
  /** Data stored in segment */
  data: T;
  /** Last update tick */
  lastUpdate: number;
  /** Data version for migration support */
  version: number;
}

/**
 * Memory Segment Manager class
 */
export class MemorySegmentManager {
  private activeSegments: Set<number> = new Set();
  private segmentCache: Map<number, unknown> = new Map();

  /**
   * Request a segment to be loaded (available next tick)
   */
  public requestSegment(segmentId: number): void {
    if (segmentId < 0 || segmentId > 99) {
      throw new Error(`Invalid segment ID: ${segmentId}. Must be 0-99.`);
    }

    this.activeSegments.add(segmentId);
    
    // Update active segments for next tick
    const activeArray = Array.from(this.activeSegments);
    if (activeArray.length > 10) {
      logger.warning("More than 10 segments requested", {
        subsystem: "MemorySegmentManager",
        meta: { count: activeArray.length, segments: activeArray }
      });
    }
    
    RawMemory.setActiveSegments(activeArray);
  }

  /**
   * Release a segment (stop loading it)
   */
  public releaseSegment(segmentId: number): void {
    this.activeSegments.delete(segmentId);
    this.segmentCache.delete(segmentId);
    
    // Update active segments
    RawMemory.setActiveSegments(Array.from(this.activeSegments));
  }

  /**
   * Check if a segment is currently loaded
   */
  public isSegmentLoaded(segmentId: number): boolean {
    return RawMemory.segments[segmentId] !== undefined;
  }

  /**
   * Write data to a segment
   */
  public writeSegment<T>(segmentId: number, key: string, data: T, version = 1): boolean {
    if (!this.isSegmentLoaded(segmentId)) {
      logger.warning("Attempted to write to unloaded segment", {
        subsystem: "MemorySegmentManager",
        meta: { segmentId, key }
      });
      return false;
    }

    try {
      // Parse existing segment data
      const segmentContent = RawMemory.segments[segmentId];
      const parsed = segmentContent ? JSON.parse(segmentContent) : {};

      // Create segment data wrapper
      const wrapper: SegmentData<T> = {
        data,
        lastUpdate: Game.time,
        version
      };

      // Store under key
      parsed[key] = wrapper;

      // Serialize and write back
      const serialized = JSON.stringify(parsed);
      
      // Check size limit (100KB)
      if (serialized.length > 100 * 1024) {
        logger.error("Segment data exceeds 100KB limit", {
          subsystem: "MemorySegmentManager",
          meta: { segmentId, key, size: serialized.length }
        });
        return false;
      }

      RawMemory.segments[segmentId] = serialized;
      
      // Update cache
      this.segmentCache.set(segmentId, parsed);

      return true;
    } catch (error) {
      logger.error("Failed to write segment data", {
        subsystem: "MemorySegmentManager",
        meta: { segmentId, key, error: String(error) }
      });
      return false;
    }
  }

  /**
   * Read data from a segment
   */
  public readSegment<T>(segmentId: number, key: string): T | null {
    if (!this.isSegmentLoaded(segmentId)) {
      logger.warning("Attempted to read from unloaded segment", {
        subsystem: "MemorySegmentManager",
        meta: { segmentId, key }
      });
      return null;
    }

    try {
      // Check cache first
      let parsed = this.segmentCache.get(segmentId) as Record<string, SegmentData<T>> | undefined;
      
      if (!parsed) {
        const segmentContent = RawMemory.segments[segmentId];
        if (!segmentContent) return null;
        
        parsed = JSON.parse(segmentContent);
        this.segmentCache.set(segmentId, parsed);
      }

      const wrapper = parsed[key] as SegmentData<T> | undefined;
      return wrapper ? wrapper.data : null;
    } catch (error) {
      logger.error("Failed to read segment data", {
        subsystem: "MemorySegmentManager",
        meta: { segmentId, key, error: String(error) }
      });
      return null;
    }
  }

  /**
   * Get metadata for a segment key
   */
  public getSegmentMetadata(segmentId: number, key: string): { lastUpdate: number; version: number } | null {
    if (!this.isSegmentLoaded(segmentId)) return null;

    try {
      const segmentContent = RawMemory.segments[segmentId];
      if (!segmentContent) return null;

      const parsed = JSON.parse(segmentContent);
      const wrapper = parsed[key] as SegmentData | undefined;

      return wrapper ? { lastUpdate: wrapper.lastUpdate, version: wrapper.version } : null;
    } catch {
      return null;
    }
  }

  /**
   * Delete a key from a segment
   */
  public deleteSegmentKey(segmentId: number, key: string): boolean {
    if (!this.isSegmentLoaded(segmentId)) return false;

    try {
      const segmentContent = RawMemory.segments[segmentId];
      if (!segmentContent) return false;

      const parsed = JSON.parse(segmentContent);
      delete parsed[key];

      RawMemory.segments[segmentId] = JSON.stringify(parsed);
      this.segmentCache.set(segmentId, parsed);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear an entire segment
   */
  public clearSegment(segmentId: number): void {
    if (!this.isSegmentLoaded(segmentId)) {
      logger.warning("Attempted to clear unloaded segment", {
        subsystem: "MemorySegmentManager",
        meta: { segmentId }
      });
      return;
    }

    RawMemory.segments[segmentId] = "";
    this.segmentCache.delete(segmentId);
  }

  /**
   * Get all keys in a segment
   */
  public getSegmentKeys(segmentId: number): string[] {
    if (!this.isSegmentLoaded(segmentId)) return [];

    try {
      const segmentContent = RawMemory.segments[segmentId];
      if (!segmentContent) return [];

      const parsed = JSON.parse(segmentContent);
      return Object.keys(parsed);
    } catch {
      return [];
    }
  }

  /**
   * Get segment size in bytes
   */
  public getSegmentSize(segmentId: number): number {
    if (!this.isSegmentLoaded(segmentId)) return 0;

    const segmentContent = RawMemory.segments[segmentId];
    return segmentContent ? segmentContent.length : 0;
  }

  /**
   * Get all currently active segments
   */
  public getActiveSegments(): number[] {
    return Array.from(this.activeSegments);
  }

  /**
   * Suggest segment for data type
   */
  public suggestSegmentForType(type: keyof typeof SEGMENT_ALLOCATION): number {
    const range = SEGMENT_ALLOCATION[type];
    
    // Find first available segment in range
    for (let i = range.start; i <= range.end; i++) {
      if (!this.isSegmentLoaded(i) || this.getSegmentSize(i) < 90 * 1024) {
        return i;
      }
    }

    // All segments full or unavailable, return first in range
    return range.start;
  }

  /**
   * Migrate data from Memory to segment
   */
  public migrateToSegment<T>(
    memoryPath: string,
    segmentId: number,
    key: string
  ): boolean {
    // Get data from Memory
    const parts = memoryPath.split(".");
    let data: unknown = Memory as unknown as Record<string, unknown>;
    
    for (const part of parts) {
      if (data && typeof data === "object" && part in data) {
        data = (data as Record<string, unknown>)[part];
      } else {
        logger.warning("Memory path not found for migration", {
          subsystem: "MemorySegmentManager",
          meta: { memoryPath, segmentId, key }
        });
        return false;
      }
    }

    // Write to segment
    if (!this.isSegmentLoaded(segmentId)) {
      this.requestSegment(segmentId);
      logger.info("Segment not loaded, will migrate next tick", {
        subsystem: "MemorySegmentManager",
        meta: { memoryPath, segmentId, key }
      });
      return false;
    }

    const success = this.writeSegment<T>(segmentId, key, data as T);
    
    if (success) {
      logger.info("Successfully migrated data to segment", {
        subsystem: "MemorySegmentManager",
        meta: { memoryPath, segmentId, key, dataSize: JSON.stringify(data).length }
      });
    }

    return success;
  }
}

/**
 * Global memory segment manager instance
 */
export const memorySegmentManager = new MemorySegmentManager();
