# Grafana Dashboard Example Queries

This document provides example Flux queries for creating Grafana dashboard panels using the new unified stats system.

## Empire Overview Panels

### CPU Usage Gauge
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["stat"] == "stats.empire.cpu_used" or r["stat"] == "stats.empire.cpu_limit")
  |> last()
```

### CPU Bucket Level
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["stat"] == "stats.empire.cpu_bucket")
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
```

### Total Creeps
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["stat"] == "stats.empire.total_creeps")
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
```

### Total Storage Energy
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["stat"] == "stats.empire.total_storage_energy")
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
```

### GCL Progress
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["stat"] == "stats.empire.gcl_progress")
  |> aggregateWindow(every: v.windowPeriod, fn: last, createEmpty: false)
```

## Subsystem Performance Panels

### CPU Usage by Subsystem (Stacked)
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["category"] == "stats_subsystem")
  |> filter(fn: (r) => r["stat"] =~ /stats\.subsystem\..*\.avg_cpu/)
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
  |> group(columns: ["sub_category"])
```

### Top 10 Subsystems by CPU
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["category"] == "stats_subsystem")
  |> filter(fn: (r) => r["stat"] =~ /stats\.subsystem\..*\.avg_cpu/)
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
  |> group(columns: ["sub_category"])
  |> top(n: 10, columns: ["_value"])
```

### Subsystem Call Count
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["category"] == "stats_subsystem")
  |> filter(fn: (r) => r["stat"] =~ /stats\.subsystem\..*\.calls/)
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
  |> group(columns: ["sub_category"])
```

## Role Performance Panels

### CPU Usage by Role (Top 10)
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["category"] == "stats_role")
  |> filter(fn: (r) => r["stat"] =~ /stats\.role\..*\.avg_cpu/)
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
  |> group(columns: ["sub_category"])
  |> top(n: 10, columns: ["_value"])
```

### Creep Count by Role
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["category"] == "stats_role")
  |> filter(fn: (r) => r["stat"] =~ /stats\.role\..*\.count/)
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
  |> group(columns: ["sub_category"])
```

### Role CPU Efficiency (CPU per Creep)
```flux
cpu = from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["category"] == "stats_role")
  |> filter(fn: (r) => r["stat"] =~ /stats\.role\..*\.avg_cpu/)
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)

count = from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["category"] == "stats_role")
  |> filter(fn: (r) => r["stat"] =~ /stats\.role\..*\.count/)
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)

join(tables: {cpu: cpu, count: count}, on: ["_time", "sub_category"])
  |> map(fn: (r) => ({ r with _value: r._value_cpu / r._value_count }))
```

## Room Performance Panels

### CPU Usage by Room
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["category"] == "stats_room")
  |> filter(fn: (r) => r["stat"] =~ /stats\.room\..*\.avg_cpu/)
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
  |> group(columns: ["sub_category"])
```

### Room Energy Levels
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["category"] == "stats_room")
  |> filter(fn: (r) => r["stat"] =~ /stats\.room\..*\.storage_energy/)
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
  |> group(columns: ["sub_category"])
```

### Room RCL Levels
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["category"] == "stats_room")
  |> filter(fn: (r) => r["stat"] =~ /stats\.room\..*\.rcl/)
  |> aggregateWindow(every: v.windowPeriod, fn: last, createEmpty: false)
  |> group(columns: ["sub_category"])
```

### Room Danger Levels
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["category"] == "stats_room")
  |> filter(fn: (r) => r["stat"] =~ /stats\.room\..*\.danger/)
  |> aggregateWindow(every: v.windowPeriod, fn: max, createEmpty: false)
  |> group(columns: ["sub_category"])
```

### Energy Harvested by Room
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["category"] == "stats_room")
  |> filter(fn: (r) => r["stat"] =~ /stats\.room\..*\.energy_harvested/)
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
  |> group(columns: ["sub_category"])
```

## Pheromone Panels

### Pheromone Heatmap (All Types)
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["category"] == "stats_pheromone")
  |> filter(fn: (r) => r["stat"] =~ /stats\.pheromone\..*/
    and not r["stat"] =~ /intent/)
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
  |> pivot(rowKey:["_time"], columnKey: ["sub_category"], valueColumn: "_value")
```

### Defense Pheromone Levels
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["stat"] =~ /stats\.pheromone\..*\.defense/)
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
  |> group(columns: ["sub_category"])
```

### War Pheromone Levels
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["stat"] =~ /stats\.pheromone\..*\.war/)
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
  |> group(columns: ["sub_category"])
```

