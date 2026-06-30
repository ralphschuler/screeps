/**
 * Internal invalidation regex builder for the cache coherence protocol.
 *
 * Cache keys are namespace-local strings such as creep names, room-scoped path keys,
 * or structure descriptors.  The coherence manager invalidates by matching those
 * keys with regular expressions, so all caller-provided identifiers must be escaped
 * before they become regex patterns.
 */

const DEFAULT_PATTERN_CACHE_LIMIT = 100;

/** Escape caller-provided text before embedding it in a regular expression. */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Small LRU cache for invalidation patterns.
 *
 * Screeps hot paths repeatedly invalidate by the same room/creep identifiers.
 * Reusing regex objects avoids repeated compilation while bounding heap growth.
 */
export class InvalidationPatternCache {
  private readonly patterns = new Map<string, RegExp>();

  public constructor(private readonly maxSize = DEFAULT_PATTERN_CACHE_LIMIT) {}

  /** Match room-bound keys where the room name is a colon-delimited segment. */
  public forRoom(roomName: string): RegExp {
    const escapedRoom = escapeRegex(roomName);
    return this.get(`(^|:)${escapedRoom}($|:)`);
  }

  /** Match keys containing a literal creep name. */
  public forCreep(creepName: string): RegExp {
    return this.get(escapeRegex(creepName));
  }

  /** Match structure keys that include both room name and structure type. */
  public forStructure(roomName: string, structureType: StructureConstant): RegExp {
    const pattern = `${escapeRegex(roomName)}.*${structureType}`;
    return this.get(pattern);
  }

  /** Get or compile a regex while refreshing LRU order on every access. */
  public get(pattern: string): RegExp {
    let regex = this.patterns.get(pattern);

    if (regex) {
      this.patterns.delete(pattern);
    } else {
      regex = new RegExp(pattern);
    }

    this.patterns.set(pattern, regex);
    this.evictOldestWhenFull();

    return regex;
  }

  private evictOldestWhenFull(): void {
    if (this.patterns.size <= this.maxSize) return;

    const firstKey = this.patterns.keys().next().value;
    if (firstKey !== undefined) {
      this.patterns.delete(firstKey);
    }
  }
}
