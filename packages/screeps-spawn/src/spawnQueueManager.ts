/**
 * Spawn Queue Manager Module
 *
 * Main spawn coordination system that:
 * - Determines which role to spawn next
 * - Selects optimal body templates
 * - Executes spawn operations
 * - Handles both bootstrap and normal spawning modes
 */

import type { SwarmState } from "@ralphschuler/screeps-memory";
import { type WeightedEntry, weightedSelection } from "@ralphschuler/screeps-utils";
import { kernel } from "./botIntegration";
import { getBootstrapRole, isBootstrapMode, isEmergencySpawnState } from "./bootstrapManager";
import { type BodyTemplate, ROLE_DEFINITIONS, type RoleSpawnDef } from "./roleDefinitions";
import { coordinateSpawning, type SpawnPipelineResult } from "./spawnCoordinator";
import { countCreepsByRole, needsRole } from "./spawnNeedsAnalyzer";
import { getDynamicPriorityBoost, getPheromoneMult, getPostureSpawnWeights } from "./spawnPriority";
import { spawnQueue } from "./spawnQueue";
import { generateSpawnCreepName } from "./spawnRequestExecution";

/**
 * Get best body template for a role based on available energy capacity
 */
export function getBestBody(def: RoleSpawnDef, energyCapacity: number): BodyTemplate | null {
  let best: BodyTemplate | null = null;

  for (const body of def.bodies) {
    if (body.cost <= energyCapacity) {
      if (!best || body.cost > best.cost) {
        best = body;
      }
    }
  }

  return best;
}

function calculateRoleSpawnScore(
  room: Room,
  swarm: SwarmState,
  role: string,
  def: RoleSpawnDef,
  counts: Map<string, number>,
  postureWeights: Record<string, number>
): number {
  const baseWeight = def.priority;
  const postureWeight = postureWeights[role] ?? 0.5;
  const pheromoneMult = getPheromoneMult(role, swarm.pheromones as unknown as Record<string, number>);
  const priorityBoost = getDynamicPriorityBoost(room, swarm, role);

  // Reduce score based on current count (guard against division by zero)
  const current = counts.get(role) ?? 0;
  const countFactor = def.maxPerRoom > 0 ? Math.max(0.1, 1 - current / def.maxPerRoom) : 0.1;

  return (baseWeight + priorityBoost) * postureWeight * pheromoneMult * countFactor;
}

/**
 * Determine next role to spawn using weighted selection.
 * In bootstrap mode, uses deterministic priority. In normal mode, uses weighted random selection.
 */
export function determineNextRole(room: Room, swarm: SwarmState): string | null {
  const counts = countCreepsByRole(room.name);

  // Bootstrap mode: use deterministic priority spawning for critical roles
  // This ensures proper recovery from bad states (all creeps dead, missing critical roles)
  if (isBootstrapMode(room.name, room)) {
    const bootstrapRole = getBootstrapRole(room.name, room, swarm);
    if (bootstrapRole) {
      return bootstrapRole;
    }
    // If no bootstrap role needed, fall through to weighted selection
  }

  // Normal mode: weighted selection based on posture, pheromones, and priorities
  const postureWeights = getPostureSpawnWeights(swarm.posture, { danger: swarm.danger });

  // Build weighted entries
  const entries: WeightedEntry<string>[] = [];

  for (const [role, def] of Object.entries(ROLE_DEFINITIONS)) {
    if (!needsRole(room.name, role, swarm)) continue;

    entries.push({ key: role, weight: calculateRoleSpawnScore(room, swarm, role, def, counts, postureWeights) });
  }

  if (entries.length === 0) return null;

  return weightedSelection(entries) ?? null;
}

/**
 * Generate unique creep name
 */
export function generateCreepName(role: string): string {
  return generateSpawnCreepName(role);
}

/**
 * Get all roles that need spawning, sorted by priority (highest first)
 */
export function getAllSpawnableRoles(room: Room, swarm: SwarmState): string[] {
  const counts = countCreepsByRole(room.name);
  const postureWeights = getPostureSpawnWeights(swarm.posture, { danger: swarm.danger });

  // Collect all roles that need spawning with their calculated priorities
  const roleScores: { role: string; score: number }[] = [];

  for (const [role, def] of Object.entries(ROLE_DEFINITIONS)) {
    if (!needsRole(room.name, role, swarm)) continue;

    roleScores.push({ role, score: calculateRoleSpawnScore(room, swarm, role, def, counts, postureWeights) });
  }

  // Sort by score descending (highest priority first)
  roleScores.sort((a, b) => b.score - a.score);

  return roleScores.map(rs => rs.role);
}

/**
 * Main spawn manager - coordinates all spawning for a room
 */
export function runSpawnManager(room: Room, swarm: SwarmState): SpawnPipelineResult {
  if (isEmergencySpawnState(room.name) && room.energyAvailable < 150) {
    kernel.emit("spawn.emergency", {
      roomName: room.name,
      energyAvailable: room.energyAvailable,
      message: "Critical workforce collapse - waiting for energy to spawn minimal creep",
      source: "SpawnManager"
    });
  }

  spawnQueue.clearQueue(room.name);
  return coordinateSpawning(room, swarm);
}
