# Testing Guide

This guide covers testing strategies, best practices, and workflows for the Screeps bot infrastructure.

## Overview

The repository includes three levels of testing:

1. **Unit Tests** (packages/screeps-bot/test/unit/): Fast, isolated tests
2. **Integration Tests** (packages/screeps-server/test/integration/): Bot behavior in simulated environment
3. **Performance Tests** (packages/screeps-server/test/performance/): CPU and resource validation

## Running Tests

### Quick Start

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit           # Unit tests (fast)
npm run test:integration    # Integration tests (medium)
npm run test:performance    # Performance tests (slow)

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Server Tests

```bash
cd packages/screeps-server

# Integration tests
npm run test:integration

# Performance tests
npm run test:performance

# Framework package tests
npm run test:packages
```

## Test Structure

### Unit Tests

**Location**: `packages/screeps-bot/test/unit/`

**Purpose**: Test individual functions and classes in isolation

**Example**:
```typescript
import { expect } from 'chai';
import { calculateEnergyNeeds } from '@/economy/energy';

describe('Energy Calculator', () => {
  it('should calculate energy for upgraders', () => {
    const result = calculateEnergyNeeds('upgrader', 5);
    expect(result).to.equal(500);
  });
});
```

**Guidelines**:
- Test one thing per test
- Use mocks for external dependencies
- Keep tests fast (<10ms each)
- No network or I/O operations

### Integration Tests

**Location**: `packages/screeps-server/test/integration/`

**Purpose**: Test bot behavior in simulated Screeps environment

**Example**:
```typescript
import { assert } from 'chai';
import { helper } from '../helpers/server-helper.js';

describe('Bot Lifecycle', () => {
  it('should spawn and harvest energy', async function() {
    this.timeout(30000);
    
    await helper.runTicks(50);
    
    const memory = await helper.getMemory();
    assert.exists(memory);
    
    const hasErrors = await helper.hasErrors();
    assert.isFalse(hasErrors);
  });
});
```

**Guidelines**:
- Use realistic scenarios
- Set appropriate timeouts (30-60s)
- Clean up in afterEach hooks
- Test end-to-end workflows

### Performance Tests

**Location**: `packages/screeps-server/test/performance/`

**Purpose**: Validate CPU budgets and performance targets from ROADMAP.md

**Example**:
```typescript
import { singleRoomEcoScenario } from '../fixtures/scenarios.js';

describe('CPU Budget', () => {
  it('should meet eco room target', async function() {
    this.timeout(60000);
    
    const scenario = singleRoomEcoScenario;
    const metrics = await helper.runTicks(scenario.ticks);
    
    const avgCpu = helper.getAverageCpu();
    assert.isBelow(avgCpu, 0.1, 'Eco room should use ≤0.1 CPU');
  });
});
```

**Guidelines**:
- Align with ROADMAP targets
- Collect comprehensive metrics
- Test realistic scenarios
- Allow warmup period
- Monitor trends over time

## Performance Targets

From ROADMAP.md Section 2:

| Scenario | Target | Measurement |
|----------|--------|-------------|
| Eco Room | ≤0.1 CPU/tick | Average over 100 ticks |
| Combat Room | ≤0.25 CPU/tick | Average over 100 ticks |
| Global Kernel | ≤1 CPU/20-50 ticks | Periodic measurement |
| Bucket | ≥9500 | Average level |
| Memory Parse | ≤0.02 CPU | Per tick |

## Test Scenarios

Predefined scenarios in `packages/screeps-server/test/fixtures/scenarios.ts`:

### Empty Room
- Fresh spawn, no structures
- Tests initialization
- Target: ≤0.05 CPU avg

### Single Eco Room
- RCL 4, basic economy
- Tests harvesting, upgrading, building
- Target: ≤0.1 CPU avg

### Five Room Empire
- Multi-room coordination
- Tests scaling
- Target: ≤0.5 CPU total

### Combat
- Active defense against hostiles
- Tests military systems
- Target: ≤0.25 CPU avg

## CI/CD Integration

### Automated Testing

Tests run automatically on:
- Pull requests
- Pushes to main/develop
- Manual workflow dispatch

