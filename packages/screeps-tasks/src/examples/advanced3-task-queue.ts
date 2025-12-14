/**
 * Advanced Example 3: Task Queue with Priorities
 * 
 * This example demonstrates managing multiple tasks with a priority queue.
 * Tasks are executed in order of priority and creeps can have multiple pending tasks.
 */

import { taskManager } from '../TaskManager';
import { HarvestEnergyAction } from '../actions/HarvestEnergyAction';
import { TransferEnergyAction } from '../actions/TransferEnergyAction';
import { MoveToAction } from '../actions/MoveToAction';
import { BuildAction } from '../actions/BuildAction';
import { UpgradeControllerAction } from '../actions/UpgradeControllerAction';
import { TaskStatus, Task } from '../types';

interface PriorityTask {
  priority: number;
  task: Task;
}

// Global task queue (in a real implementation, store this in Memory)
const taskQueues: { [creepName: string]: PriorityTask[] } = {};

export function addPriorityTask(creepName: string, task: Task, priority: number) {
  if (!taskQueues[creepName]) {
    taskQueues[creepName] = [];
  }

  taskQueues[creepName].push({ priority, task });
  taskQueues[creepName].sort((a, b) => b.priority - a.priority); // Higher priority first
}

export function taskQueueCreep(creep: Creep) {
  // Initialize queue if needed
  if (!taskQueues[creep.name]) {
    taskQueues[creep.name] = [];
  }

  // Get current active task
  let activeTask = taskManager.getActiveTask(creep.name);

  // If no active task or it's finished, get next from queue
  if (
    !activeTask ||
    activeTask.status === TaskStatus.FINISHED ||
    activeTask.status === TaskStatus.FAILED
  ) {
    // Remove finished task from queue
    if (activeTask) {
      taskQueues[creep.name] = taskQueues[creep.name].filter(pt => pt.task.id !== activeTask!.id);
      taskManager.removeTask(activeTask.id);
    }

    // Get next task from queue
    if (taskQueues[creep.name].length > 0) {
      activeTask = taskQueues[creep.name][0].task;
    } else {
      // No tasks in queue, create default tasks based on room needs
      createDefaultTasks(creep);
      return;
    }
  }

  // Execute the active task
  if (activeTask) {
    taskManager.executeTask(activeTask.id, creep);
  }
}

function createDefaultTasks(creep: Creep) {
  const source = creep.pos.findClosestByPath(FIND_SOURCES);
  if (!source) return;

  const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
  const controller = creep.room.controller;
  const constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);

  // Create harvest task
  const harvestTask = taskManager.createTask({
    creepId: creep.name,
    actions: [new HarvestEnergyAction(source)]
  });
  addPriorityTask(creep.name, harvestTask, 10);

  // Emergency: Fill spawn if very low
  if (spawn && spawn.store[RESOURCE_ENERGY] < 100) {
    const emergencyTask = taskManager.createTask({
      creepId: creep.name,
      actions: [new TransferEnergyAction(spawn)]
    });
    addPriorityTask(creep.name, emergencyTask, 100); // Highest priority
  }
  // Build if construction sites exist
  else if (constructionSite) {
    const buildTask = taskManager.createTask({
      creepId: creep.name,
      actions: [new MoveToAction(constructionSite, 3), new BuildAction(constructionSite)]
    });
    addPriorityTask(creep.name, buildTask, 50);
  }
  // Upgrade controller
  else if (controller) {
    const upgradeTask = taskManager.createTask({
      creepId: creep.name,
      actions: [new UpgradeControllerAction(controller)]
    });
    addPriorityTask(creep.name, upgradeTask, 30);
  }
}

/**
 * Usage in main loop:
 * 
 * import { taskQueueCreep, addPriorityTask } from './examples/advanced3-task-queue';
 * 
 * export function loop() {
 *   for (const name in Game.creeps) {
 *     const creep = Game.creeps[name];
 *     if (creep.memory.role === 'worker') {
 *       taskQueueCreep(creep);
 *     }
 *   }
 * 
 *   // Manually add high-priority emergency tasks
 *   if (Game.time % 10 === 0) {
 *     const spawn = Object.values(Game.spawns)[0];
 *     if (spawn && spawn.store[RESOURCE_ENERGY] < 50) {
 *       const workers = Object.values(Game.creeps).filter(c => c.memory.role === 'worker');
 *       if (workers.length > 0) {
 *         const emergencyTask = taskManager.createTask({
 *           creepId: workers[0].name,
 *           actions: [new TransferEnergyAction(spawn)]
 *         });
 *         addPriorityTask(workers[0].name, emergencyTask, 200);
 *       }
 *     }
 *   }
 * }
 */
