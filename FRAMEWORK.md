# Screeps Framework

**Build powerful Screeps bots using modular, tested packages.**

The Screeps Framework provides a collection of high-quality, well-tested packages that handle common bot functionality - spawning, economy, defense, chemistry, and more. Focus on strategy and let the framework handle the implementation details.

## Quick Start

Get started building your bot in under 10 minutes:

### 1. Install Framework Packages

```bash
npm install @ralphschuler/screeps-spawn @ralphschuler/screeps-economy
```

### 2. Create Your Bot

```typescript
// main.ts
import { SpawnManager } from '@ralphschuler/screeps-spawn';
import { linkManager } from '@ralphschuler/screeps-economy';

const spawnManager = new SpawnManager();

export const loop = () => {
  // Process each owned room
  for (const room of Object.values(Game.rooms)) {
    if (room.controller?.my) {
      // Handle spawning
      const spawns = room.find(FIND_MY_SPAWNS);
      const requests = [
        {
          role: 'harvester',
          priority: 100,
          memory: { role: 'harvester' }
        }
      ];
      spawnManager.processSpawnQueue(spawns, requests);
      
      // Manage links (if RCL >= 5)
      if (room.controller.level >= 5) {
        linkManager.run(room);
      }
    }
  }
};
```

### 3. Deploy to Screeps

Build and deploy your bot using your preferred deployment method.

For more complete examples, see the [examples/minimal-bot](examples/minimal-bot) directory.

## Core Packages

The framework consists of several specialized packages:

### Process Management

- **[@ralphschuler/screeps-kernel](packages/@ralphschuler/screeps-kernel)** - Process scheduler with CPU budget management
  - Priority-based task scheduling
  - CPU budget enforcement
  - Wrap-around queue for fair processing
  - Process lifecycle management

### Economy & Resources

- **[@ralphschuler/screeps-spawn](packages/screeps-spawn)** - Spawning and body optimization
  - Smart body part selection based on energy
  - Priority-based spawn queue
  - Role templates for all creep types
  - Bootstrap mode support

- **[@ralphschuler/screeps-economy](packages/screeps-economy)** - Resource management and trading
  - Link network automation
  - Terminal routing with Dijkstra optimization
  - Factory management
  - Market trading with price analysis

- **[@ralphschuler/screeps-chemistry](packages/screeps-chemistry)** - Lab automation and reactions
  - Reaction chain planning
  - Lab role assignment
  - Boost management
  - Just-in-time production

### Combat & Defense

- **[@ralphschuler/screeps-defense](packages/screeps-defense)** - Defense systems
  - Tower automation
  - Threat assessment
  - Safe mode management
  - Rampart repair coordination

### Architecture & Utilities

- **[@ralphschuler/screeps-posis](packages/screeps-posis)** - POSIS process architecture
  - Process-based bot organization
  - Inter-process communication
  - State management
  - Hierarchical process trees

- **[@ralphschuler/screeps-tasks](packages/screeps-tasks)** - Task management system
  - Task queue with priorities
  - Task assignment to creeps
  - Task lifecycle tracking
  - Predefined task types

- **[@ralphschuler/screeps-utils](packages/screeps-utils)** - Common utilities
  - Caching helpers
  - Pathfinding utilities
  - Performance optimizations
  - Type guards and validators

- **[@ralphschuler/screeps-roles](packages/@ralphschuler/screeps-roles)** - Role implementations
  - Complete role definitions
  - Behavior trees for each role
  - Energy-efficient implementations
  - Remote mining support

## Architecture Guide

### Framework Design Philosophy

The framework follows these key principles:

1. **Modular**: Each package has a single, well-defined responsibility
2. **Tested**: Comprehensive test coverage ensures reliability
3. **Typed**: Full TypeScript support with strict typing
4. **Framework-Agnostic**: Minimal coupling between packages
5. **CPU-Efficient**: Optimized for performance and caching

### How Packages Work Together

The framework packages are designed to work independently or together:

```
┌─────────────────────────────────────────────┐
│           Your Bot (main.ts)                │
└─────────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
  ┌─────────┐  ┌─────────┐  ┌─────────┐
  │  Spawn  │  │ Economy │  │ Defense │
  └─────────┘  └─────────┘  └─────────┘
        │            │            │
        └────────────┼────────────┘
                     │
                     ▼
            ┌──────────────┐
            │    Utils     │
            └──────────────┘
```

**Integration Patterns:**

1. **Direct Integration**: Call managers directly from your main loop
   ```typescript
   spawnManager.processSpawnQueue(spawns, requests);
   ```

2. **Process-Based**: Register with kernel for CPU-budgeted execution
   ```typescript
   kernel.registerProcess(linkManager);
   ```

3. **Event-Driven**: React to game events using task queues
   ```typescript
   taskQueue.add(new HarvestTask(creep, source));
   ```

### Package Dependencies

Some packages depend on others:

- **screeps-economy** → requires **screeps-utils** for caching
- **screeps-spawn** → standalone, no framework dependencies
- **screeps-chemistry** → standalone, no framework dependencies
- **screeps-defense** → standalone, no framework dependencies
- **screeps-kernel** → standalone, no framework dependencies

All packages depend only on the Screeps game API and TypeScript standard library.

## Common Patterns

### Pattern 1: Spawn Management

