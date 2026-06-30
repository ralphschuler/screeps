export { collectBlockedPositions, collectOccupiedLinkPositions } from "./blockedPositions";
export { getRange, positionKey, selectCandidate } from "./candidates";
export { classifyLinkByFunctionalRange, findBuiltLinks, findPlannedLinkRole } from "./classification";
export { CORE_LINK_PRIORITIES, LINK_MIN_RCL } from "./constants";
export type {
  LinkCandidate,
  LinkNetworkPlan,
  PlannedLinkPlacement,
  PlannedLinkRole,
  PositionLike,
  RoomObjectWithPos
} from "./types";
