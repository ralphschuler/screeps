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

import { createSwarmContext, executeAction } from "../trees/context";
import { evaluateEconomyRole } from "../trees/economyBehaviors";

/**
 * Run economy role
 */
export function runEconomyRole(creep: Creep): void {
  // Create context with all room state
  const ctx = createSwarmContext(creep);

  // Evaluate behavior to get action
  const action = evaluateEconomyRole(ctx);

  // Execute the action
  executeAction(creep, action, ctx);
}
