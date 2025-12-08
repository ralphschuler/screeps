# Heap Cache Usage Examples

This document provides practical examples of using the heap cache system in your Screeps bot.

## Example 1: Caching Room Intel

Cache room intelligence data that's expensive to compute:

```typescript
import { heapCache } from "./memory/heapCache";

interface RoomIntel {
  sources: number;
  controller: boolean;
  owner?: string;
  hostiles: number;
  towers: number;
  lastScan: number;
}

function getRoomIntel(roomName: string): RoomIntel | undefined {
  const cacheKey = `intel:${roomName}`;
  
  // Try cache first (fast)
  let intel = heapCache.get<RoomIntel>(cacheKey);
  
  if (!intel) {
    // Room not cached, need to scan
    const room = Game.rooms[roomName];
    if (!room) return undefined; // No vision
    
    // Compute expensive intel
    intel = {
      sources: room.find(FIND_SOURCES).length,
      controller: !!room.controller,
      owner: room.controller?.owner?.username,
      hostiles: room.find(FIND_HOSTILE_CREEPS).length,
      towers: room.find(FIND_HOSTILE_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_TOWER
      }).length,
      lastScan: Game.time
    };
    
    // Cache for 100 ticks
    heapCache.set(cacheKey, intel, 100);
  }
  
  return intel;
}

// Usage
const intel = getRoomIntel("W1N1");
if (intel && intel.hostiles > 0) {
  console.log(`Warning: ${intel.hostiles} hostiles in W1N1`);
}
```

## Example 2: Path Caching with Automatic Invalidation

Cache paths but invalidate when structures change:

```typescript
import { heapCache } from "./memory/heapCache";

interface PathData {
  path: PathStep[];
  calculatedAt: number;
  cost: number;
}

function getCachedPath(from: RoomPosition, to: RoomPosition, opts?: FindPathOpts): PathStep[] {
  const cacheKey = `path:${from.x},${from.y},${from.roomName}:${to.x},${to.y},${to.roomName}`;
  
  // Try cache first
  let pathData = heapCache.get<PathData>(cacheKey);
  
  if (!pathData) {
    // Calculate path
    const result = PathFinder.search(from, { pos: to, range: 1 }, opts);
    
    pathData = {
      path: result.path,
      calculatedAt: Game.time,
      cost: result.cost
    };
    
    // Cache for 500 ticks (paths are relatively stable)
    heapCache.set(cacheKey, pathData, 500);
  }
  
  return pathData.path;
}

// Usage in creep movement
const path = getCachedPath(creep.pos, target.pos);
if (path.length > 0) {
  creep.moveByPath(path);
}
```

## Example 3: Source Container Mapping

Cache the mapping of sources to their containers:

```typescript
import { heapCache } from "./memory/heapCache";

interface SourceContainer {
  sourceId: Id<Source>;
  containerId?: Id<StructureContainer>;
  position: RoomPosition;
}

function getSourceContainer(source: Source): StructureContainer | undefined {
  const cacheKey = `container:${source.id}`;
  
  // Check cache
  let data = heapCache.get<SourceContainer>(cacheKey);
  
  if (!data) {
    // Find container near source
    const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: s => s.structureType === STRUCTURE_CONTAINER
    }) as StructureContainer[];
    
    data = {
      sourceId: source.id,
      containerId: containers[0]?.id,
      position: source.pos
    };
    
    // Cache for 1000 ticks (containers don't move)
    heapCache.set(cacheKey, data, 1000);
  }
  
  // Return actual container object
  return data.containerId ? Game.getObjectById(data.containerId) ?? undefined : undefined;
}

// Usage in harvester role
const container = getSourceContainer(source);
if (container && creep.store.getFreeCapacity() === 0) {
  creep.transfer(container, RESOURCE_ENERGY);
}
```

## Example 4: Room Energy Statistics

Cache aggregated room statistics:

