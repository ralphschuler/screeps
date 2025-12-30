# @ralphschuler/screeps-kernel

Process scheduler with CPU budget management and wrap-around queue for Screeps.

## Dual Architecture

This package provides **two kernel systems**:

### 1. Task Kernel (Default)
CPU-budgeted task scheduling with priorities, adaptive budgets, and event system.

### 2. OS-Style Process Kernel (New!)
Memory-persisted process architecture based on ["Writing an OS for Screeps"](https://gist.github.com/NhanHo/02949ea3a148c583d57570a1600b4d85).

See [OS Architecture Documentation](docs/OS_ARCHITECTURE.md) for details on the process-based system.

## Features

### Task Kernel
- **Process Management**: Register and manage multiple processes with priorities
- **CPU Budget Control**: Allocate and enforce CPU budgets per process
- **Wrap-Around Queue**: Fair execution scheduling across ticks
- **Event System**: Type-safe event bus for inter-process communication
- **Adaptive Budgets**: Dynamic CPU allocation based on room count and bucket level
- **Process Decorators**: Declarative process registration via TypeScript decorators
- **Statistics Tracking**: Built-in process performance monitoring
- **Bucket-Aware**: Automatically adjusts behavior based on CPU bucket level

### OS-Style Process Kernel
- **Memory Persistence**: Processes survive global resets
- **Process Lifecycle**: Add, kill, and manage processes with unique PIDs
- **Parent-Child Relationships**: Hierarchical process organization
- **Process Memory**: Isolated memory namespace per process
- **Automatic Serialization**: Process table stored/loaded from Memory each tick

## Installation

```bash
npm install @ralphschuler/screeps-kernel
```

## Quick Start

### Task Kernel (CPU Management)

```typescript
import { kernel, ProcessPriority } from '@ralphschuler/screeps-kernel';

// Register a process
kernel.registerProcess({
  id: 'economy:harvest',
  name: 'Harvesting',
  priority: ProcessPriority.HIGH,
  frequency: 'high',
  minBucket: 500,
  cpuBudget: 0.1,
  interval: 1,
  execute: () => {
    // Your harvesting logic
    console.log('Running harvest process');
  }
});

// Main game loop
export function loop() {
  kernel.run();
}
```

### OS-Style Process Kernel (Memory Persistence)

```typescript
import {
  OSProcess,
  ProcessStatus,
  registerProcessClass,
  loadProcessTable,
  runOSKernel,
  storeProcessTable,
  addProcess
} from '@ralphschuler/screeps-kernel';

// Define a process
class MiningProcess extends OSProcess {
  public run(memory: any): void {
    const mineral = Game.getObjectById(memory.mineralId);
    if (!mineral || mineral.mineralAmount === 0) {
      this.status = ProcessStatus.DEAD; // Stop when done
      return;
    }
    // Mining logic...
  }
  
  public reloadFromMemory(memory: any): void {
    // Restore state from memory
  }
}

// Register process classes
registerProcessClass('MiningProcess', MiningProcess);

// Main game loop
export function loop() {
  loadProcessTable();
  
  // Add new processes as needed
  if (Game.flags['mine-mineral']) {
    const process = addProcess(new MiningProcess(-1));
    Memory.processMemory![process.pid] = { mineralId: 'xyz' };
  }
  
  runOSKernel();
  storeProcessTable();
}
```

See [OS Architecture Documentation](docs/OS_ARCHITECTURE.md) for more details.

## API

### Kernel

**Methods:**

- `registerProcess(definition)` - Register a new process
- `unregisterProcess(id)` - Remove a process
- `run()` - Execute processes for this tick
- `getStats()` - Get kernel statistics
- `on(eventName, handler, options)` - Subscribe to events
- `emit(eventName, payload, options)` - Emit events

### Process Priority

```typescript
enum ProcessPriority {
  CRITICAL = 100,  // Must run every tick
  HIGH = 75,       // High priority tasks
  MEDIUM = 50,     // Standard tasks
  LOW = 25,        // Background tasks
  IDLE = 10        // Very low priority
}
```

### Process Frequencies

- `high` - Every tick or near-every tick
- `medium` - Every 5-20 ticks
- `low` - Every 100+ ticks

## Advanced Usage

### Process Decorators

```typescript
import { ProcessDecorator, ProcessPriority } from '@ralphschuler/screeps-kernel';

class RoomManager {
  @ProcessDecorator({
    id: 'room:spawning',
    name: 'Spawn Management',
    priority: ProcessPriority.HIGH,
    frequency: 'high',
    interval: 1
  })
  public manageSpawns(): void {
    // Spawn management logic
  }

  @ProcessDecorator({
    id: 'room:construction',
    name: 'Construction',
    priority: ProcessPriority.MEDIUM,
    frequency: 'medium',
    interval: 10
  })
  public manageConstruction(): void {
    // Construction logic
  }
}
```

### Event System

```typescript
import { kernel, EventPriority } from '@ralphschuler/screeps-kernel';

// Subscribe to events
kernel.on('hostile.detected', (event) => {
  console.log(`Hostile in ${event.roomName}: ${event.hostileOwner}`);
}, { priority: EventPriority.CRITICAL });

// Emit events
kernel.emit('hostile.detected', {
  roomName: 'W1N1',
  hostileId: creep.id,
  hostileOwner: creep.owner.username,
  bodyParts: creep.body.length,
  threatLevel: 2
});
```

### Adaptive CPU Budgets

```typescript
import { getAdaptiveBudgets, DEFAULT_ADAPTIVE_CONFIG } from '@ralphschuler/screeps-kernel';

// Get adaptive budgets based on current state
const budgets = getAdaptiveBudgets({
  roomCount: Object.keys(Game.rooms).length,
  bucketLevel: Game.cpu.bucket,
  cpuLimit: Game.cpu.limit,
  config: DEFAULT_ADAPTIVE_CONFIG
});

console.log('Room budget:', budgets.roomBudget);
console.log('Creep budget:', budgets.creepBudget);
```

### Custom Logger

```typescript
import { configureLogger, LogLevel } from '@ralphschuler/screeps-kernel';

// Configure logging
configureLogger({
  level: LogLevel.DEBUG  // DEBUG, INFO, WARN, ERROR, NONE
});
```

## Design Principles

1. **Fair Scheduling**: Wrap-around queue ensures all processes get CPU time
2. **Budget Enforcement**: Processes are skipped if CPU budget is exhausted
3. **Priority-Based**: Higher priority processes run first
4. **Bucket-Aware**: Adjusts behavior based on CPU bucket level
5. **Event-Driven**: Loose coupling through event system

## Configuration

```typescript
import { getConfig, updateConfig } from '@ralphschuler/screeps-kernel';

updateConfig({
  enableAdaptiveBudgets: true,
  cpu: {
    bucketThresholds: {
      lowMode: 2000,
      highMode: 8000
    },
    budgets: {
      rooms: 0.60,
      creeps: 0.25,
      strategic: 0.10,
      market: 0.03,
      visualization: 0.02
    },
    taskFrequencies: {
      pheromoneUpdate: 5,
      clusterLogic: 10,
      strategicDecisions: 20,
      marketScan: 100,
      nukeEvaluation: 100,
      memoryCleanup: 500
    }
  }
});
```

## Testing

```bash
npm test
```

## Performance

The kernel is designed for efficiency:

- Minimal overhead per process (~0.01 CPU)
- Lazy execution - skips processes when needed
- Bucket-aware event queuing
- Efficient wrap-around scheduling

## License

Unlicense - use freely!

## Contributing

Contributions welcome! Please:

1. Add tests for new features
2. Follow existing code style
3. Update documentation
4. Submit a pull request

## See Also

- [Framework Documentation](../../docs/FRAMEWORK.md) - Using multiple packages together
- [Package Template](../../docs/PACKAGE_TEMPLATE.md) - Creating new packages
