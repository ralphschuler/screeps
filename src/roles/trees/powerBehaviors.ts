/**
 * Power Role Behaviors
 *
 * Behavior functions for power-related creep and Power Creep roles.
 * Includes power harvesting/carrying creeps and PowerCreep management.
 */

import type { SwarmAction, SwarmCreepContext } from "./context";

// =============================================================================
// PowerHarvester - Harvest from power banks
// =============================================================================

export function evaluatePowerHarvester(ctx: SwarmCreepContext): SwarmAction {
  const targetRoom = ctx.memory.targetRoom;

  if (!targetRoom) {
    return { type: "idle" };
  }

  // Move to target room
  if (ctx.room.name !== targetRoom) {
    return { type: "moveToRoom", roomName: targetRoom };
  }

  // Find power bank
  const powerBank = ctx.room.find(FIND_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_POWER_BANK
  })[0] as StructurePowerBank | undefined;

  if (!powerBank) {
    // Power bank destroyed, return home
    delete ctx.memory.targetRoom;
    return { type: "moveToRoom", roomName: ctx.homeRoom };
  }

  // Attack power bank
  const result = ctx.creep.attack(powerBank);
  if (result === ERR_NOT_IN_RANGE) {
    return { type: "moveTo", target: powerBank };
  }

  return { type: "idle" };
}

// =============================================================================
// PowerCarrier - Carry power from destroyed banks
// =============================================================================

export function evaluatePowerCarrier(ctx: SwarmCreepContext): SwarmAction {
  const targetRoom = ctx.memory.targetRoom;

  // Check if carrying power
  const carryingPower = ctx.creep.store.getUsedCapacity(RESOURCE_POWER) > 0;

  if (carryingPower) {
    // Return home and deposit
    if (ctx.room.name !== ctx.homeRoom) {
      return { type: "moveToRoom", roomName: ctx.homeRoom };
    }

    const homeRoom = Game.rooms[ctx.homeRoom];
    if (homeRoom) {
      // Deposit in power spawn or storage
      const powerSpawn = homeRoom.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_POWER_SPAWN
      })[0] as StructurePowerSpawn | undefined;

      if (powerSpawn && powerSpawn.store.getFreeCapacity(RESOURCE_POWER) > 0) {
        return { type: "transfer", target: powerSpawn, resourceType: RESOURCE_POWER };
      }

      if (ctx.storage) {
        return { type: "transfer", target: ctx.storage, resourceType: RESOURCE_POWER };
      }
    }

    return { type: "idle" };
  }

  if (!targetRoom) {
    return { type: "idle" };
  }

  // Move to target room
  if (ctx.room.name !== targetRoom) {
    return { type: "moveToRoom", roomName: targetRoom };
  }

  // Look for dropped power
  const droppedPower = ctx.room.find(FIND_DROPPED_RESOURCES, {
    filter: r => r.resourceType === RESOURCE_POWER
  })[0];

  if (droppedPower) {
    return { type: "pickup", target: droppedPower };
  }

  // Look for ruins with power
  const ruin = ctx.room.find(FIND_RUINS, {
    filter: r => r.store.getUsedCapacity(RESOURCE_POWER) > 0
  })[0];

  if (ruin) {
    return { type: "withdraw", target: ruin, resourceType: RESOURCE_POWER };
  }

  // Check if power bank still exists - wait nearby
  const powerBank = ctx.room.find(FIND_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_POWER_BANK
  })[0] as StructurePowerBank | undefined;

  if (powerBank) {
    // Wait near power bank
    if (ctx.creep.pos.getRangeTo(powerBank) > 3) {
      return { type: "moveTo", target: powerBank };
    }
    return { type: "idle" };
  }

  // No power bank and no dropped power - return home
  delete ctx.memory.targetRoom;
  return { type: "moveToRoom", roomName: ctx.homeRoom };
}

// =============================================================================
// PowerCreep Handling (special handling for PowerCreeps)
// =============================================================================

/**
 * Extended context for Power Creep decisions
 */
export interface PowerCreepContext {
  powerCreep: PowerCreep;
  room: Room;
  homeRoom: string;
  isInHomeRoom: boolean;
  storage: StructureStorage | undefined;
  terminal: StructureTerminal | undefined;
  factory: StructureFactory | undefined;
  labs: StructureLab[];
  spawns: StructureSpawn[];
  extensions: StructureExtension[];
  powerSpawn: StructurePowerSpawn | undefined;
  /** Available power creep abilities */
  powers: PowerConstant[];
  /** Current ops resource count */
  ops: number;
}

/**
 * Power Creep action types
 */
