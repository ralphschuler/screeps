# Pheromone System Guide

## Overview

The pheromone system is the core coordination mechanism of the SwarmBot. It enables emergent behavior through stigmergic communication - rooms and creeps coordinate by reading and updating simple numerical "pheromone" signals rather than through complex centralized planning.

This system implements the design principles from ROADMAP.md Section 5: "Pheromon-System (Schwarm-Signale)".

## What Are Pheromones?

Pheromones are simple numerical values (0-100) stored per room that represent the "scent" or "desire" for different activities. Higher values indicate higher priority for that activity type.

**Key Principles:**
- **Stigmergic Communication**: Indirect coordination through environmental signals
- **Emergent Behavior**: Global strategy emerges from local rules
- **Decentralized**: No central coordinator needed
- **Lightweight**: Simple numbers, not complex objects

## Pheromone Types

Each room tracks 9 pheromone types:

### 1. **expand** (Expansion)
- **Purpose**: Desire to expand into new territories
- **Increases when**: 
  - Economy is stable and surplus energy available
  - Danger level is 0 (peaceful)
  - Energy balance is positive
- **Decreases when**: Under attack or insufficient resources
- **Diffusion**: Yes (30% rate) - spreads to neighboring rooms
- **Decay**: 95% per update (slow decay)

### 2. **harvest** (Harvesting)
- **Purpose**: Priority for energy harvesting
- **Increases when**: Sources have available energy
- **Decreases when**: Sources are depleted
- **Diffusion**: Low (10%) - mostly local
- **Decay**: 90% per update (fast decay)

### 3. **build** (Construction)
- **Purpose**: Priority for construction activities
- **Increases when**: 
  - Construction sites exist
  - Structures are destroyed (damage response)
- **Decreases when**: No construction needed
- **Diffusion**: Low (15%)
- **Decay**: 92% per update

### 4. **upgrade** (Controller Upgrading)
- **Purpose**: Priority for controller upgrading
- **Increases when**: Controller progress < 50% of needed progress
- **Decreases when**: Controller close to leveling up
- **Diffusion**: Low (10%)
- **Decay**: 93% per update

### 5. **defense** (Defensive Operations)
- **Purpose**: Need for defensive response
- **Increases when**:
  - Hostiles detected (immediate spike)
  - Structures destroyed
  - Nukes detected
- **Decreases when**: Threats eliminated
- **Diffusion**: High (40%) - warns neighbors
- **Decay**: 97% per update (very slow - maintains alert)

### 6. **war** (Offensive Operations)
- **Purpose**: Escalation to offensive warfare
- **Increases when**:
  - Danger level >= 2 (sustained threat)
  - Repeated attacks
- **Decreases when**: Threat eliminated
- **Diffusion**: High (50%) - coordinates cluster response
- **Decay**: 98% per update (very slow)

### 7. **siege** (Critical Defense/Siege Operations)
- **Purpose**: Maximum defensive/offensive escalation
- **Increases when**:
  - Danger level = 3 (critical)
  - Nukes detected
  - Critical structures destroyed
- **Decreases when**: Siege broken
- **Diffusion**: Very high (60%) - cluster-wide mobilization
- **Decay**: 99% per update (extremely slow)

### 8. **logistics** (Resource Distribution)
- **Purpose**: Need for energy distribution/logistics
- **Increases when**: 
  - Spawns have < 50% energy
  - Storage exists but spawns empty
- **Decreases when**: Energy well-distributed
- **Diffusion**: Low (20%)
- **Decay**: 91% per update

### 9. **nukeTarget** (Nuke Targeting)
- **Purpose**: Marks rooms as nuke targets
- **Increases when**: Room identified as strategic nuke target
- **Decreases when**: Target no longer relevant
- **Diffusion**: Very low (10%) - mostly for intel
- **Decay**: 99% per update

## Room Intent/Posture

In addition to pheromones, each room has a **posture** (intent) that represents its overall strategic mode:

