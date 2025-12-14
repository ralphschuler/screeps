# Screeps Tasks Library

A minimal, flexible task system for Screeps creeps. This library allows you to assign tasks to creeps, turning them into simple task runners that execute sequences of actions.

## Features

- **Simple Task Model**: Tasks consist of an ID, creep assignment, status, loop flag, and a sequence of actions
- **Modular Actions**: Small, reusable action modules (harvest, transfer, moveTo, etc.)
- **Composite Actions**: Combine basic actions into higher-level behaviors
- **Predictable Task IDs**: Task IDs are generated deterministically based on creep name and game time
- **Task Lifecycle**: Automatic tracking of task status (pending, processing, finished, failed)
- **Looping Tasks**: Tasks can be configured to loop indefinitely or run once
- **Memory Persistence**: Built-in serialization/deserialization for saving tasks to creep memory
- **Extensible**: Override serialize/deserialize methods for custom persistence behavior
- **Flexible**: Easy to extend with custom actions and task management strategies

## Installation

```bash
cd packages/screeps-tasks
npm install
npm run build
```

## Core Concepts

### Task

A task represents a sequence of actions that a creep should execute:

```typescript
interface Task {
  id: string;              // Unique, predictable task ID
  creepId: string;         // Assigned creep name
  status: TaskStatus;      // pending, processing, finished, failed
  actions: Action[];       // Array of actions to execute
  currentActionIndex: number;
  loop: boolean;           // Whether task repeats when finished
}
```

### Action

An action is a single operation that a creep can perform:

```typescript
interface Action {
  readonly type: string;
  execute(creep: Creep): ActionResult;
  serialize?(): SerializedAction;  // Optional: for persistence
}
```

Actions return an `ActionResult` indicating success/failure and completion status:

```typescript
interface ActionResult {
  success: boolean;      // Whether the action executed successfully
  error?: string;        // Error message if failed
  completed?: boolean;   // Whether the action is complete
}
```

### Task Manager

The `TaskManager` handles task lifecycle and execution:

```typescript
import { taskManager } from '@ralphschuler/screeps-tasks';

// Create a task
const task = taskManager.createTask({
  creepId: creep.name,
  actions: [/* actions */],
  loop: false  // Optional: set to true for repeating tasks
});

// Execute a task
taskManager.executeTask(task.id, creep);

// Get active task for a creep
const activeTask = taskManager.getActiveTask(creep.name);

// Save task to creep memory
taskManager.saveTaskToCreep(creep, task);

// Load task from creep memory
const loadedTask = taskManager.loadTaskFromCreep(creep, actionRegistry);
```

## Memory Persistence

Tasks can be saved to and loaded from creep memory for persistence between global resets:

```typescript
import { taskManager, defaultActionRegistry, HarvestEnergyAction, TransferEnergyAction } from '@ralphschuler/screeps-tasks';

function persistentHarvester(creep: Creep) {
  // Try to load existing task from memory
  let task = taskManager.loadTaskFromCreep(creep, defaultActionRegistry);
  
  if (!task) {
    // Create a new looping task
    const source = creep.pos.findClosestByPath(FIND_SOURCES);
    const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
    
    task = taskManager.createTask({
      creepId: creep.name,
      actions: [new HarvestEnergyAction(source), new TransferEnergyAction(spawn)],
      loop: true  // Task will repeat indefinitely
    });
    
    // Save to memory
    taskManager.saveTaskToCreep(creep, task);
  }
  
  // Execute and save progress
  taskManager.executeTask(task.id, creep);
  taskManager.saveTaskToCreep(creep, task);
}
```

### Custom Serialization

Override `serializeTask` and `deserializeTask` for custom persistence behavior:

```typescript
class MyTaskManager extends TaskManager {
  serializeTask(task: Task): SerializedTask {
    // Custom serialization logic
    return super.serializeTask(task);
  }
  
  deserializeTask(serialized: SerializedTask, actionRegistry: ActionRegistry): Task {
    // Custom deserialization logic
    return super.deserializeTask(serialized, actionRegistry);
  }
}
```

## Available Actions

### Basic Actions

- **MoveToAction**: Move to a target position or object
- **HarvestAction**: Harvest from a source or mineral
- **TransferAction**: Transfer resources to a target
- **WithdrawAction**: Withdraw resources from a structure
- **UpgradeAction**: Upgrade a controller
- **BuildAction**: Build a construction site

### Composite Actions

- **HarvestEnergyAction**: Move to a source and harvest energy
- **TransferEnergyAction**: Move to a target and transfer energy
- **UpgradeControllerAction**: Move to controller and upgrade it

