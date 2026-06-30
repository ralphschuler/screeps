## Must-fix findings

1. **Indefinite staging possible with partial squad metadata**  
   `military.ts:48-54,116-124`  
   `isDefenseAssistSquadConfigured()` does **not** require `defenseSquadCreatedAt`, but expiry uses `mem.defenseSquadCreatedAt ?? Game.time`. If `defenseSquadId + defenseSquadSize > 1` exist but `defenseSquadCreatedAt` is missing, elapsed time is always `0`, so a non-quorum squad can wait forever.  
   Test gap: timeout tests all set `defenseSquadCreatedAt` (`militaryAssistance.test.ts:231-246`, `305-319`).

2. **Hard-threat staging is bypassed for `defenseSquadSize <= 1`**  
   `military.ts:48-49,109-116,363-370,616-635,979-995`  
   Hard-threat detection only runs inside staging, but staging is skipped unless `defenseSquadSize > 1`. A size-1 hard-threat assist deploys immediately.  
   Test gap: “small hard-threat squad” covers size `2`, not size `1` (`militaryAssistance.test.ts:207-228`).

## Acceptable risks / notes

- Hard quorum has a bounded fallback: hard threats release after `750` ticks if quorum is not met (`military.ts:25-27,120-121`).
- Home-threat preemption works **while the creep is in home room** (`military.ts:81-82,363,616,979`; test `249-278`). It does not recall already-deployed assists from remote rooms; acceptable if scope is staging-only, risky if requirement means full recall.
- Ally safety looks preserved: hard-threat/assist checks use `getActualHostileCreeps` / `getActualHostileStructures`, and `ctx.hostiles` is populated from actual hostiles in context.

## Changed files

None by me. Reviewed existing modified files:

- `packages/@ralphschuler/screeps-roles/src/behaviors/military.ts`
- `packages/@ralphschuler/screeps-roles/test/militaryAssistance.test.ts`

## Validation performed

- Reviewed targeted diff + line references.
- Ran `npm test -w @ralphschuler/screeps-roles -- test/militaryAssistance.test.ts` → **90 passing**.
- Ran `npm run build -w @ralphschuler/screeps-roles` → **pass**.