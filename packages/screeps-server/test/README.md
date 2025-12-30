# Test Infrastructure

This directory contains comprehensive test infrastructure for validating the Screeps bot against ROADMAP.md requirements.

## Directory Structure

```
test/
├── integration/        # Integration tests for bot functionality
│   └── basic.test.ts  # Core bot lifecycle and operations
├── performance/        # Performance and CPU budget validation
│   └── cpu-budget.test.ts  # CPU targets and bucket stability
├── packages/          # Framework package tests
│   └── framework.test.ts  # Package loading and isolation
├── fixtures/          # Test scenarios and data
│   └── scenarios.ts   # Predefined test scenarios
└── helpers/           # Test utilities
    └── server-helper.ts  # Server management and metrics
```

## Test Categories

### Integration Tests

Tests core bot functionality in a simulated Screeps environment:

- **Server Lifecycle**: Server startup, tick execution, shutdown
- **Bot Functionality**: Creep spawning, energy harvesting, controller upgrade
- **Memory Operations**: Reading/writing memory, console commands
- **Error Detection**: Console error monitoring

**Run**: `npm run test:integration`

### Performance Tests

Validates CPU and memory budgets against ROADMAP.md targets:

- **CPU Budget**: Eco room ≤0.1 CPU, Combat room ≤0.25 CPU
- **Bucket Stability**: Maintains ≥9500 bucket level
- **Memory Parsing**: Memory serialization ≤0.02 CPU
- **Scaling**: Multi-room performance, 100+ ticks stability
- **Regression Detection**: CPU spike detection, variance analysis

**Run**: `npm run test:performance`

### Framework Package Tests

Tests individual framework packages in isolation:

- **Package Loading**: Verify all packages load without errors
- **Peer Dependencies**: Check TypeScript and Screeps types
- **CPU Impact**: Measure initialization overhead
- **API Contracts**: Validate exported interfaces

**Run**: `npm run test:packages`

## Test Scenarios

Predefined scenarios in `fixtures/scenarios.ts`:

### Empty Room Scenario
- Fresh room with spawn
- Tests initialization and first creep
- Target: ≤0.1 CPU avg, ≤0.05 CPU avg

### Single Room Economy
- RCL 4 room with basic structures
- Tests economy operations
- Target: ≤0.15 CPU max, ≤0.1 CPU avg

### Five Room Empire
- Multi-room setup with varying RCLs
- Tests scaling and coordination
- Target: ≤0.6 CPU total

### Combat Scenario
- Room under attack with defenses
- Tests combat and defense
- Target: ≤0.3 CPU max, ≤0.25 CPU avg

## Helper Classes

### ServerTestHelper

Manages Screeps server instances and collects metrics:

```typescript
import { helper } from './helpers/server-helper.js';

// Run N ticks
const metrics = await helper.runTicks(100);

// Get performance data
const avgCpu = helper.getAverageCpu();
const maxCpu = helper.getMaxCpu();
const avgBucket = helper.getAverageBucket();

// Execute console commands
const output = await helper.executeConsole('Game.time');

// Check for errors
const hasErrors = await helper.hasErrors();
```

## Performance Metrics

The helper collects these metrics per tick:

- **CPU Usage**: Per-tick CPU consumption
- **Memory Parse Time**: Memory serialization overhead
- **Bucket Level**: CPU bucket health
- **Tick Time**: Real-time tick execution duration

## Writing Tests

### Basic Template

```typescript
import { assert } from 'chai';
import { helper } from '../helpers/server-helper.js';

describe('My Test Suite', () => {
  it('should test something', async function() {
    this.timeout(30000);
    
    // Run some ticks
    await helper.runTicks(50);
    
    // Verify behavior
    const avgCpu = helper.getAverageCpu();
    assert.isBelow(avgCpu, 0.1);
  });
});
```

### Performance Test Template

```typescript
import { singleRoomEcoScenario } from '../fixtures/scenarios.js';

it('should meet CPU target', async function() {
  this.timeout(60000);
  
  const scenario = singleRoomEcoScenario;
  const metrics = await helper.runTicks(scenario.ticks);
  
  const avgCpu = helper.getAverageCpu();
  assert.isBelow(avgCpu, scenario.performance.avgCpuPerTick);
});
```

## CI Integration

Tests are integrated into the GitHub Actions workflow (`.github/workflows/performance-test.yml`):

1. **On PR**: Run integration and performance tests
2. **CPU Comparison**: Compare against baseline
3. **Regression Check**: Fail if >10% regression
4. **PR Comment**: Post metrics summary
5. **Baseline Update**: Update on main/develop merge

## Baseline Management

Performance baselines stored in `performance-baselines/`:

- `main.json`: Production baseline
- `develop.json`: Development baseline
- `history/`: Historical trend data

## Troubleshooting

### Tests Timeout

Increase timeout in test:
```typescript
it('my test', async function() {
  this.timeout(60000); // 60 seconds
  // ...
});
```

### screeps-server-mockup Not Found

Install dependencies:
```bash
cd packages/screeps-server
npm install
```

### Bot Code Not Loading

Ensure bot is built:
```bash
npm run build -w screeps-bot
```

### High CPU Values

- Check bot implementation for inefficiencies
- Review ROADMAP.md for optimization strategies
- Use profiling to identify hot paths

## Best Practices

1. **Isolated Tests**: Each test should be independent
2. **Realistic Scenarios**: Use fixtures that match production
3. **Adequate Timeouts**: Server operations take time
4. **Clear Assertions**: Assert specific metrics with context
5. **Document Assumptions**: Explain expected behavior
6. **Monitor Trends**: Watch for gradual degradation

## Future Enhancements

- [ ] Multi-room scaling tests (10, 20 rooms)
- [ ] Combat scenario with hostile creeps
- [ ] Remote mining validation
- [ ] Market operations testing
- [ ] Inter-room logistics tests
- [ ] Power creep integration
- [ ] Nuke defense scenarios

## References

- [ROADMAP.md](../../ROADMAP.md): CPU targets and architecture
- [Performance Test Workflow](../../.github/workflows/performance-test.yml)
- [screeps-server-mockup](https://github.com/Hiryus/screeps-server-mockup)
