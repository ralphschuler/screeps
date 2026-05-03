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
 * Energy prediction result
 */
export interface EnergyPrediction {
  current: number;
  predicted: number;
  netFlow: number;
  ticks: number;
}

/**
 * Power bank spawn needs
 */
export interface PowerBankSpawnRequests {
  powerHarvesters: number;
  healers: number;
  powerCarriers: number;
}

/**
 * Remote hauler requirement calculation result
 */
export interface RemoteHaulerRequirement {
  minHaulers: number;
  recommendedHaulers: number;
  distance: number;
  roundTripTicks: number;
  energyPerTick: number;
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
  predictEnergyInTicks(room: Room, ticks: number): EnergyPrediction;
  getMaxAffordableInTicks(room: Room, ticks: number): number;
}

/**
 * Power bank harvesting manager interface
 */
export interface IPowerBankHarvestingManager {
  getActivePowerBanks(): Array<{ roomName: string; id: Id<StructurePowerBank> }>;
  needsHarvesters(powerBankId: Id<StructurePowerBank>): boolean;
  needsCarriers(powerBankId: Id<StructurePowerBank>): boolean;
  requestSpawns(roomName: string): PowerBankSpawnRequests;
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
  predictEnergyInTicks: (room: Room, ticks: number) => {
    return {
      current: room.energyAvailable,
      predicted: room.energyAvailable,
      netFlow: 0,
      ticks
    };
  },
  getMaxAffordableInTicks: (room: Room) => {
    return room.energyCapacityAvailable;
  }
};

export const powerBankHarvestingManager: IPowerBankHarvestingManager = {
  getActivePowerBanks: () => [],
  needsHarvesters: () => false,
  needsCarriers: () => false,
  requestSpawns: () => ({
    powerHarvesters: 0,
    healers: 0,
    powerCarriers: 0
  })
};

/**
 * Calculate remote hauler requirement
 * Stub implementation - actual bot should provide better logic
 */
export function calculateRemoteHaulerRequirement(
  homeRoom: string,
  targetRoom: string,
  sourceCount: number,
  availableEnergy: number
): RemoteHaulerRequirement {
  const distance = Game.map.getRoomLinearDistance(homeRoom, targetRoom);
  const roundTripTicks = Math.max(50, distance * 100);
  const energyPerTick = sourceCount * 10;
  const carryParts = Math.max(4, Math.min(16, Math.floor(availableEnergy / 100)));
  const haulerCapacity = carryParts * CARRY_CAPACITY;
  const minHaulers = Math.max(1, Math.ceil((energyPerTick * roundTripTicks) / haulerCapacity));

  return {
    minHaulers,
    recommendedHaulers: Math.min(sourceCount * 2, minHaulers + 1),
    distance,
    roundTripTicks,
    energyPerTick
  };
}
