/**
 * Canonical creep memory schema lives in @ralphschuler/screeps-memory.
 * This module is a compatibility shim for @ralphschuler/screeps-roles consumers.
 */

export type {
  RoleFamily,
  EconomyRole,
  MilitaryRole,
  UtilityRole,
  PowerRole,
  PowerBankRole,
  CreepRole,
  CreepState,
  TransferRequestAssignment,
  SwarmCreepMemory
} from "@ralphschuler/screeps-memory";

export { createDefaultCreepMemory } from "@ralphschuler/screeps-memory";
