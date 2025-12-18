# Logging Guidelines

This document outlines the logging standards for the Screeps bot codebase, aligned with ROADMAP.md Section 21.

## Overview

All logs must use the structured logger system (`src/core/logger.ts`) instead of direct `console.log` calls. This provides:

- **CPU cost tracking** per subsystem
- **Log level filtering** (DEBUG, INFO, WARN, ERROR)
- **Structured metadata** for easier analysis
- **Integration with external tools** (Grafana, Loki)
- **Single-line JSON output** for log aggregation

## Quick Start

### Import and Create Logger

```typescript
import { createLogger } from "./core/logger";

const logger = createLogger("MySubsystem");
```

### Using the Logger

```typescript
// Info message
logger.info("Spawning harvester", {
  room: roomName,
  meta: { role: "harvester", energy: room.energyAvailable }
});

// Debug message (only shown when LOG_LEVEL is DEBUG)
logger.debug("Checking spawn queue", {
  room: roomName,
  meta: { queueLength: queue.length }
});

// Warning message
logger.warn("Low energy in room", {
  room: roomName,
  meta: { energyAvailable: room.energyAvailable }
});

// Error message
logger.error("Failed to spawn creep", {
  room: roomName,
  meta: { error: String(err), role: "harvester" }
});
```

## Log Levels

### DEBUG (0)
- Detailed trace information
- Only shown when log level is set to DEBUG
- Use for development and troubleshooting
- Example: Path calculations, state transitions, cache hits/misses

### INFO (1)
- General informational messages
- Normal operational messages
- Use for important events that are not errors
- Example: Creep spawned, room claimed, market trade executed

### WARN (2)
- Warning messages for unusual situations
- Issues that don't prevent operation but need attention
- Use for degraded performance or approaching limits
- Example: CPU bucket low, storage nearly full, hostile creep detected

### ERROR (3)
- Error messages for failures
- Critical issues that need immediate attention
- Use when operations fail or data is invalid
- Example: Spawn failed, API error, pathfinding failure

## Context and Metadata

### Standard Context Fields

```typescript
interface LogContext {
  subsystem?: string;  // Auto-set by createLogger
  room?: string;       // Room name
  creep?: string;      // Creep name
  processId?: string;  // Process ID
  shard?: string;      // Shard name (auto-populated)
  meta?: Record<string, any>;  // Additional metadata
}
```

### Best Practices

1. **Always include relevant context**:
   ```typescript
   logger.info("Building road", {
     room: "W1N1",
     meta: { x: 25, y: 25, cost: 300 }
   });
   ```

2. **Use structured metadata instead of string interpolation**:
   ```typescript
   // ❌ BAD: String interpolation
   logger.info(`Room ${roomName} has ${energyLevel} energy`);
   
   // ✅ GOOD: Structured metadata
   logger.info("Room energy status", {
     room: roomName,
     meta: { energyLevel }
   });
   ```

3. **Convert errors to strings**:
   ```typescript
   try {
     // ... code
   } catch (error) {
     logger.error("Operation failed", {
       meta: { error: String(error) }
     });
   }
   ```

## Subsystem Naming

Use clear, consistent subsystem names:

- `Main` - Main loop and initialization
- `Spawn` - Spawning logic
- `Economy` - Resource management
- `Defense` - Defense and military
- `Remote` - Remote mining and operations
- `Market` - Market and trading
- `Expansion` - Room expansion and claiming
- `PathCache` - Pathfinding caching
- `SwarmKernel` - Kernel and process management
- `TestLoader` - Integration test infrastructure

## Configuration

### Setting Log Level

```typescript
import { configureLogger, LogLevel } from "./core/logger";

// Set global log level
configureLogger({
  level: LogLevel.INFO,  // Only show INFO, WARN, ERROR
  cpuLogging: false      // Disable CPU measurement logging
});
```

### Per-Environment Configuration

```typescript
// Development (verbose logging)
if (Game.shard.name === "shard0") {
  configureLogger({ level: LogLevel.DEBUG });
}

// Production (minimal logging)
if (Game.cpu.bucket < 5000) {
  configureLogger({ level: LogLevel.WARN });
}
```

## Special Cases

### Exceptions to the Rule

Console.log is **only** allowed in these specific files:

1. **src/core/logger.ts** - Implements the logging abstraction
2. **src/utils/ErrorMapper.ts** - HTML-formatted errors for Screeps UI
3. **src/core/unifiedStats.ts** - Stats JSON output for exporters
4. **src/standards/consoleCommands.ts** - User-facing installation message

All other console.log usage is **blocked by ESLint** and will fail CI.

### Testing and Development

Test files use structured logger for better filtering:

```typescript
import { createLogger } from '../core/logger';

const logger = createLogger("MyTest");

it('should process creeps', () => {
  logger.debug('Test running', { meta: { creepCount: 5 } });
  // ... test code
});
```

## Performance Considerations

### CPU Impact

- Each log call costs ~0.01-0.05 CPU
- Use DEBUG level for high-frequency logs
- Set production log level to INFO or WARN

### Log Sampling

For high-frequency events, consider sampling:

```typescript
// Only log 10% of pathfinding calls
if (Math.random() < 0.1) {
  logger.debug("Path calculated", {
    meta: { from: startPos, to: endPos, length: path.length }
  });
}
```

### Conditional Logging

Check log level before expensive operations:

```typescript
import { getLoggerConfig, LogLevel } from "./core/logger";

if (getLoggerConfig().level <= LogLevel.DEBUG) {
  // Only execute expensive string formatting if DEBUG is enabled
  const detailedReport = generateExpensiveReport();
  logger.debug("Detailed report", { meta: { report: detailedReport } });
}
```

## Migration from console.log

When replacing console.log:

1. **Identify the appropriate log level**:
   - Debug info → `logger.debug()`
   - Status updates → `logger.info()`
   - Warnings → `logger.warn()`
   - Errors → `logger.error()`

2. **Convert to structured metadata**:
   ```typescript
   // Before
   console.log(`[Defense] ${hostileCount} hostiles in ${roomName}`);
   
   // After
   logger.warn("Hostiles detected", {
     room: roomName,
     meta: { hostileCount }
   });
   ```

3. **Add appropriate context**:
   ```typescript
   // Before
   console.log("Harvester spawned");
   
   // After
   logger.info("Harvester spawned", {
     room: spawn.room.name,
     meta: { spawnName: spawn.name, bodyParts: creep.body.length }
   });
   ```

## Integration with External Tools

### Loki Log Aggregation

All logs are output as single-line JSON:

```json
{"type":"log","level":"INFO","message":"Harvester spawned","tick":12345,"shard":"shard0","subsystem":"Spawn","room":"W1N1","bodyParts":5}
```

This format is compatible with:
- Grafana Loki for log storage and querying
- Prometheus for metrics extraction
- Screeps stats exporters (Graphite, InfluxDB)

### Stats vs Logs

Use `logger.stat()` for metrics, `logger.info()` for events:

```typescript
// Metric (for time-series data)
logger.stat("room.energy", room.energyAvailable, "energy", {
  room: roomName
});

// Event (for searchable logs)
logger.info("Room energy updated", {
  room: roomName,
  meta: { energyAvailable: room.energyAvailable }
});
```

## See Also

- `src/core/logger.ts` - Logger implementation
- `ROADMAP.md` Section 21 - Logging architecture
- `.eslintrc.cjs` - ESLint rules preventing console.log
