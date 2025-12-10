# Stats and Metrics System Guide

## Overview

The SwarmBot uses a unified statistics system to track all aspects of bot performance, resource usage, and operational metrics. Statistics are output to the console in JSON format for the graphite exporter to parse, and are also stored in `Memory.stats` for backward compatibility.

## Architecture

The stats system is implemented in `src/core/unifiedStats.ts` and provides:
- **Console output**: Stats are output as JSON to console for real-time export to Grafana
- **Zero-cost abstraction**: Stats collection can be disabled without code changes
- **Clean data structure**: No flattening - raw object hierarchy preserved
- **Automatic collection**: Most stats are collected automatically during finalization
- **Configurable**: Smoothing factors, logging intervals, and tracking features are configurable

## Stats Export Modes

The system supports two export modes:

### 1. Console Output (Primary Method)
Stats are output to console as JSON objects in the format:
```json
{"type": "stat", "key": "stats.cpu.used", "value": 15.5}
```

This format is parsed by the graphite exporter's console listener, which subscribes to the Screeps console stream. This is the recommended method as it:
- Provides real-time stats updates
- Doesn't require polling the Screeps API
- Respects API rate limits
- Has lower latency

### 2. Memory Polling (Backward Compatibility)
Stats are also written to `Memory.stats` in a nested object structure. The graphite exporter can poll this via the Screeps API, but this method:
- Has API rate limits (1440 requests/day for `/api/user/memory`)
- Has higher latency (polling interval)
- May miss rapid changes between polls

## Statistics Categories

### 1. Empire Statistics

Empire-level metrics provide a bird's-eye view of your entire operation.

**Location**: `Memory.stats.empire`

**Fields**:
- `ownedRooms` (number): Total number of owned rooms
- `totalCreeps` (number): Total number of living creeps
- `totalStorageEnergy` (number): Sum of energy in all storage structures
- `gclProgress` (number): Current GCL progress points
- `gcl` (number): Current GCL level
- `gpl` (number): Current GPL level
- `cpuUsed` (number): CPU used this tick
- `cpuLimit` (number): CPU limit for this account
- `cpuBucket` (number): Current CPU bucket level
- `heapUsed` (number): Heap memory used (MB)
- `credits` (number): Total credits available
- `rooms` (string[]): List of owned room names

**Usage**:
```javascript
const stats = statsManager.getStats();
console.log(`Empire: ${stats.empire.ownedRooms} rooms, ${stats.empire.totalCreeps} creeps`);
console.log(`CPU: ${stats.empire.cpuUsed.toFixed(2)}/${stats.empire.cpuLimit}`);
console.log(`Bucket: ${stats.empire.cpuBucket}/10000`);
```

**When Updated**: Automatically during `updateEmpireStats()` call, typically once per tick.

---

### 2. Subsystem Statistics

Track CPU usage and call frequency for each major subsystem (e.g., rooms, creeps, spawns, defense, market).

**Location**: `Memory.stats.subsystems`

**Structure**:
```typescript
{
  [subsystemName: string]: {
    avgCpu: number;      // Exponentially smoothed average CPU
    peakCpu: number;     // Maximum CPU seen
    calls: number;       // Number of calls this tick
    samples: number;     // Total samples collected
  }
}
```

**Usage**:
```javascript
// Record subsystem execution
const startCpu = Game.cpu.getUsed();
runRoomLogic(room);
const cpuUsed = Game.cpu.getUsed() - startCpu;
statsManager.recordSubsystem("RoomLogic", cpuUsed, 1);
```

**When Updated**: Manually via `recordSubsystem()` calls in your code.

---

### 3. Role Statistics (Enhanced)

Aggregated statistics for each creep role, including spawning/idle/active counts and body part totals.

**Location**: `Memory.stats.roles`

**Structure**:
```typescript
{
  [roleName: string]: {
    count: number;            // Total creeps with this role
    avgCpu: number;           // Average CPU per creep
    peakCpu: number;          // Peak CPU for any creep
    calls: number;            // Total calls this tick
    samples: number;          // Total samples
    spawningCount: number;    // Number currently spawning
    idleCount: number;        // Number idle/not working
    activeCount: number;      // Number actively working
    avgTicksToLive: number;   // Average TTL across all creeps
    totalBodyParts: number;   // Total body parts across role
  }
}
```

**Usage**:
```javascript
// Manually record role stats with enhanced metrics
statsManager.recordRole("harvester", 5, 0.8, 5, {
  spawningCount: 1,
  idleCount: 1,
  activeCount: 3,
  avgTicksToLive: 1400,
  totalBodyParts: 15
});

// Or let finalizeTick() automatically calculate from all creeps
statsManager.finalizeTick(); // Automatically aggregates role stats
```

