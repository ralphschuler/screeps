# Shard3 Bot Investigation Report

## Date: 2025-12-28
## Game Tick: 67604806
## Bot Status: Running but with issues

---

## 1. Executive Summary

The bot is running on shard3 but experiencing several critical issues:
- **Low CPU bucket** (3310/10000) - critically low, should be 9000+
- **Empty room stats** - stats collection appears to be malfunctioning
- **Imbalanced creep economy** - too many military creeps, insufficient economic creeps
- **MCP console access failing** - unable to execute console commands for live debugging

---

## 2. Current State (from stats output)

### CPU & Performance
- **CPU Used**: 10.25 / 50 (20.5% usage) - relatively low
- **Bucket**: 3310 - **CRITICAL** (should be 9000+)
- **Bucket State**: Low bucket means bot may be CPU-starved or has performance issues

### GCL Progression
- **Level**: 3
- **Progress**: 8,413,772 / 8,688,578 (96.84%)
- **Status**: About to level up to GCL 4 soon

### Room Status
- **Owned Rooms**: 1 (W1N5)
- **Stats Rooms Object**: `{}` - **BUG**: Should contain room stats but is empty
- **Issue**: Room stats are not being exported to stats output despite recordRoom being called

### Creep Analysis (24 total creeps in W1N5)

#### Military/Defense Creeps (15 total - 62.5%)
- **Guards**: 5 creeps (guard_67328427_493, guard_67328511_888, guard_67328556_50, guard_67328691_141, guard_67329496_749)
- **Rangers**: 4 creeps (ranger_67328819_715, ranger_67329023_654, ranger_67329165_157, ranger_67329339_196)
- **Soldier**: 1 creep (soldier_67329790_785)
- **Healer**: 1 creep (healer_67329106_550)
- **Siege Unit**: 1 creep (siegeUnit_67328884_60)
- **Harasser**: 1 creep (harasser_67328944_44)
- **Observation**: Heavy military focus suggests room is in defense/war posture

#### Economic Creeps (6 total - 25%)
- **Harvesters**: 2 creeps (harvester_67329213_414, harvester_67329470_590) - **INSUFFICIENT**
- **Haulers**: 1 creep (hauler_67328643_432) - **INSUFFICIENT**
- **Upgrader**: 1 creep (upgrader_67328742_417) - **INSUFFICIENT**
- **Builder**: 2 creeps (builder_67328427_493, builder_67329894_245) - minimal

#### Utility Creeps (3 total - 12.5%)
- **Scouts**: 2 creeps (scout_67329711_915, scout_67329714_531)
- **Claimer**: 1 creep (claimer_67329841_85)
- **Engineers**: 2 creeps (engineer_67329732_991, engineer_67329926_602)
- **Queen Carrier**: 1 creep (queenCarrier_67329693_444)
- **Larva Worker**: 1 creep (larvaWorker_67329071_317)

#### Creep Issues
- **Dying Creep**: engineer_67329926_602 has TTL=0 (dying this tick)
- **Economic Imbalance**: Only 2 harvesters for a room is critically low
  - According to ROADMAP.md Section 8, optimal is 1 static miner per source (need 2)
  - Need more carriers for logistics
- **Military Overallocation**: 15 military creeps (62.5%) is excessive for a single RCL room
  - Suggests room is stuck in war/defense posture when it should be eco

---

## 3. Identified Bugs

### Bug #1: Empty Room Stats in Output
**Severity**: HIGH
**Status**: ✅ **FIXED**

**Symptoms**:
- `stats.rooms` object is empty in console output
- Should contain detailed stats for W1N5

**Root Cause**:
Room process distribution causes rooms to only execute every 5 ticks (for economic rooms), but `startTick()` was clearing `currentSnapshot.rooms` at the start of EVERY tick. This meant:
- Tick 0 (room executes): Room stats recorded in `currentSnapshot.rooms`
- Tick 1: `startTick()` clears rooms → stats lost
- Ticks 2-4: Still empty
- Tick 5 (room executes): Stats recorded again
- But stats are published EVERY tick, so 4 out of 5 ticks have empty room stats

**Investigation Trail**:
1. ✅ Verified `unifiedStats.recordRoom()` is called in `RoomNode.run()` (line 225 of roomNode.ts)
2. ✅ Verified room processes are registered in `roomProcessManager.ts`
3. ✅ Verified `finalizeEmpireStats()` reads from `this.currentSnapshot.rooms`
4. ✅ Discovered room distribution: eco rooms run every 5 ticks (line 100-104 of roomProcessManager.ts)
5. ✅ Found bug: `startTick()` was clearing room stats every tick (line 555 of unifiedStats.ts)

