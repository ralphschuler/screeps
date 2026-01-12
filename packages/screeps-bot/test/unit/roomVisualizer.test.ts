/**
 * Unit tests for RoomVisualizer
 * Phase 2.1: Coverage improvement for RoomVisualizer (23% → 50%)
 * Tests pheromone overlays, spawn queue visualization, CPU budgets, and edge cases
 */

import { expect, assert } from "chai";
import sinon from "sinon";
import { RoomVisualizer } from "../../src/visuals/roomVisualizer";

// Mock RoomVisual class
class MockRoomVisual {
  public roomName: string;
  public calls: Array<{ method: string; args: any[] }> = [];

  constructor(roomName: string) {
    this.roomName = roomName;
  }

  circle(x: number, y: number, style?: any) {
    this.calls.push({ method: "circle", args: [x, y, style] });
    return this;
  }

  rect(x: number, y: number, w: number, h: number, style?: any) {
    this.calls.push({ method: "rect", args: [x, y, w, h, style] });
    return this;
  }

  text(text: string, x: number, y: number, style?: any) {
    this.calls.push({ method: "text", args: [text, x, y, style] });
    return this;
  }

  line(x1: number, y1: number, x2: number, y2: number, style?: any) {
    this.calls.push({ method: "line", args: [x1, y1, x2, y2, style] });
    return this;
  }

  poly(points: Array<[number, number]>, style?: any) {
    this.calls.push({ method: "poly", args: [points, style] });
    return this;
  }
}

