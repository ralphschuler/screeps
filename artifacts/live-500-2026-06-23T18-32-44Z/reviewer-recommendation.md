## Must-fix findings

1. **Challenge top candidate: responder/avoidance already exists.**  
   Evidence: `summary.md:66-74` still recommends W19S26 response, but live samples show `Memory.defenseRequests` for `W19S26` and assigned `defenseAssist` guards/rangers/healers. Problem is not missing response; it is **piecemeal ineffective response**.

2. **Strongest live-data issue: squad staging expires before squad is ready.**  
   Current code: `packages/@ralphschuler/screeps-roles/src/behaviors/military.ts:25,47-79` uses `defenseSquadCreatedAt` + 250 ticks, then lets creeps leave staging.  
   Live samples: defenders with `defenseSquadSize: 3` entered/attacked W19S26 before full squad; later `summary.md:26-27` shows `myCreeps=0`, hostile still alive.

3. **Do not deploy current dirty tree as-is.**  
   `git status` shows very large mixed worktree: many unrelated modified/untracked files. Unsafe for single live fix.

## Safest single deployable change

**Only adjust defense-assist staging in**:

- `packages/@ralphschuler/screeps-roles/src/behaviors/military.ts`
- plus focused test in `packages/@ralphschuler/screeps-roles/test/militaryAssistance.test.ts`

Goal: **hard-defense assist creeps must not leave home/staging until squad quorum is ready, or timeout is long enough to cover spawn + travel.**  
This preserves ally safety and reduces feeding defenders into `admon`’s 20 ranged / 5 heal creep.

Do **not** broaden attack targeting. Keep `getActualHostileCreeps` / ally filters.

## Suggestions

- Hard-threat body floor changes in `packages/screeps-spawn/src/defenseAssistBody.ts` are useful, but less direct: live evidence shows even larger lone defenders died. Staging/quorum is stronger evidence.
- Add postdeploy read-only check: W19S26 hostile persists? assigned defenders waiting/grouped? no TooAngel/TedRoastBeef targeting.

## Changed files by me

None.

## Validation performed

- Read `artifacts/live-500-2026-06-23T18-32-44Z/summary.md`
- Parsed `samples.json` for W19S26 defense/creep state
- Inspected relevant current diffs/code
- Ran:
  - `npm test -w @ralphschuler/screeps-spawn -- --grep "hard ranged|capacity-sized"` → 2 passing
  - `npm run build:spawn` → passed

## Risks

- Longer staging can idle defenders if squad never completes.
- Too strict quorum may save energy but not save W19S26.
- Ally safety remains critical: no raw hostile targeting against `TooAngel` / `TedRoastBeef`.