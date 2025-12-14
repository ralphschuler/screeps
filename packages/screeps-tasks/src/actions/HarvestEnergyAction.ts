import { Action, ActionResult } from '../types';
import { MoveToAction } from './MoveToAction';
import { HarvestAction } from './HarvestAction';

/**
 * Composite Action: HarvestEnergy
 * Combines moveTo and harvest actions for a source
 */
export class HarvestEnergyAction implements Action {
  readonly type = 'harvestEnergy';
  private moveAction: MoveToAction;
  private harvestAction: HarvestAction;
  private moved = false;

  constructor(private source: Source) {
    this.moveAction = new MoveToAction(source, 1);
    this.harvestAction = new HarvestAction(source);
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

    return this.harvestAction.execute(creep);
  }
}
