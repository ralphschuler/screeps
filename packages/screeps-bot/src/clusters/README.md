# Clusters Subsystem

## Overview

The clusters subsystem coordinates operations across multiple rooms, enabling colony grouping, inter-room resource sharing, military coordination, and rally point management. Clusters enable the bot to manage room groups as cohesive units rather than isolated rooms.

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│              Cluster Manager                            │
│  - Multi-room coordination                              │
│  - Terminal resource balancing                          │
│  - Squad formation                                      │
│  - Cluster-wide metrics                                 │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴────────┬──────────────┬──────────────┐
    │                 │              │              │
┌───▼────────┐  ┌────▼─────────┐  ┌─▼────────┐  ┌─▼──────────┐
│  Resource  │  │ Rally Point  │  │  Squad   │  │  Military  │
│  Sharing   │  │  Manager     │  │Coordinator│  │  Resource  │
│ RCL 1-5    │  │ Defense/War  │  │Formation │  │  Pooling   │
│Pre-Terminal│  │ Staging      │  │Validation│  │ Emergency  │
└────────────┘  └──────────────┘  └──────────┘  └────────────┘
```

### Core Components

#### 1. **Cluster Manager** (`clusterManager.ts`)
Central orchestration for all cluster operations.

**Key Features:**
- Terminal resource balancing (RCL 6+)
- Pre-terminal resource sharing (RCL 1-5)
- Squad formation and coordination
- Rally point management
- Inter-room logistics
- Cluster-wide metrics tracking
- Offensive operations planning

**Update Interval:** Every 10 ticks

#### 2. **Resource Sharing Manager** (`resourceSharing.ts`)
Manages inter-room resource sharing for rooms without terminals.

**Key Features:**
- Energy need calculation (critical, medium, low, satisfied)
- Surplus detection and distribution
- Carrier creep coordination
- Transfer request queue management
- Focus room prioritization (extra energy for upgrading)

**Energy Thresholds:**
- Critical: < 300 energy (spawn in danger)
- Medium: < 1,000 energy (running low)
- Low: < 3,000 energy (could use help)
- Surplus: > 10,000 energy (can help others)

#### 3. **Rally Point Manager** (`rallyPointManager.ts`)
Dynamically selects and manages rally points for military operations.

**Key Features:**
- Purpose-specific rally point selection (defense, offense, staging, retreat)
- Terrain-aware positioning (plains > swamp > walls)
- Safety evaluation (distance from hostiles)
- Centrality scoring (proximity to spawn/storage)
- Exit access optimization (mobility)

**Rally Point Types:**
- **Defense**: Near spawn/storage for quick response
- **Offense**: Staging area for attacks, near target room exits
- **Staging**: Gathering point for squad formation
- **Retreat**: Safe fallback position away from threats

#### 4. **Squad Coordinator** (`squadCoordinator.ts`)
Coordinates military squads across multiple rooms.

**Key Features:**
- Squad formation and composition
- Squad state validation
- Dissolution criteria (mission complete, casualties)
- Cross-room squad coordination

#### 5. **Military Resource Pooling** (`militaryResourcePooling.ts`)
Manages emergency resource allocation for defense.

**Key Features:**
- Emergency energy routing to rooms under attack
- Military reservation tracking (energy set aside for defense)
- Priority-based resource allocation
- Rapid response coordination

#### 6. **Offensive Operations** (`offensiveOperations.ts`)
Plans and coordinates offensive military operations.

**Key Features:**
- Target room selection
- Attack planning and coordination
- Resource allocation for offensives
- Multi-room offensive coordination

#### 7. **Attack Target Selector** (`attackTargetSelector.ts`)
Selects optimal targets for offensive operations.

**Key Features:**
- Target evaluation (value, threat, difficulty)
- ROI calculation (expected gain vs. cost)
- Multi-room attack coordination
- Target priority ranking

## Key Concepts

### 1. Cluster Formation

Clusters group nearby rooms for coordinated operations:

**Automatic Formation:**
- Rooms within N tiles automatically form clusters
- Cluster ID based on primary/oldest room
- Dynamic cluster membership (rooms join/leave based on state)

**Cluster Membership:**
- Home rooms (owned with spawns)
- Remote rooms (harvested for resources)
- Military outposts (forward bases)

### 2. Resource Distribution

**Terminal-based** (RCL 6+):
- Use terminals for instant resource transfers
- Balance minerals and energy across cluster
- Optimize transfer costs (< 1000 range preferred)

**Carrier-based** (RCL 1-5):
- Spawn carrier creeps to transport energy
- Route energy from surplus to deficit rooms
- Priority: Critical > Medium > Low needs

**Distribution Algorithm:**
```typescript
1. Calculate needs and surplus for each room
2. Match donors (surplus) with recipients (needs)
3. Create transfer requests prioritized by urgency
4. Spawn carriers or queue terminal transfers
5. Track completion and cleanup requests
```

### 3. Rally Point Selection

Rally points are dynamically selected based on:

**Terrain Quality:**
- Plains: +10 score (fast movement)
- Swamp: +5 score (slow but passable)
- Walls: 0 score (impassable)

**Safety:**
- Distance from hostiles: +2 per tile
- Distance from room edges: +1 per tile

**Centrality:**
- Distance from spawn/storage: -1 per tile (defense)
- Distance from target: -1 per tile (offense)

**Exit Access:**
- Adjacent exits: +5 per exit (mobility)

**Final Score:** `terrain + safety + centrality + exitAccess`

### 4. Squad Coordination

Squads are formed for coordinated military operations:

**Squad Types:**
- Defense squads (protect owned rooms)
- Offense squads (attack enemy rooms)
- Raid squads (harass and disrupt)
- Siege squads (nuke and destroy)

**Squad Lifecycle:**
1. Formation: Gather creeps at staging rally point
2. Movement: Travel as group to target
3. Engagement: Coordinate attacks and healing
4. Retreat: Fall back to retreat rally point if needed
5. Dissolution: Disband when mission complete or casualties too high

## API Reference

### Cluster Manager API

```typescript
import { clusterManager } from './clusters/clusterManager';

