## Scout findings

Read:
- `AGENTS.md`
- `ROADMAP.md` §§2, 18, 20, 23
- `package.json`
- candidate package files/tests
- `git status --short`

Repo status:
- Dirty tree: **61 tracked modified**, **98 untracked**
- Heavily modified areas avoided: cache, console, kernel/events, layouts, memory, pathfinding, pheromones, roles, stats, visuals, bot, chemistry, defense, economy, spawn.
- Selected candidate packages are clean:
  - `packages/@ralphschuler/screeps-remote-mining`
  - `packages/screeps-utils`
  - `packages/@ralphschuler/screeps-clusters`

## 3 safe candidates

| Candidate | Evidence | Current tests/scripts | Risk |
|---|---|---|---|
| `packages/@ralphschuler/screeps-remote-mining/src/paths/remotePathCache.ts` | Duplicate `PathFinder.search` blocks at lines 153, 185, 236. Directly matches ROADMAP §20 cached remote paths. Existing tests cover TTL, precache, get-or-calc. | `npm run test:remote-mining`; `npm test -w @ralphschuler/screeps-remote-mining`; `npm run build:remote-mining`; `npm run lint:remote-mining` | Low |
| `packages/screeps-utils/src/optimization/computationScheduler.ts` | `run()` mixes due checks, bucket policy, CPU budget, execution, stats. Direct ROADMAP §18 target. | `npm run test:utils`; `npm test -w @ralphschuler/screeps-utils`; `npm run build:utils`; `npm run lint:utils`. No dedicated scheduler test yet. | Low-med |
| `packages/@ralphschuler/screeps-clusters/src/clusterManager.ts` | 721-line manager. Private slices: metrics line 217, terminal balancing 286/325, defense requests 549/631. Existing `clusterPolicy.ts` shows extraction pattern. | `npm run test:clusters`; `npm test -w @ralphschuler/screeps-clusters`; `npm run build:clusters`; package lint: `npm run lint -w @ralphschuler/screeps-clusters` | Med |

## Recommended single slice

**Do candidate 1.**

Refactor only:
- `remotePathCache.ts`
- maybe new helper: `paths/remotePathSearch.ts`
- existing test: `test/remotePathCache.test.ts`

Goal:
- Extract shared remote `PathFinder.search` options/helper.
- Keep public API unchanged.
- Keep behavior unchanged.
- Validate with:

```bash
npm run test:remote-mining
npm run build:remote-mining
npm run lint:remote-mining
```

## Validation performed

- Read-only inspection only.
- Ran git status/stat commands.
- Read package scripts and tests.
- No tests run.
- Changed files by scout: **none**.