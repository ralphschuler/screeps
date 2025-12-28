# Performance History

This directory contains historical performance baseline data, tracking how the bot's performance has evolved over time.

## Structure

Each file represents a snapshot of performance metrics at a specific point in time:

```
history/
├── 2025-12-28_main_abc123.json       # Snapshot from main branch
├── 2025-12-28_develop_def456.json    # Snapshot from develop branch
└── README.md                          # This file
```

## File Naming Convention

Files are named using the pattern: `YYYY-MM-DD_<branch>_<commit-short>.json`

Example: `2025-12-28_main_a1b2c3d.json`

## Data Format

Each historical snapshot contains:

```json
{
  "timestamp": "2025-12-28T12:00:00Z",
  "commit": "a1b2c3d4e5f6...",
  "branch": "main",
  "pr": 123,
  "scenarios": {
    "default": {
      "avgCpu": 0.08,
      "maxCpu": 0.1,
      "p95Cpu": 0.095,
      "p99Cpu": 0.098
    },
    "Single Room Economy": { ... },
    "10-Room Empire": { ... },
    "Combat Defense": { ... }
  },
  "metadata": {
    "nodeVersion": "20.x",
    "testDuration": "30m",
    "tickCount": 10000
  }
}
```

## Automatic Updates

Historical snapshots are automatically created:
- On successful performance test runs on main/develop
- After merging PRs that pass performance tests
- By the `update-baseline.js` script in CI/CD

## Analyzing Trends

To analyze performance trends over time:

```bash
# Generate trend report
node scripts/performance-trends.js

# Compare two snapshots
node scripts/compare-baselines.js \
  performance-baselines/history/2025-12-01_main_abc123.json \
  performance-baselines/history/2025-12-28_main_def456.json
```

## Retention Policy

- Keep all snapshots from main/develop branches
- Keep snapshots from last 90 days for all branches
- Archive older snapshots to reduce repository size
- Critical milestones (v1.0.0, v2.0.0, etc.) are never deleted

## Visualizations

Performance trends can be visualized:
- In Grafana dashboards (using historical data)
- In PR comments (showing trend over last 10 commits)
- In README badges (current vs historical average)

## Data Points Tracked

For each snapshot, we track:
- **CPU Metrics**: avg, max, p95, p99 CPU per tick
- **Bucket Metrics**: avg, min bucket levels
- **Scenario Metrics**: Performance per test scenario
- **Git Metadata**: commit SHA, branch, PR number
- **Environment**: Node version, test parameters

## Usage in CI/CD

The CI/CD pipeline uses historical data to:
1. Detect long-term performance degradation
2. Show trends in PR comments
3. Update performance badges in README
4. Generate monthly performance reports

## Manual Snapshots

To create a manual snapshot:

```bash
# Run performance test
npm run test:performance

# Create snapshot
node scripts/create-snapshot.js --branch main --commit $(git rev-parse HEAD)
```
