# Migration Guide: From Unit Tests to screepsmod-testing

This guide explains how to migrate existing unit tests to integration tests using screepsmod-testing.

## Why Migrate?

Traditional unit tests require extensive mocking of the Screeps API, which:
- Doesn't reflect actual game behavior
- Breaks when the API changes
- Can't test interactions between game systems
- Requires maintaining mock implementations

With screepsmod-testing, you can:
- Test against the real Screeps API
- Validate actual game state and behavior
- Run integration tests continuously during bot execution
- Eliminate mock maintenance overhead

## Migration Process

### Step 1: Identify Tests to Migrate

Good candidates for migration:
- ✅ Integration tests that validate system interactions
- ✅ Tests that check game state consistency
- ✅ Tests that validate bot decision-making
- ✅ Performance and efficiency tests

Keep as unit tests:
- ❌ Pure function tests with no game state
- ❌ Utility function tests
- ❌ Mathematical calculations
- ❌ Data transformation logic

### Step 2: Remove Mocks

**Before (Unit Test)**:
```typescript
// Mock setup
const mockRoom = {
  name: 'W1N1',
  controller: { my: true, level: 5 },
  storage: { store: { energy: 50000 } },
  find: (type: any) => mockStructures
};

const mockGame = {
  rooms: { W1N1: mockRoom },
  time: 1000
};

global.Game = mockGame;
```

**After (Integration Test)**:
```typescript
// No mocks needed! Access real game state
describe('Room Management', () => {
  it('should manage controlled rooms', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my) {
        // Use real room object
        expect(room.storage).toBeDefined();
      }
    }
  });
});
```

### Step 3: Convert Test Structure

**Before (Mocha/Chai)**:
```typescript
import { expect } from 'chai';

describe('Spawn System', () => {
  it('should spawn harvesters', () => {
    const spawn = mockSpawn;
    const result = spawnHarvester(spawn);
    expect(result).to.equal(OK);
  });
});
```

**After (screepsmod-testing)**:
```typescript
import { describe, it, expect } from 'screepsmod-testing';

describe('Spawn System', () => {
  it('should spawn harvesters', () => {
    for (const name in Game.spawns) {
      const spawn = Game.spawns[name];
      // Test actual spawn behavior
      const harvesters = spawn.room.find(FIND_MY_CREEPS, {
        filter: c => c.memory.role === 'harvester'
      });
      expect(harvesters.length).toBeGreaterThan(0);
    }
  });
});
```

### Step 4: Test Real Game State

**Before (Mocked State)**:
```typescript
it('should maintain energy reserves', () => {
  const mockStorage = { store: { energy: 10000 } };
  expect(mockStorage.store.energy).to.be.greaterThan(5000);
});
```

**After (Real State)**:
```typescript
it('should maintain energy reserves', () => {
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (room.controller?.my && room.storage) {
      expect(room.storage.store[RESOURCE_ENERGY]).toBeGreaterThan(5000);
    }
  }
});
```

## Example Migrations

### Example 1: Creep Role Assignment

**Before**:
```typescript
describe('Creep Roles', () => {
  let mockCreep: any;
  
  beforeEach(() => {
    mockCreep = {
      name: 'test',
      memory: {},
      room: mockRoom
    };
  });

  it('should assign harvester role', () => {
    assignRole(mockCreep, 'harvester');
    expect(mockCreep.memory.role).to.equal('harvester');
  });
});
```

**After**:
```typescript
describe('Creep Roles', () => {
  it('should have roles assigned to all creeps', () => {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      expect(creep.memory.role).toBeDefined();
      expect(typeof creep.memory.role).toBe('string');
    }
  });
  
  it('should have valid role types', () => {
    const validRoles = ['harvester', 'hauler', 'upgrader', 'builder', 'defender'];
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      expect(validRoles).toContain(creep.memory.role);
    }
  });
});
```

### Example 2: Defense System

**Before**:
```typescript
describe('Defense', () => {
  it('should activate towers against hostiles', () => {
    const mockHostile = { pos: { x: 25, y: 25 } };
    const mockTower = {
      attack: sinon.stub().returns(OK)
    };
    
    defendRoom(mockRoom, [mockTower], [mockHostile]);
    expect(mockTower.attack.calledOnce).to.be.true;
  });
});
```

**After**:
```typescript
describe('Defense System', () => {
  it('should have towers in controlled rooms', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my && room.controller.level >= 3) {
        const towers = room.find(FIND_MY_STRUCTURES, {
          filter: s => s.structureType === STRUCTURE_TOWER
        });
        expect(towers.length).toBeGreaterThan(0);
      }
    }
  });

  it('should respond to hostile creeps', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my) {
        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
          // Either have active towers or safe mode
          const towers = room.find(FIND_MY_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_TOWER
          });
          const hasDefense = towers.length > 0 || (room.controller.safeMode || 0) > 0;
          expect(hasDefense).toBeTruthy();
        }
      }
    }
  });
});
```

### Example 3: Economy Management

**Before**:
```typescript
describe('Economy', () => {
  it('should balance harvesting', () => {
    const sources = [mockSource1, mockSource2];
    const assignments = assignHarvesters(sources);
    expect(assignments.length).to.equal(sources.length * 2);
  });
});
```

