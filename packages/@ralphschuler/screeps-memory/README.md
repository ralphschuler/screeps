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

## Heap Cache Contract

`HeapCacheManager` is the package's write-ahead cache for values that need fast same-global reads plus optional Memory persistence after resets.

- `set(key, value, ttl)` writes to heap immediately and marks the entry dirty for the next `persist()` call.
- `ttl` is measured in game ticks; entries expire only after the full TTL has elapsed.
- `INFINITE_TTL` entries never expire during `get()`, `rehydrateFromMemory()`, or `cleanExpired()`.
- Keys prefixed with `memory:` are heap-only references and are intentionally not persisted back into `Memory._heapCache`.
- `src/heap-cache/entries.ts` owns entry conversion and TTL checks so public cache operations stay small and consistent.

## RawMemory Segment Store

`RawSegmentStore` supports large serialized data sources outside normal `Memory` while keeping writes atomic at the source-id level.

- Data sources call `enqueueWrite(sourceId, rawString)`; callers own serialization/deserialization.
- The store splits raw strings across RawMemory segments and keeps only a compact manifest in normal Memory.
- Each source must fit within the active segment limit (`<= 10` segments by default) so all chunks can be written in one tick.
- Writes use copy-on-write segments and flip the manifest only after every target segment is active and written.
- After a global reset, call `requestMissingSegments()` each tick; it loads known manifest segments in batches and `read(sourceId)` returns data only after checksum/length validation passes.

```typescript
import { RawSegmentStore, createRawSegmentStoreManifest } from "@ralphschuler/screeps-memory";

Memory.rawSegments ??= createRawSegmentStoreManifest();
const store = new RawSegmentStore({ manifest: Memory.rawSegments });

store.requestMissingSegments(); // bootstrap after global reset
store.enqueueWrite("intel:rooms", JSON.stringify(roomIntel));
store.run();

const rawIntel = store.read("intel:rooms");
```

Use this for large, similarly volatile datasets such as historical intel, market history, cached layout plans, and long-lived path/road planning artifacts.

## Design Principles

Following the swarm architecture principles from ROADMAP.md:
- **Focused modules**: Each schema file has a single responsibility
- **Type safety**: Comprehensive TypeScript types for all memory structures
- **Documentation**: All interfaces documented with JSDoc comments
- **Default factories**: Helper functions to create valid default states

## License

Unlicense
