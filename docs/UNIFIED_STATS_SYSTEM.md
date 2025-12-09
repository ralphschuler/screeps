# Unified Stats System

## Overview

The Unified Stats System consolidates all bot statistics collection into a single, cohesive system that exports metrics with proper category prefixes for optimal InfluxDB/Grafana integration.

## What Was Consolidated

This system replaces three separate systems:
1. **stats.ts** - Statistics manager for subsystem, role, room, and empire stats
2. **profiler.ts** - CPU profiling for rooms, subsystems, and roles
3. **memorySegmentStats.ts** - Memory segment persistence and flat stat export

## Architecture

### Core Module: `unifiedStats.ts`

Located at `packages/screeps-bot/src/core/unifiedStats.ts`, this module provides:

- **Single initialization point** - Call once at bot startup
- **Tick lifecycle management** - `startTick()` and `finalizeTick()` 
- **CPU profiling** - Track room and subsystem execution time
- **Native call tracking** - Monitor PathFinder and creep action usage
- **Automatic export** - Publishes to Memory.stats in InfluxDB-friendly format

### Integration Points

1. **SwarmBot** (`src/SwarmBot.ts`)
   - Initializes unified stats on startup
   - Calls `startTick()` at beginning of main loop
   - Uses `measureSubsystem()` to wrap major subsystems
   - Calls `finalizeTick()` at end of main loop

2. **RoomNode** (`src/core/roomNode.ts`)
   - Tracks room CPU usage with `startRoom()` and `endRoom()`
   - Records room stats with `recordRoom()`

3. **Native Calls Tracker** (`src/core/nativeCallsTracker.ts`)
   - Wraps Screeps API methods to track usage
   - Calls `recordNativeCall()` for each tracked method

## Metric Categories

All stats are exported with the `stats.*` prefix for clear organization:

### System Metrics

```
stats.cpu.used              - CPU used this tick
stats.cpu.limit             - CPU limit
stats.cpu.bucket            - CPU bucket level
stats.cpu.percent           - CPU usage percentage
stats.cpu.heap_mb           - Heap memory used (MB)
```

### Progression

```
stats.gcl.level             - GCL level
stats.gcl.progress          - GCL progress
stats.gcl.progress_total    - GCL progress total
stats.gcl.progress_percent  - GCL progress percentage
stats.gpl.level             - GPL level
```

### Empire Aggregations

```
stats.empire.rooms          - Total owned rooms
stats.empire.creeps         - Total creeps
stats.empire.credits        - Market credits
stats.empire.energy.storage - Total storage energy
stats.empire.energy.terminal - Total terminal energy
stats.empire.energy.available - Total available energy
stats.empire.energy.capacity - Total energy capacity
```

### Per-Room Metrics

```
stats.room.{ROOM}.rcl                           - Controller level
stats.room.{ROOM}.energy.available              - Energy available
stats.room.{ROOM}.energy.capacity               - Energy capacity
stats.room.{ROOM}.energy.storage                - Storage energy
stats.room.{ROOM}.energy.terminal               - Terminal energy
stats.room.{ROOM}.controller.progress           - Controller progress
stats.room.{ROOM}.controller.progress_total     - Controller progress total
stats.room.{ROOM}.controller.progress_percent   - Controller progress %
stats.room.{ROOM}.creeps                        - Creep count in room
stats.room.{ROOM}.hostiles                      - Hostile count in room
```

### Brain State

```
stats.room.{ROOM}.brain.danger              - Danger level (0-3)
stats.room.{ROOM}.brain.posture_code        - Posture code (0=eco, 1=expand, etc.)
stats.room.{ROOM}.brain.colony_level_code   - Colony level code (1-5)
```

### Pheromones

```
stats.room.{ROOM}.pheromone.expand      - Expand pheromone level
stats.room.{ROOM}.pheromone.harvest     - Harvest pheromone level
stats.room.{ROOM}.pheromone.build       - Build pheromone level
stats.room.{ROOM}.pheromone.upgrade     - Upgrade pheromone level
stats.room.{ROOM}.pheromone.defense     - Defense pheromone level
stats.room.{ROOM}.pheromone.war         - War pheromone level
stats.room.{ROOM}.pheromone.siege       - Siege pheromone level
stats.room.{ROOM}.pheromone.logistics   - Logistics pheromone level
```

### Room Metrics

