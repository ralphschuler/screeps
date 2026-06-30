/**
 * Pure rendering rules for {@link RoomVisualizer}.
 *
 * Keep these helpers side-effect free: they translate Screeps state into
 * visual scores/styles while the visualizer owns all RoomVisual calls.
 */

/** Minimal creep shape needed by threat scoring. */
export interface ThreatBodySource {
  readonly body?: readonly BodyPartDefinition[];
}

/** Visual style derived from a combat threat score. */
export interface ThreatVisualStyle {
  /** Marker color for the hostile creep. */
  color: string;
  /** Marker radius in room tiles. */
  radius: number;
  /** Marker opacity. */
  opacity: number;
  /** Whether the pulsing high-threat marker should be drawn. */
  animated: boolean;
}

const BOOSTED_THREAT_MULTIPLIER = 4;

/**
 * Score hostile creep danger from live body parts.
 *
 * The weights intentionally favor heal and attack pressure because this score
 * is only a visual triage hint; combat policy remains in defense modules.
 */
export function calculateCreepThreat(creep: ThreatBodySource): number {
  let threat = 0;

  for (const part of creep.body ?? []) {
    if (!part.hits) continue;

    const boostMultiplier = part.boost ? BOOSTED_THREAT_MULTIPLIER : 1;
    switch (part.type) {
      case ATTACK:
        threat += 5 * boostMultiplier;
        break;
      case RANGED_ATTACK:
        threat += 4 * boostMultiplier;
        break;
      case HEAL:
        threat += 6 * boostMultiplier;
        break;
      case TOUGH:
        threat += boostMultiplier;
        break;
      case WORK:
        threat += 2 * boostMultiplier;
        break;
    }
  }

  return threat;
}

/**
 * Convert a threat score into the existing hostile marker style.
 */
export function getThreatVisualStyle(threat: number): ThreatVisualStyle {
  return {
    color: threat > 30 ? "#ff0000" : threat > 10 ? "#ff8800" : "#ffff00",
    radius: 0.4 + threat / 100,
    opacity: 0.2 + (threat / 100) * 0.3,
    animated: threat > 20
  };
}

/**
 * Get 3D depth opacity for structure types.
 *
 * Higher opacity reads as taller or strategically important; roads and
 * construction previews stay low so overlays remain legible.
 */
export function getStructureDepthOpacity(type: StructureConstant): number {
  switch (type) {
    case STRUCTURE_RAMPART:
      return 0.8;
    case STRUCTURE_TOWER:
      return 0.9;
    case STRUCTURE_SPAWN:
    case STRUCTURE_STORAGE:
    case STRUCTURE_TERMINAL:
      return 0.85;
    case STRUCTURE_ROAD:
      return 0.3;
    case STRUCTURE_WALL:
      return 0.9;
    default:
      return 0.7;
  }
}
