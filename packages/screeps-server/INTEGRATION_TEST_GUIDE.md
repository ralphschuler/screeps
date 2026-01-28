# Integration Tests Guide

This guide explains how to work with the integration test infrastructure for automated bot validation in CI/CD.

## Overview

The integration test system validates bot functionality and performance using `screepsmod-testing` in a simulated Screeps environment. Tests run automatically on every PR and push to main/develop branches.

## Test Architecture

```
┌─────────────────────────────────────────────┐
│        GitHub Actions Workflow              │
│     (.github/workflows/integration-tests)   │
├─────────────────────────────────────────────┤
│  1. Build bot code                          │
│  2. Run integration tests                   │
│  3. Collect metrics                         │
│  4. Check for regressions                   │
│  5. Report results                          │
│  6. Update baselines (on main)              │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│        Test Scenarios                       │
│   (packages/screeps-server/test/integration)│
├─────────────────────────────────────────────┤
│  • startup.test.ts - Initialization         │
│  • economy.test.ts - Single room economy    │
│  • scaling.test.ts - Multi-room scaling     │
│  • defense.test.ts - Defense response       │
│  • expansion.test.ts - Room expansion       │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│     Performance Baselines                   │
│   (performance-baselines/integration/)      │
├─────────────────────────────────────────────┤
│  Stores historical performance data for     │
│  regression detection                       │
└─────────────────────────────────────────────┘
```

## Running Tests Locally

### Prerequisites

```bash
# Build all packages
npm run build

# Build screepsmod-testing
npm run build:mod
```

### Run Integration Tests

```bash
# Run all integration tests
cd packages/screeps-server
npm run test:integration

# Run specific test file
npm run test:integration -- test/integration/startup.test.ts

# Run with coverage
npm run test:coverage
```

## Test Scenarios

### 1. Startup Tests (`startup.test.ts`)

**Purpose**: Verify bot initializes correctly

**Tests**:
- Bot starts without errors
- Memory structures created
- Kernel processes initialized
- First creep spawns
- CPU stays within budget

**Typical Duration**: ~30 seconds

**Example**:
```typescript
it('should start bot without errors', async function() {
  this.timeout(15000);
  
  await helper.runTicks(10);
  
  const hasErrors = await helper.hasErrors();
  assert.isFalse(hasErrors, 'Bot should start without errors');
});
```

### 2. Economy Tests (`economy.test.ts`)

**Purpose**: Validate single-room economic operations

**Tests**:
- Creep spawning and management
- Energy harvesting
- Controller upgrading
- Energy balance maintenance
- CPU budget compliance (≤0.1 per room)

**Typical Duration**: ~90 seconds

**Key Metrics**:
- Average CPU: ≤0.1 per tick
- Max CPU: ≤0.15 per tick
- Bucket: ≥9500

### 3. Scaling Tests (`scaling.test.ts`)

**Purpose**: Verify CPU scales linearly with room count

**Tests**:
- Multi-room operations (5 rooms)
- CPU scaling validation
- Inter-room coordination
- Memory efficiency at scale

**Typical Duration**: ~3 minutes

**Key Metrics**:
- CPU should scale linearly: ~5 rooms × 0.1 = 0.5 CPU
- Bucket: ≥9000

### 4. Defense Tests (`defense.test.ts`)

**Purpose**: Test defensive response systems

**Tests**:
- Threat detection
- Tower activation
- Defender spawning
- Pheromone system updates
- Defense CPU budget (≤0.25 per room)

**Typical Duration**: ~2 minutes

### 5. Expansion Tests (`expansion.test.ts`)

**Purpose**: Validate room claiming and bootstrapping

**Tests**:
- Expansion candidate identification
- Claimer operations
- New room bootstrap
- Resource management
- Self-sufficiency achievement

**Typical Duration**: ~4 minutes

## Writing New Tests

### 1. Create Test File

```bash
# Create new test file
touch packages/screeps-server/test/integration/my-feature.test.ts
```

### 2. Basic Test Structure

