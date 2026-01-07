# Roles Subsystem

## Overview

The roles subsystem implements creep behaviors using a modular, behavior-composition approach. Creeps execute actions based on their role, current state, and environmental context. The system uses state machines for persistent behavior and opportunistic actions for efficiency.

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│               Behavior Executor                         │
│  - Action execution                                     │
│  - State persistence                                    │
│  - Opportunistic actions                                │
│  - Movement coordination                                │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴────────┬──────────────┬──────────────┐
    │                 │              │              │
┌───▼──────┐  ┌──────▼─────┐  ┌────▼──────┐  ┌────▼─────┐
│  State   │  │  Economy   │  │  Military │  │  Utility │
│ Machine  │  │   Roles    │  │   Roles   │  │   Roles  │
│Persistence│  │Harvest/Haul│  │Guard/Heal │  │Scout/Claim│
│Completion │  │Build/Repair│  │Attack/Raid│  │Engineer  │
└──────────┘  └────────────┘  └───────────┘  └──────────┘
```

### Core Components

#### 1. **Behavior Executor** (`behaviors/executor.ts`)
Executes creep actions with automatic movement and error handling.

**Key Features:**
- Action execution (harvest, transfer, build, repair, attack, heal, etc.)
- Automatic movement when target out of range
- Invalid target detection (ERR_FULL, ERR_NOT_ENOUGH_RESOURCES, ERR_NO_PATH)
- State clearing on errors for immediate re-evaluation
- Path visualization for debugging
- Opportunistic actions (pick up resources while moving)

**Error Handling:**
When actions fail due to invalid targets:
- `ERR_FULL`: Target full (clear state, find new target)
- `ERR_NOT_ENOUGH_RESOURCES`: Source empty (clear state)
- `ERR_INVALID_TARGET`: Target invalid (clear state)
- `ERR_NO_PATH`: Target unreachable (clear state)

#### 2. **State Machine** (`behaviors/stateMachine.ts`)
Provides persistent state management to prevent sudden direction changes.

**Key Features:**
- State validation (target exists, not expired)
- Completion detection (creep empty/full, target destroyed)
- State timeout (default: 25 ticks)
- Two-layer approach: state machine + executor error handling

**State Lifecycle:**
1. Check if current state is valid and incomplete
2. If valid, continue executing current state action
3. If invalid/complete/expired, evaluate new action and commit
4. Store state in creep memory for next tick

**Completion Detection:**
- Transfer/Build/Repair/Upgrade: complete when creep is empty
- Withdraw/Pickup/Harvest: complete when creep is full
- Target destroyed: always triggers completion

#### 3. **Context** (`behaviors/context.ts`)
Provides contextual information for behavior functions.

**Key Features:**
- Access to creep, memory, room, and game state
- Helper functions (finding sources, structures, etc.)
- Pheromone access (room signals)
- Cache integration

#### 4. **Economy Roles** (`economy/`)
Implements economy-focused creep roles.

**Roles:**
- **Harvester**: Mines energy from sources
- **Hauler**: Transports energy from sources to spawn/extensions
- **Upgrader**: Upgrades room controller
- **Builder**: Constructs buildings
- **Repairer**: Repairs damaged structures
- **Queen Carrier**: Fills spawn/extensions with energy
- **Remote Harvester**: Mines remote sources
- **Remote Hauler**: Transports from remote sources

#### 5. **Military Roles** (`military/`)
Implements combat and defense roles.

**Roles:**
- **Guard**: Defends owned rooms from hostiles
- **Remote Guard**: Protects remote mining operations
- **Healer**: Heals friendly creeps in combat
- **Soldier**: Offensive combat creep
- **Ranger**: Ranged combat creep
- **Dismantler**: Destroys enemy structures

#### 6. **Utility Roles** (`utility/`)
Implements support and exploration roles.

**Roles:**
- **Scout**: Explores rooms for intel
- **Claimer**: Claims new rooms
- **Reserver**: Reserves neutral rooms
- **Engineer**: Builds remote infrastructure
- **Observer**: Provides vision of remote rooms

#### 7. **Power Roles** (`power/`)
Implements Power Creep roles.

**Roles:**
- **Power Creep**: Operates Power Creeps (OPERATE_SPAWN, GENERATE_OPS, etc.)

## Key Concepts

### 1. Behavior Composition

Roles are composed of behaviors (functions that return actions):

```typescript
type BehaviorFunction = (creep: Creep, ctx: CreepContext) => CreepAction;
```

**Action Types:**
- `harvest`: Mine resource from source
- `withdraw`: Take resource from structure
- `transfer`: Give resource to structure
- `pickup`: Pick up dropped resource
- `build`: Construct building
- `repair`: Repair structure
- `upgrade`: Upgrade controller
- `attack`: Melee attack
- `rangedAttack`: Ranged attack
- `heal`: Heal friendly creep
- `move`: Move to position
- `idle`: Do nothing

### 2. State Persistence

Creeps commit to actions and persist state across ticks:

**State Structure:**
```typescript
interface CreepState {
  action: string;         // Action type (e.g., "harvest", "transfer")
  targetId?: Id<any>;     // Target object ID
  targetPos?: { x, y, roomName }; // Target position
  startTick: number;      // When state was created
  timeout: number;        // State expiration (default: 25 ticks)
}
```

**State Flow:**
```
1. Evaluate behavior → Action
2. Store state in creep.memory.state
3. Next tick: Check state validity
4. If valid: Execute same action
5. If invalid: Re-evaluate and create new state
```

### 3. Invalid Target Handling

Two-layer approach prevents creeps from getting stuck:

**Layer 1: State Machine**
- Checks if target exists
- Checks if state expired (> 25 ticks)
- Checks if action complete (creep empty/full)

**Layer 2: Executor**
- Executes action, catches errors
- Clears state on ERR_FULL, ERR_NOT_ENOUGH_RESOURCES, ERR_INVALID_TARGET, ERR_NO_PATH
- Allows immediate re-evaluation on same tick

**Example: Hauler transferring to extensions**
```
Tick 1: Transfer 50 to Extension A → OK (state persists)
Tick 2: Transfer to Extension A → ERR_FULL (executor clears state)
Tick 2: Re-evaluate → Find Extension B
Tick 2: Transfer 50 to Extension B → OK (new state created)
```

### 4. Opportunistic Actions

Creeps perform additional actions while executing primary behavior:

**Opportunistic Behaviors:**
- Pick up dropped resources while moving
- Repair structures in passing
- Transfer to critical structures (spawn, tower) when nearby
- Avoid idle time during movement

**Example:**
```
Hauler moving to storage:
1. Primary: Transfer energy to storage
2. Opportunistic: Pick up dropped energy along path
3. Opportunistic: Transfer to spawn if passing by and spawn < 300 energy
```

## API Reference

### Behavior Executor API

```typescript
import { executeAction } from './behaviors/executor';

