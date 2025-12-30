# Performance Baselines

> **Purpose**: This document tracks performance baselines - the "known good" performance values that serve as regression detection thresholds. It documents both target values from ROADMAP.md and actual measured performance.

## Table of Contents

1. [Overview](#overview)
2. [Target Performance (ROADMAP.md)](#target-performance-roadmapmd)
3. [Current Baselines](#current-baselines)
4. [Baseline History](#baseline-history)
5. [Understanding Baselines](#understanding-baselines)
6. [Updating Baselines](#updating-baselines)

---

## Overview

### What are Performance Baselines?

Performance baselines represent the expected CPU usage and performance characteristics of the bot under specific scenarios. They serve two purposes:

1. **Regression Detection**: Identify when code changes degrade performance
2. **Progress Tracking**: Measure improvement over time as optimizations are implemented

### Baseline Structure

Baselines are stored in `../../../performance-baselines/`:

```
performance-baselines/
├── README.md           # This file (symlinked from here)
├── main.json          # Production baseline (main branch)
├── develop.json       # Development baseline (develop branch)
└── history/           # Historical snapshots
    ├── 2025-12-01_main_abc123.json
    ├── 2025-12-15_main_def456.json
    └── 2025-12-28_main_ghi789.json
```

### Baseline vs. Target

| Term | Definition | Source | Example |
|------|------------|--------|---------|
| **Target** | Ideal performance goal from ROADMAP.md | Architecture design | Eco room: 0.08 CPU/tick |
| **Maximum** | Hard limit that should not be exceeded | Architecture design | Eco room: 0.10 CPU/tick |
| **Baseline** | Current measured performance | Automated tests | Eco room: 0.082 CPU/tick |

**Relationship**:
- **Target** ≤ **Baseline** ≤ **Maximum**: Good (room for improvement)
- **Baseline** ≤ **Target**: Excellent (exceeding target)
- **Baseline** > **Maximum**: Problem (exceeds hard limit)

---

## Target Performance (ROADMAP.md)

### CPU Targets from ROADMAP.md Section 2

These are the **design targets** that the bot should achieve:

#### Room-Level Targets

| Room Type | Avg CPU Target | Max CPU Limit | Justification |
|-----------|---------------|---------------|---------------|
| **Eco Room** | ≤ 0.08 CPU/tick | ≤ 0.10 CPU/tick | Basic economic operations (harvesting, building, upgrading) |
| **War Room** | ≤ 0.20 CPU/tick | ≤ 0.25 CPU/tick | Economy + active combat + tower management |

#### Global Targets

| System | Avg CPU Target | Max CPU Limit | Justification |
|--------|---------------|---------------|---------------|
| **Global Kernel** | ≤ 0.04 CPU/tick | ≤ 0.05 CPU/tick | Empire coordination, run every 20-50 ticks |
| **Per-Tick Global** | ≤ 1 CPU | ≤ 2 CPU | Total overhead when running |

#### Scalability Targets

| Metric | Target | Notes |
|--------|--------|-------|
| **Rooms** | 100+ | Maximum GCL-supported rooms |
| **Creeps** | 5,000+ | Scale across all rooms |
| **Bucket** | > 9,000 | Maintain stability for burst operations |
| **Min Bucket** | > 5,000 | Never drain below emergency threshold |

### Test Scenario Targets

Based on ROADMAP.md, test scenarios have the following targets:

#### Single Room Economy

- **Description**: RCL 4 room with basic economy (2 sources, standard creeps)
- **Avg CPU Target**: 0.08 CPU/tick
- **Max CPU Limit**: 0.10 CPU/tick
- **Bucket Target**: > 9,500
- **Scope**: Tests core economic operations without military overhead

#### 10-Room Empire

- **Description**: 10 rooms with varying RCLs (1-8), ~150 creeps total
- **Avg CPU Target**: 1.20 CPU/tick
- **Max CPU Limit**: 1.50 CPU/tick
- **Bucket Target**: > 8,000
- **Scope**: Tests scaling, inter-room logistics, empire coordination

#### Combat Defense

- **Description**: RCL 7 room under attack (5 attackers, 2 healers), 3 towers
- **Avg CPU Target**: 0.20 CPU/tick
- **Max CPU Limit**: 0.25 CPU/tick
- **Bucket Target**: > 9,000
- **Scope**: Tests combat response, tower management, threat assessment

---

## Current Baselines

### Main Branch (Production)

> **File**: `../../../performance-baselines/main.json`
> **Last Updated**: (See file timestamp)
> **Commit**: (See file commit hash)

#### Default Scenario

| Metric | Current Baseline | Target | Status |
|--------|-----------------|--------|--------|
| **Avg CPU** | TBD | 0.08 | 🔄 Pending data |
| **Max CPU** | TBD | 0.10 | 🔄 Pending data |
| **P95 CPU** | TBD | 0.09 | 🔄 Pending data |
| **P99 CPU** | TBD | 0.095 | 🔄 Pending data |

> **Note**: Initial baselines will be established after the first successful performance test run on the main branch.

#### Single Room Economy

| Metric | Current Baseline | Target | Status |
|--------|-----------------|--------|--------|
| **Avg CPU** | TBD | 0.08 | 🔄 Pending data |
| **Max CPU** | TBD | 0.10 | 🔄 Pending data |
| **P95 CPU** | TBD | 0.09 | 🔄 Pending data |
| **P99 CPU** | TBD | 0.095 | 🔄 Pending data |

#### 10-Room Empire

| Metric | Current Baseline | Target | Status |
|--------|-----------------|--------|--------|
| **Avg CPU** | TBD | 1.20 | 🔄 Pending data |
| **Max CPU** | TBD | 1.50 | 🔄 Pending data |
| **P95 CPU** | TBD | 1.35 | 🔄 Pending data |
| **P99 CPU** | TBD | 1.45 | 🔄 Pending data |

#### Combat Defense

| Metric | Current Baseline | Target | Status |
|--------|-----------------|--------|--------|
| **Avg CPU** | TBD | 0.20 | 🔄 Pending data |
| **Max CPU** | TBD | 0.25 | 🔄 Pending data |
| **P95 CPU** | TBD | 0.23 | 🔄 Pending data |
| **P99 CPU** | TBD | 0.24 | 🔄 Pending data |

### Develop Branch (Development)

> **File**: `../../../performance-baselines/develop.json`
> **Last Updated**: (See file timestamp)
> **Commit**: (See file commit hash)

Development branch baselines may be slightly higher than main as new features are integrated:

| Metric | Current Baseline | Target | Delta vs. Main |
|--------|-----------------|--------|----------------|
| **Avg CPU** | TBD | 0.08 | TBD |
| **Max CPU** | TBD | 0.10 | TBD |

> **Note**: Develop branch should not exceed main branch by more than 15% during active development.

---

## Baseline History

### Historical Snapshots

Performance baselines are archived after each update in `../../../performance-baselines/history/`:

| Date | Branch | Commit | Avg CPU | Max CPU | Notes |
|------|--------|--------|---------|---------|-------|
| TBD | main | TBD | TBD | TBD | Initial baseline |
| TBD | develop | TBD | TBD | TBD | Initial baseline |

### Performance Trends

> **Coming Soon**: Trend analysis showing performance changes over time.

**Planned Metrics**:
- CPU usage trend (30-day, 90-day)
- Baseline drift (how much baselines change over time)
- Optimization milestones (significant improvements)

---

## Understanding Baselines

### How Baselines are Established

1. **Initial Baselines**: Derived from ROADMAP.md targets
   - Used when no measured data exists yet
   - Conservative values to avoid false regressions

2. **First Measurement**: After first successful test run
   - Replaces initial baseline with actual data
   - Sets realistic expectations

3. **Continuous Updates**: After each merge to main/develop
   - Baselines track actual performance
   - Automatically updated by CI/CD

### Baseline File Format

```json
{
  "commit": "abc123def456789",
  "timestamp": "2025-12-30T00:00:00Z",
  "branch": "main",
  "scenarios": {
    "default": {
      "avgCpu": 0.082,
      "maxCpu": 0.095,
      "p95Cpu": 0.090,
      "p99Cpu": 0.093
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

**Fields**:
- `commit`: Git commit hash when baseline was established
- `timestamp`: ISO 8601 timestamp of baseline creation
- `branch`: Branch name (main, develop)
- `scenarios`: Performance data per scenario
  - `avgCpu`: Average CPU usage per tick
  - `maxCpu`: Maximum CPU usage observed
  - `p95Cpu`: 95th percentile CPU usage
  - `p99Cpu`: 99th percentile CPU usage

### Regression Threshold

**Current threshold**: 10% increase in avg CPU or max CPU

**Examples**:

| Baseline | Current | Change | Result |
|----------|---------|--------|--------|
| 0.080 | 0.088 | +10.0% | ⚠️ At threshold |
| 0.080 | 0.089 | +11.3% | ❌ Regression |
| 0.080 | 0.075 | -6.3% | ✅ Improvement |
| 0.080 | 0.087 | +8.8% | ✅ Within limit |

**Why 10%?**
- **Too Low (< 5%)**: Many false positives due to test variance
- **Just Right (10%)**: Balances sensitivity and reliability
- **Too High (> 15%)**: Misses gradual performance degradation

### When Baselines are Updated

Baselines are **automatically updated** when:

1. ✅ Tests pass on `main` or `develop` branches
2. ✅ No regression detected (within 10% threshold)
3. ✅ Performance report generated successfully
4. ✅ CI workflow completes and commits changes

Baselines are **NOT updated** when:

- ❌ Tests run on feature branches
- ❌ Regression is detected
- ❌ Tests fail or time out
- ❌ Manual workflow runs (unless on main/develop)

---

## Updating Baselines

### Automatic Updates (Recommended)

Let CI/CD handle baseline updates:

1. **Merge PR to main or develop**
2. **CI runs performance tests**
3. **If tests pass**: Baseline updated automatically
4. **Commit**: `chore(performance): update baseline for main`

**No manual intervention needed!**

### Manual Updates (When Needed)

If you need to manually update a baseline:

```bash
# 1. Run performance test
cd packages/screeps-bot
npm run test:performance:logs -- --maxTickCount=10000

# 2. Analyze results
node scripts/analyze-performance.js

# 3. Verify test passed
cat performance-report.json | jq '.passed'

# 4. Update baseline for branch
node scripts/update-baseline.js main

# Output:
# ✅ Updated baseline for branch: main
#    File: ../../../performance-baselines/main.json
#    Commit: abc123def456
#    Avg CPU: 0.082
#    Max CPU: 0.095
# 📊 Archived historical snapshot: 2025-12-30_main_abc123.json

# 5. Commit changes
cd ../../../
git add performance-baselines/main.json
git add performance-baselines/history/
git commit -m "chore(performance): update baseline for main"
git push
```

### Resetting Baselines

If baselines become outdated or corrupted:

```bash
# Option 1: Reset to ROADMAP.md targets
cat > performance-baselines/main.json << 'EOF'
{
  "commit": "RESET",
  "timestamp": "2025-12-30T00:00:00Z",
  "branch": "main",
  "scenarios": {
    "default": {
      "avgCpu": 0.08,
      "maxCpu": 0.10,
      "p95Cpu": 0.09,
      "p99Cpu": 0.095
    }
  }
}
EOF

# Option 2: Run fresh performance test
cd packages/screeps-bot
npm run test:performance:logs -- --maxTickCount=50000
node scripts/analyze-performance.js
node scripts/update-baseline.js main

# Commit reset
git add performance-baselines/
git commit -m "chore(performance): reset baseline to measured values"
```

### Baseline Validation

Validate baseline files are well-formed:

```bash
# Check JSON syntax
jq empty performance-baselines/main.json
jq empty performance-baselines/develop.json

# Verify required fields
jq '.commit, .timestamp, .branch, .scenarios' performance-baselines/main.json

# Check values are reasonable
jq '.scenarios.default.avgCpu < 0.5' performance-baselines/main.json
```

---

## Baseline Comparison Examples

### Example 1: Performance Improvement

```json
{
  "baseline": {
    "avgCpu": 0.095,
    "maxCpu": 0.120
  },
  "current": {
    "avgCpu": 0.078,
    "maxCpu": 0.095
  },
  "change": {
    "avgCpu": -17.9%,
    "maxCpu": -20.8%
  },
  "status": "✅ IMPROVED"
}
```

**Interpretation**: Optimization reduced CPU usage significantly. New baseline will be set to these improved values.

### Example 2: Within Threshold

```json
{
  "baseline": {
    "avgCpu": 0.080,
    "maxCpu": 0.100
  },
  "current": {
    "avgCpu": 0.087,
    "maxCpu": 0.105
  },
  "change": {
    "avgCpu": +8.8%,
    "maxCpu": +5.0%
  },
  "status": "✅ ACCEPTABLE (within 10% threshold)"
}
```

**Interpretation**: Slight increase but within acceptable variance. No regression flagged.

### Example 3: Regression Detected

```json
{
  "baseline": {
    "avgCpu": 0.080,
    "maxCpu": 0.100
  },
  "current": {
    "avgCpu": 0.091,
    "maxCpu": 0.115
  },
  "change": {
    "avgCpu": +13.8%,
    "maxCpu": +15.0%
  },
  "status": "❌ REGRESSION DETECTED"
}
```

**Interpretation**: Significant performance degradation. CI will fail, PR will be blocked, investigation required.

---

## Frequently Asked Questions

### Q: What if my feature legitimately increases CPU usage?

**A**: Document and justify the regression in your PR:

```markdown
## Performance Impact

This PR adds feature X which increases CPU usage:
- **Before**: 0.080 avg CPU
- **After**: 0.092 avg CPU (+15%)
- **Justification**: Feature X is critical for correctness/functionality
- **Future work**: Issue #123 tracks optimization of feature X

Regression is acceptable because [reason].
```

Get review approval and manually update baseline if merged.

### Q: How do I know if my baselines are stale?

**A**: Check the baseline timestamp:

```bash
jq '.timestamp' performance-baselines/main.json
# Output: "2025-11-01T00:00:00Z"

# If > 30 days old, consider updating:
cd packages/screeps-bot
npm run test:performance:logs
node scripts/update-baseline.js main
```

### Q: Can I have baselines for feature branches?

**A**: Not automatically, but you can create them manually:

```bash
# Run test on feature branch
npm run test:performance:logs
node scripts/analyze-performance.js

# Save as feature baseline
cp performance-report.json ../../../performance-baselines/feature-branch.json

# Compare against main
node scripts/compare-baselines.js \
  ../../../performance-baselines/main.json \
  performance-report.json
```

### Q: What if tests are flaky and results vary by 5-10%?

**A**: Run multiple iterations and average:

```bash
# Run 3 tests
for i in {1..3}; do
  npm run test:performance:logs -- --maxTickCount=10000
  mv performance-report.json "report-$i.json"
done

# Average the results
node scripts/average-reports.js report-*.json > average-report.json

# Use average as baseline
node scripts/update-baseline.js main
```

---

## Monitoring and Alerts

### Grafana Integration

Performance baselines can be monitored via Grafana:

**Dashboard**: [CPU & Performance Monitor](https://ralphschuler.grafana.net/public-dashboards/d0bc9548d02247889147e0707cc61e8f)

**Metrics Tracked**:
- Current CPU usage vs. baseline
- Trend over time (30-day, 90-day)
- Alerts when performance exceeds baseline by 10%

### GitHub Actions Integration

Every PR automatically:
1. Runs performance tests
2. Compares against target branch baseline
3. Posts results as PR comment
4. Fails CI if regression detected

**See**: `.github/workflows/performance-test.yml`

---

## Contributing

### Baseline Guidelines

When contributing changes that affect baselines:

1. **Run tests locally** before creating PR
2. **Document expected impact** in PR description
3. **Justify regressions** if they occur
4. **Update targets** if ROADMAP.md changes
5. **Archive old baselines** before major refactors

### Baseline Review Checklist

When reviewing PRs that update baselines:

- [ ] Baseline change is intentional and documented
- [ ] New baseline is better or equivalent to old
- [ ] Historical snapshot was archived
- [ ] Commit message follows convention: `chore(performance): update baseline for [branch]`
- [ ] No regressions introduced by baseline update

---

## Related Documentation

- **[PERFORMANCE_TESTING_GUIDE.md](./PERFORMANCE_TESTING_GUIDE.md)**: Comprehensive testing guide
- **[PERFORMANCE_TESTING.md](./PERFORMANCE_TESTING.md)**: Technical reference
- **[ROADMAP.md](../../ROADMAP.md)**: Performance targets and architecture
- **[performance-baselines/README.md](../../performance-baselines/README.md)**: Baseline directory README

---

**Last Updated**: 2025-12-30
**Version**: 1.0.0
**Maintainer**: ralphschuler/screeps contributors
