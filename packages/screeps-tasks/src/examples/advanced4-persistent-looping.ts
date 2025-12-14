/**
 * Advanced Example 4: Persistent Looping Task with Serialization
 * 
 * This example demonstrates:
 * 1. Creating a looping task that persists across ticks
 * 2. Saving tasks to creep memory
 * 3. Loading tasks from creep memory
 * 4. Using the action registry for deserialization
 */

import { taskManager, defaultActionRegistry } from '../index';
import { HarvestEnergyAction } from '../actions/HarvestEnergyAction';
import { TransferEnergyAction } from '../actions/TransferEnergyAction';
import { TaskStatus } from '../types';

export function persistentLoopingHarvester(creep: Creep) {
  // Try to load existing task from creep memory
  let task = taskManager.loadTaskFromCreep(creep, defaultActionRegistry);

  // If no task exists or task failed, create a new one
  if (!task || task.status === TaskStatus.FAILED) {
    const source = creep.pos.findClosestByPath(FIND_SOURCES);
    const spawn = creep.room.find(FIND_MY_SPAWNS)[0];

    if (!source || !spawn) return;

    // Create a looping task - it will repeat indefinitely
    task = taskManager.createTask({
      creepId: creep.name,
      actions: [new HarvestEnergyAction(source), new TransferEnergyAction(spawn)],
      loop: true // This task will loop forever
    });

    // Save the task to creep memory for persistence
    taskManager.saveTaskToCreep(creep, task);
  }

  // Execute the task
  const success = taskManager.executeTask(task.id, creep);

  // Save task state after execution (to preserve progress)
  if (success) {
    taskManager.saveTaskToCreep(creep, task);
  } else if (task.status === TaskStatus.FAILED) {
    // Clear failed task from memory
    delete creep.memory.task;
  }
}

/**
 * Usage in main loop:
 * 
 * import { persistentLoopingHarvester } from './examples/advanced4-persistent-looping';
 * 
 * export function loop() {
 *   for (const name in Game.creeps) {
 *     const creep = Game.creeps[name];
 *     if (creep.memory.role === 'harvester') {
 *       persistentLoopingHarvester(creep);
 *     }
 *   }
 * }
 * 
 * Benefits of this approach:
 * - Tasks persist between global resets
 * - Task progress is maintained (currentActionIndex)
 * - Looping tasks automatically restart when complete
 * - Less CPU used recreating tasks each tick
 */
