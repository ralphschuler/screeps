# Portal Navigation System

## Overview

**UPDATE (January 2026)**: Portal navigation is now handled by [screeps-cartographer](https://github.com/glitchassassin/screeps-cartographer/), which includes built-in portal support for both inter-room and inter-shard pathfinding.

The portal navigation system provides comprehensive support for inter-shard and inter-room pathfinding via portals.

## Architecture

### Cartographer Portal Support

Cartographer automatically:
- Discovers and tracks portal locations
- Calculates optimal routes through portals
- Handles both inter-room and inter-shard portals
- Updates path cache when portals change

### Movement Integration

Use Cartographer's `moveTo()` for automatic portal navigation:

```typescript
import { moveTo } from "screeps-cartographer";

// Cartographer automatically finds and uses portals if they're on the optimal path
const creep = Game.creeps["MyCreep"];
moveTo(creep, new RoomPosition(25, 25, "E10N10"), {
  reusePath: 50
});
```

### Portal-Specific Options

```typescript
import { moveTo } from "screeps-cartographer";

// Avoid using portals even if they're shorter
moveTo(creep, target, {
  avoidPortals: true
});

// Ignore portals in cost matrix (don't avoid or use)
moveTo(creep, target, {
  ignorePortals: true
});
```

### Cross-Shard Movement

For explicit cross-shard carrier roles, see `src/roles/crossShardCarrier.ts` for production example:

```typescript
import { moveTo } from "screeps-cartographer";

const creep = Game.creeps["MyCreep"];

// Move to portal room
moveTo(creep, new RoomPosition(25, 25, portalRoom));

// Move to portal (Cartographer handles portal entry automatically)
const portal = Game.getObjectById(portalId);
if (portal) {
  moveTo(creep, portal);
}
```

## Additional Resources

- [Cartographer Documentation](https://glitchassassin.github.io/screeps-cartographer/) - Official API docs  
- [ADR-0003: Cartographer Traffic Management](../../../docs/adr/0003-cartographer-traffic-management.md) - Architecture decision
- `src/roles/crossShardCarrier.ts` - Production cross-shard movement example
- `src/utils/README.md` - Migration guide

## Historical Reference (Pre-Cartographer)

This section documents the old custom portal management for reference.

### Old Portal Manager (Deprecated)

**These utilities have been REMOVED and replaced with Cartographer's built-in portal support:**

- ❌ `findPortalPathToShard()` - Cartographer handles automatically
- ❌ `moveToShard()` - Use `moveTo()` with target position
- ❌ `findPortalsInRoom()` - Cartographer tracks portals internally
- ❌ `discoverPortalsInRoom()` - Cartographer discovers automatically
- ❌ Portal Manager utilities - Cartographer has built-in portal management

**Note**: Cartographer automatically handles portal discovery, tracking, and routing. No manual management needed.

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
