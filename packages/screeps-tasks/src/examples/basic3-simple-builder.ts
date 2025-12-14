/**
 * Basic Example 3: Simple Builder
 * 
 * This example demonstrates a basic builder creep that:
 * 1. Harvests energy from a source
 * 2. Builds construction sites
 * 3. Repeats the cycle
 */

import { taskManager } from '../TaskManager';
import { HarvestEnergyAction } from '../actions/HarvestEnergyAction';
import { MoveToAction } from '../actions/MoveToAction';
import { BuildAction } from '../actions/BuildAction';
import { TaskStatus } from '../types';

export function simpleBuilder(creep: Creep) {
  // Get or create task for this creep
  let task = taskManager.getActiveTask(creep.name);

  if (!task || task.status === TaskStatus.FINISHED) {
    // Find closest source
    const source = creep.pos.findClosestByPath(FIND_SOURCES);
    if (!source) return;

    // Find construction site
    const constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    if (!constructionSite) {
      // No construction sites, just idle
      return;
    }

    // Create a new harvest and build task
    task = taskManager.createTask({
      creepId: creep.name,
      actions: [
        new HarvestEnergyAction(source),
        new MoveToAction(constructionSite, 3),
        new BuildAction(constructionSite)
      ]
    });
  }

  // Execute the task
  taskManager.executeTask(task.id, creep);
}

/**
 * Usage in main loop:
 * 
 * import { simpleBuilder } from './examples/basic3-simple-builder';
 * 
 * export function loop() {
 *   for (const name in Game.creeps) {
 *     const creep = Game.creeps[name];
 *     if (creep.memory.role === 'builder') {
 *       simpleBuilder(creep);
 *     }
 *   }
 * }
 */