### Workflow Steps

1. Build all packages
2. Run server integration tests
3. Run server performance tests
4. Run framework package tests
5. Run bot performance tests
6. Compare against baseline
7. Generate reports
8. Comment on PR

### Performance Regression

Tests fail if:
- Average CPU increases >10%
- Max CPU exceeds target
- Bucket drains below threshold
- Memory parsing exceeds limit

### Baseline Updates

Baselines are updated automatically:
- On successful main branch merges
- Stored in `performance-baselines/`
- Historical data in `performance-baselines/history/`

## Writing New Tests

### 1. Choose Test Type

- **Unit**: Pure function, no side effects
- **Integration**: Bot behavior, multiple components
- **Performance**: CPU/memory validation

### 2. Create Test File

```typescript
// packages/screeps-server/test/integration/my-feature.test.ts

import { assert } from 'chai';
import { helper } from '../helpers/server-helper.js';

describe('My Feature', () => {
  it('should do something', async function() {
    this.timeout(30000);
    
    // Setup
    await helper.runTicks(10);
    
    // Exercise
    const result = await helper.executeConsole('MyFeature.test()');
    
    // Verify
    assert.exists(result);
  });
});
```

### 3. Add to Test Suite

Tests are auto-discovered by Mocha based on `*.test.ts` pattern.

### 4. Document

Add to test README or inline comments:
- What is being tested
- Why it matters
- Expected behavior
- Performance targets

## Debugging Tests

### Failed Tests

```bash
# Run single test file
npx mocha test/integration/basic.test.ts

# Run specific test
npx mocha test/integration/basic.test.ts --grep "should spawn creeps"

# Enable debug output
DEBUG=* npm run test:integration
```

### Performance Issues

```bash
# Collect detailed metrics
npm run test:performance -- --reporter json > results.json

# Analyze results
node scripts/analyze-tests.js
```

### Server Issues

```bash
# Check server logs
cat packages/screeps-bot/logs/server.log

# Check console output
cat packages/screeps-bot/logs/console.log
```

## Best Practices

### General

1. **Isolated**: Tests should not depend on each other
2. **Reproducible**: Same result every run
3. **Fast**: Keep unit tests <10ms, integration <30s
4. **Clear**: Descriptive names and assertions
5. **Maintainable**: DRY, use helpers and fixtures

### Performance Testing

1. **Warmup**: Run 10-20 ticks before measuring
2. **Sample Size**: Collect 100+ ticks for averages
3. **Variance**: Check consistency (low std dev)
4. **Trends**: Monitor over time, not just absolutes
5. **Context**: Document test environment

### Assertions

```typescript
// Good: Specific with context
assert.isBelow(avgCpu, 0.1, 
  `Eco room CPU ${avgCpu.toFixed(3)} exceeds target 0.1`);

// Bad: Generic without context
assert.isTrue(avgCpu < 0.1);
```

### Timeouts

```typescript
// Set appropriate timeout
it('long running test', async function() {
  this.timeout(60000); // 60 seconds
  // ...
});

// Or configure globally in .mocharc.json
{
  "timeout": 30000
}
```

## Troubleshooting

### Tests Hang

- Check for missing `await` on async operations
- Increase timeout
- Verify server cleanup in afterEach

### Inconsistent Results

- Check for race conditions
- Ensure proper cleanup
- Use fixed seeds for randomness
- Check for external dependencies

### High CPU in Tests

- Verify test environment matches production
- Check for debug code left enabled
- Profile hot paths
- Review caching strategies

### Memory Issues

- Check for memory leaks in server
- Verify cleanup between tests
- Monitor heap usage
- Use memory profiling tools

## Contributing

When adding new features:

1. Write tests first (TDD)
2. Ensure existing tests pass
3. Add integration test for new behavior
4. Add performance test if CPU-critical
5. Update documentation
6. Verify CI passes

## Resources

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertions](https://www.chaijs.com/api/)
- [screeps-server-mockup](https://github.com/Hiryus/screeps-server-mockup)
- [ROADMAP.md](../ROADMAP.md)
- [Performance Baselines](../performance-baselines/README.md)
