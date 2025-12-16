import { expect } from "chai";
import { ProtocolRegistry } from "../../../src/standards/ProtocolRegistry";
import { SS1SegmentManager } from "../../../src/standards/SS1SegmentManager";

describe("ProtocolRegistry", () => {
  beforeEach(() => {
    // @ts-expect-error: allow adding Game to global
    global.Game = { 
      time: 1000,
      rooms: {}
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Memory as any).ss1Manager = undefined;
  });

  describe("protocol registration", () => {
    it("should register a protocol", () => {
      ProtocolRegistry.registerProtocol({
        name: "test",
        version: "v1.0.0",
        enabled: true,
        channelGenerator: () => SS1SegmentManager.createChannel("test", { data: "test" }),
      });

      const protocols = ProtocolRegistry.listProtocols();
      expect(protocols.some(p => p.name === "test")).to.be.true;
    });

    it("should unregister a protocol", () => {
      ProtocolRegistry.registerProtocol({
        name: "test",
        version: "v1.0.0",
        enabled: true,
        channelGenerator: () => null,
      });

      ProtocolRegistry.unregisterProtocol("test");
      const protocols = ProtocolRegistry.listProtocols();
      expect(protocols.some(p => p.name === "test")).to.be.false;
    });

    it("should enable and disable protocols", () => {
      ProtocolRegistry.registerProtocol({
        name: "test",
        version: "v1.0.0",
        enabled: false,
        channelGenerator: () => null,
      });

      ProtocolRegistry.enableProtocol("test");
      let protocols = ProtocolRegistry.listProtocols();
      expect(protocols.find(p => p.name === "test")?.enabled).to.be.true;

      ProtocolRegistry.disableProtocol("test");
      protocols = ProtocolRegistry.listProtocols();
      expect(protocols.find(p => p.name === "test")?.enabled).to.be.false;
    });
  });

  describe("channel generation", () => {
    it("should generate channels from active protocols", () => {
      ProtocolRegistry.registerProtocol({
        name: "test1",
        version: "v1.0.0",
        enabled: true,
        channelGenerator: () => SS1SegmentManager.createChannel("test1", { data: "data1" }),
      });

      ProtocolRegistry.registerProtocol({
        name: "test2",
        version: "v1.0.0",
        enabled: false,
        channelGenerator: () => SS1SegmentManager.createChannel("test2", { data: "data2" }),
      });

      const channels = ProtocolRegistry.generateChannels();
      expect(channels.test1).to.exist;
      expect(channels.test2).to.not.exist;
    });

    it("should skip protocols that return null", () => {
      ProtocolRegistry.registerProtocol({
        name: "empty",
        version: "v1.0.0",
        enabled: true,
        channelGenerator: () => null,
      });

      const channels = ProtocolRegistry.generateChannels();
      expect(channels.empty).to.not.exist;
    });

    it("should handle errors in channel generation", () => {
      ProtocolRegistry.registerProtocol({
        name: "error",
        version: "v1.0.0",
        enabled: true,
        channelGenerator: () => {
          throw new Error("Test error");
        },
      });

      // Should not throw
      const channels = ProtocolRegistry.generateChannels();
      expect(channels.error).to.not.exist;
    });
  });

  describe("default protocols", () => {
    it("should initialize default protocols", () => {
      ProtocolRegistry.initializeDefaults();
      
      const protocols = ProtocolRegistry.listProtocols();
      expect(protocols.some(p => p.name === "portals")).to.be.true;
      expect(protocols.some(p => p.name === "roomneeds")).to.be.true;
      expect(protocols.some(p => p.name === "terminalcom")).to.be.true;
    });

    it("should have all default protocols disabled initially", () => {
      ProtocolRegistry.initializeDefaults();
      
      const protocols = ProtocolRegistry.listProtocols();
      for (const protocol of protocols) {
        expect(protocol.enabled).to.be.false;
      }
    });
  });

  describe("get active protocols", () => {
    beforeEach(() => {
      ProtocolRegistry.registerProtocol({
        name: "active1",
        version: "v1.0.0",
        enabled: true,
        channelGenerator: () => null,
      });

      ProtocolRegistry.registerProtocol({
        name: "inactive1",
        version: "v1.0.0",
        enabled: false,
        channelGenerator: () => null,
      });
    });

    it("should return only active protocols", () => {
      const active = ProtocolRegistry.getActiveProtocols();
      expect(active.size).to.equal(1);
      expect(active.has("active1")).to.be.true;
      expect(active.has("inactive1")).to.be.false;
    });
  });
});
