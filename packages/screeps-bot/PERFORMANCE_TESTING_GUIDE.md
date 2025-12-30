# Performance Testing Guide

> **Strategic Value**: This guide enables confident autonomous optimization, supports ROADMAP.md targets, provides evidence-based decision making, and accelerates development velocity with fast feedback loops.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding Performance Testing](#understanding-performance-testing)
3. [Creating Performance Tests](#creating-performance-tests)
4. [Interpreting Results](#interpreting-results)
5. [Performance Baselines](#performance-baselines)
6. [CI/CD Integration](#cicd-integration)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Topics](#advanced-topics)

---

## Quick Start

Get started with performance testing in under 5 minutes:

### Prerequisites

- Node.js 18.x or 20.x (LTS versions)
- Docker and Docker Compose installed and running
- Built bot code

### 3-Step Quickstart

```bash
# 1. Build the bot
npm run build

# 2. Run performance test
npm run test:performance

# 3. View results
cat logs/console.log | grep CPU
```

**That's it!** The performance test will:
- Start a local Screeps server in Docker
- Run your bot for up to 10,000 ticks (configurable)
- Track milestones (RCL progression, creep counts)
- Collect CPU and bucket metrics
- Generate performance reports

### Understanding the Output

After the test completes, you'll find:

- **`logs/console.log`**: All bot console output with CPU metrics
- **`logs/server.log`**: Server debug information
- **`performance-results.json`**: Milestone achievements (if configured)
- **`performance-report.json`**: Analyzed metrics and baseline comparison

**Example console output:**
```
CPU: 0.082 Bucket: 9500
CPU: 0.075 Bucket: 9520
CPU: 0.089 Bucket: 9510
```

---

## Understanding Performance Testing

### What is Performance Testing?

Performance testing validates that your bot meets CPU and memory targets defined in [ROADMAP.md](../../ROADMAP.md):

- **Eco Room**: ≤ 0.1 CPU per tick (target: 0.08)
- **War Room**: ≤ 0.25 CPU per tick (target: 0.20)
- **Global Kernel**: ≤ 1 CPU every 20-50 ticks (≤ 0.05 avg)
- **Scalability**: Support 100+ rooms, 5000+ creeps

### Why Performance Testing?

1. **Autonomous Development**: AI agents can validate optimizations automatically
2. **Regression Prevention**: Detect CPU increases before they reach production
3. **Baseline Tracking**: Measure improvement over time
4. **Confidence**: Deploy changes knowing they won't drain the bucket

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  screeps-performance-server (Docker container)       │
│  ┌───────────────────────────────────────────────┐  │
│  │ Screeps Server                                 │  │
│  │  - Simulates game ticks                       │  │
│  │  - Runs your bot code                         │  │
│  │  - Tracks milestones                          │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
            │
            │ Logs via WebSocket API
            ▼
┌─────────────────────────────────────────────────────┐
│  performance-test-with-logs.js                       │
│  - Captures ALL console output                      │
│  - Writes to logs/console.log                       │
│  - Writes server output to logs/server.log          │
└─────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────┐
│  analyze-performance.js                              │
│  - Parses CPU metrics from logs                     │
│  - Calculates statistics (avg, max, p95, p99)       │
│  - Compares against baseline                        │
│  - Detects regressions (>10% increase)              │
│  - Generates performance-report.json                │
└─────────────────────────────────────────────────────┘
```

### Test Infrastructure

The repository includes:

| Component | Purpose | Location |
|-----------|---------|----------|
| **screeps-performance-server** | Simulated Screeps environment | Docker container |
| **screepsmod-testing** | Testing framework and utilities | `packages/screepsmod-testing/` |
| **Test scenarios** | Pre-defined test scenarios | `test/performance/scenarios.ts` |
| **Analysis scripts** | Performance analysis and reporting | `scripts/analyze-performance.js` |
| **Baseline management** | Baseline tracking and updates | `scripts/update-baseline.js` |
| **CI workflow** | Automated testing on PRs | `.github/workflows/performance-test.yml` |

---

## Creating Performance Tests

### Test Scenarios

Performance tests are defined as scenarios in `test/performance/scenarios.ts`. Each scenario specifies:

1. **Setup**: Room configuration, RCL, energy, creeps
2. **Targets**: Performance expectations (CPU, bucket)

#### Example: Single Room Economy Test

```typescript
// test/performance/scenarios.ts

export const singleRoomScenario: PerformanceScenario = {
  name: 'Single Room Economy',
  description: 'Basic economy operations in a single RCL 4 room',
  setup: {
    rooms: ['W1N1'],
    rcl: 4,
    energy: 50000,
    sources: 2,
    creeps: {
      harvester: 2,
      carrier: 2,
      upgrader: 1,
      builder: 1
    }
  },
  targets: {
    maxCpuPerTick: 0.1,     // From ROADMAP.md Section 2
    avgCpuPerTick: 0.08,    // Target: 20% under max
    bucketStability: 9500   // Bucket should stay above 9500
  }
};
```

### Creating a New Test Scenario

**Step 1**: Define the scenario in `test/performance/scenarios.ts`:

```typescript
export const myCustomScenario: PerformanceScenario = {
  name: 'My Custom Test',
  description: 'Tests specific bot behavior',
  setup: {
    rooms: ['W1N1'],
    rcl: 5,
    energy: 100000,
    creeps: {
      // Define initial creep composition
      harvester: 3,
      upgrader: 2,
      builder: 1
    }
  },
  targets: {
    maxCpuPerTick: 0.15,
    avgCpuPerTick: 0.12,
    bucketStability: 9000
  }
};
```

**Step 2**: Add to the scenarios array:

```typescript
export const scenarios: PerformanceScenario[] = [
  singleRoomScenario,
  tenRoomEmpireScenario,
  combatDefenseScenario,
  myCustomScenario  // Add your scenario
];
```

**Step 3**: Update config.yml if needed:

```yaml
# config.yml - Add rooms and milestones for your scenario
rooms:
  W1N1:
    bot: bot

milestones:
  - name: "Custom Milestone"
    room: W1N1
    creeps: 10
```

**Step 4**: Run the test:

```bash
npm run test:performance:logs -- --maxTickCount=5000
```

### Test Types

#### 1. Baseline Performance Tests

Validate ROADMAP.md CPU targets for common scenarios:

```typescript
describe('Baseline: Economy Room', () => {
  it('should use ≤0.1 CPU per tick for eco room', async () => {
    // Test validates ROADMAP.md Section 2 target
    const metrics = await runPerformanceTest(singleRoomScenario);
    expect(metrics.avgCpu).toBeLessThanOrEqual(0.1);
  });
});
```

#### 2. Scaling Tests

Validate performance across multiple rooms:

```typescript
describe('Scaling: 10-Room Empire', () => {
  it('should handle 10 rooms with ≤1.5 CPU total', async () => {
    const metrics = await runPerformanceTest(tenRoomEmpireScenario);
    expect(metrics.avgCpu).toBeLessThanOrEqual(1.5);
  });
});
```

#### 3. Combat Tests

Validate combat performance under attack:

```typescript
describe('Combat: Defense', () => {
  it('should defend with ≤0.25 CPU per tick', async () => {
    const metrics = await runPerformanceTest(combatDefenseScenario);
    expect(metrics.avgCpu).toBeLessThanOrEqual(0.25);
  });
});
```

### Logging CPU Metrics

For performance tests to work, your bot must log CPU usage. The recommended approach:

**Option 1: Using Unified Stats** (recommended - already implemented):

```typescript
// src/stats/unifiedStats.ts already logs CPU metrics
// No action needed if using the unified stats system
```

**Option 2: Manual logging in main loop**:

```typescript
// src/main.ts
export function loop() {
  const startCpu = Game.cpu.getUsed();
  
  // Your bot logic here
  runBot();
  
  const endCpu = Game.cpu.getUsed();
  const used = endCpu - startCpu;
  
  // Log in a format that analyze-performance.js can parse
  console.log(`CPU: ${used.toFixed(3)} Bucket: ${Game.cpu.bucket}`);
}
```

**Option 3: JSON stats format**:

```typescript
console.log(JSON.stringify({
  type: 'stats',
  tick: Game.time,
  data: {
    cpu: {
      used: Game.cpu.getUsed(),
      bucket: Game.cpu.bucket
    }
  }
}));
```

The analysis script (`analyze-performance.js`) supports both formats.

---

## Interpreting Results

### Performance Report Structure

After running tests and analysis, you'll get a `performance-report.json`:

```json
{
  "timestamp": "2025-12-30T00:00:00Z",
  "commit": "abc123def456",
  "branch": "feature/optimization",
  "passed": true,
  "summary": {
    "avgCpu": "0.082",
    "maxCpu": "0.095",
    "p95Cpu": "0.090",
    "p99Cpu": "0.093",
    "avgBucket": "9500",
    "minBucket": "8200",
    "sampleCount": 5000
  },
  "regression": {
    "detected": false,
    "threshold": 0.10,
    "avgCpuChange": 0.025,
    "maxCpuChange": 0.018
  },
  "analysis": {
    "cpu": {
      "avg": 0.082,
      "max": 0.095,
      "min": 0.065,
      "median": 0.080,
      "p95": 0.090,
      "p99": 0.093
    },
    "bucket": {
      "avg": 9500,
      "min": 8200,
      "stable": true
    }
  }
}
```

### Key Metrics Explained

| Metric | Description | Good Value | Warning Value |
|--------|-------------|------------|---------------|
| **Avg CPU** | Average CPU per tick | < 0.08 | > 0.10 |
| **Max CPU** | Highest CPU usage | < 0.10 | > 0.12 |
| **P95 CPU** | 95th percentile | < 0.09 | > 0.11 |
| **P99 CPU** | 99th percentile | < 0.095 | > 0.115 |
| **Avg Bucket** | Average bucket level | > 9000 | < 8000 |
| **Min Bucket** | Lowest bucket level | > 5000 | < 2000 |
| **Sample Count** | Number of CPU samples | > 1000 | < 100 |

### Understanding Percentiles

- **P95**: 95% of ticks had CPU usage ≤ this value (5% were higher)
- **P99**: 99% of ticks had CPU usage ≤ this value (1% were higher)

These metrics help identify occasional CPU spikes that might not show up in averages.

### Regression Detection

A performance regression is flagged when:

1. **Average CPU** increases by more than 10% compared to baseline
2. **Maximum CPU** increases by more than 10% compared to baseline

**Example**:
- Baseline avg CPU: 0.080
- Current avg CPU: 0.089
- Change: +11.25% → **Regression detected** ❌

**Why 10%?**
- Small variations (1-5%) are normal due to test environment
- 10% threshold balances sensitivity vs. false positives
- Configurable in `analyze-performance.js` (REGRESSION_THRESHOLD)

### Status Indicators in PR Comments

When performance tests run on PRs, you'll see:

```markdown
## 📊 Performance Test Results

### Summary

| Metric | Value | Status |
|--------|-------|--------|
| Avg CPU | 0.075 | ✅ |
| Max CPU | 0.095 | ✅ |
| P95 CPU | 0.090 | ℹ️ |
| P99 CPU | 0.093 | ℹ️ |
| Avg Bucket | 9850 | ✅ |
| Min Bucket | 9200 | ✅ |

### ✅ No Performance Regression
Performance is within acceptable limits compared to baseline.
```

**Status Meanings**:
- ✅ **Pass**: Metric within target range
- ⚠️ **Warning**: Metric close to limit (90-100% of target)
- ❌ **Fail**: Metric exceeds target or regression detected
- ℹ️ **Info**: Informational metric (percentiles)

---

## Performance Baselines

### What are Baselines?

Baselines are "known good" performance values for each branch. They represent the expected performance and are used to detect regressions.

### Baseline Structure

Baselines are stored in `performance-baselines/`:

```
performance-baselines/
├── README.md           # Baseline documentation
├── main.json          # Production baseline
├── develop.json       # Development baseline
└── history/           # Historical snapshots
    ├── 2025-12-01_main_abc123.json
    └── 2025-12-28_main_def456.json
```

**Baseline format** (`main.json`):

```json
{
  "commit": "abc123def456",
  "timestamp": "2025-12-28T00:00:00Z",
  "branch": "main",
  "scenarios": {
    "default": {
      "avgCpu": 0.08,
      "maxCpu": 0.1,
      "p95Cpu": 0.095,
      "p99Cpu": 0.098
    },
    "Single Room Economy": {
      "avgCpu": 0.075,
      "maxCpu": 0.095,
      "p95Cpu": 0.090,
      "p99Cpu": 0.093
    }
  }
}
```

### Initial Baseline Values

Initial baselines are derived from ROADMAP.md Section 2 targets:

| Scenario | Avg CPU Target | Max CPU Target | Source |
|----------|---------------|----------------|--------|
| **Eco Room** | 0.08 | 0.10 | ROADMAP.md Section 2 |
| **War Room** | 0.20 | 0.25 | ROADMAP.md Section 2 |
| **10-Room Empire** | 1.20 | 1.50 | ROADMAP.md Section 2 |
| **Global Kernel** | 0.04 | 0.05 | ROADMAP.md Section 2 |

As real performance data is collected, these targets are replaced with actual measurements.

### Baseline Updates

Baselines are **automatically updated** when:

1. ✅ Tests pass on `main` or `develop` branches
2. ✅ No regression is detected
3. ✅ Performance report is generated successfully
4. ✅ CI workflow commits the updated baseline

**Workflow**:
```
PR merged to main
    ↓
Performance tests run
    ↓
Tests pass, no regression
    ↓
update-baseline.js runs
    ↓
Baseline updated
    ↓
Committed back to repo
    ↓
Historical snapshot archived
```

### Manual Baseline Update

To manually update a baseline:

```bash
# 1. Run performance test locally
npm run test:performance:logs

# 2. Analyze results
node scripts/analyze-performance.js

# 3. Update baseline for current branch
node scripts/update-baseline.js develop

# 4. Commit the updated baseline
git add performance-baselines/develop.json
git add performance-baselines/history/
git commit -m "chore(performance): update baseline for develop"
git push
```

### Baseline Comparison

When you run performance tests on a PR, the analysis script:

1. Detects the target branch (e.g., `main` or `develop`)
2. Loads the corresponding baseline file
3. Compares current results against baseline
4. Reports regression if change exceeds threshold (10%)

**Example comparison**:

```
Baseline (main.json):
  avgCpu: 0.080
  maxCpu: 0.100

Current Test:
  avgCpu: 0.089  (+11.25% ❌ REGRESSION)
  maxCpu: 0.095  (-5.00% ✅ OK)

Result: Regression detected due to avgCpu increase
```

### Historical Tracking

Every baseline update creates a historical snapshot in `performance-baselines/history/`:

```
2025-12-01_main_abc123.json
2025-12-15_main_def456.json
2025-12-28_main_ghi789.json
```

**Benefits**:
- Track performance trends over time
- Identify when regressions were introduced
- Compare performance across commits
- Analyze long-term degradation

---

## CI/CD Integration

### GitHub Actions Workflow

Performance tests are automatically triggered by `.github/workflows/performance-test.yml`:

**Triggers**:
- ✅ Pull requests that modify bot source code
- ✅ Pushes to `main` and `develop` branches
- ✅ Manual workflow dispatch

**Workflow Steps**:

```yaml
1. Checkout code
2. Setup Node.js 20
3. Install dependencies (npm ci)
4. Build all packages (npm run build)
5. Setup Docker
6. Run performance test with log capture
7. Upload logs as artifacts
8. Analyze performance results
9. Upload performance report
10. Comment on PR with results
11. Check for regressions (fail if detected)
12. Update baseline (main/develop only)
13. Commit baseline updates
```

### Viewing CI Results

**On Pull Requests**:

1. Navigate to your PR on GitHub
2. Scroll to the bottom to see CI checks
3. Look for "Performance Tests" check
4. Click "Details" to view workflow run
5. Performance report is posted as a PR comment

**Example PR Comment**:

```markdown
## 📊 Performance Test Results

**Branch**: `feature/optimize-pathfinding`
**Commit**: `abc123def456`
**Date**: 2025-12-30T00:00:00Z

### Summary

| Metric | Current | Baseline | Change | Status |
|--------|---------|----------|--------|--------|
| Avg CPU | 0.075 | 0.080 | -6.25% | ✅ |
| Max CPU | 0.095 | 0.100 | -5.00% | ✅ |
| P95 CPU | 0.090 | 0.095 | -5.26% | ℹ️ |
| P99 CPU | 0.093 | 0.098 | -5.10% | ℹ️ |
| Avg Bucket | 9850 | 9500 | +3.68% | ✅ |
| Min Bucket | 9200 | 8500 | +8.24% | ✅ |

### ✅ Performance Improved
CPU usage decreased by 6.25% - Great optimization! 🎉

**Sample Count**: 5,000 ticks
**Test Duration**: 8m 32s
```

### Downloading Artifacts

To download performance test artifacts from GitHub Actions:

1. Go to the **Actions** tab
2. Click on the **Performance Tests** workflow
3. Click on a specific run
4. Scroll to **Artifacts** section
5. Download:
   - `performance-test-logs`: Console and server logs
   - `performance-test-results`: Raw milestone results
   - `performance-report`: Analysis and regression data

### CI Configuration

**Customize test parameters** in workflow dispatch:

```yaml
# .github/workflows/performance-test.yml
workflow_dispatch:
  inputs:
    maxTickCount:
      description: 'Maximum number of ticks to run'
      default: '10000'
    maxTimeDuration:
      description: 'Maximum duration in minutes'
      default: '30'
```

**Run manually**:
1. Go to Actions tab
2. Select "Performance Tests" workflow
3. Click "Run workflow"
4. Enter custom parameters
5. Click "Run workflow" button

### Integration with Other Tools

**Grafana Integration** (optional):

```typescript
// scripts/export-to-grafana.js
import { pushMetrics } from './grafana-exporter';

const metrics = {
  'performance.test.avgCpu': report.analysis.cpu.avg,
  'performance.test.maxCpu': report.analysis.cpu.max,
  'performance.test.p95Cpu': report.analysis.cpu.p95,
  'performance.test.bucket': report.analysis.bucket.avg
};

await pushMetrics(metrics, {
  timestamp: Date.now(),
  tags: {
    branch: process.env.GITHUB_REF_NAME,
    commit: process.env.GITHUB_SHA
  }
});
```

**See**: [Grafana Integration](#grafana-integration-optional) for details.

---

## Best Practices

### When to Run Performance Tests

| Scenario | Frequency | Command |
|----------|-----------|---------|
| **Before PR** | Before creating PR | `npm run test:performance:logs` |
| **During Development** | After optimizations | `npm run test:performance -- --maxTickCount=5000` |
| **Regular Benchmarks** | Weekly | Full test suite via CI |
| **After Major Changes** | Before merge | Automated via CI on PR |

### Performance Testing Workflow

**1. Before Making Changes**:
```bash
# Establish baseline
npm run build
npm run test:performance:logs -- --maxTickCount=5000
mv performance-report.json baseline-before.json
```

**2. Make Your Changes**:
```bash
# Implement optimization
vim src/creep/movement.ts

# Build
npm run build
```

**3. Test Changes**:
```bash
# Run performance test
npm run test:performance:logs -- --maxTickCount=5000

# Compare results
node scripts/compare-performance.js baseline-before.json performance-report.json
```

**4. Validate**:
```bash
# Check for regressions
cat performance-report.json | jq '.regression.detected'

# If false, changes are good!
# If true, investigate and optimize further
```

### CPU Logging Best Practices

**DO**:
- ✅ Log CPU usage every tick
- ✅ Use consistent format (see examples above)
- ✅ Include bucket level
- ✅ Use the unified stats system (already implemented)

**DON'T**:
- ❌ Log only on errors (analysis needs regular samples)
- ❌ Use variable formats (breaks parsing)
- ❌ Log only every N ticks (reduces sample size)
- ❌ Forget to log in performance test environments

### Test Environment Consistency

**Keep tests reproducible**:
- Use fixed seed values where possible
- Test with consistent room configurations
- Run multiple iterations to average out variance
- Document environmental dependencies

**Example config.yml setup**:
```yaml
# Consistent test environment
serverConfig:
  tickRate: 100          # Fixed tick rate
  shardName: "shard0"    # Consistent shard

rooms:
  W1N1:                  # Same rooms every time
    bot: bot
```

### Performance Targets

Follow **ROADMAP.md Section 2** targets:

| System | Target | Maximum | Monitoring |
|--------|--------|---------|------------|
| **Eco Room** | 0.08 CPU/tick | 0.10 CPU/tick | Per-room stats |
| **War Room** | 0.20 CPU/tick | 0.25 CPU/tick | Per-room stats |
| **Global Kernel** | 0.04 CPU/tick | 0.05 CPU/tick | Global stats |
| **Bucket** | > 9000 | > 5000 | Always monitor |
| **Scale Target** | 100 rooms | 5000 creeps | Empire-wide |

**Optimization Priority**:
1. **Critical**: CPU > maximum (bucket draining)
2. **High**: CPU between target and maximum
3. **Medium**: CPU at target but room for improvement
4. **Low**: CPU well below target

### Regression Investigation

When a regression is detected:

**Step 1: Identify the culprit**
```bash
# Review PR diff
git diff main...feature-branch

# Look for performance-critical changes:
# - New loops or iterations
# - Additional pathfinding calls
# - Memory access patterns
# - Cache misses
```

**Step 2: Profile hot paths**
```typescript
// Add profiling to suspect code
const start = Game.cpu.getUsed();
suspectFunction();
const end = Game.cpu.getUsed();
console.log(`suspectFunction: ${(end - start).toFixed(3)} CPU`);
```

**Step 3: Compare metrics**
```bash
# Download artifacts from CI
# Compare before/after logs
diff baseline-before/console.log current/console.log
```

**Step 4: Fix and re-test**
```bash
# Apply optimization
npm run build
npm run test:performance:logs

# Verify improvement
node scripts/analyze-performance.js
```

### Baseline Hygiene

**DO**:
- ✅ Keep baselines up-to-date with latest performance
- ✅ Review baseline changes in PR reviews
- ✅ Document significant improvements
- ✅ Archive historical snapshots

**DON'T**:
- ❌ Commit degraded performance as new baseline
- ❌ Update baselines without running tests
- ❌ Ignore regression warnings
- ❌ Delete historical data

---

## Troubleshooting

### Common Issues

#### 1. Docker Container Fails to Start

**Symptoms**:
```
Error: Cannot connect to the Docker daemon
```

**Solutions**:
```bash
# Verify Docker is running
docker ps

# Check Docker Compose version
docker compose version

# Reset Docker environment
docker system prune -a

# Restart Docker service
sudo systemctl restart docker
```

#### 2. No CPU Metrics in Logs

**Symptoms**:
- `performance-report.json` shows 0 samples
- No "CPU:" lines in `console.log`

**Solutions**:
```bash
# Check if bot is logging CPU
cat logs/console.log | grep -i cpu

# If empty, add CPU logging to your bot
# See "Logging CPU Metrics" section

# Verify unified stats is enabled
grep -r "unifiedStats" src/

# Rebuild and test
npm run build
npm run test:performance:logs
```

#### 3. Performance Test Times Out

**Symptoms**:
```
Error: Test exceeded maximum duration
```

**Solutions**:
```bash
# Increase timeout
npm run test:performance -- --maxTimeDuration=60

# Or reduce tick count
npm run test:performance -- --maxTickCount=5000

# Check for infinite loops in logs
cat logs/console.log | tail -100
```

#### 4. Baseline Comparison Fails

**Symptoms**:
```
Warning: No baseline found for branch develop
```

**Solutions**:
```bash
# Check if baseline exists
ls -la ../../../performance-baselines/

# Create initial baseline manually
npm run test:performance:logs
node scripts/analyze-performance.js
cp performance-report.json ../../../performance-baselines/develop.json

# Or let CI create it on first merge
```

#### 5. Regression False Positives

**Symptoms**:
- Regression detected despite no code changes
- Inconsistent results across runs

**Solutions**:
```bash
# Run test multiple times
for i in {1..3}; do
  npm run test:performance:logs -- --maxTickCount=5000
  mv performance-report.json "report-$i.json"
done

# Compare variance
cat report-*.json | jq '.summary.avgCpu'

# If variance > 5%, consider:
# - Increasing sample size (more ticks)
# - Checking for non-deterministic behavior
# - Reviewing test environment consistency

# Update regression threshold if needed
vim scripts/analyze-performance.js
# Change REGRESSION_THRESHOLD from 0.10 to 0.15
```

#### 6. Missing Test Artifacts

**Symptoms**:
- CI workflow completes but artifacts are missing
- "if-no-files-found: warn" in logs

**Solutions**:
```bash
# Check workflow paths are correct
cat .github/workflows/performance-test.yml | grep -A 5 "upload-artifact"

# Verify files exist after test
npm run test:performance:logs
ls -la logs/
ls -la performance-report.json

# Check working directory in workflow
# Should be: packages/screeps-bot
```

### Debugging Tips

**Enable Debug Logging**:
```bash
npm run test:performance -- --debug
```

**Check Server Logs**:
```bash
# View server output
cat logs/server.log

# Filter for errors
cat logs/server.log | grep -i error

# Check Docker logs
docker logs $(docker ps -q)
```

**Inspect Console Output**:
```bash
# View all console output
cat logs/console.log

# Filter for CPU metrics
cat logs/console.log | grep CPU

# Check for errors
cat logs/console.log | grep -i error

# View last 50 lines
tail -50 logs/console.log
```

**Verify Bot Compilation**:
```bash
# Build and check output
npm run build
ls -la dist/

# Check for TypeScript errors
npm run build 2>&1 | grep error

# Verify main.js exists
test -f dist/main.js && echo "OK" || echo "MISSING"
```

**Test Locally with Docker**:
```bash
# Start performance server manually
cd packages/screeps-bot
npx screeps-performance-server --botFilePath=dist --debug

# In another terminal, watch logs
tail -f logs/console.log

# Stop server
# Ctrl+C in server terminal
```

---

## Advanced Topics

### Custom Test Parameters

Run tests with custom configuration:

```bash
# Short test (fast feedback)
npm run test:performance:logs -- \
  --maxTickCount=2000 \
  --maxTimeDuration=10

# Long test (comprehensive)
npm run test:performance:logs -- \
  --maxTickCount=50000 \
  --maxTimeDuration=60

# Custom ports (if conflicts)
npm run test:performance:logs -- \
  --serverPort=21030 \
  --cliPort=21031

# Force overwrite config
npm run test:performance:logs -- \
  --force \
  --deleteLogs
```

### Comparing Baselines

Compare performance between two commits:

```bash
# Compare current vs baseline
node scripts/analyze-performance.js

# Compare two specific baselines
node scripts/compare-baselines.js \
  performance-baselines/history/2025-12-01_main_abc123.json \
  performance-baselines/history/2025-12-28_main_def456.json
```

### Multi-Scenario Testing

Test multiple scenarios in sequence:

```typescript
// test/performance/run-all-scenarios.ts

import { scenarios } from './scenarios';

for (const scenario of scenarios) {
  console.log(`Testing: ${scenario.name}`);
  
  // Configure and run test
  await configureTest(scenario);
  await runTest(scenario);
  
  // Analyze results
  const results = await analyzeResults(scenario);
  console.log(`Results: ${JSON.stringify(results)}`);
}
```

### Grafana Integration (Optional)

Export performance metrics to Grafana for visualization:

**Step 1: Configure Grafana data source**

```typescript
// scripts/grafana-config.ts
export const grafanaConfig = {
  url: 'https://ralphschuler.grafana.net',
  apiKey: process.env.GRAFANA_API_KEY,
  datasource: 'Graphite'
};
```

**Step 2: Export metrics**

```typescript
// scripts/export-to-grafana.js
import { pushMetrics } from './grafana-exporter';

const report = JSON.parse(fs.readFileSync('performance-report.json', 'utf-8'));

const metrics = {
  'performance.test.avgCpu': report.analysis.cpu.avg,
  'performance.test.maxCpu': report.analysis.cpu.max,
  'performance.test.p95Cpu': report.analysis.cpu.p95,
  'performance.test.p99Cpu': report.analysis.cpu.p99,
  'performance.test.bucket.avg': report.analysis.bucket.avg,
  'performance.test.bucket.min': report.analysis.bucket.min
};

await pushMetrics(metrics, {
  timestamp: Date.now(),
  tags: {
    branch: process.env.GITHUB_REF_NAME,
    commit: process.env.GITHUB_SHA,
    scenario: 'default'
  }
});
```

**Step 3: Add to CI workflow**

```yaml
# .github/workflows/performance-test.yml
- name: Export to Grafana
  if: success()
  working-directory: packages/screeps-bot
  env:
    GRAFANA_API_KEY: ${{ secrets.GRAFANA_API_KEY }}
  run: node scripts/export-to-grafana.js
```

**Step 4: Create dashboard**

Create a Grafana dashboard to visualize:
- CPU usage trends over time
- Performance by branch
- Regression detection alerts
- Milestone achievement rates

**Existing dashboard**: [CPU & Performance Monitor](https://ralphschuler.grafana.net/public-dashboards/d0bc9548d02247889147e0707cc61e8f)

### Continuous Monitoring

Set up alerts for performance degradation:

```yaml
# grafana-alerts/performance-alerts.yml
groups:
  - name: performance_tests
    interval: 1h
    rules:
      - alert: PerformanceRegression
        expr: performance_test_avgCpu > 0.10
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Performance regression detected"
          description: "Avg CPU {{ $value }} exceeds target 0.10"
```

### CI/CD Pipeline Integration

**GitLab CI** example:

```yaml
# .gitlab-ci.yml
performance-test:
  stage: test
  script:
    - npm ci
    - npm run build
    - npm run test:performance:logs
  artifacts:
    paths:
      - packages/screeps-bot/logs/
      - packages/screeps-bot/performance-report.json
    expire_in: 30 days
```

**Jenkins** example:

```groovy
// Jenkinsfile
stage('Performance Test') {
  steps {
    sh 'npm ci'
    sh 'npm run build'
    sh 'npm run test:performance:logs'
  }
  post {
    always {
      archiveArtifacts artifacts: '**/performance-report.json'
      publishHTML([
        reportDir: 'packages/screeps-bot/logs',
        reportFiles: 'console.log',
        reportName: 'Performance Logs'
      ])
    }
  }
}
```

---

## Related Documentation

### In This Repository

- **[PERFORMANCE_TESTING.md](./PERFORMANCE_TESTING.md)**: Detailed technical reference
- **[PERFORMANCE_BASELINES.md](../../performance-baselines/README.md)**: Baseline documentation
- **[ROADMAP.md](../../ROADMAP.md)**: Performance targets and architecture
- **[screepsmod-testing/QUICK_START.md](../screepsmod-testing/QUICK_START.md)**: Testing mod guide
- **[screepsmod-testing/FEATURES.md](../screepsmod-testing/FEATURES.md)**: Testing mod features

### External Resources

- [ScreepsPerformanceServer GitHub](https://github.com/screepers/ScreepsPerformanceServer)
- [Screeps API Documentation](https://docs.screeps.com/)
- [screepsmod-server-stats](https://github.com/The-International-Screeps-Bot/screepsmod-server-stats)
- [Screeps Performance Guide](https://docs.screeps.com/contributed/modifying_prototypes.html)

---

## Contributing

When submitting performance-related PRs:

1. **Run tests locally** before creating PR
2. **Include performance results** in PR description
3. **Document optimizations** and expected impact
4. **Update baselines** if targets change
5. **Justify regressions** if they occur (e.g., correctness vs. performance)

**Example PR description**:

```markdown
## Performance Optimization: Path Caching

### Changes
- Implemented path caching with 5-tick TTL
- Reduced pathfinding calls by 80%
- Added LRU eviction for cache management

### Performance Impact
- **Before**: Avg CPU 0.095, Max CPU 0.120
- **After**: Avg CPU 0.075, Max CPU 0.095
- **Improvement**: -21% avg CPU, -20% max CPU

### Test Results
- ✅ All performance tests pass
- ✅ No regressions detected
- ✅ Bucket stability improved (+350 avg)

See performance-report.json artifact for details.
```

---

## Summary

### Quick Reference

| Task | Command |
|------|---------|
| **Build bot** | `npm run build` |
| **Quick test** | `npm run test:performance` |
| **Full test with logs** | `npm run test:performance:logs` |
| **Short test** | `npm run test:performance:logs -- --maxTickCount=5000` |
| **Debug mode** | `npm run test:performance -- --debug` |
| **Analyze results** | `node scripts/analyze-performance.js` |
| **Update baseline** | `node scripts/update-baseline.js develop` |
| **View logs** | `cat logs/console.log \| grep CPU` |

### Performance Targets (ROADMAP.md Section 2)

| System | Target | Maximum |
|--------|--------|---------|
| Eco Room | 0.08 CPU/tick | 0.10 CPU/tick |
| War Room | 0.20 CPU/tick | 0.25 CPU/tick |
| Global Kernel | 0.04 CPU/tick | 0.05 CPU/tick |
| Bucket | > 9000 | > 5000 |

### Key Files

| File | Purpose |
|------|---------|
| `test/performance/scenarios.ts` | Test scenario definitions |
| `scripts/analyze-performance.js` | Performance analysis |
| `scripts/update-baseline.js` | Baseline management |
| `performance-baselines/*.json` | Performance baselines |
| `.github/workflows/performance-test.yml` | CI automation |

### Getting Help

- **Issues**: Check [GitHub Issues](https://github.com/ralphschuler/screeps/issues)
- **Discussions**: See [GitHub Discussions](https://github.com/ralphschuler/screeps/discussions)
- **Documentation**: Review [PERFORMANCE_TESTING.md](./PERFORMANCE_TESTING.md)
- **Troubleshooting**: See [Troubleshooting](#troubleshooting) section above

---

**Last Updated**: 2025-12-30
**Version**: 1.0.0
**Maintainer**: ralphschuler/screeps contributors
