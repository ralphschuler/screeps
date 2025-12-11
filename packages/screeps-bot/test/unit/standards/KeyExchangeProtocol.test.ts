import { expect } from "chai";
import { KeyExchangeProtocol } from "../../../src/standards/terminal-protocols/KeyExchangeProtocol";

describe("KeyExchangeProtocol", () => {
  describe("findClosestTerminalRoom", () => {
    beforeEach(() => {
      // Mock Game.map.getRoomLinearDistance
      const mockMap = {
        getRoomLinearDistance: (from: string, to: string): number => {
          // Simple mock: calculate distance based on room coordinates
          const parseRoom = (roomName: string) => {
            const match = roomName.match(/([WE])(\d+)([NS])(\d+)/);
            if (!match) return { x: 0, y: 0 };
            const x = (match[1] === 'W' ? -1 : 1) * parseInt(match[2]);
            const y = (match[3] === 'N' ? 1 : -1) * parseInt(match[4]);
            return { x, y };
          };
          
          const fromCoords = parseRoom(from);
          const toCoords = parseRoom(to);
          
          return Math.abs(fromCoords.x - toCoords.x) + Math.abs(fromCoords.y - toCoords.y);
        },
        describeExits: () => ({}),
        findExit: () => 0,
        findRoute: () => [],
        getTerrainAt: () => "",
        getWorldSize: () => 0,
        getRoomStatus: () => ({ status: "normal" }),
        isRoomAvailable: () => true
      };
      
      // @ts-ignore: allow adding Game to global
      global.Game = { map: mockMap };
    });

    it("should return null for empty array", () => {
      // Use reflection to access private method
      const result = (KeyExchangeProtocol as any).findClosestTerminalRoom("W1N1", []);
      expect(result).to.be.null;
    });

    it("should return single room when only one available", () => {
      const result = (KeyExchangeProtocol as any).findClosestTerminalRoom("W1N1", ["W2N2"]);
      expect(result).to.equal("W2N2");
    });

    it("should return closest room from multiple options", () => {
      const fromRoom = "W1N1";
      const targetRooms = ["W5N5", "W1N2", "W10N10"];
      
      const result = (KeyExchangeProtocol as any).findClosestTerminalRoom(fromRoom, targetRooms);
      
      // W1N2 is closest to W1N1 (distance 1)
      expect(result).to.equal("W1N2");
    });

    it("should handle rooms in different quadrants", () => {
      const fromRoom = "W5N5";
      const targetRooms = ["E5N5", "W5S5", "E5S5"];
      
      const result = (KeyExchangeProtocol as any).findClosestTerminalRoom(fromRoom, targetRooms);
      
      // E5N5 or W5S5 should be chosen (both distance 10)
      // The function will choose the first one it encounters
      expect(["E5N5", "W5S5"]).to.include(result);
    });
  });

  describe("processMessage", () => {
    it("should return false for non-key messages", () => {
      const result = KeyExchangeProtocol.processMessage("player1", "random message");
      expect(result).to.be.false;
    });

    it("should return true for key request messages", () => {
      const result = KeyExchangeProtocol.processMessage("player1", "key request test-key-id");
      expect(result).to.be.true;
    });

    it("should return true for key response messages", () => {
      const result = KeyExchangeProtocol.processMessage("player1", "key test-key-id secret123");
      expect(result).to.be.true;
    });

    it("should store received keys", () => {
      KeyExchangeProtocol.processMessage("player1", "key my-key abc123");
      
      const storedKey = KeyExchangeProtocol.getKey("player1", "my-key");
      expect(storedKey).to.equal("abc123");
    });
  });

  describe("key management", () => {
    it("should add and retrieve keys", () => {
      KeyExchangeProtocol.addKey("player1", "key1", "secret1");
      
      const retrieved = KeyExchangeProtocol.getKey("player1", "key1");
      expect(retrieved).to.equal("secret1");
    });

    it("should return null for non-existent keys", () => {
      const retrieved = KeyExchangeProtocol.getKey("player2", "nonexistent");
      expect(retrieved).to.be.null;
    });

    it("should handle multiple keys per player", () => {
      KeyExchangeProtocol.addKey("player1", "key1", "secret1");
      KeyExchangeProtocol.addKey("player1", "key2", "secret2");
      
      expect(KeyExchangeProtocol.getKey("player1", "key1")).to.equal("secret1");
      expect(KeyExchangeProtocol.getKey("player1", "key2")).to.equal("secret2");
    });
  });
});
