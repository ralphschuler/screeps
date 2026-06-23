/**
 * Public and internal portal-routing data shapes.
 *
 * The manager keeps runtime discovery and InterShardMemory encoding separate so
 * callers can depend on a small stable API while implementation details stay in
 * focused helper modules.
 */

/** Destination room plus optional shard for inter-shard portal jumps. */
export interface PortalDestination {
  /** Destination shard name when the portal crosses shards. */
  shard?: string;
  /** Destination room name on the current or target shard. */
  room: string;
}

/** Portal sighting captured from a visible room. */
export interface PortalInfo {
  /** Position of the portal structure. */
  pos: RoomPosition;
  /** Normalized destination information. */
  destination: PortalDestination;
  /** Game tick when this portal was last seen. */
  lastSeen: number;
}

/** Cached route to a portal or across rooms. */
export interface PortalRoute {
  /** Room names traversed before reaching the destination or portal room. */
  rooms: string[];
  /** Portal positions traversed by this route. */
  portals: RoomPosition[];
  /** Distance estimate in rooms. */
  distance: number;
  /** Game tick when this route was calculated. */
  calculatedAt: number;
}

/** Namespaced payload stored inside InterShardMemory. */
export interface InterShardPortalData {
  /** Shard that published this portal map. */
  shard: string;
  /** Known portals on this shard, keyed by origin room name. */
  portals: Record<string, PortalDestination[]>;
  /** Game tick of the publishing shard when this data was written. */
  lastUpdate: number;
}