## Basic Examples

### Example 1: Simple Harvester

A creep that harvests energy and delivers it to the spawn:

```typescript
import { taskManager, HarvestEnergyAction, TransferEnergyAction, TaskStatus } from '@ralphschuler/screeps-tasks';

function simpleHarvester(creep: Creep) {
  let task = taskManager.getActiveTask(creep.name);

  if (!task || task.status === TaskStatus.FINISHED) {
    const source = creep.pos.findClosestByPath(FIND_SOURCES);
    const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
    
    task = taskManager.createTask({
      creepId: creep.name,
      actions: [
        new HarvestEnergyAction(source),
        new TransferEnergyAction(spawn)
      ]
    });
  }

  taskManager.executeTask(task.id, creep);
}
```

### Example 2: Simple Upgrader

A creep that withdraws energy from spawn and upgrades the controller:

```typescript
import { taskManager, MoveToAction, WithdrawAction, UpgradeControllerAction, TaskStatus } from '@ralphschuler/screeps-tasks';

function simpleUpgrader(creep: Creep) {
  let task = taskManager.getActiveTask(creep.name);

  if (!task || task.status === TaskStatus.FINISHED) {
    const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
    const controller = creep.room.controller;
    
    task = taskManager.createTask({
      creepId: creep.name,
      actions: [
        new MoveToAction(spawn, 1),
        new WithdrawAction(spawn, RESOURCE_ENERGY),
        new UpgradeControllerAction(controller)
      ]
    });
  }

  taskManager.executeTask(task.id, creep);
}
```

### Example 3: Simple Builder

A creep that harvests energy and builds construction sites:

```typescript
import { taskManager, HarvestEnergyAction, MoveToAction, BuildAction, TaskStatus } from '@ralphschuler/screeps-tasks';

function simpleBuilder(creep: Creep) {
  let task = taskManager.getActiveTask(creep.name);

  if (!task || task.status === TaskStatus.FINISHED) {
    const source = creep.pos.findClosestByPath(FIND_SOURCES);
    const site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    
    if (site) {
      task = taskManager.createTask({
        creepId: creep.name,
        actions: [
          new HarvestEnergyAction(source),
          new MoveToAction(site, 3),
          new BuildAction(site)
        ]
      });
    }
  }

  if (task) {
    taskManager.executeTask(task.id, creep);
  }
}
```

## Advanced Examples

### Example 1: Multi-Task Creep

A creep that dynamically chooses between filling spawn, building, or upgrading:

```typescript
import { taskManager, HarvestEnergyAction, TransferEnergyAction, UpgradeControllerAction, MoveToAction, BuildAction, TaskStatus } from '@ralphschuler/screeps-tasks';

function multiTaskCreep(creep: Creep) {
  let task = taskManager.getActiveTask(creep.name);

  if (!task || task.status === TaskStatus.FINISHED || task.status === TaskStatus.FAILED) {
    const source = creep.pos.findClosestByPath(FIND_SOURCES);
    const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
    const controller = creep.room.controller;
    const site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);

    // Priority 1: Fill spawn if low on energy
    if (spawn && spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 100) {
      task = taskManager.createTask({
        creepId: creep.name,
        actions: [new HarvestEnergyAction(source), new TransferEnergyAction(spawn)]
      });
    }
    // Priority 2: Build construction sites
    else if (site) {
      task = taskManager.createTask({
        creepId: creep.name,
        actions: [new HarvestEnergyAction(source), new MoveToAction(site, 3), new BuildAction(site)]
      });
    }
    // Priority 3: Upgrade controller
    else if (controller) {
      task = taskManager.createTask({
        creepId: creep.name,
        actions: [new HarvestEnergyAction(source), new UpgradeControllerAction(controller)]
      });
    }
  }

  if (task) {
    taskManager.executeTask(task.id, creep);
  }
}
```

### Example 2: Conditional Tasks

A creep that switches between harvesting and delivering based on energy levels:

```typescript
import { taskManager, HarvestEnergyAction, TransferEnergyAction, TaskStatus } from '@ralphschuler/screeps-tasks';

function conditionalTaskCreep(creep: Creep) {
  let task = taskManager.getActiveTask(creep.name);
  
  const isEmpty = creep.store[RESOURCE_ENERGY] === 0;
  const isFull = creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0;

  if (!task || task.status === TaskStatus.FINISHED || task.status === TaskStatus.FAILED) {
    if (isEmpty) {
      const source = creep.pos.findClosestByPath(FIND_SOURCES);
      task = taskManager.createTask({
        creepId: creep.name,
        actions: [new HarvestEnergyAction(source)]
      });
    } else if (isFull) {
      const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
      task = taskManager.createTask({
        creepId: creep.name,
        actions: [new TransferEnergyAction(spawn)]
      });
    }
  }

  if (task) {
    const success = taskManager.executeTask(task.id, creep);
    if (!success && task.status === TaskStatus.FAILED) {
      taskManager.removeTask(task.id);
    }
  }
}
```

