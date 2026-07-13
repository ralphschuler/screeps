import {
  hasCriticalStructuresThreatened as compatibilityPredicate,
  type IncomingNukeAlert,
} from "@ralphschuler/screeps-empire";
import {
  hasCriticalStructuresThreatened as canonicalPredicate,
  type NukeStructureThreat,
} from "@ralphschuler/screeps-defense";
import {
  hasCriticalStructuresThreatened as lightweightPredicate,
} from "@ralphschuler/screeps-defense/nuke-threat-policy";

declare const alert: IncomingNukeAlert;
const structuralAlert: NukeStructureThreat = alert;

export const compatibilityResult: boolean = compatibilityPredicate(alert);
export const canonicalResult: boolean = canonicalPredicate(structuralAlert);
export const lightweightResult: boolean = lightweightPredicate(structuralAlert);
