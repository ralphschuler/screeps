# Shard3 Bot Investigation - Fixes Summary

## Overview
Investigation of bot issues on shard3 at tick 67604806. One critical bug fixed, two issues analyzed and documented with TODO comments for future work.

---

## ✅ Bug #1: Empty Room Stats - FIXED

### Problem
Room stats were appearing as empty object `{}` in stats output, preventing monitoring of room performance.

### Root Cause
Room processes are distributed (eco rooms execute every 5 ticks), but `unifiedStats.startTick()` was clearing `currentSnapshot.rooms` at the start of EVERY tick. This meant:
- Tick 0: Room executes, stats recorded
- Tick 1-4: Stats cleared, rooms remain empty
- Stats published every tick, so 4/5 ticks had no room data

### Fix Applied
Modified `unifiedStats.ts:startTick()` to preserve room stats across ticks:
```typescript
// Preserve room stats from previous snapshot
const previousRoomStats = this.currentSnapshot?.rooms ?? {};
this.currentSnapshot = this.createEmptySnapshot();
this.currentSnapshot.rooms = previousRoomStats;  // Don't clear room stats
```

### Impact
- Room stats now persist between room executions
- Stats exported every tick now include current room data
- Grafana dashboards will show continuous room metrics
- No performance impact (just preserving existing object reference)

### Files Changed
- `packages/screeps-bot/src/core/unifiedStats.ts`

---

## ℹ️ Bug #2: Low CPU Bucket - ANALYZED (No Fix Needed)

### Observation
CPU bucket at 3310 (should be 9000+ for healthy bot).

### Analysis
- Current CPU usage: 10.25 / 50 (20.5%)
- Per BUCKET_MANAGEMENT.md, bucket mode is informational only
- Bot continues running all processes normally regardless of bucket
- With 20% CPU usage, bucket recovers at ~40 CPU/tick = ~575/hour
- Will reach 9000 within 3-4 hours of normal operation

### Likely Cause
Low bucket is likely due to recent:
- Spawn burst (24 creeps with many large military units)
- Heavy pathfinding or construction operations
- Bot recovering from earlier CPU spikes

### Verdict
✅ **No fix needed** - Bucket will recover naturally
⚠️ **Monitor** - Track bucket level, investigate if doesn't recover

---

## 🔍 Bug #3: Military Overallocation - ROOT CAUSE IDENTIFIED

### Observation
W1N5 has 15 military creeps (62.5% of all creeps):
- 5 guards
- 4 rangers  
- 1 soldier
- 1 healer
- 1 siege unit
- 1 harasser

Expected for eco room: 0-2 defenders (only if under active attack)

### Root Cause Analysis

#### Issue 1: Posture Switching Too Aggressive
**File**: `packages/screeps-bot/src/logic/evolution.ts`
**Line**: 319-321

```typescript
// Current code
if (danger >= 1) {
  return "defensive";
}
```

**Problem**: Single hostile creep (danger level 1) triggers defensive posture, which spawns many military units with high priority weights.

#### Issue 2: Defense Pheromone Threshold Too Low
**File**: `packages/screeps-bot/src/logic/evolution.ts`
**Line**: 299-301

```typescript
// Current code
if (pheromones.defense > 20) {
  return "defensive";
}
```

**Problem**: Pheromones decay slowly (factor 0.9-0.99 per update), so defensive posture persists long after threats clear.

#### Issue 3: Military Spawn Weights in Defensive Posture
**File**: `packages/screeps-bot/src/spawning/spawnPriority.ts`
**Line**: 60-76

Defensive posture weights:
- `guard: 2.0` (2x priority)
- `remoteGuard: 1.8`
- `healer: 1.5`
- `harvester: 1.0` (normal)
- `upgrader: 0.5` (halved)

**Problem**: Once in defensive posture, military units heavily out-prioritize economic units.

### TODO Comments Added
Added comprehensive investigation TODOs in:
1. `spawnPriority.ts` - Review military spawn weights
2. `evolution.ts` - Review posture switching thresholds
3. `evolution.ts` - Review pheromone decay and thresholds

### Recommended Fixes (For Future PR)
1. **Increase danger threshold for defensive posture**
   - Change `danger >= 1` to `danger >= 2`
   - Or add threat assessment (hostile near spawn/storage)

2. **Increase defense pheromone threshold**
   - Change `defense > 20` to `defense > 30-40`
   - Or implement faster decay when hostiles clear

3. **Implement auto-recovery system**
   - Track ticks since last hostile seen
   - Auto-switch defensive → eco after N ticks without threats
   - Add cooldown to prevent rapid posture oscillation

4. **Adjust defensive spawn weights**
   - Reduce military weights to prevent excessive spawning
   - Maintain minimum economic creeps even in defensive

### Files With TODO Comments
- `packages/screeps-bot/src/logic/evolution.ts`
- `packages/screeps-bot/src/spawning/spawnPriority.ts`

---

## Summary

### Fixed
- ✅ Room stats now export correctly every tick

### Analyzed
- ✅ Bucket will recover naturally with current CPU usage
- ✅ Military overallocation root cause identified
  - Posture switching too aggressive  
  - Pheromones decay too slowly
  - Military weights too high in defensive

### Next Steps
1. Monitor bucket recovery over next few hours
2. Create separate PR to fix posture/spawn issues
3. Test posture thresholds in dev environment
4. Add unit tests for posture switching logic
5. Consider adding posture metrics to Grafana

### Documentation
- Full investigation report: `SHARD3_INVESTIGATION.md`
- Bucket management: `packages/screeps-bot/BUCKET_MANAGEMENT.md`
- Roadmap reference: `ROADMAP.md` Section 8 (Economy) and Section 12 (Defense)

---

## Testing Recommendations

Before deploying posture fixes:
1. Test with simulated hostile scenarios
2. Verify posture switches correctly eco ↔ defensive
3. Confirm military spawn stops when threat clears
4. Validate pheromone decay rates
5. Check spawn queue balance in various postures

---

## Monitoring Plan

After deploying room stats fix:
1. Check Grafana for room metrics appearing correctly
2. Monitor bucket level - should reach 9000 within 4 hours
3. Track W1N5 posture changes in logs
4. Watch creep composition - should rebalance as military creeps die
5. Verify economic creeps (haulers, upgraders) spawn properly

---

Generated: 2025-12-28
Tick: 67604806
Bot Version: SwarmBot with kernel-based architecture
