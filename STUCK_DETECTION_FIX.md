# Stuck Detection Fix - State Reevaluation Issue

## Problem
Creeps were constantly reevaluating their state every 5 ticks because stuck detection was incorrectly resetting tracking variables when detecting stuck state, creating a false "unstuck" grace period.

## Root Cause
In `stateMachine.ts`, when stuck detection triggered:
1. ✅ Cleared movement cache and cached targets (correct)
2. ❌ Reset stuck tracking (`lastPosTick`, `lastPosX`, etc.) to current time/position (incorrect)
3. This created a cycle where truly stuck creeps appeared "unstuck" for 5 ticks before being detected again

## The Fix
**Changed behavior**: Stuck tracking is **only** updated when the creep actually moves, not when stuck is detected.

### Before Fix (Incorrect)
```
Flow: getStateValidity() → lines 130-153 (old code)

Tick 1000: Stuck at (10,10), lastPosTick=995
           Line 131: ticksStuck = 5 → STUCK DETECTED
           Lines 146-149: ❌ Reset: lastPosTick=1000
           Evaluate new action

Tick 1001: Still at (10,10), lastPosTick=1000
           Line 131: ticksStuck = 1 → appears "unstuck" ✗
           Keep invalid state

Tick 1002-1004: Same pattern, ticksStuck = 2,3,4
                Keep invalid state

Tick 1005: Still at (10,10), lastPosTick=1000
           Line 131: ticksStuck = 5 → STUCK DETECTED AGAIN
           Lines 146-149: ❌ Reset: lastPosTick=1005
           Reevaluate (5 ticks wasted!)

Result: State reevaluated every 5 ticks indefinitely
```

### After Fix (Correct)
```
Flow: getStateValidity() → lines 130-164 (new code)

Tick 1000: Stuck at (10,10), lastPosTick=995
           Line 131: ticksStuck = 5 → STUCK DETECTED
           Lines 142-147: ✅ Keep: lastPosTick=995 (no reset)
           Evaluate new action

Tick 1001: Still at (10,10), lastPosTick=995
           Line 131: ticksStuck = 6 → STILL STUCK
           Evaluate new action (different one)

Tick 1002: Moved to (10,11)!
           Lines 154-160: ✅ Update: lastPosTick=1002, lastPosX=10, lastPosY=11
           Creep making progress

Result: Stuck tracking persists until creep actually moves
```

## Key Changes

### File: `packages/screeps-bot/src/roles/behaviors/stateMachine.ts`

**Removed** (lines 142-149):
```typescript
// Reset stuck tracking so the next action has a chance...
memory.lastPosX = ctx.creep.pos.x;
memory.lastPosY = ctx.creep.pos.y;
memory.lastPosRoom = ctx.creep.pos.roomName;
memory.lastPosTick = Game.time;
```

**Added** comment explaining the fix:
```typescript
// BUGFIX: DO NOT reset stuck tracking here!
// The tracking should only be updated when the creep actually moves (see below).
// Resetting here causes a cycle where stuck creeps appear "unstuck" for 5 ticks
// before being detected again, leading to constant reevaluation.
// Instead, let the stuck state persist until the creep finds a valid action
// that actually moves it to a new position.
```

**Existing code** that updates tracking (unchanged, lines 154-160):
```typescript
} else {
  // Update position tracking when position changes
  memory.lastPosX = ctx.creep.pos.x;
  memory.lastPosY = ctx.creep.pos.y;
  memory.lastPosRoom = ctx.creep.pos.roomName;
  memory.lastPosTick = Game.time;
}
```

## Testing

Added tests in `test/unit/stateMachine.test.ts`:

1. **Test: "should not reset stuck tracking when state is invalidated"**
   - Verifies stuck tracking persists after state invalidation
   - Ensures creeps don't get false "unstuck" grace period

2. **Test: "should update stuck tracking only when creep moves"**
   - Verifies tracking updates when creep changes position
   - Confirms natural reset mechanism works

## Benefits

1. **Eliminates constant reevaluation**: Stuck creeps no longer waste CPU reevaluating every 5 ticks
2. **Faster recovery**: Stuck state invalidates immediately on subsequent ticks, forcing faster action changes
3. **More accurate tracking**: Stuck tracking reflects actual movement state, not evaluation cycle
4. **Cleaner logic**: Tracking updates only in one place (when position changes)

## Edge Cases Handled

- **Stationary actions**: Harvest, harvestMineral, and upgrade are exempt from stuck detection (unchanged)
- **First initialization**: Tracking initialized on first run with current position (unchanged)
- **Movement validation**: Tracking only updates when position actually changes (unchanged)

## Impact

- **CPU**: Reduced CPU usage from eliminating unnecessary reevaluations
- **Behavior**: Creeps recover from stuck states more intelligently
- **Memory**: No change in memory usage
- **Compatibility**: Backward compatible, no breaking changes

## Related Files

- `packages/screeps-bot/src/roles/behaviors/stateMachine.ts` - Core fix
- `packages/screeps-bot/test/unit/stateMachine.test.ts` - Tests
- `packages/screeps-bot/src/roles/behaviors/types.ts` - StuckTrackingMemory interface
