/**
 * Shared construction-site priority policy for economy roles.
 *
 * Higher values are built first. Recovery rooms need defensive/economy anchors
 * before spending builder throughput on extension backlogs or perimeter polish.
 */
const DEFAULT_CONSTRUCTION_PRIORITY = 50;
const STORAGE_RECOVERY_PRIORITY_WITH_TOWER_COVERAGE = 97;
const STORAGE_RECOVERY_MIN_RCL = 4;

interface RoomConstructionPriorityState {
  tick: number;
  controllerLevel: number;
  hasStorage: boolean;
  builtTowerCount: number;
}

const roomPriorityStateByRoom = new Map<string, RoomConstructionPriorityState>();

export const CONSTRUCTION_PRIORITY: Partial<Record<BuildableStructureConstant, number>> = {
  [STRUCTURE_SPAWN]: 100,
  [STRUCTURE_TOWER]: 95,
  [STRUCTURE_STORAGE]: 90,
  [STRUCTURE_EXTENSION]: 80,
  [STRUCTURE_TERMINAL]: 75,
  [STRUCTURE_LINK]: 70,
  [STRUCTURE_CONTAINER]: 65,
  [STRUCTURE_RAMPART]: 55,
  [STRUCTURE_WALL]: 50,
  [STRUCTURE_ROAD]: 30
};

function getRoomConstructionPriorityState(room: Room): RoomConstructionPriorityState {
  const existing = roomPriorityStateByRoom.get(room.name);
  if (existing && existing.tick === Game.time) return existing;

  const structures = room.find(FIND_MY_STRUCTURES);
  const state: RoomConstructionPriorityState = {
    tick: Game.time,
    controllerLevel: room.controller?.level ?? 0,
    hasStorage: room.storage != null,
    builtTowerCount: 0
  };

  for (const structure of structures) {
    if (structure.structureType === STRUCTURE_STORAGE) state.hasStorage = true;
    if (structure.structureType === STRUCTURE_TOWER) state.builtTowerCount += 1;
  }

  roomPriorityStateByRoom.set(room.name, state);
  return state;
}

function isStorageRecoverySite(site: Pick<ConstructionSite, "structureType">, room?: Room): boolean {
  if (!room || site.structureType !== STRUCTURE_STORAGE) return false;
  const state = getRoomConstructionPriorityState(room);
  return state.controllerLevel >= STORAGE_RECOVERY_MIN_RCL && !state.hasStorage && state.builtTowerCount > 0;
}

export function getConstructionPriority(site: Pick<ConstructionSite, "structureType">, room?: Room): number {
  if (isStorageRecoverySite(site, room)) return STORAGE_RECOVERY_PRIORITY_WITH_TOWER_COVERAGE;
  return CONSTRUCTION_PRIORITY[site.structureType] ?? DEFAULT_CONSTRUCTION_PRIORITY;
}

export function compareConstructionSitePriority(a: ConstructionSite, b: ConstructionSite, room?: Room): number {
  return getConstructionPriority(b, room) - getConstructionPriority(a, room);
}
