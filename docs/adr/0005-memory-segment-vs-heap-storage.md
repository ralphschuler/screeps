# ADR-0005: Memory Segment vs Heap Storage

## Status

Accepted

## Context

Screeps provides two distinct storage mechanisms, each with different characteristics:

### Memory (Persistent)

- **Persisted**: Survives global resets; available across all ticks
- **Size limit**: 2MB total for entire bot
- **Access cost**: Parsed from JSON every tick (~0.1-0.5 CPU for large Memory)
- **Write cost**: Serialized to JSON at end of tick (~0.1-0.5 CPU)
- **Visibility**: Accessible via Screeps API and console

### Heap (Transient)

- **Lifetime**: Lost on global reset (every tick in live game, ~6-24 hours in MMO)
- **Size limit**: Node.js heap (~512MB, effectively unlimited for Screeps purposes)
- **Access cost**: Native JavaScript object access (~0 CPU)
- **Write cost**: No serialization overhead
- **Visibility**: Not accessible outside the tick

### The Storage Decision Problem

With 100+ rooms, data storage choices critically impact performance and memory usage:

- **Wrong choice = wasted CPU**: Storing cache data in Memory wastes 0.2-0.5 CPU per tick on serialization
- **Wrong choice = memory overflow**: Storing too much in Memory can exceed 2MB limit
- **Wrong choice = data loss**: Storing critical state in heap leads to loss on global reset

Need clear guidelines for **when to use Memory vs when to use heap**.

### Constraints

- Memory limit: 2MB total
- Memory parsing cost: ~0.1-0.5 CPU per tick
- Global resets: Unpredictable timing in MMO (6-24 hours)
- Must support 100+ rooms without memory overflow
- Critical state must survive resets

## Decision

Adopt a **clear, documented policy** for data storage:

### Rule 1: Use Memory for State That Must Persist

**Store in Memory**:
- Room state (danger level, intent, colony info)
- Creep role assignments and state
- Construction plans and build priorities
- Remote mining targets and routes
- Empire/cluster/shard metadata
- Market orders and history
- Expansion targets
- Alliance/diplomacy data
- Configuration settings

**Rationale**: These values must survive global resets to maintain operational continuity.

### Rule 2: Use Heap for Transient Caches

**Store in Heap (global objects)**:
- Path cache (from PathFinder.search)
- Room.find() results
- Game.getObjectById() lookups
- Role assignment calculations
- Body part cost calculations
- Distance/range calculations
- Threat assessments
- Market price analysis

**Rationale**: These can be recalculated after reset; caching in Memory wastes serialization CPU and space.

### Rule 3: Use Memory Segments for Large, Rarely-Accessed Data

**Screeps Memory Segments** (if needed in future):
- Historical stats (> 1000 ticks old)
- Intel on distant rooms
- Detailed combat logs
- Large lookup tables

**Rationale**: Segments are separate from main 2MB Memory; only loaded on demand.

**Note**: Not currently implemented; reserved for future use if needed.

### Implementation Guidelines

**1. Cache with TTL (Time-To-Live)**

All heap caches use TTL-based expiration:
```typescript
// Heap cache example
global.cache = global.cache || {};
global.cache.roomFinds = global.cache.roomFinds || {};

function getCachedFind(room: Room, type: FindConstant, ttl = 10): any[] {
  const key = `${room.name}_${type}`;
  const cached = global.cache.roomFinds[key];
  
  if (cached && Game.time < cached.expiry) {
    return cached.result;
  }
  
  const result = room.find(type);
  global.cache.roomFinds[key] = {
    result,
    expiry: Game.time + ttl
  };
  
  return result;
}
```

**2. Unified Cache System**

Use the unified cache system (`packages/screeps-bot/src/cache/`) for all caching:
- Automatic TTL handling
- LRU eviction when cache grows too large
- Namespace isolation (prevents key collisions)
- Integrated stats tracking

**3. Memory Pruning**

Automatically remove stale Memory data:
- Dead creep memory (creep no longer exists)
- Abandoned room state (room lost or no longer visible)
- Expired event logs (> 100 ticks old)
- Old market orders

