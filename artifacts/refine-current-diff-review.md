## Verdict

Do **not** add another refactor now. Current diff is already high-overlap/high-noise.

## Must-fix before more work

1. **Staging risk: tracked facades import untracked modules**
   - Examples:
     - `packages/@ralphschuler/screeps-layouts/src/linkNetworkPlanner.ts:26` → `./link-network`
     - `packages/@ralphschuler/screeps-memory/src/heap-cache.ts:35` → `./heap-cache/entries`
     - `packages/@ralphschuler/screeps-roles/src/behaviors/utility.ts:14-18` → `./utility/*`
     - `packages/screeps-spawn/src/spawnNeedsAnalyzer.ts:13-23` → new spawn modules
   - Evidence: `45` untracked entries, including `20` source/test paths.
   - Next: stage/split all dependent new files with their parent changes before commit.

2. **Overlap/noise too high**
   - Evidence: `31 files changed, 5120 insertions(+), 7015 deletions(-)`.
   - `packages/screeps-bot/dist/main.js`: `4009 insertions / 3790 deletions`.
   - `25` untracked `artifacts/` entries.
   - Next: freeze scope, commit/split current work first. Don’t stack another refactor.

## Suggestions

- Add root `test:memory` shortcut if desired. `npm run test:memory` is missing; workspace test works.
- Regenerate/verify `packages/screeps-bot/dist/main.js` after final source state.

## Validation performed

Passed:
- `git diff --check`
- `npx tsc --noEmit` for changed packages + bot
- Tests:
  - spawn `110`
  - roles `72`
  - pheromones `37`
  - layouts `45`
  - memory `14`
  - defense `58`
  - stats `12`
  - bot unit `2327`
- Lint: pheromones, roles, spawn, defense, layouts, memory, stats, bot
- `npm run check:alliance-safety`

## Risks

- No private-server smoke run.
- `dist/main.js` sync not proven by build in this review.
- Untracked artifacts/source dirs make accidental partial commit likely.