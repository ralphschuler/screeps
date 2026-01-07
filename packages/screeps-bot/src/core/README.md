# Core Subsystem

## Overview

The core subsystem provides fundamental infrastructure for the entire bot, including process scheduling, logging, console commands, CPU budget management, and kernel coordination. This is the foundation upon which all other subsystems are built.

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Kernel                              │
│  - Process Registration & Lifecycle                     │
│  - CPU Budget Allocation                                │
│  - Priority-based Scheduling with Wrap-Around Queue     │
│  - Health Monitoring & Auto-Suspension                  │
│  - Event System (Inter-process Communication)           │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴────────┬──────────────┬──────────────┐
    │                 │              │              │
┌───▼────┐    ┌──────▼──────┐  ┌───▼─────┐  ┌────▼─────┐
│ Logger │    │ CPU Budget  │  │ Command │  │ Process  │
│ System │    │ Manager     │  │ Registry│  │ Registry │
└────────┘    └─────────────┘  └─────────┘  └──────────┘
```

### Core Components

#### 1. **Kernel** (`kernel.ts`)
Central process management system that coordinates all bot processes.

**Key Features:**
- Process registration and lifecycle management
- CPU budget allocation and enforcement per process
- Priority-based scheduling with wrap-around queue
- Process statistics tracking (CPU usage, run counts, error rates)
- Health monitoring with automatic suspension for failing processes
- Event bus for inter-process communication

**CPU Budgets** (from ROADMAP.md):
- Eco rooms: ≤ 0.1 CPU per room
- War rooms: ≤ 0.25 CPU per room
- Global overmind: ≤ 1 CPU every 20-50 ticks

**Wrap-Around Queue:**
When CPU budget is exhausted, the kernel tracks the last executed process and continues from that point in the next tick, wrapping around to the beginning when reaching the end. This ensures all processes eventually run even under CPU pressure.

#### 2. **Logger** (`logger.ts`)
Structured logging system with JSON output for Loki ingestion.

**Key Features:**
- Log levels: DEBUG, INFO, WARN, ERROR
- Single-line JSON output (Loki-compatible)
- Automatic tick tracking for all logs
- Rich metadata support (subsystem, room, creep, etc.)
- Log batching to reduce console.log overhead (~1-2% CPU savings)
- CPU measurement utilities

#### 3. **Command Registry** (`commandRegistry.ts`)
Decorator-based console command management system.

**Key Features:**
- `@Command` decorator for declarative command registration
- Automatic `help()` command generation
- Command metadata (description, usage, examples, categories)
- Global scope integration for console access
- Lazy loading support

#### 4. **CPU Budget Manager** (`cpuBudgetManager.ts`)
Enforces CPU budgets per subsystem type with violation tracking.

**Key Features:**
- Per-subsystem CPU budget enforcement
- Budget violation tracking and reporting
- Strict vs. warning modes
- Budget limit calculation by subsystem type

#### 5. **Event Bus** (`events.ts`)
Centralized event system for inter-process and inter-subsystem communication.

**Key Features:**
- Type-safe event registration and emission
- Synchronous event handling
- Event handler registration/deregistration
- Multiple handlers per event type

#### 6. **Process Registry** (`processRegistry.ts`)
Manages process registration and metadata.

**Key Features:**
- Process metadata storage
- Decorator-based process registration
- Process discovery and enumeration

## Key Concepts

### 1. Process Scheduling

Processes are scheduled based on:
- **Priority**: CRITICAL (100) → HIGH (75) → MEDIUM (50) → LOW (25) → IDLE (10)
- **Frequency**: High (every tick), Medium (5-20 ticks), Low (≥100 ticks)
- **CPU Budget**: Per-process budget with wrap-around queue on exhaustion

### 2. Health Monitoring

The kernel tracks process health based on:
- Success rate (runs without errors)
- Consecutive error count
- CPU usage patterns
- Last successful run timestamp

**Auto-Suspension**: Processes with health score < 30 are automatically suspended for investigation.

### 3. Event-Driven Communication

Processes communicate via the event bus:
- **Synchronous events**: Handlers execute immediately
- **Type-safe**: Event types and payloads are strongly typed
- **Decoupled**: Processes don't need direct references to each other

## API Reference

### Kernel API

```typescript
import { kernel, ProcessPriority } from './core/kernel';

// Register a process
kernel.registerProcess({
  name: "myProcess",
  priority: ProcessPriority.HIGH,
  frequency: "high",
  run: (context) => {
    // Process logic
  }
});

// Run all processes
kernel.run();

// Get process stats
const stats = kernel.getProcessStats("myProcess");
console.log(`Avg CPU: ${stats.avgCpu}`);
```

### Logger API

```typescript
import { logger, LogLevel } from './core/logger';

// Configure logger
logger.configure({
  level: LogLevel.INFO,
  enableBatching: true,
  maxBatchSize: 50
});

// Log messages
logger.debug("Debug message", { subsystem: "mySubsystem" });
logger.info("Info message", { room: "W1N1" });
logger.warn("Warning message", { creep: "Worker1" });
logger.error("Error message", { error: err });

