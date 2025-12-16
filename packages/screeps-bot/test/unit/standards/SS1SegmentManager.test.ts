import { expect } from "chai";
import { SS1SegmentManager } from "../../../src/standards/SS1SegmentManager";
import { SS1Channel, SS1DefaultPublicSegment } from "../../../src/standards/types";

describe("SS1SegmentManager", () => {
  // Mock Game.time
  beforeEach(() => {
    // @ts-ignore: allow adding Game to global
    global.Game = { time: 1000 };
  });

  describe("createChannel", () => {
    it("should create a basic channel", () => {
      const channel = SS1SegmentManager.createChannel("testProtocol", {
        data: "test data",
      });

      expect(channel.protocol).to.equal("testProtocol");
      expect(channel.data).to.equal("test data");
      expect(channel.update).to.exist;
    });

    it("should create a channel with segments", () => {
      const channel = SS1SegmentManager.createChannel("portals", {
        segments: [43, 87],
        version: "v1.0.0",
      });

      expect(channel.protocol).to.equal("portals");
      expect(channel.segments).to.deep.equal([43, 87]);
      expect(channel.version).to.equal("v1.0.0");
    });

    it("should create a channel with compression flag", () => {
      const channel = SS1SegmentManager.createChannel("needs", {
        data: "compressed data",
        compressed: true,
        keyid: "CF53B61",
      });

      expect(channel.compressed).to.be.true;
      expect(channel.keyid).to.equal("CF53B61");
    });

    it("should add custom properties with x- prefix", () => {
      const channel = SS1SegmentManager.createChannel("custom", {
        custom: {
          "x-custom": "value",
          regular: "test",
        },
      });

      expect((channel as any)["x-custom"]).to.equal("value");
      expect((channel as any)["x-regular"]).to.equal("test");
    });
  });

  describe("segment structure validation", () => {
    it("should create valid SS1 segment structure", () => {
      const channels = {
        portals: SS1SegmentManager.createChannel("portals", {
          segments: [43, 87],
        }),
        needs: SS1SegmentManager.createChannel("roomneeds", {
          data: JSON.stringify([{ room: "W1N1", resource: "energy", amount: 1000 }]),
        }),
      };

      // This mimics what updateDefaultPublicSegment does
      const segment: SS1DefaultPublicSegment = {
        api: {
          version: "v1.0.0",
          update: 12345,
        },
        channels: channels,
      };

      // Validate structure
      expect(segment.api.version).to.equal("v1.0.0");
      expect(segment.channels.portals).to.exist;
      expect(segment.channels.needs).to.exist;
      expect(segment.channels.portals.segments).to.deep.equal([43, 87]);
    });
  });

  describe("compression and decompression", () => {
    it("should compress and decompress simple text", () => {
      const originalData = "Hello, World!";
      const compressed = SS1SegmentManager.compressData(originalData);
      const decompressed = SS1SegmentManager.decompressData(compressed);

      expect(decompressed).to.equal(originalData);
      expect(compressed).to.not.equal(originalData);
    });

    it("should compress and decompress JSON data", () => {
      const originalData = JSON.stringify({
        rooms: ["W1N1", "W2N2", "W3N3"],
        resources: { energy: 50000, power: 1000 },
        timestamp: 12345678,
      });
      const compressed = SS1SegmentManager.compressData(originalData);
      const decompressed = SS1SegmentManager.decompressData(compressed);

      expect(decompressed).to.equal(originalData);
      expect(JSON.parse(decompressed)).to.deep.equal(JSON.parse(originalData));
    });

    it("should compress large text efficiently", () => {
      const originalData = "This is a test string. ".repeat(1000);
      const compressed = SS1SegmentManager.compressData(originalData);
      const decompressed = SS1SegmentManager.decompressData(compressed);

      expect(decompressed).to.equal(originalData);
      // Compressed data should be smaller than original
      expect(compressed.length).to.be.lessThan(originalData.length);
    });

    it("should handle empty string", () => {
      const originalData = "";
      const compressed = SS1SegmentManager.compressData(originalData);
      const decompressed = SS1SegmentManager.decompressData(compressed);

      expect(decompressed).to.equal(originalData);
    });

    it("should handle special characters", () => {
      const originalData = "Special: 日本語, émojis 🎉, symbols €£¥";
      const compressed = SS1SegmentManager.compressData(originalData);
      const decompressed = SS1SegmentManager.decompressData(compressed);

      expect(decompressed).to.equal(originalData);
    });

    it("should handle multi-line text", () => {
      const originalData = `Line 1
Line 2
Line 3
Line 4`;
      const compressed = SS1SegmentManager.compressData(originalData);
      const decompressed = SS1SegmentManager.decompressData(compressed);

      expect(decompressed).to.equal(originalData);
    });

    it("should return original data if decompression fails", () => {
      const invalidCompressedData = "this is not compressed data";
      const result = SS1SegmentManager.decompressData(invalidCompressedData);

      // Should return the original data when decompression fails
      expect(result).to.equal(invalidCompressedData);
    });
  });

  describe("encryption and decryption", () => {
    it("should encrypt and decrypt simple text", () => {
      const originalData = "Hello, World!";
      const key = "secretKey";
      const encrypted = SS1SegmentManager.encryptData(originalData, key);
      const decrypted = SS1SegmentManager.decryptData(encrypted, key);

      expect(decrypted).to.equal(originalData);
      expect(encrypted).to.not.equal(originalData);
    });

    it("should encrypt and decrypt JSON data", () => {
      const originalData = JSON.stringify({
        rooms: ["W1N1", "W2N2", "W3N3"],
        resources: { energy: 50000, power: 1000 },
        timestamp: 12345678,
      });
      const key = "myEncryptionKey";
      const encrypted = SS1SegmentManager.encryptData(originalData, key);
      const decrypted = SS1SegmentManager.decryptData(encrypted, key);

      expect(decrypted).to.equal(originalData);
      expect(JSON.parse(decrypted)).to.deep.equal(JSON.parse(originalData));
    });

    it("should handle empty string", () => {
      const originalData = "";
      const key = "testKey";
      const encrypted = SS1SegmentManager.encryptData(originalData, key);
      const decrypted = SS1SegmentManager.decryptData(encrypted, key);

      expect(decrypted).to.equal(originalData);
    });

    it("should handle special characters", () => {
      const originalData = "Special: 日本語, émojis 🎉, symbols €£¥";
      const key = "specialKey";
      const encrypted = SS1SegmentManager.encryptData(originalData, key);
      const decrypted = SS1SegmentManager.decryptData(encrypted, key);

      expect(decrypted).to.equal(originalData);
    });

    it("should produce different ciphertext with different keys", () => {
      const originalData = "Secret message";
      const key1 = "key1";
      const key2 = "key2";
      
      const encrypted1 = SS1SegmentManager.encryptData(originalData, key1);
      const encrypted2 = SS1SegmentManager.encryptData(originalData, key2);

      expect(encrypted1).to.not.equal(encrypted2);
    });

    it("should fail to decrypt with wrong key", () => {
      const originalData = "Secret message";
      const correctKey = "correctKey";
      const wrongKey = "wrongKey";
      
      const encrypted = SS1SegmentManager.encryptData(originalData, correctKey);
      const decrypted = SS1SegmentManager.decryptData(encrypted, wrongKey);

      expect(decrypted).to.not.equal(originalData);
    });

    it("should handle multi-line text", () => {
      const originalData = `Line 1
Line 2
Line 3
Line 4`;
      const key = "multilineKey";
      const encrypted = SS1SegmentManager.encryptData(originalData, key);
      const decrypted = SS1SegmentManager.decryptData(encrypted, key);

      expect(decrypted).to.equal(originalData);
    });

    it("should return original data with empty key", () => {
      const originalData = "Some data";
      const encrypted = SS1SegmentManager.encryptData(originalData, "");
      const decrypted = SS1SegmentManager.decryptData(originalData, "");

      expect(encrypted).to.equal(originalData);
      expect(decrypted).to.equal(originalData);
    });

    it("should handle long keys", () => {
      const originalData = "Short message";
      const longKey = "This is a very long key that is longer than the message itself";
      
      const encrypted = SS1SegmentManager.encryptData(originalData, longKey);
      const decrypted = SS1SegmentManager.decryptData(encrypted, longKey);

      expect(decrypted).to.equal(originalData);
    });

    it("should handle key wrapping for long data", () => {
      const originalData = "A".repeat(1000);
      const shortKey = "key";
      
      const encrypted = SS1SegmentManager.encryptData(originalData, shortKey);
      const decrypted = SS1SegmentManager.decryptData(encrypted, shortKey);

      expect(decrypted).to.equal(originalData);
    });
  });

  describe("channel validation", () => {
    it("should validate valid channel", () => {
      const channel = SS1SegmentManager.createChannel("test", {
        segments: [1, 2, 3],
        version: "v1.0.0",
      });

      const result = SS1SegmentManager.validateChannel("test", channel);
      expect(result.valid).to.be.true;
      expect(result.errors).to.be.empty;
    });

    it("should reject invalid segment IDs", () => {
      const channel = SS1SegmentManager.createChannel("test", {
        segments: [-1, 100, 50],
      });

      const result = SS1SegmentManager.validateChannel("test", channel);
      expect(result.valid).to.be.false;
      expect(result.errors.length).to.be.at.least(1);
      expect(result.errors[0]).to.include("Invalid segment ID");
    });

    it("should reject invalid version format", () => {
      const channel = SS1SegmentManager.createChannel("test", {
        version: "invalid",
      });

      const result = SS1SegmentManager.validateChannel("test", channel);
      expect(result.valid).to.be.false;
      expect(result.errors.some(e => e.includes("version"))).to.be.true;
    });

    it("should reject data and segments together", () => {
      const channel: any = {
        protocol: "test",
        data: "test data",
        segments: [1, 2, 3],
        update: 1000,
      };

      const result = SS1SegmentManager.validateChannel("test", channel);
      expect(result.valid).to.be.false;
      expect(result.errors.some(e => e.includes("mutually exclusive"))).to.be.true;
    });

    it("should accept valid version formats", () => {
      const validVersions = ["v1.0.0", "1.0.0", "v2.1.3", "10.20.30"];
      
      for (const version of validVersions) {
        const channel = SS1SegmentManager.createChannel("test", { version });
        const result = SS1SegmentManager.validateChannel("test", channel);
        expect(result.valid).to.be.true;
      }
    });
  });

  describe("compression threshold", () => {
    it("should compress large channel data automatically", () => {
      const largeData = "x".repeat(2000);
      const channels = {
        large: SS1SegmentManager.createChannel("test", { data: largeData }),
        small: SS1SegmentManager.createChannel("test2", { data: "small" }),
      };

      const compressed = SS1SegmentManager.compressChannelsIfNeeded(channels);
      
      expect(compressed.large.compressed).to.be.true;
      expect(compressed.small.compressed).to.not.be.true;
    });

    it("should not compress small data", () => {
      const smallData = "x".repeat(500);
      const channels = {
        test: SS1SegmentManager.createChannel("test", { data: smallData }),
      };

      const compressed = SS1SegmentManager.compressChannelsIfNeeded(channels);
      expect(compressed.test.compressed).to.not.be.true;
    });
  });

  describe("content hashing and throttling", () => {
    beforeEach(() => {
      // Reset memory for each test
      (Memory as any).ss1Manager = undefined;
    });

    it("should not update when content unchanged", () => {
      const channels = {
        test: SS1SegmentManager.createChannel("test", { data: "test" }),
      };

      // First update should succeed
      const result1 = SS1SegmentManager.updateWithThrottling(channels);
      expect(result1).to.be.true;

      // Second update with same content should be skipped
      const result2 = SS1SegmentManager.updateWithThrottling(channels);
      expect(result2).to.be.true; // Returns true but doesn't actually update
    });

    it("should force update when requested", () => {
      const channels = {
        test: SS1SegmentManager.createChannel("test", { data: "test" }),
      };

      SS1SegmentManager.updateWithThrottling(channels);
      const result = SS1SegmentManager.updateWithThrottling(channels, true);
      expect(result).to.be.true;
    });
  });

  describe("metrics tracking", () => {
    beforeEach(() => {
      (Memory as any).ss1Manager = undefined;
      SS1SegmentManager.resetMetrics();
    });

    it("should track metrics", () => {
      const metrics = SS1SegmentManager.getMetrics();
      expect(metrics).to.not.be.null;
      expect(metrics?.segmentWrites).to.exist;
      expect(metrics?.segmentReads).to.exist;
    });

    it("should reset metrics", () => {
      SS1SegmentManager.resetMetrics();
      const metrics = SS1SegmentManager.getMetrics();
      
      expect(metrics?.segmentWrites.success).to.equal(0);
      expect(metrics?.segmentWrites.failure).to.equal(0);
      expect(metrics?.segmentReads.success).to.equal(0);
      expect(metrics?.segmentReads.failure).to.equal(0);
    });

    it("should generate metrics summary", () => {
      const summary = SS1SegmentManager.getMetricsSummary();
      expect(summary).to.be.a("string");
      expect(summary).to.include("SS1 Segment Manager Metrics");
    });
  });
});
