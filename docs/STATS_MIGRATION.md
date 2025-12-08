# Stats System Migration Guide

## Overview

The unified statistics system consolidates all bot metrics into a single, well-organized structure under `Memory.stats`. This replaces the previous fragmented approach where stats were scattered across different memory locations.

## Stats Structure

All statistics are now published to flattened keys in Memory for easy consumption by the Influx exporter:

### Empire Statistics
- `stats.empire.owned_rooms` - Number of owned rooms
- `stats.empire.total_creeps` - Total number of creeps
- `stats.empire.total_storage_energy` - Total energy in storage across all rooms
- `stats.empire.gcl_progress` - GCL progress
- `stats.empire.gcl` - GCL level
- `stats.empire.gpl` - GPL level
- `stats.empire.cpu_used` - CPU used this tick
- `stats.empire.cpu_limit` - CPU limit
- `stats.empire.cpu_bucket` - CPU bucket level
- `stats.empire.heap_used` - Heap memory used (MB)
- `stats.empire.credits` - Market credits

### Room Statistics
- `stats.room.{ROOM_NAME}.rcl` - Controller level
- `stats.room.{ROOM_NAME}.energy_available` - Energy available
- `stats.room.{ROOM_NAME}.energy_capacity` - Energy capacity
- `stats.room.{ROOM_NAME}.storage_energy` - Storage energy
- `stats.room.{ROOM_NAME}.creep_count` - Number of creeps in room
- `stats.room.{ROOM_NAME}.hostile_count` - Number of hostiles in room
- `stats.room.{ROOM_NAME}.avg_cpu` - Average CPU used by room
- `stats.room.{ROOM_NAME}.peak_cpu` - Peak CPU used by room
- `stats.room.{ROOM_NAME}.controller_progress` - Controller progress
- `stats.room.{ROOM_NAME}.energy_harvested` - Energy harvested (rolling average)
- `stats.room.{ROOM_NAME}.damage_received` - Damage received (rolling average)
- `stats.room.{ROOM_NAME}.danger` - Danger level (0-3)

### Subsystem Statistics
- `stats.subsystem.{NAME}.avg_cpu` - Average CPU used by subsystem
- `stats.subsystem.{NAME}.peak_cpu` - Peak CPU used by subsystem
- `stats.subsystem.{NAME}.calls` - Number of calls this tick
- `stats.subsystem.{NAME}.samples` - Number of samples

Common subsystems:
- `rooms` - Room processing
- `kernel` - Kernel/process management
- `spawns` - Spawn management
- `creeps` - Creep execution
- `moveRequests` - Traffic management
- `powerCreeps` - Power creep execution
- `visualizations` - Visualization rendering
- `stats` - Stats collection itself

### Role Statistics
- `stats.role.{ROLE}.count` - Number of creeps with this role
- `stats.role.{ROLE}.avg_cpu` - Average CPU per creep
- `stats.role.{ROLE}.peak_cpu` - Peak CPU for any creep of this role
- `stats.role.{ROLE}.calls` - Number of creeps processed this tick

Common roles:
- `harvester` - Static harvesters
- `hauler` - Energy carriers
- `upgrader` - Controller upgraders
- `builder` - Construction workers
- `guard` - Defenders
- `scout` - Scouts
- `claimer` - Room claimers
- And many more...

### Pheromone Statistics
- `stats.pheromone.{ROOM_NAME}.expand` - Expansion pheromone level
- `stats.pheromone.{ROOM_NAME}.harvest` - Harvest pheromone level
- `stats.pheromone.{ROOM_NAME}.build` - Build pheromone level
- `stats.pheromone.{ROOM_NAME}.upgrade` - Upgrade pheromone level
- `stats.pheromone.{ROOM_NAME}.defense` - Defense pheromone level
- `stats.pheromone.{ROOM_NAME}.war` - War pheromone level
- `stats.pheromone.{ROOM_NAME}.siege` - Siege pheromone level
- `stats.pheromone.{ROOM_NAME}.logistics` - Logistics pheromone level
- `stats.pheromone.{ROOM_NAME}.intent` - Intent/posture (0=eco, 1=expand, 2=defense, 3=war, 4=siege)

### Native Calls Statistics
- `stats.native_calls.pathfinder_search` - PathFinder.search calls
- `stats.native_calls.move_to` - Creep.moveTo calls
- `stats.native_calls.move` - Creep.move calls
- `stats.native_calls.harvest` - Creep.harvest calls
- `stats.native_calls.transfer` - Creep.transfer calls
- `stats.native_calls.withdraw` - Creep.withdraw calls
- `stats.native_calls.build` - Creep.build calls
- `stats.native_calls.repair` - Creep.repair calls
- `stats.native_calls.upgrade_controller` - Creep.upgradeController calls
- `stats.native_calls.attack` - Creep.attack calls
- `stats.native_calls.ranged_attack` - Creep.rangedAttack calls
- `stats.native_calls.heal` - Creep.heal calls
- `stats.native_calls.dismantle` - Creep.dismantle calls
- `stats.native_calls.say` - Creep.say calls
- `stats.native_calls.total` - Total native calls

