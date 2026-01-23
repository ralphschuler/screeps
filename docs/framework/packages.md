# Framework Package Index

Complete reference for all 21 framework packages organized by category.

## Process Management

### @ralphschuler/screeps-kernel

**Purpose**: CPU-budgeted process scheduler with priority management

**Key Features**:
- Process registration with CPU budgets
- Priority-based scheduling
- Wrap-around queue for fairness
- Event system (pub/sub)
- Process decorators
- Statistics tracking

**Installation**: `npm install @ralphschuler/screeps-kernel`

**Documentation**: [README](../../packages/@ralphschuler/screeps-kernel/README.md) | [Developer Guide](../guides/kernel.md)

---

### @ralphschuler/screeps-posis

**Purpose**: POSIS (Process-Oriented Screeps Intelligence System) architecture

**Key Features**:
- Process-based bot organization
- Inter-process communication
- State management
- Hierarchical process trees

**Installation**: `npm install @ralphschuler/screeps-posis`

**Documentation**: [README](../../packages/@ralphschuler/screeps-posis/README.md)

---

## Economy & Resources

### @ralphschuler/screeps-spawn

**Purpose**: Spawning system with body optimization

**Key Features**:
- Priority-based spawn queue
- Smart body part selection
- Role templates for all creep types
- Bootstrap mode support
- Energy-aware body optimization

**Installation**: `npm install @ralphschuler/screeps-spawn`

**Documentation**: [README](../../packages/screeps-spawn/README.md)

---

### screeps-economy

**Purpose**: Resource management and trading

**Key Features**:
- Link network automation
- Terminal routing with Dijkstra
- Factory management
- Market trading with price analysis
- Resource balancing

**Installation**: `npm install @ralphschuler/screeps-economy`

**Documentation**: [README](../../packages/screeps-economy/README.md) | [Developer Guide](../guides/economy.md)

---

### screeps-chemistry

**Purpose**: Lab automation and reactions

**Key Features**:
- Reaction chain planning
- Lab role assignment
- Boost management
- Just-in-time production
- Resource efficiency optimization

**Installation**: `npm install @ralphschuler/screeps-chemistry`

**Documentation**: [README](../../packages/screeps-chemistry/README.md)

---

### screeps-tasks

**Purpose**: Task management system

**Key Features**:
- Task queue with priorities
- Task assignment to creeps
- Task lifecycle tracking
- Predefined task types
- Custom task creation

**Installation**: `npm install @ralphschuler/screeps-tasks`

**Documentation**: [README](../../packages/screeps-tasks/README.md)

---

## Combat & Defense

### screeps-defense

**Purpose**: Defense systems and tower automation

**Key Features**:
- Tower automation with priority targeting
- Threat assessment (DPS calculation)
- Safe mode management
- Rampart repair coordination
- Cluster-wide defense coordination

**Installation**: `npm install @ralphschuler/screeps-defense`

**Documentation**: [README](../../packages/screeps-defense/README.md) | [Developer Guide](../guides/defense.md)

---

## Architecture & Utilities

### @ralphschuler/screeps-roles

**Purpose**: Complete role implementations

**Key Features**:
- All standard roles (harvester, hauler, upgrader, etc.)
- Behavior trees for decision making
- Context-based execution
- State machine integration
- Energy-efficient implementations
- Remote mining support

**Installation**: `npm install @ralphschuler/screeps-roles`

**Documentation**: [README](../../packages/@ralphschuler/screeps-roles/README.md) | [Developer Guide](../guides/roles.md)

---

### @ralphschuler/screeps-utils

**Purpose**: Common utilities and helpers

**Key Features**:
- Caching helpers
- Pathfinding utilities
- Performance optimizations
- Type guards and validators
- Room utilities
- Position calculations

**Installation**: `npm install @ralphschuler/screeps-utils`

**Documentation**: [README](../../packages/screeps-utils/README.md)

---

### @ralphschuler/screeps-cache

**Purpose**: Unified caching system

**Key Features**:
- TTL-based expiration
- LRU eviction
- Namespace isolation
- Multiple cache types (room.find, paths, objects)
- Heap and memory storage backends
- Statistics tracking

**Installation**: `npm install @ralphschuler/screeps-cache`

**Documentation**: [README](../../packages/@ralphschuler/screeps-cache/README.md)

---

### @ralphschuler/screeps-pathfinding

**Purpose**: Advanced pathfinding algorithms

**Key Features**:
- Path caching with TTL
- Traffic avoidance
- Multi-room pathfinding
- Custom cost matrices
- Road planning
- Performance optimizations

**Installation**: `npm install @ralphschuler/screeps-pathfinding`

**Documentation**: [README](../../packages/@ralphschuler/screeps-pathfinding/README.md)

---

### @ralphschuler/screeps-remote-mining

**Purpose**: Remote mining automation

**Key Features**:
- Remote room scanning
- Harvester/hauler coordination
- Road building automation
- Defense integration
- Energy efficiency tracking
- Multi-room mining

**Installation**: `npm install @ralphschuler/screeps-remote-mining`

**Documentation**: [README](../../packages/@ralphschuler/screeps-remote-mining/README.md)

---

## Infrastructure

### @ralphschuler/screeps-core

**Purpose**: Core types and interfaces

**Key Features**:
- Shared type definitions
- Common interfaces
- Base classes
- Constants and enums
- Utility types