// Run all clusters (called by kernel)
clusterManager.run();

// Get cluster by ID
const cluster = memoryManager.getCluster("cluster_W1N1");

// Update cluster
clusterManager.updateCluster(clusterId);
```

### Resource Sharing API

```typescript
import { resourceSharingManager } from './clusters/resourceSharing';

// Process resource sharing for a cluster
resourceSharingManager.processCluster(cluster);

// Get room resource status
const statuses = resourceSharingManager.getRoomStatuses(cluster);

// Create transfer request
const request: ResourceTransferRequest = {
  id: `transfer_${Game.time}`,
  from: "W1N1",
  to: "W2N1",
  resourceType: RESOURCE_ENERGY,
  amount: 1000,
  priority: 2, // Critical
  createdAt: Game.time
};

// Add to cluster
if (!cluster.resourceTransfers) cluster.resourceTransfers = [];
cluster.resourceTransfers.push(request);
```

### Rally Point Manager API

```typescript
import { findOptimalRallyPoint, updateClusterRallyPoints } from './clusters/rallyPointManager';

// Find optimal rally point for purpose
const defensePoint = findOptimalRallyPoint(room, "defense");
const offensePoint = findOptimalRallyPoint(room, "offense");

// Set rally point in cluster
cluster.rallyPoints = {
  defense: defensePoint,
  offense: offensePoint,
  staging: null,
  retreat: null
};

// Update all rally points for cluster
updateClusterRallyPoints(cluster);
```

### Squad Coordinator API

```typescript
import { createDefenseSquad, validateSquadState, shouldDissolveSquad } from './clusters/squadCoordinator';

// Create defense squad
const squad = createDefenseSquad(roomName, hostileIds);
if (!cluster.squads) cluster.squads = [];
cluster.squads.push(squad);

// Validate squad state
const valid = validateSquadState(squad);

