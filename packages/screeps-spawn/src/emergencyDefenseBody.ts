import {
  calculateCombatPower,
  isDefenseAssistThreatProfileHard,
  type DefenseAssistRole,
  type DefenseAssistThreatProfile
} from "@ralphschuler/screeps-defense";
import { optimizeBody } from "./bodyOptimizer";
import type { BodyTemplate } from "./roleDefinitions";

export type AffordableEmergencyDefenseRole = "guard" | "ranger";

export function getAffordableEmergencyDefenseBody(
  role: AffordableEmergencyDefenseRole,
  availableEnergy: number
): BodyTemplate | null {
  if (availableEnergy <= 0) return null;

  try {
    const body = optimizeBody({ maxEnergy: availableEnergy, role });
    if (body.cost > availableEnergy) return null;
    if (role === "guard" && !body.parts.includes(ATTACK)) return null;
    if (role === "ranger" && !body.parts.includes(RANGED_ATTACK)) return null;
    return body;
  } catch {
    return null;
  }
}

export function getAffordableEmergencyDefenseAssistBody(
  role: DefenseAssistRole,
  availableEnergy: number,
  threatProfile: DefenseAssistThreatProfile | null | undefined
): BodyTemplate | null {
  if (role === "healer") return null;
  if (role === "ranger" && isDefenseAssistThreatProfileHard(threatProfile)) return null;
  return getAffordableEmergencyDefenseBody(role, availableEnergy);
}

export function getAffordableEmergencyDefenderFallback(
  availableEnergy: number,
  threatProfile: DefenseAssistThreatProfile | null | undefined
): { role: AffordableEmergencyDefenseRole; body: BodyTemplate } | null {
  const candidates = (["guard", "ranger"] as const)
    .map(role => {
      const body = getAffordableEmergencyDefenseBody(role, availableEnergy);
      return body ? { role, body } : null;
    })
    .filter((candidate): candidate is { role: AffordableEmergencyDefenseRole; body: BodyTemplate } => Boolean(candidate));

  if (candidates.length === 0) return null;

  const strongestThreat = threatProfile?.strongest;
  return candidates.sort((a, b) => {
    const powerDelta = calculateCombatPower(b.body.parts).score - calculateCombatPower(a.body.parts).score;
    if (powerDelta !== 0) return powerDelta;
    if (strongestThreat?.ranged && a.role !== b.role) return a.role === "ranger" ? -1 : 1;
    return a.body.cost - b.body.cost;
  })[0] ?? null;
}
