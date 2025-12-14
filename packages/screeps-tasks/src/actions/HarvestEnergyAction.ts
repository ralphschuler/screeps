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

  serialize() {
    return {
      type: this.type,
      data: {
        sourceId: this.source.id,
        moved: this.moved
      }
    };
  }

  static deserialize(data: any): HarvestEnergyAction {
    const source = Game.getObjectById(data.sourceId) as Source;
    if (!source) {
      throw new Error(`Source not found: ${data.sourceId}`);
    }
    const action = new HarvestEnergyAction(source);
    action.moved = data.moved ?? false;
    return action;
  }
}