**Installation**: `npm install @ralphschuler/screeps-core`

**Documentation**: [README](../../packages/@ralphschuler/screeps-core/README.md)

---

### @ralphschuler/screeps-stats

**Purpose**: Statistics collection and monitoring

**Key Features**:
- Unified stats collection
- Grafana integration
- Custom metrics
- Performance tracking
- Room/empire statistics
- Console integration

**Installation**: `npm install @ralphschuler/screeps-stats`

**Documentation**: [README](../../packages/@ralphschuler/screeps-stats/README.md)

---

### @ralphschuler/screeps-console

**Purpose**: Enhanced console commands

**Key Features**:
- Room management commands
- Spawn control
- Defense commands
- Economy inspection
- Statistics display
- Custom command registration

**Installation**: `npm install @ralphschuler/screeps-console`

**Documentation**: [README](../../packages/@ralphschuler/screeps-console/README.md)

---

### @ralphschuler/screeps-visuals

**Purpose**: Visual rendering system

**Key Features**:
- Room visuals
- Creep path visualization
- Structure overlays
- Text rendering
- Performance indicators
- Debug visualization

**Installation**: `npm install @ralphschuler/screeps-visuals`

**Documentation**: [README](../../packages/@ralphschuler/screeps-visuals/README.md)

---

### @ralphschuler/screeps-layouts

**Purpose**: Room layout planning and blueprints

**Key Features**:
- Pre-designed room layouts
- Blueprint system
- Road-aware defense placement
- Extension grouping
- Controller link positioning
- Layout validation

**Installation**: `npm install @ralphschuler/screeps-layouts`

**Documentation**: [README](../../packages/@ralphschuler/screeps-layouts/README.md)

---

### @ralphschuler/screeps-intershard

**Purpose**: Inter-shard communication and coordination

**Key Features**:
- Shard role assignment
- Resource transfers
- Portal management
- Cross-shard messaging
- Shard status tracking
- Console commands

**Installation**: `npm install @ralphschuler/screeps-intershard`

**Documentation**: [README](../../packages/@ralphschuler/screeps-intershard/README.md)

---

### @ralphschuler/screeps-clusters

**Purpose**: Colony clustering and coordination

**Key Features**:
- Cluster identification
- Resource sharing
- Military coordination
- Economic balancing
- Cluster-level strategy

**Installation**: `npm install @ralphschuler/screeps-clusters`

**Documentation**: [README](../../packages/@ralphschuler/screeps-clusters/README.md)

---

### @ralphschuler/screeps-empire

**Purpose**: Empire-wide management and strategy

**Key Features**:
- Multi-shard coordination
- Strategic planning
- Expansion decisions
- War coordination
- Resource allocation

**Installation**: `npm install @ralphschuler/screeps-empire`

**Documentation**: [README](../../packages/@ralphschuler/screeps-empire/README.md)

**Status**: ⚠️ In development

---

### @ralphschuler/screeps-standards

**Purpose**: Communication protocols (SS2)

**Key Features**:
- SS2 Terminal Communications
- Multi-packet message transmission
- Inter-player messaging
- Protocol standardization
- Message encoding/decoding

**Installation**: `npm install @ralphschuler/screeps-standards`

**Documentation**: [README](../../packages/@ralphschuler/screeps-standards/README.md)

---

## Package Compatibility Matrix

| Package | Min Screeps | TypeScript | Node.js | Dependencies |
|---------|-------------|------------|---------|--------------|
| All packages | Any | >=4.0 | >=16.x | Screeps API |
| screeps-economy | Any | >=4.0 | >=16.x | + screeps-utils |
| screeps-roles | Any | >=4.0 | >=16.x | + screeps-core, screeps-stats |
| screeps-defense | Any | >=4.0 | >=16.x | + screeps-kernel |
| screeps-remote-mining | Any | >=4.0 | >=16.x | + screeps-pathfinding |

## Quick Reference

### By Use Case

**Starting a new bot?**
- screeps-kernel (process management)
- screeps-spawn (spawning)
- screeps-utils (utilities)

**Need economy?**
- screeps-economy (links, terminals, market)
- screeps-chemistry (labs)

**Need defense?**
- screeps-defense (towers, safe mode)

**Need expansion?**
- screeps-remote-mining (remote harvesting)
- screeps-pathfinding (advanced paths)
- screeps-layouts (room planning)

**Advanced features?**
- screeps-intershard (multi-shard)
- screeps-empire (empire management)
- screeps-standards (communication)

### Installation by Feature

```bash
# Minimal bot
npm i @ralphschuler/screeps-kernel @ralphschuler/screeps-spawn

# + Economy
npm i @ralphschuler/screeps-economy @ralphschuler/screeps-utils

# + Defense
npm i @ralphschuler/screeps-defense

# + Labs
npm i @ralphschuler/screeps-chemistry

# + Expansion
npm i @ralphschuler/screeps-remote-mining @ralphschuler/screeps-pathfinding

# Full featured
npm i @ralphschuler/screeps-{kernel,spawn,economy,defense,chemistry,remote-mining,pathfinding,layouts,intershard,utils}
```

## See Also

- [Framework Overview](overview.md) - Architecture and design
- [Quick Start Guide](quickstart.md) - Get started quickly
- [Developer Guides](../guides/) - System deep dives
- [API Reference](../../api/) - Complete API docs
