# Memory Subsystem

## Overview

The memory subsystem manages all persistent data storage using Memory and RawMemory, with a write-ahead heap cache for performance. It provides compression, pruning, segment management, schema validation, and migration utilities to efficiently manage the ~2MB Memory limit.

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  Heap Cache Manager                     │
│  - Write-ahead caching (heap → Memory)                  │
│  - Automatic rehydration after global reset             │
│  - Periodic persistence (every 10 ticks)                │
│  - TTL-based expiration                                 │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴────────┬──────────────┬──────────────┐
    │                 │              │              │
┌───▼────────┐  ┌────▼───────┐  ┌──▼──────┐  ┌────▼─────────┐
│ Compressor │  │   Pruner   │  │ Segment │  │   Schemas    │
│ LZ-String  │  │ Dead Creeps│  │ Manager │  │  Validation  │
│ 60-80%     │  │ Stale Intel│  │ 0-99    │  │  Migrations  │
└────────────┘  └────────────┘  └─────────┘  └──────────────┘
```

### Core Components

#### 1. **Heap Cache Manager** (`heapCache.ts`)
Write-ahead cache system that stores data in heap (global object) for fast access and persists to Memory periodically.

**Key Features:**
- Fast reads: heap access is ~10x faster than Memory
- Write-ahead: updates go to heap first, persist to Memory every 10 ticks
- Rehydration: restores heap from Memory after global reset
- TTL support: automatic expiration of stale data
- Dirty tracking: only persist modified entries

**Performance:**
- Read latency: ~0.001 CPU (heap) vs ~0.01 CPU (Memory)
- Write latency: ~0.001 CPU (heap) + ~0.05 CPU (periodic Memory sync)
- Reduces Memory serialization overhead by ~90%

#### 2. **Memory Compressor** (`memoryCompressor.ts`)
LZ-String compression for large, repetitive data structures.

**Key Features:**
- Automatic compression/decompression
- Version tracking for migrations
- Compression statistics tracking

**Compression Ratios:**
- Intel data: 60-70% reduction (room structures are repetitive)
- Portal maps: 50-60% reduction (coordinate data compresses well)
- Market history: 70-80% reduction (numeric time-series data)

#### 3. **Memory Pruner** (`memoryPruner.ts`)
Automatic cleanup of stale and unnecessary data.

**Key Features:**
- Dead creep memory cleanup
- Event log trimming (max 20 entries per room)
- Stale intel removal (>10,000 ticks old)
- Market history cleanup (>5,000 ticks old)
- Pruning statistics tracking

**Expected Savings:**
- 100-500KB per pruning cycle (depending on activity)
- Runs automatically every 50-100 ticks

#### 4. **Memory Segment Manager** (`memorySegmentManager.ts`)
Manages RawMemory.segments (0-99) for large data storage.

**Key Features:**
- Segment allocation and deallocation
- Read/write with automatic serialization
- Active segment management (max 10 active per tick)
- Public segment publishing (segment 0 for inter-player communication)

**Segment Limits:**
- 10 active segments per tick
- 100KB per segment
- 100 total segments (0-99)

#### 5. **Schemas & Validation** (`schemas.ts`)
TypeScript interfaces and validation for Memory data structures.

**Key Features:**
- Type-safe Memory access
- Schema validation utilities
- Migration support via versioning
- Comprehensive types for all Memory structures

**Schemas:**
- `SwarmState`: Per-room swarm state (pheromones, danger, intent)
- `EmpireMemory`: Global empire coordination
- `RoomIntel`: Room intelligence data
- `CreepMemory`: Per-creep state
- `SpawnQueue`: Spawn request queue

#### 6. **Migrations** (`migrations.ts`)
Schema migration utilities for upgrading Memory format between versions.

**Key Features:**
- Version tracking per Memory section
- Automatic migration on version mismatch
- Backwards compatibility support
- Migration validation and rollback

## Key Concepts

### 1. Write-Ahead Heap Cache

The heap cache acts as a fast layer in front of Memory:

```
1. READ:  Check heap → If miss, check Memory → Store in heap
2. WRITE: Write to heap (mark dirty) → Persist to Memory every 10 ticks
3. RESET: Rehydrate heap from Memory on startup
```

**Benefits:**
- ~10x faster reads (heap vs Memory)
- Reduced Memory serialization overhead
- Survives global resets (data restored from Memory)

### 2. TTL-Based Expiration

Cache entries can have a Time-To-Live (TTL) in ticks:
- `TTL > 0`: Expires after N ticks
- `TTL = -1`: Never expires (infinite)
- Default: 1000 ticks

**Use Cases:**
- Short TTL (10-50 ticks): Room scans, threat assessments
- Medium TTL (100-1000 ticks): Pathfinding, intel data
- Infinite TTL: Empire configuration, alliance data

### 3. Memory Compression

Large data structures are compressed using LZ-String:
- Compression: `LZString.compressToUTF16(JSON.stringify(data))`
- Decompression: `JSON.parse(LZString.decompressFromUTF16(compressed))`

**When to Compress:**
- Data > 1KB in size
- Highly repetitive data (room structures, coordinates)
- Data accessed infrequently (< once per 100 ticks)

## API Reference

### Heap Cache API

```typescript
import { heapCache, INFINITE_TTL } from './memory/heapCache';

