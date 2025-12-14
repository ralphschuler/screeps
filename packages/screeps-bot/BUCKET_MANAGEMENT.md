# Bucket Management and Process Execution

## Overview

The SwarmBot uses the CPU bucket as an indicator of CPU health, but **no longer filters processes based on bucket level**. Instead, the kernel uses:
- **Rolling index process execution**: Ensures all processes get their turn even under CPU pressure
- **CPU budget checks**: Stops execution when CPU limit is reached, picking up where it left off next tick
- **Priority-based ordering**: Higher priority processes execute first in the queue

This approach ensures critical operations complete first while still giving every process a fair chance to run.

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

If you want to re-enable automatic generation:

```typescript
// In src/core/kernel.ts, change:
pixelGenerationEnabled: false,
// To:
pixelGenerationEnabled: true,
```

**Note**: This will empty the bucket to 0, but the bot will continue to function normally thanks to the rolling index system.

## Bucket Modes (Informational Only)

The kernel tracks bucket modes for monitoring purposes, but **these modes no longer affect which processes run**:

### Critical Mode (Bucket < 500)
- **Status indicator only** - all processes still attempt to run
- **Purpose**: Shows bucket is critically low in logs/metrics

### Low Mode (Bucket < 2000)
- **Status indicator only** - all processes still attempt to run
- **Purpose**: Shows bucket is below optimal level

### Normal Mode (Bucket 2000-9000)
- **Status indicator only** - all processes still attempt to run
- **Purpose**: Standard operation indicator

### High Mode (Bucket > 9000)
- **Status indicator only** - all processes still attempt to run
- **Purpose**: Shows bucket is at healthy level

## How Process Execution Actually Works

Instead of filtering by bucket mode, the kernel uses:

1. **Rolling Index Queue**: Processes execute in priority order. If CPU budget is exhausted mid-tick, execution resumes at the next process in the next tick.

2. **CPU Budget Checks**: Each tick, the kernel stops executing new processes when CPU limit is approached, preventing throttling.

3. **Fair Execution**: Every process eventually runs, even under CPU pressure. Higher priority processes execute first, but lower priority ones still get their turn.

4. **Interval-based Scheduling**: Processes define their own intervals (e.g., run every 10 ticks). The kernel respects these intervals regardless of bucket level.

## What You'll See in Logs

### Bucket Status Logging

Every 100 ticks when bucket is low:
```
Bucket LOW mode: 1850/10000 bucket. Running processes normally with rolling queue.
```

This is **informational only**. The bot continues to run all processes in priority order.

### CPU Budget Exhausted Logs

When CPU limit is reached mid-tick:
```
Kernel: CPU budget exhausted after 25 processes. 17 processes deferred to next tick.
```

This shows the rolling queue in action - the remaining 17 processes will be first in line next tick.

## Why Bucket Doesn't Affect Execution

Previously, the bot would filter out low-priority processes when bucket was low. This approach had issues:

1. **Starvation**: Some processes might never run if bucket stayed low
2. **Unpredictable behavior**: Users couldn't rely on when features would work
3. **Redundant**: CPU budget checks already prevent throttling

The new approach with rolling index and CPU budget checks provides:
- ✅ **Predictable execution**: All processes eventually run
- ✅ **Fair scheduling**: Lower priority processes aren't starved
- ✅ **CPU protection**: Budget checks prevent throttling
- ✅ **Simpler logic**: Fewer edge cases and special behaviors

## Managing CPU Usage

Since bucket mode no longer filters processes, manage CPU through:

1. **Process Intervals**: Set longer intervals for non-critical processes
2. **Process Priorities**: Higher priority processes execute first
3. **CPU Budgets**: Each process has a CPU budget limit
4. **Room Count**: Reduce active rooms if CPU usage is too high
5. **Optimization**: Profile and optimize expensive processes

## How to Manage Low Bucket

### Short Term (If Bucket Stays Low)

1. **Reduce room count** - Unclaim excess rooms temporarily
2. **Disable visualizations** - Set `visualizations: false` in config
3. **Disable profiling** - Set `profiling: false` in config
4. **Increase process intervals** - Make non-critical processes run less frequently

### Long Term (Optimize CPU Usage)

