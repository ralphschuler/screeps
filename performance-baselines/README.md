# Performance Baselines

This directory contains performance baseline data for different branches and test scenarios.

## Structure

Each file corresponds to a Git branch:
- `main.json` - Production baseline
- `develop.json` - Development baseline
- `<branch>.json` - Feature branch baselines (optional)

## Format

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
    },
    "Single Room Economy": { ... },
    "Remote Mining": { ... },
    "Defense Response": { ... },
    "Multi-Room Scaling (25 Rooms)": { ... }
  }
}
```

## Test Scenarios

The following performance scenarios are tracked:

### 1. Empty Room Initialization
- **Target**: ≤0.05 CPU avg
- **Description**: Fresh spawn, first creep creation
- **Ticks**: 50

### 2. Single Room Economy (RCL 4)
- **Target**: ≤0.1 CPU avg
- **Description**: Basic economy operations
- **Ticks**: 100

### 3. Five Room Empire
- **Target**: ≤0.5 CPU total
- **Description**: Multi-room coordination
- **Ticks**: 200

### 4. Combat Defense
- **Target**: ≤0.25 CPU avg
- **Description**: Active defense against hostiles
- **Ticks**: 100

### 5. Remote Mining
- **Target**: ≤0.15 CPU avg, >5 energy/CPU
- **Description**: Remote harvesting from neutral rooms
- **Ticks**: 150

### 6. Defense Response
- **Target**: ≤0.25 CPU avg, <10 tick detection
- **Description**: Hostile detection and defender spawning
- **Ticks**: 100

### 7. Multi-Room Scaling (25 Rooms)
- **Target**: ≤0.15 CPU per room (3.75 total)
- **Description**: Large-scale empire CPU scaling
- **Ticks**: 200

## Updating Baselines

Baselines are automatically updated when:
1. PRs are merged to main/develop
2. Performance tests pass without regression
3. Manual updates via `scripts/update-baseline.js`

## Regression Detection

Performance tests compare current results against the baseline:

### Severity Levels

- **Critical** (>20% increase): Blocks merge, requires immediate attention
- **Warning** (10-20% increase): Review required, may block merge
- **Pass** (<10% variance): Acceptable performance
- **Improvement** (>10% decrease): Performance optimization detected

### Metrics Checked

- **avgCpu**: Average CPU usage over test duration
- **maxCpu**: Peak CPU usage
- **avgBucket**: Average bucket level (should stay ≥9500)
- **memoryParsing**: Memory parse time (should stay ≤0.02)

### Running Regression Detection

```bash
# In packages/screeps-server
npm run test:performance
node scripts/compare-baseline.js
```

The comparison script:
1. Loads baseline for current branch (falls back to develop)
2. Compares current metrics against baseline
3. Classifies changes by severity
4. Outputs detailed report
5. Exits with error if critical regressions detected

## Initial Baselines

Initial baseline values are derived from ROADMAP.md targets:
- Eco room: ≤0.1 CPU per tick
- Combat room: ≤0.25 CPU per tick
- Remote mining: ≤0.15 CPU per tick
- Multi-room: ≤0.15 CPU per room at 25 rooms
- Global kernel: ≤1 CPU every 20-50 ticks

These targets serve as the starting point. Real-world performance data will update these baselines over time.
