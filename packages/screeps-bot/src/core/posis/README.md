# POSIS - Portable Operating System Interface for Screeps

This module implements a POSIS-compliant operating system architecture for Screeps, integrating concepts from both [POSIS](https://github.com/screepers/POSIS) and [ScreepsOS](https://github.com/screepers/ScreepsOS).

## Overview

POSIS provides a standardized, process-based architecture for building modular, maintainable Screeps bots. It follows OS principles with a kernel managing processes, inter-process communication, and resource allocation.

### Key Features

- **Process-Based Architecture**: Self-contained, runnable processes with lifecycle management
- **Kernel Process Management**: Central coordinator for all processes
- **Inter-Process Communication**: Message passing and shared memory
- **Process Syscalls**: Sleep, wake, fork, kill, priority adjustment
- **State Serialization**: Persist process state to Memory
- **Parent-Child Relationships**: Process hierarchy with forking
- **CPU Budget Management**: Fair resource allocation across processes
- **Event-Driven Communication**: Event bus for decoupled communication

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      POSIS Kernel                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Process Scheduler (Priority + CPU Budget)            │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Process Registry                                     │  │
│  │  - Process instances                                  │  │
│  │  - Process contexts                                   │  │
│  │  - Parent-child hierarchy                             │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Inter-Process Communication                          │  │
│  │  - Message queues                                     │  │
│  │  - Shared memory                                      │  │
│  │  - Event bus                                          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
    │ Process A │    │ Process B │    │ Process C │
    │           │    │           │    │           │
    │ Context   │    │ Context   │    │ Context   │
    │ Memory    │    │ Memory    │    │ Memory    │
    │ Syscalls  │    │ Syscalls  │    │ Syscalls  │
    └───────────┘    └───────────┘    └───────────┘
```

## Core Components

### 1. IPosisKernel

Standard interface for kernel implementations:

```typescript
interface IPosisKernel {
  initialize(): void;
  registerProcess(id: string, process: IPosisProcess, options?: IPosisSpawnOptions): void;
  unregisterProcess(id: string): void;
  run(): void;
  sendMessage(targetId: string, message: unknown, senderId: string): void;
  getBucketMode(): "critical" | "low" | "normal" | "high";
  hasCpuBudget(): boolean;
}
```

### 2. IPosisProcess

Standard interface for process implementations:

```typescript
interface IPosisProcess {
  id: string;
  name: string;
  priority: number;
  state: IPosisProcessState;
  context?: IPosisProcessContext;
  
  init?(context: IPosisProcessContext): void;
  run(): void | Promise<void>;
  cleanup?(): void;
  onMessage?(message: unknown, senderId: string): void;
  serialize?(): Record<string, unknown>;
  deserialize?(state: Record<string, unknown>): void;
}
```

### 3. Process Context

Each process receives a context providing:

- **Process ID**: Unique identifier
- **Parent ID**: Parent process (if forked)
- **Memory**: Isolated per-process memory
- **Syscalls**: Kernel interaction methods
- **Event Bus**: Subscribe/emit events
- **Logger**: Process-scoped logging

### 4. Syscalls

Processes interact with the kernel via syscalls:

- `sleep(ticks)`: Sleep for N ticks
- `wake(processId)`: Wake a sleeping process
- `fork(processId, process, options)`: Fork child process
- `kill(processId)`: Kill a process
- `setPriority(processId, priority)`: Adjust priority
- `sendMessage(targetId, message)`: Send message
- `getMessages()`: Get incoming messages
- `getSharedMemory(key)`: Get shared memory
- `setSharedMemory(key, value)`: Set shared memory

## Usage

### Creating a Process

Extend `BaseProcess` for common functionality:

```typescript
import { BaseProcess } from "core/posis";

class MyProcess extends BaseProcess {
  constructor(id: string) {
    super(id, "MyProcess", 50); // priority 50
  }

  protected doRun(): void {
    // Your process logic here
    this.log("info", "Process running");
    
    // Access syscalls
    if (Game.time % 10 === 0) {
      this.sleep(5); // Sleep for 5 ticks
    }
    
    // Use shared memory
    const counter = (this.getSharedMemory("counter") as number) || 0;
    this.setSharedMemory("counter", counter + 1);
  }
}
```

### Registering a Process

```typescript
import { posisKernel } from "core/posis";

// Initialize kernel
posisKernel.initialize();

// Register process
const myProcess = new MyProcess("my-process-1");
posisKernel.registerProcess("my-process-1", myProcess, {
  priority: 75,
  cpuBudget: 0.15,
  interval: 1
});

// Run kernel each tick
posisKernel.run();
```

### Inter-Process Communication

**Sending Messages:**

```typescript
protected doRun(): void {
  this.sendMessage("other-process", { 
    type: "request", 
    data: "some data" 
  });
}
```

**Receiving Messages:**

```typescript
protected handleMessage(message: unknown, senderId: string): void {
  const msg = message as { type: string; data: string };
  this.log("info", `Got ${msg.type} from ${senderId}`);
}
```

### Process Forking

Create child processes dynamically:

```typescript
protected doRun(): void {
  if (shouldSpawnChild) {
    const childProcess = new ChildProcess(`${this.id}-child`);
    this.fork(`${this.id}-child`, childProcess);
  }
}
```

### State Persistence

Serialize/deserialize state for respawns:

```typescript
protected serializeState(): Record<string, unknown> {
  return {
    counter: this.counter,
    data: this.customData
  };
}

protected deserializeState(state: Record<string, unknown>): void {
  this.counter = state.counter as number;
  this.customData = state.data as CustomType;
}
```

## Integration with Existing Kernel

The `PosisKernelAdapter` wraps the existing kernel to provide POSIS interfaces while maintaining backward compatibility:

- Existing processes continue to work unchanged
- New POSIS processes can be added alongside existing ones
- Both systems share the same CPU budget and scheduling
- No breaking changes to existing code

## Design Principles (from ROADMAP.md)

The POSIS implementation follows the bot's design principles:

1. **Strict CPU Budgets**: Eco rooms ≤0.1 CPU, War rooms ≤0.25 CPU
2. **CPU Bucket Management**: Adaptive behavior based on bucket level
3. **Event-Driven Logic**: Critical events trigger immediate updates
4. **Frequency Tiers**: High (1 tick), Medium (5-20 ticks), Low (≥100 ticks)
5. **Decentralization**: Processes are autonomous and self-contained

## Examples

See `examples/ExampleProcess.ts` for a comprehensive example demonstrating:

- Process initialization
- Sleep/wake functionality
- Process forking
- Inter-process messaging
- Shared memory usage
- Event emission/subscription
- State serialization

## References

- [POSIS GitHub](https://github.com/screepers/POSIS)
- [ScreepsOS GitHub](https://github.com/screepers/ScreepsOS)
- [Screeps Wiki: Operating Systems](https://wiki.screepspl.us/Operating_System/)
- [ROADMAP.md](../../../ROADMAP.md) - Bot architecture and design principles
