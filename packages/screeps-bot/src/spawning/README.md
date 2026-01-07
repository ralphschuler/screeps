# Spawning Subsystem

## Overview

The spawning subsystem manages all creep spawning operations, including priority calculation, body part optimization, queue management, and multi-spawn coordination. It dynamically adjusts spawn priorities based on room posture, pheromone levels, and threat conditions.

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│              Spawn Coordinator                          │
│  - Multi-spawn coordination                             │
│  - Emergency detection                                  │
│  - Queue processing                                     │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴────────┬──────────────┬──────────────┐
    │                 │              │              │
┌───▼───────┐  ┌─────▼──────┐  ┌───▼─────┐  ┌────▼─────────┐
│ Priority  │  │    Body    │  │  Queue  │  │   Defender   │
│Calculator │  │ Optimizer  │  │ Manager │  │   Manager    │
│ Posture   │  │ WORK/CARRY │  │Priority │  │  Boost Calc  │
│Pheromones │  │MOVE Ratios │  │Multi-Sp │  │              │
└───────────┘  └────────────┘  └─────────┘  └──────────────┘
```

### Core Components

#### 1. **Spawn Coordinator** (`spawnCoordinator.ts`)
Central orchestration for all spawning operations.

**Key Features:**
- Multi-spawn coordination (distributes tasks across available spawns)
- Emergency detection (workforce collapse, no energy producers)
- Queue processing and spawn execution
- Spawn conflict resolution

**Emergency Detection:**
- No harvesters alive
- Energy income critically low
- Spawn energy running out with no income

#### 2. **Spawn Priority Calculator** (`spawnPriority.ts`)
Calculates dynamic spawn priorities based on room state.

**Key Features:**
- Posture-based weight multipliers (eco, expand, defensive, war, siege, evacuate, nukePrep)
- Pheromone-influenced priorities
- Dynamic threat response
- Focus room priority boosts

**Priority Factors:**
- **Posture**: Room's strategic stance (eco: +50% harvesters, war: +150% guards)
- **Pheromones**: Swarm signals (defense↑ → guards↑, harvest↑ → harvesters↑)
- **Threats**: Hostile presence triggers defender priority boost
- **Focus Rooms**: Designated rooms get +40 upgrader priority

#### 3. **Body Optimizer** (`bodyOptimizer.ts`)
Generates optimal body compositions based on role, energy, and conditions.

**Key Features:**
- Role-specific optimization (harvesters, haulers, soldiers, etc.)
- Energy-constrained body generation
- Movement optimization (roads vs off-road)
- Boost-aware body generation
- Distance-based hauler dimensioning

**Optimization Principles:**
- **Harvesters**: 5 WORK = 10 energy/tick (optimal for 3000 energy source)
- **Haulers**: CARRY parts scaled by distance and energy rate
- **Movement**: 1:1 ratio off-road, 1:2 on roads (when fully loaded)
- **Combat**: Balance ATTACK/RANGED_ATTACK/HEAL with TOUGH and MOVE

#### 4. **Spawn Queue Manager** (`spawnQueue.ts`, `spawnQueueManager.ts`)
Priority-based queue management with multi-spawn support.

**Key Features:**
- Priority-sorted queue (EMERGENCY → HIGH → NORMAL → LOW)
- Multi-spawn coordination (distributes across available spawns)
- Priority preemption (high priority can interrupt low priority)
- In-progress spawn tracking

**Priority Levels:**
- `EMERGENCY` (1000): Workforce collapse, no energy producers
- `HIGH` (500): Defenders during attack, critical roles
- `NORMAL` (100): Standard economy roles
- `LOW` (50): Utility, expansion, optimization

#### 5. **Defender Manager** (`defenderManager.ts`)
Calculates defender priority boosts based on threats.

**Key Features:**
- Threat assessment (hostile body parts, count, proximity)
- Dynamic priority boost calculation
- Defender type selection (guard, healer, ranger)
- Emergency response coordination

#### 6. **Role Definitions** (`roleDefinitions.ts`)
Defines all creep roles with default priorities and body templates.

**Key Features:**
- Role metadata (family, priority, body template)
- Default configurations for all roles
- Role-specific spawn logic

#### 7. **Carrier Dimensioning** (`carrierDimensioning.ts`)
Calculates optimal carrier/hauler sizes based on room economics.

**Key Features:**
- Energy flow rate calculation
- Distance-based capacity sizing
- Multi-source coordination
- Terminal/storage integration

## Key Concepts

### 1. Posture-Based Spawning

Room posture drives spawn priorities:

**Eco Posture** (standard operation):
- +50% harvester priority
- +30% upgrader priority
- +20% hauler priority
- -70% guard priority

**Defensive Posture** (under attack):
- +100% guard priority
- +50% healer priority
- -50% upgrader priority
- -50% builder priority

**War Posture** (offensive operations):
- +150% guard priority
- +100% healer priority
- +100% soldier priority
- -70% upgrader priority

**Expand Posture** (claiming new rooms):
- +50% scout priority
- +50% claimer priority
- +50% remote roles priority
- -20% upgrader priority

### 2. Priority Calculation Formula

```typescript
finalPriority = basePriority 
  * postureWeight 
  * pheromoneMultiplier 
  + defenderBoost 
  + emergencyBonus