### Room Intent/Posture
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["stat"] =~ /stats\.pheromone\..*\.intent/)
  |> aggregateWindow(every: v.windowPeriod, fn: last, createEmpty: false)
  |> group(columns: ["sub_category"])
```

## Native Calls Panels

### Total Native Calls
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["stat"] == "stats.native_calls.total")
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
```

### Native Calls Breakdown (Stacked)
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["category"] == "stats_native_calls")
  |> filter(fn: (r) => r["stat"] != "stats.native_calls.total")
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
  |> group(columns: ["stat"])
```

### PathFinder Calls
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["stat"] == "stats.native_calls.pathfinder_search")
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
```

### Movement Calls (moveTo + move)
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["stat"] == "stats.native_calls.move_to" or r["stat"] == "stats.native_calls.move")
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
  |> group(columns: ["stat"])
```

### Work Actions (harvest, build, repair, upgrade)
```flux
from(bucket: "screeps")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => 
    r["stat"] == "stats.native_calls.harvest" or
    r["stat"] == "stats.native_calls.build" or
    r["stat"] == "stats.native_calls.repair" or
    r["stat"] == "stats.native_calls.upgrade_controller")
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
  |> group(columns: ["stat"])
```

## Dashboard Layout Recommendations

### Row 1: Empire Overview
- CPU Usage Gauge (current/limit)
- CPU Bucket Timeline
- Total Creeps
- Total Storage Energy
- GCL Progress Bar

### Row 2: Subsystem Performance
- CPU Usage by Subsystem (Stacked Area Chart)
- Top 10 Subsystems Table
- Subsystem Call Count (Bar Chart)

### Row 3: Role Performance
- CPU Usage by Role (Top 10 Bar Chart)
- Creep Count by Role (Stacked Area Chart)
- Role CPU Efficiency Table

### Row 4: Room Performance
- CPU Usage by Room (Stacked Area Chart)
- Room Energy Levels (Multi-line Chart)
- Room Danger Levels (Heatmap)

### Row 5: Pheromones
- Pheromone Heatmap (All Types)
- Defense Pheromone Levels (Timeline)
- War Pheromone Levels (Timeline)
- Room Intent/Posture (State Timeline)

### Row 6: Native Calls
- Total Native Calls (Timeline)
- Native Calls Breakdown (Stacked Bar Chart)
- PathFinder Calls (Timeline)
- Movement Calls (Stacked Area Chart)

## Variable Configuration

Add these variables to your dashboard for better filtering:

### Room Variable
```flux
from(bucket: "screeps")
  |> range(start: -1h)
  |> filter(fn: (r) => r["category"] == "stats_room")
  |> keep(columns: ["sub_category"])
  |> distinct(column: "sub_category")
```

### Role Variable
```flux
from(bucket: "screeps")
  |> range(start: -1h)
  |> filter(fn: (r) => r["category"] == "stats_role")
  |> keep(columns: ["sub_category"])
  |> distinct(column: "sub_category")
```

### Subsystem Variable
```flux
from(bucket: "screeps")
  |> range(start: -1h)
  |> filter(fn: (r) => r["category"] == "stats_subsystem")
  |> keep(columns: ["sub_category"])
  |> distinct(column: "sub_category")
```

## Alert Examples

### High CPU Usage Alert
Trigger when CPU usage > 90% of limit:
```flux
from(bucket: "screeps")
  |> range(start: -5m)
  |> filter(fn: (r) => r["stat"] == "stats.empire.cpu_used")
  |> mean()
  |> map(fn: (r) => ({ r with _value: r._value / 20.0 }))  // Assuming 20 CPU limit
```

### Low CPU Bucket Alert
Trigger when bucket < 2000:
```flux
from(bucket: "screeps")
  |> range(start: -5m)
  |> filter(fn: (r) => r["stat"] == "stats.empire.cpu_bucket")
  |> min()
```

### Room Under Attack Alert
Trigger when danger > 1:
```flux
from(bucket: "screeps")
  |> range(start: -1m)
  |> filter(fn: (r) => r["stat"] =~ /stats\.room\..*\.danger/)
  |> max()
```

### PathFinder Overuse Alert
Trigger when PathFinder calls > 100/tick:
```flux
from(bucket: "screeps")
  |> range(start: -5m)
  |> filter(fn: (r) => r["stat"] == "stats.native_calls.pathfinder_search")
  |> mean()
```
