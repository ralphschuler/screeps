# CPU Profiling and Budget Enforcement

This document describes the comprehensive CPU profiling system integrated into the unified stats manager.

## Overview

The CPU profiling system provides:
- **Real-time CPU tracking** per room and process
- **Budget validation** against ROADMAP.md targets (eco: ≤0.1, war: ≤0.25, overmind: ≤1.0)
- **Automated alerts** at 80% (warning) and 100% (critical) thresholds
- **Anomaly detection** for CPU spikes and sustained high usage
- **Console commands** for manual inspection

## Architecture

All CPU profiling is handled by the `UnifiedStatsManager` in `src/core/unifiedStats.ts`:

```typescript
// Automatic profiling on every tick
unifiedStats.startTick();        // Reset measurements
unifiedStats.startRoom(roomName); // Start room measurement
// ... room processing ...
unifiedStats.endRoom(roomName, cpuStart);   // Record room CPU
unifiedStats.finalizeTick();     // Validate budgets, detect anomalies, publish stats
```

The system automatically:
1. Tracks CPU usage for each room
2. Validates against budget limits (eco vs war rooms)
3. Detects anomalies (spikes, sustained high usage)
4. Logs critical violations and warnings
5. Exports metrics to Grafana

## Budget Limits (from ROADMAP.md Section 18)

| Type | Limit | Description |
|------|-------|-------------|
| **Eco Room** | 0.1 CPU/tick | Economic rooms (posture: eco, expand) |
| **War Room** | 0.25 CPU/tick | Combat rooms (posture: war, siege, danger ≥2) |
| **Overmind** | 1.0 CPU | Global empire logic (amortized over 20-50 ticks) |

## Alert Thresholds

- **Warning**: 80% of budget limit
  - Logged with `logger.warn()`
  - Indicates approaching budget constraint
  - Room still functional but needs optimization

- **Critical**: 100%+ of budget limit
  - Logged with `logger.error()`
  - Budget exceeded, may cause CPU overruns
  - Requires immediate optimization

## Anomaly Detection

The system detects two types of anomalies:

### CPU Spikes
- **Threshold**: 2x or more of baseline average
- **Minimum Samples**: 10 (for reliability)
- **Context**: Includes RCL, posture, danger level
- **Example**: Room normally uses 0.05 CPU, suddenly uses 0.12 CPU

### Sustained High Usage
- **Threshold**: 150% of process CPU budget
- **Target**: Kernel processes
- **Context**: Includes process name, frequency
- **Example**: Process budgeted for 0.5 CPU consistently using 0.75 CPU

## Console Commands

### cpuBudget()

Shows current budget status for all rooms:

```javascript
> cpuBudget()
=== CPU Budget Report (Tick 12345) ===
Rooms Evaluated: 5
Within Budget: 3
Over Budget: 2

Alerts: 2

🔴 CRITICAL (≥100% of budget):
  W1N1: 0.125 CPU / 0.100 limit (125.0%)

⚠️  WARNING (≥80% of budget):
  W2N2: 0.085 CPU / 0.100 limit (85.0%)
```

### cpuAnomalies()

Detects and displays CPU usage anomalies:

```javascript
> cpuAnomalies()
=== CPU Anomalies Detected: 2 ===

⚡ CPU Spikes (1):
  W1N1: 0.150 CPU (3.0x baseline 0.050)
    Context: RCL 5, posture: eco, danger: 0

📊 Sustained High Usage (1):
  room_process_W2N2: 0.180 CPU (1.8x budget 0.100)
    Context: RoomProcess (high)
```

### cpuProfile(showAll?)

Comprehensive CPU breakdown:

```javascript
> cpuProfile()
=== CPU Profile (Tick 12345) ===
Total: 8.52 / 20 (42.6%)
Bucket: 9850
Heap: 45.23 MB

Top 10 Rooms by CPU:
  W1N1 (RCL5, eco): avg 0.085 | peak 0.150 | samples 150
  W2N2 (RCL4, eco): avg 0.072 | peak 0.095 | samples 120
  ...

Top Kernel Processes by CPU:
  RoomProcess (high): avg 0.450 / budget 0.500 (90%)
  CreepProcess (high): avg 0.320 / budget 0.400 (80%)
  ...
```

With `showAll=true`, shows all rooms and processes instead of top 10.

## Grafana Integration

All metrics are automatically exported to Grafana with these prefixes:

### Room Metrics
```
stats.room.<roomName>.profiler.avg_cpu
stats.room.<roomName>.profiler.peak_cpu
stats.room.<roomName>.profiler.samples
```

### Process Metrics
```
stats.process.<processId>.avg_cpu
stats.process.<processId>.max_cpu
stats.process.<processId>.cpu_budget
```

### Empire Metrics
```
stats.cpu.used
stats.cpu.limit
stats.cpu.percent
stats.cpu.bucket
stats.cpu.heap_used
```

## Configuration

CPU profiling is configured in `src/core/unifiedStats.ts`:

