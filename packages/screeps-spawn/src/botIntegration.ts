/**
 * Bot Integration Layer
 *
 * This file provides interfaces and default implementations for bot-specific dependencies.
 * The actual bot (screeps-bot) should provide concrete implementations of these.
 */

import {
  calculateRemoteHaulerRequirement as calculateEmpireRemoteHaulerRequirement,
  type RemoteHaulerOptions,
  type RemoteHaulerRequirement as EmpireRemoteHaulerRequirement,
} from "@ralphschuler/screeps-empire";

/**
 * Cross-shard transfer request
 */
export interface CrossShardTransferRequest {
  fromRoom: string;
  toRoom: string;
  resourceType: ResourceConstant;
  amount: number;
  sourceRoom?: string;
  transferred?: number;
  assignedCreeps?: string[];
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

export type RemoteHaulerRequirement = EmpireRemoteHaulerRequirement;

/**
 * Resource transfer coordinator interface
 */
export interface IResourceTransferCoordinator {
  getPendingTransfers(roomName: string): CrossShardTransferRequest[];
  needsCarrier(roomName: string): boolean;
  getActiveRequests?(): CrossShardTransferRequest[];
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
  getActivePowerBanks(): Array<{
    roomName: string;
    id: Id<StructurePowerBank>;
  }>;
  needsHarvesters(powerBankId: Id<StructurePowerBank>): boolean;
  needsCarriers(powerBankId: Id<StructurePowerBank>): boolean;
  requestSpawns(roomName: string): PowerBankSpawnRequests;
}

export interface IEmergencyResponseManager {
  getEmergencyState(roomName: string): unknown;
}

/**
 * Default stub implementations (will be replaced by actual bot)
 */
export const resourceTransferCoordinator: IResourceTransferCoordinator = {
  getPendingTransfers: () => [],
  needsCarrier: () => false,
};

export const kernel: IKernel = {
  data: {},
  emit: () => {},
};

export const memoryManager: IMemoryManager = {
  getSwarmState: () => ({}),
  setSwarmState: () => {},
  getCluster: () => null,
  getEmpire: () => ({ claimQueue: [] }),
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
      ticks,
    };
  },
  getMaxAffordableInTicks: (room: Room) => {
    return room.energyCapacityAvailable;
  },
};

export const powerBankHarvestingManager: IPowerBankHarvestingManager = {
  getActivePowerBanks: () => [],
  needsHarvesters: () => false,
  needsCarriers: () => false,
  requestSpawns: () => ({
    powerHarvesters: 0,
    healers: 0,
    powerCarriers: 0,
  }),
};

export const emergencyResponseManager: IEmergencyResponseManager = {
  getEmergencyState: () => null,
};

export interface SpawnIntegrationOverrides {
  resourceTransferCoordinator?: Partial<IResourceTransferCoordinator>;
  kernel?: Partial<IKernel>;
  memoryManager?: Partial<IMemoryManager>;
  energyFlowPredictor?: Partial<IEnergyFlowPredictor>;
  powerBankHarvestingManager?: Partial<IPowerBankHarvestingManager>;
  emergencyResponseManager?: Partial<IEmergencyResponseManager>;
}

export function configureSpawnIntegration(
  overrides: SpawnIntegrationOverrides,
): void {
  if (overrides.resourceTransferCoordinator)
    Object.assign(
      resourceTransferCoordinator,
      overrides.resourceTransferCoordinator,
    );
  if (overrides.kernel) Object.assign(kernel, overrides.kernel);
  if (overrides.memoryManager)
    Object.assign(memoryManager, overrides.memoryManager);
  if (overrides.energyFlowPredictor)
    Object.assign(energyFlowPredictor, overrides.energyFlowPredictor);
  if (overrides.powerBankHarvestingManager)
    Object.assign(
      powerBankHarvestingManager,
      overrides.powerBankHarvestingManager,
    );
  if (overrides.emergencyResponseManager)
    Object.assign(emergencyResponseManager, overrides.emergencyResponseManager);
}

export function calculateRemoteHaulerRequirement(
  homeRoom: string,
  targetRoom: string,
  sourceCount: number,
  availableEnergy: number,
  options?: RemoteHaulerOptions,
): RemoteHaulerRequirement {
  return calculateEmpireRemoteHaulerRequirement(
    homeRoom,
    targetRoom,
    sourceCount,
    availableEnergy,
    options,
  );
}
