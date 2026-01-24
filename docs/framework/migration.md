# Migration Guide: Adopting the Screeps Framework

This comprehensive guide covers migrating from various Screeps bot architectures to the modular Screeps Framework. The framework is designed for incremental adoption—you can start small and gradually integrate more packages as needed.

## Table of Contents

1. [Migration Overview](#migration-overview)
2. [From Overmind](#from-overmind)
3. [From Screeps-TypeScript-Starter](#from-screeps-typescript-starter)
4. [From Monolithic/Single-File Bots](#from-monolithicsingle-file-bots)
5. [From Other Frameworks](#from-other-frameworks)
6. [Testing Your Migration](#testing-your-migration)
7. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
8. [Performance Optimization](#performance-optimization)

---

## Migration Overview

### Framework Philosophy

The Screeps Framework is built on these core principles:

1. **Modularity**: Use only what you need. Each package is independently useful.
2. **Minimal Dependencies**: Packages have clean interfaces and minimal coupling.
3. **Incremental Adoption**: Migrate one system at a time without breaking your bot.
4. **Framework Agnostic**: Designed to integrate with existing bots, not replace them.
5. **Production Ready**: Battle-tested with comprehensive test coverage (>80%).

### Available Packages

| Package | Purpose | Key Features |
|---------|---------|--------------|
| `@ralphschuler/screeps-spawn` | Spawn management | Priority queues, body optimization, role definitions |
| `@ralphschuler/screeps-economy` | Resource flow | Link networks, terminal routing, factory management, market trading |
| `@ralphschuler/screeps-chemistry` | Lab automation | Reaction chains, boost production, just-in-time stockpiling |
| `@ralphschuler/screeps-defense` | Combat systems | Threat detection, tower coordination, rampart management |
| `@ralphschuler/screeps-tasks` | Task coordination | Task assignment, priority systems, creep behaviors |
| `@ralphschuler/screeps-utils` | Utilities | Caching, logging, common helpers |

### Migration Strategy

**Recommended approach:**
1. Start with utilities and spawn system (low risk, high value)
2. Add economy packages when you reach RCL 5+ (links)
3. Integrate chemistry when you have labs
4. Add defense when you need coordinated combat
5. Adopt tasks/kernel for advanced coordination

---

## From Overmind

Overmind is a comprehensive framework with strong opinions about architecture. The Screeps Framework shares similar goals but with a more modular, composable design.

### Conceptual Mapping

| Overmind Concept | Framework Equivalent | Notes |
|------------------|---------------------|-------|
| `Overlord` | `Process` (kernel) or direct management | More lightweight, optional |
| `Zerg` | `Role` (screeps-roles) or custom | Framework roles are simpler |
| `Colony` | Room-level logic (custom) | You implement your own room orchestration |
| `DirectiveHarvest` | `SpawnRequest` | Spawn system is queue-based |
| `LinkNetwork` | `LinkManager` | Similar functionality, cleaner API |
| `EvolutionChamber` | `ChemistryManager` | More flexible reaction planning |
| `HiveCluster` | Custom room layout | Framework doesn't prescribe layouts |
| `RoadPlanner` | Custom implementation | Framework focuses on resource flow |
| `SpawnGroup` | `SpawnManager` | Priority-based, multi-spawn support |


### Step-by-Step Migration

#### Phase 1: Replace Spawn System

**Before (Overmind):**
```typescript
// Overmind spawning
import { Zerg } from './zerg/Zerg';
import { Overlord } from './overlords/Overlord';

class HarvestOverlord extends Overlord {
  init() {
    const setup = Setups.drones.harvesters.default;
    this.wishlist(2, setup);
  }
  
  run() {
    this.autoRun(this.harvesters, harvester => harvester.harvest());
  }
}

// In colony
colony.spawner.spawn(protoCreep, { priority: 100, directions: [1, 7] });
```

**After (Framework):**
```typescript
// Framework spawning
import { SpawnManager, SpawnRequest } from '@ralphschuler/screeps-spawn';

const spawnManager = new SpawnManager({
  debug: false,
  rolePriorities: {
    harvester: 100,
    hauler: 90,
    upgrader: 80
  }
});

// Build spawn requests based on room needs
function buildHarvesterRequests(room: Room): SpawnRequest[] {
  const sources = room.find(FIND_SOURCES);
  const harvesters = _.filter(Game.creeps, c => c.memory.role === 'harvester' && c.memory.room === room.name);
  
  const requests: SpawnRequest[] = [];
  
  for (const source of sources) {
    const sourceHarvesters = _.filter(harvesters, h => h.memory.sourceId === source.id);
    if (sourceHarvesters.length < 2) {
      requests.push({
        role: 'harvester',
        priority: 100,
        memory: {
          role: 'harvester',
          room: room.name,
          sourceId: source.id,
          working: false
        }
      });
    }
  }
  
  return requests;
}

// In main loop
export function loop() {
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (!room.controller || !room.controller.my) continue;
    
    const spawns = room.find(FIND_MY_SPAWNS);
    const requests = buildHarvesterRequests(room);
    
    spawnManager.processSpawnQueue(spawns, requests);
  }
}
```

**Key Differences:**
- Framework uses **request-based spawning** instead of Overlord wishlist
- You control spawn logic with custom functions
- No automatic role assignment—you define the behavior
- More explicit, less "magic"


#### Phase 2: Replace Link Management

**Before (Overmind):**
```typescript
// Overmind links
class LinkNetwork {
  constructor(public colony: Colony) {
    this.settings = {
      enableLinks: true,
      distributionMode: LinkDistributionMode.EnergyBalance
    };
  }
  
  receive() {
    for (const link of this.colony.links) {
      if (link.store[RESOURCE_ENERGY] > LINK_CAPACITY * 0.9) {
        const target = this.findBestTarget(link);
        if (target) {
          link.transferEnergy(target);
        }
      }
    }
  }
}

// Usage
colony.linkNetwork.receive();
```

**After (Framework):**
```typescript
// Framework links
import { LinkManager } from '@ralphschuler/screeps-economy';

const linkManager = new LinkManager({
  minSourceLinkEnergy: 400,      // Transfer when half full
  controllerLinkMaxEnergy: 700,  // Keep controller link nearly full
  transferThreshold: 100         // Minimum energy to justify transfer
});

// In main loop (runs every 5 ticks)
export function loop() {
  if (Game.time % 5 !== 0) return;
  
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (!room.controller || !room.controller.my) continue;
    if (room.controller.level < 5) continue; // Links available at RCL 5
    
    linkManager.run(room);
  }
}
```

**Migration Benefits:**
- **Simpler API**: Just call `linkManager.run(room)`
- **Automatic role detection**: Framework detects source/controller/storage links
- **Configurable behavior**: Set thresholds via constructor
- **No memory structure requirements**: Works with any bot


#### Phase 3: Replace Lab System

**Before (Overmind):**
```typescript
// Overmind labs
class EvolutionChamber {
  constructor(public colony: Colony) {
    this.labs = colony.labs;
    this.reagentLabs = [];
    this.productLabs = [];
  }
  
  run() {
    if (this.productionQueue.length > 0) {
      const task = this.productionQueue[0];
      this.produce(task.mineral, task.amount);
    }
  }
  
  produce(mineralType: MineralCompoundConstant, amount: number) {
    const reaction = REACTIONS[mineralType];
    // Complex setup and execution logic
  }
}
```

**After (Framework):**
```typescript
// Framework chemistry
import { ChemistryManager, LabConfigManager } from '@ralphschuler/screeps-chemistry';

const chemistry = new ChemistryManager({ logger: console });
const labConfig = new LabConfigManager({ logger: console });

// Initialize labs (run once per room)
export function initializeLabs(room: Room) {
  labConfig.initialize(room.name);
  
  // Optionally import saved configuration
  if (Memory.rooms[room.name]?.labConfig) {
    labConfig.importConfig(Memory.rooms[room.name].labConfig);
  }
}

// Define game state
export function getGameState(room: Room) {
  return {
    currentTick: Game.time,
    danger: calculateDanger(room),        // Your danger calculation
    posture: determinePosture(room),      // Your posture logic
    pheromones: { war: 0, siege: 0 }
  };
}

// In main loop
export function loop() {
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (!room.controller || !room.controller.my) continue;
    if (room.controller.level < 6) continue; // Labs at RCL 6
    
    const labs = room.find(FIND_MY_LABS);
    if (labs.length < 3) continue;
    
    // Initialize if needed
    if (!labConfig.getConfig(room.name)) {
      initializeLabs(room);
    }
    
    // Plan reactions based on current state
    const state = getGameState(room);
    const reaction = chemistry.planReactions(room, state);
    
    if (reaction) {
      labConfig.setActiveReaction(room.name, reaction.input1, reaction.input2, reaction.product);
      labConfig.runReactions(room.name);
    }
    
    // Persist config to memory
    const config = labConfig.exportConfig(room.name);
    if (config && Memory.rooms[room.name]) {
      Memory.rooms[room.name].labConfig = config;
    }
  }
}
```

**Key Advantages:**
- **Automatic reaction chains**: Framework calculates multi-step reactions
- **Just-in-time production**: Stockpile targets adjust based on game state
- **Spatial optimization**: Auto-detects optimal input/output lab assignments
- **Boost integration**: Built-in boost configs for common roles

#### Phase 4: Replace Creep Logic

**Before (Overmind):**
```typescript
// Overmind Zerg
class Zerg {
  task: Task | null;
  
  run() {
    if (this.task) {
      return this.task.run();
    }
  }
}

class Harvester extends Zerg {
  run() {
    if (!this.pos.isNearTo(this.source)) {
      this.goTo(this.source);
    } else {
      this.harvest(this.source);
    }
  }
}
```

**After (Framework):**
```typescript
// Framework roles (simple functions)
export function runHarvester(creep: Creep): void {
  if (!creep.memory.sourceId) {
    console.log(`Harvester ${creep.name} has no source assigned`);
    return;
  }
  
  const source = Game.getObjectById(creep.memory.sourceId as Id<Source>);
  if (!source) {
    console.log(`Harvester ${creep.name} source not found`);
    return;
  }
  
  // Harvest if near source
  if (creep.pos.isNearTo(source)) {
    creep.harvest(source);
  } else {
    creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
  }
}

// In main loop
export function loop() {
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    
    switch (creep.memory.role) {
      case 'harvester':
        runHarvester(creep);
        break;
      case 'hauler':
        runHauler(creep);
        break;
      // ... other roles
    }
  }
}
```

**OR use Framework tasks (optional):**
```typescript
import { TaskManager, Task } from '@ralphschuler/screeps-tasks';

const taskManager = new TaskManager();

// Define task
const harvestTask: Task = {
  type: 'harvest',
  priority: 100,
  targetId: source.id,
  creepName: creep.name
};

taskManager.assignTask(creep, harvestTask);

// In creep logic
export function loop() {
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    taskManager.runCreepTask(creep);
  }
}
```

#### Phase 5: Migration Checklist

Complete migration from Overmind:

- [ ] Replace spawn system with `SpawnManager`
- [ ] Replace link network with `LinkManager`
- [ ] Replace lab system with `ChemistryManager` + `LabConfigManager`
- [ ] Migrate creep roles (keep simple or adopt tasks)
- [ ] Remove Overmind dependencies from package.json
- [ ] Update memory structures to remove Overmind-specific fields
- [ ] Test extensively in simulation before deploying
- [ ] Monitor CPU usage during migration

### Overmind Migration Tips

1. **Keep your room planning**: Framework doesn't prescribe room layouts. Keep your bunker/stamp designs.
2. **Gradual migration**: Run both systems in parallel during transition.
3. **Memory cleanup**: Overmind stores extensive memory data. Clean up gradually to avoid bucket drain.
4. **CPU budget**: Framework is generally more CPU-efficient, but test your specific use case.
5. **Feature parity**: Some Overmind features (road planning, automatic expansions) aren't in the framework—implement them yourself or adopt third-party packages.

---

## From Screeps-TypeScript-Starter

The TypeScript Starter is a minimal template, making it easy to integrate framework packages incrementally.

### Integration Strategy

The framework is designed to complement the starter template, not replace it. You can keep your existing code and add framework packages for specific features.

#### Step 1: Install Framework Packages

```bash
# Install packages you need
npm install @ralphschuler/screeps-spawn
npm install @ralphschuler/screeps-economy
npm install @ralphschuler/screeps-chemistry
npm install @ralphschuler/screeps-utils
```

Update your `package.json`:
```json
{
  "dependencies": {
    "@ralphschuler/screeps-spawn": "^1.0.0",
    "@ralphschuler/screeps-economy": "^1.0.0",
    "@ralphschuler/screeps-chemistry": "^1.0.0",
    "@ralphschuler/screeps-utils": "^1.0.0"
  }
}
```


#### Step 2: Replace Role Implementations (Optional)

**Before (TypeScript Starter):**
```typescript
// src/role.harvester.ts
export const roleHarvester = {
  run(creep: Creep): void {
    if (creep.store.getFreeCapacity() > 0) {
      const sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], {
          visualizePathStyle: { stroke: "#ffaa00" }
        });
      }
    } else {
      const targets = creep.room.find(FIND_STRUCTURES, {
        filter: structure => {
          return (
            (structure.structureType === STRUCTURE_EXTENSION ||
              structure.structureType === STRUCTURE_SPAWN ||
              structure.structureType === STRUCTURE_TOWER) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        }
      });
      if (targets.length > 0) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], {
            visualizePathStyle: { stroke: "#ffffff" }
          });
        }
      }
    }
  }
};

// src/main.ts
import { roleHarvester } from "./role.harvester";

export const loop = () => {
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    
    if (creep.memory.role === "harvester") {
      roleHarvester.run(creep);
    }
  }
};
```

**After (Framework Integration):**
```typescript
// src/main.ts
import { SpawnManager, SpawnRequest } from '@ralphschuler/screeps-spawn';
import { LinkManager } from '@ralphschuler/screeps-economy';
import { roleHarvester } from "./role.harvester"; // Keep your existing roles!

const spawnManager = new SpawnManager();
const linkManager = new LinkManager();

export const loop = () => {
  // 1. Handle creeps (keep existing logic)
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    
    if (creep.memory.role === "harvester") {
      roleHarvester.run(creep); // Keep using your roles
    }
    // ... other roles
  }
  
  // 2. Use framework for spawning
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (!room.controller || !room.controller.my) continue;
    
    const spawns = room.find(FIND_MY_SPAWNS);
    const requests = buildSpawnRequests(room); // Your logic
    
    spawnManager.processSpawnQueue(spawns, requests);
  }
  
  // 3. Use framework for link management (RCL 5+)
  if (Game.time % 5 === 0) {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my && room.controller.level >= 5) {
        linkManager.run(room);
      }
    }
  }
};

function buildSpawnRequests(room: Room): SpawnRequest[] {
  const harvesters = _.filter(Game.creeps, c => c.memory.role === 'harvester' && c.memory.room === room.name);
  const requests: SpawnRequest[] = [];
  
  if (harvesters.length < 2) {
    requests.push({
      role: 'harvester',
      priority: 100,
      memory: { role: 'harvester', room: room.name, working: false }
    });
  }
  
  return requests;
}
```

#### Step 3: Add Advanced Features

**Add lab automation:**
```typescript
import { ChemistryManager, LabConfigManager } from '@ralphschuler/screeps-chemistry';

const chemistry = new ChemistryManager();
const labConfig = new LabConfigManager();

// Add to your main loop
export const loop = () => {
  // ... existing code ...
  
  // Lab management (RCL 6+)
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (room.controller?.my && room.controller.level >= 6) {
      
      if (!labConfig.getConfig(room.name)) {
        labConfig.initialize(room.name);
      }
      
      const state = {
        currentTick: Game.time,
        danger: 0,
        posture: 'eco' as const,
        pheromones: {}
      };
      
      const reaction = chemistry.planReactions(room, state);
      if (reaction) {
        labConfig.setActiveReaction(room.name, reaction.input1, reaction.input2, reaction.product);
        labConfig.runReactions(room.name);
      }
    }
  }
};
```

**Add terminal routing:**
```typescript
import { TerminalManager } from '@ralphschuler/screeps-economy';

const terminalManager = new TerminalManager({
  minStorageEnergy: 100000,
  terminalEnergyTarget: 50000,
  maxTransferCostRatio: 0.3
});

// Run every 20 ticks
export const loop = () => {
  if (Game.time % 20 === 0) {
    // Terminal manager handles inter-room resource distribution
    terminalManager.run();
  }
};
```

#### Step 4: Optimize with Utilities

```typescript
import { createCache, CacheManager } from '@ralphschuler/screeps-utils';

// Create caches for expensive operations
const sourceCache = createCache<Source[]>('sources', 50); // 50 tick TTL
const pathCache = createCache<PathFinderPath>('paths', 100);

function findSources(room: Room): Source[] {
  return sourceCache.get(room.name, () => {
    return room.find(FIND_SOURCES);
  });
}

function findPath(from: RoomPosition, to: RoomPosition): PathFinderPath {
  const key = `${from.x},${from.y},${from.roomName}-${to.x},${to.y},${to.roomName}`;
  return pathCache.get(key, () => {
    return PathFinder.search(from, { pos: to, range: 1 });
  });
}
```

### TypeScript Starter Migration Benefits

1. **No breaking changes**: Keep your existing code and add framework features
2. **Gradual adoption**: Add packages one at a time
3. **Easy testing**: Test each package integration independently
4. **CPU optimization**: Framework packages use efficient algorithms and caching
5. **Reduced boilerplate**: Let framework handle complex systems like labs and terminals

---

## From Monolithic/Single-File Bots

If you have a single-file bot or monolithic codebase, the framework helps you modularize incrementally.

### Assessment

First, identify what your bot does:
- [ ] Spawning creeps
- [ ] Harvesting energy
- [ ] Upgrading controller
- [ ] Building structures
- [ ] Link management
- [ ] Lab reactions
- [ ] Terminal trading
- [ ] Defense

For each system, decide: keep custom or adopt framework?

### Step 1: Extract Spawn Logic

**Before (Monolithic):**
```typescript
// main.ts - Everything in one file
export const loop = () => {
  // Spawn logic mixed with everything else
  const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester');
  
  if (harvesters.length < 2) {
    const newName = 'Harvester' + Game.time;
    Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName, {
      memory: { role: 'harvester', room: 'W1N1', working: false }
    });
  }
  
  const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader');
  
  if (upgraders.length < 3) {
    const newName = 'Upgrader' + Game.time;
    Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE, MOVE], newName, {
      memory: { role: 'upgrader', room: 'W1N1', working: false }
    });
  }
  
  // More spawn logic for other roles...
  
  // Creep logic
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    
    if (creep.memory.role === 'harvester') {
      // Harvester logic inline...
    } else if (creep.memory.role === 'upgrader') {
      // Upgrader logic inline...
    }
    // ... more roles
  }
  
  // Structure logic inline...
  // Tower logic inline...
  // Everything in one giant file!
};
```

**After (Framework):**
```typescript
// main.ts - Orchestration only
import { SpawnManager } from '@ralphschuler/screeps-spawn';
import { runCreeps } from './creeps';
import { runStructures } from './structures';
import { buildSpawnRequests } from './spawning';

const spawnManager = new SpawnManager();

export const loop = () => {
  // Clean, modular structure
  runSpawning();
  runCreeps();
  runStructures();
};

function runSpawning() {
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (!room.controller?.my) continue;
    
    const spawns = room.find(FIND_MY_SPAWNS);
    const requests = buildSpawnRequests(room);
    
    spawnManager.processSpawnQueue(spawns, requests);
  }
}
```

```typescript
// spawning.ts - Extracted spawn logic
import { SpawnRequest } from '@ralphschuler/screeps-spawn';

export function buildSpawnRequests(room: Room): SpawnRequest[] {
  const requests: SpawnRequest[] = [];
  
  // Count creeps by role
  const counts = _.countBy(
    _.filter(Game.creeps, c => c.memory.room === room.name),
    c => c.memory.role
  );
  
  // Request harvesters
  const sources = room.find(FIND_SOURCES);
  const neededHarvesters = sources.length * 2;
  if ((counts['harvester'] || 0) < neededHarvesters) {
    requests.push({
      role: 'harvester',
      priority: 100,
      memory: { role: 'harvester', room: room.name, working: false }
    });
  }
  
  // Request upgraders
  if ((counts['upgrader'] || 0) < 3) {
    requests.push({
      role: 'upgrader',
      priority: 80,
      memory: { role: 'upgrader', room: room.name, working: false }
    });
  }
  
  // ... more roles
  
  return requests;
}
```

```typescript
// creeps.ts - Extracted creep logic
export function runCreeps() {
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    
    switch (creep.memory.role) {
      case 'harvester':
        runHarvester(creep);
        break;
      case 'upgrader':
        runUpgrader(creep);
        break;
      // ... more roles
    }
  }
}

function runHarvester(creep: Creep) {
  // Harvester logic
}

function runUpgrader(creep: Creep) {
  // Upgrader logic
}
```


### Step 2: Add Link Management (RCL 5+)

**Before (Monolithic):**
```typescript
// main.ts - Manual link logic
export const loop = () => {
  // ... other code ...
  
  // Manual link transfers
  const room = Game.rooms['W1N1'];
  const links = room.find(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_LINK
  }) as StructureLink[];
  
  for (const link of links) {
    if (link.store[RESOURCE_ENERGY] > 700) {
      // Hardcoded logic to find controller link
      const controllerLink = room.controller?.pos.findInRange(links, 3)[0];
      if (controllerLink && controllerLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        link.transferEnergy(controllerLink);
      }
    }
  }
};
```

**After (Framework):**
```typescript
// main.ts
import { LinkManager } from '@ralphschuler/screeps-economy';

const linkManager = new LinkManager();

export const loop = () => {
  // ... other code ...
  
  // Link management in one line!
  if (Game.time % 5 === 0) {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my && room.controller.level >= 5) {
        linkManager.run(room);
      }
    }
  }
};
```

### Step 3: Progressive Refactoring Plan

**Week 1: Extract spawn system**
- Install `@ralphschuler/screeps-spawn`
- Create `spawning.ts` module
- Replace inline spawn code with `SpawnManager`
- Test in simulation

**Week 2: Modularize creep logic**
- Create `creeps/` directory with role files
- Extract each role to its own file
- Add role registry pattern
- Test role switching

**Week 3: Add economy packages (RCL 5+)**
- Install `@ralphschuler/screeps-economy`
- Replace manual link code with `LinkManager`
- Add terminal routing if you have multiple rooms
- Monitor resource flow

**Week 4: Add lab automation (RCL 6+)**
- Install `@ralphschuler/screeps-chemistry`
- Remove manual lab code
- Configure reaction priorities
- Test boost production

**Week 5+: Advanced features**
- Add defense coordination
- Implement task system
- Optimize with caching utilities
- Benchmark CPU improvements

### Monolithic Migration Checklist

- [ ] Create directory structure (src/creeps, src/structures, src/spawning, etc.)
- [ ] Extract spawn logic to dedicated module
- [ ] Replace spawn code with `SpawnManager`
- [ ] Extract creep roles to separate files
- [ ] Create role registry/dispatcher
- [ ] Add framework packages for links (RCL 5+)
- [ ] Add framework packages for labs (RCL 6+)
- [ ] Add framework packages for terminals (multiple rooms)
- [ ] Add utilities (caching, logging)
- [ ] Remove old inline code
- [ ] Test in simulation
- [ ] Deploy gradually (one room at a time)
- [ ] Monitor CPU and behavior

---

## From Other Frameworks

### General Migration Pattern

Most Screeps frameworks share common concepts. Here's a general mapping:

| Common Concept | Framework Equivalent | Package |
|----------------|---------------------|---------|
| Spawn queue/manager | `SpawnManager` | `screeps-spawn` |
| Link network | `LinkManager` | `screeps-economy` |
| Lab manager | `ChemistryManager` + `LabConfigManager` | `screeps-chemistry` |
| Terminal logistics | `TerminalManager` | `screeps-economy` |
| Task system | `TaskManager` | `screeps-tasks` |
| Creep roles | Custom or framework roles | Your code or `screeps-tasks` |
| Room planner | Custom implementation | Not provided |
| Defense | `DefenseCoordinator` | `screeps-defense` |

### From Bonzai Bot

Bonzai uses a room-centric architecture with offices and franchises.

**Concept mapping:**
- `Office` → Room-level management (custom)
- `Franchise` → Remote mining logic (custom)
- `Minion` → Creep with role (custom or framework)
- `Analyst` → Resource planning (custom + framework economy)
- `Supervisor` → Task assignment (framework `TaskManager`)

**Migration approach:**
1. Keep room/office structure
2. Replace spawn logic with framework
3. Adopt economy packages for links/terminals
4. Keep or replace task system

### From ScreepsBot

ScreepsBot uses a process-based architecture.

**Concept mapping:**
- `Process` → Framework doesn't require processes, but you can keep them
- `Kernel` → Optional (framework packages work standalone)
- `CreepProcess` → Role functions or `TaskManager`
- `SpawnProcess` → `SpawnManager`

**Migration approach:**
1. Framework packages integrate easily with process architecture
2. Replace individual processes with framework equivalents
3. Keep kernel if desired, or run framework directly in main loop

### From Quorum

Quorum uses a centralized decision-making system.

**Concept mapping:**
- `Imperator` → Your main loop coordination
- `Legatus` → Room-level logic (custom)
- `Consul` → Resource distribution (`TerminalManager`)
- `Spawn queue` → `SpawnManager`

**Migration approach:**
1. Keep Imperator/centralized architecture
2. Replace subsystems with framework packages
3. Integrate framework into existing decision tree

---

## Testing Your Migration

### Pre-Migration Testing

Before migrating, establish baselines:

```typescript
// Collect baseline metrics
const baseline = {
  cpu: {
    used: Game.cpu.getUsed(),
    limit: Game.cpu.limit,
    bucket: Game.cpu.bucket
  },
  creeps: Object.keys(Game.creeps).length,
  rooms: Object.keys(Game.rooms).length,
  gcl: Game.gcl.level,
  gclProgress: Game.gcl.progress
};

console.log('Baseline metrics:', JSON.stringify(baseline));
```

### Simulation Testing

Test migrations in private server or simulation:

1. **Deploy to simulation first**
2. **Run for 1000+ ticks**
3. **Monitor metrics:**
   - CPU usage (per tick and average)
   - Memory usage
   - Creep spawn rate
   - Resource collection rate
   - Structure build rate

```typescript
// Collect migration metrics
const metrics = {
  tick: Game.time,
  cpu: Game.cpu.getUsed(),
  bucket: Game.cpu.bucket,
  creeps: Object.keys(Game.creeps).length,
  spawning: _.filter(Game.spawns, s => s.spawning).length
};

if (!Memory.metrics) Memory.metrics = [];
Memory.metrics.push(metrics);

// Analyze every 100 ticks
if (Game.time % 100 === 0) {
  const recent = Memory.metrics.slice(-100);
  const avgCpu = _.sum(recent.map(m => m.cpu)) / recent.length;
  console.log(`Average CPU: ${avgCpu.toFixed(2)} / ${Game.cpu.limit}`);
}
```

### A/B Testing

Run both systems in parallel:

```typescript
// Enable/disable framework per room
const FRAMEWORK_ROOMS = ['W1N1', 'W2N1']; // Test rooms
const LEGACY_ROOMS = ['W1N2']; // Control rooms

export const loop = () => {
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    
    if (FRAMEWORK_ROOMS.includes(roomName)) {
      // Use framework
      runFrameworkLogic(room);
    } else if (LEGACY_ROOMS.includes(roomName)) {
      // Use legacy code
      runLegacyLogic(room);
    }
  }
  
  // Compare metrics
  compareMetrics(FRAMEWORK_ROOMS, LEGACY_ROOMS);
};
```

### Rollback Plan

Always have a rollback strategy:

1. **Keep old code in git**: Use branches for migration
2. **Feature flags**: Toggle framework on/off per room
3. **Memory backup**: Save Memory before major changes
4. **Gradual rollout**: Migrate one room at a time

```typescript
// Feature flag pattern
const ENABLE_FRAMEWORK_SPAWN = true;
const ENABLE_FRAMEWORK_LINKS = false; // Rollback by setting to false

export const loop = () => {
  if (ENABLE_FRAMEWORK_SPAWN) {
    runFrameworkSpawning();
  } else {
    runLegacySpawning();
  }
  
  if (ENABLE_FRAMEWORK_LINKS) {
    runFrameworkLinks();
  } else {
    runLegacyLinks();
  }
};
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Memory Structure Conflicts

**Problem**: Framework expects different memory structure than your bot.

**Solution**: Use adapter pattern to translate between structures.

```typescript
// Adapter for spawn requests
function adaptSpawnRequests(yourRequests: YourSpawnRequest[]): SpawnRequest[] {
  return yourRequests.map(req => ({
    role: req.type,
    priority: req.urgency,
    memory: {
      role: req.type,
      room: req.targetRoom,
      ...req.customData
    }
  }));
}

// Usage
const yourRequests = buildYourSpawnQueue(room);
const frameworkRequests = adaptSpawnRequests(yourRequests);
spawnManager.processSpawnQueue(spawns, frameworkRequests);
```

### Pitfall 2: CPU Spikes During Migration

**Problem**: Running both old and new systems causes CPU spikes.

**Solution**: Migrate one system at a time with bucket guards.

```typescript
export const loop = () => {
  // Bucket guard
  if (Game.cpu.bucket < 1000) {
    console.log('Low bucket, running minimal logic');
    runMinimalLogic();
    return;
  }
  
  // Gradual migration
  if (Game.cpu.bucket > 5000) {
    runFrameworkLogic(); // More expensive but better
  } else {
    runLegacyLogic(); // Cheaper but older
  }
};
```

### Pitfall 3: Creeps Don't Spawn

**Problem**: Spawn requests not working, creeps don't appear.

**Solution**: Check spawn request format and room energy.

```typescript
// Debug spawn requests
const requests = buildSpawnRequests(room);
console.log(`Spawn requests for ${room.name}:`, JSON.stringify(requests));

const spawns = room.find(FIND_MY_SPAWNS);
console.log(`Spawns: ${spawns.length}, Energy: ${room.energyAvailable}/${room.energyCapacityAvailable}`);

const results = spawnManager.processSpawnQueue(spawns, requests);
for (const result of results) {
  if (!result.success) {
    console.log(`Spawn failed: ${result.message}`);
  }
}
```

### Pitfall 4: Links Not Transferring

**Problem**: Links have energy but don't transfer.

**Solution**: Check link roles and cooldowns.

```typescript
// Debug link system
const links = room.find(FIND_MY_STRUCTURES, {
  filter: s => s.structureType === STRUCTURE_LINK
}) as StructureLink[];

console.log(`Links in ${room.name}:`);
for (const link of links) {
  console.log(`  ${link.id}: ${link.store[RESOURCE_ENERGY]}/${link.store.getCapacity(RESOURCE_ENERGY)} energy, cooldown: ${link.cooldown}`);
}

// Run link manager with debug
const linkManager = new LinkManager({ debug: true });
linkManager.run(room);
```

### Pitfall 5: Labs Not Reacting

**Problem**: Labs configured but no reactions happening.

**Solution**: Check lab configuration and input resources.

```typescript
// Debug lab system
const config = labConfig.getConfig(room.name);
if (!config) {
  console.log(`No lab config for ${room.name}, initializing...`);
  labConfig.initialize(room.name);
}

const inputLabs = labConfig.getInputLabs(room.name);
console.log(`Input labs: ${inputLabs.input1?.id}, ${inputLabs.input2?.id}`);

const outputLabs = labConfig.getOutputLabs(room.name);
console.log(`Output labs: ${outputLabs.length}`);

// Check active reaction
if (config?.activeReaction) {
  console.log(`Active reaction: ${config.activeReaction.input1} + ${config.activeReaction.input2} → ${config.activeReaction.output}`);
}
```

### Pitfall 6: Terminal Routing Issues

**Problem**: Terminals not sending resources between rooms.

**Solution**: Check terminal network and transfer costs.

```typescript
// Debug terminal routing
const terminalManager = new TerminalManager({ debug: true });

// Check if rooms are connected
const rooms = Object.keys(Game.rooms).filter(r => Game.rooms[r].controller?.my);
console.log(`Owned rooms: ${rooms.join(', ')}`);

// Check terminal availability
for (const roomName of rooms) {
  const terminal = Game.rooms[roomName].terminal;
  console.log(`${roomName} terminal: ${terminal ? 'present' : 'missing'}`);
  if (terminal) {
    console.log(`  Energy: ${terminal.store[RESOURCE_ENERGY]}`);
  }
}
```

---

## Performance Optimization

### CPU Profiling

Use profiling to identify bottlenecks:

```typescript
// Simple profiler
class Profiler {
  private timings: Map<string, number[]> = new Map();
  
  start(label: string): () => void {
    const startCpu = Game.cpu.getUsed();
    
    return () => {
      const elapsed = Game.cpu.getUsed() - startCpu;
      
      if (!this.timings.has(label)) {
        this.timings.set(label, []);
      }
      this.timings.get(label)!.push(elapsed);
    };
  }
  
  report() {
    console.log('=== CPU Profile ===');
    for (const [label, timings] of this.timings.entries()) {
      const avg = _.sum(timings) / timings.length;
      const max = _.max(timings);
      console.log(`${label}: avg ${avg.toFixed(3)}ms, max ${max.toFixed(3)}ms`);
    }
    this.timings.clear();
  }
}

const profiler = new Profiler();

// Usage
export const loop = () => {
  const endSpawning = profiler.start('spawning');
  runSpawning();
  endSpawning();
  
  const endCreeps = profiler.start('creeps');
  runCreeps();
  endCreeps();
  
  const endLinks = profiler.start('links');
  runLinks();
  endLinks();
  
  if (Game.time % 100 === 0) {
    profiler.report();
  }
};
```

### Caching Best Practices

Use framework utilities for caching:

```typescript
import { CacheManager } from '@ralphschuler/screeps-utils';

// Create cache manager
const cache = new CacheManager();

// Cache expensive room.find() calls
function findSources(room: Room): Source[] {
  return cache.get(`sources-${room.name}`, 100, () => {
    return room.find(FIND_SOURCES);
  });
}

// Cache path finding
function findPath(from: RoomPosition, to: RoomPosition): PathFinderPath {
  const key = `path-${from}-${to}`;
  return cache.get(key, 1000, () => {
    return PathFinder.search(from, { pos: to, range: 1 });
  });
}

// Clear cache periodically
if (Game.time % 1000 === 0) {
  cache.clear();
}
```

### Memory Optimization

Minimize memory usage:

```typescript
// Bad: Storing entire objects
creep.memory.target = source; // Don't do this!

// Good: Store IDs only
creep.memory.targetId = source.id;

// Bad: Storing paths
creep.memory.path = path; // Too large!

// Good: Use serialized path or cache in heap
creep.memory.pathSerial = Room.serializePath(path);
// Or cache in global variable (not persisted)
```

### Tick Budgeting

Run expensive operations less frequently:

```typescript
export const loop = () => {
  // Every tick
  runCreeps();
  runTowers();
  
  // Every 5 ticks
  if (Game.time % 5 === 0) {
    runSpawning();
    runLinks();
  }
  
  // Every 20 ticks
  if (Game.time % 20 === 0) {
    runTerminals();
  }
  
  // Every 50 ticks
  if (Game.time % 50 === 0) {
    runLabs();
    runFactory();
  }
  
  // Every 100 ticks
  if (Game.time % 100 === 0) {
    runMarket();
    runScanning();
  }
};
```

---

## Summary

### Migration Quick Reference

| From | To | Difficulty | Time Estimate | Key Benefits |
|------|--------|-----------|---------------|--------------|
| Overmind | Framework | Medium | 2-4 weeks | CPU efficiency, modularity |
| TypeScript Starter | Framework | Easy | 1-2 weeks | Added features, minimal changes |
| Monolithic Bot | Framework | Easy-Medium | 2-3 weeks | Organization, maintainability |
| Other Frameworks | Framework | Varies | 1-4 weeks | Depends on overlap |

### Next Steps

1. **Choose your migration path** based on current bot architecture
2. **Install framework packages** you need
3. **Start with spawn system** (lowest risk, high value)
4. **Test in simulation** before deploying
5. **Migrate one system at a time** to minimize risk
6. **Monitor CPU and behavior** closely during migration
7. **Iterate and optimize** based on profiling data

### Getting Help

- **Documentation**: Package READMEs have detailed API references
- **Examples**: See [examples/](../../examples/) directory
- **Issues**: [GitHub Issues](https://github.com/ralphschuler/screeps/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ralphschuler/screeps/discussions)

### Success Metrics

After migration, you should see:
- ✅ Reduced CPU usage (10-30% typical improvement)
- ✅ Cleaner, more maintainable code
- ✅ Easier to add new features
- ✅ Better resource efficiency (links, labs, terminals)
- ✅ Improved spawn management
- ✅ More robust error handling

Good luck with your migration! 🚀