```typescript
import { SpawnManager, SpawnRequest } from '@ralphschuler/screeps-spawn';

const spawnManager = new SpawnManager({
  debug: true,
  rolePriorities: {
    harvester: 100,
    hauler: 90,
    upgrader: 80
  }
});

// Build spawn requests based on room needs
function getSpawnRequests(room: Room): SpawnRequest[] {
  const requests: SpawnRequest[] = [];
  
  // Count existing creeps
  const creeps = room.find(FIND_MY_CREEPS);
  const harvesters = creeps.filter(c => c.memory.role === 'harvester');
  
  // Need more harvesters?
  if (harvesters.length < 2) {
    requests.push({
      role: 'harvester',
      priority: 100,
      memory: { role: 'harvester', room: room.name }
    });
  }
  
  return requests;
}

// In main loop
const spawns = room.find(FIND_MY_SPAWNS);
const requests = getSpawnRequests(room);
spawnManager.processSpawnQueue(spawns, requests);
```

### Pattern 2: Link Network

```typescript
import { linkManager } from '@ralphschuler/screeps-economy';

// Link manager runs automatically
// Just ensure it's called each tick for rooms with links
if (room.controller && room.controller.level >= 5) {
  linkManager.run(room);
}
```

### Pattern 3: Lab Automation

```typescript
import { ChemistryManager, LabConfigManager } from '@ralphschuler/screeps-chemistry';

const chemistry = new ChemistryManager();
const labConfig = new LabConfigManager();

// Initialize lab configuration
labConfig.initialize(room.name);

// Define current state
const state = {
  currentTick: Game.time,
  danger: 0,
  posture: 'eco' as const,
  pheromones: { war: 0, siege: 0 }
};

// Plan and execute reactions
const reaction = chemistry.planReactions(room, state);
if (reaction) {
  labConfig.setActiveReaction(
    room.name,
    reaction.input1,
    reaction.input2,
    reaction.product
  );
  labConfig.runReactions(room.name);
}
```

### Pattern 4: Process Scheduling

```typescript
import { Kernel, Process } from '@ralphschuler/screeps-kernel';

// Create kernel with CPU budget
const kernel = new Kernel({
  cpuBudget: 10,
  logger: console
});

// Define a custom process
class MyProcess implements Process {
  id = 'my-process';
  priority = 5;
  interval = 10; // Run every 10 ticks
  
  run(): void {
    console.log('Process running!');
  }
}

// Register and run
kernel.registerProcess(new MyProcess());
kernel.run(); // Call each tick
```

## API Reference

Each package has comprehensive API documentation in its README:

- [Kernel API](packages/@ralphschuler/screeps-kernel/README.md)
- [Spawn API](packages/screeps-spawn/README.md)
- [Economy API](packages/screeps-economy/README.md)
- [Chemistry API](packages/screeps-chemistry/README.md)
- [Defense API](packages/screeps-defense/README.md)
- [Utils API](packages/screeps-utils/README.md)
- [Tasks API](packages/screeps-tasks/README.md)
- [POSIS API](packages/screeps-posis/README.md)
- [Roles API](packages/@ralphschuler/screeps-roles/README.md)

## Examples

### Minimal Bot

See [examples/minimal-bot](examples/minimal-bot) for a complete minimal bot implementation using the framework.

### Integration with Existing Bots

The framework packages are designed to integrate incrementally:

1. **Start Small**: Add just `@ralphschuler/screeps-spawn` for better spawning
2. **Add Economy**: Include `@ralphschuler/screeps-economy` for link/terminal management
3. **Scale Up**: Add other packages as your bot grows

You don't need to use all packages - pick what you need.

## Development

### Building the Framework

```bash
# Build all framework packages
npm run build:all

# Build specific package
npm run build:spawn
npm run build:chemistry
npm run build:economy
```

### Testing

```bash
# Test all packages
npm run test:all

# Test specific package
npm run test:spawn
npm run test:chemistry
```

### Contributing

See [CONTRIBUTING_FRAMEWORK.md](CONTRIBUTING_FRAMEWORK.md) for guidelines on:
- Adding new framework packages
- Testing requirements
- Documentation standards
- Release process

## Publishing Status

| Package | Version | Published | Status |
|---------|---------|-----------|--------|
| @ralphschuler/screeps-kernel | 0.1.0 | ⏳ Pending | Ready |
| @ralphschuler/screeps-spawn | 0.1.0 | ⏳ Pending | Ready |
| @ralphschuler/screeps-chemistry | 0.1.0 | ⏳ Pending | Ready |
| @ralphschuler/screeps-defense | 0.1.0 | ⏳ Pending | In Progress |
| @ralphschuler/screeps-economy | 0.1.0 | ⏳ Pending | In Progress |
| @ralphschuler/screeps-utils | 0.1.0 | ⏳ Pending | In Progress |
| @ralphschuler/screeps-tasks | 0.1.0 | ⏳ Pending | In Progress |
| @ralphschuler/screeps-posis | 0.1.0 | ⏳ Pending | In Progress |
| @ralphschuler/screeps-roles | 0.1.0 | ⏳ Pending | In Progress |

**Note**: Packages are currently available through this repository. npm publishing will be enabled after initial testing and stabilization.

## Version Compatibility

All framework packages follow [Semantic Versioning](https://semver.org/):

- **Major version** (1.x.x): Breaking API changes
- **Minor version** (x.1.x): New features, backward compatible
- **Patch version** (x.x.1): Bug fixes, backward compatible

Current target: **v1.0.0** for all packages

## Support

- **Documentation**: Package READMEs and this guide
- **Examples**: See [examples/](examples/) directory
- **Issues**: [GitHub Issues](https://github.com/ralphschuler/screeps/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ralphschuler/screeps/discussions)

## License

All framework packages are released under the [Unlicense](LICENSE) - public domain.

## Credits

Developed as part of the [screeps-ant-swarm](https://github.com/ralphschuler/screeps) bot project.

**Related Resources:**
- [Screeps Documentation](https://docs.screeps.com/)
- [Screeps API Reference](https://docs.screeps.com/api/)
- [Community Wiki](https://wiki.screepspl.us/)
