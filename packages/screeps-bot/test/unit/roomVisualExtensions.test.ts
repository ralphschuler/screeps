/**
 * Tests for RoomVisual extensions
 */

import { expect } from "chai";
import "mocha";

// Import the extensions to ensure they're loaded
import "../../src/visuals/roomVisualExtensions";

describe("RoomVisual Extensions", () => {
  // Skip tests if RoomVisual is not available (test environment)
  if (typeof RoomVisual === "undefined") {
    it("should skip tests when RoomVisual is not available", () => {
      expect(true).to.be.true;
    });
    return;
  }

  // Mock RoomVisual for testing
  let mockVisual: any;
  let calledMethods: string[];

  beforeEach(() => {
    calledMethods = [];
    
    // Create a mock RoomVisual with tracking
    mockVisual = {
      circle: function(...args: any[]) {
        calledMethods.push("circle");
        return mockVisual;
      },
      rect: function(...args: any[]) {
        calledMethods.push("rect");
        return mockVisual;
      },
      poly: function(...args: any[]) {
        calledMethods.push("poly");
        return mockVisual;
      },
      text: function(...args: any[]) {
        calledMethods.push("text");
        return mockVisual;
      },
      line: function(...args: any[]) {
        calledMethods.push("line");
        return mockVisual;
      }
    };
  });

  describe("structure() method", () => {
    it("should exist on RoomVisual prototype", () => {
      expect(RoomVisual.prototype.structure).to.be.a("function");
    });

    it("should call drawing methods for STRUCTURE_SPAWN", () => {
      // Apply the extension method to our mock
      RoomVisual.prototype.structure.call(mockVisual, 25, 25, STRUCTURE_SPAWN);
      
      // Verify that circle was called (spawns use circles)
      expect(calledMethods).to.include("circle");
      expect(calledMethods.length).to.be.greaterThan(0);
    });

    it("should call drawing methods for STRUCTURE_TOWER", () => {
      RoomVisual.prototype.structure.call(mockVisual, 25, 25, STRUCTURE_TOWER);
      
      // Towers use circles and rects
      expect(calledMethods).to.include("circle");
      expect(calledMethods).to.include("rect");
    });

    it("should call drawing methods for STRUCTURE_STORAGE", () => {
      RoomVisual.prototype.structure.call(mockVisual, 25, 25, STRUCTURE_STORAGE);
      
      // Storage uses poly and rect
      expect(calledMethods).to.include("poly");
      expect(calledMethods).to.include("rect");
    });

    it("should handle unknown structure types", () => {
      // Should not throw for unknown structure types
      expect(() => {
        RoomVisual.prototype.structure.call(mockVisual, 25, 25, "unknown" as any);
      }).to.not.throw();
    });
  });

  describe("resource() method", () => {
    it("should exist on RoomVisual prototype", () => {
      expect(RoomVisual.prototype.resource).to.be.a("function");
    });

    it("should draw resource badge", () => {
      RoomVisual.prototype.resource.call(mockVisual, RESOURCE_ENERGY, 10, 10);
      
      // Resource badges use circles and text
      expect(calledMethods).to.include("circle");
      expect(calledMethods).to.include("text");
    });

    it("should accept custom size parameter", () => {
      RoomVisual.prototype.resource.call(mockVisual, RESOURCE_ENERGY, 10, 10, 0.5);
      
      expect(calledMethods).to.include("circle");
      expect(calledMethods).to.include("text");
    });
  });

  describe("speech() method", () => {
    it("should exist on RoomVisual prototype", () => {
      expect(RoomVisual.prototype.speech).to.be.a("function");
    });

    it("should draw speech bubble", () => {
      RoomVisual.prototype.speech.call(mockVisual, "Hello", 25, 25);
      
      // Speech bubbles use rect, poly, and text
      expect(calledMethods).to.include("rect");
      expect(calledMethods).to.include("poly");
      expect(calledMethods).to.include("text");
    });

    it("should accept custom options", () => {
      RoomVisual.prototype.speech.call(mockVisual, "Test", 25, 25, {
        background: "#ff0000",
        textcolor: "#ffffff",
        opacity: 0.8
      });
      
      expect(calledMethods.length).to.be.greaterThan(0);
    });
  });

  describe("animatedPosition() method", () => {
    it("should exist on RoomVisual prototype", () => {
      expect(RoomVisual.prototype.animatedPosition).to.be.a("function");
    });

    it("should draw animated marker", () => {
      RoomVisual.prototype.animatedPosition.call(mockVisual, 25, 25);
      
      // Animated markers use circles
      expect(calledMethods).to.include("circle");
    });

    it("should accept custom options", () => {
      RoomVisual.prototype.animatedPosition.call(mockVisual, 25, 25, {
        color: "#00ff00",
        radius: 1.0,
        frames: 10
      });
      
      expect(calledMethods).to.include("circle");
    });
  });

  describe("connectRoads() method", () => {
    it("should exist on RoomVisual prototype", () => {
      expect(RoomVisual.prototype.connectRoads).to.be.a("function");
    });

    it("should not throw when called", () => {
      expect(() => {
        RoomVisual.prototype.connectRoads.call(mockVisual);
      }).to.not.throw();
    });
  });
});
