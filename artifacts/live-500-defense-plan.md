## Plan: idle combat → W19S26 defense assist

### Evidence
- `live-500-2026-06-23T18-32-44Z`: W19S26 hostile `admon`, 0 towers, 0 energy, 0 my creeps.
- `live-500-20260623T195544Z`: W19S26 hostile has 32 combat parts; guard idle `10/11`, healer idle `5/5`; active request wants `2 guards, 4 rangers`.
- Ally safety already noted: TooAngel/TedRoastBeef excluded.

## Highest-impact low-risk change
Use already-spawned idle military creeps to answer active visible `Memory.defenseRequests` before spawning more. No new targeting doctrine. No ally targeting.

## Vertical TDD phases

### Phase 1 — selector tests
Likely files:
- `packages/@ralphschuler/screeps-roles/test/militaryAssistance.test.ts`
- maybe helper in `packages/@ralphschuler/screeps-roles/src/behaviors/military.ts`

Tests:
1. Idle guard in safe helper room + visible W19S26 hostile + request `guardsNeeded > 0` → gets `assistTarget/targetRoom/task=defenseAssist`.
2. Same with ranger/healer role needs.
3. Existing assigned creeps count toward need; do not over-assign.
4. Home room hostile present → do not leave home.
5. Only TooAngel/TedRoastBeef visible as “hostile” → no assignment.

### Phase 2 — behavior integration
Add minimal `tryAcquireDefenseAssistAssignment(ctx)` before patrol/idle paths for `guard`, `ranger`, `healer`.

Rules:
- role must match unmet request need.
- target room must be visible and have `getActualHostileCreeps(targetRoom).length > 0`.
- helper home must have no actual hostiles.
- do not override `squadId`, existing `assistTarget`, or non-defense `targetRoom`.
- keep at least one local guard reserve.

### Phase 3 — live validation gate
Before deploy: re-sample live W19S26. Stop if hostile/request gone.

## Acceptance criteria
- Idle combat count drops when W19S26 defense request active.
- Assigned creeps move toward W19S26.
- No allies targeted.
- No spawn policy churn.
- No new attack/structure targeting logic.

## Validation commands
```bash
npm run test:roles -- --grep "military assistance"
npm run test:spawn -- --grep "defense"
npm run build:roles
npm run check:alliance-safety
npm run test:server:smoke
```

Post-deploy check:
- run live observer 100–500 ticks.
- expect W19S26 assigned defenders > 0 or en route.
- expect guard/healer idle counts reduced.
- CPU bucket not draining.

## Rollback / stop points
- Stop if latest live data no longer shows W19S26 hostile pressure.
- Stop if change needs offensive targeting or ally-filter edits.
- Rollback: revert single behavior commit; clear W19S26 `assistTarget/task/targetRoom/defenseSquad*` if needed.

## Risks
- Creep pathing into strong ranged+heal hostile may die; mitigated by visible threat only + existing retreat logic.
- Existing dirty worktree is large; isolate change to roles test + one behavior helper.

## Changed files
None by me. Worktree already dirty before planning.