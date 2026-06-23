## Must-fix findings

1. **Hard-threat staging bypassed for auto-acquired idle defenders**  
   `packages/@ralphschuler/screeps-roles/src/behaviors/military.ts:171-185` sets only `task/targetRoom/assistTarget`.  
   Staging requires `defenseSquadId` + `defenseSquadSize` at `military.ts:210-212`.  
   Result: idle defenders acquired for a visible hard threat skip the hard-threat quorum/750-tick staging and move solo. Test codifies this at `militaryAssistance.test.ts:104-117`.  
   **Risk:** trickle deaths into W19S26-style hard pressure. Add cohort metadata on acquire or stage hard-threat assists by target/home even without squad metadata.

2. **Focused diff imports an untracked module**  
   `military.ts:16` imports `./military/patrolWaypoints`. `git ls-files --others` shows:
   - `packages/@ralphschuler/screeps-roles/src/behaviors/military/patrolWaypoints.ts`
   - `packages/@ralphschuler/screeps-roles/test/militaryPatrolWaypoints.test.ts`  
   If omitted from commit/PR, clean CI/build fails. Include them or revert the import split.

## Suggestions

- Use cached `ctx.hostiles` for home threat checks; current code re-runs `getActualHostileCreeps` per military creep (`military.ts:97-180`, `217`).
- Clear `Memory.defenseRequests` in test setup/beforeEach; new tests set it but `resetMockGame()` doesn’t clear it.
- Add explicit TedRoastBeef ally case or table-test both permanent allies. TooAngel only is covered.
- Hard-threat “safe quorum” is count-only; 5 tiny creeps can release against 45-part hostile fixtures. Consider combat-power/mix threshold.

## Validation performed

- Reviewed focused diff + related import.
- `npm run build:roles` ✅
- `npm run test:roles -- --grep "military assistance behavior"` → 96 passing ✅
- `npm run check:alliance-safety` ✅
- `git diff --check` ✅

## Changed files by reviewer

None.