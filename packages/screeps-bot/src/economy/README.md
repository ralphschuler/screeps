# Economy Subsystem

## Overview

The economy subsystem manages resource flows, energy prediction, terminal operations, and market trading. It optimizes resource distribution, predicts energy availability for spawn planning, and implements opportunistic actions to improve overall efficiency.

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│          Energy Flow Predictor                          │
│  - Income calculation (harvesters, miners, links)       │
│  - Consumption tracking (upgraders, builders, towers)   │
│  - Multi-tick energy forecasting                        │
│  - Spawn planning support                               │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴────────┬──────────────┬──────────────┐
    │                 │              │              │
┌───▼────────┐  ┌────▼─────────┐  ┌─▼────────┐  ┌─▼──────────┐
│Opportunistic│  │   Target    │  │   Room   │  │  Terminal  │
│  Actions   │  │ Assignment  │  │   Path   │  │ Operations │
│  Pickup    │  │  Manager    │  │ Manager  │  │   Market   │
│ Transfer   │  │ Deduplication│  │  Roads   │  │  Trading   │
└────────────┘  └──────────────┘  └──────────┘  └────────────┘
```

### Core Components

#### 1. **Energy Flow Predictor** (`energyFlowPredictor.ts`)
Predicts future energy availability based on income and consumption analysis.

**Key Features:**
- Income calculation from harvesters, miners, and links
- Consumption tracking for upgraders, builders, towers, spawning, and repairs
- Multi-tick lookahead (up to 100 ticks)
- Safety margin (90% of predicted income for conservatism)
- Console commands for debugging

**Use Cases:**
- Spawn planning: Determine if enough energy will be available
- Body sizing: Choose optimal body size based on predicted energy
- Spawn timing: Schedule spawns when energy will be sufficient
- Economic monitoring: Track room energy trends

**Accuracy Targets:**
- ±10% for predictions up to 50 ticks
- ±20% for predictions up to 100 ticks

#### 2. **Opportunistic Actions** (`opportunisticActions.ts`)
Improves creep efficiency by performing additional actions while executing primary tasks.

**Key Features:**
- Resource pickup while moving (dropped energy, resources)
- Emergency transfers (spawn < 300 energy, tower < 500 energy)
- Repair while passing (if WORK parts available)
- Minimal CPU overhead (~0.01-0.02 CPU per creep)

**Opportunistic Behaviors:**
- **Pickup**: Collect dropped resources along path
- **Transfer**: Fill spawn/tower if critical and passing by
- **Repair**: Fix damaged structures in passing
- **Build**: Contribute to construction sites nearby

#### 3. **Target Assignment Manager** (`targetAssignmentManager.ts`)
Prevents multiple creeps from targeting the same resource or structure.

**Key Features:**
- Target deduplication (prevent 5 haulers from same container)
- Assignment tracking (which creep assigned to which target)
- Automatic cleanup (remove assignments for dead creeps)
- Priority-based assignment (higher priority creeps get first choice)

**Benefits:**
- Reduces wasted CPU (creeps don't all pathfind to same target)
- Improves resource distribution (creeps spread across sources)
- Prevents congestion (multiple creeps at same location)

#### 4. **Room Path Manager** (`roomPathManager.ts`)
Manages road construction and pathfinding optimization.

**Key Features:**
- Automatic road planning (source → spawn, source → controller)
- Path usage tracking (most-used paths get roads first)
- Construction prioritization (build critical roads first)
- Road maintenance (repair heavily-used roads)

**Path Types:**
- **Source Paths**: Source → Spawn/Storage (highest priority)
- **Controller Paths**: Spawn/Storage → Controller (medium priority)
- **Remote Paths**: Room exits → Remote sources (low priority)

#### 5. **Economy Commands** (`economyCommands.ts`)
Console commands for economy monitoring and debugging.

**Commands:**
- `economy.energy.predict(roomName, ticks)`: Predict energy in N ticks
- `economy.energy.income(roomName)`: Show income breakdown
- `economy.energy.consumption(roomName)`: Show consumption breakdown

## Key Concepts

### 1. Energy Flow Prediction

Energy flow = Income - Consumption

**Income Sources:**
- **Harvesters**: 5 WORK × 2 energy/tick = 10 energy/tick per source
- **Miners**: Static miners at containers
- **Links**: Energy transferred via links

**Consumption Sinks:**
- **Upgraders**: N × WORK parts × 1 energy/tick
- **Builders**: Construction and repair costs
- **Towers**: Attack, heal, and repair costs (10 energy per action)
- **Spawning**: Body cost / spawn time (averaged over ticks)
- **Repairs**: Wall/rampart maintenance

**Prediction Formula:**
```
predicted = current + (netFlow × ticks × safetyMargin)
netFlow = totalIncome - totalConsumption
```

### 2. Opportunistic Actions

Actions performed alongside primary tasks:

**Priority Levels:**
1. **Critical**: Spawn < 300 energy (transfer immediately)
2. **High**: Tower < 500 energy (transfer if passing by)
3. **Medium**: Pickup dropped resources (if on path)
4. **Low**: Repair structures (if WORK parts and < 5 CPU)

**Rules:**
- Only apply during movement (not while executing primary action)
- Maximum 1 opportunistic action per tick
- CPU budget: max 0.02 CPU per creep
- Don't interrupt primary task completion

### 3. Target Assignment

Prevents resource conflicts:

**Assignment Flow:**
```
1. Creep requests target (e.g., container with energy)
2. Check if target already assigned to other creep
3. If assigned and other creep active: find different target
4. If assigned but other creep dead: steal assignment
5. If not assigned: claim assignment
6. Store assignment in manager (targetId → creepId)
```

**Cleanup:**
- Remove assignments for dead creeps (every tick)
- Timeout assignments after 50 ticks (stale assignments)
- Clear assignments when creep completes task

### 4. Path Management

Roads reduce movement costs:

**Movement Costs:**
- Plains: 2 fatigue (1 with roads)
- Swamp: 10 fatigue (5 with roads)
- Roads: 50% reduction

**Road Priority:**
- Paths used > 100 times per 1000 ticks
- Paths with heavy traffic (10+ creeps)
- Paths to critical structures (spawn, storage, controller)

**Construction Strategy:**
1. Track path usage (PathFinder creates paths)
2. Identify high-traffic routes (> 100 uses)
3. Queue road construction sites
4. Build roads when excess builders available

## API Reference

### Energy Flow Predictor API

```typescript
import { energyFlowPredictor } from './economy/energyFlowPredictor';

