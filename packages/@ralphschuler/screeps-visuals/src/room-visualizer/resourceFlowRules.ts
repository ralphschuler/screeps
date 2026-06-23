/**
 * Resource-flow rendering rules.
 *
 * RoomVisualizer performs the actual drawing; this module keeps selection and
 * animation math testable and reusable across storage/terminal overlays.
 */

/** Position shape shared by RoomPosition and lightweight test stubs. */
export interface RoomPoint {
  x: number;
  y: number;
}

/** Only resources above this amount receive a badge. */
const RESOURCE_BADGE_MINIMUM = 1000;

/** Keep badges compact so storage/terminal visuals stay readable. */
const RESOURCE_BADGE_LIMIT = 3;

/** Number of ticks in one flow-dot animation loop. */
const FLOW_ANIMATION_FRAMES = 20;

/**
 * Select up to three visible resources, sorted by stored quantity descending.
 */
export function getTopStoredResources(store: Partial<Record<ResourceConstant, number>>): ResourceConstant[] {
  return (Object.keys(store) as ResourceConstant[])
    .filter(resource => (store[resource] ?? 0) > RESOURCE_BADGE_MINIMUM)
    .sort((left, right) => (store[right] ?? 0) - (store[left] ?? 0))
    .slice(0, RESOURCE_BADGE_LIMIT);
}

/**
 * Interpolate the animated flow marker between two positions for a game tick.
 */
export function getFlowPoint(from: RoomPoint, to: RoomPoint, gameTime: number): RoomPoint {
  const progress = (gameTime % FLOW_ANIMATION_FRAMES) / FLOW_ANIMATION_FRAMES;

  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress
  };
}