**After**:
```typescript
describe('Economy Management', () => {
  it('should have harvesters for all sources', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my) {
        const sources = room.find(FIND_SOURCES);
        const harvesters = room.find(FIND_MY_CREEPS, {
          filter: c => c.memory.role === 'harvester'
        });
        
        // Should have at least one harvester per source
        expect(harvesters.length).toBeGreaterThan(0);
        
        // Each source should have assigned harvesters
        for (const source of sources) {
          const assigned = harvesters.filter(c => 
            c.memory.sourceId === source.id
          );
          expect(assigned.length).toBeGreaterThan(0);
        }
      }
    }
  });
  
  it('should maintain energy flow', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my && room.storage) {
        const energy = room.storage.store[RESOURCE_ENERGY];
        const spawns = room.find(FIND_MY_SPAWNS);
        
        // If we have spawns and energy, they should be functional
        if (spawns.length > 0 && energy > 300) {
          const spawn = spawns[0];
          expect(spawn.room.energyAvailable).toBeGreaterThan(0);
        }
      }
    }
  });
});
```

## Best Practices

### 1. Test Actual Conditions

Instead of testing code paths, test actual game conditions:

```typescript
// ❌ Bad: Testing implementation
it('should call spawnCreep with correct body', () => {
  expect(spawn.spawnCreep).toHaveBeenCalledWith([WORK, CARRY, MOVE], ...);
});

// ✅ Good: Testing outcome
it('should have working creeps in the room', () => {
  const creeps = room.find(FIND_MY_CREEPS);
  const workingCreeps = creeps.filter(c => c.getActiveBodyparts(WORK) > 0);
  expect(workingCreeps.length).toBeGreaterThan(0);
});
```

### 2. Use Realistic Assertions

Test for realistic game conditions, not exact values:

```typescript
// ❌ Bad: Brittle exact match
expect(room.storage.store.energy).toBe(50000);

// ✅ Good: Reasonable range
expect(room.storage.store.energy).toBeGreaterThan(10000);
expect(room.storage.store.energy).toBeLessThan(1000000);
```

### 3. Handle Multiple Rooms

Always iterate over rooms instead of testing a single mock:

```typescript
// ✅ Good: Test all rooms
for (const roomName in Game.rooms) {
  const room = Game.rooms[roomName];
  if (room.controller?.my) {
    // Test this room
  }
}
```

### 4. Test System Interactions

Integration tests excel at testing how systems work together:

```typescript
it('should coordinate mining and hauling', () => {
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (room.controller?.my) {
      const miners = room.find(FIND_MY_CREEPS, {
        filter: c => c.memory.role === 'miner'
      });
      const haulers = room.find(FIND_MY_CREEPS, {
        filter: c => c.memory.role === 'hauler'
      });
      
      // If we have miners, we should have haulers too
      if (miners.length > 0) {
        expect(haulers.length).toBeGreaterThan(0);
      }
    }
  }
});
```

## Common Pitfalls

### 1. Assuming Game State

Don't assume specific rooms or objects exist:

```typescript
// ❌ Bad: Assumes W1N1 exists
const room = Game.rooms['W1N1'];
expect(room.controller.level).toBe(5);

// ✅ Good: Check for existence
if (Game.rooms['W1N1']?.controller?.my) {
  const room = Game.rooms['W1N1'];
  expect(room.controller.level).toBeGreaterThan(0);
}
```

### 2. Testing During Initialization

Early ticks may not have complete game state:

```typescript
it('should have multiple creeps', () => {
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (room.controller?.my) {
      // Only test if room is past early stages
      if (room.controller.level >= 2 && Game.time > 100) {
        const creeps = room.find(FIND_MY_CREEPS);
        expect(creeps.length).toBeGreaterThan(5);
      }
    }
  }
});
```

### 3. Hardcoded Values

Avoid hardcoding specific game values:

```typescript
// ❌ Bad: Hardcoded object IDs
const spawn = Game.getObjectById('58dbc6918283a6587e3a88e1');

// ✅ Good: Find objects dynamically
const spawns = Object.values(Game.spawns);
const spawn = spawns[0];
```

## Testing Strategy

Organize tests by system:

```
tests/
├── economy.test.ts      # Energy, mining, hauling
├── spawning.test.ts     # Spawn management, creep creation
├── defense.test.ts      # Towers, ramparts, safe mode
├── expansion.test.ts    # Claiming, remote mining
├── logistics.test.ts    # Terminal, market, transfers
└── performance.test.ts  # CPU, bucket, efficiency
```

## Running Migrated Tests

1. Build the screepsmod-testing package:
   ```bash
   cd packages/screepsmod-testing
   npm run build
   ```

2. Ensure it's in your config.yml:
   ```yaml
   mods:
     - ../screepsmod-testing
   ```

3. Run your performance server:
   ```bash
   cd packages/screeps-bot
   npm run test:performance
   ```

4. Tests will run automatically and output results to the console.

## Incremental Migration

You don't have to migrate all tests at once:

1. Keep existing unit tests for pure functions
2. Migrate integration tests first
3. Add new tests directly to screepsmod-testing
4. Gradually convert remaining unit tests as needed

## Getting Help

If you encounter issues during migration:
- Check the [README](./README.md) for API documentation
- Review the [examples](./examples/) directory
- Ensure the mod is properly configured in config.yml
- Check server logs for test output
