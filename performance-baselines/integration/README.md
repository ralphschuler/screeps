# Integration Test Performance Baselines

This directory contains performance baselines for integration tests.

## Structure

- `{test-name}.json`: Individual test baselines with metrics
- `summary.json`: Summary of last baseline update

## Baseline Format

```json
{
  "testName": "startup-initialization",
  "timestamp": "2026-01-27T15:00:00.000Z",
  "commit": "abc123",
  "branch": "main",
  "avgCpu": 0.05,
  "maxCpu": 0.08,
  "avgMemoryParse": 0.01,
  "avgBucket": 9900
}
```

## Regression Thresholds

- **CPU Increase**: >20% = warning, >30% = failure
- **Memory Increase**: >15% = warning
- **Bucket Decrease**: >10% = warning

## Updating Baselines

Baselines are automatically updated when:
1. Tests run on `main` branch
2. All tests pass
3. CI workflow completes successfully

Manual update:
```bash
npm run test:integration
node scripts/update-integration-baselines.js
```

## Checking for Regressions

```bash
npm run test:integration
node scripts/check-test-regressions.js
```
