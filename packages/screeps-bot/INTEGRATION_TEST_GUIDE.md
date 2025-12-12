# Integration Test Guide

This guide explains how to use the screepsmod-testing integration tests in this bot.

## Overview

The bot now has two types of tests:

1. **Unit Tests** (`test/unit/`): Traditional unit tests for pure functions and isolated logic
2. **Integration Tests** (`src/tests/`): Tests that run inside the Screeps server with full game state access

## Running Integration Tests

### Performance Server with Tests

```bash
cd packages/screeps-bot
npm run test:performance
```

This will:
1. Start the screeps-performance-server
2. Load the bot code
3. Automatically run integration tests (configured in `config.yml`)
4. Display test results in the console

### Console Commands

When the server is running, you can use these commands in the Screeps console:

```javascript
listTests()        // List all registered tests
runTests()         // Run all tests manually
getTestSummary()   // Get test results summary
clearTests()       // Clear test results
```

## Test Structure

### Integration Test Location

All integration tests are in `src/tests/`:

```
src/tests/
├── loader.ts                      # Test loader (registers all tests)
├── basic-game-state.test.ts       # Game state and API validation
├── spawn-system.test.ts           # Spawn management tests
├── creep-management.test.ts       # Creep lifecycle tests
├── swarm-kernel.test.ts           # Kernel process management tests
└── pheromone-system.test.ts       # Pheromone coordination tests
```

### Test Loading

Tests are loaded automatically when the bot starts via `src/main.ts`:

```typescript
import { loadIntegrationTests } from "./tests/loader";
loadIntegrationTests();
```

The loader checks if `screepsmod-testing` is available and only loads tests in the performance testing environment.

## Writing Integration Tests

### Basic Test Structure

```typescript
import { describe, it, expect, Assert } from 'screepsmod-testing';

describe('My Feature', () => {
  it('should do something', () => {
    // Access real game state
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      // Test with actual game objects
      Assert.isNotNullish(room.controller);
    }
  });
});
```

### Best Practices

1. **Use Real Game State**: Access `Game`, `Memory`, and actual game objects
2. **Handle Different Game States**: Your tests might run at different points in the game (early, mid, late)
3. **Be Resilient**: Don't assume specific game state exists
4. **Log for Visibility**: Use `console.log` to provide insight into test execution
5. **Test Behavior, Not Implementation**: Focus on what the bot should do, not how it does it

### Example Patterns

#### Testing Room State

```typescript
it('should manage controlled rooms', () => {
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (room.controller?.my) {
      // Test actual room behavior
      expect(room.controller.level).toBeGreaterThan(0);
    }
  }
});
```

#### Testing Creep Behavior

```typescript
it('should assign roles to creeps', () => {
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    Assert.isNotNullish(creep.memory.role);
  }
});
```

#### Testing Memory Consistency

```typescript
it('should maintain consistent memory', () => {
  for (const name in Game.creeps) {
    Assert.isNotNullish(Memory.creeps[name]);
  }
});
```

## Migration Strategy

### What to Migrate

**✅ Migrate these to integration tests:**

- Tests that validate game state
- Tests that check creep/spawn behavior
- Tests that validate memory consistency
- Tests that check room management
- Tests that verify system interactions

**❌ Keep these as unit tests:**

- Pure function tests (calculations, utilities)
- Data transformation tests
- Algorithm tests (pathfinding, optimization)
- Type validation tests
- Helper function tests

### Example Migration

**Before (Unit Test with Mocks):**

```typescript
// test/unit/spawn.test.ts
import { expect } from 'chai';

describe('Spawn System', () => {
  it('should spawn harvesters', () => {
    const mockSpawn = { /* ... */ };
    const mockRoom = { /* ... */ };
    global.Game = { spawns: { spawn1: mockSpawn } };
    
    // Test with mocks
    const result = spawnHarvester(mockSpawn);
    expect(result).to.equal(OK);
  });
});
```

**After (Integration Test):**