// Predict energy in 50 ticks
const prediction = energyFlowPredictor.predictEnergyInTicks(room, 50);

console.log(`Current: ${prediction.current}`);
console.log(`Predicted: ${Math.round(prediction.predicted)}`);
console.log(`Net Flow: ${prediction.netFlow.toFixed(2)} energy/tick`);

// Get income breakdown
const income = energyFlowPredictor.calculateEnergyIncome(room);
console.log(`Total Income: ${income.total.toFixed(2)} energy/tick`);

// Get consumption breakdown
const consumption = energyFlowPredictor.calculateEnergyConsumption(room);
console.log(`Total Consumption: ${consumption.total.toFixed(2)} energy/tick`);
```

### Opportunistic Actions API

```typescript
import { applyOpportunisticActions } from './economy/opportunisticActions';

// Apply opportunistic actions to creep action
const primaryAction: CreepAction = {
  type: "transfer",
  target: storage,
  resourceType: RESOURCE_ENERGY
};

const optimizedAction = applyOpportunisticActions(creep, primaryAction);

// optimizedAction might be:
// - Pickup dropped resource along path
// - Transfer to spawn if critical
// - Original action if no opportunities
```

### Target Assignment API

```typescript
import { targetAssignmentManager } from './economy/targetAssignmentManager';

// Request target assignment
const container = /* find container */;
const assigned = targetAssignmentManager.assignTarget(creep.id, container.id);

if (assigned) {
  // Target assigned to this creep
  creep.memory.targetId = container.id;
} else {
  // Target already assigned to another creep, find different one
  const alternativeContainer = /* find different container */;
}

// Release assignment when done
targetAssignmentManager.releaseTarget(creep.id);

// Check if target is available
const available = targetAssignmentManager.isTargetAvailable(container.id);
```

### Room Path Manager API

```typescript
import { roomPathManager } from './economy/roomPathManager';

// Track path usage
const path = room.findPath(start, end);
roomPathManager.trackPathUsage(room.name, path);

// Get high-traffic paths
const highTraffic = roomPathManager.getHighTrafficPaths(room.name);

// Queue road construction
for (const pathData of highTraffic) {
  roomPathManager.queueRoadConstruction(room.name, pathData.path);
}

