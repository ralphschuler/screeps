# @ralphschuler/screeps-stats

Unified statistics collection and export system for Screeps bots. Provides comprehensive metrics collection, CPU profiling, and integration with monitoring systems like Prometheus and Grafana.

## Features

- **Unified Stats Collection**: Consolidates all bot statistics into a single cohesive system
- **CPU Profiling**: Track CPU usage by subsystem, role, and process
- **Performance Metrics**: Monitor GCL/GPL progression, room stats, creep metrics
- **Adaptive Budgets**: Dynamic CPU budget allocation based on empire size and bucket status
- **Memory Segment Persistence**: Efficient stats storage using Memory Segments
- **Pathfinding Metrics**: Track pathfinding performance and cache efficiency
- **Monitoring Integration**: Export metrics to Prometheus/Graphite/InfluxDB

## Installation

```bash
npm install @ralphschuler/screeps-stats
```

## Runtime Contract

`UnifiedStatsManager` follows one tick-local lifecycle:

1. `initialize()` once after global reset to request the configured memory segment and install console CPU-detail helpers.
2. `startTick()` at the beginning of each game tick to reset transient measurements while preserving room stats for distributed room processes.
3. `record*` / `start*Measurement()` / `end*Measurement()` calls during bot execution to collect subsystem, room, role, process, native-call, and cache data.
4. `finalizeTick()` at the end of the tick to publish `Memory.stats`, optionally update the memory segment, and emit throttled CPU budget/anomaly alerts.

The package keeps its public API in `src/index.ts`. Implementation modules under `src/unified-stats/` are internal helpers used to keep `unifiedStats.ts` readable without expanding the public package surface.

### Important Memory Shapes

- `Memory.stats` is overwritten each tick with the latest exported snapshot.
- `Memory.stats.profiler` is preserved when publishing so legacy profiler consumers keep their rolling samples.
- `Memory.stats.cpu_details` is short-lived, opt-in drilldown data controlled by `enableCpuDetails()` / `disableCpuDetails()`.
- `RawMemory.segments[segmentId]` stores historical snapshots only on the configured segment update interval.

## Usage

### Basic Stats Collection

```typescript
import { unifiedStats } from '@ralphschuler/screeps-stats';

// Start of tick - initialize stats collection
unifiedStats.initialize();

// Track CPU usage for a subsystem
unifiedStats.startSubsystemMeasurement('defense');
// ... defense logic ...
unifiedStats.endSubsystemMeasurement('defense');

// Track room-specific CPU
unifiedStats.startRoomMeasurement('W1N1');
// ... room logic ...
unifiedStats.endRoomMeasurement('W1N1');

// End of tick - finalize and export stats
unifiedStats.finalize();
```

### Memory Segment Stats

```typescript
import { memorySegmentStats } from '@ralphschuler/screeps-stats';

// Configure stats segments
memorySegmentStats.setConfig({
  primarySegment: 90,
  backupSegment: 91,
  updateInterval: 50,  // Update every 50 ticks
  maxDataPoints: 1000
});

// Stats are automatically persisted to memory segments
// Access via RawMemory.segments[90] for external monitoring
```

### Adaptive CPU Budgets

```typescript
import { getAdaptiveBudgetInfo, calculateRoomScalingMultiplier } from '@ralphschuler/screeps-stats';

// Get current budget information
const budgetInfo = getAdaptiveBudgetInfo();
console.log(`Current bucket mode: ${budgetInfo.bucketMode}`);
console.log(`Room scaling: ${budgetInfo.roomScaling}x`);

// Calculate budget for a specific frequency
const scaling = calculateRoomScalingMultiplier(Object.keys(Game.rooms).length);
const budget = scaling * 0.1; // Base budget for eco rooms
```

### Pathfinding Metrics