export type PowerCreepAction =
  | { type: "usePower"; power: PowerConstant; target?: RoomObject }
  | { type: "moveTo"; target: RoomPosition | RoomObject }
  | { type: "moveToRoom"; roomName: string }
  | { type: "renewSelf"; spawn: StructurePowerSpawn }
  | { type: "enableRoom" }
  | { type: "idle" };

/**
 * Create Power Creep context
 */
export function createPowerCreepContext(powerCreep: PowerCreep): PowerCreepContext | null {
  if (!powerCreep.room) return null;

  const room = powerCreep.room;
  const memory = powerCreep.memory as unknown as { homeRoom?: string };
  const homeRoom = memory.homeRoom ?? room.name;

  const labs = room.find(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_LAB
  }) as StructureLab[];

  const spawns = room.find(FIND_MY_SPAWNS);

  const extensions = room.find(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_EXTENSION
  }) as StructureExtension[];

  const factory = room.find(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_FACTORY
  })[0] as StructureFactory | undefined;

  const powerSpawn = room.find(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_POWER_SPAWN
  })[0] as StructurePowerSpawn | undefined;

  const powers: PowerConstant[] = [];
  for (const power of Object.keys(powerCreep.powers) as unknown as PowerConstant[]) {
    const powerData = powerCreep.powers[power];
    if (powerData && powerData.cooldown === 0) {
      powers.push(power);
    }
  }

  return {
    powerCreep,
    room,
    homeRoom,
    isInHomeRoom: room.name === homeRoom,
    storage: room.storage,
    terminal: room.terminal,
    factory,
    labs,
    spawns,
    extensions,
    powerSpawn,
    powers,
    ops: powerCreep.store.getUsedCapacity(RESOURCE_OPS)
  };
}

/**
 * Evaluate PowerQueen behavior - Economy-focused Operator
 */
export function evaluatePowerQueen(ctx: PowerCreepContext): PowerCreepAction {
  // Check if needs renewal (ticksToLive < 1000)
  if (ctx.powerCreep.ticksToLive !== undefined && ctx.powerCreep.ticksToLive < 1000) {
    if (ctx.powerSpawn) {
      return { type: "renewSelf", spawn: ctx.powerSpawn };
    }
  }

  // Check available powers
  const availablePowers = ctx.powers;

  // Priority 1: OPERATE_SPAWN when spawns are active
  if (availablePowers.includes(PWR_OPERATE_SPAWN) && ctx.ops >= 100) {
    const busySpawn = ctx.spawns.find(s => s.spawning !== null);
    if (busySpawn) {
      return { type: "usePower", power: PWR_OPERATE_SPAWN, target: busySpawn };
    }
  }

  // Priority 2: OPERATE_EXTENSION when low on energy
  if (availablePowers.includes(PWR_OPERATE_EXTENSION) && ctx.ops >= 2) {
    const totalFreeCapacity = ctx.extensions.reduce((sum, ext) => sum + ext.store.getFreeCapacity(RESOURCE_ENERGY), 0);
    if (totalFreeCapacity > 0 && ctx.storage && ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 10000) {
      return { type: "usePower", power: PWR_OPERATE_EXTENSION, target: ctx.storage };
    }
  }

  // Priority 3: OPERATE_STORAGE for capacity boost
  if (availablePowers.includes(PWR_OPERATE_STORAGE) && ctx.ops >= 100 && ctx.storage) {
    if (ctx.storage.store.getUsedCapacity() > ctx.storage.store.getCapacity() * 0.9) {
      return { type: "usePower", power: PWR_OPERATE_STORAGE, target: ctx.storage };
    }
  }

  // Priority 4: OPERATE_LAB for reaction speed
  if (availablePowers.includes(PWR_OPERATE_LAB) && ctx.ops >= 10) {
    const activeLab = ctx.labs.find(l => l.cooldown === 0 && l.mineralType);
    if (activeLab) {
      return { type: "usePower", power: PWR_OPERATE_LAB, target: activeLab };
    }
  }

  // Priority 5: OPERATE_FACTORY for commodity production
  if (availablePowers.includes(PWR_OPERATE_FACTORY) && ctx.ops >= 100 && ctx.factory) {
    if (ctx.factory.cooldown === 0) {
      return { type: "usePower", power: PWR_OPERATE_FACTORY, target: ctx.factory };
    }
  }

  // Priority 6: GENERATE_OPS when low
  if (availablePowers.includes(PWR_GENERATE_OPS) && ctx.ops < 50) {
    return { type: "usePower", power: PWR_GENERATE_OPS };
  }

  // Move to home room if not there
  if (!ctx.isInHomeRoom) {
    return { type: "moveToRoom", roomName: ctx.homeRoom };
  }

  // Stay near storage
  if (ctx.storage && ctx.powerCreep.pos.getRangeTo(ctx.storage) > 3) {
    return { type: "moveTo", target: ctx.storage };
  }

  return { type: "idle" };
}

