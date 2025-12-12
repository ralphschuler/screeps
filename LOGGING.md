# Logging System - Loki-Compatible JSON Output

## Overview

The Screeps bot's logging system has been refactored to output **single-line JSON objects** optimized for Loki ingestion. Every log includes the current game tick for traceability, enabling powerful time-based querying and filtering in Grafana.

## Key Features

- **Single-line JSON output** - Each log is a complete JSON object on one line
- **Automatic tick tracking** - Every log includes `tick: Game.time` for traceability
- **Rich metadata support** - Attach context like subsystem, room, creep, process ID
- **Flexible meta fields** - Add arbitrary key-value pairs for debugging
- **Log level filtering** - DEBUG, INFO, WARN, ERROR levels
- **Stat logging** - Dedicated format for metrics and statistics

## Log Format

### Standard Log Entry

```json
{
  "type": "log",
  "level": "INFO",
  "message": "Bot initialized",
  "tick": 12345,
  "subsystem": "SwarmBot",
  "room": "W1N1",
  "creep": "harvester1",
  "processId": "proc_123",
  "customField": "customValue"
}
```

### Stat Entry

```json
{
  "type": "stat",
  "key": "energy.harvested",
  "value": 1000,
  "tick": 12347,
  "unit": "energy",
  "subsystem": "Economy",
  "room": "W1N1"
}
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Log type: "log" or "stat" |
| `level` | string | Yes (logs) | Log level: DEBUG, INFO, WARN, ERROR |
| `message` | string | Yes (logs) | Human-readable log message |
| `tick` | number | Yes | Game tick when log was generated |
| `subsystem` | string | No | Component generating the log (e.g., "Kernel", "Movement", "Spawns") |
| `room` | string | No | Room name if log is room-specific |
| `creep` | string | No | Creep name if log is creep-specific |
| `processId` | string | No | Process ID if log is process-specific |
| `key` | string | Yes (stats) | Stat key/metric name |
| `value` | number | Yes (stats) | Stat value |
| `unit` | string | No (stats) | Unit of measurement |
| `meta.*` | any | No | Additional metadata fields (flattened into log object) |

## Usage Examples

### Basic Logging

```typescript
import { logger } from "./core/logger";

// Simple info log
logger.info("Starting spawn cycle");
// Output: {"type":"log","level":"INFO","message":"Starting spawn cycle","tick":12345}

// Log with subsystem
logger.info("Starting spawn cycle", { subsystem: "Spawns" });
// Output: {"type":"log","level":"INFO","message":"Starting spawn cycle","tick":12345,"subsystem":"Spawns"}

// Log with room context
logger.info("Energy full", { subsystem: "Economy", room: "W1N1" });
// Output: {"type":"log","level":"INFO","message":"Energy full","tick":12345,"subsystem":"Economy","room":"W1N1"}
```

### Advanced Logging with Metadata

```typescript
// Log with multiple context fields
logger.warn("Creep stuck", { 
  subsystem: "Movement", 
  room: "W1N1", 
  creep: "harvester1",
  meta: {
    position: "25,25",
    stuckCount: 5,
    lastMove: 12340
  }
});
// Output: {"type":"log","level":"WARN","message":"Creep stuck","tick":12345,"subsystem":"Movement","room":"W1N1","creep":"harvester1","position":"25,25","stuckCount":5,"lastMove":12340}

// Performance warning with CPU data
logger.warn("Heavy pathfinding CPU", {
  subsystem: "Movement",
  creep: "hauler2",
  meta: {
    cpuUsed: 15.5,
    pathLength: 120,
    origin: "W1N1",
    destination: "W2N2"
  }
});
```

### Error Logging

```typescript
try {
  riskyOperation();
} catch (error) {
  logger.error(`Operation failed: ${String(error)}`, {
    subsystem: "MySubsystem",
    room: "W1N1",
    meta: {
      stack: error instanceof Error ? error.stack : undefined,
      operationType: "risky"
    }
  });
}
```

### Stat Logging

```typescript
// Simple stat
logger.stat("energy.harvested", 1000);
// Output: {"type":"stat","key":"energy.harvested","value":1000,"tick":12345}

// Stat with unit and context
logger.stat("energy.harvested", 1000, "energy", {
  subsystem: "Economy",
  room: "W1N1"
});
// Output: {"type":"stat","key":"energy.harvested","value":1000,"tick":12345,"unit":"energy","subsystem":"Economy","room":"W1N1"}

// Performance stat
logger.stat("cpu.kernel", 5.2, "cpu", {
  subsystem: "Kernel",
  meta: { processCount: 45 }
});
```

### Scoped Logger

Create a scoped logger for a subsystem to avoid repeating the subsystem name:

```typescript
import { createLogger } from "./core/logger";

