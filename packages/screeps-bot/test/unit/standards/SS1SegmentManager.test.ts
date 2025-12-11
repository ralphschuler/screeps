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
});