/**
 * Evaluate PowerWarrior behavior - Combat-support power creep
 */
export function evaluatePowerWarrior(ctx: PowerCreepContext): PowerCreepAction {
  // Check if needs renewal
  if (ctx.powerCreep.ticksToLive !== undefined && ctx.powerCreep.ticksToLive < 1000) {
    if (ctx.powerSpawn) {
      return { type: "renewSelf", spawn: ctx.powerSpawn };
    }
  }

  const availablePowers = ctx.powers;

  // Priority 1: GENERATE_OPS when low
  if (availablePowers.includes(PWR_GENERATE_OPS) && ctx.ops < 50) {
    return { type: "usePower", power: PWR_GENERATE_OPS };
  }

  // Priority 2: OPERATE_TOWER for defense
  if (availablePowers.includes(PWR_OPERATE_TOWER) && ctx.ops >= 10) {
    const hostiles = ctx.room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
      const tower = ctx.room.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_TOWER
      })[0] as StructureTower | undefined;
      if (tower) {
        return { type: "usePower", power: PWR_OPERATE_TOWER, target: tower };
      }
    }
  }

  // Priority 3: FORTIFY for boosting ramparts/walls
  if (availablePowers.includes(PWR_FORTIFY) && ctx.ops >= 5) {
    const lowRampart = ctx.room.find(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_RAMPART && s.hits < 1000000
    })[0] as StructureRampart | undefined;
    if (lowRampart) {
      return { type: "usePower", power: PWR_FORTIFY, target: lowRampart };
    }
  }

  // Priority 4: DISRUPT_SPAWN on enemy spawns (if in enemy room)
  if (availablePowers.includes(PWR_DISRUPT_SPAWN) && ctx.ops >= 10) {
    const enemySpawn = ctx.room.find(FIND_HOSTILE_SPAWNS)[0];
    if (enemySpawn) {
      return { type: "usePower", power: PWR_DISRUPT_SPAWN, target: enemySpawn };
    }
  }

  // Priority 5: DISRUPT_TOWER on enemy towers
  if (availablePowers.includes(PWR_DISRUPT_TOWER) && ctx.ops >= 10) {
    const enemyTower = ctx.room.find(FIND_HOSTILE_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_TOWER
    })[0] as StructureTower | undefined;
    if (enemyTower) {
      return { type: "usePower", power: PWR_DISRUPT_TOWER, target: enemyTower };
    }
  }

  // Move to home room if not there
  if (!ctx.isInHomeRoom) {
    return { type: "moveToRoom", roomName: ctx.homeRoom };
  }

  return { type: "idle" };
}

/**
 * Execute Power Creep action
 */
export function executePowerCreepAction(powerCreep: PowerCreep, action: PowerCreepAction): void {
  switch (action.type) {
    case "usePower": {
      const result = action.target
        ? powerCreep.usePower(action.power, action.target)
        : powerCreep.usePower(action.power);
      if (result === ERR_NOT_IN_RANGE && action.target) {
        powerCreep.moveTo(action.target);
      }
      break;
    }

    case "moveTo": {
      powerCreep.moveTo(action.target);
      break;
    }

    case "moveToRoom": {
      const exit = powerCreep.room?.findExitTo(action.roomName);
      if (exit && exit !== ERR_NO_PATH && exit !== ERR_INVALID_ARGS) {
        const exitPos = powerCreep.pos.findClosestByRange(exit);
        if (exitPos) {
          powerCreep.moveTo(exitPos);
        }
      }
      break;
    }

    case "renewSelf": {
      const result = powerCreep.renew(action.spawn);
      if (result === ERR_NOT_IN_RANGE) {
        powerCreep.moveTo(action.spawn);
      }
      break;
    }

    case "enableRoom": {
      if (powerCreep.room?.controller) {
        const result = powerCreep.enableRoom(powerCreep.room.controller);
        if (result === ERR_NOT_IN_RANGE) {
          powerCreep.moveTo(powerCreep.room.controller);
        }
      }
      break;
    }

    case "idle":
      // Do nothing
      break;
  }
}

// =============================================================================
// Dispatcher
// =============================================================================

const powerEvaluators: Record<string, (ctx: SwarmCreepContext) => SwarmAction> = {
  powerHarvester: evaluatePowerHarvester,
  powerCarrier: evaluatePowerCarrier
};

export function evaluatePowerRole(ctx: SwarmCreepContext): SwarmAction {
  const evaluator = powerEvaluators[ctx.memory.role] ?? evaluatePowerHarvester;
  return evaluator(ctx);
}
