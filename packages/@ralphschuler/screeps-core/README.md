# @ralphschuler/screeps-core

Core infrastructure package providing foundational utilities for Screeps bot development.

## Features

### Logger
Structured logging system with Loki integration:
- Multiple log levels (DEBUG, INFO, WARN, ERROR)
- Single-line JSON output for log aggregation
- Automatic tick tracking
- Log batching for CPU optimization
- Rich metadata support

```typescript
import { createLogger } from '@ralphschuler/screeps-core';

const logger = createLogger('MyModule');
logger.info('Module initialized', { room: 'W1N1' });
logger.error('Critical error occurred', { meta: { errorCode: 500 } });
```

### Event Bus
Decoupled event system for cross-module communication:
- Priority-based event handling
- Type-safe event subscriptions
- Event batching and deduplication

```typescript
import { eventBus, EventPriority } from '@ralphschuler/screeps-core';

eventBus.on('creep.died', (event) => {
  console.log(`Creep ${event.creepName} died`);
}, EventPriority.NORMAL);

eventBus.emit('creep.died', { creepName: 'Worker1' });
```

### Command Registry
Console command system for runtime control:
- Decorator-based command registration
- Auto-generated help documentation
- Type-safe command handlers

```typescript
import { Command, commandRegistry } from '@ralphschuler/screeps-core';

@Command({
  name: 'status',
  description: 'Show bot status',
  category: 'info'
})
function statusCommand() {
  return `CPU: ${Game.cpu.getUsed()}/${Game.cpu.limit}`;
}

// Call from console
global.help(); // Shows all commands
global.status(); // Runs the command
```

### CPU Budget Manager
ROADMAP-aligned CPU guardrails for expensive subsystems:
- Eco room, war room, overmind, and fallback subsystem budgets
- Structured warnings/errors when a subsystem exceeds its budget
- Function wrappers that measure `Game.cpu.getUsed()` before and after work
- Violation summaries for spotting repeat CPU offenders

```typescript
import { cpuBudgetManager } from '@ralphschuler/screeps-core';

const result = cpuBudgetManager.executeWithBudget('remoteMining', 'ecoRoom', () => {
  return runRemoteMining(room);
});

if (result === null) {
  // Wrapped work threw; the manager already logged the error with subsystem context.
}
```

## Installation

This package is part of the screeps-ant-swarm monorepo and uses npm workspaces.

```bash
npm install @ralphschuler/screeps-core
```

## Usage

Import the utilities you need:

```typescript
import { 
  createLogger, 
  eventBus, 
  commandRegistry,
  cpuBudgetManager
} from '@ralphschuler/screeps-core';
```

## API Reference

### Logger

- `createLogger(subsystem: string)` - Create a scoped logger
- `logger.debug(message, context?)` - Log debug message
- `logger.info(message, context?)` - Log info message
- `logger.warn(message, context?)` - Log warning message
- `logger.error(message, context?)` - Log error message
- `logger.stat(key, value, unit?, context?)` - Log metric
- `logger.flush()` - Flush batched logs

### Events

- `eventBus.on(event, handler, priority?)` - Subscribe to event
- `eventBus.emit(event, data)` - Emit event
- `eventBus.off(subscription)` - Unsubscribe from event

### Commands

- `@Command(metadata)` - Register console command
- `commandRegistry.register(name, handler, metadata)` - Manual registration

### CPU Budget

- `cpuBudgetManager.checkBudget(subsystem, type, cpuUsed)` - Check an explicit CPU measurement against the configured budget
- `cpuBudgetManager.executeWithBudget(subsystem, type, fn)` - Measure and run a function, returning `null` on thrown errors
- `cpuBudgetManager.executeRoomWithBudget(roomName, isWarRoom, fn)` - Measure room logic with eco/war room limits
- `cpuBudgetManager.getViolationsSummary()` - Return budget violations sorted by repeat offenders
- `cpuBudgetManager.resetViolations()` - Clear violation counters
- `cpuBudgetManager.getConfig()` / `cpuBudgetManager.updateConfig(config)` - Read or merge runtime budget config

## License

Unlicense
