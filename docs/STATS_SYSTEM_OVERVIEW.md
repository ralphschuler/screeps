# Stats System Overview

## Introduction

The Screeps bot now features a comprehensive unified statistics system that tracks all aspects of bot performance and behavior. This document provides a high-level overview of the system.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Memory.stats Root                        │
│                  (Unified Stats Storage)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼──────┐ ┌───▼────┐ ┌─────▼─────┐
        │   StatsRoot  │ │Profiler│ │  Influx   │
        │  (Structured)│ │(Legacy)│ │ Exporter  │
        └──────────────┘ └────────┘ └───────────┘
                │
    ┌───────────┼───────────┬──────────┬──────────┐
    │           │           │          │          │
┌───▼───┐  ┌───▼────┐  ┌──▼───┐  ┌───▼───┐  ┌──▼────┐
│Empire │  │ Rooms  │  │Roles │  │Subsys │  │Native │
│ Stats │  │ Stats  │  │Stats │  │ Stats │  │Calls  │
└───────┘  └────────┘  └──────┘  └───────┘  └───────┘
                │
        ┌───────┼────────┐
        │       │        │
    ┌───▼───┐┌─▼──┐┌────▼────┐
    │Metrics││CPU ││Pheromone│
    └───────┘└────┘└─────────┘
```

## Components

### 1. StatsManager (`core/stats.ts`)
Central manager for all statistics collection and publishing.

**Responsibilities:**
- Collect stats from all subsystems
- Aggregate and compute rolling averages
- Publish flattened stats to Memory
- Provide helper functions for stats queries

**Key Methods:**
- `recordSubsystem()` - Record subsystem CPU usage
- `recordRole()` - Record role CPU and count
- `recordRoom()` - Record room metrics
- `recordPheromones()` - Record pheromone levels
- `recordNativeCall()` - Track native API calls
- `updateEmpireStats()` - Compute empire-wide stats
- `finalizeTick()` - Publish all stats at end of tick

### 2. Profiler (`core/profiler.ts`)
Legacy profiler integrated with new stats system.

**Integration:**
- Measures CPU for rooms, subsystems, and roles
- Automatically forwards measurements to StatsManager
- Maintains backward compatibility
- Publishes both old and new format stats

### 3. Native Calls Tracker (`core/nativeCallsTracker.ts`)
Wraps Screeps API methods to track usage.

**Tracked Methods:**
- PathFinder.search
- Creep movement: moveTo, move
- Creep actions: harvest, transfer, withdraw, build, repair, upgradeController
- Creep combat: attack, rangedAttack, heal, dismantle
- Creep utility: say

**Features:**
- Minimal overhead (~0.01 CPU per call)
- Can be enabled/disabled
- Initialized once at bot startup

### 4. Room Integration (`core/roomNode.ts`)
Each room records its stats at end of tick.

**Collected Metrics:**
- Controller level and progress
- Energy availability and capacity
- Storage energy
- Creep and hostile counts
- CPU usage (average and peak)
- Pheromone levels
- Danger level

### 5. Influx Exporter (`screeps-influx-exporter`)
Scrapes stats from Memory and exports to InfluxDB.

**Enhanced Features:**
- Recognizes new stats categories
- Tags stats with category for filtering
- Parses room names, role names, subsystem names
- Supports time-series analysis in Grafana

## Data Flow

```
Tick Start
    │
    ├─> Room Processing
    │   ├─> Measure CPU (Profiler)
    │   ├─> Collect Metrics (Pheromone Manager)
    │   └─> Record Room Stats (StatsManager)
    │
    ├─> Creep Execution
    │   ├─> Native Calls Tracking (if enabled)
    │   ├─> Measure CPU per Role (Profiler)
    │   └─> Record Role Stats (StatsManager)
    │
    ├─> Subsystem Execution
    │   ├─> Measure CPU (Profiler)
    │   └─> Record Subsystem Stats (StatsManager)
    │
    └─> Tick End
        ├─> Update Empire Stats
        ├─> Finalize Stats (publish to Memory)
        └─> Finalize Profiler
            │
Tick Complete → Memory.stats populated → Influx Exporter scrapes → Grafana displays
```

## Statistics Categories

### Empire Statistics
Global metrics across all rooms:
- Room count, creep count
- Total storage energy
- GCL/GPL progress
- CPU usage and bucket
- Heap memory usage
- Market credits

### Room Statistics
Per-room metrics:
- RCL and controller progress
- Energy levels and capacity
- Creep and hostile counts
- CPU usage
- Energy harvested
- Damage received
- Danger level

### Subsystem Statistics
CPU tracking for major subsystems:
- rooms (room processing)
- kernel (process management)
- spawns (spawn logic)
- creeps (creep execution)
- moveRequests (traffic management)
- powerCreeps
- visualizations
- stats (self-monitoring)

### Role Statistics
Per-role metrics:
- Creep count
- CPU usage (average and peak)
- Number of creeps processed

Common roles: harvester, hauler, upgrader, builder, guard, scout, claimer, etc.

### Pheromone Statistics
Per-room pheromone levels:
- expand, harvest, build, upgrade
- defense, war, siege, logistics
- Dominant pheromone
- Room intent/posture

### Native Calls Statistics
API usage tracking:
- PathFinder.search calls
- Movement calls (moveTo, move)
- Work actions (harvest, build, repair, upgrade)
- Combat actions (attack, rangedAttack, heal)
- Transfer actions (transfer, withdraw)
- Other actions (dismantle, say)
- Total calls per tick

## Performance Characteristics

### CPU Usage
- **StatsManager overhead**: ~0.1-0.2 CPU per tick
- **Native calls tracking**: ~0.01 CPU per tracked call (when enabled)
- **Profiler integration**: No additional overhead (already existed)
- **Total impact**: <1% of CPU budget in typical scenarios

### Memory Usage
- **Structured stats**: ~10-20 KB (in Memory.stats object)
- **Flattened stats**: ~5-10 KB (as individual Memory keys)
- **Total**: ~15-30 KB depending on empire size
- **Negligible impact** on 2 MB Memory limit

### Update Frequency
- **Empire stats**: Every tick
- **Room stats**: Every tick
- **Pheromone stats**: Every 5 ticks (aligned with pheromone updates)
- **Role/Subsystem stats**: Every tick
- **Native calls**: Every tick (when enabled)

## Configuration

### Enable/Disable Stats
```typescript
import { statsManager } from "./core/stats";

