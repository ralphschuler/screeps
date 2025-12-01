/**
 * Power Roles
 *
 * Power creep roles:
 * - PowerQueen (economy-focused Operator)
 * - PowerWarrior (combat-support)
 * - PowerHarvester (regular creep for power banks)
 * - PowerCarrier (regular creep for carrying power)
 */

import { createSwarmContext, executeAction } from "../trees/context";
import {
  createPowerCreepContext,
  evaluatePowerQueen,
  evaluatePowerRole,
  evaluatePowerWarrior,
  executePowerCreepAction
} from "../trees/powerBehaviors";
import type { SwarmCreepMemory } from "../../memory/schemas";

/**
 * Get power creep memory
 */
function getPowerCreepMemory(creep: PowerCreep): SwarmCreepMemory {
  return creep.memory as unknown as SwarmCreepMemory;
}

/**
 * Run power-related creep role (PowerHarvester, PowerCarrier)
 */
export function runPowerCreepRole(creep: Creep): void {
  // Create context with all room state
  const ctx = createSwarmContext(creep);

  // Evaluate behavior to get action
  const action = evaluatePowerRole(ctx);

  // Execute the action
  executeAction(creep, action, ctx);
}

/**
 * Run power creep role (PowerQueen, PowerWarrior)
 */
export function runPowerRole(powerCreep: PowerCreep): void {
  const ctx = createPowerCreepContext(powerCreep);
  if (!ctx) return;

  const memory = getPowerCreepMemory(powerCreep);

  let action;
  switch (memory.role) {
    case "powerQueen":
      action = evaluatePowerQueen(ctx);
      break;
    case "powerWarrior":
      action = evaluatePowerWarrior(ctx);
      break;
    default:
      action = evaluatePowerQueen(ctx);
  }

  executePowerCreepAction(powerCreep, action);
}

/**
 * Run PowerHarvester behavior (regular creep)
 */
export function runPowerHarvester(creep: Creep): void {
  const ctx = createSwarmContext(creep);
  const action = evaluatePowerRole(ctx);
  executeAction(creep, action, ctx);
}

/**
 * Run PowerCarrier behavior (regular creep)
 */
export function runPowerCarrier(creep: Creep): void {
  const ctx = createSwarmContext(creep);
  const action = evaluatePowerRole(ctx);
  executeAction(creep, action, ctx);
}
