# Autonomous Learning Database

This directory contains the learning database for the autonomous development system. It tracks outcomes of autonomous changes to improve decision-making over time.

## Structure

### `outcomes.json`

Main database file containing historical outcomes of autonomous PRs.

**Schema:**
```json
{
  "pr_<number>": {
    "pr": 123,
    "timestamp": "2025-01-05T12:00:00Z",
    "type": "performance",
    "filesChanged": ["src/cache/path.ts"],
    "linesChanged": 45,
    "predicted": {
      "cpuImpact": -0.05,  // Expected 5% reduction
      "confidence": "high",
      "risk": "low"
    },
    "actual": {
      "cpuChange": -7.2,   // Actual 7.2% reduction
      "baseline": 50.5,
      "postDeploy": 46.9
    },
    "success": true,
    "rolledBack": false,
    "severity": "low",
    "lessons": [
      "Path caching more effective than predicted",
      "No negative side effects observed",
      "Pattern applicable to hauler movement"
    ],
    "tags": ["caching", "pathfinding", "optimization"]
  }
}
```

## Usage by Autonomous Agent

### Query Similar Outcomes

```typescript
// Load database
const db = JSON.parse(fs.readFileSync('.github/autonomous-learning/outcomes.json'));

// Find similar changes
const similar = Object.values(db.outcomes).filter(outcome => 
  outcome.type === 'performance' &&
  outcome.filesChanged.some(f => f.includes('cache'))
);

// Calculate success rate
const successRate = similar.filter(o => o.success).length / similar.length;

// Adjust confidence based on history
if (successRate > 0.8) {
  confidence = 'high';
} else if (successRate > 0.5) {
  confidence = 'medium';
} else {
  confidence = 'low';
}
```

### Learn from Failures

```typescript
// Find failed attempts
const failures = Object.values(db.outcomes).filter(o => !o.success);

// Extract lessons
const lessons = failures.flatMap(f => f.lessons);

// Check if current approach has failed before
const hasFailedBefore = failures.some(f => 
  f.filesChanged.some(file => currentFiles.includes(file)) &&
  f.type === currentType
);

if (hasFailedBefore) {
  // Create issue instead of attempting
  decision = 'CREATE_ISSUE';
}
```

### Track Prediction Accuracy

```typescript
// Compare predictions to actual results
const withPredictions = Object.values(db.outcomes)
  .filter(o => o.predicted && o.actual);

const accuracyAnalysis = withPredictions.map(o => ({
  predicted: o.predicted.cpuImpact,
  actual: o.actual.cpuChange / 100,
  error: Math.abs(o.predicted.cpuImpact - (o.actual.cpuChange / 100))
}));

const avgError = accuracyAnalysis.reduce((sum, a) => sum + a.error, 0) / accuracyAnalysis.length;

console.log(`Average prediction error: ${(avgError * 100).toFixed(1)}%`);
```

## Data Retention

- **Active Records**: Keep all outcomes from last 90 days
- **Historical**: Archive older records to `history/` subdirectory
- **Pruning**: Run monthly cleanup to remove low-value entries

## Privacy & Security

This database contains:
- ✅ Performance metrics (safe to store)
- ✅ File paths and change descriptions (safe)
- ✅ Lessons learned (safe)
- ❌ NO secrets, credentials, or sensitive data

## Integration

### Post-Deployment Monitoring

The `post-deployment-monitoring.yml` workflow automatically records outcomes after each PR merge.

### Autonomous Improvement

The `autonomous-improvement.agent.md` agent queries this database before making decisions.

### Strategic Planning

The strategic planning agent can analyze trends and patterns to identify areas for improvement.

## Metrics & Analysis

### Success Rate by Type

```sql
SELECT 
  type,
  COUNT(*) as total,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successes,
  (SUM(CASE WHEN success THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as success_rate
FROM outcomes
GROUP BY type;
```

### Common Failure Patterns

```typescript
const failures = Object.values(db.outcomes).filter(o => !o.success);
const failuresByFile = {};

failures.forEach(f => {
  f.filesChanged.forEach(file => {
    failuresByFile[file] = (failuresByFile[file] || 0) + 1;
  });
});

// Files with most failures
console.log('High-risk files:', 
  Object.entries(failuresByFile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
);
```

### Prediction Improvement Over Time

```typescript
const sortedOutcomes = Object.values(db.outcomes)
  .filter(o => o.predicted && o.actual)
  .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

// Track prediction error trend
const errorTrend = sortedOutcomes.map((o, i) => ({
  index: i,
  error: Math.abs(o.predicted.cpuImpact - (o.actual.cpuChange / 100))
}));

// Calculate moving average
const windowSize = 10;
const movingAvg = errorTrend.slice(windowSize).map((_, i) => {
  const window = errorTrend.slice(i, i + windowSize);
  return window.reduce((sum, w) => sum + w.error, 0) / windowSize;
});

console.log('Prediction accuracy improving:', movingAvg[0] > movingAvg[movingAvg.length - 1]);
```

## Continuous Improvement

The system learns from every autonomous change:

1. **Record** - Save predicted and actual outcomes
2. **Analyze** - Identify patterns in successes and failures
3. **Adjust** - Update decision criteria based on historical data
4. **Improve** - Increase success rate over time

**Target**: 80%+ success rate after 10+ autonomous changes