```typescript
/**
 * My Feature Integration Tests
 * 
 * Tests:
 * - Feature initialization
 * - Feature behavior
 * - CPU budget compliance
 */

import { assert } from 'chai';
import { helper } from '../helpers/server-helper.js';
import { myFeatureScenario } from '../fixtures/scenarios.js';

describe('My Feature', () => {
  describe('Initialization', () => {
    it('should initialize feature without errors', async function() {
      this.timeout(30000);
      
      const scenario = myFeatureScenario;
      await helper.runTicks(scenario.ticks);
      
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Feature should initialize without errors');
    });
  });
  
  describe('CPU Budget', () => {
    it('should stay within CPU budget', async function() {
      this.timeout(60000);
      
      const scenario = myFeatureScenario;
      await helper.runTicks(scenario.ticks);
      
      const avgCpu = helper.getAverageCpu();
      assert.isBelow(
        avgCpu,
        scenario.performance.avgCpuPerTick,
        `CPU ${avgCpu.toFixed(3)} should be below target`
      );
    });
  });
});
```

### 3. Create Test Scenario (if needed)

Edit `packages/screeps-server/test/fixtures/scenarios.ts`:

```typescript
export const myFeatureScenario: TestScenario = {
  name: 'My Feature Test',
  description: 'Tests my new feature',
  bot: {
    name: 'feature-bot',
    username: 'player',
    startRoom: 'W0N1',
    rooms: [
      {
        name: 'W0N1',
        rcl: 6,
        energy: 100000,
        sources: 2,
        structures: { spawn: 2, extension: 40 }
      }
    ]
  },
  expectedBehavior: {
    spawnsCreeps: true,
    harvestsEnergy: true
  },
  performance: {
    maxCpuPerTick: 0.2,
    avgCpuPerTick: 0.15,
    maxMemoryParsing: 0.02,
    minBucketLevel: 9500
  },
  ticks: 100
};
```

### 4. Test Helper Methods

The `helper` object provides these methods:

```typescript
// Run ticks and collect metrics
const metrics = await helper.runTicks(100);

// Get performance metrics
const avgCpu = helper.getAverageCpu();
const maxCpu = helper.getMaxCpu();
const avgBucket = helper.getAverageBucket();
const avgMemoryParse = helper.getAverageMemoryParseTime();

// Execute console commands
const result = await helper.executeConsole('Game.time');

// Get memory
const memory = await helper.getMemory();

// Check for errors
const hasErrors = await helper.hasErrors();
```

## Performance Baselines

### How Baselines Work

1. **First Run**: Test runs without baseline, creates initial baseline
2. **Subsequent Runs**: Compare metrics against baseline
3. **Regression Detection**: Fail if metrics degrade beyond thresholds
4. **Baseline Update**: Automatically update on `main` branch

### Baseline Format

```json
{
  "testName": "startup-initialization",
  "timestamp": "2026-01-27T15:00:00.000Z",
  "commit": "abc123",
  "branch": "main",
  "avgCpu": 0.05,
  "maxCpu": 0.08,
  "avgMemoryParse": 0.01,
  "avgBucket": 9900
}
```

### Regression Thresholds

- **CPU Increase**: >20% = ⚠️ warning, >30% = ❌ failure
- **Memory Increase**: >15% = ⚠️ warning
- **Bucket Decrease**: >10% = ⚠️ warning

### Manual Baseline Management

```bash
# Create baseline from current test run
npm run test:integration
node scripts/update-integration-baselines.js

# Check for regressions
npm run test:integration
node scripts/check-test-regressions.js

# View baseline
cat performance-baselines/integration/startup-initialization.json
```

## CI/CD Integration

### Workflow Triggers

The integration tests run automatically on:

- **Pull Requests**: All PRs (except drafts)
- **Push to main/develop**: Every commit
- **Manual Trigger**: Via GitHub Actions UI

### Workflow Steps

1. **Build**: Compile bot and all packages
2. **Test**: Run integration tests
3. **Collect**: Gather performance metrics
4. **Compare**: Check for regressions
5. **Report**: Comment on PR with results
6. **Update**: Update baselines (main only)

### Reading CI Results

**Success** ✅:
```
✅ No regressions detected
All tests passed
```

**Warning** ⚠️:
```
⚠️  Performance warnings detected
- CPU increased by 15% (current: 0.115, baseline: 0.100)
```

**Failure** ❌:
```
❌ REGRESSION DETECTED
- CPU increased by 35% (current: 0.135, baseline: 0.100)
- 2 test(s) failed
```

## Best Practices

### 1. Test Isolation

- Each test should be independent
- Don't rely on state from previous tests
- Use `beforeEach` for setup, `afterEach` for cleanup

### 2. Timeouts

- Set appropriate timeouts for async tests
- Default: 2000ms
- Recommended: 30000-60000ms for integration tests
- Use `this.timeout(60000)` in test

