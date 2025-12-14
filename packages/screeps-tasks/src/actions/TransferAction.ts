import { Action, ActionResult } from '../types';

/**
 * Transfer Action - Transfer resources to a target
 */
export class TransferAction implements Action {
  readonly type = 'transfer';

  constructor(
    private target: AnyCreep | Structure,
    private resourceType: ResourceConstant = RESOURCE_ENERGY,
    private amount?: number
  ) {}

  execute(creep: Creep): ActionResult {
    const amountToTransfer = this.amount ?? creep.store[this.resourceType] ?? 0;

    if (amountToTransfer === 0) {
      return { success: true, completed: true };
    }

    const result = creep.transfer(this.target, this.resourceType, amountToTransfer);

    if (result === OK) {
      return { success: true, completed: true };
    }

    if (result === ERR_NOT_IN_RANGE) {
      return {
        success: false,
        error: 'Not in range to transfer'
      };
    }

    if (result === ERR_NOT_ENOUGH_RESOURCES) {
      return { success: true, completed: true };
    }

    return {
      success: false,
      error: `Transfer failed with code: ${result}`
    };
  }

  serialize() {
    return {
      type: this.type,
      data: {
        targetId: this.target.id,
        resourceType: this.resourceType,
        amount: this.amount
      }
    };
  }

  static deserialize(data: any): TransferAction {
    const target = Game.getObjectById(data.targetId) as AnyCreep | Structure;
    if (!target) {
      throw new Error(`Transfer target not found: ${data.targetId}`);
    }
    return new TransferAction(target, data.resourceType, data.amount);
  }
}
