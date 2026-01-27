# Screeps Framework Documentation

**Build powerful Screeps bots using modular, tested packages.**

The Screeps Framework is a collection of high-quality, well-tested packages that handle common bot functionality—spawning, economy, defense, remote mining, and more. Focus on your bot's strategy while the framework handles implementation details.

---

## 🚀 What is the Screeps Framework?

The Screeps Framework is a **modular bot development toolkit** extracted from a production Screeps bot. It provides:

- **16+ specialized packages** for different bot functions
- **Production-tested** code running on live Screeps servers
- **Swarm architecture** based on emergent behavior and pheromone coordination
- **CPU-efficient** implementations with aggressive caching and optimization
- **TypeScript-first** with full type safety and IDE support

### Framework Goal

> "A side quest for this bot is to provide a framework for easy bot development."  
> — [AGENTS.md](../../AGENTS.md)

The framework enables developers to:
- **Get started quickly** with working bot code
- **Focus on strategy** instead of implementation details  
- **Reuse battle-tested** components
- **Scale efficiently** to 100+ rooms with managed CPU budgets
- **Learn from examples** of advanced bot architecture

---

## 📦 Framework Packages

The framework consists of **16 specialized packages** organized by function:

### Process Management
- **[@ralphschuler/screeps-kernel](../../packages/@ralphschuler/screeps-kernel)** - Process scheduler with CPU budget management and wrap-around queue
- **[@ralphschuler/screeps-pheromones](../../packages/@ralphschuler/screeps-pheromones)** - Stigmergic coordination system for swarm behavior

### Core Infrastructure  
- **[@ralphschuler/screeps-core](../../packages/@ralphschuler/screeps-core)** - Core utilities, logging, and type definitions
- **[@ralphschuler/screeps-cache](../../packages/@ralphschuler/screeps-cache)** - Unified caching system with TTL and LRU eviction
- **[@ralphschuler/screeps-memory](../../packages/@ralphschuler/screeps-memory)** - Memory schemas and persistence

### Economy & Resources
- **[screeps-spawn](../../packages/screeps-spawn)** - Spawning and body part optimization
- **[screeps-economy](../../packages/screeps-economy)** - Resource management, links, terminals, factories
- **[screeps-chemistry](../../packages/screeps-chemistry)** - Lab automation and reaction chains
- **[@ralphschuler/screeps-remote-mining](../../packages/@ralphschuler/screeps-remote-mining)** - Remote mining automation

### Combat & Defense
- **[screeps-defense](../../packages/screeps-defense)** - Tower automation and threat assessment

### Roles & Behavior
- **[@ralphschuler/screeps-roles](../../packages/@ralphschuler/screeps-roles)** - Complete creep role implementations with behavior trees
- **[screeps-tasks](../../packages/screeps-tasks)** - Task management and assignment system

### Architecture & Coordination
- **[@ralphschuler/screeps-empire](../../packages/@ralphschuler/screeps-empire)** - Empire-level coordination across shards
- **[@ralphschuler/screeps-clusters](../../packages/@ralphschuler/screeps-clusters)** - Colony clustering and coordination
- **[@ralphschuler/screeps-intershard](../../packages/@ralphschuler/screeps-intershard)** - Inter-shard communication and coordination

### Utilities & Visualization
- **[@ralphschuler/screeps-pathfinding](../../packages/@ralphschuler/screeps-pathfinding)** - Advanced pathfinding with caching
- **[@ralphschuler/screeps-layouts](../../packages/@ralphschuler/screeps-layouts)** - Room layouts and blueprints
- **[@ralphschuler/screeps-visuals](../../packages/@ralphschuler/screeps-visuals)** - Visualization and debugging
- **[@ralphschuler/screeps-console](../../packages/@ralphschuler/screeps-console)** - Console command system
- **[@ralphschuler/screeps-stats](../../packages/@ralphschuler/screeps-stats)** - Statistics collection and monitoring
- **[@ralphschuler/screeps-standards](../../packages/@ralphschuler/screeps-standards)** - SS2 Terminal Communications protocol

---

## 🎯 Key Features