```

**Components:**
- `basePriority`: Role default (defined in roleDefinitions.ts)
- `postureWeight`: Multiplier from room posture (0.3 - 2.5)
- `pheromoneMultiplier`: Swarm signal influence (0.5 - 2.0)
- `defenderBoost`: Threat-based boost for defenders (+0 to +500)
- `emergencyBonus`: Critical spawns get +1000

### 3. Body Optimization Strategies

**Harvesters** (Static miners):
- Goal: Maximize WORK parts
- Pattern: N×WORK + 1×CARRY + M×MOVE
- Optimal: 5 WORK (harvests 10 energy/tick)
- Movement: 1 MOVE per 2 body parts (static position)

**Haulers** (Carriers):
- Goal: Maximize CARRY for distance
- Pattern: N×CARRY + M×MOVE
- Ratio: 1 MOVE per 2 CARRY (on roads), 1:1 (off-road)
- Size: Based on energy/tick × round-trip time

**Soldiers** (Combat):
- Goal: Balance damage and survivability
- Pattern: N×TOUGH + M×ATTACK + O×MOVE
- Ratio: 1 MOVE per 1 body part (full speed)
- Boost-aware: Fewer parts if boosted

**Upgraders** (Controller work):
- Goal: Maximize WORK within energy budget
- Pattern: N×WORK + M×CARRY + O×MOVE
- Ratio: 1 CARRY per 2 WORK, 1 MOVE per 2 parts
- RCL8: 15 WORK optimal (capped at 15 energy/tick)

## API Reference

### Spawn Coordinator API

```typescript
import { spawnCoordinator } from './spawning/spawnCoordinator';

// Process spawn queue for a room
spawnCoordinator.processRoom("W1N1");

// Check if emergency spawn needed
const isEmergency = spawnCoordinator.detectEmergency("W1N1");

// Get spawn statistics
const stats = spawnCoordinator.getStats("W1N1");
console.log(`Queued: ${stats.queued}, In Progress: ${stats.inProgress}`);
```

### Priority Calculator API

```typescript
import { calculateSpawnPriority, getPostureSpawnWeights } from './spawning/spawnPriority';

// Get role priority for current room state
const priority = calculateSpawnPriority("W1N1", "harvester");

// Get posture-based weights
const weights = getPostureSpawnWeights("eco");
console.log(`Harvester weight: ${weights.harvester}x`);
```

### Body Optimizer API

```typescript
import { optimizeHarvesterBody, optimizeHaulerBody, optimizeSoldierBody } from './spawning/bodyOptimizer';

// Optimize harvester body
const harvesterBody = optimizeHarvesterBody({
  maxEnergy: 800,
  role: "harvester"
});

