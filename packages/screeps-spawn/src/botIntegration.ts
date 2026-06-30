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
import type { CrossShardTransferRequest } from "@ralphschuler/screeps-intershard";
import {
  createDefaultEmpireMemory,
  createDefaultSwarmState,
  type ClusterMemory,
  type EmpireMemory,
  type SwarmState,
} from "@ralphschuler/screeps-memory";

export type { CrossShardTransferRequest } from "@ralphschuler/screeps-intershard";

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
  getSwarmState(roomName: string): SwarmState;
  setSwarmState(roomName: string, state: SwarmState): void;
  getCluster(clusterId: string): ClusterMemory | undefined;
  getEmpire(): EmpireMemory;
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
  getSwarmState: () => createDefaultSwarmState(),
  setSwarmState: () => {},
  getCluster: () => undefined,
  getEmpire: () => createDefaultEmpireMemory(),
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
  if (overrides.resourceTransferCoordinator) {
    const source = overrides.resourceTransferCoordinator;
    if (source.getPendingTransfers) {
      resourceTransferCoordinator.getPendingTransfers = (roomName: string) => source.getPendingTransfers!(roomName);
    }
    if (source.needsCarrier) {
      resourceTransferCoordinator.needsCarrier = (roomName: string) => source.needsCarrier!(roomName);
    }
    if (source.getActiveRequests) {
      resourceTransferCoordinator.getActiveRequests = () => source.getActiveRequests!();
    }
  }

  if (overrides.kernel) {
    const source = overrides.kernel;
    if (source.data) kernel.data = source.data;
    if (source.emit) kernel.emit = (event: string, data: unknown) => source.emit!(event, data);
  }

  if (overrides.memoryManager) {
    const source = overrides.memoryManager;
    if (source.getSwarmState) memoryManager.getSwarmState = (roomName: string) => source.getSwarmState!(roomName);
    if (source.setSwarmState) {
      memoryManager.setSwarmState = (roomName: string, state: SwarmState) => source.setSwarmState!(roomName, state);
    }
    if (source.getCluster) memoryManager.getCluster = (clusterId: string) => source.getCluster!(clusterId);
    if (source.getEmpire) memoryManager.getEmpire = () => source.getEmpire!();
  }

  if (overrides.energyFlowPredictor) {
    const source = overrides.energyFlowPredictor;
    if (source.predictConsumption) {
      energyFlowPredictor.predictConsumption = (roomName: string) => source.predictConsumption!(roomName);
    }
    if (source.getEnergyAvailableForSpawning) {
      energyFlowPredictor.getEnergyAvailableForSpawning = (roomName: string) =>
        source.getEnergyAvailableForSpawning!(roomName);
    }
    if (source.predictEnergyInTicks) {
      energyFlowPredictor.predictEnergyInTicks = (room: Room, ticks: number) => source.predictEnergyInTicks!(room, ticks);
    }
    if (source.getMaxAffordableInTicks) {
      energyFlowPredictor.getMaxAffordableInTicks = (room: Room, ticks: number) =>
        source.getMaxAffordableInTicks!(room, ticks);
    }
  }

  if (overrides.powerBankHarvestingManager) {
    const source = overrides.powerBankHarvestingManager;
    if (source.getActivePowerBanks) {
      powerBankHarvestingManager.getActivePowerBanks = () => source.getActivePowerBanks!();
    }
    if (source.needsHarvesters) {
      powerBankHarvestingManager.needsHarvesters = (powerBankId: Id<StructurePowerBank>) => source.needsHarvesters!(powerBankId);
    }
    if (source.needsCarriers) {
      powerBankHarvestingManager.needsCarriers = (powerBankId: Id<StructurePowerBank>) => source.needsCarriers!(powerBankId);
    }
    if (source.requestSpawns) {
      powerBankHarvestingManager.requestSpawns = (roomName: string) => source.requestSpawns!(roomName);
    }
  }

  if (overrides.emergencyResponseManager?.getEmergencyState) {
    const source = overrides.emergencyResponseManager;
    emergencyResponseManager.getEmergencyState = (roomName: string) => source.getEmergencyState!(roomName);
  }
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