### Example 3: Task Queue with Priorities

Manage multiple tasks with a priority queue:

```typescript
import { taskManager, TaskStatus, Task } from '@ralphschuler/screeps-tasks';

interface PriorityTask {
  priority: number;
  task: Task;
}

const taskQueues: { [creepName: string]: PriorityTask[] } = {};

function addPriorityTask(creepName: string, task: Task, priority: number) {
  if (!taskQueues[creepName]) {
    taskQueues[creepName] = [];
  }
  taskQueues[creepName].push({ priority, task });
  taskQueues[creepName].sort((a, b) => b.priority - a.priority);
}

function taskQueueCreep(creep: Creep) {
  if (!taskQueues[creep.name]) {
    taskQueues[creep.name] = [];
  }

  let activeTask = taskManager.getActiveTask(creep.name);

  if (!activeTask || activeTask.status === TaskStatus.FINISHED || activeTask.status === TaskStatus.FAILED) {
    if (activeTask) {
      taskQueues[creep.name] = taskQueues[creep.name].filter(pt => pt.task.id !== activeTask!.id);
      taskManager.removeTask(activeTask.id);
    }

    if (taskQueues[creep.name].length > 0) {
      activeTask = taskQueues[creep.name][0].task;
    }
  }

  if (activeTask) {
    taskManager.executeTask(activeTask.id, creep);
  }
}
```

## Creating Custom Actions

You can easily create custom actions by implementing the `Action` interface:

```typescript
import { Action, ActionResult } from '@ralphschuler/screeps-tasks';

class RepairAction implements Action {
  readonly type = 'repair';

  constructor(private target: Structure) {}

  execute(creep: Creep): ActionResult {
    if (creep.store[RESOURCE_ENERGY] === 0) {
      return { success: true, completed: true };
    }

    const result = creep.repair(this.target);

    if (result === OK) {
      const stillHasEnergy = creep.store[RESOURCE_ENERGY] > 0;
      const targetNeedsRepair = this.target.hits < this.target.hitsMax;
      return {
        success: true,
        completed: !stillHasEnergy || !targetNeedsRepair
      };
    }

    if (result === ERR_NOT_IN_RANGE) {
      return { success: false, error: 'Not in range to repair' };
    }

    return { success: false, error: `Repair failed with code: ${result}` };
  }
}
```

## Task Cleanup

The task manager provides methods for cleanup:

```typescript
// Remove finished and failed tasks
taskManager.cleanup();

// Remove all tasks for a specific creep
taskManager.removeCreepTasks(creep.name);

// Clear all tasks
taskManager.clear();
```

## Integration in Main Loop

```typescript
import { taskManager } from '@ralphschuler/screeps-tasks';
import { simpleHarvester } from './roles/harvester';
import { simpleUpgrader } from './roles/upgrader';

export function loop() {
  // Clean up tasks for dead creeps
  for (const taskId of Object.keys(taskManager.getAllTasks())) {
    const task = taskManager.getTask(taskId);
    if (task && !Game.creeps[task.creepId]) {
      taskManager.removeTask(taskId);
    }
  }

  // Execute creep roles
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    
    if (creep.memory.role === 'harvester') {
      simpleHarvester(creep);
    } else if (creep.memory.role === 'upgrader') {
      simpleUpgrader(creep);
    }
  }

  // Periodic cleanup
  if (Game.time % 100 === 0) {
    taskManager.cleanup();
  }
}
```

## API Reference

### TaskManager

- `createTask(config: TaskConfig): Task` - Create a new task
- `getTask(taskId: string): Task | undefined` - Get a task by ID
- `getCreepTasks(creepId: string): Task[]` - Get all tasks for a creep
- `getActiveTask(creepId: string): Task | undefined` - Get the active task for a creep
- `executeTask(taskId: string, creep: Creep): boolean` - Execute a task
- `removeTask(taskId: string): boolean` - Remove a task
- `removeCreepTasks(creepId: string): void` - Remove all tasks for a creep
- `cleanup(): void` - Remove finished and failed tasks
- `getAllTasks(): Task[]` - Get all tasks
- `clear(): void` - Clear all tasks

## License

Unlicense

## Contributing

Contributions are welcome! Please see the main repository's CONTRIBUTING.md for guidelines.
