/**
 * Basic Example 2: Simple Upgrader
 * 
 * This example demonstrates a basic upgrader creep that:
 * 1. Withdraws energy from spawn
 * 2. Upgrades the controller
 * 3. Repeats the cycle
 */

import { taskManager } from '../TaskManager';
import { MoveToAction } from '../actions/MoveToAction';
import { WithdrawAction } from '../actions/WithdrawAction';
import { UpgradeControllerAction } from '../actions/UpgradeControllerAction';
import { TaskStatus } from '../types';

export function simpleUpgrader(creep: Creep) {
  // Get or create task for this creep
  let task = taskManager.getActiveTask(creep.name);

  if (!task || task.status === TaskStatus.FINISHED) {
    // Find spawn to get energy from
    const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
    if (!spawn) return;

    // Find controller to upgrade
    const controller = creep.room.controller;
    if (!controller) return;

    // Create a new withdraw and upgrade task
    task = taskManager.createTask({
      creepId: creep.name,
      actions: [
        new MoveToAction(spawn, 1),
        new WithdrawAction(spawn, RESOURCE_ENERGY),
        new UpgradeControllerAction(controller)
      ]
    });
  }

  // Execute the task
  taskManager.executeTask(task.id, creep);
}

/**
 * Usage in main loop:
 * 
 * import { simpleUpgrader } from './examples/basic2-simple-upgrader';
 * 
 * export function loop() {
 *   for (const name in Game.creeps) {
 *     const creep = Game.creeps[name];
 *     if (creep.memory.role === 'upgrader') {
 *       simpleUpgrader(creep);
 *     }
 *   }
 * }
 */
