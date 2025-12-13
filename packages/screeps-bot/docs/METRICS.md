# Role-Specific Efficiency Metrics

## Overview

The efficiency metrics system automatically tracks performance indicators for each creep to enable analysis and optimization. Metrics are collected during normal creep operations with minimal CPU overhead.

## Tracked Metrics

Each creep can track the following performance indicators:

- **tasksCompleted**: Number of completed tasks (construction finished, deliveries made, etc.)
- **energyHarvested**: Total energy gathered from sources
- **energyTransferred**: Total resources delivered to structures or other creeps
- **buildProgress**: Total construction work contributed (build power units)
- **repairProgress**: Total repair work done (repair power units)
- **damageDealt**: Combat damage dealt to enemies
- **healingDone**: Healing provided to friendly creeps

## Automatic Tracking

Metrics are automatically tracked when creeps successfully perform actions through the behavior system. No manual instrumentation is required.

### What Gets Tracked

- **Harvest actions**: Records energy/mineral harvested based on WORK parts
- **Transfer actions**: Records actual amount transferred (resource-type specific)
- **Build actions**: Records build power contributed (5 per WORK part)
- **Repair actions**: Records repair power contributed (100 per WORK part)
- **Attack actions**: Records damage dealt based on ATTACK/RANGED_ATTACK parts
- **Heal actions**: Records healing done based on HEAL parts
- **Upgrade actions**: Records controller progress (tracked in buildProgress)

## Accessing Metrics

### Individual Creep Metrics

```javascript
// Get metrics for a specific creep
const creep = Game.creeps['Harvester1'];
const metrics = creep.memory._metrics;

if (metrics) {
  console.log(`Energy harvested: ${metrics.energyHarvested}`);
  console.log(`Energy transferred: ${metrics.energyTransferred}`);
  console.log(`Tasks completed: ${metrics.tasksCompleted}`);
}

// Get a human-readable summary
import { getEfficiencySummary } from 'utils/creepMetrics';
const summary = getEfficiencySummary(creep.memory);
console.log(summary); // "5 tasks, 1000 harvested, 900 transferred"
```

### Aggregated Role Metrics

Metrics are automatically aggregated by role in the stats system:

```javascript
// Access aggregated metrics for a role
const harvesterStats = Memory.stats.roles['harvester'];

if (harvesterStats.metrics) {
  console.log(`Total energy harvested: ${harvesterStats.metrics.totalEnergyHarvested}`);
  console.log(`Total energy transferred: ${harvesterStats.metrics.totalEnergyTransferred}`);
  console.log(`Average energy per creep: ${harvesterStats.metrics.avgEnergyPerCreep}`);
  console.log(`Total tasks completed: ${harvesterStats.metrics.totalTasksCompleted}`);
}
```

### Per-Creep Stats

Individual creep stats in the stats system also include metrics:

```javascript
// Get detailed stats for a specific creep
const creepStats = Memory.stats.creeps['Harvester1'];

if (creepStats.metrics) {
  console.log(creepStats.metrics);
  // {
  //   tasksCompleted: 5,
  //   energyHarvested: 1000,
  //   energyTransferred: 950,
  //   buildProgress: 500,
  //   repairProgress: 0,
  //   damageDealt: 0,
  //   healingDone: 0
  // }
}
```

## Programmatic Usage

### Initialize Metrics

Metrics are automatically initialized when a creep first performs an action. You can also manually initialize:

```javascript
import { initializeMetrics } from 'utils/creepMetrics';

// Initialize metrics for a creep (idempotent - won't overwrite existing)
initializeMetrics(creep.memory);
```

### Manual Metric Recording

While metrics are automatically tracked, you can also manually record:

```javascript
import {
  recordHarvest,
  recordTransfer,
  recordBuild,
  recordRepair,
  recordDamage,
  recordHealing,
  recordTaskComplete
} from 'utils/creepMetrics';

// Record specific metrics
recordHarvest(creep.memory, 10); // Record 10 energy harvested
recordTransfer(creep.memory, 50); // Record 50 energy transferred
recordTaskComplete(creep.memory); // Increment task counter
```

### Reset Metrics

```javascript
import { resetMetrics } from 'utils/creepMetrics';

// Reset all metrics to zero
resetMetrics(creep.memory);
```

## Grafana Integration

Metrics are exported to Grafana through the existing stats system:

1. Individual creep metrics: `Memory.stats.creeps[creepName].metrics`
2. Aggregated role metrics: `Memory.stats.roles[roleName].metrics`

These can be visualized in Grafana dashboards to track:
- Energy throughput per role
- Build/repair efficiency
- Combat effectiveness
- Task completion rates
- Performance trends over time

## Performance Considerations

- **CPU Impact**: Minimal - metrics only tracked on successful actions
- **Memory Impact**: ~56 bytes per creep (7 numbers × 8 bytes)
- **Lazy Initialization**: Metrics field only created when needed
- **Estimation**: Uses body part counts for accurate, CPU-efficient tracking

## Example Dashboard Queries

### Energy Efficiency by Role

```
Total Energy Harvested: sum(Memory.stats.roles[*].metrics.totalEnergyHarvested)
Total Energy Transferred: sum(Memory.stats.roles[*].metrics.totalEnergyTransferred)
Transfer Efficiency: transferred / harvested * 100%
```

### Role Productivity

```
Tasks per Creep: Memory.stats.roles[role].metrics.avgTasksPerCreep
Energy per Creep: Memory.stats.roles[role].metrics.avgEnergyPerCreep
```

### Combat Effectiveness

```
Total Damage Dealt: sum(Memory.stats.roles['soldier'].metrics.totalDamageDealt)
Total Healing Done: sum(Memory.stats.roles['healer'].metrics.totalHealingDone)
```

## Future Enhancements

The following enhancements could be considered:

1. **Separate Upgrade Metric**: Currently upgrade progress reuses `buildProgress`
2. **Per-Tick Rates**: Track actions per tick for rate analysis
3. **Resource-Specific Tracking**: Track different resource types separately
4. **Efficiency Ratios**: CPU per action, energy per distance, etc.
5. **Historical Trends**: Track metric changes over time

## Related Files

- `src/utils/creepMetrics.ts` - Metric utility functions
- `src/core/stats.ts` - Stats system with metric aggregation
- `src/main.ts` - CreepMemory interface definition
- `src/memory/schemas.ts` - SwarmCreepMemory interface definition
- `src/roles/behaviors/executor.ts` - Automatic metric tracking
- `test/unit/creepMetrics.test.ts` - Unit tests
