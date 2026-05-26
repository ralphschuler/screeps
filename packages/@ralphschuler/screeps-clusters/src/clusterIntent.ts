import type { ClusterMemory } from "./types";

export type ClusterOperationName =
  | "metrics"
  | "defense"
  | "terminals"
  | "resourceSharing"
  | "squads"
  | "offensive"
  | "rallyPoints"
  | "militaryResources"
  | "role"
  | "focusRoom";

export interface ClusterOperationStep {
  name: ClusterOperationName;
  statsKey: string;
}

export interface ClusterOperationSummary {
  memberRoomCount: number;
  remoteRoomCount: number;
  defenseRequestCount: number;
  resourceRequestCount: number;
  squadCount: number;
  role: ClusterMemory["role"];
  focusRoom?: string;
}

export interface ClusterOperationIntent {
  clusterId: string;
  steps: readonly ClusterOperationStep[];
  summary: ClusterOperationSummary;
}

export const CLUSTER_OPERATION_STEPS: readonly Pick<ClusterOperationStep, "name">[] = [
  { name: "metrics" },
  { name: "defense" },
  { name: "terminals" },
  { name: "resourceSharing" },
  { name: "squads" },
  { name: "offensive" },
  { name: "rallyPoints" },
  { name: "militaryResources" },
  { name: "role" },
  { name: "focusRoom" }
] as const;

export function buildClusterOperationIntent(cluster: ClusterMemory): ClusterOperationIntent {
  return {
    clusterId: cluster.id,
    steps: CLUSTER_OPERATION_STEPS.map(step => ({
      name: step.name,
      statsKey: `cluster:${cluster.id}:${step.name}`
    })),
    summary: {
      memberRoomCount: cluster.memberRooms.length,
      remoteRoomCount: cluster.remoteRooms.length,
      defenseRequestCount: cluster.defenseRequests.length,
      resourceRequestCount: cluster.resourceRequests.length,
      squadCount: cluster.squads.length,
      role: cluster.role,
      focusRoom: cluster.focusRoom
    }
  };
}
