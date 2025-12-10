# InterShard Management Module

This module implements multi-shard coordination and resource management for the Screeps bot, as specified in ROADMAP.md Sections 3 & 11.

## Overview

The intershard module provides:
- **Shard coordination**: Manage multiple shards with different roles
- **CPU distribution**: Dynamic allocation based on load and efficiency
- **Portal navigation**: Track and utilize inter-shard portals
- **Resource transfers**: Move resources between shards via portals
- **Health monitoring**: Track shard health, CPU usage, and efficiency

## Architecture

```
intershard/
├── schema.ts                        # Data structures and serialization
├── shardManager.ts                  # Main shard coordination
├── resourceTransferCoordinator.ts   # Cross-shard resource transfers
└── README.md                        # This file
```

## Components

### 1. Schema (`schema.ts`)

Defines data structures for inter-shard memory:

- **ShardRole**: `core | frontier | resource | backup | war`
- **ShardHealthMetrics**: CPU, bucket, economy, war indices
- **InterShardTask**: Colonize, reinforce, transfer, evacuate
- **PortalInfo**: Portal locations, stability, threat ratings
- **CpuAllocationHistory**: Historical CPU usage tracking

**Key Features:**
- Compact serialization (saves ~60% memory)
- Checksum validation
- Version management for migrations

### 2. Shard Manager (`shardManager.ts`)

Central coordinator for multi-shard operations.

**Key Methods:**

```typescript
// Initialize and load from InterShardMemory
initialize(): void

// Main tick processing (runs every 100 ticks)
run(): void

// Create tasks
createTask(type, targetShard, targetRoom?, priority?): void
createResourceTransferTask(targetShard, targetRoom, resourceType, amount, priority?): void

// Portal management
getOptimalPortalRoute(targetShard, fromRoom?): PortalInfo | null
recordPortalTraversal(sourceRoom, targetShard, success): void

// Task management
updateTaskProgress(taskId, progress, status?): void
cancelTask(taskId): void
getActiveTransferTasks(): InterShardTask[]

// Shard state
getCurrentShardState(): ShardState | undefined
getAllShards(): ShardState[]
setShardRole(role): void
```

**Automatic Features:**
- CPU limit distribution based on role, load, and bucket
- Shard role auto-assignment based on metrics
- Portal discovery and tracking
- Health metrics updates
- CPU efficiency calculation

**CPU Distribution:**
- Dynamic adjustment based on bucket levels
- Role-based weights (war: 1.2, core: 1.5, frontier: 0.8, etc.)
- Efficiency-based scaling (high usage = more CPU)
- Bucket-aware throttling (low bucket = reduced allocation)

**Role Assignment Logic:**
1. **War**: `warIndex > 50` → Active combat
2. **Backup**: Multi-shard + `roomCount < 2` + `avgRCL < 3` → Minimal presence
3. **Frontier**: `roomCount < 3` + `avgRCL < 4` → Expanding
4. **Resource**: `economyIndex > 70` + `roomCount >= 3` + `avgRCL >= 6` → Production
5. **Core**: `roomCount >= 2` + `avgRCL >= 4` → Stable empire

**Transitions:**
- Frontier → Core: When established (3+ rooms, RCL 5+)
- War → Resource/Core/Frontier: When war ends (`warIndex < 20`)

### 3. Resource Transfer Coordinator (`resourceTransferCoordinator.ts`)

Manages cross-shard resource transfers via portals.

**Transfer Lifecycle:**

```
queued → gathering → moving → transferring → complete
  ↓          ↓          ↓            ↓
(spawn)  (collect)  (portal)   (cross-shard)
```

**Key Methods:**

```typescript
// Main processing
run(): void

// Request management
getActiveRequests(): CrossShardTransferRequest[]
getPrioritizedRequests(): CrossShardTransferRequest[]
getCreepRequest(creepName): CrossShardTransferRequest | null

// Creep assignment
assignCreep(requestId, creepName): void
```

**Features:**
- Automatic source room selection (finds room with resources)
- Optimal portal selection (via ShardManager)
- Creep spawning coordination (TODO: complete integration)
- Progress tracking and task updates
- Automatic cleanup of old requests

### 4. Cross-Shard Carrier Role (`roles/crossShardCarrier.ts`)

Specialized creep role for inter-shard resource transport.

**State Machine:**

1. **Gathering**: Withdraw from terminal/storage in source room
2. **MovingToPortal**: Travel to portal room
3. **EnteringPortal**: Move to and enter portal
4. **Delivering**: (On target shard) Deliver to terminal/storage

**Key Functions:**

```typescript
// Main creep logic
runCrossShardCarrier(creep): void

// Detect arrival on new shard
handleCrossShardArrival(creep): void
```

**Memory Structure:**

```typescript
interface CrossShardCarrierMemory {
  role: "crossShardCarrier";
  transferRequestId?: string;
  state?: "gathering" | "movingToPortal" | "enteringPortal" | "delivering";
  sourceRoom?: string;
  portalRoom?: string;
  targetShard?: string;
  targetRoom?: string;
  resourceType?: ResourceConstant;
}
```

## Usage Examples

### Create a Cross-Shard Resource Transfer

