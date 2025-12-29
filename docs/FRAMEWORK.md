# Screeps Framework - Reusable Packages

This repository provides a modular framework for Screeps bot development, with reusable npm packages that can be used individually or combined to build custom bots.

## Overview

The Screeps bot has been decomposed into independent, reusable packages that handle specific aspects of bot functionality. Each package is:

- **Independent**: Can be used standalone or with other packages
- **Well-tested**: Comprehensive test coverage (target: >80%)
- **Type-safe**: Full TypeScript support with exported type definitions
- **Documented**: Clear API documentation and usage examples

## Available Packages

### Core Framework Packages

#### @ralphschuler/screeps-kernel

**Process scheduler with CPU budget management and wrap-around queue**

The kernel provides the core process management system for Screeps bots:

- Process registration and lifecycle management
- CPU budget allocation and enforcement per process
- Priority-based process scheduling with wrap-around queue
- Process statistics tracking
- Centralized event system for inter-process communication
- Adaptive CPU budgets based on room count and bucket level
- Process decorators for declarative registration

**Installation:**
```bash
npm install @ralphschuler/screeps-kernel
```

**Usage:**
```typescript
import { kernel, ProcessPriority, ProcessDecorator } from '@ralphschuler/screeps-kernel';

// Register a process
kernel.registerProcess({
  id: 'my:process',
  name: 'My Custom Process',
  priority: ProcessPriority.MEDIUM,
  frequency: 'medium',
  minBucket: 1000,
  cpuBudget: 0.1,
  interval: 10,
  execute: () => {
    // Process logic
    console.log('Running my custom process');
  }
});

// Run the kernel each tick
export function loop() {
  kernel.run();
}
```

**Declarative Process Registration with Decorators:**
```typescript
import { ProcessDecorator, ProcessPriority } from '@ralphschuler/screeps-kernel';

class MyManager {
  @ProcessDecorator({
    id: 'economy:harvesting',
    name: 'Harvesting Manager',
    priority: ProcessPriority.HIGH,
    frequency: 'high',
    interval: 1
  })
  public runHarvesting(): void {
    // Harvesting logic
  }

  @ProcessDecorator({
    id: 'economy:market',
    name: 'Market Manager',
    priority: ProcessPriority.LOW,
    frequency: 'low',
    interval: 100
  })
  public runMarket(): void {
    // Market logic
  }
}
```

**Event System:**
```typescript
import { kernel, EventPriority } from '@ralphschuler/screeps-kernel';

// Subscribe to events
kernel.on('hostile.detected', (event) => {
  console.log(`Hostile detected in ${event.roomName}`);
}, { priority: EventPriority.CRITICAL });

// Emit events
kernel.emit('hostile.detected', {
  roomName: 'W1N1',
  hostileId: '12345' as Id<Creep>,
  hostileOwner: 'Invader',
  bodyParts: 10,
  threatLevel: 3
});
```

**Adaptive CPU Budgets:**
```typescript
import { getAdaptiveBudgets, DEFAULT_ADAPTIVE_CONFIG } from '@ralphschuler/screeps-kernel';

// Calculate adaptive budgets based on room count and bucket
const budgets = getAdaptiveBudgets({
  roomCount: 5,
  bucketLevel: 8000,
  cpuLimit: 100,
  config: DEFAULT_ADAPTIVE_CONFIG
});

console.log('Room budget:', budgets.roomBudget);
console.log('Strategic budget:', budgets.strategicBudget);
```

### Economy & Resource Management

#### @ralphschuler/screeps-economy

Economic subsystems for resource management, remote mining, and market trading.

#### @ralphschuler/screeps-spawn

Spawn management with body optimization, queue management, and role prioritization.

#### @ralphschuler/screeps-chemistry

Lab reactions and compound production.

### Military & Defense

#### @ralphschuler/screeps-defense

Defense coordination and threat response.

### Utilities

#### @ralphschuler/screeps-utils

Common utilities and helper functions.

#### @ralphschuler/screeps-posis

Position utilities and pathfinding helpers.

#### @ralphschuler/screeps-tasks

Task system for creep behavior.

## Planned Packages (Coming Soon)

### @ralphschuler/screeps-stats

Unified statistics collection and export system:

- CPU profiling
- Performance metrics
- Room/empire metrics
- Graphite/Prometheus export
- Memory segment persistence

### @ralphschuler/screeps-console

Console command framework with decorators:

- Command registration
- Interactive REPL utilities
- Command categories
- Auto-generated help

### @ralphschuler/screeps-empire

Empire-level strategy and coordination:

- Empire manager
- Expansion logic
- Nuke coordination
- Power bank harvesting
- Remote room management

### @ralphschuler/screeps-intershard

Multi-shard coordination:

- Shard manager
- InterShardMemory management
- Cross-shard resource routing
- Shard-to-shard communication

### @ralphschuler/screeps-visuals

Visualization and debugging overlays:

- Room visualizations
- Map visualizations
- Pheromone overlays
- Budget dashboards

## Creating a Custom Bot with Framework Packages

Here's a minimal bot using the framework packages:

### 1. Initialize Your Project

```bash
mkdir my-screeps-bot
cd my-screeps-bot
npm init -y
```

### 2. Install Framework Packages