```typescript
import { pathfindingMetrics } from '@ralphschuler/screeps-stats';

// Record pathfinding calls (usually done automatically)
const startCpu = Game.cpu.getUsed();
const result = creep.moveTo(target);
const cpuCost = Game.cpu.getUsed() - startCpu;
pathfindingMetrics.recordCall('moveTo', false, cpuCost);

// Get current metrics
const metrics = pathfindingMetrics.getMetrics();
console.log(`Cache hit rate: ${metrics.cacheHitRate}%`);
console.log(`CPU saved: ${metrics.cpuSaved}`);
```

## API Reference

### UnifiedStatsManager

Main statistics collection manager.

**Methods:**
- `initialize()` - Initialize stats collection for the tick
- `finalize()` - Finalize stats and prepare for export
- `startSubsystemMeasurement(name: string)` - Start tracking CPU for a subsystem
- `endSubsystemMeasurement(name: string)` - End subsystem tracking
- `startRoomMeasurement(roomName: string)` - Start tracking CPU for a room
- `endRoomMeasurement(roomName: string)` - End room tracking
- `getSnapshot()` - Get current stats snapshot
- `getBudgetReport()` - Get CPU budget usage report

### MemorySegmentStats

Manages stats persistence in memory segments.

**Methods:**
- `setConfig(config: StatsConfig)` - Configure segment storage
- `run()` - Update stats segments (call each tick)
- `getMetricSeries(name: string)` - Get time series data for a metric
- `getCurrentStats()` - Get current global stats

### PathfindingMetricsTracker

Tracks pathfinding performance metrics.

**Methods:**
- `recordCall(type, wasCached, cpuCost)` - Record a pathfinding call
- `getMetrics()` - Get current pathfinding metrics
- `reset()` - Reset metrics for new tick

## Configuration

### UnifiedStatsConfig

```typescript
{
  enabled: boolean;                    // Enable/disable stats collection
  smoothingFactor: number;             // 0-1, for exponential smoothing
  trackNativeCalls: boolean;           // Track native Screeps API calls
  logInterval: number;                 // Ticks between console logs
  segmentUpdateInterval: number;       // Ticks between segment updates
  segmentId: number;                   // Memory segment ID
  maxHistoryPoints: number;            // Max historical data points
  budgetLimits: {
    ecoRoom: number;                   // CPU budget for eco rooms
    warRoom: number;                   // CPU budget for war rooms
    overmind: number;                  // CPU budget for empire-wide processes
  };
  budgetAlertThresholds: {
    warning: number;                   // Threshold for warnings (0-1)
    critical: number;                  // Threshold for critical alerts (0-1)
  };
  anomalyDetection: {
    enabled: boolean;                  // Enable anomaly detection
    spikeThreshold: number;            // CPU spike threshold (multiplier)
    minSamples: number;                // Min samples before detecting anomalies
  };
}
```

## External Dependencies

This package requires the consuming bot to provide implementations for:

- **Logger**: Logging interface
- **MemoryManager**: Memory access abstraction
- **ShardManager**: Multi-shard coordination
- **Cache Stats**: Cache performance metrics

See `interfaces.ts` for the required contracts. Default stub implementations are provided.

## Integration with Monitoring

Stats are exported in a format compatible with:

- **Prometheus**: Metrics with proper prefixes and labels
- **Grafana**: Time series visualization
- **InfluxDB**: Line protocol format
- **Graphite**: Hierarchical metrics

Example Prometheus metrics:
```
stats.cpu.used{shard="shard0"} 45.2
stats.gcl.level{shard="shard0"} 8
stats.room.energyAvailable{room="W1N1"} 300
stats.profiler.defense{room="W1N1"} 2.5
```

## Performance Notes

- Minimal CPU overhead: ~0.1-0.5 CPU per tick
- Adaptive stat collection: Reduces frequency when bucket is low
- Efficient memory segment usage: Only updates every N ticks
- Cache-friendly: Reuses calculations across multiple accesses

## Testing

```bash
npm test
```

## License

Unlicense
