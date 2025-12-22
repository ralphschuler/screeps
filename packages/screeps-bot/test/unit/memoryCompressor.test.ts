import { expect } from "chai";
import { memoryCompressor } from "../../src/memory/memoryCompressor";
import type { RoomIntel } from "../../src/memory/schemas";

describe("Memory Compressor", () => {
  describe("compress and decompress", () => {
    it("should compress and decompress simple objects", () => {
      const original = { foo: "bar", baz: 123, nested: { value: true } };
      
      const compressed = memoryCompressor.compress(original);
      expect(compressed).to.have.property("compressed");
      expect(compressed).to.have.property("originalSize");
      expect(compressed).to.have.property("compressedSize");
      expect(compressed.originalSize).to.be.greaterThan(0);
      
      const decompressed = memoryCompressor.decompress(compressed);
      expect(decompressed).to.deep.equal(original);
    });

    it("should compress and decompress arrays", () => {
      const original = [1, 2, 3, 4, 5, "test", { nested: true }];
      
      const compressed = memoryCompressor.compress(original);
      const decompressed = memoryCompressor.decompress(compressed);
      
      expect(decompressed).to.deep.equal(original);
    });

    it("should compress and decompress large intel data", () => {
      const intel: Record<string, RoomIntel> = {};
      
      // Create fake intel for 100 rooms
      for (let i = 0; i < 100; i++) {
        const roomName = `W${i}N${i}`;
        intel[roomName] = {
          name: roomName,
          lastSeen: 1000000 + i,
          sources: 2,
          controllerLevel: 0,
          threatLevel: 0,
          scouted: true,
          terrain: "mixed",
          isHighway: false,
          isSK: false
        };
      }

      const compressed = memoryCompressor.compressIntel(intel);
      const decompressed = memoryCompressor.decompressIntel(compressed);
      
      expect(decompressed).to.deep.equal(intel);
      expect(compressed.compressedSize).to.be.lessThan(compressed.originalSize);
    });

    it("should handle null decompression gracefully", () => {
      const result = memoryCompressor.decompress("invalid_compressed_data");
      expect(result).to.be.null;
    });
  });

  describe("compression statistics", () => {
    it("should calculate accurate compression stats", () => {
      const data = { 
        repeated: "This is a repeated string. ".repeat(100),
        numbers: Array.from({ length: 100 }, (_, i) => i)
      };

      const stats = memoryCompressor.getCompressionStats(data);
      
      expect(stats.originalSize).to.be.greaterThan(0);
      expect(stats.compressedSize).to.be.greaterThan(0);
      expect(stats.bytesSaved).to.equal(stats.originalSize - stats.compressedSize);
      expect(stats.ratio).to.equal(stats.compressedSize / stats.originalSize);
      
      // Repetitive data should compress well
      expect(stats.ratio).to.be.lessThan(0.5);
    });
  });

  describe("shouldCompress", () => {
    it("should not compress small data", () => {
      const smallData = { foo: "bar" };
      expect(memoryCompressor.shouldCompress(smallData, 1000)).to.be.false;
    });

    it("should compress large repetitive data", () => {
      const largeData = { repeated: "test ".repeat(500) };
      expect(memoryCompressor.shouldCompress(largeData, 1000)).to.be.true;
    });

    it("should not compress already-compressed data", () => {
      // Random data doesn't compress well
      const randomData = Array.from({ length: 1000 }, () => Math.random());
      expect(memoryCompressor.shouldCompress(randomData, 100, 0.9)).to.be.false;
    });
  });

  describe("isCompressed", () => {
    it("should identify compressed data", () => {
      const data = { foo: "bar" };
      const compressed = memoryCompressor.compress(data);
      
      expect(memoryCompressor.isCompressed(compressed)).to.be.true;
      expect(memoryCompressor.isCompressed(data)).to.be.false;
    });
  });

  describe("getOrDecompress", () => {
    it("should return data as-is if not compressed", () => {
      const data = { foo: "bar" };
      const result = memoryCompressor.getOrDecompress(data);
      
      expect(result).to.deep.equal(data);
    });

    it("should decompress if data is compressed", () => {
      const original = { foo: "bar", baz: 123 };
      const compressed = memoryCompressor.compress(original);
      const result = memoryCompressor.getOrDecompress(compressed);
      
      expect(result).to.deep.equal(original);
    });
  });

  describe("batch operations", () => {
    it("should batch compress multiple entries", () => {
      const entries = {
        room1: { data: "test1", count: 10 },
        room2: { data: "test2", count: 20 },
        room3: { data: "test3", count: 30 }
      };

      const compressed = memoryCompressor.batchCompress(entries);
      
      expect(Object.keys(compressed)).to.have.lengthOf(3);
      expect(memoryCompressor.isCompressed(compressed.room1)).to.be.true;
      expect(memoryCompressor.isCompressed(compressed.room2)).to.be.true;
      expect(memoryCompressor.isCompressed(compressed.room3)).to.be.true;
    });

    it("should batch decompress multiple entries", () => {
      const entries = {
        room1: { data: "test1", count: 10 },
        room2: { data: "test2", count: 20 }
      };

      const compressed = memoryCompressor.batchCompress(entries);
      const decompressed = memoryCompressor.batchDecompress(compressed);
      
      expect(decompressed.room1).to.deep.equal(entries.room1);
      expect(decompressed.room2).to.deep.equal(entries.room2);
    });
  });
});
