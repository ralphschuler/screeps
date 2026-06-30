## Must-fix

1. **Hard-threat staging can deadlock partial squads**
   - Evidence: `military.ts:122-128` only releases hard-threat squads after `750` ticks if `readyMembers >= timeoutQuorum`; otherwise returns `wait` forever.
   - If only 1–2 members spawn/survive, they remain assigned/staged until death and never assist.
   - Missing test: no `Game.time - 760` case with fewer than timeout quorum.

2. **“Safe quorum 5” is not enforced for realistic squad sizes**
   - Evidence: `military.ts:78-80` uses `Math.min(squadSize, 5)`.
   - Test uses `defenseSquadSize: 13` (`militaryAssistance.test.ts:213-216`), but production helpers often set local wave sizes 1–3:
     - `packages/screeps-spawn/src/spawn-demand/defenseAssistDemand.ts:92-99`
     - `packages/@ralphschuler/screeps-clusters/src/defenseReinforcements.ts:53-54,298-307`
   - Result: hard threat may launch with only 2–3 staged creeps, not 5.

3. **Staging wait preempts home-room defense**
   - Evidence: guard/ranger assist staging returns before normal home defense:
     - `military.ts:365-369` before `415-425`
     - `military.ts:981-985` before `1029-1037`
   - With hard-threat wait up to `750` ticks, staged defenders can ignore new hostiles in their own home room.
   - Add local-threat preemption before returning `wait`.

## Nice-to-have

- Clear resolved visible assist targets before staging. Current order can keep creeps assigned/waiting until timeout even when target room is already safe.
- Add ally regression: giant `TooAngel`/`TedRoastBeef` creep should not trigger hard-threat staging or targeting.
- Add tests for:
  - hard timeout branch at `>750`
  - `defenseSquadSize` 2/3 hard-threat behavior
  - local home hostile while staged

## Changed files

- I changed none.
- Reviewed:
  - `packages/@ralphschuler/screeps-roles/src/behaviors/military.ts`
  - `packages/@ralphschuler/screeps-roles/test/militaryAssistance.test.ts`

## Validation performed

- `npm test -w @ralphschuler/screeps-roles -- test/militaryAssistance.test.ts` → 87 passing
- `npx tsc -p packages/@ralphschuler/screeps-roles/tsconfig.json --noEmit` → pass

## Risks

- No private-server smoke run.
- Large dirty worktree; reviewed scoped files plus minimal related quorum producers only.
- Deployment risk: hard-threat assists may still trickle under-strength or stall indefinitely.