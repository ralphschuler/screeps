# Strategic Performance Analysis - 7-Day Rolling Baseline

This directory contains the implementation of the 7-day rolling baseline comparison system for strategic planning.

## Overview

The rolling baseline system provides:
- **Contextual Analysis**: Understand if changes are significant vs normal variance
- **Automated Detection**: Catch regressions without manual comparison
- **Trend Visibility**: See performance drift over time
- **Health Scoring**: Single metric (0-100) for bot health

## Components

### 1. Statistical Utilities (`utils.ts`)

Core statistical functions for baseline analysis:
- `average()` - Calculate arithmetic mean
- `standardDeviation()` - Calculate sample standard deviation
- `percentile()` - Calculate percentiles (P50, P95, P99)
- `min()` / `max()` - Find minimum and maximum values
- `isStatisticallySignificant()` - Determine if change exceeds threshold
- `percentChange()` - Calculate percentage change

### 2. Rolling Baseline Calculator (`calculate-rolling-baseline.ts`)

Calculates rolling baselines from historical data:
- `loadRecentBaselines()` - Load baselines within time window
- `calculateRollingBaseline()` - Compute aggregated statistics
- `calculateStandardDeviations()` - Calculate metric standard deviations

**Output**: `RollingBaseline` with averages, min/max, percentiles for all metrics

### 3. Regression Detection (`detect-regressions.ts`)

Automated performance regression and improvement detection:
- `detectRegressions()` - Find performance regressions using statistical thresholds
- `detectImprovements()` - Find performance improvements
- `calculateHealthScore()` - Compute 0-100 health score
- `determineTrend()` - Determine overall trend direction

**Detection Thresholds**:
- CPU Regression: avg + 1σ, critical if >15% above
- GCL Stall: avg - 1σ, critical if >20% below
- Error Rate: avg + 2σ, critical if >1.0/tick
- Room Loss: >10% drop with 2σ threshold
- Creep Loss: >20% drop with 2σ threshold

### 4. Trend Report Generator (`generate-trend-report.ts`)

Generates human-readable markdown reports:
- `generateTrendReport()` - Full detailed report with all metrics
- `generateCompactSummary()` - Compact summary for GitHub issues/PRs

### 5. Integration Script (`integrate-rolling-baseline.mjs`)

Main entry point that orchestrates the entire analysis:
1. Load current metrics snapshot
2. Calculate 7-day rolling baseline
3. Detect regressions and improvements
4. Calculate health score
5. Generate trend report
6. Save enhanced baseline with comparison data

## Usage

### Standalone Analysis

Run analysis on existing collected metrics:

```bash
node scripts/strategic/integrate-rolling-baseline.mjs [input-file]
```

**Environment Variables**:
- `BASELINES_DIR` - Directory containing baselines (default: `performance-baselines/strategic`)
- `ROLLING_DAYS` - Rolling window size in days (default: 7)
- `GITHUB_SHA` - Git commit hash (for baseline metadata)
- `GITHUB_REF_NAME` - Git branch name (for baseline metadata)
- `VERBOSE` - Enable verbose logging

**Example**:
```bash
ROLLING_DAYS=7 node scripts/strategic/integrate-rolling-baseline.mjs \
  performance-baselines/strategic/collected-metrics.json
```

### Integration with Metrics Collection

The rolling baseline analysis integrates with the strategic metrics collection workflow:

```bash
# 1. Collect current metrics
node scripts/collect-strategic-metrics.mjs

# 2. Run rolling baseline analysis
node scripts/strategic/integrate-rolling-baseline.mjs
```

## Output

The integration script generates two files:

### 1. Enhanced Baseline JSON

**Location**: `performance-baselines/strategic/{timestamp}_{runId}.json`

**Structure**:
```json
{
  "timestamp": "2026-01-28T21:00:00.000Z",
  "gameTime": 45123456,
  "commit": "abc123...",
  "branch": "main",
  "metrics": { /* PerformanceSnapshot */ },
  "comparisonBaseline": {
    "avg7d": { /* 7-day averages */ },
    "stdDev": { /* Standard deviations */ },
    "trend": "improving|degrading|stable"
  },
  "detectedChanges": {
    "regressions": [ /* Regression[] */ ],
    "improvements": [ /* Improvement[] */ ],
    "healthScore": 85
  },
  "issuesCreated": [],
  "issuesUpdated": [],
  "recommendations": []
}
```

### 2. Trend Report Markdown

**Location**: `performance-baselines/strategic/{timestamp}_{runId}_report.md`

**Contents**:
- 7-Day Rolling Average Summary
  - CPU metrics (avg, σ, P50/P95/P99)
  - GCL metrics (avg rate, range)
  - Error metrics (avg rate, range)
  - Room/Creep metrics