// Optimize hauler body for distance
const haulerBody = optimizeHaulerBody({
  maxEnergy: 1200,
  role: "hauler",
  distance: 50,
  hasRoads: true,
  energyPerTick: 10
});

// Optimize soldier body with boosts
const soldierBody = optimizeSoldierBody({
  maxEnergy: 3000,
  role: "soldier",
  willBoost: true
});

// Calculate body cost
const cost = calculateBodyCost(harvesterBody.body);
```

### Spawn Queue API

```typescript
import { spawnQueueManager, SpawnPriority } from './spawning/spawnQueue';

// Add spawn request
spawnQueueManager.addRequest({
  id: `harvester_${Game.time}`,
  roomName: "W1N1",
  role: "harvester",
  family: "economy",
  body: harvesterBody,
  priority: SpawnPriority.HIGH,
  sourceId: sourceId,
  createdAt: Game.time
});

// Get queue for room
const queue = spawnQueueManager.getQueue("W1N1");

// Remove completed request
spawnQueueManager.removeRequest("W1N1", requestId);

// Clear entire queue
spawnQueueManager.clearQueue("W1N1");
```

### Defender Manager API

```typescript
import { getDefenderPriorityBoost } from './spawning/defenderManager';

// Calculate priority boost for defenders
const boost = getDefenderPriorityBoost("W1N1");
console.log(`Defender priority boost: +${boost}`);

// Get recommended defender type
const defenderType = calculateDefenderType(hostiles);
// Returns: "guard", "healer", or "ranger"
```

## Performance Characteristics

### CPU Costs

| Operation | CPU Cost | Notes |
|-----------|----------|-------|
| Priority calculation | ~0.01 CPU | Per role |
| Body optimization | ~0.02-0.05 CPU | Depends on complexity |
| Queue processing | ~0.05-0.1 CPU | Per room |
| Spawn coordination | ~0.1-0.3 CPU | All rooms |
| Emergency detection | ~0.01 CPU | Per room |

### Memory Usage

- **Spawn Queue**: ~500B per request (5-10 requests typical = 2.5-5KB per room)
- **Role Definitions**: ~2KB (static, loaded once)
- **In-Progress Tracking**: ~100B per active spawn

### Cache Behavior

- Priority calculations: Not cached (dynamic based on live pheromones)
- Body templates: Cached in heap per energy level (reduces recalculation)
- Queue state: Stored in heap (lost on reset, rebuilds from Memory)

## Configuration

### Environment Variables

None. Configuration is done via room posture and pheromone system.

### Memory Schema

```typescript
// Memory.spawning (optional extension)
interface SpawningMemory {
  queues: Record<string, SpawnRequest[]>;
  priorities: Record<string, number>;
}
```

### Tunable Parameters

**Priority Weights** (`spawnPriority.ts`):
```typescript
const FOCUS_ROOM_UPGRADER_PRIORITY_BOOST = 40;
```

**Body Optimization** (`bodyOptimizer.ts`):
```typescript
const MAX_BODY_PARTS = 50;  // Game limit
const WORK_PARTS_OPTIMAL = 5;  // For harvester at standard source
```

**Queue Management** (`spawnQueue.ts`):
```typescript
export enum SpawnPriority {
  EMERGENCY = 1000,
  HIGH = 500,
  NORMAL = 100,
  LOW = 50
}
```

**Emergency Detection** (in coordinator):
```typescript
const EMERGENCY_HARVESTER_THRESHOLD = 1;  // Spawn emergency if < 1 harvester
const EMERGENCY_ENERGY_THRESHOLD = 300;   // Emergency if energy < 300
```

## Examples

### Example 1: Processing Spawn Queue

```typescript
import { spawnCoordinator } from './spawning/spawnCoordinator';

