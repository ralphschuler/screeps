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
export declare class MemoryCompressor {
    /**
     * Compress data using LZ-String
     */
    compress<T>(data: T, version?: number): CompressedData;
    /**
     * Decompress data
     */
    decompress<T>(compressedData: CompressedData | string): T | null;
    /**
     * Compress intel data
     */
    compressIntel(intel: Record<string, RoomIntel>): CompressedData;
    /**
     * Decompress intel data
     */
    decompressIntel(compressedData: CompressedData | string): Record<string, RoomIntel> | null;
    /**
     * Compress portal map data
     */
    compressPortalMap(portals: unknown[]): CompressedData;
    /**
     * Decompress portal map data
     */
    decompressPortalMap(compressedData: CompressedData | string): unknown[] | null;
    /**
     * Compress market history
     */
    compressMarketHistory(history: unknown): CompressedData;
    /**
     * Decompress market history
     */
    decompressMarketHistory(compressedData: CompressedData | string): unknown | null;
    /**
     * Calculate compression statistics
     */
    getCompressionStats<T>(data: T): CompressionStats;
    /**
     * Test if compression is beneficial for given data
     * Note: This performs actual compression to get accurate stats
     */
    shouldCompress<T>(data: T, minSizeBytes?: number, maxRatio?: number): boolean;
    /**
     * Compress only if beneficial
     */
    compressIfBeneficial<T>(data: T, minSizeBytes?: number, maxRatio?: number): CompressedData | T;
    /**
     * Check if data is compressed
     */
    isCompressed(data: unknown): data is CompressedData;
    /**
     * Get or decompress data (handles both compressed and uncompressed)
     */
    getOrDecompress<T>(data: CompressedData | T): T | null;
    /**
     * Batch compress multiple data entries
     */
    batchCompress<T>(entries: Record<string, T>): Record<string, CompressedData>;
    /**
     * Batch decompress multiple data entries
     */
    batchDecompress<T>(entries: Record<string, CompressedData>): Record<string, T | null>;
    /**
     * Format compression stats for console
     */
    formatStats(stats: CompressionStats): string;
    /**
     * Format bytes to human-readable string
     */
    private formatBytes;
}
/**
 * Global memory compressor instance
 */
export declare const memoryCompressor: MemoryCompressor;
//# sourceMappingURL=memoryCompressor.d.ts.map