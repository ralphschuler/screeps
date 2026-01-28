# Strategic Planning Performance Baselines

This directory contains performance baseline snapshots captured during strategic planning analysis runs. These baselines enable **7-day rolling baseline comparison**, trend analysis, regression detection, and evidence-based strategic decision making.

## Purpose

Strategic planning baselines serve a different purpose than test scenario baselines:

- **Test Baselines** (`../main.json`, `../develop.json`): Controlled test scenarios with predictable conditions
- **Strategic Baselines**: Real-world production metrics from live game state with rolling baseline analysis

## 7-Day Rolling Baseline System

The rolling baseline system provides:
- **Contextual Analysis**: Understand if changes are significant vs normal variance
- **Automated Detection**: Catch regressions without manual comparison  
- **Trend Visibility**: See performance drift over time
- **Health Scoring**: Single metric (0-100) for bot health

### How It Works

1. **Baseline Collection**: Each strategic planning run saves a performance snapshot
2. **Rolling Calculation**: The system loads the last 7 days of baselines and calculates:
   - Mean (μ) - Average value across window
   - Standard Deviation (σ) - Measure of variance
   - Percentiles (P50, P95, P99) - Distribution understanding
3. **Regression Detection**: Compares current metrics against rolling baseline using statistical thresholds:
   - **Warning**: μ ± 1σ
   - **Critical**: μ ± 2σ
4. **Health Score**: Calculates overall bot health (0-100) based on detected regressions
5. **Trend Analysis**: Determines if performance is improving, degrading, or stable

### Enhanced Baseline Format

Baselines now include comparison data:

```json
{
  "timestamp": "2026-01-28T21:00:00.000Z",
  "gameTime": 45123456,
  "commit": "abc123...",
  "branch": "main",
  "metrics": { /* PerformanceSnapshot */ },
  
  "comparisonBaseline": {
    "avg7d": {
      "cpu": { "avg": 85.0, "stdDev": 3.0, "p50": 84.5, "p95": 90.0, "p99": 92.0 },
      "gcl": { "avgRate": 0.015, "minRate": 0.013, "maxRate": 0.017 },
      "errors": { "avgRate": 0.02, "minRate": 0.01, "maxRate": 0.05 }
    },
    "stdDev": { /* Standard deviations for all metrics */ },
    "trend": "improving|degrading|stable"
  },
  
  "detectedChanges": {
    "regressions": [
      {
        "type": "cpu",
        "severity": "high",
        "description": "CPU usage 15.2% above threshold",
        "current": 95.0,
        "baseline": 85.0,
        "percentChange": 11.8,
        "threshold": 88.0
      }
    ],
    "improvements": [ /* Improvement[] */ ],
    "healthScore": 85
  }
}
```

### Regression Detection Thresholds

- **CPU Regression**: avg + 1σ, critical if >15% above threshold
- **GCL Stall**: avg - 1σ, critical if >20% below baseline
- **Error Rate**: avg + 2σ, critical if >1.0/tick
- **Room Loss**: >10% drop with 2σ threshold
- **Creep Loss**: >20% drop with 2σ threshold

### Trend Reports

Each baseline includes a markdown trend report:

**File**: `{timestamp}_{runId}_report.md`

**Contents**:
- 7-Day Rolling Average Summary (CPU, GCL, Errors, Rooms, Creeps)
- Current vs Baseline Comparison
- Detected Regressions (by severity: Critical, High, Medium, Low)
- Detected Improvements
- Overall Trend Analysis
- Health Score

## Structure

Baselines are stored as JSON files with the naming convention:

```
YYYY-MM-DDTHH-MM-SS-sssZ_<run-id>.json
```

Example: `2026-01-15T10-30-00-000Z_12345678.json`

The filename is generated using `new Date().toISOString().replace(/[:.]/g, '-')` which converts the ISO timestamp (e.g., `2026-01-15T10:30:00.000Z`) to a filesystem-safe format by replacing colons and periods with hyphens.

## Format

Each baseline file contains a complete performance snapshot:

