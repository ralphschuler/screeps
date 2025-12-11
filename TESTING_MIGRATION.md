# Testing Migration: screepsmod-testing

## Overview

We've created a new modular testing framework called `screepsmod-testing` that runs tests **inside** the Screeps game server, providing full access to actual game state for comprehensive integration testing.

## Why This Change?

Traditional unit tests for Screeps bots have several limitations:

❌ **Extensive Mocking Required**: Need to mock Game, Memory, and all API objects  
❌ **Brittle Tests**: Mocks break when Screeps API changes  
❌ **Limited Coverage**: Can't test actual game behavior and system interactions  
❌ **No Real Performance Data**: Can't measure actual CPU usage and bucket impact  

screepsmod-testing solves these problems:

✅ **Real Game State**: Tests run inside the server with full access to Game, Memory, etc.  
✅ **No Mocking Needed**: Use actual Screeps API without any mocks  
✅ **True Integration Testing**: Validate how systems work together in real game conditions  
✅ **Performance Testing**: Measure actual CPU usage and game behavior  
✅ **Continuous Testing**: Tests run during bot execution for ongoing validation  

## What's Included

### New Package: `/packages/screepsmod-testing`

A complete testing framework that integrates with Screeps performance server and private servers.

**Core Features:**
- Test registration with `describe()` and `it()` (familiar Mocha/Jest-style API)
- Rich assertion library with `expect()` and `Assert` APIs
- Lifecycle hooks: `beforeEach`, `afterEach`, `beforeAll`, `afterAll`
- Async/await support for async tests
- Automatic test discovery and execution
- Console reporting with timing and status
- Console commands for manual test control

**Documentation:**
- `README.md` - Complete API documentation and usage guide
- `QUICK_START.md` - 5-minute guide to get started
- `MIGRATION_GUIDE.md` - Detailed guide for migrating from unit tests

**Examples:**
- `examples/basic-tests.ts` - Basic assertion examples
- `examples/bot-integration-tests.ts` - Real-world bot testing patterns
- `tests/example-integration.test.ts` - Example test suite ready to use

## Integration with Existing Setup

The mod has been integrated into both testing configurations:

### Performance Testing (`packages/screeps-bot/config.yml`)
```yaml
mods:
  - ../screepsmod-testing

screepsmod:
  testing:
    autoRun: true
    testInterval: 0
```

### Private Server (`packages/screeps-server/config.yml`)
```yaml
mods:
  - ../screepsmod-testing

screepsmod:
  testing:
    autoRun: true
    testInterval: 0
```

### Root Package Scripts
Updated to include mod building:
- `npm run build:mod` - Build the testing mod
- `npm run build:all` - Build everything including the mod
- `npm run install:all` - Install all dependencies including mod

## Getting Started

### 1. Build the Mod
```bash
cd packages/screepsmod-testing
npm install
npm run build
```

### 2. Write Tests
Create test files in your bot code:

```typescript
import { describe, it, expect } from 'screepsmod-testing';

describe('My Bot Tests', () => {
  it('should manage rooms effectively', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my) {
        expect(room.controller.level).toBeGreaterThan(0);
      }
    }
  });
});
```

### 3. Import Tests
In your bot's main file or initialization:

```typescript
// Import test files (conditional for test environments)
if (Game.shard.name === 'shard0') {
  require('./tests/my-tests');
}
```

### 4. Run Server
```bash
cd packages/screeps-bot
npm run test:performance
```

Tests will run automatically and output results to the console.

## Example Test Patterns

### Testing Spawn Logic
```typescript
describe('Spawn System', () => {
  it('should have spawns in controlled rooms', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my && room.controller.level >= 1) {
        const spawns = room.find(FIND_MY_SPAWNS);
        expect(spawns.length).toBeGreaterThan(0);
      }
    }
  });
});
```

### Testing Economy
```typescript
describe('Economy', () => {
  it('should maintain energy reserves', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my && room.storage) {
        expect(room.storage.store[RESOURCE_ENERGY])
          .toBeGreaterThan(10000);
      }
    }
  });
});
```

### Testing Defense
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
          expect(towers.length > 0 || room.controller.safeMode > 0)
            .toBeTruthy();
        }
      }
    }
  });
});
```

## Migration Path

### For Existing Unit Tests

1. **Keep Pure Function Tests**: Unit tests for utility functions, calculations, etc. can remain as unit tests
2. **Migrate Integration Tests**: Tests that validate game behavior should move to screepsmod-testing
3. **Remove Mocks**: Delete all Game/Memory/API mocks - use real game objects instead
4. **Test Real Behavior**: Focus on actual outcomes rather than implementation details

See `packages/screepsmod-testing/MIGRATION_GUIDE.md` for detailed migration instructions with examples.

### Incremental Approach

You don't need to migrate everything at once:
- Continue using unit tests for pure functions
- Add new integration tests to screepsmod-testing
- Gradually migrate existing integration tests as time permits
- Both approaches can coexist

## Console Commands

When the server is running, you can use these console commands:

```javascript
listTests()        // List all registered tests
runTests()         // Run all tests manually
getTestSummary()   // Get test results summary
clearTests()       // Clear test results
```

## Configuration Options

In `config.yml`:

```yaml
screepsmod:
  testing:
    autoRun: true      # Automatically run tests when server starts
    testInterval: 0    # How often to run tests (0 = once, N = every N ticks)
```

## Benefits

### Better Test Quality
- Tests validate actual game behavior, not mocked behavior
- Catches issues that unit tests can't detect
- Tests system interactions and emergent behavior

### Reduced Maintenance
- No mocks to update when Screeps API changes
- Tests are more stable and reliable
- Less code to maintain

### Real Performance Data
- Measure actual CPU usage in tests
- Validate bucket management
- Test under real game conditions

### Continuous Validation
- Tests can run continuously during bot operation
- Catch regressions immediately
- Validate behavior at different game stages

## Alignment with Roadmap

This implementation follows the ROADMAP.md principles:

✅ **Modular Design**: Testing framework is a separate, independent package  
✅ **Resource Efficient**: Tests access game state directly without overhead  
✅ **Decentralized**: Tests can be distributed across packages  
✅ **Event-Driven**: Tests run on tick events without blocking game loop  
✅ **Performance Focused**: Minimal CPU impact, configurable execution  

## Future Enhancements

Potential improvements for the future:
- [ ] Test result persistence across server restarts
- [ ] JSON export for CI/CD integration
- [ ] Test coverage reporting
- [ ] Performance benchmarking utilities
- [ ] Test filtering by pattern/tag
- [ ] Parallel test execution
- [ ] Screenshot/visual testing helpers
- [ ] Integration with GitHub Actions for automated reporting

## Documentation

Complete documentation is available in the package:

- **README.md** - Full API documentation and usage guide
- **QUICK_START.md** - Get started in 5 minutes
- **MIGRATION_GUIDE.md** - Migrate from unit tests with examples
- **examples/** - Example test files demonstrating common patterns

## Questions?

- Check the package documentation in `/packages/screepsmod-testing/`
- Review the example tests in `/packages/screepsmod-testing/examples/`
- See the migration guide for patterns and best practices
- Open an issue if you encounter problems

---

**Note**: This testing framework complements existing unit tests and doesn't replace them. Unit tests are still valuable for pure functions and logic. screepsmod-testing focuses on integration testing where access to actual game state is valuable.