**When Updated**: 
- Manually via `recordRole()` for CPU tracking
- Automatically during `finalizeTick()` for counts and metrics

---

### 4. Per-Creep Statistics

Individual statistics for every living creep, useful for debugging and detailed analysis.

**Location**: `Memory.stats.creeps`

**Structure**:
```typescript
{
  [creepName: string]: {
    name: string;           // Creep name
    role: string;           // Creep role
    homeRoom: string;       // Home room
    currentRoom: string;    // Current location
    cpu: number;            // CPU used this tick
    action: string;         // Current action/state
    ticksToLive: number;    // Remaining lifespan
    hits: number;           // Current hits
    hitsMax: number;        // Maximum hits
    bodyParts: number;      // Total body parts
    fatigue: number;        // Current fatigue
    actionsThisTick: number; // Actions performed
  }
}
```

**Usage**:
```javascript
// Record individual creep stats
const startCpu = Game.cpu.getUsed();
runCreepLogic(creep);
const cpuUsed = Game.cpu.getUsed() - startCpu;
statsManager.recordCreep(creep, cpuUsed, "harvesting", 2);

// Access creep stats
const stats = statsManager.getStats();
const harvester1Stats = stats.creeps["harvester1"];
console.log(`${harvester1Stats.name} in ${harvester1Stats.currentRoom}: ${harvester1Stats.action}`);
```

**When Updated**: 
- Manually via `recordCreep()` for CPU tracking
- Automatically during `finalizeTick()` for basic metrics

---

### 5. Room Statistics

Per-room operational metrics including energy, creeps, hostiles, and danger levels.

**Location**: `Memory.stats.rooms`

**Structure**:
```typescript
{
  [roomName: string]: {
    name: string;                   // Room name
    rcl: number;                    // Controller level
    energyAvailable: number;        // Energy currently available
    energyCapacity: number;         // Max energy capacity
    storageEnergy: number;          // Energy in storage
    creepCount: number;             // Creeps in this room
    hostileCount: number;           // Hostile creeps detected
    avgCpu: number;                 // Average CPU for room
    peakCpu: number;                // Peak CPU for room
    controllerProgress: number;     // Controller progress
    controllerProgressTotal: number; // Total progress needed
    energyHarvested: number;        // Energy harvested (rolling avg)
    damageReceived: number;         // Damage from hostiles (rolling avg)
    danger: number;                 // Danger level (0-3)
  }
}
```

**Usage**:
```javascript
// Record room stats
statsManager.recordRoom(room, 0.5, 0.7, {
  energyHarvested: 150,
  damageReceived: 0,
  danger: 0
});
```

**When Updated**: Manually via `recordRoom()` calls, typically in room manager.

---

### 6. Pheromone Statistics

Pheromone levels and intent for each room, showing the swarm's emergent coordination state.

**Location**: `Memory.stats.pheromones`

**Structure**:
```typescript
{
  [roomName: string]: {
    room: string;          // Room name
    expand: number;        // Expansion pheromone (0-100)
    harvest: number;       // Harvesting pheromone
    build: number;         // Building pheromone
    upgrade: number;       // Upgrading pheromone
    defense: number;       // Defense pheromone
    war: number;           // War pheromone
    siege: number;         // Siege pheromone
    logistics: number;     // Logistics pheromone
    dominant: string | null; // Dominant pheromone type
    intent: string;        // Room intent/posture
  }
}
```

**Usage**:
```javascript
// Record pheromone stats
const swarm = memoryManager.getSwarmState(room.name);
statsManager.recordPheromones(
  room.name,
  swarm.pheromones,
  swarm.posture,
  pheromoneManager.getDominantPheromone(swarm.pheromones)
);
```

**When Updated**: Manually via `recordPheromones()`, typically after pheromone updates.

**See Also**: [PHEROMONES_GUIDE.md](./PHEROMONES_GUIDE.md) for detailed pheromone system documentation.

---

### 7. Native Calls Statistics

Track how many times native Screeps API methods are called per tick.

**Location**: `Memory.stats.nativeCalls`

**Tracked Calls**:
- `pathfinderSearch`: PathFinder.search() calls
- `moveTo`: creep.moveTo() calls
- `move`: creep.move() calls
- `harvest`: creep.harvest() calls
- `transfer`: creep.transfer() calls
- `withdraw`: creep.withdraw() calls
- `build`: creep.build() calls
- `repair`: creep.repair() calls
- `upgradeController`: creep.upgradeController() calls
- `attack`: creep.attack() calls
- `rangedAttack`: creep.rangedAttack() calls
- `heal`: creep.heal() calls
- `dismantle`: creep.dismantle() calls
- `say`: creep.say() calls
- `total`: Sum of all calls