```typescript
import { heapCache } from "./memory/heapCache";

interface RoomStats {
  energyIncome: number;  // Energy/tick from sources
  energyUsage: number;   // Energy/tick consumption
  energyStored: number;  // Total energy in storage
  creepCount: number;
  cpuUsage: number;
}

function getRoomStats(room: Room): RoomStats {
  const cacheKey = `stats:${room.name}`;
  
  // Cache stats for 10 ticks
  let stats = heapCache.get<RoomStats>(cacheKey);
  
  if (!stats) {
    // Calculate stats
    const sources = room.find(FIND_SOURCES);
    const energyIncome = sources.reduce((sum, s) => 
      sum + (s.energyCapacity / 300), 0); // Max energy per tick
    
    const creeps = room.find(FIND_MY_CREEPS);
    const storage = room.storage?.store[RESOURCE_ENERGY] ?? 0;
    
    stats = {
      energyIncome,
      energyUsage: 0, // Would need to track this
      energyStored: storage,
      creepCount: creeps.length,
      cpuUsage: 0 // Would need CPU profiling
    };
    
    // Cache for 10 ticks (frequently changing data)
    heapCache.set(cacheKey, stats, 10);
  }
  
  return stats;
}

// Usage in room planning
const stats = getRoomStats(room);
if (stats.creepCount < 10 && stats.energyStored > 1000) {
  // Spawn more creeps
  room.spawns[0].spawnCreep([WORK, CARRY, MOVE], `worker_${Game.time}`);
}
```

## Example 5: Hostile Threat Assessment

Cache threat levels for rooms:

```typescript
import { heapCache } from "./memory/heapCache";

interface ThreatAssessment {
  level: 0 | 1 | 2 | 3;  // 0=safe, 3=critical
  hostileCount: number;
  towerCount: number;
  healerCount: number;
  damagePerTick: number;
  assessedAt: number;
}

function assessThreat(room: Room): ThreatAssessment {
  const cacheKey = `threat:${room.name}`;
  
  // Check cache (threat changes frequently, short TTL)
  let threat = heapCache.get<ThreatAssessment>(cacheKey);
  
  if (!threat) {
    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    const towers = room.find(FIND_HOSTILE_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_TOWER
    });
    
    const healers = hostiles.filter(c => 
      c.body.some(p => p.type === HEAL));
    
    // Calculate potential damage
    const damagePerTick = hostiles.reduce((sum, c) => {
      const attackParts = c.body.filter(p => p.type === ATTACK).length;
      const rangedParts = c.body.filter(p => p.type === RANGED_ATTACK).length;
      return sum + (attackParts * 30) + (rangedParts * 10);
    }, 0);
    
    // Determine threat level
    let level: 0 | 1 | 2 | 3 = 0;
    if (hostiles.length > 0) level = 1;
    if (hostiles.length > 3 || towers.length > 0) level = 2;
    if (healers.length > 0 || damagePerTick > 100) level = 3;
    
    threat = {
      level,
      hostileCount: hostiles.length,
      towerCount: towers.length,
      healerCount: healers.length,
      damagePerTick,
      assessedAt: Game.time
    };
    
    // Cache for 5 ticks (threat changes quickly)
    heapCache.set(cacheKey, threat, 5);
  }
  
  return threat;
}

// Usage in defense logic
const threat = assessThreat(room);
if (threat.level >= 2) {
  // Activate defenses
  room.controller?.activateSafeMode();
}
```

## Example 6: Market Price Tracking

Cache market price data:

```typescript
import { heapCache } from "./memory/heapCache";

interface PriceData {
  resource: ResourceConstant;
  buyPrice: number;
  sellPrice: number;
  volume: number;
  lastUpdate: number;
}

function getMarketPrice(resource: ResourceConstant): PriceData | undefined {
  const cacheKey = `market:${resource}`;
  
  // Cache for 100 ticks (prices don't change that fast)
  let priceData = heapCache.get<PriceData>(cacheKey);
  
  if (!priceData) {
    const orders = Game.market.getAllOrders({ type: ORDER_SELL, resourceType: resource });
    if (orders.length === 0) return undefined;
    
    // Find best prices
    const buyOrders = orders.filter(o => o.type === ORDER_BUY);
    const sellOrders = orders.filter(o => o.type === ORDER_SELL);
    
    const bestBuy = Math.max(...buyOrders.map(o => o.price));
    const bestSell = Math.min(...sellOrders.map(o => o.price));
    const totalVolume = orders.reduce((sum, o) => sum + o.amount, 0);
    
    priceData = {
      resource,
      buyPrice: bestBuy,
      sellPrice: bestSell,
      volume: totalVolume,
      lastUpdate: Game.time
    };
    
    heapCache.set(cacheKey, priceData, 100);
  }
  
  return priceData;
}

// Usage in market trading
const energyPrice = getMarketPrice(RESOURCE_ENERGY);
if (energyPrice && energyPrice.sellPrice < 0.1) {
  // Good time to buy
  Game.market.createOrder({
    type: ORDER_BUY,
    resourceType: RESOURCE_ENERGY,
    price: energyPrice.sellPrice,
    totalAmount: 10000,
    roomName: "W1N1"
  });
}
```

