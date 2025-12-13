import { expect } from "chai";
import { RoomNeedsProtocol } from "../../../src/standards/segment-protocols/RoomNeedsProtocol";
import { KeyExchangeProtocol } from "../../../src/standards/terminal-protocols/KeyExchangeProtocol";
import { SS1SegmentManager } from "../../../src/standards/SS1SegmentManager";
import { RoomNeed } from "../../../src/standards/types";

describe("RoomNeedsProtocol", () => {
  beforeEach(() => {
    // Mock Game.time
    // @ts-ignore: allow adding Game to global
    global.Game = { time: 1000 };
    
    // Mock RawMemory for segment operations
    // @ts-ignore: allow adding RawMemory to global
    global.RawMemory = {
      segments: {},
      foreignSegment: null,
      setPublicSegments: () => {},
      setDefaultPublicSegment: () => {},
      setActiveForeignSegment: () => {},
    };
  });

  describe("encryption and decryption integration", () => {
    it("should decrypt data when key is available", () => {
      const testNeeds: RoomNeed[] = [
        {
          room: "W1N1",
          resource: RESOURCE_ENERGY,
          amount: 5000,
          priority: 8,
        },
        {
          room: "W2N2",
          resource: RESOURCE_UTRIUM,
          amount: -1000,
          priority: 5,
        },
      ];

      const testUsername = "testPlayer";
      const testKeyId = "test-key-123";
      const testKey = "secretKey";

      // Store the key in KeyExchangeProtocol
      KeyExchangeProtocol.addKey(testUsername, testKeyId, testKey);

      // Create encrypted channel data
      const jsonData = JSON.stringify(testNeeds);
      const encryptedData = SS1SegmentManager.encryptData(jsonData, testKey);

      // Mock foreign segment with encrypted data
      // @ts-ignore: allow setting foreignSegment
      global.RawMemory.foreignSegment = {
        username: testUsername,
        data: JSON.stringify({
          api: { version: "v1.0.0", update: 1000 },
          channels: {
            roomneeds: {
              protocol: "roomneeds",
              version: "v1.0.0",
              update: 1000,
              data: encryptedData,
              keyid: testKeyId,
            },
          },
        }),
      };

      // Read and decrypt
      const result = RoomNeedsProtocol.readNeeds(testUsername);

      expect(result).to.not.be.null;
      expect(result).to.deep.equal(testNeeds);
    });

    it("should return null when encrypted but key is not available", () => {
      const testUsername = "testPlayer";
      const testKeyId = "missing-key";

      // Mock foreign segment with encrypted data (but no key in store)
      // @ts-ignore: allow setting foreignSegment
      global.RawMemory.foreignSegment = {
        username: testUsername,
        data: JSON.stringify({
          api: { version: "v1.0.0", update: 1000 },
          channels: {
            roomneeds: {
              protocol: "roomneeds",
              version: "v1.0.0",
              update: 1000,
              data: "encrypted-data-that-cannot-be-decrypted",
              keyid: testKeyId,
            },
          },
        }),
      };

      // Read without key should return null
      const result = RoomNeedsProtocol.readNeeds(testUsername);

      expect(result).to.be.null;
    });

    it("should handle unencrypted data normally", () => {
      const testNeeds: RoomNeed[] = [
        {
          room: "W1N1",
          resource: RESOURCE_ENERGY,
          amount: 5000,
          priority: 8,
        },
      ];

      const testUsername = "testPlayer";

      // Mock foreign segment with unencrypted data
      // @ts-ignore: allow setting foreignSegment
      global.RawMemory.foreignSegment = {
        username: testUsername,
        data: JSON.stringify({
          api: { version: "v1.0.0", update: 1000 },
          channels: {
            roomneeds: {
              protocol: "roomneeds",
              version: "v1.0.0",
              update: 1000,
              data: JSON.stringify(testNeeds),
            },
          },
        }),
      };

      // Read unencrypted data
      const result = RoomNeedsProtocol.readNeeds(testUsername);

      expect(result).to.not.be.null;
      expect(result).to.deep.equal(testNeeds);
    });

    it("should handle both compression and encryption", () => {
      const testNeeds: RoomNeed[] = [
        {
          room: "W1N1",
          resource: RESOURCE_ENERGY,
          amount: 5000,
          priority: 8,
        },
      ];

      const testUsername = "testPlayer";
      const testKeyId = "test-key-456";
      const testKey = "anotherSecret";

      // Store the key
      KeyExchangeProtocol.addKey(testUsername, testKeyId, testKey);

      // Create compressed and encrypted data
      const jsonData = JSON.stringify(testNeeds);
      const encrypted = SS1SegmentManager.encryptData(jsonData, testKey);
      const compressed = SS1SegmentManager.compressData(encrypted);

      // Mock foreign segment with compressed and encrypted data
      // @ts-ignore: allow setting foreignSegment
      global.RawMemory.foreignSegment = {
        username: testUsername,
        data: JSON.stringify({
          api: { version: "v1.0.0", update: 1000 },
          channels: {
            roomneeds: {
              protocol: "roomneeds",
              version: "v1.0.0",
              update: 1000,
              data: compressed,
              compressed: true,
              keyid: testKeyId,
            },
          },
        }),
      };

      // Read, decompress, and decrypt
      const result = RoomNeedsProtocol.readNeeds(testUsername);

      expect(result).to.not.be.null;
      expect(result).to.deep.equal(testNeeds);
    });
  });
});
