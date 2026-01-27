# Screeps Framework Documentation

**Build powerful Screeps bots using modular, tested packages.**

The Screeps Framework provides a collection of high-quality, well-tested packages that handle common bot functionality - spawning, economy, defense, chemistry, and more. Focus on strategy and let the framework handle the implementation details.

## Quick Navigation

### 📚 Getting Started
- [**Framework Overview**](README.md) - What is the framework?
- [**Getting Started Tutorial**](getting-started.md) - **NEW!** Complete step-by-step guide
- [**Quick Start Guide**](quickstart.md) - Get running in 10 minutes
- [**Installation Guide**](installation.md) - Setting up the framework

### 🏗️ Architecture & Concepts
- [**Architecture**](architecture.md) - **NEW!** Five-layer swarm architecture with diagrams
- [**Core Concepts**](core-concepts.md) - **NEW!** Pheromones, Kernel, Memory, Caching
- [**Performance Guide**](performance.md) - **NEW!** CPU optimization and profiling

### 📦 Packages & Integration
- [Package Overview](overview.md) - All framework packages
- [Package Index](packages.md) - Detailed package list
- [Migration Guide](migration.md) - Moving to the framework

### 🎓 Developer Guides
- [Role System](guides/roles.md) - Creating and using roles
- [Kernel & Processes](guides/kernel.md) - Process-based architecture
- [Pheromones](guides/pheromones.md) - Stigmergic communication
- [State Machines](guides/state-machines.md) - State-based behavior
- [Memory Architecture](guides/memory.md) - Memory management patterns
- [Economy Systems](guides/economy.md) - Economic management
- [Defense Coordination](guides/defense.md) - Coordinated defense

### 🚀 Advanced Topics
- [**Custom Processes**](advanced/custom-processes.md) - **NEW!** Extend the kernel
- [**Blueprint Development**](advanced/blueprint-development.md) - **NEW!** Create room layouts
- [**Multi-Shard Coordination**](advanced/multi-shard.md) - **NEW!** Cross-shard strategies
- [**Debugging & Profiling**](advanced/debugging.md) - **NEW!** Performance analysis

### 🤝 Contributing
- [**Package Development**](contributing/package-development.md) - **NEW!** Create new packages
- [**Testing Guide**](contributing/testing.md) - **NEW!** Testing requirements
- [**Release Process**](contributing/release-process.md) - **NEW!** Publishing workflow

### 📖 API Reference
- [Complete API Documentation](../api/index.md) - Auto-generated API docs (coming soon)
- [Package READMEs](../../packages/@ralphschuler/) - Individual package documentation

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
