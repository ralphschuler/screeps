# Test Migration Strategy

## Overview

This document explains the strategy for migrating tests from traditional unit tests to screepsmod-testing integration tests.

## Two Types of Tests

### 1. Unit Tests (`test/unit/`)

**Purpose**: Test pure functions, utilities, and isolated logic without game state

**Characteristics**:
- No access to Game API
- Use mocks for dependencies
- Fast execution
- Test implementation details

**Keep as Unit Tests**:
- Pure mathematical calculations
- Data transformations
- Utility functions
- Algorithm implementations (pathfinding, etc.)
- Type validators
- Cache implementations (when testing cache logic, not game integration)

**Examples**:
```typescript
// Pure function tests
bodyPartCache.test.ts     // Testing cache data structure
heapCache.test.ts         // Testing cache algorithms
objectCache.test.ts       // Testing cache logic
flowField.test.ts         // Testing pathfinding algorithm
```

### 2. Integration Tests (`src/tests/`)

**Purpose**: Test bot behavior in real game environment with actual game state

**Characteristics**:
- Full access to Game, Memory, and all APIs
- No mocks needed
- Tests actual behavior
- Tests system interactions

**Migrate to Integration Tests**:
- Game state validation
- Creep behavior
- Spawn management
- Room management
- System coordination
- Memory consistency
- Process management

**Examples**:
```typescript
// Integration tests
basic-game-state.test.ts  // Game API validation
spawn-system.test.ts      // Spawn behavior
creep-management.test.ts  // Creep lifecycle
swarm-kernel.test.ts      // Process management
pheromone-system.test.ts  // Coordination systems
stats-system.test.ts      // Statistics collection
```

## Migration Checklist

### Completed ✅

- [x] basic-game-state.test.ts (from main.test.ts)
- [x] spawn-system.test.ts (from spawn tests)
- [x] creep-management.test.ts (from creep tests)
- [x] swarm-kernel.test.ts (from swarmBot.test.ts)
- [x] pheromone-system.test.ts (from pheromone.test.ts)
- [x] stats-system.test.ts (from stats.test.ts)

### High Priority (Should Migrate)

These tests would benefit significantly from integration testing:

- [ ] **hauler.test.ts** → `hauler-behavior.test.ts`
  - Tests hauler role behavior with actual game resources
  - Should validate energy transfer between structures

- [ ] **larvaWorker.test.ts** → `worker-behavior.test.ts`
  - Tests worker role behavior (harvest, build, repair, upgrade)
  - Should validate actual task selection and execution

- [ ] **guardBehavior.test.ts** → `defense-behavior.test.ts`
  - Tests guard/defender behavior
  - Should validate actual combat responses

- [ ] **remoteRoomManager.test.ts** → `remote-mining.test.ts`
  - Tests remote mining coordination
  - Should validate cross-room operations

- [ ] **defenseCoordinator.test.ts** → `defense-coordination.test.ts`
  - Tests defense system coordination
  - Should validate tower and creep coordination

- [ ] **towerRepair.test.ts** → `tower-management.test.ts`
  - Tests tower behavior
  - Should validate repair/attack priorities

- [ ] **expansionManager.test.ts** → `expansion-system.test.ts`
  - Tests room expansion logic
  - Should validate room claiming and colonization

- [ ] **roomTransitions.test.ts** → `room-lifecycle.test.ts`
  - Tests room state transitions
  - Should validate lifecycle stages

### Medium Priority (Consider Migrating)

These tests have mixed pure logic and game state:

- [ ] **spawnQueue.test.ts** → Keep as unit test or split
  - Pure queue logic: Keep as unit test
  - Queue integration with spawning: Migrate

- [ ] **bodyOptimizer.test.ts** → Keep as unit test or split
  - Body part calculations: Keep as unit test
  - Energy-based optimization: Could migrate

- [ ] **movement.test.ts** → Split
  - Path calculation: Keep as unit test
  - Actual movement: Migrate to integration test

- [ ] **memoryManager.test.ts** → Split
  - Memory utilities: Keep as unit test
  - Memory consistency: Migrate to integration test

### Low Priority (Keep as Unit Tests)

These are pure function tests and should remain unit tests:

- [x] **bodyPartCache.test.ts** - Cache data structure (unit test)
- [x] **heapCache.test.ts** - Cache algorithms (unit test)
- [x] **objectCache.test.ts** - Cache logic (unit test)
- [x] **flowField.test.ts** - Pathfinding algorithm (unit test)
- [x] **roleCache.test.ts** - Cache implementation (unit test)
- [x] **roomFindCache.test.ts** - Cache implementation (unit test)

### Advanced Systems (May Need Specialized Tests)

These test complex systems that might need both unit and integration tests:

