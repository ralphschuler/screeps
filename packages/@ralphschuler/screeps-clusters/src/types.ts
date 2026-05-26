/**
 * Canonical type exports for @ralphschuler/screeps-clusters.
 *
 * Package Modules use the shared memory schemas as the source of truth so the
 * cluster package cannot drift from the live bot Memory shape.
 */

export type {
  ClusterMemory,
  DefenseAssistanceRequest,
  EmpireMemory,
  ResourceTransferRequest,
  RoomIntel,
  SquadDefinition,
  SwarmState
} from "@ralphschuler/screeps-memory";

export { createDefaultClusterMemory } from "@ralphschuler/screeps-memory";

export { SpawnPriority, type SpawnRequest } from "@ralphschuler/screeps-spawn";