// Check if squad should be dissolved
const shouldDissolve = shouldDissolveSquad(squad);
if (shouldDissolve) {
  // Remove squad from cluster
  cluster.squads = cluster.squads.filter(s => s.id !== squad.id);
}
```

### Military Resource Pooling API

```typescript
import { routeEmergencyEnergy, updateMilitaryReservations } from './clusters/militaryResourcePooling';

// Route emergency energy to room under attack
routeEmergencyEnergy(cluster, roomName, amount);

// Update military reservations for cluster
updateMilitaryReservations(cluster);
```

## Performance Characteristics

### CPU Costs

| Operation | CPU Cost | Notes |
|-----------|----------|-------|
| Cluster update | ~0.1-0.3 CPU | Per cluster |
| Resource sharing | ~0.05-0.1 CPU | Per cluster |
| Rally point selection | ~0.2-0.5 CPU | Per room (cached) |
| Squad validation | ~0.01-0.02 CPU | Per squad |
| Military pooling | ~0.05 CPU | Per cluster |

### Memory Usage

- **Cluster metadata**: ~1KB per cluster
- **Resource transfers**: ~100B per request (5-10 requests = 0.5-1KB)
- **Rally points**: ~50B per point (4 points = 200B)
- **Squads**: ~200B per squad (2-3 squads = 0.4-0.6KB)
- **Total per cluster**: ~2-3KB

### Cache Behavior

- Rally points: Cached in Memory, recalculated when threats change
- Resource statuses: Recalculated every 10 ticks
- Squad states: Validated every tick for active squads

## Configuration

### Environment Variables

None. Configuration is done via cluster memory.

### Memory Schema

```typescript
interface ClusterMemory {
  id: string;
  homeRooms: string[];
  remoteRooms: string[];
  militaryOutposts: string[];
  resourceTransfers?: ResourceTransferRequest[];
  rallyPoints?: {
    defense?: RallyPoint;
    offense?: RallyPoint;
    staging?: RallyPoint;
    retreat?: RallyPoint;
  };
  squads?: SquadDefinition[];
  createdAt: number;
  lastUpdate: number;
}
```

### Tunable Parameters

**Cluster Manager:**
```typescript
const DEFAULT_CONFIG = {
  updateInterval: 10,            // Update every 10 ticks
  minBucket: 0,                  // No bucket requirement
  resourceBalanceThreshold: 10000,  // Send if surplus > 10K
  minTerminalEnergy: 50000       // Keep 50K energy in terminal
};
```

**Resource Sharing:**
```typescript
const DEFAULT_CONFIG = {
  criticalEnergyThreshold: 300,   // Spawn in danger
  mediumEnergyThreshold: 1000,    // Running low
  lowEnergyThreshold: 3000,       // Could use help
  surplusEnergyThreshold: 10000,  // Can help others
  minTransferAmount: 500,         // Min transfer size
  maxRequestsPerRoom: 3,          // Max active requests
  requestTimeout: 500             // Request expires after 500 ticks
};
```

## Examples

### Example 1: Creating and Managing a Cluster

```typescript
import { memoryManager } from './memory/manager';

// Create cluster for adjacent rooms
function createCluster(primaryRoom: string, secondaryRooms: string[]): string {
  const clusterId = `cluster_${primaryRoom}`;
  
  const cluster: ClusterMemory = {
    id: clusterId,
    homeRooms: [primaryRoom, ...secondaryRooms],
    remoteRooms: [],
    militaryOutposts: [],
    createdAt: Game.time,
    lastUpdate: Game.time
  };
  
  memoryManager.setCluster(clusterId, cluster);
  
  console.log(`Created cluster ${clusterId} with ${cluster.homeRooms.length} rooms`);
  return clusterId;
}

// Add remote room to cluster
function addRemoteRoom(clusterId: string, remoteName: string) {
  const cluster = memoryManager.getCluster(clusterId);
  if (!cluster) return;
  
  if (!cluster.remoteRooms.includes(remoteName)) {
    cluster.remoteRooms.push(remoteName);
    console.log(`Added ${remoteName} as remote to ${clusterId}`);
  }
}
```

### Example 2: Resource Sharing Between Rooms

```typescript
import { resourceSharingManager } from './clusters/resourceSharing';

