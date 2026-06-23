## Must-fix findings

None found.

## Suggestions

- **Low — docs mismatch**: `packages/screeps-defense/src/threat/threatAssessment.ts:56` still says `dismantlerCount` means “5+ work parts”, but default behavior now counts any active `WORK` part via `bodyThreatProfile.ts:92-94`. Update JSDoc to match README/default + rollback semantics.
- **Low — README nuance**: `packages/screeps-defense/README.md:187` says danger 0 is `score < 100`, but `assessThreat()` clamps any non-empty hostile set to at least danger 1 at `threatAssessment.ts:164-165`. Clarify “no actual hostiles” vs raw `calculateDangerLevel()` thresholds.

## Changed files reviewed

- `packages/screeps-defense/src/threat/threatAssessment.ts`
- `packages/screeps-defense/src/threat/bodyThreatProfile.ts`
- `packages/screeps-defense/test/threatAssessment.test.ts`
- `packages/screeps-defense/test/threatBodyProfile.test.ts`
- `packages/screeps-defense/README.md`

No reviewer file changes made.

## Validation performed

- Inspected scoped diff + new files.
- Ran:
  - `npm test -w @ralphschuler/screeps-defense -- --grep "Threat Assessment|Threat body profile"` → **28 passing**
  - `npm run build -w @ralphschuler/screeps-defense` → **pass**
  - `cd packages/screeps-defense && npx mocha test/threatAssessment.test.ts test/threatBodyProfile.test.ts` → **61 passing**

## Risks

- Main runtime behavior appears preserved: extracted profile math matches old scoring/DPS/count logic.
- Alliance safety preserved via `getActualHostileCreeps()` and covered by new test.
- Minor doc drift remains; no behavior blocker.