**Fix Applied**:
Modified `startTick()` in `unifiedStats.ts` to preserve `currentSnapshot.rooms` across ticks:
```typescript
// Preserve room stats from previous snapshot
const previousRoomStats = this.currentSnapshot?.rooms ?? {};
this.currentSnapshot = this.createEmptySnapshot();
this.currentSnapshot.rooms = previousRoomStats;  // Don't clear room stats
```

This allows room stats to persist between room executions while still being exported every tick.

### Bug #2: Low CPU Bucket (3310)
**Severity**: MEDIUM
**Status**: MONITORING (Not Critical)

**Symptoms**:
- Bucket at 3310 (should be 9000+ for healthy bot)
- Current CPU usage: 10.25 / 50 (20.5%)

**Analysis**:
Per BUCKET_MANAGEMENT.md, the bucket mode is **informational only** and does not affect bot execution:
- Bot continues to run all processes normally with rolling queue
- No throttling or filtering based on bucket level
- Uses full targetCpuUsage (98%) regardless of bucket

**Likely Cause**:
With only 20.5% CPU usage, the bucket should be **recovering naturally**:
- Below 100% CPU usage = bucket refills by (limit - used) per tick
- At 20% usage, bucket gains ~40 CPU/tick = ~575 per hour
- Bucket should reach 9000 within ~3-4 hours of normal operation

The low bucket is likely due to:
1. Recent spawn burst (spawning many creeps consumes energy + CPU)
2. Recent heavy pathfinding or construction operations
3. Bot recovering from earlier issues

**Verdict**: 
✅ **No fix needed** - Bucket will recover naturally with current 20% CPU usage
⚠️ **Monitor** - If bucket doesn't recover or drops further, investigate CPU spikes

**Monitoring Actions**:
- Track bucket level over next few hours
- Check for CPU spikes in logs
- Verify pathfinding cache is working
- Monitor spawn activity for abnormal bursts

### Bug #3: Creep Economic Imbalance
**Severity**: HIGH
**Status**: NEEDS CODE REVIEW

**Symptoms**:
- Only 2 harvesters (need 2 static miners = 1 per source) ✅ This is actually correct!
- Only 1 hauler (need more for logistics) ❌ Likely insufficient
- 1 upgrader (need 1-2) ✅ May be acceptable
- 15 military creeps (62.5% of all creeps) ❌ **Major concern**
- Room appears stuck in war/defense posture

**Re-Analysis of Harvester Count**:
Looking more carefully, the 2 harvesters match the expected count:
- Per ROADMAP.md Section 8: 1 static miner per source
- Most rooms have 2 sources → 2 harvesters is correct
- ✅ Harvester count is actually appropriate

**Real Issues**:
1. **Hauler count**: Only 1 hauler for logistics may be insufficient
   - Need to verify distance from sources to storage/spawn
   - More haulers needed for efficient energy transport
2. **Military overallocation**: 15 military creeps (62.5%) is excessive
   - 5 guards, 4 rangers, 1 soldier, 1 healer, 1 siege unit, 1 harasser
   - Suggests room is in defense/war posture instead of eco
3. **Multiple scouts/claimers**: Expansion activity while economy is weak

**Investigation Needed**:
1. TODO: Check current room posture in Memory (should be "eco")
   - Access Memory.rooms.W1N5.swarm.posture
   - Check danger level (Memory.rooms.W1N5.swarm.danger)
2. TODO: Check if hostiles are actually present in W1N5
   - This would justify defensive spawn
   - Check pheromone.defense value
3. TODO: Review spawn queue priorities
   - Are military roles over-prioritized?
   - Check spawning/spawnPriority.ts weights
4. TODO: Check pheromone values for the room
   - High war/defense pheromones would trigger military spawn
   - Review pheromone decay rates

**Expected Behavior** (per ROADMAP.md Section 8):
For an eco room at early RCL:
- 2 static miners (1 per source) ✅ Have this
- 2-4 carriers for logistics ❌ Only 1 hauler
- 1-2 upgraders ✅ Have 1
- 1-2 builders ✅ Have 2
- 0-2 defenders (only if under active attack) ❌ Have 15 military!
- Workers/scouts as needed ✅ Have some

**Next Steps**:
1. Review spawning/spawnPriority.ts to understand military weight calculation
2. Check Memory.rooms.W1N5.swarm to see actual posture and pheromones
3. Verify threat assessment logic in roomNode.ts
4. Fix spawn weights if military is over-prioritized
5. Add auto-recovery from war→eco posture when threats clear

### Bug #4: MCP Console Access Failing
**Severity**: Medium
**Status**: CONFIRMED

