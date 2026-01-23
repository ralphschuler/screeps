# Role System Developer Guide

## Overview

The Role System is the foundation of creep behavior in this Screeps bot. It provides a framework for defining, assigning, and executing creep roles using a behavior-based architecture with state machines.

**Key Principles:**
- **Declarative Configuration**: Roles are defined as simple configurations
- **Behavior-Based**: Roles use behavior functions that evaluate context and return actions
- **State Machine Integration**: Actions persist across ticks to prevent thrashing
- **Type-Safe**: Full TypeScript support with strict typing
- **CPU Efficient**: Cached target finding and lazy evaluation

## Table of Contents

1. [Architecture](#architecture)
2. [Role Definition](#role-definition)
3. [Creating Custom Roles](#creating-custom-roles)
4. [Behavior Functions](#behavior-functions)
5. [State Machines](#state-machines)
6. [Role Assignment](#role-assignment)
7. [Built-in Roles](#built-in-roles)
8. [Advanced Patterns](#advanced-patterns)
9. [Troubleshooting](#troubleshooting)

---

## Architecture

### Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Game Tick Start                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           1. Context Creation (BehaviorContext)          │
│  • Gather creep state (energy, hits, position)          │
│  • Find nearby objects (sources, hostiles, structures)   │
│  • Read memory state (working flag, targetId, etc.)     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              2. Behavior Evaluation                      │
│  • Call role's behavior function                        │
│  • Evaluate current situation                           │
│  • Decide on action to take                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              3. State Machine Check                      │
│  • Check if action is already in progress               │
│  • Verify action is still valid                         │
│  • Update or continue current state                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              4. Action Execution                         │
│  • Execute the decided action                           │
│  • Handle movement, harvest, transfer, etc.             │
│  • Return result code                                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    Game Tick End                         │
└─────────────────────────────────────────────────────────┘
```

### Core Components

**1. Role Definition** (`roleDefinitions.ts`)
- Configuration object defining role properties
- Body part templates
- Spawn priority
- CPU budget

**2. Behavior Function** (`src/roles/*/index.ts`)
- Evaluates context and returns an action
- Pure function (no side effects)
- Returns `BehaviorAction` object

**3. State Machine** (`src/roles/stateMachine.ts`)
- Persists action across ticks
- Prevents action thrashing
- Validates completion

**4. Executor** (`src/roles/executor.ts`)
- Executes the action on the creep
- Handles movement, harvesting, building, etc.
- Returns Screeps error codes

---

## Role Definition

### Basic Structure

```typescript
import { RoleDefinition } from "./types";

export const harvesterRole: RoleDefinition = {
  // Unique identifier
  name: "harvester",
  
  // Display name for UI
  displayName: "Harvester",
  
  // Body part templates by RCL
  bodyTemplates: {
    1: [WORK, WORK, MOVE, CARRY],
    2: [WORK, WORK, WORK, MOVE, CARRY],
    3: [WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY],
    // ... up to RCL 8
  },
  
  // Spawn priority (higher = more important)
  spawnPriority: 100,
  
  // Maximum count per room
  maxPerRoom: 2,
  
  // CPU budget per creep per tick
  cpuBudget: 0.05,
  
  // Behavior function
  behavior: harvesterBehavior,
  
  // Optional: Minimum RCL required
  minRCL: 1,
  
  // Optional: Memory initialization
  initMemory: (memory) => {
    memory.working = false;
    memory.sourceId = null;
  }
};
```

### Body Templates

Body templates define creep composition at different RCL levels:

```typescript
bodyTemplates: {
  // Early game - minimal viable
  1: [WORK, WORK, MOVE, CARRY],
  
  // Mid game - balanced
  4: [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, CARRY, CARRY],
  
  // Late game - optimized
  8: [
    WORK, WORK, WORK, WORK, WORK, WORK, WORK,
    MOVE, MOVE, MOVE, MOVE,
    CARRY, CARRY
  ]
}
```

**Best Practices:**
- Start small at RCL 1-2 (limited energy)
- Scale up at RCL 3-4 (more extensions)
- Optimize at RCL 5+ (consider roads, containers)
- Use MOVE:CARRY:WORK ratios appropriate for role
  - Haulers: 1:2 (MOVE:CARRY) for roads
  - Harvesters: 5:1 (WORK:MOVE) stationary
  - Builders: 1:1:1 (MOVE:CARRY:WORK) balanced

---

## Creating Custom Roles

### Step 1: Define the Role Interface

```typescript
// src/roles/custom/myRole.ts

interface MyRoleMemory extends CreepMemory {
  working: boolean;
  targetId?: Id<Structure>;
  customState?: string;
}
```

### Step 2: Create the Behavior Function

```typescript
import { BehaviorContext, BehaviorAction } from "../types";

export function myRoleBehavior(ctx: BehaviorContext): BehaviorAction {
  const creep = ctx.creep;
  const memory = creep.memory as MyRoleMemory;
  
  // State: Empty -> Fill -> Work -> Empty
  if (!memory.working && creep.store.getFreeCapacity() === 0) {
    memory.working = true;
  }
  if (memory.working && creep.store.getUsedCapacity() === 0) {
    memory.working = false;
  }
  
  // Working state: Do the job
  if (memory.working) {
    // Find target
    const target = findMyTarget(ctx);
    if (!target) {
      return { type: "idle" };
    }
    
    // Execute action
    return {
      type: "transfer",
      target: target,
      resourceType: RESOURCE_ENERGY
    };
  }
  
  // Filling state: Get energy
  else {
    // Find energy source
    const source = findEnergySource(ctx);
    if (!source) {
      return { type: "idle" };
    }
    
    if (source instanceof Source) {
      return { type: "harvest", target: source };
    } else {
      return { 
        type: "withdraw",
        target: source,
        resourceType: RESOURCE_ENERGY
      };
    }
  }
}

function findMyTarget(ctx: BehaviorContext): Structure | null {
  // Use cached finding for performance
  const cached = ctx.getCached("myTarget", 10);
  if (cached) return cached;
  
  // Find new target
  const targets = ctx.room.find(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_SPAWN && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  });
  
  if (targets.length === 0) return null;
  
  const target = ctx.creep.pos.findClosestByPath(targets);
  ctx.setCache("myTarget", target, 10);
  return target;
}

function findEnergySource(ctx: BehaviorContext): Source | Structure | null {
  // Check for dropped resources first
  const dropped = ctx.droppedResources.filter(r => r.resourceType === RESOURCE_ENERGY);
  if (dropped.length > 0) {
    return ctx.creep.pos.findClosestByPath(dropped);
  }
  
  // Check containers
  const containers = ctx.room.find(FIND_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_CONTAINER && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
  });
  if (containers.length > 0) {
    return ctx.creep.pos.findClosestByPath(containers);
  }
  
  // Fall back to sources
  if (ctx.sources.length > 0) {
    return ctx.creep.pos.findClosestByPath(ctx.sources);
  }
  
  return null;
}
```

### Step 3: Register the Role

```typescript
// src/roles/custom/index.ts

export const myRole: RoleDefinition = {
  name: "myRole",
  displayName: "My Custom Role",
  bodyTemplates: {
    1: [WORK, CARRY, MOVE],
    3: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
    5: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
  },
  spawnPriority: 50,
  maxPerRoom: 5,
  cpuBudget: 0.03,
  behavior: myRoleBehavior,
  initMemory: (memory) => {
    (memory as MyRoleMemory).working = false;
  }
};

// Register in roleDefinitions.ts
import { myRole } from "./custom";

export const allRoles: RoleDefinition[] = [
  harvesterRole,
  haulerRole,
  myRole, // Add your role here
  // ... other roles
];
```

### Step 4: Spawn the Role

```typescript
// The spawn system will automatically spawn your role based on:
// - spawnPriority (higher spawns first when energy available)
// - maxPerRoom (won't exceed this count)
// - Room needs (evaluated by spawn queue)

// Manual spawning (for testing):
Game.spawns['Spawn1'].spawnCreep(
  myRole.bodyTemplates[3], // Use RCL 3 body
  'MyRole_' + Game.time,
  { memory: { role: 'myRole', working: false } }
);
```

---

## Behavior Functions

### Context Object

The `BehaviorContext` provides everything a behavior needs to make decisions:

```typescript
interface BehaviorContext {
  // Core objects
  creep: Creep;
  room: Room;
  homeRoom: string;
  
  // Common finds (cached)
  sources: Source[];
  minerals: Mineral[];
  droppedResources: Resource[];
  constructionSites: ConstructionSite[];
  damagedStructures: Structure[];
  hostiles: Creep[];
  allies: Creep[];
  
  // Structure categories
  spawnStructures: (StructureSpawn | StructureExtension)[];
  storageStructures: (StructureStorage | StructureContainer)[];
  defenseStructures: (StructureTower | StructureRampart | StructureWall)[];
  
  // State flags
  isEmpty: boolean;
  isFull: boolean;
  isInjured: boolean;
  nearbyEnemies: boolean;
  
  // Helper methods
  getCached<T>(key: string, ttl: number): T | null;
  setCache<T>(key: string, value: T, ttl: number): void;
  findClosest<T extends RoomObject>(objects: T[]): T | null;
}
```

### Action Types

Behaviors return action objects that describe what the creep should do:

```typescript
type BehaviorAction =
  // Movement
  | { type: "moveTo"; target: RoomPosition | RoomObject }
  | { type: "moveToRoom"; roomName: string }
  | { type: "flee"; from: RoomPosition[] }
  
  // Resource gathering
  | { type: "harvest"; target: Source | Mineral | Deposit }
  | { type: "withdraw"; target: Structure; resourceType: ResourceConstant }
  | { type: "pickup"; target: Resource }
  
  // Resource delivery
  | { type: "transfer"; target: Structure | Creep; resourceType: ResourceConstant }
  | { type: "drop"; resourceType: ResourceConstant; amount?: number }
  
  // Construction
  | { type: "build"; target: ConstructionSite }
  | { type: "repair"; target: Structure }
  | { type: "dismantle"; target: Structure }
  
  // Controller
  | { type: "upgrade"; target: StructureController }
  | { type: "claim"; target: StructureController }
  | { type: "reserve"; target: StructureController }
  
  // Combat
  | { type: "attack"; target: Creep | Structure }
  | { type: "rangedAttack"; target: Creep | Structure }
  | { type: "heal"; target: Creep }
  | { type: "rangedHeal"; target: Creep }
  
  // Special
  | { type: "idle" }
  | { type: "suicide" };
```

### Example: Advanced Behavior

```typescript
export function advancedHaulerBehavior(ctx: BehaviorContext): BehaviorAction {
  const creep = ctx.creep;
  const memory = creep.memory as HaulerMemory;
  
  // Safety: Flee from hostiles
  if (ctx.nearbyEnemies) {
    const dangerousHostiles = ctx.hostiles.filter(h =>
      creep.pos.getRangeTo(h) <= 5 &&
      (h.getActiveBodyparts(ATTACK) > 0 || h.getActiveBodyparts(RANGED_ATTACK) > 0)
    );
    
    if (dangerousHostiles.length > 0) {
      return { type: "flee", from: dangerousHostiles.map(h => h.pos) };
    }
  }
  
  // State management
  if (!memory.working && ctx.isFull) {
    memory.working = true;
    delete memory.sourceId;
    delete memory.targetId;
  }
  if (memory.working && ctx.isEmpty) {
    memory.working = false;
    delete memory.sourceId;
    delete memory.targetId;
  }
  
  // Working: Deliver energy
  if (memory.working) {
    // Priority 1: Spawns and extensions
    const spawnTargets = ctx.spawnStructures.filter(s =>
      s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    );
    if (spawnTargets.length > 0) {
      const closest = ctx.findClosest(spawnTargets);
      if (closest) {
        return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
      }
    }
    
    // Priority 2: Towers below 500 energy
    const towers = ctx.defenseStructures
      .filter(s => s.structureType === STRUCTURE_TOWER)
      .filter(s => (s as StructureTower).store.getUsedCapacity(RESOURCE_ENERGY) < 500);
    if (towers.length > 0) {
      const closest = ctx.findClosest(towers);
      if (closest) {
        return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
      }
    }
    
    // Priority 3: Storage
    if (ctx.room.storage && ctx.room.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      return { type: "transfer", target: ctx.room.storage, resourceType: RESOURCE_ENERGY };
    }
    
    // No targets, idle
    return { type: "idle" };
  }
  
  // Not working: Collect energy
  else {
    // Priority 1: Dropped resources (> 50 energy to justify trip)
    const largeDropped = ctx.droppedResources.filter(r =>
      r.resourceType === RESOURCE_ENERGY && r.amount > 50
    );
    if (largeDropped.length > 0) {
      const closest = ctx.findClosest(largeDropped);
      if (closest) {
        return { type: "pickup", target: closest };
      }
    }
    
    // Priority 2: Containers with energy
    const containers = ctx.storageStructures
      .filter(s => s.structureType === STRUCTURE_CONTAINER)
      .filter(s => s.store.getUsedCapacity(RESOURCE_ENERGY) > 0);
    if (containers.length > 0) {
      const closest = ctx.findClosest(containers);
      if (closest) {
        return { type: "withdraw", target: closest, resourceType: RESOURCE_ENERGY };
      }
    }
    
    // Priority 3: Storage (if exists and has surplus)
    if (ctx.room.storage && ctx.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 10000) {
      return { type: "withdraw", target: ctx.room.storage, resourceType: RESOURCE_ENERGY };
    }
    
    // Last resort: Harvest from source
    if (ctx.sources.length > 0) {
      const source = ctx.findClosest(ctx.sources);
      if (source) {
        return { type: "harvest", target: source };
      }
    }
    
    // Nothing to do
    return { type: "idle" };
  }
}
```

---

## State Machines

### How State Machines Work

State machines prevent "action thrashing" where a creep changes its mind every tick:

```typescript
// WITHOUT state machine:
// Tick 100: Decided to build site A
// Tick 101: Site A is 1 tile away, decided to build site B instead (closer)
// Tick 102: Site B is 1 tile away, decided to build site A again
// Result: Creep wastes CPU and never builds anything

// WITH state machine:
// Tick 100: Decided to build site A, committed to state
// Tick 101-110: Continue building site A (state persists)
// Tick 111: Site A complete, state cleared, re-evaluate
// Result: Site A built efficiently
```

### State Lifecycle

```
┌─────────────┐
│   No State  │
└──────┬──────┘
       │ Behavior evaluates and returns action
       ▼
┌─────────────┐
│ State Start │ ← New state created, action committed
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Executing  │ ← State persists, action continues
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Complete?  │
└──────┬──────┘
       │
       ├─ Yes ──→ Clear state, re-evaluate
       │
       └─ No ───→ Continue executing
```

### State Completion Rules

Different actions complete under different conditions:

```typescript
// Collection actions: Complete when full OR target gone
{
  type: "harvest",
  completeWhen: () => creep.store.getFreeCapacity() === 0 || !target.exists()
}

// Delivery actions: Complete when empty OR target full/gone
{
  type: "transfer",
  completeWhen: () => creep.store.getUsedCapacity() === 0 || !target.canReceive()
}

// Movement actions: Complete when in range
{
  type: "moveTo",
  completeWhen: () => creep.pos.getRangeTo(target) <= 1
}

// Build actions: Complete when empty OR site done
{
  type: "build",
  completeWhen: () => creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0 || !site.exists()
}
```

### Forcing State Changes

Sometimes you need to override the state machine:

```typescript
export function emergencyBehavior(ctx: BehaviorContext): BehaviorAction {
  const creep = ctx.creep;
  
  // ALWAYS flee if hostile nearby, ignore current state
  if (ctx.nearbyEnemies) {
    // Clear state to force immediate action change
    delete creep.memory._state;
    return { type: "flee", from: ctx.hostiles.map(h => h.pos) };
  }
  
  // Otherwise, normal behavior...
}
```

---

## Role Assignment

### Automatic Assignment

The spawn system automatically assigns roles based on:

1. **Room Needs Analysis**: Evaluates what the room lacks
2. **Spawn Priority**: Higher priority roles spawn first
3. **Max Count**: Won't exceed `maxPerRoom` limit
4. **Energy Available**: Spawns largest affordable body

```typescript
// This happens automatically in SpawnManager
class SpawnManager {
  analyzeRoomNeeds(room: Room): RoleSpawnRequest[] {
    const requests: RoleSpawnRequest[] = [];
    
    // Count existing creeps by role
    const counts = this.countCreepsByRole(room);
    
    // For each role definition
    for (const roleDef of allRoles) {
      const current = counts[roleDef.name] || 0;
      const needed = this.calculateNeeded(room, roleDef);
      
      if (current < needed) {
        requests.push({
          role: roleDef.name,
          priority: roleDef.spawnPriority,
          count: needed - current
        });
      }
    }
    
    // Sort by priority
    return requests.sort((a, b) => b.priority - a.priority);
  }
}
```

### Manual Assignment

You can manually assign roles for special cases:

```typescript
// Spawn a specific role immediately
const spawn = Game.spawns['Spawn1'];
const role = getRoleDefinition('hauler');
const body = role.bodyTemplates[room.controller.level];

spawn.spawnCreep(body, 'Hauler_' + Game.time, {
  memory: {
    role: 'hauler',
    homeRoom: room.name,
    working: false
  }
});

// Change existing creep's role (rare, but possible)
const creep = Game.creeps['Worker1'];
creep.memory.role = 'builder'; // Will use builder behavior next tick
delete creep.memory._state; // Clear state to prevent conflicts
```

### Dynamic Role Switching

Some advanced patterns use dynamic role switching:

```typescript
// Example: Flexible worker that changes role based on needs
export function flexibleWorkerBehavior(ctx: BehaviorContext): BehaviorAction {
  const room = ctx.room;
  
  // Decide what role to act as this tick
  let effectiveRole = 'upgrader'; // default
  
  if (room.find(FIND_CONSTRUCTION_SITES).length > 5) {
    effectiveRole = 'builder';
  } else if (room.energyAvailable < room.energyCapacityAvailable * 0.5) {
    effectiveRole = 'hauler';
  }
  
  // Use that role's behavior
  const roleDef = getRoleDefinition(effectiveRole);
  return roleDef.behavior(ctx);
}
```

---

## Built-in Roles

### Economy Roles

#### Harvester (Static Miner)
- **Purpose**: Harvest energy from sources continuously
- **Body**: Heavy WORK parts, minimal MOVE/CARRY
- **Behavior**: Stay at source, harvest, transfer to container/link
- **Count**: 1-2 per source
- **Priority**: 100 (critical)

```typescript
// Example usage
const harvesters = _.filter(Game.creeps, c => c.memory.role === 'harvester');
console.log(`Active harvesters: ${harvesters.length}`);
```

#### Hauler (Carrier)
- **Purpose**: Transport energy from sources to consumers
- **Body**: Heavy CARRY parts, balanced MOVE
- **Behavior**: Collect from containers/storage, deliver to spawns/towers
- **Count**: 2-4 per room (scales with economy)
- **Priority**: 95 (high)

#### Builder
- **Purpose**: Construct buildings and repair structures
- **Body**: Balanced WORK/CARRY/MOVE
- **Behavior**: Build construction sites, repair damaged structures
- **Count**: 1-3 (more during expansion)
- **Priority**: 60 (medium)

#### Upgrader
- **Purpose**: Upgrade room controller
- **Body**: Heavy WORK parts for RCL progress
- **Behavior**: Collect energy, upgrade controller continuously
- **Count**: 2-6 (scales with energy surplus)
- **Priority**: 50 (medium)

### Military Roles

#### Guard
- **Purpose**: Defend room from invaders
- **Body**: ATTACK/MOVE or RANGED_ATTACK/MOVE
- **Behavior**: Patrol room, attack hostiles
- **Count**: 0-4 (scales with threat level)
- **Priority**: 90 (high when threatened)

#### Healer
- **Purpose**: Support military units with healing
- **Body**: HEAL/MOVE
- **Behavior**: Follow and heal damaged allies
- **Count**: 0-2 (spawns with military squads)
- **Priority**: 85 (high during combat)

#### RemoteGuard
- **Purpose**: Defend remote mining operations
- **Body**: Balanced ATTACK/RANGED_ATTACK/MOVE
- **Behavior**: Patrol remote rooms, defend miners
- **Count**: 0-2 per remote room
- **Priority**: 70 (medium-high)

### Utility Roles

#### Scout
- **Purpose**: Explore and gather intelligence
- **Body**: Pure MOVE (fast and cheap)
- **Behavior**: Visit rooms, record intel, update visibility
- **Count**: 1-2 (continuous exploration)
- **Priority**: 40 (low)

#### Claimer
- **Purpose**: Claim or reserve controllers
- **Body**: CLAIM/MOVE
- **Behavior**: Travel to target room, claim/reserve controller
- **Count**: 0-1 (spawned on-demand)
- **Priority**: 80 (high when expanding)

### Advanced Roles

See [remote-mining.md](./docs/roles/remote-mining.md) and [offensive-roles.md](./docs/roles/offensive-roles.md) for detailed documentation on:
- RemoteHarvester
- RemoteHauler
- Soldier
- Ranger
- Siege

---

## Advanced Patterns

### Multi-Stage Behaviors

Complex roles can use multiple behavior stages:

```typescript
interface MultiStageMemory extends CreepMemory {
  stage: 'collect' | 'process' | 'deliver';
  processTarget?: Id<Structure>;
}

export function multiStageBehavior(ctx: BehaviorContext): BehaviorAction {
  const memory = ctx.creep.memory as MultiStageMemory;
  
  // Initialize stage
  if (!memory.stage) {
    memory.stage = 'collect';
  }
  
  switch (memory.stage) {
    case 'collect':
      if (ctx.isFull) {
        memory.stage = 'process';
        return collectBehavior(ctx);
      }
      return collectBehavior(ctx);
      
    case 'process':
      // Do some processing (lab, factory, etc.)
      if (processingComplete(ctx)) {
        memory.stage = 'deliver';
      }
      return processBehavior(ctx);
      
    case 'deliver':
      if (ctx.isEmpty) {
        memory.stage = 'collect';
      }
      return deliverBehavior(ctx);
  }
}
```

### Squad Coordination

Roles can coordinate using memory flags:

```typescript
interface SquadMemory extends CreepMemory {
  squadId: string;
  formation: 'tank' | 'dps' | 'healer';
}

export function squadMemberBehavior(ctx: BehaviorContext): BehaviorAction {
  const memory = ctx.creep.memory as SquadMemory;
  const squad = getSquad(memory.squadId);
  
  // Wait for full squad
  if (!squad.isReady()) {
    return { type: "moveTo", target: squad.rallyPoint };
  }
  
  // Execute squad tactics based on formation
  switch (memory.formation) {
    case 'tank':
      return tankBehavior(ctx, squad);
    case 'dps':
      return dpsBehavior(ctx, squad);
    case 'healer':
      return healerBehavior(ctx, squad);
  }
}
```

### Conditional Body Parts

Adjust behavior based on body composition:

```typescript
export function adaptiveBehavior(ctx: BehaviorContext): BehaviorAction {
  const creep = ctx.creep;
  
  // Check capabilities
  const canHarvest = creep.getActiveBodyparts(WORK) > 0;
  const canAttack = creep.getActiveBodyparts(ATTACK) > 0;
  const canHeal = creep.getActiveBodyparts(HEAL) > 0;
  
  // Prioritize actions based on body
  if (ctx.nearbyEnemies && canAttack) {
    // Combat mode
    const target = ctx.findClosest(ctx.hostiles);
    return { type: "attack", target };
  }
  
  if (ctx.isInjured && canHeal) {
    // Self-heal
    return { type: "heal", target: creep };
  }
  
  if (canHarvest && ctx.sources.length > 0) {
    // Harvest mode
    const source = ctx.findClosest(ctx.sources);
    return { type: "harvest", target: source };
  }
  
  return { type: "idle" };
}
```

---

## Troubleshooting

### Common Issues

#### Issue: Creep Not Spawning

**Symptoms**: Role defined but creeps never spawn

**Solutions**:
1. Check spawn priority - low priority may be starved
2. Verify `maxPerRoom` isn't already reached
3. Ensure body template exists for current RCL
4. Check if room has enough energy for body parts

```typescript
// Debug spawn queue
console.log(JSON.stringify(spawn.room.memory.spawnQueue));

// Check role counts
const counts = _.countBy(Game.creeps, c => c.memory.role);
console.log(JSON.stringify(counts));
```

#### Issue: Creep Thrashing (Changing Actions Every Tick)

**Symptoms**: Creep moves back and forth, never completing actions

**Solutions**:
1. Ensure state machine is enabled
2. Check completion conditions are correct
3. Verify behavior isn't clearing state manually
4. Add logging to track state changes

```typescript
// Add to behavior
console.log(`${creep.name} state: ${creep.memory._state?.type || 'none'}`);
```

#### Issue: High CPU Usage

**Symptoms**: Role exceeds CPU budget consistently

**Solutions**:
1. Add caching for expensive finds
2. Reduce pathfinding frequency
3. Use simpler body templates
4. Batch operations across multiple ticks

```typescript
// Cache expensive finds
const cached = ctx.getCached('expensiveFind', 20); // Cache for 20 ticks
if (!cached) {
  const result = expensiveFindOperation();
  ctx.setCache('expensiveFind', result, 20);
  return result;
}
return cached;
```

#### Issue: Role Behavior Not Executing

**Symptoms**: Creep exists but does nothing

**Solutions**:
1. Verify role name matches registration
2. Check behavior function is exported
3. Ensure no errors in behavior code
4. Verify creep memory has role set

```typescript
// Check creep state
const creep = Game.creeps['MyCreep'];
console.log(`Role: ${creep.memory.role}`);
console.log(`Behavior: ${getRoleDefinition(creep.memory.role)?.behavior.name}`);
```

### Performance Optimization

#### Cache Aggressively

```typescript
// Bad: Find every tick
const sites = room.find(FIND_CONSTRUCTION_SITES);

// Good: Cache for 10 ticks
const sites = ctx.getCached('constructionSites', 10) ||
  ctx.setCache('constructionSites', room.find(FIND_CONSTRUCTION_SITES), 10);
```

#### Use Appropriate Find Intervals

```typescript
// High frequency (every tick): Critical safety checks
if (ctx.nearbyEnemies) { /* flee */ }

// Medium frequency (5-10 ticks): Target finding
if (Game.time % 5 === 0) {
  memory.targetId = findNewTarget();
}

// Low frequency (20+ ticks): Strategic planning
if (Game.time % 20 === 0) {
  updateRoleStrategy();
}
```

#### Minimize Pathfinding

```typescript
// Bad: Calculate path every tick
creep.moveTo(target);

// Good: Reuse path for multiple ticks
creep.moveTo(target, { reusePath: 10 });

// Better: Cache complete path
if (!memory.path || memory.pathTarget !== target.id) {
  memory.path = creep.pos.findPathTo(target);
  memory.pathTarget = target.id;
}
creep.moveByPath(memory.path);
```

---

## Related Documentation

- [State Machines Guide](./state-machines.md) - Deep dive into state machine architecture
- [Kernel Guide](./kernel.md) - CPU budgets and process scheduling
- [Memory Guide](./memory.md) - Memory management for role data
- [Economy Guide](./economy.md) - Economy role integration
- [Defense Guide](./defense.md) - Military role coordination

---

## API Reference

### Role Definition

```typescript
interface RoleDefinition {
  name: string;
  displayName: string;
  bodyTemplates: { [rcl: number]: BodyPartConstant[] };
  spawnPriority: number;
  maxPerRoom: number;
  cpuBudget: number;
  behavior: (ctx: BehaviorContext) => BehaviorAction;
  minRCL?: number;
  initMemory?: (memory: CreepMemory) => void;
}
```

### Behavior Context

See [BehaviorContext Interface](#context-object) for complete reference.

### Behavior Action

See [Action Types](#action-types) for all available actions.

---

## Examples Repository

Find complete example roles in:
- `packages/screeps-bot/src/roles/economy/` - Economy roles
- `packages/screeps-bot/src/roles/military/` - Military roles
- `packages/screeps-bot/src/roles/utility/` - Utility roles
- `docs/roles/` - Additional documentation and guides

---

**Last Updated**: 2025-01-23  
**Maintainer**: Screeps Bot Team  
**Related Issues**: #5, #26, #30