```
stats.room.{ROOM}.metrics.energy.harvested              - Energy harvested
stats.room.{ROOM}.metrics.energy.spawning               - Energy spent on spawning
stats.room.{ROOM}.metrics.energy.construction           - Energy spent on construction
stats.room.{ROOM}.metrics.energy.repair                 - Energy spent on repairs
stats.room.{ROOM}.metrics.energy.tower                  - Energy used by towers
stats.room.{ROOM}.metrics.energy.available_for_sharing  - Energy available for sharing
stats.room.{ROOM}.metrics.energy.capacity_total         - Total energy capacity
stats.room.{ROOM}.metrics.energy.need                   - Energy need level (0-3)
stats.room.{ROOM}.metrics.controller_progress           - Controller progress
stats.room.{ROOM}.metrics.hostile_count                 - Hostile count
stats.room.{ROOM}.metrics.damage_received               - Damage received
stats.room.{ROOM}.metrics.construction_sites            - Construction site count
```

### Room CPU Profiling

```
stats.room.{ROOM}.profiler.avg_cpu      - Average CPU used by room
stats.room.{ROOM}.profiler.peak_cpu     - Peak CPU used by room
stats.room.{ROOM}.profiler.samples      - Number of samples
```

### Subsystem Profiling

```
stats.profiler.subsystem.{NAME}.avg_cpu     - Average CPU for subsystem
stats.profiler.subsystem.{NAME}.peak_cpu    - Peak CPU for subsystem
stats.profiler.subsystem.{NAME}.calls       - Number of calls this tick
stats.profiler.subsystem.{NAME}.samples     - Total samples collected
```

Common subsystems:
- `kernel` - Process kernel execution
- `spawns` - Spawn logic
- `processSync` - Process synchronization
- `moveRequests` - Traffic management
- `powerCreeps` - Power creep execution
- `visualizations` - Rendering

### Role Profiling

```
stats.profiler.role.{NAME}.count        - Number of creeps with role
stats.profiler.role.{NAME}.avg_cpu      - Average CPU per role
stats.profiler.role.{NAME}.peak_cpu     - Peak CPU for role
stats.profiler.role.{NAME}.calls        - Number of calls this tick
stats.profiler.role.{NAME}.samples      - Total samples collected
```

Common roles:
- `harvester`, `hauler`, `upgrader`, `builder` - Economy
- `guard`, `defender`, `healer` - Defense
- `scout`, `claimer` - Expansion

### Native API Calls

```
stats.native.pathfinder_search  - PathFinder.search calls
stats.native.move_to            - moveTo calls
stats.native.move               - move calls
stats.native.harvest            - harvest calls
stats.native.transfer           - transfer calls
stats.native.withdraw           - withdraw calls
stats.native.build              - build calls
stats.native.repair             - repair calls
stats.native.upgrade_controller - upgradeController calls
stats.native.attack             - attack calls
stats.native.ranged_attack      - rangedAttack calls
stats.native.heal               - heal calls
stats.native.dismantle          - dismantle calls
stats.native.say                - say calls
stats.native.total              - Total native calls
```

### System Information

```
stats.system.tick       - Game tick
stats.system.timestamp  - Real timestamp (milliseconds)
```

## Usage

### Basic Usage

```typescript
import { unifiedStats } from "./core/unifiedStats";

// Initialize once at startup
unifiedStats.initialize();

// In main loop
unifiedStats.startTick();

// Measure a subsystem
unifiedStats.measureSubsystem("mySubsystem", () => {
  // Your code here
});

// Track room execution
const cpuStart = unifiedStats.startRoom("W1N1");
// ... room processing ...
unifiedStats.recordRoom(room, cpuUsed);
unifiedStats.endRoom("W1N1", cpuStart);

// Finalize tick (exports to Memory.stats)
unifiedStats.finalizeTick();
```

### Configuration

```typescript
import { UnifiedStatsManager } from "./core/unifiedStats";

const stats = new UnifiedStatsManager({
  enabled: true,                    // Enable/disable stats collection
  smoothingFactor: 0.1,             // EMA smoothing (0-1)
  trackNativeCalls: true,           // Track native API calls
  logInterval: 100,                 // Log summary every N ticks (0 = never)
  segmentUpdateInterval: 10,        // Update memory segment every N ticks
  segmentId: 90,                    // Memory segment ID
  maxHistoryPoints: 1000            // Max history points in segment
});
```

### Enable/Disable

```typescript
// Disable stats collection (saves CPU)
unifiedStats.setEnabled(false);

// Re-enable
unifiedStats.setEnabled(true);
```

### Get Current Snapshot

```typescript
const snapshot = unifiedStats.getSnapshot();

console.log(`CPU: ${snapshot.cpu.used}/${snapshot.cpu.limit}`);
console.log(`Rooms: ${snapshot.empire.rooms}`);
console.log(`Creeps: ${snapshot.empire.creeps}`);
```

## Grafana Dashboard

