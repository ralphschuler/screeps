# OS-Style Process Architecture Examples

This directory contains practical examples demonstrating the OS-style process architecture described in the [GitHub Gist](https://gist.github.com/NhanHo/02949ea3a148c583d57570a1600b4d85).

## Examples

### 1. Mineral Mining (`mineralMining.ts`)

**Scenario**: The mineral mining problem from the Gist.

**Problem**: 
- Minerals regenerate differently than sources
- Need to stop spawning when mineral is depleted
- Couriers should finish ferrying even after mining stops

**Solution**:
The `MineralMiningProcess` demonstrates fine-grained control over when processes run:

```typescript
if (mineralAmount > 0) {
  // Spawn miners and couriers
  memory.shouldSpawnMiners = true;
  memory.shouldSpawnCouriers = true;
} else {
  // Mineral depleted: stop miners, let couriers finish
  memory.shouldSpawnMiners = false;
  
  if (hasDroppedMineral) {
    memory.shouldSpawnCouriers = true;
  } else {
    // All done: kill process
    this.status = ProcessStatus.DEAD;
  }
}
```

**Usage**:
1. Place a flag named `mine-<something>` on a mineral
2. The process automatically starts
3. When mineral is depleted, miners stop but couriers continue
4. When all work is done, process self-terminates

### 2. Task Priority (`taskPriority.ts`)

**Scenario**: The task priority problem from the Gist.

**Problem**:
- Normal mode: Reactions are high priority (use all CPU)
- War mode: Invasion is high priority (use all CPU)
- Need to dynamically swap execution order

**Solution**:
Store priorities in process memory and check them at runtime:

```typescript
// Switch to war mode
Memory.warMode = true;

// Priorities are automatically swapped
Memory.processMemory[invasionPid].priority = 100; // High
Memory.processMemory[labsPid].priority = 25;      // Low

// Processes check priority and CPU before running
if (priority < 75 && cpuUsed > cpuLimit * 0.5) {
  console.log('Skipping due to low priority');
  return;
}
```

**Usage**:
1. Set `Memory.warMode = false` for normal operations
2. Set `Memory.warMode = true` when under attack
3. Priorities automatically adjust
4. High-priority tasks run first, low-priority use leftover CPU

## Key Concepts

### Process Lifecycle

All processes follow this lifecycle:

1. **Create**: `addProcess(new MyProcess(0, -1))`
2. **Initialize Memory**: Set up `Memory.processMemory[pid]`
3. **Run**: Process executes via `runOSKernel()`
4. **Persist**: `storeProcessTable()` saves to Memory
5. **Reload**: `loadProcessTable()` recreates next tick
6. **Terminate**: Set `this.status = ProcessStatus.DEAD`

### Process Memory

Each process has isolated memory in `Memory.processMemory[pid]`:

```typescript
Memory.processMemory[pid] = {
  flagName: 'mine-mineral',
  miners: ['Miner1', 'Miner2'],
  lastAmount: 5000,
  shouldSpawnMiners: true
};
```

Memory persists across ticks and global resets.

### Fine-Grained Control

Processes can make sophisticated decisions:

```typescript
public run(memory: any): void {
  // Check conditions
  if (resource.amount === 0) {
    memory.shouldSpawn = false; // Stop spawning
  }
  
  // Let existing creeps finish
  if (activeCreeps.length === 0) {
    this.status = ProcessStatus.DEAD; // All done
  }
}
```

### Parent-Child Relationships

Organize processes hierarchically:

```typescript
const manager = addProcess(new RoomManager(0, -1));
const harvester = addProcess(new HarvesterProcess(0, manager.pid));
const builder = addProcess(new BuilderProcess(0, manager.pid));

// TODO: Auto-kill children when parent is killed
```

## Integration with Main Loop

Basic integration pattern:

```typescript
import { 
  loadProcessTable, 
  runOSKernel, 
  storeProcessTable 
} from '@ralphschuler/screeps-kernel';

export function loop() {
  // 1. Load processes from Memory
  loadProcessTable();
  
  // 2. Add new processes as needed
  // (see examples for specific patterns)
  
  // 3. Run all active processes
  runOSKernel();
  
  // 4. Save to Memory
  storeProcessTable();
}
```

## Best Practices

### 1. Register Before Loading

Always register process classes before loading:

```typescript
registerProcessClass('MiningProcess', MiningProcess);
loadProcessTable(); // Now it can instantiate MiningProcess
```

### 2. Check Before Adding

Avoid duplicate processes:

```typescript
const existingPid = Memory.miningProcesses?.[flagName];
if (existingPid === undefined) {
  // Create new process
  const process = addProcess(new MiningProcess(0, -1));
  Memory.miningProcesses[flagName] = process.pid;
}
```

### 3. Clean Up Memory

Remove process memory when done:

```typescript
public run(memory: any): void {
  if (shouldTerminate) {
    this.status = ProcessStatus.DEAD;
    // Memory is automatically cleared by killProcess
  }
}
```

### 4. Handle Errors

Processes fail independently:

```typescript
public run(memory: any): void {
  const obj = Game.getObjectById(memory.id);
  if (!obj) {
    console.log('Object not found, stopping');
    this.status = ProcessStatus.DEAD;
    return; // Don't throw
  }
  // Continue...
}
```

## Testing

Run the kernel tests to validate the architecture:

```bash
npm run test:kernel
```

All examples follow the patterns validated by the test suite.

## Further Reading

- [OS Architecture Documentation](../docs/OS_ARCHITECTURE.md)
- [Original Gist](https://gist.github.com/NhanHo/02949ea3a148c583d57570a1600b4d85)
- [Main README](../README.md)
