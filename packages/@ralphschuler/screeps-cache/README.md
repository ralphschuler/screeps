# @ralphschuler/screeps-cache

Advanced caching system with TTL, LRU, and cache coherence protocol for Screeps.

## Features

### Cache Manager
Core caching infrastructure with pluggable strategies:
- Time-to-live (TTL) expiration
- LRU eviction policy
- Namespace support
- Compute-on-miss functionality
- Heap and Memory storage backends

### Cache Coherence Protocol
Multi-cache coordination and invalidation:
- Event-driven invalidation
- Hierarchical cache layers (L1/L2/L3)
- Automatic cache synchronization
- Room visibility tracking

### Domain-Specific Wrappers
Convenient APIs for common use cases:
- Body part calculations
- Object lookups by ID
- Path caching
- Room.find() results
- Role assignments
- Closest object queries
- Game object collections
- Structure lookups

## Installation

```bash
npm install @ralphschuler/screeps-cache
```

## Usage

### Basic Caching

```typescript
import { globalCache } from '@ralphschuler/screeps-cache';

const towers = globalCache.get('towers_W1N1', {
  namespace: 'structures',
  ttl: 10,
  compute: () => room.find(FIND_MY_STRUCTURES, { 
    filter: s => s.structureType === STRUCTURE_TOWER 
  })
});
```

### Domain-Specific Helpers

```typescript
import {
  getCachedBodyPartCount,
  getCachedObjectById,
  cachedRoomFind,
  getRoomTowers
} from '@ralphschuler/screeps-cache';

// Body part caching
const attackParts = getCachedBodyPartCount(creep, ATTACK);

// Object caching
const target = getCachedObjectById(targetId);

// Room.find() caching
const sources = cachedRoomFind(room, FIND_SOURCES);

// Structure caching
const towers = getRoomTowers('W1N1');
```

### Cache Coherence

```typescript
import { cacheCoherence, CacheLayer } from '@ralphschuler/screeps-cache';

// Register a cache
cacheCoherence.registerCache('myCache', {
  name: 'myCache',
  layer: CacheLayer.L1,
  invalidate: (scope) => {
    if (scope.room === 'W1N1') {
      // Invalidate cache
    }
  }
});

// Trigger invalidation
cacheCoherence.invalidate({ room: 'W1N1', reason: 'structure.destroyed' });
```

### Cache Statistics

```typescript
import { collectCacheStats, getCachePerformanceSummary } from '@ralphschuler/screeps-cache';

// Collect stats for monitoring
const stats = collectCacheStats();
console.log(`Hit rate: ${stats.hitRate}%`);

// Get performance summary
const summary = getCachePerformanceSummary();
console.log(summary);
```

## API Reference

### Cache Manager

- `globalCache.get(key, options)` - Get or compute cached value
- `globalCache.set(key, value, ttl?)` - Set cached value
- `globalCache.delete(key)` - Remove cached value
- `globalCache.clear()` - Clear all cached values

### Cache Options

```typescript
interface CacheOptions<T> {
  namespace?: string;    // Cache namespace
  ttl?: number;         // Time to live in ticks
  compute?: () => T;    // Function to compute value on miss
}
```

### Domain Wrappers

**Body Parts**:
- `getCachedBodyPartCount(creep, part)` - Count body parts
- `hasCachedBodyPart(creep, part)` - Check if creep has part
- `getCachedDamagePotential(creep)` - Calculate attack power
- `getCachedHealPotential(creep)` - Calculate heal power

**Objects**:
- `getCachedObjectById(id)` - Get game object by ID
- `getCachedStorage(room)` - Get room storage
- `getCachedTerminal(room)` - Get room terminal

**Paths**:
- `getCachedPath(from, to, options)` - Get cached path
- `cachePath(from, to, path)` - Cache a path
- `invalidatePath(from, to)` - Invalidate cached path

**Room Find**:
- `cachedRoomFind(room, type, options?)` - Cache Room.find()
- `cachedFindSources(room)` - Find sources
- `cachedFindHostileCreeps(room)` - Find hostiles
- `cachedFindStructures(room, type)` - Find structures

**Structures**:
- `getRoomTowers(room)` - Get room towers
- `getRoomSpawns(room)` - Get room spawns
- `getRoomLinks(room)` - Get room links
- `getRoomLabs(room)` - Get room labs

## Performance

The cache system is designed for high performance:
- **Hit Rate**: Typically 90%+ for frequently accessed data
- **CPU Savings**: 1-2% reduction in total CPU usage
- **Memory Efficiency**: Automatic eviction of stale entries
- **Cache Coherence**: Event-driven invalidation minimizes stale data

## Architecture

```
CacheManager (Core)
├── HeapStore (L1 - Global object)
├── MemoryStore (L2 - Memory)
└── CacheCoherence (Invalidation protocol)
    └── Domain Wrappers
        ├── BodyPartCache
        ├── ObjectCache
        ├── PathCache
        ├── RoomFindCache
        ├── RoleCache
        ├── ClosestCache
        ├── GameObjectCache
        └── StructureCache
```

## Integration with Core

This package depends on `@ralphschuler/screeps-core` for:
- Event bus (cache invalidation)
- Logger (cache statistics)

## License

Unlicense
