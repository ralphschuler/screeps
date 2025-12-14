/**
 * Advanced Example 1: Multi-Task Creep
 * 
 * This example demonstrates a creep that handles multiple tasks:
 * - Harvests energy
 * - Delivers to spawn if energy is low
 * - Otherwise builds or upgrades based on priority
 */

import { taskManager } from '../TaskManager';
import { HarvestEnergyAction } from '../actions/HarvestEnergyAction';
import { TransferEnergyAction } from '../actions/TransferEnergyAction';
import { UpgradeControllerAction } from '../actions/UpgradeControllerAction';
import { MoveToAction } from '../actions/MoveToAction';
import { BuildAction } from '../actions/BuildAction';
import { TaskStatus } from '../types';

export function multiTaskCreep(creep: Creep) {
  // Get or create task for this creep
  let task = taskManager.getActiveTask(creep.name);

  if (!task || task.status === TaskStatus.FINISHED || task.status === TaskStatus.FAILED) {
    // First, harvest energy
    const source = creep.pos.findClosestByPath(FIND_SOURCES);
    if (!source) return;

    const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
    const controller = creep.room.controller;
    const constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);

    // Decide what to do after harvesting
    if (spawn && spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 100) {
      // Priority 1: Fill spawn if it's low on energy
      task = taskManager.createTask({
        creepId: creep.name,
        actions: [new HarvestEnergyAction(source), new TransferEnergyAction(spawn)]
      });
    } else if (constructionSite) {
      // Priority 2: Build if there are construction sites
      task = taskManager.createTask({
        creepId: creep.name,
        actions: [
          new HarvestEnergyAction(source),
          new MoveToAction(constructionSite, 3),
          new BuildAction(constructionSite)
        ]
      });
    } else if (controller) {
      // Priority 3: Upgrade controller
      task = taskManager.createTask({
        creepId: creep.name,
        actions: [new HarvestEnergyAction(source), new UpgradeControllerAction(controller)]
      });
    }

    if (!task) return;
  }

  // Execute the task
  taskManager.executeTask(task.id, creep);
}

/**
 * Usage in main loop:
 * 
 * import { multiTaskCreep } from './examples/advanced1-multi-task';
 * 
 * export function loop() {
 *   for (const name in Game.creeps) {
 *     const creep = Game.creeps[name];
 *     if (creep.memory.role === 'worker') {
 *       multiTaskCreep(creep);
 *     }
 *   }
 * }
 */