### 1. Modular & Composable
Each package has a **single, well-defined responsibility** and can be used independently or together:

```typescript
// Use just spawning
import { SpawnManager } from '@ralphschuler/screeps-spawn';

// Or combine multiple packages
import { Kernel } from '@ralphschuler/screeps-kernel';
import { SpawnManager } from '@ralphschuler/screeps-spawn';
import { linkManager } from 'screeps-economy';
```

### 2. Production-Tested
All packages are **extracted from a live bot** that has:
- Managed 100+ rooms across multiple shards
- Handled complex multi-room logistics
- Defended against player attacks
- Optimized CPU usage under heavy load

### 3. Swarm Architecture
Based on the **five-layer swarm architecture** (see [ROADMAP.md](../../ROADMAP.md)):
1. **Empire Layer** - Multi-shard coordination
2. **Shard Layer** - Per-shard strategic decisions
3. **Cluster Layer** - Colony groups and inter-room logistics
4. **Room Layer** - Local economy, defense, and construction
5. **Creep Layer** - Individual agent behavior

### 4. Pheromone-Based Coordination
Uses **stigmergic communication** where creeps and systems communicate through simple numerical signals (pheromones) in room memory:
- Reduces memory complexity
- Enables emergent behavior
- Scales efficiently to hundreds of rooms

### 5. CPU-Efficient
Aggressive optimization keeps CPU usage low:
- **Unified caching system** with TTL and LRU eviction
- **CPU budgets** enforced by kernel
- **Lazy evaluation** and periodic updates
- **Bucket-aware** behavior (high bucket = more analysis, low bucket = core logic only)

**Target CPU budgets** (per room per tick):
- Economic room: ≤ 0.1 CPU
- Combat room: ≤ 0.25 CPU  
- Empire/global coordination: ≤ 1 CPU every 20-50 ticks

---

## 🏁 Quick Start

### 1. Install Framework Packages

```bash
# Essential packages for a basic bot
npm install @ralphschuler/screeps-kernel
npm install @ralphschuler/screeps-spawn
npm install screeps-economy
```

### 2. Create Your Bot

```typescript
// src/main.ts
import { Kernel } from '@ralphschuler/screeps-kernel';
import { SpawnManager } from '@ralphschuler/screeps-spawn';
import { linkManager } from 'screeps-economy';

const kernel = new Kernel({ cpuBudget: 10 });
const spawnManager = new SpawnManager();

// Register spawn process
kernel.registerProcess({
  id: 'spawning',
  priority: 90,
  execute: () => {
    for (const room of Object.values(Game.rooms)) {
      if (!room.controller?.my) continue;
      
      const spawns = room.find(FIND_MY_SPAWNS);
      const requests = buildSpawnRequests(room);
      spawnManager.processSpawnQueue(spawns, requests);
    }
  },
  cpuBudget: 0.5
});

// Main loop
export function loop() {
  kernel.run();
}
```

### 3. Run Your Bot

Build and deploy using your preferred method. See the **[Quick Start Guide](quickstart.md)** for detailed instructions.

---

## 📚 Documentation

### Getting Started
- **[Quick Start Guide](quickstart.md)** - Get running in 10 minutes
- **[Installation Guide](installation.md)** - Setup and configuration
- **[Architecture Overview](architecture.md)** - System design and patterns
- **[Core Concepts](core-concepts.md)** - Pheromones, Kernel, Memory
- **[Performance Guide](performance.md)** - CPU optimization and profiling

### Package Documentation
Each package has comprehensive documentation:
- **API Reference** - Full TypeScript API documentation
- **Usage Examples** - Working code samples
- **Integration Patterns** - How to combine packages
- **Performance** - CPU characteristics and optimization

See **[Package Index](packages.md)** for all packages.

### Advanced Topics
- **[Custom Processes](advanced/custom-processes.md)** - Extend the kernel
- **[Blueprint Development](advanced/blueprint-development.md)** - Create room layouts
- **[Multi-Shard Coordination](advanced/multi-shard.md)** - Cross-shard strategies
- **[Debugging & Profiling](advanced/debugging.md)** - Performance analysis

