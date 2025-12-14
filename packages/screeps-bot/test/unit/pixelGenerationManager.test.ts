/**
 * Pixel Generation Manager Tests
 *
 * Tests for the automatic pixel generation system that converts
 * CPU bucket surplus into pixels
 */

import { expect } from "chai";
import { PixelGenerationManager, createDefaultPixelGenerationMemory } from "../../src/empire/pixelGenerationManager";

// Mock global objects
const mockMemory: any = {};
const mockGlobal: any = {
  _pixelGenerationMemory: createDefaultPixelGenerationMemory()
};

const mockGame: any = {
  time: 1000,
  cpu: {
    bucket: 10000,
    generatePixel: () => OK,
    getUsed: () => 0
  }
};

// Setup globals
(global as any).Game = mockGame;
(global as any).Memory = mockMemory;
// Store pixel generation memory in global like the manager does
Object.assign(global as any, mockGlobal);
(global as any).OK = 0;
(global as any).ERR_NOT_ENOUGH_RESOURCES = -6;
(global as any).ERR_FULL = -8;

describe("Pixel Generation Manager", () => {
  let manager: PixelGenerationManager;

  beforeEach(() => {
    // Reset mocks
    mockGame.time = 1000;
    mockGame.cpu.bucket = 10000;
    mockGame.cpu.generatePixel = () => OK;
    
    // Reset memory in global
    (global as any)._pixelGenerationMemory = createDefaultPixelGenerationMemory();

    // Create manager with test config
    manager = new PixelGenerationManager({
      enabled: true,
      fullBucketTicksRequired: 25,
      bucketMax: 10000,
      cpuCostPerPixel: 10000,
      minBucketAfterGeneration: 0
    });
  });

  describe("Configuration", () => {
    it("should use default configuration", () => {
      const defaultManager = new PixelGenerationManager();
      const config = defaultManager.getConfig();

      expect(config.enabled).to.be.true;
      expect(config.fullBucketTicksRequired).to.equal(25);
      expect(config.bucketMax).to.equal(10000);
      expect(config.cpuCostPerPixel).to.equal(10000);
    });

    it("should allow custom configuration", () => {
      const customManager = new PixelGenerationManager({
        fullBucketTicksRequired: 50,
        bucketMax: 10000
      });
      const config = customManager.getConfig();

      expect(config.fullBucketTicksRequired).to.equal(50);
      expect(config.bucketMax).to.equal(10000);
    });

    it("should update configuration", () => {
      manager.updateConfig({ fullBucketTicksRequired: 30 });
      const config = manager.getConfig();

      expect(config.fullBucketTicksRequired).to.equal(30);
    });

    it("should enable and disable pixel generation", () => {
      manager.disable();
      expect(manager.getConfig().enabled).to.be.false;

      manager.enable();
      expect(manager.getConfig().enabled).to.be.true;
    });
  });

  describe("Memory Management", () => {
    it("should create default pixel generation memory", () => {
      const mem = createDefaultPixelGenerationMemory();

      expect(mem.bucketFullSince).to.equal(0);
      expect(mem.consecutiveFullTicks).to.equal(0);
      expect(mem.totalPixelsGenerated).to.equal(0);
      expect(mem.lastGenerationTick).to.equal(0);
    });
  });

  describe("Bucket Tracking", () => {
    it("should track consecutive full bucket ticks", () => {
      // Simulate bucket being full for multiple ticks
      for (let i = 0; i < 10; i++) {
        mockGame.time = 1000 + i;
        mockGame.cpu.bucket = 10000;
        manager.run();
      }

      const stats = manager.getStats();
      expect(stats.consecutiveFullTicks).to.equal(10);
    });

    it("should reset consecutive ticks when bucket drops", () => {
      // Bucket full for 5 ticks
      for (let i = 0; i < 5; i++) {
        mockGame.time = 1000 + i;
        mockGame.cpu.bucket = 10000;
        manager.run();
      }

      expect(manager.getStats().consecutiveFullTicks).to.equal(5);

      // Bucket drops
      mockGame.time = 1005;
      mockGame.cpu.bucket = 9000;
      manager.run();

      expect(manager.getStats().consecutiveFullTicks).to.equal(0);
    });

    it("should track when bucket first became full", () => {
      mockGame.time = 2000;
      mockGame.cpu.bucket = 10000;
      manager.run();

      const stats = manager.getStats();
      expect(stats.bucketFullSince).to.equal(2000);
    });

    it("should maintain bucketFullSince across consecutive full ticks", () => {
      mockGame.time = 2000;
      mockGame.cpu.bucket = 10000;
      manager.run();

      mockGame.time = 2001;
      manager.run();

      mockGame.time = 2002;
      manager.run();

      const stats = manager.getStats();
      expect(stats.bucketFullSince).to.equal(2000);
      expect(stats.consecutiveFullTicks).to.equal(3);
    });
  });

  describe("Pixel Generation", () => {
    it("should not generate before 25 consecutive full ticks", () => {
      let generateCalled = false;
      mockGame.cpu.generatePixel = () => {
        generateCalled = true;
        return OK;
      };

      // Run for 24 ticks
      for (let i = 0; i < 24; i++) {
        mockGame.time = 1000 + i;
        mockGame.cpu.bucket = 10000;
        manager.run();
      }

      expect(generateCalled).to.be.false;
      expect(manager.getStats().totalGenerated).to.equal(0);
    });

    it("should generate pixel after 25 consecutive full ticks", () => {
      let generateCalled = false;
      mockGame.cpu.generatePixel = () => {
        generateCalled = true;
        return OK;
      };

      // Run for 25 ticks
      for (let i = 0; i < 25; i++) {
        mockGame.time = 1000 + i;
        mockGame.cpu.bucket = 10000;
        manager.run();
      }

      expect(generateCalled).to.be.true;
      expect(manager.getStats().totalGenerated).to.equal(1);
    });

    it("should reset counter after generation", () => {
      mockGame.cpu.generatePixel = () => OK;

      // Fill bucket for 25 ticks
      for (let i = 0; i < 25; i++) {
        mockGame.time = 1000 + i;
        mockGame.cpu.bucket = 10000;
        manager.run();
      }

      expect(manager.getStats().totalGenerated).to.equal(1);
      expect(manager.getStats().consecutiveFullTicks).to.equal(0);
    });

    it("should track total pixels generated", () => {
      mockGame.cpu.generatePixel = () => OK;

      // Generate first pixel
      for (let i = 0; i < 25; i++) {
        mockGame.time = 1000 + i;
        mockGame.cpu.bucket = 10000;
        manager.run();
      }

      expect(manager.getStats().totalGenerated).to.equal(1);

      // Generate second pixel
      for (let i = 0; i < 25; i++) {
        mockGame.time = 2000 + i;
        mockGame.cpu.bucket = 10000;
        manager.run();
      }

      expect(manager.getStats().totalGenerated).to.equal(2);
    });

    it("should record last generation tick", () => {
      mockGame.cpu.generatePixel = () => OK;

      const generationTick = 1024;
      for (let i = 0; i < 25; i++) {
        mockGame.time = 1000 + i;
        mockGame.cpu.bucket = 10000;
        manager.run();
      }

      const stats = manager.getStats();
      expect(stats.lastGenerationTick).to.be.greaterThan(0);
    });

    it("should not generate when bucket is not full", () => {
      let generateCalled = false;
      mockGame.cpu.generatePixel = () => {
        generateCalled = true;
        return OK;
      };

      // Run for 25 ticks with less than full bucket
      for (let i = 0; i < 25; i++) {
        mockGame.time = 1000 + i;
        mockGame.cpu.bucket = 9999; // Not quite full
        manager.run();
      }

      expect(generateCalled).to.be.false;
    });

    it("should handle generation errors gracefully", () => {
      mockGame.cpu.generatePixel = () => ERR_NOT_ENOUGH_RESOURCES;

      // Run for 25 ticks
      for (let i = 0; i < 25; i++) {
        mockGame.time = 1000 + i;
        mockGame.cpu.bucket = 10000;
        manager.run();
      }

      // Should not crash, but also not increment counter
      expect(manager.getStats().totalGenerated).to.equal(0);
    });
  });

  describe("Statistics", () => {
    it("should provide accurate statistics", () => {
      mockGame.cpu.generatePixel = () => OK;

      // Simulate partial progress
      for (let i = 0; i < 15; i++) {
        mockGame.time = 1000 + i;
        mockGame.cpu.bucket = 10000;
        manager.run();
      }

      const stats = manager.getStats();
      expect(stats.enabled).to.be.true;
      expect(stats.totalGenerated).to.equal(0);
      expect(stats.consecutiveFullTicks).to.equal(15);
      expect(stats.canGenerate).to.be.false;
      expect(stats.ticksUntilGeneration).to.equal(10); // 25 - 15
    });

    it("should indicate when generation is possible", () => {
      mockGame.cpu.generatePixel = () => OK;

      // Run for 25 ticks but don't trigger generation yet
      for (let i = 0; i < 24; i++) {
        mockGame.time = 1000 + i;
        mockGame.cpu.bucket = 10000;
        manager.run();
      }

      let stats = manager.getStats();
      expect(stats.canGenerate).to.be.false;

      // One more tick to reach threshold
      mockGame.time = 1024;
      mockGame.cpu.bucket = 10000;
      manager.run();

      stats = manager.getStats();
      expect(stats.totalGenerated).to.equal(1);
    });

    it("should calculate ticks until generation correctly", () => {
      const stats1 = manager.getStats();
      expect(stats1.ticksUntilGeneration).to.equal(25);

      // Simulate 10 ticks
      for (let i = 0; i < 10; i++) {
        mockGame.time = 1000 + i;
        mockGame.cpu.bucket = 10000;
        manager.run();
      }

      const stats2 = manager.getStats();
      expect(stats2.ticksUntilGeneration).to.equal(15);
    });
  });

  describe("Edge Cases", () => {
    it("should handle disabled state correctly", () => {
      manager.disable();
      
      let generateCalled = false;
      mockGame.cpu.generatePixel = () => {
        generateCalled = true;
        return OK;
      };

      // Run for 25 ticks
      for (let i = 0; i < 25; i++) {
        mockGame.time = 1000 + i;
        mockGame.cpu.bucket = 10000;
        manager.run();
      }

      expect(generateCalled).to.be.false;
    });

    it("should handle bucket exactly at max", () => {
      mockGame.cpu.generatePixel = () => OK;
      mockGame.cpu.bucket = 10000; // Exactly at max

      for (let i = 0; i < 25; i++) {
        mockGame.time = 1000 + i;
        manager.run();
      }

      expect(manager.getStats().totalGenerated).to.equal(1);
    });

    it("should handle very long full bucket streaks", () => {
      mockGame.cpu.generatePixel = () => OK;

      // Simulate 100 ticks of full bucket
      for (let i = 0; i < 100; i++) {
        mockGame.time = 1000 + i;
        mockGame.cpu.bucket = 10000;
        manager.run();
      }

      // Should have generated multiple pixels
      // First at tick 25, then resets and generates again at tick 50, 75, 100
      expect(manager.getStats().totalGenerated).to.be.greaterThan(1);
    });

    it("should handle rapid bucket fluctuations", () => {
      mockGame.cpu.generatePixel = () => OK;

      // Simulate bucket going up and down
      for (let i = 0; i < 50; i++) {
        mockGame.time = 1000 + i;
        mockGame.cpu.bucket = i % 2 === 0 ? 10000 : 9000;
        manager.run();
      }

      // Should never generate because never 25 consecutive full ticks
      expect(manager.getStats().totalGenerated).to.equal(0);
    });
  });

  describe("Custom Configuration", () => {
    it("should respect custom fullBucketTicksRequired", () => {
      const customManager = new PixelGenerationManager({
        fullBucketTicksRequired: 10
      });

      mockGame.cpu.generatePixel = () => OK;

      // Should generate after 10 ticks instead of 25
      for (let i = 0; i < 10; i++) {
        mockGame.time = 1000 + i;
        mockGame.cpu.bucket = 10000;
        customManager.run();
      }

      expect(customManager.getStats().totalGenerated).to.equal(1);
    });

    it("should respect custom bucketMax", () => {
      const customManager = new PixelGenerationManager({
        bucketMax: 9000 // Lower threshold for testing
      });

      mockGame.cpu.generatePixel = () => OK;

      // Should track full bucket at 9000
      for (let i = 0; i < 25; i++) {
        mockGame.time = 1000 + i;
        mockGame.cpu.bucket = 9000;
        customManager.run();
      }

      expect(customManager.getStats().totalGenerated).to.equal(1);
    });
  });
});
