# Performance Testing Guide

This guide covers the automated performance regression testing system for the Screeps bot.

## Overview

The performance testing system validates that code changes don't introduce performance regressions by comparing current metrics against established baselines. Tests run automatically on every PR and merge to main/develop branches.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Performance Testing System                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Test Suite   │───>│  Baseline    │───>│  CI/CD       │  │
│  │              │    │  Comparison  │    │  Integration │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                    │                    │          │
│         ▼                    ▼                    ▼          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ CPU Budget   │    │  Regression  │    │  Quality     │  │
│  │ Validation   │    │  Detection   │    │  Gates       │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Test Types

### 1. CPU Budget Validation (`cpu-budget.test.ts`)

Validates bot stays within ROADMAP.md CPU budgets:
- **Eco Room**: ≤0.1 CPU per tick
- **Combat Room**: ≤0.25 CPU per tick
- **Remote Mining**: ≤0.15 CPU per tick
- **Multi-Room**: ≤0.15 CPU per room (25 rooms = 3.75 total)

**Example Test**:
```typescript
it('should stay within CPU budget for single eco room', async function() {
  this.timeout(60000);
  
  const scenario = singleRoomEcoScenario;
  const metrics = await helper.runTicks(scenario.ticks);
  
  const avgCpu = helper.getAverageCpu();
  const maxCpu = helper.getMaxCpu();
  
  assert.isBelow(avgCpu, scenario.performance.avgCpuPerTick);
  assert.isBelow(maxCpu, scenario.performance.maxCpuPerTick);
});
```

### 2. Regression Detection (`regression.test.ts`)

Compares current performance against historical baselines:
- **CPU Metrics**: avg, max, p95, p99
- **Memory Usage**: Parse time, total usage
- **Bucket Stability**: Average level, drain rate
- **GCL Progression**: Progress per tick
- **Energy Efficiency**: Income per tick

**Example Test**:
```typescript
it('should not regress CPU usage >15% from baseline', async function() {
  this.timeout(60000);
  
  const { baseline, config } = await loadBaseline('default');
  const metrics = await helper.runTicks(config.ticks);
  const avgCpu = helper.getAverageCpu();
  
  const results = compareAgainstBaseline(
    baseline,
    { avgCpu, maxCpu: helper.getMaxCpu() },
    { cpu: 0.15 } // 15% threshold
  );
  
  const failures = results.filter(r => !r.passed);
  assert.isEmpty(failures, 'No regressions detected');
});
```

### 3. Bucket Stability Tests

Ensures CPU usage doesn't drain the bucket:
- Average bucket level ≥9500
- No downward trend over time
- Stable under different loads

### 4. Scaling Tests

Validates performance scales linearly:
- CPU per room remains constant
- Memory usage scales predictably
- No performance degradation over time

## Running Tests

### Locally

```bash
# Run all performance tests
cd packages/screeps-server
npm run test:performance

# Run specific test suite
npm test -- test/performance/cpu-budget.test.ts
npm test -- test/performance/regression.test.ts

# Run with baseline comparison
npm run test:performance && \
  node scripts/compare-performance-baseline.js \
    --current ../screeps-bot/performance-report.json \
    --threshold-cpu 0.15 \
    --threshold-gcl 0.20
```

### In CI

Tests run automatically on:
- **Pull Requests**: On open/sync to validate changes
- **Push to main/develop**: After merge to update baselines
- **Scheduled**: Every 6 hours to detect drift
- **Manual**: Via workflow_dispatch

## Baseline System

### Structure

```
performance-baselines/
├── main.json           # Production baseline
├── develop.json        # Development baseline
├── README.md           # Documentation
└── history/            # Historical snapshots
    ├── 2026-01-28_main_abc123.json
    └── 2026-01-27_develop_def456.json
```

### Baseline Format

```json
{
  "commit": "abc123",
  "timestamp": "2026-01-28T12:00:00Z",
  "branch": "main",
  "scenarios": {
    "default": {
      "avgCpu": 0.08,
      "maxCpu": 0.12,
      "p95Cpu": 0.10,
      "p99Cpu": 0.11
    }
  },
  "cpu": {
    "avg": 5.5,
    "p95": 8.2,
    "max": 12.0,
    "bucket": 9800
  },
  "gcl": {
    "progressPerTick": 0.012,
    "level": 15,
    "progress": 45000
  }
}
```