- [ ] **marketIntegration.test.ts** - Market system
- [ ] **labSystem.test.ts** - Lab reactions
- [ ] **powerCreepManager.test.ts** - Power creep management
- [ ] **squadCoordinator.test.ts** - Military coordination
- [ ] **nukeManager.test.ts** - Nuke system
- [ ] **portalManager.test.ts** - Inter-shard portals
- [ ] **crossShardTransfer.test.ts** - Cross-shard operations

## Migration Process

### Step 1: Analyze the Test

1. Open the unit test file
2. Identify what it's testing
3. Determine if it needs game state access

### Step 2: Create Integration Test

1. Create new file in `src/tests/`
2. Import screepsmod-testing: `import { describe, it, expect, Assert } from 'screepsmod-testing';`
3. Rewrite tests to use actual game objects

### Step 3: Remove Mocks

1. Remove all mock setup code
2. Remove mock imports
3. Access real game state directly

### Step 4: Update Assertions

1. Replace chai assertions with screepsmod-testing assertions
2. Add context-aware checks (handle different game states)
3. Add console logging for visibility

### Example Migration

**Before (Unit Test)**:
```typescript
import { expect } from 'chai';

describe('Spawn System', () => {
  let mockSpawn: any;
  
  beforeEach(() => {
    mockSpawn = {
      room: { energyAvailable: 300 },
      spawning: null
    };
    global.Game = { spawns: { spawn1: mockSpawn } };
  });
  
  it('should spawn harvester', () => {
    const result = spawnHarvester(mockSpawn);
    expect(result).to.equal(OK);
  });
});
```

**After (Integration Test)**:
```typescript
import { describe, it, expect, Assert } from 'screepsmod-testing';

describe('Spawn System', () => {
  it('should spawn harvesters when needed', () => {
    for (const name in Game.spawns) {
      const spawn = Game.spawns[name];
      
      if (spawn.room.energyAvailable >= 300 && !spawn.spawning) {
        const harvesters = spawn.room.find(FIND_MY_CREEPS, {
          filter: c => c.memory.role === 'harvester'
        });
        
        if (harvesters.length < 2) {
          console.log(`[Test] Room ${spawn.room.name} should spawn harvester`);
        }
      }
    }
  });
});
```

## Running Tests

### Unit Tests
```bash
cd packages/screeps-bot
npm run test:unit
```

### Integration Tests
```bash
cd packages/screeps-bot
npm run test:integration
```

### All Tests
```bash
cd packages/screeps-bot
npm test           # Runs unit tests
npm run test:integration  # Runs integration tests
```

## Test Structure

```
packages/screeps-bot/
├── test/unit/           # Traditional unit tests
│   ├── *.test.ts       # Pure function tests
│   └── mock.ts         # Mock utilities
├── src/tests/          # Integration tests
│   ├── loader.ts       # Test loader
│   └── *.test.ts       # Integration test suites
```

## Best Practices

### For Unit Tests

1. **Focus on Pure Logic**: Test algorithms, calculations, transformations
2. **Keep Mocks Minimal**: Only mock external dependencies
3. **Fast Execution**: Should run in milliseconds
4. **No Side Effects**: Tests should be isolated

### For Integration Tests

1. **Test Behavior**: Focus on what the bot does, not how
2. **Handle Game State**: Be resilient to different game stages
3. **Add Context**: Use console.log to show test context
4. **Check Conditions**: Use conditional logic for early game vs late game
5. **Validate Interactions**: Test how systems work together

### Writing Resilient Integration Tests

```typescript
it('should have energy storage in mature rooms', () => {
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    
    // Check conditions before asserting
    if (room.controller?.my && room.controller.level >= 4) {
      const storage = room.storage;
      
      // Early game might not have storage yet
      if (Game.time > 5000) {
        Assert.isNotNullish(storage, `Room ${roomName} at RCL ${room.controller.level} should have storage`);
      }
    }
  }
});
```

## Current Statistics

| Category | Count | Status |
|----------|-------|--------|
| Unit Tests (total) | 78 | Existing |
| Integration Tests | 6 suites | ✅ Complete |
| Integration Test Cases | 65+ | ✅ Complete |
| Tests Migrated | ~8 tests | ✅ Complete |
| Tests to Migrate | ~20 tests | 🔄 In Progress |
| Tests to Keep as Unit | ~50 tests | ✅ No Change |

## Next Steps

1. ✅ Create integration test infrastructure
2. ✅ Migrate core system tests
3. 🔄 Migrate high-priority behavior tests
4. 🔄 Review and update unit tests
5. 📝 Document test patterns and examples
6. 🔄 Add more specialized integration tests

## Resources

- [Integration Test Guide](./INTEGRATION_TEST_GUIDE.md)
- [screepsmod-testing README](../screepsmod-testing/README.md)
- [Testing Migration Overview](../../TESTING_MIGRATION.md)