```json
{
  "timestamp": "2026-01-15T10:30:00.000Z",
  "gameTime": 45123456,
  "commit": "abc123def456...",
  "branch": "main",
  "metrics": {
    "cpu": {
      "current": 85.5,
      "limit": 100,
      "bucket": 8500,
      "avg24h": 82.3,
      "p95_24h": 95.2,
      "peak24h": 98.7
    },
    "gcl": {
      "level": 8,
      "progress": 0.42,
      "progressRate": 0.015,
      "estimatedTicksToNext": 38667
    },
    "rooms": {
      "total": 12,
      "byRCL": {
        "8": 3,
        "7": 4,
        "6": 2,
        "5": 3
      },
      "avgCPU": 7.1,
      "avgRCL": 6.8,
      "underThreat": 0
    },
    "creeps": {
      "total": 487,
      "byRole": {
        "harvester": 120,
        "hauler": 85,
        "upgrader": 60,
        "builder": 40,
        "repairer": 35,
        "scout": 25,
        "claimer": 2,
        "defender": 15,
        "remote_miner": 105
      },
      "avgPerRoom": 40.6,
      "idle": 8
    },
    "errors": {
      "last24h": 23,
      "currentRate": 0.025,
      "topErrors": [
        {
          "message": "PathFinder timeout in W1N1",
          "count": 12,
          "lastSeen": "2026-01-15T10:25:00.000Z"
        },
        {
          "message": "Terminal cooldown not checked",
          "count": 8,
          "lastSeen": "2026-01-15T10:28:00.000Z"
        }
      ]
    },
    "energy": {
      "incomePerTick": 125.5,
      "spendingPerTick": 118.2,
      "netPerTick": 7.3,
      "totalStored": 1250000,
      "avgPerRoom": 104167
    }
  },
  "issuesCreated": ["#2880", "#2881"],
  "issuesUpdated": ["#2750"],
  "recommendations": [
    "Optimize pathfinding cache in W1N1",
    "Add terminal cooldown checks",
    "Increase upgrader count in RCL 8 rooms"
  ],
  "runId": "12345678",
  "runUrl": "https://github.com/ralphschuler/screeps/actions/runs/12345678"
}
```

## Data Collection

Baselines are automatically created during strategic planning workflow runs:

1. **screeps-mcp queries**:
   - `screeps_stats` → CPU, GCL, bucket, entity counts
   - `screeps_user_rooms` → Room ownership, RCL distribution
   - `screeps_game_time` → Current tick number

2. **grafana-mcp queries**:
   - `query_prometheus` → 24h CPU trends, GCL progression
   - `query_loki_logs` → Error patterns and rates
   - `search_dashboards` → Dashboard links for evidence

3. **Memory inspection**:
   - `screeps_memory_get` → Bot memory state analysis

## Trend Analysis

The strategic planning agent compares the current snapshot against recent baselines:

### 7-Day Rolling Average

The agent calculates 7-day averages for key metrics:
- CPU usage (avg, p95, peak)
- GCL progression rate
- Error rate
- Energy income/spending

### Regression Detection

Automatic regression detection with severity levels:

| Metric | Threshold | Severity | Auto-Issue |
|--------|-----------|----------|------------|
| CPU usage | >15% increase | Critical | Yes |
| GCL progress | <0.01/tick for 48h | High | Yes |
| Error rate | >10 errors/tick | Critical | Yes |
| Energy income | >20% decrease | High | Yes |
| Bucket level | <5000 sustained | Critical | Yes |

### Improvement Detection

Positive trends are also tracked:
- CPU optimization (>10% reduction)
- GCL acceleration (>20% increase in rate)
- Error reduction (>50% decrease)
- Energy efficiency gains

## Usage by Strategic Planning Agent

The agent uses baselines to:

1. **Establish context**: Compare current state to historical trends
2. **Detect anomalies**: Identify sudden changes or regressions
3. **Prioritize issues**: Focus on areas with degrading performance
4. **Measure impact**: Track before/after metrics for improvements
5. **Learn patterns**: Refine strategic decisions based on outcomes

## Running Rolling Baseline Analysis

The 7-day rolling baseline analysis is integrated into the strategic metrics collection workflow. It can also be run standalone:

### Automatic Integration

The rolling baseline analysis runs automatically during strategic planning:

```bash
# Collect metrics (saves to performance-baselines/strategic/collected-metrics.json)
node scripts/collect-strategic-metrics.mjs

# Run rolling baseline analysis (generates enhanced baseline + trend report)
node scripts/strategic/integrate-rolling-baseline.mjs
```

**Output Files**:
- `{timestamp}_{runId}.json` - Enhanced baseline with comparison data
- `{timestamp}_{runId}_report.md` - Markdown trend report

### Manual Analysis

Run analysis on any baseline file:

