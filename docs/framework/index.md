# Screeps Framework Documentation

**Build powerful Screeps bots using modular, tested packages.**

The Screeps Framework provides a collection of high-quality, well-tested packages that handle common bot functionality - spawning, economy, defense, chemistry, and more. Focus on strategy and let the framework handle the implementation details.

## Quick Navigation

### 📚 Getting Started
- [Framework Overview](overview.md) - Architecture and design philosophy
- [Quick Start Guide](quickstart.md) - Get running in 5 minutes
- [Installation](installation.md) - Setting up the framework

### 📦 Core Packages
- [Kernel](packages/kernel.md) - Process scheduler with CPU budget management
- [Spawn](packages/spawn.md) - Spawning and body optimization
- [Economy](packages/economy.md) - Resource management and trading
- [Chemistry](packages/chemistry.md) - Lab automation and reactions
- [Defense](packages/defense.md) - Defense systems

### 🎓 Developer Guides
- [Role System](guides/roles.md) - Creating and using roles
- [Kernel & Processes](guides/kernel.md) - Process-based architecture
- [Pheromones](guides/pheromones.md) - Stigmergic communication
- [State Machines](guides/state-machines.md) - State-based behavior
- [Memory Architecture](guides/memory.md) - Memory management patterns
- [Economy Systems](guides/economy.md) - Economic management
- [Defense Coordination](guides/defense.md) - Coordinated defense

### 🔄 Migration & Examples
- [Migration Guide](migration.md) - Moving to the framework
- [Examples](examples.md) - Complete bot examples
- [Best Practices](best-practices.md) - Tips and patterns

### 📖 API Reference
- [Complete API Documentation](../api/index.md) - Auto-generated API docs
- [Package Index](packages.md) - All framework packages

## Framework Packages

The framework consists of 21 specialized packages:

### Process Management
- **@ralphschuler/screeps-kernel** - Process scheduler with CPU budget management
- **@ralphschuler/screeps-posis** - POSIS process architecture

### Economy & Resources
- **@ralphschuler/screeps-spawn** - Spawning and body optimization
- **screeps-economy** - Resource management and trading
- **screeps-chemistry** - Lab automation and reactions
- **screeps-tasks** - Task management system

### Combat & Defense
- **screeps-defense** - Defense systems

### Architecture & Utilities
- **@ralphschuler/screeps-roles** - Role implementations
- **@ralphschuler/screeps-utils** - Common utilities
- **@ralphschuler/screeps-cache** - Caching system
- **@ralphschuler/screeps-pathfinding** - Advanced pathfinding
- **@ralphschuler/screeps-remote-mining** - Remote mining automation

### Infrastructure
- **@ralphschuler/screeps-core** - Core types and utilities
- **@ralphschuler/screeps-stats** - Statistics collection
- **@ralphschuler/screeps-console** - Console commands
- **@ralphschuler/screeps-visuals** - Visual rendering
- **@ralphschuler/screeps-layouts** - Room layouts
- **@ralphschuler/screeps-intershard** - Inter-shard communication
- **@ralphschuler/screeps-clusters** - Colony clustering
- **@ralphschuler/screeps-empire** - Empire management
- **@ralphschuler/screeps-standards** - Communication protocols

## What's New

- **Standards Package**: SS2 Terminal Communications protocol
- **Enhanced Documentation**: Developer guides for all major systems
- **Migration Guides**: Move from Overmind, screeps-typescript-starter, or monolithic bots
- **Complete Examples**: Minimal and advanced bot examples

## Support

- **Documentation**: This guide and package READMEs
- **Examples**: See [examples](../../examples/) directory
- **Issues**: [GitHub Issues](https://github.com/ralphschuler/screeps/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ralphschuler/screeps/discussions)

## License

All framework packages are released under the [Unlicense](https://unlicense.org/) - public domain.

---

**Last Updated**: 2026-01-23  
**Framework Version**: 0.1.0