**Usage**:
```javascript
// Recording is typically done automatically via wrapper functions
// But can be done manually:
statsManager.recordNativeCall("harvest");
statsManager.recordNativeCall("transfer");

// Access stats
const stats = statsManager.getStats();
console.log(`Total native calls: ${stats.nativeCalls.total}`);
console.log(`PathFinder calls: ${stats.nativeCalls.pathfinderSearch}`);
```

**When Updated**: Manually via `recordNativeCall()` or via automatic tracking wrappers.

---

### 8. Kernel Process Statistics

Statistics for each registered kernel process, tracking CPU usage, execution frequency, and errors.

**Location**: `Memory.stats.processes`

**Structure**:
```typescript
{
  [processId: string]: {
    id: string;           // Process ID
    name: string;         // Display name
    priority: number;     // Process priority
    frequency: string;    // Frequency tier (high/medium/low)
    state: string;        // Current state
    totalCpu: number;     // Total CPU used
    runCount: number;     // Times executed
    avgCpu: number;       // Average CPU per run
    maxCpu: number;       // Peak CPU usage
    lastRunTick: number;  // Last execution tick
    skippedCount: number; // Times skipped due to CPU
    errorCount: number;   // Number of errors
    cpuBudget: number;    // Allocated CPU budget
    minBucket: number;    // Minimum bucket to run
  }
}
```

**Usage**:
```javascript
// Collect all process stats from kernel
import { kernel } from "./core/kernel";
statsManager.collectProcessStats(kernel.getProcesses());

// Or record individual process
statsManager.recordProcess({
  id: "roomRunner_W1N1",
  name: "Room Runner: W1N1",
  priority: 75,
  frequency: "high",
  state: "idle",
  cpuBudget: 0.1,
  minBucket: 1000,
  stats: {
    totalCpu: 5.5,
    runCount: 100,
    avgCpu: 0.055,
    maxCpu: 0.15,
    lastRunTick: 12345,
    skippedCount: 5,
    errorCount: 0
  }
});
```

**When Updated**: Via `collectProcessStats()` or `recordProcess()`, typically at end of tick.

---

## Configuration

The stats system can be configured when creating the StatsManager:

```javascript
import { StatsManager } from "./core/stats";

const statsManager = new StatsManager({
  enabled: true,                // Enable/disable stats collection
  smoothingFactor: 0.1,         // EMA smoothing (0.0-1.0)
  trackNativeCalls: true,       // Track native API calls
  logInterval: 100              // Log summary every N ticks (0 = never)
});
```

### Key Configuration Options

- **enabled**: Set to `false` to completely disable stats collection (zero CPU overhead)
- **smoothingFactor**: Controls exponential moving average smoothing (lower = slower adaptation)
- **trackNativeCalls**: Track native Screeps API call frequency
- **logInterval**: How often to log a stats summary to console

---

## Usage Patterns

### Pattern 1: Basic Subsystem Tracking

```javascript
function runMySubsystem() {
  const startCpu = Game.cpu.getUsed();
  
  // Your subsystem logic here
  doWork();
  
  const cpuUsed = Game.cpu.getUsed() - startCpu;
  statsManager.recordSubsystem("MySubsystem", cpuUsed, 1);
}
```

### Pattern 2: Role-Based Tracking

```javascript
function runAllCreeps() {
  const roleGroups = _.groupBy(Game.creeps, c => c.memory.role);
  
  for (const [role, creeps] of Object.entries(roleGroups)) {
    const startCpu = Game.cpu.getUsed();
    
    for (const creep of creeps) {
      runCreepRole(creep);
    }
    
    const cpuUsed = Game.cpu.getUsed() - startCpu;
    statsManager.recordRole(role, creeps.length, cpuUsed / creeps.length, creeps.length);
  }
}
```

### Pattern 3: Detailed Per-Creep Tracking

```javascript
function runCreep(creep) {
  const startCpu = Game.cpu.getUsed();
  
  const action = runCreepLogic(creep);
  
  const cpuUsed = Game.cpu.getUsed() - startCpu;
  statsManager.recordCreep(creep, cpuUsed, action, 1);
}
```

### Pattern 4: Automatic Collection

```javascript
// In your main loop
export function loop() {
  // Initialize stats for new tick
  statsManager.reset(); // Optional: only if you want to clear old data
  
  // Run your bot logic
  runRooms();
  runCreeps();
  runSpawns();
  
  // Update empire stats
  statsManager.updateEmpireStats();
  
  // Collect kernel process stats
  statsManager.collectProcessStats(kernel.getProcesses());
  
  // Finalize tick - automatically collects creep stats, role stats, etc.
  statsManager.finalizeTick();
}
```

