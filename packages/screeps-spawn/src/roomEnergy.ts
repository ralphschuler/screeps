type EnergyStructure = StructureSpawn | StructureExtension;

interface SpawnEnergySettings {
  structureEnergyFallback?: boolean;
}

function isStructureEnergyFallbackEnabled(): boolean {
  const mem = Memory as unknown as { spawnSettings?: SpawnEnergySettings };
  return mem.spawnSettings?.structureEnergyFallback !== false;
}

function getStoredEnergy(structure: EnergyStructure): number {
  const used = structure.store?.getUsedCapacity(RESOURCE_ENERGY);
  if (typeof used === "number") return used;

  const legacyEnergy = (structure as EnergyStructure & { energy?: number }).energy;
  return typeof legacyEnergy === "number" ? legacyEnergy : 0;
}

function findMySpawns(room: Room): StructureSpawn[] {
  try {
    return room.find(FIND_MY_SPAWNS);
  } catch (_error) {
    return [];
  }
}

function findMyExtensions(room: Room): StructureExtension[] {
  try {
    return room.find(FIND_MY_STRUCTURES).filter(
      (structure): structure is StructureExtension => structure.structureType === STRUCTURE_EXTENSION
    );
  } catch (_error) {
    return [];
  }
}

function getStoredSpawnExtensionEnergy(room: Room): number {
  let total = 0;

  for (const spawn of findMySpawns(room)) {
    total += getStoredEnergy(spawn);
  }

  for (const extension of findMyExtensions(room)) {
    total += getStoredEnergy(extension);
  }

  return total;
}

/**
 * Effective energy for spawn planning/execution.
 *
 * `room.energyAvailable` is authoritative in MMO runtime, but private-server
 * bootstrap states can expose a freshly seeded spawn store before the aggregate
 * room value is populated. Falling back to spawn/extension stores prevents a
 * false zero-energy deadlock while remaining disableable via:
 * `Memory.spawnSettings = { structureEnergyFallback: false }`.
 */
export function getEffectiveRoomEnergyAvailable(room: Room): number {
  const roomEnergy = room.energyAvailable ?? 0;
  if (!isStructureEnergyFallbackEnabled()) return roomEnergy;

  return Math.max(roomEnergy, getStoredSpawnExtensionEnergy(room));
}