### Updating Baselines

Baselines are automatically updated when:
1. Tests pass on main/develop
2. No regressions detected
3. Changes pushed successfully

Manual update:
```bash
cd packages/screeps-bot
npm run test:perf:baseline
```

## Regression Thresholds

### Default Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| CPU | +10-15% | +15%+ |
| Memory | +10-15% | +15%+ |
| GCL Rate | -15-20% | -20%+ |
| Bucket | -5-10% | -10%+ |

### Severity Levels

- **Improvement**: < -10% (better than baseline)
- **Pass**: -10% to +10% (acceptable variance)
- **Warning**: +10% to +15% (review recommended)
- **Critical**: > +15% (blocks merge)

### Configuring Thresholds

In CI workflow:
```yaml
- name: Compare against baseline
  run: |
    node scripts/compare-performance-baseline.js \
      --current performance-report.json \
      --threshold-cpu 0.15 \
      --threshold-gcl 0.20 \
      --threshold-memory 0.15
```

In tests:
```typescript
const results = compareAgainstBaseline(
  baseline,
  currentMetrics,
  { 
    cpu: 0.15,      // 15% CPU threshold
    memory: 0.15    // 15% memory threshold
  }
);
```

## Writing New Performance Tests

### Test Structure

```typescript
import { assert } from 'chai';
import { helper } from '../helpers/server-helper.js';
import { loadBaseline, compareAgainstBaseline } from '../helpers/baseline.js';

describe('My Performance Feature', () => {
  it('should meet performance target', async function() {
    this.timeout(60000);
    
    // 1. Setup scenario
    const metrics = await helper.runTicks(100);
    
    // 2. Collect metrics
    const avgCpu = helper.getAverageCpu();
    const maxCpu = helper.getMaxCpu();
    
    // 3. Assert against targets
    assert.isBelow(avgCpu, 0.1, 'Average CPU within budget');
    assert.isBelow(maxCpu, 0.15, 'Max CPU within budget');
  });
  
  it('should not regress from baseline', async function() {
    this.timeout(60000);
    
    // 1. Load baseline
    const { baseline, config } = await loadBaseline('my-scenario');
    
    // 2. Run test
    const metrics = await helper.runTicks(config.ticks);
    
    // 3. Compare
    const results = compareAgainstBaseline(
      baseline,
      { 
        avgCpu: helper.getAverageCpu(),
        maxCpu: helper.getMaxCpu()
      }
    );
    
    // 4. Assert
    const failures = results.filter(r => !r.passed);
    assert.isEmpty(failures);
  });
});
```

### Best Practices

1. **Use Appropriate Timeouts**: Performance tests can be slow
   ```typescript
   this.timeout(60000); // 60 seconds
   ```

2. **Run Enough Ticks**: Get stable metrics
   ```typescript
   await helper.runTicks(100); // Minimum for stability
   ```

3. **Log Detailed Results**: Help debugging
   ```typescript
   console.log(`Average CPU: ${avgCpu.toFixed(3)}`);
   console.log(`Regression: ${formatRegression(regression)}`);
   ```

4. **Handle Missing Baselines**: Gracefully skip
   ```typescript
   if (!baseline.avgCpu) {
     this.skip();
     return;
   }
   ```

5. **Use Helper Methods**: Consistent metric calculation
   ```typescript
   const avgCpu = helper.getAverageCpu();
   const avgBucket = helper.getAverageBucket();
   ```

## Test Helpers

### Server Helper

Located in `test/helpers/server-helper.ts`:

```typescript
// Initialize test environment
await helper.beforeEach();

// Run ticks and collect metrics
const metrics = await helper.runTicks(100);

// Get computed metrics
const avgCpu = helper.getAverageCpu();
const maxCpu = helper.getMaxCpu();
const avgBucket = helper.getAverageBucket();
const avgMemory = helper.getAverageMemoryParseTime();

// Execute console commands
const result = await helper.executeConsole('Game.time');

// Get bot memory
const memory = await helper.getMemory();

// Check for errors
const hasErrors = await helper.hasErrors();

// Cleanup
await helper.afterEach();
```

