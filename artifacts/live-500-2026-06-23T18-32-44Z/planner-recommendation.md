## Recommendation

**Candidate:** W19S26 hard-threat defense assist stabilization: refresh defender request, form cohesive squad, hold noncombat creeps.

## Evidence

- `summary.md`: W19S26 = **RCL3**, **0 towers**, **0 my creeps**, hostile `admon/r_8_ae72`.
- Hostile body: **20 RANGED_ATTACK / 5 HEAL / 25 MOVE**, 5000 HP.
- Parsed samples: stale request since tick `71872888`:
  - `guardsNeeded=2`, `rangersNeeded=4`, `healersNeeded=0`, `urgency=1`
  - hostile still present at `71873199`
- Existing assist creeps split across squad IDs → trickle risk.
- Pioneers still target `W19S26` while hostile visible.

## Files to touch

- `packages/screeps-defense/src/emergency/emergencyResponse.ts`
- `packages/@ralphschuler/screeps-clusters/src/clusterManager.ts`
- `packages/screeps-spawn/src/spawn-demand/defenseAssistDemand.ts`
- `packages/@ralphschuler/screeps-roles/src/behaviors/military.ts`
- `packages/@ralphschuler/screeps-roles/src/behaviors/economy/pioneer.ts`
- Tests:
  - `packages/screeps-defense/test/defenderNeeds.test.ts`
  - `packages/screeps-spawn/test/defenseSpawning.test.ts`
  - `packages/@ralphschuler/screeps-roles/test/militaryAssistance.test.ts`

## Phases

1. **Request freshness**
   - Refresh active defense requests while visible hostiles remain.
   - Update same-urgency deficits, not only urgency increases.
   - Acceptance: W19S26 request no longer keeps `healersNeeded=0` when no defenders exist.

2. **Hard-threat squad cohesion**
   - Stable assist squad ID per helper/target/wave.
   - For hard ranged+heal threats, wait for quorum before entering target room.
   - Acceptance: guard/ranger/healer share squad ID; no solo trickle into W19S26.

3. **Noncombat hold**
   - Pioneers assigned to visible hostile target room wait/return home until threat clears.
   - Acceptance: existing/new pioneers do not enter W19S26 while dangerous hostile visible.

4. **Ally safety guardrails**
   - Use only `getActualHostileCreeps`.
   - Assert no target owner is `TooAngel` or `TedRoastBeef`.

## Quick validation

```bash
npm run test:defense -- --grep "defense"
npm run test:spawn -- --grep "defense assist|hard"
npm run test:roles -- --grep "defense assist|pioneer"
npm run check:alliance-safety
npm run build
npm run test:server:smoke
```

## Risks / stop points

- Risk: over-spawns military, stalls economy.
- Risk: quorum wait too strict, room stays occupied.
- Stop if alliance-safety fails.
- Stop if spawn queue starves harvesters/haulers.
- Rollback: git revert commit; clear stale `Memory.defenseRequests` if needed.

## Validation performed

- Read `artifacts/live-500-2026-06-23T18-32-44Z/summary.md`.
- Parsed `samples.ndjson` for W19S26 request/creep evidence.
- Reviewed relevant defense/spawn/role code.
- No files modified by me. Worktree was already dirty.