// Measure CPU
const result = logger.measureCPU("operation", () => {
  // Expensive operation
  return calculate();
});

// Flush logs at end of tick
logger.flush();
```

### Command Registry API

```typescript
import { Command, commandRegistry } from './core/commandRegistry';

class MyCommands {
  @Command({
    name: "greet",
    description: "Greet a player",
    usage: "greet(name)",
    examples: ["greet('World')"],
    category: "Social"
  })
  greet(name: string): string {
    return `Hello, ${name}!`;
  }
}

// Register commands
const commands = new MyCommands();
commandRegistry.registerDecoratedCommands(commands);

// Expose to global scope
commandRegistry.exposeToGlobal();

// In console:
// > greet('Screeps')
// "Hello, Screeps!"
// > help()
// [Shows all registered commands]
```

### CPU Budget Manager API

```typescript
import { CpuBudgetManager } from './core/cpuBudgetManager';

const budgetManager = new CpuBudgetManager({
  ecoRoomLimit: 0.1,
  warRoomLimit: 0.25,
  overmindLimit: 1.0,
  strictMode: false
});

// Check budget
const startCpu = Game.cpu.getUsed();
// ... do work ...
const cpuUsed = Game.cpu.getUsed() - startCpu;

const withinBudget = budgetManager.checkBudget(
  "W1N1",
  "ecoRoom",
  cpuUsed
);

// Get violations
const violations = budgetManager.getBudgetViolations();
```

### Event Bus API

```typescript
import { eventBus } from './core/events';

// Define event type
type MyEvent = {
  message: string;
  value: number;
};

// Register handler
const handler = (payload: MyEvent) => {
  console.log(`Event: ${payload.message}, Value: ${payload.value}`);
};

eventBus.on("myEvent", handler);

// Emit event
eventBus.emit("myEvent", { message: "Hello", value: 42 });

// Unregister handler
eventBus.off("myEvent", handler);
```

## Performance Characteristics

### CPU Costs

| Component | CPU Cost | Notes |
|-----------|----------|-------|
| Kernel.run() | 0.5-1.0 CPU | Depends on number of processes |
| Logger (batched) | ~0.01 CPU | Per log message |
| Logger (unbatched) | ~0.05 CPU | Per log message |
| Command registration | ~0.1 CPU | One-time cost at startup |
| Event emission | ~0.01 CPU | Per event + handlers |
| Process registration | ~0.05 CPU | One-time cost per process |

### Memory Usage

- **Kernel**: ~5KB for process registry and stats
- **Logger**: ~1KB for batch buffer
- **Command Registry**: ~2KB for command metadata
- **Event Bus**: ~1KB for handler registry

### Cache Behavior

- Process statistics are cached in heap (global object)
- Lost on global reset but rebuilds quickly (1-2 ticks)
- No Memory storage to minimize serialization costs

## Configuration

### Environment Variables

None. Configuration is done programmatically via APIs.

### Memory Schema

The core subsystem does not use Memory directly. All state is kept in the heap (global object).

### Tunable Parameters

**Kernel:**
- `ProcessPriority`: Adjust process priorities (100 = CRITICAL, 10 = IDLE)
- CPU budgets: Configure via `CpuBudgetManager`
- Wrap-around queue: Automatic, no configuration needed

**Logger:**
```typescript
logger.configure({
  level: LogLevel.INFO,        // Minimum log level
  enableBatching: true,         // Batch logs for efficiency
  maxBatchSize: 50              // Flush after N messages
});
```

**CPU Budget Manager:**
```typescript
const budgetManager = new CpuBudgetManager({
  ecoRoomLimit: 0.1,      // CPU per eco room per tick
  warRoomLimit: 0.25,     // CPU per war room per tick
  overmindLimit: 1.0,     // CPU per overmind execution
  strictMode: false       // false = warnings, true = errors
});
```

## Examples

### Example 1: Creating a Scheduled Process

```typescript
import { kernel, ProcessPriority } from './core/kernel';

// High-frequency process (runs every tick)
kernel.registerProcess({
  name: "creepMovement",
  priority: ProcessPriority.CRITICAL,
  frequency: "high",
  run: (context) => {
    // Move all creeps
    for (const creep of Object.values(Game.creeps)) {
      // Movement logic
    }
  }
});

// Medium-frequency process (runs every 5-20 ticks)
kernel.registerProcess({
  name: "roomScanner",
  priority: ProcessPriority.MEDIUM,
  frequency: "medium",
  run: (context) => {
    // Scan rooms for threats
    for (const room of Object.values(Game.rooms)) {
      // Scanning logic
    }
  }
});

// Low-frequency process (runs every 100+ ticks)
kernel.registerProcess({
  name: "marketAnalysis",
  priority: ProcessPriority.LOW,
  frequency: "low",
  run: (context) => {
    // Analyze market trends
  }
});
```

### Example 2: Event-Driven Logic

```typescript
import { eventBus } from './core/events';

