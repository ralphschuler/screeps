# @ralphschuler/screeps-posis - Portable Operating System Interface for Screeps

A standardized, process-based architecture for building modular, maintainable Screeps bots following OS principles.

## Overview

POSIS provides standard interfaces for building Screeps bots with:

- **Process-Based Architecture**: Self-contained, runnable processes with lifecycle management
- **Kernel Interface**: Standard interface for process management and scheduling
- **Inter-Process Communication**: Message passing and shared memory
- **Process Syscalls**: Sleep, wake, fork, kill, priority adjustment
- **State Serialization**: Persist process state to Memory
- **Parent-Child Relationships**: Process hierarchy with forking
- **Event-Driven Communication**: Event bus for decoupled communication

## Installation

This package is currently private and designed for use within the screeps monorepo:

```typescript
import { IPosisKernel, BaseProcess } from "@ralphschuler/screeps-posis";
```

## Core Interfaces

### IPosisKernel

Standard interface for kernel implementations:

```typescript
interface IPosisKernel {
  initialize(): void;
  registerProcess(id: string, process: IPosisProcess, options?: IPosisSpawnOptions): void;
  unregisterProcess(id: string): void;
  getProcess(id: string): IPosisProcess | undefined;
  getProcesses(): IPosisProcess[];
  run(): void;
  sendMessage(targetId: string, message: unknown, senderId: string): void;
  getBucketMode(): "critical" | "low" | "normal" | "high";
  hasCpuBudget(): boolean;
  getCpuStats(): { used: number; limit: number; bucket: number };
}
```

### IPosisProcess

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

### BaseProcess

Base class providing common process functionality:

```typescript
abstract class BaseProcess implements IPosisProcess {
  // Implement doRun() in your process
  protected abstract doRun(): void;
  
  // Helper methods available
  protected sleep(ticks: number): void;
  protected sendMessage(targetId: string, message: unknown): void;
  protected fork(childId: string, process: IPosisProcess): void;
  protected log(level: string, message: string, metadata?: object): void;
  protected emit(event: string, data: unknown): void;
  protected on(event: string, handler: (data: unknown) => void): void;
  protected getSharedMemory(key: string): unknown;
  protected setSharedMemory(key: string, value: unknown): void;
}
```

## Usage

### Creating a Process

Extend `BaseProcess` for common functionality:

```typescript
import { BaseProcess } from "@ralphschuler/screeps-posis";

class HarvesterProcess extends BaseProcess {
  constructor(id: string) {
    super(id, "HarvesterProcess", 50); // priority 50
  }

  protected doRun(): void {
    // Your process logic here
    this.log("info", "Harvester process running");
    
    // Access syscalls
    if (Game.time % 10 === 0) {
      this.sleep(5); // Sleep for 5 ticks
    }
    
    // Use shared memory
    const counter = (this.getSharedMemory("harvestCount") as number) || 0;
    this.setSharedMemory("harvestCount", counter + 1);
  }
  
  protected serializeState(): Record<string, unknown> {
    return {
      // Your state here
    };
  }
  
  protected deserializeState(state: Record<string, unknown>): void {
    // Restore your state here
  }
}
```

### Implementing a Kernel

To use POSIS, you need to implement the `IPosisKernel` interface. The interfaces in this package define what methods your kernel must provide, but you are free to implement them however you like for your specific bot architecture.

Key responsibilities of a kernel implementation:

1. **Process Registration**: Store and manage process instances
2. **Context Creation**: Provide each process with a context containing memory, syscalls, and event bus access
3. **Scheduling**: Execute processes based on priority and CPU budget
4. **IPC**: Route messages between processes
5. **State Persistence**: Save/load process state to/from Memory

See the example in the original bot's `PosisKernelAdapter` for a reference implementation.

## Process Syscalls

Processes interact with the kernel via syscalls provided in the process context:

- `sleep(ticks)`: Sleep for N ticks
- `wake(processId)`: Wake a sleeping process
- `fork(processId, process, options)`: Fork child process
- `kill(processId)`: Kill a process
- `setPriority(processId, priority)`: Adjust priority
- `sendMessage(targetId, message)`: Send message to another process
- `getMessages()`: Get incoming messages
- `getSharedMemory(key)`: Get shared memory value
- `setSharedMemory(key, value)`: Set shared memory value

## Inter-Process Communication

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

## Process Forking

Create child processes dynamically:

```typescript
protected doRun(): void {
  if (shouldSpawnChild) {
    const childProcess = new ChildProcess(`${this.id}-child`);
    this.fork(`${this.id}-child`, childProcess);
  }
}
```

## State Persistence

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

## Examples

See `src/examples/ExampleProcess.ts` for a comprehensive example demonstrating:

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

## License

Unlicense
