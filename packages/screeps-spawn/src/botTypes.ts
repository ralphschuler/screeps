/**
 * Compatibility type exports for @ralphschuler/screeps-spawn.
 *
 * Canonical role, swarm, and creep-memory shapes live in
 * @ralphschuler/screeps-memory. Keep this facade for older importers only.
 */

export type {
  CreepRole,
  EconomyRole,
  MilitaryRole,
  PowerBankRole,
  PowerRole,
  RoleFamily,
  RoomPosture,
  SwarmCreepMemory,
  SwarmState,
  UtilityRole
} from "@ralphschuler/screeps-memory";

export type { PheromoneState as Pheromones } from "@ralphschuler/screeps-memory";
export type { EvolutionStage as ColonyLevel } from "@ralphschuler/screeps-memory";
