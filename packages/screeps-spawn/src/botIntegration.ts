/**
 * Bot Integration Layer
 * 
 * This file provides interfaces and default implementations for bot-specific dependencies.
 * The actual bot (screeps-bot) should provide concrete implementations of these.
 */

/**
 * Cross-shard transfer request
 */
export interface CrossShardTransferRequest {
  fromRoom: string;
  toRoom: string;
  resourceType: ResourceConstant;
  amount: number;
}

/**
 * Resource transfer coordinator interface
 */
export interface IResourceTransferCoordinator {
  getPendingTransfers(roomName: string): CrossShardTransferRequest[];
  needsCarrier(roomName: string): boolean;
}

/**
 * Kernel interface for process management
 */
export interface IKernel {
  data: {
    rooms?: Record<string, { name: string }>;
  };
  emit(event: string, data: unknown): void;
}

/**
 * Memory manager interface
 */
export interface IMemoryManager {
  getSwarmState(roomName: string): any;
  setSwarmState(roomName: string, state: any): void;
  getCluster(clusterId: string): any;
  getEmpire(): any;
}

/**
 * Energy flow predictor interface
 */
export interface IEnergyFlowPredictor {
  predictConsumption(roomName: string): number;
  getEnergyAvailableForSpawning(roomName: string): number;
  predictEnergyInTicks(roomName: string, ticks: number): number;
  getMaxAffordableInTicks(roomName: string, ticks: number): number;
}

/**
 * Power bank harvesting manager interface
 */
export interface IPowerBankHarvestingManager {
  getActivePowerBanks(): Array<{ roomName: string; id: Id<StructurePowerBank> }>;
  needsHarvesters(powerBankId: Id<StructurePowerBank>): boolean;
  needsCarriers(powerBankId: Id<StructurePowerBank>): boolean;
  requestSpawns(roomName: string): Array<{ role: string; priority: number }>;
}

/**
 * Default stub implementations (will be replaced by actual bot)
 */
export const resourceTransferCoordinator: IResourceTransferCoordinator = {
  getPendingTransfers: () => [],
  needsCarrier: () => false
};

export const kernel: IKernel = {
  data: {},
  emit: () => {}
};

export const memoryManager: IMemoryManager = {
  getSwarmState: () => ({}),
  setSwarmState: () => {},
  getCluster: () => null,
  getEmpire: () => null
};

export const energyFlowPredictor: IEnergyFlowPredictor = {
  predictConsumption: () => 0,
  getEnergyAvailableForSpawning: (roomName: string) => {
    const room = Game.rooms[roomName];
    return room ? room.energyAvailable : 0;
  },
  predictEnergyInTicks: (roomName: string) => {
    const room = Game.rooms[roomName];
    return room ? room.energyAvailable : 0;
  },
  getMaxAffordableInTicks: (roomName: string) => {
    const room = Game.rooms[roomName];
    return room ? room.energyCapacityAvailable : 0;
  }
};

export const powerBankHarvestingManager: IPowerBankHarvestingManager = {
  getActivePowerBanks: () => [],
  needsHarvesters: () => false,
  needsCarriers: () => false,
  requestSpawns: () => []
};

/**
 * Calculate remote hauler requirement
 * Stub implementation - actual bot should provide better logic
 */
export function calculateRemoteHaulerRequirement(
  homeRoom: string,
  targetRoom: string,
  energyPerTick: number,
  distance: number
): number {
  // Simple calculation: one hauler per 10 tiles distance and 5 energy/tick
  const carryNeeded = energyPerTick * distance * 2; // Round trip
  const haulerCapacity = 50 * CARRY_CAPACITY; // Assume 50-part creep
  return Math.ceil(carryNeeded / haulerCapacity);
}
