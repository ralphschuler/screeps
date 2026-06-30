## Read-only findings

- Files changed by me: **none**
- Validation performed: read-only only:
  - `git status --short`
  - `git diff --stat`
  - read `ROADMAP.md`, ADRs, candidate files/tests
- Current worktree: **66 modified**, **104 untracked**, staged: **none**
- Avoid dirty/refactor-active files. Notably avoid `remotePathCache.ts` because already dirty.
- Candidate clean slice files:
  - `packages/@ralphschuler/screeps-visuals/src/mapVisualizer.ts`
  - `packages/@ralphschuler/screeps-visuals/test/mapVisualizer.test.ts`
  - `packages/screeps-utils/src/optimization/computationScheduler.ts`

## Assumptions

- Existing dirty worktree is intentional. Do **not** broad-revert.
- Goal: readability/module depth/docs only. No new strategy.
- ROADMAP §23 modular/testable plain-object logic applies.
- Ally safety absolute: no changes to hostile/allied targeting, TooAngel, TedRoastBeef behavior.

## Phase 0 — Stop gate

Run before any edits:

```bash
git status --short -- \
  packages/@ralphschuler/screeps-visuals/src/mapVisualizer.ts \
  packages/@ralphschuler/screeps-visuals/test/mapVisualizer.test.ts \
  packages/screeps-utils/src/optimization/computationScheduler.ts

npm test -w @ralphschuler/screeps-visuals -- --grep "MapVisualizer"
npm test -w @ralphschuler/screeps-utils
```

Stop if target files are dirty or baseline tests fail.

## Slice 1 — Visual-only pure map rules

Planned files:
- add `packages/@ralphschuler/screeps-visuals/src/map-visualizer/rules.ts`
- add `packages/@ralphschuler/screeps-visuals/test/mapVisualizerRules.test.ts`
- modify `packages/@ralphschuler/screeps-visuals/src/mapVisualizer.ts`

Scope:
- Extract pure helpers only:
  - danger color clamp
  - posture color lookup
  - threat score/color
  - highway/SK room parsing
- No draw order change.
- No hostile/allied logic change.

Acceptance:
```bash
npm test -w @ralphschuler/screeps-visuals -- --grep "MapVisualizer|MapVisualizer rules"
npm run build:visuals
npm run check:alliance-safety
```

Rollback:
```bash
git restore --source=HEAD -- packages/@ralphschuler/screeps-visuals/src/mapVisualizer.ts
rm -rf packages/@ralphschuler/screeps-visuals/src/map-visualizer
rm -f packages/@ralphschuler/screeps-visuals/test/mapVisualizerRules.test.ts
```

## Slice 2 — Scheduler policy extraction

Only after Slice 1 passes.

Planned files:
- add `packages/screeps-utils/src/optimization/schedulerPolicy.ts`
- add `packages/screeps-utils/test/optimization/computationScheduler.test.ts`
- modify `packages/screeps-utils/src/optimization/computationScheduler.ts`

Scope:
- Extract pure decisions:
  - task due check
  - bucket threshold skip
  - CPU-budget defer
  - priority ordering helper
- Keep public API unchanged.
- Preserve `lastRun` behavior on success/error.

Acceptance:
```bash
npm test -w @ralphschuler/screeps-utils -- --grep "ComputationScheduler|scheduler policy"
npm run build:utils
npm run lint:utils
npm run check:alliance-safety
```

Rollback:
```bash
git restore --source=HEAD -- packages/screeps-utils/src/optimization/computationScheduler.ts
rm -f packages/screeps-utils/src/optimization/schedulerPolicy.ts
rm -f packages/screeps-utils/test/optimization/computationScheduler.test.ts
```

## Risks

- Dirty worktree may make package tests fail unrelated to slice.
- `build:bot` may rewrite already-dirty `packages/screeps-bot/dist/main.js`; avoid full build until ready.
- Scheduler slice touches CPU timing; require targeted tests before wiring.
- Stop immediately if alliance safety check fails or any diff changes attack/ally classification.