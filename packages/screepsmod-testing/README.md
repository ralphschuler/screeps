# screepsmod-testing

A modular testing framework for Screeps that runs tests directly inside the game server, providing full access to game state for comprehensive integration testing.

## Why screepsmod-testing?

Traditional unit tests for Screeps bots have limitations:
- They require mocking the entire game API
- They can't test actual game behavior and interactions
- They don't reflect real-world performance characteristics
- They can't access actual game state or validate bot behavior in a live environment

screepsmod-testing solves these problems by running tests **inside** the Screeps performance server as a mod, giving you:

✅ Full access to actual game state (Game, Memory, etc.)  
✅ Real game environment testing without mocks  
✅ Continuous integration testing during bot execution  
✅ Performance testing with actual CPU measurements  
✅ Easy migration from unit tests to integration tests  

## Features

- **In-Game Testing**: Tests run directly in the Screeps server with full game API access
- **Familiar API**: Similar to Mocha/Jest with `describe`, `it`, `beforeEach`, etc.
- **Rich Assertions**: Comprehensive assertion library with `expect` and `Assert` APIs
- **Async Support**: Full support for async/await in tests
- **Lifecycle Hooks**: beforeEach, afterEach, beforeAll, afterAll
- **Test Discovery**: Automatic test registration and execution
- **Detailed Reporting**: Console output with test results and timing
- **Modular Design**: Easy to add new tests without modifying core code

## Installation

### 1. Add to your screeps performance server

In your `config.yml` for the screeps performance server:

```yaml
mods:
  - screepsmod-auth
  - screepsmod-admin-utils
  - screepsmod-testing  # Add this line

# Optional: Configure test behavior
screepsmod:
  testing:
    autoRun: true        # Automatically run tests (default: true)
    testInterval: 0      # Run every N ticks (0 = run once, default: 0)
```

### 2. Install the package

```bash
cd packages/screepsmod-testing
npm install
npm run build
```

## Usage

### Writing Tests

Create test files in your bot code or a separate tests directory:

```typescript
// tests/spawn.test.ts
import { describe, it, expect, Assert } from 'screepsmod-testing';

describe('Spawn System', () => {
  it('should have spawns in controlled rooms', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my) {
        const spawns = room.find(FIND_MY_SPAWNS);
        expect(spawns.length).toBeGreaterThan(0);
      }
    }
  });

  it('should assign roles to spawned creeps', () => {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      Assert.isNotNullish(creep.memory.role);
    }
  });
});
```

### Basic Assertions

```typescript
import { expect, Assert } from 'screepsmod-testing';

// Using expect API (Jest-style)
expect(value).toBe(42);
expect(value).toEqual({ a: 1, b: 2 });
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(array).toContain(item);
expect(obj).toHaveProperty('key');
expect(value).toBeGreaterThan(10);
expect(value).toBeLessThan(100);

// Using Assert API (explicit)
Assert.equal(actual, expected);
Assert.deepEqual(obj1, obj2);
Assert.isTrue(condition);
Assert.isFalse(condition);
Assert.isNullish(value);
Assert.isNotNullish(value);
Assert.isType(value, 'string');
Assert.includes(array, item);
Assert.greaterThan(actual, expected);
Assert.lessThan(actual, expected);
Assert.inRange(value, min, max);
Assert.throws(() => { throw new Error(); });
Assert.hasProperty(obj, 'key');
```

### Lifecycle Hooks

```typescript
describe('My Test Suite', () => {
  let testData: any;

  beforeAll(() => {
    // Run once before all tests in this suite
    console.log('Setting up test suite');
  });

  beforeEach(() => {
    // Run before each test
    testData = { value: 0 };
  });

  afterEach(() => {
    // Run after each test
    testData = null;
  });

  afterAll(() => {
    // Run once after all tests in this suite
    console.log('Tearing down test suite');
  });

  it('test 1', () => {
    expect(testData.value).toBe(0);
  });

  it('test 2', () => {
    testData.value = 42;
    expect(testData.value).toBe(42);
  });
});
```

### Async Tests

```typescript
describe('Async Operations', () => {
  it('should handle async code', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });

  it('should handle delays', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(true).toBeTruthy();
  });
});
```

### Skipping Tests

```typescript
import { describe, it, xit } from 'screepsmod-testing';

describe('My Suite', () => {
  it('this test runs', () => {
    expect(true).toBeTruthy();
  });

  xit('this test is skipped', () => {
    // This won't run
    expect(false).toBeTruthy();
  });
});
```