// Initialize (call once at startup)
heapCache.initialize();

// Get with default (compute on miss)
const value = heapCache.get("myKey", () => expensiveCalculation(), 100);

// Set with TTL
heapCache.set("myKey", { data: "value" }, 1000); // Expires in 1000 ticks

// Set with infinite TTL
heapCache.set("config", { setting: "value" }, INFINITE_TTL);

// Delete entry
heapCache.delete("myKey");

// Persist dirty entries to Memory (happens automatically every 10 ticks)
heapCache.persist();

// Clear entire cache
heapCache.clear();

// Get statistics
const stats = heapCache.getStats();
console.log(`Entries: ${stats.entries}, Dirty: ${stats.dirty}, Size: ${stats.sizeBytes}B`);
```

### Compression API

```typescript
import { MemoryCompressor } from './memory/memoryCompressor';

const compressor = new MemoryCompressor();

// Compress data
const intel = { /* large intel object */ };
const compressed = compressor.compress(intel, 1); // version 1
console.log(`Saved ${compressed.originalSize - compressed.compressedSize} bytes`);

// Store compressed data
Memory.intel = compressed;

// Decompress data
const decompressed = compressor.decompress<RoomIntel>(Memory.intel);

// Get compression stats
const stats = compressor.getCompressionStats(data);
console.log(`Compression ratio: ${(stats.ratio * 100).toFixed(1)}%`);
```

### Pruning API

```typescript
import { MemoryPruner } from './memory/memoryPruner';

const pruner = new MemoryPruner();

// Run all pruning operations
const stats = pruner.pruneAll();
console.log(`Pruned ${stats.deadCreeps} dead creeps, saved ${stats.bytesSaved} bytes`);

// Prune specific data types
const deadCreeps = pruner.pruneDeadCreeps();
const eventLogs = pruner.pruneEventLogs(20); // Keep max 20 entries
const staleIntel = pruner.pruneStaleIntel(10000); // Older than 10k ticks
const marketHistory = pruner.pruneMarketHistory(5000); // Older than 5k ticks
```

### Segment Manager API

```typescript
import { MemorySegmentManager } from './memory/memorySegmentManager';

const segmentMgr = new MemorySegmentManager();

// Request segment for next tick (max 10 active)
segmentMgr.requestSegment(5);

// Write data to segment
const data = { portals: [...] };
segmentMgr.writeSegment(5, data);

// Read data from segment
const readData = segmentMgr.readSegment<PortalData>(5);

// Set public segment (for inter-player communication)
segmentMgr.setPublicSegment(0);

// Get active segments
const active = segmentMgr.getActiveSegments();
console.log(`Active segments: ${active.join(", ")}`);
```

### Schema Validation API

```typescript
import { SwarmState, validateSwarmState } from './memory/schemas';

// Type-safe Memory access
const swarm: SwarmState = Memory.rooms["W1N1"].swarm;

// Validate schema
if (validateSwarmState(swarm)) {
  // Safe to use
  console.log(`Danger level: ${swarm.danger}`);
} else {
  // Schema invalid, needs migration or reset
  console.log("Invalid swarm state, resetting...");
}

