import { Action, ActionResult } from '../types';

/**
 * Upgrade Action - Upgrade a controller
 */
export class UpgradeAction implements Action {
  readonly type = 'upgrade';

  constructor(private controller: StructureController) {}

  execute(creep: Creep): ActionResult {
    if (creep.store[RESOURCE_ENERGY] === 0) {
      return { success: true, completed: true };
    }

    const result = creep.upgradeController(this.controller);

    if (result === OK) {
      const stillHasEnergy = creep.store[RESOURCE_ENERGY] > 0;
      return {
        success: true,
        completed: !stillHasEnergy
      };
    }

    if (result === ERR_NOT_IN_RANGE) {
      return {
        success: false,
        error: 'Not in range to upgrade'
      };
    }

    if (result === ERR_NOT_ENOUGH_RESOURCES) {
      return { success: true, completed: true };
    }

    return {
      success: false,
      error: `Upgrade failed with code: ${result}`
    };
  }

  serialize() {
    return {
      type: this.type,
      data: {
        controllerId: this.controller.id
      }
    };
  }

  static deserialize(data: any): UpgradeAction {
    const controller = Game.getObjectById(data.controllerId) as StructureController;
    if (!controller) {
      throw new Error(`Controller not found: ${data.controllerId}`);
    }
    return new UpgradeAction(controller);
  }
}
