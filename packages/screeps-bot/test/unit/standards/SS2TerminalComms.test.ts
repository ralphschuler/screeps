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
});
