# Larva Worker Idle Deadlock Fix

## Issue

Larva workers (and other economy roles) were getting stuck idle even when energy sources were available. This manifested as creeps appearing to "do nothing" despite having work to do.

## Root Cause

The `findEnergy()` function in `src/roles/behaviors/economy.ts` had a critical bug where it would return an `idle` action when `findDistributedTarget()` returned `null`, even when valid energy sources (containers or sources) were available.

### Problem Flow

1. LarvaWorker needs energy and calls `findEnergy()`
2. `findEnergy()` finds containers with energy > 100
3. Calls `findDistributedTarget(creep, containers, "energy_container")`
4. In rare edge cases, `findDistributedTarget()` returns `null`
5. Code logs warning: `"found N containers but distribution returned null"`
6. **BUG**: No fallback - code continues to next check
7. Same pattern for sources - if distribution returns `null`, no fallback
8. Falls through to final line: `return { type: "idle" }`
9. **Result**: Creep idles even though valid energy sources exist

### Why findDistributedTarget Might Return Null

While `findDistributedTarget()` should always return a target when targets exist, edge cases could occur:
- Race conditions in target assignment tracking
- Memory corruption or cache issues
- Defensive programming: better to have a fallback than assume it never fails

## Solution

Added defensive fallback logic to always select a target if any exist:

```typescript
// Before (BUGGY):
const distributed = findDistributedTarget(ctx.creep, containersWithEnergy, "energy_container");
if (distributed) {
  return { type: "withdraw", target: distributed, resourceType: RESOURCE_ENERGY };
} else {
  logger.warn(`found ${containersWithEnergy.length} containers but distribution returned null`);
  // Falls through - no return statement!
}
// Next check continues...

// After (FIXED):
const distributed = findDistributedTarget(ctx.creep, containersWithEnergy, "energy_container");
if (distributed) {
  return { type: "withdraw", target: distributed, resourceType: RESOURCE_ENERGY };
} else {
  // BUGFIX: Fall back to closest if distribution fails
  logger.warn(`found ${containersWithEnergy.length} containers but distribution returned null, falling back to closest`);
  const fallback = ctx.creep.pos.findClosestByRange(containersWithEnergy);
  if (fallback) {
    return { type: "withdraw", target: fallback, resourceType: RESOURCE_ENERGY };
  }
}
// If still no fallback (shouldn't happen), continue to next check
```

## Changes Made

### File: `packages/screeps-bot/src/roles/behaviors/economy.ts`

#### 1. `findEnergy()` - Container Collection (lines ~148-167)
- Added fallback to `findClosestByRange()` when `findDistributedTarget()` returns `null` for containers
- Ensures creeps always withdraw from a container if any have energy

#### 2. `findEnergy()` - Source Harvesting (lines ~171-189)
- Added fallback to `findClosestByRange()` when `findDistributedTarget()` returns `null` for sources
- Ensures creeps always harvest from a source if any are active

#### 3. `hauler()` - Energy Container Collection (lines ~641-661)
- Added same fallback pattern for haulers collecting from energy containers
- Prevents haulers from going idle when energy containers exist

#### 4. `hauler()` - Mineral Container Collection (lines ~663-690)
- Added fallback for mineral container collection
- Ensures mineral hauling continues even if distribution fails

## Benefits

1. **Robustness**: Creeps no longer get stuck idle due to edge cases in target distribution
2. **Defensive Programming**: Handles unexpected failures gracefully
3. **Maintains Optimization**: Still uses distributed targeting in normal cases for load balancing
4. **Logging**: Warnings help identify if distribution is failing more than expected

## Testing

### Manual Verification
- Deploy to Screeps server
- Monitor for "distribution returned null" warnings in logs
- Verify larvaWorkers and haulers don't go idle when energy sources exist
- Check that energy collection continues smoothly

### Expected Behavior
- In normal operation: no fallback warnings, distributed targeting works
- In edge cases: fallback warnings appear, but creeps still work (no idle)
- Zero instances of creeps idling with available energy sources

## Related Issues

This fix addresses similar patterns to the previous working state initialization bug documented in `BUGFIX_CREEP_DEADLOCK.md`:
- Both involved creeps appearing to "do nothing"
- Both required defensive initialization/fallback logic
- Both demonstrate the importance of handling edge cases in behavior logic

## Metrics to Monitor

After deploying this fix, monitor:
1. Frequency of "distribution returned null" warnings (should be rare/zero)
2. Creep idle time for larvaWorker and hauler roles (should decrease)
3. Energy collection efficiency (should maintain or improve)
4. CPU usage (should be unchanged - fallback is rare path)