## Best Practices

### 1. Choose Appropriate TTLs

```typescript
// Frequently changing data: short TTL
heapCache.set("threat:W1N1", threatData, 5);

// Stable data: long TTL
heapCache.set("terrain:W1N1", terrainData, 10000);

// Semi-stable data: medium TTL
heapCache.set("intel:W1N1", intelData, 100);
```

### 2. Namespace Your Keys

```typescript
// Good: clear namespaces
heapCache.set("intel:W1N1", ...);
heapCache.set("path:source1:storage", ...);
heapCache.set("threat:W1N1", ...);

// Bad: ambiguous keys
heapCache.set("W1N1", ...);
heapCache.set("data", ...);
```

### 3. Handle Cache Misses Gracefully

```typescript
function getCachedData(key: string): any {
  const data = heapCache.get(key);
  
  if (!data) {
    // Compute or fetch data
    const newData = computeExpensiveData();
    heapCache.set(key, newData, 100);
    return newData;
  }
  
  return data;
}
```

### 4. Monitor Cache Performance

```typescript
// Periodically log cache stats
if (Game.time % 100 === 0) {
  const stats = heapCache.getStats();
  console.log(`Cache: ${stats.heapSize} entries, ${stats.dirtyEntries} dirty`);
}
```

### 5. Clean Up When Needed

```typescript
// Clean expired entries periodically
if (Game.time % 1000 === 0) {
  const cleaned = heapCache.cleanExpired();
  console.log(`Cleaned ${cleaned} expired cache entries`);
}
```

## Performance Tips

1. **Cache expensive operations**: Path finding, room scans, market queries
2. **Use appropriate TTLs**: Balance freshness vs. hit rate
3. **Batch cache operations**: Set multiple related values at once
4. **Monitor memory usage**: Check `getStats()` regularly
5. **Let TTL handle cleanup**: Don't manually delete unless necessary

## Common Pitfalls

### ❌ Don't cache live game objects

```typescript
// Bad: caching live objects that will be stale
heapCache.set("creep", Game.creeps["Worker1"]);

// Good: cache IDs or data
heapCache.set("creepId", Game.creeps["Worker1"].id);
```

### ❌ Don't use very long TTLs for dynamic data

```typescript
// Bad: hostiles change frequently
heapCache.set("hostiles:W1N1", hostiles, 1000);

// Good: short TTL for dynamic data
heapCache.set("hostiles:W1N1", hostiles, 5);
```

### ❌ Don't forget to handle undefined

```typescript
// Bad: assuming cache always returns data
const data = heapCache.get("key");
const value = data.property; // May crash

// Good: handle undefined
const data = heapCache.get("key");
if (data) {
  const value = data.property;
}
```

## Integration with Existing Code

### Before: Direct Memory Access

```typescript
if (!Memory.roomData) Memory.roomData = {};
if (!Memory.roomData[room.name]) {
  Memory.roomData[room.name] = calculateRoomData(room);
}
const data = Memory.roomData[room.name];
```

### After: Heap Cache

```typescript
const cacheKey = `roomData:${room.name}`;
let data = heapCache.get(cacheKey);
if (!data) {
  data = calculateRoomData(room);
  heapCache.set(cacheKey, data, 100);
}
```

Benefits:
- Faster access (heap vs Memory)
- Automatic expiration (no manual cleanup)
- No Memory structure management
- Survives resets automatically