// Build roads (returns number of construction sites created)
const sitesCreated = roomPathManager.buildRoads(room);
console.log(`Created ${sitesCreated} road construction sites`);
```

## Performance Characteristics

### CPU Costs

| Operation | CPU Cost | Notes |
|-----------|----------|-------|
| Energy prediction | ~0.05-0.1 CPU | Per room |
| Income calculation | ~0.02 CPU | Per room |
| Consumption calculation | ~0.03 CPU | Per room |
| Opportunistic actions | ~0.01-0.02 CPU | Per creep |
| Target assignment | ~0.005 CPU | Per creep |
| Path tracking | ~0.01 CPU | Per path |

### Memory Usage

- **Energy prediction**: ~100B per room (cached results)
- **Target assignments**: ~50B per assignment (50-100 assignments = 2.5-5KB)
- **Path tracking**: ~100B per path (20-30 paths = 2-3KB)
- **Total per room**: ~5-8KB

### Cache Behavior

- Energy predictions: Cached for 10 ticks (reduce recalculation)
- Target assignments: Stored in heap (lost on reset, rebuilds quickly)
- Path usage: Stored in Memory (persistent across resets)

## Configuration

### Environment Variables

None. Configuration is done programmatically.

### Memory Schema

```typescript
interface RoomEconomyMemory {
  pathUsage?: Record<string, number>;  // Path hash → usage count
  roadQueue?: string[];                // Paths queued for roads
}
```

### Tunable Parameters

**Energy Flow Predictor:**
```typescript
const DEFAULT_CONFIG = {
  maxPredictionTicks: 100,   // Max ticks to predict
  safetyMargin: 0.9,         // 90% of predicted income
  enableLogging: false       // Detailed logging
};
```

**Opportunistic Actions:**
```typescript
const CRITICAL_SPAWN_ENERGY = 300;   // Transfer to spawn if < 300
const CRITICAL_TOWER_ENERGY = 500;   // Transfer to tower if < 500
const MAX_OPPORTUNISTIC_CPU = 0.02;  // Max CPU per creep
```

**Target Assignment:**
```typescript
const ASSIGNMENT_TIMEOUT = 50;  // Timeout stale assignments
```

## Examples

### Example 1: Using Energy Prediction for Spawn Planning

```typescript
import { energyFlowPredictor } from './economy/energyFlowPredictor';

// Check if we can afford to spawn a 1200 energy creep in 30 ticks
function canAffordSpawn(room: Room, bodyCost: number, ticks: number): boolean {
  const prediction = energyFlowPredictor.predictEnergyInTicks(room, ticks);
  
  // Add safety margin: need 20% more than body cost
  const required = bodyCost * 1.2;
  
  if (prediction.predicted >= required) {
    console.log(`Can afford ${bodyCost} energy creep in ${ticks} ticks`);
    console.log(`Predicted: ${Math.round(prediction.predicted)}, Required: ${required}`);
    return true;
  } else {
    console.log(`Cannot afford ${bodyCost} energy creep yet`);
    console.log(`Predicted: ${Math.round(prediction.predicted)}, Need: ${required - prediction.predicted} more`);
    return false;
  }
}

// Use for spawn queue
const bodyCost = 1200;
if (canAffordSpawn(room, bodyCost, 30)) {
  // Add to spawn queue
  spawnQueue.add({ body, cost: bodyCost, priority: 100 });
}
```

### Example 2: Opportunistic Resource Pickup

```typescript
// Opportunistic actions are applied automatically by executor
// But you can manually check for opportunities:

import { applyOpportunisticActions } from './economy/opportunisticActions';

function runHauler(creep: Creep) {
  // Primary action: Move to storage
  const storage = creep.room.storage;
  if (!storage) return;
  
  const primaryAction: CreepAction = {
    type: "transfer",
    target: storage,
    resourceType: RESOURCE_ENERGY
  };
  
  // Apply opportunistic actions
  const action = applyOpportunisticActions(creep, primaryAction);
  
  // action might be changed to pickup dropped resources
  if (action.type === "pickup") {
    console.log(`${creep.name} picking up dropped resource opportunistically`);
  }
  
  executeAction(creep, action, ctx);
}
```

### Example 3: Target Assignment to Prevent Conflicts

```typescript
import { targetAssignmentManager } from './economy/targetAssignmentManager';

function findContainerForHauler(creep: Creep): StructureContainer | null {
  // Find containers with energy
  const containers = creep.room.find(FIND_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
  }) as StructureContainer[];
  
  // Try to assign each container
  for (const container of containers) {
    const assigned = targetAssignmentManager.assignTarget(creep.id, container.id);
    
    if (assigned) {
      // Successfully assigned
      creep.memory.targetId = container.id;
      console.log(`${creep.name} assigned to container ${container.id}`);
      return container;
    }
  }
  
  // No available containers
  console.log(`${creep.name} found no available containers`);
  return null;
}

// Release assignment when done
function onHaulerComplete(creep: Creep) {
  if (creep.memory.targetId) {
    targetAssignmentManager.releaseTarget(creep.id);
    delete creep.memory.targetId;
  }
}
```

### Example 4: Tracking and Building High-Traffic Roads

```typescript
import { roomPathManager } from './economy/roomPathManager';

// Track path usage every time a creep pathfinds
function trackCreepPath(creep: Creep, target: RoomPosition) {
  const path = creep.room.findPath(creep.pos, target);
  roomPathManager.trackPathUsage(creep.room.name, path);
}