// In room process (called every tick)
export function processRoomSpawning(room: Room) {
  // Check for emergencies first
  const emergency = spawnCoordinator.detectEmergency(room.name);
  
  if (emergency) {
    console.log(`EMERGENCY in ${room.name}: ${emergency.reason}`);
    // Emergency spawn request added automatically
  }
  
  // Process spawn queue
  spawnCoordinator.processRoom(room.name);
  
  // Log stats periodically
  if (Game.time % 100 === 0) {
    const stats = spawnCoordinator.getStats(room.name);
    console.log(`${room.name} spawning: ${stats.queued} queued, ${stats.spawned} spawned`);
  }
}
```

### Example 2: Adding Custom Spawn Request

```typescript
import { spawnQueueManager, SpawnPriority } from './spawning/spawnQueue';
import { optimizeHarvesterBody } from './spawning/bodyOptimizer';

// Request a new harvester
function requestHarvester(room: Room, source: Source, priority: number = SpawnPriority.NORMAL) {
  // Optimize body for available energy
  const body = optimizeHarvesterBody({
    maxEnergy: room.energyCapacityAvailable,
    role: "harvester"
  });
  
  // Add to queue
  spawnQueueManager.addRequest({
    id: `harvester_${source.id}_${Game.time}`,
    roomName: room.name,
    role: "harvester",
    family: "economy",
    body: body,
    priority: priority,
    sourceId: source.id,
    createdAt: Game.time,
    additionalMemory: {
      sourceId: source.id,
      homeRoom: room.name
    }
  });
}
```

### Example 3: Dynamic Priority Based on Pheromones

```typescript
import { calculateSpawnPriority } from './spawning/spawnPriority';

// Get dynamic priority for each role
function getSpawnPriorities(roomName: string): Record<string, number> {
  const roles = ["harvester", "hauler", "upgrader", "builder", "guard"];
  const priorities: Record<string, number> = {};
  
  for (const role of roles) {
    priorities[role] = calculateSpawnPriority(roomName, role);
  }
  
  return priorities;
}

// Use priorities to determine what to spawn next
function selectNextSpawn(roomName: string): string | null {
  const priorities = getSpawnPriorities(roomName);
  const needs = checkRoleNeeds(roomName); // Custom function
  
  let bestRole: string | null = null;
  let bestPriority = 0;
  
  for (const [role, priority] of Object.entries(priorities)) {
    if (needs[role] > 0 && priority > bestPriority) {
      bestRole = role;
      bestPriority = priority;
    }
  }
  
  return bestRole;
}
```

### Example 4: Optimizing Bodies for Different Energy Levels

```typescript
import { optimizeHarvesterBody, optimizeHaulerBody, calculateBodyCost } from './spawning/bodyOptimizer';

// Generate bodies for different RCL levels
function getBodyProgression(role: string) {
  const energyLevels = [300, 550, 800, 1300, 1800, 2300, 5600];
  
  for (const energy of energyLevels) {
    let body;
    
    if (role === "harvester") {
      body = optimizeHarvesterBody({ maxEnergy: energy, role });
    } else if (role === "hauler") {
      body = optimizeHaulerBody({ 
        maxEnergy: energy, 
        role,
        distance: 30,
        hasRoads: true 
      });
    }
    
    const cost = calculateBodyCost(body.body);
    console.log(`${role} @ ${energy}: ${body.body.length} parts, ${cost} cost`);
  }
}
```

### Example 5: Multi-Spawn Coordination

```typescript
import { spawnCoordinator } from './spawning/spawnCoordinator';

// Coordinate spawning across multiple spawns
function coordinateSpawns(room: Room) {
  const spawns = room.find(FIND_MY_SPAWNS);
  
  if (spawns.length === 0) return;
  
  // Process entire room queue (coordinator distributes across spawns)
  spawnCoordinator.processRoom(room.name);
  
  // Log spawn status
  for (const spawn of spawns) {
    if (spawn.spawning) {
      const creep = Game.creeps[spawn.spawning.name];
      const progress = (spawn.spawning.remainingTime / spawn.spawning.needTime) * 100;
      console.log(`${spawn.name}: Spawning ${creep.memory.role} (${progress.toFixed(0)}%)`);
    } else {
      console.log(`${spawn.name}: Idle`);
    }
  }
}
```

## Testing

### Test Coverage

- **Priority Calculator**: Unit tests for posture weights, pheromone influence
- **Body Optimizer**: Unit tests for all role optimizations, energy constraints
- **Spawn Queue**: Unit tests for priority sorting, multi-spawn distribution
- **Spawn Coordinator**: Integration tests for emergency detection, queue processing

### Running Tests

```bash
# Run all spawning tests
npm run test:unit -- --grep "spawn|priority|body|queue"

