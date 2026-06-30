## Findings

**Must-fix / Major:** none found.

**Suggestions:** none blocking.

Evidence checked:
- Scheduler behavior delegation preserves priority/bucket/budget logic: `packages/screeps-utils/src/optimization/computationScheduler.ts:202-224`
- Pure helper rules look deterministic/simple: `packages/screeps-utils/src/optimization/schedulerPolicy.ts:15-67`
- Tests cover priority, interval, bucket skip, CPU deferral, failure throttling, stats, globals: `packages/screeps-utils/test/optimization/computationScheduler.test.ts:35-165`
- README test tree now includes scheduler tests: `packages/screeps-utils/README.md:191-230`

## Changed files

No edits by me.

Scoped worktree changes:
- `M packages/screeps-utils/README.md`
- `M packages/screeps-utils/src/optimization/computationScheduler.ts`
- `?? packages/screeps-utils/src/optimization/schedulerPolicy.ts`
- `?? packages/screeps-utils/test/optimization/computationScheduler.test.ts`

## Validation performed

Passed:
```bash
npm run build -w @ralphschuler/screeps-utils
npm run lint -w @ralphschuler/screeps-utils
cd packages/screeps-utils && npx mocha test/optimization/computationScheduler.test.ts
```

Result: `63 passing`. Lint had only Node module-type warning, exit 0.

## Risks

- Review limited to requested four files.
- Repo has many unrelated dirty files; not reviewed.
- No private-server/runtime validation run; not needed for this small utils refactor.