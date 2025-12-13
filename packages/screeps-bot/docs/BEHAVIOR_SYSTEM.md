# Creep Behavior System Documentation

## Overview

The creep behavior system provides a reliable, dynamic, and resilient framework for creep decision-making in the Screeps bot. It implements the swarm architecture principles defined in [ROADMAP.md](../../ROADMAP.md) Sections 2, 5, and 8.

## Architecture

The behavior system uses a clean, layered architecture:

```
┌─────────────────────────────────────────────────┐
│              Creep Process                      │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         1. Context Creation                     │
│  Gather all information needed for decisions    │
│  - Room state, resources, enemies, pheromones   │
│  - Pre-computed queries (cached per tick)       │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         2. Behavior Evaluation                  │
│  Determine what action to take                  │
│  - Role-specific behavior functions             │
│  - Pheromone-guided prioritization             │
│  - State machine for action persistence         │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         3. Action Execution                     │
│  Execute the chosen action                      │
│  - Handle movement automatically                │
│  - Detect and recover from errors              │
│  - Update working state                         │
└───────────────────────────────────────────────┬─┘
                   │
┌──────────────────▼──────────────────────────────┐
│         4. Resilience & Recovery                │
│  Monitor and adapt to failures                  │
│  - Automatic fallback behaviors                │
│  - Emergency mode switching                    │
│  - Health monitoring                           │
└─────────────────────────────────────────────────┘
```

## Core Components

### 1. Context (`context.ts`)

The context contains all information a creep needs to make decisions:

```typescript
interface CreepContext {
  // Core references
  creep: Creep;
  room: Room;
  memory: SwarmCreepMemory;

  // Room state
  swarmState: SwarmState | undefined;
  
  // Pre-computed room data (cached per tick)
  droppedResources: Resource[];
  containers: StructureContainer[];
  spawnStructures: (StructureSpawn | StructureExtension)[];
  towers: StructureTower[];
  storage: StructureStorage | undefined;
  hostiles: Creep[];
  // ... and more
}
```

**Key Features:**
- **Per-tick caching**: All room queries are cached per tick and shared across creeps
- **Lazy evaluation**: Expensive operations are only computed when first accessed
- **Type safety**: All fields are strongly typed for reliability

### 2. Behaviors (`economy.ts`, `military.ts`, `utility.ts`)

Behavior functions evaluate the context and return an action:

```typescript
type BehaviorFunction = (ctx: CreepContext) => CreepAction;

// Example: larvaWorker behavior
function larvaWorker(ctx: CreepContext): CreepAction {
  const isWorking = updateWorkingState(ctx);
  
  if (isWorking) {
    // Deliver energy, build, or upgrade
    const deliverAction = deliverEnergy(ctx);
    if (deliverAction) return deliverAction;
    
    if (ctx.prioritizedSites.length > 0) {
      return { type: "build", target: ctx.prioritizedSites[0] };
    }
    
    if (ctx.room.controller) {
      return { type: "upgrade", target: ctx.room.controller };
    }
  }
  
  // Collect energy
  return findEnergy(ctx);
}
```

**Design Principles:**
- **Simple and readable**: Behaviors are pure functions with clear logic
- **Pheromone-guided**: Use pheromones for room-wide coordination (ROADMAP Section 5)
- **Role-specific**: Each role has its own behavior function

### 3. State Machine (`stateMachine.ts`)

The state machine provides action persistence to prevent creeps from constantly changing direction:

```typescript
// Creeps commit to actions until completion
const action = evaluateWithStateMachine(ctx, behaviorFn);
```

**Key Features:**
- **Action persistence**: Creeps continue their current action until complete
- **State completion detection**: Automatically detects when actions are done
- **Stuck detection**: Identifies when creeps are stuck and clears state
- **Timeout handling**: Expires states that run too long

**State Lifecycle:**
```
┌─────────────────┐
│  No State       │
│  (First tick)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Evaluate New   │◄────────────┐
│  Behavior       │             │
└────────┬────────┘             │
         │                      │
         ▼                      │
┌─────────────────┐             │
│  Create State   │             │
│  Store Action   │             │
└────────┬────────┘             │
         │                      │
         ▼                      │
┌─────────────────┐             │
│  Execute Action │             │
│  (Multiple      │             │
│   ticks)        │             │
└────────┬────────┘             │
         │                      │
         ▼                      │
    ┌────────┐                  │
    │Complete?│──No──┐          │
    └───┬────┘      │          │
        │Yes        │          │
        │           ▼          │
        │      ┌────────┐      │
        │      │Valid?  │──No──┤
        │      └───┬────┘      │
        │          │Yes        │
        │          └───────────┘
        │
        ▼
┌─────────────────┐
│  Clear State    │
└─────────────────┘
```

