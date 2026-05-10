import type { BucketMode } from "./kernel";

const OWNED_ROOMS_CACHE_KEY = "_ownedRooms";
const OWNED_ROOMS_TICK_KEY = "_ownedRoomsTick";

export interface OwnedRoomsForTickInput {
  tick: number;
  rooms: () => Room[];
  cache: Record<string, unknown>;
}

export interface OptionalTickWorkInput {
  hasCpuBudget: boolean;
  bucketMode: BucketMode;
}

export function getOwnedRoomsForTick(input: OwnedRoomsForTickInput): Room[] {
  const cachedRooms = input.cache[OWNED_ROOMS_CACHE_KEY] as Room[] | undefined;
  const cachedTick = input.cache[OWNED_ROOMS_TICK_KEY] as number | undefined;

  if (cachedRooms && cachedTick === input.tick) {
    return cachedRooms;
  }

  const ownedRooms = input.rooms().filter(room => room.controller?.my);
  input.cache[OWNED_ROOMS_CACHE_KEY] = ownedRooms;
  input.cache[OWNED_ROOMS_TICK_KEY] = input.tick;
  return ownedRooms;
}

export function shouldRunOptionalTickWork(input: OptionalTickWorkInput): boolean {
  return input.hasCpuBudget && input.bucketMode !== "low" && input.bucketMode !== "critical";
}