// Execute action for creep
const action: CreepAction = {
  type: "harvest",
  target: source
};

executeAction(creep, action, ctx);
```

### State Machine API

```typescript
import { runCreepWithState } from './behaviors/stateMachine';

// Run creep with state persistence
const behavior: BehaviorFunction = (creep, ctx) => {
  // Evaluate and return action
  if (creep.store.getFreeCapacity() > 0) {
    return { type: "harvest", target: source };
  } else {
    return { type: "transfer", target: spawn, resourceType: RESOURCE_ENERGY };
  }
};

runCreepWithState(creep, behavior, ctx);
```

### Context API

```typescript
import { createCreepContext } from './behaviors/context';

// Create context for creep
const ctx = createCreepContext(creep);

// Access context
console.log(ctx.room.name); // Current room
console.log(ctx.memory.role); // Creep role
console.log(ctx.pheromones.harvest); // Harvest pheromone level

// Helper functions
const sources = ctx.findSources();
const spawns = ctx.findSpawns();
const hostiles = ctx.findHostiles();
```

### Role Implementation Example

```typescript
// Define harvester behavior
function harvesterBehavior(creep: Creep, ctx: CreepContext): CreepAction {
  const source = ctx.memory.sourceId 
    ? Game.getObjectById(ctx.memory.sourceId)
    : ctx.findSources()[0];
  
  if (!source) {
    return { type: "idle" };
  }
  
  if (creep.store.getFreeCapacity() > 0) {
    // Mine from source
    return { type: "harvest", target: source };
  } else {
    // Find nearby container
    const container = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: s => s.structureType === STRUCTURE_CONTAINER
    })[0] as StructureContainer | undefined;
    
    if (container) {
      return { type: "transfer", target: container, resourceType: RESOURCE_ENERGY };
    }
    
    // Drop on ground if no container
    return { type: "drop", resourceType: RESOURCE_ENERGY };
  }
}

