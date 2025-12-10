# Pheromone Integration with Behaviors

## Overview

The Pheromone Integration system enhances the behavior system with stigmergic (indirect) communication based on pheromone levels. This addresses ROADMAP Section 5 requirements for emergent behavior through local signals.

## What is Stigmergy?

Stigmergy is a form of indirect coordination where entities communicate by modifying their environment. In Screeps, pheromones are numerical values stored in room memory that influence creep behavior without direct communication.

### Benefits

- **Emergent Behavior**: Global coordination from local rules
- **Decentralization**: No central decision-making required
- **Adaptability**: Automatic response to changing conditions
- **CPU Efficient**: Simple numeric comparisons

## Pheromone Types

From ROADMAP Section 5:

```typescript
interface PheromoneState {
  expand: number;      // 0-100: Expansion priority
  harvest: number;     // 0-100: Energy harvesting need
  build: number;       // 0-100: Construction priority
  upgrade: number;     // 0-100: Controller upgrade priority
  defense: number;     // 0-100: Defensive need
  war: number;         // 0-100: Offensive operations
  siege: number;       // 0-100: Siege/attack urgency
  logistics: number;   // 0-100: Energy distribution need
  nukeTarget: number;  // 0-100: Nuke target priority
}
```

## Core Functions

### 1. Priority Scaling

Scale task priority based on pheromone levels:

```typescript
const multiplier = getPriorityMultiplier(pheromones, "harvest");
// Returns: 0.5 (low priority) to 2.0 (high priority)
```

### 2. Role Focus Calculation

Determine optimal role distribution for spawning:

```typescript
const focus = getOptimalRoleFocus(pheromones);
// {
//   economy: 0.6,   // 60% economy creeps
//   military: 0.2,  // 20% military creeps
//   utility: 0.15,  // 15% utility creeps
//   power: 0.05     // 5% power creeps
// }
```

**Logic:**
- High combat pheromones → More military
- High economy pheromones → More workers
- High expand pheromone → More scouts/claimers

### 3. Defense Prioritization

Check if defensive actions should take priority:

```typescript
if (shouldPrioritizeDefense(creep)) {
  // Suspend normal duties, defend the room
}
```

Triggers when:
- `defense > 20` OR
- `war > 25` OR
- `siege > 30`

### 4. Emergency Mode

Activate emergency protocols:

```typescript
if (shouldActivateEmergencyMode(creep)) {
  // All hands on deck - critical situation
}
```

Triggers when:
- `defense > 50` OR
- `siege > 40`

### 5. Action Priorities

Get sorted list of actions by pheromone level:

```typescript
const priorities = getActionPriorities(pheromones);
// [
//   { action: "defense", priority: 85 },
//   { action: "harvest", priority: 60 },
//   { action: "build", priority: 40 },
//   ...
// ]
```

Use for multi-role creeps to decide what to do next.

## Integration Examples

### Spawn Prioritization

```typescript
import { getOptimalRoleFocus } from "./roles/behaviors/pheromoneHelper";

function determineSpawnQueue(room: Room) {
  const pheromones = memoryManager.getSwarmState(room.name)?.pheromones;
  if (!pheromones) return;

  const focus = getOptimalRoleFocus(pheromones);
  
  // Adjust spawn weights
  const weights = {
    harvester: focus.economy * 2.0,
    hauler: focus.economy * 1.5,
    upgrader: focus.economy * 1.0,
    builder: focus.economy * 0.8,
    guard: focus.military * 2.0,
    soldier: focus.military * 1.5,
    scout: focus.utility * 1.0,
    claimer: focus.utility * 0.5
  };
  
  // Sort and spawn highest priority
}
```

### Dynamic Behavior Switching

```typescript
import { shouldPrioritizeDefense } from "./roles/behaviors/pheromoneHelper";

function runHarvester(creep: Creep) {
  if (shouldPrioritizeDefense(creep)) {
    // Harvester temporarily becomes defender
    defendRoom(creep);
    return;
  }
  
  // Normal harvesting behavior
  harvest(creep);
}
```

### Multi-Role Creeps

```typescript
import { getActionPriorities } from "./roles/behaviors/pheromoneHelper";

function runWorker(creep: Creep) {
  const pheromones = getPheromones(creep);
  if (!pheromones) return;
  
  const priorities = getActionPriorities(pheromones);
  
  // Try actions in priority order
  for (const { action } of priorities) {
    switch (action) {
      case "defense":
        if (tryDefend(creep)) return;
        break;
      case "build":
        if (tryBuild(creep)) return;
        break;
      case "harvest":
        if (tryHarvest(creep)) return;
        break;
      // ... more actions
    }
  }
}
```

### Emergency Response

```typescript
import { shouldActivateEmergencyMode } from "./roles/behaviors/pheromoneHelper";

function runCreep(creep: Creep) {
  if (shouldActivateEmergencyMode(creep)) {
    // All creeps help defend
    emergencyDefense(creep);
    return;
  }
  
  // Normal role behavior
  executeRole(creep);
}
```

## Pheromone Updates

Pheromones are updated by the Pheromone System (see `src/logic/pheromone.ts`):

### Periodic Updates (every 5-10 ticks)

Based on rolling averages:
- Energy harvested → `harvest`
- Construction progress → `build`
- Controller upgrades → `upgrade`
- Hostile counts → `defense`

### Event-Driven Updates