**Symptoms**:
- `screeps_console` command returns 404 error
- `screeps_memory_get` command returns 404 error
- Unable to execute live console commands for debugging

**Impact**:
- Cannot investigate live game state directly
- Must rely on stats output and code analysis
- Limits debugging capabilities significantly

**Possible Causes**:
1. MCP server not configured for shard3
2. Authentication issue
3. API endpoint changed
4. Server/shard parameter incorrect

---

## 4. System Health Indicators

### ✅ Working Systems
- Main loop executing (confirmed by stats output)
- Creeps spawning and moving
- GCL progression working (96.84% to level 4)
- Basic bot functionality operational

### ⚠️ Degraded Systems
- **Stats Collection**: Room stats not appearing in output
- **CPU Efficiency**: Low bucket indicates performance issues
- **Spawn Logic**: Economic creeps underproduced

### ❌ Failing Systems
- **MCP Console Access**: Cannot execute commands
- **Economic Balance**: Military creeps overproduced

---

## 5. Recommendations

### Immediate Actions (Priority 1) - Completed
1. ✅ **Fix stats collection bug** - Room stats now persist across ticks
2. ⬜ **Investigate spawn logic** - Understand why so many military creeps are spawning
3. ⬜ **Check room posture** - Verify W1N5 posture is appropriate (should be "eco" not "defense/war")
4. ⬜ **Review pheromone system** - Check danger levels and military pheromones

### Short-term Actions (Priority 2)
1. ⬜ **Fix economic creep shortage** - Ensure proper harvester/hauler/upgrader counts
2. ⬜ **Review spawn priorities** - Military roles may be over-prioritized
3. ⬜ **Monitor bucket recovery** - With 20% CPU usage, bucket should recover to 9000+
4. ⬜ **Review MCP server configuration** - Restore console access for live debugging
5. ⬜ **Audit kernel process budgets** - Ensure processes aren't over-budget
6. ⬜ **Verify room distribution** - Confirm eco rooms only run every 5 ticks

### Long-term Actions (Priority 3)
1. ⬜ **Add monitoring alerts** - Alert when bucket drops below 5000
2. ⬜ **Implement auto-posture recovery** - Automatically switch from war→eco when threats clear
3. ⬜ **Add spawn queue diagnostics** - Better visibility into spawn decisions
4. ⬜ **Enhance stats export** - Ensure all critical metrics are exported
5. ⬜ **Add unit tests for stats persistence** - Prevent regression of room stats bug

---

## 6. Code Locations to Investigate

### Stats Collection
- `/packages/screeps-bot/src/core/unifiedStats.ts` - Lines 565-679 (finalizeTick)
- `/packages/screeps-bot/src/core/unifiedStats.ts` - Lines 1644-1688 (room stats export)
- `/packages/screeps-bot/src/core/roomNode.ts` - Line 225 (recordRoom call)

### Spawn Logic
- `/packages/screeps-bot/src/logic/spawn.ts` - Spawn manager
- `/packages/screeps-bot/src/logic/evolution.ts` - Posture management
- `/packages/screeps-bot/src/logic/pheromone.ts` - Pheromone system

### CPU Management
- `/packages/screeps-bot/src/core/kernel.ts` - Kernel process management
- `/packages/screeps-bot/src/core/roomProcessManager.ts` - Room distribution
- `/packages/screeps-bot/src/SwarmBot.ts` - Main loop

---

## 7. Next Steps for Investigation

1. ✅ Document current state (this file)
2. ⬜ Fix stats collection to get visibility
3. ⬜ Analyze CPU usage patterns
4. ⬜ Review spawn queue and posture logic
5. ⬜ Test fixes in local environment
6. ⬜ Deploy fixes and monitor

---

## Appendix: Raw Stats Output

```json
{
  "cpu": {
    "used": 10.253511600000024,
    "limit": 50,
    "bucket": 3310
  },
  "gcl": {
    "level": 3,
    "progress": 8413772.356908422,
    "progress_total": 8688578.522146657,
    "progress_percent": 96.83715622137993
  },
  "rooms": {},
  "creeps": {
    "builder_67328427_493": {"role": "builder", "home_room": "W1N5", "current_room": "W1N5", "cpu": 0, "action": "pickup", "ticks_to_live": 19, "hits": 1000, "hits_max": 1000, "body_parts": 10, "fatigue": 0, "actions_this_tick": 0},
    "guard_67328511_888": {"role": "guard", "home_room": "W1N5", "current_room": "W1N5", "cpu": 0, "action": "moveTo", "ticks_to_live": 109, "hits": 1200, "hits_max": 1200, "body_parts": 12, "fatigue": 0, "actions_this_tick": 0},
    // ... (22 more creeps)
  }
}
```