```typescript
import { shardManager } from "./intershard/shardManager";

// Transfer 10,000 energy to shard1
shardManager.createResourceTransferTask(
  "shard1",          // target shard
  "E10N10",          // target room
  RESOURCE_ENERGY,   // resource type
  10000,             // amount
  75                 // priority (0-100)
);
```

### Get Optimal Portal Route

```typescript
import { shardManager } from "./intershard/shardManager";

const portal = shardManager.getOptimalPortalRoute(
  "shard1",    // target shard
  "E5N5"       // optional: from room (for distance calculation)
);

if (portal) {
  console.log(`Best portal: ${portal.sourceRoom} (score based on stability, threat, distance)`);
}
```

### Track Portal Success/Failure

```typescript
import { shardManager } from "./intershard/shardManager";

// After creep successfully crosses
shardManager.recordPortalTraversal("E5N5", "shard1", true);

// After failed crossing (creep died, etc.)
shardManager.recordPortalTraversal("E5N5", "shard1", false);
```

### Check Shard Health

```typescript
import { shardManager } from "./intershard/shardManager";

const shardState = shardManager.getCurrentShardState();
if (shardState) {
  console.log(`Role: ${shardState.role}`);
  console.log(`Rooms: ${shardState.health.roomCount}`);
  console.log(`CPU: ${shardState.health.cpuUsage * 100}%`);
  console.log(`Bucket: ${shardState.health.bucketLevel}`);
}
```

### Process Transfer Requests

```typescript
import { resourceTransferCoordinator } from "./intershard/resourceTransferCoordinator";

// In main loop
resourceTransferCoordinator.run();

// Get active transfers
const activeTransfers = resourceTransferCoordinator.getActiveRequests();
console.log(`${activeTransfers.length} transfers in progress`);
```

## Integration

### With Main Loop

```typescript
import { shardManager } from "./intershard/shardManager";
import { resourceTransferCoordinator } from "./intershard/resourceTransferCoordinator";

// Initialize once
shardManager.initialize();

// In main loop (shardManager runs every 100 ticks via decorator)
// resourceTransferCoordinator should run more frequently
if (Game.time % 10 === 0) {
  resourceTransferCoordinator.run();
}
```

### With Spawn System

```typescript
import { resourceTransferCoordinator } from "./intershard/resourceTransferCoordinator";

// Get prioritized transfer requests
const requests = resourceTransferCoordinator.getPrioritizedRequests();

for (const request of requests) {
  // Calculate needed carry capacity
  const neededCapacity = request.amount - request.transferred;
  
  // Spawn carrier with appropriate body
  // (Integration point for spawn system)
}
```

### With Creep Manager

```typescript
import { runCrossShardCarrier, handleCrossShardArrival } from "./roles/crossShardCarrier";

for (const creepName in Game.creeps) {
  const creep = Game.creeps[creepName];
  
  if (creep.memory.role === "crossShardCarrier") {
    // Check if just arrived on new shard
    handleCrossShardArrival(creep);
    
    // Run carrier logic
    runCrossShardCarrier(creep);
  }
}
```

## Performance Characteristics

### CPU Usage

- **ShardManager.run()**: ~0.01-0.02 CPU (every 100 ticks)
- **ResourceTransferCoordinator.run()**: ~0.005-0.01 CPU (every 10 ticks)
- **CrossShardCarrier per creep**: ~0.1-0.2 CPU (standard creep movement)

### Memory Usage

- **InterShardMemory**: ~2-5 KB per shard (compact serialization)
- **Transfer requests**: ~0.5 KB per active transfer
- **Carrier memory**: ~100 bytes per creep

### InterShardMemory Size

Size limit: 100 KB per shard

Typical usage:
- Base structure: ~500 bytes
- Per shard state: ~800 bytes
- Per task: ~150 bytes
- Per portal: ~100 bytes

Maximum capacity:
- ~100 shards (if minimal tasks/portals)
- ~500 tasks (if minimal shards/portals)
- ~800 portals (if minimal shards/tasks)

## Limitations & Future Work

### Current Limitations

1. **Spawn integration incomplete**: Transfer coordinator doesn't yet spawn carriers automatically
2. **No route planning**: Carriers use simple pathfinding, not optimal multi-room routes
3. **No failure recovery**: Failed transfers don't retry automatically
4. **Single portal per shard**: Doesn't utilize multiple portals for parallel transfers

### Future Enhancements

1. **Automatic carrier spawning**: Integrate with spawn system
2. **Multi-hop portal routes**: Find routes through multiple shards
3. **Parallel transfers**: Use multiple portals simultaneously
4. **Transfer batching**: Combine small transfers for efficiency
5. **Priority queuing**: More sophisticated queue management
6. **Failure recovery**: Automatic retry with backoff
7. **Statistics tracking**: Transfer success rates, average time, etc.

## Testing

Run tests with:

```bash
npm test
```

Test coverage:
- 22 unit tests for cross-shard functionality
- Transfer request prioritization
- Portal route scoring
- CPU efficiency calculation
- Shard role transitions
- Transfer progress tracking

## References

- ROADMAP.md Section 3: Architektur-Ebenen (Schichtenmodell)
- ROADMAP.md Section 11: Cluster- & Empire-Logik
- Game API: `Game.cpu.setShardLimits`, `InterShardMemory`
- Portal documentation: https://docs.screeps.com/api/#StructurePortal
