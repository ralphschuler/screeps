# @ralphschuler/screeps-pathfinding

Advanced pathfinding utilities for Screeps - portal management, path caching, and inter-shard routing.

## Features

- **Portal Discovery**: Automatic portal detection and mapping in visible rooms
- **Inter-Shard Routing**: Find routes across multiple shards using portals
- **InterShardMemory Integration**: Share portal data between shards
- **Path Cache Events**: Automatic path invalidation on room changes
- **Event-Driven**: React to construction and destruction events
- **Dependency Injection**: Decoupled design for maximum reusability
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Well-Tested**: >80% test coverage with comprehensive unit tests

## Installation

```bash
npm install @ralphschuler/screeps-pathfinding
```

## Quick Start

### Portal Management

```typescript
import { PortalManager } from '@ralphschuler/screeps-pathfinding';

// Create portal manager with your cache and logger implementations
const portalManager = new PortalManager(cache, logger);

// Discover portals in a room
const portals = portalManager.discoverPortalsInRoom('W1N1');

// Find portals leading to a specific shard
const shardPortals = portalManager.getPortalsToShard('shard1');

// Find the closest portal to a shard
const fromPos = new RoomPosition(25, 25, 'W1N1');
const closestPortal = portalManager.findClosestPortalToShard(fromPos, 'shard1');

// Find a route using portals
const route = portalManager.findRouteToPortal('W1N1', 'shard1');

// Publish portal data to InterShardMemory (call periodically)
portalManager.publishPortalsToInterShardMemory();

// Periodic maintenance (every 100-500 ticks)
portalManager.maintainPortalCache();
```

### Path Cache Events

```typescript
import { PathCacheEventManager } from '@ralphschuler/screeps-pathfinding';

// Create event manager with dependencies
const eventManager = new PathCacheEventManager(
  logger,
  eventBus,
  pathCache,
  remoteMining
);

// Initialize event handlers (call once during bot startup)
eventManager.initializePathCacheEvents();

// Now the manager will automatically:
// - Invalidate cached paths when structures are built or destroyed
// - Recache common routes when storage is constructed
// - Precache remote mining routes when needed
```

## API

### PortalManager

The `PortalManager` class handles portal discovery, caching, and routing.

**Constructor:**

```typescript
new PortalManager(cache: ICache, logger: ILogger)
```

**Methods:**

- `discoverPortalsInRoom(roomName: string): PortalInfo[] | null`  
  Discover portals in a room. Returns `null` if room is not visible.

- `getPortalsToShard(targetShard: string): PortalInfo[]`  
  Get all known portals leading to a specific shard.

- `findClosestPortalToShard(fromPos: RoomPosition, targetShard: string): PortalInfo | null`  
  Find the closest portal to a position that leads to a specific shard.

- `findRouteToPortal(fromRoom: string, targetShard: string): PortalRoute | null`  
  Find a multi-room route to reach a portal leading to a specific shard.

- `findInterShardRoute(fromRoom: string, fromShard: string, toRoom: string, toShard: string): PortalRoute | null`  
  Find a complete route from one room to another room on a different shard.

- `publishPortalsToInterShardMemory(): boolean`  
  Store portal data for current shard in InterShardMemory.

- `getPortalDataFromInterShardMemory(shardName: string): InterShardPortalData | null`  
  Retrieve portal data from InterShardMemory for a specific shard.

- `maintainPortalCache(): number`  
  Periodic maintenance task. Returns number of operations performed.

### PathCacheEventManager

The `PathCacheEventManager` class handles automatic path cache invalidation based on game events.

**Constructor:**

```typescript
new PathCacheEventManager(
  logger: ILogger,
  eventBus: IEventBus,
  pathCache: IPathCache,
  remoteMining: IRemoteMining
)
```

**Methods:**

- `initializePathCacheEvents(): void`  
  Initialize event handlers. Call once during bot startup.

### Types

**PortalDestination:**
```typescript
interface PortalDestination {
  shard?: string;  // Destination shard (if inter-shard)
  room: string;    // Destination room name
}
```

**PortalInfo:**
```typescript
interface PortalInfo {
  pos: RoomPosition;              // Position of the portal
  destination: PortalDestination; // Destination information
  lastSeen: number;               // Game tick when last seen
}
```

**PortalRoute:**
```typescript
interface PortalRoute {
  rooms: string[];         // Array of room names in the route
  portals: RoomPosition[]; // Array of portal positions to traverse
  distance: number;        // Distance estimate (number of rooms)
  calculatedAt: number;    // Game tick when calculated
}
```

## Dependency Interfaces

This package uses dependency injection to remain decoupled from specific implementations. You must provide implementations of these interfaces:

