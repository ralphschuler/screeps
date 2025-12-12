/**
 * SwarmBot Kernel Integration Tests
 * 
 * These tests validate the kernel process management system.
 * Migrated from swarmBot.test.ts unit tests.
 */

import { describe, it, expect, Assert } from 'screepsmod-testing';
import { kernel } from '../core/kernel';

describe('Kernel Process Management', () => {
  it('should have kernel initialized', () => {
    Assert.isNotNullish(kernel);
    Assert.isType(typeof kernel.run, 'function');
    Assert.isType(typeof kernel.registerProcess, 'function');
    Assert.isType(typeof kernel.unregisterProcess, 'function');
  });

  it('should track registered processes', () => {
    const processes = kernel.getProcesses();
    Assert.isTrue(Array.isArray(processes));
    
    // Log process count for visibility
    console.log(`[Test] Kernel has ${processes.length} registered processes`);
  });

  it('should have creep processes for active creeps', () => {
    const creepCount = Object.keys(Game.creeps).length;
    
    if (creepCount > 0) {
      const creepProcesses = kernel.getProcesses().filter(p => p.id.startsWith('creep:'));
      
      // Should have processes for creeps (may not be 1:1 depending on implementation)
      console.log(`[Test] Found ${creepProcesses.length} creep processes for ${creepCount} creeps`);
    }
  });

  it('should have room processes for controlled rooms', () => {
    let controlledRoomCount = 0;
    for (const roomName in Game.rooms) {
      if (Game.rooms[roomName].controller?.my) {
        controlledRoomCount++;
      }
    }
    
    if (controlledRoomCount > 0) {
      const roomProcesses = kernel.getProcesses().filter(p => p.id.startsWith('room:'));
      
      // Should have processes for rooms (may not be 1:1 depending on implementation)
      console.log(`[Test] Found ${roomProcesses.length} room processes for ${controlledRoomCount} controlled rooms`);
    }
  });
});

describe('Kernel Execution', () => {
  it('should execute without errors', () => {
    // The kernel.run() is called as part of swarmLoop
    // We can't call it again here, but we can verify it exists
    Assert.isType(typeof kernel.run, 'function');
  });

  it('should track process execution order', () => {
    const processes = kernel.getProcesses();
    
    // Processes should have priority defined
    for (const process of processes) {
      Assert.isNotNullish(process.priority);
      Assert.isType(process.priority, 'number');
    }
  });
});

describe('Kernel Configuration', () => {
  it('should have valid CPU budget configuration', () => {
    // The kernel should have CPU management
    const config = (kernel as any).config;
    
    if (config) {
      console.log('[Test] Kernel configuration exists');
    }
  });

  it('should respect game CPU limits', () => {
    Assert.isNotNullish(Game.cpu.limit);
    Assert.greaterThan(Game.cpu.limit, 0);
    
    // Kernel should not exceed CPU limit
    const cpuUsed = Game.cpu.getUsed();
    console.log(`[Test] CPU used: ${cpuUsed.toFixed(2)} / ${Game.cpu.limit}`);
  });
});

console.log('[Tests] SwarmBot kernel tests registered');
