import { Action, ActionResult } from '../types';
import { MoveToAction } from './MoveToAction';
import { TransferAction } from './TransferAction';

/**
 * Composite Action: TransferEnergy
 * Combines moveTo and transfer actions
 */
export class TransferEnergyAction implements Action {
  readonly type = 'transferEnergy';
  private moveAction: MoveToAction;
  private transferAction: TransferAction;
  private moved = false;

  constructor(private target: AnyCreep | Structure, private amount?: number) {
    this.moveAction = new MoveToAction(target, 1);
    this.transferAction = new TransferAction(target, RESOURCE_ENERGY, amount);
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

    return this.transferAction.execute(creep);
  }
}
