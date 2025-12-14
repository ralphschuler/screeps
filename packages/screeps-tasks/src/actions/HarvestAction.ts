import { Action, ActionResult } from '../types';

/**
 * Harvest Action - Harvest from a source or mineral
 */
export class HarvestAction implements Action {
  readonly type = 'harvest';

  constructor(private target: Source | Mineral) {}

  execute(creep: Creep): ActionResult {
    if (creep.store.getFreeCapacity() === 0) {
      return { success: true, completed: true };
    }

    const result = creep.harvest(this.target);

    if (result === OK) {
      const stillHasCapacity = creep.store.getFreeCapacity() > 0;
      return {
        success: true,
        completed: !stillHasCapacity
      };
    }

    if (result === ERR_NOT_IN_RANGE) {
      return {
        success: false,
        error: 'Not in range to harvest'
      };
    }

    if (result === ERR_NOT_ENOUGH_RESOURCES) {
      return { success: true, completed: true };
    }

    return {
      success: false,
      error: `Harvest failed with code: ${result}`
    };
  }

  serialize() {
    return {
      type: this.type,
      data: {
        targetId: this.target.id
      }
    };
  }

  static deserialize(data: any): HarvestAction {
    const target = Game.getObjectById(data.targetId) as Source | Mineral;
    if (!target) {
      throw new Error(`Harvest target not found: ${data.targetId}`);
    }
    return new HarvestAction(target);
  }
}
