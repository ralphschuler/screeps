/**
 * Advanced Example 2: Conditional Tasks
 * 
 * This example demonstrates conditional task creation based on creep state.
 * The creep switches between harvesting and delivering based on energy levels.
 */

import { taskManager } from '../TaskManager';
import { HarvestEnergyAction } from '../actions/HarvestEnergyAction';
import { TransferEnergyAction } from '../actions/TransferEnergyAction';
import { TaskStatus } from '../types';

// Custom action that checks a condition
import { Action, ActionResult } from '../types';

class ConditionalAction implements Action {
  readonly type = 'conditional';

  constructor(
    private condition: (creep: Creep) => boolean,
    private onSuccess: () => void,
    private onFailure?: () => void
  ) {}

  execute(creep: Creep): ActionResult {
    if (this.condition(creep)) {
      this.onSuccess();
      return { success: true, completed: true };
    } else {
      if (this.onFailure) {
        this.onFailure();
      }
      return { success: false, error: 'Condition not met' };
    }
  }
}

export function conditionalTaskCreep(creep: Creep) {
  // Get or create task for this creep
  let task = taskManager.getActiveTask(creep.name);

  const isEmpty = creep.store[RESOURCE_ENERGY] === 0;
  const isFull = creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0;

  if (!task || task.status === TaskStatus.FINISHED || task.status === TaskStatus.FAILED) {
    if (isEmpty) {
      // Need to harvest
      const source = creep.pos.findClosestByPath(FIND_SOURCES);
      if (!source) return;

      task = taskManager.createTask({
        creepId: creep.name,
        actions: [new HarvestEnergyAction(source)]
      });
    } else if (isFull) {
      // Need to deliver
      const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
      if (!spawn) return;

      task = taskManager.createTask({
        creepId: creep.name,
        actions: [new TransferEnergyAction(spawn)]
      });
    }

    if (!task) return;
  }

  // Execute the task
  const success = taskManager.executeTask(task.id, creep);

  // If task failed, clear it to create a new one
  if (!success && task.status === TaskStatus.FAILED) {
    taskManager.removeTask(task.id);
  }
}

/**
 * Usage in main loop:
 * 
 * import { conditionalTaskCreep } from './examples/advanced2-conditional-tasks';
 * 
 * export function loop() {
 *   for (const name in Game.creeps) {
 *     const creep = Game.creeps[name];
 *     if (creep.memory.role === 'hauler') {
 *       conditionalTaskCreep(creep);
 *     }
 *   }
 * }
 */