// Process resource sharing every 10 ticks
if (Game.time % 10 === 0) {
  const clusters = memoryManager.getClusters();
  
  for (const clusterId in clusters) {
    const cluster = clusters[clusterId];
    
    // Process resource sharing for cluster
    resourceSharingManager.processCluster(cluster);
    
    // Log active transfers
    if (cluster.resourceTransfers && cluster.resourceTransfers.length > 0) {
      console.log(`${clusterId}: ${cluster.resourceTransfers.length} active transfers`);
      
      for (const transfer of cluster.resourceTransfers) {
        console.log(`  ${transfer.from} → ${transfer.to}: ${transfer.amount} energy`);
      }
    }
  }
}
```

### Example 3: Rally Point Management

```typescript
import { findOptimalRallyPoint, updateClusterRallyPoints } from './clusters/rallyPointManager';

// Update rally points when threats change
function updateRallyPoints(cluster: ClusterMemory) {
  for (const roomName of cluster.homeRooms) {
    const room = Game.rooms[roomName];
    if (!room) continue;
    
    // Check for threats
    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    
    if (hostiles.length > 0) {
      // Update defense rally point
      const defensePoint = findOptimalRallyPoint(room, "defense");
      
      if (defensePoint) {
        if (!cluster.rallyPoints) cluster.rallyPoints = {};
        cluster.rallyPoints.defense = defensePoint;
        
        console.log(`Updated defense rally point for ${roomName}: (${defensePoint.x}, ${defensePoint.y})`);
      }
    }
  }
  
  // Update all rally points for cluster
  updateClusterRallyPoints(cluster);
}
```

### Example 4: Squad Formation and Coordination

```typescript
import { createDefenseSquad, validateSquadState } from './clusters/squadCoordinator';

// Create defense squad when room is attacked
function respondToAttack(cluster: ClusterMemory, roomName: string) {
  const room = Game.rooms[roomName];
  if (!room) return;
  
  const hostiles = room.find(FIND_HOSTILE_CREEPS);
  if (hostiles.length === 0) return;
  
  // Create defense squad
  const squad = createDefenseSquad(roomName, hostiles.map(h => h.id));
  
  if (!cluster.squads) cluster.squads = [];
  cluster.squads.push(squad);
  
  console.log(`Created defense squad ${squad.id} for ${roomName}`);
  
  // Assign defenders to squad
  const defenders = room.find(FIND_MY_CREEPS, {
    filter: c => c.memory.role === "guard" && !c.memory.squadId
  });
  
  for (const defender of defenders.slice(0, 5)) {
    defender.memory.squadId = squad.id;
    squad.memberIds.push(defender.id);
  }
  
  console.log(`Assigned ${squad.memberIds.length} defenders to squad`);
}

// Validate and cleanup squads
function manageSquads(cluster: ClusterMemory) {
  if (!cluster.squads) return;
  
  cluster.squads = cluster.squads.filter(squad => {
    const valid = validateSquadState(squad);
    
    if (!valid) {
      console.log(`Dissolved invalid squad ${squad.id}`);
      return false;
    }
    
    return true;
  });
}
```

### Example 5: Emergency Resource Routing

```typescript
import { routeEmergencyEnergy } from './clusters/militaryResourcePooling';

// Route emergency energy when room is low and under attack
function handleEmergency(cluster: ClusterMemory, roomName: string) {
  const room = Game.rooms[roomName];
  if (!room) return;
  
  const energy = room.energyAvailable;
  const hostiles = room.find(FIND_HOSTILE_CREEPS);
  
  // Critical: Low energy and under attack
  if (energy < 300 && hostiles.length > 0) {
    console.log(`EMERGENCY in ${roomName}: ${energy} energy, ${hostiles.length} hostiles`);
    
    // Route emergency energy from cluster
    const routed = routeEmergencyEnergy(cluster, roomName, 5000);
    
    if (routed) {
      console.log(`Routed emergency energy to ${roomName}`);
    } else {
      console.log(`No available energy in cluster for ${roomName}`);
    }
  }
}
```

## Testing

### Test Coverage

- **Cluster Manager**: Integration tests for cluster coordination
  - Resource distribution algorithms
  - Transfer cost optimization
  - Emergency prioritization
  - Mineral balancing logic

- **Resource Sharing**: Unit tests for need calculation, surplus detection
- **Rally Point Manager**: Unit tests for position evaluation, terrain scoring
- **Squad Coordinator**: Unit tests for squad validation, dissolution criteria

### Running Tests

```bash
# Run all cluster tests
npm run test:unit -- --grep "cluster|rally|squad|resource"