```typescript
const config = {
  // Budget limits (CPU per tick)
  budgetLimits: {
    ecoRoom: 0.1,    // Eco rooms
    warRoom: 0.25,   // War rooms
    overmind: 1.0    // Empire-wide
  },
  
  // Alert thresholds (percentage of budget)
  budgetAlertThresholds: {
    warning: 0.8,    // 80% of budget
    critical: 1.0    // 100% of budget
  },
  
  // Anomaly detection
  anomalyDetection: {
    enabled: true,
    spikeThreshold: 2.0,  // 2x baseline is anomalous
    minSamples: 10        // Need 10 samples before detecting
  }
};
```

## Usage Examples

### Monitoring a Specific Room

```javascript
// Check if room is over budget
const report = unifiedStats.validateBudgets();
const roomAlert = report.alerts.find(a => a.target === "W1N1");
if (roomAlert) {
  console.log(`W1N1 at ${(roomAlert.percentUsed * 100).toFixed(1)}% of budget`);
}
```

### Finding CPU Hotspots

```javascript
// Get current snapshot
const snapshot = unifiedStats.getCurrentSnapshot();

// Sort rooms by CPU usage
const hotRooms = Object.values(snapshot.rooms)
  .sort((a, b) => b.profiler.avgCpu - a.profiler.avgCpu)
  .slice(0, 5);

console.log("Top 5 CPU-intensive rooms:");
hotRooms.forEach(r => {
  console.log(`${r.name}: ${r.profiler.avgCpu.toFixed(3)} CPU (RCL ${r.rcl})`);
});
```

### Detecting Performance Regressions

```javascript
// Detect anomalies
const anomalies = unifiedStats.detectAnomalies();
const spikes = anomalies.filter(a => a.type === "spike");

if (spikes.length > 0) {
  console.log(`⚠️ ${spikes.length} CPU spikes detected!`);
  spikes.forEach(spike => {
    console.log(`${spike.target}: ${spike.multiplier.toFixed(1)}x normal`);
  });
}
```

## Best Practices

### 1. Monitor Alerts Regularly

Check `cpuBudget()` output periodically:
- **Green** (no alerts): All systems optimal
- **Yellow** (warnings): Plan optimizations
- **Red** (critical): Immediate action needed

### 2. Investigate Anomalies

When `cpuAnomalies()` reports spikes:
1. Check the context (RCL, posture, danger)
2. Review recent code changes
3. Check for pathfinding storms
4. Verify room.find() call frequency

### 3. Use Grafana Dashboards

Create dashboards to visualize:
- CPU usage trends over time
- Budget utilization per room
- Process CPU distribution
- Anomaly frequency

### 4. Optimize Based on Data

Use `cpuProfile()` to identify:
- Most expensive rooms
- Inefficient processes
- Opportunities for optimization

Focus optimization efforts on:
1. Rooms/processes using >80% of budget
2. Frequent anomaly sources
3. Processes with sustained high usage

## Troubleshooting

### High CPU in Eco Rooms

If eco rooms consistently exceed 0.1 CPU:
- Check creep count (too many creeps?)
- Review pathfinding frequency
- Verify room.find() caching
- Check construction site count
- Audit tower logic

### CPU Spikes

Common causes of spikes:
- **Pathfinding storms**: Many creeps recalculating paths
- **Construction waves**: Many builders spawned at once
- **Room transitions**: Upgrading RCL or changing posture
- **Combat events**: Sudden hostile appearance

### False Anomalies

If anomalies seem incorrect:
- Check `minSamples` requirement (default: 10)
- Verify baseline has stabilized
- Consider room-specific conditions (RCL upgrades)
- Review `spikeThreshold` setting (default: 2.0)

## Integration with Existing Systems

### cpuBudgetManager

The old `cpuBudgetManager.ts` is kept for compatibility but the new system in `unifiedStats.ts` is more comprehensive:

| Feature | cpuBudgetManager | unifiedStats |
|---------|------------------|--------------|
| Budget checking | ✓ | ✓ |
| Alerts | Basic | Advanced (warning/critical) |
| Anomaly detection | ✗ | ✓ |
| Grafana export | ✗ | ✓ |
| Historical tracking | ✗ | ✓ (EMA) |
| Console commands | ✗ | ✓ |

### Kernel Process Stats

Kernel already tracks process CPU. The new system adds:
- Budget validation for processes
- Anomaly detection for sustained high usage
- Alert generation when processes exceed budgets

## Future Enhancements

Potential future improvements:
- [ ] Automated optimization suggestions
- [ ] CPU budget auto-tuning based on room count
- [ ] Predictive anomaly detection (ML-based)
- [ ] Per-subsystem budget allocation
- [ ] Historical trending and regression detection
- [ ] Integration with emergency response system

## See Also

- [ROADMAP.md Section 18: CPU-Management & Scheduling](../../ROADMAP.md#18-cpu-management--scheduling)
- [Unified Stats System](./UNIFIED_STATS.md)
- [Kernel Architecture](./KERNEL.md)
- [Console Commands Reference](./CONSOLE_COMMANDS.md)
