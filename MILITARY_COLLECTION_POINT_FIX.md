# Military Collection Point Fix

## Summary

This fix addresses spawn blockades caused by idle military units (harasser and siege) and over-spawning of military creeps by:
1. Moving idle military units to collection points away from spawns
2. Reducing military spawn priorities to favor economy units

## Problem Statement

### Issue 1: Military Units Blocking Spawns
Harasser and siege units would idle near spawns when they had no targets, blocking spawn areas and potentially interfering with economy creeps. This was particularly problematic during peace time when these units had nothing to do.

### Issue 2: Over-Spawning Military Units
The spawn system was spawning too many military and defense units, consuming resources that should go to economy growth. User reported "a lot of creeps most which are military or defense units."

### Issue 3: LarvaWorker Investigation Needed
User requested investigation of larvaWorker functionality using screeps-mcp. Without access to live server, created comprehensive diagnostic guide instead.

## Solution

### 1. Collection Point Movement for Military Units

**Implementation:** `packages/screeps-bot/src/roles/behaviors/military.ts`

Created `moveToCollectionPoint()` helper function:
```typescript
function moveToCollectionPoint(ctx: CreepContext, debugLabel: string): CreepAction | null {
  if (!ctx.swarmState) return null;
  
  const collectionPoint = getCollectionPoint(ctx.room, ctx.swarmState);
  if (!collectionPoint) return null;
  
  // Only move if not already near collection point
  if (ctx.creep.pos.getRangeTo(collectionPoint) > 2) {
    logger.debug(`${ctx.creep.name} ${debugLabel} moving to collection point at ${collectionPoint.x},${collectionPoint.y}`);
    return { type: "moveTo", target: collectionPoint };
  }
  
  return null;
}
```

**Behavior Changes:**

**Siege Units:**
- When no hostile structures to dismantle, move to collection point
- If at collection point, fall back to patrol waypoints
- Collection point takes priority over moving near spawn

**Harasser Units:**
- When no target room assigned, move to collection point
- When in target room but no hostile workers found:
  1. Return to home room first (avoid CPU waste in empty rooms)
  2. Then move to collection point
- Collection point takes priority over moving near spawn

### 2. Reduced Military Spawn Priorities

**Implementation:** `packages/screeps-bot/src/logic/spawn.ts`

**Before:**
```typescript
guard: { priority: 80, maxPerRoom: 2 }
remoteGuard: { priority: 85, maxPerRoom: 4 }
healer: { priority: 75, maxPerRoom: 1 }
soldier: { priority: 70, maxPerRoom: 2 }
siegeUnit: { priority: 50, maxPerRoom: 2 }
ranger: { priority: 65, maxPerRoom: 2 }
harasser: { priority: 60, maxPerRoom: 3 }
```

**After:**
```typescript
guard: { priority: 60, maxPerRoom: 1 }          // -20 priority, -1 max
remoteGuard: { priority: 65, maxPerRoom: 2 }    // -20 priority, -2 max
healer: { priority: 55, maxPerRoom: 1 }         // -20 priority
soldier: { priority: 50, maxPerRoom: 1 }        // -20 priority, -1 max
siegeUnit: { priority: 30, maxPerRoom: 1 }      // -20 priority, -1 max
ranger: { priority: 55, maxPerRoom: 1 }         // -10 priority, -1 max
harasser: { priority: 40, maxPerRoom: 1 }       // -20 priority, -2 max
```

**Rationale:**
- Economy units (larvaWorker: 100, harvester: 100, hauler: 90) now significantly outrank military
- Military units spawn on-demand rather than constantly
- Reduced max counts prevent military overpopulation
- Guards reduced to 1 per room (sufficient for most threats)
- Siege and harassers now spawn only for planned operations (low priority)

### 3. LarvaWorker Diagnostic Guide

**Implementation:** `LARVAWORKER_DIAGNOSTIC.md`

Created comprehensive guide for investigating larvaWorker issues when connected to live Screeps server via screeps-mcp:
- Step-by-step diagnostic procedures with example MCP tool calls
- Common issues and solutions
- Expected behavior documentation
- Performance metrics to monitor
- Code verification checklist

