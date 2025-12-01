/**
 * Economy Roles
 *
 * All economy-focused creep roles:
 * - LarvaWorker (unified starter)
 * - Harvester (stationary miner)
 * - Hauler (transport)
 * - Builder
 * - Upgrader
 * - QueenCarrier (distributor)
 * - MineralHarvester
 * - DepositHarvester
 * - LabTech
 * - FactoryWorker
 */

import { createContext, evaluateEconomyBehavior, executeAction } from "../behaviors";

/**
 * Run economy role behavior.
 */
export function runEconomyRole(creep: Creep): void {
  const ctx = createContext(creep);
  const action = evaluateEconomyBehavior(ctx);
  executeAction(creep, action, ctx);
}
