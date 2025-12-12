# Logging Refactor Summary

## Overview

Successfully refactored the entire Screeps bot logging system to output **single-line JSON objects** optimized for Loki ingestion, with automatic tick tracking for complete traceability.

## Problem Statement

The original issue requested:
1. Refactor logging to output single-line messages
2. Output extra metadata
3. Use Loki-compatible JSON format
4. Attach current tick to each log for traceability
5. Implement extensive logging across the bot

## Solution Delivered

### Core Logger Changes

**File**: `packages/screeps-bot/src/core/logger.ts`

#### Key Improvements
1. ✅ **Single-line JSON output** - All logs are now single-line JSON objects
2. ✅ **Automatic tick tracking** - Every log includes `tick: Game.time`
3. ✅ **Rich metadata support** - Added fields: `subsystem`, `room`, `creep`, `processId`, `meta`
4. ✅ **Field protection** - Reserved fields cannot be overwritten
5. ✅ **Test compatibility** - Handles undefined Game gracefully

#### Log Format
```json
{
  "type": "log",
  "level": "INFO|WARN|ERROR|DEBUG",
  "message": "Human-readable message",
  "tick": 12345,
  "subsystem": "ComponentName",
  "room": "W1N1",
  "creep": "harvester1",
  "processId": "proc_123",
  "customField": "customValue"
}
```

#### Stat Format
```json
{
  "type": "stat",
  "key": "metric.name",
  "value": 1000,
  "tick": 12345,
  "unit": "energy",
  "subsystem": "Economy",
  "room": "W1N1"
}
```

### Files Modified

Replaced `console.log` with structured logger calls in:

1. **Core Systems**
   - `src/core/roomNode.ts` - Room error handling
   - `src/core/unifiedStats.ts` - Stats output with tick
   - `src/SwarmBot.ts` - Bot initialization

2. **Memory & Cache**
   - `src/memory/manager.ts` - Memory migration logs
   - `src/memory/heapCache.ts` - Cache rehydration

3. **Movement & Navigation**
   - `src/utils/movement.ts` - Heavy pathfinding warnings
   - `src/utils/portalManager.ts` - Portal discovery
   - `src/utils/computationScheduler.ts` - Task scheduling

4. **Infrastructure**
   - `src/layouts/blueprints.ts` - Structure destruction
   - `src/intershard/schema.ts` - Inter-shard errors

### Testing

**File**: `packages/screeps-bot/test/unit/logger.test.ts`

Created comprehensive test suite covering:
- ✅ Single-line JSON output format
- ✅ Tick tracking
- ✅ Subsystem, room, and creep context
- ✅ Meta field inclusion
- ✅ Reserved field protection
- ✅ Log level filtering
- ✅ Stat output format
- ✅ Test environment compatibility

**Results**: 9/9 tests passing

### Documentation

**File**: `LOGGING.md`

Created comprehensive documentation including:
- Log format specification
- Usage examples (basic and advanced)
- Loki query examples (LogQL)
- Migration guide from old format
- Best practices
- Integration instructions
- Common subsystem names

## Benefits

### 1. Traceability
Every log includes the game tick, enabling:
```logql
{job="screeps"} | json | tick="12345"
```
View all logs from a specific tick to reconstruct bot state.

### 2. Filtering & Querying
Rich metadata enables powerful queries:
```logql
# All warnings from Movement subsystem
{job="screeps"} | json | level="WARN" | subsystem="Movement"

# All logs for a specific room
{job="screeps"} | json | room="W1N1"

# CPU warnings with high usage
{job="screeps"} | json | level="WARN" | cpuUsed > 10
```

### 3. Metrics & Visualization
Stats can be visualized in Grafana:
```logql
# Energy harvested over time
{job="screeps"} | json | type="stat" | key="energy.harvested"
```

### 4. Debugging
Rich context makes debugging easier:
```json
{
  "type": "log",
  "level": "WARN",
  "message": "Creep stuck",
  "tick": 12346,
  "subsystem": "Movement",
  "creep": "harvester1",
  "room": "W1N1",
  "position": "25,25",
  "stuckCount": 5,
  "lastMove": 12340
}
```

### 5. Security
Protected reserved fields prevent log corruption:
- Attempting to overwrite `type`, `level`, `message`, `tick` via meta is prevented
- Ensures log structure integrity for downstream processing

