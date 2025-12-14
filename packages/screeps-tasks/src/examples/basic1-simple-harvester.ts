/**
 * Basic Example 1: Simple Harvester
 * 
 * This example demonstrates a basic harvester creep that:
 * 1. Harvests energy from a source
 * 2. Transfers energy to spawn
 * 3. Repeats the cycle
 */

import { taskManager } from '../TaskManager';
import { HarvestEnergyAction } from '../actions/HarvestEnergyAction';
import { TransferEnergyAction } from '../actions/TransferEnergyAction';
import { TaskStatus } from '../types';

export function simpleHarvester(creep: Creep) {
  // Get or create task for this creep
  let task = taskManager.getActiveTask(creep.name);

  if (!task || task.status === TaskStatus.FINISHED) {
    // Find closest source
    const source = creep.pos.findClosestByPath(FIND_SOURCES);
    if (!source) return;

    // Find spawn to deliver to
    const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
    if (!spawn) return;

    // Create a new harvest and deliver task
    task = taskManager.createTask({
      creepId: creep.name,
      actions: [new HarvestEnergyAction(source), new TransferEnergyAction(spawn)]
    });
  }

  // Execute the task
  taskManager.executeTask(task.id, creep);
}

/**
 * Usage in main loop:
 * 
 * import { simpleHarvester } from './examples/basic1-simple-harvester';
 * 
 * export function loop() {
 *   for (const name in Game.creeps) {
 *     const creep = Game.creeps[name];
 *     if (creep.memory.role === 'harvester') {
 *       simpleHarvester(creep);
 *     }
 *   }
 * }
 */
