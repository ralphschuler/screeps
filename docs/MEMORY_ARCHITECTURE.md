# Memory Architecture Guide

## Overview

This document describes the comprehensive memory management system implemented to support scaling to 100+ rooms while staying under Screeps' 2MB memory limit.

## Problem Statement

As documented in ROADMAP Section 4: "Memory-Limit ca. 2 MB; große Objektbäume + serialisierte Game-Objekte vermeiden"

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
```

Additional memory consumers:
- Empire state: ~10-50 KB
- Market orders: ~5-10 KB
- Intel data: ~50-100 KB
- Lab reactions: ~5-10 KB per lab room
- Alliance/Standards data: ~10-20 KB

**Total at 100 rooms: 800KB-1.4MB** (already close to 2MB limit)

## Multi-Layered Solution

### Layer 1: Memory Monitoring & Alerts

**File**: `src/memory/memoryMonitor.ts`

Provides real-time memory usage tracking with automatic alerts.

**Features**:
- Tracks total memory usage against 2MB limit
- Monitors memory breakdown by category
- Alerts at 80% (warning) and 90% (critical) thresholds
- Identifies largest memory consumers

**Usage**:
```typescript
import { memoryMonitor } from "./memory/memoryMonitor";

// Check memory status
const stats = memoryMonitor.checkMemoryUsage();
console.log(`Memory: ${stats.percentage * 100}% (${stats.status})`);

// Get breakdown
const breakdown = memoryMonitor.getMemoryBreakdown();
console.log(`Empire: ${breakdown.empire} bytes`);

// Find largest consumers
const consumers = memoryMonitor.getLargestConsumers(10);
```

**Console Commands**:
```javascript
memory.status()    // Show current usage
memory.analyze(10) // Show top 10 consumers
```

### Layer 2: Automatic Data Pruning

**File**: `src/memory/memoryPruner.ts`

Automatically removes stale and unnecessary data.

**Pruning Operations**:
- **Dead creeps**: Removed when creep no longer exists
- **Event logs**: Keeps only last 20 entries per room
- **Stale intel**: Removes data older than 10,000 ticks (except highways/portals)
- **Market history**: Removes price data older than 5,000 ticks
- **Powerbanks**: Removes decayed powerbank entries
- **Nukes**: Removes landed nukes from tracking

**Integration**:
Runs automatically every 100 ticks in `MemoryManager.initialize()`.

**Manual Trigger**:
```javascript
memory.prune() // Manually run all pruning operations
```

**Expected Savings**: 10-20% memory reduction

### Layer 3: Memory Segmentation

**File**: `src/memory/memorySegmentManager.ts`

Manages RawMemory segments for rarely-accessed data. Each segment can store up to 100KB, and there are 100 segments available (0-99).

**Segment Allocation Strategy**:
```typescript
Segment Range | Purpose                    | Access Frequency
0-9           | Active room data           | Frequent (hot data)
10-19         | Historical intel           | Every 100-1000 ticks
20-29         | Market history             | Every 500+ ticks
30-39         | Alliance/Standards data    | Per protocol needs
40-49         | Archived empire state      | Rarely
50-89         | Reserved for future use    | -
90-99         | Stats and monitoring       | As needed
```

**Key Features**:
- Load segments on demand (max 10 active at once)
- Automatic segment size tracking
- Versioned data with metadata
- Migration helpers from Memory to segments

**Usage**:
```typescript
import { memorySegmentManager } from "./memory/memorySegmentManager";

// Request segment for next tick
memorySegmentManager.requestSegment(10);

// Write data (next tick when segment loaded)
memorySegmentManager.writeSegment(10, "historicalIntel", intelData);

// Read data
const intel = memorySegmentManager.readSegment(10, "historicalIntel");

// Release when done
memorySegmentManager.releaseSegment(10);
```

**Console Commands**:
```javascript
memory.segments() // Show allocation and usage
```

**Expected Savings**: 40-60% reduction in main Memory size

### Layer 4: Data Compression

**File**: `src/memory/memoryCompressor.ts`

Uses LZ-String compression for large, repetitive data structures.

**Compression Ratios**:
- **Intel data**: 60-70% reduction (highly repetitive room structures)
- **Portal maps**: 50-60% reduction (coordinate data compresses well)
- **Market history**: 70-80% reduction (numeric time-series data)

**Key Features**:
- Automatic compression benefit analysis
- Batch compression/decompression
- Version tracking for compatibility
- Transparent handling of compressed vs uncompressed data

**Usage**:
```typescript
import { memoryCompressor } from "./memory/memoryCompressor";

// Compress data
const compressed = memoryCompressor.compressIntel(intelData);
// Returns: { compressed: string, originalSize: number, compressedSize: number }

// Decompress data
const intel = memoryCompressor.decompressIntel(compressed);

// Check if compression is beneficial
if (memoryCompressor.shouldCompress(data, 1000)) {
  // Compress it
}

