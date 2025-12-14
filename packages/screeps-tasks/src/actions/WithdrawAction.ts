import { Action, ActionResult } from '../types';

/**
 * Withdraw Action - Withdraw resources from a target
 */
export class WithdrawAction implements Action {
  readonly type = 'withdraw';

  constructor(
    private target: Structure | Tombstone | Ruin,
    private resourceType: ResourceConstant = RESOURCE_ENERGY,
    private amount?: number
  ) {}

  execute(creep: Creep): ActionResult {
    if (creep.store.getFreeCapacity(this.resourceType) === 0) {
      return { success: true, completed: true };
    }

    const result = creep.withdraw(this.target, this.resourceType, this.amount);

    if (result === OK) {
      return { success: true, completed: true };
    }

    if (result === ERR_NOT_IN_RANGE) {
      return {
        success: false,
        error: 'Not in range to withdraw'
      };
    }

    if (result === ERR_NOT_ENOUGH_RESOURCES) {
      return { success: true, completed: true };
    }

    return {
      success: false,
      error: `Withdraw failed with code: ${result}`
    };
  }
}
