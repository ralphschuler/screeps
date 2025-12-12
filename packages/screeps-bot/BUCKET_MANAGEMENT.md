# Bucket Management and Process Prioritization

## Overview

The SwarmBot uses an intelligent bucket management system to prevent CPU throttling while ensuring critical operations always run. This document explains how the system works and what to expect during different bucket levels.

## Important: Pixel Generation is Disabled

**Automatic pixel generation is disabled by default** to prevent bucket instability. Generating a pixel consumes 10,000 CPU bucket (emptying it instantly), which causes:
- Bot enters low bucket mode (filters out most processes)
- Only critical operations run (rooms, creeps, spawns)
- Empire management, market, expansion all pause
- Recovery is slow, and if bucket refills, another pixel generates immediately
- Creates a cycle of depletion that prevents normal operation

### Manual Pixel Generation (Recommended)

To generate pixels manually when you have stable high bucket:

```javascript
// 1. Check your bucket is stable and high
console.log(Game.cpu.bucket); // Should be >9000 for extended period

// 2. Generate pixel manually
Game.cpu.generatePixel();

// 3. Monitor recovery before generating another
// Wait until bucket is back above 9000 and stable
```

### Re-enabling Automatic Pixel Generation (Not Recommended)

If you want to re-enable automatic generation despite the risks:

```typescript
// In src/core/kernel.ts, change:
pixelGenerationEnabled: false,
// To:
pixelGenerationEnabled: true,
```

**Warning**: Only do this if you have:
- Stable CPU usage well below your limit
- Bucket consistently stays at or near 10,000
- Understanding that your bot will enter low bucket mode every time it generates a pixel

## Bucket Modes

The kernel operates in one of four modes based on your CPU bucket level:

### Critical Mode (Bucket < 500)
- **What runs**: Only CRITICAL priority processes
- **What's filtered**: Everything except movement finalization
- **Purpose**: Prevent complete CPU exhaustion
- **Typical processes**: None (minimal tick processing only)

### Low Mode (Bucket < 2000)
- **What runs**: CRITICAL and HIGH priority processes
- **What's filtered**: MEDIUM and LOW priority processes
- **Purpose**: Recover bucket while maintaining core functionality
- **Typical processes**:
  - ✅ Room management (HIGH)
  - ✅ Creep execution (HIGH)
  - ✅ Spawn logic (always runs)
  - ✅ Emergency response (runs with rooms)
  - ❌ Empire management (MEDIUM)
  - ❌ Market operations (LOW)
  - ❌ Cluster coordination (MEDIUM)
  - ❌ Expansion planning (MEDIUM)
  - ❌ Power bank harvesting (LOW)

### Normal Mode (Bucket 2000-9000)
- **What runs**: All processes
- **What's filtered**: Nothing
- **Purpose**: Standard operation
- **Typical processes**: Everything runs

### High Mode (Bucket > 9000)
- **What runs**: All processes with full budgets
- **What's filtered**: Nothing
- **Purpose**: Utilize excess CPU for expensive operations
- **Typical processes**: Everything runs with higher budgets

## What You'll See in Logs

### During Low Bucket Mode

Every 100 ticks, you'll see:
```
Bucket LOW mode: 1850/10000 bucket. Running 15/42 processes (filtering LOW/MEDIUM priority)
```

This is **normal and expected** when your bucket is low. The bot is:
1. ✅ Still managing your rooms
2. ✅ Still running your creeps
3. ✅ Still spawning new creeps
4. ✅ Still responding to threats
5. ⏸️ Pausing empire-wide decisions to recover CPU

### Bootstrap Mode Logs

Every 10 ticks during recovery:
```
BOOTSTRAP MODE: 1 active energy producers (1 larva, 0 harvest), 1 total. Energy: 508/1800
```

This shows your room is recovering from workforce collapse (all creeps died). This is **normal** during:
- Initial room setup
- Post-attack recovery
- After deploying new code with bugs

### Emergency Response Logs

When threats appear and are resolved:
```
Emergency resolved in W1N5
```

This appears once per threat resolution, not repeatedly. If you see this every few ticks, something is wrong (please report as a bug).

## Why Other Systems Stop

If you notice your bot is only logging bootstrap and emergency messages, check your bucket:

1. **Bucket < 2000**: Most systems are intentionally paused
   - This is **correct behavior** to prevent CPU throttling
   - Your rooms and creeps still run normally
   - Empire-wide decisions are deferred until bucket recovers