statsManager.setEnabled(false); // Disable
statsManager.setEnabled(true);  // Enable
```

### Enable/Disable Native Calls Tracking
```typescript
import { setNativeCallsTracking } from "./core/nativeCallsTracker";

setNativeCallsTracking(false); // Disable
setNativeCallsTracking(true);  // Enable (default)
```

### Configure Smoothing Factor
```typescript
// In stats.ts constructor
new StatsManager({
  smoothingFactor: 0.1 // Higher = more weight on recent values
});
```

### Configure Log Interval
```typescript
// In stats.ts constructor
new StatsManager({
  logInterval: 100 // Log summary every N ticks (0 = never)
});
```

## Helper Functions

### Query Functions
```typescript
import { 
  getOwnedRoomNames,
  getTotalCreepCount,
  getCreepCountByRole,
  getTotalStorageEnergy,
  getAverageRCL,
  getRoomByMetric
} from "./core/stats";

// Get owned rooms
const rooms = getOwnedRoomNames();

// Get creep counts
const totalCreeps = getTotalCreepCount();
const harvesters = getCreepCountByRole("harvester");

// Get energy totals
const totalEnergy = getTotalStorageEnergy();

// Get average RCL
const avgRCL = getAverageRCL();

// Find rooms by metric
const richestRoom = getRoomByMetric("energy", "highest");
const poorestRoom = getRoomByMetric("energy", "lowest");
const mostExpensiveRoom = getRoomByMetric("cpu", "highest");
```

### Stats Access
```typescript
import { statsManager } from "./core/stats";

// Get full stats object
const stats = statsManager.getStats();

// Access specific stats
const empireStats = stats.empire;
const roomStats = stats.rooms["W1N1"];
const roleStats = stats.roles["harvester"];
const subsystemStats = stats.subsystems["rooms"];
const pheromoneStats = stats.pheromones["W1N1"];
const nativeCallsStats = stats.nativeCalls;
```

## Integration with External Tools

### Grafana Dashboards
See `GRAFANA_DASHBOARD_EXAMPLE.md` for:
- Example Flux queries for all stat types
- Recommended dashboard layouts
- Alert configurations
- Variable definitions

### Influx Exporter
The exporter automatically:
- Scrapes flattened stats from Memory
- Tags stats with categories
- Parses stat keys to extract metadata
- Stores in time-series database

### Custom Tools
Stats are published in a flat format for easy consumption:
```javascript
// Access in console
Memory["stats.empire.total_creeps"]
Memory["stats.room.W1N1.rcl"]
Memory["stats.role.harvester.count"]
```

## Migration from Legacy Stats

See `STATS_MIGRATION.md` for:
- Complete migration guide
- Mapping from old to new stat keys
- Backward compatibility notes
- Transition checklist

## Best Practices

### 1. Monitor Key Metrics
Focus on:
- CPU usage (total and per subsystem/role)
- CPU bucket level
- Native calls (especially PathFinder)
- Room danger levels
- Energy balance

### 2. Use Stats for Optimization
- Identify expensive subsystems/roles
- Detect PathFinder overuse
- Monitor room efficiency
- Track pheromone balance

### 3. Set Up Alerts
Configure Grafana alerts for:
- High CPU usage (>90% of limit)
- Low bucket (<2000)
- Rooms under attack (danger > 1)
- Excessive PathFinder calls (>100/tick)

### 4. Regular Review
- Check dashboard weekly
- Review top CPU consumers
- Analyze trends over time
- Adjust bot parameters as needed

## Future Enhancements

Potential improvements:
- [ ] Memory segment persistence for historical stats
- [ ] Stats export to external API
- [ ] Custom stat categories via config
- [ ] Real-time stats streaming
- [ ] Advanced analytics and predictions
- [ ] Automated performance optimization

## Troubleshooting

### Stats Not Appearing
- Check `statsManager.isEnabled()` returns `true`
- Verify bot is running (not in critical bucket mode)
- Check Memory size hasn't exceeded limit

### Native Calls Not Tracked
- Verify native calls tracking is enabled
- Check initialization in main loop
- Ensure profiling config is enabled

### Influx Data Missing
- Verify exporter is running
- Check exporter logs for errors
- Ensure InfluxDB is accessible
- Verify bucket configuration

### High Memory Usage
- Disable native calls tracking if not needed
- Reduce log interval
- Consider memory segment storage

## Conclusion

The unified stats system provides comprehensive visibility into bot performance and behavior. It enables data-driven optimization, early problem detection, and effective monitoring through Grafana dashboards. The system is designed to be efficient, extensible, and easy to use while maintaining backward compatibility with existing infrastructure.