// Producer: Detect hostile
eventBus.emit("hostileDetected", {
  roomName: "W1N1",
  hostileId: "hostile123",
  bodyParts: [ATTACK, ATTACK, MOVE]
});

// Consumer: Respond to hostile
eventBus.on("hostileDetected", (payload) => {
  const room = Game.rooms[payload.roomName];
  // Spawn defenders, activate towers, etc.
});
```

### Example 3: Console Commands for Debugging

```typescript
import { Command } from './core/commandRegistry';

class DebugCommands {
  @Command({
    name: "cpuStats",
    description: "Show CPU statistics for all processes",
    usage: "cpuStats()",
    category: "Debug"
  })
  cpuStats(): string {
    const processes = kernel.getAllProcessStats();
    let output = "Process CPU Statistics:\n";
    
    for (const [name, stats] of Object.entries(processes)) {
      output += `${name}: avg=${stats.avgCpu.toFixed(3)}, `;
      output += `max=${stats.maxCpu.toFixed(3)}, `;
      output += `runs=${stats.runCount}\n`;
    }
    
    return output;
  }

  @Command({
    name: "resetProcess",
    description: "Reset process statistics",
    usage: "resetProcess(processName)",
    examples: ["resetProcess('roomScanner')"],
    category: "Debug"
  })
  resetProcess(processName: string): string {
    kernel.resetProcessStats(processName);
    return `Reset statistics for ${processName}`;
  }
}
```

## Testing

### Test Coverage

- **Kernel**: 88% coverage
  - `kernelWrapAround.test.ts` - Wrap-around queue scheduling
  - `kernelHealthMonitoring.test.ts` - Health monitoring and auto-suspension
  - `kernelAdaptiveBudgets.test.ts` - Adaptive CPU budgets
  - `kernelSkippedProcesses.test.ts` - Process skipping under CPU pressure
  - `kernelTickDistribution.test.ts` - Fair tick distribution

- **Logger**: Tests exist in main test suite
- **Command Registry**: Integration tests with console commands
- **CPU Budget Manager**: Unit tests for budget enforcement

### Running Tests

```bash
# Run all core tests
npm run test:unit -- --grep "kernel|logger|command"

# Run specific test suite
npm run test:unit -- packages/screeps-bot/test/unit/kernelWrapAround.test.ts
```

## Troubleshooting

### Issue: Processes not running

**Symptoms**: Process registered but never executes

**Causes**:
1. CPU budget exhausted before process executes
2. Process priority too low
3. Process suspended due to errors

**Solutions**:
1. Check CPU usage: `kernel.getProcessStats("processName")`
2. Increase process priority or reduce other processes
3. Check suspension status: `stats.suspendedUntil`
4. Review process health: `stats.healthScore`

### Issue: CPU budget violations

**Symptoms**: Warning/error logs about budget violations

**Causes**:
1. Process taking more CPU than allocated
2. Too many processes running per tick
3. Expensive operations (pathfinding, scanning) in high-frequency processes

**Solutions**:
1. Move expensive operations to low-frequency processes
2. Use caching to reduce repeated calculations
3. Adjust budgets via `CpuBudgetManager` if violations are expected
4. Profile CPU usage: `logger.measureCPU()`

### Issue: Logs not appearing

**Symptoms**: Log messages not visible in console

**Causes**:
1. Log level too high (filtering out messages)
2. Batching enabled but logs not flushed
3. Logger not configured

**Solutions**:
1. Lower log level: `logger.configure({ level: LogLevel.DEBUG })`
2. Flush logs at end of tick: `logger.flush()`
3. Disable batching for debugging: `logger.configure({ enableBatching: false })`

### Issue: Console commands not working

**Symptoms**: Commands not available in console, `help()` doesn't show commands

**Causes**:
1. Commands not exposed to global scope
2. Command registry not initialized
3. Decorator metadata not registered

**Solutions**:
1. Call `commandRegistry.exposeToGlobal()` in main.ts
2. Initialize registry: `commandRegistry.initialize()`
3. Register decorated commands: `commandRegistry.registerDecoratedCommands(instance)`
4. Check for errors in command registration

### Issue: Process suspended unexpectedly

**Symptoms**: Process stops running, suspension message in logs

**Causes**:
1. Process throwing errors repeatedly (health score < 30)
2. Process exceeding CPU budget consistently
3. Manual suspension via API

**Solutions**:
1. Check error logs for the process
2. Fix underlying issues in process logic
3. Resume manually: `kernel.resumeProcess("processName")`
4. Check health score: `kernel.getProcessStats("processName").healthScore`

## Related Documentation

- [ROADMAP.md](../../../../ROADMAP.md) - Overall bot architecture and design principles
- [ADR-0004: Five-Layer Swarm Architecture](../../../../docs/adr/0004-five-layer-swarm-architecture.md)
- [ADR-0002: Pheromone Coordination System](../../../../docs/adr/0002-pheromone-coordination-system.md)
- [Cache Subsystem](../cache/README.md) - Caching infrastructure
- [Memory Subsystem](../memory/README.md) - Memory management
- [Spawning Subsystem](../spawning/README.md) - Creep spawning coordination