## Integration Testing Examples

### Testing Room Economy

```typescript
describe('Room Economy', () => {
  it('should maintain energy reserves', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my && room.storage) {
        const energy = room.storage.store[RESOURCE_ENERGY];
        Assert.greaterThan(energy, 10000, 
          `Room ${roomName} should have minimum energy reserves`);
      }
    }
  });
});
```

### Testing Creep Behavior

```typescript
describe('Creep Management', () => {
  it('should assign roles to all creeps', () => {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      Assert.isNotNullish(creep.memory.role,
        `Creep ${name} should have a role`);
    }
  });
});
```

### Testing Defense System

```typescript
describe('Defense', () => {
  it('should respond to hostiles', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my) {
        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
          const towers = room.find(FIND_MY_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_TOWER
          });
          Assert.isTrue(towers.length > 0 || room.controller.safeMode > 0,
            `Room ${roomName} should defend against hostiles`);
        }
      }
    }
  });
});
```

### Testing CPU Performance

```typescript
describe('Performance', () => {
  it('should stay within CPU budget', () => {
    const used = Game.cpu.getUsed();
    const limit = Game.cpu.limit;
    Assert.lessThan(used, limit,
      `CPU usage should be below limit`);
  });

  it('should maintain healthy bucket', () => {
    Assert.greaterThan(Game.cpu.bucket, 1000,
      'CPU bucket should stay healthy');
  });
});
```

## Console Commands

When the mod is loaded, you can use console commands to control tests:

```javascript
// List all registered tests
listTests()

// Run all tests manually
runTests()

// Get test summary
getTestSummary()

// Clear test results
clearTests()
```

## Configuration

Configure the mod in your `config.yml`:

```yaml
screepsmod:
  testing:
    # Auto-run tests when server starts
    autoRun: true
    
    # Run tests every N ticks (0 = run once only)
    testInterval: 0
    
    # Future options:
    # testPattern: "**/*.test.ts"
    # outputFormat: "console" | "json"
    # exitOnFailure: false
```

## Migrating from Unit Tests

To migrate existing unit tests to integration tests:

1. **Remove mocks**: Delete Game, Memory, and other API mocks
2. **Use real game objects**: Access `Game.rooms`, `Game.creeps`, etc. directly
3. **Test actual behavior**: Validate real game state instead of mocked returns
4. **Register tests**: Import/require your test files so they register with the framework

Example migration:

**Before (Unit Test with Mocks)**:
```typescript
const mockRoom = { controller: { my: true } };
const mockGame = { rooms: { W1N1: mockRoom } };
// ... test with mocks
```

**After (Integration Test)**:
```typescript
describe('Room Management', () => {
  it('should control rooms', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my) {
        // Test actual game state
        expect(room.controller.level).toBeGreaterThan(0);
      }
    }
  });
});
```

## Benefits Over Unit Tests

| Aspect | Unit Tests | Integration Tests (screepsmod-testing) |
|--------|-----------|----------------------------------------|
| Game API | Mocked | Real |
| Game State | Simulated | Actual |
| Interactions | Isolated | Full system |
| Performance | N/A | Real CPU metrics |
| Setup Complexity | High (lots of mocking) | Low (no mocks needed) |
| Test Confidence | Medium | High |
| Maintenance | High (mocks break) | Low (uses real API) |

## Architecture

The mod consists of several components:

- **Test Runner**: Executes tests and collects results
- **Assertion Library**: Provides expect() and Assert APIs
- **Backend Hook**: Integrates with Screeps server lifecycle
- **Test Registry**: Manages test suites and cases

Tests run during the game tick and have full access to:
- `Game` object and all game entities
- `Memory`, `RawMemory`, `InterShardMemory`
- Current tick number
- All game APIs and constants

## Roadmap

- [ ] Test result persistence across server restarts
- [ ] JSON output format for CI/CD integration
- [ ] Test coverage reporting
- [ ] Performance benchmarking helpers
- [ ] Test filtering by pattern/tag
- [ ] Parallel test execution
- [ ] Screenshot/visual testing helpers

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

Unlicense - see [LICENSE](../../LICENSE) for details.

## Related

- [screeps-performance-server](https://github.com/screepers/ScreepsPerformanceServer)
- [Screeps API Documentation](https://docs.screeps.com/)