// Automatic handling
const result = memoryCompressor.getOrDecompress(data);
// Returns decompressed data if compressed, otherwise returns as-is
```

**Console Commands**:
```javascript
memory.compress("empire.knownRooms") // Test compression on data
```

**Expected Savings**: 30-50% additional reduction on compressed data

### Layer 5: Schema Migration System

**File**: `src/memory/migrations.ts`

Provides versioned schema migrations for safe memory structure updates.

**Current Migrations**:
- **v4**: Move historical intel to segments
- **v5**: Compress portal map data
- **v6**: Move market history to segments with compression

**Key Features**:
- Automatic migration runner
- Safe rollback support
- Version tracking
- Error handling with notifications

**Adding New Migrations**:
```typescript
// In migrations.ts
export const migrations: Migration[] = [
  // ... existing migrations
  {
    version: 7,
    description: "Your migration description",
    migrate: (memory) => {
      // Migration logic
    }
  }
];
```

**Console Commands**:
```javascript
memory.migrations() // Show migration status
memory.migrate()    // Manually run pending migrations
```

## Integration

### Memory Manager Updates

**File**: `src/memory/manager.ts`

The `MemoryManager` class now integrates all layers:

1. **Initialization**: Runs migrations, pruning, and monitoring
2. **Intervals**:
   - Dead creep cleanup: Every 10 ticks
   - Comprehensive pruning: Every 100 ticks
   - Memory monitoring: Every 50 ticks

```typescript
import { memoryManager } from "./memory/manager";

// Initialize (called in main loop)
memoryManager.initialize();
```

### Console Commands

**File**: `src/memory/memoryCommands.ts`

All memory management commands are available in the game console:

```javascript
// Status and analysis
memory.status()      // Current memory usage and breakdown
memory.analyze(10)   // Top 10 memory consumers with recommendations

// Maintenance
memory.prune()       // Manual pruning
memory.migrate()     // Run pending migrations

// Debugging
memory.segments()    // Show segment allocation
memory.compress("empire.knownRooms") // Test compression

// Danger zone
memory.reset('CONFIRM') // Clear all memory (requires confirmation)
```

## Performance Impact

### CPU Costs

| Operation | CPU Cost | Frequency |
|-----------|----------|-----------|
| Memory monitoring | ~0.01 | Every 50 ticks |
| Automatic pruning | ~0.05-0.1 | Every 100 ticks |
| Compression | ~0.1-0.2 | Amortized per tick |
| Segment I/O | ~0.01-0.05 | On demand |
| **Net impact** | **~0.2-0.4** | **Per tick average** |

### Memory Savings

| Strategy | Savings | New Baseline |
|----------|---------|--------------|
| Baseline (100 rooms) | - | 1.2 MB |
| + Automatic pruning | 15% | 1.0 MB |
| + Segmentation | 50% of base | 600 KB |
| + Compression | 40% of hot | 450 KB |
| **Total** | **62% reduction** | **450 KB** |

**Headroom**: Supports 250+ rooms before approaching limit

## Monitoring

### Grafana Integration

Memory statistics are automatically collected and can be visualized in Grafana:

- Memory usage trends over time
- Breakdown by category (empire, rooms, creeps, etc.)
- Compression ratios
- Pruning effectiveness

### Alerts

- **Warning (80%)**: Logged to console
- **Critical (90%)**: Game notification sent
- Recommendations provided via `memory.analyze()`

## Best Practices

### 1. Use Segmentation for Historical Data

Move rarely-accessed data to segments:

```typescript
// Bad: Keep all intel in main Memory
Memory.empire.allIntel = { /* 100+ rooms */ };

// Good: Keep active intel in Memory, historical in segments
Memory.empire.recentIntel = { /* Last 5000 ticks */ };
// Historical intel in segment 10-19
```

### 2. Compress Large Repetitive Structures

```typescript
// Bad: Store uncompressed portal map
Memory.empire.portals = [ /* Large array */ ];

// Good: Compress portal map
Memory.empire.compressedPortals = memoryCompressor.compressPortalMap(portals);
```

### 3. Prune Aggressively

Keep event logs and historical data limited:

```typescript
// Good: Automatic pruning keeps last 20 events
// Bad: Letting event logs grow unbounded
```

### 4. Monitor Proactively

```javascript
// Check memory status regularly
if (Game.time % 1000 === 0) {
  memory.analyze(5); // Show top 5 consumers
}
```

### 5. Test Before Deploying

```javascript
// Test compression before implementing
memory.compress("empire.knownRooms");
// Verify savings are worthwhile
```

## Troubleshooting

### Memory Still Growing

1. Run `memory.analyze()` to identify largest consumers
2. Check recommendations
3. Consider additional pruning or segmentation

### Compression Not Helping

- Small data (<1KB) doesn't compress well
- Random data doesn't compress well
- Use `memory.compress(path)` to test first

### Segments Not Loading

- Max 10 segments active at once
- Segments load next tick after request
- Check with `memory.segments()`

### Migration Failed

- Check logs for error details
- Migration stops on first error to prevent corruption
- May need manual intervention or rollback

## Future Enhancements

Potential improvements for even better memory management:

1. **Adaptive pruning**: Adjust thresholds based on memory pressure
2. **Predictive segmentation**: Automatically move data to segments when memory high
3. **Compression profiles**: Different compression for different data types
4. **Memory forecasting**: Predict future usage based on growth trends
5. **Distributed state**: Use InterShardMemory for global coordination

## References

- ROADMAP.md Section 4: Memory constraints and design principles
- Screeps API: RawMemory and segments
- LZ-String library documentation
- Community best practices on memory optimization
