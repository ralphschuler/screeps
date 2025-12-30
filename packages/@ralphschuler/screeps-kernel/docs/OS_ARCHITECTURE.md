# OS-Style Process Architecture

Implementation of the process-based OS architecture described in ["Writing an OS for Screeps"](https://gist.github.com/NhanHo/02949ea3a148c583d57570a1600b4d85).

## Overview

This architecture provides:

- **Memory-serialized processes**: Processes are stored in Memory and recreated each tick
- **Process lifecycle management**: Add, kill, and manage processes with unique PIDs
- **Parent-child relationships**: Processes can have parent processes for hierarchical organization
- **Process memory**: Each process has its own isolated memory namespace
- **Automatic persistence**: Process state survives global resets

## Quick Start

### 1. Define a Process Class

```typescript
import { OSProcess, ProcessStatus } from '@ralphschuler/screeps-kernel';

class MiningProcess extends OSProcess {
  constructor(parentPID: number) {
    super(parentPID);
  }

  public run(memory: any): void {
    // Access process memory
    const flagName = memory.flagName;
    
    // Your mining logic here
    const mineral = Game.flags[flagName]?.pos.lookFor(LOOK_MINERALS)[0];
    
    if (mineral && mineral.mineralAmount > 0) {
      // Mine the mineral
      memory.lastAmount = mineral.mineralAmount;
    } else {
      // Stop this process when mineral is depleted
      this.status = ProcessStatus.DEAD;
    }
  }

  public reloadFromMemory(memory: any): void {
    // Restore any transient state needed
    // Called after process is recreated from Memory each tick
  }
}
```

### 2. Register Process Classes

Before loading processes, register all process classes:

```typescript
import { registerProcessClass } from '@ralphschuler/screeps-kernel';

// Register your process classes
registerProcessClass('MiningProcess', MiningProcess);
registerProcessClass('CourierProcess', CourierProcess);
registerProcessClass('DefenseProcess', DefenseProcess);
```

### 3. Main Loop Integration

```typescript
import {
  loadProcessTable,
  runOSKernel,
  storeProcessTable,
  addProcess
} from '@ralphschuler/screeps-kernel';

export function loop() {
  // Load processes from Memory at start of tick
  loadProcessTable();
  
  // Add new processes as needed
  if (Game.flags['mine-mineral']) {
    const miningProcess = new MiningProcess(-1);
    addProcess(miningProcess);
    
    // Initialize process memory
    Memory.processMemory = Memory.processMemory || {};
    Memory.processMemory[miningProcess.pid] = {
      flagName: 'mine-mineral'
    };
  }
  
  // Run all active processes
  runOSKernel();
  
  // Store processes to Memory at end of tick
  storeProcessTable();
}
```

## API Reference

See full documentation in the main README.md

## Credits

Based on ["Writing an OS for Screeps"](https://gist.github.com/NhanHo/02949ea3a148c583d57570a1600b4d85) by NhanHo.
