# Heap Cache System

## Overview

The Heap Cache system implements a write-ahead cache pattern where:
- **Heap** (global object) serves as a fast cache layer
- **Memory** serves as a persistence layer for surviving resets
- On initialization after a reset, we rehydrate the heap with Memory data
- Write operations go to heap first (fast), then persist to Memory periodically

This is similar to a database cache system where you first check the cache (heap), and if not found, check the database (Memory).

## Design Principles

Following ROADMAP.md Section 2:
- **Aggressive Caching + TTL**: Cache stored in global object with automatic expiration
- **Event-driven logic**: Periodic sync mechanism for persistence
- **CPU-efficient**: Minimize Memory serialization overhead

## Performance Benefits

- **Fast reads**: Heap access is ~10x faster than Memory access
- **Reduced serialization**: Only persist changed data periodically
- **Survives resets**: Data restored from Memory after global reset

## Basic Usage

### Importing

```typescript
import { memoryManager } from "./memory/manager";
const heapCache = memoryManager.getHeapCache();
```

Or directly:

```typescript
import { heapCache } from "./memory/heapCache";
```

### Setting Values

```typescript
// Set a value with default TTL (1000 ticks)
heapCache.set("myKey", "myValue");

// Set a value with custom TTL
heapCache.set("myKey", "myValue", 500); // expires after 500 ticks

// Set complex objects
heapCache.set("roomData", {
  energy: 5000,
  spawns: 3,
  towers: 6
});
```

### Getting Values

```typescript
// Get a value (returns undefined if not found or expired)
const value = heapCache.get("myKey");

// Get with type safety
interface RoomData {
  energy: number;
  spawns: number;
  towers: number;
}
const roomData = heapCache.get<RoomData>("roomData");
```

### Checking Existence

```typescript
if (heapCache.has("myKey")) {
  console.log("Key exists and is not expired");
}
```

### Deleting Values

```typescript
// Remove from both heap and Memory
heapCache.delete("myKey");
```

### Clearing All Data

```typescript
// Clear entire cache
heapCache.clear();
```

## Advanced Usage

### Manual Persistence

The cache automatically persists dirty entries every 10 ticks. You can force persistence:

```typescript
// Force immediate persistence
const persistedCount = heapCache.persist(true);
console.log(`Persisted ${persistedCount} entries`);
```

### Statistics

```typescript
const stats = heapCache.getStats();
console.log(`Heap size: ${stats.heapSize}`);
console.log(`Memory size: ${stats.memorySize}`);
console.log(`Dirty entries: ${stats.dirtyEntries}`);
console.log(`Last sync: ${stats.lastSync}`);
```

### Listing Keys and Values

```typescript
// Get all keys
const keys = heapCache.keys();

// Get all values
const values = heapCache.values<string>();
```

### Cleaning Expired Entries

```typescript
// Remove expired entries
const cleanedCount = heapCache.cleanExpired();
console.log(`Cleaned ${cleanedCount} expired entries`);
```

## Use Cases

### Room Data Caching

Cache frequently accessed room data:

```typescript
function getRoomStats(roomName: string) {
  const cacheKey = `roomStats:${roomName}`;
  
  // Try cache first
  let stats = heapCache.get<RoomStats>(cacheKey);
  
  if (!stats) {
    // Compute expensive stats
    const room = Game.rooms[roomName];
    stats = {
      energyAvailable: room.energyAvailable,
      energyCapacity: room.energyCapacityAvailable,
      controllerProgress: room.controller?.progress ?? 0,
      // ... more stats
    };
    
    // Cache for 100 ticks
    heapCache.set(cacheKey, stats, 100);
  }
  
  return stats;
}
```

### Path Caching

Cache calculated paths:

```typescript
function getCachedPath(from: RoomPosition, to: RoomPosition) {
  const cacheKey = `path:${from}:${to}`;
  
  let path = heapCache.get<PathStep[]>(cacheKey);
  
  if (!path) {
    path = PathFinder.search(from, { pos: to, range: 1 }).path;
    heapCache.set(cacheKey, path, 500); // Cache for 500 ticks
  }
  
  return path;
}
```

### Scan Results

Cache expensive room scans:

```typescript
function getHostileCreeps(roomName: string) {
  const cacheKey = `hostiles:${roomName}`;
  
  let hostiles = heapCache.get<Creep[]>(cacheKey);
  
  if (!hostiles) {
    const room = Game.rooms[roomName];
    hostiles = room.find(FIND_HOSTILE_CREEPS);
    heapCache.set(cacheKey, hostiles, 10); // Cache for 10 ticks
  }
  
  return hostiles;
}
```

## Integration with Main Loop

The heap cache is automatically integrated into the SwarmBot main loop:

1. **Initialization**: Heap cache is initialized by the memory manager at startup
2. **Rehydration**: On reset, cache is automatically restored from Memory
3. **Persistence**: Cache is automatically persisted to Memory every 10 ticks

No additional setup required!

## Memory Structure

The cache is stored in Memory under the `_heapCache` key:

```typescript
Memory._heapCache = {
  version: 1,
  lastSync: 12345,
  data: {
    "myKey": {
      value: "myValue",
      lastModified: 12340,
      ttl: 1000
    }
    // ... more entries
  }
}
```

## Best Practices

1. **Use appropriate TTLs**: Don't cache volatile data for too long
2. **Cache expensive operations**: Path finding, room scans, calculations
3. **Monitor cache size**: Use `getStats()` to avoid excessive memory usage
4. **Clean up regularly**: Let expired entries be cleaned automatically
5. **Namespace your keys**: Use prefixes like `"roomStats:"`, `"path:"`, etc.

## Performance Considerations

- Heap access: ~0.01 CPU per operation
- Memory access: ~0.1 CPU per operation (10x slower)
- Cache hit rate: Aim for >90% for frequently accessed data
- Persistence overhead: ~0.1-0.5 CPU per 100 dirty entries

## Troubleshooting

### Cache not persisting

Check if persistence is being called:
```typescript
const stats = heapCache.getStats();
console.log(`Last sync: ${stats.lastSync} (current: ${Game.time})`);
```

### Values expiring too quickly

Increase TTL when setting values:
```typescript
heapCache.set("myKey", "myValue", 2000); // 2000 ticks instead of default 1000
```

### Memory size growing

Clean expired entries and reduce TTLs:
```typescript
heapCache.cleanExpired();
```

## Migration from Direct Memory Access

Before (direct Memory access):
```typescript
if (!Memory.roomStats) Memory.roomStats = {};
Memory.roomStats[roomName] = calculateStats(room);
const stats = Memory.roomStats[roomName];
```

After (with heap cache):
```typescript
const cacheKey = `roomStats:${roomName}`;
heapCache.set(cacheKey, calculateStats(room), 100);
const stats = heapCache.get(cacheKey);
```

Benefits:
- Faster access (heap vs Memory)
- Automatic expiration (TTL)
- No manual Memory structure management
- Survives resets automatically