### 4. Executor (`executor.ts`)

The executor translates actions into Screeps API calls:

```typescript
executeAction(creep, action, ctx);
```

**Features:**
- **Automatic movement**: Handles `ERR_NOT_IN_RANGE` by moving toward target
- **Error recovery**: Detects invalid targets and clears state
- **Path visualization**: Shows creep paths for debugging
- **State updates**: Updates `working` state based on capacity

**Error Handling:**
```typescript
// Executor detects these errors and clears state:
- ERR_FULL: Target is full (e.g., spawn filled)
- ERR_NOT_ENOUGH_RESOURCES: Source is empty
- ERR_INVALID_TARGET: Target doesn't exist
- ERR_NO_PATH: Cannot path to target
```

### 5. Resilience (`resilience.ts`) **NEW**

Provides automatic recovery mechanisms:

```typescript
// Wrap behaviors for automatic error recovery
const resilientBehavior = withResilience(myBehavior, {
  maxRecoveryAttempts: 3,
  fallbackStrategy: "returnHome",
  logFailures: true
});

// Emergency mode for critical situations
if (shouldUseEmergencyMode(ctx)) {
  const emergencyBehavior = createEmergencyBehavior(ctx);
  action = emergencyBehavior(ctx);
}

// Health monitoring
const health = assessBehaviorHealth(ctx); // 0-100
```

**Fallback Strategies:**
- `idle`: Do nothing (safest)
- `returnHome`: Move back to home room
- `moveToSafety`: Flee from hostiles
- `harvest`: Try to collect energy

### 6. Priority System (`priority.ts`) **NEW**

Dynamic task prioritization based on pheromones and context:

```typescript
// Calculate priorities for all possible tasks
const priorities = calculateBehaviorPriorities(ctx);

// Select the highest priority task the creep can perform
const task = selectHighestPriorityTask(priorities, ctx);
```

**Task Types:**
- `refillSpawns` (priority: 90) - Critical for creep production
- `refillTowers` (priority: 60+) - Higher when under attack
- `defend` (priority: 95) - Highest when hostiles present
- `build` (priority: 40+) - Boosted by build pheromone
- `upgrade` (priority: 30+) - Boosted by upgrade pheromone
- And more...

## Usage Patterns

### Basic Usage

```typescript
import { createContext, evaluateEconomyBehavior, executeAction } from "../behaviors";
import { evaluateWithStateMachine } from "../behaviors/stateMachine";

function runEconomyRole(creep: Creep): void {
  const ctx = createContext(creep);
  const action = evaluateWithStateMachine(ctx, evaluateEconomyBehavior);
  executeAction(creep, action, ctx);
}
```

### With Resilience

```typescript
import { withResilience, shouldUseEmergencyMode, createEmergencyBehavior } from "../behaviors";

const resilientEconomyBehavior = withResilience(evaluateEconomyBehavior, {
  fallbackStrategy: "returnHome"
});

function runEconomyRole(creep: Creep): void {
  const ctx = createContext(creep);
  
  // Use emergency mode if in danger
  let behaviorFn = resilientEconomyBehavior;
  if (shouldUseEmergencyMode(ctx)) {
    behaviorFn = createEmergencyBehavior(ctx);
  }
  
  const action = evaluateWithStateMachine(ctx, behaviorFn);
  executeAction(creep, action, ctx);
}
```

### With Priority System

```typescript
import { calculateBehaviorPriorities, selectHighestPriorityTask } from "../behaviors";

function adaptiveLarvaWorker(ctx: CreepContext): CreepAction {
  // Calculate dynamic priorities
  const priorities = calculateBehaviorPriorities(ctx);
  const task = selectHighestPriorityTask(priorities, ctx);
  
  // Execute highest priority task
  switch (task) {
    case "refillSpawns":
      return deliverEnergy(ctx);
    case "build":
      return { type: "build", target: ctx.prioritizedSites[0]! };
    case "upgrade":
      return { type: "upgrade", target: ctx.room.controller! };
    // ... etc
  }
}
```

## Pheromone Integration

Behaviors read and respond to pheromones for stigmergic communication (ROADMAP Section 5):

```typescript
import { getPheromones, needsBuilding, needsUpgrading } from "./pheromoneHelper";

const pheromones = getPheromones(creep);
if (pheromones) {
  // Prioritize building if build pheromone is high
  if (needsBuilding(pheromones)) {
    // Focus on construction
  }
  
  // Prioritize upgrading if upgrade pheromone is high
  if (needsUpgrading(pheromones)) {
    // Focus on controller
  }
}
```

