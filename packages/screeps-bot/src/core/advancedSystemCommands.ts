/**
 * Advanced System Console Commands
 *
 * Console commands for Labs, Market, and Power systems.
 * Provides easy access to system status, configuration, and manual control.
 */

import { Command } from "./commandRegistry";
import { labManager } from "../labs/labManager";
import { labConfigManager } from "../labs/labConfig";
import { chemistryPlanner } from "../labs/chemistryPlanner";
import { boostManager } from "../labs/boostManager";
import { powerCreepManager } from "../empire/powerCreepManager";
import { powerBankHarvestingManager } from "../empire/powerBankHarvesting";

/**
 * Lab system commands
 */
export class LabCommands {
  @Command({
    name: "labs.status",
    description: "Get lab status for a room",
    usage: "labs.status(roomName)",
    examples: ["labs.status('E1S1')"],
    category: "Labs"
  })
  public status(roomName: string): string {
    const config = labConfigManager.getConfig(roomName);
    if (!config) {
      return `No lab configuration for ${roomName}`;
    }

    let output = `=== Lab Status: ${roomName} ===\n`;
    output += `Valid: ${config.isValid}\n`;
    output += `Labs: ${config.labs.length}\n`;
    output += `Last Update: ${Game.time - config.lastUpdate} ticks ago\n\n`;

    if (config.activeReaction) {
      output += `Active Reaction:\n`;
      output += `  ${config.activeReaction.input1} + ${config.activeReaction.input2} → ${config.activeReaction.output}\n\n`;
    }

    output += "Lab Assignments:\n";
    for (const lab of config.labs) {
      const labObj = Game.getObjectById(lab.labId);
      const mineral = labObj?.mineralType ?? "empty";
      const amount = labObj?.store[mineral as MineralConstant] ?? 0;
      output += `  ${lab.role}: ${mineral} (${amount}) @ (${lab.pos.x},${lab.pos.y})\n`;
    }

    const needs = labManager.getLabResourceNeeds(roomName);
    if (needs.length > 0) {
      output += `\nResource Needs:\n`;
      for (const need of needs) {
        output += `  ${need.resourceType}: ${need.amount} (priority ${need.priority})\n`;
      }
    }

    const overflow = labManager.getLabOverflow(roomName);
    if (overflow.length > 0) {
      output += `\nOverflow (needs emptying):\n`;
      for (const over of overflow) {
        output += `  ${over.resourceType}: ${over.amount} (priority ${over.priority})\n`;
      }
    }

    return output;
  }

  @Command({
    name: "labs.setReaction",
    description: "Set active reaction for a room",
    usage: "labs.setReaction(roomName, input1, input2, output)",
    examples: ["labs.setReaction('E1S1', RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_HYDROXIDE)"],
    category: "Labs"
  })
  public setReaction(
    roomName: string,
    input1: MineralConstant | MineralCompoundConstant,
    input2: MineralConstant | MineralCompoundConstant,
    output: MineralCompoundConstant
  ): string {
    const result = labManager.setActiveReaction(roomName, input1, input2, output);
    if (result) {
      return `Set active reaction: ${input1} + ${input2} → ${output}`;
    } else {
      return `Failed to set reaction (check lab configuration)`;
    }
  }

  @Command({
    name: "labs.clear",
    description: "Clear active reaction for a room",
    usage: "labs.clear(roomName)",
    examples: ["labs.clear('E1S1')"],
    category: "Labs"
  })
  public clear(roomName: string): string {
    labManager.clearReactions(roomName);
    return `Cleared active reactions in ${roomName}`;
  }

  @Command({
    name: "labs.boost",
    description: "Check boost lab readiness for a role",
    usage: "labs.boost(roomName, role)",
    examples: ["labs.boost('E1S1', 'soldier')"],
    category: "Labs"
  })
  public boost(roomName: string, role: string): string {
    const room = Game.rooms[roomName];
    if (!room) {
      return `Room ${roomName} not visible`;
    }

    const ready = boostManager.areBoostLabsReady(room, role);
    const missing = boostManager.getMissingBoosts(room, role);

    let output = `=== Boost Status: ${roomName} / ${role} ===\n`;
    output += `Ready: ${ready}\n`;

    if (missing.length > 0) {
      output += `\nMissing Boosts:\n`;
      for (const boost of missing) {
        output += `  - ${boost}\n`;
      }
    } else {
      output += `\nAll boosts ready!`;
    }

    return output;
  }
}

/**
 * Market system commands
 */