### Contributing
- **[Package Development](contributing/package-development.md)** - Create new packages
- **[Testing Guide](contributing/testing.md)** - Testing requirements
- **[Release Process](contributing/release-process.md)** - Publishing packages

---

## 🏗️ Architecture Principles

The framework follows these **design principles** (from [ROADMAP.md](../../ROADMAP.md)):

### 1. Decentralization
Each room has **local control logic**. Global layers only provide high-level goals ("Shard X: expansion", "Cluster Y: war").

### 2. Stigmergic Communication  
Communication via **simple numerical pheromones** in `Room.memory`, not complex object trees. Reduces memory size and parsing costs.

### 3. Event-Driven Logic
- **Critical events** (hostiles, nukes, destroyed structures) update flags immediately
- **Periodic routines** (scans, pheromone updates, market analysis) run every N ticks

### 4. Aggressive Caching
Paths, scans, and analyses are **cached with TTL** (in global object, not Memory) and recomputed only when needed.

### 5. Strict Tick Budget
Target CPU budgets:
- Economic room: ≤ 0.1 CPU/tick
- Combat room: ≤ 0.25 CPU/tick
- Global coordination: ≤ 1 CPU every 20-50 ticks

### 6. Bucket-Aware Behavior
- **High bucket**: Enable expensive operations (routing, layout planning)
- **Low bucket**: Core logic only, throttle logs

---

## 📊 Framework Integration Patterns

### Pattern 1: Direct Integration
Call managers directly from your main loop:

```typescript
spawnManager.processSpawnQueue(spawns, requests);
linkManager.run(room);
```

### Pattern 2: Process-Based
Register with kernel for CPU-budgeted execution:

```typescript
kernel.registerProcess({
  id: 'economy:links',
  execute: () => linkManager.run(room),
  cpuBudget: 0.1
});
```

### Pattern 3: Event-Driven
React to game events using task queues:

```typescript
import { TaskQueue } from 'screeps-tasks';

const queue = new TaskQueue();
queue.add(new HarvestTask(creep, source));
queue.processTasks();
```

---

## 🎓 Learning Path

### Beginner
1. Read the **[Quick Start Guide](quickstart.md)**
2. Study **[examples/minimal-bot](../../examples/minimal-bot)** 
3. Understand **[Core Concepts](core-concepts.md)**
4. Learn about **[Spawn Management](packages/spawn.md)**

### Intermediate  
1. Master **[Kernel & Processes](core-concepts.md#kernel-system)**
2. Implement **[Pheromone Coordination](core-concepts.md#pheromone-system)**
3. Optimize with **[Caching Strategies](performance.md#caching)**
4. Build **[Multi-Room Logistics](packages/economy.md)**

### Advanced
1. Create **[Custom Processes](advanced/custom-processes.md)**
2. Design **[Custom Blueprints](advanced/blueprint-development.md)**
3. Coordinate **[Multi-Shard Operations](advanced/multi-shard.md)**
4. Profile and optimize **[CPU Performance](advanced/debugging.md)**

---

## 🤝 Contributing

We welcome contributions! See:
- **[Contributing Guide](contributing/package-development.md)** - How to contribute
- **[Package Development](contributing/package-development.md)** - Create new packages
- **[Testing Requirements](contributing/testing.md)** - Quality standards

---

## 📖 Related Documentation

- **[ROADMAP.md](../../ROADMAP.md)** - Bot architecture and swarm design
- **[FRAMEWORK.md](../../FRAMEWORK.md)** - Original framework overview
- **[AGENTS.md](../../AGENTS.md)** - Autonomous development system
- **[API Documentation](../api/)** - Generated TypeDoc API reference

---

## 📜 License

All framework packages are released under the **[Unlicense](https://unlicense.org/)** - public domain. Use them however you want!

---

## 🙋 Support

- **Documentation**: This guide and package READMEs
- **Examples**: See [examples/](../../examples/) directory
- **Issues**: [GitHub Issues](https://github.com/ralphschuler/screeps/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ralphschuler/screeps/discussions)

---

**Last Updated**: 2026-01-27  
**Framework Version**: 0.1.0