// Access with defaults
const danger = swarm?.danger ?? 0;
const intent = swarm?.intent ?? "eco";
```

## Performance Characteristics

### CPU Costs

| Operation | CPU Cost | Notes |
|-----------|----------|-------|
| Heap read | ~0.001 CPU | O(1) map lookup |
| Memory read | ~0.01 CPU | Requires deserialization |
| Heap write | ~0.001 CPU | O(1) map insert |
| Memory persist | ~0.05 CPU | Runs every 10 ticks |
| Compression | ~0.5-2.0 CPU | Depends on data size |
| Decompression | ~0.2-1.0 CPU | Faster than compression |
| Pruning (all) | ~0.1-0.5 CPU | Depends on Memory size |

### Memory Usage

**Heap Cache:**
- ~5KB for cache metadata
- ~(entry count * entry size) for cached data
- Lost on global reset but rehydrates from Memory

**Memory:**
- ~2MB total limit
- Typical usage: 500KB-1.5MB (depending on empire size)
- Compression can reduce by 60-80% for large datasets

**Segments:**
- 100KB per segment
- 10 active segments per tick (1MB total active)
- 100 segments total (10MB theoretical max)

### Cache Behavior

**Heap Cache:**
- Write-through: writes go to heap, persist to Memory periodically
- TTL-based expiration: stale entries removed automatically
- Rehydration: heap restored from Memory after global reset

**Memory:**
- Persistent across global resets
- Serialization/deserialization overhead
- 2MB hard limit (game enforced)

## Configuration

### Environment Variables

None. Configuration is done programmatically via APIs.

### Memory Schema

The memory subsystem defines schemas for all Memory structures. See `schemas.ts` for complete type definitions.

**Key Schemas:**
- `Memory.empire`: Global empire coordination (clusters, expansion targets, war status)
- `Memory.rooms[roomName].swarm`: Per-room swarm state (pheromones, danger, intent)
- `Memory.creeps[creepName]`: Per-creep state (role, task, target)
- `Memory._heapCache`: Heap cache persistence data (internal)

### Tunable Parameters

**Heap Cache:**
```typescript
// In heapCache.ts
const PERSISTENCE_INTERVAL = 10;  // Persist dirty entries every N ticks
const DEFAULT_TTL = 1000;         // Default TTL for cache entries
```

**Memory Pruner:**
```typescript
// In memoryPruner.ts
const MAX_EVENT_LOG_ENTRIES = 20;      // Max event log entries per room
const MAX_INTEL_AGE = 10000;           // Max age for intel data (ticks)
const MAX_MARKET_HISTORY_AGE = 5000;   // Max age for market history (ticks)
```

**Memory Compressor:**
- Compression threshold: 1KB (compress data larger than this)
- Compression version: 1 (for migration support)

## Examples

### Example 1: Using Heap Cache for Fast Access

```typescript
import { heapCache } from './memory/heapCache';

// Initialize cache at startup (in main.ts)
heapCache.initialize();

// Cache expensive calculation
function getSourceSlots(roomName: string, sourceId: Id<Source>): number {
  const cacheKey = `sourceSlots:${roomName}:${sourceId}`;
  
  return heapCache.get(cacheKey, () => {
    // Expensive calculation only runs on cache miss
    const room = Game.rooms[roomName];
    const source = Game.getObjectById(sourceId);
    if (!source) return 0;
    
    const terrain = room.getTerrain();
    let slots = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const x = source.pos.x + dx;
        const y = source.pos.y + dy;
        if (terrain.get(x, y) !== TERRAIN_MASK_WALL) slots++;
      }
    }
    return slots;
  }, INFINITE_TTL); // Source slots never change
}
```

### Example 2: Compressing Large Intel Data

```typescript
import { MemoryCompressor } from './memory/memoryCompressor';

const compressor = new MemoryCompressor();

// Store large intel data
function storeRoomIntel(roomName: string, intel: RoomIntel) {
  // Compress intel before storing
  const compressed = compressor.compress(intel, 1);
  
  if (!Memory.intel) Memory.intel = {};
  Memory.intel[roomName] = compressed;
  
  console.log(`Stored intel for ${roomName}: ${compressed.originalSize}B → ${compressed.compressedSize}B`);
}

// Retrieve and decompress intel
function getRoomIntel(roomName: string): RoomIntel | null {
  const compressed = Memory.intel?.[roomName];
  if (!compressed) return null;
  
  return compressor.decompress<RoomIntel>(compressed);
}
```

### Example 3: Automatic Memory Pruning

```typescript
import { MemoryPruner } from './memory/memoryPruner';

const pruner = new MemoryPruner();

// Run pruning every 100 ticks
if (Game.time % 100 === 0) {
  const stats = pruner.pruneAll();
  
  if (stats.bytesSaved > 1000) {
    console.log(`Pruning freed ${(stats.bytesSaved / 1024).toFixed(1)}KB:`);
    console.log(`- Dead creeps: ${stats.deadCreeps}`);
    console.log(`- Event logs: ${stats.eventLogs}`);
    console.log(`- Stale intel: ${stats.staleIntel}`);
    console.log(`- Market history: ${stats.marketHistory}`);
  }
}
```

### Example 4: Using Memory Segments for Large Data

```typescript
import { MemorySegmentManager } from './memory/memorySegmentManager';

const segmentMgr = new MemorySegmentManager();

// Store portal network in segment 5
function storePortalNetwork(portals: PortalData[]) {
  // Request segment for next tick
  segmentMgr.requestSegment(5);
  
  // Write data (will be available next tick)
  segmentMgr.writeSegment(5, { portals, timestamp: Game.time });
  
  console.log(`Stored ${portals.length} portals in segment 5`);
}

