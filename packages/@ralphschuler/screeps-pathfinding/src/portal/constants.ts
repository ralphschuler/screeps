/**
 * Portal manager tuning constants.
 *
 * The values mirror ROADMAP.md's low-frequency, cache-heavy design: portal
 * scans and routes are useful for many ticks, while stale local sightings are
 * filtered before publishing cross-shard routing data.
 */

/** Cache TTL for portal discovery results (500 ticks = roughly 1.5 hours). */
export const PORTAL_CACHE_TTL = 500;

/** Cache TTL for portal routes (1000 ticks = roughly 3 hours). */
export const PORTAL_ROUTE_CACHE_TTL = 1000;

/** Max age for portal information before it is considered stale. */
export const PORTAL_MAX_AGE = 10000;

/** InterShardMemory key for namespaced portal data inside the shard payload. */
export const ISM_PORTAL_KEY = "portals:";

/** Logger subsystem label shared by portal modules. */
export const PORTAL_MANAGER_SUBSYSTEM = "PortalManager";
