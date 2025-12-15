# Bucket Management and Process Execution

## Overview

The SwarmBot uses the CPU bucket as an indicator of CPU health for monitoring purposes only. The kernel **does not throttle or filter processes based on bucket level**. Instead, the kernel uses:
- **Full CPU utilization**: Uses the configured targetCpuUsage (default 98%) regardless of bucket level
- **Rolling index process execution**: Ensures all processes get their turn even under CPU pressure
- **CPU budget checks**: Stops execution when CPU limit is reached, picking up where it left off next tick
- **Priority-based ordering**: Higher priority processes execute first in the queue

This approach ensures the bot continues to function normally even when bucket is low, maximizing productivity and preventing bucket-related starvation of critical operations.

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

The kernel tracks bucket modes for monitoring and metrics purposes only. **These modes do not affect CPU limits or which processes run**. All processes attempt to run with the full configured CPU limit regardless of bucket level:

### Critical Mode (Bucket < 500)
- **Status indicator only** - full CPU limit still available
- **Purpose**: Shows bucket is critically low in logs/metrics
- **Effect on CPU**: None - uses full targetCpuUsage (98%)

### Low Mode (Bucket < 2000)
- **Status indicator only** - full CPU limit still available
- **Purpose**: Shows bucket is below optimal level
- **Effect on CPU**: None - uses full targetCpuUsage (98%)

### Normal Mode (Bucket 2000-9000)
- **Status indicator only** - full CPU limit still available
- **Purpose**: Standard operation indicator
- **Effect on CPU**: None - uses full targetCpuUsage (98%)

### High Mode (Bucket > 9000)
- **Status indicator only** - full CPU limit still available
- **Purpose**: Shows bucket is at healthy level
- **Effect on CPU**: None - uses full targetCpuUsage (98%)

**Note**: Individual processes can check `kernel.getBucketMode()` if they want to skip expensive optional operations (like pre-computation, layout planning) when bucket is low, but this is opt-in per process, not enforced by the kernel.

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

Previously, the bot would reduce the CPU limit when bucket was low (to 30% in critical mode, 50% in low mode). This approach had issues:

1. **Over-throttling**: Reducing CPU to 30-50% caused severe performance degradation
2. **Bucket spiral**: Using less CPU meant bucket recovered slower, prolonging the throttling
3. **Starvation**: Critical processes might not run due to artificially low CPU limit
4. **Unpredictable behavior**: Bot would switch between normal and throttled modes unpredictably

The new approach with full CPU utilization regardless of bucket mode provides:
- ✅ **Consistent performance**: Bot always uses full CPU capacity
- ✅ **Faster recovery**: Using full CPU means more productive work, less time throttled
- ✅ **Predictable execution**: All processes eventually run at normal intervals
- ✅ **Simpler logic**: No complex bucket-based throttling calculations

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
A: The bot continues to function normally using full CPU limit. Bucket mode is tracked for monitoring only.

**Q: Why track bucket mode if it doesn't affect CPU limit?**
A: For monitoring and metrics. Low bucket indicates high sustained CPU usage, which helps identify optimization needs. Individual processes can also check bucket mode to skip expensive optional operations.

**Q: Won't using full CPU when bucket is low make it drain faster?**
A: No - the bucket drains when you exceed your CPU limit and regenerates when you're below it. Using the full CPU limit doesn't make the bucket drain faster - it just means we're doing more productive work per tick. This can actually help with faster bucket recovery because more efficient work completion may reduce CPU usage in future ticks.

**Q: Will low priority processes ever run if CPU is constantly high?**
A: Yes! The rolling index ensures they execute eventually. They might run less frequently, but they won't be completely blocked.

**Q: How do I ensure a process always runs?**
A: Set high priority and a short interval (like 1 tick). But be aware this increases CPU usage.

**Q: Can I make my process skip expensive operations when bucket is low?**
A: Yes! Call `kernel.getBucketMode()` in your process and skip optional expensive operations when mode is "critical" or "low". But this is opt-in, not enforced by the kernel.

**Q: What if I hit CPU throttling?**
A: The CPU budget checks should prevent this. If throttling happens, reduce room count, optimize expensive processes, or increase process intervals.

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

If you're upgrading from an older version:
- **CPU limit is no longer reduced based on bucket mode** - the bot now uses full CPU even when bucket is low
- Bucket modes are now informational only and don't affect CPU limits
- All processes attempt to run with full CPU budget regardless of bucket level
- CPU budget checks and rolling index provide protection against throttling
- You may notice better performance when bucket is low - this is expected and intentional
- Monitor CPU usage and adjust process intervals/priorities as needed
- If you want bucket-aware behavior, implement it in your individual processes by checking `kernel.getBucketMode()`
