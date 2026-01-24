# Screeps Framework Documentation

**Build powerful Screeps bots using modular, tested packages.**

[![License](https://img.shields.io/badge/license-Unlicense-blue.svg)](https://unlicense.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![GitHub](https://img.shields.io/github/stars/ralphschuler/screeps?style=social)](https://github.com/ralphschuler/screeps)

## 🚀 Quick Links

- **[Framework Overview](framework/)** - Start here to understand the framework
- **[Quick Start Guide](framework/quickstart.md)** - Get running in 5 minutes
- **[Developer Guides](guides/)** - Deep dives into major systems
- **[API Reference](api/)** - Complete API documentation
- **[Examples](../examples/)** - Working bot implementations

## 📦 What is the Screeps Framework?

The Screeps Framework is a collection of 21 specialized, well-tested packages that handle common bot functionality:

- **Process Management**: CPU-budgeted task scheduling
- **Economy**: Spawning, links, terminals, factories, market trading
- **Combat**: Defense systems, tower automation, threat assessment
- **Infrastructure**: Caching, pathfinding, layouts, remote mining
- **Utilities**: Stats, console commands, visuals, memory management

### Why Use the Framework?

✅ **Modular** - Use only what you need, one package or all of them  
✅ **Battle-Tested** - Comprehensive test coverage  
✅ **Performance** - Optimized for CPU efficiency  
✅ **TypeScript** - Full type safety and IntelliSense  
✅ **Well-Documented** - Extensive guides and examples

## 📚 Documentation Sections

### Getting Started
- [Framework Overview](framework/overview.md) - Architecture and design philosophy
- [Quick Start Guide](framework/quickstart.md) - Build your first bot in 10 minutes
- [Installation](framework/installation.md) - Setup and configuration
- [Migration Guide](framework/migration.md) - Move from Overmind or other frameworks

### Developer Guides
- [Role System](guides/roles.md) - Creating and using creep roles
- [Kernel & Processes](guides/kernel.md) - CPU-budgeted process management
- [Pheromones](guides/pheromones.md) - Stigmergic communication system
- [State Machines](guides/state-machines.md) - Behavior trees and state management
- [Memory Architecture](guides/memory.md) - Memory optimization patterns
- [Economy Systems](guides/economy.md) - Resource management and trading
- [Defense Coordination](guides/defense.md) - Coordinated defense systems

### Package Documentation

#### Process Management
- [@ralphschuler/screeps-kernel](../packages/@ralphschuler/screeps-kernel/README.md) - Process scheduler
- [@ralphschuler/screeps-posis](../packages/@ralphschuler/screeps-posis/README.md) - POSIS architecture

#### Economy & Resources
- [@ralphschuler/screeps-spawn](../packages/screeps-spawn/README.md) - Spawning system
- [screeps-economy](../packages/screeps-economy/README.md) - Resource management
- [screeps-chemistry](../packages/screeps-chemistry/README.md) - Lab automation
- [screeps-tasks](../packages/screeps-tasks/README.md) - Task management

#### Combat & Defense
- [screeps-defense](../packages/screeps-defense/README.md) - Defense systems

#### Architecture & Utilities
- [@ralphschuler/screeps-roles](../packages/@ralphschuler/screeps-roles/README.md) - Role implementations
- [@ralphschuler/screeps-utils](../packages/screeps-utils/README.md) - Common utilities
- [@ralphschuler/screeps-cache](../packages/@ralphschuler/screeps-cache/README.md) - Caching system
- [@ralphschuler/screeps-pathfinding](../packages/@ralphschuler/screeps-pathfinding/README.md) - Pathfinding
- [@ralphschuler/screeps-remote-mining](../packages/@ralphschuler/screeps-remote-mining/README.md) - Remote mining

#### Infrastructure
- [@ralphschuler/screeps-core](../packages/@ralphschuler/screeps-core/README.md) - Core types
- [@ralphschuler/screeps-stats](../packages/@ralphschuler/screeps-stats/README.md) - Statistics
- [@ralphschuler/screeps-console](../packages/@ralphschuler/screeps-console/README.md) - Console commands
- [@ralphschuler/screeps-visuals](../packages/@ralphschuler/screeps-visuals/README.md) - Visual rendering
- [@ralphschuler/screeps-layouts](../packages/@ralphschuler/screeps-layouts/README.md) - Room layouts
- [@ralphschuler/screeps-intershard](../packages/@ralphschuler/screeps-intershard/README.md) - Inter-shard
- [@ralphschuler/screeps-clusters](../packages/@ralphschuler/screeps-clusters/README.md) - Clustering
- [@ralphschuler/screeps-empire](../packages/@ralphschuler/screeps-empire/README.md) - Empire management
- [@ralphschuler/screeps-standards](../packages/@ralphschuler/screeps-standards/README.md) - Communication protocols

## 💡 Examples

### Minimal Bot

See [examples/minimal-bot](../examples/minimal-bot) for a complete minimal implementation.

```typescript
import { Kernel } from '@ralphschuler/screeps-kernel';
import { SpawnManager } from '@ralphschuler/screeps-spawn';
import { linkManager } from '@ralphschuler/screeps-economy';

const kernel = new Kernel({ cpuBudget: 10 });
const spawnManager = new SpawnManager();

kernel.registerProcess({
  id: 'spawning',
  priority: 90,
  execute: () => {
    for (const room of Object.values(Game.rooms)) {
      if (!room.controller?.my) continue;
      spawnManager.processSpawnQueue(
        room.find(FIND_MY_SPAWNS),
        getSpawnRequests(room)
      );
    }
  }
});

export const loop = () => kernel.run();
```

### Advanced Bot

Coming soon: Full-featured bot using all framework packages.

## 🔧 Installation

```bash
# Install essential packages
npm install @ralphschuler/screeps-kernel
npm install @ralphschuler/screeps-spawn
npm install @ralphschuler/screeps-economy

# Add more as needed
npm install @ralphschuler/screeps-chemistry
npm install @ralphschuler/screeps-defense
```

See the [Installation Guide](framework/installation.md) for complete setup instructions.

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING_FRAMEWORK.md](../CONTRIBUTING_FRAMEWORK.md) for guidelines.

## 📄 License

All framework packages are released under the [Unlicense](https://unlicense.org/) - public domain.

## 🔗 Links

- **GitHub Repository**: [ralphschuler/screeps](https://github.com/ralphschuler/screeps)
- **Issues**: [GitHub Issues](https://github.com/ralphschuler/screeps/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ralphschuler/screeps/discussions)
- **Screeps**: [Official Game](https://screeps.com/)

---

**Last Updated**: 2026-01-23  
**Framework Version**: 0.1.0
