# Performance Testing

This bot includes automated performance testing using [ScreepsPerformanceServer](https://github.com/screepers/ScreepsPerformanceServer), which enables testing the bot's behavior in a controlled, self-contained environment with milestone tracking and performance metrics.

**Note:** Performance testing is completely self-contained within this bot package. It does not require or affect the `packages/screeps-server` package, which is a separate production server setup.

## Features

### 🎯 Performance Validation
- **Automated Testing**: CI/CD integration runs performance tests on every PR
- **Regression Detection**: Automatically detects >10% CPU increases
- **Baseline Tracking**: Historical performance data tracked in Git
- **PR Comments**: Performance reports posted directly on pull requests

### 📊 Metrics Collection
- CPU usage statistics (avg, max, p95, p99)
- Bucket stability monitoring
- Milestone tracking (RCL progression, creep counts)
- Comprehensive performance reports

### 🎮 Test Scenarios
- **Single Room Economy**: Tests basic operations (target: ≤0.1 CPU/tick)
- **10-Room Empire**: Tests scaling (target: ≤1.5 CPU/tick)
- **Combat Defense**: Tests combat response (target: ≤0.25 CPU/tick)

## Overview

Performance tests run the bot in a simulated Screeps server environment and track:
- Milestones reached (RCL progression, creep counts, structure counts)
- CPU usage and performance metrics
- Time to reach specific game states
- Overall bot effectiveness

## Running Performance Tests Locally

### Prerequisites

- Node.js 18.x or 20.x (LTS versions recommended)
- Docker and Docker Compose installed and running
- Built bot code (`npm run build`)

### Quick Start

1. **Build the bot:**
   ```bash
   npm run build
   ```

2. **Run performance test:**
   ```bash
   npm run test:performance
   ```

   This will start a local Screeps server and run your bot for up to 50,000 ticks (default) or until all milestones are reached.

### Custom Test Parameters

You can customize the performance test with command-line arguments:

```bash
npm run test:performance -- \
  --maxTickCount=10000 \
  --maxTimeDuration=30 \
  --serverPort=21025 \
  --cliPort=21026 \
  --deleteLogs \
  --force
```

**Available Options:**

- `--maxTickCount`: Maximum number of game ticks to run (default: 50000)
- `--maxTimeDuration`: Maximum duration in minutes (default: 60)
- `--maxBots`: Maximum number of bot instances to spawn (default: 5)
- `--serverPort`: Server port (default: 21025)
- `--cliPort`: CLI port (default: 21026)
- `--deleteLogs`: Delete logs folder on startup
- `--force`: Force overwrite of config files
- `--debug`: Enable debug logging

## Log Capture

The performance tests use a custom log capture script (`scripts/performance-test-with-logs.js`) that:

1. Starts the screeps-performance-server in the background
2. Connects to the Screeps API via WebSocket
3. Captures ALL console output (not just errors)
4. Writes logs to the `logs/` directory:
   - `console.log`: All bot console output
   - `server.log`: Performance server output and debug information

This ensures that the performance test artifacts contain actual bot output, not just empty log files.

### Running with Log Capture Locally

```bash
npm run test:performance:logs -- \
  --maxTickCount=5000 \
  --maxTimeDuration=15 \
  --debug
```

The `--debug` flag will also output server logs to the console for real-time monitoring.

## GitHub Actions Integration

Performance tests automatically run on:
- Pull requests that modify bot source code
- Pushes to `main` and `develop` branches
- Manual workflow dispatch

### Viewing Results

After a workflow run:
1. Go to the Actions tab in GitHub
2. Select the "Performance Tests" workflow
3. Click on a specific run
4. Download artifacts:
   - `performance-test-logs`: Contains `console.log` (bot console output) and `server.log` (server debug output)
   - `performance-test-results`: Milestone results and performance metrics (JSON format)

The `console.log` file contains timestamped bot console output with HTML tags removed for readability.

## Configuration

Performance test configuration is defined in `config.yml`:

### Milestones

Milestones track specific achievements during the test:

```yaml
milestones:
  - name: "RCL 2"
    room: W1N1
    level: 2
  - name: "10 Creeps"
    room: W1N1
    creeps: 10
```

**Milestone Types:**
- `level`: Room Control Level (1-8)
- `creeps`: Number of creeps in the room
- `structures`: Number of structures in the room

### Rooms

Configure which rooms the bot will spawn in:

```yaml
rooms:
  W1N1:
    bot: bot
  W2N1:
    bot: bot

trackedRooms:
  - W1N1
  - W2N1
```

### Server Configuration

Adjust server behavior:

```yaml
serverConfig:
  tickRate: 100          # Milliseconds per tick
  socketUpdateRate: 100
  shardName: "shard0"
```

## Interpreting Results

### Milestone Completion

The test tracks when each milestone is reached. A successful test should:
- Reach RCL 2-3 within 5,000 ticks
- Maintain stable creep population
- Progress through RCLs without stalling

### CPU Usage

Monitor CPU usage through:
- Server stats (`serverStats` in config)
- Exported metrics (if configured)
- Log output

### Common Issues

**Test times out:**
- Reduce `maxTickCount` or increase `maxTimeDuration`
- Check for infinite loops or stuck creeps in logs

**Bot doesn't spawn creeps:**
- Verify the bot builds correctly (`npm run build`)
- Check bot logic for spawn conditions
- Review server logs for errors

**Milestones not reached:**
- May indicate bot logic issues
- Check resource management
- Verify room planning and building

## Advanced Usage

### Custom Bot Path

Test a specific bot build:

```bash
npm run test:performance -- --botFilePath=dist/custom
```

### Exporting Results

Configure result export in `config.yml`:

```yaml
# Example: Export to Discord
discordWebHookUrl: "https://discord.com/api/webhooks/..."
discordUsername: "Performance Test Bot"

# Example: Export to GitHub
githubOwner: "your-username"
githubRepo: "your-repo"
githubAuth: "github_token"
```

### Debug Mode

Enable verbose logging:

```bash
npm run test:performance -- --debug
```

## Integration with CI/CD

The performance test workflow (`performance-test.yml`) can be customized for your CI/CD pipeline:

```yaml
- name: Run performance test
  run: |
    npm run test:performance -- \
      --maxTickCount=5000 \
      --maxTimeDuration=15 \
      --deleteLogs
```

Adjust tick counts and duration based on your testing needs and CI/CD time constraints.

## Related Documentation

- [ScreepsPerformanceServer GitHub](https://github.com/screepers/ScreepsPerformanceServer)
- [Screeps API Documentation](https://docs.screeps.com/)
- [screepsmod-server-stats](https://github.com/The-International-Screeps-Bot/screepsmod-server-stats)

## Performance Validation System

### Automated Performance Testing

The CI/CD pipeline automatically runs performance tests on:
- **Pull Requests**: Tests run when bot source code changes
- **Main/Develop Pushes**: Baselines are updated after successful tests
- **Manual Triggers**: Tests can be run on-demand via workflow dispatch

### Performance Metrics

Tests collect and analyze:
- **CPU Usage**: Average, maximum, p95, p99 percentiles
- **Bucket Stability**: Tracks bucket levels over time
- **Milestones**: RCL progression and bot achievements

### Regression Detection

Performance regressions are automatically detected:
- **Threshold**: 10% increase in CPU usage triggers a regression
- **Comparison**: Current performance vs. baseline for the target branch
- **Action**: CI fails and PR receives a warning comment

### Performance Baselines

Baseline performance data is tracked in `performance-baselines/`:
- `main.json`: Production baseline (updated on merges to main)
- `develop.json`: Development baseline (updated on merges to develop)

Baselines are automatically updated after successful test runs on protected branches.

## CI/CD Integration

### GitHub Actions Workflow

The `.github/workflows/performance-test.yml` workflow:

1. **Builds** the bot code
2. **Runs** performance tests with log capture
3. **Analyzes** results and generates reports
4. **Compares** against baseline for regressions
5. **Comments** on PRs with performance summary
6. **Updates** baselines on main/develop branches

### Viewing Results

After a workflow run:

1. Go to the **Actions** tab in GitHub
2. Select the **Performance Tests** workflow
3. Click on a specific run
4. View the **performance report** in PR comments (for PRs)
5. Download artifacts:
   - `performance-test-logs`: Console and server logs
   - `performance-test-results`: Raw milestone results
   - `performance-report`: Analysis and regression detection

### PR Comments

Performance tests automatically post results to PRs:

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

## Performance Scenarios

### Current Scenarios

The bot is tested against three scenarios defined in `test/performance/scenarios.ts`:

#### 1. Single Room Economy
- **Target**: ≤0.1 CPU per tick
- **Setup**: RCL 4, 2 sources, basic creeps
- **Tests**: Core economic operations

#### 2. 10-Room Empire
- **Target**: ≤1.5 CPU per tick
- **Setup**: 10 rooms with varying RCLs, ~150 creeps
- **Tests**: Multi-room scaling and coordination

#### 3. Combat Defense
- **Target**: ≤0.25 CPU per tick
- **Setup**: RCL 7, 3 towers, hostile creeps
- **Tests**: Tower defense and combat response

### Creating Custom Scenarios

To add new scenarios:

1. Edit `test/performance/scenarios.ts`
2. Define a new `PerformanceScenario` object:

```typescript
export const myScenario: PerformanceScenario = {
  name: 'My Test Scenario',
  description: 'Description of what this tests',
  setup: {
    rooms: ['W1N1'],
    rcl: 5,
    energy: 100000,
    // ... other setup parameters
  },
  targets: {
    maxCpuPerTick: 0.15,
    avgCpuPerTick: 0.12,
    bucketStability: 9000
  }
};
```

3. Add to the `scenarios` array
4. Update baselines in `performance-baselines/` with new scenario data

## Baseline Management

### Understanding Baselines

Baselines represent "known good" performance values. Each branch has its own baseline:

- **main.json**: Production performance expectations
- **develop.json**: Development branch expectations

### Baseline Structure

```json
{
  "commit": "abc123...",
  "timestamp": "2025-12-27T00:00:00Z",
  "branch": "main",
  "scenarios": {
    "default": {
      "avgCpu": 0.08,
      "maxCpu": 0.1,
      "p95Cpu": 0.095,
      "p99Cpu": 0.098
    }
  }
}
```

### Updating Baselines

Baselines are updated automatically when:
1. Tests pass on main/develop branches
2. No regression is detected
3. The workflow commits the updated baseline back to the repository

To manually update a baseline:

```bash
# Run performance test
npm run test:performance:logs

# Analyze results
node scripts/analyze-performance.js

# Update baseline for current branch
node scripts/update-baseline.js <branch-name>

# Commit the updated baseline
git add performance-baselines/<branch>.json
git commit -m "chore(performance): update baseline"
```

### Initial Baselines

Initial baseline values are derived from ROADMAP.md targets:
- Eco room: ≤0.1 CPU per tick
- Combat room: ≤0.25 CPU per tick
- Multi-room: ≤1.5 CPU per tick

Real performance data will override these as tests run.

## Grafana Integration (Optional)

### Exporting Metrics

To export performance metrics to Grafana:

1. Configure Grafana data source (Prometheus or Graphite)
2. Create export script (see example below)
3. Add export step to CI workflow

Example export script:

```typescript
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

### Grafana Dashboard

Create dashboards to visualize:
- CPU usage trends over time
- Performance by branch
- Regression detection alerts
- Milestone achievement rates

## Troubleshooting

### Tests Fail to Complete

**Problem**: Performance test times out or doesn't complete

**Solutions**:
- Increase `maxTickCount` or `maxTimeDuration`
- Check Docker logs for errors
- Verify bot builds successfully
- Review server logs in test artifacts

### No CPU Metrics in Report

**Problem**: Analysis shows 0 CPU samples

**Solutions**:
- Ensure bot logs CPU usage to console
- Add `console.log('CPU:', Game.cpu.getUsed())` to main loop
- Verify log capture is working (check console.log artifact)

### Regression False Positives

**Problem**: Regression detected despite no code changes

**Solutions**:
- Check if baseline is outdated
- Review if test environment changed
- Consider increasing regression threshold (currently 10%)
- Run test multiple times to verify consistency

### Baseline Not Updating

**Problem**: Baseline file not updated after merge

**Solutions**:
- Check workflow permissions (needs write access)
- Verify test passed without regression
- Review workflow logs for errors
- Manually update baseline if needed

## Best Practices

### CPU Logging

Add CPU logging to your main loop:

```typescript
export function loop() {
  const startCpu = Game.cpu.getUsed();
  
  // Your bot logic here
  
  const endCpu = Game.cpu.getUsed();
  const used = endCpu - startCpu;
  
  console.log(`CPU: ${used.toFixed(3)} Bucket: ${Game.cpu.bucket}`);
}
```

### Performance Targets

Follow ROADMAP.md targets:
- **Economy rooms**: ≤0.1 CPU/tick
- **Combat rooms**: ≤0.25 CPU/tick
- **Global operations**: ≤1 CPU every 20-50 ticks
- **Bucket**: Maintain >9000 for stability

### Regression Investigation

When regression is detected:

1. Review the PR diff for performance-critical changes
2. Check CPU metrics by operation type
3. Profile hot code paths
4. Consider CPU optimizations (caching, batching)
5. Run local performance tests to validate fixes

### Baseline Hygiene

- Keep baselines up-to-date with current performance
- Don't commit degraded performance as new baseline
- Review baseline changes in PR reviews
- Document significant performance improvements

## Performance Testing Scripts

### scripts/performance-test-with-logs.js

Runs the performance server with full log capture:
- Starts screeps-performance-server
- Connects to API via WebSocket
- Captures all console output
- Writes logs to `logs/` directory

### scripts/analyze-performance.js

Analyzes performance test results:
- Parses CPU metrics from logs
- Calculates statistics (avg, max, percentiles)
- Compares against baseline
- Detects regressions
- Generates JSON and Markdown reports

### scripts/update-baseline.js

Updates performance baselines:
- Loads performance report
- Validates test passed
- Updates baseline file
- Only runs for main/develop branches


## Interpreting Performance Reports

### Understanding the Results

When performance tests complete, you'll see reports in two formats:

#### JSON Report (performance-report.json)

```json
{
  "timestamp": "2025-12-28T12:00:00Z",
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
    "detected": false
  }
}
```

#### Markdown Report (in PR comments)

The PR comment shows:
- **Summary Table**: Key metrics with pass/fail status
- **Regression Details**: If detected, shows current vs baseline
- **Milestones**: Bot achievements during the test

### Key Metrics Explained

| Metric | Description | Good Value | Warning Value |
|--------|-------------|------------|---------------|
| **Avg CPU** | Average CPU per tick | < 0.08 | > 0.10 |
| **Max CPU** | Highest CPU usage | < 0.10 | > 0.12 |
| **P95 CPU** | 95th percentile | < 0.09 | > 0.11 |
| **P99 CPU** | 99th percentile | < 0.095 | > 0.115 |
| **Avg Bucket** | Average bucket level | > 9000 | < 8000 |
| **Min Bucket** | Lowest bucket level | > 5000 | < 2000 |

### What Triggers a Regression?

A performance regression is flagged when:
1. **Average CPU** increases by more than 10% compared to baseline
2. **Maximum CPU** increases by more than 10% compared to baseline

Example:
- Baseline avg CPU: 0.080
- Current avg CPU: 0.089
- Change: +11.25% → **Regression detected** ❌

### Performance Trends

Historical performance data is stored in `performance-baselines/history/`:
- Each successful test creates a timestamped snapshot
- Trends can be analyzed across commits
- Long-term degradation can be detected

## Troubleshooting

### Common Issues

#### 1. Docker Container Fails to Start

**Symptoms**: Performance test hangs or fails with Docker errors

**Solutions**:
```bash
# Verify Docker is running
docker ps

# Check Docker Compose
docker compose version

# Reset Docker environment
docker system prune -a
```

#### 2. No CPU Metrics in Logs

**Symptoms**: Performance report shows 0 samples or missing CPU data

**Solutions**:
- Ensure bot is logging CPU usage (check `unifiedStats.ts`)
- Verify log capture is working (check `logs/console.log`)
- Increase test duration to allow more samples

#### 3. Performance Test Times Out

**Symptoms**: Test exceeds maximum duration

**Solutions**:
```bash
# Increase timeout
npm run test:performance -- --maxTimeDuration=60

# Or reduce tick count
npm run test:performance -- --maxTickCount=5000
```

#### 4. Baseline Comparison Fails

**Symptoms**: No baseline found for comparison

**Solutions**:
```bash
# Check if baseline exists
ls -la ../../../performance-baselines/

# Create initial baseline manually
cp performance-report.json ../../../performance-baselines/develop.json
```

### Debugging Tips

1. **Enable Debug Logging**:
   ```bash
   npm run test:performance -- --debug
   ```

2. **Check Server Logs**:
   ```bash
   cat logs/server.log
   ```

3. **Inspect Console Output**:
   ```bash
   cat logs/console.log | grep CPU
   ```

4. **Verify Bot Compilation**:
   ```bash
   npm run build
   ls -la dist/
   ```

## Advanced Usage

### Custom Performance Scenarios

To add custom test scenarios, edit `test/performance/scenarios.ts`:

```typescript
export const myCustomScenario: PerformanceScenario = {
  name: 'My Custom Test',
  description: 'Tests specific bot behavior',
  setup: {
    rooms: ['W1N1'],
    rcl: 5,
    energy: 100000,
    creeps: {
      harvester: 3,
      upgrader: 2
    }
  },
  targets: {
    maxCpuPerTick: 0.15,
    avgCpuPerTick: 0.12
  }
};
```

### Comparing Baselines

To compare performance between two commits:

```bash
# Compare current vs baseline
node scripts/analyze-performance.js

# Compare two specific baselines
node scripts/compare-baselines.js \
  performance-baselines/history/2025-12-01_main_abc123.json \
  performance-baselines/history/2025-12-28_main_def456.json
```

### CI/CD Integration Examples

#### GitHub Actions

Already configured in `.github/workflows/performance-test.yml`

#### GitLab CI

```yaml
performance-test:
  stage: test
  script:
    - npm ci
    - npm run build
    - npm run test:performance
  artifacts:
    paths:
      - packages/screeps-bot/logs/
      - packages/screeps-bot/performance-report.json
    expire_in: 30 days
```

#### Jenkins

```groovy
stage('Performance Test') {
  steps {
    sh 'npm ci'
    sh 'npm run build'
    sh 'npm run test:performance'
  }
  post {
    always {
      archiveArtifacts artifacts: '**/performance-report.json'
    }
  }
}
```

## Performance Monitoring Integration

### Grafana Alerts

Automated alerts are configured for:
- **CPU Budget Violations**: Eco rooms > 0.1, War rooms > 0.25
- **CPU Bucket Critical**: Bucket < 2000
- **Kernel Overhead**: Global kernel > 0.05 CPU/tick

See `grafana-alerts/` directory for alert configuration.

### Real-time Monitoring

Monitor live performance via Grafana dashboards:
- [CPU & Performance Monitor](https://ralphschuler.grafana.net/public-dashboards/d0bc9548d02247889147e0707cc61e8f)
- Metrics updated every tick
- Historical data retention: 90 days

## Best Practices

### Running Tests

1. **Before Creating PR**: Run tests locally to catch issues early
2. **After Optimization**: Compare before/after performance
3. **Regular Benchmarks**: Run weekly to detect gradual degradation
4. **Multiple Scenarios**: Test different room configurations

### Baseline Management

1. **Update Regularly**: Keep baselines current with main/develop
2. **Document Changes**: Note significant performance improvements
3. **Review History**: Check trends before major changes
4. **Archive Milestones**: Save baselines for release versions

### Performance Goals

From ROADMAP.md Section 2:
- **Eco Room**: ≤ 0.1 CPU per tick (target: 0.08)
- **War Room**: ≤ 0.25 CPU per tick (target: 0.20)
- **Global Kernel**: ≤ 1 CPU every 20-50 ticks (≤ 0.05 avg)
- **Scalability**: Support 100+ rooms, 5000+ creeps

## Contributing

When submitting performance-related PRs:

1. **Run Tests**: Include performance test results
2. **Document Changes**: Explain optimization techniques
3. **Baseline Impact**: Note expected baseline changes
4. **Regression Analysis**: If regression occurs, justify why

## Additional Resources

- [ROADMAP.md](../../ROADMAP.md) - Performance targets and architecture
- [grafana-alerts/](../../grafana-alerts/) - Alert configuration
- [performance-baselines/](../../performance-baselines/) - Historical data
- [Screeps Performance Guide](https://docs.screeps.com/contributed/modifying_prototypes.html)