export class MarketCommands {
  @Command({
    name: "market.data",
    description: "Get market data for a resource",
    usage: "market.data(resource)",
    examples: ["market.data(RESOURCE_ENERGY)", "market.data(RESOURCE_GHODIUM)"],
    category: "Market"
  })
  public data(resource: ResourceConstant): string {
    const history = Game.market.getHistory(resource);
    if (!history || history.length === 0) {
      return `No market history for ${resource}`;
    }

    const latest = history[history.length - 1];
    
    let output = `=== Market Data: ${resource} ===\n`;
    output += `Current Price: ${latest.avgPrice.toFixed(3)} credits\n`;
    output += `Volume: ${latest.volume}\n`;
    output += `Transactions: ${latest.transactions}\n`;
    output += `Date: ${latest.date}\n`;

    // Show price trend
    if (history.length >= 5) {
      const older = history[history.length - 5];
      const change = ((latest.avgPrice - older.avgPrice) / older.avgPrice) * 100;
      const trend = change > 5 ? "📈 Rising" : change < -5 ? "📉 Falling" : "➡️ Stable";
      output += `\nTrend (5 days): ${trend} (${change >= 0 ? "+" : ""}${change.toFixed(1)}%)\n`;
    }

    return output;
  }

  @Command({
    name: "market.orders",
    description: "List your active market orders",
    usage: "market.orders()",
    examples: ["market.orders()"],
    category: "Market"
  })
  public orders(): string {
    const orders = Object.values(Game.market.orders);
    
    if (orders.length === 0) {
      return "No active market orders";
    }

    let output = `=== Active Market Orders (${orders.length}) ===\n`;
    output += "Type | Resource | Price | Remaining | Room\n";
    output += "-".repeat(70) + "\n";

    for (const order of orders) {
      const type = order.type === ORDER_BUY ? "BUY " : "SELL";
      const price = order.price.toFixed(3);
      // remainingAmount may be undefined for orders that haven't been processed yet
      const remaining = order.remainingAmount?.toString() ?? "?";
      output += `${type} | ${order.resourceType} | ${price} | ${remaining} | ${order.roomName ?? "N/A"}\n`;
    }

    return output;
  }

  @Command({
    name: "market.profit",
    description: "Show market trading profit statistics",
    usage: "market.profit()",
    examples: ["market.profit()"],
    category: "Market"
  })
  public profit(): string {
    // Access market memory (would need to be exposed by marketManager)
    let output = `=== Market Profit ===\n`;
    output += `Credits: ${Game.market.credits.toLocaleString()}\n`;
    output += `\nNote: Detailed profit tracking requires memory access\n`;
    return output;
  }
}

/**
 * Power system commands
 */
export class PowerCommands {
  @Command({
    name: "power.gpl",
    description: "Show GPL (Global Power Level) status",
    usage: "power.gpl()",
    examples: ["power.gpl()"],
    category: "Power"
  })
  public gpl(): string {
    const gplState = powerCreepManager.getGPLState();
    if (!gplState) {
      return "GPL tracking not available (no power unlocked)";
    }

    let output = `=== GPL Status ===\n`;
    output += `Level: ${gplState.currentLevel}\n`;
    output += `Progress: ${gplState.currentProgress} / ${gplState.progressNeeded}\n`;
    output += `Completion: ${((gplState.currentProgress / gplState.progressNeeded) * 100).toFixed(1)}%\n`;
    output += `Target Milestone: ${gplState.targetMilestone}\n`;
    
    // Format estimated time for better readability
    const timeEstimate = gplState.ticksToNextLevel === Infinity 
      ? "N/A (no progress yet)" 
      : `${gplState.ticksToNextLevel.toLocaleString()} ticks`;
    output += `Estimated Time: ${timeEstimate}\n`;
    output += `\nTotal Power Processed: ${gplState.totalPowerProcessed.toLocaleString()}\n`;

    return output;
  }

  @Command({
    name: "power.creeps",
    description: "List power creeps and their assignments",
    usage: "power.creeps()",
    examples: ["power.creeps()"],
    category: "Power"
  })
  public creeps(): string {
    const assignments = powerCreepManager.getAssignments();
    
    if (assignments.length === 0) {
      return "No power creeps created yet";
    }

    let output = `=== Power Creeps (${assignments.length}) ===\n`;
    output += "Name | Role | Room | Level | Spawned\n";
    output += "-".repeat(70) + "\n";

    for (const assignment of assignments) {
      const spawned = assignment.spawned ? "✓" : "✗";
      output += `${assignment.name} | ${assignment.role} | ${assignment.assignedRoom} | ${assignment.level} | ${spawned}\n`;
    }

    return output;
  }

  @Command({
    name: "power.operations",
    description: "List active power bank operations",
    usage: "power.operations()",
    examples: ["power.operations()"],
    category: "Power"
  })
  public operations(): string {
    const ops = powerBankHarvestingManager.getActiveOperations();
    
    if (ops.length === 0) {
      return "No active power bank operations";
    }

    let output = `=== Power Bank Operations (${ops.length}) ===\n`;

    for (const op of ops) {
      output += `\nRoom: ${op.roomName}\n`;
      output += `Power: ${op.power}\n`;
      output += `State: ${op.state}\n`;
      output += `Home: ${op.homeRoom}\n`;
      output += `Attackers: ${op.assignedCreeps.attackers.length}\n`;
      output += `Healers: ${op.assignedCreeps.healers.length}\n`;
      output += `Carriers: ${op.assignedCreeps.carriers.length}\n`;
      output += `Damage: ${Math.round(op.damageDealt / 1000)}k / 2000k\n`;
      output += `Collected: ${op.powerCollected}\n`;
      output += `Decay: ${op.decayTick - Game.time} ticks\n`;
    }

    return output;
  }

