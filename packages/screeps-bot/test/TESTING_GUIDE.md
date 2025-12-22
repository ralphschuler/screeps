# Testing Guide

## Quick Start

### Running Tests

```bash
# From repository root
npm run test

# From packages/screeps-bot
npm test

# Run specific test file
npm test -- test/unit/pathCache.test.ts
```

### Test Status

- **Total Test Files**: 113
- **Passing Tests**: 1,727
- **Known Failing**: 146 (pre-existing bugs, not test infrastructure issues)
- **Test Framework**: Mocha + Chai + Sinon

## Test Infrastructure

### Fixed Issues (December 2025)

The test infrastructure was recently fixed to resolve ESM module export issues:

**Problem**: Tests failed with "does not provide an export named X" errors when importing from cache module.

**Solution**: Changed interface/type exports to use `export type` syntax:
```typescript
// Before (incorrect)
export { CacheEntry, CacheOptions } from "./CacheEntry";

// After (correct)
export type { CacheEntry, CacheOptions } from "./CacheEntry";
```

This allows TypeScript interfaces to be imported for type checking without causing runtime errors in the test environment.

### Mock Setup

Tests use a comprehensive mock environment defined in `test/setup-mocha.cjs`:

- **Game Object**: Mocked with rooms, creeps, spawns, CPU, market, etc.
- **Memory Object**: Global memory structure
- **Screeps Constants**: All game constants (STRUCTURE_*, FIND_*, RESOURCE_*, etc.)
- **Classes**: RoomPosition, PathFinder, Creep with basic implementations
- **Utilities**: Minimal lodash-like utilities (shallow clone)

### Test Structure

```
test/
├── unit/              # 112 unit test files
│   ├── Core Systems
│   ├── Combat & Defense
│   ├── Economy & Resources
│   ├── Pathfinding & Movement
│   ├── Empire & Expansion
│   ├── Resource Management
│   ├── Layouts & Planning
│   ├── Advanced Features
│   ├── Performance & Monitoring
│   └── Standards & Protocols
├── integration/       # 1 integration test file
├── setup-mocha.cjs   # Global test setup and mocks
├── mocha.opts        # Mocha configuration (legacy)
├── .mocharc.json     # Mocha configuration (current)
└── types.d.ts        # Test-specific type definitions
```

## Writing Tests

### Basic Test Pattern

```typescript
import { expect } from "chai";
import { functionToTest } from "../../src/module";

describe("Module Name", () => {
  beforeEach(() => {
    // Reset state before each test
    global.Game = {
      rooms: {},
      creeps: {},
      time: 1000
    };
  });

  it("should do something", () => {
    // Arrange
    const input = { value: 42 };
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).to.equal(42);
  });
});
```

### Mocking Game Objects

```typescript
import sinon from "sinon";

it("should find creeps in room", () => {
  const mockRoom = {
    name: "W1N1",
    find: sinon.stub().returns([
      { name: "harvester1", memory: { role: "harvester" } }
    ])
  };
  
  global.Game.rooms = { "W1N1": mockRoom };
  
  // Test code using mockRoom
  // ...
  
  expect(mockRoom.find).to.have.been.calledOnce;
});
```

### Testing with Stubs

```typescript
import sinon from "sinon";

describe("Tower Logic", () => {
  let attackStub: sinon.SinonStub;
  
  beforeEach(() => {
    attackStub = sinon.stub().returns(OK);
  });
  
  it("should attack closest hostile", () => {
    const tower = {
      pos: new RoomPosition(25, 25, "W1N1"),
      attack: attackStub
    };
    
    // Test tower logic
    // ...
    
    expect(attackStub).to.have.been.calledOnce;
  });
});
```

## Test Coverage by System

See [TEST_COVERAGE.md](./TEST_COVERAGE.md) for detailed breakdown of all 113 test files organized by system.

## Known Issues

### Failing Tests (146 total)

The following categories of tests have known failures:

1. **Compression Tests** (multiple files)
   - Issue: `LZString.compressToUTF16 is not a function`
   - Cause: Missing or incorrectly imported lz-string library
   - Impact: SS1SegmentManager compression tests

2. **Protocol Tests** (ProtocolRegistry)
   - Issue: Default protocol initialization tests
   - Impact: 2 tests in protocol system

3. **Spawn Tests** (workforceCollapseRecovery, spawnQueue)
   - Issue: Emergency spawn logic edge cases
   - Impact: Various spawning scenarios

4. **Blueprint Tests**
   - Issue: JSON parsing in import/export
   - Impact: Blueprint serialization tests

These are **pre-existing bugs** in the codebase, not issues with the test infrastructure. They represent actual bugs that should be fixed in the production code.

## CI Integration

Tests run automatically on:
- Every pull request (via `.github/workflows/test.yml`)
- Manual workflow dispatch

The CI workflow:
1. Checks out code
2. Sets up Node.js (version from `.nvmrc`)
3. Installs dependencies for screeps-chemistry package
4. Builds screeps-chemistry package
5. Installs bot dependencies
6. Runs `npm test`

## Future Enhancements

### Coverage Reporting

Currently, code coverage metrics are not collected. To add coverage reporting:

1. **Install coverage tool**:
   ```bash
   npm install --save-dev c8
   ```

2. **Add coverage script** to `package.json`:
   ```json
   {
     "scripts": {
       "test:coverage": "c8 npm test",
       "test:coverage:report": "c8 report --reporter=html"
     }
   }
   ```

3. **Update CI workflow** to generate and upload coverage reports

4. **Add coverage badge** to README.md

### Additional Test Types

- **Integration Tests**: More comprehensive multi-system integration tests
- **Performance Tests**: Regression testing for CPU/memory usage
- **Property-Based Tests**: Use fast-check for property-based testing
- **Visual Regression**: Screenshot comparison for visualization code

### Test Improvements

- **Parallel Execution**: Run tests in parallel for faster CI
- **Test Data Builders**: Create builder pattern for complex test fixtures
- **Shared Utilities**: Extract common test utilities to separate module
- **Coverage Thresholds**: Enforce minimum coverage percentages

## Debugging Tests

### Running Single Test

```bash
npm test -- test/unit/pathCache.test.ts
```

### Running Tests Matching Pattern

```bash
npm test -- --grep "pathfinding"
```

### Verbose Output

```bash
npm test -- --reporter spec
```

### Debug Mode

```bash
node --inspect-brk node_modules/.bin/mocha test/unit/pathCache.test.ts
```

Then attach a debugger (Chrome DevTools, VS Code, etc.)

## Best Practices

1. **Keep Tests Isolated**: Each test should be independent
2. **Use beforeEach/afterEach**: Reset state between tests
3. **Descriptive Test Names**: Use "should" format for clarity
4. **Test Edge Cases**: Don't just test happy paths
5. **Mock External Dependencies**: Use stubs for Game objects
6. **Keep Tests Fast**: Avoid delays and complex setup
7. **One Assertion Per Test**: Makes failures easier to diagnose
8. **Use Type Safety**: Import types for better IDE support

## Resources

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Sinon Stubs and Mocks](https://sinonjs.org/)
- [Screeps API Documentation](https://docs.screeps.com/)
- [TypeScript Testing Guide](https://www.typescriptlang.org/docs/handbook/testing.html)