**Pheromone Types** (from ROADMAP):
- `expand` - Expansion pressure
- `harvest` - Energy collection need
- `build` - Construction need
- `upgrade` - Controller upgrade need
- `defense` - Defense priority
- `war` - Offensive priority
- `siege` - Siege operations
- `logistics` - Resource distribution need

## Performance Optimization

### CPU Efficiency

The behavior system is designed for minimal CPU usage:

1. **Per-tick caching**: Room queries cached once per tick, shared across all creeps
2. **Lazy evaluation**: Expensive operations only computed when needed
3. **Early exits**: Behaviors return as soon as valid action found
4. **Distributed targeting**: Prevents creeps from clustering on same targets
5. **Path reuse**: State machine prevents re-pathing every tick

### Memory Efficiency

Memory usage is minimized through:

1. **Compact state storage**: Only essential state stored in creep memory
2. **TTL-based expiration**: Old data automatically expires
3. **Shared room caches**: Global caches shared across creeps (not in Memory)

## Testing

Comprehensive test coverage ensures reliability:

```
Behavior System
  Reliability - Edge Case Handling
    ✓ should handle undefined working state gracefully
    ✓ should handle empty room with no resources
    ✓ should handle full spawn structures gracefully
    ✓ should handle destroyed target mid-action
    ✓ should handle contested resources without deadlock
  Dynamism - Adaptive Behavior
    ✓ should prioritize defense when hostiles present
    ✓ should adapt to pheromone signals
    ✓ should switch tasks when conditions change
    ✓ should respond to room danger level
  Resilience - Error Recovery
    ✓ should recover from stuck state
    ✓ should handle timeout of long-running states
    ✓ should clear invalid state on executor errors
    ✓ should handle null/undefined behavior returns
    ✓ should prevent infinite loops in behavior evaluation
```

## Troubleshooting

### Creep is Idle

**Symptoms**: Creep shows `action: "idle"` frequently

**Possible Causes**:
1. No valid targets available (check room resources)
2. State expired/cleared (check state timeout settings)
3. Behavior returning null (check for bugs in behavior function)

**Solutions**:
- Add fallback behaviors using `withResilience`
- Increase resource availability in room
- Check logs for warnings about idle creeps

### Creep is Stuck

**Symptoms**: Creep not moving, same position for many ticks

**Possible Causes**:
1. Invalid target (no path available)
2. Blocked by other creeps
3. State not being cleared

**Solutions**:
- Stuck detection automatically clears state after 5 ticks
- Cartographer's traffic management automatically handles creep coordination
- Check path visualization to see where creep is trying to go

### Creep Keeps Changing Tasks

**Symptoms**: Creep switches between different actions frequently

**Possible Causes**:
1. State machine not being used
2. State completing too quickly
3. Working state toggling

**Solutions**:
- Always use `evaluateWithStateMachine`
- Increase state timeout if needed
- Check `updateWorkingState` logic

## Best Practices

1. **Always use state machine**: Prevents creeps from changing direction every tick
2. **Use context caching**: Never call `room.find()` directly in behaviors
3. **Handle edge cases**: Always check for null/undefined before using targets
4. **Test behaviors**: Add unit tests for new behaviors
5. **Use pheromones**: Integrate with pheromone system for coordination
6. **Monitor health**: Use `assessBehaviorHealth` for early problem detection
7. **Add resilience**: Wrap behaviors with `withResilience` for production
8. **Log failures**: Enable failure logging during development

## Future Enhancements

Planned improvements (see issue tracker):

- [ ] Behavior learning/optimization based on efficiency metrics
- [ ] Multi-tick action planning for complex tasks
- [ ] Collaborative behaviors (squad tactics, coordinated building)
- [ ] Behavior templates for easy role creation
- [ ] Visual behavior debugging tools
- [ ] Performance profiling per behavior

## Related Documentation

- [ROADMAP.md](../../ROADMAP.md) - Overall bot architecture
- [BUGFIX_CREEP_DEADLOCK.md](../../BUGFIX_CREEP_DEADLOCK.md) - Working state fix
- [State Machine Documentation](./stateMachine.ts) - State persistence details
- [Pheromone System](./pheromoneHelper.ts) - Stigmergic communication

## Support

For bugs or questions:
1. Check existing tests in `test/unit/behaviorSystem.test.ts`
2. Enable debug logging: `config.debug = true`
3. Add visualization to see creep paths
4. Create an issue with reproduction steps
