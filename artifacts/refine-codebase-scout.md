## Scout result

Read-only. No edits. Branch `main`. No staged changes.

### Dirty state

Tracked modified: 23 files, ~`3949 insertions / 4398 deletions`.

Main dirty clusters:

- `packages/@ralphschuler/screeps-layouts/`
  - `src/linkNetworkPlanner.ts`
  - `test/linkNetworkPlanner.test.ts`
  - untracked `src/link-network/*`
- `packages/@ralphschuler/screeps-memory/`
  - `src/heap-cache.ts`, `test/heapCache.test.ts`, `README.md`
  - untracked `src/heap-cache/entries.ts`
- `packages/@ralphschuler/screeps-roles/`
  - `src/behaviors/utility.ts`, `stateMachine.ts`, exports/tests
  - untracked `src/behaviors/utility/*`
- `packages/@ralphschuler/screeps-stats/`
  - `src/unifiedStats.ts`, `README.md`
  - untracked `src/unified-stats/alertFormatting.ts`, `test/alertFormatting.test.ts`
- `packages/screeps-defense/`
  - `src/towerActionPolicy.ts`, `test/towerActionPolicy.test.ts`
  - untracked `src/tower/*`
- `packages/screeps-spawn/`
  - `src/spawnNeedsAnalyzer.ts`, `spawnIntentCompiler.ts`, `spawnPipeline.ts`
  - untracked `remoteRoleDemand.ts`, `remoteWorkerDemand.ts`, `test/remoteRoleDemand.test.ts`
- `packages/screeps-bot/dist/main.js` dirty generated bundle.
- Many untracked `artifacts/*`, including `artifacts/refine-codebase-plan.md`.

## Best next opportunities

| Priority | Target | Evidence | Risk | Tests/validation |
|---|---|---:|---|---|
| 1 | `packages/screeps-spawn/src/spawnNeedsAnalyzer.ts` | 1032 lines; mixed creep counts, remote gates, defense assist, claimer/pioneer | Medium: spawn priority/target assignment | `npm run test:spawn`; `npm run build:spawn`; bot remote unit tests |
| 2 | `packages/@ralphschuler/screeps-stats/src/unifiedStats.ts` | 2098 lines; only alert formatting extracted | Medium-high: `Memory.stats` shape | `npm run test:stats`; `npm run build:stats` |
| 3 | `packages/@ralphschuler/screeps-roles/src/behaviors/stateMachine.ts` | 545 lines; validity, completion, serialization, commit/logging | Medium: creep memory state behavior | `npm run test:roles`; `npm run build:roles` |
| 4 | `packages/@ralphschuler/screeps-memory/src/heap-cache.ts` | 430 lines; entry helpers extracted, store/persist still mixed | Low-medium: Memory cache format | `npm test -w @ralphschuler/screeps-memory`; `npm run build:memory` |

## Validation performed

- `git status --short`
- `git diff --stat`
- `git diff --check` → passed, no output.
- `npm run check-versions` → failed: Node `22.22.2`, repo requires `>=24 <25`. `.nvmrc` = `24`.

No package tests/builds run due Node mismatch and read-only scout role.

## Risks

- Dirty tree is substantial. Avoid broad `git restore .`.
- `packages/screeps-bot/dist/main.js` may be overwritten by build.
- Use `nvm use` before validation.
- Defense/spawn changes must keep ally safety intact: run `npm run check:alliance-safety`.