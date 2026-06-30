/**
 * Types shared by the dynamic link-network planner modules.
 *
 * Public plan types describe the construction intent exposed by
 * `linkNetworkPlanner.ts`; internal geometry types keep candidate selection
 * deterministic without leaking planner orchestration details.
 */

export type PlannedLinkRole = "storage" | "controller" | "spawn" | "source";

export interface PlannedLinkPlacement {
  x: number;
  y: number;
  roomName: string;
  role: PlannedLinkRole;
  /** Source/controller/storage/spawn id when available. */
  targetId?: string;
  /** Higher means this placement should consume link capacity earlier. */
  priority: number;
}

export interface LinkNetworkPlan {
  roomName: string;
  rcl: number;
  linkLimit: number;
  placements: PlannedLinkPlacement[];
}

export interface LinkCandidate {
  x: number;
  y: number;
  score: number;
}

export interface PositionLike {
  x: number;
  y: number;
}

export interface RoomObjectWithPos {
  id?: string;
  pos: RoomPosition;
}