```bash
# Analyze specific baseline
ROLLING_DAYS=7 node scripts/strategic/integrate-rolling-baseline.mjs \
  performance-baselines/strategic/collected-metrics.json

# Use different rolling window
ROLLING_DAYS=30 node scripts/strategic/integrate-rolling-baseline.mjs \
  performance-baselines/strategic/collected-metrics.json
```

### Environment Variables

- `BASELINES_DIR` - Directory containing baselines (default: `performance-baselines/strategic`)
- `ROLLING_DAYS` - Rolling window size in days (default: 7)
- `GITHUB_SHA` - Git commit hash (for metadata)
- `GITHUB_REF_NAME` - Git branch name (for metadata)
- `VERBOSE` - Enable verbose logging

### Interpreting Results

**Health Score**:
- **90-100** 🟢 Excellent - All metrics within expected range
- **75-89** 🟡 Good - Minor variations, no action needed
- **50-74** 🟠 Concerning - Some regressions detected, investigate
- **0-49** 🔴 Critical - Significant regressions, immediate action required

**Trend Analysis**:
- **Improving** 📈 - Overall performance getting better
- **Stable** ➡️ - Performance consistent with baseline
- **Degrading** 📉 - Overall performance declining

**Regression Severity**:
- **Critical** - Immediate action required (e.g., CPU >95, bucket draining)
- **High** - Should be addressed soon (e.g., GCL stall, significant CPU increase)
- **Medium** - Monitor and address when convenient
- **Low** - Informational, may not require action

## Example Queries

### Get Latest Baseline

```bash
ls -t /home/runner/work/screeps/screeps/performance-baselines/strategic/*.json | head -1
```

### Calculate 7-Day Average CPU

```bash
# Get last 7 days of baselines
find . -name "*.json" -mtime -7 | \
  xargs jq -s 'map(.metrics.cpu.avg24h) | add / length'
```

### Detect CPU Regression

```typescript
const current = getCurrentSnapshot();
const baseline = get7DayAverage();

if (current.cpu.avg24h > baseline.cpu.avg24h * 1.15) {
  createIssue({
    title: 'perf(cpu): CPU regression detected',
    severity: 'critical',
    evidence: {
      current: current.cpu.avg24h,
      baseline: baseline.cpu.avg24h,
      increase: ((current.cpu.avg24h / baseline.cpu.avg24h - 1) * 100).toFixed(1) + '%'
    }
  });
}
```

## Retention Policy

- **Keep indefinitely**: Monthly snapshots (1st of each month)
- **Keep 90 days**: Weekly snapshots (first run of each week)
- **Keep 30 days**: All daily snapshots
- **Keep 7 days**: All snapshots (6-hour intervals)

Older files are automatically pruned by cleanup workflow.

## Integration with Grafana

Baseline data can be exported to Grafana for visualization:

1. Create time-series metrics from baseline files
2. Push to Prometheus/Graphite
3. Create dashboards for:
   - CPU trend over time
   - GCL progression rate
   - Error rate tracking
   - Room count growth
   - Creep population trends

See `scripts/export-baselines-to-grafana.sh` for automation.

## Maintenance

### Manual Baseline Creation

To create a baseline manually:

```bash
# Run strategic planning workflow
gh workflow run copilot-strategic-planner.yml

# Or use the script
./scripts/create-strategic-baseline.sh
```

### Baseline Validation

To validate baseline file format:

```bash
# Check JSON validity
jq empty performance-baselines/strategic/*.json

# Validate schema
node scripts/validate-baseline-schema.js
```

## Troubleshooting

### Missing Data

If a baseline is missing expected data:
- Check MCP server connectivity in workflow logs
- Verify environment variables (SCREEPS_TOKEN, GRAFANA_SERVICE_ACCOUNT_TOKEN)
- Ensure screeps-mcp and grafana-mcp servers are configured

### Incorrect Trends

If trend analysis seems wrong:
- Verify baseline timestamps are correct
- Check for gaps in baseline history
- Ensure game time is advancing (not paused)
- Validate Grafana query time ranges

## See Also

- [Strategic Planning Agent Instructions](../../.github/agents/strategic-planner.agent.md)
- [Strategic Planning Workflow](../../.github/workflows/copilot-strategic-planner.yml)
- [Performance Types](../../packages/screeps-bot/test/performance/strategic-types.ts)
- [Test Baselines](../README.md)
