import { Action, ActionResult } from '../types';
import { MoveToAction } from './MoveToAction';
import { UpgradeAction } from './UpgradeAction';

/**
 * Composite Action: UpgradeController
 * Combines moveTo and upgrade actions
 */
export class UpgradeControllerAction implements Action {
  readonly type = 'upgradeController';
  private moveAction: MoveToAction;
  private upgradeAction: UpgradeAction;
  private moved = false;

  constructor(private controller: StructureController) {
    this.moveAction = new MoveToAction(controller, 3);
    this.upgradeAction = new UpgradeAction(controller);
  }

  execute(creep: Creep): ActionResult {
    if (!this.moved) {
      const moveResult = this.moveAction.execute(creep);
      if (!moveResult.success) {
        return moveResult;
      }
      if (moveResult.completed) {
        this.moved = true;
      } else {
        return { success: true, completed: false };
      }
    }

    return this.upgradeAction.execute(creep);
  }
}