### Baseline Helper

Located in `test/helpers/baseline.ts`:

```typescript
// Load baseline for scenario
const { baseline, config } = await loadBaseline('default');

// Compare against baseline
const results = compareAgainstBaseline(
  baseline,
  currentMetrics,
  { cpu: 0.15, memory: 0.15 }
);

// Calculate regression
const regression = calculateRegression(baseline, current);

// Format for display
const formatted = formatRegression(regression); // "+5.2%"

// Get severity
const severity = getRegressionSeverity(regression);
```

## CI/CD Integration

### Workflow: Performance Tests

**File**: `.github/workflows/performance-test.yml`

**Triggers**:
- Pull requests (opened, synchronized)
- Push to main/develop
- Manual dispatch

**Steps**:
1. Build packages
2. Run integration tests
3. Run performance tests
4. Compare against baseline
5. Analyze results
6. Comment on PR
7. Update baseline (if main/develop)

### Quality Gates

**Merge Blocking Conditions**:
- ❌ Critical CPU regression (>15%)
- ❌ Critical memory regression (>15%)
- ❌ Critical GCL regression (>20%)
- ❌ Bucket draining (<9000 avg)

**Non-Blocking Warnings**:
- ⚠️ Warning-level regressions (10-15%)
- ⚠️ Missing baseline data
- ⚠️ Test failures (investigation needed)

### PR Comments

Automated comments include:
- Performance metrics comparison
- Regression analysis
- Severity indicators
- Baseline differences
- Recommendations

Example:
```markdown
## 📊 Performance Test Results

### CPU Metrics
- Average CPU: 0.085 (baseline: 0.080) +6.3% ✓
- Max CPU: 0.120 (baseline: 0.115) +4.3% ✓
- P95 CPU: 0.105 (baseline: 0.100) +5.0% ✓

### Verdict
✅ All metrics within acceptable thresholds
```

## Troubleshooting

### Tests Timeout

**Problem**: Tests fail with timeout error

**Solutions**:
1. Increase timeout: `this.timeout(120000)`
2. Reduce tick count: `runTicks(50)` instead of `runTicks(100)`
3. Check for infinite loops in bot code

### Baseline Not Found

**Problem**: "No baseline found" error

**Solutions**:
1. Create initial baseline: `npm run test:perf:baseline`
2. Check baseline directory exists
3. Verify branch name matches file

### Flaky Tests

**Problem**: Tests pass/fail intermittently

**Solutions**:
1. Run more ticks for stability
2. Increase threshold tolerances
3. Check for non-deterministic bot behavior
4. Review warmup period needs

### High Variance

**Problem**: Metrics vary significantly between runs

**Solutions**:
1. Ensure enough samples: `runTicks(200)`
2. Skip warmup period in calculations
3. Use median instead of average
4. Check for external factors (CI load)

## Monitoring

### Metrics Dashboard

View performance trends in Grafana:
- Navigate to Performance Dashboard
- Filter by branch/commit
- Compare time periods
- Identify regressions

### Alert Configuration

Alerts trigger on:
- CPU usage >0.15 per room
- Bucket <9000 avg
- Memory >2MB
- GCL rate <0.01/tick

### Historical Analysis

Review baseline history:
```bash
ls -l performance-baselines/history/
cat performance-baselines/history/2026-01-28_main_abc123.json
```

## References

- [ROADMAP.md](../../../ROADMAP.md) - CPU budget targets
- [Test Scenarios](../test/fixtures/scenarios.ts) - Pre-defined test scenarios
- [Performance Baselines](../../../performance-baselines/README.md) - Baseline documentation
- [CI Workflow](.github/workflows/performance-test.yml) - Workflow configuration

## Support

For help with performance testing:
1. Check existing test examples
2. Review helper method documentation
3. Consult baseline README
4. Ask in project discussions