  @Command({
    name: "power.assign",
    description: "Reassign a power creep to a different room",
    usage: "power.assign(powerCreepName, roomName)",
    examples: ["power.assign('operator_eco', 'E2S2')"],
    category: "Power"
  })
  public assign(powerCreepName: string, roomName: string): string {
    const result = powerCreepManager.reassignPowerCreep(powerCreepName, roomName);
    if (result) {
      return `Reassigned ${powerCreepName} to ${roomName}`;
    } else {
      return `Failed to reassign ${powerCreepName} (not found)`;
    }
  }

  @Command({
    name: "power.create",
    description: "Manually create a new power creep (automatic creation is also enabled)",
    usage: "power.create(name, className)",
    examples: [
      "power.create('operator_eco', POWER_CLASS.OPERATOR)",
      "power.create('my_operator', 'operator')"
    ],
    category: "Power"
  })
  public create(name: string, className: PowerClassConstant | string): string {
    // Normalize className
    const powerClass = typeof className === "string" && className.toLowerCase() === "operator"
      ? POWER_CLASS.OPERATOR
      : className as PowerClassConstant;

    // Check if power creep already exists
    if (Game.powerCreeps[name]) {
      return `Power creep "${name}" already exists`;
    }

    // Check GPL level
    if (!Game.gpl || Game.gpl.level < 1) {
      return "GPL level too low (need GPL 1+)";
    }

    // Check if we have capacity
    const currentCount = Object.keys(Game.powerCreeps).length;
    if (currentCount >= Game.gpl.level) {
      return `Cannot create power creep: ${currentCount}/${Game.gpl.level} already created`;
    }

    const result = PowerCreep.create(name, powerClass);
    if (result === OK) {
      return `Created power creep "${name}" (${powerClass})`;
    } else {
      return `Failed to create power creep: ${result}`;
    }
  }

  @Command({
    name: "power.spawn",
    description: "Manually spawn a power creep at a power spawn",
    usage: "power.spawn(powerCreepName, roomName?)",
    examples: [
      "power.spawn('operator_eco')",
      "power.spawn('operator_eco', 'E2S2')"
    ],
    category: "Power"
  })
  public spawn(powerCreepName: string, roomName?: string): string {
    const pc = Game.powerCreeps[powerCreepName];
    if (!pc) {
      return `Power creep "${powerCreepName}" not found`;
    }

    // Check if already spawned
    if (pc.ticksToLive !== undefined) {
      return `Power creep "${powerCreepName}" is already spawned (TTL: ${pc.ticksToLive})`;
    }

    // Find power spawn
    const memory = pc.memory as { homeRoom?: string };
    const targetRoom = roomName ?? memory.homeRoom ?? Object.keys(Game.rooms)[0];
    const room = Game.rooms[targetRoom];
    
    if (!room) {
      return `Room "${targetRoom}" not visible`;
    }

    const powerSpawn = room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_POWER_SPAWN
    })[0] as StructurePowerSpawn | undefined;

    if (!powerSpawn) {
      return `No power spawn found in ${targetRoom}`;
    }

    const result = pc.spawn(powerSpawn);
    if (result === OK) {
      return `Spawned power creep "${powerCreepName}" at ${targetRoom}`;
    } else {
      return `Failed to spawn power creep: ${result}`;
    }
  }

  @Command({
    name: "power.upgrade",
    description: "Manually upgrade a power creep with a specific power",
    usage: "power.upgrade(powerCreepName, power)",
    examples: [
      "power.upgrade('operator_eco', PWR_OPERATE_SPAWN)",
      "power.upgrade('operator_eco', PWR_OPERATE_TOWER)"
    ],
    category: "Power"
  })
  public upgrade(powerCreepName: string, power: PowerConstant): string {
    const pc = Game.powerCreeps[powerCreepName];
    if (!pc) {
      return `Power creep "${powerCreepName}" not found`;
    }

    // Check if already has power
    if (pc.powers[power]) {
      return `Power creep "${powerCreepName}" already has ${power}`;
    }

    // Check GPL requirement
    // POWER_INFO is a global constant provided by the Screeps game engine
    const powerInfo = POWER_INFO[power];
    if (!powerInfo) {
      return `Invalid power: ${power}`;
    }


    // Check if creep can level up
    if (pc.level >= Game.gpl.level) {
      return `Power creep is already at max level (${pc.level}/${Game.gpl.level})`;
    }

    const result = pc.upgrade(power);
    if (result === OK) {
      return `Upgraded ${powerCreepName} to level ${pc.level} with ${power}`;
    } else {
      return `Failed to upgrade: ${result}`;
    }
  }
}

// Export command class instances
export const labCommands = new LabCommands();
export const marketCommands = new MarketCommands();
export const powerCommands = new PowerCommands();
