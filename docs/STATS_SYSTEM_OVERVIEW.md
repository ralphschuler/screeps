# Stats System Overview

## Introduction

The Screeps bot features a **unified statistics system** (`unifiedStats`) that consolidates all performance tracking, metrics collection, and profiling into a single cohesive system. This replaced the previous dual-system approach (profiler + statsManager).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Memory.stats Root                        │
│                  (Unified Stats Storage)                     │
│                    Nested Object Format                      │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
        ┌───────▼──────┐            ┌──────▼────────┐
        │ UnifiedStats │            │   Graphite    │
        │   Manager    │───────────▶│   Exporter    │
        └──────────────┘            └───────────────┘
                │
    ┌───────────┼───────────┬──────────┬──────────┬──────────┐
    │           │           │          │          │          │
┌───▼───┐  ┌───▼────┐  ┌──▼───┐  ┌───▼───┐  ┌──▼────┐  ┌──▼────┐
│Empire │  │ Rooms  │  │Roles │  │Subsys │  │Native │  │Process│
│ Stats │  │ Stats  │  │Stats │  │ Stats │  │Calls  │  │ Stats │
└───────┘  └────────┘  └──────┘  └───────┘  └───────┘  └───────┘
                │
        ┌───────┼────────┐
        │       │        │
    ┌───▼───┐┌─▼──┐┌────▼────┐
    │Metrics││CPU ││Pheromone│
    └───────┘└────┘└─────────┘
```

## Components

### 1. UnifiedStats (`core/unifiedStats.ts`)
**Single central manager** for all statistics collection and publishing.

**Responsibilities:**
- Collect stats from all subsystems
- Aggregate and compute rolling averages
- Publish **nested object structure** to Memory.stats
- Track role execution via `role:` prefix
- Collect pheromones from SwarmState
- Track native API calls
- Record kernel process stats

**Key Methods:**
- `measureSubsystem()` - Measure CPU for any subsystem (including roles with `role:` prefix)
- `recordRoom()` - Record room metrics (includes pheromones automatically)
- `recordNativeCall()` - Track native API calls
- `collectProcessStats()` - Collect kernel process stats
- `finalizeTick()` - Publish all stats to Memory.stats at end of tick

### 2. Native Calls Tracker (`core/nativeCallsTracker.ts`)
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

### 3. Room Integration (`core/roomNode.ts` and `core/managers/`)
Each room records its stats at end of tick through coordinated manager modules.

**Architecture:**
- `RoomNode` - Orchestration layer for room processing
- `RoomDefenseManager` - Threat assessment and tower control
- `RoomConstructionManager` - Blueprint-based construction
- `RoomEconomyManager` - Labs, factory, power spawn, links

**Collected Metrics:**
- Controller level and progress
- Energy availability and capacity
- Storage energy
- Creep and hostile counts
- CPU usage (average and peak)
- Pheromone levels
- Danger level

### 4. Graphite Exporter (`screeps-graphite-exporter`)
Scrapes stats from Memory and exports to Grafana Cloud using the Graphite HTTP API.

**Enhanced Features:**
- Recognizes new stats categories
- Tags stats with category for filtering
- Parses room names, role names, subsystem names
- Supports time-series analysis in Grafana Cloud

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
Tick Complete → Memory.stats populated → Graphite Exporter scrapes → Grafana Cloud displays
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
import { unifiedStats } from "./core/unifiedStats";

unifiedStats.setEnabled(false); // Disable
unifiedStats.setEnabled(true);  // Enable (default)
```

### Configure via Constructor
```typescript
// In unifiedStats.ts
new UnifiedStatsManager({
  enabled: true,
  smoothingFactor: 0.1,      // Higher = more weight on recent values
  trackNativeCalls: true,     // Track native API calls
  logInterval: 100,           // Log summary every N ticks (0 = never)
  segmentUpdateInterval: 10,  // Update memory segment every N ticks
  maxHistoryPoints: 1000      // Max historical data points in segment
});
```

## Stats Access

### Memory.stats Structure (Nested Objects)
```typescript
// Access stats directly from Memory
Memory.stats = {
  tick: number,
  timestamp: number,
  cpu: { used, limit, bucket, percent, heap_mb },
  gcl: { level, progress, progress_total, progress_percent },
  gpl: { level },
  empire: { rooms, creeps, energy, credits },
  rooms: {
    [roomName]: {
      rcl, energy, controller, creeps, hostiles,
      brain: { danger, posture_code, colony_level_code },
      pheromones: { expand, harvest, build, upgrade, defense, war, siege, logistics, nukeTarget },
      metrics: { ... },
      profiler: { avg_cpu, peak_cpu, samples }
    }
  },
  roles: {
    [roleName]: { count, avg_cpu, peak_cpu, calls, samples }
  },
  subsystems: {
    [subsystemName]: { avg_cpu, peak_cpu, calls, samples }
  },
  native: { pathfinder_search, move, harvest, ... },
  processes: {
    [processId]: { name, priority, state, cpu stats, ... }
  },
  creeps: {
    [creepName]: { role, home_room, current_room, cpu, action, ... }
  }
}
```

### Programmatic Access
```typescript
import { unifiedStats } from "./core/unifiedStats";

// Get current snapshot
const snapshot = unifiedStats.getSnapshot();

// Access specific stats
const empireStats = snapshot.empire;
const roomStats = snapshot.rooms["W1N1"];
const roleStats = snapshot.roles["harvester"];
const subsystemStats = snapshot.subsystems["kernel"];
const nativeCallsStats = snapshot.native;
```

## Integration with External Tools

### Grafana Dashboards
See `GRAFANA_DASHBOARD_EXAMPLE.md` for:
- Example Flux queries for all stat types
- Recommended dashboard layouts
- Alert configurations
- Variable definitions

### Graphite Exporter
The exporter automatically:
- Scrapes **nested object structure** from Memory.stats
- Flattens and tags stats with categories
- Parses stat keys to extract metadata
- Sends to Grafana Cloud Graphite endpoint

### Custom Tools
Stats are published as **nested objects** for easy consumption:
```javascript
// Access in console
Memory.stats.empire.rooms
Memory.stats.rooms.W1N1.rcl
Memory.stats.roles.harvester.count
Memory.stats.rooms.W1N1.pheromones.harvest
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

### Metrics Data Missing
- Verify exporter is running
- Check exporter logs for errors
- Ensure Grafana Cloud is accessible
- Verify API key and endpoint configuration

### High Memory Usage
- Disable native calls tracking if not needed
- Reduce log interval
- Consider memory segment storage

## Conclusion

The unified stats system provides comprehensive visibility into bot performance and behavior. It enables data-driven optimization, early problem detection, and effective monitoring through Grafana dashboards. The system is designed to be efficient, extensible, and easy to use while maintaining backward compatibility with existing infrastructure.
