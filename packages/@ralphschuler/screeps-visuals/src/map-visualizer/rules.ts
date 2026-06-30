/**
 * Pure map-level rendering rules for {@link MapVisualizer}.
 *
 * Keep this module side-effect free: it owns visual scoring/classification while
 * `mapVisualizer.ts` stays focused on Screeps `Game.map.visual` drawing calls.
 */

const DEFAULT_COLOR = "#ffffff";

/** Danger colors indexed by the roadmap's 0-3 danger scale. */
export const DANGER_COLORS = ["#00ff00", "#ffff00", "#ff8800", "#ff0000"] as const;

/** Posture colors for map labels. Unknown postures deliberately fall back. */
export const POSTURE_COLORS: Readonly<Record<string, string>> = {
  eco: "#00ff00",
  expand: "#00ffff",
  defense: "#ffff00",
  war: "#ff8800",
  siege: "#ff0000",
  evacuate: "#ff00ff"
};

/** Highway overlay classification used by the legacy map visualizer. */
export interface HighwayRoomClassification {
  /** True when either parsed room coordinate lies on a 10-room highway line. */
  readonly isHighway: boolean;
  /** True when the legacy overlay should show the `SK` label. */
  readonly showSourceKeeperLabel: boolean;
}

/**
 * Return the existing danger color after applying the same clamp/fallback rules.
 */
export function getDangerColor(danger?: number): string {
  const dangerIndex = danger ? Math.min(Math.max(danger, 0), 3) : 0;
  return DANGER_COLORS[dangerIndex] ?? DEFAULT_COLOR;
}

/** Return a map label color for a room posture. */
export function getPostureColor(posture: string): string {
  return POSTURE_COLORS[posture] ?? DEFAULT_COLOR;
}

/**
 * Map-level threat score used only for visual priority hints.
 */
export function calculateMapThreatLevel(hostileCreepCount: number, hostileStructureCount: number): number {
  return hostileCreepCount + hostileStructureCount * 2;
}

/** Return the existing map threat indicator color for a threat score. */
export function getMapThreatColor(threatLevel: number): string {
  return threatLevel > 10 ? "#ff0000" : "#ff8800";
}

/**
 * Classify a room name for highway overlays using the visualizer's original
 * unanchored coordinate match. Names with no coordinate substring are not
 * highlighted.
 */
export function classifyHighwayRoom(roomName: string): HighwayRoomClassification {
  const match = roomName.match(/[WE](\d+)[NS](\d+)/);
  if (!match) {
    return { isHighway: false, showSourceKeeperLabel: false };
  }

  const x = Number.parseInt(match[1] ?? "", 10);
  const y = Number.parseInt(match[2] ?? "", 10);
  const isHighway = x % 10 === 0 || y % 10 === 0;

  return {
    isHighway,
    showSourceKeeperLabel: isHighway && x % 10 === 0 && y % 10 === 0
  };
}
