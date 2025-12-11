/**
 * Example tests demonstrating advanced features
 */

import {
  describe,
  it,
  expect,
  Assert,
  benchmark,
  PerformanceAssert,
  VisualTester,
  VisualAssert
} from 'screepsmod-testing';

// ==============================================================
// Performance Benchmarking Examples
// ==============================================================

describe('Performance Benchmarking', () => {
  it('should complete within CPU budget', async () => {
    await PerformanceAssert.cpuBudget(() => {
      // Simulate some game logic
      for (let i = 0; i < 100; i++) {
        const energy = Game.rooms['W1N1']?.energyAvailable || 0;
      }
    }, 5); // Max 5 CPU
  });

  it('should complete within time limit', async () => {
    await PerformanceAssert.timeLimit(() => {
      // Quick operation
      const rooms = Object.keys(Game.rooms);
    }, 10); // Max 10ms
  });

  it('benchmark pathfinding', async () => {
    const result = await benchmark('pathfinding', () => {
      const room = Game.rooms['W1N1'];
      if (room) {
        const spawn = room.find(FIND_MY_SPAWNS)[0];
        const controller = room.controller;
        if (spawn && controller) {
          PathFinder.search(spawn.pos, { pos: controller.pos, range: 3 });
        }
      }
    }, {
      samples: 5,
      iterations: 10,
      warmup: 2
    });

    console.log(`Pathfinding benchmark:`);
    console.log(`  Mean: ${result.mean.toFixed(3)}ms`);
    console.log(`  Median: ${result.median.toFixed(3)}ms`);
    console.log(`  StdDev: ${result.stdDev.toFixed(3)}ms`);

    // Assert performance is acceptable
    Assert.lessThan(result.mean, 5, 'Mean pathfinding time should be < 5ms');
  });
});

// ==============================================================
// Tagged Test Examples
// ==============================================================

describe('Tagged Tests', () => {
  it('fast test', () => {
    expect(true).toBeTruthy();
  }, ['fast', 'unit']);

  it('slow integration test', async () => {
    // Simulate longer operation
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(true).toBeTruthy();
  }, ['slow', 'integration']);

  it('economy test', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.storage) {
        expect(room.storage.store.energy).toBeGreaterThan(0);
      }
    }
  }, ['economy', 'integration']);

  it('military test', () => {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      if (creep.memory.role === 'soldier') {
        expect(creep.getActiveBodyparts(ATTACK)).toBeGreaterThan(0);
      }
    }
  }, ['military', 'integration']);
});

// ==============================================================
// Visual Testing Examples
// ==============================================================

describe('Visual Testing', () => {
  const visualTester = new VisualTester();

  it('should capture room visual snapshot', () => {
    const snapshot = visualTester.captureSnapshot('W1N1', Game.time);
    expect(snapshot).toBeTruthy();
    if (snapshot) {
      expect(snapshot.roomName).toBe('W1N1');
      expect(snapshot.tick).toBe(Game.time);
    }
  });

  it('should compare visual snapshots', () => {
    const snapshot1 = visualTester.captureSnapshot('W1N1', Game.time);
    const snapshot2 = visualTester.captureSnapshot('W1N1', Game.time);

    if (snapshot1 && snapshot2) {
      const comparison = visualTester.compareSnapshots(snapshot1, snapshot2);
      expect(comparison.match).toBeTruthy();
      expect(comparison.difference).toBe(0);
    }
  });
});

// ==============================================================
// CPU and Memory Tracking Examples
// ==============================================================

describe('Resource Usage Tracking', () => {
  it('tracks CPU usage per test', () => {
    // CPU usage is automatically tracked for each test
    // Check the test results for cpuUsed field
    
    let sum = 0;
    for (let i = 0; i < 1000; i++) {
      sum += i;
    }
    
    expect(sum).toBeGreaterThan(0);
  });

  it('compares performance across runs', () => {
    // This test demonstrates that performance data
    // is available in test results
    const rooms = Object.keys(Game.rooms);
    expect(rooms.length).toBeGreaterThan(-1);
  });
});

// ==============================================================
// Filter Testing Examples
// ==============================================================

describe('Filter Examples', () => {
  it('production code test', () => {
    expect(true).toBeTruthy();
  }, ['production']);

  it('experimental feature test', () => {
    expect(true).toBeTruthy();
  }, ['experimental']);

  it('debug test', () => {
    expect(true).toBeTruthy();
  }, ['debug']);
});

// ==============================================================
// Complex Integration Test Example
// ==============================================================

describe('Full System Integration', () => {
  it('should manage complete room lifecycle', async () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      
      if (!room.controller?.my) continue;

      // Test spawns
      const spawns = room.find(FIND_MY_SPAWNS);
      expect(spawns.length).toBeGreaterThan(0);

      // Test energy management
      if (room.storage) {
        expect(room.storage.store.energy).toBeGreaterThan(0);
      }

      // Test creeps
      const creeps = room.find(FIND_MY_CREEPS);
      for (const creep of creeps) {
        Assert.isNotNullish(creep.memory.role, `Creep ${creep.name} should have a role`);
      }

      // Test defense
      const hostiles = room.find(FIND_HOSTILE_CREEPS);
      if (hostiles.length > 0) {
        const towers = room.find(FIND_MY_STRUCTURES, {
          filter: s => s.structureType === STRUCTURE_TOWER
        });
        Assert.isTrue(
          towers.length > 0 || (room.controller?.safeMode || 0) > 0,
          `Room ${roomName} should have defense against hostiles`
        );
      }
    }
  }, ['integration', 'system']);
});