// Register role
export const harvester = {
  behavior: harvesterBehavior,
  family: "economy" as const,
  priority: 100
};
```

## Performance Characteristics

### CPU Costs

| Operation | CPU Cost | Notes |
|-----------|----------|-------|
| Behavior evaluation | ~0.01-0.05 CPU | Per creep |
| Action execution | ~0.02-0.1 CPU | Depends on action type |
| State validation | ~0.005 CPU | Per creep |
| Context creation | ~0.01 CPU | Per creep |
| Opportunistic actions | ~0.01-0.02 CPU | Per creep |

### Memory Usage

- **Creep state**: ~50-100B per creep
- **Role memory**: ~50-200B per creep (depends on role)
- **Total per creep**: ~100-300B

### Cache Behavior

- Target lookups: Cached via `Game.getObjectById()`
- Path caching: Managed by Cartographer
- Closest target cache: Cleared on target errors (ERR_FULL, etc.)

## Configuration

### Environment Variables

None. Configuration is done via role definitions.

### Memory Schema

```typescript
interface CreepMemory {
  role: CreepRole;
  family: RoleFamily;
  state?: CreepState;
  homeRoom: string;
  sourceId?: Id<Source>;
  targetId?: Id<any>;
  squadId?: string;
  // Role-specific fields
}

interface CreepState {
  action: string;
  targetId?: Id<any>;
  targetPos?: { x: number; y: number; roomName: string };
  startTick: number;
  timeout: number;
}
```

### Tunable Parameters

**State Machine:**
```typescript
const DEFAULT_STATE_TIMEOUT = 25;  // State expires after 25 ticks
const DEPOSIT_COOLDOWN_THRESHOLD = 100;  // Deposit considered "full" if cooldown > 100
```

**Executor:**
```typescript
const PATH_COLORS = {  // Path visualization colors
  harvest: "#ffaa00",
  transfer: "#ffffff",
  build: "#ffffff",
  repair: "#ffff00",
  attack: "#ff0000",
  heal: "#00ff00"
};
```

## Examples

### Example 1: Simple Harvester Role

```typescript
import { runCreepWithState } from './behaviors/stateMachine';
import { createCreepContext } from './behaviors/context';

