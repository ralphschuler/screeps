import { Action, ActionResult } from '../types';

/**
 * Build Action - Build a construction site
 */
export class BuildAction implements Action {
  readonly type = 'build';

  constructor(private target: ConstructionSite) {}

  execute(creep: Creep): ActionResult {
    if (creep.store[RESOURCE_ENERGY] === 0) {
      return { success: true, completed: true };
    }

    const result = creep.build(this.target);

    if (result === OK) {
      const stillHasEnergy = creep.store[RESOURCE_ENERGY] > 0;
      // Check if site still exists (minimal CPU cost for completion detection)
      const siteStillExists = Game.getObjectById(this.target.id) !== null;
      return {
        success: true,
        completed: !stillHasEnergy || !siteStillExists
      };
    }

    if (result === ERR_NOT_IN_RANGE) {
      return {
        success: false,
        error: 'Not in range to build'
      };
    }

    if (result === ERR_NOT_ENOUGH_RESOURCES) {
      return { success: true, completed: true };
    }

    if (result === ERR_INVALID_TARGET) {
      return { success: true, completed: true };
    }

    return {
      success: false,
      error: `Build failed with code: ${result}`
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

  static deserialize(data: any): BuildAction {
    const target = Game.getObjectById(data.targetId) as ConstructionSite;
    if (!target) {
      throw new Error(`Construction site not found: ${data.targetId}`);
    }
    return new BuildAction(target);
  }
}
