## Recommended next slice

**`@ralphschuler/screeps-utils` computation scheduler policy extraction**

Why:
- Target files currently clean.
- Small, isolated module-depth/readability slice.
- CPU-bucket behavior already ROADMAP-aligned; preserve exactly.
- No combat/ally/hostile targeting change.

## Changed files now

None.

## Planned files

- Modify `packages/screeps-utils/src/optimization/computationScheduler.ts`
- Add `packages/screeps-utils/src/optimization/schedulerPolicy.ts`
- Add `packages/screeps-utils/test/optimization/computationScheduler.test.ts`
- Optional doc: `packages/screeps-utils/README.md`

## Assumptions

- Dirty worktree is intentional; no broad restore.
- Public API remains unchanged:
  - `ComputationScheduler`
  - `TaskPriority`
  - `scheduleTask`
  - `unscheduleTask`
  - `runScheduledTasks`
  - `getSchedulerStats`
- `schedulerPolicy.ts` stays internal; do not export from package index unless needed.

## Phase 0 — Stop gate

```bash
git status --short -- \
  packages/screeps-utils/src/optimization/computationScheduler.ts \
  packages/screeps-utils/src/optimization/index.ts \
  packages/screeps-utils/test/optimization/computationScheduler.test.ts \
  packages/screeps-utils/README.md

npm test -w @ralphschuler/screeps-utils
npm run test:unit -w screeps-typescript-starter -- --grep "computationScheduler"
```

Stop if:
- Any target file already dirty.
- Baseline scheduler tests fail.
- Failure requires behavior change, not refactor.

## Phase 1 — Public API characterization tests

Add package-local tests using public imports from `packages/screeps-utils/src/index.ts`.

Cover:
- priority order
- interval due logic
- bucket skip
- critical always runs
- CPU budget defer
- failing task marks `lastRun`
- global convenience funcs

Quick check:

```bash
npm test -w @ralphschuler/screeps-utils -- --grep "ComputationScheduler"
```

Acceptance:
- Tests pass against current implementation.
- No source changes yet.

Rollback:

```bash
rm -f packages/screeps-utils/test/optimization/computationScheduler.test.ts
```

## Phase 2 — Extract pure scheduler policy

Create `schedulerPolicy.ts` with pure helpers only:

- `isTaskDue(now, lastRun, interval)`
- `shouldSkipForBucket(priority, bucket, thresholds)`
- `shouldDeferForBudget(cpuUsed, taskMaxCpu, cpuBudget, skippable)`
- `compareTaskPriority(a, b)`
- optional `countTasksByPriority(tasks)`

Wire `computationScheduler.ts` to helpers.

Do not change:
- default thresholds
- `lastRun` semantics
- stats counters
- global singleton behavior
- public exports

Quick check:

```bash
npm test -w @ralphschuler/screeps-utils -- --grep "ComputationScheduler|scheduler policy"
npm run build:utils
npm run lint:utils
```

Acceptance:
- Same public tests pass.
- Pure policy tests pass.
- Build/lint pass.

Rollback:

```bash
git restore --source=HEAD -- packages/screeps-utils/src/optimization/computationScheduler.ts
rm -f packages/screeps-utils/src/optimization/schedulerPolicy.ts
rm -f packages/screeps-utils/test/optimization/computationScheduler.test.ts
```

## Phase 3 — Minimal docs

Update README optimization section only:
- scheduler is CPU-bucket-aware
- policy rules are unit-tested
- public API unchanged

Quick check:

```bash
npm run build:utils
npm test -w @ralphschuler/screeps-utils
```

Rollback:

```bash
git restore --source=HEAD -- packages/screeps-utils/README.md
```

## Final validation

```bash
npm test -w @ralphschuler/screeps-utils
npm run test:unit -w screeps-typescript-starter -- --grep "computationScheduler"
npm run build:utils
npm run lint:utils
npm run check:alliance-safety
```

Optional runtime confidence:

```bash
npm run test:server:smoke
```

Check: `packages/screeps-server/artifacts/smoke/summary.md`

## Risks

- Scheduler affects CPU timing; tiny semantic drift can change runtime load.
- Global scheduler singleton can leak state between tests; reset `global._computationScheduler`.
- Dirty worktree can cause unrelated failures.
- Avoid full `npm run build`/`build:bot`; may rewrite already-dirty `packages/screeps-bot/dist/main.js`.
- Stop if ally safety check fails, even though slice should not touch combat.