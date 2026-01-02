# Screeps Framework

**Build powerful Screeps bots using modular, tested packages.**

The Screeps Framework provides a collection of high-quality, well-tested packages that handle common bot functionality - spawning, economy, defense, chemistry, and more. Focus on strategy and let the framework handle the implementation details.

## 📚 Table of Contents

- [Quick Start](#quick-start)
- [Core Packages](#core-packages)
- [Architecture Guide](#architecture-guide)
- [Common Patterns](#common-patterns)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Development](#development)
- [Publishing Status](#publishing-status)
- [Support](#support)

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

**Current Status**: All packages are prepared for npm publishing with complete metadata, documentation, and licensing.

See [PUBLISHING.md](PUBLISHING.md) for complete publishing guide and workflow documentation.

### Package Publishing Readiness

| Package | Version | Published | Build | Tests | Docs | License |
|---------|---------|-----------|-------|-------|------|---------|
| @ralphschuler/screeps-kernel | 0.1.0 | ❌ Not yet | ✅ Pass | ✅ Pass | ✅ Complete | ✅ Unlicense |
| @ralphschuler/screeps-pathfinding | 0.1.0 | ❌ Not yet | ✅ Pass | ✅ Pass | ✅ Complete | ✅ Unlicense |
| @ralphschuler/screeps-remote-mining | 0.1.0 | ❌ Not yet | ✅ Pass | ✅ Pass | ✅ Complete | ✅ Unlicense |
| @ralphschuler/screeps-roles | 0.1.0 | ❌ Not yet | ⚠️ Issues* | ✅ Pass | ✅ Complete | ✅ Unlicense |
| @ralphschuler/screeps-console | 0.1.0 | ❌ Not yet | ✅ Pass | ✅ Pass | ✅ Complete | ✅ Unlicense |
| @ralphschuler/screeps-stats | 0.1.0 | ❌ Not yet | ✅ Pass | ✅ Pass | ✅ Complete | ✅ Unlicense |
| @ralphschuler/screeps-visuals | 0.1.0 | N/A (private) | ✅ Pass | ✅ Pass | ✅ Complete | ✅ Unlicense |
| @ralphschuler/screeps-spawn | 0.1.0 | ⏳ Ready | ✅ Pass | ✅ Pass | 📝 In Progress | ✅ Unlicense |
| @ralphschuler/screeps-chemistry | 0.1.0 | ⏳ Ready | ✅ Pass | ✅ Pass | 📝 In Progress | ✅ Unlicense |
| @ralphschuler/screeps-defense | 0.1.0 | ⏳ Ready | ✅ Pass | ✅ Pass | 📝 In Progress | ✅ Unlicense |
| @ralphschuler/screeps-economy | 0.1.0 | ⏳ Ready | ✅ Pass | ✅ Pass | 📝 In Progress | ✅ Unlicense |
| @ralphschuler/screeps-utils | 0.1.0 | ⏳ Ready | ✅ Pass | ✅ Pass | 📝 In Progress | ✅ Unlicense |
| @ralphschuler/screeps-tasks | 0.1.0 | ⏳ Ready | ✅ Pass | ✅ Pass | 📝 In Progress | ✅ Unlicense |
| @ralphschuler/screeps-posis | 0.1.0 | ⏳ Ready | ✅ Pass | ✅ Pass | 📝 In Progress | ✅ Unlicense |

*Build issues tracked in [#1010](https://github.com/ralphschuler/screeps/issues/1010)

### Publishing Workflow

The repository includes automated publishing via GitHub Actions:

- **Manual**: Use workflow dispatch to publish specific packages
- **Automated**: Create GitHub release to publish all packages
- **CI/CD**: Configured with npm provenance for supply chain security

See [publish-framework.yml](.github/workflows/publish-framework.yml) for workflow details.

### Next Steps for Publishing

1. ✅ Package metadata complete (all packages)
2. ✅ LICENSE files added (all packages)
3. ✅ CHANGELOG.md created (all packages)
4. ✅ Publishing documentation created (PUBLISHING.md)
5. ✅ CI/CD workflow updated
6. ⏳ Resolve build issues (#1010)
7. ⏳ Complete documentation for remaining packages
8. ⏳ Test manual publishing workflow
9. ⏳ Configure npm organization access
10. ⏳ First release (v1.0.0)

**Note**: Packages are currently available through this repository. npm publishing will be enabled after resolving build issues and completing final validation.

## Version Compatibility

All framework packages follow [Semantic Versioning](https://semver.org/):

- **Major version** (1.x.x): Breaking API changes
- **Minor version** (x.1.x): New features, backward compatible
- **Patch version** (x.x.1): Bug fixes, backward compatible

Current target: **v1.0.0** for all packages

### Package Compatibility Matrix

| Package | Min Screeps | TypeScript | Node.js |
|---------|-------------|------------|---------|
| All packages | Any | >=4.0 | >=16.x |

## Troubleshooting

### Common Issues

#### Spawn Not Working

**Problem**: Creeps not spawning even though spawn is idle

**Solutions**:
1. Check energy availability:
   ```typescript
   console.log(`Energy: ${room.energyAvailable}/${room.energyCapacityAvailable}`);
   ```
2. Enable debug mode:
   ```typescript
   const spawnManager = new SpawnManager({ debug: true });
   ```
3. Verify spawn requests have valid roles:
   ```typescript
   const result = spawnManager.getBestBody('harvester', room.energyAvailable);
   console.log('Body template:', result);
   ```

#### Link Network Not Functioning

**Problem**: Links not transferring energy

**Solutions**:
1. Verify RCL >= 5:
   ```typescript
   if (room.controller.level < 5) {
     console.log('Links require RCL 5+');
   }
   ```
2. Check link placement (must be within range 2):
   ```typescript
   const links = room.find(FIND_MY_STRUCTURES, {
     filter: s => s.structureType === STRUCTURE_LINK
   });
   console.log(`Found ${links.length} links`);
   ```
3. Ensure linkManager is being called each tick

#### Chemistry Not Producing

**Problem**: Labs not running reactions

**Solutions**:
1. Verify minimum requirements:
   - At least 3 labs in room
   - Terminal present and accessible
   - Sufficient input resources
2. Initialize lab configuration:
   ```typescript
   labConfig.initialize(room.name);
   ```
3. Check resource availability:
   ```typescript
   const reaction = chemistry.getReaction(RESOURCE_HYDROXIDE);
   const hasResources = chemistry.hasResourcesForReaction(
     room.terminal, 
     reaction, 
     500
   );
   console.log('Can produce:', hasResources);
   ```

#### Performance Issues

**Problem**: CPU usage too high

**Solutions**:
1. Use the kernel for CPU budget management:
   ```typescript
   import { kernel } from '@ralphschuler/screeps-kernel';
   
   kernel.registerProcess({
     id: 'spawning',
     execute: () => spawnManager.processSpawnQueue(spawns, requests),
     cpuBudget: 0.5,
     priority: 90
   });
   ```
2. Enable adaptive budgets:
   ```typescript
   import { updateConfig } from '@ralphschuler/screeps-kernel';
   updateConfig({ enableAdaptiveBudgets: true });
   ```
3. Profile your code to find bottlenecks

### Getting Help

If you encounter issues not covered here:

1. **Check package README**: Each package has detailed documentation
2. **Review examples**: See [examples/](examples/) for working implementations
3. **Enable debug logging**: Most packages support debug mode
4. **Open an issue**: [GitHub Issues](https://github.com/ralphschuler/screeps/issues)

## Migration Guide

### From Other Frameworks

#### From Overmind

The Screeps Framework shares similar goals with Overmind but with a different architecture:

**Overmind → Framework Mapping:**

| Overmind | Framework Equivalent |
|----------|---------------------|
| `Overlord` | `Process` (kernel) or direct management |
| `Zerg` | `Role` (screeps-roles) |
| `Colony` | Room-level logic (custom) |
| `DirectiveHarvest` | `SpawnRequest` (screeps-spawn) |

**Migration steps:**

1. **Replace spawn system**:
   ```typescript
   // Overmind
   colony.spawner.spawn(protoCreep, {priority: 100});
   
   // Framework
   spawnManager.processSpawnQueue(spawns, [
     { role: 'harvester', priority: 100, memory: {...} }
   ]);
   ```

2. **Replace link management**:
   ```typescript
   // Overmind
   colony.linkNetwork.receive();
   
   // Framework
   linkManager.run(room);
   ```

3. **Replace lab system**:
   ```typescript
   // Overmind
   colony.evolutionChamber.run();
   
   // Framework
   const reaction = chemistry.planReactions(room, gameState);
   if (reaction) {
     labConfig.setActiveReaction(roomName, reaction.input1, reaction.input2, reaction.product);
   }
   ```

#### From Screeps TypeScript Starter

The Framework can integrate directly with screeps-typescript-starter:

1. **Install framework packages**:
   ```bash
   npm install @ralphschuler/screeps-spawn @ralphschuler/screeps-economy
   ```

2. **Replace role logic** (optional):
   ```typescript
   // Before: custom role implementations
   import { roleHarvester } from './role.harvester';
   
   // After: use framework or keep custom
   import { SpawnManager } from '@ralphschuler/screeps-spawn';
   ```

3. **Add advanced features**:
   - Link management with `@ralphschuler/screeps-economy`
   - Lab automation with `@ralphschuler/screeps-chemistry`
   - Process scheduling with `@ralphschuler/screeps-kernel`

### From Monolithic Bot

If migrating from a single-file or monolithic bot:

1. **Extract spawn logic** first:
   ```typescript
   // Before: inline spawn logic
   if (harvesters.length < 2) {
     spawn.spawnCreep([WORK,CARRY,MOVE], 'Harvester1');
   }
   
   // After: use SpawnManager
   const requests = [];
   if (harvesters.length < 2) {
     requests.push({ role: 'harvester', priority: 100, memory: {...} });
   }
   spawnManager.processSpawnQueue(spawns, requests);
   ```

2. **Add link management** (RCL 5+):
   ```typescript
   // Replace manual link code with:
   import { linkManager } from '@ralphschuler/screeps-economy';
   linkManager.run(room);
   ```

3. **Incrementally adopt** other packages as needed

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
