## Read-only scout findings

Changed files: **none**.

### Narrow candidates

| # | Files | Opportunity | Rationale / evidence | Expected validation | Risk |
|---|---|---|---|---|---|
| 1 | `packages/@ralphschuler/screeps-roles/README.md` | Docs-only refresh | README still says roles are placeholders / executor “planned” (`README.md:75-85`, `145-155`), but `src/index.ts:38-70` exports `executeAction`, state machine, economy behaviors. | No runtime tests needed; optional `npm run build:roles`. | Very low. |
| 2 | `packages/@ralphschuler/screeps-roles/src/behaviors/executor.ts` → new `actionMetrics.ts` | Extract action metrics tracking | `executor.ts` mixes action dispatch/movement/state invalidation with a separate metrics switch (`574-683`). Move unchanged metric math behind helper. | `npm run test:roles`; `npm run build:roles`; consider bot ERR_NO_PATH unit coverage. | Low; keep metric formulas unchanged. |
| 3 | `packages/screeps-spawn/src/spawnNeedsAnalyzer.ts` → new `spawn-demand/localRoleDemand.ts` | Split local/special role gates from `needsRole` | `needsRole` remains a long facade (`185-390`) and handles scout, mineral, lab, factory, queen, inter-room, cross-shard logic after remote demand modules already exist. | `npm run test:spawn`; `npm run build:spawn`; add/extend tests for scout suppression, labTech, queenCarrier, carrier demand. | Low-medium; preserve predicate order and `getActualHostileCreeps` ally filtering. |
| 4 | `packages/screeps-economy/README.md` | Docs-only dependency cleanup | README claims `@bot/*` path coupling and bot source required (`118-132`), but `package.json:36-40` lists workspace deps. Related packages says spawn “coming soon” (`201`) though `packages/screeps-spawn` exists. | Docs-only; optional `npm run build:economy`. | Very low; don’t overstate standalone use outside Screeps/workspace. |

### Validation performed

- Read `ROADMAP.md` design + Section 25 ally safety.
- Checked dirty worktree via `git status --short`, `git diff --stat`.
- Sampled and directly inspected current code/docs/tests.
- No tests run; scout mode only.

### Avoid this pass

- Broad splits of `marketManager.ts` (~1488 lines) or `expansionManager.ts` (~1040 lines). Valid future targets, but too much churn for this bounded dirty-worktree pass.