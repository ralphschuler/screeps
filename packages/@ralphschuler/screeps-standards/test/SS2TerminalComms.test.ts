import { expect } from "chai";
import { SS2TerminalComms } from "../src/SS2TerminalComms";

describe("SS2TerminalComms", () => {
  beforeEach(() => {
    (global as any).Game = {
      time: 1000,
      cpu: {
        getUsed: () => 0,
        limit: 500,
        bucket: 10000
      },
      getObjectById: () => null
    };
    (global as any).Memory = {};
  });

  describe("parseTransaction", () => {
    it("should parse single packet message", () => {
      const description = "abc|0|Hello World";
      const parsed = SS2TerminalComms.parseTransaction(description);

      expect(parsed).to.not.be.null;
      expect(parsed?.msgId).to.equal("abc");
      expect(parsed?.packetId).to.equal(0);
      expect(parsed?.messageChunk).to.equal("Hello World");
      expect(parsed?.finalPacket).to.be.undefined;
    });

    it("should parse first packet with finalPacket indicator", () => {
      const description = "9f2|0|10|Lorem ipsum dolor sit amet";
      const parsed = SS2TerminalComms.parseTransaction(description);

      expect(parsed).to.not.be.null;
      expect(parsed?.msgId).to.equal("9f2");
      expect(parsed?.packetId).to.equal(0);
      expect(parsed?.finalPacket).to.equal(10);
      expect(parsed?.messageChunk).to.equal("Lorem ipsum dolor sit amet");
    });

    it("should parse subsequent packets", () => {
      const description = "9f2|5|gilla nisl, eu facilisis";
      const parsed = SS2TerminalComms.parseTransaction(description);

      expect(parsed).to.not.be.null;
      expect(parsed?.msgId).to.equal("9f2");
      expect(parsed?.packetId).to.equal(5);
      expect(parsed?.messageChunk).to.equal("gilla nisl, eu facilisis");
      expect(parsed?.finalPacket).to.be.undefined;
    });

    it("should return null for invalid format", () => {
      expect(SS2TerminalComms.parseTransaction("invalid")).to.be.null;
      expect(SS2TerminalComms.parseTransaction("")).to.be.null;
      expect(SS2TerminalComms.parseTransaction("abc|")).to.be.null;
    });

    it("should handle alphanumeric message IDs", () => {
      const testCases = ["a1b|0|test", "123|0|test", "XYZ|0|test"];

      testCases.forEach(desc => {
        const parsed = SS2TerminalComms.parseTransaction(desc);
        expect(parsed).to.not.be.null;
      });
    });
  });

  describe("splitMessage", () => {
    it("should not split short messages", () => {
      const message = "Short message";
      const packets = SS2TerminalComms.splitMessage(message);

      expect(packets.length).to.equal(1);
      expect(packets[0]).to.equal(message);
    });

    it("should split long messages into multiple packets", () => {
      // Create a message longer than 100 characters
      const message = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur iaculis libero erat, sed laoreet nisl lobortis a. Suspendisse dignissim.";
      const packets = SS2TerminalComms.splitMessage(message);

      expect(packets.length).to.be.greaterThan(1);

      // First packet should have finalPacket indicator
      expect(packets[0]).to.match(/^[\da-zA-Z]{3}\|0\|\d+\|/);

      // Subsequent packets should not have finalPacket indicator
      if (packets.length > 1) {
        expect(packets[1]).to.match(/^[\da-zA-Z]{3}\|1\|/);
      }
    });

    it("should create parseable packets", () => {
      const message = "A".repeat(300); // 300 character message
      const packets = SS2TerminalComms.splitMessage(message);

      // All packets should be parseable
      packets.forEach(packet => {
        const parsed = SS2TerminalComms.parseTransaction(packet);
        expect(parsed).to.not.be.null;
      });
    });
  });

  describe("parseJSON", () => {
    it("should parse valid JSON object", () => {
      const json = '{"type":"test","value":123}';
      const parsed = SS2TerminalComms.parseJSON<{ type: string; value: number }>(json);

      expect(parsed).to.not.be.null;
      expect(parsed?.type).to.equal("test");
      expect(parsed?.value).to.equal(123);
    });

    it("should parse valid JSON array", () => {
      const json = '[1,2,3]';
      const parsed = SS2TerminalComms.parseJSON<number[]>(json);

      expect(parsed).to.not.be.null;
      expect(parsed).to.deep.equal([1, 2, 3]);
    });

    it("should return null for non-JSON string", () => {
      expect(SS2TerminalComms.parseJSON("not json")).to.be.null;
      expect(SS2TerminalComms.parseJSON("key value")).to.be.null;
    });

    it("should return null for invalid JSON", () => {
      expect(SS2TerminalComms.parseJSON("{invalid}")).to.be.null;
    });
  });

  describe("formatJSON", () => {
    it("should format objects as JSON", () => {
      const obj = { type: "resource_request", resource: "energy", amount: 1000 };
      const json = SS2TerminalComms.formatJSON(obj);

      expect(json).to.equal('{"type":"resource_request","resource":"energy","amount":1000}');
    });

    it("should format arrays as JSON", () => {
      const arr = [1, 2, 3];
      const json = SS2TerminalComms.formatJSON(arr);

      expect(json).to.equal('[1,2,3]');
    });

    it("should round-trip through parseJSON", () => {
      const original = { type: "test", value: 42 };
      const json = SS2TerminalComms.formatJSON(original);
      const parsed = SS2TerminalComms.parseJSON<typeof original>(json);

      expect(parsed).to.deep.equal(original);
    });
  });

  describe("processQueue", () => {
    let mockTerminal: any;

    beforeEach(() => {
      (global as any).Memory = { ss2PacketQueue: {} };
      (global as any).Game = {
        time: 1000,
        cpu: {
          getUsed: () => 0,
          limit: 500,
          bucket: 10000
        },
        getObjectById: (id: any) => {
          if (id === "terminal1") {
            return mockTerminal;
          }
          return null;
        }
      };

      mockTerminal = {
        id: "terminal1",
        cooldown: 0,
        send: () => OK
      };
    });

    it("should send queued packets one at a time", () => {
      const packets = ["abc|0|2|First", "abc|1|Second", "abc|2|Third"];
      const sentPackets: string[] = [];

      mockTerminal.send = (_resource: any, _amount: any, _target: any, desc: string) => {
        sentPackets.push(desc);
        return OK;
      };

      Memory.ss2PacketQueue = {
        "terminal1:abc": {
          terminalId: "terminal1" as any,
          targetRoom: "W1N1",
          resourceType: RESOURCE_ENERGY,
          amount: 100,
          packets,
          nextPacketIndex: 0,
          queuedAt: Game.time
        }
      };

      const sent1 = SS2TerminalComms.processQueue();
      expect(sent1).to.equal(1);
      expect(sentPackets).to.deep.equal(["abc|0|2|First"]);

      const sent2 = SS2TerminalComms.processQueue();
      expect(sent2).to.equal(1);
      expect(sentPackets).to.deep.equal(["abc|0|2|First", "abc|1|Second"]);

      const sent3 = SS2TerminalComms.processQueue();
      expect(sent3).to.equal(1);
      expect(sentPackets).to.deep.equal(["abc|0|2|First", "abc|1|Second", "abc|2|Third"]);

      expect(Memory.ss2PacketQueue).to.be.empty;
    });

    it("should respect terminal cooldown", () => {
      mockTerminal.cooldown = 10;
      const sentPackets: string[] = [];
      mockTerminal.send = (_r: any, _a: any, _t: any, desc: string) => {
        sentPackets.push(desc);
        return OK;
      };

      Memory.ss2PacketQueue = {
        "terminal1:abc": {
          terminalId: "terminal1" as any,
          targetRoom: "W1N1",
          resourceType: RESOURCE_ENERGY,
          amount: 100,
          packets: ["abc|0|1|First", "abc|1|Second"],
          nextPacketIndex: 0,
          queuedAt: Game.time
        }
      };

      const sent = SS2TerminalComms.processQueue();
      expect(sent).to.equal(0);
      expect(sentPackets).to.be.empty;
    });

    it("should remove queue items when terminal not found", () => {
      Memory.ss2PacketQueue = {
        "nonexistent:abc": {
          terminalId: "nonexistent" as any,
          targetRoom: "W1N1",
          resourceType: RESOURCE_ENERGY,
          amount: 100,
          packets: ["abc|0|test"],
          nextPacketIndex: 0,
          queuedAt: Game.time
        }
      };

      SS2TerminalComms.processQueue();
      expect(Memory.ss2PacketQueue).to.be.empty;
    });

    it("should retry on ERR_NOT_ENOUGH_RESOURCES", () => {
      mockTerminal.send = () => ERR_NOT_ENOUGH_RESOURCES;

      Memory.ss2PacketQueue = {
        "terminal1:abc": {
          terminalId: "terminal1" as any,
          targetRoom: "W1N1",
          resourceType: RESOURCE_ENERGY,
          amount: 100,
          packets: ["abc|0|test"],
          nextPacketIndex: 0,
          queuedAt: Game.time
        }
      };

      SS2TerminalComms.processQueue();
      expect(Memory.ss2PacketQueue!["terminal1:abc"]).to.not.be.undefined;
      expect(Memory.ss2PacketQueue!["terminal1:abc"].nextPacketIndex).to.equal(0);
    });

    it("should remove queue items on critical send errors", () => {
      mockTerminal.send = () => ERR_INVALID_TARGET;

      Memory.ss2PacketQueue = {
        "terminal1:abc": {
          terminalId: "terminal1" as any,
          targetRoom: "W1N1",
          resourceType: RESOURCE_ENERGY,
          amount: 100,
          packets: ["abc|0|test"],
          nextPacketIndex: 0,
          queuedAt: Game.time
        }
      };

      SS2TerminalComms.processQueue();
      expect(Memory.ss2PacketQueue).to.be.empty;
    });

    it("should remove expired queue items", () => {
      Memory.ss2PacketQueue = {
        "terminal1:abc": {
          terminalId: "terminal1" as any,
          targetRoom: "W1N1",
          resourceType: RESOURCE_ENERGY,
          amount: 100,
          packets: ["abc|0|test"],
          nextPacketIndex: 0,
          queuedAt: Game.time - 1001
        }
      };

      SS2TerminalComms.processQueue();
      expect(Memory.ss2PacketQueue).to.be.empty;
    });
  });
});
