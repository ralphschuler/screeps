# @ralphschuler/screeps-intershard

> Multi-shard coordination, resource transfers, and CPU distribution across shards

**Part of the [Screeps Framework](../../FRAMEWORK.md)** - Build powerful Screeps bots using modular, tested packages.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
- [Shard Roles](#shard-roles)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Console Commands](#console-commands)
- [Performance](#performance)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [Testing](#testing)
- [License](#license)

## Overview

### What It Does

The intershard package provides comprehensive multi-shard coordination for Screeps. It handles:
- **Shard Coordination**: Automatically assign roles to shards based on their state
- **CPU Distribution**: Dynamically allocate CPU limits based on shard needs
- **Portal Navigation**: Track portals and find optimal inter-shard routes
- **Resource Transfers**: Move resources between shards via portals
- **Health Monitoring**: Track CPU, bucket, economy, war, and commodity metrics per shard
- **Commodity Index**: Monitor factory production and commodity levels across shards

### When to Use This Package

- **Multi-Shard Presence**: You control rooms on multiple shards
- **Cross-Shard Resources**: Need to transfer resources between shards
- **CPU Optimization**: Want intelligent CPU distribution across shards
- **Expansion Planning**: Coordinated multi-shard expansion strategy

### Key Benefits

- **Fully Automated**: Zero manual shard management required
- **Intelligent Roles**: Automatic role assignment (Core, Frontier, Resource, War, Backup)
- **Efficient Transfers**: Optimal portal selection for resource movement
- **CPU Aware**: Dynamic CPU allocation based on bucket and efficiency
- **Memory Safe**: Compact serialization with automatic memory management

## Installation

```bash
npm install @ralphschuler/screeps-intershard
```

## Quick Start

### Basic Usage (< 5 minutes)

```typescript
import { shardManager } from '@ralphschuler/screeps-intershard';

// Initialize once at bot startup
shardManager.initialize();

// In main loop - runs automatically every 100 ticks
export function loop() {
  // Shard manager auto-runs via @Process decorator
  // Check current shard state
  const state = shardManager.getCurrentShardState();
  console.log(`Shard role: ${state?.role}`);
}
```

**Expected Result**: Shard manager tracks all shards, assigns roles, distributes CPU, and maintains health metrics automatically.

### Transfer Resources Between Shards

```typescript
import { shardManager } from '@ralphschuler/screeps-intershard';

// Transfer 10,000 energy to another shard
shardManager.createResourceTransferTask(
  'shard1',           // target shard
  'E10N10',           // target room
  RESOURCE_ENERGY,    // resource type
  10000,              // amount
  75                  // priority (0-100)
);
```

## Features

### Feature 1: Automatic Shard Role Assignment

Shards are automatically assigned roles based on their state:

**Benefits:**
- Zero manual configuration
- Dynamic role transitions as empires evolve
- Optimized CPU allocation per role

**Roles:**
- **Core**: Established empire (2+ rooms, RCL 4+) - Primary production
- **Frontier**: Expanding (1-2 rooms, RCL <4) - Growth phase
- **Resource**: High economy (3+ rooms, RCL 6+, economy index >70) - Resource production
- **War**: Active combat (war index >50) - Military operations
- **Backup**: Minimal presence (<2 rooms, RCL <3) - Low priority

**Example:**
```typescript
const state = shardManager.getCurrentShardState();
console.log(`Current role: ${state?.role}`);
// Automatically transitions: Frontier → Core → Resource (as empire grows)
```

### Feature 2: Dynamic CPU Distribution

CPU limits are intelligently distributed based on shard needs:

**Benefits:**
- High-priority shards get more CPU
- Low bucket shards get reduced CPU
- Efficiency-based scaling

**Factors:**
- Role weight (War: 1.2x, Core: 1.5x, Frontier: 0.8x, etc.)
- CPU usage efficiency (high usage = more allocation)
- Bucket level (low bucket = reduced allocation)
- Active tasks

**Example:**
```typescript
// CPU is automatically distributed
// War shards: 20-30% more CPU
// Core shards: 50% more CPU  
// Frontier shards: 20% less CPU
// Check allocation via console: shard.status()
```

### Feature 3: Portal Network & Optimal Routes

Tracks all portals and finds best routes between shards:

**Benefits:**
- Automatic portal discovery
- Stability and threat tracking
- Distance-optimized routing

**Example:**
```typescript
const portal = shardManager.getOptimalPortalRoute('shard1', 'E5N5');
if (portal) {
  console.log(`Best portal: ${portal.sourceRoom} → ${portal.targetShard}`);
  console.log(`Score: ${portal.stability} (higher is better)`);
}
```

### Feature 4: Cross-Shard Resource Transfers

Fully automated resource transfers via portals:

**Benefits:**
- Automatic source room selection
- Carrier creep coordination
- Progress tracking
- Priority queuing

**Transfer Lifecycle:**
```
queued → gathering → moving → transferring → complete
  ↓         ↓          ↓            ↓
spawn   collect    portal    cross-shard
```

**Example:**
```typescript
import { resourceTransferCoordinator } from '@ralphschuler/screeps-intershard';

// In main loop (every 10 ticks)
if (Game.time % 10 === 0) {
  resourceTransferCoordinator.run();
}

// Check active transfers
const active = resourceTransferCoordinator.getActiveRequests();
console.log(`${active.length} transfers in progress`);
```

### Feature 5: Comprehensive Health Monitoring

Track multiple metrics per shard:

**Metrics:**
- CPU usage and efficiency
- Bucket level
- Economy index (0-100)
- War index (0-100)
- Room count and average RCL
- Active task count

**Example:**
```typescript
const state = shardManager.getCurrentShardState();
if (state) {
  console.log(`CPU: ${(state.health.cpuUsage * 100).toFixed(1)}%`);
  console.log(`Bucket: ${state.health.bucketLevel}`);
  console.log(`Economy: ${state.health.economyIndex}/100`);
  console.log(`War: ${state.health.warIndex}/100`);
}
```

## Shard Roles

### Core Role
**Criteria**: 2+ rooms, average RCL ≥4

**Characteristics:**
- Established empire with stable economy
- Primary production and defense
- CPU allocation: 1.5x base
- Typical priority: High

### Frontier Role
**Criteria**: 1-2 rooms, average RCL <4

**Characteristics:**
- Expanding into new territory
- Growth and bootstrap phase
- CPU allocation: 0.8x base
- Typical priority: Medium

### Resource Role
**Criteria**: 3+ rooms, RCL ≥6, economy index >70

**Characteristics:**
- High-output resource production
- Surplus economy for exports
- CPU allocation: 1.0x base
- Typical priority: Medium-High

### War Role
**Criteria**: War index >50

**Characteristics:**
- Active combat operations
- High military pressure
- CPU allocation: 1.2x base
- Typical priority: Highest

### Backup Role
**Criteria**: Multi-shard + <2 rooms + RCL <3

**Characteristics:**
- Minimal presence (failover shard)
- Low activity level
- CPU allocation: 0.6x base
- Typical priority: Lowest

### Role Transitions

**Frontier → Core**: When established (3+ rooms, RCL 5+)
**War → Previous Role**: When war ends (war index <20)
**Core → Resource**: When economy strong (RCL 6+, economy index >70)

## API Reference

### ShardManager

Main coordinator for multi-shard operations.

#### `initialize(): void`

Initialize and load from InterShardMemory. Call once at bot startup.

**Example:**
```typescript
shardManager.initialize();
```

#### `run(): void`

Main tick processing. Runs automatically every 100 ticks via @Process decorator.

#### `createTask(type, targetShard, targetRoom?, priority?): void`

Create an inter-shard task.

**Parameters:**
- `type`: Task type ('colonize' | 'reinforce' | 'transfer' | 'evacuate')
- `targetShard`: Target shard name
- `targetRoom`: Optional target room
- `priority`: Optional priority (0-100, default: 50)

**Example:**
```typescript
shardManager.createTask('colonize', 'shard1', 'E5N5', 80);
shardManager.createTask('reinforce', 'shard2', 'W1N1', 90);
```

#### `createResourceTransferTask(targetShard, targetRoom, resourceType, amount, priority?): void`

Create a cross-shard resource transfer.

**Parameters:**
- `targetShard`: Destination shard
- `targetRoom`: Destination room
- `resourceType`: Resource type (e.g., RESOURCE_ENERGY)
- `amount`: Amount to transfer
- `priority`: Optional priority (0-100)

**Example:**
```typescript
shardManager.createResourceTransferTask(
  'shard1',
  'E10N10',
  RESOURCE_ENERGY,
  10000,
  75
);
```

#### `getOptimalPortalRoute(targetShard, fromRoom?): PortalInfo | null`

Find best portal to reach target shard.

**Parameters:**
- `targetShard`: Destination shard name
- `fromRoom`: Optional source room (for distance calculation)

**Returns:** PortalInfo with location and metrics, or null

**Example:**
```typescript
const portal = shardManager.getOptimalPortalRoute('shard1', 'E5N5');
if (portal) {
  console.log(`Portal at ${portal.sourceRoom}, stability: ${portal.stability}`);
}
```

#### `recordPortalTraversal(sourceRoom, targetShard, success): void`

Track portal crossing success/failure.

**Parameters:**
- `sourceRoom`: Portal room name
- `targetShard`: Target shard
- `success`: Whether crossing succeeded

**Example:**
```typescript
// After successful crossing
shardManager.recordPortalTraversal('E5N5', 'shard1', true);

// After failed crossing
shardManager.recordPortalTraversal('E5N5', 'shard1', false);
```

#### `getCurrentShardState(): ShardState | undefined`

Get state for current shard.

**Returns:**
```typescript
{
  shard: string;
  role: ShardRole;
  cpuLimit: number;
  health: ShardHealthMetrics;
  lastUpdate: number;
}
```

#### `getAllShards(): ShardState[]`

Get states for all known shards.

#### `setShardRole(role: ShardRole): void`

Manually override shard role.

**Example:**
```typescript
shardManager.setShardRole('war'); // Force war mode
```

### ResourceTransferCoordinator

Manages cross-shard resource transfers.

#### `run(): void`

Main processing. Call every 10 ticks.

**Example:**
```typescript
if (Game.time % 10 === 0) {
  resourceTransferCoordinator.run();
}
```

#### `getActiveRequests(): CrossShardTransferRequest[]`

Get all active transfer requests.

#### `getPrioritizedRequests(): CrossShardTransferRequest[]`

Get requests sorted by priority.

#### `assignCreep(requestId, creepName): void`

Assign a creep to a transfer request.

**Example:**
```typescript
const requests = resourceTransferCoordinator.getPrioritizedRequests();
if (requests.length > 0) {
  resourceTransferCoordinator.assignCreep(requests[0].id, creep.name);
}
```

### Types

#### ShardRole
```typescript
type ShardRole = 'core' | 'frontier' | 'resource' | 'backup' | 'war';
```

#### ShardHealthMetrics
```typescript
interface ShardHealthMetrics {
  cpuUsage: number;        // 0-1
  bucketLevel: number;     // 0-10000
  economyIndex: number;    // 0-100
  warIndex: number;        // 0-100
  roomCount: number;
  avgRCL: number;         // 0-8
}
```

#### PortalInfo
```typescript
interface PortalInfo {
  sourceRoom: string;
  targetShard: string;
  targetRoom?: string;
  stability: number;      // Success rate score
  threatRating: number;   // 0-100
  lastUsed: number;       // Game.time
}
```

## Usage Examples

### Example 1: Multi-Shard Bot Integration

**Scenario:** Run coordinated bot across multiple shards

**Code:**
```typescript
import { shardManager, resourceTransferCoordinator } from '@ralphschuler/screeps-intershard';
import { runCrossShardCarrier, handleCrossShardArrival } from '@ralphschuler/screeps-intershard/roles/crossShardCarrier';

// Initialize once
shardManager.initialize();

export function loop() {
  // Shard manager runs automatically via decorator
  
  // Resource transfer coordinator (every 10 ticks)
  if (Game.time % 10 === 0) {
    resourceTransferCoordinator.run();
  }
  
  // Process cross-shard carriers
  for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName];
    if (creep.memory.role === 'crossShardCarrier') {
      handleCrossShardArrival(creep);
      runCrossShardCarrier(creep);
    }
  }
  
  // Check shard health
  const state = shardManager.getCurrentShardState();
  if (state) {
    console.log(`Shard ${Game.shard.name}: ${state.role} role, CPU ${(state.health.cpuUsage * 100).toFixed(1)}%`);
  }
}
```

### Example 2: Emergency Resource Transfer

**Scenario:** Shard under attack needs energy urgently

**Code:**
```typescript
import { shardManager } from '@ralphschuler/screeps-intershard';

export function handleEmergency(targetShard: string, targetRoom: string) {
  // Check if target shard is in war mode
  const allShards = shardManager.getAllShards();
  const targetState = allShards.find(s => s.shard === targetShard);
  
  if (targetState && targetState.health.warIndex > 70) {
    // Send emergency energy transfer
    shardManager.createResourceTransferTask(
      targetShard,
      targetRoom,
      RESOURCE_ENERGY,
      50000,      // 50k energy
      100         // Highest priority
    );
    
    console.log(`Emergency energy transfer to ${targetShard}/${targetRoom}`);
  }
}
```

### Example 3: Expansion Coordination

**Scenario:** Coordinate expansion across shards

**Code:**
```typescript
import { shardManager } from '@ralphschuler/screeps-intershard';

export function planExpansion() {
  const allShards = shardManager.getAllShards();
  
  // Find frontier shards (good for expansion)
  const frontierShards = allShards.filter(s => 
    s.role === 'frontier' && 
    s.health.roomCount < 3 &&
    s.health.bucketLevel > 5000
  );
  
  // Find resource shards (can support expansion)
  const resourceShards = allShards.filter(s =>
    s.role === 'resource' &&
    s.health.economyIndex > 80
  );
  
  if (frontierShards.length > 0 && resourceShards.length > 0) {
    // Send resources from resource shard to frontier shard
    const source = resourceShards[0];
    const target = frontierShards[0];
    
    console.log(`Supporting ${target.shard} expansion from ${source.shard}`);
    
    shardManager.createResourceTransferTask(
      target.shard,
      'E5N5',  // Expansion target room
      RESOURCE_ENERGY,
      30000,
      80
    );
  }
}
```

## Console Commands

All shard management is accessible via the `shard` console namespace:

### Monitoring Commands

```javascript
// View current shard status
shard.status()

// List all known shards
shard.all()

// Check sync health
shard.syncStatus()

// View memory usage breakdown
shard.memoryStats()

// View CPU allocation history
shard.cpuHistory()
```

### Management Commands

```javascript
// Set shard role manually
shard.setRole('core')      // Options: core, frontier, resource, backup, war
shard.setRole('war')

// Force InterShardMemory sync with validation
shard.forceSync()
```

### Portal Commands

```javascript
// List all portals
shard.portals()

// List portals to specific shard
shard.portals('shard1')

// Find best portal route
shard.bestPortal('shard1')
shard.bestPortal('shard2', 'E1N1')  // from specific room
```

### Task Commands

```javascript
// Create cross-shard tasks
shard.createTask('colonize', 'shard1', 'E5N5', 80)
shard.createTask('reinforce', 'shard2', 'W1N1', 90)
shard.createTask('evacuate', 'shard0', 'E1N1', 100)

// List active inter-shard tasks
shard.tasks()
```

### Resource Transfer Commands

```javascript
// Create resource transfer
shard.transferResource('shard1', 'E5N5', 'energy', 50000, 70)
shard.transferResource('shard2', 'W1N1', 'U', 5000, 80)

// List active transfers
shard.transfers()
```

## Performance

### CPU Usage

**Typical CPU Cost:**
- ShardManager.run(): ~0.01-0.02 CPU (every 100 ticks)
- ResourceTransferCoordinator.run(): ~0.005-0.01 CPU (every 10 ticks)
- CrossShardCarrier per creep: ~0.1-0.2 CPU (standard movement)
- **Total average**: ~0.02-0.05 CPU per tick (multi-shard)

### Memory Usage

**Memory Footprint:**
- InterShardMemory: ~2-5 KB per shard (compact serialization)
- Transfer requests: ~0.5 KB per active transfer
- Carrier memory: ~100 bytes per creep
- **Total**: ~5-10 KB for typical multi-shard setup

### InterShardMemory Limits

**Size limit**: 100 KB total

**Typical usage:**
- Base structure: ~500 bytes
- Per shard state: ~800 bytes
- Per task: ~150 bytes
- Per portal: ~100 bytes

**Maximum capacity:**
- ~100 shards (minimal tasks/portals)
- ~500 tasks (minimal shards/portals)
- ~800 portals (minimal shards/tasks)

### Optimization Tips

1. **Limit Active Transfers**
   ```typescript
   // Only create new transfers when capacity available
   const active = resourceTransferCoordinator.getActiveRequests();
   if (active.length < 5) {
     // Create new transfer
   }
   ```

2. **Throttle Coordinator**
   ```typescript
   // Run coordinator less frequently for low-activity shards
   if (Game.time % 20 === 0) {  // Every 20 ticks instead of 10
     resourceTransferCoordinator.run();
   }
   ```

3. **Cache Shard State**
   ```typescript
   // Cache shard state to avoid repeated lookups
   if (!Memory.shardState || Game.time % 100 === 0) {
     Memory.shardState = shardManager.getCurrentShardState();
   }
   ```

## Troubleshooting

### Sync Issues

**Symptoms:**
- Stale shard data
- Missing shard states
- High memory usage

**Solution:**
```javascript
// 1. Check sync health
shard.syncStatus()

// 2. View memory breakdown
shard.memoryStats()

// 3. Force a validated sync
shard.forceSync()

// 4. System auto-trims if >90% memory
// Monitor: shard.memoryStats()
```

### Transfer Problems

**Symptoms:**
- Transfers stuck in "queued" state
- No carriers spawning
- Transfers failing

**Solution:**
```javascript
// 1. Check active transfers
shard.transfers()

// 2. Verify portal routes exist
shard.portals('targetShard')

// 3. Find best portal
shard.bestPortal('targetShard')

// 4. Check task status
shard.tasks()
```

**Common Causes:**
- No portal to target shard
- Insufficient spawn capacity
- Carrier died before completing transfer

### High Memory Usage

**Automatic Management:**
1. Old tasks removed after 5000 ticks
2. Old portals removed after 10000 ticks
3. Emergency trim if >100KB (keeps only current shard)

**Manual Cleanup:**
```javascript
// View current usage
shard.memoryStats()

// Force sync (triggers validation and trim)
shard.forceSync()
```

### CPU Distribution Issues

**Symptoms:**
- Wrong shard getting most CPU
- Bucket drain on important shard

**Solution:**
```javascript
// 1. Check current allocation
shard.status()

// 2. View CPU history
shard.cpuHistory()

// 3. Manually override role if needed
shard.setRole('core')  // Give this shard priority
```

## Development

### Building from Source

```bash
# Clone repository
git clone https://github.com/ralphschuler/screeps.git
cd screeps

# Install dependencies
npm install

# Build this package
npm run build:intershard

# Build all packages
npm run build:all
```

### Project Structure

```
packages/@ralphschuler/screeps-intershard/
├── src/
│   ├── index.ts                          # Main exports
│   ├── schema.ts                         # Data structures
│   ├── shardManager.ts                   # Shard coordination
│   ├── resourceTransferCoordinator.ts    # Transfer management
│   ├── roles/
│   │   └── crossShardCarrier.ts         # Carrier creep role
│   └── README.md                         # Internal docs
├── test/                                 # Tests
├── package.json
├── tsconfig.json
└── README.md                             # This file
```

### Contributing

See [CONTRIBUTING_FRAMEWORK.md](../../CONTRIBUTING_FRAMEWORK.md) for guidelines.

## Testing

### Running Tests

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

**Current coverage**: 80%+ (22 unit tests)

**Test areas:**
- Transfer request prioritization
- Portal route scoring
- CPU efficiency calculation
- Shard role transitions
- Transfer progress tracking
- Memory serialization/deserialization
- Sync validation and recovery

## License

[Unlicense](../../LICENSE) - This is free and unencumbered software released into the public domain.

## Related Packages

### Framework Core
- [@ralphschuler/screeps-kernel](../screeps-kernel) - Process scheduler
- [@ralphschuler/screeps-stats](../screeps-stats) - Statistics collection (includes shard metrics)

### Remote Operations
- [@ralphschuler/screeps-remote-mining](../screeps-remote-mining) - Remote harvesting
- [@ralphschuler/screeps-pathfinding](../screeps-pathfinding) - Multi-room pathfinding

### See Also
- [Framework Documentation](../../FRAMEWORK.md)
- [ROADMAP Section 3: Architecture Layers](../../ROADMAP.md)
- [ROADMAP Section 11: Cluster & Empire Logic](../../ROADMAP.md)

---

**Questions?** Check the [Framework Documentation](../../FRAMEWORK.md) or open an [issue](https://github.com/ralphschuler/screeps/issues).