- **eco**: Economic/peaceful development
- **expand**: Expansion focus
- **defensive**: Defensive stance
- **war**: Active warfare
- **siege**: Maximum escalation
- **evacuate**: Emergency evacuation
- **nukePrep**: Preparing for nuke launch

The posture is determined by:
1. Danger level (0-3)
2. Dominant pheromone
3. Strategic objectives

## Pheromone Updates

### Update Frequency

Pheromones are updated on a configurable interval (default: every 5 ticks).

**Update Cycle:**
1. **Decay**: All pheromones multiplied by decay factor
2. **Calculate Contributions**: Add new pheromone values based on current state
3. **Diffusion**: Spread pheromones to neighboring rooms (if applicable)
4. **Event Updates**: Immediate updates for critical events

### Periodic Updates

Every 5-10 ticks, pheromones are updated based on:

**Energy Metrics:**
- Harvested energy → affects `harvest`
- Energy distribution → affects `logistics`
- Energy surplus → affects `expand`

**Construction Metrics:**
- Construction sites → affects `build`
- Controller progress → affects `upgrade`

**Threat Metrics:**
- Hostile presence → affects `defense`
- Sustained attacks → affects `war`
- Critical threats → affects `siege`

### Event-Driven Updates

Critical events trigger immediate pheromone updates:

#### Hostile Detected
```javascript
pheromoneManager.onHostileDetected(swarm, hostileCount, dangerLevel);
```
- Increases `defense` by `hostileCount * 5`
- If danger >= 2, increases `war` by `danger * 10`
- If danger >= 3, increases `siege` by 20

#### Structure Destroyed
```javascript
pheromoneManager.onStructureDestroyed(swarm, structureType);
```
- Increases `defense` by 5
- Increases `build` by 10
- If critical structure (spawn, storage, tower):
  - Increases danger level
  - Increases `siege` by 15

#### Nuke Detected
```javascript
pheromoneManager.onNukeDetected(swarm);
```
- Sets danger to 3 (maximum)
- Increases `siege` by 50
- Increases `defense` by 30

#### Remote Source Lost
```javascript
pheromoneManager.onRemoteSourceLost(swarm);
```
- Decreases `expand` by 10
- Increases `defense` by 5

## Pheromone Diffusion

Certain pheromones spread to neighboring rooms to coordinate cluster responses.

### Diffusible Pheromones
- **defense**: 40% diffusion rate
- **war**: 50% diffusion rate
- **expand**: 30% diffusion rate
- **siege**: 60% diffusion rate

### Diffusion Mechanism

1. For each room with intensity > 1:
   - Identify neighboring rooms (N, S, E, W)
   - Calculate diffusion amount: `intensity * rate * 0.5`
   - Add to neighbor's pheromone level
   - Cap neighbor level at source intensity (prevents infinite growth)

**Example:**
```
Room A has defense=80, Room B (neighbor) has defense=20
Diffusion rate = 40%
Amount diffused = 80 * 0.4 * 0.5 = 16
Room B new value = 20 + 16 = 36
```

### Why Diffusion Matters

- **Cluster Coordination**: Nearby rooms respond to threats together
- **Early Warning**: Defensive alerts spread before attackers arrive
- **Strategic Depth**: War posture coordinated across multiple rooms
- **Resource Sharing**: Expansion opportunities shared with cluster

## Danger Levels

Danger level (0-3) represents threat intensity and influences pheromones:

### Danger 0: Peaceful
- Normal operations
- `expand` can increase
- `defense`, `war`, `siege` decay naturally

### Danger 1: Threat Detected
- Hostiles spotted but manageable
- `defense` increases moderately
- Spawns may adjust to produce defenders

### Danger 2: Active Attack
- Sustained hostile presence
- `defense` high, `war` starts increasing
- Defensive posture activated
- May request cluster assistance

### Danger 3: Critical Threat
- Major attack or nuke detected
- `siege` maximized
- May trigger Safe Mode
- Cluster-wide response mobilized

## Using Pheromones

### In Spawn Logic

Spawns can prioritize creep types based on pheromones:

