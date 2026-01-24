# Memory Architecture Developer Guide

## Overview

The Memory Architecture provides comprehensive memory management to scale to 100+ rooms while staying under Screeps' 2MB memory limit. This guide consolidates information from docs/MEMORY_ARCHITECTURE.md.

**Key Features:**
- **Memory Monitoring**: Real-time usage tracking with automatic alerts
- **Automatic Pruning**: Remove stale and unnecessary data
- **Segmentation**: Move rarely-accessed data to RawMemory segments
- **Compression**: LZ-String compression for large datasets
- **Schema Migration**: Version-controlled memory structure updates

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Memory Monitoring](#memory-monitoring)
3. [Automatic Pruning](#automatic-pruning)
4. [Memory Segmentation](#memory-segmentation)
5. [Data Compression](#data-compression)
6. [Schema Migrations](#schema-migrations)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Problem Statement

### Memory Growth Without Management

```
Per room memory footprint:
- Room state (swarm):          ~2-5 KB
- Creep memory (avg 20):       ~1-2 KB
- Remote mining data:          ~1-2 KB
- Event log (20 entries):      ~500 bytes
Total per room:                ~5-10 KB

Empire scaling calculation:
- 10 rooms:   50-100 KB   ✓ Safe
- 50 rooms:   250-500 KB  ✓ Safe  
- 100 rooms:  500KB-1MB   ⚠ Approaching limit
- 200 rooms:  1-2 MB      ❌ At or exceeding limit

Additional consumers:
- Empire state: ~10-50 KB
- Market orders: ~5-10 KB
- Intel data: ~50-100 KB
- Lab reactions: ~5-10 KB per lab room
- Alliance data: ~10-20 KB

Total at 100 rooms: 800KB-1.4MB (close to 2MB limit!)
```

### Solution: Multi-Layered Approach

```
Layer 1: Monitoring & Alerts   ← Track usage, alert at 80%/90%
Layer 2: Automatic Pruning     ← Remove dead creeps, old intel
Layer 3: Segmentation          ← Move to RawMemory segments
Layer 4: Compression           ← LZ-String for large data
Layer 5: Schema Migration      ← Safe structure updates
```

---

## Memory Monitoring

### MemoryMonitor Class

File: `src/memory/memoryMonitor.ts`

**Features:**
- Real-time memory usage tracking
- Category breakdown (rooms, empire, intel, etc.)
- Automatic alerts at thresholds
- Largest consumer identification

### Usage

```typescript
import { memoryMonitor } from "./memory/memoryMonitor";

// Check current memory usage
const stats = memoryMonitor.checkMemoryUsage();
console.log(`Memory: ${stats.used} / ${stats.limit} bytes (${stats.percentage * 100}%)`);
console.log(`Status: ${stats.status}`); // safe, warning, critical

// Get breakdown by category
const breakdown = memoryMonitor.getMemoryBreakdown();
console.log(`Rooms: ${breakdown.rooms} bytes`);
console.log(`Empire: ${breakdown.empire} bytes`);
console.log(`Intel: ${breakdown.intel} bytes`);
console.log(`Market: ${breakdown.market} bytes`);

// Find largest memory consumers
const consumers = memoryMonitor.getLargestConsumers(10);
for (const consumer of consumers) {
  console.log(`${consumer.key}: ${consumer.size} bytes`);
}
```

### Console Commands

```javascript
// Show current memory status
memory.status()

// Analyze top consumers
memory.analyze(20) // Show top 20
```

### Alert Thresholds

```typescript
const THRESHOLDS = {
  warning: 0.80,    // 80% - Warning alert
  critical: 0.90,   // 90% - Critical alert
  maximum: 0.95     // 95% - Emergency measures
};

// Automatic alerts
if (stats.percentage > 0.90) {
  console.log('🚨 CRITICAL: Memory at 90%!');
  triggerEmergencyPruning();
}
```

---

## Automatic Pruning

### MemoryPruner Class

File: `src/memory/memoryPruner.ts`

**Pruning Operations:**
1. Dead creeps (no longer exist)
2. Event logs (keep last 20 per room)
3. Stale intel (older than 10,000 ticks)
4. Market history (older than 5,000 ticks)
5. Powerbanks (decayed)
6. Nukes (landed)

### Usage

```typescript
import { memoryPruner } from "./memory/memoryPruner";

// Manual pruning
memoryPruner.pruneAll();

// Individual operations
memoryPruner.pruneDeadCreeps();
memoryPruner.pruneEventLogs();
memoryPruner.pruneStaleIntel();
memoryPruner.pruneMarketHistory();
```

### Automatic Execution

Integrated into `MemoryManager`:

```typescript
@Process({
  id: "core:memoryCleanup",
  priority: ProcessPriority.LOW,
  frequency: "low", // Every 100 ticks
  cpuBudget: 0.02
})
public cleanupMemory(): void {
  memoryPruner.pruneAll();
}
```

### Expected Savings

- **Dead creeps**: 1-5 KB per cleanup
- **Event logs**: 10-50 KB (depending on empire size)
- **Stale intel**: 20-100 KB (old exploration data)
- **Total**: 10-20% memory reduction

### Example: Dead Creep Pruning

```typescript
public pruneDeadCreeps(): number {
  let pruned = 0;
  
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      pruned++;
    }
  }
  
  return pruned;
}
```

---

## Memory Segmentation

### MemorySegmentManager Class

File: `src/memory/memorySegmentManager.ts`

**Segment Allocation:**
```
Segment 0-9:   Active room data (hot data)
Segment 10-19: Historical intel (every 100-1000 ticks)
Segment 20-29: Market history (every 500+ ticks)
Segment 30-39: Alliance/Standards data
Segment 40-49: Archived empire state
Segment 50-89: Reserved for future use
Segment 90-99: Stats and monitoring
```

### Segment Basics

- Each segment: 100KB capacity
- Total segments: 100 (0-99)
- Max active: 10 segments at once
- Data persists across global resets

### Usage

```typescript
import { memorySegmentManager } from "./memory/memorySegmentManager";

// Request segment for next tick
memorySegmentManager.requestSegment(10);

// Write data (executes next tick when loaded)
Game.cpu.getUsed(); // Wait for next tick...
memorySegmentManager.writeSegment(10, "historicalIntel", intelData);

// Read data
const intel = memorySegmentManager.readSegment(10, "historicalIntel");

// Release when done
memorySegmentManager.releaseSegment(10);
```

### Example: Moving Intel to Segments

```typescript
// Before: Intel in main Memory
Memory.empire.knownRooms = {
  "W1N1": { ...roomData },
  "W2N2": { ...roomData },
  // ... 1000+ rooms = 500KB+
};

// After: Intel in segments
memorySegmentManager.requestSegment(10);
// Next tick:
const intel = memorySegmentManager.readSegment(10, "knownRooms");
// Process intel...
memorySegmentManager.writeSegment(10, "knownRooms", updatedIntel);
```

### Expected Savings

40-60% reduction in main Memory size by moving:
- Historical intel
- Market price history
- Alliance data
- Old stats

---

## Data Compression

### MemoryCompressor Class

File: `src/memory/memoryCompressor.ts`

**Compression Ratios:**
- Intel data: 60-70% reduction
- Portal maps: 50-60% reduction
- Market history: 70-80% reduction

### Usage

```typescript
import { memoryCompressor } from "./memory/memoryCompressor";

// Compress data
const compressed = memoryCompressor.compressIntel(intelData);
// Returns: { compressed: string, originalSize: number, compressedSize: number }

console.log(`Compressed ${compressed.originalSize} → ${compressed.compressedSize} bytes`);
console.log(`Savings: ${(1 - compressed.compressedSize / compressed.originalSize) * 100}%`);

// Decompress data
const intel = memoryCompressor.decompressIntel(compressed.compressed);

// Check if compression is beneficial
if (memoryCompressor.shouldCompress(data, 1000)) {
  // Only compress if data > 1KB and saves > 20%
  const compressed = memoryCompressor.compress(data);
}

// Automatic handling (compressed or uncompressed)
const result = memoryCompressor.getOrDecompress(data);
```

### Example: Compressing Portal Map

```typescript
// Before: 50KB uncompressed
Memory.empire.portalMap = {
  "W1N1": [{ destination: "E1N1", pos: {...} }],
  // ... hundreds of portals
};

// After: 20KB compressed (60% savings)
const compressed = memoryCompressor.compress(Memory.empire.portalMap);
Memory.empire.portalMapCompressed = compressed.compressed;
delete Memory.empire.portalMap;

// Usage
const portalMap = memoryCompressor.decompress(Memory.empire.portalMapCompressed);
```

### When to Compress

```typescript
// Compress if:
// 1. Data size > 1KB
// 2. Compression saves > 20%
// 3. Data accessed infrequently (< once per 10 ticks)

if (dataSize > 1000 && 
    compressionRatio < 0.8 && 
    accessFrequency < 0.1) {
  compressData();
}
```

---

## Schema Migrations

### Migration System

File: `src/memory/migrations.ts`

**Features:**
- Version-controlled migrations
- Automatic migration runner
- Safe rollback support
- Error handling with notifications

### Current Migrations

```typescript
const migrations: Migration[] = [
  {
    version: 4,
    description: "Move historical intel to segments",
    migrate: (memory) => {
      // Move data from Memory to segments
      const intel = memory.empire.historicalIntel;
      memorySegmentManager.writeSegment(10, "historicalIntel", intel);
      delete memory.empire.historicalIntel;
    }
  },
  {
    version: 5,
    description: "Compress portal map data",
    migrate: (memory) => {
      const compressed = memoryCompressor.compress(memory.empire.portalMap);
      memory.empire.portalMapCompressed = compressed.compressed;
      delete memory.empire.portalMap;
    }
  },
  {
    version: 6,
    description: "Move market history to segments with compression",
    migrate: (memory) => {
      const compressed = memoryCompressor.compress(memory.market.priceHistory);
      memorySegmentManager.writeSegment(20, "marketHistory", compressed.compressed);
      delete memory.market.priceHistory;
    }
  }
];
```

### Adding Migrations

```typescript
// In migrations.ts
export const migrations: Migration[] = [
  // ... existing migrations
  {
    version: 7,
    description: "Your migration description",
    migrate: (memory) => {
      // Migration logic
      // - Transform data structures
      // - Move to segments
      // - Apply compression
      // - Clean up old data
    },
    rollback: (memory) => {
      // Optional: Undo migration
    }
  }
];
```

### Console Commands

```javascript
// Show migration status
memory.migrations()

// Manually run pending migrations
memory.migrate()

// Rollback last migration
memory.rollback()
```

### Migration Best Practices

```typescript
// 1. Always check data exists
if (memory.empire.oldData) {
  // Migrate
  delete memory.empire.oldData;
}

// 2. Validate after migration
const migrated = memorySegmentManager.readSegment(10, "data");
if (!migrated) {
  console.log("⚠️ Migration failed!");
  return false;
}

// 3. Provide rollback
rollback: (memory) => {
  const data = memorySegmentManager.readSegment(10, "data");
  memory.empire.oldData = data;
  memorySegmentManager.releaseSegment(10);
}

// 4. Update version
memory._version = 7;
```

---

## Best Practices

### 1. Monitor Memory Regularly

```typescript
@Process({
  id: "core:memorySizeCheck",
  priority: ProcessPriority.LOW,
  frequency: "low",
  cpuBudget: 0.01
})
public checkMemorySize(): void {
  const stats = memoryMonitor.checkMemoryUsage();
  
  if (stats.percentage > 0.90) {
    console.log("🚨 Memory critical: " + (stats.percentage * 100).toFixed(1) + "%");
    // Emergency pruning
    memoryPruner.pruneAll();
  }
  
  // Export to Grafana
  if (!Memory.stats) Memory.stats = {};
  Memory.stats.memoryUsed = stats.used;
  Memory.stats.memoryPercentage = stats.percentage;
}
```

### 2. Use Segments for Large Datasets

```typescript
// ❌ Bad: Store large data in Memory
Memory.empire.allRoomIntel = { /* 500KB+ */ };

// ✅ Good: Store in segments
memorySegmentManager.writeSegment(10, "allRoomIntel", roomIntel);
```

### 3. Compress Infrequently-Accessed Data

```typescript
// ❌ Bad: Uncompressed market history
Memory.market.priceHistory = { /* 200KB */ };

// ✅ Good: Compressed in segment
const compressed = memoryCompressor.compress(priceHistory);
memorySegmentManager.writeSegment(20, "priceHistory", compressed);
```

### 4. Prune Aggressively

```typescript
// Keep event logs minimal
const MAX_EVENT_LOG_SIZE = 20;

if (memory.eventLog.length > MAX_EVENT_LOG_SIZE) {
  memory.eventLog = memory.eventLog.slice(-MAX_EVENT_LOG_SIZE);
}

// Remove old intel
const INTEL_EXPIRY = 10000; // 10,000 ticks

for (const roomName in memory.intel) {
  if (Game.time - memory.intel[roomName].lastSeen > INTEL_EXPIRY) {
    delete memory.intel[roomName];
  }
}
```

### 5. Minimize Per-Creep Memory

```typescript
// ❌ Bad: Store full path
creep.memory.path = [
  {x:1,y:2},{x:2,y:2},{x:3,y:2},... // 50+ positions
];

// ✅ Good: Use cached paths or serialized path
creep.memory.pathSerialized = Room.serializePath(path);

// ✅ Better: Use creep.moveByPath() with reusePath
creep.moveTo(target, { reusePath: 10 }); // Stored internally
```

---

## Troubleshooting

### Issue: Memory Exceeding 2MB

**Symptoms**: "Memory limit exceeded" error

**Diagnosis**:
```javascript
memory.status()     // Check total usage
memory.analyze(50)  // Find largest consumers
```

**Solutions**:
1. Run emergency pruning: `memory.prune()`
2. Move large datasets to segments
3. Enable compression for intel/market data
4. Reduce event log sizes
5. Clear old creep memory

### Issue: Segment Not Loading

**Symptoms**: `RawMemory.segments[X]` is undefined

**Cause**: Segment not requested in previous tick

**Solution**:
```typescript
// Request in tick N
RawMemory.setActiveSegments([10]);

// Use in tick N+1
if (RawMemory.segments[10]) {
  const data = JSON.parse(RawMemory.segments[10]);
}
```

### Issue: Compression Not Saving Space

**Symptoms**: Compressed data larger than original

**Cause**: Data not repetitive enough or already compact

**Solution**:
```typescript
// Check compression benefit
const compressed = memoryCompressor.compress(data);
const ratio = compressed.compressedSize / compressed.originalSize;

if (ratio > 0.8) {
  // Don't compress, not worth it
  console.log("Compression not beneficial");
}
```

### Issue: Migration Failed

**Symptoms**: Data lost or corrupted after migration

**Solution**:
```typescript
// Always test migrations first
// 1. Backup Memory
const backup = JSON.stringify(Memory);

// 2. Run migration
runMigration(7);

// 3. Validate
if (!validateMemoryIntegrity()) {
  // Rollback
  Memory = JSON.parse(backup);
}
```

---

## Related Documentation

- [Kernel Guide](./kernel.md) - Process scheduling for memory management
- [State Machines Guide](./state-machines.md) - Minimizing creep memory
- [Pheromones Guide](./pheromones.md) - Room-based state instead of memory
- [Economy Guide](./economy.md) - Economy data storage

---

## API Reference

### MemoryMonitor

```typescript
class MemoryMonitor {
  checkMemoryUsage(): {
    used: number;
    limit: number;
    percentage: number;
    status: "safe" | "warning" | "critical";
  };
  
  getMemoryBreakdown(): {
    rooms: number;
    empire: number;
    intel: number;
    market: number;
    creeps: number;
    other: number;
  };
  
  getLargestConsumers(count: number): Array<{
    key: string;
    size: number;
  }>;
}
```

### MemoryPruner

```typescript
class MemoryPruner {
  pruneAll(): { pruned: number; saved: number };
  pruneDeadCreeps(): number;
  pruneEventLogs(): number;
  pruneStaleIntel(): number;
  pruneMarketHistory(): number;
}
```

### MemorySegmentManager

```typescript
class MemorySegmentManager {
  requestSegment(id: number): void;
  releaseSegment(id: number): void;
  writeSegment(id: number, key: string, data: any): void;
  readSegment(id: number, key: string): any;
  getActiveSegments(): number[];
}
```

### MemoryCompressor

```typescript
class MemoryCompressor {
  compress(data: any): {
    compressed: string;
    originalSize: number;
    compressedSize: number;
  };
  
  decompress(compressed: string): any;
  shouldCompress(data: any, minSize: number): boolean;
  getOrDecompress(data: any): any;
}
```

---

**Last Updated**: 2025-01-23  
**Maintainer**: Screeps Bot Team  
**Source**: docs/MEMORY_ARCHITECTURE.md  
**Related Issues**: ROADMAP Section 4