## Legacy Stats (Deprecated)

The following stats are now deprecated and replaced by the unified system:

### Replaced by `stats.subsystem.*`
- `profiler.subsystem.{NAME}.avg_cpu` → `stats.subsystem.{NAME}.avg_cpu`
- `profiler.subsystem.{NAME}.peak_cpu` → `stats.subsystem.{NAME}.peak_cpu`

### Replaced by `stats.role.*`
- `profiler.role.{ROLE}.avg_cpu` → `stats.role.{ROLE}.avg_cpu`
- `profiler.role.{ROLE}.peak_cpu` → `stats.role.{ROLE}.peak_cpu`
- `profiler.role.{ROLE}.calls` → `stats.role.{ROLE}.calls`

### Replaced by `stats.room.*`
- `profiler.room.{ROOM_NAME}.avg_cpu` → `stats.room.{ROOM_NAME}.avg_cpu`
- `profiler.room.{ROOM_NAME}.peak_cpu` → `stats.room.{ROOM_NAME}.peak_cpu`

## Grafana Dashboard Migration

### Query Pattern Changes

**Old Flux Query Pattern (Profiler):**
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["stat"] == "profiler.subsystem.rooms.avg_cpu")
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
```

**New Flux Query Pattern (Stats):**
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["stat"] == "stats.subsystem.rooms.avg_cpu")
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
```

### Recommended Dashboard Panels

#### Empire Overview Panel
Metrics:
- CPU Used: `stats.empire.cpu_used`
- CPU Limit: `stats.empire.cpu_limit`
- CPU Bucket: `stats.empire.cpu_bucket`
- Total Creeps: `stats.empire.total_creeps`
- Owned Rooms: `stats.empire.owned_rooms`
- Total Storage Energy: `stats.empire.total_storage_energy`
- GCL Progress: `stats.empire.gcl_progress`

#### Subsystem CPU Panel
Shows CPU usage by subsystem:
- Filter: `r["stat"] =~ /stats\.subsystem\..*\.avg_cpu/`
- Group by: `sub_category` tag

#### Role CPU Panel
Shows CPU usage by creep role:
- Filter: `r["stat"] =~ /stats\.role\..*\.avg_cpu/`
- Group by: `sub_category` tag

#### Room Performance Panel
Shows room-specific metrics:
- Filter: `r["stat"] =~ /stats\.room\..*\.avg_cpu/`
- Group by: `sub_category` tag (room name)

#### Pheromone Heatmap Panel
Shows pheromone levels across rooms:
- Filter: `r["stat"] =~ /stats\.pheromone\..*\.(expand|harvest|defense|war)/`
- Visualization: Heatmap or time series

#### Native Calls Panel
Shows native API call frequency:
- Filter: `r["stat"] =~ /stats\.native_calls\..*/`
- Metrics: All native call types
- Visualization: Stacked bar or time series

### Category Tags

The Influx exporter now tags stats with categories for easier filtering:

- `category=stats_empire` - Empire-wide stats
- `category=stats_room` - Per-room stats
- `category=stats_subsystem` - Per-subsystem stats
- `category=stats_role` - Per-role stats
- `category=stats_pheromone` - Pheromone stats
- `category=stats_native_calls` - Native calls stats

## Helper Functions

The stats system includes helper functions accessible via the stats manager:

```typescript
import { statsManager, getOwnedRoomNames, getTotalCreepCount } from "./core/stats";

// Get current stats
const stats = statsManager.getStats();

// Get owned room names
const rooms = getOwnedRoomNames();

// Get total creep count
const totalCreeps = getTotalCreepCount();

// Get creep count by role
const harvesterCount = getCreepCountByRole("harvester");

// Get room with highest energy
const richestRoom = getRoomByMetric("energy", "highest");
```

## Configuration

Stats collection can be configured:

```typescript
import { statsManager } from "./core/stats";

// Disable stats collection
statsManager.setEnabled(false);

// Enable stats collection
statsManager.setEnabled(true);

// Reset all stats
statsManager.reset();
```

Native calls tracking can also be configured:

```typescript
import { setNativeCallsTracking } from "./core/nativeCallsTracker";

// Disable native calls tracking
setNativeCallsTracking(false);
```

## Performance Considerations

- Stats are collected with exponential moving averages (smoothing factor: 0.1)
- Native calls tracking adds minimal overhead (~0.01 CPU per call wrapper)
- Stats are published once per tick in a flattened format for efficient scraping
- Room and pheromone stats are only updated every 5 ticks to reduce CPU usage
- Stats summary is logged every 100 ticks by default

## Backward Compatibility

The old profiler stats are still collected alongside the new unified stats to ensure backward compatibility during migration. Both old and new stats are published to Memory.

To fully migrate:
1. Update Grafana dashboards to use new `stats.*` keys
2. Verify all panels are working correctly
3. (Optional) Disable legacy profiler stat publishing if desired