- Current vs Baseline Comparison
- Detected Regressions (by severity)
- Detected Improvements
- Overall Trend Analysis

## Statistical Methodology

### Rolling Baseline Calculation

The system uses a 7-day rolling window to calculate baseline statistics:

1. **Load Baselines**: Collect all baselines from the past 7 days
2. **Extract Metrics**: Pull out metric arrays (CPU, GCL, errors, etc.)
3. **Calculate Statistics**:
   - **Mean (μ)**: Average value across window
   - **Standard Deviation (σ)**: Measure of variance
   - **Percentiles**: P50 (median), P95, P99 for distribution understanding
   - **Min/Max**: Range of values observed

### Regression Detection

Regressions are detected using statistical thresholds:

**Warning Threshold**: μ ± 1σ  
**Critical Threshold**: μ ± 2σ

**Example - CPU Regression**:
- 7-day average CPU: 85.0
- Standard deviation: 3.0
- Warning threshold: 85.0 + 3.0 = 88.0
- Current CPU: 92.0
- Result: **HIGH severity** (>15% above threshold)

### Health Score Calculation

The health score (0-100) starts at 100 and deducts points for:
- **Critical regressions**: -25 points each
- **High regressions**: -15 points each
- **Medium regressions**: -8 points each
- **Low regressions**: -3 points each
- **CPU near limit (>95)**: -15 points
- **CPU high (>90)**: -10 points
- **Low bucket (<5000)**: -20 points
- **Low bucket (<7000)**: -10 points

Bonus points for:
- **Excellent GCL progress (>20% above avg)**: +5 points
- **Very low errors (<0.01/tick)**: +5 points

## Testing

Run unit tests:

```bash
cd scripts/strategic
npm test
```

Tests cover:
- Statistical utility functions
- Percentile calculations
- Standard deviation
- Significance testing
- Percent change calculations

## Best Practices

### 1. Minimum Sample Size

**Recommendation**: Require at least 3 baselines before enabling regression detection.

**Rationale**: Standard deviation is unreliable with <3 samples.

### 2. Outlier Handling

The current implementation does **not** filter outliers. Consider implementing:
- Modified Z-score method
- IQR (Interquartile Range) filtering

For outlier detection in future iterations.

### 3. Trend Confirmation

**Recommendation**: Require 3+ consecutive violations before confirming a trend.

**Rationale**: Reduces false positives from transient spikes.

### 4. Adaptive Thresholds

Consider implementing adaptive thresholds based on:
- Time of day (CPU patterns may vary)
- Recent deployments (grace period after changes)
- Game events (war vs peace)

## Future Enhancements

### 1. Multi-Window Analysis

Support multiple rolling windows:
- 24-hour (short-term trends)
- 7-day (current implementation)
- 30-day (long-term trends)

### 2. Anomaly Detection

Implement more sophisticated anomaly detection:
- Seasonal decomposition
- ARIMA models
- Machine learning-based detection

### 3. Predictive Analysis

Add predictive capabilities:
- Forecast future CPU usage
- Predict GCL milestone dates
- Estimate bucket drain time

### 4. Correlation Analysis

Detect correlations between metrics:
- CPU vs creep count
- GCL rate vs upgrader count
- Error rate vs CPU usage

## References

**Statistical Process Control**:
- Mean ± 1σ for warning thresholds
- Mean ± 2σ for critical thresholds
- 3+ consecutive violations for trend confirmation

**Community Approaches**:
- **Overmind**: Rolling 24h averages for CPU monitoring
- **TooAngel**: 7-day trend analysis with outlier rejection (not yet implemented in this system)
- **Industry Standard**: 7-day rolling window for change detection

**Note**: This implementation does not yet include outlier rejection/filtering. See "Future Enhancements" section for planned outlier detection features.

## Troubleshooting

### No Baselines Found

**Issue**: First run shows "No historical baselines found"  
**Solution**: This is expected. The system needs at least 1 baseline before comparison.

### Insufficient Data

**Issue**: Only 1-2 baselines in window  
**Solution**: Wait for more daily runs to build up baseline history.

### High False Positive Rate

**Issue**: Too many regressions detected  
**Solution**: Consider:
1. Increasing sigma multiplier (1σ → 1.5σ)
2. Adding minimum threshold values
3. Implementing outlier filtering

### Missing Dependencies

**Issue**: Import errors when running scripts  
**Solution**: Ensure parent directory has required dependencies:
```bash
cd /home/runner/work/screeps/screeps
npm install
```

## License

MIT License - See repository root LICENSE file