// Build roads on high-traffic paths (run every 100 ticks)
function buildHighTrafficRoads(room: Room) {
  if (Game.time % 100 !== 0) return;
  
  const highTraffic = roomPathManager.getHighTrafficPaths(room.name);
  
  console.log(`${room.name}: ${highTraffic.length} high-traffic paths`);
  
  for (const pathData of highTraffic) {
    console.log(`  Path used ${pathData.uses} times`);
    roomPathManager.queueRoadConstruction(room.name, pathData.path);
  }
  
  // Build roads
  const built = roomPathManager.buildRoads(room);
  console.log(`Built ${built} road construction sites`);
}
```

### Example 5: Monitoring Economy with Console Commands

```typescript
// In console:

// Predict energy in 50 ticks
economy.energy.predict('W1N1', 50)
// Output:
// === Energy Prediction: W1N1 ===
// Current Energy: 5000
// Predicted (50 ticks): 7500
// Net Flow: 50.00 energy/tick
// ...

// Show income breakdown
economy.energy.income('W1N1')
// Output:
// === Energy Income: W1N1 ===
// Harvesters: 20.00 energy/tick
// Static Miners: 0.00 energy/tick
// Links: 0.00 energy/tick
// Total: 20.00 energy/tick

// Show consumption breakdown
economy.energy.consumption('W1N1')
// Output:
// === Energy Consumption: W1N1 ===
// Upgraders: 10.00 energy/tick
// Builders: 5.00 energy/tick
// Towers: 2.00 energy/tick
// Spawning: 3.00 energy/tick
// Repairs: 0.50 energy/tick
// Total: 20.50 energy/tick
```

## Testing

### Test Coverage

- **Energy Flow Predictor**: Unit tests for income/consumption calculation, prediction accuracy
- **Opportunistic Actions**: Unit tests for pickup, transfer, repair logic
- **Target Assignment**: Unit tests for assignment, release, conflict resolution
- **Room Path Manager**: Unit tests for path tracking, road prioritization

### Running Tests

```bash
# Run all economy tests
npm run test:unit -- --grep "economy|energy|opportunistic|target"

# Run specific test suite
npm run test:unit -- packages/screeps-bot/test/unit/energyFlowPredictor.test.ts
```

## Troubleshooting

### Issue: Energy prediction inaccurate

**Symptoms**: Predicted energy doesn't match actual energy

**Causes:**
1. Creep counts changing (spawns/deaths not accounted for)
2. Income calculation wrong (harvester efficiency)
3. Consumption calculation wrong (builder activity spikes)
4. Safety margin too aggressive

**Solutions:**
1. Update prediction when creeps spawn/die
2. Account for harvester travel time: use 80% efficiency
3. Sample consumption over longer period (100 ticks vs 10)
4. Adjust safety margin: 0.9 → 0.8 (more conservative)

### Issue: Opportunistic actions interfering

**Symptoms**: Creeps doing unexpected actions, primary task delayed

**Causes:**
1. Opportunistic actions too aggressive
2. CPU budget exceeded
3. Priority wrong (opportunistic > primary)

**Solutions:**
1. Reduce opportunistic frequency: only during movement
2. Lower CPU budget: 0.02 → 0.01 per creep
3. Ensure opportunistic actions don't override primary action

### Issue: Multiple creeps targeting same resource

**Symptoms**: 5 haulers all go to same container

**Causes:**
1. Target assignment not enabled
2. Assignment not checked before targeting
3. Assignments not cleaned up

**Solutions:**
1. Enable target assignment manager
2. Check assignment before selecting target
3. Clean up assignments every tick: `targetAssignmentManager.cleanup()`

### Issue: Roads not being built

**Symptoms**: High-traffic paths have no roads

**Causes:**
1. Path usage not tracked
2. Usage threshold too high
3. Construction queue full
4. No builders available

**Solutions:**
1. Call `trackPathUsage()` every time creep pathfinds
2. Lower threshold: 100 uses → 50 uses
3. Limit road construction sites: max 5 at a time
4. Spawn more builders when construction sites > 0

### Issue: Economy commands not working

**Symptoms**: Console commands not found or error

**Causes:**
1. Commands not registered
2. Room not visible
3. Room not owned

**Solutions:**
1. Register commands: `commandRegistry.registerDecoratedCommands(new EconomyCommands())`
2. Ensure room is visible: `Game.rooms[roomName]`
3. Ensure room is owned: `room.controller.my === true`

## Related Documentation

- [ROADMAP.md](../../../../ROADMAP.md) - Section 8: Energie & Ressourcen
- [Spawning Subsystem](../spawning/README.md) - Spawn planning with energy prediction
- [Roles Subsystem](../roles/README.md) - Opportunistic actions in role execution
- [Clusters Subsystem](../clusters/README.md) - Inter-room resource distribution
- [Memory Subsystem](../memory/README.md) - Economy memory schema
