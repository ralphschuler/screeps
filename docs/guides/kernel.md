# Kernel & Process System Developer Guide

## Overview

The Kernel is the central coordinator for all bot operations. It manages process execution, CPU budgets, priority scheduling, and inter-process communication through a unified event system.

**Key Principles (from ROADMAP.md):**
- **Strict CPU Budgets**: Economy rooms ≤ 0.1 CPU, War rooms ≤ 0.25 CPU, Global logic ≤ 1 CPU
- **Rolling Index Execution**: All processes get fair execution time via wrap-around queue
- **Frequency Tiers**: High (every tick), Medium (5-20 ticks), Low (≥100 ticks)
- **Event-Driven**: Critical events trigger immediate updates

## Table of Contents

1. [Architecture](#architecture)
2. [Process Registration](#process-registration)
3. [CPU Budget Management](#cpu-budget-management)
4. [Priority Scheduling](#priority-scheduling)
5. [Event System](#event-system)
6. [Creating Processes](#creating-processes)
7. [Advanced Patterns](#advanced-patterns)
8. [Performance Monitoring](#performance-monitoring)
9. [Troubleshooting](#troubleshooting)

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        KERNEL                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Process Registry                          │   │
│  │  • High Priority Queue    [P1, P2, P3, ...]        │   │
│  │  • Medium Priority Queue  [P4, P5, P6, ...]        │   │
│  │  • Low Priority Queue     [P7, P8, P9, ...]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         CPU Budget Allocator                        │   │
│  │  • Track CPU usage per process                      │   │
│  │  • Enforce budget limits                            │   │
│  │  • Adaptive budget adjustment                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Scheduler (Wrap-Around Queue)               │   │
│  │  • Fair process execution                           │   │
│  │  • Priority-based ordering                          │   │
│  │  • Frequency-based filtering                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Event Bus                                  │   │
│  │  • Publish/Subscribe system                         │   │
│  │  • Inter-process communication                      │   │
│  │  • Event buffering                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Execution Flow

```
Game Tick Start
      │
      ▼
┌──────────────────┐
│  Kernel.run()    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Check CPU Budget │ ← Bucket level, CPU limit, reserved CPU
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ Select Processes to Execute  │ ← Frequency, priority, budget
└────────┬─────────────────────┘
         │
         ▼
    ┌────────────┐
    │ For Each   │
    │ Process    │
    └─────┬──────┘
          │
          ▼
    ┌─────────────────┐
    │ Record CPU Start│
    └─────┬───────────┘
          │
          ▼
    ┌─────────────────┐
    │ Execute Process │
    └─────┬───────────┘
          │
          ▼
    ┌─────────────────┐
    │ Record CPU Used │
    └─────┬───────────┘
          │
          ▼
    ┌─────────────────┐
    │ Check Budget    │ ← Warn if exceeded
    └─────┬───────────┘
          │
          ▼
    ┌─────────────────┐
    │ Update Stats    │
    └─────┬───────────┘
          │
          └──────┐
                 │
         ┌───────▼────────┐
         │ More Processes?│
         └───────┬────────┘
                 │
         Yes ─────┘  No
                      │
                      ▼
              ┌────────────────┐
              │ Publish Events │
              └────────┬───────┘
                       │
                       ▼
              ┌────────────────┐
              │  Log Stats     │
              └────────┬───────┘
                       │
                       ▼
                Game Tick End
```

### Core Components

**1. Kernel Instance** (`@ralphschuler/screeps-kernel`)
- Singleton managing all processes
- CPU budget enforcement
- Process lifecycle management

**2. Process Registry** (`src/core/processRegistry.ts`)
- Registers all bot processes
- Uses decorators for declarative registration
- Auto-discovery of process classes

**3. Process Decorators** (`src/core/processDecorators.ts`)
- `@ProcessClass()` - Mark classes containing processes
- `@Process()` - Define process methods with metadata

**4. Configuration** (`src/config/index.ts`)
- CPU budgets per frequency tier
- Bucket thresholds for modes
- Task frequencies

---

## Process Registration

### Using Decorators (Recommended)

Decorators provide the cleanest way to define processes:

```typescript
import { ProcessClass, Process, ProcessPriority } from "../core/processDecorators";

@ProcessClass()
export class MyManager {
  
  @Process({
    id: "mySystem:update",
    priority: ProcessPriority.MEDIUM,
    frequency: "medium", // Run every 5-20 ticks
    cpuBudget: 0.05
  })
  public update(): void {
    // Process implementation
    console.log("MyManager update running");
    
    // Do work...
    this.performUpdate();
  }
  
  @Process({
    id: "mySystem:cleanup",
    priority: ProcessPriority.LOW,
    frequency: "low", // Run every 100+ ticks
    cpuBudget: 0.02
  })
  public cleanup(): void {
    console.log("MyManager cleanup running");
    this.performCleanup();
  }
  
  private performUpdate(): void {
    // Implementation details
  }
  
  private performCleanup(): void {
    // Implementation details
  }
}

// Create instance
export const myManager = new MyManager();

// Register in processRegistry.ts
import { myManager } from "./managers/myManager";

export function registerAllProcesses(): void {
  registerAllDecoratedProcesses(
    myManager,
    // ... other managers
  );
}
```

### Manual Registration (Advanced)

For dynamic processes or special cases:

```typescript
import { kernel, ProcessPriority } from "../core/kernel";

// Register a process manually
kernel.registerProcess({
  id: "custom:process",
  priority: ProcessPriority.HIGH,
  frequency: "high",
  execute: () => {
    console.log("Custom process running");
  },
  cpuBudget: 0.03
});
```

### Process Metadata

Each process requires these fields:

```typescript
interface ProcessMetadata {
  // Unique identifier (use namespacing: "system:operation")
  id: string;
  
  // Execution priority (higher = more important)
  priority: ProcessPriority; // HIGH=100, MEDIUM=50, LOW=10
  
  // How often to run
  frequency: "high" | "medium" | "low"; // every tick, 5-20 ticks, 100+ ticks
  
  // CPU budget in CPU units (0.01-1.0)
  cpuBudget: number;
  
  // Minimum bucket level to execute (optional)
  minBucket?: number;
  
  // Function to execute
  execute: () => void;
}
```

### Naming Conventions

Use consistent process ID naming:

```typescript
// Pattern: "<system>:<operation>"

"room:economy"        // Room-level economy management
"room:defense"        // Room-level defense
"cluster:logistics"   // Cluster-level logistics
"empire:market"       // Empire-level market operations
"core:memoryCleanup"  // Core system maintenance
```

---

## CPU Budget Management

### Budget Configuration

CPU budgets are configured in `src/config/index.ts`:

```typescript
export interface CPUConfig {
  budgets: {
    rooms: number;      // Per-room processes (0.1 CPU)
    strategic: number;  // Strategic processes (0.05 CPU)
    market: number;     // Market operations (0.02 CPU)
    visualization: number; // Visual output (0.01 CPU)
  };
  
  bucketThresholds: {
    lowMode: number;    // Enter low-CPU mode (< 2000)
    highMode: number;   // Enter high-performance mode (> 8000)
  };
  
  taskFrequencies: {
    pheromoneUpdate: number;    // 5 ticks
    clusterLogic: number;       // 10 ticks
    marketScan: number;         // 100 ticks
    nukeEvaluation: number;     // 200 ticks
    memoryCleanup: number;      // 500 ticks
  };
}
```

### Budget Enforcement

The kernel tracks CPU usage and warns when budgets are exceeded:

```typescript
// In your process
@Process({
  id: "mySystem:heavyTask",
  cpuBudget: 0.10 // Allocated budget
})
public heavyTask(): void {
  const startCpu = Game.cpu.getUsed();
  
  // Do work...
  this.performHeavyCalculation();
  
  const usedCpu = Game.cpu.getUsed() - startCpu;
  
  // Kernel automatically logs if usedCpu > 0.10 * 1.5 (budget * threshold)
}
```

### Adaptive Budgets

Enable adaptive budgets for dynamic allocation:

```typescript
// In kernel config
export function buildKernelConfigFromCpu(cpuConfig: CPUConfig) {
  return {
    // ...
    enableAdaptiveBudgets: true,
    adaptiveBudgetConfig: {
      minBudgetMultiplier: 0.5,  // Can reduce to 50% of base
      maxBudgetMultiplier: 2.0,  // Can increase to 200% of base
      adjustmentRate: 0.1,       // 10% adjustment per interval
      historyWindow: 100         // Track last 100 executions
    }
  };
}
```

With adaptive budgets:
- **Underutilized** processes get budget reduced (CPU saved)
- **Overutilized** processes get budget increased (avoid starvation)
- Budget changes happen gradually to prevent thrashing

### Bucket-Based Throttling

Control process execution based on CPU bucket:

```typescript
@Process({
  id: "expensive:calculation",
  cpuBudget: 0.20,
  minBucket: 5000 // Only run when bucket > 5000
})
public expensiveCalculation(): void {
  // This won't run if bucket is too low
  this.performExpensiveWork();
}
```

Bucket mode thresholds:

```typescript
// Configured in CPUConfig
bucketThresholds: {
  lowMode: 2000,   // < 2000: Skip low-priority processes
  highMode: 8000   // > 8000: Run all processes freely
}
```

---

## Priority Scheduling

### Priority Levels

```typescript
export enum ProcessPriority {
  CRITICAL = 200,  // System critical (spawning, tower defense)
  HIGH = 100,      // Important (room economy, defense coordination)
  MEDIUM = 50,     // Normal operations (logistics, building)
  LOW = 10,        // Optional (statistics, visualization)
  BACKGROUND = 1   // Nice-to-have (exploration, long-term planning)
}
```

### Wrap-Around Queue

The kernel uses a wrap-around queue to ensure fair execution:

```
Tick 1:  Execute P1, P2, P3 (out of CPU) → Resume at P4 next tick
Tick 2:  Execute P4, P5, P6 (out of CPU) → Resume at P7 next tick
Tick 3:  Execute P7, P8, P1 (wrapped) → Resume at P2 next tick
```

This prevents starvation of low-priority processes.

### Priority Decay

Skipped processes gain temporary priority boost:

```typescript
// Process skipped due to CPU shortage
// Base priority: 50
// Skipped once: +1 → priority = 51
// Skipped twice: +2 → priority = 52
// Executed: Reset to base priority (50)
```

Configuration:

```typescript
{
  enablePriorityDecay: true,
  priorityDecayRate: 1,      // +1 priority per skip
  maxPriorityBoost: 50       // Max +50 priority
}
```

### Example: Priority in Practice

```typescript
// High priority: Spawning (critical for economy)
@Process({
  id: "room:spawning",
  priority: ProcessPriority.HIGH,
  frequency: "high",
  cpuBudget: 0.05
})
public manageSpawning(): void {
  // Always runs first
}

// Medium priority: Building (important but can wait)
@Process({
  id: "room:construction",
  priority: ProcessPriority.MEDIUM,
  frequency: "medium",
  cpuBudget: 0.03
})
public manageConstruction(): void {
  // Runs after high priority
}

// Low priority: Stats (nice to have)
@Process({
  id: "room:statistics",
  priority: ProcessPriority.LOW,
  frequency: "low",
  cpuBudget: 0.01
})
public collectStatistics(): void {
  // Runs when CPU available
}
```

---

## Event System

### Publishing Events

Processes can communicate via events:

```typescript
import { kernel } from "../core/kernel";

@ProcessClass()
export class DefenseManager {
  
  @Process({
    id: "defense:threatDetection",
    priority: ProcessPriority.HIGH,
    frequency: "high",
    cpuBudget: 0.02
  })
  public detectThreats(): void {
    const room = Game.rooms['W1N1'];
    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    
    if (hostiles.length > 0) {
      // Publish event to notify other processes
      kernel.publishEvent({
        type: "threat:detected",
        data: {
          roomName: room.name,
          hostileCount: hostiles.length,
          threatLevel: this.assessThreatLevel(hostiles)
        },
        priority: ProcessPriority.CRITICAL
      });
    }
  }
}
```

### Subscribing to Events

Other processes can listen for events:

```typescript
@ProcessClass()
export class MilitaryCoordinator {
  
  constructor() {
    // Subscribe to threat events
    kernel.subscribeToEvent("threat:detected", (event) => {
      this.respondToThreat(event.data);
    });
  }
  
  private respondToThreat(data: any): void {
    console.log(`Threat detected in ${data.roomName}: ${data.hostileCount} hostiles`);
    
    // Coordinate military response
    this.deployDefenders(data.roomName, data.threatLevel);
  }
}
```

### Event Types

Define event types for type safety:

```typescript
// src/core/events.ts

export interface GameEvent {
  type: string;
  data: any;
  priority?: ProcessPriority;
  timestamp?: number;
}

export interface ThreatDetectedEvent extends GameEvent {
  type: "threat:detected";
  data: {
    roomName: string;
    hostileCount: number;
    threatLevel: number;
  };
}

export interface ResourceDepletedEvent extends GameEvent {
  type: "resource:depleted";
  data: {
    roomName: string;
    resourceType: ResourceConstant;
    sourceId: Id<Source>;
  };
}

// Usage
kernel.publishEvent<ThreatDetectedEvent>({
  type: "threat:detected",
  data: {
    roomName: "W1N1",
    hostileCount: 5,
    threatLevel: 2
  }
});
```

### Event Buffering

Events are buffered and delivered at the end of the tick:

```
Process A publishes event → Buffer
Process B publishes event → Buffer
Process C publishes event → Buffer
                             │
                             ▼
                    End of tick: Deliver all events
                             │
                             ▼
           Subscribers notified next tick
```

This prevents mid-tick state changes and ensures consistency.

---

## Creating Processes

### Step 1: Define the Process Class

```typescript
// src/managers/mySystemManager.ts

import { ProcessClass, Process, ProcessPriority } from "../core/processDecorators";

@ProcessClass()
export class MySystemManager {
  
  // State (if needed)
  private state: any = {};
  
  // Constructor
  constructor() {
    this.initialize();
  }
  
  private initialize(): void {
    // Setup code
  }
  
  // High frequency process (every tick)
  @Process({
    id: "mySystem:critical",
    priority: ProcessPriority.HIGH,
    frequency: "high",
    cpuBudget: 0.02
  })
  public criticalUpdate(): void {
    // Runs every tick
    for (const room of Object.values(Game.rooms)) {
      this.processCriticalLogic(room);
    }
  }
  
  // Medium frequency process (every 5-20 ticks)
  @Process({
    id: "mySystem:update",
    priority: ProcessPriority.MEDIUM,
    frequency: "medium",
    cpuBudget: 0.05
  })
  public regularUpdate(): void {
    // Runs every 5-20 ticks
    this.performRegularMaintenance();
  }
  
  // Low frequency process (every 100+ ticks)
  @Process({
    id: "mySystem:cleanup",
    priority: ProcessPriority.LOW,
    frequency: "low",
    cpuBudget: 0.01,
    minBucket: 3000 // Only when bucket > 3000
  })
  public cleanup(): void {
    // Runs infrequently
    this.performHeavyCleanup();
  }
  
  // Helper methods
  private processCriticalLogic(room: Room): void {
    // Implementation
  }
  
  private performRegularMaintenance(): void {
    // Implementation
  }
  
  private performHeavyCleanup(): void {
    // Implementation
  }
}

// Export singleton instance
export const mySystemManager = new MySystemManager();
```

### Step 2: Register the Process

```typescript
// src/core/processRegistry.ts

import { mySystemManager } from "../managers/mySystemManager";

export function registerAllProcesses(): void {
  logger.info("Registering all processes with kernel...");
  
  registerAllDecoratedProcesses(
    // ... existing managers
    mySystemManager, // Add your manager here
    // ... other managers
  );
  
  logger.info(`Registered ${kernel.getProcesses().length} processes`);
}
```

### Step 3: Test the Process

```typescript
// test/unit/mySystemManager.test.ts

import { mySystemManager } from "../../src/managers/mySystemManager";
import { kernel } from "../../src/core/kernel";

describe("MySystemManager", () => {
  
  beforeEach(() => {
    // Setup test environment
  });
  
  it("should register processes", () => {
    const processes = kernel.getProcesses();
    const myProcesses = processes.filter(p => p.id.startsWith("mySystem:"));
    
    expect(myProcesses.length).toBe(3);
    expect(myProcesses.map(p => p.id)).toContain("mySystem:critical");
    expect(myProcesses.map(p => p.id)).toContain("mySystem:update");
    expect(myProcesses.map(p => p.id)).toContain("mySystem:cleanup");
  });
  
  it("should execute critical update", () => {
    const spy = jest.spyOn(mySystemManager as any, 'processCriticalLogic');
    
    mySystemManager.criticalUpdate();
    
    expect(spy).toHaveBeenCalled();
  });
  
  it("should respect CPU budget", () => {
    const startCpu = Game.cpu.getUsed();
    
    mySystemManager.criticalUpdate();
    
    const usedCpu = Game.cpu.getUsed() - startCpu;
    expect(usedCpu).toBeLessThan(0.02 * 1.5); // Within budget + threshold
  });
});
```

---

## Advanced Patterns

### Conditional Process Execution

Skip process execution based on game state:

```typescript
@Process({
  id: "market:trading",
  priority: ProcessPriority.MEDIUM,
  frequency: "low",
  cpuBudget: 0.10
})
public tradeOnMarket(): void {
  // Only run if we have a terminal
  const roomsWithTerminals = Object.values(Game.rooms).filter(r => r.terminal);
  if (roomsWithTerminals.length === 0) {
    return; // Early exit
  }
  
  // Only run if bucket is healthy
  if (Game.cpu.bucket < 5000) {
    return; // Skip when low on CPU
  }
  
  // Proceed with trading
  this.performMarketOperations(roomsWithTerminals);
}
```

### Multi-Stage Processing

Break large operations into stages across multiple ticks:

```typescript
@ProcessClass()
export class PathfindingManager {
  
  private stage: number = 0;
  private totalStages: number = 5;
  
  @Process({
    id: "pathfinding:recalculate",
    priority: ProcessPriority.LOW,
    frequency: "low",
    cpuBudget: 0.15
  })
  public recalculatePaths(): void {
    // Process one stage per execution
    switch (this.stage) {
      case 0:
        this.collectRooms();
        break;
      case 1:
        this.analyzeTerrain();
        break;
      case 2:
        this.buildCostMatrices();
        break;
      case 3:
        this.calculatePaths();
        break;
      case 4:
        this.cachePaths();
        break;
    }
    
    // Advance to next stage
    this.stage = (this.stage + 1) % this.totalStages;
  }
}
```

### Room-Specific Processes

Create processes for individual rooms:

```typescript
@ProcessClass()
export class RoomEconomyManager {
  
  @Process({
    id: "room:economy",
    priority: ProcessPriority.HIGH,
    frequency: "high",
    cpuBudget: 0.10
  })
  public manageAllRooms(): void {
    // Process each room
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      
      // Check CPU budget before processing
      if (Game.cpu.getUsed() > Game.cpu.limit * 0.9) {
        break; // Stop if running low on CPU
      }
      
      this.processRoom(room);
    }
  }
  
  private processRoom(room: Room): void {
    const startCpu = Game.cpu.getUsed();
    
    // Room-specific economy logic
    this.balanceEnergy(room);
    this.manageLinks(room);
    this.optimizeHaulers(room);
    
    const usedCpu = Game.cpu.getUsed() - startCpu;
    
    // Warn if room exceeds per-room budget
    if (usedCpu > 0.1) {
      console.log(`⚠️ Room ${room.name} exceeded CPU budget: ${usedCpu.toFixed(3)}`);
    }
  }
}
```

### Event-Driven Processes

Combine scheduled and event-driven execution:

```typescript
@ProcessClass()
export class DefenseCoordinator {
  
  constructor() {
    // Subscribe to threat events
    kernel.subscribeToEvent("threat:detected", (event) => {
      this.handleThreat(event.data);
    });
  }
  
  // Scheduled: Regular patrol
  @Process({
    id: "defense:patrol",
    priority: ProcessPriority.MEDIUM,
    frequency: "medium",
    cpuBudget: 0.03
  })
  public patrolRooms(): void {
    // Regular monitoring
    for (const room of Object.values(Game.rooms)) {
      this.checkForThreats(room);
    }
  }
  
  // Event-driven: Respond to threats
  private handleThreat(data: any): void {
    // Immediate response to event
    console.log(`🚨 Emergency: Threat in ${data.roomName}`);
    this.deployEmergencyDefenders(data.roomName);
  }
}
```

---

## Performance Monitoring

### Built-in Statistics

The kernel tracks comprehensive statistics:

```typescript
interface ProcessStats {
  executions: number;      // Total executions
  totalCpu: number;        // Total CPU used
  averageCpu: number;      // Average CPU per execution
  maxCpu: number;          // Peak CPU usage
  budgetExceeded: number;  // Times budget was exceeded
  skipped: number;         // Times skipped (CPU shortage)
}

// Access stats
const stats = kernel.getProcessStats("mySystem:update");
console.log(`Avg CPU: ${stats.averageCpu.toFixed(3)}`);
console.log(`Budget exceeded: ${stats.budgetExceeded} times`);
```

### Logging Statistics

Configure automatic stats logging:

```typescript
// In kernel config
{
  enableStats: true,
  statsLogInterval: 100 // Log every 100 ticks
}

// Output example:
// Tick 100: Process Stats
//   room:economy       - Avg: 0.045 CPU, Max: 0.089 CPU, Budget: 0.100 CPU ✓
//   cluster:defense    - Avg: 0.023 CPU, Max: 0.067 CPU, Budget: 0.050 CPU ✓
//   empire:market      - Avg: 0.156 CPU, Max: 0.234 CPU, Budget: 0.100 CPU ⚠️
```

### Custom Performance Tracking

Add custom metrics to processes:

```typescript
@ProcessClass()
export class CustomManager {
  
  private metrics = {
    itemsProcessed: 0,
    errorsEncountered: 0,
    lastRunTime: 0
  };
  
  @Process({
    id: "custom:process",
    priority: ProcessPriority.MEDIUM,
    frequency: "medium",
    cpuBudget: 0.05
  })
  public process(): void {
    const start = Game.cpu.getUsed();
    
    try {
      // Process logic
      const processed = this.doWork();
      this.metrics.itemsProcessed += processed;
      
    } catch (error) {
      this.metrics.errorsEncountered++;
      console.log(`Error in custom process: ${error}`);
    }
    
    this.metrics.lastRunTime = Game.cpu.getUsed() - start;
  }
  
  // Expose metrics for monitoring
  public getMetrics() {
    return { ...this.metrics };
  }
}

// Query metrics
const metrics = customManager.getMetrics();
console.log(`Processed ${metrics.itemsProcessed} items with ${metrics.errorsEncountered} errors`);
```

### Grafana Integration

Export metrics to Grafana for visualization:

```typescript
@Process({
  id: "core:metricsExport",
  priority: ProcessPriority.LOW,
  frequency: "low",
  cpuBudget: 0.02
})
public exportMetrics(): void {
  // Collect kernel stats
  const allStats = kernel.getAllProcessStats();
  
  // Export to Memory for Grafana
  if (!Memory.stats) Memory.stats = {};
  Memory.stats.processes = {};
  
  for (const [processId, stats] of Object.entries(allStats)) {
    Memory.stats.processes[processId] = {
      avgCpu: stats.averageCpu,
      maxCpu: stats.maxCpu,
      executions: stats.executions,
      budgetExceeded: stats.budgetExceeded
    };
  }
}
```

---

## Troubleshooting

### Common Issues

#### Issue: Process Not Executing

**Symptoms**: Process registered but never runs

**Diagnosis**:
```typescript
// Check if process is registered
const process = kernel.getProcess("mySystem:update");
console.log(`Process found: ${process ? 'Yes' : 'No'}`);

// Check process state
if (process) {
  console.log(`Priority: ${process.priority}`);
  console.log(`Frequency: ${process.frequency}`);
  console.log(`Last execution: ${process.lastRun || 'Never'}`);
}
```

**Solutions**:
1. Verify process is registered in `processRegistry.ts`
2. Check frequency matches expected interval
3. Ensure bucket is above `minBucket` (if set)
4. Verify CPU budget allows execution

#### Issue: CPU Budget Constantly Exceeded

**Symptoms**: Process exceeds budget warning every execution

**Diagnosis**:
```typescript
const stats = kernel.getProcessStats("mySystem:heavyTask");
console.log(`Average CPU: ${stats.averageCpu}`);
console.log(`Budget: ${process.cpuBudget}`);
console.log(`Exceeded ${stats.budgetExceeded} times`);
```

**Solutions**:
1. Increase CPU budget if justified
2. Optimize process code (cache, reduce finds)
3. Split into multiple processes
4. Lower frequency (high → medium → low)
5. Add conditional early exits

```typescript
@Process({
  id: "mySystem:optimized",
  cpuBudget: 0.05
})
public optimizedProcess(): void {
  // Early exit conditions
  if (Game.cpu.bucket < 3000) return;
  if (Object.keys(Game.rooms).length === 0) return;
  
  // Cache expensive operations
  const cached = this.getCachedData();
  if (cached) {
    this.processWithCache(cached);
    return;
  }
  
  // Perform work
  this.doExpensiveWork();
}
```

#### Issue: Processes Running in Wrong Order

**Symptoms**: Low priority process runs before high priority

**Diagnosis**:
```typescript
const processes = kernel.getProcesses();
processes.sort((a, b) => b.priority - a.priority);

for (const p of processes.slice(0, 10)) {
  console.log(`${p.id}: Priority ${p.priority}`);
}
```

**Solutions**:
1. Verify priority values are correct
2. Check that high-priority processes have lower frequency (they execute less often but first)
3. Enable priority decay to prevent starvation

#### Issue: Event Not Received

**Symptoms**: Event published but subscriber not notified

**Diagnosis**:
```typescript
// In publisher
kernel.publishEvent({
  type: "test:event",
  data: { message: "Hello" }
});
console.log("Event published");

// In subscriber
kernel.subscribeToEvent("test:event", (event) => {
  console.log("Event received:", event.data);
});
```

**Solutions**:
1. Verify event type strings match exactly
2. Ensure subscriber is registered before event is published
3. Check that subscriber runs after event buffering completes
4. Events are delivered NEXT tick, not immediately

---

## Best Practices

### CPU Budget Guidelines

```typescript
// Recommended budgets by frequency

// High frequency (every tick)
// - Room critical: 0.01-0.05 CPU
// - Spawning: 0.02-0.05 CPU
// - Tower defense: 0.01-0.03 CPU

@Process({ cpuBudget: 0.03, frequency: "high" })

// Medium frequency (5-20 ticks)
// - Logistics: 0.03-0.10 CPU
// - Construction: 0.02-0.05 CPU
// - Link balancing: 0.01-0.03 CPU

@Process({ cpuBudget: 0.05, frequency: "medium" })

// Low frequency (100+ ticks)
// - Market analysis: 0.05-0.15 CPU
// - Strategic planning: 0.10-0.30 CPU
// - Memory cleanup: 0.01-0.05 CPU

@Process({ cpuBudget: 0.10, frequency: "low" })
```

### Priority Assignment

```typescript
// Use appropriate priority levels

ProcessPriority.CRITICAL   // System survival (spawning, tower defense)
ProcessPriority.HIGH       // Essential operations (room economy, military)
ProcessPriority.MEDIUM     // Normal operations (building, logistics)
ProcessPriority.LOW        // Optional (stats, visualization, exploration)
ProcessPriority.BACKGROUND // Nice-to-have (long-term planning)
```

### Process Design

```typescript
// Good process design principles

// 1. Single Responsibility
@Process({ id: "spawn:queue" })
public manageSpawnQueue(): void {
  // ONLY manage spawn queue, nothing else
}

// 2. Fail Gracefully
@Process({ id: "market:trade" })
public tradeOnMarket(): void {
  try {
    this.performTrade();
  } catch (error) {
    console.log(`Market trade failed: ${error}`);
    // Continue execution, don't crash
  }
}

// 3. Respect CPU Limits
@Process({ id: "heavy:calculation" })
public heavyCalculation(): void {
  const maxCpu = Game.cpu.limit * 0.1; // Use max 10% of total CPU
  
  for (const item of items) {
    if (Game.cpu.getUsed() > maxCpu) {
      break; // Stop if approaching limit
    }
    this.processItem(item);
  }
}

// 4. Cache Intelligently
@Process({ id: "intel:update" })
public updateIntel(): void {
  // Don't recalculate every tick
  if (Game.time % 10 !== 0) return;
  
  // Do work
}
```

---

## Related Documentation

- [Roles Guide](./roles.md) - Creep roles and behaviors
- [Memory Guide](./memory.md) - Memory management and persistence
- [Pheromones Guide](./pheromones.md) - Pheromone-based coordination
- [Economy Guide](./economy.md) - Economy system integration
- [Defense Guide](./defense.md) - Defense coordination

---

## API Reference

### Kernel Methods

```typescript
class Kernel {
  // Process management
  registerProcess(process: ProcessMetadata): void;
  getProcess(id: string): ProcessMetadata | null;
  getProcesses(): ProcessMetadata[];
  removeProcess(id: string): void;
  
  // Execution
  run(): void;
  
  // Statistics
  getProcessStats(id: string): ProcessStats;
  getAllProcessStats(): Map<string, ProcessStats>;
  
  // Events
  publishEvent(event: GameEvent): void;
  subscribeToEvent(type: string, handler: (event: GameEvent) => void): void;
  unsubscribeFromEvent(type: string, handler: (event: GameEvent) => void): void;
}
```

### Process Decorators

```typescript
// Class decorator
@ProcessClass()
class MyManager { }

// Method decorator
@Process({
  id: string;
  priority: ProcessPriority;
  frequency: "high" | "medium" | "low";
  cpuBudget: number;
  minBucket?: number;
})
public myProcess(): void { }
```

---

**Last Updated**: 2025-01-23  
**Maintainer**: Screeps Bot Team  
**Test Coverage**: 88% (kernelWrapAround, kernelHealthMonitoring, kernelAdaptiveBudgets, kernelSkippedProcesses, kernelTickDistribution)  
**Related Issues**: #5, #26, #30