```typescript
// src/tests/spawn-system.test.ts
import { describe, it, expect, Assert } from 'screepsmod-testing';

describe('Spawn System', () => {
  it('should spawn harvesters when needed', () => {
    for (const name in Game.spawns) {
      const spawn = Game.spawns[name];
      const harvesters = spawn.room.find(FIND_MY_CREEPS, {
        filter: c => c.memory.role === 'harvester'
      });
      
      // Test actual game behavior
      if (spawn.room.energyAvailable > 300 && harvesters.length < 2) {
        console.log(`[Test] Room ${spawn.room.name} should spawn harvester`);
      }
    }
  });
});
```

## Adding New Tests

1. Create a new test file in `src/tests/`:

```bash
touch src/tests/my-feature.test.ts
```

2. Write your test:

```typescript
import { describe, it, expect, Assert } from 'screepsmod-testing';

describe('My Feature', () => {
  it('should work correctly', () => {
    // Your test code
  });
});

console.log('[Tests] My feature tests registered');
```

3. Add to the loader in `src/tests/loader.ts`:

```typescript
require('./my-feature.test');
```

4. Build and run:

```bash
npm run build
npm run test:performance
```

## Test Configuration

Tests are configured in `config.yml`:

```yaml
screepsmod:
  testing:
    autoRun: true      # Run tests automatically on server start
    testInterval: 0    # How often to run tests (0 = once, N = every N ticks)
```

### Configuration Options

- `autoRun: true` - Tests run automatically when the server starts
- `autoRun: false` - Tests must be run manually with `runTests()`
- `testInterval: 0` - Tests run once on startup
- `testInterval: 100` - Tests run every 100 ticks

## Current Test Coverage

| Test File | Purpose | Tests |
|-----------|---------|-------|
| `basic-game-state.test.ts` | Validates fundamental game API access | 12 |
| `spawn-system.test.ts` | Tests spawn management and room control | 10 |
| `creep-management.test.ts` | Validates creep lifecycle and behavior | 17 |
| `swarm-kernel.test.ts` | Tests kernel process management | 6 |
| `pheromone-system.test.ts` | Validates pheromone coordination | 5 |

**Total: 50+ integration tests**

## Unit Tests Status

The existing unit tests in `test/unit/` (78 files) serve different purposes:

- **Pure Function Tests**: These should remain as unit tests
- **Integration Tests**: These should be migrated to `src/tests/`

### Migration Priority

High priority (migrate first):
- [x] main.test.ts → basic-game-state.test.ts
- [x] swarmBot.test.ts → swarm-kernel.test.ts  
- [x] pheromone.test.ts → pheromone-system.test.ts
- [ ] stats.test.ts → stats-system.test.ts
- [ ] hauler.test.ts → hauler-behavior.test.ts

Medium priority:
- [ ] larvaWorker.test.ts
- [ ] guardBehavior.test.ts
- [ ] remoteRoomManager.test.ts
- [ ] defenseCoordinator.test.ts

Low priority (keep as unit tests):
- bodyPartCache.test.ts (pure function tests)
- heapCache.test.ts (pure function tests)
- flowField.test.ts (algorithm tests)
- objectCache.test.ts (pure function tests)

## Troubleshooting

### Tests not running

1. Check that screepsmod-testing is built:
```bash
cd packages/screepsmod-testing
npm install
npm run build
```

2. Verify config.yml has the mod listed:
```yaml
mods:
  - ../screepsmod-testing
```

3. Check console output for test loading messages:
```
[Tests] Loading integration tests...
[Tests] Basic game state tests registered
[Tests] Integration tests loaded successfully
```

### Tests failing

1. Remember tests run against actual game state
2. Early game might not have all structures/creeps
3. Use conditional checks for game state
4. Add logging to understand test context

### Build errors

1. Make sure TypeScript recognizes screepsmod-testing types
2. The types are defined in `screepsmod-testing/src/globals.d.ts`
3. Import types explicitly: `import { describe, it, expect } from 'screepsmod-testing';`

## Resources

- [screepsmod-testing README](../screepsmod-testing/README.md)
- [screepsmod-testing Quick Start](../screepsmod-testing/QUICK_START.md)
- [Migration Guide](../screepsmod-testing/MIGRATION_GUIDE.md)
- [TESTING_MIGRATION.md](../../TESTING_MIGRATION.md)

## Contributing

When adding new features:

1. Write integration tests in `src/tests/`
2. Add tests to the loader
3. Verify tests pass in performance server
4. Update this guide if needed