export function runHarvester(creep: Creep) {
  const ctx = createCreepContext(creep);
  
  const behavior = (creep: Creep, ctx: CreepContext): CreepAction => {
    // Get assigned source
    const source = Game.getObjectById(ctx.memory.sourceId);
    if (!source) {
      return { type: "idle" };
    }
    
    if (creep.store.getFreeCapacity() > 0) {
      // Harvest
      return { type: "harvest", target: source };
    } else {
      // Transfer to nearby container
      const container = source.pos.findInRange(FIND_STRUCTURES, 1, {
        filter: s => s.structureType === STRUCTURE_CONTAINER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      })[0] as StructureContainer;
      
      if (container) {
        return { type: "transfer", target: container, resourceType: RESOURCE_ENERGY };
      }
      
      return { type: "idle" };
    }
  };
  
  runCreepWithState(creep, behavior, ctx);
}
```

### Example 2: Multi-State Hauler Role

```typescript
export function runHauler(creep: Creep) {
  const ctx = createCreepContext(creep);
  
  const behavior = (creep: Creep, ctx: CreepContext): CreepAction => {
    const empty = creep.store.getUsedCapacity() === 0;
    const full = creep.store.getFreeCapacity() === 0;
    
    if (empty) {
      // State: Collect energy
      // Find nearest container with energy
      const container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
      }) as StructureContainer;
      
      if (container) {
        return { type: "withdraw", target: container, resourceType: RESOURCE_ENERGY };
      }
      
      // Fallback: Pick up dropped energy
      const dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
        filter: r => r.resourceType === RESOURCE_ENERGY
      });
      
      if (dropped) {
        return { type: "pickup", target: dropped };
      }
      
      return { type: "idle" };
    } else {
      // State: Deliver energy
      // Priority: Spawn > Extensions > Towers > Storage
      const targets = creep.room.find(FIND_MY_STRUCTURES, {
        filter: s => {
          if (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) {
            return s.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
          }
          if (s.structureType === STRUCTURE_TOWER) {
            return s.store[RESOURCE_ENERGY] < 500; // Only fill if < 500
          }
          if (s.structureType === STRUCTURE_STORAGE) {
            return s.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
          }
          return false;
        }
      });
      
      // Find closest target
      const target = creep.pos.findClosestByRange(targets);
      
      if (target) {
        return { type: "transfer", target, resourceType: RESOURCE_ENERGY };
      }
      
      return { type: "idle" };
    }
  };
  
  runCreepWithState(creep, behavior, ctx);
}
```

### Example 3: Guard Role with Combat Logic

```typescript
export function runGuard(creep: Creep) {
  const ctx = createCreepContext(creep);
  
  const behavior = (creep: Creep, ctx: CreepContext): CreepAction => {
    // Find hostiles in room
    const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
    
    if (hostiles.length === 0) {
      // No threats, move to rally point
      const rallyPoint = ctx.memory.rallyPoint;
      if (rallyPoint) {
        const pos = new RoomPosition(rallyPoint.x, rallyPoint.y, rallyPoint.roomName);
        return { type: "move", target: pos };
      }
      return { type: "idle" };
    }
    
    // Find closest hostile
    const target = creep.pos.findClosestByRange(hostiles);
    if (!target) return { type: "idle" };
    
    // If injured, retreat while attacking
    if (creep.hits < creep.hitsMax * 0.5) {
      const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
      if (spawn) {
        // Move toward spawn while attacking
        return { type: "attack", target, fallbackMove: spawn.pos };
      }
    }
    
    // Normal attack
    return { type: "attack", target };
  };
  
  runCreepWithState(creep, behavior, ctx);
}
```

### Example 4: Upgrader with Pheromone Awareness

```typescript
export function runUpgrader(creep: Creep) {
  const ctx = createCreepContext(creep);
  
  const behavior = (creep: Creep, ctx: CreepContext): CreepAction => {
    const controller = creep.room.controller;
    if (!controller) return { type: "idle" };
    
    const empty = creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0;
    
    if (empty) {
      // Check upgrade pheromone level
      const upgradePheromone = ctx.pheromones.upgrade || 0;
      
      // If upgrade pheromone is low, consider other tasks
      if (upgradePheromone < 0.3) {
        // Help with building instead
        const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (constructionSites.length > 0) {
          const storage = creep.room.storage;
          if (storage && storage.store[RESOURCE_ENERGY] > 0) {
            return { type: "withdraw", target: storage, resourceType: RESOURCE_ENERGY };
          }
        }
      }
      
      // Default: Get energy from storage
      const storage = creep.room.storage;
      if (storage && storage.store[RESOURCE_ENERGY] > 0) {
        return { type: "withdraw", target: storage, resourceType: RESOURCE_ENERGY };
      }
      
      return { type: "idle" };
    } else {
      // Upgrade controller
      return { type: "upgrade", target: controller };
    }
  };
  
  runCreepWithState(creep, behavior, ctx);
}
```

### Example 5: Role with Opportunistic Actions

```typescript
// Opportunistic actions are automatically applied by the executor
// No special code needed in behavior function