# Run specific test suite
npm run test:unit -- packages/screeps-bot/test/unit/bodyOptimizer.test.ts
```

## Troubleshooting

### Issue: No creeps spawning

**Symptoms**: Spawn queue has requests but no creeps spawn

**Causes:**
1. All spawns busy
2. Not enough energy for body
3. Spawn name collision (creep name already exists)
4. Invalid body composition

**Solutions:**
1. Check spawn status: `spawn.spawning !== null`
2. Verify energy: `room.energyAvailable >= calculateBodyCost(body)`
3. Ensure unique names: append Game.time or random ID
4. Validate body: max 50 parts, valid part types

### Issue: Emergency spawns every tick

**Symptoms**: Constant emergency spawn requests

**Causes:**
1. Harvesters dying before replacements spawn
2. Insufficient energy to spawn harvesters
3. Emergency threshold too high
4. Spawn queue not processing

**Solutions:**
1. Spawn replacement harvesters earlier (at 80% TTL)
2. Reduce harvester body cost for emergencies
3. Lower emergency threshold: `EMERGENCY_ENERGY_THRESHOLD = 200`
4. Check coordinator is running: `spawnCoordinator.processRoom()`

### Issue: Wrong creeps spawning

**Symptoms**: Low-priority creeps spawn before high-priority

**Causes:**
1. Priority calculation incorrect
2. Queue not sorted by priority
3. Posture weights misconfigured
4. Pheromone values stuck

**Solutions:**
1. Debug priority: `console.log(calculateSpawnPriority(roomName, role))`
2. Verify queue sorting: check `SpawnPriority` enum values
3. Review posture: ensure room.memory.swarm.intent is correct
4. Check pheromones: room.memory.swarm.pheromones

### Issue: Inefficient body compositions

**Symptoms**: Creeps too small, too large, or imbalanced parts

**Causes:**
1. Body optimizer not considering role-specific needs
2. Energy constraints too tight
3. Movement parts insufficient (creeps too slow)
4. WORK/CARRY ratio wrong for role

**Solutions:**
1. Review optimization logic for specific role
2. Use `room.energyCapacityAvailable` instead of `energyAvailable`
3. Check MOVE ratio: 1:1 off-road, 1:2 on roads
4. Validate ratios: 1 CARRY per 2 WORK for upgraders

### Issue: Spawn queue growing unbounded

**Symptoms**: Queue has 50+ requests, memory usage increasing

**Causes:**
1. Requests not being removed after spawn
2. Spawn rate < request rate
3. Duplicate requests added
4. No queue cleanup

**Solutions:**
1. Ensure `removeRequest()` called after spawn completes
2. Reduce request frequency: check existing creeps first
3. Add request deduplication: check queue before adding
4. Periodically clear old requests: remove requests > 1000 ticks old

### Issue: Multi-spawn conflict

**Symptoms**: Multiple spawns try to spawn same creep

**Causes:**
1. Queue shared across spawns without coordination
2. No spawn-specific locking
3. Request ID collision

**Solutions:**
1. Use spawn coordinator: handles multi-spawn distribution
2. Track in-progress spawns: prevent duplicate spawning
3. Generate unique request IDs: include spawn ID and timestamp

## Related Documentation

- [ROADMAP.md](../../../../ROADMAP.md) - Section 6: Spawn-Logic & Körperteile
- [SHARD3_INVESTIGATION.md](../../../../SHARD3_INVESTIGATION.md) - Military overallocation analysis
- [Core Subsystem](../core/README.md) - Process scheduling for spawn coordinator
- [Memory Subsystem](../memory/README.md) - SwarmState schema for pheromones
- [Roles Subsystem](../roles/README.md) - Role definitions and behaviors
