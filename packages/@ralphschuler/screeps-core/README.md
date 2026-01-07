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
Dynamic CPU allocation and tracking:
- Per-subsystem CPU budgets
- Adaptive budget adjustment
- CPU usage monitoring

```typescript
import { cpuBudgetManager } from '@ralphschuler/screeps-core';

const budget = cpuBudgetManager.allocate('mining', 10);
// Use allocated CPU
cpuBudgetManager.record('mining', Game.cpu.getUsed());
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

- `cpuBudgetManager.allocate(subsystem, amount)` - Allocate CPU budget
- `cpuBudgetManager.record(subsystem, used)` - Record CPU usage
- `cpuBudgetManager.getStats()` - Get budget statistics

## License

Unlicense