const myLogger = createLogger("MySubsystem");

// All logs automatically include subsystem
myLogger.info("Task started");
// Output: {"type":"log","level":"INFO","message":"Task started","tick":12345,"subsystem":"MySubsystem"}

myLogger.warn("Task slow", { room: "W1N1", meta: { duration: 15.5 } });
// Output: {"type":"log","level":"WARN","message":"Task slow","tick":12345,"subsystem":"MySubsystem","room":"W1N1","duration":15.5}
```

## Configuration

```typescript
import { configureLogger, LogLevel } from "./core/logger";

// Set log level (filters out lower priority logs)
configureLogger({
  level: LogLevel.INFO,  // DEBUG, INFO, WARN, ERROR, NONE
  cpuLogging: true       // Enable CPU measurement utilities
});
```

### Log Levels

- `DEBUG` (0) - Detailed debugging information
- `INFO` (1) - General informational messages
- `WARN` (2) - Warning messages for potential issues
- `ERROR` (3) - Error messages for failures
- `NONE` (4) - Disable all logging

## Loki Query Examples

With single-line JSON logs, you can use LogQL queries in Grafana:

```logql
# All logs from a specific tick
{job="screeps"} | json | tick="12345"

# All warnings and errors
{job="screeps"} | json | level=~"WARN|ERROR"

# All logs from Movement subsystem
{job="screeps"} | json | subsystem="Movement"

# All logs for a specific room
{job="screeps"} | json | room="W1N1"

# All logs for a specific creep
{job="screeps"} | json | creep="harvester1"

# CPU warnings with high usage
{job="screeps"} | json | level="WARN" | subsystem="Movement" | cpuUsed > 10

# All stats for energy harvesting
{job="screeps"} | json | type="stat" | key="energy.harvested"

# Logs in a tick range
{job="screeps"} | json | tick >= 12000 | tick <= 13000
```

## Subsystems

Common subsystem names used throughout the bot:

- `SwarmBot` - Main bot initialization and lifecycle
- `Kernel` - Process management and scheduling
- `Movement` - Pathfinding and creep movement
- `Spawns` - Creep spawning logic
- `Economy` - Resource management and economy
- `Defense` - Defense systems and towers
- `Military` - Combat and offensive operations
- `MemoryManager` - Memory initialization and migration
- `HeapCache` - Heap cache operations
- `PortalManager` - Portal discovery and routing
- `Scheduler` - Task scheduling and CPU budgeting
- `RoomManager` - Per-room operations
- `Blueprint` - Base layout and construction
- `InterShard` - Inter-shard coordination
- `AttackTarget` - Attack target selection
- `EventBus` - Event system

## Migration Guide

### Before (Old Format)

```typescript
console.log(`[Movement] Heavy pathfinding for ${creep.name}: ${cpuUsed} CPU`);
```

### After (New Format)

```typescript
logger.warn(`Heavy pathfinding CPU: ${creep.name} used ${cpuUsed} CPU`, {
  subsystem: "Movement",
  creep: creep.name,
  room: creep.room?.name,
  meta: { cpuUsed: cpuUsed.toFixed(2) }
});
```

### Benefits

1. **Structured data** - Fields are typed and queryable
2. **Tick tracking** - Every log has a timestamp
3. **Filtering** - Easy to filter by subsystem, room, creep, etc.
4. **Aggregation** - Stats can be aggregated and visualized
5. **Debugging** - Rich context makes debugging easier
6. **Performance** - Single-line JSON is efficient to parse

## Best Practices

1. **Use appropriate log levels**
   - DEBUG: Detailed tracing information
   - INFO: Normal operational events
   - WARN: Unusual but handled situations
   - ERROR: Failures that need attention

2. **Include context**
   - Always specify `subsystem`
   - Add `room`, `creep`, `processId` when relevant
   - Use `meta` for additional debugging data

3. **Keep messages concise**
   - Message should be human-readable
   - Put detailed data in `meta` fields

4. **Use stats for metrics**
   - Numeric metrics should use `logger.stat()`
   - Enables time-series visualization in Grafana

5. **Avoid logging in tight loops**
   - Log aggregated results, not every iteration
   - Use DEBUG level for verbose logging

## Testing

The logger includes comprehensive tests to ensure JSON output format:

```bash
cd packages/screeps-bot
npm run test:unit -- test/unit/logger.test.ts
```

## Integration with Loki

To send logs to Loki:

1. Configure the screeps-loki-exporter to read from the game console
2. The exporter will parse the JSON logs and forward to Loki
3. Query logs in Grafana using LogQL

See `packages/screeps-loki-exporter/README.md` for setup instructions.
