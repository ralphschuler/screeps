import { cachedFindSources } from "@ralphschuler/screeps-cache";
import { calculateRemoteHaulerRequirement } from "./botIntegration";
import { getRemoteWorkerMaxPerRemote } from "./remoteWorkerDemand";

const DEFAULT_INVISIBLE_REMOTE_SOURCE_COUNT = 2;
const DEFAULT_HOME_ENERGY_CAPACITY = 800;
const MAX_INVISIBLE_REMOTE_HAULERS = 2;
const DEFAULT_REMOTE_ROLE_MAX_PER_REMOTE = 2;

/** Reservation threshold in ticks before the spawn system refreshes remote claims. */
export const REMOTE_RESERVATION_REFRESH_TICKS = 3000;

/** Remote economy roles that require a concrete assigned target room before spawning. */
export const REMOTE_ECONOMY_ROLES = ["remoteHarvester", "remoteHauler", "remoteWorker"] as const;
export type RemoteEconomyRole = typeof REMOTE_ECONOMY_ROLES[number];

/** True when a role consumes a remote economy assignment rather than local room demand. */
export function isRemoteEconomyRole(role: string): role is RemoteEconomyRole {
  return (REMOTE_ECONOMY_ROLES as readonly string[]).includes(role);
}

/**
 * Remote hauler sizing treats healthy reservations as doubled source income.
 * Keeping this check beside hauler demand prevents reservation math from being
 * duplicated across spawn planners.
 */
export function hasHealthyRemoteReservation(room: Room): boolean {
  const reservationTicks = room.controller?.reservation?.ticksToEnd ?? 0;
  return reservationTicks >= REMOTE_RESERVATION_REFRESH_TICKS;
}

function getHomeEnergyCapacity(homeRoom: string): number {
  return Game.rooms[homeRoom]?.energyCapacityAvailable ?? DEFAULT_HOME_ENERGY_CAPACITY;
}

function getRemoteHarvesterMaxPerRemote(room: Room | undefined): number {
  if (!room) return DEFAULT_INVISIBLE_REMOTE_SOURCE_COUNT;
  return cachedFindSources(room).length;
}

function getRemoteHaulerMaxPerRemote(homeRoom: string, targetRoom: string, room: Room | undefined): number {
  const energyCapacity = getHomeEnergyCapacity(homeRoom);

  if (room) {
    const sourceCount = cachedFindSources(room).length;
    const requirement = calculateRemoteHaulerRequirement(homeRoom, targetRoom, sourceCount, energyCapacity, {
      reserved: hasHealthyRemoteReservation(room)
    });
    return requirement.recommendedHaulers;
  }

  const requirement = calculateRemoteHaulerRequirement(
    homeRoom,
    targetRoom,
    DEFAULT_INVISIBLE_REMOTE_SOURCE_COUNT,
    energyCapacity,
    { reserved: false }
  );
  return Math.min(MAX_INVISIBLE_REMOTE_HAULERS, requirement.recommendedHaulers);
}

/**
 * Return the per-remote target count for a role in one assigned remote room.
 *
 * Visible rooms use direct room data; invisible rooms use conservative estimates
 * so scouts and harvesters can open remote vision without overfilling the queue.
 */
export function getRemoteRoleMaxPerRemote(
  homeRoom: string,
  targetRoom: string,
  role: string,
  room: Room | undefined
): number {
  switch (role) {
    case "remoteHarvester":
      return getRemoteHarvesterMaxPerRemote(room);
    case "remoteHauler":
      return getRemoteHaulerMaxPerRemote(homeRoom, targetRoom, room);
    case "remoteWorker":
      return getRemoteWorkerMaxPerRemote(room);
    default:
      return DEFAULT_REMOTE_ROLE_MAX_PER_REMOTE;
  }
}
