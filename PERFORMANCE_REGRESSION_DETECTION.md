# Performance Regression Detection

This document describes the automated performance regression detection system that runs in CI and prevents performance degradations from being merged.

## Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Local Testing](#local-testing)
4. [CI Integration](#ci-integration)
5. [Baselines](#baselines)
6. [Thresholds](#thresholds)
7. [Troubleshooting](#troubleshooting)

## Overview

The performance regression detection system automatically:

1. **Runs performance tests** on every PR
2. **Compares results** against baseline metrics
3. **Detects regressions** when performance degrades > 10%
4. **Fails CI** to prevent merges with regressions
5. **Posts PR comments** with detailed comparison
6. **Updates baselines** when tests pass on main/develop

### Key Features

- ✅ **Automated Detection**: No manual performance tracking needed
- ✅ **10% Threshold**: Flags regressions > 10% increase in CPU/memory
- ✅ **Historical Tracking**: Maintains baseline history in git
- ✅ **PR Comments**: Posts detailed performance comparison
- ✅ **Grafana Integration**: Exports metrics for trend monitoring
- ✅ **Local Testing**: Run performance checks before pushing

## How It Works

### 1. Performance Test Execution

When a PR is opened or updated, the CI workflow:

```bash
# Build the bot code
npm run build

# Run performance tests with comprehensive logging
npm run test:performance:logs
```

This executes the bot in a local Screeps server and captures:
- CPU usage per tick
- Bucket levels
- Memory usage
- Room metrics
- Kernel process performance
- Cache hit rates

### 2. Metric Analysis

The `analyze-performance.js` script processes the logs:

```javascript
// Parse CPU metrics from logs
const { cpuHistory, bucketHistory, memoryHistory } = parseCpuMetrics(consoleLog);

// Calculate statistics
const cpuStats = calculateStats(cpuHistory);
// Returns: { avg, max, min, median, p95, p99 }

// Parse expanded metrics
const expandedMetrics = parseExpandedMetrics(consoleLog);
// Returns: { rooms, kernel, cache, creeps, memory }
```

### 3. Baseline Comparison

The system loads the appropriate baseline:

```javascript
// Load baseline for target branch (main/develop)
const baseline = loadBaseline(branch);

// Compare current vs baseline
const regression = detectRegression(currentMetrics, baseline, threshold);

// Result includes:
// - detected: boolean
// - avgCpuChange: percentage
// - maxCpuChange: percentage
// - memoryChange: percentage
```

### 4. Regression Detection

A regression is detected when:

| Metric | Threshold | Action |
|--------|-----------|--------|
| Average CPU | > 10% increase | ❌ Fail CI |
| Max CPU | > 10% increase | ❌ Fail CI |
| Memory | > 10% increase | ⚠️ Warning (doesn't fail) |
| Bucket | < 5000 | ⚠️ Warning |

### 5. CI Failure

If regression is detected:

```bash
# CI step checks the report
if [ "$PASSED" = "false" ]; then
  echo "::error::Performance regression detected"
  exit 1  # Fails the workflow
fi
```

### 6. Baseline Update

On successful merge to main/develop:

```bash
# Update baseline with new metrics
node scripts/update-baseline.js

# Archive historical snapshot
# Saves to: performance-baselines/history/YYYY-MM-DD_branch_commit.json

# Commit baseline update
git add performance-baselines/*.json
git commit -m "chore(performance): update baseline for main"
```

## Local Testing

### Quick Start

```bash
# Compare against baseline (runs tests + analysis)
npm run test:perf:compare

# Create new baseline (runs tests + updates baseline)
npm run test:perf:baseline
```

### Step-by-Step

#### 1. Run Performance Tests

```bash
# Build the bot first
npm run build

# Run tests with logging
cd packages/screeps-bot
npm run test:performance:logs
```

This creates logs in `packages/screeps-bot/logs/`:
- `console.log` - Bot console output with CPU metrics
- `server.log` - Server logs

#### 2. Analyze Results

```bash
# Analyze performance and compare against baseline
node scripts/analyze-performance.js
```

Output includes:
```
=== Performance Analysis ===

Reading console logs...
Parsing CPU and memory metrics...
Found 100 CPU samples
Found 100 bucket samples

Calculating statistics...

CPU Statistics:
  Average: 5.330
  Maximum: 17.910
  P95:     14.292
  P99:     15.561

Comparing against baseline for branch: main
✅ No performance regression detected

Report written to: performance-report.json
```

#### 3. Review Report

Check `packages/screeps-bot/performance-report.json`:

```json
{
  "timestamp": "2026-01-23T00:00:00.000Z",
  "commit": "abc123",
  "branch": "feature-branch",
  "passed": true,
  "regression": {
    "detected": false,
    "reason": "Within threshold"
  },
  "analysis": {
    "cpu": {
      "avg": 5.330,
      "max": 17.910,
      "p95": 14.292,
      "p99": 15.561
    },
    "bucket": {
      "avg": 9500,
      "min": 8500
    }
  }
}
```

#### 4. Create Baseline (Optional)

If you want to update the baseline manually:

```bash
# Run tests first
npm run test:performance:logs

# Update baseline for current branch
node scripts/update-baseline.js
```

**Note**: Only main and develop baselines are automatically updated by CI.

## CI Integration

### Workflow Trigger

The performance test workflow runs on:

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]
    paths:
      - 'packages/screeps-bot/src/**'
      - 'packages/screeps-server/test/**'
  push:
    branches: [main, develop]
  workflow_dispatch:
```

### Workflow Steps

1. **Checkout code** with submodules
2. **Install dependencies** (`npm ci`)
3. **Build packages** (`npm run build`)
4. **Run performance tests** (up to 45 minutes)
5. **Analyze results** (`analyze-performance.js`)
6. **Export to Grafana** (optional, if configured)
7. **Post PR comment** with comparison table
8. **Check for regression** - fails if regression detected
9. **Update baseline** (only on main/develop)

### PR Comment Format

```markdown
## 📊 Performance Test Results

### Summary

| Metric | Value | Status |
|--------|-------|--------|
| Avg CPU | 5.330 | ✅ |
| Max CPU | 17.910 | ✅ |
| P95 CPU | 14.292 | ℹ️ |
| P99 CPU | 15.561 | ℹ️ |
| Avg Bucket | 9500 | ✅ |
| Min Bucket | 8500 | ✅ |
| Samples | 100 | ℹ️ |

### ✅ No Performance Regression

Performance is within acceptable limits compared to baseline.

---
*Performance test completed at 1/23/2026, 12:00:00 AM*
*Commit: abc1234*
```

### Artifacts

The workflow uploads:

- `performance-test-logs/` - Console and server logs
- `performance-test-results/` - Raw performance data
- `performance-report/` - JSON and Markdown reports
- `server-test-results/` - Integration test results

Artifacts are retained for 30 days.

## Baselines

### Directory Structure

```
performance-baselines/
├── README.md              # Documentation
├── main.json             # Production baseline
├── develop.json          # Development baseline
├── history/              # Historical snapshots
│   ├── 2026-01-23_main_abc1234.json
│   └── 2026-01-22_develop_def5678.json
└── strategic/            # Strategic planning baselines
```

### Baseline Format

```json
{
  "commit": "abc1234567890",
  "timestamp": "2026-01-23T00:00:00.000Z",
  "branch": "main",
  
  "scenarios": {
    "default": {
      "avgCpu": 5.330,
      "maxCpu": 17.910,
      "p95Cpu": 14.292,
      "p99Cpu": 15.561,
      "avgMemory": 150000,
      "maxMemory": 200000
    }
  },
  
  "cpu": {
    "avg": 5.330,
    "p95": 14.292,
    "max": 17.910,
    "bucket": 9500
  },
  
  "energy": {
    "incomePerTick": 150
  },
  
  "rooms": {
    "W1N1": {
      "rcl": 8,
      "cpu": { "avg": 0.08, "p95": 0.12, "max": 0.15 },
      "creepCount": 25,
      "energy": { "income": 150, "expenses": 120 }
    }
  },
  
  "kernel": {
    "processes": {
      "spawn": { "cpu": 0.15, "frequency": "high" }
    },
    "totalBudget": 1.0,
    "actualUsage": 0.85
  },
  
  "cache": {
    "roomFind": { "hitRate": 0.95, "evictions": 12 },
    "pathCache": { "hitRate": 0.88 }
  },
  
  "creeps": {
    "byRole": { "harvester": 15, "upgrader": 8 },
    "total": 38,
    "idle": 2
  }
}
```

### Baseline Updates

Baselines are updated automatically when:

1. **Condition**: Test passes on main or develop branch
2. **Process**: 
   - Load performance report
   - Extract current metrics
   - Update branch baseline file
   - Archive historical snapshot
   - Commit and push changes

Manual update:

```bash
# From packages/screeps-bot
node scripts/update-baseline.js [branch-name]
```

**Note**: Only main and develop baselines should be updated. Feature branches compare against the target branch (usually develop).

## Thresholds

### Regression Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Average CPU | +10% | +20% |
| Max CPU | +10% | +20% |
| Memory Usage | +10% | +20% |
| Bucket Level | -10% | -20% |

### CPU Budget Targets (from ROADMAP.md)

| Scenario | Target | Measured Against |
|----------|--------|------------------|
| Empty room | ≤ 0.05 CPU/tick | avgCpu |
| Eco room (RCL 4) | ≤ 0.1 CPU/tick | avgCpu |
| Combat room | ≤ 0.25 CPU/tick | avgCpu |
| Remote mining | ≤ 0.15 CPU/tick | avgCpu |
| Multi-room (25 rooms) | ≤ 0.15 CPU/room | avgCpu / roomCount |
| Global kernel | ≤ 1 CPU per 20-50 ticks | kernel.actualUsage |

### Configuration

Thresholds are defined in:

- `packages/screeps-bot/scripts/analyze-performance.js`:
  ```javascript
  const REGRESSION_THRESHOLD = 0.10; // 10%
  const MEMORY_REGRESSION_THRESHOLD = 0.10; // 10%
  ```

- `packages/screeps-server/scripts/compare-baseline.js`:
  ```javascript
  function classifyRegression(metric, current, baseline, threshold = 10) {
    // ... classification logic
  }
  ```

## Troubleshooting

### "No baseline found"

**Problem**: No baseline exists for the target branch.

**Solution**: 
```bash
# Create baseline for current branch
npm run test:perf:baseline

# Or manually
cd packages/screeps-bot
npm run test:performance:logs
node scripts/update-baseline.js develop
```

### "No CPU metrics found in logs"

**Problem**: Bot isn't logging CPU usage.

**Solution**:
- Ensure bot outputs CPU stats in console
- Check logs in `packages/screeps-bot/logs/console.log`
- Bot should log JSON stats: `{"type":"stats","tick":123,"data":{"cpu":{"used":0.5}}}`

### "Performance regression detected" (False Positive)

**Problem**: Legitimate code changes increase CPU usage.

**Options**:

1. **Optimize the code** to reduce CPU impact
2. **Update baseline** if the increase is acceptable:
   ```bash
   # After merging to develop, baseline updates automatically
   # Or manually update if justified:
   node scripts/update-baseline.js develop
   ```
3. **Document the increase** in PR description explaining why it's necessary

### Docker Issues

**Problem**: `screeps-performance-server` fails to start.

**Solution**:
```bash
# Ensure Docker is running
docker ps

# Check Docker Compose version
docker compose version

# Manually test server
cd packages/screeps-bot
DOCKER_DEFAULT_PLATFORM=linux/amd64 screeps-performance-server --botFilePath=dist
```

### CI Timeout

**Problem**: Performance tests timeout after 45 minutes.

**Solution**:
- Reduce `maxTickCount` for quicker tests
- Check for infinite loops or stuck creeps
- Review logs for errors causing hangs

### Memory Leak Detection

**Problem**: Memory usage increasing over time.

**Solution**:
- Check memory history in report
- Look for growing data structures
- Verify cleanup in kernel processes
- Run longer tests: `--maxTickCount=20000`

## Advanced Topics

### Custom Test Scenarios

Add custom scenarios in `packages/screeps-server/test/fixtures/scenarios.ts`:

```typescript
export const customScenario: TestScenario = {
  name: 'Custom Test',
  ticks: 200,
  performance: {
    avgCpuPerTick: 0.12,
    maxCpuPerTick: 0.18,
    minBucketLevel: 9000
  },
  setup: async (helper) => {
    // Custom setup logic
  }
};
```

### Grafana Integration

Export metrics to Grafana for trend monitoring:

```bash
# Set environment variables
export PROMETHEUS_PUSHGATEWAY_URL=http://localhost:9091
export METRICS_FORMAT=prometheus

# Export metrics after test
cd packages/screeps-bot
node scripts/export-to-grafana.js
```

### Historical Analysis

Query historical baselines:

```bash
# List all historical snapshots
ls -la performance-baselines/history/

# View specific snapshot
cat performance-baselines/history/2026-01-23_main_abc1234.json
```

### Regression Analysis

Detailed regression analysis:

```javascript
// In packages/screeps-bot/scripts/analyze-performance.js
const regression = detectRegression(currentMetrics, baseline, threshold);

if (regression.detected) {
  console.log(`CPU regression: ${regression.avgCpuChange.toFixed(1)}%`);
  console.log(`Current: ${regression.current.avgCpu.toFixed(3)}`);
  console.log(`Baseline: ${regression.baseline.avgCpu.toFixed(3)}`);
}
```

## References

- [ROADMAP.md](./ROADMAP.md) - Performance targets and architecture
- [PERFORMANCE_TESTING.md](./PERFORMANCE_TESTING.md) - Detailed testing guide
- [performance-baselines/README.md](./performance-baselines/README.md) - Baseline documentation
- [.github/workflows/performance-test.yml](./.github/workflows/performance-test.yml) - CI workflow
- [packages/screeps-server/test/performance/](./packages/screeps-server/test/performance/) - Test suite

## Summary

The performance regression detection system ensures:

✅ **Automated Testing**: Runs on every PR
✅ **Regression Detection**: Flags > 10% CPU/memory increases  
✅ **CI Integration**: Blocks merges with regressions
✅ **Historical Tracking**: Maintains baseline history
✅ **PR Visibility**: Posts detailed comparison comments
✅ **Local Testing**: Test before pushing with `npm run test:perf:compare`

By maintaining strict performance budgets and automated regression detection, the bot maintains consistent, predictable performance as it scales.