```javascript
function getSpawnPriority(swarm) {
  const pheromones = swarm.pheromones;
  
  // Highest pheromone determines priority
  if (pheromones.defense > 50) {
    return "defender";
  }
  if (pheromones.harvest > 40) {
    return "harvester";
  }
  if (pheromones.build > 30) {
    return "builder";
  }
  if (pheromones.upgrade > 20) {
    return "upgrader";
  }
  
  // Default to economy
  return "harvester";
}
```

### In Creep Behavior

Creeps can read local pheromones to make decisions:

```javascript
function runWorker(creep, swarm) {
  const pheromones = swarm.pheromones;
  
  if (pheromones.defense > 50) {
    // Switch to emergency repair mode
    return repairCriticalStructures(creep);
  }
  
  if (pheromones.build > pheromones.upgrade) {
    return buildConstruction(creep);
  } else {
    return upgradeController(creep);
  }
}
```

### In Strategic Planning

Empire manager can make decisions based on pheromone patterns:

```javascript
function shouldExpandCluster(cluster) {
  const avgExpand = calculateAverageExpandPheromone(cluster.rooms);
  const avgDefense = calculateAverageDefensePheromone(cluster.rooms);
  
  // Only expand when cluster is peaceful and expansion desire is high
  return avgExpand > 40 && avgDefense < 20;
}
```

## Dominant Pheromone

The **dominant pheromone** is the pheromone type with the highest value (must be > 1).

```javascript
const dominant = pheromoneManager.getDominantPheromone(swarm.pheromones);
// Returns: "defense" | "harvest" | "build" | etc. | null
```

**Uses:**
- Quick decision making
- Logging and debugging
- Posture determination
- Stats tracking

## Configuration

Pheromone system can be configured:

```javascript
import { PheromoneManager } from "./logic/pheromone";

const pheromoneManager = new PheromoneManager({
  updateInterval: 5,           // Update every N ticks
  maxValue: 100,               // Maximum pheromone value
  minValue: 0,                 // Minimum pheromone value
  
  // Decay factors per type (0.9-0.99)
  decayFactors: {
    expand: 0.95,
    harvest: 0.90,
    build: 0.92,
    upgrade: 0.93,
    defense: 0.97,
    war: 0.98,
    siege: 0.99,
    logistics: 0.91,
    nukeTarget: 0.99
  },
  
  // Diffusion rates (fraction leaked to neighbors)
  diffusionRates: {
    expand: 0.3,
    harvest: 0.1,
    build: 0.15,
    upgrade: 0.1,
    defense: 0.4,
    war: 0.5,
    siege: 0.6,
    logistics: 0.2,
    nukeTarget: 0.1
  }
});
```

## Best Practices

### 1. Read Pheromones, Don't Overthink

```javascript
// Good: Simple threshold checks
if (swarm.pheromones.defense > 30) {
  spawnDefender();
}

// Bad: Complex calculations
const threat = (swarm.pheromones.defense * 0.7 + swarm.pheromones.war * 0.3) / swarm.danger;
```

### 2. Let Events Drive Updates

```javascript
// Good: Let event handlers update pheromones
kernel.on("hostile.detected", (event) => {
  pheromoneManager.onHostileDetected(swarm, event.hostileCount, event.danger);
});

// Bad: Manual recalculation every tick
```

### 3. Trust the Diffusion

```javascript
// Good: Neighbor rooms automatically get defense signal
// No explicit messaging needed

// Bad: Manually propagating alerts
for (const neighbor of getNeighbors(room)) {
  neighbor.memory.alertLevel = room.memory.alertLevel;
}
```

### 4. Use Thresholds, Not Exact Values

```javascript
// Good: Threshold ranges
if (pheromones.harvest < 20) {
  // Critical harvest shortage
} else if (pheromones.harvest < 50) {
  // Low harvest
} else {
  // Normal harvest
}

// Bad: Exact value checks
if (pheromones.harvest === 42) {
  // Will rarely/never match
}
```

## Visualization

Pheromones can be visualized in-game using RoomVisual:

