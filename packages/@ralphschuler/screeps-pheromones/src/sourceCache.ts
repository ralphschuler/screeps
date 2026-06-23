/**
 * Tick-local source cache shared by pheromone metrics and contribution rules.
 *
 * `Room.find(FIND_SOURCES)` is cheap but still repeated across many rooms/ticks.
 * This helper preserves the existing global cache key while hiding the raw global
 * access behind a single package-internal API.
 */

interface SourceCacheEntry {
  sources: Source[];
  tick: number;
}

type SourceCacheGlobal = Record<string, SourceCacheEntry | undefined>;

function sourceCacheKey(roomName: string): string {
  return `sources_${roomName}`;
}

function sourceCache(): SourceCacheGlobal {
  return global as unknown as SourceCacheGlobal;
}

/** Return a room's sources, cached for the current game tick. */
export function getRoomSources(room: Room): Source[] {
  const cache = sourceCache();
  const cacheKey = sourceCacheKey(room.name);
  const cached = cache[cacheKey];

  if (cached?.tick === Game.time) {
    return cached.sources;
  }

  const sources = room.find(FIND_SOURCES);
  cache[cacheKey] = { sources, tick: Game.time };
  return sources;
}
