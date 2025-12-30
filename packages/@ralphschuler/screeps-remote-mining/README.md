# @ralphschuler/screeps-remote-mining

Remote mining system for Screeps - room analysis, path management, and optimized movement for remote mining operations.

## Features

- **Remote Room Analysis**: Identify remote rooms, calculate distances, assess profitability
- **Path Management**: Remote-specific path caching with TTL-based expiration
- **Scheduled Precaching**: Amortized path computation across multiple ticks
- **Movement Optimization**: CPU-efficient movement for remote harvesters and haulers
- **Dependency Injection**: Decoupled design for maximum reusability
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Performance-Focused**: 80-90% reduction in pathfinding CPU usage

## Installation

```bash
npm install @ralphschuler/screeps-remote-mining
```

## Quick Start

### Basic Setup with Dependency Injection

```typescript
import { 
  RemotePathCache, 
  RemotePathScheduler, 
  RemoteMiningMovement,
  getRemoteRoomsForRoom
} from '@ralphschuler/screeps-remote-mining';
import { moveTo } from 'screeps-cartographer';

// Assuming you have implementations of ILogger, IPathCache, and IScheduler
const pathCache = new RemotePathCache(myPathCache, myLogger);
const pathScheduler = new RemotePathScheduler(myLogger, myScheduler, pathCache);
const movement = new RemoteMiningMovement(myLogger, myPathCache, pathCache, moveTo);

// Initialize scheduler (call once during bot startup)
pathScheduler.initialize();

// Use in creep behavior
const result = movement.moveRemoteHarvesterToSource(creep, source);
```

### Standalone Functions

You can also use the standalone utility functions without creating class instances:

```typescript
import { 
  getRemoteRoomsForRoom, 
  getRemoteMiningRoomCallback 
} from '@ralphschuler/screeps-remote-mining';

// Get list of remote rooms for a home room
const remoteRooms = getRemoteRoomsForRoom(myRoom);

// Use the room callback in PathFinder
const path = PathFinder.search(from, to, {
  roomCallback: (roomName) => getRemoteMiningRoomCallback(roomName, logger)
});
```

## Architecture

### Dependency Injection

This package uses dependency injection to remain decoupled from specific implementations. You must provide implementations of these interfaces:

#### ILogger

```typescript
interface ILogger {
  debug(message: string, context?: { subsystem?: string; room?: string; meta?: Record<string, unknown> }): void;
  info(message: string, context?: { subsystem?: string; room?: string; meta?: Record<string, unknown> }): void;
  warn(message: string, context?: { subsystem?: string; meta?: Record<string, unknown> }): void;
  error(message: string, context?: { subsystem?: string; meta?: Record<string, unknown> }): void;
}
```

#### IPathCache

```typescript
interface IPathCache {
  getCachedPath(from: RoomPosition, to: RoomPosition): PathStep[] | null;
  cachePath(from: RoomPosition, to: RoomPosition, path: PathStep[], options?: { ttl?: number }): void;
  convertRoomPositionsToPathSteps(positions: RoomPosition[]): PathStep[];
}
```

#### IScheduler

```typescript
interface IScheduler {
  scheduleTask(
    name: string,
    interval: number,
    handler: () => void,
    priority: TaskPriority,
    cpuBudget: number
  ): void;
}
```

### Component Overview

```
@ralphschuler/screeps-remote-mining
├── analysis/           # Remote room analysis
│   └── remoteRoomUtils    - Room scanning, callbacks
├── paths/              # Path management
│   ├── remotePathCache    - Path caching with TTL
│   └── remotePathScheduler - Scheduled precaching
└── movement/           # Movement optimization
    └── remoteMiningMovement - Optimized creep movement
```

## API Documentation

### RemotePathCache

Manages path caching for remote mining routes.

**Constructor:**
```typescript
new RemotePathCache(pathCache: IPathCache, logger: ILogger)
```

**Methods:**

- `getRemoteMiningPath(from: RoomPosition, to: RoomPosition, routeType: RemoteRouteType): PathStep[] | null`  
  Get a cached path for remote mining. Returns `null` if not cached.

- `cacheRemoteMiningPath(from: RoomPosition, to: RoomPosition, path: PathStep[], routeType: RemoteRouteType): void`  
  Cache a path with remote-specific TTL (500 ticks).

- `precacheRemoteRoutes(homeRoom: Room, remoteRooms: string[]): void`  
  Calculate and cache common routes for a home room.

- `getOrCalculateRemotePath(from: RoomPosition, to: RoomPosition, routeType: RemoteRouteType): PathStep[] | null`  
  Get from cache or calculate new path with automatic caching.

**Example:**
```typescript
const pathCache = new RemotePathCache(myPathCache, myLogger);

// Get cached path
const path = pathCache.getRemoteMiningPath(spawn.pos, source.pos, "harvester");
if (path) {
  creep.moveByPath(path);
}

// Precache routes for a room
const remoteRooms = ["W1N2", "W2N1"];
pathCache.precacheRemoteRoutes(homeRoom, remoteRooms);
```

### RemotePathScheduler

Manages periodic precaching of remote mining routes.

**Constructor:**
```typescript
new RemotePathScheduler(logger: ILogger, scheduler: IScheduler, pathCache: RemotePathCache)
```

