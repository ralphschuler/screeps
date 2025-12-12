# Creep Deadlock Bug Fix

## Issue

Creeps were getting stuck in a deadlock state where they showed `working = false` but had partial energy. This caused them to attempt collecting more energy but be unable to do so due to lack of free capacity.

## Root Cause

The bug was in the `updateWorkingState` function in `src/roles/behaviors/economy.ts`:

```typescript
// BUGGY CODE (before fix)
function updateWorkingState(ctx: CreepContext): boolean {
  const wasWorking = ctx.memory.working ?? false;  // Defaults undefined to false
  if (ctx.isEmpty) ctx.memory.working = false;
  if (ctx.isFull) ctx.memory.working = true;
  const isWorking = ctx.memory.working ?? false;  // Still defaults to false
  
  return isWorking;
}
```

### Problem Flow

1. Creep spawns with `working = undefined`
2. First call: `wasWorking = false` (defaults undefined to false)
3. Creep is empty → `working = false` 
4. Creep collects some energy (becomes partial: not empty, not full)
5. Next call: `working` is `false`, but:
   - `ctx.isEmpty = false` (has energy) - doesn't set to false
   - `ctx.isFull = false` (not full) - doesn't set to true
   - `working` stays `false` 
6. Creep has energy but `working = false` → tries to collect more
7. Can't collect because no free capacity → **DEADLOCK**

### Visual Example

```
Tick 1: Creep spawns
  - energy: 0/100
  - working: undefined → false
  - action: collect energy ✓

Tick 10: Creep partially filled from container
  - energy: 50/100
  - working: false (unchanged)
  - isEmpty: false, isFull: false
  - action: collect energy (but has no capacity!) ✗
  
Tick 11-N: DEADLOCK
  - energy: 50/100  
  - working: false
  - Can't collect (no capacity)
  - Can't deliver (working=false means "collecting mode")
```

## Solution

Initialize `working` state based on current energy when undefined:

```typescript
// FIXED CODE
function updateWorkingState(ctx: CreepContext): boolean {
  // Initialize working state if undefined - creeps with energy should be working
  if (ctx.memory.working === undefined) {
    ctx.memory.working = !ctx.isEmpty;
  }
  
  const wasWorking = ctx.memory.working;
  
  // Update state based on energy levels
  if (ctx.isEmpty) ctx.memory.working = false;
  if (ctx.isFull) ctx.memory.working = true;
  
  const isWorking = ctx.memory.working;
  
  return isWorking;
}
```

### Fix Logic

- **If `working` is `undefined`:**
  - Has energy (`!isEmpty`) → `working = true` (start delivering)
  - No energy (`isEmpty`) → `working = false` (start collecting)
  
- **Normal operation (working is defined):**
  - Empty → `working = false` (switch to collecting)
  - Full → `working = true` (switch to working)
  - Partial → keep current state (continue current task)

## Test Coverage

Added test cases to verify the fix:

```typescript
it("should initialize working=true when creep has partial energy", () => {
  const creep = createMockCreep({ freeCapacity: 50, usedCapacity: 50 });
  ctx.memory.working = undefined;
  
  const action = larvaWorker(ctx);
  
  assert.equal(action.type, "transfer"); // Should deliver, not collect
  assert.equal(ctx.memory.working, true); // Should be working
});

it("should initialize working=false when creep is empty", () => {
  const creep = createMockCreep({ freeCapacity: 100, usedCapacity: 0 });
  ctx.memory.working = undefined;
  
  const action = larvaWorker(ctx);
  
  assert.notEqual(action.type, "transfer"); // Should collect
  assert.equal(ctx.memory.working, false); // Should be collecting
});
```

Both tests pass ✅

## Impact

This fix resolves the deadlock issue where creeps would:
1. Spawn and partially fill with energy
2. Get stuck unable to work or collect more
3. Appear "idle" with `working = false`

After the fix:
1. Creeps correctly initialize their working state based on energy
2. Partial energy → working mode → deliver energy
3. No more deadlock situations

## Related Files

- **Source:** `packages/screeps-bot/src/roles/behaviors/economy.ts`
- **Tests:** `packages/screeps-bot/test/unit/larvaWorker.test.ts`
- **Behavior:** Affects all economy roles that use `updateWorkingState` (larvaWorker, builder, upgrader, etc.)

## Prevention

To prevent similar issues in the future:

1. **Always initialize optional memory fields** before using them
2. **Test edge cases** with undefined/partial states
3. **Use explicit initialization** rather than relying on `??` defaults in critical logic
4. **Document state transitions** clearly in comments

## See Also

- State machine documentation in `src/roles/behaviors/stateMachine.ts`
- Economy behaviors documentation in `src/roles/behaviors/economy.ts`
- ROADMAP.md Section 8 (Ökonomie & Infrastruktur)
