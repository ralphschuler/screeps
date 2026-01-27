# Multi-Shard Coordination

Learn how to coordinate your bot across **multiple shards** using the framework's empire and intershard systems.

---

## Table of Contents

- [Overview](#overview)
- [Shard Architecture](#shard-architecture)
- [InterShardMemory](#intershard-memory)
- [Shard Roles](#shard-roles)
- [Cross-Shard Communication](#cross-shard-communication)
- [Resource Transfers](#resource-transfers)
- [Best Practices](#best-practices)

---

## Overview

The framework supports **multi-shard operations** through two packages:
- `@ralphschuler/screeps-empire` - Empire-level (Layer 1) coordination
- `@ralphschuler/screeps-intershard` - Shard strategic (Layer 2) coordination

### Why Multi-Shard?

**Benefits**:
- **Scalability** - More rooms across shards
- **Resilience** - Distribute risk across shards
- **Specialization** - Dedicate shards to specific roles
- **Resource diversity** - Access different shard economies

---

## Shard Architecture

### Layer 1: Empire (Multi-Shard)

Coordinates across all shards using `InterShardMemory`:

```typescript
// Empire coordination
InterShardMemory.setLocal(JSON.stringify({
  shards: {
    shard0: { role: 'core', status: 'healthy', rooms: 15 },
    shard1: { role: 'expansion', status: 'growing', rooms: 8 },
    shard2: { role: 'resource', status: 'stable', rooms: 12 },
    shard3: { role: 'backup', status: 'dormant', rooms: 2 }
  },
  goals: {
    expand: 'shard1',
    mine: 'shard2'
  }
}));
```

### Layer 2: Shard Strategic

Per-shard strategic decisions:

```typescript
// Shard1 reads empire goals
const empireData = JSON.parse(InterShardMemory.getLocal());
const myShardRole = empireData.shards['shard1'].role;

if (myShardRole === 'expansion') {
  // Prioritize expansion on this shard
  Memory.shard.posture = 'expand';
}
```

---

## InterShardMemory

### Storage Limits

**100 KB per shard** (very limited!)

### Efficient Data Structure

```typescript
interface EmpireShardData {
  // Shard metadata (per shard)
  shards: {
    [shardName: string]: {
      role: 'core' | 'expansion' | 'resource' | 'backup';
      status: 'healthy' | 'growing' | 'unstable' | 'dormant';
      rooms: number;
      cpu: number;
      bucket: number;
      threats: number;
      lastUpdate: number;
    }
  };
  
  // Cross-shard tasks
  tasks: Array<{
    id: string;
    type: 'colonize' | 'transfer' | 'defend' | 'evacuate';
    fromShard: string;
    toShard: string;
    target: string;
    status: 'pending' | 'active' | 'complete';
  }>;
  
  // Resource requests
  requests: Array<{
    shard: string;
    resource: ResourceConstant;
    amount: number;
    priority: number;
  }>;
}
```

### Reading/Writing InterShardMemory

```typescript
import { EmpireManager } from '@ralphschuler/screeps-empire';

const empire = new EmpireManager();

// Write (only once per tick, per shard)
empire.updateShardStatus({
  role: 'core',
  status: 'healthy',
  rooms: Object.keys(Game.rooms).length,
  cpu: Game.cpu.getUsed(),
  bucket: Game.cpu.bucket
});

// Read from other shards
const shardData = empire.getShardData('shard1');
console.log(`Shard1 role: ${shardData.role}`);
```

---

## Shard Roles

### Core Shard

**Primary production shard**:
- Largest room count
- Highest GCL contribution
- Main resource stockpiles
- Most CPU allocation

```typescript
if (Memory.shard.role === 'core') {
  // Focus on:
  // - GCL upgrade
  // - Resource production
  // - Market trading
  // - Supporting other shards
}
```

### Expansion Shard

**Active growth**:
- Claiming new rooms
- Remote mining
- Building infrastructure
- High CPU usage during expansion

```typescript
if (Memory.shard.role === 'expansion') {
  // Focus on:
  // - Scouting new rooms
  // - Sending claimers
  // - Building bases
  // - Establishing economy
}
```

### Resource Shard

**Specialized mining**:
- Remote mining focus
- Resource extraction
- Minimal defense
- Feed resources to core shard

```typescript
if (Memory.shard.role === 'resource') {
  // Focus on:
  // - Remote mining operations
  // - Resource harvesting
  // - Transferring to core via portals
  // - Minimal base development
}
```

### Backup Shard

**Reserve capacity**:
- Dormant or minimal activity
- Emergency fallback
- Low CPU usage
- Ready for activation if needed

```typescript
if (Memory.shard.role === 'backup') {
  // Focus on:
  // - Maintaining 1-2 rooms
  // - Low CPU footprint
  // - Ready to expand if activated
}
```

---

## Cross-Shard Communication

### Portal Tracking

```typescript
import { PortalTracker } from '@ralphschuler/screeps-intershard';

const portals = new PortalTracker();

// Find portals in room
const roomPortals = portals.getPortalsInRoom('W10N10');

// Find path to another shard
const path = portals.findPathToShard('shard1', 'W5N5');
// Returns: ['W10N10', 'portal', 'shard1:W20N20']
```

### Cross-Shard Tasks

```typescript
import { EmpireManager } from '@ralphschuler/screeps-empire';

const empire = new EmpireManager();

// Create cross-shard colonization task
empire.createTask({
  type: 'colonize',
  fromShard: 'shard0',
  toShard: 'shard1',
  target: 'W10N10',
  creeps: ['claimer', 'pioneer_1', 'pioneer_2']
});

// On shard0: Check task and send creeps
const task = empire.getTask('colonize_shard1_W10N10');
if (task && task.status === 'pending') {
  // Spawn colonization creeps
  // Navigate to portal
  task.status = 'active';
}

// On shard1: Check for arriving creeps
if (task && task.status === 'active') {
  // Creeps should arrive near portal
  // Claim room W10N10
}
```

---

## Resource Transfers

### Portal-Based Transfers

```typescript
import { ResourceTransfer } from '@ralphschuler/screeps-intershard';

const transfer = new ResourceTransfer();

// Request resources from another shard
transfer.requestResource({
  fromShard: 'shard2',  // Resource shard
  toShard: 'shard0',    // Core shard
  resource: RESOURCE_ENERGY,
  amount: 100000,
  priority: 50
});

// On shard2: Process transfer request
const requests = transfer.getIncomingRequests('shard2');

for (const request of requests) {
  // Spawn haulers
  // Load resources
  // Send through portal to shard0
}
```

### Terminal Transfers (Same Shard)

```typescript
import { TerminalNetwork } from '@ralphschuler/screeps-economy';

const network = new TerminalNetwork();

// Send resources between rooms
network.sendResource({
  from: 'W10N10',
  to: 'W15N15',
  resource: RESOURCE_UTRIUM,
  amount: 5000
});
```

---

## Best Practices

### 1. Minimize InterShardMemory Usage

**Keep it small** (100 KB limit):

```typescript
// Bad: Storing large objects
InterShardMemory.setLocal(JSON.stringify({
  rooms: { /* all room data */ },    // Too large!
  creeps: { /* all creep data */ }   // Too large!
}));

// Good: Only essential data
InterShardMemory.setLocal(JSON.stringify({
  role: 'core',
  rooms: 15,
  cpu: 18.5,
  bucket: 8500,
  tasks: []  // Small array of active tasks only
}));
```

### 2. Update Infrequently

**Don't write every tick**:

```typescript
// Update empire data every 50 ticks
if (Game.time % 50 === 0) {
  empire.updateShardStatus({
    role: Memory.shard.role,
    status: calculateStatus(),
    rooms: Object.keys(Game.rooms).length,
    cpu: Game.cpu.getUsed(),
    bucket: Game.cpu.bucket
  });
}
```

### 3. Use Shard-Specific CPU Limits

```typescript
// Allocate CPU per shard
Game.cpu.setShardLimits({
  shard0: 15,  // Core: 15 CPU
  shard1: 10,  // Expansion: 10 CPU
  shard2: 8,   // Resource: 8 CPU
  shard3: 2    // Backup: 2 CPU
});
```

### 4. Handle Portal Delays

Creeps take **~50 ticks** to cross portals:

```typescript
// Track portal crossing
creep.memory.portalCrossing = {
  entered: Game.time,
  targetShard: 'shard1',
  targetRoom: 'W10N10'
};

// On target shard, wait for creep arrival
// Check after 100 ticks (buffer for delays)
```

### 5. Coordinate Empire-Level Goals

```typescript
// Empire sets goals
if (currentShard === 'shard0') {
  empire.setGoal('expand_shard1', {
    shard: 'shard1',
    target: 'W10N10',
    priority: 80
  });
}

// Other shards read and execute goals
if (currentShard === 'shard1') {
  const goals = empire.getGoalsForShard('shard1');
  for (const goal of goals) {
    executeGoal(goal);
  }
}
```

---

## Related Documentation

- **[Empire Package](../../../packages/@ralphschuler/screeps-empire/README.md)** - Empire coordination
- **[Intershard Package](../../../packages/@ralphschuler/screeps-intershard/README.md)** - Intershard communication
- **[Architecture](../architecture.md#five-layer-swarm-architecture)** - Layer 1 & 2 details

---

**Last Updated**: 2026-01-27  
**Framework Version**: 0.1.0
