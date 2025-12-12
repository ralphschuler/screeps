import { expect } from "chai";
import { SS2TerminalComms } from "../../../src/standards/SS2TerminalComms";

describe("SS2TerminalComms", () => {
  // Mock Game.time
  beforeEach(() => {
    // @ts-ignore: allow adding Game to global
    global.Game = { time: 1000 };
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
      
      // Subsequent packets should not
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

  describe("JSON helpers", () => {
    it("should parse valid JSON", () => {
      const json = '{"type":"test","value":123}';
      const parsed = SS2TerminalComms.parseJSON(json);

      expect(parsed).to.not.be.null;
      expect(parsed?.type).to.equal("test");
      expect(parsed?.value).to.equal(123);
    });

    it("should return null for non-JSON", () => {
      expect(SS2TerminalComms.parseJSON("not json")).to.be.null;
      expect(SS2TerminalComms.parseJSON("key value")).to.be.null;
    });

    it("should format objects as JSON", () => {
      const obj = { type: "resource_request", resource: "energy", amount: 1000 };
      const json = SS2TerminalComms.formatJSON(obj);

      expect(json).to.equal('{"type":"resource_request","resource":"energy","amount":1000}');
    });
  });

  describe("Queue Management", () => {
    let mockTerminal: any;

    beforeEach(() => {
      // Reset Memory and Game
      // @ts-ignore: allow adding Memory to global
      global.Memory = { ss2PacketQueue: {} };
      // @ts-ignore: allow adding Game to global
      global.Game = { 
        time: 1000,
        // @ts-ignore: partial CPU mock
        cpu: {
          getUsed: () => 0,
          limit: 500,
          bucket: 10000
        },
        getObjectById: (id: Id<any>) => {
          if (id === "terminal1") {
            return mockTerminal;
          }
          return null;
        }
      };

      // Mock terminal
      mockTerminal = {
        id: "terminal1" as Id<StructureTerminal>,
        cooldown: 0,
        send: (resource: ResourceConstant, amount: number, target: string, desc: string) => {
          return OK;
        }
      };
    });

    describe("sendMessage", () => {
      it("should send single-packet messages directly", () => {
        const message = "Short message";
        let sendCalled = false;

        mockTerminal.send = () => {
          sendCalled = true;
          return OK;
        };

        const result = SS2TerminalComms.sendMessage(
          mockTerminal as StructureTerminal,
          "W1N1",
          RESOURCE_ENERGY,
          100,
          message
        );

        expect(result).to.equal(OK);
        expect(sendCalled).to.be.true;
        expect(Memory.ss2PacketQueue).to.be.empty;
      });

      it("should queue multi-packet messages", () => {
        const message = "A".repeat(300); // Long message requiring multiple packets
        
        const result = SS2TerminalComms.sendMessage(
          mockTerminal as StructureTerminal,
          "W1N1",
          RESOURCE_ENERGY,
          100,
          message
        );

        expect(result).to.equal(OK);
        expect(Memory.ss2PacketQueue).to.not.be.empty;
        
        // Check queue item structure
        const queueKeys = Object.keys(Memory.ss2PacketQueue!);
        expect(queueKeys.length).to.equal(1);
        
        const queueItem = Memory.ss2PacketQueue![queueKeys[0]];
        expect(queueItem.terminalId).to.equal("terminal1");
        expect(queueItem.targetRoom).to.equal("W1N1");
        expect(queueItem.resourceType).to.equal(RESOURCE_ENERGY);
        expect(queueItem.amount).to.equal(100);
        expect(queueItem.packets.length).to.be.greaterThan(1);
        expect(queueItem.nextPacketIndex).to.equal(0);
        expect(queueItem.queuedAt).to.equal(1000);
      });
    });

    describe("processQueue", () => {
      it("should send queued packets", () => {
        const packets = ["abc|0|2|First", "abc|1|Second", "abc|2|Third"];
        let sentPackets: string[] = [];

        mockTerminal.send = (resource: ResourceConstant, amount: number, target: string, desc: string) => {
          sentPackets.push(desc);
          return OK;
        };

        // Add to queue
        Memory.ss2PacketQueue = {
          "terminal1:abc": {
            terminalId: "terminal1" as Id<StructureTerminal>,
            targetRoom: "W1N1",
            resourceType: RESOURCE_ENERGY,
            amount: 100,
            packets: packets,
            nextPacketIndex: 0,
            queuedAt: Game.time,
          }
        };

        // Process first packet
        const sent1 = SS2TerminalComms.processQueue();
        expect(sent1).to.equal(1);
        expect(sentPackets).to.deep.equal(["abc|0|2|First"]);
        expect(Memory.ss2PacketQueue!["terminal1:abc"].nextPacketIndex).to.equal(1);

        // Process second packet
        const sent2 = SS2TerminalComms.processQueue();
        expect(sent2).to.equal(1);
        expect(sentPackets).to.deep.equal(["abc|0|2|First", "abc|1|Second"]);

        // Process third packet
        const sent3 = SS2TerminalComms.processQueue();
        expect(sent3).to.equal(1);
        expect(sentPackets).to.deep.equal(["abc|0|2|First", "abc|1|Second", "abc|2|Third"]);

        // Queue should be empty now
        expect(Memory.ss2PacketQueue).to.be.empty;
      });

      it("should respect terminal cooldown", () => {
        const packets = ["abc|0|1|First", "abc|1|Second"];
        let sentPackets: string[] = [];

        mockTerminal.cooldown = 10;
        mockTerminal.send = (resource: ResourceConstant, amount: number, target: string, desc: string) => {
          sentPackets.push(desc);
          return OK;
        };

        Memory.ss2PacketQueue = {
          "terminal1:abc": {
            terminalId: "terminal1" as Id<StructureTerminal>,
            targetRoom: "W1N1",
            resourceType: RESOURCE_ENERGY,
            amount: 100,
            packets: packets,
            nextPacketIndex: 0,
            queuedAt: Game.time,
          }
        };

        // Should not send due to cooldown
        const sent = SS2TerminalComms.processQueue();
        expect(sent).to.equal(0);
        expect(sentPackets).to.be.empty;
        expect(Memory.ss2PacketQueue!["terminal1:abc"].nextPacketIndex).to.equal(0);
      });

      it("should remove queue items when terminal not found", () => {
        Memory.ss2PacketQueue = {
          "nonexistent:abc": {
            terminalId: "nonexistent" as Id<StructureTerminal>,
            targetRoom: "W1N1",
            resourceType: RESOURCE_ENERGY,
            amount: 100,
            packets: ["abc|0|test"],
            nextPacketIndex: 0,
            queuedAt: Game.time,
          }
        };

        SS2TerminalComms.processQueue();
        expect(Memory.ss2PacketQueue).to.be.empty;
      });

      it("should handle send failures gracefully", () => {
        mockTerminal.send = () => ERR_NOT_ENOUGH_RESOURCES;

        Memory.ss2PacketQueue = {
          "terminal1:abc": {
            terminalId: "terminal1" as Id<StructureTerminal>,
            targetRoom: "W1N1",
            resourceType: RESOURCE_ENERGY,
            amount: 100,
            packets: ["abc|0|test"],
            nextPacketIndex: 0,
            queuedAt: Game.time,
          }
        };

        // Should not remove from queue on ERR_NOT_ENOUGH_RESOURCES
        SS2TerminalComms.processQueue();
        expect(Memory.ss2PacketQueue!["terminal1:abc"]).to.not.be.undefined;
        expect(Memory.ss2PacketQueue!["terminal1:abc"].nextPacketIndex).to.equal(0);
      });

      it("should cleanup queue on critical send errors", () => {
        mockTerminal.send = () => ERR_INVALID_TARGET;

        Memory.ss2PacketQueue = {
          "terminal1:abc": {
            terminalId: "terminal1" as Id<StructureTerminal>,
            targetRoom: "W1N1",
            resourceType: RESOURCE_ENERGY,
            amount: 100,
            packets: ["abc|0|test"],
            nextPacketIndex: 0,
            queuedAt: Game.time,
          }
        };

        // Should remove from queue on critical errors
        SS2TerminalComms.processQueue();
        expect(Memory.ss2PacketQueue).to.be.empty;
      });

      it("should remove expired queue items", () => {
        Memory.ss2PacketQueue = {
          "terminal1:abc": {
            terminalId: "terminal1" as Id<StructureTerminal>,
            targetRoom: "W1N1",
            resourceType: RESOURCE_ENERGY,
            amount: 100,
            packets: ["abc|0|test"],
            nextPacketIndex: 0,
            queuedAt: Game.time - 1001, // Expired
          }
        };

        SS2TerminalComms.processQueue();
        expect(Memory.ss2PacketQueue).to.be.empty;
      });
    });
  });
});