```javascript
function visualizePheromones(room, swarm) {
  const pheromones = swarm.pheromones;
  const visual = room.visual;
  
  let y = 1;
  for (const [type, value] of Object.entries(pheromones)) {
    const color = value > 50 ? "#ff0000" : value > 20 ? "#ffaa00" : "#00ff00";
    visual.text(`${type}: ${value.toFixed(1)}`, 1, y, { 
      align: "left", 
      color,
      font: 0.5 
    });
    y += 0.6;
  }
}
```

## Debugging

### View Current Pheromones

```javascript
// In console
const swarm = Memory.rooms["W1N1"].swarm;
console.log(JSON.stringify(swarm.pheromones, null, 2));
```

### Track Pheromone History

```javascript
// Enable pheromone stats
statsManager.recordPheromones(
  room.name,
  swarm.pheromones,
  swarm.posture,
  pheromoneManager.getDominantPheromone(swarm.pheromones)
);

// View in stats
const stats = statsManager.getStats();
console.log(stats.pheromones["W1N1"]);
```

### Manual Pheromone Adjustment

```javascript
// In console - for testing/debugging
const swarm = Memory.rooms["W1N1"].swarm;
swarm.pheromones.defense = 80; // Set defense to 80
swarm.danger = 2; // Escalate danger level
```

## Advanced Topics

### Custom Pheromones

You can add custom pheromones for specialized behaviors:

```javascript
// Add in memory schema
export interface PheromoneState {
  // ... existing pheromones
  myCustomPheromone: number;
}

// Add decay and diffusion config
decayFactors: {
  // ... existing factors
  myCustomPheromone: 0.95
}
```

### Pheromone-Based FSM

Use pheromones to drive finite state machines:

```javascript
function getCreepState(swarm) {
  if (swarm.pheromones.defense > 70) return "DEFEND";
  if (swarm.pheromones.war > 60) return "ATTACK";
  if (swarm.pheromones.build > 50) return "BUILD";
  if (swarm.pheromones.upgrade > 40) return "UPGRADE";
  return "HARVEST";
}
```

### Multi-Room Pheromone Queries

```javascript
function getClusterDefenseLevel(clusterRooms) {
  let totalDefense = 0;
  let count = 0;
  
  for (const roomName of clusterRooms) {
    const swarm = Memory.rooms[roomName]?.swarm;
    if (swarm) {
      totalDefense += swarm.pheromones.defense;
      count++;
    }
  }
  
  return count > 0 ? totalDefense / count : 0;
}
```

## Performance

### CPU Cost
- **Update**: ~0.1-0.2 CPU per room per update (every 5 ticks)
- **Event handlers**: <0.05 CPU per event
- **Diffusion**: ~0.05 CPU per room with active diffusion

### Memory Cost
- 9 pheromones × 8 bytes = 72 bytes per room
- Plus intent, danger, metrics: ~150 bytes total per room

### Optimization Tips
1. Increase `updateInterval` for less critical rooms (10-20 ticks)
2. Disable diffusion for isolated rooms
3. Use event-driven updates instead of polling where possible

## See Also

- [STATS_AND_METRICS.md](./STATS_AND_METRICS.md) - Stats system including pheromone stats
- [GAME_VARIABLES.md](./GAME_VARIABLES.md) - Game constants and variables
- [ROADMAP.md](../ROADMAP.md) - Section 5: Pheromon-System design principles

## Troubleshooting

### Pheromones not updating
- Check `swarm.nextUpdateTick` - should be <= current Game.time
- Verify `pheromoneManager.updatePheromones()` is called
- Ensure metrics are being collected via `updateMetrics()`

### Pheromones stuck at max/min
- Check decay factors (should be < 1.0)
- Verify contributions aren't too large
- Ensure clamping is working (max=100, min=0)

### Diffusion not working
- Verify rooms are actual neighbors (N, S, E, W only)
- Check diffusion rates > 0 for affected pheromones
- Ensure `applyDiffusion()` is called with room map

### Wrong posture/intent
- Check danger level calculation
- Verify dominant pheromone detection
- Review pheromone values and thresholds
