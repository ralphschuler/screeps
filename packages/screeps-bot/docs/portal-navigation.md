# Portal Navigation System

## Overview

The portal navigation system provides comprehensive support for inter-shard and inter-room pathfinding via portals. It implements the TODO from `movement.ts` for "multi-room portal search using inter-shard memory" as outlined in Issue #33.

## Architecture

### Components

1. **Portal Manager** (`src/utils/portalManager.ts`)
   - Discovers and caches portal locations
   - Manages InterShardMemory for cross-shard coordination
   - Calculates optimal portal routes

2. **Movement Integration** (`src/utils/movement.ts`)
   - `findPortalPathToShard()` - Updated with multi-room search
   - `moveToShard()` - High-level API for cross-shard navigation
   - `findPortalsInRoom()` - Cached portal discovery

3. **Traffic Visualization** (`src/utils/movement.ts`)
   - `visualizeTraffic()` - Renders movement intents and priorities

## Usage

### Basic Portal Navigation

```typescript
// Move a creep to a different shard
import { moveToShard } from "./utils/movement";

const creep = Game.creeps["MyCreep"];
const result = moveToShard(creep, "shard1", "E10N10");
```

### Finding Portal Routes

```typescript
import { findRouteToPortal, findClosestPortalToShard } from "./utils/portalManager";

// Find route to nearest portal for target shard
const route = findRouteToPortal("E1N1", "shard1");
if (route) {
  console.log(`Route has ${route.rooms.length} rooms and ${route.portals.length} portals`);
}

// Find closest portal to a position
const portalInfo = findClosestPortalToShard(creep.pos, "shard1");
if (portalInfo) {
  creep.moveTo(portalInfo.pos);
}
```

### Portal Discovery

```typescript
import { discoverPortalsInRoom } from "./utils/portalManager";

// Get cached portal info for a room
const portals = discoverPortalsInRoom("E1N1");
if (portals) {
  for (const portal of portals) {
    console.log(`Portal to ${portal.destination.room} on shard ${portal.destination.shard || "local"}`);
  }
}
```

### InterShardMemory Integration

```typescript
import { 
  publishPortalsToInterShardMemory,
  getPortalDataFromInterShardMemory 
} from "./utils/portalManager";

// Publish this shard's portals (call periodically)
publishPortalsToInterShardMemory();

// Read another shard's portals
const remotePortals = getPortalDataFromInterShardMemory("shard1");
if (remotePortals) {
  console.log(`Shard1 has portals in ${Object.keys(remotePortals.portals).length} rooms`);
}
```

## Caching Strategy

Following ROADMAP.md principles for "Aggressive caching + TTL":

- **Portal Discovery**: 500 tick TTL
  - Cached in heap memory via `memoryManager.getHeapCache()`
  - Automatically expires after 500 ticks
  - Null results cached to avoid repeated lookups for invisible rooms

- **Portal Routes**: 1000 tick TTL
  - Cached per source-destination pair
  - Includes room list, portal positions, and distance metrics
  
- **Portal Age**: 10,000 tick max age
  - Stale portals filtered out before publishing to InterShardMemory
  - Ensures data accuracy across shards

## Traffic Visualization

The traffic visualization system provides real-time insight into creep movement:

```typescript
import { visualizeTraffic } from "./utils/movement";

// Basic visualization
visualizeTraffic("E1N1");

// With priority numbers
visualizeTraffic("E1N1", true);
```

**Visual Elements:**
- **Arrows**: Show movement intent from creep to target position
- **Colors**: 
  - Red: High priority (>50)
  - Green: Normal priority (≤50)
- **Circles**: Mark target positions
- **Priority Numbers**: Optional display of exact priority values

## Performance Considerations

### CPU Usage

As per ROADMAP.md Section 20 (Movement, Pathfinding & Traffic-Management):

1. **Pathfinding is expensive** - Portal discovery uses aggressive caching
2. **Low-frequency updates** - Maintenance runs every 100-500 ticks
3. **Heap cache** - Fast in-memory access avoids repeated Game API calls

### Optimization Strategies

1. **Cache First**: Always check cache before scanning rooms
2. **Batch Updates**: Portal publishing happens in low-frequency maintenance
3. **Lazy Loading**: Only discover portals when rooms are visible
4. **TTL Management**: Automatic expiration prevents stale data

## Integration with Main Loop

Add to your main loop for optimal performance:

```typescript
import { maintainPortalCache } from "./utils/portalManager";
import { initMovement, finalizeMovement } from "./utils/movement";

// Start of tick
initMovement();

// Your creep logic here...

// End of tick
finalizeMovement();

// Low-frequency maintenance (every 100 ticks)
if (Game.time % 100 === 0) {
  maintainPortalCache();
}
```

## Design Principles

Aligned with ROADMAP.md:

### Section 11: Cluster- & Empire-Logik
- **Inter-Shard Portale**: Graph aus Portalen mit Distanz & Gefahrenklasse

### Section 20: Bewegung, Pathfinding & Traffic-Management
- Pfadfindung so selten wie möglich through caching
- Global/raumweise gecachten Pfaden
- Remote & Inter-Room Bewegung with portal support

### Section 4: Memory & Datenmodelle - InterShardMemory
- Kompaktes JSON with portal data
- Cross-Shard-Tasks support (Migration, Kolonisation)

## Testing

Comprehensive test suite in `test/unit/portalManager.test.ts`:

- Portal destination parsing
- Age validation
- Route calculation and comparison
- InterShardMemory data format
- Cache key generation
- Linear distance calculation
- Portal filtering and selection
- Route validation

Run tests:
```bash
npm run test-unit
```

## Future Enhancements

Potential improvements (not in scope for current issue):

1. **Portal Danger Rating**: Track hostile activity near portals
2. **Flow-Field Pathfinding**: Optimize high-traffic portal routes
3. **Portal Network Graph**: Build complete inter-shard network map
4. **Smart Caching**: Adaptive TTL based on portal usage patterns
5. **Portal Prediction**: Anticipate portal stability changes

## Troubleshooting

### No portals found
- Ensure rooms are visible (within vision range or have observers)
- Check that portals actually exist in the scanned rooms
- Verify cache hasn't expired with stale data

### InterShardMemory not working
- Confirm Game.shard is available
- Check that other shard is publishing portal data
- Verify JSON parsing isn't failing (check console logs)

### Poor pathfinding performance
- Increase cache TTL if environment is stable
- Reduce maintenance frequency if CPU is tight
- Use `findClosestPortalToShard` instead of full route calculation when possible

## Related Files

- `src/utils/portalManager.ts` - Core portal management
- `src/utils/movement.ts` - Movement integration
- `test/unit/portalManager.test.ts` - Test suite
- `ROADMAP.md` - Architecture principles (Sections 4, 11, 20)

## References

- Screeps Documentation: [Portals](https://docs.screeps.com/api/#StructurePortal)
- Screeps Documentation: [InterShardMemory](https://docs.screeps.com/api/#InterShardMemory)
- ROADMAP.md: Schwarm-Ansatz für Screeps Bot
