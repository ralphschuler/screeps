# @ralphschuler/screeps-memory

Memory schemas and TypeScript types for the Screeps swarm architecture.

## Overview

This package contains all memory structure definitions used across the bot, organized by domain:

- **Empire Schemas**: Global meta-layer state (empire coordination, expansion, market)
- **Cluster Schemas**: Colony cluster management and coordination
- **Room/Swarm Schemas**: Room-level swarm state and pheromones
- **Creep Schemas**: Creep roles, memory, and squad definitions
- **Utility Schemas**: Visualization config and default factory functions

## Installation

```bash
npm install @ralphschuler/screeps-memory
```

## Usage

```typescript
import {
  EmpireMemory,
  ClusterMemory,
  SwarmState,
  SwarmCreepMemory,
  createDefaultEmpireMemory,
  createDefaultSwarmState
} from '@ralphschuler/screeps-memory';

// Initialize empire memory
const empire: EmpireMemory = createDefaultEmpireMemory();

// Create swarm state for a room
const swarmState: SwarmState = createDefaultSwarmState();
```

## Schema Organization

### Empire Schemas
Global coordination across all colonies and clusters.

### Cluster Schemas
Inter-room coordination within a cluster (capital + support rooms).

### Room/Swarm Schemas
Individual room state including evolution stage, posture, and pheromones.

### Creep Schemas
Creep roles, memory structures, and squad definitions.

### Utility Schemas
Visualization configuration and helper functions.

## Design Principles

Following the swarm architecture principles from ROADMAP.md:
- **Focused modules**: Each schema file has a single responsibility
- **Type safety**: Comprehensive TypeScript types for all memory structures
- **Documentation**: All interfaces documented with JSDoc comments
- **Default factories**: Helper functions to create valid default states

## License

Unlicense
