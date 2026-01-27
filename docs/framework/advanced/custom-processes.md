# Custom Process Development

Learn how to create **custom processes** for the kernel-based scheduling system.

---

## Table of Contents

- [Overview](#overview)
- [Process Basics](#process-basics)
- [Creating a Simple Process](#creating-a-simple-process)
- [Advanced Process Features](#advanced-process-features)
- [Process Lifecycle](#process-lifecycle)
- [Best Practices](#best-practices)
- [Examples](#examples)

---

## Overview

The **Kernel** package (`@ralphschuler/screeps-kernel`) provides a CPU-budgeted process scheduling system. You can create **custom processes** to add new functionality to your bot while maintaining CPU control.

### When to Create a Custom Process

Create a custom process when you need to:
- Add new bot functionality (market trading, remote mining, etc.)
- Manage CPU budgets for specific systems
- Run tasks periodically instead of every tick
- Integrate third-party modules into the kernel

### Process vs. Direct Code

**Direct Code** (in main loop):
```typescript
export function loop() {
  manageMarket();      // Runs every tick, no CPU control
  updateDefense();      // Runs every tick
  optimizePaths();      // Runs every tick
}
```

**Process-Based**:
```typescript
kernel.registerProcess({
  id: 'market',
  execute: manageMarket,
  cpuBudget: 0.5,
  interval: 50  // Only every 50 ticks
});

kernel.registerProcess({
  id: 'defense',
  execute: updateDefense,
  cpuBudget: 0.3,
  priority: ProcessPriority.HIGH
});

export function loop() {
  kernel.run();  // Managed execution with budgets
}
```

---

## Process Basics

### Process Structure

```typescript
interface Process {
  id: string;              // Unique identifier
  name?: string;           // Human-readable name
  priority: number;        // 0-100 (higher = more important)
  frequency?: 'high' | 'medium' | 'low';
  interval?: number;       // Ticks between executions
  cpuBudget: number;       // Max CPU per execution
  minBucket?: number;      // Minimum bucket required
  execute: () => void;     // Process function
}
```

### Priority Levels

```typescript
enum ProcessPriority {
  CRITICAL = 100,  // Always runs first (defense, spawning)
  HIGH = 90,       // Important systems (economy, towers)
  MEDIUM = 50,     // Normal operations (logistics, building)
  LOW = 20,        // Nice-to-have (market, analytics)
  MINIMAL = 10     // Optional optimizations
}
```

---

## Creating a Simple Process

### Step 1: Define Your Logic

```typescript
// processes/market.ts
export function runMarketProcess() {
  // Your market trading logic
  const rooms = Object.values(Game.rooms).filter(r => r.controller?.my);
  
  for (const room of rooms) {
    if (room.terminal && room.storage) {
      // Check for profitable trades
      analyzeMarketOpportunities(room);
    }
  }
}
```

### Step 2: Register with Kernel

```typescript
// main.ts
import { kernel, ProcessPriority } from '@ralphschuler/screeps-kernel';
import { runMarketProcess } from './processes/market';

kernel.registerProcess({
  id: 'economy:market',
  name: 'Market Trading',
  priority: ProcessPriority.LOW,
  cpuBudget: 1.0,
  interval: 50,        // Every 50 ticks
  minBucket: 5000,     // Only when bucket healthy
  execute: runMarketProcess
});
```

### Step 3: Run

```typescript
export function loop() {
  kernel.run();
}
```

That's it! Your process now runs:
- Every 50 ticks
- Only when bucket ≥ 5000
- With max 1.0 CPU budget
- At low priority (after more important processes)

---

## Advanced Process Features

### Stateful Processes

Use closures to maintain state between executions:

```typescript
function createMarketProcess() {
  let lastAnalysis: number = 0;
  let marketTrends: Map<ResourceConstant, number> = new Map();
  
  return function runMarket() {
    // State persists between executions
    if (Game.time - lastAnalysis > 100) {
      marketTrends = analyzeMarketTrends();
      lastAnalysis = Game.time;
    }
    
    // Use cached trends
    executeTrades(marketTrends);
  };
}

kernel.registerProcess({
  id: 'market',
  execute: createMarketProcess(),  // Stateful process
  cpuBudget: 0.8,
  interval: 20
});
```

### Process Classes

Create a class-based process:

```typescript
import { OSProcess, ProcessStatus } from '@ralphschuler/screeps-kernel';

class RemoteMiningProcess extends OSProcess {
  private roomName: string;
  
  constructor(roomName: string, parentPID?: number) {
    super(parentPID);
    this.roomName = roomName;
  }
  
  public run(memory: any): void {
    const room = Game.rooms[this.roomName];
    
    if (!room) {
      console.log(`Remote room ${this.roomName} not visible`);
      return;
    }
    
    // Remote mining logic
    this.manageRemoteMiners(room);
    this.manageHaulers(room);
    
    // Check if we should continue
    if (room.find(FIND_SOURCES).length === 0) {
      this.status = ProcessStatus.DEAD;  // Terminate process
    }
  }
  
  public reloadFromMemory(memory: any): void {
    this.roomName = memory.roomName;
  }
  
  private manageRemoteMiners(room: Room): void {
    // Implementation
  }
  
  private manageHaulers(room: Room): void {
    // Implementation
  }
}

// Register process class
import { registerProcessClass, addProcess } from '@ralphschuler/screeps-kernel';

registerProcessClass('RemoteMiningProcess', RemoteMiningProcess);

// Add instance for a specific room
addProcess(new RemoteMiningProcess('W10N10'));
```

### Conditional Execution

Skip execution based on conditions:

```typescript
kernel.registerProcess({
  id: 'defense:nuke',
  execute: () => {
    // Check condition first
    const nukesDetected = Object.values(Game.rooms).some(room => 
      room.find(FIND_NUKES).length > 0
    );
    
    if (!nukesDetected) {
      return;  // Skip execution if no nukes
    }
    
    // Expensive nuke defense logic
    coordinateNukeDefense();
  },
  cpuBudget: 2.0,
  priority: ProcessPriority.CRITICAL
});
```

### Dynamic CPU Budgets

Adjust budget based on conditions:

```typescript
function createAdaptiveProcess() {
  return {
    id: 'adaptive',
    execute: () => {
      // Adaptive logic
    },
    get cpuBudget() {
      // Increase budget when bucket is high
      return Game.cpu.bucket > 8000 ? 2.0 : 0.5;
    },
    priority: ProcessPriority.MEDIUM
  };
}

kernel.registerProcess(createAdaptiveProcess());
```

---

## Process Lifecycle

### Lifecycle States

1. **Registered** - Process added to kernel
2. **Scheduled** - Waiting to execute
3. **Running** - Currently executing
4. **Completed** - Execution finished
5. **Sleeping** - Waiting for interval
6. **Dead** - Terminated (class-based only)

### Execution Flow

```
Tick N:
  ┌─────────────────┐
  │ Kernel.run()    │
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ Sort by priority│
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ Check interval  │ ──→ Skip if not time
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ Check minBucket │ ──→ Skip if bucket too low
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ Execute process │
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ Track CPU used  │
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ Budget exceeded?│ ──→ Stop execution
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ Next process    │
  └─────────────────┘
```

### Inter-Process Communication

Use an event bus:

```typescript
import { EventBus } from '@ralphschuler/screeps-kernel';

const eventBus = new EventBus();

// Process 1: Emits events
kernel.registerProcess({
  id: 'scanner',
  execute: () => {
    const hostiles = scanForHostiles();
    if (hostiles.length > 0) {
      eventBus.emit('hostiles_detected', { count: hostiles.length, rooms: [...] });
    }
  }
});

// Process 2: Listens to events
eventBus.on('hostiles_detected', (data) => {
  console.log(`Hostiles detected: ${data.count}`);
});

kernel.registerProcess({
  id: 'defense',
  execute: () => {
    // Defense logic
  },
  priority: ProcessPriority.HIGH
});
```

---

## Best Practices

### 1. Set Realistic CPU Budgets

Profile your process to determine actual CPU usage:

```typescript
function profileMyProcess() {
  const start = Game.cpu.getUsed();
  
  myProcessLogic();
  
  const end = Game.cpu.getUsed();
  console.log(`Process CPU: ${(end - start).toFixed(3)}`);
}

// Run for 100 ticks to get average
// Then set cpuBudget to average * 1.5 (safety margin)
```

### 2. Use Appropriate Intervals

Don't run expensive operations every tick:

```typescript
// Bad: Market analysis every tick
kernel.registerProcess({
  id: 'market',
  execute: expensiveMarketAnalysis,
  cpuBudget: 2.0,
  interval: 1  // ❌ Too frequent
});

// Good: Market analysis every 50 ticks
kernel.registerProcess({
  id: 'market',
  execute: expensiveMarketAnalysis,
  cpuBudget: 2.0,
  interval: 50  // ✅ Reasonable frequency
});
```

### 3. Require High Bucket for Expensive Operations

```typescript
kernel.registerProcess({
  id: 'layout:planning',
  execute: planRoomLayout,
  cpuBudget: 3.0,
  interval: 100,
  minBucket: 8000,  // Only when bucket very healthy
  priority: ProcessPriority.LOW
});
```

### 4. Handle Errors Gracefully

```typescript
kernel.registerProcess({
  id: 'my-process',
  execute: () => {
    try {
      myProcessLogic();
    } catch (error) {
      console.log(`Error in my-process: ${error}`);
      // Don't crash the kernel
    }
  },
  cpuBudget: 0.5
});
```

### 5. Clean Up Resources

If your process creates data, clean it up when done:

```typescript
function createCachedProcess() {
  const cache = new Map();
  
  return {
    id: 'cached-process',
    execute: () => {
      // Use cache
      processWithCache(cache);
      
      // Periodic cleanup
      if (Game.time % 100 === 0) {
        cache.clear();
      }
    },
    cpuBudget: 0.3
  };
}
```

---

## Examples

### Example 1: Room Maintenance Process

```typescript
import { kernel, ProcessPriority } from '@ralphschuler/screeps-kernel';

kernel.registerProcess({
  id: 'maintenance:roads',
  name: 'Road Maintenance',
  priority: ProcessPriority.LOW,
  cpuBudget: 0.5,
  interval: 20,
  execute: () => {
    for (const room of Object.values(Game.rooms)) {
      if (!room.controller?.my) continue;
      
      // Find damaged roads
      const damagedRoads = room.find(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_ROAD && s.hits < s.hitsMax
      });
      
      // Create repair tasks
      for (const road of damagedRoads.slice(0, 5)) {  // Max 5 per room
        // Add to task queue or set construction sites
      }
    }
  }
});
```

### Example 2: Statistics Collection Process

```typescript
import { kernel, ProcessPriority } from '@ralphschuler/screeps-kernel';
import { StatsCollector } from '@ralphschuler/screeps-stats';

const stats = new StatsCollector();

kernel.registerProcess({
  id: 'stats:collection',
  name: 'Statistics Collection',
  priority: ProcessPriority.LOW,
  cpuBudget: 0.3,
  interval: 10,
  execute: () => {
    stats.collect({
      rooms: Object.values(Game.rooms).filter(r => r.controller?.my),
      creeps: Object.values(Game.creeps),
      cpu: Game.cpu.getUsed(),
      bucket: Game.cpu.bucket
    });
  }
});

kernel.registerProcess({
  id: 'stats:export',
  name: 'Statistics Export',
  priority: ProcessPriority.MINIMAL,
  cpuBudget: 1.0,
  interval: 100,
  minBucket: 5000,
  execute: () => {
    stats.export(); // Export to Grafana, console, etc.
  }
});
```

### Example 3: Dynamic Process Creation

```typescript
import { kernel, ProcessPriority } from '@ralphschuler/screeps-kernel';

// Create a process for each owned room
for (const room of Object.values(Game.rooms)) {
  if (!room.controller?.my) continue;
  
  kernel.registerProcess({
    id: `room:${room.name}:economy`,
    name: `${room.name} Economy`,
    priority: ProcessPriority.HIGH,
    cpuBudget: 0.1,
    execute: () => {
      const roomObj = Game.rooms[room.name];
      if (!roomObj) return;
      
      // Room-specific economy logic
      manageRoomEconomy(roomObj);
    }
  });
}
```

---

## Related Documentation

- **[Kernel Package](../../../packages/@ralphschuler/screeps-kernel/README.md)** - Full kernel documentation
- **[Core Concepts](../core-concepts.md#kernel--process-management)** - Kernel overview
- **[Performance Guide](../performance.md#cpu-budget-system)** - CPU optimization

---

**Last Updated**: 2026-01-27  
**Framework Version**: 0.1.0
