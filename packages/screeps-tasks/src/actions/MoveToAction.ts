import { Action, ActionResult } from '../types';

/**
 * MoveTo Action - Move creep to a target position
 */
export class MoveToAction implements Action {
  readonly type = 'moveTo';

  constructor(
    private target: RoomPosition | { pos: RoomPosition },
    private range: number = 0,
    private options?: MoveToOpts
  ) {}

  execute(creep: Creep): ActionResult {
    const targetPos = this.target instanceof RoomPosition ? this.target : this.target.pos;

    const inRange = creep.pos.inRangeTo(targetPos, this.range);
    if (inRange) {
      return { success: true, completed: true };
    }

    const result = creep.moveTo(targetPos, this.options);

    if (result === OK) {
      return { success: true, completed: false };
    }

    if (result === ERR_TIRED) {
      return { success: true, completed: false };
    }

    return {
      success: false,
      error: `MoveTo failed with code: ${result}`
    };
  }
}
