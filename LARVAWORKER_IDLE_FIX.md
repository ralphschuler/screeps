# LarvaWorker Idle Deadlock Fix

## Issue

LarvaWorkers were getting stuck in an idle state when they had energy but no valid targets to deliver it to. This created a deadlock situation where creeps would stand around doing nothing despite having energy to spend.

## Root Cause

The `larvaWorker()` function in `src/roles/behaviors/economy.ts` had a scenario where it would return `{ type: "idle" }` when:

1. Creep is in working state (`working=true`, has energy)
2. All delivery targets are full or unavailable:
   - Spawns and extensions full
   - Towers full
   - Storage full or doesn't exist
3. No construction sites exist to build
4. No controller exists to upgrade (defensive check that shouldn't happen in owned rooms)

**Problem Code (Line 278):**
```typescript
export function larvaWorker(ctx: CreepContext): CreepAction {
  const isWorking = updateWorkingState(ctx);

  if (isWorking) {
    // ... try to deliver energy, build, upgrade
    
    if (ctx.room.controller) {
      return { type: "upgrade", target: ctx.room.controller };
    }

    return { type: "idle" };  // ❌ DEADLOCK: Has energy but nowhere to put it
  }

  return findEnergy(ctx);
}
```

## Impact

When this condition occurred:
- LarvaWorkers would stand idle despite having energy
- Energy that could be used for other purposes was trapped in the creep
- Room efficiency decreased as creeps wasted time doing nothing
- CPU was still consumed for idle creep processing

This was particularly problematic in:
- **Early game**: When storage doesn't exist yet and spawns/extensions are often full
- **Transition periods**: When construction finishes but new sites aren't placed yet
- **Edge cases**: Rare scenarios where controller might be temporarily unavailable

## Solution

Applied the same pattern already used in the `hauler()` behavior (lines 612-619): when a creep has energy but no valid work targets, switch it to collection mode instead of idling.

**Fixed Code:**
```typescript
export function larvaWorker(ctx: CreepContext): CreepAction {
  const isWorking = updateWorkingState(ctx);

  if (isWorking) {
    // ... try to deliver energy, build, upgrade
    
    if (ctx.room.controller) {
      return { type: "upgrade", target: ctx.room.controller };
    }

    // FIX: No valid work targets found, but creep still has energy
    // Switch to collection mode to top off capacity instead of idling
    // This prevents deadlock where larvaWorkers with partial energy get stuck
    // in working=true state with no valid targets
    if (!ctx.isEmpty) {
      logger.debug(`${ctx.creep.name} larvaWorker has energy but no targets, switching to collection mode`);
      switchToCollectionMode(ctx);
      // Fall through to collection logic below
    } else {
      // This should never happen (working=true but isEmpty=true), but log it as a warning
      logger.warn(`${ctx.creep.name} larvaWorker idle (empty, working=true, no targets) - this indicates a bug`);
      return { type: "idle" };
    }
  }

  return findEnergy(ctx);
}
```

## Benefits

1. **No More Deadlocks**: LarvaWorkers with energy but no targets will switch to collection mode and top off their capacity
2. **Better Resource Utilization**: Creeps stay productive instead of idling
3. **Consistent Pattern**: Uses the same defensive logic as hauler role for consistency
4. **Defensive Logging**: Warning logs help identify if the impossible case (working=true but empty) ever occurs
5. **Smooth Operation**: Creeps transition seamlessly between work and collection without appearing idle

## Testing

### Test Coverage

Added test case in `test/unit/larvaWorker.test.ts`:
```typescript
it("should switch to collection mode when has energy but no targets and no controller", () => {
  const creep = createMockCreep({ freeCapacity: 50, usedCapacity: 50 }); // Has partial energy
  const mockRoom = createMockRoom(undefined); // No controller
  
  const ctx = createMockContext(creep, {
    isWorking: true,
    spawnStructures: [],
    towers: [],
    storage: undefined,
    prioritizedSites: [],
    controller: undefined // No controller
  });
  
  // Mock room.find to return empty sources for findEnergy fallback
  (mockRoom as any).find = () => [];
  (creep as any).room = mockRoom;

  const action = larvaWorker(ctx);

  // Should switch to collection mode and call findEnergy
  // Since there are no energy sources, it will return idle
  // But the important part is that working state was switched to false
  assert.equal(ctx.memory.working, false, "Should switch working state to false");
});
```

### Manual Verification

To verify this fix in the live game:

1. Deploy to Screeps server
2. Monitor for `"larvaWorker has energy but no targets, switching to collection mode"` debug logs
3. Verify larvaWorkers with energy but no targets switch to collection mode
4. Confirm zero instances of larvaWorkers idling with energy in storage

## Related Fixes

This fix follows the same pattern as previous fixes:

1. **LARVA_WORKER_FIX.md**: Fixed larvaWorkers returning idle when `findDistributedTarget()` returned null
2. **BUGFIX_CREEP_DEADLOCK.md**: Fixed working state initialization for creeps with partial energy
3. **Hauler Fix (lines 612-619)**: Same pattern where haulers with energy but no targets switch to collection mode

All these fixes demonstrate the importance of defensive programming in behavior logic and handling edge cases gracefully.

## Metrics to Monitor

After deploying this fix, monitor:

1. **Idle Time**: LarvaWorker idle time should decrease (check via idle detection stats)
2. **Energy Efficiency**: Energy delivery should maintain or improve
3. **CPU Usage**: Should be unchanged (collection mode is normal operation)
4. **Log Frequency**: `"switching to collection mode"` logs indicate the fix is working
5. **Warning Logs**: Zero instances of `"larvaWorker idle (empty, working=true, no targets)"` indicates no bugs

## Future Improvements

Potential enhancements to consider:

1. **Drop Energy**: If no collection sources are available, allow larvaWorkers to drop energy for haulers
2. **Transfer to Other Creeps**: Enable peer-to-peer energy transfers in emergencies
3. **Predictive Targeting**: Anticipate when targets will be full and switch modes proactively
4. **Role Transition**: Convert idle larvaWorkers to different roles dynamically based on room needs

## Prevention

To prevent similar issues in future behavior implementations:

1. **Always provide a fallback**: Never return idle as the only option when creeps have resources
2. **Use switchToCollectionMode**: When work targets aren't available, switch to collection
3. **Test edge cases**: Consider scenarios where all normal targets are unavailable
4. **Consistent patterns**: Follow established patterns from hauler and larvaWorker behaviors
5. **Defensive logging**: Add warnings for "impossible" states to catch bugs early
