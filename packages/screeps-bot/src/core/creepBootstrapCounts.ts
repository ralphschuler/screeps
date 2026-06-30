export interface CreepBootstrapCountOptions {
  /** Set false to bypass the per-tick cache for rollback/debug validation. */
  useCache?: boolean;
  /** Creep count below which the room is treated as bootstrap. Defaults to 5. */
  threshold?: number;
}

const DEFAULT_BOOTSTRAP_THRESHOLD = 5;

let cachedTick = -1;
let cachedHomeRoomCounts: Record<string, number> = Object.create(null) as Record<string, number>;

function getCreepHomeRoom(creep: Creep): string | undefined {
  const memory = creep.memory as { homeRoom?: unknown };
  return typeof memory.homeRoom === "string" && memory.homeRoom.length > 0 ? memory.homeRoom : undefined;
}

function buildHomeRoomCounts(): Record<string, number> {
  const counts = Object.create(null) as Record<string, number>;

  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    if (!creep) continue;

    const homeRoom = getCreepHomeRoom(creep);
    if (!homeRoom) continue;

    counts[homeRoom] = (counts[homeRoom] ?? 0) + 1;
  }

  return counts;
}

function getCachedHomeRoomCounts(): Record<string, number> {
  if (cachedTick !== Game.time) {
    cachedTick = Game.time;
    cachedHomeRoomCounts = buildHomeRoomCounts();
  }

  return cachedHomeRoomCounts;
}

function countHomeRoomCreepsDirect(roomName: string): number {
  let count = 0;

  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    if (!creep) continue;
    if (getCreepHomeRoom(creep) === roomName) count++;
  }

  return count;
}

export function getHomeRoomCreepCount(roomName: string, options: CreepBootstrapCountOptions = {}): number {
  if (options.useCache === false) {
    return countHomeRoomCreepsDirect(roomName);
  }

  return getCachedHomeRoomCounts()[roomName] ?? 0;
}

export function isBootstrapMode(room: Room, options: CreepBootstrapCountOptions = {}): boolean {
  const threshold = options.threshold ?? DEFAULT_BOOTSTRAP_THRESHOLD;
  return getHomeRoomCreepCount(room.name, options) < threshold;
}

export function resetCreepBootstrapCountCacheForTests(): void {
  cachedTick = -1;
  cachedHomeRoomCounts = Object.create(null) as Record<string, number>;
}
