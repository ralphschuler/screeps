## Read-only scout result

**Changed files:** none.  
**Tests run:** none. Avoided package tests/builds because repo requires Node `>=24 <25`; current is `v22.22.2`.

## Evidence

- Worktree is heavily dirty: 43 tracked files modified + many untracked `artifacts/*` and extracted module dirs.
- Current active/refined areas to avoid: layouts, memory, pheromones, roles, stats, visuals, bot, chemistry, defense, economy, spawn.
- `git diff --check` ✅ clean.
- Read: `AGENTS.md`, `ROADMAP.md`, recent `artifacts/refine-*.md`, package READMEs/tests.

## Low-risk next modules

| Priority | Module | Evidence | Why useful | Risk | Validation |
|---|---|---|---|---|---|
| 1 | `packages/@ralphschuler/screeps-console` | Clean. `src/consoleCommands.ts` = 1121 LOC. README says WIP/partially extracted. | Split command groups into `src/commands/*`; improve docs + tests. Console-only, low gameplay risk. | Decorator metadata/command names must stay stable. Stub interfaces incomplete. | `npm run test:console`; `npm run build:console`; `npm run lint -w @ralphschuler/screeps-console` |
| 2 | `packages/@ralphschuler/screeps-pathfinding/src/portal/portalManager.ts` | Clean. 505 LOC. `test/portalManager.test.ts` covers discovery, ISM, routing, maintenance. | Extract ISM codec/validation + route helpers; manager becomes orchestration. | Preserve `InterShardMemory` key/shape, cache keys, TTLs. | `npm run test:pathfinding`; `npm run build:pathfinding`; `npm run lint:pathfinding` |
| 3 | `packages/@ralphschuler/screeps-cache/src/CacheCoherence.ts` | Clean. 522 LOC. Strong `test/cacheCoherence.test.ts`. README cache coherence example appears outdated vs actual signature. | Split regex/pattern invalidation, memory-budget eviction, stats aggregation. Fix docs. | Cache invalidation drift can stale data/CPU. Preserve counts/priority order. | `npm run test:cache`; `npm run build:cache`; `npm run lint -w @ralphschuler/screeps-cache` |
| 4 | `packages/screeps-utils/src/cache/roleCache.ts` | Clean. 514 LOC. README advertises helpers; no direct `roleCache` test found. | Add characterization tests, then split generic role cache store from role-specific target helpers. | No existing direct tests; preserve `global._roleCache` tick behavior exactly. | Add `test/roleCache.test.ts`; `npm run test:utils`; `npm run build:utils`; `npm run lint:utils` |

## Defer / not first

- `packages/@ralphschuler/screeps-intershard/src/shardManager.ts` = 1211 LOC and clean, but high-risk: shard CPU limits, ISM sync, tasks. Needs characterization tests first.
- Any dirty package until current refactor diff is checkpointed.
- `packages/screeps-bot/dist/main.js`: generated dirty bundle; decide include vs restore before review/commit to reduce noise.

## Global risks

- Dirty tree overlap.
- Node mismatch: run `nvm use` / Node 24 before validation.
- Avoid combat/cluster/defense changes unless running `npm run check:alliance-safety`.