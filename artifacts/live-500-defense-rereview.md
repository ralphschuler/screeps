no must-fix findings

**Changed files reviewed**
- `packages/@ralphschuler/screeps-roles/src/behaviors/military.ts`
- `packages/@ralphschuler/screeps-roles/test/militaryAssistance.test.ts`
- No edits made.

**Evidence checked**
- Hard-threat staging/quorum: `military.ts:25-30`, `77-94`, `140-194`, `221-236`
- Ally filtering via `getActualHostileCreeps/Structures`; ally test: `militaryAssistance.test.ts:172-188`
- Test isolation reset: `militaryAssistance.test.ts:105-109`

**Validation performed**
- `npm test -w @ralphschuler/screeps-roles -- --grep "military assistance behavior"` → 23 passing
- `npm test -w @ralphschuler/screeps-roles` → 97 passing
- `npm run build -w @ralphschuler/screeps-roles` → pass
- `npm run lint:roles` → pass
- `npm run check:alliance-safety` → pass

**Risks**
- Focused review only; private-server smoke/deploy not run.
- Worktree has many unrelated dirty files; full deploy needs full-repo verification.