2. **Bucket > 2000**: All systems should be running
   - If you still only see minimal logs, there may be an issue
   - Check for errors in the console
   - Verify processes are registered: `kernel.getProcesses().length`

## How to Improve Bucket

### Short Term (Immediate Recovery)

1. **Reduce room count** - Unclaim excess rooms temporarily
2. **Disable visualizations** - Set `visualizations: false` in config
3. **Disable profiling** - Set `profiling: false` in config
4. **Wait it out** - The bot will automatically throttle and recover

### Long Term (Prevent Future Issues)

1. **Optimize pathfinding** - Enable path caching (ROADMAP Section 20)
2. **Reduce creep count** - Tune spawn priorities to match your CPU
3. **Optimize room processing** - Profile CPU usage per room
4. **Spread operations** - Use `computationScheduler` for expensive tasks
5. **Review ROADMAP.md** - Follow CPU budget guidelines (eco rooms ≤ 0.1 CPU)

## Process Priority Reference

Understanding process priorities helps you predict what will run:

### CRITICAL (100)
- Movement finalization (prevent stuck creeps)
- Room processes under attack

### HIGH (75)
- Room management (owned rooms)
- Creep execution
- Spawn coordination

### MEDIUM (50)
- Empire management
- Cluster coordination
- Terminal operations
- Link management
- Threat prediction

### LOW (25)
- Market operations
- Power bank harvesting
- Power creep management
- Factory operations
- Expansion planning
- Remote infrastructure

### IDLE (10)
- Visualizations
- Statistics collection

## Monitoring Bucket Health

### Console Commands

```javascript
// Check current bucket mode
kernel.getBucketMode()

// See all registered processes
kernel.getProcesses().map(p => `${p.name}: ${p.priority}`)

// Check which processes ran this tick
kernel.getProcesses().filter(p => p.stats.lastRunTick === Game.time)

// View bucket history (if you log it)
Memory.stats.bucket
```

### Grafana Dashboards

If you have Grafana configured, monitor:
- `screeps_cpu_bucket` - Bucket level over time
- `screeps_processes_run` - Processes executed per tick
- `screeps_processes_skipped` - Processes filtered by bucket mode
- `screeps_kernel_mode` - Bucket mode changes

## FAQ

**Q: Why does my bot stop managing the market when bucket is low?**
A: Market operations are LOW priority and get filtered in low bucket mode. This is intentional - market trades are not time-critical.

**Q: Is it bad if my bot is always in low bucket mode?**
A: Not necessarily. If your rooms are functioning well, this means you're using all available CPU efficiently. However, empire-wide features (expansion, market) won't work.

**Q: How do I force a process to always run?**
A: Set its priority to CRITICAL or HIGH. But be careful - this can prevent bucket recovery.

**Q: Why doesn't the bot just run everything slower instead of filtering?**
A: The wrap-around queue already does this. Filtering by priority ensures critical operations (spawns, defense) always complete even under CPU pressure.

**Q: Can I change the bucket thresholds?**
A: Yes, modify `config.cpu.bucketThresholds` in `src/config/index.ts`. Default: low=2000, high=9000, critical=500.

## Troubleshooting

### Bucket keeps dropping despite throttling

1. Check for infinite loops or unoptimized code
2. Profile CPU usage: `npm run profile` (if implemented)
3. Review process CPU budgets: `kernel.getProcesses().map(p => p.stats.avgCpu)`
4. Consider reducing room count or creep count

### Bucket is high but systems still not running

1. Verify kernel initialized: `kernel.getProcesses().length > 0`
2. Check for suspended processes: `kernel.getProcesses().filter(p => p.state === 'suspended')`
3. Look for errors in console
4. Check process intervals: Some processes only run every N ticks

### Emergency resolved spam returned

If you see "Emergency resolved" every few ticks after this fix, that indicates a bug was reintroduced. Please report with:
- Bucket level
- Room name
- Hostile count in the room
- Swarm danger level

## See Also

- [ROADMAP.md](../../ROADMAP.md) - CPU budget guidelines and architecture
- [LOGGING.md](../../LOGGING.md) - Log format and querying
- [src/core/kernel.ts](src/core/kernel.ts) - Kernel implementation
- [src/config/index.ts](src/config/index.ts) - Configuration options