1. **Optimize pathfinding** - Enable path caching (ROADMAP Section 20)
2. **Reduce creep count** - Tune spawn priorities to match your CPU
3. **Optimize room processing** - Profile CPU usage per room
4. **Spread operations** - Use `computationScheduler` for expensive tasks
5. **Review ROADMAP.md** - Follow CPU budget guidelines (eco rooms ≤ 0.1 CPU)

## Process Priority Reference

Process priorities determine execution order (higher runs first):

### CRITICAL (100)
- Movement finalization
- Critical room operations

### HIGH (75)
- Room management
- Creep execution
- Spawn coordination

### MEDIUM (50)
- Empire management
- Cluster coordination
- Terminal operations

### LOW (25)
- Market operations
- Power bank harvesting
- Expansion planning

### IDLE (10)
- Visualizations
- Statistics collection

**Note**: Unlike before, lower priority processes still execute - they just run after higher priority ones. With the rolling index, they're guaranteed to eventually get CPU time.

## Monitoring Bucket and CPU

### Console Commands

```javascript
// Check current bucket mode (informational only)
kernel.getBucketMode()

// See all registered processes
kernel.getProcesses().map(p => `${p.name}: ${p.priority}`)

// Check which processes ran this tick
kernel.getProcesses().filter(p => p.stats.lastRunTick === Game.time)

// Check processes skipped due to intervals (not bucket)
kernel.getSkippedProcessesThisTick()
```

### Grafana Dashboards

If you have Grafana configured, monitor:
- `screeps_cpu_bucket` - Bucket level over time (informational)
- `screeps_processes_run` - Processes executed per tick
- `screeps_processes_skipped` - Processes skipped due to intervals
- `screeps_cpu_used` - Actual CPU usage vs limit

## FAQ

**Q: What happens when bucket is low?**
A: Nothing different - all processes still run in priority order. CPU budget checks prevent throttling.

**Q: Why track bucket mode if it doesn't affect execution?**
A: For monitoring and metrics. Low bucket indicates high CPU usage, which helps identify optimization needs.

**Q: Will low priority processes ever run if CPU is constantly high?**
A: Yes! The rolling index ensures they execute eventually. They might run less frequently, but they won't be completely blocked.

**Q: How do I ensure a process always runs?**
A: Set high priority and a short interval (like 1 tick). But be aware this increases CPU usage.

**Q: Can I re-enable bucket-based filtering?**
A: Not recommended. The rolling index + CPU budget approach is more predictable and fair.

**Q: What if I hit CPU throttling?**
A: The CPU budget checks should prevent this, but if it happens, reduce room count or optimize expensive processes.

## Troubleshooting

### CPU usage too high / bucket dropping

1. Check process CPU usage: `kernel.getProcesses().map(p => ({ name: p.name, cpu: p.stats.avgCpu }))`
2. Reduce room count or creep count
3. Increase intervals for non-critical processes
4. Profile and optimize expensive processes

### Some processes not running

1. Check intervals: Processes might be scheduled to run infrequently
2. Check suspension: `kernel.getProcesses().filter(p => p.state === 'suspended')`
3. Check CPU budget exhaustion: Look for "CPU budget exhausted" logs
4. Verify process registration: `kernel.getProcesses().length > 0`

### Want to know execution order

Processes execute in this order:
1. Sorted by priority (CRITICAL → HIGH → MEDIUM → LOW → IDLE)
2. Within same priority, order is deterministic but may vary
3. Rolling index resumes from where it left off each tick

## See Also

- [ROADMAP.md](../../ROADMAP.md) - CPU budget guidelines and architecture
- [LOGGING.md](../../LOGGING.md) - Log format and querying
- [src/core/kernel.ts](src/core/kernel.ts) - Kernel implementation with rolling index
- [src/config/index.ts](src/config/index.ts) - Configuration options

## Migration Note

If you're upgrading from an older version that used bucket-based filtering:
- Bucket modes are now informational only
- All processes attempt to run regardless of bucket level
- CPU budget checks and rolling index provide protection against throttling
- You may see different processes running when bucket is low - this is expected
- Monitor CPU usage and adjust process intervals/priorities as needed