export function runBuilder(creep: Creep) {
  const ctx = createCreepContext(creep);
  
  const behavior = (creep: Creep, ctx: CreepContext): CreepAction => {
    const empty = creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0;
    
    if (empty) {
      const storage = creep.room.storage;
      if (storage && storage.store[RESOURCE_ENERGY] > 0) {
        return { type: "withdraw", target: storage, resourceType: RESOURCE_ENERGY };
      }
      return { type: "idle" };
    } else {
      const site = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
      if (site) {
        return { type: "build", target: site };
      }
      return { type: "idle" };
    }
  };
  
  runCreepWithState(creep, behavior, ctx);
  
  // Opportunistic actions applied automatically:
  // - Pick up dropped resources while moving
  // - Transfer to spawn if < 300 energy and passing by
  // - Repair structures in passing (if WORK parts available)
}
```

## Testing

### Test Coverage

- **Executor**: Unit tests for all action types, error handling
- **State Machine**: Unit tests for state validation, completion detection
- **Context**: Unit tests for helper functions
- **Roles**: Integration tests for complete role behaviors

### Running Tests

```bash
# Run all role tests
npm run test:unit -- --grep "role|behavior|executor|state"

# Run specific test suite
npm run test:unit -- packages/screeps-bot/test/unit/executor.test.ts
```

## Troubleshooting

### Issue: Creeps appearing idle

**Symptoms**: Creeps not doing anything, standing still

**Causes:**
1. Behavior returning `{ type: "idle" }`
2. No valid targets found
3. State not being cleared on errors
4. Invalid state persisting

**Solutions:**
1. Add logging: Check what action behavior is returning
2. Verify targets exist: `console.log(Game.getObjectById(targetId))`
3. Ensure executor clears state on errors
4. Check state timeout: reduce from 25 to 10 ticks

### Issue: Creeps switching tasks too frequently

**Symptoms**: Creeps change targets every tick

**Causes:**
1. State not being persisted
2. State validation failing
3. Timeout too short
4. Target selection not stable

**Solutions:**
1. Check `creep.memory.state` exists after behavior runs
2. Verify state validity logic
3. Increase timeout: 25 → 50 ticks
4. Add stability: only switch if new target significantly better

### Issue: Creeps stuck trying invalid action

**Symptoms**: Creeps repeatedly try action that returns error

**Causes:**
1. Executor not clearing state on errors
2. Error code not handled
3. Behavior not checking target validity

**Solutions:**
1. Ensure executor handles ERR_FULL, ERR_NOT_ENOUGH_RESOURCES, etc.
2. Add error handling for specific action types
3. Add target validation in behavior: check `target.store.getFreeCapacity() > 0`

### Issue: Haulers not filling extensions efficiently

**Symptoms**: Haulers return to storage before filling all extensions

**Causes:**
1. State cleared prematurely (before creep empty)
2. Extensions filling from other sources
3. Not enough CARRY capacity

**Solutions:**
1. Check completion detection: only clear when `creep.store.getUsedCapacity() === 0`
2. Handle ERR_FULL gracefully: find next extension same tick
3. Increase hauler size: more CARRY parts

### Issue: Guards not responding to threats

**Symptoms**: Guards idle while hostiles in room

**Causes:**
1. Hostile detection failing
2. Rally point too far from hostiles
3. Guard spawn priority too low
4. Pheromone.defense not updating

**Solutions:**
1. Check `room.find(FIND_HOSTILE_CREEPS)` returns hostiles
2. Update rally point when hostiles detected
3. Increase guard priority when `pheromones.defense > 0.5`
4. Ensure pheromone updates on hostile detection

### Issue: Opportunistic actions interfering

**Symptoms**: Creeps doing unexpected actions, not completing primary task

**Causes:**
1. Opportunistic actions too aggressive
2. Wrong action type returned
3. State not preserved correctly

**Solutions:**
1. Reduce opportunistic action frequency
2. Verify opportunistic logic: only apply during movement
3. Ensure state persists across opportunistic actions

## Related Documentation

- [ROADMAP.md](../../../../ROADMAP.md) - Section 5: Creep-/Squad-Ebene, Section 9: Rollenlogik
- [Spawning Subsystem](../spawning/README.md) - Role definitions and spawning
- [Core Subsystem](../core/README.md) - Process scheduling for role execution
- [Memory Subsystem](../memory/README.md) - CreepMemory and CreepState schemas
- [Clusters Subsystem](../clusters/README.md) - Squad coordination