### ICache

```typescript
interface ICache {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttl: number): void;
}
```

Example implementation using a Map:
```typescript
class HeapCache implements ICache {
  private store = new Map<string, { value: any; ttl: number; expires: number }>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Game.time >= entry.expires) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttl: number): void {
    this.store.set(key, {
      value,
      ttl,
      expires: Game.time + ttl
    });
  }
}
```

### ILogger

```typescript
interface ILogger {
  debug(message: string, context?: { subsystem?: string; room?: string; meta?: Record<string, unknown> }): void;
  info(message: string, context?: { subsystem?: string; room?: string; meta?: Record<string, unknown> }): void;
  warn(message: string, context?: { subsystem?: string; meta?: Record<string, unknown> }): void;
  error(message: string, context?: { subsystem?: string; meta?: Record<string, unknown> }): void;
}
```

### IEventBus

```typescript
interface IEventBus {
  on(eventName: string, handler: (event: any) => void): void;
}
```

### IPathCache

```typescript
interface IPathCache {
  invalidateRoom(roomName: string): void;
  cacheCommonRoutes(room: Room): void;
}
```

### IRemoteMining

```typescript
interface IRemoteMining {
  getRemoteRoomsForRoom(room: Room): string[];
  precacheRemoteRoutes(homeRoom: Room, remoteRooms: string[]): void;
}
```

## Advanced Usage

### Inter-Shard Communication

Portal data can be shared between shards using InterShardMemory:

```typescript
// On shard0: Publish portal data
portalManager.publishPortalsToInterShardMemory();

// On shard1: Retrieve portal data from shard0
const shard0Portals = portalManager.getPortalDataFromInterShardMemory('shard0');

if (shard0Portals) {
  console.log(`Shard0 has ${Object.keys(shard0Portals.portals).length} rooms with portals`);
}
```

### Event-Driven Path Invalidation

The path cache event manager automatically invalidates paths when the room layout changes:

```typescript
// When a structure is built
eventBus.emit('construction.complete', {
  roomName: 'W1N1',
  structureType: STRUCTURE_TOWER
});
// → Automatically invalidates all cached paths in W1N1

// When storage is built
eventBus.emit('construction.complete', {
  roomName: 'W1N1',
  structureType: STRUCTURE_STORAGE
});
// → Invalidates paths and recaches common routes + remote mining routes

// When a structure is destroyed
eventBus.emit('structure.destroyed', {
  roomName: 'W1N1',
  structureType: STRUCTURE_WALL
});
// → Automatically invalidates all cached paths in W1N1
```

### Performance Optimization

Portal discovery and route finding use aggressive caching to minimize CPU usage:

```typescript
// Portal discovery results are cached for 500 ticks
const portals1 = portalManager.discoverPortalsInRoom('W1N1'); // CPU: ~0.1
const portals2 = portalManager.discoverPortalsInRoom('W1N1'); // CPU: ~0.01 (cached)

// Portal routes are cached for 1000 ticks
const route1 = portalManager.findRouteToPortal('W1N1', 'shard1'); // CPU: ~0.2
const route2 = portalManager.findRouteToPortal('W1N1', 'shard1'); // CPU: ~0.01 (cached)
```

## Design Principles

1. **Aggressive Caching**: Portal discovery and routes are cached with TTL to reduce CPU
2. **Low-Frequency Updates**: Portal mapping runs at ≥100 tick intervals
3. **Event-Driven**: Paths are invalidated automatically on room changes
4. **InterShardMemory**: Portal data shared across shards for efficient multi-shard routing
5. **Dependency Injection**: Decoupled design allows integration with any bot architecture
6. **Type-Safe**: Full TypeScript support with comprehensive types

## Performance

Expected CPU usage:
- Portal discovery (uncached): ~0.1 CPU per room
- Portal discovery (cached): ~0.01 CPU per room
- Route finding (uncached): ~0.2 CPU per route
- Route finding (cached): ~0.01 CPU per route
- Event handling: ~0.01 CPU per event
- Maintenance: ~0.05 CPU per tick (when run)

Total impact: **0.03-0.05 CPU savings per economy room** through efficient path caching.

## Testing

```bash
npm test
```

Test coverage: **>80%**

## Contributing

Contributions welcome! Please:

1. Add tests for new features
2. Follow existing code style
3. Update documentation
4. Submit a pull request

## License

Unlicense - use freely!

## See Also

- [Screeps Documentation](https://docs.screeps.com/) - Official Screeps API
- [Framework Documentation](../../FRAMEWORK.md) - Using multiple packages together
- [ROADMAP.md](../../ROADMAP.md) - Bot architecture and design principles
