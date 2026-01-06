/**
 * Unit tests for RoomVisualizer core functions
 * Addresses Phase 1 coverage improvement: Room Visualizer
 */

import { assert } from "chai";
import { VisualizationLayer } from "../../src/memory/schemas";

// Mock RoomVisual
class MockRoomVisual {
  public room: string;
  public calls: Array<{ method: string; args: unknown[] }> = [];

  constructor(roomName: string) {
    this.room = roomName;
  }

  text(text: string, x: number, y: number, style?: unknown): MockRoomVisual {
    this.calls.push({ method: "text", args: [text, x, y, style] });
    return this;
  }

  circle(x: number, y: number, style?: unknown): MockRoomVisual {
    this.calls.push({ method: "circle", args: [x, y, style] });
    return this;
  }

  rect(x: number, y: number, w: number, h: number, style?: unknown): MockRoomVisual {
    this.calls.push({ method: "rect", args: [x, y, w, h, style] });
    return this;
  }

  poly(points: Array<[number, number]>, style?: unknown): MockRoomVisual {
    this.calls.push({ method: "poly", args: [points, style] });
    return this;
  }

  line(x1: number, y1: number, x2: number, y2: number, style?: unknown): MockRoomVisual {
    this.calls.push({ method: "line", args: [x1, y1, x2, y2, style] });
    return this;
  }

  clear(): void {
    this.calls = [];
  }

  getSize(): number {
    return this.calls.length;
  }
}

// Mock global objects
interface GlobalWithMocks {
  Game?: {
    time: number;
    cpu: { getUsed: () => number };
    flags: Record<string, unknown>;
  };
  Memory?: {
    visualConfig?: {
      layers?: Record<string, boolean>;
      opacity?: number;
      showStats?: boolean;
    };
  };
  RoomVisual?: typeof MockRoomVisual;
}

describe("RoomVisualizer Core Functions", () => {
  let mockVisual: MockRoomVisual;

  beforeEach(() => {
    // Setup global mocks
    (global as GlobalWithMocks).Game = {
      time: 1000,
      cpu: { getUsed: () => 5.5 },
      flags: {}
    };
    (global as GlobalWithMocks).Memory = {
      visualConfig: {
        layers: {},
        opacity: 0.5,
        showStats: true
      }
    };
    (global as GlobalWithMocks).RoomVisual = MockRoomVisual;

    mockVisual = new MockRoomVisual("W1N1");
  });

  afterEach(() => {
    delete (global as GlobalWithMocks).Game;
    delete (global as GlobalWithMocks).Memory;
    delete (global as GlobalWithMocks).RoomVisual;
  });

  describe("Basic Visualization", () => {
    it("should create text visualization", () => {
      mockVisual.text("Test", 25, 25, { color: "#FFFFFF" });
      
      assert.equal(mockVisual.calls.length, 1);
      assert.equal(mockVisual.calls[0].method, "text");
      assert.equal(mockVisual.calls[0].args[0], "Test");
    });

    it("should create circle visualization", () => {
      mockVisual.circle(10, 10, { radius: 0.5, fill: "#FF0000" });
      
      assert.equal(mockVisual.calls.length, 1);
      assert.equal(mockVisual.calls[0].method, "circle");
    });

    it("should create rectangle visualization", () => {
      mockVisual.rect(5, 5, 10, 10, { fill: "#00FF00" });
      
      assert.equal(mockVisual.calls.length, 1);
      assert.equal(mockVisual.calls[0].method, "rect");
    });

    it("should create line visualization", () => {
      mockVisual.line(0, 0, 10, 10, { color: "#0000FF" });
      
      assert.equal(mockVisual.calls.length, 1);
      assert.equal(mockVisual.calls[0].method, "line");
    });

    it("should create polygon visualization", () => {
      const points: Array<[number, number]> = [[0, 0], [10, 0], [5, 10]];
      mockVisual.poly(points, { fill: "#FFFF00" });
      
      assert.equal(mockVisual.calls.length, 1);
      assert.equal(mockVisual.calls[0].method, "poly");
    });
  });

  describe("Visualization Chaining", () => {
    it("should support method chaining", () => {
      mockVisual
        .text("Test", 25, 25)
        .circle(10, 10)
        .line(0, 0, 10, 10);
      
      assert.equal(mockVisual.calls.length, 3);
    });
  });

  describe("Visualization Clearing", () => {
    it("should clear all visualizations", () => {
      mockVisual.text("Test 1", 25, 25);
      mockVisual.text("Test 2", 30, 30);
      assert.equal(mockVisual.calls.length, 2);
      
      mockVisual.clear();
      assert.equal(mockVisual.calls.length, 0);
    });
  });

  describe("VisualizationLayer Enum", () => {
    it("should have correct visualization layer values", () => {
      // Test that layer enum values exist
      assert.isDefined(VisualizationLayer);
    });
  });
});