**Methods:**

- `initialize(priority?: TaskPriority): void`  
  Initialize the scheduler. Call once during bot startup. Defaults to MEDIUM priority.

**Example:**
```typescript
const scheduler = new RemotePathScheduler(myLogger, myScheduler, pathCache);
scheduler.initialize(); // Will precache routes every 500 ticks
```

### RemoteMiningMovement

Provides optimized movement for remote mining creeps.

**Constructor:**
```typescript
new RemoteMiningMovement(
  logger: ILogger,
  pathCache: IPathCache,
  remotePaths: RemotePathCache,
  moveTo: (creep: Creep, target: RoomPosition | { pos: RoomPosition }, options?: MoveToOpts) => ScreepsReturnCode
)
```

**Methods:**

- `moveToWithRemoteCache(creep: Creep, target: RoomPosition | { pos: RoomPosition }, routeType: RemoteRouteType, options?: MoveToOpts): ScreepsReturnCode`  
  Move a creep using cached paths when available.

- `moveRemoteHarvesterToSource(creep: Creep, source: Source): ScreepsReturnCode`  
  Move a remote harvester to their assigned source.

- `moveRemoteHaulerToStorage(creep: Creep, storage: StructureStorage): ScreepsReturnCode`  
  Move a remote hauler to home storage.

- `moveRemoteHaulerToRemote(creep: Creep, roomName: string): ScreepsReturnCode`  
  Move a remote hauler to the remote room.

**Example:**
```typescript
import { moveTo } from 'screeps-cartographer';

const movement = new RemoteMiningMovement(myLogger, myPathCache, pathCache, moveTo);

// In remote harvester behavior
const result = movement.moveRemoteHarvesterToSource(creep, source);

// In remote hauler behavior
if (creep.store.getFreeCapacity() > 0) {
  movement.moveRemoteHaulerToRemote(creep, targetRoom);
} else {
  movement.moveRemoteHaulerToStorage(creep, homeStorage);
}
```

### Utility Functions

**getRemoteRoomsForRoom(room: Room): string[]**  
Get list of remote rooms being mined by a home room by scanning creeps.

```typescript
const remoteRooms = getRemoteRoomsForRoom(myRoom);
console.log(`Mining ${remoteRooms.length} remote rooms`);
```

**getRemoteMiningRoomCallback(roomName: string, logger?: ILogger): CostMatrix | boolean**  
Pathfinding room callback that avoids hostile structures and prefers roads.

```typescript
const path = PathFinder.search(from, to, {
  roomCallback: (roomName) => getRemoteMiningRoomCallback(roomName, logger)
});
```

## Performance

Expected CPU savings with remote mining optimization:

**Before:**
- 5-10 remote miners per room
- PathFinder.search: 0.5-2.0 CPU per call
- Total: 2.5-5 CPU per room per tick

**After:**
- Path calculated once every 500 ticks
- Cache lookup: ~0.05 CPU per creep
- Total: ~0.25 CPU per room per tick

**Savings: 80-90% reduction in pathfinding CPU**

## Integration Examples

### With @ralphschuler/screeps-pathfinding

```typescript
import { RemotePathCache } from '@ralphschuler/screeps-remote-mining';
import { globalCache } from '@ralphschuler/screeps-pathfinding';

// Create remote path cache using the global path cache
const remotePathCache = new RemotePathCache(
  {
    getCachedPath: (from, to) => globalCache.getCachedPath(from, to),
    cachePath: (from, to, path, opts) => globalCache.cachePath(from, to, path, opts),
    convertRoomPositionsToPathSteps: (positions) => {
      return positions.map(p => ({ x: p.x, y: p.y }));
    }
  },
  myLogger
);
```

### With @ralphschuler/screeps-roles

Remote mining integrates seamlessly with the roles package:

```typescript
// In your remote harvester role behavior
import { RemoteMiningMovement } from '@ralphschuler/screeps-remote-mining';

class RemoteHarvesterBehavior {
  private movement: RemoteMiningMovement;

  run(creep: Creep): void {
    const source = Game.getObjectById(creep.memory.sourceId);
    if (source) {
      if (creep.pos.getRangeTo(source) > 1) {
        this.movement.moveRemoteHarvesterToSource(creep, source);
      } else {
        creep.harvest(source);
      }
    }
  }
}
```

## Design Principles

1. **Aggressive Caching**: Paths cached with 500-tick TTL to reduce pathfinding calls
2. **Scheduled Updates**: Path precaching runs every 500 ticks (amortized computation)
3. **Shared Paths**: Multiple creeps reuse the same cached paths
4. **Dependency Injection**: Decoupled from specific bot implementations
5. **Type-Safe**: Full TypeScript support with strict types
6. **Performance-First**: Every feature designed to minimize CPU usage

## Testing

```bash
npm test
```

Target test coverage: **>75%**

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
- [@ralphschuler/screeps-pathfinding](../screeps-pathfinding/) - Advanced pathfinding utilities
- [@ralphschuler/screeps-roles](../screeps-roles/) - Role-based creep behaviors
- [ROADMAP.md](../../ROADMAP.md) - Bot architecture and design principles
