/**
 * Memory Compressor
 *
 * Compresses large, repetitive data structures using LZ-String compression.
 * Particularly effective for intel data, portal maps, and market history.
 *
 * ROADMAP Section 4: Compression for large data structures
 *
 * Expected compression ratios:
 * - Intel data: 60-70% reduction (highly repetitive room structures)
 * - Portal maps: 50-60% reduction (coordinate data compresses well)
 * - Market history: 70-80% reduction (numeric time-series data)
 */

import * as LZString from "lz-string";
import { logger } from "../core/logger";
import type { RoomIntel } from "./schemas";

/**
 * Compressed data wrapper
 */
export interface CompressedData {
  /** Compressed string */
  compressed: string;
  /** Original size in bytes */
  originalSize: number;
  /** Compressed size in bytes */
  compressedSize: number;
  /** Compression timestamp */
  timestamp: number;
  /** Data version for migration */
  version: number;
}

/**
 * Compression statistics
 */
export interface CompressionStats {
  /** Original size in bytes */
  originalSize: number;
  /** Compressed size in bytes */
  compressedSize: number;
  /** Bytes saved */
  bytesSaved: number;
  /** Compression ratio (0-1, lower is better) */
  ratio: number;
}

/**
 * Memory Compressor class
 */
export class MemoryCompressor {
  /**
   * Compress data using LZ-String
   */
  public compress<T>(data: T, version = 1): CompressedData {
    const serialized = JSON.stringify(data);
    const originalSize = serialized.length;
    
    const compressed = LZString.compressToUTF16(serialized);
    const compressedSize = compressed.length;

    return {
      compressed,
      originalSize,
      compressedSize,
      timestamp: Game.time,
      version
    };
  }

  /**
   * Decompress data
   */
  public decompress<T>(compressedData: CompressedData | string): T | null {
    try {
      // Handle both CompressedData wrapper and raw compressed string
      const compressed = typeof compressedData === "string" 
        ? compressedData 
        : compressedData.compressed;

      const decompressed = LZString.decompressFromUTF16(compressed);
      
      if (!decompressed) {
        logger.error("Decompression returned null", {
          subsystem: "MemoryCompressor"
        });
        return null;
      }

      return JSON.parse(decompressed) as T;
    } catch (error) {
      logger.error("Failed to decompress data", {
        subsystem: "MemoryCompressor",
        meta: { error: String(error) }
      });
      return null;
    }
  }

  /**
   * Compress intel data
   */
  public compressIntel(intel: Record<string, RoomIntel>): CompressedData {
    return this.compress(intel);
  }

  /**
   * Decompress intel data
   */
  public decompressIntel(compressedData: CompressedData | string): Record<string, RoomIntel> | null {
    return this.decompress<Record<string, RoomIntel>>(compressedData);
  }

  /**
   * Compress portal map data
   */
  public compressPortalMap(portals: unknown[]): CompressedData {
    return this.compress(portals);
  }

  /**
   * Decompress portal map data
   */
  public decompressPortalMap(compressedData: CompressedData | string): unknown[] | null {
    return this.decompress<unknown[]>(compressedData);
  }

  /**
   * Compress market history
   */
  public compressMarketHistory(history: unknown): CompressedData {
    return this.compress(history);
  }

  /**
   * Decompress market history
   */
  public decompressMarketHistory(compressedData: CompressedData | string): unknown | null {
    return this.decompress<unknown>(compressedData);
  }

  /**
   * Calculate compression statistics
   */
  public getCompressionStats<T>(data: T): CompressionStats {
    const compressed = this.compress(data);
    const originalSize = compressed.originalSize;
    const compressedSize = compressed.compressedSize;
    const bytesSaved = originalSize - compressedSize;
    const ratio = compressedSize / originalSize;

    return {
      originalSize,
      compressedSize,
      bytesSaved,
      ratio
    };
  }

  /**
   * Test if compression is beneficial for given data
   * Note: This performs actual compression to get accurate stats
   */
  public shouldCompress<T>(data: T, minSizeBytes = 1000, maxRatio = 0.9): boolean {
    const size = JSON.stringify(data).length;
    
    // Don't compress small data (overhead not worth it)
    if (size < minSizeBytes) return false;

    // Test compression ratio
    const compressed = this.compress(data);
    
    // Compress if we save at least 10% (ratio < 0.9)
    return compressed.compressedSize / compressed.originalSize < maxRatio;
  }

  /**
   * Compress only if beneficial
   */
  public compressIfBeneficial<T>(
    data: T,
    minSizeBytes = 1000,
    maxRatio = 0.9
  ): CompressedData | T {
    if (this.shouldCompress(data, minSizeBytes, maxRatio)) {
      return this.compress(data);
    }
    return data;
  }

  /**
   * Check if data is compressed
   */
  public isCompressed(data: unknown): data is CompressedData {
    return (
      typeof data === "object" &&
      data !== null &&
      "compressed" in data &&
      "originalSize" in data &&
      "compressedSize" in data
    );
  }

  /**
   * Get or decompress data (handles both compressed and uncompressed)
   */
  public getOrDecompress<T>(data: CompressedData | T): T | null {
    if (this.isCompressed(data)) {
      return this.decompress<T>(data);
    }
    return data as T;
  }

  /**
   * Batch compress multiple data entries
   */
  public batchCompress<T>(
    entries: Record<string, T>
  ): Record<string, CompressedData> {
    const compressed: Record<string, CompressedData> = {};
    
    for (const key in entries) {
      compressed[key] = this.compress(entries[key]);
    }

    return compressed;
  }

  /**
   * Batch decompress multiple data entries
   */
  public batchDecompress<T>(
    entries: Record<string, CompressedData>
  ): Record<string, T | null> {
    const decompressed: Record<string, T | null> = {};
    
    for (const key in entries) {
      decompressed[key] = this.decompress<T>(entries[key]);
    }

    return decompressed;
  }

  /**
   * Format compression stats for console
   */
  public formatStats(stats: CompressionStats): string {
    const savedPercent = ((1 - stats.ratio) * 100).toFixed(1);
    return `${this.formatBytes(stats.originalSize)} → ${this.formatBytes(stats.compressedSize)} (${savedPercent}% saved)`;
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  }
}

/**
 * Global memory compressor instance
 */
export const memoryCompressor = new MemoryCompressor();