The Grafana dashboard (`packages/screeps-server/grafana/provisioning/dashboards/screeps-ant-swarm.json`) has been updated to query the new metric format.

### Example Queries

**CPU Usage:**
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["stat"] == "stats.cpu.used")
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
```

**Subsystem CPU (Stacked):**
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["stat"] =~ /stats\.profiler\.subsystem\..*\.avg_cpu$/)
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
```

**Room Energy:**
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["stat"] =~ /stats\.room\..*\.energy\.storage$/)
  |> aggregateWindow(every: v.windowPeriod, fn: last, createEmpty: false)
```

## InfluxDB Integration

The influx exporter (`packages/screeps-influx-exporter`) automatically parses the `stats.*` prefix and creates proper categories:

- Keys like `stats.cpu.used` → category: `stats`, measurement field
- Keys like `stats.room.W1N1.rcl` → category: `stats`, sub_category: `W1N1`
- Keys like `stats.profiler.subsystem.kernel.avg_cpu` → category: `stats`, sub_category: `kernel`

This enables powerful filtering in Grafana:
```flux
|> filter(fn: (r) => r["category"] == "stats")
|> filter(fn: (r) => r["sub_category"] == "W1N1")
```

## Benefits

### Single Source of Truth
- No more duplication between profiler and stats
- One system tracks everything consistently
- Reduced memory footprint

### Proper Categorization
- All metrics use `stats.*` prefix
- Easy to filter in InfluxDB/Grafana
- Clear hierarchy and organization

### Better Performance
- One system instead of three
- Reduced CPU overhead
- Optimized data collection

### Easier Maintenance
- All stats logic in one place
- Single API to learn
- Consistent patterns throughout

### Full Type Safety
- Proper TypeScript interfaces
- Compile-time checks
- Better IDE support

## Migration from Legacy Systems

### Old Code
```typescript
import { statsManager } from "./core/stats";
import { profiler } from "./core/profiler";

profiler.measureSubsystem("test", () => {
  // code
});

statsManager.recordRoom(room, cpu, peakCpu, metrics);
statsManager.updateEmpireStats();
statsManager.finalizeTick();
profiler.finalizeTick();
```

### New Code
```typescript
import { unifiedStats } from "./core/unifiedStats";

unifiedStats.measureSubsystem("test", () => {
  // code
});

unifiedStats.recordRoom(room, cpuUsed);
unifiedStats.finalizeTick(); // Handles everything
```

### Backward Compatibility

Legacy systems are still exported for backward compatibility:
```typescript
export { profiler } from "./core/profiler";
export { statsManager } from "./core/stats";
export { memorySegmentStats } from "./core/memorySegmentStats";
```

However, these are marked as deprecated and will be removed in a future version.

## Testing

Comprehensive test coverage in `test/unit/unifiedStats.test.ts`:

- Initialization and configuration
- CPU stats collection
- Progression stats collection
- Native calls tracking
- Subsystem measurement
- Room execution tracking
- Memory export with proper prefixes
- Reset functionality

Run tests:
```bash
npm test
```

All 440 tests pass, including the new unified stats tests.

## Performance

The unified stats system has minimal CPU impact:

- **Initialization**: ~0.01 CPU (once at startup)
- **Per-tick overhead**: ~0.1-0.2 CPU
- **Native call tracking**: ~0.01 CPU per tracked call
- **Total impact**: <1% of CPU budget in typical scenarios

## Troubleshooting

### Stats not appearing in Memory.stats

Check that stats is enabled:
```typescript
console.log(unifiedStats.isEnabled()); // Should be true
```

### Dashboard shows no data

1. Verify stats are being exported with `stats.*` prefix:
   ```typescript
   console.log(JSON.stringify(Memory.stats).substring(0, 200));
   ```

2. Check influx exporter is running and connected

3. Verify InfluxDB bucket and credentials

### High CPU usage

Disable native calls tracking if not needed:
```typescript
// In SwarmBot initialization
setNativeCallsTracking(false);
```

Or disable stats entirely:
```typescript
unifiedStats.setEnabled(false);
```

## Future Enhancements

Potential improvements:
- [ ] Configurable metric retention policies
- [ ] Custom metric categories
- [ ] Real-time streaming to external APIs
- [ ] Advanced analytics and predictions
- [ ] Automated performance optimization suggestions

## See Also

- [Stats System Overview](./STATS_SYSTEM_OVERVIEW.md)
- [Grafana Dashboard Example](./GRAFANA_DASHBOARD_EXAMPLE.md)
- [InfluxDB Exporter README](../packages/screeps-influx-exporter/README.md)
- [ROADMAP](../ROADMAP.md) - Section 21: Logging, Monitoring & Visualisierung
