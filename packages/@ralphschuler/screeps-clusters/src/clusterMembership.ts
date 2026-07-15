import type { ClusterMemory } from "./types";

// Keep defense reach wide enough to bridge a frontier room to its nearest core.
export const DEFAULT_CLUSTER_ROOM_DISTANCE = 3;

export interface ClusterMembershipPlanInput {
  roomNames: readonly string[];
  clusters: Readonly<
    Record<string, Pick<ClusterMemory, "id" | "coreRoom" | "memberRooms">>
  >;
  preferredClusterByRoom?: Readonly<Record<string, string | undefined>>;
  distance: (fromRoom: string, toRoom: string) => number;
  maxRoomDistance?: number;
}

export interface ClusterMembershipPlan {
  clusterByRoom: Record<string, string>;
  memberRoomsByCluster: Record<string, string[]>;
  createdClusters: Array<{ id: string; coreRoom: string }>;
}

interface WorkingCluster {
  id: string;
  coreRoom: string;
  memberRooms: Set<string>;
  existing: boolean;
}

function isFiniteDistance(distance: number): boolean {
  return Number.isFinite(distance) && distance >= 0;
}

function chooseClusterForRoom(
  roomName: string,
  clusters: readonly WorkingCluster[],
  distance: (fromRoom: string, toRoom: string) => number,
  maxRoomDistance: number,
): WorkingCluster | undefined {
  return clusters
    .map((cluster) => {
      const distances = [...cluster.memberRooms]
        .map((memberRoom) => distance(roomName, memberRoom))
        .filter(isFiniteDistance);
      const nearestDistance =
        distances.length > 0
          ? Math.min(...distances)
          : Number.POSITIVE_INFINITY;
      return { cluster, nearestDistance };
    })
    .filter((candidate) => candidate.nearestDistance <= maxRoomDistance)
    .sort(
      (a, b) =>
        a.nearestDistance - b.nearestDistance ||
        a.cluster.id.localeCompare(b.cluster.id),
    )[0]?.cluster;
}

/**
 * Plan deterministic, reset-safe cluster membership for visible owned rooms.
 * Existing assignments win; otherwise nearby owned rooms share a cluster.
 */
export function planOwnedRoomClusterMembership(
  input: ClusterMembershipPlanInput,
): ClusterMembershipPlan {
  const roomNames = [...new Set(input.roomNames)].sort();
  const maxRoomDistance =
    input.maxRoomDistance ?? DEFAULT_CLUSTER_ROOM_DISTANCE;
  const workingClusters: WorkingCluster[] = Object.values(input.clusters)
    .map((cluster) => ({
      id: cluster.id,
      coreRoom: cluster.coreRoom,
      memberRooms: new Set(cluster.memberRooms),
      existing: true,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  const clusterByRoom: Record<string, string> = {};
  const createdClusters: Array<{ id: string; coreRoom: string }> = [];

  for (const roomName of roomNames) {
    const preferredId = input.preferredClusterByRoom?.[roomName];
    const preferred = preferredId
      ? workingClusters.find((cluster) => cluster.id === preferredId)
      : undefined;
    const assigned =
      preferred ??
      chooseClusterForRoom(
        roomName,
        workingClusters,
        input.distance,
        maxRoomDistance,
      );
    const cluster =
      assigned ??
      (() => {
        const baseId = `cluster_${roomName}`;
        let id = baseId;
        let suffix = 2;
        while (workingClusters.some((candidate) => candidate.id === id)) {
          id = `${baseId}_${suffix}`;
          suffix++;
        }
        const created: WorkingCluster = {
          id,
          coreRoom: roomName,
          memberRooms: new Set<string>(),
          existing: false,
        };
        workingClusters.push(created);
        createdClusters.push({ id, coreRoom: roomName });
        return created;
      })();

    cluster.memberRooms.add(roomName);
    clusterByRoom[roomName] = cluster.id;
  }

  const memberRoomsByCluster: Record<string, string[]> = {};
  for (const cluster of workingClusters) {
    const members = [...cluster.memberRooms].sort();
    if (
      members.length > 0 &&
      (!cluster.existing ||
        members.some((roomName) => clusterByRoom[roomName] === cluster.id))
    ) {
      memberRoomsByCluster[cluster.id] = members;
    }
  }

  return { clusterByRoom, memberRoomsByCluster, createdClusters };
}