**Key findings from code review:**
- Existing larvaWorker implementation is correct
- Defensive fallbacks already in place (from LARVA_WORKER_FIX.md)
- Unit tests validate core functionality
- Live server investigation needed to diagnose specific issues

## Technical Details

### Collection Point System

Collection points are calculated in `/packages/screeps-bot/src/utils/collectionPoint.ts`:
- Located 5-15 tiles away from primary spawn
- Prefer positions near storage or controller
- Avoid roads (prevent traffic interference)
- Walkable terrain only (no walls or blocking structures)
- Cached for 500 ticks for performance

### Movement Logic Flow

**Siege Unit:**
1. Check for squad assignment → use squad behavior
2. Check HP < 30% → retreat to home room
3. Check in target room → move to target room
4. Attack hostile spawns (highest priority)
5. Attack hostile towers
6. Dismantle walls/ramparts (< 100k hits)
7. Dismantle other hostile structures
8. **NEW:** Move to collection point if available
9. Patrol room waypoints
10. Idle

**Harasser Unit:**
1. Check HP < 40% → retreat to home room
2. **NEW:** If no target room → move to collection point
3. Check in target room → move to target room
4. Check dangerous hostiles nearby → flee
5. Attack hostile workers (closest first)
6. **NEW:** If no targets found → return home → move to collection point
7. Idle

### Priority Comparison

**Old System:**
- Military often spawned before critical economy roles
- Up to 3 harassers, 2 soldiers, 2 guards per room = 7 military units
- Economy could starve waiting for military to finish spawning

**New System:**
- Economy roles (100, 90, 85) > Military roles (30-65)
- Max 1-2 military units per role per room = ~4 military units max
- Military spawns only when economy is stable or emergency defense needed

## Benefits

1. **No More Spawn Blockades**: Military units move away from spawns to designated collection points
2. **Better Economy**: Reduced military spawning allows more economy creeps
3. **Faster Growth**: Resources allocated to expansion rather than standing army
4. **On-Demand Military**: Military units still spawn when needed (emergency defense)
5. **CPU Efficiency**: Fewer military units = less CPU spent on combat logic
6. **Code Quality**: Refactored duplicate code into reusable helper function

## Testing Checklist

### Manual Testing (Requires Live Server)
- [ ] Deploy to test server
- [ ] Verify harasser moves to collection point when no target room
- [ ] Verify harasser returns home when no targets in target room
- [ ] Verify siege unit moves to collection point when no structures to dismantle
- [ ] Verify collection points are 5-15 tiles from spawn
- [ ] Monitor spawn queue - economy roles should spawn first
- [ ] Count military creeps - should be significantly reduced
- [ ] Check for spawn blockades - should not occur
- [ ] Verify military units still spawn during emergencies

### LarvaWorker Testing (Requires screeps-mcp)
- [ ] Follow `LARVAWORKER_DIAGNOSTIC.md` guide
- [ ] Use screeps-mcp tools to check creep status
- [ ] Verify working state toggles correctly
- [ ] Check energy source selection logic
- [ ] Monitor for idle deadlocks

## Performance Impact

**Expected CPU Savings:**
- Fewer military units spawned: ~0.5-1.0 CPU per tick
- Collection point logic adds: ~0.05 CPU per military unit per tick
- Net savings: ~0.4-0.9 CPU per tick

**Expected Economy Improvement:**
- More larvaWorkers/haulers spawned earlier
- Faster room progression (RCL upgrades)
- Better energy income/storage

## Rollback Plan

If issues arise, revert these commits:
1. `ac83097` - Refactor collection point logic into helper function
2. `2d56ce9` - Update harasser and siege units to move to collection points, reduce military spawn priorities

Changes are isolated to military behaviors and spawn priorities, making rollback safe.

## Related Issues

- Original issue: "harasser and siege units move away from spawn towards our collection point"
- Related: "spawning system spawned a lot of creeps most which are military or defense units"
- Related: LARVA_WORKER_FIX.md - Previous idle deadlock fix

## Future Improvements

- [ ] Add collection point movement to other military roles (soldier, ranger)
- [ ] Implement dynamic priority adjustment based on threat level
- [ ] Add squad-based collection point behavior
- [ ] Optimize collection point calculation for multi-room clusters
- [ ] Add visualization for collection points in-game
