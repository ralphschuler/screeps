import { ActionRegistry } from './TaskManager';
import { MoveToAction } from './actions/MoveToAction';
import { HarvestAction } from './actions/HarvestAction';
import { TransferAction } from './actions/TransferAction';
import { WithdrawAction } from './actions/WithdrawAction';
import { UpgradeAction } from './actions/UpgradeAction';
import { BuildAction } from './actions/BuildAction';
import { HarvestEnergyAction } from './actions/HarvestEnergyAction';
import { TransferEnergyAction } from './actions/TransferEnergyAction';
import { UpgradeControllerAction } from './actions/UpgradeControllerAction';

/**
 * Default action registry with all built-in actions
 * Use this registry with deserializeTask to restore tasks from Memory
 */
export const defaultActionRegistry: ActionRegistry = {
  moveTo: MoveToAction.deserialize,
  harvest: HarvestAction.deserialize,
  transfer: TransferAction.deserialize,
  withdraw: WithdrawAction.deserialize,
  upgrade: UpgradeAction.deserialize,
  build: BuildAction.deserialize,
  harvestEnergy: HarvestEnergyAction.deserialize,
  transferEnergy: TransferEnergyAction.deserialize,
  upgradeController: UpgradeControllerAction.deserialize
};