# Run specific test suite
npm run test:unit -- packages/screeps-bot/test/unit/clusterManager.test.ts
```

## Troubleshooting

### Issue: Resources not being shared

**Symptoms**: Rooms with surplus energy not sending to deficit rooms

**Causes:**
1. No resource transfer requests created
2. No carrier creeps spawned
3. Transfer requests timing out
4. CPU budget exceeded

**Solutions:**
1. Check surplus threshold: reduce from 10K to 5K
2. Verify carrier spawning: check spawn queue for "interRoomCarrier" role
3. Increase request timeout: 500 → 1000 ticks
4. Check CPU usage: ensure cluster manager runs every 10 ticks

### Issue: Rally points not updating

**Symptoms**: Rally points stay in bad positions despite threats

**Causes:**
1. Rally point update not called
2. No valid positions found
3. Cluster memory not updated

**Solutions:**
1. Call `updateClusterRallyPoints(cluster)` when threats change
2. Check terrain: ensure room has valid plains/swamp tiles
3. Verify cluster.rallyPoints exists in Memory
4. Manually reset: delete cluster.rallyPoints to force recalculation

### Issue: Squads not forming

**Symptoms**: Hostiles detected but no squads created

**Causes:**
1. No defenders available
2. Squad creation logic not called
3. Defender manager not prioritizing guards

**Solutions:**
1. Check defender count: need at least 2-3 guards for squad
2. Ensure `createDefenseSquad()` called when hostiles detected
3. Verify defender priority boost: check `getDefenderPriorityBoost()`
4. Review spawn queue: guards should have high priority during attack

### Issue: Terminal transfers failing

**Symptoms**: Terminal.send() returns error codes

**Causes:**
1. Not enough energy in terminal
2. Terminal on cooldown
3. Invalid target room
4. Energy cost too high (> 1000 range)

**Solutions:**
1. Maintain minimum terminal energy: 50K reserve
2. Check cooldown: `terminal.cooldown === 0`
3. Verify target has terminal: `Game.rooms[targetRoom]?.terminal`
4. Optimize routes: prefer short distances (< 500 tiles)

### Issue: Cluster CPU overhead too high

**Symptoms**: Cluster manager using > 0.5 CPU per tick

**Causes:**
1. Too many clusters (> 5)
2. Update interval too low (< 10 ticks)
3. Resource calculations too expensive
4. Too many active squads

**Solutions:**
1. Consolidate clusters: merge nearby clusters
2. Increase update interval: 10 → 20 ticks
3. Reduce room scans: cache resource statuses
4. Limit active squads: max 2-3 per cluster

### Issue: Emergency energy not routing fast enough

**Symptoms**: Room runs out of energy before carrier arrives

**Causes:**
1. Critical threshold too low (< 300)
2. Carrier spawn delay
3. Long distance between rooms
4. No surplus energy available

**Solutions:**
1. Increase critical threshold: 300 → 500
2. Pre-spawn carriers: keep 1-2 idle carriers in cluster
3. Build roads between rooms: reduce travel time
4. Maintain energy reserves: ensure surplus > 5K in donor rooms

## Related Documentation

- [ROADMAP.md](../../../../ROADMAP.md) - Section 3: Cluster/Kolonie-Ebene, Section 12: Kampf & Verteidigung
- [Core Subsystem](../core/README.md) - Process scheduling for cluster manager
- [Memory Subsystem](../memory/README.md) - ClusterMemory schema
- [Spawning Subsystem](../spawning/README.md) - Carrier and defender spawning
- [Roles Subsystem](../roles/README.md) - Inter-room carrier role