Pruning runs every 10-20 ticks.

**4. Memory Monitoring**

Track Memory usage continuously:
- Alert at 80% (1.6MB)
- Critical at 90% (1.8MB)
- Emergency pruning at 95% (1.9MB)

## Consequences

### Positive

- **CPU savings**: Heap caching eliminates 0.2-0.5 CPU per tick serialization overhead
- **Memory efficiency**: Only essential state stored in Memory; stays under 2MB at 100+ rooms
- **Performance**: Heap access is instant; no JSON parsing
- **Clear guidelines**: Developers know exactly where to store each type of data
- **Resilience**: Critical state persists across resets
- **Scalability**: Heap cache can grow to hundreds of MB without impact
- **Monitoring**: Memory usage is tracked and alerted

### Negative

- **Global reset risk**: Heap data lost on reset (requires rebuild)
- **Rebuild cost**: After reset, caches must be repopulated (0.5-2 CPU for first few ticks)
- **Complexity**: Developers must remember which storage to use
- **Testing**: Must test both with and without global resets
- **Cache invalidation**: TTL-based expiration can serve stale data briefly

## Alternatives Considered

### Alternative 1: Store Everything in Memory

- **Description**: Use Memory for all data (state + cache)
- **Pros**:
  - Simple mental model
  - No data loss on resets
  - Easy to inspect via console
- **Cons**:
  - Memory limit exceeded at ~50 rooms
  - 0.5-1.0 CPU wasted on serialization per tick
  - Slower access due to JSON parsing
- **Why rejected**: Does not scale; Memory overflow and CPU waste unacceptable

### Alternative 2: Store Everything in Heap

- **Description**: Use heap for all data (state + cache)
- **Pros**:
  - Fastest access
  - No memory limit
  - No serialization overhead
  - Simple implementation
- **Cons**:
  - All state lost on global reset
  - Bot becomes non-functional after reset (rooms idle, creeps stop working)
  - Must rebuild entire state from scratch
  - Critical information lost (expansion targets, colony assignments, etc.)
- **Why rejected**: Unacceptable data loss; bot cannot recover from resets

### Alternative 3: Memory Segments for Everything

- **Description**: Use Memory Segments as primary storage
- **Pros**:
  - Separate from 2MB limit
  - Persists across resets
  - Can store large amounts of data
- **Cons**:
  - Segments limited to 10MB each, 100 segments total
  - Only one segment can be loaded per tick (async load)
  - Complex management of segment loading/unloading
  - Much higher complexity
  - Slower access (one tick delay)
- **Why rejected**: Complexity not justified; 2MB Memory is sufficient with proper heap usage

### Alternative 4: External Database (via API)

- **Description**: Store data in external database via HTTP API
- **Pros**:
  - Unlimited storage
  - Persistent beyond Screeps
  - Could support analytics
- **Cons**:
  - HTTP requests are asynchronous and slow
  - Not reliable in live game (network issues)
  - Violates Screeps design philosophy
  - Complex to implement and maintain
  - Against Screeps terms of service for automation
- **Why rejected**: Not viable in Screeps; unreliable and against TOS

### Alternative 5: Hybrid with Segment Fallback

- **Description**: Use Memory normally, overflow to Segments when near limit
- **Pros**:
  - Best of both worlds
  - Automatic handling of large empires
  - Graceful degradation
- **Cons**:
  - Complex implementation
  - Segment loading adds latency
  - Difficult to debug which data is where
  - Added CPU for segment management
- **Why rejected**: Current solution (Memory + Heap) sufficient for 100+ rooms; added complexity not justified

## Performance Impact

### CPU Impact

**Memory storage** (100 rooms):
- JSON parsing: 0.2 CPU per tick
- JSON serialization: 0.3 CPU per tick
- **Total**: 0.5 CPU per tick

**Heap storage** (100 rooms):
- Parsing: 0 CPU (native objects)
- Serialization: 0 CPU (not persisted)
- **Total**: 0 CPU per tick

**CPU savings**: 0.5 CPU per tick by using heap for caches

### Memory Impact