Immediate responses:
- Hostiles detected → `danger++`, `defense↑`
- Structure destroyed → `danger↑`, `war↑`
- Nuke detected → `danger=3`, `siege↑`
- Remote lost → adjust `expand`, `harvest`, `danger`

### Decay & Diffusion

- **Decay**: Pheromones multiply by 0.9-0.99 each update (evaporation)
- **Diffusion**: High-priority pheromones spread to neighbors
  - `defense`, `war`, `siege` → Propagate to adjacent rooms
  - `expand`, `harvest` → Spread along remote corridors

## Threshold Reference

| Pheromone | Threshold | Meaning |
|-----------|-----------|---------|
| defense | >20 | Defense needed |
| defense | >50 | Emergency defense |
| war | >25 | Defense needed |
| siege | >30 | Defense needed |
| siege | >40 | Emergency mode |
| harvest | >15 | More harvesters needed |
| build | >15 | More builders needed |
| upgrade | >15 | More upgraders needed |
| logistics | >15 | Energy distribution needed |
| expand | >30 | Expansion priority high |

## Best Practices

### DO:
✅ Use pheromones for gradual priority shifts
✅ Combine multiple pheromones for decisions
✅ Let the pheromone system handle updates
✅ Use helper functions instead of direct checks
✅ Test thresholds empirically

### DON'T:
❌ Directly modify pheromones in behavior code
❌ Use pheromones for binary decisions (use events)
❌ Ignore decay/diffusion effects
❌ Hard-code thresholds without tuning
❌ Over-react to small pheromone changes

## Configuration

Pheromone behavior is configured in `src/logic/pheromone.ts`:

```typescript
const DEFAULT_PHEROMONE_CONFIG = {
  updateInterval: 5,     // Ticks between updates
  decayFactors: {
    defense: 0.97,       // Slow decay
    harvest: 0.90,       // Fast decay
    // ...
  },
  diffusionRates: {
    defense: 0.4,        // High spread
    harvest: 0.1,        // Low spread
    // ...
  },
  maxValue: 100,
  minValue: 0
};
```

## Performance

### CPU Costs

| Operation | CPU Cost | Notes |
|-----------|----------|-------|
| getPheromones() | <0.001 | Memory read |
| getOptimalRoleFocus() | <0.001 | Math operations |
| shouldPrioritizeDefense() | <0.001 | Threshold check |
| getActionPriorities() | <0.001 | Array sort |

**Total overhead**: Negligible (<0.01 CPU per creep per tick)

### Memory Usage

Pheromones are stored in Room.memory:
- **Per Room**: ~72 bytes (9 pheromones * 8 bytes)
- **100 Rooms**: ~7KB

## Integration Points

### With Behavior System

```typescript
// In behavior executor
import { getPheromones, getActionPriorities } from "./pheromoneHelper";

export function executeBehavior(creep: Creep, role: string) {
  const pheromones = getPheromones(creep);
  
  // Use pheromones to adjust behavior
  const priorities = getActionPriorities(pheromones);
  
  // Execute role with pheromone context
  runRole(creep, role, priorities);
}
```

### With Spawn System

```typescript
// In spawn coordinator
import { getOptimalRoleFocus } from "./roles/behaviors/pheromoneHelper";

export function calculateSpawnPriorities(room: Room) {
  const pheromones = getSwarmState(room.name)?.pheromones;
  if (!pheromones) return defaultPriorities;
  
  const focus = getOptimalRoleFocus(pheromones);
  
  // Adjust spawn queue based on focus
  return adjustPriorities(defaultPriorities, focus);
}
```

## ROADMAP Compliance

This implementation addresses ROADMAP Section 5:

> **Stigmergische Kommunikation**: Kommunikation über einfache Zahlen in Room.memory (Pheromon-Felder), statt große Objektbäume oder globale Maps

✅ Simple numeric values in Room.memory
✅ No large object trees
✅ Local signal-based coordination
✅ Decay & diffusion mechanisms
✅ Event-driven updates

## Examples from Nature

The pheromone system is inspired by ant colonies:

| Ant Behavior | Screeps Equivalent |
|--------------|-------------------|
| Food trail pheromone | `harvest` pheromone |
| Danger pheromone | `defense` pheromone |
| Territory marking | `expand` pheromone |
| Recruitment signal | `war`/`siege` pheromone |

## Future Enhancements

Potential improvements (not yet implemented):

- **Pheromone Trails**: Directional pheromones (not just room-level)
- **Chemical Combinations**: Composite pheromones with interactions
- **Learning**: Adjust decay/diffusion rates based on effectiveness
- **Visualization**: Heatmaps showing pheromone levels
- **Cross-Shard**: Pheromone propagation through portals

## Troubleshooting

### Issue: Behaviors not responding to pheromones

**Check:**
1. Pheromone system is running (`PheromoneManager`)
2. Values are being updated (check Room.memory)
3. Thresholds are appropriate for your situation
4. Helper functions are being called

### Issue: Over-reaction to pheromones

**Solution:**
- Increase decay factors (slower response)
- Increase thresholds
- Add hysteresis (different on/off thresholds)

### Issue: Under-reaction to pheromones

**Solution:**
- Decrease decay factors (faster response)
- Decrease thresholds
- Increase event-driven boosts

## References

- ROADMAP.md Section 5: Pheromone System (Schwarm-Signale)
- `src/logic/pheromone.ts` - Core pheromone system
- `src/roles/behaviors/pheromoneHelper.ts` - Integration helpers
- `test/unit/pheromoneIntegration.test.ts` - Unit tests
