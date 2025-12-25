"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryCompressor = exports.MemoryCompressor = void 0;
const LZString = __importStar(require("lz-string"));
const logger_1 = require("../core/logger");
/**
 * Memory Compressor class
 */
class MemoryCompressor {
    /**
     * Compress data using LZ-String
     */
    compress(data, version = 1) {
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
    decompress(compressedData) {
        try {
            // Handle both CompressedData wrapper and raw compressed string
            const compressed = typeof compressedData === "string"
                ? compressedData
                : compressedData.compressed;
            const decompressed = LZString.decompressFromUTF16(compressed);
            if (!decompressed) {
                logger_1.logger.error("Decompression returned null", {
                    subsystem: "MemoryCompressor"
                });
                return null;
            }
            return JSON.parse(decompressed);
        }
        catch (error) {
            logger_1.logger.error("Failed to decompress data", {
                subsystem: "MemoryCompressor",
                meta: { error: String(error) }
            });
            return null;
        }
    }
    /**
     * Compress intel data
     */
    compressIntel(intel) {
        return this.compress(intel);
    }
    /**
     * Decompress intel data
     */
    decompressIntel(compressedData) {
        return this.decompress(compressedData);
    }
    /**
     * Compress portal map data
     */
    compressPortalMap(portals) {
        return this.compress(portals);
    }
    /**
     * Decompress portal map data
     */
    decompressPortalMap(compressedData) {
        return this.decompress(compressedData);
    }
    /**
     * Compress market history
     */
    compressMarketHistory(history) {
        return this.compress(history);
    }
    /**
     * Decompress market history
     */
    decompressMarketHistory(compressedData) {
        return this.decompress(compressedData);
    }
    /**
     * Calculate compression statistics
     */
    getCompressionStats(data) {
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
    shouldCompress(data, minSizeBytes = 1000, maxRatio = 0.9) {
        const size = JSON.stringify(data).length;
        // Don't compress small data (overhead not worth it)
        if (size < minSizeBytes)
            return false;
        // Test compression ratio
        const compressed = this.compress(data);
        // Compress if we save at least 10% (ratio < 0.9)
        return compressed.compressedSize / compressed.originalSize < maxRatio;
    }
    /**
     * Compress only if beneficial
     */
    compressIfBeneficial(data, minSizeBytes = 1000, maxRatio = 0.9) {
        if (this.shouldCompress(data, minSizeBytes, maxRatio)) {
            return this.compress(data);
        }
        return data;
    }
    /**
     * Check if data is compressed
     */
    isCompressed(data) {
        return (typeof data === "object" &&
            data !== null &&
            "compressed" in data &&
            "originalSize" in data &&
            "compressedSize" in data);
    }
    /**
     * Get or decompress data (handles both compressed and uncompressed)
     */
    getOrDecompress(data) {
        if (this.isCompressed(data)) {
            return this.decompress(data);
        }
        return data;
    }
    /**
     * Batch compress multiple data entries
     */
    batchCompress(entries) {
        const compressed = {};
        for (const key in entries) {
            compressed[key] = this.compress(entries[key]);
        }
        return compressed;
    }
    /**
     * Batch decompress multiple data entries
     */
    batchDecompress(entries) {
        const decompressed = {};
        for (const key in entries) {
            decompressed[key] = this.decompress(entries[key]);
        }
        return decompressed;
    }
    /**
     * Format compression stats for console
     */
    formatStats(stats) {
        const savedPercent = ((1 - stats.ratio) * 100).toFixed(1);
        return `${this.formatBytes(stats.originalSize)} → ${this.formatBytes(stats.compressedSize)} (${savedPercent}% saved)`;
    }
    /**
     * Format bytes to human-readable string
     */
    formatBytes(bytes) {
        if (bytes < 1024)
            return `${bytes}B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)}KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
    }
}
exports.MemoryCompressor = MemoryCompressor;
/**
 * Global memory compressor instance
 */
exports.memoryCompressor = new MemoryCompressor();