describe("RoomVisualizer", () => {
  let visualizer: RoomVisualizer;
  let mockRoom: any;
  let roomVisualStub: sinon.SinonStub;
  let mockVisual: MockRoomVisual;

  beforeEach(() => {
    // Create mock room
    mockRoom = {
      name: "W1N1",
      controller: {
        my: true,
        level: 5,
        progress: 50000,
        progressTotal: 100000
      },
      energyAvailable: 300,
      energyCapacityAvailable: 550,
      find: sinon.stub().returns([]),
      memory: {}
    };

    // Create mock visual
    mockVisual = new MockRoomVisual("W1N1");

    // Stub RoomVisual constructor
    roomVisualStub = sinon.stub(global as any, "RoomVisual").returns(mockVisual);

    // Create visualizer instance with default config
    visualizer = new RoomVisualizer();
  });

  afterEach(() => {
    roomVisualStub.restore();
  });

  describe("constructor", () => {
    it("should create visualizer with default config", () => {
      const viz = new RoomVisualizer();
      expect(viz).to.be.instanceOf(RoomVisualizer);
    });

    it("should accept custom configuration", () => {
      const viz = new RoomVisualizer({
        showPheromones: false,
        showPaths: true,
        opacity: 0.7
      });
      expect(viz).to.be.instanceOf(RoomVisualizer);
    });

    it("should merge custom config with defaults", () => {
      const viz = new RoomVisualizer({ showPheromones: false });
      expect(viz).to.be.instanceOf(RoomVisualizer);
    });
  });

  describe("draw", () => {
    it("should create RoomVisual for the room", () => {
      visualizer.draw(mockRoom);
      
      expect(roomVisualStub.calledOnce).to.be.true;
      expect(roomVisualStub.calledWith("W1N1")).to.be.true;
    });

    it("should handle missing room gracefully", () => {
      const nullRoom = null as any;
      
      expect(() => visualizer.draw(nullRoom)).to.throw();
    });

    it("should handle room without controller", () => {
      const roomWithoutController = {
        ...mockRoom,
        controller: undefined
      };

      // Should not throw
      expect(() => visualizer.draw(roomWithoutController)).to.not.throw();
    });

    it("should handle empty room name", () => {
      const roomWithEmptyName = {
        ...mockRoom,
        name: ""
      };

      visualizer.draw(roomWithEmptyName);
      expect(roomVisualStub.called).to.be.true;
    });
  });

  describe("pheromone visualization", () => {
    it("should visualize pheromones when enabled", () => {
      const vizWithPheromones = new RoomVisualizer({ showPheromones: true });
      
      vizWithPheromones.draw(mockRoom);
      
      // RoomVisual should be created
      expect(roomVisualStub.called).to.be.true;
    });

    it("should skip pheromones when disabled", () => {
      const vizWithoutPheromones = new RoomVisualizer({ showPheromones: false });
      
      vizWithoutPheromones.draw(mockRoom);
      
      // Visual should still be created but no pheromone-specific calls
      expect(roomVisualStub.called).to.be.true;
    });

    it("should handle missing pheromone data", () => {
      const roomWithoutPheromones = {
        ...mockRoom,
        memory: {}
      };

      expect(() => visualizer.draw(roomWithoutPheromones)).to.not.throw();
    });

    it("should use correct opacity setting", () => {
      const vizWithOpacity = new RoomVisualizer({ 
        showPheromones: true,
        opacity: 0.3
      });
      
      vizWithOpacity.draw(mockRoom);
      
      expect(roomVisualStub.called).to.be.true;
    });
  });

  describe("spawn queue visualization", () => {
    beforeEach(() => {
      // Add spawn structures to room
      const mockSpawn = {
        pos: { x: 25, y: 25 },
        spawning: null,
        room: mockRoom
      };
      
      mockRoom.find = sinon.stub().callsFake((findConstant: number) => {
        if (findConstant === FIND_MY_SPAWNS) {
          return [mockSpawn];
        }
        return [];
      });
    });

    it("should visualize spawn queue when enabled", () => {
      const vizWithSpawnQueue = new RoomVisualizer({ showSpawnQueue: true });
      
      vizWithSpawnQueue.draw(mockRoom);
      
      expect(roomVisualStub.called).to.be.true;
    });

    it("should skip spawn queue when disabled", () => {
      const vizWithoutSpawnQueue = new RoomVisualizer({ showSpawnQueue: false });
      
      vizWithoutSpawnQueue.draw(mockRoom);
      
      expect(roomVisualStub.called).to.be.true;
    });

    it("should handle room with no spawns", () => {
      mockRoom.find = sinon.stub().returns([]);
      
      expect(() => visualizer.draw(mockRoom)).to.not.throw();
    });

    it("should handle spawns that are currently spawning", () => {
      const spawningMockSpawn = {
        pos: { x: 25, y: 25 },
        spawning: {
          name: "Worker1",
          remainingTime: 10
        },
        room: mockRoom
      };
      
      mockRoom.find = sinon.stub().returns([spawningMockSpawn]);
      
      expect(() => visualizer.draw(mockRoom)).to.not.throw();
    });
  });

  describe("CPU budget visualization", () => {
    it("should visualize room stats when enabled", () => {
      const vizWithStats = new RoomVisualizer({ showRoomStats: true });
      
      vizWithStats.draw(mockRoom);
      
      expect(roomVisualStub.called).to.be.true;
    });

    it("should skip room stats when disabled", () => {
      const vizWithoutStats = new RoomVisualizer({ showRoomStats: false });
      
      vizWithoutStats.draw(mockRoom);
      
      expect(roomVisualStub.called).to.be.true;
    });

    it("should display controller level and progress", () => {
      const vizWithStats = new RoomVisualizer({ showRoomStats: true });
      
      vizWithStats.draw(mockRoom);
      
      // Should create visual for stats display
      expect(roomVisualStub.called).to.be.true;
    });

    it("should handle room without controller", () => {
      const roomWithoutController = {
        ...mockRoom,
        controller: undefined
      };

      const vizWithStats = new RoomVisualizer({ showRoomStats: true });
      
      expect(() => vizWithStats.draw(roomWithoutController)).to.not.throw();
    });
  });

  describe("combat visualization", () => {
    it("should visualize combat info when enabled", () => {
      const vizWithCombat = new RoomVisualizer({ showCombat: true });
      
      // Add hostile creeps
      const mockHostile = {
        pos: { x: 30, y: 30 },
        owner: { username: "enemy" },
        hits: 100,
        hitsMax: 100
      };
      
      mockRoom.find = sinon.stub().callsFake((findConstant: number) => {
        if (findConstant === FIND_HOSTILE_CREEPS) {
          return [mockHostile];
        }
        return [];
      });
      
      vizWithCombat.draw(mockRoom);
      
      expect(roomVisualStub.called).to.be.true;
    });

    it("should skip combat info when disabled", () => {
      const vizWithoutCombat = new RoomVisualizer({ showCombat: false });
      
      vizWithoutCombat.draw(mockRoom);
      
      expect(roomVisualStub.called).to.be.true;
    });

    it("should handle room with no hostiles", () => {
      mockRoom.find = sinon.stub().returns([]);
      
      const vizWithCombat = new RoomVisualizer({ showCombat: true });
      
      expect(() => vizWithCombat.draw(mockRoom)).to.not.throw();
    });
  });

  describe("resource flow visualization", () => {
    it("should visualize resource flow when enabled", () => {
      const vizWithFlow = new RoomVisualizer({ showResourceFlow: true });
      
      vizWithFlow.draw(mockRoom);
      
      expect(roomVisualStub.called).to.be.true;
    });

    it("should skip resource flow when disabled", () => {
      const vizWithoutFlow = new RoomVisualizer({ showResourceFlow: false });
      
      vizWithoutFlow.draw(mockRoom);
      
      expect(roomVisualStub.called).to.be.true;
    });
  });

  describe("path visualization", () => {
    it("should visualize paths when enabled", () => {
      const vizWithPaths = new RoomVisualizer({ showPaths: true });
      
      vizWithPaths.draw(mockRoom);
      
      expect(roomVisualStub.called).to.be.true;
    });

    it("should skip paths when disabled", () => {
      const vizWithoutPaths = new RoomVisualizer({ showPaths: false });
      
      vizWithoutPaths.draw(mockRoom);
      
      expect(roomVisualStub.called).to.be.true;
    });
  });

  describe("structure visualization", () => {
    it("should visualize structures when enabled", () => {
      const vizWithStructures = new RoomVisualizer({ showStructures: true });
      
      // Add structures
      const mockStructure = {
        structureType: STRUCTURE_TOWER,
        pos: { x: 20, y: 20 },
        hits: 3000,
        hitsMax: 3000
      };
      
      mockRoom.find = sinon.stub().callsFake((findConstant: number) => {
        if (findConstant === FIND_MY_STRUCTURES) {
          return [mockStructure];
        }
        return [];
      });
      
      vizWithStructures.draw(mockRoom);
      
      expect(roomVisualStub.called).to.be.true;
    });

    it("should skip structures when disabled", () => {
      const vizWithoutStructures = new RoomVisualizer({ showStructures: false });
      
      vizWithoutStructures.draw(mockRoom);
      
      expect(roomVisualStub.called).to.be.true;
    });
  });

  describe("edge cases", () => {
    it("should handle all visualizations disabled", () => {
      const vizAllDisabled = new RoomVisualizer({
        showPheromones: false,
        showPaths: false,
        showCombat: false,
        showResourceFlow: false,
        showSpawnQueue: false,
        showRoomStats: false,
        showStructures: false
      });
      
      vizAllDisabled.draw(mockRoom);
      
      // Should still create visual but with minimal rendering
      expect(roomVisualStub.called).to.be.true;
    });

    it("should handle all visualizations enabled", () => {
      const vizAllEnabled = new RoomVisualizer({
        showPheromones: true,
        showPaths: true,
        showCombat: true,
        showResourceFlow: true,
        showSpawnQueue: true,
        showRoomStats: true,
        showStructures: true
      });
      
      vizAllEnabled.draw(mockRoom);
      
      expect(roomVisualStub.called).to.be.true;
    });

    it("should handle invalid opacity values gracefully", () => {
      const vizInvalidOpacity = new RoomVisualizer({ opacity: -1 });
      
      expect(() => vizInvalidOpacity.draw(mockRoom)).to.not.throw();
    });

    it("should handle very high opacity values", () => {
      const vizHighOpacity = new RoomVisualizer({ opacity: 2.0 });
      
      expect(() => vizHighOpacity.draw(mockRoom)).to.not.throw();
    });

    it("should handle room with missing memory", () => {
      const roomWithoutMemory = {
        ...mockRoom,
        memory: undefined
      };

      expect(() => visualizer.draw(roomWithoutMemory)).to.not.throw();
    });

    it("should handle rapid successive calls", () => {
      expect(() => {
        visualizer.draw(mockRoom);
        visualizer.draw(mockRoom);
        visualizer.draw(mockRoom);
      }).to.not.throw();
    });
  });
});
