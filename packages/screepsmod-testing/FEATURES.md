# screepsmod-testing Features

This document provides a comprehensive guide to all features implemented in screepsmod-testing.

## Table of Contents

1. [Test Result Persistence](#test-result-persistence)
2. [JSON Output for CI/CD](#json-output-for-cicd)
3. [Performance Benchmarking](#performance-benchmarking)
4. [Test Filtering](#test-filtering)
5. [Visual Testing](#visual-testing)
6. [Console Commands](#console-commands)

---

## Test Result Persistence

Test results are automatically saved across server restarts, maintaining a history of test runs.

### Features

- **Automatic persistence** to `.screeps-test-results.json`
- **Configurable history size** (default: 10 runs)
- **Statistics tracking** (pass rate, duration, trends)

### Configuration

```yaml
screepsmod:
  testing:
    persistence: true
    persistencePath: "./.screeps-test-results.json"
    historySize: 10
```

### Console Commands

```javascript
// Get test history
getTestHistory()

// Get aggregated statistics
getTestStatistics()
// Returns: { totalRuns, averagePassRate, averageDuration, mostRecentStatus }
```

### API Usage

```typescript
import { PersistenceManager } from 'screepsmod-testing';

const persistence = new PersistenceManager('./my-test-results.json', 20);
persistence.save(testSummary);
const history = persistence.getHistory();
const stats = persistence.getStatistics();
```

---

## JSON Output for CI/CD

Export test results in multiple formats for CI/CD integration.

### Supported Formats

1. **JSON** - Custom format with full test details
2. **JUnit XML** - Compatible with Jenkins, GitLab CI, etc.
3. **Console** - Human-readable terminal output

### Configuration

```yaml
screepsmod:
  testing:
    outputFormat: "json"  # Options: "console", "json", "junit", "all"
    outputDir: "./test-results"
```

### Output Files

- JSON: `test-results/test-results-{timestamp}.json`
- JUnit: `test-results/junit-results-{timestamp}.xml`

### JSON Format

```json
{
  "version": "1.0.0",
  "timestamp": 1702234567890,
  "environment": {
    "server": "screeps",
    "tick": 12345
  },
  "summary": {
    "total": 50,
    "passed": 48,
    "failed": 2,
    "skipped": 0,
    "duration": 1234,
    "results": [...]
  }
}
```

### API Usage

```typescript
import { JSONReporter, ConsoleReporter } from 'screepsmod-testing';

// JSON output
const jsonReporter = new JSONReporter('./test-results');
const output = jsonReporter.generate(summary, coverage, benchmarks);
jsonReporter.write(output);

// JUnit XML
jsonReporter.writeJUnit(summary);

// Console output
const consoleReporter = new ConsoleReporter();
consoleReporter.printSummary(summary);
consoleReporter.printBenchmarks(benchmarks);
```

---

## Performance Benchmarking

Track CPU usage, memory consumption, and execution time for tests.

### Features

- **CPU tracking** using Game.cpu.getUsed()
- **Memory tracking** using RawMemory size
- **Benchmark utilities** for statistical analysis
- **Performance assertions** with thresholds

### Per-Test Performance

Every test automatically tracks:
- Duration (milliseconds)
- CPU used (if available)
- Memory used (if available)

### CPU Budget Assertions

```typescript
import { PerformanceAssert } from 'screepsmod-testing';

it('should stay within CPU budget', async () => {
  await PerformanceAssert.cpuBudget(() => {
    // Your code here
  }, 10); // Max 10 CPU
});

it('should complete quickly', async () => {
  await PerformanceAssert.timeLimit(() => {
    // Your code here
  }, 50); // Max 50ms
});

it('should not use too much memory', async () => {
  await PerformanceAssert.memoryLimit(() => {
    // Your code here
  }, 10000); // Max 10KB
});
```

### Benchmarking

```typescript
import { benchmark } from 'screepsmod-testing';

it('benchmark pathfinding', async () => {
  const result = await benchmark('pathfinding', () => {
    PathFinder.search(start, goal);
  }, {
    samples: 10,      // Number of sample runs
    iterations: 100,  // Iterations per sample
    warmup: 5         // Warmup runs
  });

  console.log(`Mean: ${result.mean.toFixed(3)}ms`);
  console.log(`Median: ${result.median.toFixed(3)}ms`);
  console.log(`StdDev: ${result.stdDev.toFixed(3)}ms`);
  
  // Assert performance is acceptable
  expect(result.mean).toBeLessThan(5);
});
```

### Manual Tracking

```typescript
import { CPUTracker, MemoryTracker } from 'screepsmod-testing';

const cpuTracker = new CPUTracker();
const memoryTracker = new MemoryTracker();

cpuTracker.start();
memoryTracker.start();

// Your code here

const cpuUsed = cpuTracker.stop();
const memoryUsed = memoryTracker.stop();
```

---

## Test Filtering

Run specific tests based on patterns, tags, or suite names.

### Tagging Tests

```typescript
// Add tags to tests
it('fast test', () => {
  expect(true).toBeTruthy();
}, ['fast', 'unit']);

it('slow integration test', async () => {
  // Long-running test
}, ['slow', 'integration']);

it('economy test', () => {
  // Economy-specific test
}, ['economy', 'integration']);
```

### Console Commands

```javascript
// Filter by tags
setTestFilter({ tags: ['fast'] })

// Filter by pattern
setTestFilter({ pattern: 'spawn.*' })

// Filter by suite
setTestFilter({ suites: ['Economy Tests'] })

// Exclude tags
setTestFilter({ excludeTags: ['slow'] })

// Clear filter
clearTestFilter()
```

### Configuration

```yaml
screepsmod:
  testing:
    filter:
      pattern: ".*"          # RegExp pattern
      tags: ['integration']  # Include these tags
      suites: []             # Include these suites
      excludeTags: ['slow']  # Exclude these tags
      excludeSuites: []      # Exclude these suites
```

### API Usage

```typescript
import { FilterManager, createFilter } from 'screepsmod-testing';

// Create a filter
const filter = createFilter({
  pattern: 'spawn.*',
  tags: ['integration'],
  excludeTags: ['slow']
});

// Use with test runner
await testRunner.start(context, filter);

// Check if tests match
filter.matchesTest('spawn system', ['integration']); // true
filter.matchesTest('slow test', ['slow']);           // false
```

---

## Visual Testing

Capture and compare RoomVisual snapshots for visual regression testing.

### Capturing Snapshots

```typescript
import { VisualTester } from 'screepsmod-testing';

const tester = new VisualTester();

it('should capture room visual', () => {
  const snapshot = tester.captureSnapshot('W1N1', Game.time);
  
  expect(snapshot).toBeTruthy();
  expect(snapshot.roomName).toBe('W1N1');
});
```

### Comparing Snapshots

```typescript
it('should match visual snapshot', () => {
  const current = tester.captureSnapshot('W1N1', Game.time);
  const expected = loadExpectedSnapshot();
  
  const comparison = tester.compareSnapshots(current, expected);
  
  expect(comparison.match).toBeTruthy();
  expect(comparison.difference).toBeLessThan(5); // 5% tolerance
});
```

### Visual Assertions

```typescript
import { VisualAssert } from 'screepsmod-testing';

it('should match expected visual', () => {
  VisualAssert.matchesSnapshot(
    'W1N1',
    Game.time,
    expectedSnapshot,
    5  // 5% tolerance
  );
});

it('should have similar visuals', () => {
  VisualAssert.roomsMatch('W1N1', 'W1N2', Game.time, 10);
});
```

---

## Console Commands

All available console commands for runtime test management:

### Test Execution

```javascript
// Run tests (based on configuration)
runTests()

// List all registered tests
listTests()

// Clear test results
clearTests()
```

### Results and Statistics

```javascript
// Get current test summary
getTestSummary()
// Returns: { total, passed, failed, skipped, duration, tickRange }

// Get test history (requires persistence)
getTestHistory()

// Get statistics across runs
getTestStatistics()
// Returns: { totalRuns, averagePassRate, averageDuration, mostRecentStatus }
```

### Filtering

```javascript
// Set test filter
setTestFilter({ tags: ['fast'], pattern: 'spawn.*' })

// Clear filter
clearTestFilter()
```

---

## Complete Example

Here's a complete example using all features:

```typescript
import {
  describe,
  it,
  expect,
  benchmark,
  PerformanceAssert,
  VisualTester
} from 'screepsmod-testing';

describe('Complete Feature Demo', () => {
  // Tagged test with performance tracking
  it('optimized pathfinding', async () => {
    await PerformanceAssert.cpuBudget(() => {
      const room = Game.rooms['W1N1'];
      PathFinder.search(
        room.spawns[0].pos,
        { pos: room.controller.pos, range: 3 }
      );
    }, 2); // Max 2 CPU
  }, ['performance', 'pathfinding']);

  // Benchmark with statistical analysis
  it('benchmark spawn logic', async () => {
    const result = await benchmark('spawn-logic', () => {
      // Spawn decision logic
      const spawn = Game.spawns['Spawn1'];
      spawn.spawnCreep([WORK, CARRY, MOVE], 'test');
    });

    expect(result.mean).toBeLessThan(1);
  }, ['benchmark']);

  // Visual regression test
  it('room layout matches design', () => {
    const tester = new VisualTester();
    const snapshot = tester.captureSnapshot('W1N1', Game.time);
    
    // Compare with baseline
    expect(snapshot.visualData).toBeTruthy();
  }, ['visual', 'integration']);

  // Integration test with all features
  it('complete room system', () => {
    const room = Game.rooms['W1N1'];
    
    // Assertions
    expect(room.find(FIND_MY_SPAWNS).length).toBeGreaterThan(0);
    expect(room.energyAvailable).toBeGreaterThan(300);
    
    // Performance is tracked automatically
    // Tags allow filtering
  }, ['integration', 'system', 'critical']);
});
```

---

## Configuration Reference

Complete configuration options:

```yaml
screepsmod:
  testing:
    # Execution
    autoRun: true           # Auto-run tests on server start
    testInterval: 0         # Run every N ticks (0 = once)
    
    # Output
    outputFormat: "console" # "console", "json", "junit", "all"
    outputDir: "./test-results"
    
    # Persistence
    persistence: true
    persistencePath: "./.screeps-test-results.json"
    historySize: 10
    
    # Filtering
    filter:
      pattern: ".*"
      tags: []
      suites: []
      excludeTags: []
      excludeSuites: []
```

---

## API Reference

### Imports

```typescript
// Test definition
import { describe, it, xit, beforeEach, afterEach, beforeAll, afterAll } from 'screepsmod-testing';

// Assertions
import { expect, Assert } from 'screepsmod-testing';

// Performance
import { benchmark, PerformanceAssert, CPUTracker, MemoryTracker } from 'screepsmod-testing';

// Filtering
import { FilterManager, createFilter } from 'screepsmod-testing';

// Reporting
import { JSONReporter, ConsoleReporter } from 'screepsmod-testing';

// Persistence
import { PersistenceManager } from 'screepsmod-testing';

// Visual Testing
import { VisualTester, VisualAssert, createVisualSnapshot } from 'screepsmod-testing';

// Types
import type {
  TestSuite,
  TestCase,
  TestResult,
  TestSummary,
  TestFilter,
  BenchmarkResult,
  VisualSnapshot
} from 'screepsmod-testing';
```

---

## Best Practices

1. **Tag your tests** for easy filtering during development
2. **Use benchmarks** for performance-critical code paths
3. **Enable persistence** to track improvements over time
4. **Export to JSON** for CI/CD integration
5. **Set CPU budgets** for expensive operations
6. **Capture visuals** for base layout validation

## Next Steps

- Set up CI/CD integration with JSON output
- Create baseline visual snapshots
- Establish performance budgets
- Build a comprehensive test suite with appropriate tags
