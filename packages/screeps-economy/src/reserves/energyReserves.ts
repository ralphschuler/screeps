/** Shared mature-room reserve bands and predicates for economy recovery. */
export const MATURE_ROOM_MIN_RCL = 4;
export const MATURE_ROOM_STORAGE_RESERVE_ENERGY = 50_000;
export const MATURE_ROOM_TERMINAL_RESERVE_ENERGY = 20_000;
export const MATURE_ROOM_RESERVE_RECOVERY_UPGRADER_LIMIT = 1;

interface EnergyStoreStructure {
  store: Pick<StoreDefinition, "getUsedCapacity">;
}

export interface MatureRoomEnergyReserveState {
  controllerLevel: number;
  isMatureOwnedRoom: boolean;
  storageEnergy: number;
  terminalEnergy: number;
  hasStorageReserveDeficit: boolean;
  hasTerminalReserveDeficit: boolean;
  hasAnyReserveDeficit: boolean;
}

export function getStoredEnergy(structure: EnergyStoreStructure | null | undefined): number {
  return structure?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0;
}

export function getMatureRoomEnergyReserveState(room: Room | null | undefined): MatureRoomEnergyReserveState {
  const controllerLevel = room?.controller?.level ?? 0;
  const isMatureOwnedRoom = Boolean(room?.controller?.my && controllerLevel >= MATURE_ROOM_MIN_RCL && room.storage);
  const storageEnergy = getStoredEnergy(room?.storage);
  const terminalEnergy = getStoredEnergy(room?.terminal);
  const hasStorageReserveDeficit = isMatureOwnedRoom && storageEnergy < MATURE_ROOM_STORAGE_RESERVE_ENERGY;
  const hasTerminalReserveDeficit =
    isMatureOwnedRoom &&
    controllerLevel >= 6 &&
    Boolean(room?.terminal) &&
    terminalEnergy < MATURE_ROOM_TERMINAL_RESERVE_ENERGY;

  return {
    controllerLevel,
    isMatureOwnedRoom,
    storageEnergy,
    terminalEnergy,
    hasStorageReserveDeficit,
    hasTerminalReserveDeficit,
    hasAnyReserveDeficit: hasStorageReserveDeficit || hasTerminalReserveDeficit
  };
}

export function hasDepletedMatureEnergyReserve(room: Room | null | undefined): boolean {
  return getMatureRoomEnergyReserveState(room).hasAnyReserveDeficit;
}
