# Performance Baselines

This directory contains performance baseline data for different branches.

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
    "10-Room Empire": { ... },
    "Combat Defense": { ... }
  }
}
```

## Updating Baselines

Baselines are automatically updated when:
1. PRs are merged to main/develop
2. Performance tests pass without regression
3. Manual updates via `scripts/update-baseline.js`

## Regression Detection

Performance tests compare current results against the baseline:
- **Regression threshold**: 10% increase in CPU usage
- **Metrics checked**: avgCpu, maxCpu
- **Action**: CI/CD fails if regression detected

## Initial Baselines

Initial baseline values are derived from ROADMAP.md targets:
- Eco room: ≤0.1 CPU per tick
- Combat room: ≤0.25 CPU per tick
- Multi-room: ≤1.5 CPU per tick (for 10 rooms)

These targets serve as the starting point. Real-world performance data will update these baselines over time.
