/** Storage overflow energy export helpers shared by task-board and hauler logic. */

export const ENERGY_EXPORT_STORAGE_ENTER = 800_000;
export const ENERGY_EXPORT_STORAGE_EXIT = 500_000;
export const TERMINAL_EXPORT_ENERGY_TARGET = 250_000;

interface EnergyExportRoomMemory extends RoomMemory {
  energyExportActive?: boolean;
}

export interface TerminalEnergyExportRequest {
  storage: StructureStorage;
  terminal: StructureTerminal;
  storageEnergy: number;
  terminalEnergy: number;
  amount: number;
}

function getRoomMemory(roomName: string): EnergyExportRoomMemory {
  if (!Memory.rooms) {
    Memory.rooms = {};
  }
  if (!Memory.rooms[roomName]) {
    Memory.rooms[roomName] = {};
  }
  return Memory.rooms[roomName] as EnergyExportRoomMemory;
}

export function updateEnergyExportActive(room: Room): boolean {
  const storageEnergy = room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0;
  const roomMemory = getRoomMemory(room.name);
  const wasActive = roomMemory.energyExportActive === true;
  const active = storageEnergy >= ENERGY_EXPORT_STORAGE_ENTER || (wasActive && storageEnergy > ENERGY_EXPORT_STORAGE_EXIT);
  roomMemory.energyExportActive = active;
  return active;
}

export function getTerminalEnergyExportRequest(room: Room): TerminalEnergyExportRequest | null {
  if (!room.controller?.my || !room.storage || !room.terminal) return null;
  if (!updateEnergyExportActive(room)) return null;

  const storage = room.storage;
  const terminal = room.terminal;
  const storageEnergy = storage.store.getUsedCapacity(RESOURCE_ENERGY);
  const terminalEnergy = terminal.store.getUsedCapacity(RESOURCE_ENERGY);
  const terminalFree = terminal.store.getFreeCapacity(RESOURCE_ENERGY);
  const targetDeficit = Math.max(0, TERMINAL_EXPORT_ENERGY_TARGET - terminalEnergy);
  const exportableStorage = Math.max(0, storageEnergy - ENERGY_EXPORT_STORAGE_EXIT);
  const amount = Math.min(terminalFree, targetDeficit, exportableStorage);

  if (amount <= 0) return null;

  return {
    storage,
    terminal,
    storageEnergy,
    terminalEnergy,
    amount
  };
}
