import { ISM_PORTAL_KEY } from "./constants";
import type { InterShardPortalData } from "./types";

export type PortalDataPayloadResult =
  | { ok: true; data: InterShardPortalData }
  | { ok: false; reason: "invalid-json" | "invalid-structure" };

/**
 * Merge portal data into the current shard's InterShardMemory payload.
 *
 * InterShardMemory exposes one string per shard, so portal data must coexist
 * with other subsystems under a stable namespaced key. Invalid existing JSON is
 * discarded, matching the old fail-open behavior in `PortalManager`.
 */
export function encodePortalDataPayload(existingPayload: string, portalData: InterShardPortalData): string {
  const existing = parsePayloadObject(existingPayload) ?? {};
  existing[ISM_PORTAL_KEY] = portalData;

  return JSON.stringify(existing);
}

/** Return portal data from a raw InterShardMemory payload, or null if invalid. */
export function readPortalDataFromPayload(payload: string): InterShardPortalData | null {
  const result = parsePortalDataPayload(payload);
  return result.ok ? result.data : null;
}

/** Parse and validate the portal section of a raw InterShardMemory payload. */
export function parsePortalDataPayload(payload: string): PortalDataPayloadResult {
  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return { ok: false, reason: "invalid-json" };
  }

  if (!isPlainObject(parsed)) return { ok: false, reason: "invalid-structure" };

  const portalData = parsed[ISM_PORTAL_KEY];
  if (!isValidPortalData(portalData)) return { ok: false, reason: "invalid-structure" };

  return { ok: true, data: portalData };
}

/** Validate the portal data structure from another shard before trusting it. */
export function isValidPortalData(data: unknown): data is InterShardPortalData {
  if (!isPlainObject(data)) return false;

  if (typeof data.shard !== "string") return false;
  if (typeof data.lastUpdate !== "number") return false;
  if (!isPlainObject(data.portals)) return false;

  for (const roomPortals of Object.values(data.portals)) {
    if (!Array.isArray(roomPortals)) return false;

    for (const portal of roomPortals) {
      if (!isValidPortalDestination(portal)) return false;
    }
  }

  return true;
}

function parsePayloadObject(payload: string): Record<string, unknown> | null {
  if (!payload) return {};

  try {
    const parsed: unknown = JSON.parse(payload);
    return isPlainObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isValidPortalDestination(value: unknown): value is { shard?: string; room: string } {
  if (!isPlainObject(value)) return false;
  if (typeof value.room !== "string") return false;

  return value.shard === undefined || typeof value.shard === "string";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
