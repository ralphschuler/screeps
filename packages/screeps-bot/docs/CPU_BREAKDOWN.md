# CPU Breakdown and Stats System

## Overview

The bot's stats system now provides comprehensive CPU tracking at multiple levels:
- **Per-process**: Individual kernel processes (empire manager, market manager, room processes, creep processes, etc.)
- **Per-room**: CPU usage for each owned room
- **Per-creep**: CPU usage for individual creeps
- **Per-subsystem**: High-level subsystems (kernel, spawns, moveRequests, etc.)

## Understanding the "kernel" Subsystem

The "kernel" subsystem in the stats represents the **total CPU used by all kernel processes combined**. This includes:
- All creep processes (one per creep)
- All room processes (one per room)
- Empire manager processes (expansion, market, nuke, power bank, etc.)
- Cluster manager processes (pheromone diffusion, cluster coordination, etc.)
- Core processes (memory cleanup, pixel generation, etc.)

**Important**: The kernel measurement is NOT overhead - it's the sum of all the processes it executes. To see the breakdown of what's using CPU within the kernel, use the per-process stats.

## Accessing CPU Breakdown

### In-Game Console Command

```javascript
// Show all CPU breakdowns
cpuBreakdown()

// Show only process breakdown
cpuBreakdown('process')

// Show only room breakdown
cpuBreakdown('room')

// Show only creep breakdown (top 10)
cpuBreakdown('creep')

// Show only subsystem breakdown
cpuBreakdown('subsystem')
```

### In Memory.stats

All stats are stored in `Memory.stats` in a nested structure:

```javascript
{
  tick: number,
  cpu: { used, limit, bucket, percent, heap_mb },
  
  // Individual kernel processes
  processes: {
    [processId]: {
      name: "Empire Manager",
      avg_cpu: 2.5,
      max_cpu: 5.0,
      run_count: 100,
      // ... more fields
    }
  },
  
  // Individual creeps
  creeps: {
    [creepName]: {
      role: "harvester",
      cpu: 0.15,
      current_room: "W1N1",
      // ... more fields
    }
  },
  
  // Rooms
  rooms: {
    [roomName]: {
      profiler: {
        avg_cpu: 3.2,
        peak_cpu: 6.5
      },
      // ... more fields
    }
  },
  
  // Subsystems
  subsystems: {
    kernel: { avg_cpu: 35.0 },    // Sum of all kernel processes
    spawns: { avg_cpu: 0.5 },
    moveRequests: { avg_cpu: 1.2 },
    // ... more
  }
}
```

## Grafana Dashboard Integration

The graphite exporter automatically flattens the nested structure into Grafana-compatible metrics:

- `stats.processes.empire_manager.avg_cpu`
- `stats.creeps.Harvester1.cpu`
- `stats.rooms.W1N1.profiler.avg_cpu`
- `stats.subsystems.kernel.avg_cpu`

You can create Grafana dashboards with:
- Time series graphs showing CPU trends per process
- Tables showing top CPU-consuming creeps
- Heatmaps of room CPU usage
- Stacked graphs showing subsystem breakdown

## Investigating High CPU Usage

### Step 1: Identify the Problem Area

```javascript
cpuBreakdown()
```

Look at which category shows high CPU:
- If **processes** are high: Check which specific processes (e.g., empire manager, specific room processes)
- If **rooms** are high: Check which rooms are using the most CPU
- If **creeps** are high: Check if specific creep roles or individual creeps are expensive

### Step 2: Drill Down

```javascript
// For process details
cpuBreakdown('process')

// For room details
cpuBreakdown('room')

// For creep details (shows top 10)
cpuBreakdown('creep')
```

### Step 3: Review Process Configuration

Each kernel process has:
- `frequency`: How often it runs (high, medium, low)
- `priority`: When it runs (CRITICAL, HIGH, MEDIUM, LOW, IDLE)
- `cpu_budget`: Maximum CPU fraction allocated
- `min_bucket`: Minimum bucket required to run

If a process is using too much CPU:
1. Check if it needs to run less frequently
2. Check if its CPU budget should be reduced
3. Check if it should require a higher bucket to run
4. Look at the process code to optimize it

## Common CPU Issues and Solutions

### Issue: "kernel" shows 40 CPU but individual processes show low CPU

**Solution**: The kernel measurement includes:
- All registered processes (check `kernel.getProcesses()`)
- Creep processes (one per creep, multiplied by creep count)
- Room processes (one per room)

Sum up all process CPU from the per-process breakdown to see the total. If there's a discrepancy, it may be due to:
- Process overhead (process scheduling, bucket checks, etc.)
- Measurement timing (kernel measurement includes all subprocess execution)

### Issue: High CPU from creep processes

**Solution**: If you have many creeps (e.g., 100+ creeps), each creep process adds overhead:
- Optimize creep logic to do less per tick
- Consider disabling per-creep CPU tracking in production
- Use role-level optimizations rather than per-creep optimizations

### Issue: Empire manager or cluster manager using too much CPU

**Solution**: These managers run complex logic:
- Check their frequency configuration (they may run too often)
- Consider increasing their min_bucket requirement
- Profile the specific manager code to find bottlenecks

## Performance Optimization Tips

1. **Use the stats to identify hotspots** - Don't optimize blindly
2. **Check process frequency** - Low-priority processes should run infrequently
3. **Monitor bucket levels** - Processes won't run if bucket is low
4. **Review the process list** - Ensure no duplicate or unnecessary processes
5. **Optimize expensive operations** - PathFinder, room scanning, memory access

## Stats Collection Overhead

The stats collection itself has a small overhead:
- Per-process stats: ~0.01 CPU per process
- Per-creep stats: ~0.005 CPU per creep
- Per-room stats: ~0.05 CPU per room

For a typical bot with:
- 50 processes
- 100 creeps
- 5 rooms

Stats collection overhead: ~1.5 CPU per tick

You can disable stats collection if needed:
```javascript
unifiedStats.setEnabled(false)
```