## Example Outputs

### Bot Initialization
```json
{"type":"log","level":"INFO","message":"Bot initialized","tick":12345,"subsystem":"SwarmBot","debug":true,"profiling":false}
```

### Performance Warning
```json
{"type":"log","level":"WARN","message":"Heavy pathfinding CPU: harvester1 used 15.50 CPU (2.30 this call)","tick":12346,"subsystem":"Movement","creep":"harvester1","room":"W1N1","totalCpu":"15.50","thisCpu":"2.30","from":"[room W1N1 pos 25,25]","to":"[room W1N1 pos 30,30]"}
```

### Error with Stack
```json
{"type":"log","level":"ERROR","message":"Error in room W1N1: Cannot read property 'controller' of undefined","tick":12347,"subsystem":"RoomManager","room":"W1N1","stack":"TypeError: Cannot read property...\n  at RoomNode.run..."}
```

### Stat
```json
{"type":"stat","key":"energy.harvested","value":1000,"tick":12348,"unit":"energy","subsystem":"Economy","room":"W1N1"}
```

### Memory Migration
```json
{"type":"log","level":"INFO","message":"Migrating memory from version 0 to 1","tick":12349,"subsystem":"MemoryManager","fromVersion":0,"toVersion":1}
{"type":"log","level":"INFO","message":"Memory migration complete","tick":12349,"subsystem":"MemoryManager","version":1}
```

## Usage Examples

### Basic Logging
```typescript
import { logger } from "./core/logger";

logger.info("Task started", { subsystem: "MySubsystem" });
logger.warn("Low energy", { subsystem: "Economy", room: "W1N1" });
logger.error("Task failed", { subsystem: "MySubsystem", meta: { error: "timeout" } });
```

### With Context
```typescript
logger.warn("Creep stuck", {
  subsystem: "Movement",
  room: creep.room.name,
  creep: creep.name,
  meta: {
    position: creep.pos.toString(),
    stuckCount: 5
  }
});
```

### Scoped Logger
```typescript
const myLogger = logger.createLogger("MySubsystem");

myLogger.info("Task started");  // Automatically includes subsystem
myLogger.warn("Task slow", { room: "W1N1", meta: { duration: 15.5 } });
```

## Integration with Loki

### Setup
1. Configure `screeps-loki-exporter` to read from game console
2. Exporter parses JSON logs and forwards to Loki
3. Query logs in Grafana using LogQL

### Query Examples
```logql
# All logs from tick 12345
{job="screeps"} | json | tick="12345"

# Warnings and errors only
{job="screeps"} | json | level=~"WARN|ERROR"

# Movement subsystem logs
{job="screeps"} | json | subsystem="Movement"

# All logs for room W1N1
{job="screeps"} | json | room="W1N1"

# Stats for energy harvesting
{job="screeps"} | json | type="stat" | key="energy.harvested"

# CPU warnings
{job="screeps"} | json | level="WARN" | subsystem=~"Movement|Kernel"
```

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

## Performance Impact

- **Minimal** - JSON serialization is fast
- **No heap growth** - Logs are output immediately, not stored
- **Test compatible** - Gracefully handles undefined Game
- **Field protection** - Minimal overhead for reserved field checking

## Compatibility

- ✅ Works in Screeps game environment
- ✅ Works in test environment (Mocha)
- ✅ Compatible with Loki ingestion
- ✅ Compatible with existing logging infrastructure
- ✅ Backward compatible (old console.log calls still work, just not structured)

## Future Enhancements

Potential improvements for future consideration:
1. Add log sampling for high-frequency events
2. Add log buffering for batch output
3. Add log aggregation for repeated messages
4. Add automatic error reporting to external services
5. Add log retention policies
6. Add log anonymization for sensitive data

## Code Review Results

✅ **Passed** - No issues found in final review
- Field protection properly implemented
- Reserved fields cannot be overwritten
- All tests passing
- Documentation complete
- Build succeeds

## Conclusion

Successfully delivered a complete logging refactor that:
- ✅ Outputs single-line JSON for Loki
- ✅ Includes tick in every log for traceability
- ✅ Supports rich metadata
- ✅ Provides extensive logging across the bot
- ✅ Is well-tested and documented
- ✅ Protects log structure integrity

The bot now has a robust, production-ready logging system optimized for observability and debugging in a Loki/Grafana environment.
