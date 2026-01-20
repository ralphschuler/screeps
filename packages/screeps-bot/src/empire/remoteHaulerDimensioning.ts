/**
 * Remote Hauler Dimensioning - Bot Integration
 *
 * Re-exports remote hauler dimensioning utilities from the framework package.
 * The framework implementation calculates optimal number and size of haulers for remote mining operations.
 */

// Re-export only the remote hauler utilities
export {
  calculateRemoteHaulerRequirement,
  calculatePathDistance,
  estimateRoundTripTicks,
  getCurrentRemoteHaulerCount,
  needsMoreHaulers,
  getRecommendedHaulerBody,
  HAULER_TIERS,
  type RemoteHaulerRequirement
} from "@ralphschuler/screeps-empire";