---

## Exporting to Grafana

### Using Console Output (Recommended)

The graphite exporter should be configured to use console mode:

**In the exporter's `.env` file:**
```bash
EXPORTER_MODE=console
```

The exporter will:
1. Connect to the Screeps console via WebSocket
2. Subscribe to console events
3. Parse JSON stat lines in the format `{"type": "stat", "key": "metric.name", "value": 123}`
4. Send metrics to Grafana Cloud Graphite

### Using Memory Polling (Legacy)

Alternatively, the exporter can poll `Memory.stats`:

**In the exporter's `.env` file:**
```bash
EXPORTER_MODE=memory
EXPORTER_POLL_INTERVAL_MS=90000  # 90 seconds (respects API rate limits)
```

The exporter will:
1. Poll the Screeps API for `Memory.stats`
2. Flatten nested objects into dot-separated keys
3. Send metrics to Grafana Cloud Graphite

For detailed Grafana integration examples, see:
- [GRAFANA_DASHBOARD_EXAMPLE.md](./GRAFANA_DASHBOARD_EXAMPLE.md)
- [STATS_SYSTEM_OVERVIEW.md](./STATS_SYSTEM_OVERVIEW.md)
- [Graphite Exporter README](../packages/screeps-graphite-exporter/README.md)

---

## Performance Considerations

### CPU Cost
- **Enabled**: ~0.5-1 CPU per tick for full stats collection
- **Disabled**: Near-zero CPU (all methods return early)
- **Selective tracking**: Disable `trackNativeCalls` to save ~0.1-0.2 CPU

### Memory Cost
- Stats typically use 10-50 KB depending on empire size
- Per-creep stats: ~200 bytes per creep
- Per-process stats: ~150 bytes per process
- Historical data is NOT stored (only current tick)

### Optimization Tips
1. **Disable in production**: Set `enabled: false` when stats aren't needed
2. **Increase log interval**: Set higher values (e.g., 500) or 0 to reduce logging
3. **Selective tracking**: Only track what you need (disable native calls if not used)
4. **Sample rates**: Implement sampling for high-frequency operations

---

## API Reference

### StatsManager Methods

#### `recordSubsystem(name: string, cpu: number, calls?: number): void`
Record CPU usage for a subsystem.

#### `recordRole(role: string, count: number, cpu: number, calls?: number, metrics?: {...}): void`
Record statistics for a role with optional enhanced metrics.

#### `recordRoom(room: Room, avgCpu: number, peakCpu: number, metrics?: {...}): void`
Record room statistics with optional metrics like energy harvested.

#### `recordCreep(creep: Creep, cpu: number, action: string, actionsCount?: number): void`
Record individual creep statistics.

#### `recordPheromones(roomName: string, pheromones: {...}, intent: string, dominant: string | null): void`
Record pheromone statistics for a room.

#### `recordNativeCall(type: string): void`
Record a native API call.

#### `recordProcess(process: {...}): void`
Record kernel process statistics.

#### `collectProcessStats(processes: Map<string, any>): void`
Collect all kernel process statistics from a process map.

#### `updateEmpireStats(): void`
Update empire-level statistics.

#### `finalizeTick(): void`
Finalize the tick - collect automatic stats and prepare for next tick.

#### `getStats(): StatsRoot`
Get the complete stats object.

#### `reset(): void`
Reset all statistics (rarely needed).

#### `setEnabled(enabled: boolean): void`
Enable or disable stats collection.

---

## See Also

- [PHEROMONES_GUIDE.md](./PHEROMONES_GUIDE.md) - Detailed pheromone system documentation
- [GAME_VARIABLES.md](./GAME_VARIABLES.md) - Game constants and variables reference
- [STATS_SYSTEM_OVERVIEW.md](./STATS_SYSTEM_OVERVIEW.md) - High-level stats system overview
- [GRAFANA_DASHBOARD_EXAMPLE.md](./GRAFANA_DASHBOARD_EXAMPLE.md) - Grafana dashboard setup

---

## Troubleshooting

### Stats not updating
- Ensure `statsManager.finalizeTick()` is called at end of main loop
- Check that `enabled: true` in configuration
- Verify stats collection methods are being called

### High CPU usage
- Disable `trackNativeCalls` if not needed
- Reduce `logInterval` or set to 0
- Consider disabling stats entirely in production

### Missing data
- Per-creep CPU tracking requires manual `recordCreep()` calls
- Process stats require `collectProcessStats()` call
- Empire stats require `updateEmpireStats()` call

### Memory overflow
- Stats use only current tick data (no history)
- If memory is critical, disable stats or reduce creep count
- Consider exporting to external storage instead