// Retrieve portal network
function getPortalNetwork(): PortalData[] | null {
  const data = segmentMgr.readSegment<{ portals: PortalData[]; timestamp: number }>(5);
  
  if (!data) {
    // Segment not loaded yet, request it
    segmentMgr.requestSegment(5);
    return null;
  }
  
  // Check if data is stale (>1000 ticks old)
  if (Game.time - data.timestamp > 1000) {
    return null; // Refresh needed
  }
  
  return data.portals;
}
```

### Example 5: Schema Migration

```typescript
import { migrateMemory, MEMORY_VERSION } from './memory/migrations';

// Run migration at startup (in main.ts)
if (!Memory.version || Memory.version < MEMORY_VERSION) {
  console.log(`Migrating memory from v${Memory.version || 0} to v${MEMORY_VERSION}`);
  
  const success = migrateMemory();
  
  if (success) {
    Memory.version = MEMORY_VERSION;
    console.log("Migration successful");
  } else {
    console.log("Migration failed, resetting memory");
    // Handle migration failure
  }
}
```

## Testing

### Test Coverage

- **Heap Cache**: Unit tests for CRUD operations, TTL expiration, persistence, rehydration
- **Compression**: Unit tests for compression ratios, decompression, versioning
- **Pruning**: Unit tests for dead creep cleanup, event log trimming, intel pruning
- **Segments**: Integration tests for segment read/write, active segment management
- **Schemas**: Type tests for schema validation, migration utilities

### Running Tests

```bash
# Run all memory tests
npm run test:unit -- --grep "memory|heap|compress|prune"

# Run specific test suite
npm run test:unit -- packages/screeps-bot/test/unit/heapCache.test.ts
```

## Troubleshooting

### Issue: Memory limit exceeded (2MB)

**Symptoms**: Game warns about Memory size approaching 2MB limit

**Causes:**
1. Large intel data not compressed
2. Dead creep memory not pruned
3. Event logs growing unbounded
4. Market history accumulating

**Solutions:**
1. Enable compression for large data: `compressor.compress(data)`
2. Run pruning more frequently: reduce interval from 100 to 50 ticks
3. Reduce event log limit: `pruner.pruneEventLogs(10)` (default: 20)
4. Use segments for very large data instead of Memory
5. Check Memory usage: `console.log(RawMemory.get().length)`

### Issue: Heap cache not persisting

**Symptoms**: Data lost after global reset

**Causes:**
1. `heapCache.persist()` not called
2. Persistence interval too long
3. Memory full (persistence failed)

**Solutions:**
1. Ensure persistence runs: check `heapCache.persist()` called every 10 ticks
2. Reduce persistence interval if needed
3. Check Memory size: `RawMemory.get().length < 2MB`
4. Verify dirty entries: `heapCache.getStats().dirty`

### Issue: Compression not reducing size

**Symptoms**: Compressed data nearly same size as original

**Causes:**
1. Data not repetitive (random/unique values)
2. Data already compressed (JSON with minimal redundancy)
3. Data too small (compression overhead > savings)

**Solutions:**
1. Use compression only for repetitive data (room structures, coordinates)
2. Don't compress already compact data (single numbers, short strings)
3. Set compression threshold: only compress data > 1KB
4. Check compression ratio: `stats.ratio < 0.9` (10%+ savings)

### Issue: Segments not loading

**Symptoms**: `segmentMgr.readSegment()` returns null

**Causes:**
1. Segment not requested yet
2. Too many active segments (max 10 per tick)
3. Segment not written yet

**Solutions:**
1. Request segment before reading: `segmentMgr.requestSegment(5)`
2. Limit active segments to max 10
3. Check if data exists: segment written on previous tick
4. Verify segment ID: 0-99 are valid

### Issue: Schema validation failing

**Symptoms**: `validateSwarmState()` returns false

**Causes:**
1. Memory structure changed (migration needed)
2. Manual Memory edit introduced invalid data
3. Schema version mismatch

**Solutions:**
1. Run migration: `migrateMemory()`
2. Reset invalid data: initialize with defaults
3. Check schema version: `Memory.version`
4. Review recent Memory changes

### Issue: Heap cache growing too large

**Symptoms**: Heap cache consuming excessive memory, performance degradation

**Causes:**
1. TTL too long or infinite for temporary data
2. Too many cache entries
3. No cleanup of expired entries

**Solutions:**
1. Use shorter TTL for temporary data: 10-100 ticks
2. Clear cache periodically: `heapCache.clear()`
3. Reduce cache usage: only cache expensive calculations
4. Monitor cache size: `heapCache.getStats().sizeBytes`

## Related Documentation

- [ROADMAP.md](../../../../ROADMAP.md) - Section 4: Memory & Data Models
- [Core Subsystem](../core/README.md) - Kernel and process scheduling
- [Cache Subsystem](../cache/README.md) - Unified cache system
- [Standards](../standards/README.md) - Screepers Standards segment usage (segment 0)