### 3. Assertions

- Use descriptive assertion messages
- Include current and expected values
- Example: `assert.isBelow(cpu, 0.1, 'CPU ${cpu} should be below 0.1')`

### 4. CPU Budgets

Follow ROADMAP.md targets:
- Economy room: ≤0.1 CPU/tick
- Combat room: ≤0.25 CPU/tick
- Global kernel: ≤1 CPU every 20-50 ticks

### 5. Test Coverage

Ensure tests cover:
- Happy path (normal operation)
- Edge cases (empty room, full storage, etc.)
- Error handling
- Performance benchmarks

## Troubleshooting

### Tests Fail Locally

```bash
# Clean and rebuild
npm run build

# Check bot compiles
cd packages/screeps-bot
npm run build

# Run single test for debugging
cd packages/screeps-server
npm run test:integration -- test/integration/startup.test.ts
```

### False Positive Regressions

If baseline is outdated or incorrect:

```bash
# Delete specific baseline
rm performance-baselines/integration/my-test.json

# Rerun test to create new baseline
npm run test:integration
node scripts/update-integration-baselines.js
```

### Server Helper Issues

If `screeps-server-mockup` is not available:

```bash
# Install optional dependency
cd packages/screeps-server
npm install screeps-server-mockup
```

### Memory Leaks

If tests show increasing memory:

1. Check for global variables in bot code
2. Verify Memory cleanup in bot loop
3. Review console output for warnings
4. Use `helper.getMemory()` to inspect structure

## Examples

### Example 1: Test Creep Role Distribution

```typescript
it('should maintain balanced role distribution', async function() {
  this.timeout(90000);
  
  await helper.runTicks(100);
  const memory = await helper.getMemory();
  
  // Count creeps by role
  const roles = {};
  for (const name in memory.creeps || {}) {
    const role = memory.creeps[name].role;
    roles[role] = (roles[role] || 0) + 1;
  }
  
  // Should have harvesters
  assert.isAbove(roles['harvester'] || 0, 0, 'Should have harvesters');
  
  // Should have upgraders
  assert.isAbove(roles['upgrader'] || 0, 0, 'Should have upgraders');
});
```

### Example 2: Test Energy Income Rate

```typescript
it('should achieve target energy income rate', async function() {
  this.timeout(120000);
  
  await helper.runTicks(50);
  const memory1 = await helper.getMemory();
  const energy1 = memory1.stats?.rooms?.W0N1?.energyHarvested || 0;
  
  await helper.runTicks(50);
  const memory2 = await helper.getMemory();
  const energy2 = memory2.stats?.rooms?.W0N1?.energyHarvested || 0;
  
  const energyPerTick = (energy2 - energy1) / 50;
  
  assert.isAbove(
    energyPerTick,
    5,
    `Energy income ${energyPerTick.toFixed(1)}/tick should be above 5`
  );
});
```

### Example 3: Test Defensive Response Time

```typescript
it('should detect hostiles within 10 ticks', async function() {
  this.timeout(60000);
  
  // Inject hostile creep (would need server helper enhancement)
  // await helper.injectHostile('W0N1', { x: 25, y: 25 });
  
  await helper.runTicks(10);
  const memory = await helper.getMemory();
  
  // Check for defense pheromone or danger marker
  const hasDangerResponse = 
    memory.pheromones?.danger ||
    memory.rooms?.W0N1?.threats?.length > 0;
  
  assert.isTrue(hasDangerResponse, 'Should detect threat within 10 ticks');
});
```

## Additional Resources

- **ROADMAP.md**: CPU budget targets and design principles
- **TESTING_GUIDE.md**: General testing strategy
- **Server Helper**: `packages/screeps-server/test/helpers/server-helper.ts`
- **Test Scenarios**: `packages/screeps-server/test/fixtures/scenarios.ts`
- **CI Workflow**: `.github/workflows/integration-tests.yml`

## Contributing

When adding new integration tests:

1. Follow existing test structure and patterns
2. Add test scenarios to fixtures if needed
3. Document expected behavior and metrics
4. Set appropriate CPU budgets per ROADMAP.md
5. Update this guide if adding new test categories
6. Ensure tests pass locally before creating PR

## Support

For questions or issues:

1. Check existing test files for examples
2. Review TESTING_GUIDE.md and ROADMAP.md
3. Check CI logs for detailed error messages
4. Create GitHub issue with test failure details
