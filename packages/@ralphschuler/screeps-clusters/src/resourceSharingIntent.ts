import type { ResourceTransferRequest } from "@ralphschuler/screeps-memory";

export interface ResourceSharingPolicy {
  minTransferAmount: number;
  maxRequestsPerRoom: number;
  maxDistance: number;
}

export interface ResourceSharingRoomStatus {
  roomName: string;
  hasTerminal: boolean;
  energyNeed: 0 | 1 | 2 | 3;
  canProvide: number;
  needsAmount: number;
}

export interface ExistingResourceRequestSnapshot {
  fromRoom: string;
  toRoom: string;
}

export interface ResourceSharingIntentInput {
  time: number;
  rooms: ResourceSharingRoomStatus[];
  existingRequests: ExistingResourceRequestSnapshot[];
  distance: (fromRoom: string, toRoom: string) => number;
  policy: ResourceSharingPolicy;
}

export interface ResourceSharingIntent {
  plannedRequests: ResourceTransferRequest[];
  skippedRooms: { roomName: string; reason: "terminal" | "max-requests" | "no-provider" }[];
}

export function planResourceSharingIntent(input: ResourceSharingIntentInput): ResourceSharingIntent {
  const rooms = input.rooms.filter(room => !room.hasTerminal).map(room => ({ ...room }));
  const needyRooms = rooms.filter(room => room.energyNeed > 0).sort(compareNeed);
  const providerRooms = rooms.filter(room => room.canProvide > 0).sort(compareProvider);
  const plannedRequests: ResourceTransferRequest[] = [];
  const skippedRooms: ResourceSharingIntent["skippedRooms"] = [];

  for (const needyRoom of needyRooms) {
    const existingForRoom = input.existingRequests.filter(request => request.toRoom === needyRoom.roomName).length;
    const plannedForRoom = plannedRequests.filter(request => request.toRoom === needyRoom.roomName).length;
    if (existingForRoom + plannedForRoom >= input.policy.maxRequestsPerRoom) {
      skippedRooms.push({ roomName: needyRoom.roomName, reason: "max-requests" });
      continue;
    }

    const bestProvider = selectProvider(needyRoom, providerRooms, input, plannedRequests);
    if (!bestProvider) {
      skippedRooms.push({ roomName: needyRoom.roomName, reason: "no-provider" });
      continue;
    }

    const amount = Math.min(needyRoom.needsAmount, bestProvider.canProvide);
    plannedRequests.push({
      toRoom: needyRoom.roomName,
      fromRoom: bestProvider.roomName,
      resourceType: RESOURCE_ENERGY,
      amount,
      priority: needyRoom.energyNeed,
      createdAt: input.time,
      assignedCreeps: [],
      delivered: 0
    });
    bestProvider.canProvide -= amount;
  }

  return { plannedRequests, skippedRooms };
}

function selectProvider(
  needyRoom: ResourceSharingRoomStatus,
  providers: ResourceSharingRoomStatus[],
  input: ResourceSharingIntentInput,
  plannedRequests: ResourceTransferRequest[]
): ResourceSharingRoomStatus | undefined {
  return providers
    .filter(provider => provider.roomName !== needyRoom.roomName)
    .filter(provider => provider.canProvide >= input.policy.minTransferAmount)
    .filter(provider => !hasRequest(provider.roomName, needyRoom.roomName, input.existingRequests, plannedRequests))
    .map(provider => ({ provider, distance: input.distance(provider.roomName, needyRoom.roomName) }))
    .filter(candidate => candidate.distance <= input.policy.maxDistance)
    .sort((a, b) => {
      const distanceCompare = a.distance - b.distance;
      if (distanceCompare !== 0) return distanceCompare;
      const surplusCompare = b.provider.canProvide - a.provider.canProvide;
      if (surplusCompare !== 0) return surplusCompare;
      return a.provider.roomName.localeCompare(b.provider.roomName);
    })[0]?.provider;
}

function hasRequest(
  fromRoom: string,
  toRoom: string,
  existingRequests: ExistingResourceRequestSnapshot[],
  plannedRequests: ResourceTransferRequest[]
): boolean {
  return [...existingRequests, ...plannedRequests].some(request => request.fromRoom === fromRoom && request.toRoom === toRoom);
}

function compareNeed(a: ResourceSharingRoomStatus, b: ResourceSharingRoomStatus): number {
  const needCompare = b.energyNeed - a.energyNeed;
  if (needCompare !== 0) return needCompare;
  const amountCompare = b.needsAmount - a.needsAmount;
  if (amountCompare !== 0) return amountCompare;
  return a.roomName.localeCompare(b.roomName);
}

function compareProvider(a: ResourceSharingRoomStatus, b: ResourceSharingRoomStatus): number {
  const provideCompare = b.canProvide - a.canProvide;
  if (provideCompare !== 0) return provideCompare;
  return a.roomName.localeCompare(b.roomName);
}
