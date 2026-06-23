import type { PlannedLinkRole } from "./types";

/** Links first become available at RCL 5 in Screeps. */
export const LINK_MIN_RCL = 5;

/**
 * Base priority per functional role.
 *
 * Controller and source links form the first useful transfer pair. Storage and
 * spawn links are added later as RCL capacity increases.
 */
export const CORE_LINK_PRIORITIES: Record<PlannedLinkRole, number> = {
  controller: 400,
  source: 300,
  storage: 200,
  spawn: 100
};
