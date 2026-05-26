export interface RemoteInfrastructureControllerSnapshot {
  ownerUsername?: string;
  reservationUsername?: string;
}

export interface RemoteInfrastructurePositionSnapshot {
  x: number;
  y: number;
  walkableNeighbors: number;
  hasStructure: boolean;
  hasContainer: boolean;
  hasContainerSite: boolean;
}

export interface RemoteInfrastructureSourceSnapshot {
  id: Id<Source>;
  positions: RemoteInfrastructurePositionSnapshot[];
}

export interface RemoteInfrastructureRoomSnapshot {
  name: string;
  constructionSiteCount: number;
  controller?: RemoteInfrastructureControllerSnapshot;
  sources?: RemoteInfrastructureSourceSnapshot[];
  roadPositions: { x: number; y: number }[];
  roadKeys: string[];
  roadSiteKeys: string[];
  wallKeys: string[];
}

export interface RemoteInfrastructureSnapshot {
  homeRoomName: string;
  myUsername: string;
  remoteAssignments: string[];
  visibleRooms: Record<string, RemoteInfrastructureRoomSnapshot>;
  maxSitesPerRemotePerTick: number;
  maxConstructionSitesPerRoom: number;
  maxRoadSitesPerRoomPerTick: number;
}

export interface RemoteContainerSiteIntent {
  roomName: string;
  sourceId: Id<Source>;
  x: number;
  y: number;
  structureType: typeof STRUCTURE_CONTAINER;
}

export interface RemoteRoadSiteIntent {
  roomName: string;
  x: number;
  y: number;
  structureType: typeof STRUCTURE_ROAD;
}

export type RemoteInfrastructureSkipReason =
  | "not-visible"
  | "hostile-owner"
  | "hostile-reservation"
  | "site-limit"
  | "container-exists"
  | "no-container-position";

export interface RemoteInfrastructureSkip {
  roomName: string;
  reason: RemoteInfrastructureSkipReason;
  sourceId?: Id<Source>;
}

export interface RemoteInfrastructureIntent {
  homeRoomName: string;
  remoteRooms: string[];
  containerSites: RemoteContainerSiteIntent[];
  roadSites: RemoteRoadSiteIntent[];
  skipped: RemoteInfrastructureSkip[];
}

export function planRemoteInfrastructureIntent(snapshot: RemoteInfrastructureSnapshot): RemoteInfrastructureIntent {
  const skipped: RemoteInfrastructureSkip[] = [];
  const containerSites = planContainerSites(snapshot, skipped);
  const roadSites = planRoadSites(snapshot, containerSites);

  return {
    homeRoomName: snapshot.homeRoomName,
    remoteRooms: [...snapshot.remoteAssignments],
    containerSites,
    roadSites,
    skipped
  };
}

function planContainerSites(
  snapshot: RemoteInfrastructureSnapshot,
  skipped: RemoteInfrastructureSkip[]
): RemoteContainerSiteIntent[] {
  const intents: RemoteContainerSiteIntent[] = [];

  for (const remoteName of snapshot.remoteAssignments) {
    const room = snapshot.visibleRooms[remoteName];
    if (!room) {
      skipped.push({ roomName: remoteName, reason: "not-visible" });
      continue;
    }

    if (room.controller?.ownerUsername !== undefined && room.controller.ownerUsername !== snapshot.myUsername) {
      skipped.push({ roomName: remoteName, reason: "hostile-owner" });
      continue;
    }

    if (
      room.controller?.reservationUsername !== undefined &&
      room.controller.reservationUsername !== snapshot.myUsername
    ) {
      skipped.push({ roomName: remoteName, reason: "hostile-reservation" });
      continue;
    }

    let plannedForRoom = 0;
    for (const source of room.sources ?? []) {
      if (plannedForRoom >= snapshot.maxSitesPerRemotePerTick) break;
      if (room.constructionSiteCount + plannedForRoom >= snapshot.maxConstructionSitesPerRoom) {
        skipped.push({ roomName: remoteName, reason: "site-limit", sourceId: source.id });
        break;
      }

      if (source.positions.some(pos => pos.hasContainer || pos.hasContainerSite)) {
        skipped.push({ roomName: remoteName, reason: "container-exists", sourceId: source.id });
        continue;
      }

      const containerPos = [...source.positions]
        .filter(pos => !pos.hasStructure)
        .sort((a, b) => b.walkableNeighbors - a.walkableNeighbors)[0];

      if (!containerPos) {
        skipped.push({ roomName: remoteName, reason: "no-container-position", sourceId: source.id });
        continue;
      }

      intents.push({
        roomName: remoteName,
        sourceId: source.id,
        x: containerPos.x,
        y: containerPos.y,
        structureType: STRUCTURE_CONTAINER
      });
      plannedForRoom++;
    }
  }

  return intents;
}

function planRoadSites(
  snapshot: RemoteInfrastructureSnapshot,
  containerSites: readonly RemoteContainerSiteIntent[]
): RemoteRoadSiteIntent[] {
  const intents: RemoteRoadSiteIntent[] = [];
  const plannedSitesByRoom = new Map<string, number>();
  for (const site of containerSites) {
    plannedSitesByRoom.set(site.roomName, (plannedSitesByRoom.get(site.roomName) ?? 0) + 1);
  }

  for (const roomName of [snapshot.homeRoomName, ...snapshot.remoteAssignments]) {
    const room = snapshot.visibleRooms[roomName];
    if (!room) continue;

    const roadKeys = new Set(room.roadKeys);
    const roadSiteKeys = new Set(room.roadSiteKeys);
    const wallKeys = new Set(room.wallKeys);
    let plannedTotalForRoom = plannedSitesByRoom.get(roomName) ?? 0;
    let plannedRoadsForRoom = 0;

    for (const pos of room.roadPositions) {
      if (plannedRoadsForRoom >= snapshot.maxRoadSitesPerRoomPerTick) break;
      if (room.constructionSiteCount + plannedTotalForRoom >= snapshot.maxConstructionSitesPerRoom) break;

      const key = `${pos.x},${pos.y}`;
      if (roadKeys.has(key)) continue;
      if (roadSiteKeys.has(key)) continue;
      if (wallKeys.has(key)) continue;

      intents.push({ roomName, x: pos.x, y: pos.y, structureType: STRUCTURE_ROAD });
      plannedRoadsForRoom++;
      plannedTotalForRoom++;
    }
  }

  return intents;
}
