/** Minimal persisted nuke-alert shape needed by the critical-structure policy. */
export interface NukeStructureThreat {
  threatenedStructures?: readonly string[];
}

const CRITICAL_NUKE_STRUCTURE_TYPES = [
  "spawn",
  "storage",
  "terminal",
] as const satisfies readonly StructureConstant[];

/**
 * Return whether a persisted nuke alert threatens evacuation-critical structures.
 *
 * Threat descriptors use the `<structureType>-<x>,<y>` format emitted by nuke
 * detection. The policy is pure so detection, evacuation, and package consumers
 * share one definition.
 */
export function hasCriticalStructuresThreatened(alert: NukeStructureThreat): boolean {
  return (alert.threatenedStructures ?? []).some(structure =>
    CRITICAL_NUKE_STRUCTURE_TYPES.some(structureType => structure.includes(structureType))
  );
}