**With proper heap usage** (100 rooms):
- Room state: 500KB
- Creep memory: 25KB
- Empire/cluster metadata: 50KB
- Market/intel: 30KB
- Configuration: 10KB
- Event logs: 20KB
- **Total Memory**: ~635KB (32% of 2MB limit)

**If all caches in Memory** (100 rooms):
- Above data: 635KB
- Path cache: 200KB
- Find cache: 150KB
- Object cache: 100KB
- **Total Memory**: ~1085KB (54% of 2MB limit) - approaching danger zone

**Memory savings**: 450KB by using heap for caches

### Heap Usage

- Path cache: 50-150KB
- Find cache: 30-80KB
- Object cache: 20-50KB
- Other caches: 20-40KB
- **Total Heap**: 120-320KB (< 0.1% of 512MB heap limit)

Heap usage is negligible compared to available space.

### Global Reset Impact

**After global reset**:
- Tick 1: Rebuild critical caches (path, find) - ~2.0 CPU
- Tick 2-5: Rebuild remaining caches - ~0.5 CPU per tick
- Tick 6+: Normal operation - ~0.1 CPU per tick

**Average cost**: ~0.3 CPU per tick (amortized over reset interval)

Acceptable overhead; resets are infrequent (6-24 hours in MMO).

## References

- **Related GitHub Issues**: 
  - #704 (Memory optimization)
  - #711 (Cache refactoring)
- **Related ADRs**:
  - ADR-0006 (Cache Strategy) - Detailed cache implementation
  - ADR-0001 (POSIS Architecture) - Process state stored in Memory
  - ADR-0004 (Five-Layer Architecture) - Layer data storage decisions
- **External Documentation**:
  - [Screeps API: Memory](https://docs.screeps.com/api/#Game.Memory)
  - [Screeps API: RawMemory](https://docs.screeps.com/api/#RawMemory)
  - [Screeps API: Memory Segments](https://docs.screeps.com/api/#RawMemory.segments)
- **Internal Documentation**:
  - `docs/MEMORY_ARCHITECTURE.md` - Detailed memory management guide
  - `src/cache/README.md` - Cache system documentation
  - `src/memory/memoryMonitor.ts` - Memory usage tracking
  - `src/memory/memoryPruner.ts` - Automatic cleanup

## Implementation Notes

### Storage Decision Flowchart

```
Need to store data?
  │
  ├─ Must survive global reset?
  │    ├─ YES → Use Memory
  │    └─ NO → Use Heap (cache)
  │
  ├─ Updated every tick?
  │    ├─ YES → Use Heap (recalculate after reset)
  │    └─ NO → Use Memory
  │
  └─ Data size > 100KB?
       ├─ YES → Consider Memory Segments (future)
       └─ NO → Follow above rules
```

### Code Patterns

**Memory (persistent state)**:
```typescript
// Store in Memory
Room.memory.swarm.danger = 2;
Creep.memory.role = 'harvester';
Memory.empire.shards.shard0 = { /* ... */ };
```

**Heap (transient cache)**:
```typescript
// Store in heap via unified cache
import { globalCache } from './cache';

const creeps = globalCache.get(
  `room_${room.name}_creeps`,
  {
    namespace: 'room',
    ttl: 10,
    compute: () => room.find(FIND_MY_CREEPS)
  }
);
```

### Migration Guide

When refactoring storage:
1. Identify data type (state vs cache)
2. If cache: Move to heap with TTL
3. If state: Keep in Memory but minimize size
4. Update access code to use unified cache API
5. Test with forced global reset
6. Monitor Memory usage after deployment

## Future Considerations

**Memory Segments** (not yet implemented):
- Could use for historical stats (> 1000 ticks old)
- Could use for intel on distant rooms
- Would require segment loading/unloading logic
- Only implement if Memory approaches 2MB limit

**Compression**:
- Could compress large Memory structures
- Trade CPU for memory space
- Only if needed (not currently necessary)

---

*This ADR documents the storage strategy that enables the bot to scale to 100+ rooms while staying under the 2MB Memory limit. The clear separation between persistent state (Memory) and transient caches (heap) has proven effective in production.*
