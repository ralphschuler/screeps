# Developer Guides

Comprehensive developer guides for the Screeps bot framework.

## Available Guides

### Core Systems

1. **[Kernel & Processes](./kernel.md)** - Process management, CPU budgets, scheduling, event system
   - 1,284 lines | 33 KB
   - Process registration, CPU budget allocation, priority scheduling, event-driven architecture

2. **[Roles System](./roles.md)** - Role definitions, behaviors, state machines, role assignment
   - 1,089 lines | 31 KB
   - Creating custom roles, behavior functions, built-in roles, advanced patterns

3. **[State Machines](./state-machines.md)** - Behavior state management, action persistence, completion logic
   - 825 lines | 19 KB
   - State lifecycle, common patterns, behavior trees, troubleshooting

### Coordination & Data

4. **[Pheromones](./pheromones.md)** - Stigmergic communication, emergent behavior, swarm coordination
   - 1,170 lines | 28 KB
   - Pheromone types, diffusion system, danger levels, integration examples

5. **[Memory Architecture](./memory.md)** - Memory management, monitoring, pruning, segmentation, compression
   - 700 lines | 16 KB  
   - Memory monitoring, automatic pruning, RawMemory segments, LZ-String compression, schema migrations

### Specialized Systems

6. **[Economy Systems](./economy.md)** - Resource management, harvesting, hauling, links, terminals, factory, market
   - 856 lines | 23 KB
   - Static harvesting, remote mining, link balancing, terminal routing, factory automation, market trading

7. **[Defense Coordination](./defense.md)** - Threat assessment, tower automation, cluster defense, safe mode
   - 758 lines | 21 KB
   - Threat analysis, DPS calculation, tower priority, defender coordination, cluster mobilization

## Total Documentation

- **7 comprehensive guides**
- **6,682 lines of documentation**
- **~180 KB of developer resources**
- **500-1,300 lines per guide**

## Guide Features

Each guide includes:

✅ **Comprehensive Examples** - Copy-paste ready code  
✅ **Architecture Diagrams** - Visual system overviews  
✅ **API References** - Complete interface documentation  
✅ **Best Practices** - Proven patterns and approaches  
✅ **Troubleshooting** - Common issues and solutions  
✅ **Related Documentation** - Cross-references to other guides  

## Quick Start

### New to the Framework?

Start with these guides in order:

1. **[Roles System](./roles.md)** - Understand how creeps behave
2. **[State Machines](./state-machines.md)** - Learn behavior persistence
3. **[Kernel & Processes](./kernel.md)** - Understand CPU management
4. **[Pheromones](./pheromones.md)** - Learn swarm coordination

### Building Economy Systems?

1. **[Economy Systems](./economy.md)** - Harvesting, hauling, production
2. **[Memory Architecture](./memory.md)** - Data storage and optimization
3. **[Roles System](./roles.md)** - Economy role behaviors

### Implementing Defense?

1. **[Defense Coordination](./defense.md)** - Threat assessment and response
2. **[Roles System](./roles.md)** - Military role behaviors
3. **[Pheromones](./pheromones.md)** - Defense pheromone integration

## Source Material

These guides consolidate and enhance documentation from:

- `docs/PHEROMONES_GUIDE.md`
- `docs/STATE_MACHINES.md`
- `docs/MEMORY_ARCHITECTURE.md`
- `docs/ECONOMY_SYSTEM.md`
- `docs/DEFENSE_COORDINATION.md`
- `docs/roles/` directory
- `docs/state-machines/` directory

## Framework Packages

Guides reference these packages:

- `@ralphschuler/screeps-kernel` - Process management
- `@ralphschuler/screeps-roles` - Role behaviors
- `@ralphschuler/screeps-economy` - Economy managers
- `@ralphschuler/screeps-defense` - Defense coordination
- `@ralphschuler/screeps-utils` - Utilities and helpers

## Contributing

When updating guides:

1. Keep examples practical and copy-paste ready
2. Include both simple and advanced patterns
3. Add troubleshooting for common issues
4. Cross-reference related guides
5. Update this README if adding new guides

## Roadmap Alignment

All guides align with `ROADMAP.md`:

- **Section 4**: Memory limits (2MB)
- **Section 5**: Pheromone system (swarm signals)
- **Section 7**: State machines (behavior persistence)
- **Section 11**: Cluster & empire logic
- **Section 12**: Combat & defense
- **Section 20**: CPU budgets (strict tick budget)

---

**Last Updated**: 2025-01-23  
**Maintainer**: Screeps Bot Team  
**Total Lines**: 6,682 lines across 7 guides
