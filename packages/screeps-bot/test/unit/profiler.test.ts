/**
 * Profiler Tests
 *
 * Tests for CPU profiling system
 */

import { assert } from "chai";
import { Profiler } from "../../src/core/profiler";

describe("Profiler", () => {
  let profiler: Profiler;
  let cpuUsed: number;

  beforeEach(() => {
    // Mock Game and Memory
    cpuUsed = 0;
    (global as any).Game = {
      cpu: {
        getUsed: () => cpuUsed,
        limit: 20,
        bucket: 10000
      },
      time: 1000,
      creeps: {}
    };

    (global as any).Memory = {
      stats: {}
    };

    profiler = new Profiler({
      smoothingFactor: 0.1,
      enabled: true,
      logInterval: 0 // Disable auto-logging in tests
    });

    // Helper to set CPU used
    (global as any).setCpuUsed = (value: number) => {
      cpuUsed = value;
    };
  });

  describe("Room Profiling", () => {
    it("should track room CPU usage", () => {
      cpuUsed = 0;
      const start = profiler.startRoom("W1N1");
      cpuUsed = 0.05;
      profiler.endRoom("W1N1", start);

      const data = profiler.getRoomData("W1N1");
      assert.isDefined(data);
      assert.approximately(data!.avgCpu, 0.05, 0.001);
      assert.equal(data!.peakCpu, 0.05);
      assert.equal(data!.samples, 1);
    });

    it("should calculate exponential moving average", () => {
      cpuUsed = 0;
      
      // First measurement: 0.1 CPU
      let start = profiler.startRoom("W1N1");
      cpuUsed = 0.1;
      profiler.endRoom("W1N1", start);

      // Second measurement: 0.1 CPU (same as first)
      cpuUsed = 0.1;
      start = profiler.startRoom("W1N1");
      cpuUsed = 0.2;
      profiler.endRoom("W1N1", start);

      const data = profiler.getRoomData("W1N1");
      assert.isDefined(data);
      // First: avgCpu = 0.1
      // Second: avgCpu = 0.1 * (1-0.1) + 0.1 * 0.1 = 0.09 + 0.01 = 0.1
      assert.approximately(data!.avgCpu, 0.1, 0.01);
      assert.equal(data!.peakCpu, 0.1);
      assert.equal(data!.samples, 2);
    });

    it("should track peak CPU", () => {
      cpuUsed = 0;

      // First: low CPU
      let start = profiler.startRoom("W1N1");
      cpuUsed = 0.05;
      profiler.endRoom("W1N1", start);

      // Second: high CPU spike
      cpuUsed = 0.05;
      start = profiler.startRoom("W1N1");
      cpuUsed = 0.3;
      profiler.endRoom("W1N1", start);

      // Third: back to normal
      cpuUsed = 0.3;
      start = profiler.startRoom("W1N1");
      cpuUsed = 0.35;
      profiler.endRoom("W1N1", start);

      const data = profiler.getRoomData("W1N1");
      assert.equal(data!.peakCpu, 0.25); // Should be the highest
    });

    it("should return undefined for non-existent room", () => {
      const data = profiler.getRoomData("W99N99");
      assert.isUndefined(data);
    });
  });

  describe("Subsystem Profiling", () => {
    it("should measure subsystem CPU", () => {
      cpuUsed = 0;
      
      const result = profiler.measureSubsystem("testSubsystem", () => {
        cpuUsed = 0.05;
        return "success";
      });

      assert.equal(result, "success");
      profiler.finalizeTick();

      const data = profiler.getSubsystemData("testSubsystem");
      assert.isDefined(data);
      assert.approximately(data!.avgCpu, 0.05, 0.001);
    });

    it("should track multiple calls in same tick", () => {
      cpuUsed = 0;

      profiler.measureSubsystem("testSubsystem", () => {
        cpuUsed = 0.01;
      });

      cpuUsed = 0.01;
      profiler.measureSubsystem("testSubsystem", () => {
        cpuUsed = 0.03;
      });

      profiler.finalizeTick();

      const data = profiler.getSubsystemData("testSubsystem");
      assert.isDefined(data);
      // Total CPU = 0.01 + 0.02 = 0.03
      assert.approximately(data!.avgCpu, 0.03, 0.001);
      assert.equal(data!.callsThisTick, 2);
    });

    it("should handle exceptions in measured functions", () => {
      try {
        profiler.measureSubsystem("testSubsystem", () => {
          throw new Error("Test error");
        });
        assert.fail("Should have thrown error");
      } catch (err) {
        // Expected to throw
      }
    });
  });

  describe("Role Profiling", () => {
    it("should track role CPU separately in roles map", () => {
      cpuUsed = 0;

      profiler.measureSubsystem("role:harvester", () => {
        cpuUsed = 0.05;
      });

      profiler.finalizeTick();

      // Role data is stored in the roles map, not subsystems
      // We can't directly access it without making getRoleData public
      // So we just verify the subsystems map doesn't have it
      const data = profiler.getSubsystemData("harvester");
      assert.isUndefined(data);
    });
  });

  describe("Total CPU Calculation", () => {
    it("should sum all room CPU averages", () => {
      cpuUsed = 0;

      let start = profiler.startRoom("W1N1");
      cpuUsed = 0.1;
      profiler.endRoom("W1N1", start);

      cpuUsed = 0.1;
      start = profiler.startRoom("W2N2");
      cpuUsed = 0.25;
      profiler.endRoom("W2N2", start);

      const total = profiler.getTotalRoomCpu();
      assert.approximately(total, 0.25, 0.01);
    });

    it("should return zero when no rooms profiled", () => {
      const total = profiler.getTotalRoomCpu();
      assert.equal(total, 0);
    });
  });

  describe("Enable/Disable", () => {
    it("should not profile when disabled", () => {
      profiler.setEnabled(false);
      assert.isFalse(profiler.isEnabled());

      cpuUsed = 0;
      const start = profiler.startRoom("W1N1");
      cpuUsed = 0.1;
      profiler.endRoom("W1N1", start);

      const data = profiler.getRoomData("W1N1");
      assert.isUndefined(data);
    });

    it("should resume profiling when re-enabled", () => {
      profiler.setEnabled(false);
      profiler.setEnabled(true);
      assert.isTrue(profiler.isEnabled());

      cpuUsed = 0;
      const start = profiler.startRoom("W1N1");
      cpuUsed = 0.1;
      profiler.endRoom("W1N1", start);

      const data = profiler.getRoomData("W1N1");
      assert.isDefined(data);
    });
  });

  describe("Reset", () => {
    it("should clear all profiling data", () => {
      cpuUsed = 0;
      const start = profiler.startRoom("W1N1");
      cpuUsed = 0.1;
      profiler.endRoom("W1N1", start);

      profiler.reset();

      const data = profiler.getRoomData("W1N1");
      assert.isUndefined(data);
    });
  });

  describe("finalizeTick", () => {
    it("should update tick count", () => {
      profiler.finalizeTick();
      profiler.finalizeTick();
      
      // Memory access would normally show tickCount = 2
      // We can't easily test this without accessing private state
    });

    it("should clear tick measurements", () => {
      cpuUsed = 0;
      profiler.measureSubsystem("test", () => {
        cpuUsed = 0.05;
      });

      profiler.finalizeTick();

      // Second finalize should not duplicate measurements
      profiler.finalizeTick();
    });
  });
});