```bash
# Core packages
npm install @ralphschuler/screeps-kernel
npm install @ralphschuler/screeps-spawn
npm install @ralphschuler/screeps-utils

# Optional packages
npm install @ralphschuler/screeps-economy
npm install @ralphschuler/screeps-defense
```

### 3. Create Your Main Loop

```typescript
// src/main.ts
import { kernel, ProcessPriority } from '@ralphschuler/screeps-kernel';
import { SpawnManager } from '@ralphschuler/screeps-spawn';

const spawnManager = new SpawnManager();

// Register spawn process
kernel.registerProcess({
  id: 'spawn:manager',
  name: 'Spawn Manager',
  priority: ProcessPriority.HIGH,
  frequency: 'high',
  minBucket: 500,
  cpuBudget: 0.15,
  interval: 1,
  execute: () => spawnManager.run()
});

// Main loop
export function loop() {
  kernel.run();
}
```

### 4. Build and Deploy

```bash
npm run build
npm run push  # Assuming you've configured screeps.json
```

## Package Development Guide

See [PACKAGE_TEMPLATE.md](./PACKAGE_TEMPLATE.md) for detailed instructions on creating new packages.

### Quick Start

1. **Create package structure:**
   ```bash
   ./scripts/create-package.sh <name> "<description>"
   ```

2. **Move source files** from bot to package

3. **Define public API** in `src/index.ts`

4. **Add tests** in `test/`

5. **Update root package.json** with build/test scripts

6. **Test integration:**
   ```bash
   npm run build:<name>
   npm run test:<name>
   ```

## Design Principles

### 1. Minimal Dependencies

Packages should have minimal external dependencies:

- Screeps types as `peerDependency`
- Only essential npm packages
- No circular dependencies between packages

### 2. Clear API Boundaries

- Export only what's needed
- Keep implementation details private
- Use TypeScript for type safety
- Document public APIs

### 3. Self-Contained

Each package should be usable independently:

- No assumptions about bot architecture
- Configurable behavior
- Sensible defaults
- Opt-in features

### 4. Well-Tested

All packages must have comprehensive tests:

- Unit tests for core functionality
- Integration tests where applicable
- >80% code coverage target
- Mock Screeps APIs in tests

## Best Practices

### Using Multiple Packages

When combining packages, follow these patterns:

**Dependency Injection:**
```typescript
import { kernel } from '@ralphschuler/screeps-kernel';
import { SpawnManager } from '@ralphschuler/screeps-spawn';
import { EconomyManager } from '@ralphschuler/screeps-economy';

// Pass kernel to managers if they need event system
const spawnManager = new SpawnManager();
const economyManager = new EconomyManager();

// Managers can subscribe to events
kernel.on('spawn.completed', (event) => {
  economyManager.onCreepSpawned(event.creepName);
});
```

**Shared Configuration:**
```typescript
import { getConfig, updateConfig } from '@ralphschuler/screeps-kernel';

// Packages can share configuration through kernel config
updateConfig({
  enableAdaptiveBudgets: true,
  cpu: {
    ecoRoom: 0.1,
    warRoom: 0.25,
    overmind: 1.0
  }
});
```

### CPU Management

All packages that use the kernel should respect CPU budgets:

```typescript
// Register with appropriate priority and budget
kernel.registerProcess({
  id: 'my:process',
  priority: ProcessPriority.MEDIUM,
  cpuBudget: 0.05,  // 5% of CPU limit
  execute: () => {
    // Process logic
    // Kernel will skip if CPU budget exhausted
  }
});
```

### Event-Driven Architecture

Use the kernel's event system for loose coupling:

```typescript
// Publisher (e.g., spawn package)
kernel.emit('spawn.completed', {
  roomName: spawn.room.name,
  creepName: creep.name,
  role: 'harvester',
  cost: 550
});

// Subscriber (e.g., economy package)
kernel.on('spawn.completed', (event) => {
  // Update economy stats
  Memory.economy[event.roomName].spawnCost += event.cost;
});
```

## Versioning

Packages use semantic versioning (semver):

- **MAJOR**: Breaking API changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes

Current versions are 0.x.x indicating pre-release/unstable APIs.

## Contributing

To contribute a new package or improve existing ones:

1. Follow the package template structure
2. Write comprehensive tests (>80% coverage)
3. Document the public API
4. Add usage examples to FRAMEWORK.md
5. Submit a pull request

## License

All packages are released under the Unlicense - use freely in your bots!

## Support

For questions, issues, or feature requests:

- Open an issue on GitHub
- Check existing documentation
- Review package README files
- See code examples in `/packages/screeps-bot/src`

## Roadmap

Future packages planned:

- [ ] `@ralphschuler/screeps-stats` - Statistics and metrics
- [ ] `@ralphschuler/screeps-console` - Console commands
- [ ] `@ralphschuler/screeps-empire` - Empire strategy
- [ ] `@ralphschuler/screeps-intershard` - Multi-shard coordination
- [ ] `@ralphschuler/screeps-visuals` - Visualizations
- [ ] `@ralphschuler/screeps-cache` - Caching system
- [ ] `@ralphschuler/screeps-clusters` - Cluster coordination
- [ ] `@ralphschuler/screeps-layouts` - Room layouts and planning

See issues tagged with `modularity` for progress and planned work.
