# Screeps Framework Overview

**Build powerful, efficient Screeps bots using modular, tested framework packages.**

The Screeps Framework provides a comprehensive collection of production-ready packages that implement the core systems needed for successful Screeps bots. Built on proven architectural patterns and optimized for CPU efficiency, the framework enables rapid bot development while maintaining the flexibility to customize and extend.

## Table of Contents

- [Design Philosophy](#design-philosophy)
- [Architecture Layers](#architecture-layers)
- [Key Concepts](#key-concepts)
- [Integration Patterns](#integration-patterns)
- [Package Ecosystem](#package-ecosystem)
- [Getting Started](#getting-started)
- [Next Steps](#next-steps)

---

## Design Philosophy

The framework is built on five core principles that guide all package development:

### 1. Modular Design

**Every package has a single, well-defined responsibility.**

Each package is designed to work independently, handling one specific aspect of bot functionality. This modularity allows you to:

- Use only the packages you need
- Replace individual packages with custom implementations
- Understand and debug smaller codebases
- Test components in isolation

```typescript
// Use just spawning
import { SpawnManager } from '@ralphschuler/screeps-spawn';

// Or add economy management
import { linkManager } from '@ralphschuler/screeps-economy';

// Or use the full suite
import { Kernel } from '@ralphschuler/screeps-kernel';
import { ChemistryManager } from '@ralphschuler/screeps-chemistry';
import { DefenseCoordinator } from '@ralphschuler/screeps-defense';
```

### 2. Framework-Agnostic

**Minimal coupling between packages. No vendor lock-in.**

The framework packages are designed to integrate with any bot architecture:

- No forced process model or event system
- No mandatory kernel or scheduler
- Direct function calls with clear APIs
- Works with existing bots incrementally

```typescript
// Direct integration - no framework required
export const loop = () => {
  for (const room of Object.values(Game.rooms)) {
    if (room.controller?.my) {
      // Just call the manager
      linkManager.run(room);
    }
  }
};
```

### 3. Performance First

**CPU-optimized with aggressive caching and strict budgets.**

Every package is designed with CPU efficiency as a primary concern:

- **Aggressive Caching**: Paths, scans, calculations cached with TTL
- **Lazy Evaluation**: Expensive operations deferred until needed
- **Early Returns**: Quick bailouts for common cases
- **Profiling**: All packages benchmarked and optimized

```typescript
// Example: Cached pathfinding (screeps-utils)
import { CachedPathfinder } from '@ralphschuler/screeps-utils';

// First call: expensive PathFinder.search (~0.5 CPU)
const path1 = CachedPathfinder.findPath(start, goal);

// Subsequent calls: cached lookup (~0.01 CPU)
const path2 = CachedPathfinder.findPath(start, goal); // Same result, 50x faster
```

**CPU Budget Targets:**
- Room-level operations: ≤ 0.1 CPU per room (economic mode)
- Combat operations: ≤ 0.25 CPU per room
- Global coordination: ≤ 1 CPU per 20-50 ticks

### 4. TypeScript Native

**Full TypeScript support with strict typing and IntelliSense.**

All packages written in TypeScript with:

- Strict null checks and type safety
- Complete type definitions
- JSDoc comments for better IntelliSense
- Compile-time error detection

```typescript
// Full type safety
import { SpawnRequest, SpawnResult } from '@ralphschuler/screeps-spawn';

const request: SpawnRequest = {
  role: 'harvester',
  priority: 100,
  memory: { role: 'harvester', room: room.name }
};

// TypeScript catches errors before deployment
const result: SpawnResult = spawnManager.processSpawnQueue(spawns, [request]);
// ✓ Type-checked: all fields validated
// ✓ IntelliSense: autocomplete for SpawnRequest fields
// ✓ Errors caught at compile time
```

### 5. Well Tested

**Comprehensive test coverage ensures reliability.**

Every package includes:

- Unit tests for all public APIs
- Integration tests for complex systems
- Performance benchmarks
- Continuous integration validation

```bash
# Run framework tests
npm run test:all

# Test specific packages
npm run test:spawn
npm run test:chemistry
npm run test:economy

# Test coverage reports
npm run test:coverage
```

**Quality Metrics:**
- Target: ≥ 80% code coverage
- All public APIs tested
- Edge cases validated
- Performance regression detection

---

## Architecture Layers

The framework implements a **five-layer swarm architecture** based on the design principles in [ROADMAP.md Section 3](../../ROADMAP.md#3-architektur-ebenen-schichtenmodell). This architecture enables scalable, decentralized bot control from individual creeps up to multi-shard empire coordination.

For detailed architectural rationale, see [ADR-0004: Five-Layer Swarm Architecture](../adr/0004-five-layer-swarm-architecture.md).

### Layer 1: Core Infrastructure

**Foundation layer providing essential utilities and caching.**

This layer provides the fundamental building blocks used by all higher layers:

**Key Packages:**
- `@ralphschuler/screeps-utils` - Caching, pathfinding, type guards
- `@ralphschuler/screeps-console` - In-game console commands
- `@ralphschuler/screeps-stats` - Performance metrics and monitoring

**Responsibilities:**
- Unified cache system with TTL and LRU eviction
- Pathfinding optimization (A*, cached routes)
- Common utility functions (distance, range checks)
- Performance monitoring and profiling
- Console command framework

**Example:**

```typescript
import { CacheManager, PathCache } from '@ralphschuler/screeps-utils';

// Initialize unified cache system
const cache = CacheManager.getInstance();

// Path caching with automatic TTL
const path = PathCache.findPath(creep.pos, target.pos, {
  maxRooms: 3,
  reusePath: 5 // Cache for 5 ticks
});

// Object caching for frequent Game.getObjectById calls
const cached = cache.object.get(structureId);
```

### Layer 2: Process Management

**CPU-budgeted process scheduling and lifecycle management.**

This layer manages how and when different bot subsystems execute:

**Key Packages:**
- `@ralphschuler/screeps-kernel` - Process scheduler with CPU budgets
- `@ralphschuler/screeps-posis` - POSIS process architecture
- `@ralphschuler/screeps-tasks` - Task queue management

**Responsibilities:**
- Priority-based process scheduling
- CPU budget enforcement and monitoring
- Process lifecycle (start, stop, suspend, resume)
- Task assignment and execution
- Fair CPU allocation across systems

**Example:**

```typescript
import { Kernel, Process } from '@ralphschuler/screeps-kernel';

const kernel = new Kernel({
  cpuBudget: 10, // Total CPU budget per tick
  enableAdaptiveBudgets: true // Adjust based on bucket
});

// Define processes with priorities and budgets
class SpawnProcess implements Process {
  id = 'spawning';
  priority = 90; // High priority (0-100 scale)
  cpuBudget = 0.5; // Max 0.5 CPU per tick
  interval = 1; // Run every tick
  
  run(): void {
    // Process spawning for all rooms
    for (const room of Object.values(Game.rooms)) {
      if (room.controller?.my) {
        spawnManager.processSpawnQueue(
          room.find(FIND_MY_SPAWNS),
          getSpawnRequests(room)
        );
      }
    }
  }
}

kernel.registerProcess(new SpawnProcess());
kernel.run(); // Call each tick
```

### Layer 3: Room-Level Systems

**Individual room management: spawning, economy, defense, construction.**

This layer handles all operations within a single room:

**Key Packages:**
- `@ralphschuler/screeps-spawn` - Spawning and body optimization
- `@ralphschuler/screeps-economy` - Links, terminals, factories, market
- `@ralphschuler/screeps-chemistry` - Lab automation and reactions
- `@ralphschuler/screeps-defense` - Towers, ramparts, safe mode
- `@ralphschuler/screeps-roles` - Creep role implementations

**Responsibilities:**
- Spawn queue management and body part optimization
- Resource collection and distribution (links, logistics)
- Lab reactions and boost production
- Tower automation and threat response
- Construction planning and execution
- Role-based creep behavior

**Example:**

```typescript
import { SpawnManager } from '@ralphschuler/screeps-spawn';
import { linkManager } from '@ralphschuler/screeps-economy';
import { ChemistryManager } from '@ralphschuler/screeps-chemistry';
import { DefenseCoordinator } from '@ralphschuler/screeps-defense';

const spawnManager = new SpawnManager();
const chemistry = new ChemistryManager();
const defense = new DefenseCoordinator();

// Room-level control loop
function runRoom(room: Room): void {
  // 1. Defense (highest priority)
  if (defense.hasThreats(room)) {
    defense.coordinateDefense(room);
  }
  
  // 2. Spawning
  const spawns = room.find(FIND_MY_SPAWNS);
  const requests = calculateSpawnRequests(room);
  spawnManager.processSpawnQueue(spawns, requests);
  
  // 3. Economy
  if (room.controller && room.controller.level >= 5) {
    linkManager.run(room); // Automatic link network
  }
  
  // 4. Chemistry (RCL 6+)
  if (room.controller && room.controller.level >= 6) {
    chemistry.planReactions(room, getGameState());
  }
}
```

### Layer 4: Colony-Level Coordination

**Multi-room clusters coordinating logistics, military, and expansion.**

This layer manages groups of related rooms (colonies/clusters):

**Key Packages:**
- `@ralphschuler/screeps-remote-mining` - Remote harvesting coordination
- `@ralphschuler/screeps-standards` - Inter-player communication (SS2)

**Responsibilities:**
- Cluster resource sharing (terminal routing)
- Coordinated military operations (multi-room squads)
- Remote mining management
- Cluster-wide threat response
- Inter-room logistics optimization

**Example:**

```typescript
import { RemoteMiningManager } from '@ralphschuler/screeps-remote-mining';

const remoteMining = new RemoteMiningManager();

// Colony-level coordination
function runColony(colony: Colony): void {
  // Coordinate all owned + remote rooms
  const ownedRooms = colony.rooms.filter(r => r.controller?.my);
  const remoteRooms = colony.remotes;
  
  // 1. Inter-room logistics
  balanceResources(ownedRooms);
  
  // 2. Remote mining
  for (const remote of remoteRooms) {
    remoteMining.manageRemote(remote, ownedRooms);
  }
  
  // 3. Coordinated defense
  if (colony.threatLevel >= 2) {
    mobilizeClusterDefense(colony);
  }
  
  // 4. Expansion planning
  if (shouldExpand(colony)) {
    planExpansion(colony);
  }
}
```

### Layer 5: Empire Management

**Global multi-shard coordination and strategic planning.**

This layer provides empire-wide strategy and cross-shard coordination:

**Responsibilities:**
- Shard role assignment (Core, Expansion, Resource, Backup)
- Inter-shard communication via InterShardMemory
- GCL progression and claim planning
- Global resource allocation
- Strategic goal setting (expansion, warfare, economy)
- Cross-shard logistics and portals

**Example:**

```typescript
// Empire-level control (runs less frequently: every 20-50 ticks)
class EmpireManager {
  private shardStatus: Map<string, ShardStatus>;
  
  updateEmpireStrategy(): void {
    // 1. Update shard status
    this.updateShardHealth();
    
    // 2. Assign shard roles
    this.assignShardRoles();
    
    // 3. Plan GCL usage
    const availableClaims = this.getAvailableClaims();
    if (availableClaims > 0) {
      this.planExpansion(availableClaims);
    }
    
    // 4. Cross-shard coordination
    this.coordinateCrossShard();
  }
  
  private assignShardRoles(): void {
    // Example shard roles
    const roles = new Map<string, ShardRole>();
    roles.set('shard0', 'core');      // Primary production
    roles.set('shard1', 'expansion'); // New territory
    roles.set('shard2', 'resource');  // Resource gathering
    roles.set('shard3', 'backup');    // Safety net
    
    // Write to InterShardMemory for cross-shard access
    InterShardMemory.setLocal(JSON.stringify({
      roles: Array.from(roles.entries()),
      timestamp: Game.time
    }));
  }
}

// Run empire manager periodically
if (Game.time % 50 === 0) {
  empireManager.updateEmpireStrategy();
}
```

---

## Key Concepts

The framework is built around several core concepts that enable emergent, scalable behavior:

### Process-Based Architecture

**Organize bot logic as independent processes with CPU budgets.**

The process-based architecture (POSIS pattern) structures your bot as a collection of independent processes, each with:

- Unique ID and priority
- CPU budget allocation
- Execution interval
- Lifecycle hooks (start, stop, suspend, resume)

**Benefits:**
- **Fair CPU allocation**: No single system monopolizes CPU
- **Easy debugging**: Isolate and profile individual processes
- **Graceful degradation**: Low-priority processes skip when CPU is scarce
- **Extensibility**: Add new processes without refactoring existing code

**Example:**

```typescript
import { Kernel, Process } from '@ralphschuler/screeps-kernel';

// Define custom process
class RemoteMiningProcess implements Process {
  id = 'remote-mining';
  priority = 70;
  cpuBudget = 1.0;
  interval = 5; // Run every 5 ticks
  
  run(): void {
    for (const colony of getColonies()) {
      for (const remote of colony.remotes) {
        manageRemoteMining(remote, colony);
      }
    }
  }
}

// Define another process
class MarketProcess implements Process {
  id = 'market-trading';
  priority = 30; // Lower priority
  cpuBudget = 0.5;
  interval = 100; // Run every 100 ticks
  
  run(): void {
    analyzeMarket();
    executeTrades();
  }
}

const kernel = new Kernel({ cpuBudget: 20 });
kernel.registerProcess(new RemoteMiningProcess());
kernel.registerProcess(new MarketProcess());

export const loop = () => {
  kernel.run(); // Processes execute in priority order with CPU budgets
};
```

### Stigmergic Communication (Pheromones)

**Coordinate through simple environmental signals, not complex messages.**

The pheromone system enables **emergent coordination** without centralized control. Rooms and creeps leave "scent trails" (numerical signals) that others read and respond to.

**Core Principles:**
- **Indirect communication**: No direct creep-to-creep messages
- **Environmental signals**: Pheromones stored in room memory
- **Local decisions**: Creeps respond to local pheromone levels
- **Emergent behavior**: Global strategy emerges from local rules

**Pheromone Types:**

| Pheromone | Purpose | Decay Rate | Diffusion |
|-----------|---------|------------|-----------|
| `expand` | Desire to claim new rooms | 95% (slow) | 30% |
| `harvest` | Energy harvesting priority | 90% (fast) | 10% |
| `build` | Construction priority | 92% | 15% |
| `upgrade` | Controller upgrade priority | 93% | 10% |
| `defense` | Defensive response needed | 97% (very slow) | 40% |
| `war` | Offensive warfare mode | 98% | 50% |
| `siege` | Maximum escalation | 99% (extremely slow) | 60% |
| `logistics` | Resource distribution needed | 91% | 20% |

**Example: Pheromone-Driven Spawning**

```typescript
import { PheromoneManager } from './pheromone';

const pheromoneManager = new PheromoneManager();

function getSpawnRequests(room: Room): SpawnRequest[] {
  const swarm = room.memory.swarm;
  const pheromones = swarm.pheromones;
  
  // Spawn based on dominant pheromone
  if (pheromones.defense > 50) {
    // High defense pheromone → spawn defenders
    return [{
      role: 'defender',
      priority: 100,
      memory: { role: 'defender', room: room.name }
    }];
  }
  
  if (pheromones.harvest > 40) {
    // High harvest pheromone → spawn harvesters
    return [{
      role: 'harvester',
      priority: 80,
      memory: { role: 'harvester', room: room.name }
    }];
  }
  
  if (pheromones.build > 30) {
    // High build pheromone → spawn builders
    return [{
      role: 'builder',
      priority: 60,
      memory: { role: 'builder', room: room.name }
    }];
  }
  
  // Default: economic creeps
  return [{
    role: 'upgrader',
    priority: 50,
    memory: { role: 'upgrader', room: room.name }
  }];
}
```

**Example: Event-Driven Pheromone Updates**

```typescript
// Pheromones update automatically on events
pheromoneManager.onHostileDetected(swarm, hostileCount, dangerLevel);
// → Increases defense, war, and siege pheromones
// → Diffuses to neighboring rooms (early warning)

pheromoneManager.onStructureDestroyed(swarm, STRUCTURE_TOWER);
// → Increases defense and build pheromones
// → Escalates danger level

pheromoneManager.onNukeDetected(swarm);
// → Sets danger to maximum (3)
// → Spikes siege pheromone
// → Cluster-wide mobilization via diffusion
```

**Example: Pheromone Diffusion**

Pheromones spread to neighboring rooms, enabling cluster coordination:

```typescript
// Room W1N1 has defense=80 (under attack)
// Diffusion rate for defense: 40%

pheromoneManager.applyDiffusion(roomMap);

// After diffusion:
// - W1N1: defense=80 (source)
// - W2N1: defense=16 (80 * 0.4 * 0.5 = 16)
// - W1N2: defense=16
// - W0N1: defense=16
// - W1N0: defense=16

// Neighbors automatically prepare defensive response
```

For complete pheromone system documentation, see [PHEROMONES_GUIDE.md](../PHEROMONES_GUIDE.md).

### Role System

**Specialized creep behaviors for different tasks.**

The role system provides pre-built, optimized implementations of common creep types:

**Available Roles:**
- **Harvester**: Energy collection from sources
- **Hauler**: Energy transport and logistics
- **Builder**: Construction and repair
- **Upgrader**: Controller upgrading
- **Defender**: Tower support and combat
- **Scout**: Room exploration and intel
- **Claimer**: Room claiming and reservation
- **Miner**: Static source mining (container-based)
- **Remote Harvester**: Remote room energy collection

**Example: Using Roles**

```typescript
import { RoleRegistry } from '@ralphschuler/screeps-roles';

const registry = new RoleRegistry();

// Register default roles
registry.registerDefaults();

// Run creeps
for (const creep of Object.values(Game.creeps)) {
  const role = registry.getRole(creep.memory.role);
  if (role) {
    role.run(creep);
  }
}
```

**Example: Custom Role**

```typescript
import { Role } from '@ralphschuler/screeps-roles';

class CustomMinerRole implements Role {
  name = 'custom-miner';
  
  run(creep: Creep): void {
    // Read pheromones for decision making
    const room = Game.rooms[creep.memory.room];
    const pheromones = room.memory.swarm.pheromones;
    
    // Switch behavior based on pheromones
    if (pheromones.defense > 50) {
      // Emergency: help with repairs
      this.repairCriticalStructures(creep);
    } else if (pheromones.logistics > 40) {
      // High logistics need: deliver to storage
      this.deliverToStorage(creep);
    } else {
      // Normal: mine source
      this.mineSource(creep);
    }
  }
  
  private mineSource(creep: Creep): void {
    const source = Game.getObjectById(creep.memory.sourceId);
    if (source) {
      if (creep.pos.isNearTo(source)) {
        creep.harvest(source);
      } else {
        creep.moveTo(source);
      }
    }
  }
  
  private repairCriticalStructures(creep: Creep): void {
    // Implementation...
  }
  
  private deliverToStorage(creep: Creep): void {
    // Implementation...
  }
}

registry.registerRole(new CustomMinerRole());
```

### Caching Infrastructure

**Aggressive caching with TTL and LRU eviction for maximum CPU efficiency.**

The unified cache system provides multiple cache types with automatic management:

**Cache Types:**

1. **Room Find Cache**: Cache results of `room.find()` calls
2. **Object Cache**: Cache `Game.getObjectById()` lookups
3. **Path Cache**: Cache pathfinding results
4. **Role Cache**: Cache creep role assignments
5. **Body Part Cache**: Cache spawn body calculations

**Features:**
- TTL-based expiration
- LRU eviction when memory constrained
- Namespace isolation (per-room, per-creep, etc.)
- Hit rate monitoring
- Heap and Memory storage backends

**Example: Room Find Cache**

```typescript
import { CacheManager } from '@ralphschuler/screeps-utils';

const cache = CacheManager.getInstance();

// First call: expensive room.find() operation
const sources = cache.roomFind.get(
  room.name,
  FIND_SOURCES,
  5 // TTL: 5 ticks
);
// → Executes room.find(FIND_SOURCES)
// → Stores result in cache

// Subsequent calls within 5 ticks: instant lookup
const sources2 = cache.roomFind.get(room.name, FIND_SOURCES, 5);
// → Returns cached result
// → ~100x faster than room.find()
```

**Example: Path Cache**

```typescript
import { PathCache } from '@ralphschuler/screeps-utils';

// Cache paths with automatic serialization
const path = PathCache.findPath(start, goal, {
  maxRooms: 3,
  reusePath: 10 // Cache for 10 ticks
});

// Path reused for creeps with same start/goal
const path2 = PathCache.findPath(start, goal);
// → Returns same cached path
// → No PathFinder.search() call needed
```

**Performance Impact:**

| Operation | Without Cache | With Cache | Speedup |
|-----------|--------------|------------|---------|
| `room.find()` | ~0.05 CPU | ~0.0005 CPU | 100x |
| `PathFinder.search()` | ~0.5 CPU | ~0.005 CPU | 100x |
| `Game.getObjectById()` | ~0.002 CPU | ~0.0001 CPU | 20x |

---

## Integration Patterns

The framework supports three integration patterns, allowing you to choose the right approach for your bot:

### Pattern 1: Direct Integration

**Call managers directly from your main loop.**

The simplest integration pattern - just import and call package functions directly.

**When to use:**
- Small to medium bots (< 10 rooms)
- Simple control flow
- Learning the framework
- Prototyping new features

**Advantages:**
- Easy to understand and debug
- Full control over execution order
- No additional complexity
- Works with any bot architecture

**Example:**

```typescript
import { SpawnManager } from '@ralphschuler/screeps-spawn';
import { linkManager } from '@ralphschuler/screeps-economy';
import { ChemistryManager } from '@ralphschuler/screeps-chemistry';

const spawnManager = new SpawnManager({ debug: true });
const chemistry = new ChemistryManager();

export const loop = () => {
  // Direct calls - you control execution order
  for (const room of Object.values(Game.rooms)) {
    if (room.controller?.my) {
      // 1. Spawning
      const spawns = room.find(FIND_MY_SPAWNS);
      const requests = calculateSpawnRequests(room);
      spawnManager.processSpawnQueue(spawns, requests);
      
      // 2. Link management (RCL 5+)
      if (room.controller.level >= 5) {
        linkManager.run(room);
      }
      
      // 3. Chemistry (RCL 6+)
      if (room.controller.level >= 6) {
        const reaction = chemistry.planReactions(room, getGameState());
        if (reaction) {
          chemistry.executeReaction(room, reaction);
        }
      }
    }
  }
};
```

### Pattern 2: Process-Based Integration

**Register managers as processes with CPU budgets.**

Use the kernel to manage execution with priority and CPU budgets.

**When to use:**
- Medium to large bots (10+ rooms)
- CPU budget constraints
- Complex multi-system bots
- Need fair CPU allocation

**Advantages:**
- Automatic CPU budget enforcement
- Priority-based execution
- Graceful degradation (low-priority processes skip on CPU shortage)
- Built-in profiling and monitoring
- Fair CPU distribution across systems

**Example:**

```typescript
import { Kernel, Process } from '@ralphschuler/screeps-kernel';
import { SpawnManager } from '@ralphschuler/screeps-spawn';
import { linkManager } from '@ralphschuler/screeps-economy';

const kernel = new Kernel({
  cpuBudget: 20,
  enableAdaptiveBudgets: true // Reduce budgets when bucket is low
});

// Define processes
class SpawnProcess implements Process {
  id = 'spawning';
  priority = 90; // High priority
  cpuBudget = 2.0;
  interval = 1; // Every tick
  
  run(): void {
    const spawnManager = new SpawnManager();
    for (const room of Object.values(Game.rooms)) {
      if (room.controller?.my) {
        const spawns = room.find(FIND_MY_SPAWNS);
        spawnManager.processSpawnQueue(spawns, getSpawnRequests(room));
      }
    }
  }
}

class EconomyProcess implements Process {
  id = 'economy';
  priority = 70;
  cpuBudget = 1.5;
  interval = 1;
  
  run(): void {
    for (const room of Object.values(Game.rooms)) {
      if (room.controller?.my && room.controller.level >= 5) {
        linkManager.run(room);
      }
    }
  }
}

class ChemistryProcess implements Process {
  id = 'chemistry';
  priority = 50;
  cpuBudget = 1.0;
  interval = 5; // Every 5 ticks
  
  run(): void {
    const chemistry = new ChemistryManager();
    for (const room of Object.values(Game.rooms)) {
      if (room.controller?.my && room.controller.level >= 6) {
        chemistry.planReactions(room, getGameState());
      }
    }
  }
}

// Register processes
kernel.registerProcess(new SpawnProcess());
kernel.registerProcess(new EconomyProcess());
kernel.registerProcess(new ChemistryProcess());

export const loop = () => {
  kernel.run(); // Executes processes in priority order with CPU budgets
};
```

### Pattern 3: Event-Driven Integration

**React to game events using task queues.**

Use the task system to create event-driven behaviors.

**When to use:**
- Complex creep behaviors
- Asynchronous operations
- Task prioritization
- State machine implementations

**Advantages:**
- Reactive programming model
- Task persistence across ticks
- Priority queues
- Easy to pause/resume tasks
- Decouples task creation from execution

**Example:**

```typescript
import { TaskQueue, Task } from '@ralphschuler/screeps-tasks';

// Define custom tasks
class HarvestTask implements Task {
  id: string;
  priority: number;
  creepName: string;
  sourceId: Id<Source>;
  
  constructor(creep: Creep, source: Source) {
    this.id = `harvest-${creep.name}-${source.id}`;
    this.priority = 80;
    this.creepName = creep.name;
    this.sourceId = source.id;
  }
  
  execute(): boolean {
    const creep = Game.creeps[this.creepName];
    const source = Game.getObjectById(this.sourceId);
    
    if (!creep || !source) return true; // Task complete (creep/source gone)
    
    if (creep.store.getFreeCapacity() === 0) {
      return true; // Task complete (creep full)
    }
    
    if (creep.pos.isNearTo(source)) {
      creep.harvest(source);
    } else {
      creep.moveTo(source);
    }
    
    return false; // Task ongoing
  }
}

class UpgradeTask implements Task {
  id: string;
  priority: number;
  creepName: string;
  
  constructor(creep: Creep) {
    this.id = `upgrade-${creep.name}`;
    this.priority = 50;
    this.creepName = creep.name;
  }
  
  execute(): boolean {
    const creep = Game.creeps[this.creepName];
    const controller = creep.room.controller;
    
    if (!creep || !controller) return true;
    
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      return true; // No energy, task complete
    }
    
    if (creep.pos.inRangeTo(controller, 3)) {
      creep.upgradeController(controller);
    } else {
      creep.moveTo(controller);
    }
    
    return false;
  }
}

// Task queue management
const taskQueue = new TaskQueue();

// Event-driven task creation
function onCreepSpawned(creep: Creep): void {
  if (creep.memory.role === 'harvester') {
    // Add harvest task
    const source = creep.pos.findClosestByPath(FIND_SOURCES);
    if (source) {
      taskQueue.add(new HarvestTask(creep, source));
    }
  }
}

function onCreepIdling(creep: Creep): void {
  // Creep has no current task - assign based on pheromones
  const pheromones = creep.room.memory.swarm.pheromones;
  
  if (pheromones.harvest > 50) {
    const source = creep.pos.findClosestByPath(FIND_SOURCES);
    if (source) {
      taskQueue.add(new HarvestTask(creep, source));
    }
  } else if (pheromones.upgrade > 30) {
    taskQueue.add(new UpgradeTask(creep));
  }
}

export const loop = () => {
  // Process task queue
  taskQueue.processTasks();
  
  // Handle events
  for (const creep of Object.values(Game.creeps)) {
    if (!taskQueue.hasTask(creep.name)) {
      onCreepIdling(creep);
    }
  }
};
```

---

## Package Ecosystem

The framework consists of 15+ specialized packages organized by responsibility:

### Package Dependency Graph

```
┌────────────────────────────────────────────────────────┐
│                   Your Bot (main.ts)                    │
└────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌──────────────┐
│ Process Layer │  │  Room Systems │  │ Colony Layer │
├───────────────┤  ├───────────────┤  ├──────────────┤
│ • kernel      │  │ • spawn       │  │ • remote-    │
│ • posis       │  │ • economy     │  │   mining     │
│ • tasks       │  │ • chemistry   │  │ • standards  │
│               │  │ • defense     │  │              │
│               │  │ • roles       │  │              │
└───────────────┘  └───────────────┘  └──────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
                ┌──────────────────┐
                │ Infrastructure   │
                ├──────────────────┤
                │ • utils          │
                │ • console        │
                │ • stats          │
                │ • pathfinding    │
                │ • visuals        │
                └──────────────────┘
```

### Core Packages

#### Process Management

**[@ralphschuler/screeps-kernel](../../packages/@ralphschuler/screeps-kernel)**
- Process scheduler with CPU budget management
- Priority-based execution
- Wrap-around queue for fair processing
- Adaptive budgets based on bucket level
- Built-in profiling

**[@ralphschuler/screeps-posis](../../packages/screeps-posis)**
- POSIS (Process-Oriented Screeps Interface System) architecture
- Hierarchical process trees
- Inter-process communication
- Process lifecycle management
- State persistence

**[@ralphschuler/screeps-tasks](../../packages/screeps-tasks)**
- Task queue with priorities
- Task assignment to creeps
- Task lifecycle tracking
- Predefined task types (harvest, build, upgrade, repair)

#### Room Systems

**[@ralphschuler/screeps-spawn](../../packages/screeps-spawn)**
- Smart body part selection based on available energy
- Priority-based spawn queue
- Role templates for all creep types
- Bootstrap mode support
- Body part optimization algorithms

**[@ralphschuler/screeps-economy](../../packages/screeps-economy)**
- Link network automation (source → controller)
- Terminal routing with Dijkstra optimization
- Factory management and commodities
- Market trading with price analysis
- Resource balancing across rooms

**[@ralphschuler/screeps-chemistry](../../packages/screeps-chemistry)**
- Reaction chain planning (A + B → C)
- Lab role assignment (input/output labs)
- Boost management and production
- Just-in-time reaction scheduling
- Resource requirement calculation

**[@ralphschuler/screeps-defense](../../packages/screeps-defense)**
- Tower automation (heal allies, attack hostiles, repair)
- Threat assessment and prioritization
- Safe mode management
- Rampart repair coordination
- Hostile tracking and intel

**[@ralphschuler/screeps-roles](../../packages/@ralphschuler/screeps-roles)**
- Complete role implementations (harvester, hauler, builder, etc.)
- Behavior trees for each role
- Energy-efficient movement
- Remote mining support
- Extensible role registry

#### Colony Coordination

**[@ralphschuler/screeps-remote-mining](../../packages/@ralphschuler/screeps-remote-mining)**
- Remote source identification
- Miner and hauler coordination
- Road construction planning
- Reservation management
- Remote defense

**[@ralphschuler/screeps-standards](../../packages/@ralphschuler/screeps-standards)**
- SS2 Terminal Communications Protocol
- Multi-packet message transmission
- Inter-player messaging
- Protocol standardization

#### Infrastructure

**[@ralphschuler/screeps-utils](../../packages/screeps-utils)**
- Unified cache system (room find, objects, paths)
- TTL-based cache expiration
- LRU eviction
- Pathfinding utilities
- Type guards and validators

**[@ralphschuler/screeps-pathfinding](../../packages/@ralphschuler/screeps-pathfinding)**
- A* pathfinding implementation
- Cached route planning
- Road construction optimization
- Multi-room pathfinding
- Obstacle avoidance

**[@ralphschuler/screeps-console](../../packages/@ralphschuler/screeps-console)**
- In-game console command framework
- Command registration and execution
- Help text generation
- Autocomplete support

**[@ralphschuler/screeps-stats](../../packages/screeps-stats)**
- Performance metric collection
- CPU profiling
- Memory usage tracking
- Grafana integration
- Stats dashboard generation

**[@ralphschuler/screeps-visuals](../../packages/screeps-visuals)**
- RoomVisual helpers
- Pheromone visualization
- Path visualization
- Structure planning overlays
- Debug information display

### Monitoring & Debugging

**[@ralphschuler/screeps-loki-exporter](../../packages/screeps-loki-exporter)**
- Export logs to Grafana Loki
- Structured logging
- Label-based filtering

**[@ralphschuler/screeps-graphite-exporter](../../packages/screeps-graphite-exporter)**
- Export metrics to Graphite
- Time-series data collection

### MCP Servers (AI Agent Integration)

**[@ralphschuler/screeps-mcp](../../packages/screeps-mcp)**
- Live game state access
- Memory inspection
- Console command execution
- Real-time monitoring

**[@ralphschuler/screeps-docs-mcp](../../packages/screeps-docs-mcp)**
- Official API documentation
- Game mechanics reference
- Best practices

**[@ralphschuler/screeps-typescript-mcp](../../packages/screeps-typescript-mcp)**
- TypeScript type definitions
- Type relationships
- Interface documentation

**[@ralphschuler/screeps-wiki-mcp](../../packages/screeps-wiki-mcp)**
- Community strategies
- Bot architectures
- Optimization patterns

---

## Getting Started

### Installation

Install the packages you need:

```bash
# Core packages
npm install @ralphschuler/screeps-spawn
npm install @ralphschuler/screeps-economy
npm install @ralphschuler/screeps-utils

# Process management (optional)
npm install @ralphschuler/screeps-kernel

# Additional systems (as needed)
npm install @ralphschuler/screeps-chemistry
npm install @ralphschuler/screeps-defense
npm install @ralphschuler/screeps-roles
```

### Minimal Example

Create a basic bot using just spawning and economy:

```typescript
// main.ts
import { SpawnManager } from '@ralphschuler/screeps-spawn';
import { linkManager } from '@ralphschuler/screeps-economy';

const spawnManager = new SpawnManager({
  debug: true,
  rolePriorities: {
    harvester: 100,
    hauler: 90,
    upgrader: 80,
    builder: 70
  }
});

export const loop = () => {
  // Process each owned room
  for (const room of Object.values(Game.rooms)) {
    if (room.controller?.my) {
      // Build spawn requests based on creep counts
      const creeps = room.find(FIND_MY_CREEPS);
      const harvesters = creeps.filter(c => c.memory.role === 'harvester');
      const haulers = creeps.filter(c => c.memory.role === 'hauler');
      const upgraders = creeps.filter(c => c.memory.role === 'upgrader');
      
      const requests = [];
      
      // Need harvesters?
      if (harvesters.length < 2) {
        requests.push({
          role: 'harvester',
          priority: 100,
          memory: { role: 'harvester', room: room.name }
        });
      }
      
      // Need haulers?
      if (haulers.length < 2) {
        requests.push({
          role: 'hauler',
          priority: 90,
          memory: { role: 'hauler', room: room.name }
        });
      }
      
      // Need upgraders?
      if (upgraders.length < 3) {
        requests.push({
          role: 'upgrader',
          priority: 80,
          memory: { role: 'upgrader', room: room.name }
        });
      }
      
      // Process spawn queue
      const spawns = room.find(FIND_MY_SPAWNS);
      spawnManager.processSpawnQueue(spawns, requests);
      
      // Manage links (RCL 5+)
      if (room.controller.level >= 5) {
        linkManager.run(room);
      }
    }
  }
};
```

### Incremental Adoption

Add framework packages incrementally to existing bots:

**Step 1: Start with Spawning**
```typescript
import { SpawnManager } from '@ralphschuler/screeps-spawn';
// Replace your spawn logic with framework spawning
```

**Step 2: Add Economy**
```typescript
import { linkManager } from '@ralphschuler/screeps-economy';
// Automatic link management - just call linkManager.run(room)
```

**Step 3: Add Chemistry**
```typescript
import { ChemistryManager } from '@ralphschuler/screeps-chemistry';
// Automatic lab reactions
```

**Step 4: Add Process Management**
```typescript
import { Kernel } from '@ralphschuler/screeps-kernel';
// Wrap existing systems in processes with CPU budgets
```

### Complete Examples

See the [examples/](../../examples/) directory for:
- **minimal-bot**: Basic bot using core framework packages
- **process-bot**: Process-based architecture with kernel
- **swarm-bot**: Full swarm implementation with pheromones

---

## Next Steps

### Documentation

- **[FRAMEWORK.md](../../FRAMEWORK.md)**: Package overview and publishing status
- **[ROADMAP.md](../../ROADMAP.md)**: Swarm architecture and design principles
- **[PHEROMONES_GUIDE.md](../PHEROMONES_GUIDE.md)**: Complete pheromone system guide
- **[CONTRIBUTING_FRAMEWORK.md](../../CONTRIBUTING_FRAMEWORK.md)**: Framework development guidelines

### Package Documentation

Each package includes comprehensive documentation:

- [Kernel API](../../packages/@ralphschuler/screeps-kernel/README.md)
- [Spawn API](../../packages/screeps-spawn/README.md)
- [Economy API](../../packages/screeps-economy/README.md)
- [Chemistry API](../../packages/screeps-chemistry/README.md)
- [Defense API](../../packages/screeps-defense/README.md)
- [Utils API](../../packages/screeps-utils/README.md)
- [And more...](../../FRAMEWORK.md#api-reference)

### Architecture Deep Dives

- **[ADR-0004: Five-Layer Swarm Architecture](../adr/0004-five-layer-swarm-architecture.md)**
- **[ADR-0002: Pheromone Coordination System](../adr/0002-pheromone-coordination-system.md)**
- **[MEMORY_ARCHITECTURE.md](../MEMORY_ARCHITECTURE.md)**
- **[DEFENSE_COORDINATION.md](../DEFENSE_COORDINATION.md)**

### Development

- **[Development Guide](../../CONTRIBUTING_FRAMEWORK.md)**: Build and test framework packages
- **[Publishing Guide](../../PUBLISHING.md)**: Package publishing workflow
- **[Quality Gates](../../QUALITY_GATES.md)**: Testing and quality standards

### Support

- **Issues**: [GitHub Issues](https://github.com/ralphschuler/screeps/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ralphschuler/screeps/discussions)
- **Examples**: [examples/](../../examples/) directory

---

## Summary

The Screeps Framework provides:

✅ **Modular packages** - Use what you need, ignore the rest  
✅ **CPU-optimized** - Aggressive caching and strict budgets  
✅ **Production-tested** - Comprehensive test coverage  
✅ **TypeScript native** - Full type safety and IntelliSense  
✅ **Framework-agnostic** - Works with any bot architecture  
✅ **Well documented** - Complete API reference and guides  
✅ **Five-layer architecture** - Scalable from creeps to empire  
✅ **Pheromone coordination** - Emergent swarm behavior  
✅ **Process management** - Fair CPU allocation and budgets  
✅ **Incremental adoption** - Add packages one at a time  

**Start building powerful Screeps bots today!**

---

*Last updated: 2025-01-23*  
*Framework version: 0.1.0*  
*For the latest documentation, see [github.com/ralphschuler/screeps](https://github.com/ralphschuler/screeps)*
